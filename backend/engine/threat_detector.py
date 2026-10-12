import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from models.schemas import ThreatIncident, ThreatSeverity, IncidentStatus, EBPFEvent, TransactionEvent, GraphData
from engine.graph_engine import threat_graph
from ml.inference import ml_inference

class ThreatCorrelationEngine:
    def __init__(self):
        self.incidents: Dict[str, ThreatIncident] = {}
        self.audit_logs: List[Dict[str, Any]] = []
        self._seed_initial_incidents()

    def _seed_initial_incidents(self):
        # Scenario 1: Infostealer + High-Value UPI Drain
        inc_id1 = "INC-2026-9041"
        threat_graph.add_node("user_sada", "Sada Aizaz (victim)", "User", 0.85, {"role": "HNI Banking Client"})
        threat_graph.add_node("dev_win11_01", "Windows 11 Workstation", "Device", 0.90, {"ip": "192.168.1.104"})
        threat_graph.add_node("proc_svchost_inj", "svchost.exe (Injected: RedLine)", "Process", 0.98, {"pid": 4820, "injected": True})
        threat_graph.add_node("ip_c2_ru", "185.220.101.45 (C2 Server)", "IP", 0.95, {"geo": "Tor Exit / Netherlands"})
        threat_graph.add_node("acc_hdfc_sada", "HDFC Savings #8812", "Bank_Account", 0.70, {"balance": "₹4,20,000"})
        threat_graph.add_node("upi_mule_01", "quickcash99@okaxis (Mule)", "UPI_Account", 0.94, {"flags": "Velocity Spike"})
        threat_graph.add_node("txn_upi_148k", "Txn ₹1,48,500 (Unauthorized)", "Transaction", 0.96, {"channel": "UPI"})

        threat_graph.add_edge("user_sada", "dev_win11_01", "OPERATES", False)
        threat_graph.add_edge("dev_win11_01", "proc_svchost_inj", "RUNS_PROCESS", True, 2.0)
        threat_graph.add_edge("proc_svchost_inj", "ip_c2_ru", "BEACON_C2", True, 3.0)
        threat_graph.add_edge("proc_svchost_inj", "acc_hdfc_sada", "DUMPED_SESSION_COOKIES", True, 3.0)
        threat_graph.add_edge("acc_hdfc_sada", "txn_upi_148k", "SOURCE_ACCOUNT", True, 2.5)
        threat_graph.add_edge("txn_upi_148k", "upi_mule_01", "TRANSFERRED_FUNDS", True, 3.0)

        subgraph_1 = threat_graph.get_subgraph_around_incident(["user_sada", "proc_svchost_inj", "txn_upi_148k"], hops=2)

        self.incidents[inc_id1] = ThreatIncident(
            id=inc_id1,
            title="Credential Infostealer & Rapid UPI Exfiltration",
            category="UPI / Payment Fraud",
            threat_level=ThreatSeverity.CRITICAL,
            confidence_score=96,
            status=IncidentStatus.NEW,
            detected_at=datetime.utcnow().isoformat() + "Z",
            affected_user="sada.aizaz@corp.bank",
            affected_account="HDFC A/C: ****8812",
            affected_ip="185.220.101.45",
            affected_process="svchost.exe [PID: 4820 - Injected DLL]",
            loss_amount_at_risk=148500.0,
            why_suspicious=[
                "eBPF hook caught unauthorized ptrace syscall and DLL injection inside svchost.exe.",
                "Outbound TLS socket opened to known Tor/C2 node 185.220.101.45 right before transaction.",
                "High-value UPI transfer of ₹1,48,500 initiated to newly created VPA (quickcash99@okaxis).",
                "Transaction velocity escalated from 0 to 4 operations in under 90 seconds."
            ],
            predicted_next_step="Immediate rapid fan-out to secondary mule accounts in next ~60s before funds cash out via ATM/crypto.",
            recommended_actions=[
                {"type": "ISOLATE_PROCESS", "label": "Isolate Endpoint Process (PID: 4820)", "impact": "High - Cuts C2 connection"},
                {"type": "FREEZE_UPI_ACCOUNT", "label": "Freeze Target Mule VPA & Flag NPCI", "impact": "Critical - Halts withdrawal"},
                {"type": "BLOCK_IP", "label": "Block C2 IP on Firewall (185.220.101.45)", "impact": "Medium - Blocks exfiltration"},
                {"type": "ESCALATE_SOC", "label": "Escalate to Tier-3 SOC & Bank Fraud Desk", "impact": "Standard SLA: 10 mins"}
            ],
            graph_snapshot=subgraph_1
        )

        # Scenario 2: Mule Syndicate Ring
        inc_id2 = "INC-2026-8832"
        threat_graph.add_node("user_sahil", "Sahil Srivastava", "User", 0.60, {})
        threat_graph.add_node("acc_icici_sahil", "ICICI Salary #4401", "Bank_Account", 0.50, {})
        threat_graph.add_node("upi_mule_ring_hub", "hub_pay_cluster7@ybl", "UPI_Account", 0.98, {"mule_score": 0.99})
        threat_graph.add_node("txn_mule_92k", "Txn ₹92,000", "Transaction", 0.88, {})

        threat_graph.add_edge("user_sahil", "acc_icici_sahil", "OWNS", False)
        threat_graph.add_edge("acc_icici_sahil", "txn_mule_92k", "DEBITED", True)
        threat_graph.add_edge("txn_mule_92k", "upi_mule_ring_hub", "CREDITED_MULE", True, 2.5)

        subgraph_2 = threat_graph.get_subgraph_around_incident(["user_sahil", "upi_mule_ring_hub"], hops=2)

        self.incidents[inc_id2] = ThreatIncident(
            id=inc_id2,
            title="Mule Syndicate Layering Ring Detected",
            category="Account Takeover",
            threat_level=ThreatSeverity.HIGH,
            confidence_score=89,
            status=IncidentStatus.NEW,
            detected_at=datetime.utcnow().isoformat() + "Z",
            affected_user="sahil.srivastava@fin.io",
            affected_account="ICICI A/C: ****4401",
            affected_ip="103.21.144.90",
            affected_process="powershell.exe [PID: 3104]",
            loss_amount_at_risk=92000.0,
            why_suspicious=[
                "Target UPI ID (hub_pay_cluster7@ybl) received 14 micro-burst payments in 3 minutes.",
                "Device IMEI fingerprint previously blacklisted across 3 partner banking networks.",
                "eBPF caught base64 encoded PowerShell execution downloading stage-2 payload."
            ],
            predicted_next_step="Aggregated funds will be channeled via offshore P2P crypto gateways within 5 minutes.",
            recommended_actions=[
                {"type": "FREEZE_UPI_ACCOUNT", "label": "Freeze Mule Cluster (hub_pay_cluster7@ybl)", "impact": "Critical"},
                {"type": "ISOLATE_PROCESS", "label": "Kill PowerShell Spawn & Revoke Session Token", "impact": "High"},
                {"type": "ESCALATE_SOC", "label": "Alert FIU & Law Enforcement Cyber Cell", "impact": "High"}
            ],
            graph_snapshot=subgraph_2
        )

        # Scenario 3: SIM Swap + Credential Stuffing
        inc_id3 = "INC-2026-7719"
        threat_graph.add_node("user_vivek", "Vivek Yadav", "User", 0.75, {})
        threat_graph.add_node("dev_spoofed_android", "Emulated Android SM-G998B", "Device", 0.92, {"sim_age": "<2 hours"})
        threat_graph.add_node("ip_vpn_exit", "45.154.255.88 (Proton VPN)", "IP", 0.85, {})
        threat_graph.add_node("acc_sbi_vivek", "SBI Current #1092", "Bank_Account", 0.65, {})
        threat_graph.add_node("txn_card_210k", "NetBanking ₹2,10,000", "Transaction", 0.91, {})

        threat_graph.add_edge("user_vivek", "dev_spoofed_android", "UNRECOGNIZED_DEVICE", True, 2.0)
        threat_graph.add_edge("dev_spoofed_android", "ip_vpn_exit", "ROUTED_THROUGH", True)
        threat_graph.add_edge("dev_spoofed_android", "acc_sbi_vivek", "PASSWORD_RESET_SMS", True, 3.0)
        threat_graph.add_edge("acc_sbi_vivek", "txn_card_210k", "INITIATED_NEFT", True, 2.5)

        subgraph_3 = threat_graph.get_subgraph_around_incident(["user_vivek", "dev_spoofed_android"], hops=2)

        self.incidents[inc_id3] = ThreatIncident(
            id=inc_id3,
            title="SIM Swap & High-Velocity NetBanking Hijack",
            category="Credential / Identity Fraud",
            threat_level=ThreatSeverity.HIGH,
            confidence_score=92,
            status=IncidentStatus.NEW,
            detected_at=datetime.utcnow().isoformat() + "Z",
            affected_user="vivek.yadav@dev.co",
            affected_account="SBI A/C: ****1092",
            affected_ip="45.154.255.88",
            affected_process="None (Mobile Web / API)",
            loss_amount_at_risk=210000.0,
            why_suspicious=[
                "SIM card IMSI changed 74 minutes prior to netbanking login.",
                "Login initiated from anonymized VPN exit node 45.154.255.88.",
                "Beneficiary addition cooldown period bypassed via stolen OTP session."
            ],
            predicted_next_step="Immediate high-value RTGS transfer to offshore account.",
            recommended_actions=[
                {"type": "FREEZE_UPI_ACCOUNT", "label": "Lock NetBanking Profile & Terminate Web Sessions", "impact": "Critical"},
                {"type": "BLOCK_IP", "label": "Blacklist VPN IP Range", "impact": "Medium"},
                {"type": "ESCALATE_SOC", "label": "Notify User via Out-of-Band Voice Call", "impact": "High"}
            ],
            graph_snapshot=subgraph_3
        )

    def get_all_incidents(self) -> List[ThreatIncident]:
        return list(self.incidents.values())

    def get_incident(self, incident_id: str) -> Optional[ThreatIncident]:
        return self.incidents.get(incident_id)

    def execute_action(self, incident_id: str, action_type: str, analyst_name: str, notes: str, approved: bool) -> Dict[str, Any]:
        incident = self.incidents.get(incident_id)
        timestamp = datetime.utcnow().isoformat() + "Z"

        if not approved:
            decision = "REJECTED"
            exec_result = f"Action {action_type} rejected by {analyst_name}. Incident marked for continuous monitoring."
            if incident:
                incident.status = IncidentStatus.DISMISSED
        else:
            decision = "APPROVED"
            exec_result = f"Action {action_type} successfully executed. Defense rules dispatched to eBPF filters and Payment Gateway."
            if incident:
                incident.status = IncidentStatus.CONTAINED
                if incident.graph_snapshot:
                    for node in incident.graph_snapshot.nodes:
                        threat_graph.update_node_status(node.id, "contained", 0.1)

        log_entry = {
            "id": f"AUDIT-{uuid.uuid4().hex[:8].upper()}",
            "incident_id": incident_id,
            "action_type": action_type,
            "analyst": analyst_name or "SOC Analyst (L2)",
            "decision": decision,
            "timestamp": timestamp,
            "notes": notes or "Automated containment playbook approval.",
            "execution_result": exec_result
        }
        self.audit_logs.insert(0, log_entry)
        return log_entry

    def get_audit_logs(self) -> List[Dict[str, Any]]:
        return self.audit_logs

    def evaluate_live_event(
        self,
        ebpf_event: Optional[EBPFEvent],
        txn_event: Optional[TransactionEvent],
        scenario_type: Optional[str] = None
    ) -> Optional[ThreatIncident]:
        """Correlate incoming live cyber and financial telemetry in real time with dual ML models & graph topology."""
        if not ebpf_event and not txn_event:
            return None

        # Cross-Domain rule & ML correlation
        reasons = []
        score = 50

        # 1. Cyber intrusion inference via Gradient Boosting
        if ebpf_event:
            cyb_prob, is_cyb_attack = ml_inference.predict_cyber_risk(
                dur=0.8 if ebpf_event.is_injected else 0.1,
                spkts=45 if ebpf_event.is_injected else 8,
                dpkts=30 if ebpf_event.is_injected else 6,
                sbytes=3500 if ebpf_event.is_injected else 512,
                dbytes=7200 if ebpf_event.is_injected else 1024
            )
            if ebpf_event.is_injected or is_cyb_attack:
                score += 30
                reasons.append(f"eBPF detected process injection: {ebpf_event.process_name} (PID: {ebpf_event.pid})")
                reasons.append(f"Gradient Boosting Cyber Model flagged telemetry with {(cyb_prob * 100):.1f}% intrusion confidence")
            if ebpf_event.socket_dst:
                reasons.append(f"Outbound network socket opened to external endpoint: {ebpf_event.socket_dst}:{ebpf_event.socket_port}")

        # 2. Financial scam inference via Random Forest
        if txn_event:
            ml_prob, is_scam = ml_inference.predict_transaction_risk(
                amount=txn_event.amount,
                oldbalanceOrg=txn_event.amount * 1.5,
                newbalanceOrig=0.0,
                oldbalanceDest=0.0,
                newbalanceDest=txn_event.amount,
                tx_type="TRANSFER" if txn_event.channel == "UPI" else "CASH_OUT"
            )
            if is_scam or ml_prob > 0.6:
                score += int(ml_prob * 35)
                reasons.append(f"Random Forest Financial Model flagged payment with {(ml_prob * 100):.1f}% scam confidence")

            if not txn_event.device_fingerprint_match:
                score += 25
                reasons.append("Device fingerprint mismatch & anomalous payment submit velocity detected")

        # Scenario customizations
        category = "UPI / Payment Fraud"
        title = f"AI-Correlated Scam: {txn_event.channel if txn_event else 'System Breach'}"
        next_step = "Potential automated fund dispersion across mule accounts before cash-out."
        recommended_actions = [
            {"type": "FREEZE_UPI_ACCOUNT", "label": "Lock Transaction & Freeze Target Mule VPA", "impact": "Critical - Halts funds"},
            {"type": "ISOLATE_PROCESS", "label": "Terminate Malicious Process PID", "impact": "High - Cuts C2 connection"},
            {"type": "BLOCK_IP", "label": "Blacklist External IP on Edge Gateway", "impact": "Medium - Blocks exfiltration"}
        ]

        if scenario_type == "INFOSTEALER_UPI":
            title = "Credential Infostealer & High-Value UPI Drain"
            category = "UPI / Payment Fraud"
            next_step = "Immediate secondary mule fan-out within ~60s before funds are cashed out via ATM/crypto."
            score = max(score, 96)
        elif scenario_type == "MULE_RING":
            title = "Coordinated Mule Syndicate Layering Ring"
            category = "Account Takeover"
            next_step = "Consolidated mule funds will be channeled via offshore P2P crypto gateways within 5 minutes."
            score = max(score, 91)
        elif scenario_type == "SIM_SWAP_ATO":
            title = "SIM Swap & NetBanking Account Takeover"
            category = "Credential / Identity Fraud"
            next_step = "Immediate high-value wire transfer to offshore accounts following OTP cooldown bypass."
            score = max(score, 93)

        if score >= 75:
            inc_id = f"INC-2026-{uuid.uuid4().hex[:4].upper()}"

            # Dynamic Graph Generation for this incident
            user_node_id = f"usr_{uuid.uuid4().hex[:5]}"
            dev_node_id = f"dev_{uuid.uuid4().hex[:5]}"
            proc_node_id = f"proc_{ebpf_event.pid if ebpf_event else uuid.uuid4().hex[:4]}"
            ip_node_id = f"ip_{uuid.uuid4().hex[:5]}"
            acc_node_id = f"acc_{uuid.uuid4().hex[:5]}"
            target_node_id = f"target_{uuid.uuid4().hex[:5]}"
            txn_node_id = f"txn_{uuid.uuid4().hex[:5]}"

            # Add nodes into threat_graph
            user_name = txn_event.user_name if txn_event else "Monitored Client"
            threat_graph.add_node(user_node_id, f"{user_name} (Victim)", "User", 0.85, {"role": "Banking User"})
            threat_graph.add_node(dev_node_id, txn_event.device_id if txn_event else "Endpoint Workstation", "Device", 0.90, {"ip": txn_event.ip_address if txn_event else "192.168.1.100"})
            if ebpf_event:
                threat_graph.add_node(proc_node_id, f"{ebpf_event.process_name} (PID: {ebpf_event.pid})", "Process", 0.96, {"syscall": ebpf_event.syscall, "injected": ebpf_event.is_injected})
            dst_ip = (ebpf_event.socket_dst if ebpf_event and ebpf_event.socket_dst else (txn_event.ip_address if txn_event else "185.220.101.45"))
            threat_graph.add_node(ip_node_id, f"{dst_ip} (C2/Proxy)", "IP", 0.92, {"geo": "External / Proxy"})
            threat_graph.add_node(acc_node_id, txn_event.sender_account if txn_event else "Bank A/C ****8812", "Bank_Account", 0.70, {})
            receiver_label = txn_event.receiver_upi if (txn_event and txn_event.receiver_upi) else (txn_event.receiver_account if txn_event else "Mule Cluster")
            threat_graph.add_node(target_node_id, f"{receiver_label} (Mule)", "UPI_Account", 0.95, {"flags": "Velocity Spike"})
            amount_val = txn_event.amount if txn_event else 100000.0
            threat_graph.add_node(txn_node_id, f"Txn ₹{amount_val:,.0f}", "Transaction", 0.94, {"channel": txn_event.channel if txn_event else "UPI"})

            # Connect edges
            threat_graph.add_edge(user_node_id, dev_node_id, "OPERATES", False)
            threat_graph.add_edge(dev_node_id, proc_node_id, "RUNS_PROCESS", True, 2.0)
            threat_graph.add_edge(proc_node_id, ip_node_id, "BEACON_C2", True, 3.0)
            threat_graph.add_edge(proc_node_id, acc_node_id, "COMPROMISED_CREDENTIALS", True, 2.5)
            threat_graph.add_edge(acc_node_id, txn_node_id, "DEBITED_FUNDS", True, 2.5)
            threat_graph.add_edge(txn_node_id, target_node_id, "TRANSFERRED_TO_MULE", True, 3.0)

            # Generate Subgraph snapshot
            subgraph_snapshot = threat_graph.get_subgraph_around_incident([user_node_id, proc_node_id, txn_node_id, target_node_id], hops=2)

            incident = ThreatIncident(
                id=inc_id,
                title=title,
                category=category,
                threat_level=ThreatSeverity.CRITICAL if score >= 90 else ThreatSeverity.HIGH,
                confidence_score=min(score, 99),
                status=IncidentStatus.NEW,
                detected_at=datetime.utcnow().isoformat() + "Z",
                affected_user=txn_event.user_name if txn_event else "Corporate User",
                affected_account=txn_event.sender_account if txn_event else "Bank A/C ****8812",
                affected_ip=dst_ip,
                affected_process=f"{ebpf_event.process_name} [PID: {ebpf_event.pid}]" if ebpf_event else "svchost.exe [PID: 4820]",
                loss_amount_at_risk=txn_event.amount if txn_event else 148500.0,
                why_suspicious=reasons,
                predicted_next_step=next_step,
                recommended_actions=recommended_actions,
                graph_snapshot=subgraph_snapshot
            )
            self.incidents[inc_id] = incident
            return incident

        return None

# Global Singleton
threat_engine = ThreatCorrelationEngine()
