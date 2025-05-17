import { create } from 'zustand';
import { gameData } from '../services/gameService';
import { BasicGame } from '../lib/types';

type GameStore = {
  games: BasicGame[];
  loading: boolean;
  error: string | null;
  fetchGames: () => Promise<void>;
};

const MAGIC_LIMIT = 1000;

export const useGameStore = create<GameStore>((set) => ({
  games: [],
  loading: false,
  error: null,

  fetchGames: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching games...');
      const result = await gameData.getGames(MAGIC_LIMIT);
      console.log('Fetch result:', result);
      set({ games: result, error: null });
    } catch (error) {
      console.error('Failed to fetch games:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch games';
      set({ error: errorMessage, games: [] });
    } finally {
      set({ loading: false });
    }
  },

}));