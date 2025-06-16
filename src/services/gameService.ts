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
    await db.insert(games).values(values);
    const newGame = await db
      .select()
      .from(games)
      .where(eq(games.snowflake, String(snowflake)));

    if (!newGame || !newGame[0]) {
      throw new Error('Failed to create game - no result returned');
    }
    return newGame[0];
  } catch (error) {
    console.error('Error in addGame:', error);
    throw new Error('Failed to process game');
  }
};

const getGame = async (id: number) => {
  return await db.select().from(games).where(eq(games.id, id));
};

const getGames = async (limit: number) => {
  try {
    // Try a direct SQL query first to verify table access
    const result = await db.select().from(games).orderBy(asc(games.name)).limit(limit);
    return result;
  } catch (error) {
    console.error('Error in getGames:', error);
    throw error;
  }
};

const updateGame = async (game: GameDataItem) => {
  const { id = -1 } = game;
  try {
    console.log('Starting updateGame with ID:', id);
    console.log('Update data:', game);

    // Ensure we're only updating the necessary fields
    const updateData = {
      name: game.name,
      description: game.description,
      data: game.data, // Drizzle will handle JSON serialization
      roster: game.roster,
      updated_at: new Date().toISOString()
    };

    console.log('Prepared update data:', updateData);

    // First update the game
    console.log('Attempting database update...');
    const updateResult = await db.update(games)
      .set(updateData)
      .where(eq(games.id, id));
    console.log('Update result:', updateResult);
    
    // Add a small delay to prevent lock contention
    console.log('Waiting before fetch...');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Then fetch the updated game
    console.log('Attempting to fetch updated game...');
    const updatedGame = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1);
    console.log('Fetch result:', updatedGame);

    if (!updatedGame || !updatedGame[0]) {
      throw new Error('Failed to update game - no result returned');
    }

    // Drizzle will automatically deserialize the JSON data
    console.log('Update successful, returning:', updatedGame[0]);
    return updatedGame[0];
  } catch (error) {
    console.error('Detailed error in updateGame:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      gameId: id,
      gameData: game
    });
    throw new Error('Failed to process game');
  }
};

const deleteGame = async (game: GameDataItem) => {
  const { id = -1 } = game;
  return await db.delete(games).where(eq(games.id, id)).returning();
};

const gameData = {
  addGame,
  deleteGame,
  getGame,
  getGames,
  updateGame,
};

export { gameData };
