import os
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple

import os
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = WORKSPACE_ROOT / "data" / "models"

FIN_FEATURE_COLS = [
    'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest',
    'type_TRANSFER', 'type_CASH_OUT', 'type_PAYMENT',
    'orig_balance_err', 'dest_balance_err', 'orig_drained', 'dest_had_zero', 'high_value'
]

CYB_FEATURE_COLS = [
    'dur', 'spkts', 'dpkts', 'sbytes', 'dbytes', 'rate', 'sttl', 'dttl', 'sload', 'dload', 'sloss', 'dloss'
]

class ModelInferenceEngine:
    def __init__(self):
        self.fin_model = None
        self.fin_scaler = None
        self.cyb_model = None
        self.cyb_scaler = None
        self.is_loaded = False
        self.load_models()

    def load_models(self):
        try:
            fin_model_path = MODELS_DIR / "financial_scam_model.pkl"
            fin_scaler_path = MODELS_DIR / "financial_scaler.pkl"
            cyb_model_path = MODELS_DIR / "cyber_telemetry_model.pkl"
            cyb_scaler_path = MODELS_DIR / "cyber_scaler.pkl"

            if fin_model_path.exists() and fin_scaler_path.exists():
                with open(fin_model_path, "rb") as f:
                    self.fin_model = pickle.load(f)
                with open(fin_scaler_path, "rb") as f:
                    self.fin_scaler = pickle.load(f)

            if cyb_model_path.exists() and cyb_scaler_path.exists():
                with open(cyb_model_path, "rb") as f:
                    self.cyb_model = pickle.load(f)
                with open(cyb_scaler_path, "rb") as f:
                    self.cyb_scaler = pickle.load(f)

            if self.fin_model is not None and self.cyb_model is not None:
                self.is_loaded = True
                print("[+] Loaded trained Financial & Cyber ML models into Inference Engine")
            elif self.fin_model is not None:
                self.is_loaded = True
                print("[+] Loaded trained Financial ML model into Inference Engine")
        except Exception as e:
            print(f"[!] Warning: Could not load trained models: {e}")

    def predict_transaction_risk(
        self,
        amount: float,
        oldbalanceOrg: float,
        newbalanceOrig: float,
        oldbalanceDest: float,
        newbalanceDest: float,
        tx_type: str = "TRANSFER"
    ) -> Tuple[float, bool]:
        """
        Calculates real-time scam probability using trained Random Forest model.
        Returns: (probability: float [0..1], is_fraud: bool)
        """
        if not self.is_loaded or self.fin_model is None or self.fin_scaler is None:
            # Fallback heuristic
            score = 0.85 if amount > 100000 and (oldbalanceOrg - newbalanceOrig) >= amount else 0.15
            return score, score > 0.6

        # Feature vector matching training columns
        orig_err = oldbalanceOrg - newbalanceOrig - amount
        dest_err = newbalanceDest - oldbalanceDest - amount
        orig_drained = 1 if oldbalanceOrg > 0 and newbalanceOrig == 0 else 0
        dest_had_zero = 1 if oldbalanceDest == 0 else 0
        high_value = 1 if amount > 150000 else 0

        vec = [
            amount, oldbalanceOrg, newbalanceOrig, oldbalanceDest, newbalanceDest,
            1 if tx_type == 'TRANSFER' else 0,
            1 if tx_type == 'CASH_OUT' else 0,
            1 if tx_type == 'PAYMENT' else 0,
            orig_err, dest_err, orig_drained, dest_had_zero, high_value
        ]

        # Use DataFrame with feature names to avoid sklearn UserWarning
        vec_df = pd.DataFrame([vec], columns=FIN_FEATURE_COLS)
        scaled_vec = self.fin_scaler.transform(vec_df)
        prob = float(self.fin_model.predict_proba(scaled_vec)[0, 1])
        is_fraud = bool(prob >= 0.5)
        return prob, is_fraud

    def predict_cyber_risk(
        self,
        dur: float = 0.5,
        spkts: int = 14,
        dpkts: int = 12,
        sbytes: int = 1024,
        dbytes: int = 2048,
        rate: float = 28.5,
        sttl: int = 64,
        dttl: int = 252,
        sload: float = 12000.0,
        dload: float = 24000.0,
        sloss: int = 0,
        dloss: int = 0
    ) -> Tuple[float, bool]:
        """
        Calculates cyber intrusion probability using trained Gradient Boosting model.
        Returns: (probability: float [0..1], is_attack: bool)
        """
        if not self.is_loaded or self.cyb_model is None or self.cyb_scaler is None:
            return 0.1, False

        vec = [
            dur, spkts, dpkts, sbytes, dbytes, rate, sttl, dttl, sload, dload, sloss, dloss
        ]
        vec_df = pd.DataFrame([vec], columns=CYB_FEATURE_COLS)
        scaled_vec = self.cyb_scaler.transform(vec_df)
        prob = float(self.cyb_model.predict_proba(scaled_vec)[0, 1])
        is_attack = bool(prob >= 0.5)
        return prob, is_attack

# Singleton inference engine
ml_inference = ModelInferenceEngine()
