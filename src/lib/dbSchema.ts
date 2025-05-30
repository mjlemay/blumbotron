import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const games = sqliteTable('games', {
    gameId: integer('gameId').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    data: text('data'),
    roster: integer('roster'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

export const players = sqliteTable('players', {
    playerId: integer('playerId', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    data: text('data'),
    created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`)
});

export const scores = sqliteTable('scores', {
    scoreId: integer('scoreId', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    player: integer('player').notNull(),
    game: integer('game').notNull(),
    unit: text('unit').notNull(),
    score: integer('score').notNull(),
    created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`)
});

export const rosters = sqliteTable('rosters', {
    rosterId: integer('rosterId', { mode: 'number' }).primaryKey({ autoIncrement: true }), 
    name: text('name').notNull(),
    description: text('description'),
    data: text('data', { mode: 'json' }).$type<{ allow: number[]; deny: number[] }>(),
    created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: text('updated_at').default(sql`(CURRENT_TIMESTAMP)`)
});


