export const bgColors: Record<string, string> = {
  red: 'bg-red-500/50',
  blue: 'bg-blue-500/50',
  green: 'bg-green-500/50',
  yellow: 'bg-yellow-500/50',
  purple: 'bg-purple-500/50',
  pink: 'bg-pink-500/50',
  gray: 'bg-gray-500/50',
  indigo: 'bg-indigo-500/50',
  slate: 'bg-slate-500/50',
  orange: 'bg-orange-500/50',
  teal: 'bg-teal-500/50',
  cyan: 'bg-cyan-500/50',
  lime: 'bg-lime-500/50',
  emerald: 'bg-emerald-500/50',
  rose: 'bg-rose-500/50',
  fuchsia: 'bg-fuchsia-500/50',
  violet: 'bg-violet-500/50',
  amber: 'bg-amber-500/50',
  stone: 'bg-stone-500/50',
  zinc: 'bg-zinc-500/50',
  neutral: 'bg-neutral-500/50',
  sky: 'bg-sky-500/50',
};

export interface ThemeColors {
  background?: string;
  text?: string;
  primary?: string;
  secondary?: string;
  tertiary?: string;
  tableHeader?: string;
  tableRow?: string;
  tableAlt?: string;
  fontHeader?: string;
  fontPlayer?: string;
  fontScore?: string;
}

export interface ThemeFonts {
  header?: string;
  player?: string;
  score?: string;
}

export interface ThemeSettings {
  path: string;
  label: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
}

export const customThemeSettings: Record<string, ThemeSettings> = {
  'cyTerminal': {
    'path': 'cy-terminal.css',
    'label': 'CyTerminal',
    colors: {
      background: '#0a0a08',
      text: '#b8c4b8',
      primary: '#00ffff',
      secondary: '#0088ff',
      tertiary: '#00ddff',
      tableHeader: '#0d0f0a',
      tableRow: '#080a06',
      tableAlt: '#0b0d08',
      fontHeader: '#00ccaa',
      fontPlayer: '#88aa88',
      fontScore: '#00aa88',
    },
    fonts: {
      header: 'Courier New, Courier, monospace',
      player: 'Courier New, Courier, monospace',
      score: 'Courier New, Courier, monospace',
    }
  },
  'neoNavigator': {
    'path': 'neo-navigator/neo-navigator.css',
    'label': 'Neo Navigator',
    colors: {
      background: '#120458',
      text: '#faf0e6',
      primary: '#41c5ff',
      secondary: '#ff00a0',
      tertiary: '#7a04eb',
      tableHeader: '#1a0660',
      tableRow: '#120458',
      tableAlt: '#1a0660',
      fontHeader: '#41c5ff',
      fontPlayer: '#faf0e6',
      fontScore: '#ff00a0',
    },
    fonts: {
      header: 'Arial, sans-serif',
      player: 'Arial, sans-serif',
      score: 'Arial, sans-serif',
    }
  },
  'neuralNet': {
    'path': 'neural-net.css',
    'label': 'Neural Net',
    colors: {
      background: '#0d0d0d',
      text: '#f0f0f0',
      primary: '#39ff14',
      secondary: '#ff00ff',
      tertiary: '#00ffff',
      tableHeader: '#1a1a1a',
      tableRow: '#111111',
      tableAlt: '#161616',
      fontHeader: '#39ff14',
      fontPlayer: '#f0f0f0',
      fontScore: '#ff00ff',
    },
    fonts: {
      header: 'Arial, sans-serif',
      player: 'Arial, sans-serif',
      score: 'Arial, sans-serif',
    }
  }
}