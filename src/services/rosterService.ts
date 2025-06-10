import { db } from './sqLiteService';
import { eq, asc } from 'drizzle-orm';
import { rosters } from '../lib/dbSchema';
import { RosterDataItem } from '../lib/types';
import { generateSnowflake } from '../lib/snowflake';

const addRoster = async (roster: RosterDataItem) => {
  const { name, allow, description, deny, opt_in, opt_out } = roster;
  const snowflake = generateSnowflake();
  const values = {
    name,
    snowflake: String(snowflake),
    description,
    allow,
    deny,
    opt_in,
    opt_out,
  };
  try {
    await db.insert(rosters).values(values);
    const newRoster = await db
      .select()
      .from(rosters)
      .where(eq(rosters.snowflake, String(snowflake)));

    if (!newRoster || !newRoster[0]) {
      throw new Error('Failed to create roster - no result returned');
    }
    return newRoster[0];
  } catch (error) {
    console.error('Error in addRoster:', error);
    throw new Error('Failed to process roster');
  }
};

const getRoster = async (id: number) => {
  return await db.select().from(rosters).where(eq(rosters.id, id));
};

const getRosters = async (limit: number) => {
  try {
    // Try a direct SQL query first to verify table access
    const result = await db.select().from(rosters).orderBy(asc(rosters.name)).limit(limit);
    return result;
  } catch (error) {
    console.error('Error in getRosters:', error);
    throw error;
  }
};

const updateRoster = async (roster: RosterDataItem) => {
  const { id = -1, snowflake = 'BAD_ID' } = roster;

  try {
    await db.update(rosters).set(roster).where(eq(rosters.id, id));
    const updatedRoster = await db
      .select()
      .from(rosters)
      .where(eq(rosters.snowflake, String(snowflake)));

    if (!updatedRoster || !updatedRoster[0]) {
      throw new Error('Failed to create roster - no result returned');
    }
    return updatedRoster[0];
  } catch (error) {
    console.error('Error in updateRoster:', error);
    throw new Error('Failed to process roster');
  }
};

const deleteRoster = async (roster: RosterDataItem) => {
  const { id = -1 } = roster;
  return await db.delete(rosters).where(eq(rosters.id, id)).returning();
};

const rosterData = {
  addRoster,
  deleteRoster,
  getRoster,
  getRosters,
  updateRoster,
};

export { rosterData };
