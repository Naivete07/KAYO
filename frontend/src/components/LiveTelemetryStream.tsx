import React, { useState } from 'react';
import { Radio, Cpu, CreditCard, Play, Pause, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { EBPFEvent, TransactionEvent } from '../types';

interface LiveTelemetryStreamProps {
  ebpfEvents: EBPFEvent[];
  transactionEvents: TransactionEvent[];
  isStreaming: boolean;
  onToggleStreaming: () => void;
}

export const LiveTelemetryStream: React.FC<LiveTelemetryStreamProps> = ({
  ebpfEvents,
  transactionEvents,
  isStreaming,
  onToggleStreaming
}) => {
  const [filterMaliciousOnly, setFilterMaliciousOnly] = useState(false);

  const displayedEbpf = filterMaliciousOnly
    ? ebpfEvents.filter(e => e.is_injected || e.is_privilege_escalation || e.severity !== 'LOW')
    : ebpfEvents;

  const displayedTxns = filterMaliciousOnly
    ? transactionEvents.filter(t => !t.device_fingerprint_match || t.amount > 50000 || t.velocity_last_5min > 2)
    : transactionEvents;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800">
      {/* Stream Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className={`h-5 w-5 ${isStreaming ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Real-Time Cross-Domain Telemetry Stream
            </h2>
            <p className="text-xs text-slate-400">
              Correlating kernel-level eBPF probes with UPI & banking transaction webhooks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              checked={filterMaliciousOnly}
              onChange={(e) => setFilterMaliciousOnly(e.target.checked)}
              className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
            />
            <span>Filter Anomalies Only</span>
          </label>

          <button
            onClick={onToggleStreaming}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              isStreaming
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            {isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isStreaming ? 'Pause Ingestion' : 'Resume Stream'}
          </button>
        </div>
      </div>

      {/* Split Ingestion Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: eBPF System/Kernel Telemetry */}
        <div className="bg-[#050811] rounded-xl p-4 border border-slate-800/90 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Cpu className="h-4 w-4" />
              eBPF Kernel Probes (Linux Syscalls & Sockets)
            </span>
            <span className="font-mono text-slate-500">{displayedEbpf.length} events logged</span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1 font-mono text-[11px]">
            {displayedEbpf.length === 0 ? (
              <div className="text-center py-20 text-slate-600">No eBPF events recorded yet.</div>
            ) : (
              displayedEbpf.map((ev) => {
                const isThreat = ev.is_injected || ev.is_privilege_escalation;

                return (
                  <div
                    key={ev.id}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isThreat
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${isThreat ? 'text-rose-400' : 'text-cyan-300'}`}>
                        {ev.process_name} <span className="text-slate-500">[PID: {ev.pid}]</span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 mb-1">
                      Syscall: <span className="text-amber-300">{ev.syscall}</span>
                      {ev.socket_dst && (
                        <span> → Socket: <span className="text-indigo-300">{ev.socket_dst}:{ev.socket_port}</span></span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-300 flex items-center gap-2">
                      {isThreat && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                          [ANOMALY HOOK]
                        </span>
                      )}
                      <span className="line-clamp-1">{ev.details}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: UPI & Financial Transactions */}
        <div className="bg-[#050811] rounded-xl p-4 border border-slate-800/90 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              UPI & Banking Transactions (NPCI / API Webhooks)
            </span>
            <span className="font-mono text-slate-500">{displayedTxns.length} events logged</span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1 font-mono text-[11px]">
            {displayedTxns.length === 0 ? (
              <div className="text-center py-20 text-slate-600">No payment events recorded yet.</div>
            ) : (
              displayedTxns.map((txn) => {
                const isHighRisk = !txn.device_fingerprint_match || txn.amount > 50000;

                return (
                  <div
                    key={txn.id}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isHighRisk
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white font-sans">
                        {txn.user_name} <span className="text-[10px] text-slate-400 font-mono">({txn.channel})</span>
                      </span>
                      <span className={`font-bold font-mono text-xs ${isHighRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                        ₹{txn.amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
                      <span>To: <span className="text-cyan-300">{txn.receiver_upi || txn.receiver_account}</span></span>
                      <span>City: {txn.location}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>IP: {txn.ip_address}</span>
                      <span className="flex items-center gap-1">
                        {txn.device_fingerprint_match ? (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <ShieldCheck className="h-3 w-3" /> Fingerprint OK
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-0.5">
                            <AlertTriangle className="h-3 w-3" /> Spoofed Device
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
