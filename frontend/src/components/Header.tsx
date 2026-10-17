import React from 'react';
import { 
  Shield, 
  Gamepad2, 
  Network, 
  Radio, 
  FileText, 
  ShieldCheck, 
  Settings, 
  User 
} from 'lucide-react';
import { THEMES, type SovereignTheme } from '../types/theme';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: SovereignTheme;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme
}) => {
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
    settings: {
      title: 'Settings, AI Models & Operator Account',
      subtitle: 'Manage theme appearance, ML model accuracy benchmarks, operator credentials, and defense thresholds',
      icon: Settings
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

        {/* Right Status & Account Access */}
        <div className="flex items-center gap-3.5">
          {/* Zero Loss Pill */}
          <div className="hidden sm:flex items-center gap-2 text-xs bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-bold tracking-tight">₹0 Customer Loss</span>
            <span className="text-emerald-500/60">•</span>
            <span className="text-slate-400 text-[11px]">Protected</span>
          </div>

          {/* Account & Settings Direct Button */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? `${currentTheme.accentBgSubtle} ${currentTheme.accentText} ${currentTheme.accentBorder} shadow-sm font-bold`
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Open Settings & Operator Account"
          >
            <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center text-black text-[10px] font-bold ${currentTheme.accentBg}`}>
              <User className="h-3 w-3" />
            </div>
            <span>Account & Settings</span>
            <Settings className={`h-3.5 w-3.5 transition-colors ${activeTab === 'settings' ? currentTheme.accentText : 'text-slate-400'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
