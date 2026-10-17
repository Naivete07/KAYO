export type SovereignTheme = 'pitch_black' | 'gold' | 'sapphire' | 'emerald' | 'platinum';
export type DisplayDensity = 'compact' | 'executive' | 'presentation';

export interface ThemeColors {
  id: SovereignTheme;
  name: string;
  dotColor: string;
  // Dynamic CSS & Tailwind mappings
  accentText: string;
  accentBg: string;
  accentBgHover: string;
  accentBgSubtle: string;
  accentBorder: string;
  accentBorderGlow: string;
  accentRing: string;
  activePillBg: string;
  activePillText: string;
  sparklineStroke: string;
  badgeBg: string;
  glowHex: string;
  cardHover: string;
}

export const THEMES: Record<SovereignTheme, ThemeColors> = {
  pitch_black: {
    id: 'pitch_black',
    name: 'Pitch Black',
    dotColor: 'bg-white',
    accentText: 'text-white',
    accentBg: 'bg-white',
    accentBgHover: 'hover:bg-zinc-200',
    accentBgSubtle: 'bg-white/10',
    accentBorder: 'border-white/20',
    accentBorderGlow: 'border-white/40 shadow-white/10',
    accentRing: 'ring-white',
    activePillBg: 'bg-white text-black font-bold shadow-lg shadow-white/20',
    activePillText: 'text-white',
    sparklineStroke: '#ffffff',
    badgeBg: 'bg-zinc-900 text-white border-zinc-700',
    glowHex: '#ffffff',
    cardHover: 'hover:border-zinc-500'
  },
  gold: {
    id: 'gold',
    name: 'Sovereign Gold',
    dotColor: 'bg-amber-400',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-400',
    accentBgHover: 'hover:bg-amber-300',
    accentBgSubtle: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/30',
    accentBorderGlow: 'border-amber-500/50 shadow-amber-500/10',
    accentRing: 'ring-amber-400',
    activePillBg: 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20',
    activePillText: 'text-amber-300',
    sparklineStroke: '#f59e0b',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    glowHex: '#eab308',
    cardHover: 'hover:border-amber-500/40'
  },
  sapphire: {
    id: 'sapphire',
    name: 'Royal Sapphire',
    dotColor: 'bg-sky-400',
    accentText: 'text-sky-400',
    accentBg: 'bg-sky-500',
    accentBgHover: 'hover:bg-sky-400',
    accentBgSubtle: 'bg-sky-500/10',
    accentBorder: 'border-sky-500/30',
    accentBorderGlow: 'border-sky-500/50 shadow-sky-500/10',
    accentRing: 'ring-sky-400',
    activePillBg: 'bg-sky-400 text-black font-bold shadow-lg shadow-sky-400/20',
    activePillText: 'text-sky-300',
    sparklineStroke: '#38bdf8',
    badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    glowHex: '#38bdf8',
    cardHover: 'hover:border-sky-500/40'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Sentinel',
    dotColor: 'bg-emerald-400',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-400',
    accentBgHover: 'hover:bg-emerald-300',
    accentBgSubtle: 'bg-emerald-500/10',
    accentBorder: 'border-emerald-500/30',
    accentBorderGlow: 'border-emerald-500/50 shadow-emerald-500/10',
    accentRing: 'ring-emerald-400',
    activePillBg: 'bg-emerald-400 text-black font-bold shadow-lg shadow-emerald-400/20',
    activePillText: 'text-emerald-300',
    sparklineStroke: '#10b981',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    glowHex: '#10b981',
    cardHover: 'hover:border-emerald-500/40'
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum Stealth',
    dotColor: 'bg-slate-300',
    accentText: 'text-slate-200',
    accentBg: 'bg-slate-200',
    accentBgHover: 'hover:bg-white',
    accentBgSubtle: 'bg-slate-800/60',
    accentBorder: 'border-slate-600/40',
    accentBorderGlow: 'border-slate-500/50 shadow-slate-500/10',
    accentRing: 'ring-slate-300',
    activePillBg: 'bg-slate-200 text-black font-bold shadow-lg shadow-white/10',
    activePillText: 'text-slate-100',
    sparklineStroke: '#cbd5e1',
    badgeBg: 'bg-slate-800/80 text-slate-200 border-slate-700',
    glowHex: '#e2e8f0',
    cardHover: 'hover:border-slate-500/40'
  }
};
