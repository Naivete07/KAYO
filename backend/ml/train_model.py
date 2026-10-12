import os
import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix, precision_recall_fscore_support
from sklearn.preprocessing import StandardScaler

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = WORKSPACE_ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
MODELS_DIR = DATA_DIR / "models"

def train_financial_scam_model():
    """
    Trains an ensemble Scam Pattern Classifier on PaySim / UPI payment data.
    """
    data_path = RAW_DIR / "financial_fraud" / "paysim_financial_fraud_clean.csv"
    if not data_path.exists():
        print(f"[!] File not found: {data_path}")
        return None

    print("\n[+] Training Financial Scam & Fraud Pattern Recognition Model...")
    df = pd.read_csv(data_path)

    # Feature Engineering for Scam Pattern Recognition
    df['type_TRANSFER'] = (df['type'] == 'TRANSFER').astype(int)
    df['type_CASH_OUT'] = (df['type'] == 'CASH_OUT').astype(int)
    df['type_PAYMENT'] = (df['type'] == 'PAYMENT').astype(int)
    
    # Financial anomaly heuristics
    df['orig_balance_err'] = df['oldbalanceOrg'] - df['newbalanceOrig'] - df['amount']
    df['dest_balance_err'] = df['newbalanceDest'] - df['oldbalanceDest'] - df['amount']
    df['orig_drained'] = ((df['oldbalanceOrg'] > 0) & (df['newbalanceOrig'] == 0)).astype(int)
    df['dest_had_zero'] = (df['oldbalanceDest'] == 0).astype(int)
    df['high_value'] = (df['amount'] > 150000).astype(int)

    feature_cols = [
        'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest',
        'type_TRANSFER', 'type_CASH_OUT', 'type_PAYMENT',
        'orig_balance_err', 'dest_balance_err', 'orig_drained', 'dest_had_zero', 'high_value'
    ]

    X = df[feature_cols].fillna(0)
    y = df['isFraud'].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    clf.fit(X_train_scaled, y_train)

    y_pred = clf.predict(X_test_scaled)
    y_prob = clf.predict_proba(X_test_scaled)[:, 1]

    roc_auc = roc_auc_score(y_test, y_prob)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')

    print(f"    - Accuracy: {clf.score(X_test_scaled, y_test):.4f}")
    print(f"    - ROC-AUC: {roc_auc:.4f}")
    print(f"    - Precision: {precision:.4f} | Recall: {recall:.4f} | F1-Score: {f1:.4f}")

    # Feature Importance
    importances = dict(zip(feature_cols, clf.feature_importances_))
    sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print("    - Top Scam Indicators:")
    for feat, imp in sorted_importances[:5]:
        print(f"      * {feat}: {imp:.4f}")

    # Save artifacts
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with open(MODELS_DIR / "financial_scam_model.pkl", "wb") as f_model:
        pickle.dump(clf, f_model)
    with open(MODELS_DIR / "financial_scaler.pkl", "wb") as f_scaler:
        pickle.dump(scaler, f_scaler)

    metrics = {
        "model": "RandomForest-FinancialScamDetector",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "roc_auc": round(float(roc_auc), 4),
        "f1_score": round(float(f1), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "feature_importances": {k: round(float(v), 4) for k, v in sorted_importances},
        "features": feature_cols
    }

    with open(MODELS_DIR / "financial_model_metrics.json", "w") as f_met:
        json.dump(metrics, f_met, indent=2)

    return metrics

def train_cyber_telemetry_model():
    """
    Trains an eBPF / Network Cyber Threat Classifier on UNSW-NB15 dataset.
    """
    data_path = RAW_DIR / "cyber_telemetry" / "unsw_nb15" / "unsw_nb15_cyber_telemetry.csv"
    if not data_path.exists():
        print(f"[!] File not found: {data_path}")
        return None

    print("\n[+] Training eBPF & Cyber Intrusion Detection Model...")
    df = pd.read_csv(data_path)

    feature_cols = ['dur', 'spkts', 'dpkts', 'sbytes', 'dbytes', 'rate', 'sttl', 'dttl', 'sload', 'dload', 'sloss', 'dloss']
    available_cols = [c for c in feature_cols if c in df.columns]

    X = df[available_cols].fillna(0)
    y = df['label'].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    clf = GradientBoostingClassifier(n_estimators=80, max_depth=6, random_state=42)
    clf.fit(X_train_scaled, y_train)

    y_pred = clf.predict(X_test_scaled)
    y_prob = clf.predict_proba(X_test_scaled)[:, 1]

    roc_auc = roc_auc_score(y_test, y_prob)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')

    print(f"    - Cyber Model Accuracy: {clf.score(X_test_scaled, y_test):.4f}")
    print(f"    - ROC-AUC: {roc_auc:.4f} | F1-Score: {f1:.4f}")

    with open(MODELS_DIR / "cyber_telemetry_model.pkl", "wb") as f_model:
        pickle.dump(clf, f_model)
    with open(MODELS_DIR / "cyber_scaler.pkl", "wb") as f_scaler:
        pickle.dump(scaler, f_scaler)

    metrics = {
        "model": "GradientBoosting-CyberIntrusionDetector",
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "roc_auc": round(float(roc_auc), 4),
        "f1_score": round(float(f1), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "features": available_cols
    }

    with open(MODELS_DIR / "cyber_model_metrics.json", "w") as f_met:
        json.dump(metrics, f_met, indent=2)

    return metrics

if __name__ == "__main__":
    fin_metrics = train_financial_scam_model()
    cyb_metrics = train_cyber_telemetry_model()
    print("\n[+] Both ML Models successfully trained and serialized into data/models/!")
