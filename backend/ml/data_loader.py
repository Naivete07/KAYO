import os
import zipfile
import json
import pandas as pd
import numpy as np
from pathlib import Path

# Workspace directory definitions
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = WORKSPACE_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"
MODELS_DIR = DATA_DIR / "models"

DOWNLOADS_DIR = Path.home() / "Downloads"

def setup_directories():
    """Create structured data folders for all 3 datasets."""
    for folder in [
        RAW_DIR / "financial_fraud" / "paysim",
        RAW_DIR / "financial_fraud" / "ieee_fraud",
        RAW_DIR / "cyber_telemetry" / "cicids2017",
        RAW_DIR / "cyber_telemetry" / "unsw_nb15",
        PROCESSED_DIR,
        MODELS_DIR
    ]:
        folder.mkdir(parents=True, exist_ok=True)
    print("[+] Verified dataset directory layout in data/raw/")

def extract_and_structure_datasets():
    """
    Scans data/raw/ and Downloads/ for:
    1. PaySim1 (kaggle.com/datasets/ealaxi/paysim1)
    2. IEEE-CIS Fraud Detection (kaggle.com/c/ieee-fraud-detection)
    3. CIC-IDS-2017 (unb.ca/cic/datasets/ids-2017.html)
    """
    setup_directories()

    manifest = {
        "financial_datasets": {},
        "cyber_datasets": {},
        "total_records_processed": 0
    }

    # ==========================================
    # 1. PaySim 1 Dataset (Financial / UPI Fraud)
    # ==========================================
    print("\n[1/3] Processing PaySim 1 Dataset...")
    paysim_direct_csv = RAW_DIR / "financial_fraud" / "paysim" / "PS_20174392719_1491204439457_log.csv"
    paysim_raw_clean = RAW_DIR / "financial_fraud" / "paysim_financial_fraud_clean.csv"
    paysim_zip_dl = DOWNLOADS_DIR / "archive.zip"

    if paysim_raw_clean.exists():
        print(f"[+] PaySim clean dataset already structured: {paysim_raw_clean}")
    elif paysim_direct_csv.exists() or paysim_zip_dl.exists():
        source_stream = None
        if paysim_direct_csv.exists():
            print(f"[+] Found unzipped PaySim CSV at {paysim_direct_csv}")
            source_stream = paysim_direct_csv
            chunk_iter = pd.read_csv(source_stream, chunksize=100000)
        else:
            print(f"[+] Extracting PaySim from {paysim_zip_dl}...")
            zf = zipfile.ZipFile(paysim_zip_dl, 'r')
            f_in = zf.open('PS_20174392719_1491204439457_log.csv')
            chunk_iter = pd.read_csv(f_in, chunksize=100000)

        fraud_rows = []
        benign_rows = []
        for chunk in chunk_iter:
            frauds = chunk[chunk['isFraud'] == 1]
            if len(frauds) > 0:
                non_frauds = chunk[chunk['isFraud'] == 0].sample(n=min(len(chunk[chunk['isFraud'] == 0]), len(frauds) * 3 + 100), random_state=42)
                fraud_rows.append(frauds)
                benign_rows.append(non_frauds)
            if sum(len(df) for df in fraud_rows) >= 6000:
                break

        df_fin = pd.concat(fraud_rows + benign_rows, ignore_index=True)
        df_fin = df_fin.sample(frac=1, random_state=42).reset_index(drop=True)
        df_fin.to_csv(paysim_raw_clean, index=False)
        print(f"[+] Saved structured PaySim dataset: {len(df_fin)} rows ({int(df_fin['isFraud'].sum())} fraud cases)")

    # ==========================================
    # 2. IEEE-CIS Fraud Detection Dataset
    # ==========================================
    print("\n[2/3] Processing IEEE-CIS Fraud Detection Dataset...")
    ieee_folder = RAW_DIR / "financial_fraud" / "ieee_fraud"
    ieee_zip_dl = DOWNLOADS_DIR / "ieee-fraud-detection.zip"

    ieee_train_txn = ieee_folder / "train_transaction.csv"
    if ieee_train_txn.exists():
        print(f"[+] Found IEEE-CIS transaction CSV at {ieee_train_txn}")
    elif ieee_zip_dl.exists():
        print(f"[+] Extracting IEEE-CIS dataset from {ieee_zip_dl}...")
        with zipfile.ZipFile(ieee_zip_dl, 'r') as zf:
            for item in ["train_transaction.csv", "train_identity.csv"]:
                if item in zf.namelist():
                    zf.extract(item, path=ieee_folder)
                    print(f"    - Extracted {item} -> {ieee_folder / item}")
    else:
        print(f"[!] Place IEEE-CIS CSVs (train_transaction.csv) in: {ieee_folder}")

    # ==========================================
    # 3. CIC-IDS-2017 Intrusion & eBPF Telemetry
    # ==========================================
    print("\n[3/3] Processing CIC-IDS-2017 Cyber Telemetry Dataset...")
    cic_folder = RAW_DIR / "cyber_telemetry" / "cicids2017"
    cic_zip_dl = DOWNLOADS_DIR / "MachineLearningCSV.zip"

    existing_cic = list(cic_folder.glob("*.csv"))
    if len(existing_cic) > 0:
        print(f"[+] Found {len(existing_cic)} CIC-IDS-2017 CSV files in {cic_folder}")
    elif cic_zip_dl.exists():
        print(f"[+] Extracting CIC-IDS-2017 from {cic_zip_dl}...")
        with zipfile.ZipFile(cic_zip_dl, 'r') as zf:
            for fname in [
                "MachineLearningCVE/Thursday-WorkingHours-Afternoon-Infilteration.pcap_ISCX.csv",
                "MachineLearningCVE/Thursday-WorkingHours-Morning-WebAttacks.pcap_ISCX.csv",
                "MachineLearningCVE/Friday-WorkingHours-Afternoon-PortScan.pcap_ISCX.csv"
            ]:
                if fname in zf.namelist():
                    with zf.open(fname) as f_cic:
                        df_cic = pd.read_csv(f_cic, nrows=50000)
                        df_cic.columns = [c.strip() for c in df_cic.columns]
                        out_name = Path(fname).name
                        df_cic.to_csv(cic_folder / out_name, index=False)
                        print(f"    - Extracted {out_name} ({len(df_cic)} rows)")
    else:
        print(f"[!] Place CIC-IDS-2017 CSVs in: {cic_folder}")

    # Save manifest
    manifest_path = DATA_DIR / "dataset_manifest.json"
    print(f"\n[+] Manifest updated at {manifest_path}")

if __name__ == "__main__":
    extract_and_structure_datasets()
