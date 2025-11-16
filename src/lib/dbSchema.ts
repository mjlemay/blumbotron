import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const games = sqliteTable('games', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  snowflake: text('snowflake').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  data: text('data', { mode: 'json' }),
  roster: text('roster'),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export const players = sqliteTable('players', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  snowflake: text('snowflake').notNull(),
  name: text('name').notNull(),
  data: text('data', { mode: 'json' }),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export const scores = sqliteTable('scores', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  snowflake: text('snowflake').notNull(),
  player: text('player').notNull(),
  game: text('game').notNull(),
  unit_id: integer('unit_id').notNull(),
  unit_type: text('unit_type').notNull(),
  datum: integer('datum').notNull(),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export const rosters = sqliteTable('rosters', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  snowflake: text('snowflake').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  allow: text('allow', { mode: 'json' }),
  deny: text('deny', { mode: 'json' }),
  opt_in: text('opt_in', { mode: 'json' }),
  opt_out: text('opt_out', { mode: 'json' }),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`),
});
