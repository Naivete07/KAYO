import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentId: string;
  actionType: string;
  actionLabel: string;
  onConfirm: (analystName: string, notes: string, approved: boolean) => Promise<void>;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  incidentId,
  actionType,
  actionLabel,
  onConfirm
}) => {
  const [analystName, setAnalystName] = useState('Sada Aizaz (Lead Analyst)');
  const [notes, setNotes] = useState('Confirmed eBPF injected process beaconing to C2 and high-value anomalous UPI transfer. Containment approved.');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAction = async (approved: boolean) => {
    setLoading(true);
    try {
      await onConfirm(analystName, notes, approved);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0b1324] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950/60 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Human Approval Authorization</h3>
              <p className="text-xs text-slate-400 font-mono">Incident Target: {incidentId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block font-mono">REQUESTED REMEDIATION ACTION</span>
            <div className="text-sm font-bold text-cyan-300 mt-1">{actionLabel}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">Type: {actionType}</div>
          </div>

          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 flex items-start gap-2.5 text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="text-[11px] leading-relaxed">
              <strong>Mandatory SOC Governance:</strong> Executing this containment policy directly dispatches firewall rules and locks banking session tokens. An immutable audit record will be logged.
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Authorizing Analyst / SOC Officer</label>
            <input
              type="text"
              value={analystName}
              onChange={(e) => setAnalystName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Justification & Forensics Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => handleAction(false)}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            Reject & Dismiss
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleAction(true)}
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/20 hover:brightness-110 flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              {loading ? 'Authorizing...' : 'Authorize & Execute'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
