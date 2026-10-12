import React from 'react';
import { 
  ShieldAlert, 
  Network, 
  Radio, 
  Gamepad2, 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import { THEMES, type SovereignTheme } from '../types/theme';

interface NavItem {
  id: string;
  label: string;
  sub: string;
  icon: any;
  isLive?: boolean;
  count?: number;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeThreatCount: number;
  theme: SovereignTheme;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeThreatCount,
  theme
}) => {
  const currentTheme = THEMES[theme] || THEMES.gold;

  const navSections: Array<{ heading: string; items: NavItem[] }> = [
    {
      heading: 'LIVE DEMO & TESTING',
      items: [
        { 
          id: 'simulator', 
          label: 'Scam Simulator', 
          sub: 'Test live attacks & defenses', 
          icon: Gamepad2, 
          isLive: true 
        }
      ]
    },
    {
      heading: 'SECURITY OPERATIONS',
      items: [
        { 
          id: 'incidents', 
          label: 'Incident Review', 
          sub: 'Active threats & approvals', 
          icon: ShieldAlert, 
          count: activeThreatCount 
        },
        { 
          id: 'graph', 
          label: 'Threat Visualizer', 
          sub: 'Mule accounts & app links', 
          icon: Network 
        },
        { 
          id: 'telemetry', 
          label: 'Live Activity Feed', 
          sub: 'Real-time device & UPI stream', 
          icon: Radio 
        }
      ]
    },
    {
      heading: 'REPORTS & BENCHMARKS',
      items: [
        { 
          id: 'audit', 
          label: 'Audit History', 
          sub: 'Verified defense actions', 
          icon: FileText 
        },
        { 
          id: 'analytics', 
          label: 'Model Accuracy', 
          sub: 'Detection speed & ML stats', 
          icon: BarChart3 
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#050811]/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none min-h-screen z-30">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-4 px-5 border-b border-slate-800/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shadow-lg text-black transition-all ${currentTheme.accentBg}`}>
              <ShieldCheck className="h-5 w-5 fill-black/20 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-black tracking-wider text-white flex items-center gap-1.5">
                KAYO
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase transition-all ${currentTheme.badgeBg}`}>
                  AI SHIELD
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Digital Scam Defense</p>
            </div>
          </div>
        </div>

        {/* Live Protection Status Pill */}
        <div className="mx-3 my-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Protection Status
            </span>
            <span className="text-emerald-400 font-bold text-[10px]">ALL SAFE</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5 border-t border-slate-800/60">
            <span>UPI Rails Protected</span>
            <span className={`font-mono font-bold ${currentTheme.accentText}`}>₹0 Fraud Loss</span>
          </div>
        </div>

        {/* Categorized Navigation Items */}
        <nav className="p-3 space-y-4">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                {sec.heading}
              </div>

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all group ${
                      isActive
                        ? `${currentTheme.accentBgSubtle} ${currentTheme.accentText} ${currentTheme.accentBorder} border shadow-sm font-bold`
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? currentTheme.accentText : 'text-slate-400 group-hover:text-slate-200'
                      }`} />
                      <div className="truncate">
                        <div className="text-xs font-semibold leading-tight truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate">{item.sub}</div>
                      </div>
                    </div>

                    {item.isLive && isActive ? (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded transition-all ${currentTheme.accentBg} text-black shrink-0`}>
                        ACTIVE
                      </span>
                    ) : item.count && item.count > 0 ? (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                        {item.count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Human-Friendly Security Footer */}
      <div className="p-3.5 border-t border-slate-800/70 text-[11px] space-y-1.5 bg-[#060913]/90">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className={`h-3 w-3 ${currentTheme.accentText}`} />
            <span>AI Model v4.2</span>
          </span>
          <span className="text-emerald-400 font-semibold text-[10px]">
            99.4% Accuracy
          </span>
        </div>
        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/40">
          Kernel Monitor & UPI Shield Active
        </div>
      </div>
    </aside>
  );
};

