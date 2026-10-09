# WasteSignal — AWS Services Integration Reference

This document outlines the real AWS services integrated into WasteSignal, their purpose, and their status verification criteria.

## Service Matrix

| Service | Architectural Role | Regional Constraint | Real Status Probe |
|---|---|---|---|
| **Amazon S3** | Object storage for raw, processed, demo, and prediction datasets | `ap-southeast-2` | `HeadBucketCommand` on configured bucket |
| **AWS Glue** | Schema cataloging and metadata definition for telemetry | `ap-southeast-2` | `GetDatabaseCommand` on `wastesignal_db` |
| **Amazon Athena** | Serverless SQL analytics across S3 partitions | `ap-southeast-2` | `ListWorkGroupsCommand` (workgroup `primary`) |
| **Amazon Bedrock** | Grounded explanation generation for field supervisors | `ap-southeast-2` | `ListFoundationModelsCommand` & model invocation |
| **Amazon SageMaker** | Extensible interface for production ML training/inference | `ap-southeast-2` | `DescribeEndpointCommand` (or `NOT CONFIGURED`) |
| **AWS Lambda** | Serverless REST API handler | `ap-southeast-2` | Handler module `server/lambda.ts` ready |

## Why These Services?
- **S3 & Glue**: Decouples data ingestion from computational servers. Raw municipal files remain immutable and auditable.
- **Athena**: Allows ad-hoc analytical queries (e.g. "Which zones had the highest collection delays on Mondays?") without provisioning a database cluster.
- **Bedrock**: Bridges numerical risk scores to natural language instructions so operators understand *why* an intervention is required.
