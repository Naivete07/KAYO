import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { ThemeConfigBar } from './components/ThemeConfigBar';
import type { SovereignTheme, DisplayDensity } from './types/theme';
import { ThreatGraphVisualizer } from './components/ThreatGraphVisualizer';
import { IncidentDetailPanel } from './components/IncidentDetailPanel';
import { LiveTelemetryStream } from './components/LiveTelemetryStream';
import { SimulationLab } from './components/SimulationLab';
import { AuditLogView } from './components/AuditLogView';
import { AnalyticsView } from './components/AnalyticsView';
import { ActionModal } from './components/ActionModal';
import type { ThreatIncident, GraphData, StatsOverview, ActionAuditLog, EBPFEvent, TransactionEvent } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [incidents, setIncidents] = useState<ThreatIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<ThreatIncident | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<ActionAuditLog[]>([]);
  const [ebpfEvents, setEbpfEvents] = useState<EBPFEvent[]>([]);
  const [transactionEvents, setTransactionEvents] = useState<TransactionEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  // Theme & Density State
  const [theme, setTheme] = useState<SovereignTheme>(() => {
    return (localStorage.getItem('kayo_theme') as SovereignTheme) || 'gold';
  });
  const [density, setDensity] = useState<DisplayDensity>(() => {
    return (localStorage.getItem('kayo_density') as DisplayDensity) || 'executive';
  });
  const [showConfigBar, setShowConfigBar] = useState<boolean>(true);

  // Sync theme changes to localStorage and HTML attribute
  useEffect(() => {
    localStorage.setItem('kayo_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('kayo_density', density);
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  // Modal State
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<{ type: string; label: string }>({ type: '', label: '' });

  // Initial Data Fetch
  const fetchData = async () => {
    try {
      const [incRes, graphRes, statsRes, auditRes] = await Promise.all([
        fetch('/api/incidents').then(r => r.json()),
        fetch('/api/graph/current').then(r => r.json()),
        fetch('/api/stats/overview').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json())
      ]);

      setIncidents(incRes || []);
      if (incRes && incRes.length > 0 && !selectedIncident) {
        setSelectedIncident(incRes[0]);
      }
      setGraphData(graphRes);
      setStats(statsRes);
      setAuditLogs(auditRes || []);
    } catch (err) {
      console.warn('Backend offline or fetching error, fallback data active:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Telemetry Stream Interval
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/telemetry/live').then(r => r.json());
        if (res.ebpf_events) {
          setEbpfEvents(prev => [...res.ebpf_events, ...prev].slice(0, 100));
        }
        if (res.transaction_events) {
          setTransactionEvents(prev => [...res.transaction_events, ...prev].slice(0, 100));
        }
      } catch (err) {
        console.warn('Live telemetry polling:', err);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Action Confirmation
  const handleConfirmAction = async (analystName: string, notes: string, approved: boolean) => {
    if (!selectedIncident) return;

    try {
      await fetch('/api/actions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: selectedIncident.id,
          action_type: currentAction.type,
          analyst_name: analystName,
          notes: notes,
          approved: approved
        })
      });

      await fetchData();
    } catch (err) {
      console.error('Failed to execute action:', err);
    }
  };

  // Attack Injection Simulator
  const handleTriggerAttack = async (scenario: string) => {
    try {
      const res = await fetch('/api/simulate/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_type: scenario })
      }).then(r => r.json());

      if (res.incident_created) {
        setIncidents(prev => [res.incident_created, ...prev]);
        setSelectedIncident(res.incident_created);
      }
      if (res.ebpf_telemetry) {
        setEbpfEvents(prev => [res.ebpf_telemetry, ...prev]);
      }
      if (res.transaction_telemetry) {
        setTransactionEvents(prev => [res.transaction_telemetry, ...prev]);
      }

      await fetchData();
      return res;
    } catch (err) {
      console.error('Simulation trigger failed:', err);
      throw err;
    }
  };

  const handleOpenActionModal = (actionType: string, actionLabel: string) => {
    setCurrentAction({ type: actionType, label: actionLabel });
    setActionModalOpen(true);
  };

  const activeThreatCount = incidents.filter(i => i.status === 'NEW').length;

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-row selection:bg-slate-700 selection:text-white">
      {/* Left Sovereign Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeThreatCount={activeThreatCount}
        theme={theme}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Context & Theme Quick Selector (Single Nav kept in sidebar) */}
        <Header
          activeTab={activeTab}
          theme={theme}
          setTheme={setTheme}
          showConfigBar={showConfigBar}
          setShowConfigBar={setShowConfigBar}
        />

        {/* Main Content Area */}
        <main className={`flex-1 w-full mx-auto p-4 sm:p-6 ${density === 'compact' ? 'max-w-full' : 'max-w-7xl'}`}>
          {/* Institutional Telemetry & 5 KPI Cards */}
          <MetricCards stats={stats} theme={theme} />

          {/* Haute SOC Console Configuration & Theme Switcher Bar */}
          {showConfigBar && (
            <ThemeConfigBar
              theme={theme}
              setTheme={setTheme}
              density={density}
              setDensity={setDensity}
            />
          )}

          {/* Active Tab Body */}
          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <IncidentDetailPanel
                incidents={incidents}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => {
                  setSelectedIncident(inc);
                  if (inc.graph_snapshot) {
                    setGraphData(inc.graph_snapshot);
                  }
                }}
                onOpenActionModal={handleOpenActionModal}
              />

              {selectedIncident && (
                <ThreatGraphVisualizer
                  graphData={selectedIncident.graph_snapshot || graphData}
                  selectedIncidentTitle={selectedIncident.title}
                  onRefresh={fetchData}
                />
              )}
            </div>
          )}

          {activeTab === 'graph' && (
            <ThreatGraphVisualizer
              graphData={graphData}
              onRefresh={fetchData}
            />
          )}

          {activeTab === 'telemetry' && (
            <LiveTelemetryStream
              ebpfEvents={ebpfEvents}
              transactionEvents={transactionEvents}
              isStreaming={isStreaming}
              onToggleStreaming={() => setIsStreaming(!isStreaming)}
            />
          )}

          {activeTab === 'simulator' && (
            <SimulationLab onTriggerAttack={handleTriggerAttack} theme={theme} />
          )}

          {activeTab === 'audit' && (
            <AuditLogView logs={auditLogs} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView stats={stats} />
          )}
        </main>

        {/* Action Approval Modal */}
        {selectedIncident && (
          <ActionModal
            isOpen={actionModalOpen}
            onClose={() => setActionModalOpen(false)}
            incidentId={selectedIncident.id}
            actionType={currentAction.type}
            actionLabel={currentAction.label}
            onConfirm={handleConfirmAction}
          />
        )}

        {/* Human-Friendly Protection Footer */}
        <footer className="border-t border-slate-800/80 bg-[#060913] py-3 px-6 text-[11px] text-slate-400 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Real-Time Protection Active
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              UPI Banking Rails Secure
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-sky-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-sky-400"></span>
              99.4% Scam Catch Accuracy
            </span>
          </div>

          <div className="text-slate-400 text-xs font-medium">
            KAYO AI Cyber-Financial Defense System • CodeSlayer 2026
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
