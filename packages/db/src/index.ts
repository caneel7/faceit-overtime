// Server only. API code reaches tables through these scopes, never through raw Drizzle.
export { createDbClient, type DbClient, type DbClientOptions, type Scope } from './client';
export { QueryBuilder } from './query/builder';
export { ConflictError, NotFoundError, QueryBuilderError } from './query/errors';
export type {
  FindOpts,
  GlobalTable,
  JoinSpec,
  NewRow,
  OrderBy,
  Page,
  Patch,
  Relation,
  Relations,
  Result,
  Row,
  UserTable,
  Where,
} from './query/types';
export * from './schema';
