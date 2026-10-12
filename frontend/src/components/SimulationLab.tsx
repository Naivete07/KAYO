import React, { useState } from 'react';
import { 
  Play, 
  Zap, 
  Smartphone, 
  CheckCircle2, 
  Lock
} from 'lucide-react';
import { THEMES, type SovereignTheme } from '../types/theme';

interface SimulationLabProps {
  onTriggerAttack: (scenario: string) => Promise<any>;
  theme: SovereignTheme;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({ onTriggerAttack, theme }) => {
  const currentTheme = THEMES[theme] || THEMES.gold;
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [logViewMode, setLogViewMode] = useState<'human' | 'kernel'>('human');
  const [lastSimulatedNotice, setLastSimulatedNotice] = useState<string | null>(null);

  // Human-friendly activity events
  const [humanEvents, setHumanEvents] = useState<Array<{
    time: string;
    type: 'DETECT' | 'AI_FLAG' | 'BLOCK' | 'SAVED';
    title: string;
    desc: string;
    badge: string;
    badgeColor: string;
  }>>([
    {
      time: '14:02:18',
      type: 'DETECT',
      title: 'Suspicious Screen-Sharing Activity Detected',
      desc: 'Background APK (Fake Electricity Bill app) attempted hidden screen recording during UPI PIN entry.',
      badge: 'APP MONITOR',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      time: '14:02:18',
      type: 'AI_FLAG',
      title: 'AI Correlation: High-Risk Scam Pattern',
      desc: 'Machine Learning model flagged anomalous Tor IP and new payee destination with 96.8% scam probability.',
      badge: 'AI ENGINE',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      time: '14:02:18',
      type: 'BLOCK',
      title: 'UPI Transfer Automatically Frozen',
      desc: 'Unauthorized ₹1,48,500 transfer to mule account (mule.902@axis) halted before funds left victim account.',
      badge: 'PAYMENT HELD',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      time: '14:02:19',
      type: 'SAVED',
      title: '₹1,48,500 Saved • Zero Customer Loss',
      desc: 'Protection action logged. Incident queued in Incident Review for security analyst confirmation.',
      badge: 'PROTECTED',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    }
  ]);

  // Technical kernel logs
  const [kernelLogs, setKernelLogs] = useState<Array<{ time: string; tag: string; text: string; color: string }>>([
    { time: '14:02:18.012', tag: '[BPF_MAP]', text: 'kprobe__sys_enter_ptrace loaded into ringbuffer map_id=4020', color: 'text-emerald-400' },
    { time: '14:02:18.118', tag: '[SANDBOX]', text: 'Initiating mock PID 4092 <svchost.exe> in isolated cgroup sandbox_cgroup_88', color: 'text-sky-300' },
    { time: '14:02:18.341', tag: '[INJECT]', text: 'Payload hook verified. DLL hash: a8c71bf4...2a09', color: 'text-amber-400' },
    { time: '14:02:18.490', tag: '[SEV-1 ALERT]', text: 'Unauthorized memory scan detected targeting VPA session tokens: 0x7FFF004B', color: 'text-rose-400' },
    { time: '14:02:18.502', tag: '[NEURAL_AI]', text: 'Confidence 96.8% - signature matches FIN7_RAT_VARIANT_C', color: 'text-amber-300' },
    { time: '14:02:18.520', tag: '[RULE_EXEC]', text: 'UPI transaction hold dispatched. Token invalidated. Destination: mule.902@axis', color: 'text-emerald-300' },
    { time: '14:02:18.524', tag: '[ZERO_EXPOSURE]', text: 'Prevented capital loss: ₹1,48,500.00 in 1.4 seconds.', color: 'text-emerald-400' },
    { time: '14:02:19.001', tag: '[TELEMETRY]', text: 'NPCI rail verification handshake latency: 3.2ms', color: 'text-slate-400' }
  ]);

  const scenarios = [
    {
      id: "INFOSTEALER_UPI",
      title: "Fake Utility Bill APK (Screen-Sharing PIN Theft)",
      scamType: "Fake Android APK / Screen Recording",
      riskBadge: "CRITICAL RISK",
      riskColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      amountSaved: "₹1,48,500",
      story: "A victim receives a WhatsApp message claiming their electricity bill is unpaid and installs a fake APK. The malware silently captures the screen while the victim enters their UPI PIN to steal ₹1,48,500.",
      howKayoStopsIt: "KAYO detects background screen recording permissions, cross-references with a new high-value UPI payee, and freezes the transfer in 1.4 seconds before money leaves the victim's account.",
      steps: [
        { num: "1", title: "Malicious APK Opened", desc: "Fake app asks for screen record access" },
        { num: "2", title: "UPI PIN Screen Captured", desc: "Attempts to exfiltrate secret PIN" },
        { num: "3", title: "₹1,48,500 Transfer Attempted", desc: "Destination: untrusted mule VPA" },
        { num: "4", title: "KAYO Freezes Payment", desc: "100% money saved • 0 customer loss" }
      ]
    },
    {
      id: "MULE_RING",
      title: "Coordinated Money Mule Syndicate (Rapid Laundering)",
      scamType: "Fast Money Laundering Chain",
      riskBadge: "HIGH RISK",
      riskColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      amountSaved: "₹75,000",
      story: "Fraudsters compromise banking credentials and rapidly bounce ₹75,000 across 4 different mule bank accounts in under 90 seconds to evade traditional bank velocity limits.",
      howKayoStopsIt: "Graph AI correlates rapid cyclic transaction hops across newly created accounts in real time and immediately freezes the receiving mule accounts.",
      steps: [
        { num: "1", title: "Flagged Device Used", desc: "Known fraudulent device fingerprint" },
        { num: "2", title: "14 Rapid UPI Transactions", desc: "High-velocity micro transfers burst" },
        { num: "3", title: "Mule Ring Mapped", desc: "Graph AI detects cyclic laundering" },
        { num: "4", title: "Mule Accounts Frozen", desc: "Laundering chain severed instantly" }
      ]
    },
    {
      id: "SIM_SWAP_ATO",
      title: "Fake Bank Customer Care (Phone Takeover & OTP Hijack)",
      scamType: "Social Engineering & Accessibility Exploit",
      riskBadge: "CRITICAL RISK",
      riskColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      amountSaved: "₹2,24,000",
      story: "A fraudster posing as bank customer service tricks a customer into enabling Android accessibility permissions, then attempts to auto-approve high-value payment OTPs remotely.",
      howKayoStopsIt: "KAYO identifies automated ghost touch events targeting OTP fields on the banking app and terminates the remote control session immediately.",
      steps: [
        { num: "1", title: "Impersonation Call", desc: "Tricked into remote access grant" },
        { num: "2", title: "Accessibility Hijack", desc: "Malware simulates automated touches" },
        { num: "3", title: "Auto-Approve OTP Attempt", desc: "Tries to approve ₹2,24,000 transfer" },
        { num: "4", title: "Remote Session Severed", desc: "Device secured • Account safe" }
      ]
    }
  ];

  const handleRun = async (sc: typeof scenarios[0]) => {
    setLoadingScenario(sc.id);
    const nowTime = new Date().toTimeString().split(' ')[0];

    // Add immediate human event
    setHumanEvents(prev => [
      {
        time: nowTime,
        type: 'DETECT',
        title: `Simulating Attack: ${sc.title}`,
        desc: sc.story,
        badge: 'SIMULATION TRIGGERED',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30'
      },
      ...prev
    ]);

    // Add immediate kernel log
    setKernelLogs(prev => [
      { time: nowTime, tag: '[EMULATE]', text: `Injecting sandbox scenario ${sc.id}`, color: 'text-amber-400' },
      ...prev
    ]);

    try {
      await onTriggerAttack(sc.id);
      
      const afterTime = new Date().toTimeString().split(' ')[0];
      setHumanEvents(prev => [
        {
          time: afterTime,
          type: 'SAVED',
          title: `Threat Neutralized: ${sc.amountSaved} Protected!`,
          desc: `${sc.howKayoStopsIt} Dispatched to Incident Review Queue for operator confirmation.`,
          badge: 'DEFENSE SUCCESS',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        },
        ...prev
      ]);

      setKernelLogs(prev => [
        { time: afterTime, tag: '[AI_CORRELATE]', text: `Syscall correlation complete: ${sc.id} intercepted in 1.4s. Zero loss.`, color: 'text-emerald-400' },
        ...prev
      ]);

      setLastSimulatedNotice(`✅ ${sc.title} simulated & successfully blocked! Money saved: ${sc.amountSaved}. View incident in the Incident Review tab.`);
    } catch (err) {
      setLastSimulatedNotice(`⚠️ Simulation error: ${String(err)}`);
    } finally {
      setLoadingScenario(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 3-Step Human-Friendly Walkthrough Banner */}
      <div className="bg-gradient-to-r from-[#070e24] via-[#08122c] to-[#060a17] border border-slate-800/90 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentTheme.badgeBg}`}>
              HOW KAYO PROTECTS YOU
            </span>
            <span className="text-xs text-slate-400 font-medium">
              3-Step Real-Time Scam Neutralization
            </span>
          </div>

          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Zero Customer Financial Loss Guarantee</span>
          </div>
        </div>

        {/* 3 Visual Milestone Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Step 1 */}
          <div className="bg-[#050814]/80 p-3.5 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 ${currentTheme.accentText}`}>
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>1. Catches Sneaky Apps</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Detects fake APKs, unauthorized screen-sharing (AnyDesk/TeamViewer), and SMS OTP interception on the phone.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#050814]/80 p-3.5 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 ${currentTheme.accentText}`}>
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>2. AI Matches Scam Pattern</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Correlates the device activity with recipient bank account and mule network history in &lt;1.5 seconds.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#050814]/80 p-3.5 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 ${currentTheme.accentText}`}>
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>3. Freezes Stolen Funds</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Halts the fraudulent UPI transfer before money ever leaves the account, saving 100% of the funds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Bar If Just Simulated */}
      {lastSimulatedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{lastSimulatedNotice}</span>
          </div>
          <button 
            onClick={() => setLastSimulatedNotice(null)}
            className="text-[11px] text-emerald-400 hover:text-white underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-World Scam Scenarios */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🎯</span> Choose a Real-World Scam to Test
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click "Run Simulation" to see how KAYO detects each attack and automatically protects customer money.
              </p>
            </div>
          </div>

          {/* Scenario Cards */}
          {scenarios.map((sc) => (
            <div
              key={sc.id}
              className="bg-[#070b15]/95 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-3.5 shadow-xl"
            >
              {/* Header: Title, Tags & Run Button */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sc.riskColor}`}>
                      {sc.riskBadge}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {sc.scamType}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white">{sc.title}</h4>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Protected Amount</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{sc.amountSaved}</span>
                  </div>

                  <button
                    onClick={() => handleRun(sc)}
                    disabled={loadingScenario !== null}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                  >
                    <Play className={`h-3 w-3 ${loadingScenario === sc.id ? 'animate-spin' : 'fill-white'}`} />
                    <span>{loadingScenario === sc.id ? 'TESTING...' : 'RUN SIMULATION'}</span>
                  </button>
                </div>
              </div>

              {/* The Real-World Story & Protection Description */}
              <div className="bg-[#050811] p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">
                    📖 The Scam Story:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {sc.story}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-emerald-400 font-semibold block text-[11px] mb-0.5">
                    🛡️ How KAYO Stops It:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {sc.howKayoStopsIt}
                  </p>
                </div>
              </div>

              {/* 4 Story Steps Progression */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {sc.steps.map((st, i) => (
                  <div
                    key={i}
                    className="bg-[#050811] p-2.5 rounded-xl border border-slate-800/80 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 ${currentTheme.accentText}`}>
                        Step {st.num}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-200 mt-1 leading-tight">{st.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-snug">{st.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right 1 Col: Live Activity Feed / Terminal */}
        <div className="space-y-4 flex flex-col">
          <div className="bg-[#050811] border border-slate-800 rounded-2xl flex flex-col h-[600px] overflow-hidden shadow-2xl">
            {/* Header with View Toggle (Human vs Kernel) */}
            <div className="bg-[#080d19] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-white">
                  Live Defense Feed
                </span>
              </div>

              {/* View Mode Toggle: Human vs Kernel */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-semibold">
                <button
                  onClick={() => setLogViewMode('human')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    logViewMode === 'human'
                      ? `${currentTheme.accentBg} text-black font-bold shadow`
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Plain English
                </button>
                <button
                  onClick={() => setLogViewMode('kernel')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    logViewMode === 'kernel'
                      ? `${currentTheme.accentBg} text-black font-bold shadow`
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kernel Logs
                </button>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-[#070b14] px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-[10px] text-slate-400">
                {logViewMode === 'human' ? 'Step-by-step incident timeline' : 'Raw eBPF syscall buffer'}
              </span>

              <div className="flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => {
                    setHumanEvents([]);
                    setKernelLogs([]);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Clear Feed
                </button>
              </div>
            </div>

            {/* Log Body */}
            <div className="p-3.5 overflow-y-auto flex-1 space-y-2.5 bg-[#03060f]">
              {logViewMode === 'human' ? (
                /* Human Readable Event Timeline */
                humanEvents.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No active events. Click "Run Simulation" above to test an attack.
                  </div>
                ) : (
                  humanEvents.map((ev, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#070b16] border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`font-bold px-1.5 py-0.2 rounded border ${ev.badgeColor}`}>
                          {ev.badge}
                        </span>
                        <span className="text-slate-400 font-mono">{ev.time}</span>
                      </div>
                      <div className="text-xs font-bold text-white pt-0.5">
                        {ev.title}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        {ev.desc}
                      </p>
                    </div>
                  ))
                )
              ) : (
                /* Kernel Developer Logs */
                kernelLogs.map((log, idx) => (
                  <div key={idx} className="font-mono text-[10.5px] leading-relaxed flex items-start gap-1.5">
                    <span className="text-slate-500 select-none">{log.time}</span>
                    <span className={`font-bold select-none ${log.color}`}>{log.tag}</span>
                    <span className="text-slate-300 flex-1">{log.text}</span>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            <div className="bg-[#070b14] px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>Protection: Instant</span>
              </div>
              <div className="text-slate-400">
                Zero Customer Loss
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
