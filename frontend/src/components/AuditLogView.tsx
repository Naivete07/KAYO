import React from 'react';
import { Database, ShieldCheck, XCircle, UserCheck, FileText } from 'lucide-react';
import type { ActionAuditLog } from '../types';

interface AuditLogViewProps {
  logs: ActionAuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-400" />
            SOC Incident Response Audit Log & Governance Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographically verifiable record of all human analyst authorizations and automated containment policies
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          RBAC COMPLIANT
        </span>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            <FileText className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
            No containment actions recorded yet. Authorize actions from the Incident Queue to generate audit trail records.
          </div>
        ) : (
          logs.map((log) => {
            const isApproved = log.decision === 'APPROVED';

            return (
              <div
                key={log.id}
                className={`bg-[#050811] rounded-xl p-4 border transition-all ${
                  isApproved ? 'border-emerald-500/30' : 'border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400 font-bold">{log.id}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-bold text-cyan-300 font-mono">Incident: {log.incident_id}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-300 font-medium font-mono">{log.action_type}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {isApproved ? <ShieldCheck className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {log.decision}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Authorized by: <strong className="text-slate-200">{log.analyst}</strong></span>
                  </div>
                  <div className="text-slate-300 pt-1">
                    <span className="text-slate-500 font-semibold">Notes:</span> {log.notes}
                  </div>
                  <div className="text-[11px] text-emerald-400/90 pt-1 font-mono">
                    <span className="text-slate-500">Result:</span> {log.execution_result}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
