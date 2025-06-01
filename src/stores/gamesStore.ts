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
      const result = await gameData.getGames(MAGIC_LIMIT);
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
      if (!result) {
        throw new Error('Failed to create game - no result returned');
      }
      const newGame = result as GameDataItem;
      set((state) => ({ 
        games: [...state.games, newGame],
        error: null 
      }));
      return newGame;
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
      await gameData.deleteGame(game);
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
      await gameData.updateGame(form);
    } catch (error) {
      console.error('Failed to edit game:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to edit game';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  } 

}));