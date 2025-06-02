import { db } from './sqLiteService';
import { eq, sql } from 'drizzle-orm';
import { games } from '../lib/dbSchema';
import { GameDataItem } from '../lib/types';
import { generateSnowflake } from '../lib/snowflake';

const addGame = async (game:GameDataItem) => {
    const { name, description, roster } = game;
    const snowflake = generateSnowflake() as unknown as string;
    const values = {
        name,
        snowflake,
        description,
        roster,
        data: JSON.stringify({ "category":"table", "units":["score"] }),
    };
    console.log('values', values);
    const result = await db.transaction(async (tx) => {
        await tx.insert(games).values(values);
        return await tx.select().from(games).orderBy(sql`id DESC`).limit(1);
    });
    console.log('result', result);
    if (!result || !result[0]) {
        throw new Error('Failed to create game - no result returned');
    }
    const newGame = result[0];
    return newGame;
}

const getGame = async (id:number) => {
    return await db.select().from(games).where(eq(games.id, id));
}

const getGames = async (limit:number) => {
    console.log('getGames called with limit:', limit);
    try {
        // Try a direct SQL query first to verify table access
        const result = await db.select().from(games).limit(limit);
        console.log('getGames query result:', result);
        return result;
    } catch (error) {
        console.error('Error in getGames:', error);
        throw error;
    }
}

const updateGame = async (game:GameDataItem) => {
    const { id = -1 } = game;
    return await db.update(games)
        .set(game)
        .where(eq(games.id, id))
        .returning();
}

const deleteGame = async (game:GameDataItem) => {
    const { id = -1 } = game;
    return await db.delete(games)
        .where(eq(games.id, id))
        .returning();
}

const gameData = { 
    addGame,
    deleteGame,
    getGame,
    getGames,
    updateGame
 }

export { gameData }

