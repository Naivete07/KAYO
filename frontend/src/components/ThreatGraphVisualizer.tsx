import React, { useState, useMemo, useEffect } from 'react';
import { 
  Network, 
  RefreshCw, 
  ArrowRight, 
  Zap, 
  MapPin, 
  Plus,
  ShieldAlert,
  Plane,
  Clock,
  Laptop,
  Terminal,
  Globe,
  Landmark,
  Send,
  DollarSign,
  User as UserIcon,
  CheckCircle2,
  Info,
  Sparkles,
  Activity
} from 'lucide-react';
import type { GraphData, GraphNode, ThreatIncident } from '../types';
import { THEMES, type SovereignTheme } from '../types/theme';

export interface ThreatGraphVisualizerProps {
  graphData: GraphData | null;
  selectedIncidentTitle?: string;
  onRefresh?: () => void;
  theme?: SovereignTheme;
  incidents?: ThreatIncident[];
  selectedIncident?: ThreatIncident | null;
  onSelectIncident?: (inc: ThreatIncident) => void;
  onOpenActionModal?: (actionType: string, actionLabel: string) => void;
}

interface ScatterPoint {
  id: string;
  timeLabel: string;
  timeSec: number;
  risk: number;
  amount?: number;
  amountLabel?: string;
  status: 'block' | 'review' | 'approved';
  user: string;
  cardLast4: string;
  location: string;
  destLocation: string;
  speedMph?: number;
  factors: string[];
}

interface TravelRoute {
  id: string;
  label: string;
  incidentId: string;
  originCity: string;
  originAirport: string;
  originCoords: string;
  destCity: string;
  destAirport: string;
  destCoords: string;
  distanceMiles: number;
  timeElapsedMin: number;
  flightTimeMin: number;
  impliedVelocityMph: number;
  amountUsd: number;
  amountInr: number;
  riskScore: number;
  flagType: string;
  narrative: string;
  posTerminal: string;
  authMethod: string;
}

const DEFAULT_ROUTES: TravelRoute[] = [
  {
    id: 'route_lax',
    label: 'Chicago ➔ Los Angeles ($7,226)',
    incidentId: 'INC-2026-9041',
    originCity: 'Chicago, IL',
    originAirport: 'ORD',
    originCoords: '41.8781° N, 87.6298° W',
    destCity: 'Los Angeles, CA',
    destAirport: 'LAX',
    destCoords: '34.0522° N, 118.2437° W',
    distanceMiles: 1745,
    timeElapsedMin: 2.14,
    flightTimeMin: 252, // 4h 12m
    impliedVelocityMph: 48925,
    amountUsd: 7226,
    amountInr: 598500,
    riskScore: 0.94,
    flagType: 'FLAG: IMPOSSIBLE TRAVEL',
    narrative: 'Commercial flight requires 4h 12m. Card presented at Los Angeles POS just 2.14m after Chicago chip authorization. Speed of 48,925 mph (Mach 64) is physically impossible — confirms clone/stolen digital session.',
    posTerminal: 'POS-LAX-4891 • Luxury Retail',
    authMethod: 'Contactless Digital Token Clone'
  },
  {
    id: 'route_ams',
    label: 'Mumbai ➔ Amsterdam (₹1,48,500 / $1,941)',
    incidentId: 'INC-2026-9041',
    originCity: 'Mumbai, IN',
    originAirport: 'BOM',
    originCoords: '19.0760° N, 72.8777° E',
    destCity: 'Amsterdam, NL',
    destAirport: 'AMS',
    destCoords: '52.3676° N, 4.9041° E',
    distanceMiles: 4260,
    timeElapsedMin: 1.45,
    flightTimeMin: 540, // 9h 00m
    impliedVelocityMph: 176275,
    amountUsd: 1941,
    amountInr: 148500,
    riskScore: 0.98,
    flagType: 'FLAG: CROSS-BORDER C2 DISLOCATION',
    narrative: 'Victim workstation in Mumbai; concurrent session token used via Tor exit node in Netherlands to dispatch unauthorized UPI transfer to quickcash99@okaxis.',
    posTerminal: 'NPCI UPI Gateway • Tor Exit IP',
    authMethod: 'Dumped Browser Session Cookies'
  },
  {
    id: 'route_sin',
    label: 'Bengaluru ➔ Singapore (₹92,000 / $1,108)',
    incidentId: 'INC-2026-8832',
    originCity: 'Bengaluru, IN',
    originAirport: 'BLR',
    originCoords: '12.9716° N, 77.5946° E',
    destCity: 'Singapore',
    destAirport: 'SIN',
    destCoords: '1.3521° N, 103.8198° E',
    distanceMiles: 1972,
    timeElapsedMin: 3.10,
    flightTimeMin: 270, // 4h 30m
    impliedVelocityMph: 38167,
    amountUsd: 4127,
    amountInr: 92000,
    riskScore: 0.88,
    flagType: 'FLAG: MULE SYNDICATE BURST',
    narrative: 'High-frequency micro-burst payments routed into mule account cluster (hub_pay_cluster7@ybl) across national borders within 3 minutes of PowerShell execution.',
    posTerminal: 'P2P Crypto Gateway • Node 14',
    authMethod: 'Automated Scripting Burst'
  },
  {
    id: 'route_fra',
    label: 'New Delhi ➔ Frankfurt (₹2,10,000 / $2,520)',
    incidentId: 'INC-2026-7719',
    originCity: 'New Delhi, IN',
    originAirport: 'DEL',
    originCoords: '28.6139° N, 77.2090° E',
    destCity: 'Frankfurt, DE',
    destAirport: 'FRA',
    destCoords: '50.1109° N, 8.6821° E',
    distanceMiles: 3803,
    timeElapsedMin: 1.20,
    flightTimeMin: 510, // 8h 30m
    impliedVelocityMph: 190150,
    amountUsd: 2520,
    amountInr: 210000,
    riskScore: 0.92,
    flagType: 'FLAG: SIM SWAP VELOCITY',
    narrative: 'IMSI SIM-swap completed 74m prior. Beneficiary addition cooldown bypassed via VPN exit in Germany, initiating high-value RTGS transfer.',
    posTerminal: 'NetBanking Portal • VPN Tunnel',
    authMethod: 'Stolen OTP via SIM Clone'
  }
];

export const ThreatGraphVisualizer: React.FC<ThreatGraphVisualizerProps> = ({
  graphData,
  selectedIncidentTitle,
  onRefresh,
  theme = 'gold',
  incidents = [],
  selectedIncident,
  onSelectIncident,
  onOpenActionModal
}) => {
  const currentTheme = THEMES[theme] || THEMES.gold;

  // Currency display toggle: 'USD' | 'INR'
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'INR'>('USD');

  // Selected Route for Spatial Velocity Inspector
  const [selectedRoute, setSelectedRoute] = useState<TravelRoute>(DEFAULT_ROUTES[0]);

  // Live streaming states
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [epsRate, setEpsRate] = useState<number>(28512);
  const [jitterMs, setJitterMs] = useState<number>(0.12);

  // Active clicked scatter point
  const [activePoint, setActivePoint] = useState<ScatterPoint | null>(null);

  // Graph state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [graphFilterType, setGraphFilterType] = useState<string>('ALL');
  const [containedNodeIds, setContainedNodeIds] = useState<Set<string>>(new Set());

  // Scatter Points (With rich forensic details)
  const [scatterPoints, setScatterPoints] = useState<ScatterPoint[]>([
    { id: 'p1', timeSec: -58, timeLabel: '-58s', risk: 0.08, status: 'approved', user: 'j.smith@corp.com', cardLast4: '4192', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Baseline device', 'Chip authenticated'] },
    { id: 'p2', timeSec: -54, timeLabel: '-54s', risk: 0.14, status: 'approved', user: 'a.baker@fin.org', cardLast4: '8831', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Known grocery POS'] },
    { id: 'p3', timeSec: -49, timeLabel: '-49s', risk: 0.05, status: 'approved', user: 'c.davis@retail.io', cardLast4: '1092', location: 'Evanston, IL', destLocation: 'Chicago, IL', factors: ['Home suburb beacon'] },
    { id: 'p4', timeSec: -45, timeLabel: '-45s', risk: 0.22, status: 'approved', user: 'm.wilson@net.co', cardLast4: '7721', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Contactless standard'] },
    { id: 'p5', timeSec: -42, timeLabel: '-42s', risk: 0.12, status: 'approved', user: 't.taylor@bank.com', cardLast4: '6630', location: 'Naperville, IL', destLocation: 'Chicago, IL', factors: ['Recurring utility bill'] },
    { id: 'p6', timeSec: -38, timeLabel: '-38s', risk: 0.18, status: 'approved', user: 'k.evans@dev.io', cardLast4: '3049', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Coffee terminal'] },
    { id: 'p7', timeSec: -34, timeLabel: '-34s', risk: 0.09, status: 'approved', user: 's.hall@corp.com', cardLast4: '8112', location: 'Oak Park, IL', destLocation: 'Chicago, IL', factors: ['Standard transit tap'] },
    { id: 'p8', timeSec: -30, timeLabel: '-30s', risk: 0.26, status: 'approved', user: 'b.green@tech.com', cardLast4: '5541', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Online order with 2FA'] },
    { id: 'p9', timeSec: -27, timeLabel: '-27s', risk: 0.16, status: 'approved', user: 'r.adams@fin.org', cardLast4: '9920', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Verified fingerprint'] },
    { id: 'p10', timeSec: -23, timeLabel: '-23s', risk: 0.11, status: 'approved', user: 'p.clark@cloud.io', cardLast4: '4410', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Micro-payment'] },
    { id: 'p11', timeSec: -19, timeLabel: '-19s', risk: 0.24, status: 'approved', user: 'e.white@app.co', cardLast4: '2239', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Standard ATM balance'] },
    { id: 'p12', timeSec: -15, timeLabel: '-15s', risk: 0.07, status: 'approved', user: 'd.morris@corp.com', cardLast4: '6641', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Known fuel dispenser'] },
    { id: 'p13', timeSec: -12, timeLabel: '-12s', risk: 0.15, status: 'approved', user: 'l.king@bank.org', cardLast4: '1182', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Authorized subscription'] },
    { id: 'p14', timeSec: -8, timeLabel: '-8s', risk: 0.19, status: 'approved', user: 'g.wright@net.io', cardLast4: '7740', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Standard retail'] },
    { id: 'p15', timeSec: -4, timeLabel: '-4s', risk: 0.04, status: 'approved', user: 'v.scott@fin.co', cardLast4: '3329', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['In-store grocery'] },
    { id: 'p16', timeSec: -1, timeLabel: 'NOW', risk: 0.13, status: 'approved', user: 'h.lopez@cloud.com', cardLast4: '5501', location: 'Chicago, IL', destLocation: 'Chicago, IL', factors: ['Biometric check pass'] },
    { id: 'r1', timeSec: -47, timeLabel: '-47s', risk: 0.52, status: 'review', user: 'b.stone@corp.com', cardLast4: '9931', location: 'Chicago, IL', destLocation: 'Indianapolis, IN', factors: ['Cross-state POS', 'Time delta 45m'] },
    { id: 'r2', timeSec: -36, timeLabel: '-36s', risk: 0.48, status: 'review', user: 'j.ross@fin.org', cardLast4: '2281', location: 'Chicago, IL', destLocation: 'Milwaukee, WI', factors: ['New electronics store'] },
    { id: 'r3', timeSec: -21, timeLabel: '-21s', risk: 0.56, status: 'review', user: 'c.ford@tech.io', cardLast4: '6619', location: 'Chicago, IL', destLocation: 'Detroit, MI', factors: ['Velocity spike 2x'] },
    { id: 'r4', timeSec: -7, timeLabel: '-7s', risk: 0.62, status: 'review', user: 'm.bell@net.co', cardLast4: '4482', location: 'Chicago, IL', destLocation: 'St. Louis, MO', factors: ['Unusual amount ($840)'] },
    { id: 'r5', timeSec: 0, timeLabel: 'NOW', risk: 0.71, status: 'review', user: 'w.price@bank.org', cardLast4: '1109', location: 'Chicago, IL', destLocation: 'Minneapolis, MN', factors: ['Device ID changed'] },
    // Critical Blocks
    { id: 'b1', timeSec: -31, timeLabel: '-31s', risk: 0.86, amount: 1941, amountLabel: '$1941', status: 'block', user: 'Sada Aizaz (victim)', cardLast4: '8812', location: 'Mumbai, IN', destLocation: 'Amsterdam, NL', speedMph: 176275, factors: ['Tor exit node IP', 'Injected svchost DLL', 'New mule VPA'] },
    { id: 'b2', timeSec: -20, timeLabel: '-20s', risk: 0.89, amount: 4127, amountLabel: '$4127', status: 'block', user: 'Sahil Srivastava', cardLast4: '4401', location: 'Bengaluru, IN', destLocation: 'Singapore', speedMph: 38167, factors: ['PowerShell spawn', 'High-frequency burst', 'Blacklisted IMEI'] },
    { id: 'b3', timeSec: -9, timeLabel: '-9s', risk: 0.94, amount: 7226, amountLabel: '$7226', status: 'block', user: 'Cardholder Primary', cardLast4: '9041', location: 'Chicago, IL (ORD)', destLocation: 'Los Angeles, CA (LAX)', speedMph: 48925, factors: ['Impossible travel (48,925 mph)', 'High-ticket jewelry POS', 'Zero chip confirmation'] }
  ]);

  // Jitter and stream drift
  useEffect(() => {
    const interval = setInterval(() => {
      setEpsRate(Math.floor(28400 + Math.random() * 200));
      setJitterMs(parseFloat((0.11 + Math.random() * 0.03).toFixed(2)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      setScatterPoints(prev => {
        const updated = prev.map(p => ({
          ...p,
          timeSec: p.timeSec - 1.5,
          timeLabel: p.timeSec - 1.5 < -55 ? '-60s' : `${Math.round(p.timeSec - 1.5)}s`
        })).filter(p => p.timeSec > -65);

        const newRisk = Math.random() < 0.15 ? 0.42 + Math.random() * 0.25 : 0.04 + Math.random() * 0.22;
        const newPoint: ScatterPoint = {
          id: 'p_' + Date.now(),
          timeSec: 0,
          timeLabel: 'NOW',
          risk: parseFloat(newRisk.toFixed(2)),
          status: newRisk > 0.75 ? 'block' : newRisk > 0.40 ? 'review' : 'approved',
          user: 'active_session_' + Math.floor(Math.random() * 900 + 100),
          cardLast4: String(Math.floor(Math.random() * 9000 + 1000)),
          location: 'Chicago, IL (ORD)',
          destLocation: newRisk > 0.75 ? 'Los Angeles, CA (LAX)' : 'Chicago, IL',
          factors: newRisk > 0.75 ? ['Anomalous velocity', 'Unrecognized device'] : ['Baseline telemetry']
        };

        const blockPoints = prev.filter(p => p.status === 'block');
        return [...updated, newPoint, ...blockPoints.filter(bp => !updated.some(u => u.id === bp.id))].slice(0, 32);
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Graph Nodes
  const computedNodes = useMemo(() => {
    if (!graphData || !graphData.nodes) return [];
    const nodes = [...graphData.nodes];
    const height = 195;
    const typeTiers: Record<string, number> = {
      'User': 50,
      'Device': 120,
      'Process': 200,
      'IP': 280,
      'Bank_Account': 355,
      'UPI_Account': 395,
      'Transaction': 465
    };
    const typeCounters: Record<string, number> = {};

    return nodes.map((node, idx) => {
      const tierX = typeTiers[node.type] || (70 + (idx % 4) * 110);
      const count = typeCounters[node.type] || 0;
      typeCounters[node.type] = count + 1;
      const tierY = 38 + count * 52 + (idx % 2 === 0 ? 0 : 12);
      return {
        ...node,
        x: tierX,
        y: Math.min(Math.max(tierY, 32), height - 32)
      };
    });
  }, [graphData]);

  const activeGraphNode = useMemo(() => {
    if (selectedNodeId) {
      const f = computedNodes.find(n => n.id === selectedNodeId);
      if (f) return f;
    }
    return computedNodes.length > 0 
      ? [...computedNodes].sort((a, b) => b.risk_score - a.risk_score)[0] 
      : null;
  }, [selectedNodeId, computedNodes]);

  const filteredGraphNodes = computedNodes.filter(n => graphFilterType === 'ALL' || n.type === graphFilterType);
  const filteredNodeIds = new Set(filteredGraphNodes.map(n => n.id));

  // Find upstream & downstream causal connections
  const connectedNodeIds = useMemo(() => {
    const targetId = hoveredNodeId || activeGraphNode?.id;
    if (!targetId || !graphData?.edges) return new Set<string>();
    const related = new Set<string>([targetId]);
    graphData.edges.forEach(e => {
      if (e.source === targetId) related.add(e.target);
      if (e.target === targetId) related.add(e.source);
    });
    return related;
  }, [hoveredNodeId, activeGraphNode, graphData]);

  // Human-friendly node narrative
  const getNodeStory = (node: GraphNode) => {
    switch (node.type) {
      case 'User':
        return {
          role: 'Victim Customer Profile',
          explanation: 'Targeted account holder. System detected active token harvesting and concurrent login from foreign VPN IP.',
          icon: UserIcon,
          color: 'text-cyan-400'
        };
      case 'Device':
        return {
          role: 'Compromised Endpoint Host',
          explanation: 'Workstation running internal corporate apps. eBPF caught unauthorized DLL injection into system processes.',
          icon: Laptop,
          color: 'text-sky-400'
        };
      case 'Process':
        return {
          role: 'Malicious Injected Process (svchost)',
          explanation: 'Target of ptrace injection. Executing memory extraction to dump unencrypted browser banking session cookies.',
          icon: Terminal,
          color: 'text-rose-400'
        };
      case 'IP':
        return {
          role: 'Foreign C2 Server / Tor Exit',
          explanation: 'External command-and-control IP located in Netherlands. Received harvested credential hashes over TLS.',
          icon: Globe,
          color: 'text-purple-400'
        };
      case 'Bank_Account':
        return {
          role: 'Victim Banking Account',
          explanation: 'Primary savings account drained without customer 2FA presence using hijacked session token.',
          icon: Landmark,
          color: 'text-amber-400'
        };
      case 'UPI_Account':
        return {
          role: 'Target Money Mule VPA',
          explanation: 'Syndicate mule handle receiving illicit rapid fan-out micro-burst funds for cash laundering.',
          icon: Send,
          color: 'text-red-400'
        };
      case 'Transaction':
        return {
          role: 'Unauthorized Debit Transfer',
          explanation: 'Fraudulent transaction executed seconds after session theft. Velocity jumped from 0 to 4 in 90 seconds.',
          icon: DollarSign,
          color: 'text-orange-400'
        };
      default:
        return {
          role: 'Cross-Domain Entity',
          explanation: 'Correlated node in the multi-layer attack propagation topology.',
          icon: Activity,
          color: 'text-slate-300'
        };
    }
  };

  const getNodeColor = (node: GraphNode) => {
    if (containedNodeIds.has(node.id) || node.status === 'contained') return '#10b981';
    if (node.risk_score >= 0.8) return '#f43f5e';
    if (node.risk_score >= 0.5) return '#f59e0b';
    return '#06b6d4';
  };

  const handleSimulateFlow = () => {
    setIsLiveStreaming(prev => !prev);
    const burstRisk = 0.88;
    const burstAmount = currencyMode === 'USD' ? 3450 : 285000;
    const burstPoint: ScatterPoint = {
      id: 'burst_' + Date.now(),
      timeSec: 0,
      timeLabel: 'NOW',
      risk: burstRisk,
      amount: burstAmount,
      amountLabel: currencyMode === 'USD' ? `$${burstAmount}` : `₹${burstAmount.toLocaleString('en-IN')}`,
      status: 'block',
      user: 'Simulated Injected Vector',
      cardLast4: '9942',
      location: selectedRoute.originCity,
      destLocation: selectedRoute.destCity,
      speedMph: selectedRoute.impliedVelocityMph,
      factors: ['Simulated attack injection', 'High-speed anomaly']
    };
    setScatterPoints(prev => [burstPoint, ...prev]);
    setActivePoint(burstPoint);
  };

  const handleTestTransaction = () => {
    if (onOpenActionModal) {
      onOpenActionModal('TEST_SCORING_TRANSACTION', `Test Scoring Injection (${selectedRoute.label})`);
    } else {
      handleSimulateFlow();
    }
  };

  const formatAmount = (usd: number, inr: number) => {
    return currencyMode === 'INR' ? `₹${inr.toLocaleString('en-IN')}` : `$${usd.toLocaleString('en-US')}`;
  };

  const isCurrentContained = activeGraphNode ? (containedNodeIds.has(activeGraphNode.id) || activeGraphNode.status === 'contained') : false;

  return (
    <div className="bg-[#050811] text-slate-100 rounded-2xl p-3 sm:p-3.5 border border-slate-800 space-y-2.5 select-none w-full max-w-full">
      
      {/* ========================================================================= */}
      {/* TOP HEADER: USER-ORIENTED ACTION BAR WITH EXPLANATION                     */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-wider uppercase font-mono truncate flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Cyber-Financial Scam Radar & Threat Propagation Network
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">
            {selectedIncidentTitle 
              ? `Correlated Investigation: ${selectedIncidentTitle}` 
              : 'Real-time transaction scoring scatter, geospatial velocity inspector, and cyber-to-financial attack graph'}
          </p>
        </div>

        {/* Currency Toggle & Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] font-mono">
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                currencyMode === 'USD' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              $
            </button>
            <button
              onClick={() => setCurrencyMode('INR')}
              className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                currencyMode === 'INR' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              ₹
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-[10px] font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>LIVE DETECTION</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh Graph Telemetry"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dislocation Vector Quick Switch Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs font-mono">
        <span className="text-[9px] text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-cyan-400" />
          ACTIVE SCENARIO VECTORS:
        </span>
        {DEFAULT_ROUTES.map(route => {
          const isSelected = selectedRoute.id === route.id;
          return (
            <button
              key={route.id}
              onClick={() => setSelectedRoute(route)}
              className={`px-2 py-0.5 rounded-md border text-[10px] transition-all shrink-0 font-medium ${
                isSelected
                  ? `${currentTheme.accentBgSubtle} ${currentTheme.accentBorder} text-rose-300 font-bold shadow-sm`
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {route.originCity} ➔ {route.destCity} ({formatAmount(route.amountUsd, route.amountInr)})
            </button>
          );
        })}
        {incidents.length > 0 && onSelectIncident && incidents.map(inc => (
          <button
            key={inc.id}
            onClick={() => {
              onSelectIncident(inc);
              const matchedRoute = DEFAULT_ROUTES.find(r => inc.loss_amount_at_risk === r.amountInr || inc.title.toLowerCase().includes(r.destCity.toLowerCase()));
              if (matchedRoute) setSelectedRoute(matchedRoute);
            }}
            className={`px-2 py-0.5 rounded-md text-[10px] border shrink-0 transition-all ${
              selectedIncident?.id === inc.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                : 'bg-slate-950/80 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            {inc.id} (₹{(inc.loss_amount_at_risk / 1000).toFixed(0)}k)
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MAIN BODY: 50/50 SIDE-BY-SIDE RESPONSIVE DUAL GRID                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">

        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN: LIVE SCORING SCATTER + SPATIAL VELOCITY INSPECTOR           */}
        {/* ----------------------------------------------------------------------- */}
        <div className="flex flex-col justify-between space-y-2.5 bg-[#050811]/90 rounded-xl border border-slate-800/90 p-3">
            
            {/* Card 1: Real-Time Scoring Scatter Plot */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1 pb-1 border-b border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-cyan-400" />
                  Real-Time Scoring Scatter (0% ➔ 100% Risk)
                </div>
                <div className="flex items-center gap-2.5 text-[9px] font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Block (3)
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Review (5)
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Approved (24)
                  </span>
                </div>
              </div>

              {/* Compact Scatter Canvas */}
              <div className="relative h-[130px] w-full bg-[#03060d] rounded-lg border border-slate-800/80 overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                  }}
                />
                <div className="absolute top-0 left-0 right-0 h-[25%] bg-rose-500/10 pointer-events-none" />
                <div className="absolute top-[25%] left-0 right-0 h-[35%] bg-amber-500/5 pointer-events-none" />

                <svg className="w-full h-full" viewBox="0 0 550 130" preserveAspectRatio="none">
                  <line x1="38" y1="8" x2="540" y2="8" stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="38" y1="33" x2="540" y2="33" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
                  <line x1="38" y1="78" x2="540" y2="78" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
                  <line x1="38" y1="118" x2="540" y2="118" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.4" />

                  <text x="6" y="11" fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold">1.00</text>
                  <text x="45" y="29" fill="#f43f5e" fontSize="7.5" fontFamily="monospace" fontWeight="bold">BLOCK (&gt;75%)</text>
                  <text x="6" y="81" fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold">0.40</text>
                  <text x="45" y="74" fill="#f59e0b" fontSize="7.5" fontFamily="monospace" fontWeight="bold">REVIEW (40-75%)</text>
                  <text x="6" y="121" fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold">0.00</text>
                  <text x="430" y="114" fill="#06b6d4" fontSize="7.5" fontFamily="monospace" fontWeight="bold" opacity="0.9">
                    EXPECTED BASELINE (3.8%)
                  </text>

                  {scatterPoints.map((pt) => {
                    const cx = 520 + (pt.timeSec / 60) * 470;
                    const cy = 118 - pt.risk * 110;
                    const isBlock = pt.status === 'block';
                    const isReview = pt.status === 'review';
                    const dotColor = isBlock ? '#f43f5e' : isReview ? '#f59e0b' : '#34d399';
                    const isSelected = activePoint?.id === pt.id;

                    return (
                      <g 
                        key={pt.id}
                        className="cursor-pointer group"
                        onClick={() => {
                          setActivePoint(pt);
                          if (pt.amount && pt.speedMph) {
                            const matchRoute = DEFAULT_ROUTES.find(r => r.amountUsd === pt.amount);
                            if (matchRoute) setSelectedRoute(matchRoute);
                          }
                        }}
                      >
                        {isBlock && (
                          <circle cx={cx} cy={cy} r="7" fill="#f43f5e" opacity="0.3" className="animate-pulse" />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? "5" : isBlock ? "4" : "2.8"}
                          fill={dotColor}
                          stroke={isSelected ? "#ffffff" : "#050811"}
                          strokeWidth={isSelected ? "1.5" : "0.8"}
                        />
                        {isBlock && pt.amount && (
                          <g transform={`translate(${cx}, ${cy - 8})`}>
                            <rect x="-16" y="-9" width="32" height="11" rx="2.5" fill="#0b1324" stroke="#f43f5e" strokeWidth="0.8" opacity="0.95" />
                            <text x="0" y="-1" textAnchor="middle" fill="#fda4af" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                              {currencyMode === 'INR' ? `₹${(pt.amount * 82.5 / 1000).toFixed(0)}k` : `$${pt.amount}`}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                <div className="absolute bottom-0.5 left-10 right-4 flex justify-between text-[8px] font-mono text-slate-500 pointer-events-none">
                  <span>-45s</span>
                  <span>-30s</span>
                  <span>-15s</span>
                  <span className="text-slate-300 font-bold">NOW</span>
                </div>
              </div>

              {/* Point Drill-Down Card */}
              {activePoint && (
                <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                      activePoint.status === 'block' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      activePoint.status === 'review' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {activePoint.status.toUpperCase()} ({(activePoint.risk * 100).toFixed(0)}% RISK)
                    </span>
                    <span className="text-rose-400 font-bold">
                      {activePoint.amount ? (currencyMode === 'INR' ? `₹${(activePoint.amount * 82.5).toLocaleString('en-IN')}` : `$${activePoint.amount}`) : 'Routine'}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[9px]">
                    <strong>Target:</strong> {activePoint.user} • Card: ****{activePoint.cardLast4} • {activePoint.location} ➔ {activePoint.destLocation}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {activePoint.factors.map((f, i) => (
                      <span key={i} className="text-[8px] bg-slate-950 px-1.5 py-0.2 rounded text-slate-400 border border-slate-800">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Spatial Velocity & Impossible Travel Inspector */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between pb-0.5 border-b border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-rose-400" />
                  Spatial Velocity & Impossible Travel Inspector
                </div>
                <div className="px-1.5 py-0.2 rounded border border-rose-500/40 bg-rose-500/10 text-rose-400 font-mono text-[9px] font-bold uppercase">
                  {selectedRoute.flagType}
                </div>
              </div>

              {/* Plain-English AI Explanation Banner */}
              <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/30 text-[10px] text-amber-200 leading-snug flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Anomaly Breakdown:</strong> {selectedRoute.narrative}
                </span>
              </div>

              {/* Origin ➔ Destination Corridor with Flight Time Comparison */}
              <div className="grid grid-cols-5 gap-2 items-center">
                <div className="col-span-2 bg-[#090d1a] p-2 rounded-lg border border-slate-800 text-left space-y-0.5">
                  <span className="text-[8px] text-slate-400 font-mono block uppercase">CARDHOLDER HOME</span>
                  <div className="text-[11px] font-bold text-white truncate">{selectedRoute.originCity} ({selectedRoute.originAirport})</div>
                  <div className="text-[8px] text-slate-400 font-mono truncate">{selectedRoute.originCoords}</div>
                </div>

                <div className="col-span-1 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-mono text-rose-300 font-bold leading-tight">
                    {selectedRoute.distanceMiles.toLocaleString()} mi
                  </span>
                  <div className="w-full flex items-center justify-center my-0.5">
                    <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500 via-rose-500 to-rose-400 rounded-full" />
                    <ArrowRight className="h-3 w-3 text-rose-400 -ml-1 shrink-0" />
                  </div>
                  <span className="text-[7.5px] text-slate-400 font-mono">Straight-Line</span>
                </div>

                <div className="col-span-2 bg-[#090d1a] p-2 rounded-lg border border-slate-800 text-left space-y-0.5">
                  <span className="text-[8px] text-slate-400 font-mono block uppercase">MERCHANT POS</span>
                  <div className="text-[11px] font-bold text-white truncate">{selectedRoute.destCity} ({selectedRoute.destAirport})</div>
                  <div className="text-[8px] text-slate-400 font-mono truncate">{selectedRoute.destCoords}</div>
                </div>
              </div>

              {/* Speed vs Commercial Flight Comparison Strip */}
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[9.5px]">
                <div className="bg-[#090d1a] p-1 rounded-lg border border-slate-800">
                  <span className="text-[8px] text-slate-400 block uppercase">Min Flight Time</span>
                  <span className="font-bold text-slate-300 block truncate flex items-center justify-center gap-1">
                    <Plane className="h-2.5 w-2.5 text-slate-400" />
                    {Math.floor(selectedRoute.flightTimeMin / 60)}h {selectedRoute.flightTimeMin % 60}m
                  </span>
                </div>
                <div className="bg-[#090d1a] p-1 rounded-lg border border-slate-800">
                  <span className="text-[8px] text-slate-400 block uppercase">Actual Delta (Δt)</span>
                  <span className="font-bold text-white block truncate flex items-center justify-center gap-1">
                    <Clock className="h-2.5 w-2.5 text-cyan-400" />
                    {selectedRoute.timeElapsedMin} mins
                  </span>
                </div>
                <div className="bg-[#090d1a] p-1 rounded-lg border border-rose-500/40">
                  <span className="text-[8px] text-slate-400 block uppercase">Implied Velocity</span>
                  <span className="font-bold text-rose-400 block truncate">
                    {selectedRoute.impliedVelocityMph.toLocaleString()} mph
                  </span>
                </div>
              </div>

              {/* Model Consensus & Benchmark Strip */}
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[9.5px]">
                <div className="bg-[#090d1a] p-1 rounded-lg border border-slate-800">
                  <span className="text-[8px] text-slate-400 block uppercase">Consensus</span>
                  <span className="font-bold text-cyan-400 block">99.88%</span>
                </div>
                <div className="bg-[#090d1a] p-1 rounded-lg border border-slate-800">
                  <span className="text-[8px] text-slate-400 block uppercase">Prevented (1H)</span>
                  <span className="font-bold text-cyan-400 block">{formatAmount(2169.50, 180500)}</span>
                </div>
                <div className="bg-[#090d1a] p-1 rounded-lg border border-slate-800">
                  <span className="text-[8px] text-slate-400 block uppercase">Terminal Auth</span>
                  <span className="font-bold text-amber-300 block truncate">{selectedRoute.authMethod.split(' ')[0]}</span>
                </div>
              </div>

              {/* Bottom Pipeline Bar & Action Buttons */}
              <div className="pt-1 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5 text-[9.5px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-300 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="truncate">Pipeline: <strong>{epsRate.toLocaleString()} EPS</strong> ({jitterMs}ms Jitter)</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleSimulateFlow}
                    className="px-2 py-0.5 rounded text-[9.5px] font-bold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-1"
                  >
                    <Zap className="h-2.5 w-2.5 text-amber-400" />
                    <span>Simulate</span>
                  </button>
                  <button
                    onClick={handleTestTransaction}
                    className="px-2.5 py-0.5 rounded text-[9.5px] font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow transition-all flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3 stroke-[2.5]" />
                    <span>Test Txn</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: CROSS-DOMAIN THREAT GRAPH + USER-ORIENTED FORENSICS        */}
        {/* ----------------------------------------------------------------------- */}
        <div className="flex flex-col justify-between space-y-2.5 bg-[#050811]/90 rounded-xl border border-slate-800/90 p-3">
            
            {/* Graph Header & Domain Filter Chips */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1 pb-1 border-b border-slate-800/80">
                <div className="text-[10px] font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-1">
                  <Network className="h-3.5 w-3.5 text-cyan-400" />
                  Unified Entity Relationship & Attack Propagation Topology
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-md border border-slate-800 text-[8.5px] font-mono">
                  {['ALL', 'Process', 'IP', 'UPI_Account', 'Transaction'].map(type => (
                    <button
                      key={type}
                      onClick={() => setGraphFilterType(type)}
                      className={`px-1.5 py-0.2 rounded font-medium transition-all ${
                        graphFilterType === type
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive SVG Canvas */}
              <div className="relative h-[200px] w-full bg-[#03060d] rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }}
                />

                <svg className="w-full h-full select-none" viewBox="0 0 520 195">
                  <defs>
                    <linearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="gradNormal" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Edges */}
                  {graphData?.edges?.map((edge, idx) => {
                    const sNode = computedNodes.find(n => n.id === edge.source);
                    const tNode = computedNodes.find(n => n.id === edge.target);
                    if (!sNode || !tNode) return null;
                    if (!filteredNodeIds.has(sNode.id) && !filteredNodeIds.has(tNode.id)) return null;

                    const isAnomalous = edge.is_anomalous;
                    const isLinked = connectedNodeIds.has(sNode.id) && connectedNodeIds.has(tNode.id);
                    const midX = (sNode.x! + tNode.x!) / 2;
                    const midY = (sNode.y! + tNode.y!) / 2 - 5;

                    return (
                      <g key={`e-${idx}`}>
                        <line
                          x1={sNode.x}
                          y1={sNode.y}
                          x2={tNode.x}
                          y2={tNode.y}
                          stroke={isAnomalous ? "url(#gradRed)" : isLinked ? "#38bdf8" : "url(#gradNormal)"}
                          strokeWidth={isAnomalous || isLinked ? "1.8" : "1"}
                          strokeDasharray={isAnomalous ? "4,2.5" : "none"}
                          opacity={connectedNodeIds.size > 0 && !isLinked ? 0.35 : 1}
                        />
                        <rect
                          x={midX - 24}
                          y={midY - 5.5}
                          width="48"
                          height="11"
                          rx="2.5"
                          fill="#0b1324"
                          stroke={isAnomalous ? "#f43f5e" : "#334155"}
                          strokeWidth="0.7"
                          opacity="0.95"
                        />
                        <text
                          x={midX}
                          y={midY + 2.8}
                          textAnchor="middle"
                          fill={isAnomalous ? "#fca5a5" : "#94a3b8"}
                          fontSize="6"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {edge.relation}
                        </text>
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {filteredGraphNodes.map(node => {
                    const color = getNodeColor(node);
                    const isSelected = activeGraphNode?.id === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const isCritical = node.risk_score >= 0.8 && node.status !== 'contained';
                    const isConnected = connectedNodeIds.has(node.id);

                    return (
                      <g
                        key={`gn-${node.id}`}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => setSelectedNodeId(node.id)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer group"
                        opacity={connectedNodeIds.size > 0 && !isConnected ? 0.4 : 1}
                      >
                        {isCritical && (
                          <circle r="18" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" className="animate-ping" />
                        )}
                        <circle
                          r={isSelected || isHovered ? "14" : "11"}
                          fill="#090d1a"
                          stroke={isSelected ? "#ffffff" : isHovered ? "#38bdf8" : color}
                          strokeWidth={isSelected ? "2.2" : "1.4"}
                          className="transition-all duration-200"
                        />
                        <circle r="4.5" fill={color} opacity="0.9" />
                        <text
                          y="18"
                          textAnchor="middle"
                          fill="#e2e8f0"
                          fontSize="7"
                          fontWeight="bold"
                          className="select-none pointer-events-none group-hover:fill-cyan-300 font-sans"
                        >
                          {node.label.length > 13 ? node.label.substring(0, 11) + '..' : node.label}
                        </text>
                        <text
                          y="26"
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="6"
                          fontFamily="monospace"
                          className="select-none pointer-events-none"
                        >
                          [{node.type}]
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Canvas Bottom Legend */}
                <div className="absolute bottom-1 left-1 bg-[#070b14]/90 px-2 py-0.5 rounded border border-slate-800 text-[7.5px] text-slate-300 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                    <span>Endpoint</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>C2/Malware</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                    <span>Mule/UPI</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    <span>Contained</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Entity Forensics Inspector Card */}
            <div className="bg-[#090d1a] rounded-lg p-2.5 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-cyan-400" />
                  Forensic Entity Inspector
                </span>
                {activeGraphNode && (
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isCurrentContained ? 'bg-emerald-500/20 text-emerald-300' :
                    activeGraphNode.risk_score >= 0.8 ? 'bg-rose-500/20 text-rose-300' :
                    'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {isCurrentContained ? 'CONTAINED' : activeGraphNode.risk_score >= 0.8 ? 'CRITICAL THREAT' : 'ACTIVE'}
                  </span>
                )}
              </div>

              {activeGraphNode ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="truncate font-bold text-white text-[11px] max-w-[220px]">
                      {activeGraphNode.label}
                    </div>
                    <span className="text-[9px] font-mono font-bold text-cyan-300">
                      [{activeGraphNode.type}]
                    </span>
                  </div>

                  {/* Plain-English Role & Explanation */}
                  <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800/70 text-[9px] text-slate-300 leading-snug">
                    <span className="text-cyan-400 font-bold block mb-0.5">
                      {getNodeStory(activeGraphNode).role}
                    </span>
                    {getNodeStory(activeGraphNode).explanation}
                  </div>

                  {/* Risk Meter & Telemetry Badges */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full ${
                          activeGraphNode.risk_score >= 0.8 ? 'bg-gradient-to-r from-orange-500 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                        }`}
                        style={{ width: `${activeGraphNode.risk_score * 100}%` }}
                      />
                    </div>
                    <span className={`font-mono text-[9.5px] font-bold ${
                      activeGraphNode.risk_score >= 0.8 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {(activeGraphNode.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Metadata Chips */}
                  <div className="bg-slate-950/80 p-1 rounded border border-slate-800/80 font-mono text-[8.5px] flex flex-wrap gap-1 max-h-[40px] overflow-y-auto">
                    {activeGraphNode.metadata && Object.keys(activeGraphNode.metadata).length > 0 ? (
                      Object.entries(activeGraphNode.metadata).map(([k, v]) => (
                        <span key={k} className="px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          <span className="text-slate-500">{k}:</span> {String(v)}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">No low-level flags logged.</span>
                    )}
                  </div>

                  {/* Contain Button */}
                  <div className="pt-0.5 flex items-center justify-between gap-2">
                    <span className="text-[8px] text-slate-500 font-mono">
                      Engine: Neo4j + NetworkX
                    </span>
                    <button
                      onClick={() => {
                        const isContained = containedNodeIds.has(activeGraphNode.id);
                        if (!isContained) {
                          setContainedNodeIds(prev => new Set(prev).add(activeGraphNode.id));
                          if (onOpenActionModal) {
                            const actionLabel = activeGraphNode.type === 'UPI_Account' ? `Freeze Target Mule (${activeGraphNode.label})` :
                                                activeGraphNode.type === 'Process' ? `Kill Injected Process (${activeGraphNode.label})` :
                                                `Isolate Entity (${activeGraphNode.label})`;
                            const actionType = activeGraphNode.type === 'UPI_Account' ? 'FREEZE_UPI_ACCOUNT' :
                                               activeGraphNode.type === 'Process' ? 'ISOLATE_PROCESS' : 'ISOLATE_DEVICE';
                            onOpenActionModal(actionType, actionLabel);
                          }
                        } else {
                          setContainedNodeIds(prev => {
                            const next = new Set(prev);
                            next.delete(activeGraphNode.id);
                            return next;
                          });
                        }
                      }}
                      className={`px-3 py-1 rounded text-[9.5px] font-bold transition-all shadow ${
                        isCurrentContained
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      {isCurrentContained ? 'Release Lock' : 'Contain Entity'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 text-slate-500 text-[10px]">
                  Click any node in the topology canvas to inspect telemetry.
                </div>
              )}
            </div>

          </div>

      </div>

      {/* ========================================================================= */}
      {/* BOTTOM EXECUTIVE AI INTELLIGENCE STRIP                                    */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>
            <strong>Cross-Domain AI Correlator:</strong> Linked eBPF syscall DLL injection in <code>svchost.exe</code> with an unauthorized <code>₹1,48,500 ($1,941)</code> UPI transfer to mule handle <code>quickcash99@okaxis</code> within 90 seconds. <strong>Zero capital lost.</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9.5px] text-emerald-400 font-semibold shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Automated Containment Armed</span>
        </div>
      </div>

    </div>
  );
};
