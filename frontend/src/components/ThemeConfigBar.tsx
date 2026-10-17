import React from 'react';
import { Sliders } from 'lucide-react';
import { THEMES, type SovereignTheme, type DisplayDensity } from '../types/theme';

interface ThemeConfigBarProps {
  theme: SovereignTheme;
  setTheme: (t: SovereignTheme) => void;
  density: DisplayDensity;
  setDensity: (d: DisplayDensity) => void;
}

export const ThemeConfigBar: React.FC<ThemeConfigBarProps> = ({
  theme,
  setTheme,
  density,
  setDensity
}) => {
  const currentTheme = THEMES[theme] || THEMES.gold;

  const themeOptions: SovereignTheme[] = ['pitch_black', 'gold', 'sapphire', 'emerald', 'platinum'];

  return (
    <div className="bg-[#070b16]/90 border border-slate-800/90 rounded-2xl p-3.5 px-5 mb-5 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
      {/* Title & Description */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors ${currentTheme.accentText}`}>
          <Sliders className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
            Theme & Display Settings
          </h3>
          <p className="text-[11px] text-slate-400">
            Customize color theme and view layout density to your preference
          </p>
        </div>
      </div>

      {/* Right Controls: Themes and Density */}
      <div className="flex flex-wrap items-center gap-3.5">
        {/* Theme Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
          {themeOptions.map((optKey) => {
            const opt = THEMES[optKey];
            const isSelected = theme === optKey;

            return (
              <button
                key={optKey}
                onClick={() => setTheme(optKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? `${opt.activePillBg}`
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${opt.dotColor} ${isSelected ? 'ring-2 ring-black/40' : ''}`}></span>
                <span>{opt.name}</span>
              </button>
            );
          })}
        </div>

        {/* Display Density Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-[11px]">
          {(['compact', 'executive', 'presentation'] as DisplayDensity[]).map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={`px-2.5 py-1 rounded-lg font-mono font-semibold capitalize transition-all ${
                density === d
                  ? `bg-slate-800 ${currentTheme.accentText} shadow-sm font-bold`
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {d}
            </button>
          ))}
          <span className="px-2 py-1 text-[10px] text-emerald-400 border-l border-slate-800/80 ml-1 font-medium">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};
