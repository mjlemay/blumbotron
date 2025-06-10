import { create } from 'zustand';
import { Experience, SelectedItem } from '../lib/types';
import { defaultExperience } from '../lib/defaults';

type ExperienceStore = {
  experience: Experience;
  loading: boolean;
  error: string | null;
  setExpView: (view: string) => void;
  setExpModal: (modal: string) => void;
  setExpSelected: (selected: Record<string, SelectedItem>) => void;
};

export const useExperienceStore = create<ExperienceStore>((set) => ({
  experience: defaultExperience,
  loading: false,
  error: null,

  setExpView: (view: string) =>
    set((state) => ({
      experience: { ...state.experience, view },
    })),
  setExpModal: (modal: string) =>
    set((state) => ({
      experience: { ...state.experience, modal },
    })),
  setExpSelected: (selected: Record<string, SelectedItem>) =>
    set((state) => ({
      experience: { ...state.experience, selected },
    })),
}));
