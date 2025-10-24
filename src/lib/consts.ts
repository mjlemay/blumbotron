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
      background: '#0f111a',
      text: '#cfd8dc',
      primary: '#00ff9f',
      secondary: '#ff6ac1',
      tertiary: '#ffaa00',
      tableHeader: '#1f2230',
      tableRow: '#181a23',
      tableAlt: '#20232c',
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
  }
}