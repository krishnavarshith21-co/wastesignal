# WasteSignal — Hotspot Scoring & Prediction Methodology

## 1. Prototype Risk-Scoring Methodology

WasteSignal uses a deterministic multi-signal scoring model to avoid the pitfalls of unexplainable black-box systems in critical municipal infrastructure.

> **Disclaimer**: This methodology is labeled as a prototype operational risk-scoring heuristic. It does not claim scientific validation or fictitious statistical accuracy.

### Scoring Formula
$$\text{Hotspot Score} = \sum_{i} (w_i \times s_i)$$

Where signals $s_i \in [0, 100]$ and weights $w_i$ sum to $1.0$:

1. **Recurrence Signal ($w_1 = 0.25$)**: Measures the persistence of repeat incidents within a single zone over time.
2. **Recent Activity Signal ($w_2 = 0.20$)**: Evaluates incident volume in the primary 72-hour window.
3. **Incident Frequency Signal ($w_3 = 0.20$)**: Density of total events across the observation period.
4. **Collection Irregularity Signal ($w_4 = 0.15$)**: Fleet volatility, missed collections, and average route delay minutes.
5. **Response Latency Signal ($w_5 = 0.10$)**: Historical time required to resolve prior incidents.
6. **Contextual Signal ($w_6 = 0.10$)**: Citizen complaint frequency and abnormal volume surges.

### Priority Classification
- **CRITICAL**: Score $\ge 75$
- **HIGH**: Score $55 - 74$
- **MODERATE**: Score $35 - 54$
- **LOW**: Score $< 35$

---

## 2. Forward Recurrence Prediction Engine

The predictive model estimates which locations are most likely to require preventive intervention across a 7-day forward horizon.

### Key Characteristics
- **Cadence Modeling**: Calculates the inter-incident arrival interval (mean days between events) for each zone.
- **Cycle Modulation**: Modulates forward risk as the zone approaches its expected recurrence window.
- **Confidence Levels**:
  - `HIGH CONFIDENCE`: Based on $\ge 4$ historical data points.
  - `MODERATE CONFIDENCE`: Based on $2-3$ historical data points.
  - `LOW CONFIDENCE`: Sparse single-incident history.
- **Truth in Reporting**: WasteSignal does NOT state "98% accurate". It presents honest labels (`HIGH PRIORITY`, `MEDIUM PRIORITY`, `LOW PRIORITY`) tied directly to transparent telemetry.

---

## 3. Grounded Bedrock Explanations

Amazon Bedrock receives ONLY structured telemetry (risk score, incident history, collection delays, complaint counts) and is strictly instructed:
> *"Only use the supplied structured signals. Do not invent statistics, locations, events, customers, measurements, or operational facts."*

If Bedrock model access is unavailable, a transparent rule-based explanation engine takes over, clearly tagged as `RULE-BASED FALLBACK`.
