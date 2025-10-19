import { db } from './sqLiteService';
import { eq, asc } from 'drizzle-orm';
import { games } from '../lib/dbSchema';
import { GameDataItem } from '../lib/types';
import { generateSnowflake } from '../lib/snowflake';

const addGame = async (game: GameDataItem) => {
  const { name, description, roster } = game;
  const snowflake = generateSnowflake();
  const values = {
    name,
    snowflake: String(snowflake),
    description,
    roster,
    data: { category: 'table', units: ['score'] },
  };
  try {
    const result = await db.insert(games).values(values).returning();
    
    if (!result || !result[0]) {
      throw new Error('Failed to create game - no result returned');
    }
    
    // Clear cache after adding
    gamesCache = null;
    
    return result[0];
  } catch (error) {
    console.error('Error in addGame:', error);
    throw new Error('Failed to process game');
  }
};

const getGame = async (id: number) => {
  return await db.select().from(games).where(eq(games.id, id));
};

// Add simple in-memory cache for games
let gamesCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

const getGames = async (limit: number) => {
  try {
    // Check cache first
    const now = Date.now();
    if (gamesCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('getGames: Using cached data');
      return gamesCache.slice(0, limit);
    }

    console.log('getGames: Fetching from database');
    const result = await db.select().from(games).orderBy(asc(games.name)).limit(limit);
    
    // Update cache
    gamesCache = result;
    cacheTimestamp = now;
    
    return result;
  } catch (error) {
    console.error('Error in getGames:', error);
    throw error;
  }
};

// Lightweight version that only fetches essential fields for lists
const getGamesLight = async (limit: number) => {
  try {
    console.log('getGamesLight: Fetching minimal data');
    const result = await db.select({
      id: games.id,
      snowflake: games.snowflake,
      name: games.name,
      description: games.description,
      roster: games.roster,
      created_at: games.created_at,
      updated_at: games.updated_at
    }).from(games).orderBy(asc(games.name)).limit(limit);
    
    return result;
  } catch (error) {
    console.error('Error in getGamesLight:', error);
    throw error;
  }
};

const updateGame = async (game: GameDataItem) => {
  const { id = -1 } = game;
  try {
    // Prepare update data efficiently
    const updateData = {
      name: game.name,
      description: game.description,
      data: game.data,
      roster: game.roster,
      updated_at: new Date().toISOString()
    };
    
    // Perform the update without relying on .returning()
    await db.update(games)
      .set(updateData)
      .where(eq(games.id, id));

    console.log('updateGame: Update query executed, now fetching updated record');
    
    // Fetch the updated record separately
    const fetchedRecord = await db.select().from(games).where(eq(games.id, id));
    console.log('updateGame: Fetched record after update:', fetchedRecord);
    
    if (!fetchedRecord || !fetchedRecord[0]) {
      throw new Error('Failed to update game - record not found after update');
    }

    console.log('updateGame: Update successful, returning record');

    // Clear cache after update
    gamesCache = null;
    
    return fetchedRecord[0];
  } catch (error) {
    console.error('Error in updateGame:', error);
    throw new Error('Failed to process game');
  }
};

const deleteGame = async (game: GameDataItem) => {
  const { id = -1 } = game;
  const result = await db.delete(games).where(eq(games.id, id)).returning();
  
  // Clear cache after deletion
  gamesCache = null;
  
  return result;
};

const clearGamesCache = () => {
  gamesCache = null;
  console.log('Games cache cleared');
};

const gameData = {
  addGame,
  deleteGame,
  getGame,
  getGames,
  getGamesLight,
  updateGame,
  clearGamesCache,
};

export { gameData };
