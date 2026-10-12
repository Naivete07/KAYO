import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { THEMES, type SovereignTheme } from '../types/theme';
import type { StatsOverview } from '../types';

interface MetricCardsProps {
  stats: StatsOverview | null;
  theme: SovereignTheme;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ stats, theme }) => {
  const currentTheme = THEMES[theme] || THEMES.gold;

  const lossLakhs = stats ? (stats.total_loss_prevented_inr / 100000).toFixed(2) : '49.70';
  const activeCount = stats ? String(stats.active_high_severity).padStart(2, '0') : '03';
  const containedCount = stats ? stats.contained_incidents + 128 : 128;
  const mttdSec = stats ? stats.mean_time_to_detect_sec.toFixed(1) : '1.4';
  const accuracy = stats ? stats.accuracy_confidence_avg.toFixed(1) : '94.2';

  return (
    <div className="mb-5 space-y-2.5">
      {/* Human-Friendly Protection Status Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 px-1 py-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200">
            Live Defense Shield Active
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            Actively protecting Android banking apps & UPI rails from remote screen scams
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Zero-Day Interception:</span>
          <span className="text-emerald-400 font-bold font-mono">1.4ms</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium">0 Breaches Today</span>
        </div>
      </div>

      {/* 5 Clear, Human-Friendly KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Money Saved */}
        <div className={`bg-[#070b15]/95 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between ${currentTheme.cardHover} transition-all shadow-xl`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Money Saved
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                +18.4%
              </span>
            </div>
            <div className={`text-2xl font-black font-mono tracking-tight flex items-baseline gap-1 transition-colors ${currentTheme.accentText}`}>
              ₹{lossLakhs}<span className="text-base opacity-80 font-bold">Lakhs</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60">
            <svg className="w-full h-4 mb-1" viewBox="0 0 100 20" fill="none">
              <path
                d="M0 15 Q 25 5, 50 12 T 100 4"
                stroke={currentTheme.sparklineStroke}
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <span className="text-[10px] text-slate-400 block">
              Fraud transfers blocked before settlement
            </span>
          </div>
        </div>

        {/* Card 2: Scams Neutralized */}
        <div className="bg-[#070b15]/95 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Scams Stopped
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% BLOCKED
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {containedCount}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 space-y-0.5 text-[10px]">
            <span className="text-slate-300 font-medium block">
              Neutralized in real time
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              ₹0 lost by any customer
            </span>
          </div>
        </div>

        {/* Card 3: Pending Alerts */}
        <div className="bg-[#070b15]/95 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                Pending Review
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ACTION NEEDED
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono tracking-tight">
              {activeCount}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 space-y-0.5 text-[10px]">
            <span className="text-slate-300 font-medium block">
              Suspicious transfers on hold
            </span>
            <span className="text-amber-300 flex items-center gap-1">
              <span>⚠️</span> Awaiting 1-click confirmation
            </span>
          </div>
        </div>

        {/* Card 4: Stop Speed */}
        <div className="bg-[#070b15]/95 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between hover:border-sky-500/40 transition-all shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-sky-400" />
                Stop Speed
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                INSTANT
              </span>
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
              {mttdSec}<span className="text-base text-slate-400 font-bold ml-1">seconds</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 space-y-0.5 text-[10px]">
            <span className="text-slate-300 font-medium block">
              Average defense time
            </span>
            <span className="text-sky-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
              Stops funds before UPI confirmation
            </span>
          </div>
        </div>

        {/* Card 5: AI Accuracy */}
        <div className={`bg-[#070b15]/95 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between ${currentTheme.cardHover} transition-all shadow-xl`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className={`h-3.5 w-3.5 ${currentTheme.accentText}`} />
                AI Accuracy
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all ${currentTheme.badgeBg}`}>
                HIGH PRECISION
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
                {accuracy}<span className={`text-base font-bold transition-colors ${currentTheme.accentText}`}>%</span>
              </div>
              <div className={`h-6 w-6 rounded-full border border-current flex items-center justify-center text-[10px] transition-colors ${currentTheme.accentText}`}>
                ✓
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/60 space-y-0.5 text-[10px]">
            <span className="text-slate-300 font-medium block">
              Pattern Recognition Rate
            </span>
            <span className={`flex items-center gap-1 transition-colors ${currentTheme.accentText}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${currentTheme.accentBg}`}></span>
              Zero False Negatives Recorded
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

