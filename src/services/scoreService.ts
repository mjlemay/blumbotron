import { db } from './sqLiteService';
import { eq, asc, sql } from 'drizzle-orm';
import { scores } from '../lib/dbSchema';
import { ScoreDataItem } from '../lib/types';
import { generateSnowflake } from '../lib/snowflake';

const addScore = async (score: ScoreDataItem) => {
  const { name, game, player, unit_id, unit_type, datum } = score;
  const snowflake = generateSnowflake();
  const values = {
    name,
    snowflake: String(snowflake),
    game: game || 'BAD_GAME',
    player: player || 'BAD_PLAYER',
    unit_id: unit_id || -1,
    unit_type: unit_type || 'score',
    datum: Number(datum) || 0,
  };
  try {
    await db.insert(scores).values(values);
    const newScore = await db
      .select()
      .from(scores)
      .where(eq(scores.snowflake, String(snowflake)));

    if (!newScore || !newScore[0]) {
      throw new Error('Failed to create Score - no result returned');
    }
    return newScore[0];
  } catch (error) {
    console.error('Error in addScore:', error);
    if (error instanceof Error) {
      throw error; // Preserve the original error message
    }
    throw new Error('Failed to process Score');
  }
};

const getScore = async (id: number) => {
  return await db.select().from(scores).where(eq(scores.id, id));
};

const getScores = async (limit: number) => {
  try {
    // Try a direct SQL query first to verify table access
    const result = await db.select().from(scores).orderBy(asc(scores.datum)).limit(limit);
    return result;
  } catch (error) {
    console.error('Error in getscores:', error);
    throw error;
  }
};

const getUniqueScoresByGame = async (game:string, limit: number) => {
  try {
    const result = await db
      .select()
      .from(scores)
      .where(
        sql`${scores.id} in (
          select max(id) 
          from ${scores} 
          where ${scores.game} = ${game}
          group by ${scores.player}
        )`
      )
      .orderBy(sql`${scores.player} COLLATE NOCASE asc`, asc(scores.datum))
      .limit(limit);

    return result;
  } catch (error) {
    console.error('Error in getUniqueScoresByGame:', error);
    throw error;
  }
};

const updateScore = async (score: ScoreDataItem) => {
  const { id = -1, snowflake = 'BAD_ID', name, game, player, unit_id, unit_type, datum } = score;
  const values = {
    name,
    snowflake,
    game: game || 'BAD_GAME',
    player: player || 'BAD_PLAYER',
    unit_id: unit_id || -1,
    unit_type: unit_type || 'score',
    datum: Number(datum) || 0,
  };
  try {
    await db.update(scores).set(values).where(eq(scores.id, id));
    const updatedScore = await db
      .select()
      .from(scores)
      .where(eq(scores.snowflake, String(snowflake)));

    if (!updatedScore || !updatedScore[0]) {
      throw new Error('Failed to create Score - no result returned');
    }
    return updatedScore[0];
  } catch (error) {
    console.error('Error in updateScore:', error);
    throw new Error('Failed to process Score');
  }
};

const deleteScore = async (Score: ScoreDataItem) => {
  const { id = -1 } = Score;
  return await db.delete(scores).where(eq(scores.id, id)).returning();
};

const deleteScoresByUnitId = async (unitId: number, gameSnowflake: string) => {
  try {
    const result = await db
      .delete(scores)
      .where(
        sql`${scores.unit_id} = ${unitId} AND ${scores.game} = ${gameSnowflake}`
      )
      .returning();
    console.log(`Deleted ${result.length} scores for unit_id ${unitId}`);
    return result;
  } catch (error) {
    console.error('Error in deleteScoresByUnitId:', error);
    throw error;
  }
};

const scoreData = {
  addScore,
  deleteScore,
  deleteScoresByUnitId,
  getScore,
  getScores,
  getUniqueScoresByGame,
  updateScore,
};

export { scoreData };
