import { db } from './sqLiteService';
import { eq } from 'drizzle-orm';
import { games } from '../lib/dbSchema';
import { GameDataItem } from '../lib/types';

const addGame = async (game:GameDataItem) => {
    const { name, description, roster } = game;
    const values = {
        name,
        description,
        roster,
        meta: JSON.stringify({ "category":"table", "units":["score"] }),
    };
    return await db.insert(games).values(values);
}

const getGame = async (gameId:number) => {
    return await db.select().from(games).where(eq(games.gameId, gameId));
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
    const { gameId } = game;
    return await db.update(games)
        .set(game)
        .where(eq(games.gameId, gameId))
        .returning();
}

const deleteGame = async (game:GameDataItem) => {
    const { gameId } = game;
    return await db.delete(games)
        .where(eq(games.gameId, gameId))
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

