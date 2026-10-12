import React, { useState } from 'react';
import { ChevronDown, Sliders, Shield, Gamepad2, Network, Radio, FileText, BarChart3, Palette, ShieldCheck } from 'lucide-react';
import { THEMES, type SovereignTheme } from '../types/theme';

interface HeaderProps {
  activeTab: string;
  theme: SovereignTheme;
  setTheme: (t: SovereignTheme) => void;
  showConfigBar: boolean;
  setShowConfigBar: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  theme,
  setTheme,
  showConfigBar,
  setShowConfigBar
}) => {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const currentTheme = THEMES[theme] || THEMES.gold;

  const viewTitles: Record<string, { title: string; subtitle: string; icon: any }> = {
    simulator: { 
      title: 'Scam Simulator & Attack Lab', 
      subtitle: 'Simulate real-world Android scams (Fake APKs, screen-sharing) and see how transfers get blocked', 
      icon: Gamepad2 
    },
    incidents: { 
      title: 'Incident Review Queue', 
      subtitle: 'Active scam alerts requiring operator verification and one-click containment', 
      icon: Shield 
    },
    graph: { 
      title: 'Threat Network Visualizer', 
      subtitle: 'Interactive map connecting suspicious apps, device IPs, and money mule bank accounts', 
      icon: Network 
    },
    telemetry: { 
      title: 'Live Security Activity Feed', 
      subtitle: 'Real-time concurrent stream of Android background events and UPI payment transactions', 
      icon: Radio 
    },
    audit: { 
      title: 'Security Audit History', 
      subtitle: 'Immutable, cryptographically verified ledger of all blocked transactions and actions', 
      icon: FileText 
    },
    analytics: { 
      title: 'Model Accuracy & ML Benchmarks', 
      subtitle: 'Detection speed benchmarks, trained AI model evaluation, and feature importances', 
      icon: BarChart3 
    }
  };

  const currentView = viewTitles[activeTab] || viewTitles.simulator;
  const ViewIcon = currentView.icon;

  return (
    <header className="border-b border-slate-800/80 bg-[#060a16]/90 backdrop-blur-xl sticky top-0 z-40 px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Context Header */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors ${currentTheme.accentText}`}>
            <ViewIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                {currentView.title}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {currentView.subtitle}
            </p>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-4">
          {/* Zero Loss Pill */}
          <div className="hidden sm:flex items-center gap-2 text-xs bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-bold tracking-tight">₹0 Customer Loss</span>
            <span className="text-emerald-500/60">•</span>
            <span className="text-slate-400 text-[11px]">Protected</span>
          </div>

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className={`px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all ${
                themeDropdownOpen ? currentTheme.accentBorder : ''
              }`}
            >
              <Palette className={`h-3.5 w-3.5 transition-colors ${currentTheme.accentText}`} />
              <span>{currentTheme.name}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#090e1d] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-1">
                <div className="px-2 py-1 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Color Theme
                </div>
                {(Object.keys(THEMES) as SovereignTheme[]).map((tKey) => {
                  const tObj = THEMES[tKey];
                  const isSelected = theme === tKey;

                  return (
                    <button
                      key={tKey}
                      onClick={() => {
                        setTheme(tKey);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                        isSelected
                          ? `${tObj.accentBgSubtle} ${tObj.accentText} font-bold`
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${tObj.dotColor}`}></span>
                        <span>{tObj.name}</span>
                      </div>
                      {isSelected && <span className={`text-[10px] ${tObj.accentText}`}>●</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Theme & Density Toolbar Toggle */}
          <button
            onClick={() => setShowConfigBar(!showConfigBar)}
            className={`p-2 rounded-xl border transition-all ${
              showConfigBar
                ? `${currentTheme.accentBgSubtle} ${currentTheme.accentText} ${currentTheme.accentBorder} shadow-sm`
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Display & Density Settings"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

