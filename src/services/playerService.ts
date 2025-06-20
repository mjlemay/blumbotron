import { db } from './sqLiteService';
import { eq, asc } from 'drizzle-orm';
import { players } from '../lib/dbSchema';
import { DataItem } from '../lib/types';
import { generateSnowflake } from '../lib/snowflake';

const addPlayer = async (player: DataItem) => {
  const { name } = player;
  const snowflake = generateSnowflake();
  const values = {
    name,
    snowflake: String(snowflake),
    data: {bio: ''},
  };
  try {
    // First insert the player
    await db.insert(players).values(values);
    
    // Then fetch the newly created player
    const newPlayer = await db
      .select()
      .from(players)
      .where(eq(players.snowflake, String(snowflake)))
      .limit(1);

    if (!newPlayer || !newPlayer[0]) {
      throw new Error('Failed to create player - no result returned');
    }
    return newPlayer[0];
  } catch (error) {
    console.error('Error in addPlayer:', error);
    throw new Error('Failed to process player');
  }
};

const getPlayer = async (id: number) => {
  return await db.select().from(players).where(eq(players.id, id));
};

const getPlayers = async (limit: number) => {
  try {
    // Try a direct SQL query first to verify table access
    const result = await db.select().from(players).orderBy(asc(players.name)).limit(limit);
    return result;
  } catch (error) {
    console.error('Error in getPlayers:', error);
    throw error;
  }
};

const updatePlayer = async (player: DataItem) => {
  const { id = -1 } = player;
  return await db.update(players).set(player).where(eq(players.id, id)).returning();
};

const deletePlayer = async (player: DataItem) => {
  const { id = -1 } = player;
  return await db.delete(players).where(eq(players.id, id)).returning();
};

const playerData = {
  addPlayer,
  deletePlayer,
  getPlayer,
  getPlayers,
  updatePlayer,
};

export { playerData };
