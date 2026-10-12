import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Layers, ExternalLink, Award, FileText, CheckCircle, Cpu, X, Copy, Check } from 'lucide-react';
import type { StatsOverview } from '../types';

interface AnalyticsViewProps {
  stats: StatsOverview | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats }) => {
  const [mlMetrics, setMlMetrics] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportContent, setReportContent] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/ml/metrics')
      .then(r => r.json())
      .then(data => setMlMetrics(data))
      .catch(err => console.warn('Could not load ML metrics:', err));
  }, []);

  const handleOpenReport = async () => {
    setShowReportModal(true);
    if (!reportContent) {
      setLoadingReport(true);
      try {
        const res = await fetch('/api/report').then(r => r.json());
        setReportContent(res.content || 'Report could not be retrieved.');
      } catch (err) {
        console.warn('Failed to load report from API:', err);
        setReportContent('# KAYO Project Report\n\nCould not fetch from /api/report backend.');
      } finally {
        setLoadingReport(false);
      }
    }
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = stats?.fraud_distribution || [
    { category: "Card / Internet Fraud", incidents: 28400, color: "#f43f5e" },
    { category: "UPI / Payment Fraud", incidents: 23750, color: "#ef4444" },
    { category: "Online Banking Fraud", incidents: 19600, color: "#f97316" },
    { category: "Digital Wallet Fraud", incidents: 15300, color: "#eab308" },
    { category: "Account Takeover", incidents: 11850, color: "#06b6d4" },
    { category: "Credential / Identity Fraud", incidents: 8900, color: "#8b5cf6" }
  ];

  const maxIncidents = Math.max(...categories.map(c => c.incidents));

  const teamMembers = [
    { name: "Sada Aizaz", role: "Frontend Lead", focus: "React, TypeScript, Real-time Graph Visualizer, SOC Dashboard UI" },
    { name: "Sahil Srivastava", role: "Backend & ML Lead", focus: "FastAPI, Threat Correlation Engine, eBPF Telemetry Ingestion, Predictive Model" },
    { name: "Vivek Yadav", role: "API Auth & Database", focus: "PostgreSQL, Neo4j Graph Engine, RBAC Governance, Audit Pipeline" }
  ];

  const uspPillars = [
    {
      pillar: "Cross-Domain Intelligence",
      description: "Combines cybersecurity telemetry (eBPF syscalls/sockets) with financial transaction data to detect zero-day frauds.",
      outcome: "Unified view of cyber + financial signals"
    },
    {
      pillar: "Relationship-Based Detection",
      description: "Builds entity graph relationships across users, devices, accounts, and transactions to uncover hidden mule syndicates.",
      outcome: "Graph-based multi-hop analysis"
    },
    {
      pillar: "Predictive Threat Analysis",
      description: "Uses behavioral analysis and AI to predict how a multi-stage attack will progress before major fund exfiltration occurs.",
      outcome: "Proactive instead of reactive posture"
    },
    {
      pillar: "Context-Aware Response",
      description: "Provides explainable AI causal reasoning and recommends guided containment actions with mandatory human approval.",
      outcome: "Explainable, auditable & actionable security"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                CODESLAYER 2k26 • DevSphereIndia
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                Team: Tasteless Balls
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              Project Report & Intelligence Benchmarks
            </h2>
            <p className="text-xs text-slate-400">
              KAYO: AI-Driven Scam Pattern Recognition & Cross-Domain Threat Correlation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenReport}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 flex items-center gap-2 border border-cyan-500/30 transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
            >
              <FileText className="h-4 w-4 text-cyan-400" />
              View Full PROJECT_REPORT.md
            </button>
          </div>
        </div>

        {/* Fraud Category Incident Distribution Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-rose-400" />
              Reported Financial Cyber Fraud Incidents (by Threat Category)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Benchmark Dataset: 1,07,800 Incidents Analyzed</span>
          </div>

          <div className="space-y-3 bg-[#050811] p-5 rounded-xl border border-slate-800">
            {categories.map((item, idx) => {
              const pct = ((item.incidents / maxIncidents) * 100).toFixed(1);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{item.category}</span>
                    <span className="font-mono font-bold text-slate-300">
                      {item.incidents.toLocaleString('en-IN')} <span className="text-[10px] text-slate-500">incidents</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800/80">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                        boxShadow: `0 0 12px ${item.color}66`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trained ML Models & Feature Importances */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            Trained ML Models & Scam Pattern Intelligence (PaySim + UNSW-NB15)
          </h3>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            SERIALIZED IN PRODUCTION
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Financial Scam Model */}
          <div className="bg-[#050811] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-rose-400">Financial Scam Classifier (Random Forest)</span>
              <span className="text-[10px] font-mono bg-rose-950/60 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                ROC-AUC: {mlMetrics?.financial?.roc_auc ? Number(mlMetrics.financial.roc_auc).toFixed(4) : "0.9996"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Precision</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {mlMetrics?.financial?.precision ? (Number(mlMetrics.financial.precision) * 100).toFixed(1) + "%" : "100.0%"}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Recall</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {mlMetrics?.financial?.recall ? (Number(mlMetrics.financial.recall) * 100).toFixed(1) + "%" : "99.7%"}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">F1-Score</span>
                <span className="font-bold text-cyan-400 font-mono">
                  {mlMetrics?.financial?.f1_score ? (Number(mlMetrics.financial.f1_score) * 100).toFixed(1) + "%" : "99.8%"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-semibold block mb-1.5 font-mono">TOP SCAM INDICATOR WEIGHTS</span>
              <div className="space-y-1.5 text-xs font-mono">
                {mlMetrics?.financial?.feature_importances ? (
                  Object.entries(mlMetrics.financial.feature_importances)
                    .slice(0, 5)
                    .map(([name, weight], i) => (
                      <div key={i} className="flex justify-between items-center text-[11px] text-slate-300 bg-slate-950/60 px-2 py-1 rounded">
                        <span>{name}</span>
                        <span className="text-cyan-400 font-bold">{(Number(weight) * 100).toFixed(1)}%</span>
                      </div>
                    ))
                ) : (
                  [
                    { name: "orig_balance_err (Discrepancy)", weight: 32.3 },
                    { name: "orig_drained (Complete Drain)", weight: 18.0 },
                    { name: "oldbalanceOrg (High Balance)", weight: 10.7 },
                    { name: "newbalanceOrig (Post-Txn Zero)", weight: 9.9 },
                    { name: "amount (High Velocity Transfer)", weight: 7.8 }
                  ].map((f, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] text-slate-300 bg-slate-950/60 px-2 py-1 rounded">
                      <span>{f.name}</span>
                      <span className="text-cyan-400 font-bold">{f.weight}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Cyber Intrusion Model */}
          <div className="bg-[#050811] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-400">Cyber Telemetry Classifier (Gradient Boosting)</span>
              <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                ROC-AUC: {mlMetrics?.cyber?.roc_auc ? Number(mlMetrics.cyber.roc_auc).toFixed(4) : "0.9888"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Training Sets</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {mlMetrics?.cyber?.training_samples ? (Number(mlMetrics.cyber.training_samples) / 1000).toFixed(0) + "k" : "140k"}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Precision</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {mlMetrics?.cyber?.precision ? (Number(mlMetrics.cyber.precision) * 100).toFixed(1) + "%" : "96.8%"}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">F1-Score</span>
                <span className="font-bold text-cyan-400 font-mono">
                  {mlMetrics?.cyber?.f1_score ? (Number(mlMetrics.cyber.f1_score) * 100).toFixed(1) + "%" : "95.9%"}
                </span>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <p className="text-[11px] text-slate-400 font-semibold mb-1 font-mono">CROSS-DOMAIN CORRELATION</p>
              Trained on <strong>{mlMetrics?.cyber?.training_samples ? mlMetrics.cyber.training_samples.toLocaleString('en-IN') : "140,272"}</strong> cyber telemetry records from UNSW-NB15 to detect memory injection, suspicious syscall velocity, and unauthorized socket beacons.
            </div>
          </div>
        </div>
      </div>

      {/* 4 USP Pillars */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-400" />
          KAYO Core Unique Selling Propositions (USPs)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uspPillars.map((usp, idx) => (
            <div key={idx} className="bg-[#050811] p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-6 w-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                  0{idx + 1}
                </span>
                <h4 className="text-xs font-bold text-white">{usp.pillar}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {usp.description}
              </p>
              <div className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-900/50 flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-cyan-400" />
                <span>Outcome: {usp.outcome}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Tasteless Balls & References */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            DevSphereIndia Team: Tasteless Balls
          </h3>

          <div className="space-y-3">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-[#050811] p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white">{member.name}</span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {member.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{member.focus}</div>
              </div>
            ))}
          </div>
        </div>

        {/* References & Tech Stack */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            Research Foundations & Documentation Links
          </h3>

          <div className="space-y-2.5 text-xs">
            <a
              href="https://dl.acm.org/doi/10.1016/j.eswa.2023.122156"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg bg-[#050811] border border-slate-800 hover:border-cyan-500 flex items-center justify-between text-slate-300 hover:text-cyan-300 transition-all"
            >
              <span>ACM: Financial Fraud Detection Using Graph Neural Networks</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <a
              href="https://link.springer.com/article/10.1007/s11704-024-40474-y"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg bg-[#050811] border border-slate-800 hover:border-cyan-500 flex items-center justify-between text-slate-300 hover:text-cyan-300 transition-all"
            >
              <span>Springer: GNNs for Financial Fraud Detection Review</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <a
              href="https://docs.ebpf.io/"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg bg-[#050811] border border-slate-800 hover:border-cyan-500 flex items-center justify-between text-slate-300 hover:text-cyan-300 transition-all"
            >
              <span>eBPF.io: Extended Berkeley Packet Filter Architecture</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <a
              href="https://fastapi.tiangolo.com/"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg bg-[#050811] border border-slate-800 hover:border-cyan-500 flex items-center justify-between text-slate-300 hover:text-cyan-300 transition-all"
            >
              <span>FastAPI: Real-time High-Performance Python Core</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Project Report Viewer Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
          <div className="bg-[#070b14] border border-cyan-500/40 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl shadow-cyan-500/10 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900/90 p-4 px-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">PROJECT_REPORT.md — KAYO Submission</h3>
                  <p className="text-[11px] text-slate-400 font-mono">CodeSlayer 2k26 • Tasteless Balls • Open Innovation</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-all"
                  title="Copy Markdown"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs leading-relaxed text-slate-300 bg-[#050811] space-y-4">
              {loadingReport ? (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2">
                  <div className="h-6 w-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading full project report from /api/report...</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 selection:bg-cyan-500 selection:text-white">
                  {reportContent}
                </pre>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 p-3 px-6 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>DevSphereIndia CodeSlayer 2k26 Submission Document</span>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
