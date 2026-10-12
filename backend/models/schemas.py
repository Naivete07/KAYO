from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum
from datetime import datetime

class ThreatSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class IncidentStatus(str, Enum):
    NEW = "NEW"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    CONTAINED = "CONTAINED"
    DISMISSED = "DISMISSED"

class ActionType(str, Enum):
    ISOLATE_PROCESS = "ISOLATE_PROCESS"
    FREEZE_UPI_ACCOUNT = "FREEZE_UPI_ACCOUNT"
    BLOCK_IP = "BLOCK_IP"
    ESCALATE_SOC = "ESCALATE_SOC"
    REJECT_MONITOR = "REJECT_MONITOR"

class EBPFEvent(BaseModel):
    id: str
    timestamp: str
    process_name: str
    pid: int
    ppid: int
    syscall: str
    socket_dst: Optional[str] = None
    socket_port: Optional[int] = None
    is_injected: bool = False
    is_privilege_escalation: bool = False
    severity: ThreatSeverity
    details: str

class TransactionEvent(BaseModel):
    id: str
    timestamp: str
    user_id: str
    user_name: str
    channel: str # UPI, NetBanking, Wallet, Card
    sender_account: str
    receiver_account: str
    receiver_upi: Optional[str] = None
    amount: float
    currency: str = "INR"
    ip_address: str
    device_id: str
    location: str
    is_new_payee: bool = False
    velocity_last_5min: int = 1
    device_fingerprint_match: bool = True

class GraphNode(BaseModel):
    id: str
    label: str
    type: str # User, Device, Process, IP, UPI_Account, Bank_Account, Transaction
    risk_score: float # 0.0 to 1.0
    status: str = "active"
    metadata: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str # OWNS, EXECUTED, CONNECTS_TO, INITIATED, SENT_FUNDS_TO
    timestamp: str
    is_anomalous: bool = False
    weight: float = 1.0

class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ThreatIncident(BaseModel):
    id: str
    title: str
    category: str # "Account Takeover", "UPI / Payment Fraud", "Infostealer Malware", "Mule Syndicate Ring", "Credential Stuffing"
    threat_level: ThreatSeverity
    confidence_score: int # e.g. 94%
    status: IncidentStatus
    detected_at: str
    affected_user: str
    affected_account: str
    affected_ip: str
    affected_process: Optional[str] = None
    loss_amount_at_risk: float
    why_suspicious: List[str]
    predicted_next_step: str
    recommended_actions: List[Dict[str, str]]
    graph_snapshot: Optional[GraphData] = None

class ActionApprovalRequest(BaseModel):
    incident_id: str
    action_type: ActionType
    analyst_name: str
    notes: Optional[str] = ""
    approved: bool

class ActionAuditLog(BaseModel):
    id: str
    incident_id: str
    action_type: str
    analyst: str
    decision: str # APPROVED, REJECTED
    timestamp: str
    notes: str
    execution_result: str
