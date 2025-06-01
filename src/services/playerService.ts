import { db } from './sqLiteService';
import { eq, sql } from 'drizzle-orm';
import { players } from '../lib/dbSchema';
import { PlayerDataItem } from '../lib/types';

const addPlayer = async (player:PlayerDataItem) => {
    const { name, data } = player;
    const values = {
        name,
        data: JSON.stringify(data),
    };
    const result = await db.transaction(async (tx) => {
        await tx.insert(players).values(values);
        return await tx.select().from(players).orderBy(sql`playerId DESC`).limit(1);
    });
    if (!result || !result[0]) {
        throw new Error('Failed to create player - no result returned');
    }
    const newPlayer = result[0];
    return {
        ...newPlayer,
        id: newPlayer.playerId,
        playerId: newPlayer.playerId
    };
}

const getPlayer = async (playerId:number) => {
    return await db.select().from(players).where(eq(players.playerId, playerId));
}

const getPlayers = async (limit:number) => {
    console.log('getPlayers called with limit:', limit);
    try {
        // Try a direct SQL query first to verify table access
        const result = await db.select().from(players).limit(limit);
        console.log('getPlayers query result:', result);
        return result;
    } catch (error) {
        console.error('Error in getPlayers:', error);
        throw error;
    }
}

const updatePlayer = async (player:PlayerDataItem) => {
    const { playerId = -1 } = player;
    return await db.update(players)
        .set(player)
        .where(eq(players.playerId, playerId))
        .returning();
}

const deletePlayer = async (player:PlayerDataItem) => {
    const { playerId = -1 } = player;
    return await db.delete(players)
        .where(eq(players.playerId, playerId))
        .returning();
}

const playerData = { 
    addPlayer,
    deletePlayer,
    getPlayer,
    getPlayers,
    updatePlayer
 }

export { playerData }

