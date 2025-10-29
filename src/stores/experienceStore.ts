import { create } from 'zustand';
import { Experience, SelectedItem } from '../lib/types';
import { defaultExperience } from '../lib/defaults';

type ExperienceStore = {
  experience: Experience;
  loading: boolean;
  error: string | null;
  setExpView: (view: string) => void;
  setExpSubView: (subView: string) => void;
  setExpModal: (modal: string) => void;
  setExpSelected: (selected: Record<string, SelectedItem>) => void;
  setExpSubSelected: (selected: string | number | null) => void;
};

export const useExperienceStore = create<ExperienceStore>((set) => ({
  experience: defaultExperience,
  loading: false,
  error: null,

  setExpView: (view: string) =>
    set((state) => ({
      experience: { ...state.experience, view, subView: 'main' },
    })),
  setExpSubView: (subView: string) =>
    set((state) => ({
      experience: { ...state.experience, subView },
    })),
  setExpModal: (modal: string) =>
    set((state) => ({
      experience: { ...state.experience, modal },
    })),
  setExpSelected: (selected: Record<string, SelectedItem>) =>
    set((state) => ({
      experience: { ...state.experience, selected, subSelected: null },
    })),
  setExpSubSelected: (subSelected: number | string | null) => 
    set((state) => ({
      experience: { ...state.experience, subSelected },
    }))
}));
