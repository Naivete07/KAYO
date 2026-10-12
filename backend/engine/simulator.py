import random
import time
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Tuple
from models.schemas import EBPFEvent, TransactionEvent, ThreatSeverity

# Realistic benign and malicious pools
PROCESS_POOL = [
    {"name": "chrome.exe", "syscall": "sys_enter_recvfrom", "injected": False, "priv": False, "sev": ThreatSeverity.LOW},
    {"name": "code.exe", "syscall": "sys_enter_read", "injected": False, "priv": False, "sev": ThreatSeverity.LOW},
    {"name": "teams.exe", "syscall": "sys_enter_write", "injected": False, "priv": False, "sev": ThreatSeverity.LOW},
    {"name": "bank_sync_service.exe", "syscall": "sys_enter_connect", "injected": False, "priv": False, "sev": ThreatSeverity.LOW},
    {"name": "powershell.exe", "syscall": "sys_enter_ptrace", "injected": True, "priv": True, "sev": ThreatSeverity.HIGH},
    {"name": "mimikatz.exe", "syscall": "sys_enter_process_vm_readv", "injected": True, "priv": True, "sev": ThreatSeverity.CRITICAL},
    {"name": "svchost.exe", "syscall": "sys_enter_mprotect", "injected": True, "priv": False, "sev": ThreatSeverity.CRITICAL}
]

USERS_POOL = [
    {"id": "usr_991", "name": "Aarav Sharma", "acc": "HDFC ****9910", "city": "Mumbai", "ip": "49.36.120.14"},
    {"id": "usr_992", "name": "Priya Nair", "acc": "ICICI ****4419", "city": "Bengaluru", "ip": "106.51.78.22"},
    {"id": "usr_993", "name": "Rohan Patel", "acc": "SBI ****7721", "city": "Ahmedabad", "ip": "117.200.19.45"},
    {"id": "usr_994", "name": "Ananya Gupta", "acc": "Axis ****3320", "city": "Delhi NCR", "ip": "122.161.88.90"},
    {"id": "usr_995", "name": "Vikram Sethi", "acc": "Kotak ****1188", "city": "Hyderabad", "ip": "183.82.112.5"}
]

MULE_VPAS = [
    "quickmoney_fast@okaxis",
    "instantcash_2026@ybl",
    "p2p_crypto_node@paytm",
    "global_exfil_escrow@ibl"
]

class TelemetrySimulator:
    def __init__(self):
        self.is_running = True
        self.attack_mode = False

    def generate_ebpf_event(self, force_malicious: bool = False) -> EBPFEvent:
        if force_malicious:
            p = random.choice([p for p in PROCESS_POOL if p["injected"]])
        else:
            p = random.choices(PROCESS_POOL, weights=[30, 25, 20, 15, 5, 3, 2])[0]

        is_suspicious = p["injected"]
        return EBPFEvent(
            id=f"EBPF-{random.randint(100000, 999999)}",
            timestamp=datetime.utcnow().isoformat() + "Z",
            process_name=p["name"],
            pid=random.randint(1024, 65535),
            ppid=random.randint(500, 2000),
            syscall=p["syscall"],
            socket_dst=f"{random.randint(45, 195)}.{random.randint(10, 250)}.{random.randint(1, 254)}.{random.randint(1, 254)}",
            socket_port=random.choice([443, 80, 8080, 4444, 9001]),
            is_injected=p["injected"],
            is_privilege_escalation=p["priv"],
            severity=p["sev"],
            details=f"eBPF probe hooked {p['syscall']} in {p['name']}." + (" [ANOMALOUS MEMORY ACCESS]" if is_suspicious else " Normal execution.")
        )

    def generate_transaction_event(self, force_fraud: bool = False) -> TransactionEvent:
        user = random.choice(USERS_POOL)
        channels = ["UPI", "NetBanking", "Wallet", "Card"]
        channel = random.choice(channels)

        if force_fraud:
            amount = round(random.uniform(95000, 250000), 2)
            receiver_vpa = random.choice(MULE_VPAS)
            receiver_acc = f"MULE_ACC_{random.randint(1000, 9999)}"
            velocity = random.randint(4, 9)
            fingerprint_match = False
            is_new = True
            ip = f"185.220.{random.randint(100, 200)}.{random.randint(1, 250)}"
        else:
            amount = round(random.uniform(50, 4500), 2)
            receiver_vpa = f"merchant_{random.randint(10, 99)}@upi"
            receiver_acc = f"ACC_{random.randint(1000, 9999)}"
            velocity = 1
            fingerprint_match = True
            is_new = random.choice([True, False])
            ip = user["ip"]

        return TransactionEvent(
            id=f"TXN-{random.randint(1000000, 9999999)}",
            timestamp=datetime.utcnow().isoformat() + "Z",
            user_id=user["id"],
            user_name=user["name"],
            channel=channel,
            sender_account=user["acc"],
            receiver_account=receiver_acc,
            receiver_upi=receiver_vpa,
            amount=amount,
            currency="INR",
            ip_address=ip,
            device_id=f"DEV-{random.randint(1000, 9999)}",
            location=user["city"] if not force_fraud else "Unknown / VPN Exit",
            is_new_payee=is_new,
            velocity_last_5min=velocity,
            device_fingerprint_match=fingerprint_match
        )

    def generate_scenario_events(self, scenario_type: str) -> Tuple[EBPFEvent, TransactionEvent]:
        """Generates scenario-specific telemetry pair for realistic threat simulation."""
        user = random.choice(USERS_POOL)
        now_ts = datetime.utcnow().isoformat() + "Z"

        if scenario_type == "INFOSTEALER_UPI":
            ebpf_ev = EBPFEvent(
                id=f"EBPF-{random.randint(100000, 999999)}",
                timestamp=now_ts,
                process_name="svchost.exe (Injected: RedLine DLL)",
                pid=4820,
                ppid=768,
                syscall="sys_enter_mprotect",
                socket_dst="185.220.101.45",
                socket_port=443,
                is_injected=True,
                is_privilege_escalation=True,
                severity=ThreatSeverity.CRITICAL,
                details="eBPF kernel probe caught unauthorized memory write/injection in svchost.exe dumping browser session credentials."
            )
            txn_ev = TransactionEvent(
                id=f"TXN-{random.randint(1000000, 9999999)}",
                timestamp=now_ts,
                user_id=user["id"],
                user_name=user["name"],
                channel="UPI",
                sender_account=user["acc"],
                receiver_account="MULE_ACC_8812",
                receiver_upi="quickcash99@okaxis",
                amount=148500.0,
                currency="INR",
                ip_address="185.220.101.45",
                device_id="DEV-SPOOFED-X1",
                location="Tor Exit / Netherlands",
                is_new_payee=True,
                velocity_last_5min=4,
                device_fingerprint_match=False
            )
        elif scenario_type == "MULE_RING":
            ebpf_ev = EBPFEvent(
                id=f"EBPF-{random.randint(100000, 999999)}",
                timestamp=now_ts,
                process_name="powershell.exe [PID: 3104]",
                pid=3104,
                ppid=1200,
                syscall="sys_enter_ptrace",
                socket_dst="103.21.144.90",
                socket_port=8080,
                is_injected=True,
                is_privilege_escalation=False,
                severity=ThreatSeverity.HIGH,
                details="eBPF probe detected encoded PowerShell payload downloading multi-stage financial layering script."
            )
            txn_ev = TransactionEvent(
                id=f"TXN-{random.randint(1000000, 9999999)}",
                timestamp=now_ts,
                user_id=user["id"],
                user_name=user["name"],
                channel="UPI",
                sender_account=user["acc"],
                receiver_account="MULE_RING_AGGREGATOR_07",
                receiver_upi="hub_pay_cluster7@ybl",
                amount=92000.0,
                currency="INR",
                ip_address="103.21.144.90",
                device_id="DEV-SHARED-MULE-HUB",
                location="Mule Proxy / Singapore",
                is_new_payee=True,
                velocity_last_5min=14,
                device_fingerprint_match=False
            )
        elif scenario_type == "SIM_SWAP_ATO":
            ebpf_ev = EBPFEvent(
                id=f"EBPF-{random.randint(100000, 999999)}",
                timestamp=now_ts,
                process_name="tor_worker.exe",
                pid=9182,
                ppid=990,
                syscall="sys_enter_connect",
                socket_dst="45.154.255.88",
                socket_port=9001,
                is_injected=True,
                is_privilege_escalation=False,
                severity=ThreatSeverity.HIGH,
                details="eBPF detected encrypted outbound socket routing to anonymized VPN/Tor proxy during active banking session."
            )
            txn_ev = TransactionEvent(
                id=f"TXN-{random.randint(1000000, 9999999)}",
                timestamp=now_ts,
                user_id=user["id"],
                user_name=user["name"],
                channel="NetBanking",
                sender_account=user["acc"],
                receiver_account="OFFSHORE_WIRE_1092",
                receiver_upi=None,
                amount=210000.0,
                currency="INR",
                ip_address="45.154.255.88",
                device_id="DEV-EMULATOR-SM998",
                location="Proton VPN / Zurich",
                is_new_payee=True,
                velocity_last_5min=1,
                device_fingerprint_match=False
            )
        else:
            ebpf_ev = self.generate_ebpf_event(force_malicious=True)
            txn_ev = self.generate_transaction_event(force_fraud=True)

        return ebpf_ev, txn_ev

simulator = TelemetrySimulator()
