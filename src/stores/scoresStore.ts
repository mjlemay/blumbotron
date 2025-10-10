import { create } from 'zustand';
import { scoreData } from '../services/scoreService.ts';
import { ScoreDataItem } from '../lib/types';
import { emit } from '@tauri-apps/api/event';

type ScoresStore = {
  scores: ScoreDataItem[];
  loading: boolean;
  error: string | null;
  gameScores: Record<string, ScoreDataItem[]>;
  lastUpdated: number;
  fetchUniqueScoresByGame: (game: string) => Promise<void>;
  fetchScores: () => Promise<void>;
  fetchScore: (id: number) => Promise<void>;
  createScore: (Score: ScoreDataItem) => Promise<ScoreDataItem>;
};

const MAGIC_LIMIT = 1000;

export const useScoreStore = create<ScoresStore>((set) => ({
  scores: [],
  loading: false,
  error: null,
  gameScores: {},
  lastUpdated: 0,
  fetchScores: async () => {
    set({ loading: true, error: null });
    try {
      const result = await scoreData.getScores(MAGIC_LIMIT);
      set({ scores: result as ScoreDataItem[], error: null });
    } catch (error) {
      console.error('Failed to fetch Scores:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Scores';
      set({ error: errorMessage, scores: [] });
    } finally {
      set({ loading: false });
    }
  },
  fetchScore: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const result = await scoreData.getScore(id);
      set({ scores: result as ScoreDataItem[], error: null });
    } catch (error) {
      console.error('Failed to fetch Score:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Score';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },
  fetchUniqueScoresByGame: async (game: string) => {
    set({ loading: true, error: null });
    try {
      const result = await scoreData.getUniqueScoresByGame(game, MAGIC_LIMIT);
      set((state) => {
        const updatedGameScores = { ...state.gameScores };
        updatedGameScores[game] = result as ScoreDataItem[];
        
        return {
          gameScores: updatedGameScores,
          lastUpdated: Date.now(),
          error: null 
        };
      });
    } catch (error) {
      console.error('Failed to fetch Unique Scores by Game:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Unique Scores by Game';
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },  
  createScore: async (Score: ScoreDataItem) => {
    set({ loading: true, error: null });
    try {
      const result = await scoreData.addScore(Score);
      if (!result) {
        throw new Error('Failed to create Score - no result returned');
      }
      const newScore = result as ScoreDataItem;
      
      // Instead of manually updating arrays, refresh from database to get true unique scores
      // This ensures we always show the highest score per player correctly
      const gameId = newScore.game;
      if (gameId) {
        // Refresh the scores for this game from database (which handles uniqueness)
        await scoreData.getUniqueScoresByGame(gameId, MAGIC_LIMIT)
          .then((uniqueScores) => {
            set((state) => {
              const updatedGameScores = { ...state.gameScores };
              updatedGameScores[gameId] = uniqueScores as ScoreDataItem[];
              
              return {
                scores: [...state.scores, newScore], // Keep general scores array
                gameScores: updatedGameScores,
                lastUpdated: Date.now(),
                error: null,
              };
            });
          });
      } else {
        // If no game ID, just update the general scores
        set((state) => ({
          scores: [...state.scores, newScore],
          lastUpdated: Date.now(),
          error: null,
        }));
      }
      
      // Emit event to other windows to notify of score update
      try {
        // Get or create a unique window identifier (should be created once per window)
        let windowId = (window as any).__blumbotronWindowId;
        if (!windowId) {
          windowId = `${Date.now()}-${Math.random()}`;
          (window as any).__blumbotronWindowId = windowId;
        }
        
        emit('score-updated', { 
          score: newScore,
          gameId: newScore.game,
          sourceWindowId: windowId
        });
      } catch (eventError) {
        console.warn('Failed to emit score-updated event:', eventError);
      }
      
      return newScore;
    } catch (error) {
      console.error('Failed to create Score:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create Score';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
