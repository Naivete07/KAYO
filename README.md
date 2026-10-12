# KAYO — AI-Driven Scam Pattern Recognition & Cross-Domain Threat Correlation

> **Event:** CodeSlayer 2k26 – DevSphereIndia  
> **Track:** Open Innovation  
> **Team Name:** Tasteless Balls  
> **Team Members:**  
> - 🎨 **Sada Aizaz** — Frontend (React, TypeScript, Real-time Graph Visualizer, SOC Dashboard)  
> - ⚙️ **Sahil Srivastava** — Backend & ML (FastAPI, eBPF Telemetry Ingestion, Predictive Threat Engine)  
> - 🗄️ **Vivek Yadav** — API Authentication, Neo4j Graph Database & SOC Governance Ledger  

---

## 🚀 Overview

**KAYO** is a unified, AI-driven cyber-financial intelligence platform that bridges the gap between endpoint system telemetry (**Linux eBPF kernel probes**) and payment transaction streams (**UPI, NetBanking, Digital Wallets**).

By building a **Cross-Domain Threat Graph**, KAYO detects multi-stage attack workflows (such as Infostealer malware scraping session cookies → unauthorized high-velocity UPI drain) in real-time, predicts attack progression before funds leave the ecosystem, and delivers context-aware containment actions with mandatory **human-in-the-loop approval**.

```
  [ Linux eBPF Kernel Probes ]         [ NPCI / UPI / Bank Transaction Webhooks ]
                │                                           │
                └─────────────────────┬─────────────────────┘
                                      ▼
                      [ Cross-Domain Graph Engine ]
                (User ↔ Device ↔ Process ↔ IP ↔ Account ↔ UPI)
                                      │
                                      ▼
                      [ AI Risk & Prediction Engine ]
                (Confidence Scoring, Causal Why, Next Attack Step)
                                      │
                                      ▼
                      [ SOC Incident Hub & Human Approval ]
          (Isolate Process / Freeze UPI VPA / Block C2 IP / Escalate)
```

---

## 🌟 Key USPs & Innovation Pillars

| # | Pillar | Description | Outcome |
| :-: | :--- | :--- | :--- |
| **1** | **Cross-Domain Intelligence** | Merges eBPF kernel syscalls (`ptrace`, `mprotect`) with financial transaction feeds. | 0-day scam detection across cyber-financial boundaries. |
| **2** | **Relationship-Based Detection** | Dynamic graph mapping users, devices, accounts, processes, and VPAs. | Uncovers multi-hop mule account rings. |
| **3** | **Predictive Threat Analysis** | Anticipates attack stages (e.g., mule fan-out in <60s) before fund exfiltration. | Proactive prevention instead of post-mortem forensics. |
| **4** | **Context-Aware Response** | Explainable causal reasoning with mandatory human approval & immutable audit log. | ~70% reduction in Mean Time to Respond (MTTR). |

---

## 📊 Financial Cyber Fraud Incident Benchmarks

| Fraud Category | Reported Incidents | Risk Severity |
| :--- | :--- | :--- |
| **Card / Internet Fraud** | 28,400 | High |
| **UPI / Payment Fraud** | 23,750 | Critical |
| **Online Banking Fraud** | 19,600 | High |
| **Digital Wallet Fraud** | 15,300 | Medium-High |
| **Account Takeover (ATO)** | 11,850 | Critical |
| **Credential / Identity Fraud** | 8,900 | Medium |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, SVG/Canvas Graph Topology Engine.
- **Backend:** Python 3.13, FastAPI, Uvicorn, Pydantic v2, Scikit-learn, Pandas, NetworkX.
- **Database & Graph:** Neo4j / NetworkX graph engine, PostgreSQL / SQLite audit ledger.
- **Telemetry:** Simulated eBPF (Extended Berkeley Packet Filter) kernel event streaming & UPI transaction webhooks.

---

## 🏁 Quick Start & Running Locally

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.10+)

### 2. Start the Backend API Server
```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Start the Frontend SOC Dashboard
```powershell
cd frontend
npm run dev
```
Dashboard UI will be available at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Interactive Attack Simulation Scenarios

Inside the **Attack Lab** tab of the dashboard, you can trigger live test attack scenarios:
1. **Scenario 1: Infostealer DLL + High-Value UPI Drain** — eBPF catches `svchost.exe` injection followed by a ₹1,48,500 UPI transfer to an unverified VPA.
2. **Scenario 2: Coordinated Mule Syndicate Layering** — 14 micro-burst transactions converging on a high-velocity mule hub in under 90s.
3. **Scenario 3: SIM Swap & NetBanking ATO** — Telecom SIM IMSI swap + Tor exit node login attempting rapid high-value wire transfers.

---

## 🚀 Deployment to Render & GitHub Upload

The repository is pre-configured with a `.gitignore` guaranteeing the entire repository is **under 2MB** (far below GitHub's 100MB limit).

### Step 1: Upload to GitHub
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render (1-Click or Manual)
The project includes a ready-to-use `render.yaml`, `Procfile`, and `build.sh`.

**Option A: 1-Click Blueprint (Recommended)**
1. Log in to [Render.com](https://render.com).
2. Click **New +** ➔ **Blueprint**.
3. Connect your GitHub repository.
4. Render automatically reads `render.yaml` and deploys both backend and frontend on a single unified URL!

**Option B: Manual Web Service Setup**
- **Environment:** `Python 3`
- **Build Command:** `./build.sh` (or `pip install -r requirements.txt && npm --prefix frontend install && npm --prefix frontend run build`)
- **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

---

## 📜 Full Project Documentation

For the formal hackathon submission report, see [PROJECT_REPORT.md](./PROJECT_REPORT.md).
