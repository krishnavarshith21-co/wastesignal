# WasteSignal — AWS Cloud Infrastructure Setup Guide

This guide documents the exact setup and configuration required to run WasteSignal's real cloud intelligence layer on Amazon Web Services (AWS).

---

## 1. AWS Account & Selected Region

WasteSignal is configured for:
- **Selected AWS Region**: `ap-southeast-2` (Asia Pacific - Sydney)
- **Account Type**: The new AWS experience (project-based IAM & billing governance)

> **Constraint Reminder**: All regional resources (S3, Glue, Athena, Lambda) MUST reside in `ap-southeast-2`. Do not create regional services in `us-east-1` or attempt cross-region replication.

---

## 2. Authentication & IAM Permissions

WasteSignal uses the AWS CLI v2 browser login flow and the standard AWS SDK v3 credential chain (`AWS_PROFILE` or IAM Role).

### Local CLI Authentication
```bash
aws configure set region ap-southeast-2 --profile krishna
aws login --region ap-southeast-2 --profile krishna
```

### Required IAM Policy for Server/Lambda Execution
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3ObjectStorage",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:HeadBucket"
      ],
      "Resource": [
        "arn:aws:s3:::wastesignal-data-*",
        "arn:aws:s3:::wastesignal-data-*/*"
      ]
    },
    {
      "Sid": "GlueDataCatalog",
      "Effect": "Allow",
      "Action": [
        "glue:GetDatabase",
        "glue:CreateDatabase",
        "glue:GetTable",
        "glue:CreateTable",
        "glue:UpdateTable"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AthenaAnalytics",
      "Effect": "Allow",
      "Action": [
        "athena:StartQueryExecution",
        "athena:GetQueryExecution",
        "athena:GetQueryResults",
        "athena:ListWorkGroups"
      ],
      "Resource": "*"
    },
    {
      "Sid": "BedrockExplanation",
      "Effect": "Allow",
      "Action": [
        "bedrock:ListFoundationModels",
        "bedrock:InvokeModel"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 3. Amazon S3 Object Storage

WasteSignal stores raw telemetry, cataloged partitions, synthetic demo runs, and derived predictions in an S3 bucket.

### Bucket Creation
```bash
aws s3 mb s3://wastesignal-data-683023468572-ap-southeast-2 --region ap-southeast-2 --profile krishna
```

### Folder Architecture
```
s3://wastesignal-data-683023468572-ap-southeast-2/
└── wastesignal/
    ├── raw/              # Ingested municipal CSV/JSON datasets
    ├── processed/        # Derived predictions and risk metrics
    ├── demo/             # Synthetic controlled demonstration data
    ├── predictions/      # 7-day forward recurrence projections
    ├── reports/          # Generated briefing exports
    └── athena-results/   # Athena analytical query outputs
```

---

## 4. AWS Glue Data Catalog

WasteSignal maintains a queryable schema catalog for ingested telemetry.

### Create Database
```bash
aws glue create-database \
  --database-input '{"Name":"wastesignal_db","Description":"WasteSignal municipal telemetry catalog"}' \
  --region ap-southeast-2 \
  --profile krishna
```

### Catalog Table Schema (`operational_telemetry`)
The application automatically syncs the schema upon dataset upload. Alternatively, register it manually:
- `record_id`: string
- `timestamp`: string (ISO 8601)
- `latitude`: double
- `longitude`: double
- `location_name`: string
- `zone_id`: string
- `waste_type`: string
- `incident_type`: string
- `incident_status`: string
- `collection_status`: string
- `collection_delay`: int
- `reported_volume`: int
- `complaint_count`: int
- `previous_incidents`: int
- `response_time`: int
- `weather_context`: string
- `day_of_week`: string

---

## 5. Amazon Athena Analytics

Athena enables serverless analytical querying over S3 data without spinning up database servers.

### Configuration
1. **Workgroup**: Use `primary` or create a dedicated workgroup.
2. **Output Location**: Point query results to:
   `s3://wastesignal-data-683023468572-ap-southeast-2/wastesignal/athena-results/`

### Preset Queries Available in WasteSignal
```sql
-- 1. Hotspot Frequency & Open Incidents
SELECT zone_id, location_name, COUNT(*) AS incident_count,
       COUNT(CASE WHEN incident_status = 'OPEN' THEN 1 END) AS open_incidents
FROM operational_telemetry
WHERE incident_type IS NOT NULL AND incident_type != ''
GROUP BY zone_id, location_name
ORDER BY incident_count DESC;

-- 2. Collection Delay Performance
SELECT collection_status, COUNT(*) AS status_count,
       ROUND(AVG(collection_delay), 1) AS avg_delay_minutes
FROM operational_telemetry
WHERE collection_status IS NOT NULL AND collection_status != ''
GROUP BY collection_status;

-- 3. Day-of-Week Recurrence Cadence
SELECT day_of_week, COUNT(*) AS incident_count
FROM operational_telemetry
WHERE incident_type IS NOT NULL AND incident_type != ''
GROUP BY day_of_week
ORDER BY incident_count DESC;
```

---

## 6. Amazon Bedrock Setup

Bedrock generates structured, hallucination-free explanations for field operators.

### Model Selection
- Model ID: `amazon.nova-micro-v1:0` (or `anthropic.claude-3-haiku-20240307-v1:0`)
- Region: `ap-southeast-2`

### Requesting Model Access
1. Open the [AWS Management Console](https://console.aws.amazon.com/bedrock/).
2. Navigate to **Amazon Bedrock > Model access**.
3. Enable access for Amazon Nova Micro / Claude models.
4. If access is pending or unapproved, WasteSignal **transparently** reports:
   `"AI explanation unavailable (AWS Bedrock: Operation not allowed). Showing rule-based explanation."`
   No fake AI responses are ever returned.

---

## 7. Amazon SageMaker (Production Roadmap)

WasteSignal includes a pluggable `PredictiveModelInterface` in `server/engine/predictionEngine.ts`.
- **Current Prototype**: Executes a transparent deterministic recurrence engine locally with 7-day forecast intervals.
- **Production Path**: Deploy an XGBoost / DeepAR endpoint in SageMaker, configure `SAGEMAKER_ENDPOINT_NAME` in `.env`, and `sagemakerService.ts` will route inference calls to the hosted model.

---

## 8. AWS Lambda & API Gateway Deployment

WasteSignal's backend is packaged in `server/lambda.ts`.

### Architecture
```
Vercel Frontend (or CloudFront + S3)
        ↓
Amazon API Gateway (HTTP API)
        ↓
AWS Lambda (server/lambda.ts)
        ↓
AWS Services (S3, Glue, Athena, Bedrock)
```

### Serverless Deploy Steps
```bash
# Build backend
npm run build
# Package Lambda zip containing dist/ and node_modules
zip -r function.zip dist/ server/ node_modules/
# Update Lambda code
aws lambda update-function-code \
  --function-name wastesignal-api \
  --zip-file fileb://function.zip \
  --region ap-southeast-2 \
  --profile krishna
```

---

## 9. Environment Variables Summary

| Variable | Description | Example |
|---|---|---|
| `PORT` | Local backend server port | `3001` |
| `AWS_REGION` | Regional constraint | `ap-southeast-2` |
| `AWS_PROFILE` | Named CLI profile | `krishna` |
| `AWS_S3_BUCKET` | S3 dataset bucket | `wastesignal-data-683023468572-ap-southeast-2` |
| `GLUE_DATABASE` | Glue data catalog database | `wastesignal_db` |
| `ATHENA_DATABASE` | Athena analytical database | `wastesignal_db` |
| `ATHENA_OUTPUT_LOCATION` | Athena query staging S3 URI | `s3://wastesignal-data-.../wastesignal/athena-results/` |
| `BEDROCK_MODEL_ID` | Foundation model ID | `amazon.nova-micro-v1:0` |
| `SAGEMAKER_ENDPOINT_NAME` | Optional SageMaker endpoint | *empty for prototype* |

---

## 10. Prototype Cost Considerations

WasteSignal is optimized for zero idle cost:
- **S3**: Pay per GB stored (minimal for MB-sized telemetry).
- **Glue Catalog**: First 1 million metadata requests per month are free tier.
- **Athena**: $5 per TB scanned; prototype queries scan kilobytes of compressed CSV.
- **Bedrock**: Pay per input/output token only when an explanation is generated.
- **Lambda**: Pay per millisecond of request execution; no persistent idle instances.
