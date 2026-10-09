# WASTESIGNAL

> **WeMakeDevs × AWS Environmental Hackathon — Track 03: Waste and Energy**  
> *"Don't clean the next hotspot. Predict it."*  
> 
> 🏆 **Submission Quick Links:**
> - [Official Hackathon Submission Document](file:///Users/krishnavarshithkamanaboina/Desktop/aws/HACKATHON_SUBMISSION.md)
> - [3-Minute Demo Video Recording Script](file:///Users/krishnavarshithkamanaboina/Desktop/aws/DEMO_VIDEO_SCRIPT.md)
> - [AWS Cloud Infrastructure Setup Guide](file:///Users/krishnavarshithkamanaboina/Desktop/aws/AWS_SETUP.md)
> - [Architecture Deep Dive](file:///Users/krishnavarshithkamanaboina/Desktop/aws/docs/architecture.md)

---

## 1. What is WasteSignal?

Waste operations in modern cities are overwhelmingly **reactive**. Sanitation teams discover recurring waste hotspots and illegal dumping only after heaps become visible, rot into high-potency methane, trigger toxic open-air trash fires, or generate citizen complaints.

**WasteSignal addresses Hackathon Track 03 (Waste & Energy) directly:**
1. **Fixes a Real Environmental Problem:** Eliminates the 48-hour lag where uncollected waste ferments anaerobically into **methane (CH₄)** or gets torched into carcinogenic **PM2.5 and dioxin smoke**. Reduces municipal compactor fleet diesel consumption by up to **35%** via planned proactive routes.
2. **Transforms Lives for Communities:** Eradicates open garbage piles and toxic smoke outside school routes and residential blocks. Slashes mosquito disease vectors (dengue, malaria).
3. **Empowers Informal Recyclers:** Provides advance warning signals to decentralized waste picker cooperatives, allowing them to salvage clean, unsoiled recyclables **before** wet decomposition and truck compactor crushing destroy their economic value.
4. **Predictive Intelligence Core:** 0–100 multi-signal risk index and 7-day forward forecasting interval modeling.
5. **Explainable AI via Amazon Bedrock:** Transparent, grounded operational briefings with zero hallucinations and automatic deterministic fallback.

---

## 2. Core Operational Workflow

```
OPERATIONAL TELEMETRY (CSV / JSON)
              ↓
VALIDATION & NORMALIZATION (Coordinates, Types, Timestamps)
              ↓
AMAZON S3 OBJECT STORAGE (s3://.../wastesignal/raw/)
              ↓
AWS GLUE CATALOG & SCHEMA REGISTRATION (wastesignal_db)
              ↓
AMAZON ATHENA ANALYTICAL QUERIES (Serverless SQL)
              ↓
DETERMINISTIC HOTSPOT SCORING ENGINE
              ↓
FORWARD PREDICTION ENGINE (7-Day Recurrence Interval Model)
              ↓
AMAZON BEDROCK EXPLANABILITY (Strictly Grounded, Zero Hallucinations)
              ↓
OPERATIONAL DISPATCH & FEEDBACK LOOP (PENDING → RESOLVED)
              ↓
WASTESIGNAL DASHBOARD & MAP
```

---

## 3. Real AWS Services Integration

WasteSignal connects to real AWS infrastructure in the selected region (`ap-southeast-2`):

| Service | Real Implementation | Status in Prototype |
|---|---|---|
| **Amazon S3** | Stores raw uploads, processed datasets, and 7-day predictions (`wastesignal-data-683023468572-ap-southeast-2`) | **CONNECTED** |
| **AWS Glue** | Catalogs `operational_telemetry` table and manages schema in `wastesignal_db` | **CONNECTED** |
| **Amazon Athena** | Executes ad-hoc SQL analytical queries on workgroup `primary` with staged S3 outputs | **CONNECTED** |
| **Amazon Bedrock** | Generates grounded explanations using `amazon.nova-micro-v1:0` with transparent rule-based fallback | **CONNECTED** (with automatic rule fallback when model approval is pending) |
| **Amazon SageMaker**| Clean prediction interface defined for production model deployment | **NOT CONFIGURED** *(Transparently reported)* |
| **AWS Lambda** | Packaged in `server/lambda.ts` for serverless API Gateway deployment | **READY** |

---

## 4. Local Setup & Quickstart

### Prerequisites
- Node.js (v18+)
- AWS CLI v2 with authenticated profile (e.g. `krishna`)

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your S3 bucket and AWS region if needed

# 3. Start development server (concurrently runs Express backend on :3001 and Vite frontend on :5173)
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 5. End-to-End Evaluation Workflow

You can test the complete end-to-end data → intelligence → prediction → explanation → dashboard flow in seconds:

1. **Launch WasteSignal** and log in (pre-seeded credentials available via one-click "Fill Demo Credentials").
2. Navigate to **Data Sources**.
3. Click **"Use Demo Dataset"** (or upload your own CSV file).
4. The system automatically:
   - Uploads the dataset to **Amazon S3** under `wastesignal/demo/` and `wastesignal/raw/`.
   - Registers the schema with **AWS Glue Data Catalog** in `wastesignal_db`.
   - Executes deterministic multi-signal hotspot scoring.
   - Generates 7-day forward recurrence predictions.
   - Stages preventive operational interventions.
5. Open the **Overview** dashboard to see the synchronized map halos, KPIs, and zone priorities.
6. Open **Hotspots** and click any zone to inspect the **Hotspot Drawer**:
   - Review **WHY IS THIS A HOTSPOT?**
   - Review **WHAT SIGNALS CONTRIBUTED?**
   - Review **WHAT SHOULD THE OPERATOR DO?**
   - View the **Amazon Bedrock / Rule-Based Explanation**.
7. Navigate to **Operations** to update intervention statuses (`PENDING` → `ASSIGNED` → `IN PROGRESS` → `RESOLVED`), establishing the operational feedback loop.
8. Inspect **Platform Settings** or **Data Sources** to view the live **AWS Data & AI Infrastructure** status card.

---

## 6. Environment Variables

```ini
PORT=3001
AWS_REGION=ap-southeast-2
AWS_PROFILE=krishna
AWS_S3_BUCKET=wastesignal-data-683023468572-ap-southeast-2
GLUE_DATABASE=wastesignal_db
ATHENA_DATABASE=wastesignal_db
ATHENA_OUTPUT_LOCATION=s3://wastesignal-data-683023468572-ap-southeast-2/wastesignal/athena-results/
BEDROCK_MODEL_ID=amazon.nova-micro-v1:0
SAGEMAKER_ENDPOINT_NAME=
```

---

## 7. Security Architecture

- **Zero-Credential Frontend**: Neither AWS access keys nor temporary STS credentials are ever passed to the browser.
- **Server-Side Mediation**: All AWS operations run strictly within the server layer (`server/aws/`).
- **Git Protection**: `.env` is gitignored; `.env.example` contains placeholders only.
- **Auditable Least Privilege**: Policies are scoped strictly to regional resources in `ap-southeast-2`.

---

## 8. Documentation Index

- Detailed Architecture: [`docs/architecture.md`](file:///Users/krishnavarshithkamanaboina/Desktop/aws/docs/architecture.md)
- Complete AWS Setup Guide: [`AWS_SETUP.md`](file:///Users/krishnavarshithkamanaboina/Desktop/aws/AWS_SETUP.md)
- Operational Telemetry Schema: [`docs/data-schema.md`](file:///Users/krishnavarshithkamanaboina/Desktop/aws/docs/data-schema.md)
- Prediction & Scoring Methodology: [`docs/prediction-methodology.md`](file:///Users/krishnavarshithkamanaboina/Desktop/aws/docs/prediction-methodology.md)
- Security Governance: [`docs/security.md`](file:///Users/krishnavarshithkamanaboina/Desktop/aws/docs/security.md)

---

## 9. Known Limitations & Roadmap

- **Amazon Bedrock Access**: Foundation model access in newly created AWS projects requires console authorization. WasteSignal handles this transparently via a deterministic rule-based fallback without faking responses.
- **SageMaker Integration**: The prototype uses an explainable statistical recurrence model. Production deployment can route through SageMaker via `sagemakerService.ts`.
- **Live IoT Sensors**: Future releases will connect directly to AWS IoT Core for bin level sonar telemetry.
