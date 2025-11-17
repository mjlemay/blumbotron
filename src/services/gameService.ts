import { db } from './sqLiteService';
import { eq, asc } from 'drizzle-orm';
import { games } from '../lib/dbSchema';
import { GameDataItem } from '../lib/types';
import { generateSnowflake } from '../lib/snowflake';

const addGame = async (game: GameDataItem) => {
  try {
    const snowflake = generateSnowflake();
    
    // Use the incoming game data if provided, otherwise use default
    const gameData = game.data || {
      displays: [{
        title: 'High Scores',
        rows: 5,
        category: 'table',
        filteredUnits: []
      }]
    };

    // Clean up any potential undefined values
    const cleanData = JSON.parse(JSON.stringify(gameData, (_key, value) => {
      return value === undefined ? null : value;
    }));

    const values = {
      name: game.name || 'Untitled Game',
      snowflake: String(snowflake),
      description: game.description || '',
      roster: game.roster || null,
      data: cleanData  // Let Drizzle handle JSON serialization since schema has { mode: 'json' }
    };
    
    // Insert without .returning() to avoid JSON parse issues
    await db.insert(games).values(values);
    
    // Fetch the inserted record using the snowflake
    const fetchResult = await db.select().from(games).where(eq(games.snowflake, values.snowflake));
    
    if (!fetchResult || !fetchResult[0]) {
      throw new Error('Failed to fetch inserted game');
    }
    
    // Clear cache after adding
    gamesCache = null;
    
    return fetchResult[0];
  } catch (error) {
    throw new Error(`Failed to create game - ${error instanceof Error ? error.message : error}`);
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
      return gamesCache.slice(0, limit);
    }

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

const updateGame = async (game: GameDataItem) => {
  const { id = -1 } = game;
  try {
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
    
    // Fetch the updated record separately
    const fetchedRecord = await db.select().from(games).where(eq(games.id, id));
    
    if (!fetchedRecord || !fetchedRecord[0]) {
      throw new Error('Failed to update game - record not found after update');
    }

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
};

const gameData = {
  addGame,
  deleteGame,
  getGame,
  getGames,
  updateGame,
  clearGamesCache,
};

export { gameData };
