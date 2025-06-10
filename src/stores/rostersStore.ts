import { create } from 'zustand';
import { rosterData } from '../services/rosterService';
import { RosterDataItem } from '../lib/types';

type RostersStore = {
  rosters: RosterDataItem[];
  loading: boolean;
  error: string | null;
  fetchRosters: () => Promise<void>;
  fetchRoster: (id: number) => Promise<void>;
  createRoster: (roster: RosterDataItem) => Promise<RosterDataItem>;
  editRoster: (roster: RosterDataItem) => Promise<RosterDataItem>;
  deleteRoster: (roster: RosterDataItem) => Promise<void>;
};

const MAGIC_LIMIT = 1000;

export const useRosterStore = create<RostersStore>((set) => ({
  rosters: [],
  loading: false,
  error: null,

  fetchRosters: async () => {
    set({ loading: true, error: null });
    try {
      const result = await rosterData.getRosters(MAGIC_LIMIT);
      set({ rosters: result as RosterDataItem[], error: null });
    } catch (error) {
      console.error('Failed to fetch rosters:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rosters';
      set({ error: errorMessage, rosters: [] });
    } finally {
      set({ loading: false });
    }
  },
  fetchRoster: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const result = await rosterData.getRoster(id);
      set({ rosters: result as RosterDataItem[], error: null });
    } catch (error) {
      console.error('Failed to fetch roster:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch roster';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  createRoster: async (roster: RosterDataItem) => {
    set({ loading: true, error: null });
    try {
      const result = await rosterData.addRoster(roster);
      if (!result) {
        throw new Error('Failed to create roster - no result returned');
      }
      const newRoster = result as RosterDataItem;
      set((state) => ({
        rosters: [...state.rosters, newRoster],
        error: null,
      }));
      return newRoster;
    } catch (error) {
      console.error('Failed to create roster:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create roster';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteRoster: async (roster: RosterDataItem) => {
    set({ loading: true, error: null });
    try {
      await rosterData.deleteRoster(roster);
    } catch (error) {
      console.error('Failed to delete roster:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete roster';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  editRoster: async (form: RosterDataItem) => {
    set({ loading: true, error: null });
    try {
      const result = await rosterData.updateRoster(form);
      if (!result) {
        throw new Error('Failed to update roster - no result returned');
      }
      const updatedRoster = result as RosterDataItem;
      set((state) => ({
        rosters: state.rosters.map((roster) =>
          roster.snowflake === updatedRoster.snowflake ? updatedRoster : roster
        ),
        error: null,
      }));
      return updatedRoster;
    } catch (error) {
      console.error('Failed to edit roster:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to edit roster';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
