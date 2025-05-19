import { create } from 'zustand';
import { Experience, ListItem } from '../lib/types';
import { defaultExperience } from '../lib/defaults';

type ExperienceStore = {
    experience: Experience;
    loading: boolean;
    error: string | null;
    setExpView: (view: string) => void;
    setExpModal: (modal: string) => void;
    setExpSelected: (selected: Record<string, ListItem>) => void;
}

export const useExperienceStore = create<ExperienceStore>((set) => ({
    experience: defaultExperience,
    loading: false,
    error: null,

    setExpView: (view: string) => set((state) => ({ 
        experience: { ...state.experience, view } 
    })),
    setExpModal: (modal: string) => set((state) => ({ 
        experience: { ...state.experience, modal } 
    })),
    setExpSelected: (selected: Record<string, ListItem>) => set((state) => ({ 
        experience: { ...state.experience, selected } 
    })),
}));
