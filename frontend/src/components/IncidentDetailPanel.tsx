import React from 'react';
import type { ThreatIncident } from '../types';
import { ShieldAlert, ShieldCheck, ArrowRight, Zap, Clock } from 'lucide-react';

interface IncidentDetailPanelProps {
  incidents: ThreatIncident[];
  selectedIncident: ThreatIncident | null;
  onSelectIncident: (inc: ThreatIncident) => void;
  onOpenActionModal: (actionType: string, actionLabel: string) => void;
}

export const IncidentDetailPanel: React.FC<IncidentDetailPanelProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onOpenActionModal
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Incidents Queue / Left Sidebar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col h-full">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Incident Queue</h2>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold">
            {incidents.filter(i => i.status === 'NEW').length} NEW
          </span>
        </div>

        {/* Scrollable incident list */}
        <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
          {incidents.map((incident) => {
            const isSelected = selectedIncident?.id === incident.id;
            const isContained = incident.status === 'CONTAINED';
            const isCritical = incident.threat_level === 'CRITICAL';

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 shadow-md shadow-cyan-500/10'
                    : isContained
                    ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700 opacity-70'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">{incident.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isContained
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCritical
                      ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {incident.threat_level} ({incident.confidence_score}%)
                  </span>
                </div>

                <div className="text-xs font-bold text-white mb-1 line-clamp-1">
                  {incident.title}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-slate-300 font-mono">₹{incident.loss_amount_at_risk.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-cyan-400">{incident.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident Detail & Guided Action Center / Right 2 Cols */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800">
        {selectedIncident ? (
          <div className="space-y-6">
            {/* Header with Title & Status */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {selectedIncident.id}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedIncident.status === 'CONTAINED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                  }`}>
                    STATUS: {selectedIncident.status}
                  </span>
                </div>
                <h2 className="text-lg font-black text-white">{selectedIncident.title}</h2>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>Category: <span className="text-cyan-300 font-semibold">{selectedIncident.category}</span></span>
                  <span>•</span>
                  <span>Detected: <span className="font-mono text-slate-300">{new Date(selectedIncident.detected_at).toLocaleTimeString()}</span></span>
                </div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-right">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Loss at Risk</div>
                <div className="text-xl font-mono font-black text-rose-400">
                  ₹{selectedIncident.loss_amount_at_risk.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Incident Entity Target Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#050811] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">CUSTOMER ACCOUNT</span>
                <span className="text-xs font-bold text-slate-200 block truncate mt-0.5">{selectedIncident.affected_user}</span>
              </div>
              <div className="bg-[#050811] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">BANKING / UPI ID</span>
                <span className="text-xs font-bold text-cyan-300 block truncate mt-0.5">{selectedIncident.affected_account}</span>
              </div>
              <div className="bg-[#050811] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">FLAGGED ORIGIN IP</span>
                <span className="text-xs font-mono font-bold text-amber-300 block truncate mt-0.5">{selectedIncident.affected_ip}</span>
              </div>
              <div className="bg-[#050811] p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">SUSPICIOUS APP / PROCESS</span>
                <span className="text-xs font-mono font-bold text-rose-300 block truncate mt-0.5">{selectedIncident.affected_process || 'N/A'}</span>
              </div>
            </div>

            {/* Why Suspicious (AI Explainability) */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-cyan-400" />
                What the AI Detected (Why Flagged)
              </h3>
              <div className="space-y-1.5">
                {selectedIncident.why_suspicious.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-rose-400 font-bold mt-0.5">▸</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictive Threat Progression Path */}
            <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent p-4 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Clock className="h-4 w-4" />
                What the Scammer Would Do Next (Predicted Path)
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {selectedIncident.predicted_next_step}
              </p>
            </div>

            {/* Guided Response Actions (Human-in-the-Loop) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Recommended Actions (1-Click Operator Approval)
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Immutable Audit Log</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedIncident.recommended_actions.map((action, idx) => {
                  const isContainment = action.type.includes('ISOLATE') || action.type.includes('FREEZE') || action.type.includes('BLOCK');

                  return (
                    <button
                      key={idx}
                      onClick={() => onOpenActionModal(action.type, action.label)}
                      disabled={selectedIncident.status === 'CONTAINED'}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between group ${
                        selectedIncident.status === 'CONTAINED'
                          ? 'bg-slate-900/30 border-slate-800 opacity-50 cursor-not-allowed'
                          : isContainment
                          ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 hover:border-rose-500'
                          : 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {action.label}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Impact: <span className="text-slate-300 font-medium">{action.impact}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all shrink-0 mt-0.5 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 text-slate-500">
            Select an incident from the queue to view full forensic telemetry and guided remediation.
          </div>
        )}
      </div>
    </div>
  );
};
