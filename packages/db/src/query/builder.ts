import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  getTableName,
  isNull,
  sql,
  type Column,
  type SQL,
} from 'drizzle-orm';
import type {
  PgDatabase,
  PgQueryResultHKT,
  PgSelect,
  PgTable,
  SelectedFields,
} from 'drizzle-orm/pg-core';
import { ConflictError, NotFoundError, QueryBuilderError, toConflictError } from './errors';
import type {
  Col,
  FindOpts,
  JoinKind,
  JoinSpec,
  NewRow,
  OrderBy,
  Page,
  Patch,
  Relation,
  Relations,
  Result,
  Row,
  Where,
} from './types';
import { getWhere, type WhereContext } from './where';

export type Executor = PgDatabase<PgQueryResultHKT, Record<string, never>>;

export type ScopeConfig = {
  tables: ReadonlySet<PgTable>;
  owner?: { column: string; value: string; tables: ReadonlySet<PgTable> };
};

type AnyRelation = Relation<PgTable>;
type Join = { key: string; relation: AnyRelation; kind: JoinKind };

const SYSTEM_COLUMNS = ['id', 'createdAt', 'updatedAt', 'deletedAt'];
const MAX_PAGE_SIZE = 100;

function column(table: PgTable, name: string): Column | undefined {
  return getTableColumns(table)[name];
}

function idColumn(table: PgTable): Column {
  const id = column(table, 'id');
  if (!id) throw new QueryBuilderError(`${getTableName(table)} has no id column`);
  return id;
}

async function mapConflict<R>(query: Promise<R>): Promise<R> {
  try {
    return await query;
  } catch (err) {
    throw toConflictError(err) ?? err;
  }
}

export class QueryBuilder<
  T extends PgTable,
  R extends Relations<T>,
  ScopeCol extends string = never,
> {
  readonly #tableName: string;

  constructor(
    private readonly db: Executor,
    private readonly scope: ScopeConfig,
    private readonly table: T,
    private readonly relations: R = {} as R,
  ) {
    this.#tableName = getTableName(table);
    if (!scope.tables.has(table)) {
      throw new QueryBuilderError(`${this.#tableName} can't be queried from this scope`);
    }
    for (const [key, rel] of Object.entries(relations)) {
      if (key === this.#tableName)
        throw new QueryBuilderError(`Relation key "${key}" clashes with the table name`);
      if (!scope.tables.has(rel.schema)) {
        throw new QueryBuilderError(`Relation "${key}" joins a table this scope can't read`);
      }
    }
  }

  #ownerCondition(table: PgTable): SQL | undefined {
    const owner = this.scope.owner;
    if (!owner || !owner.tables.has(table)) return undefined;
    const col = column(table, owner.column);
    if (!col) throw new QueryBuilderError(`${getTableName(table)} has no ${owner.column} column`);
    return eq(col, owner.value);
  }

  #notDeleted(table: PgTable): SQL | undefined {
    const deletedAt = column(table, 'deletedAt');
    return deletedAt ? isNull(deletedAt) : undefined;
  }

  #guard(extra?: SQL): SQL | undefined {
    return and(this.#ownerCondition(this.table), this.#notDeleted(this.table), extra);
  }

  #joins(spec: JoinSpec<R> | undefined): Join[] {
    return Object.entries(spec ?? {}).map(([key, kind]) => {
      const relation = this.relations[key];
      if (!relation) throw new QueryBuilderError(`Unknown relation "${key}"`);
      if (kind !== 'left' && kind !== 'inner')
        throw new QueryBuilderError(`Join kind for "${key}" must be left or inner`);
      return { key, relation, kind };
    });
  }

  #where(where: unknown, joins: Join[]): SQL {
    const ctx: WhereContext = {
      joined: new Map(joins.map((j) => [j.key, j.relation.schema])),
      declared: new Set(Object.keys(this.relations)),
    };
    return getWhere(this.table, where, ctx);
  }

  #orderBy(orderBy: OrderBy<T> | undefined): SQL[] {
    return Object.entries(orderBy ?? {}).map(([name, direction]) => {
      const col = column(this.table, name);
      if (!col) throw new QueryBuilderError(`Unknown column "${name}" in orderBy`);
      return direction === 'desc' ? desc(col) : asc(col);
    });
  }

  #select<J extends JoinSpec<R>>(opts: FindOpts<T, R, J>, mode: 'rows' | 'page' | 'count') {
    const joins = this.#joins(opts.relations);
    const nested = joins.length > 0;

    let fields: SelectedFields | undefined;
    if (mode === 'count') {
      fields = { count: sql<number>`count(*)::int` };
    } else if (nested) {
      fields = {
        [this.#tableName]: this.table,
        ...Object.fromEntries(joins.map((j) => [j.key, j.relation.schema])),
      };
    } else if (mode === 'page') {
      fields = { ...getTableColumns(this.table) };
    }
    if (mode === 'page')
      fields = { ...fields, __total: sql<number>`count(*) over ()`.mapWith(Number) };

    const table: PgTable = this.table;
    const select = fields ? this.db.select(fields) : this.db.select();
    let query: PgSelect = select.from(table).$dynamic() as unknown as PgSelect;

    for (const { relation: rel, kind } of joins) {
      const on = and(
        eq(rel.field as Column, rel.reference),
        this.#notDeleted(rel.schema),
        this.#ownerCondition(rel.schema),
        rel.condition?.(rel.schema),
      );
      query = kind === 'inner' ? query.innerJoin(rel.schema, on!) : query.leftJoin(rel.schema, on!);
    }

    query = query.where(
      and(
        this.#ownerCondition(this.table),
        opts.withDeleted ? undefined : this.#notDeleted(this.table),
        opts.where === undefined ? undefined : this.#where(opts.where, joins),
      ),
    );

    if (mode !== 'count') {
      const order = this.#orderBy(opts.orderBy);
      if (order.length) query = query.orderBy(...order);
      if (opts.limit !== undefined) query = query.limit(opts.limit);
      if (opts.offset !== undefined) query = query.offset(opts.offset);
    }
    return query;
  }

  async find<J extends JoinSpec<R> = Record<never, never>>(
    opts: FindOpts<T, R, J> = {},
  ): Promise<Result<T, R, J>[]> {
    return (await this.#select(opts, 'rows')) as Result<T, R, J>[];
  }

  async findOne<J extends JoinSpec<R> = Record<never, never>>(
    opts: FindOpts<T, R, J> & { where: Where<T, R> },
  ): Promise<Result<T, R, J> | undefined> {
    const [row] = await this.find({ ...opts, limit: 1 });
    return row;
  }

  async getById(id: string): Promise<Row<T>> {
    const table: PgTable = this.table;
    const [row] = await this.db
      .select()
      .from(table)
      .where(this.#guard(eq(idColumn(this.table), id)))
      .limit(1);
    if (!row) throw new NotFoundError();
    return row as Row<T>;
  }

  async count<J extends JoinSpec<R> = Record<never, never>>(
    opts: Pick<FindOpts<T, R, J>, 'where' | 'relations' | 'withDeleted'> = {},
  ): Promise<number> {
    const [row] = (await this.#select(opts, 'count')) as { count: number }[];
    return row?.count ?? 0;
  }

  async paginate<J extends JoinSpec<R> = Record<never, never>>(
    opts: Omit<FindOpts<T, R, J>, 'limit' | 'offset'> & { page: number; pageSize: number },
  ): Promise<Page<Result<T, R, J>>> {
    const { page, pageSize, ...rest } = opts;
    if (!Number.isInteger(page) || page < 1)
      throw new QueryBuilderError('page must be an integer ≥ 1');
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new QueryBuilderError(`pageSize must be an integer from 1 to ${MAX_PAGE_SIZE}`);
    }
    const rows = (await this.#select(
      { ...rest, limit: pageSize, offset: (page - 1) * pageSize },
      'page',
    )) as (Record<string, unknown> & { __total?: number })[];

    const total = rows[0]?.__total ?? (page > 1 ? await this.count(rest) : 0);
    for (const row of rows) delete row.__total;
    return { items: rows as Result<T, R, J>[], total };
  }

  toSQL<J extends JoinSpec<R> = Record<never, never>>(
    opts: FindOpts<T, R, J> = {},
  ): { sql: string; params: unknown[] } {
    return this.#select(opts, 'rows').toSQL();
  }

  #prepareInsert(values: NewRow<T, ScopeCol>): Record<string, unknown> {
    const row: Record<string, unknown> = { ...values };
    for (const key of SYSTEM_COLUMNS) delete row[key];
    const owner = this.scope.owner;
    if (owner?.tables.has(this.table)) row[owner.column] = owner.value;
    return row;
  }

  #preparePatch(values: Patch<T, ScopeCol>): Record<string, unknown> {
    const patch: Record<string, unknown> = { ...values };
    for (const key of [...SYSTEM_COLUMNS, 'createdBy', this.scope.owner?.column]) {
      if (key) delete patch[key];
    }
    for (const key of Object.keys(patch)) if (patch[key] === undefined) delete patch[key];
    if (Object.keys(patch).length === 0) throw new QueryBuilderError('Nothing to update');
    return patch;
  }

  #requireWhere(where: Where<T>): SQL {
    if (where === undefined || where === null) throw new QueryBuilderError('A filter is required');
    return getWhere(this.table, where);
  }

  async insert(values: NewRow<T, ScopeCol>): Promise<Row<T>> {
    const [row] = await this.insertMany([values]);
    return row as Row<T>;
  }

  async insertMany(values: NewRow<T, ScopeCol>[]): Promise<Row<T>[]> {
    if (values.length === 0) throw new QueryBuilderError('insertMany needs at least one row');
    const rows = values.map((v) => this.#prepareInsert(v));
    return (await mapConflict(
      this.db
        .insert(this.table)
        .values(rows as never)
        .returning(),
    )) as Row<T>[];
  }

  async upsert(
    values: NewRow<T, ScopeCol>,
    opts: { conflict: readonly Col<T>[]; set: Patch<T, ScopeCol> },
  ): Promise<Row<T>> {
    if (opts.conflict.length === 0) throw new QueryBuilderError('upsert needs conflict columns');
    const target = opts.conflict.map((name) => {
      const col = column(this.table, name);
      if (!col) throw new QueryBuilderError(`Unknown column "${name}" in conflict target`);
      return col;
    });
    const set: Record<string, unknown> = this.#preparePatch(opts.set);
    if (column(this.table, 'updatedAt')) set.updatedAt = sql`now()`;
    const deletedAt = column(this.table, 'deletedAt');
    const query = this.db
      .insert(this.table)
      .values(this.#prepareInsert(values) as never)
      .onConflictDoUpdate({
        target: target as never,
        targetWhere: deletedAt ? isNull(deletedAt) : undefined,
        set: set as never,
        setWhere: this.#ownerCondition(this.table),
      })
      .returning();
    const [row] = (await mapConflict(query)) as Row<T>[];
    if (!row) throw new ConflictError();
    return row;
  }

  async update(id: string, values: Patch<T, ScopeCol>): Promise<Row<T>> {
    const [row] = await this.#update(this.#guard(eq(idColumn(this.table), id)), values);
    if (!row) throw new NotFoundError();
    return row;
  }

  async updateWithWhere(where: Where<T>, values: Patch<T, ScopeCol>): Promise<Row<T>[]> {
    return this.#update(this.#guard(this.#requireWhere(where)), values);
  }

  async softDelete(id: string): Promise<Row<T>> {
    const [row] = await this.#softDelete(this.#guard(eq(idColumn(this.table), id)));
    if (!row) throw new NotFoundError();
    return row;
  }

  async softDeleteWithWhere(where: Where<T>): Promise<Row<T>[]> {
    return this.#softDelete(this.#guard(this.#requireWhere(where)));
  }

  async #update(condition: SQL | undefined, values: Patch<T, ScopeCol>): Promise<Row<T>[]> {
    const patch = this.#preparePatch(values);
    const query = this.db
      .update(this.table)
      .set(patch as never)
      .where(condition)
      .returning();
    return (await mapConflict(query)) as Row<T>[];
  }

  async #softDelete(condition: SQL | undefined): Promise<Row<T>[]> {
    if (!column(this.table, 'deletedAt'))
      throw new QueryBuilderError(`${this.#tableName} has no deletedAt column`);
    const query = this.db
      .update(this.table)
      .set({ deletedAt: sql`now()` } as never)
      .where(condition)
      .returning();
    return (await query) as Row<T>[];
  }
}

export type { Relation, Relations };
