import { db } from './sqLiteService';
import { eq, sql } from 'drizzle-orm';
import { games } from '../lib/dbSchema';
import { GameDataItem } from '../lib/types';
import { generateSnowflake } from '../lib/snowflake';

const addGame = async (game:GameDataItem) => {
    const { name, description, roster } = game;
    const snowflake = generateSnowflake();
    const values = {
        name,
        snowflake: String(snowflake),
        description,
        roster,
        data: JSON.stringify({ "category":"table", "units":["score"] }),
    };
    try {
        await db.insert(games).values(values);
        const newGame = await db.select().from(games).where(eq(games.snowflake, String(snowflake)));
        
        if (!newGame || !newGame[0]) {
            throw new Error('Failed to create game - no result returned');
        }
        return newGame[0];
    } catch (error) {
        console.error('Error in addGame:', error);
        throw new Error('Failed to process game');
    }
}

const getGame = async (id:number) => {
    return await db.select().from(games).where(eq(games.id, id));
}

const getGames = async (limit:number) => {
    try {
        // Try a direct SQL query first to verify table access
        const result = await db.select().from(games).limit(limit);
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

