import { sql } from 'drizzle-orm';
import { customType, timestamp, uuid } from 'drizzle-orm/pg-core';

export const citext = customType<{ data: string }>({
  dataType: () => 'citext',
});

export const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const baseColumns = () => ({
  id: uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  deletedAt: timestamptz('deleted_at'),
});

export const live = sql`deleted_at is null`;
