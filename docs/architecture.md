# WasteSignal — Architecture & System Design

## 1. High-Level Architecture

WasteSignal is an operational intelligence platform designed to move municipal sanitation and waste departments from reactive cleanup to proactive, signal-driven hotspot prevention.

```
┌─────────────────────────────────────────────────────────────┐
│                      WASTESIGNAL UI                         │
│   (Vite + React 19 + TypeScript + Enterprise Light Theme)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                      │
│        (Node.js Express Proxy / AWS Lambda Handler)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│   AMAZON S3   │      │   AWS GLUE    │      │ AMAZON ATHENA │
│ Object Storage│      │ Data Catalog  │      │ SQL Analytics │
│ (raw/derived) │      │ (ETL Schema)  │      │ (Serverless)  │
└───────┬───────┘      └───────────────┘      └───────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                 PREDICTIVE & SCORING ENGINES                │
│    • Deterministic Multi-Signal Hotspot Engine              │
│    • 7-Day Recurrence Interval Prediction Engine            │
│    • SageMaker Inference Interface                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    AMAZON BEDROCK LAYER                     │
│    • Grounded Explanation Generation                        │
│    • Strict Hallucination-Free Operational Prompting        │
│    • Rule-Based Transparent Fallback Engine                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 OPERATIONS FEEDBACK LOOP                    │
│    • Staged Preventive Interventions                        │
│    • Status State Machine: PENDING → REVIEW → ASSIGNED ...  │
│    • Continuous Model Calibration                           │
└─────────────────────────────────────────────────────────────┘
```

## 2. Core Operational Workflow

1. **Telemetry Ingestion**: Operators upload CSV/JSON operational records or trigger synthetic demonstration data.
2. **Schema Validation & Normalization**: Strict boundary checking on coordinates, timestamps, duplicate IDs, and numeric metrics.
3. **S3 Lake Storage**: Original raw payload stored under `s3://.../wastesignal/raw/`.
4. **Glue Cataloging**: Telemetry schema registered in `wastesignal_db.operational_telemetry`.
5. **Deterministic Hotspot Scoring**: Multi-signal algorithm computes risk indices (0-100) based on recurrence, recent activity, collection irregularity, response delay, and context.
6. **Forward Recurrence Forecasting**: 7-day predictive window estimates recurrence cadence and assigns priority labels (`HIGH PRIORITY`, `MEDIUM PRIORITY`, `LOW PRIORITY`).
7. **Explainability via Amazon Bedrock**: Structured signals sent to Bedrock to generate grounded dispatch recommendations and field checklists without hallucinations.
8. **Operational Dispatch**: Interventions staged with tracked lifecycle statuses (`PENDING`, `REVIEW`, `ASSIGNED`, `IN PROGRESS`, `RESOLVED`).
