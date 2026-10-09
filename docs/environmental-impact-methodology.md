# WasteSignal — Environmental Impact Methodology & Pilot Measurement Framework

## 1. Platform Scope & Environmental Positioning

**WasteSignal is a predictive operational intelligence platform.**
It does not directly haul, sort, compact, incinerate, or landfill physical waste.

Its operational role is to convert multi-source operational telemetry (missed collections, citizen reports, bin overflow flags, vehicle delays) into prioritized forward-looking risk signals and explainable recommendations.

### The Downstream Environmental Theory of Change
```
[Predictive Risk Signals]
       │
       ▼
[Proactive Route Dispatch & Intervention]
       │
       ▼
[Reduced Chronic Overflow & Stagnant Heaps]
 ┌─────┴──────────────────────────────┐
 ▼                                    ▼
[Mitigated Open Burning & Odor]     [Optimized Fleet Transit]
 ▼                                    ▼
[Cleaner Air & Vector Reduction]    [Reduced Fleet Fuel Burn]
```

These downstream environmental benefits are **hypotheses requiring field pilot validation**, not pre-existing platform achievements.

---

## 2. Taxonomy of Environmental Claims

Every environmental claim made in WasteSignal documentation, presentations, and UI copy is categorized according to this strict rubric:

- **Category A**: Verified external fact (established scientific literature / multilateral agencies).
- **Category B**: Measured WasteSignal result (empirically validated in a live municipal deployment).
- **Category C**: Literature-supported potential benefit (benchmarked in comparable smart waste literature).
- **Category D**: Hypothesis requiring pilot validation (WasteSignal theory of change to test in field trials).
- **Category E**: Unsupported claim (removed from copy).

### Audit Table of Claims

| # | Specific Claim | Category | Source & Context | Treatment in WasteSignal |
|---|----------------|----------|------------------|--------------------------|
| 1 | **Methane (CH₄) 100-year GWP is 28× (AR5) or ~30× (AR6) that of CO₂** | **A** | IPCC Fifth Assessment Report (AR5, 2013) Chapter 8, Table 8.7; IPCC Sixth Assessment Report (AR6, 2021) WG1 Ch. 7. | Verified scientific fact. Clearly noted as 100-year timescale GWP. (82.5× on 20-year timescale). |
| 2 | **Uncollected municipal waste begins emitting methane within 48–72 hours** | **D** | In open, aerobic surface heaps, primary emissions are VOCs and odor; anaerobic methane generation requires moisture, compaction, and anaerobic pockets which typically develop over days to weeks in compacted dumps. | Corrected from an absolute fact to an operational risk indicator for chronic organic accumulation. |
| 3 | **Informal waste workers collect 50–80% of post-consumer recyclables in low-to-middle income cities** | **A** | UN-Habitat (2010) *Solid Waste Management in the World's Cities*; World Bank (2018) *What a Waste 2.0*. | Verified external literature fact. Contextualized to cities with informal recycling ecosystems. |
| 4 | **Fleet dynamic routing can reduce collection diesel consumption by 15–35%** | **C** | Beliën et al. (2014) *Municipal solid waste collection and vehicle routing: A review*, EJOR; Hannan et al. (2018) *Waste management route optimization*. | Labeled as a literature-supported optimization benchmark for pilot evaluation, not an achieved platform metric. |
| 5 | **Direct prevention of dengue, malaria, and vector-borne diseases** | **D** | WHO (2020) *Vector-borne diseases guidelines*: Stagnant waste and discarded containers hold rainwater that provides breeding habitats for *Aedes aegypti*. | Positioned as a secondary public-health co-benefit under active pilot study, not a direct software output. |
| 6 | **18.4 metric tons of CO₂e avoided per sector annually** | **D** | Prototype simulation based on synthetic demo data assumptions (2 compactors, 12 avoided emergency round-trips, avoided anaerobic decomposition). | Explicitly marked as a **Synthetic Simulation Projection**, not an empirical municipal measurement. |
| 7 | **Predicting waste hotspots 48–72 hours early** | **D** | Algorithmic forward recurrence heuristic based on interval arrival time and queue persistence. | Labeled as a 7-day forward heuristic horizon, pending validation against historical ground-truth incident logs. |

---

## 3. Empirical Pilot Measurement Framework

To validate these hypotheses during a real municipal pilot, WasteSignal defines the following quantitative evaluation protocol:

### Metric 1: Hotspot Recurrence Baseline ($R_{\text{recurrence}}$)
- **Definition**: Number of distinct overflow/dumping incidents occurring within the same 250-meter geofenced grid zone within a 14-day rolling window.
- **Collection Method**: GPS-tagged municipal maintenance tickets and citizen reports via API ingestion.
- **Formula**:
  $$R_{\text{recurrence}} = \frac{N_{\text{incidents in recurring zones}}}{N_{\text{total recorded incidents}}} \times 100\%$$

### Metric 2: Incident Escalation & Response Latency ($T_{\text{latency}}$)
- **Definition**: Time elapsed (in minutes) between initial predictive hotspot alert and operational intervention completion.
- **Tracking**: Recorded via `createdAt` and `resolvedAt` timestamps on `OperationalIntervention` entities.

### Metric 3: Vehicle Kilometers Traveled (VKT) & Fuel Consumption
- **Baseline**: Historical vehicle telematics (OBD-II / CAN-bus GPS telemetry) for static routes.
- **Intervention**: Mileage and fuel consumption on predictive preventive routes.
- **Emission Factor**: EPA GHG Hub (2023) / UK DEFRA: $10.21 \text{ kg CO}_2\text{e per gallon of diesel}$ ($2.68 \text{ kg CO}_2\text{e per liter}$).

### Metric 4: Recyclables Recovery & Cross-Contamination Rate
- **Metric**: Dry recyclables (cardboard, rigid HDPE/PET) diverted prior to compaction with decomposing organic waste.
- **Method**: Weighbridge tickets and cooperative sorting logs at decentralized recovery facilities.

### Metric 5: Avoided Open Burning Incidents
- **Metric**: Municipal fire department callouts and local optical particulate sensor surges (PM2.5 $> 150 \, \mu\text{g/m}^3$) within geofenced historical dumping sectors.

---

## 4. Truth in Reporting Standards

1. **Synthetic Data**: When running in demo mode or without live municipal sensors, all figures are marked `SYNTHETIC DEMONSTRATION DATA`.
2. **Deterministic Scores**: Hotspot scores (0–100) are risk-ranking indices, not calibrated probabilities.
3. **No Phantom Offsets**: WasteSignal will never market "carbon credits" or unverified avoidance claims without third-party metered telemetry.
