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

export const customThemeSettings: Record<string, Record<string, string | Record<string, string>>> = {
  'cyTerminal': {
    'path': 'cy-terminal.css',
    'label': 'CyTerminal',
    colors: {
      background: '#000000',
      text: '#e0f7fa',
      tableHeader: '#001a1f',
      tableRow: '#001419',
      tableAlt: '#00191e',
      fontHeader: '#00ffff',
      fontPlayer: '#00ffff',
      fontScore: '#0088ff',
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