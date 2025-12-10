from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import NearestNeighbors
from sklearn.model_selection import GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, f1_score
from datetime import datetime, timedelta

app = FastAPI(title="CodeStreak ML Service", version="0.1.0")

class Activity(BaseModel):
    platform: str
    topic: str | None = None
    success: int
    time_spent: float
    date: str

class UserPayload(BaseModel):
    user_id: str
    activities: List[Activity]

def extract_features(activities: List[Activity]) -> np.ndarray:
    if not activities:
        return np.array([])
    # Features: time_spent, success, topic diversity, rolling success rate, day of week, hour
    features = []
    for a in activities:
        topic_div = len(set(act.topic or "unknown" for act in activities)) / len(activities)
        rolling_success = sum(act.success for act in activities[-10:]) / max(1, len(activities[-10:]))
        try:
            dt = datetime.fromisoformat(a.date.replace('Z', '+00:00'))
            dow = dt.weekday() / 6.0  # normalize 0-6
            hour = dt.hour / 23.0  # normalize 0-23
        except:
            dow = 0.5
            hour = 0.5
        features.append([a.time_spent, a.success, topic_div, rolling_success, dow, hour])
    return np.array(features)

def preprocess_data(X: np.ndarray, y: np.ndarray) -> tuple:
    # Remove outliers (simple: clip time_spent)
    X[:, 0] = np.clip(X[:, 0], 0, 300)  # assume max 5 hours
    # Normalize
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled, y

def evaluate_model(model, X, y):
    scores = cross_val_score(model, X, y, cv=3, scoring='accuracy')
    return float(np.mean(scores))

@app.post("/weak-topics")
def weak_topics(payload: UserPayload) -> Dict[str, Any]:
    # Group by topic and compute success rate
    topics = {}
    for a in payload.activities:
        t = a.topic or "unknown"
        if t not in topics:
            topics[t] = {"attempts": 0, "success": 0}
        topics[t]["attempts"] += 1
        topics[t]["success"] += int(a.success)
    # Compute success ratios
    topic_ratios = []
    for k, v in topics.items():
        ratio = v["success"] / max(1, v["attempts"])
        topic_ratios.append({"topic": k, "score": float(ratio)})
    # Sort by score ascending (lowest first), then by topic name for consistency
    weak_topics = sorted(topic_ratios, key=lambda x: (x["score"], x["topic"]))[:3]
    return {"weakTopics": weak_topics}

@app.post("/performance")
def performance(payload: UserPayload) -> Dict[str, Any]:
    # Simple features: time_spent -> success
    if len(payload.activities) < 5:
        return {"potdSuccessProb": 0.5, "riskOfDrop": 0.5, "accuracy": 0.5}
    X = np.array([[a.time_spent] for a in payload.activities])
    y = np.array([a.success for a in payload.activities])
    try:
        lr = LogisticRegression(max_iter=1000).fit(X, y)
        prob = float(lr.predict_proba([[np.median(X)]])[0][1])
        acc_lr = evaluate_model(lr, X, y)
    except Exception:
        prob = float(np.mean(y))
        acc_lr = 0.5
    try:
        dt = DecisionTreeClassifier(max_depth=3, random_state=42).fit(X, y)
        prob_dt = float(np.mean([p[1] for p in dt.predict_proba(X)]))
        acc_dt = evaluate_model(dt, X, y)
    except Exception:
        prob_dt = prob
        acc_dt = 0.5
    risk = float(1 - (prob + prob_dt) / 2)
    acc = (acc_lr + acc_dt) / 2
    return {"potdSuccessProb": prob, "riskOfDrop": risk, "accuracy": acc}

@app.post("/time-accuracy")
def time_accuracy(payload: UserPayload) -> Dict[str, Any]:
    if len(payload.activities) < 3:
        return {"slope": 0.0, "insight": "Not enough data", "accuracy": 0.5}
    X_raw = extract_features(payload.activities)
    if X_raw.size == 0:
        return {"slope": 0.0, "insight": "Not enough data", "accuracy": 0.5}
    y = np.array([a.success for a in payload.activities])
    X, y = preprocess_data(X_raw, y)  # all features -> success
    if len(X) < 3:
        return {"slope": 0.0, "insight": "Not enough data", "accuracy": 0.5}
    # Use GradientBoostingRegressor with tuning
    param_grid = {'n_estimators': [50, 100], 'max_depth': [3, 5]}
    gbr = GradientBoostingRegressor(random_state=42)
    grid = GridSearchCV(gbr, param_grid, cv=3, scoring='r2')
    grid.fit(X, y)
    best_gbr = grid.best_estimator_
    slope = float(best_gbr.feature_importances_[0])  # time_spent importance
    # Accuracy as R^2 score
    acc = float(grid.best_score_)
    insight = "Spending more time improves accuracy" if slope > 0.1 else "Consider focused practice; more time doesn't improve outcomes"
    return {"slope": slope, "insight": insight, "accuracy": acc}

@app.post("/recommendations")
def recommendations(payload: UserPayload) -> Dict[str, Any]:
    # KNN on topics: recommend most similar topics to user's failures
    topics = [a.topic or "unknown" for a in payload.activities]
    uniq = sorted(set(topics))
    topic_to_idx = {t: i for i, t in enumerate(uniq)}
    user_vec = np.zeros((len(uniq),), dtype=float)
    for a in payload.activities:
        idx = topic_to_idx[a.topic or "unknown"]
        user_vec[idx] += 1.0 - float(a.success)
    # nearest topics to user's difficulties
    if len(uniq) == 0:
        return {"recommended": []}
    # pretend we have a catalog = uniq
    # recommend top-k topics with highest difficulty weights
    order = np.argsort(user_vec)[::-1]
    rec_topics = [uniq[i] for i in order[:3]]
    # Stub problems
    recs = [{"platform": "leetcode", "id": f"{t}-practice", "title": f"Practice {t.title()}"} for t in rec_topics]
    return {"recommendedProblems": recs}

@app.post("/adaptive")
def adaptive(payload: UserPayload) -> Dict[str, Any]:
    # Learn best hour window with most successes
    hours = {}
    for a in payload.activities:
        try:
            h = int(a.date.split("T")[1][:2])
        except Exception:
            h = 19
        hours.setdefault(h, {"s": 0, "n": 0})
        hours[h]["s"] += a.success
        hours[h]["n"] += 1
    if not hours:
        return {"window": "19-21"}
    # choose hour with best success rate
    best_h = max(hours.items(), key=lambda kv: (kv[1]["s"]/max(1,kv[1]["n"]))) [0]
    start = best_h
    end = (best_h + 2) % 24
    return {"window": f"{start}-{end}"}

@app.post("/retrain")
def retrain(_: Dict[str, Any]) -> Dict[str, Any]:
    # Stub: in real system we would reload datasets and retrain models
    return {"status": "ok"}

from datetime import datetime

@app.post("/insights")
def insights(payload: UserPayload) -> Dict[str, Any]:
    # Aggregate all signals
    wt = weak_topics(payload)
    pf = performance(payload)
    ta = time_accuracy(payload)
    rc = recommendations(payload)
    ad = adaptive(payload)
    return {
        "weakTopics": wt.get("weakTopics", []),
        "predictions": {"potdSuccess": pf.get("potdSuccessProb", 0.5), "riskOfDrop": pf.get("riskOfDrop", 0.5)},
        "timeInsights": {
            "peakHours": ta.get("insight", "Not available"),
            "reminderWindow": ad.get("window", "Not available")
        },
        "recommendedProblems": rc.get("recommendedProblems", []),
        "modelAccuracy": {
            "performanceAccuracy": pf.get("accuracy", 0.5),
            "timeAccuracyScore": ta.get("accuracy", 0.5)
        },
        "lastUpdated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
