export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'NEW' | 'UNDER_INVESTIGATION' | 'CONTAINED' | 'DISMISSED';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  risk_score: number;
  status: string;
  metadata: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  timestamp: string;
  is_anomalous: boolean;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ThreatIncident {
  id: string;
  title: string;
  category: string;
  threat_level: ThreatSeverity;
  confidence_score: number;
  status: IncidentStatus;
  detected_at: string;
  affected_user: string;
  affected_account: string;
  affected_ip: string;
  affected_process?: string;
  loss_amount_at_risk: number;
  why_suspicious: string[];
  predicted_next_step: string;
  recommended_actions: Array<{
    type: string;
    label: string;
    impact: string;
  }>;
  graph_snapshot?: GraphData;
}

export interface EBPFEvent {
  id: string;
  timestamp: string;
  process_name: string;
  pid: number;
  ppid: number;
  syscall: string;
  socket_dst?: string;
  socket_port?: number;
  is_injected: boolean;
  is_privilege_escalation: boolean;
  severity: ThreatSeverity;
  details: string;
}

export interface TransactionEvent {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  channel: string;
  sender_account: string;
  receiver_account: string;
  receiver_upi?: string;
  amount: number;
  currency: string;
  ip_address: string;
  device_id: string;
  location: string;
  is_new_payee: boolean;
  velocity_last_5min: number;
  device_fingerprint_match: boolean;
}

export interface ActionAuditLog {
  id: string;
  incident_id: string;
  action_type: string;
  analyst: string;
  decision: string;
  timestamp: string;
  notes: string;
  execution_result: string;
}

export interface StatsOverview {
  total_incidents_analyzed: number;
  active_high_severity: number;
  contained_incidents: number;
  total_loss_prevented_inr: number;
  mean_time_to_detect_sec: number;
  mean_time_to_respond_min: number;
  accuracy_confidence_avg: number;
  fraud_distribution: Array<{
    category: string;
    incidents: number;
    color: string;
  }>;
  team: {
    name: string;
    track: string;
    members: Array<{ name: string; role: string }>;
  };
}
