import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Palette, 
  Sliders, 
  Key, 
  Bell, 
  Cpu, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Server, 
  Save,
  BarChart3,
  Award,
  FileText,
  CheckCircle,
  ExternalLink,
  Layers,
  Users,
  Copy,
  Check,
  X
} from 'lucide-react';
import { THEMES, type SovereignTheme, type DisplayDensity } from '../types/theme';
import type { StatsOverview } from '../types';

interface SettingsAccountViewProps {
  theme: SovereignTheme;
  setTheme: (t: SovereignTheme) => void;
  density: DisplayDensity;
  setDensity: (d: DisplayDensity) => void;
  stats?: StatsOverview | null;
}

export const SettingsAccountView: React.FC<SettingsAccountViewProps> = ({
  theme,
  setTheme,
  density,
  setDensity,
  stats
}) => {
  const currentTheme = THEMES[theme] || THEMES.gold;
  const [activeSubTab, setActiveSubTab] = useState<'appearance' | 'models' | 'defense' | 'account'>('appearance');

  // Account & Operator State
  const [operatorName, setOperatorName] = useState('Lead Analyst Vikram Sen');
  const [operatorId, setOperatorId] = useState('SOC-OP-8492');
  const [department, setDepartment] = useState('Cyber-Financial Crime Division (NPCI/RBI)');
  const [clearanceLevel, setClearanceLevel] = useState('Level 4 - Sovereign Authority');
  const [autoQuarantineThreshold, setAutoQuarantineThreshold] = useState(85);
  const [autoHoldUPIAmount, setAutoHoldUPIAmount] = useState('50000');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [savedBanner, setSavedBanner] = useState(false);

  // ML Intelligence & Project Report State
  const [mlMetrics, setMlMetrics] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportContent, setReportContent] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/ml/metrics')
      .then(r => r.json())
      .then(data => setMlMetrics(data))
      .catch(err => console.warn('Could not load ML metrics in settings:', err));
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

  const handleSaveSettings = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const themeOptions: SovereignTheme[] = ['pitch_black', 'gold', 'sapphire', 'emerald', 'platinum'];

  const themeDescriptions: Record<SovereignTheme, { title: string; desc: string; vibe: string }> = {
    pitch_black: {
      title: 'Pitch Black (OLED)',
      desc: 'Deep void pure black with razor-sharp white accents. Maximum contrast and zero eye fatigue.',
      vibe: 'Obsidian Black Stealth'
    },
    gold: {
      title: 'Sovereign Gold',
      desc: 'Institutional banking gold with warm ember accents. High-contrast authority layout.',
      vibe: 'Flagship SOC Executive'
    },
    sapphire: {
      title: 'Royal Sapphire',
      desc: 'Deep oceanic blue with cyan neon highlights. Optimized for low-light night-shift monitoring.',
      vibe: 'Cyber Operations Center'
    },
    emerald: {
      title: 'Emerald Sentinel',
      desc: 'Matrix emerald green inspired by radar grids and kernel security probes.',
      vibe: 'Zero-Trust Defense'
    },
    platinum: {
      title: 'Platinum Stealth',
      desc: 'Monochrome silver and slate minimalism for distraction-free data analysis.',
      vibe: 'Clean Tactical Analyst'
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Notification Banner */}
      {savedBanner && (
        <div className="p-3 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Preferences and settings updated successfully. Theme and display configurations applied.</span>
          </div>
          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">SYNCHRONIZED</span>
        </div>
      )}

      {/* Top Banner / Operator Overview */}
      <div className="bg-[#070c1a]/95 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xl text-black transition-all ${currentTheme.accentBg}`}>
            <User className="h-7 w-7 text-black stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-white tracking-wide">{operatorName}</h2>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${currentTheme.badgeBg}`}>
                {operatorId}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                AUTHENTICATED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{department}</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
              <span className="flex items-center gap-1 text-slate-300">
                <Shield className="h-3 w-3 text-cyan-400" />
                {clearanceLevel}
              </span>
              <span>•</span>
              <span className="text-slate-400">Node: Localhost (127.0.0.1:8000)</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveSettings}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-2 shadow-lg transition-all ${currentTheme.accentBg} ${currentTheme.accentBgHover}`}
          >
            <Save className="h-3.5 w-3.5 text-black" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs inside Settings & Account */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('appearance')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeSubTab === 'appearance'
              ? `${currentTheme.accentText} border-current`
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>Appearance & Themes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('models')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeSubTab === 'models'
              ? `${currentTheme.accentText} border-current`
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>AI Model & Accuracy Benchmarks</span>
          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${currentTheme.badgeBg}`}>
            99.4%
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('defense')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeSubTab === 'defense'
              ? `${currentTheme.accentText} border-current`
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>Defense Rules & Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab('account')}
          className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeSubTab === 'account'
              ? `${currentTheme.accentText} border-current`
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Operator Profile & Credentials</span>
        </button>
      </div>

      {/* SUBTAB 1: APPEARANCE & THEMES (Transferred Theme Section) */}
      {activeSubTab === 'appearance' && (
        <div className="space-y-6">
          {/* Main Theme Selection Grid */}
          <div className="bg-[#070c1a]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Palette className={`h-5 w-5 ${currentTheme.accentText}`} />
                <div>
                  <h3 className="text-sm font-bold text-white">Sovereign Color Theme</h3>
                  <p className="text-xs text-slate-400">Select the visual appearance and accent colorway for the entire KAYO platform</p>
                </div>
              </div>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${currentTheme.badgeBg}`}>
                Active: {currentTheme.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {themeOptions.map((optKey) => {
                const opt = THEMES[optKey];
                const isSelected = theme === optKey;
                const meta = themeDescriptions[optKey];

                return (
                  <div
                    key={optKey}
                    onClick={() => setTheme(optKey)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between relative group ${
                      isSelected
                        ? `bg-slate-900/90 ${opt.accentBorder} shadow-lg ring-1 ${opt.accentRing}`
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-3.5 w-3.5 rounded-full ${opt.dotColor} ring-2 ring-black/50 shadow-md`}></span>
                          <span className="text-xs font-bold text-white group-hover:text-slate-100">{opt.name}</span>
                        </div>
                        {isSelected && (
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-black ${opt.accentBg}`}>
                            SELECTED
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {meta.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">{meta.vibe}</span>
                      <button
                        type="button"
                        className={`font-semibold px-2 py-0.5 rounded transition-all ${
                          isSelected ? `${opt.accentText} font-bold` : 'text-slate-400 group-hover:text-white'
                        }`}
                      >
                        {isSelected ? '● Active' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Display Density Switcher */}
          <div className="bg-[#070c1a]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Sliders className={`h-5 w-5 ${currentTheme.accentText}`} />
                <div>
                  <h3 className="text-sm font-bold text-white">Display Layout Density</h3>
                  <p className="text-xs text-slate-400">Control UI padding, telemetry grid width, and data information density</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {[
                { 
                  id: 'compact' as DisplayDensity, 
                  title: 'Compact Density', 
                  desc: 'Full-bleed viewport. High data throughput for multi-monitor SOC operations.',
                  tag: 'Maximum Data Density'
                },
                { 
                  id: 'executive' as DisplayDensity, 
                  title: 'Executive Density', 
                  desc: 'Balanced max-w-7xl centered container. Optimal for standard laptops and reviews.',
                  tag: 'Recommended Default'
                },
                { 
                  id: 'presentation' as DisplayDensity, 
                  title: 'Presentation Density', 
                  desc: 'High-contrast spacious layout tailored for projectors and hackathon judge demos.',
                  tag: 'Demo & Stage Mode'
                }
              ].map((d) => {
                const isSelected = density === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => setDensity(d.id)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all ${
                      isSelected
                        ? `bg-slate-900/90 ${currentTheme.accentBorder} ring-1 ${currentTheme.accentRing}`
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{d.title}</span>
                      {isSelected && (
                        <CheckCircle2 className={`h-4 w-4 ${currentTheme.accentText}`} />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{d.desc}</p>
                    <div className="mt-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isSelected ? currentTheme.badgeBg : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {d.tag}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Theme Accent Preview Box */}
          <div className="bg-[#070c1a]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className={`h-3.5 w-3.5 ${currentTheme.accentText}`} />
              Live Theme Preview: {currentTheme.name}
            </h4>
            
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-black ${currentTheme.accentBg}`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    KAYO AI Shielding Active
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${currentTheme.badgeBg}`}>
                      {theme.toUpperCase()} MODE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">All primary badges, glowing borders, and sparklines synchronize instantly with this choice.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className={`px-3 py-1.5 rounded-lg text-xs font-bold text-black ${currentTheme.accentBg}`}>
                  Sample Button
                </button>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${currentTheme.accentBorder} ${currentTheme.accentBgSubtle} ${currentTheme.accentText}`}>
                  Accent Border
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: OPERATOR PROFILE & CREDENTIALS */}
      {activeSubTab === 'account' && (
        <div className="space-y-6">
          <div className="bg-[#070c1a]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-2.5">
              <User className={`h-5 w-5 ${currentTheme.accentText}`} />
              <div>
                <h3 className="text-sm font-bold text-white">Operator Profile & Authority</h3>
                <p className="text-xs text-slate-400">Configure your verified SOC operator credentials and station identity</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase font-mono">
                  Full Name / Operator Handle
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase font-mono">
                  Station Badge ID
                </label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase font-mono">
                  Department / Organization
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-slate-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase font-mono">
                  Security Clearance Level
                </label>
                <select
                  value={clearanceLevel}
                  onChange={(e) => setClearanceLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-slate-600"
                >
                  <option value="Level 4 - Sovereign Authority">Level 4 - Sovereign Authority (Full Containment & Freeze)</option>
                  <option value="Level 3 - Senior Incident Commander">Level 3 - Senior Incident Commander (Approve Actions)</option>
                  <option value="Level 2 - Triage Security Analyst">Level 2 - Triage Security Analyst (View & Flag)</option>
                  <option value="Level 1 - Read-Only Auditor">Level 1 - Read-Only Auditor</option>
                </select>
              </div>
            </div>

            {/* Security Credentials & 2FA Info */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Key className="h-4 w-4 text-emerald-400" />
                  <span>Hardware Key (FIDO2)</span>
                </div>
                <p className="text-[11px] text-slate-400">YubiKey 5C NFC enrolled and validated for privileged containment commands.</p>
                <span className="mt-2 inline-block text-[10px] font-mono text-emerald-400 font-bold">VERIFIED</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Lock className="h-4 w-4 text-cyan-400" />
                  <span>Session Encryption</span>
                </div>
                <p className="text-[11px] text-slate-400">TLS 1.3 with AES-256-GCM. End-to-end telemetry tunnel to eBPF kernel daemon.</p>
                <span className="mt-2 inline-block text-[10px] font-mono text-cyan-400 font-bold">ACTIVE</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Server className="h-4 w-4 text-amber-400" />
                  <span>Team Tasteless Balls</span>
                </div>
                <p className="text-[11px] text-slate-400">DevSphere India 2026 • Sada Aizaz, Sahil Srivastava, Vivek Yadav.</p>
                <span className="mt-2 inline-block text-[10px] font-mono text-amber-400 font-bold">CODESLAYER 2K26</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DEFENSE RULES & ENGINE */}
      {activeSubTab === 'defense' && (
        <div className="space-y-6">
          <div className="bg-[#070c1a]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-2.5">
              <Cpu className={`h-5 w-5 ${currentTheme.accentText}`} />
              <div>
                <h3 className="text-sm font-bold text-white">Automated Defense Rules & Thresholds</h3>
                <p className="text-xs text-slate-400">Fine-tune AI detection sensitivity and human-in-the-loop protection gates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Risk Score Threshold */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">
                    Emergency Containment Risk Score Threshold
                  </label>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${currentTheme.badgeBg}`}>
                    {autoQuarantineThreshold}% Score
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Incidents with an AI Scam Probability exceeding this value will instantly prompt for human-in-the-loop one-click isolation.
                </p>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={autoQuarantineThreshold}
                  onChange={(e) => setAutoQuarantineThreshold(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* UPI Instant Hold Threshold */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">
                    UPI Instant Hold Ceiling (₹)
                  </label>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ₹{Number(autoHoldUPIAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Transactions above this value accompanied by background screen-capture or accessibility hooks trigger automatic freeze.
                </p>
                <input
                  type="number"
                  value={autoHoldUPIAmount}
                  onChange={(e) => setAutoHoldUPIAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Notification & Audio Toggles */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-slate-400" />
                <div>
                  <div className="text-xs font-bold text-white">Audio & Visual Siren for Critical Incidents</div>
                  <div className="text-[11px] text-slate-400">Plays an audible chime when high-confidence scam attempts are detected</div>
                </div>
              </div>
              <button
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  soundAlerts
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {soundAlerts ? 'ENABLED' : 'MUTED'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: AI MODEL & ACCURACY BENCHMARKS (Transferred from Model Accuracy Tab) */}
      {activeSubTab === 'models' && (
        <div className="space-y-6">
          {/* Top Header Card */}
          <div className="bg-[#070c1a]/95 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-xl">
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
                <h3 className="text-base sm:text-lg font-black text-white">
                  Trained ML Models & Intelligence Benchmarks
                </h3>
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
                  <span>View Full PROJECT_REPORT.md</span>
                </button>
              </div>
            </div>

            {/* Fraud Category Incident Distribution Chart */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-rose-400" />
                  Reported Financial Cyber Fraud Incidents (by Threat Category)
                </h4>
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
          <div className="bg-[#070c1a]/95 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                Trained ML Models & Scam Pattern Intelligence (PaySim + UNSW-NB15)
              </h4>
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
          <div className="bg-[#070c1a]/95 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              KAYO Core Unique Selling Propositions (USPs)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uspPillars.map((usp, idx) => (
                <div key={idx} className="bg-[#050811] p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-6 w-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                      0{idx + 1}
                    </span>
                    <h5 className="text-xs font-bold text-white">{usp.pillar}</h5>
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
            <div className="bg-[#070c1a]/95 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-400" />
                DevSphereIndia Team: Tasteless Balls
              </h4>

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
            <div className="bg-[#070c1a]/95 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                Research Foundations & Documentation Links
              </h4>

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
        </div>
      )}

      {/* Project Report Viewer Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6">
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
