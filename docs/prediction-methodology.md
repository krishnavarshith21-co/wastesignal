# WasteSignal — Hotspot Scoring & Prediction Methodology

## 1. Conceptual Framework & Separation of Concerns

WasteSignal strictly differentiates three separate analytical concepts:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. OBSERVED TELEMETRY                                          │
│ Historical, immutable records (GPS, timestamps, delay minutes,  │
│ fill levels, incident types). Ground truth facts.               │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. OPERATIONAL RISK SCORE (0–100)                              │
│ A deterministic multi-signal ranking index.                     │
│ NOT A PROBABILITY. (e.g. 72/100 does NOT mean 72% chance).     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. FORWARD RECURRENCE HORIZON (7-Day Projection)                │
│ A prototype operational forecasting heuristic based on arrival  │
│ intervals and periodicity. Flagged as prototype heuristic.      │
└─────────────────────────────────────────────────────────────────┘
```

> **Critical Notice**: WasteSignal does NOT claim a measured percentage accuracy (e.g. "98% accurate"). Without months of longitudinal ground-truth validation across a live municipal fleet, claiming statistical accuracy or calibrated probabilities would be misleading.

---

## 2. Deterministic Hotspot Risk Scoring Engine

### Scoring Formula
$$\text{Hotspot Score} = \sum_{i=1}^{6} (w_i \times s_i)$$

Where each signal $s_i \in [0, 100]$ is computed deterministically from observed telemetry, and weights $w_i$ sum to $1.0$:

| Signal | Weight ($w_i$) | Operational Meaning & Computation |
|---|---|---|
| **Recurrence ($s_1$)** | 0.25 | Ratio of historical repeat incidents in zone vs total events. Normalized $\min(100, (\text{repeats} / 4) \times 100)$. |
| **Recent Activity ($s_2$)** | 0.20 | Volume and density of incidents recorded in the primary 72-hour window. |
| **Incident Frequency ($s_3$)** | 0.20 | Overall incident count normalized against active zone fleet average. |
| **Collection Irregularity ($s_4$)** | 0.15 | Average vehicle collection delay: $\min(100, (\text{delayMinutes} / 60) \times 100)$. |
| **Response Latency ($s_5$)** | 0.10 | Historical time required to resolve tickets in the zone. Default: 40 if missing. |
| **Contextual Volume ($s_6$)** | 0.10 | Waste volume surge and citizen complaints: $\min(100, (\text{reportedVolume} / 500) \times 100)$. |

### Priority Thresholds
- **CRITICAL**: $\text{Score} \ge 75$ (Immediate preventive action required)
- **HIGH**: $55 \le \text{Score} < 75$ (Schedule action within 24 hours)
- **MODERATE**: $35 \le \text{Score} < 54$ (Standard route monitoring)
- **LOW**: $\text{Score} < 35$ (Normal baseline)

### Reproducibility & Missing Value Handling
- **Missing Fields**: Missing `collection_delay` defaults to 0. Missing `reported_volume` defaults to sector median. Missing GPS coordinates triggers warning and falls back to zone polygon centroid.
- **Reproducibility**: The scoring algorithm is 100% deterministic. Identical telemetry inputs produce identical scores down to the integer.
- **No Data Leakage**: Calculations only evaluate timestamps up to the query reference time; future events are never accessible to the scoring engine.

---

## 3. Forward Recurrence Prediction Engine (7-Day Horizon)

### Algorithmic Logic
1. **Inter-Arrival Interval ($\Delta t$)**: For each zone with $\ge 2$ historical events, calculates the mean days between incidents:
   $$\bar{\Delta t} = \frac{t_{\text{latest}} - t_{\text{earliest}}}{N - 1}$$
2. **Elapsed Time Since Last Event ($t_{\text{elapsed}}$)**: Time from latest incident to forecast start.
3. **Periodicity Modulation**: If $t_{\text{elapsed}} \approx \bar{\Delta t}$, recurrence probability curve reaches peak hazard intensity over the next 1–3 days.
4. **Prototype Status**: The 7-day horizon is an operational prototype design choice to align with municipal weekly route planning cycles. It is not an empirical weather-style stochastic forecast.

### Confidence Tiers
- **HIGH CONFIDENCE**: $\ge 4$ historical observations with low interval variance ($\sigma < 2$ days).
- **MODERATE CONFIDENCE**: 2–3 historical observations.
- **LOW CONFIDENCE**: Sparse or single-incident history; uses global sector mean.

---

## 4. Grounded Bedrock Explanations & Transparent Fallback

Amazon Bedrock receives ONLY the structured telemetry payload:
- Risk score, zone ID, priority level
- Incident count and historical average delays
- Dominant contributing signals ($s_i \ge 50$)

Bedrock prompt system instruction:
> *"Only use the supplied structured signals. Do not invent statistics, locations, events, customers, measurements, or operational facts."*

### Transparent Rule-Based Fallback
If Bedrock model access is pending console activation or service is unavailable:
- The system generates a deterministic rule-based natural language synthesis.
- The response is explicitly tagged: `aiProvider: 'RULE_BASED_FALLBACK'` with the exact reason provided.
- At no point does WasteSignal simulate an AI response without attribution.

---

## 5. Machine Learning Validation Roadmap (Phase 2 / SageMaker)

When an enterprise municipal customer deploys WasteSignal, the heuristic engine serves as the cold-start baseline until 90 days of operational data are collected:

1. **Feature Engineering**: S3/Glue dataset partitioned into training/test splits by date (preventing temporal leakage).
2. **Model Training**: Gradient-boosted decision trees (LightGBM/XGBoost) trained via Amazon SageMaker.
3. **Calibration**: Isotonic regression or Platt scaling to transform ranking scores into calibrated probabilities.
4. **Validation Metrics**: Evaluated against Brier Score, ROC-AUC, and Precision@K for the top 10 daily dispatches.
