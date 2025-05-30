import { create } from 'zustand';
import { gameData } from '../services/gameService';
import { GameDataItem } from '../lib/types';

type GameStore = {
  games: GameDataItem[];
  loading: boolean;
  error: string | null;
  fetchGames: () => Promise<void>;
  createGame: (game: GameDataItem) => Promise<GameDataItem>;
  editGame: (game: GameDataItem) => Promise<void>;
  deleteGame: (game: GameDataItem) => Promise<void>;
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
      set({ games: result as GameDataItem[], error: null });
    } catch (error) {
      console.error('Failed to fetch games:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch games';
      set({ error: errorMessage, games: [] });
    } finally {
      set({ loading: false });
    }
  },
  createGame: async (game: GameDataItem) => {
    set({ loading: true, error: null });
    try {
      const result = await gameData.addGame(game);
      return result as GameDataItem;
    } catch (error) {
      console.error('Failed to create game:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create game';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteGame: async (game: GameDataItem) => {
    set({ loading: true, error: null });
    try {
      const result = await gameData.deleteGame(game);
      console.log('Delete result:', result);
    } catch (error) {
      console.error('Failed to delete game:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete game';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  editGame: async (form: GameDataItem) => {
    set({ loading: true, error: null });
    try {
      const result = await gameData.updateGame(form);
      console.log('Edit result:', result);
    } catch (error) {
      console.error('Failed to edit game:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to edit game';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  } 

}));