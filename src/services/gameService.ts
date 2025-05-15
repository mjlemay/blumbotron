import { db } from './sqLiteService';
import { eq } from 'drizzle-orm';
import { games } from '../lib/dbSchema';
import { BasicGame } from '../lib/defaults';

const addGame = async (game:BasicGame) => {
    const { name, description, roster } = game;
    const values ={
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
    return await db.select().from(games).limit(limit);
}

const updateGame = async (game:BasicGame) => {
    const { gameId } = game;
    return await db.update(games)
        .set(game)
        .where(eq(games.gameId, gameId))
        .returning();
}

const deleteGame = async (game:BasicGame) => {
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

