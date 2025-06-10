import { create } from 'zustand';
import { scoreData } from '../services/scoreService.ts';
import { ScoreDataItem } from '../lib/types';

type ScoresStore = {
  scores: ScoreDataItem[];
  loading: boolean;
  error: string | null;
  fetchScores: () => Promise<void>;
  fetchScore: (id: number) => Promise<void>;
  createScore: (Score: ScoreDataItem) => Promise<ScoreDataItem>;
};

const MAGIC_LIMIT = 1000;

export const useScoreStore = create<ScoresStore>((set) => ({
  scores: [],
  loading: false,
  error: null,

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
  createScore: async (Score: ScoreDataItem) => {
    set({ loading: true, error: null });
    try {
      const result = await scoreData.addScore(Score);
      if (!result) {
        throw new Error('Failed to create Score - no result returned');
      }
      const newScore = result as ScoreDataItem;
      set((state) => ({
        Scores: [...state.scores, newScore],
        error: null,
      }));
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
