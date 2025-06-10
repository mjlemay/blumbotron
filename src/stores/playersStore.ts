import { create } from 'zustand';
import { playerData } from '../services/playerService';
import { DataItem } from '../lib/types';

type PlayerStore = {
  players: DataItem[];
  loading: boolean;
  error: string | null;
  fetchPlayers: () => Promise<void>;
  fetchPlayer: (id: number) => Promise<void>;
  createPlayer: (player: DataItem) => Promise<DataItem>;
  editPlayer: (player: DataItem) => Promise<void>;
  deletePlayer: (player: DataItem) => Promise<void>;
};

const MAGIC_LIMIT = 1000;

export const usePlayerStore = create<PlayerStore>((set) => ({
  players: [],
  loading: false,
  error: null,

  fetchPlayers: async () => {
    set({ loading: true, error: null });
    try {
      const result = await playerData.getPlayers(MAGIC_LIMIT);
      set({ players: result as DataItem[], error: null });
    } catch (error) {
      console.error('Failed to fetch players:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch players';
      set({ error: errorMessage, players: [] });
    } finally {
      set({ loading: false });
    }
  },
  fetchPlayer: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const result = await playerData.getPlayer(id);
      set({ players: result as DataItem[], error: null });
    } catch (error) {
      console.error('Failed to fetch player:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch player';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  createPlayer: async (player: DataItem) => {
    set({ loading: true, error: null });
    try {
      const result = await playerData.addPlayer(player);
      if (!result) {
        throw new Error('Failed to create player - no result returned');
      }
      const newPlayer = result as DataItem;
      set((state) => ({
        players: [...state.players, newPlayer],
        error: null,
      }));
      return newPlayer;
    } catch (error) {
      console.error('Failed to create player:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create player';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deletePlayer: async (player: DataItem) => {
    set({ loading: true, error: null });
    try {
      await playerData.deletePlayer(player);
    } catch (error) {
      console.error('Failed to delete player:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete player';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  editPlayer: async (form: DataItem) => {
    set({ loading: true, error: null });
    try {
      await playerData.updatePlayer(form);
    } catch (error) {
      console.error('Failed to edit player:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to edit player';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
}));
