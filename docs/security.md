# WasteSignal — Security Architecture & Governance

## 1. Zero-Credential Browser Policy

WasteSignal enforces strict credential isolation:
- **No Client-Side Secrets**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and session tokens NEVER appear in client-side code, Vite bundles, or browser memory.
- **Server-Side Credential Chain**: All AWS SDK v3 calls are strictly mediated by the backend server (`server/aws/clients.ts`), which relies on the standard AWS credential chain (`AWS_PROFILE` in development or IAM Task/Execution roles in AWS Lambda).

## 2. Secrets Management & Repository Protection
- `.env` is explicitly declared in `.gitignore` and is never committed.
- `.env.example` contains only placeholder variables without real secrets.
- No hardcoded access keys exist anywhere in the source repository.

## 3. Least-Privilege IAM Scope
Backend roles are scoped to the minimum permissions necessary:
- S3 access restricted to `wastesignal-data-*` bucket namespace.
- Glue access restricted to `wastesignal_db` catalog.
- Athena restricted to output staging location.
- Bedrock restricted to `InvokeModel` on designated foundation models.
- Root AWS credentials are never used.

## 4. Input Sanitization & Payload Protection
- Multer file uploads are capped at 10 MB.
- Ingested records undergo structural type checking and range validation before reaching cloud services.
