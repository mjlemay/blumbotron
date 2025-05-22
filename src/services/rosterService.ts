import { db } from './sqLiteService';
import { eq } from 'drizzle-orm';
import { rosters } from '../lib/dbSchema';
import { RosterDataItem } from '../lib/types';

const addRoster = async (roster:RosterDataItem) => {
    const { name, description, data } = roster;
    const values = {
        name,
        description,
        data: JSON.stringify(data),
    };
    return await db.insert(rosters).values(values as any); //TODO: fix this
}

const getRoster = async (rosterId:number) => {
    return await db.select().from(rosters).where(eq(rosters.rosterId, rosterId));
}

const getRosters = async (limit:number) => {
    console.log('getRosters called with limit:', limit);
    try {
        // Try a direct SQL query first to verify table access
        const result = await db.select().from(rosters).limit(limit);
        console.log('getRosters query result:', result);
        return result;
    } catch (error) {
        console.error('Error in getRosters:', error);
        throw error;
    }
}

const updateRoster = async (roster:RosterDataItem) => {
    const { rosterId } = roster;
    return await db.update(rosters)
        .set(roster)
        .where(eq(rosters.rosterId, rosterId))
        .returning();
}

const deleteRoster = async (roster:RosterDataItem) => {
    const { rosterId } = roster;
    return await db.delete(rosters)
        .where(eq(rosters.rosterId, rosterId))
        .returning();
}

const rosterData = { 
    addRoster,
    deleteRoster,
    getRoster,
    getRosters,
    updateRoster
 }

export { rosterData }

