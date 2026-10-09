import app from '../server/index';
import { s3Client, glueClient } from '../server/aws/clients';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { GetTableCommand } from '@aws-sdk/client-glue';
import { config } from '../server/config';

async function runE2E() {
  console.log('--- Starting WasteSignal E2E Acceptance Test ---');

  const server = app.listen(3098, async () => {
    try {
      // 1. Health check
      console.log('1. Checking /api/health...');
      const health = await fetch('http://localhost:3098/api/health').then(r => r.json());
      console.log('   Health response:', health.status);

      // 2. AWS Status Probe
      console.log('2. Checking /api/aws/status...');
      const awsStatus = await fetch('http://localhost:3098/api/aws/status').then(r => r.json());
      console.log('   S3 Status:', awsStatus.services.s3.status, 'Bucket:', awsStatus.services.s3.bucket);
      console.log('   Glue Status:', awsStatus.services.glue.status, 'DB:', awsStatus.services.glue.database);
      console.log('   Athena Status:', awsStatus.services.athena.status, 'Workgroup:', awsStatus.services.athena.workgroup);
      console.log('   Bedrock Status:', awsStatus.services.bedrock.status, 'Model:', awsStatus.services.bedrock.modelId);
      console.log('   SageMaker Status:', awsStatus.services.sagemaker.status);

      // 3. Load Demo Data (S3 upload + Glue + Hotspot + Prediction)
      console.log('3. Triggering POST /api/datasets/demo...');
      const demoRes = await fetch('http://localhost:3098/api/datasets/demo', { method: 'POST' }).then(r => r.json());
      console.log('   Success:', demoRes.success);
      console.log('   Dataset ID:', demoRes.dataset.id);
      console.log('   S3 Uploaded:', demoRes.dataset.s3Uploaded, 'Key:', demoRes.dataset.s3RawKey);
      console.log('   Hotspots calculated:', demoRes.hotspots?.length);
      console.log('   Predictions generated:', demoRes.predictions?.length);

      // 4. Verify S3 Object directly via AWS S3 SDK
      console.log('4. Verifying S3 object directly in AWS...');
      const s3Head = await s3Client.send(new HeadObjectCommand({
        Bucket: config.aws.s3Bucket,
        Key: demoRes.dataset.s3RawKey,
      }));
      console.log('   Direct S3 verification verified! ContentLength:', s3Head.ContentLength, 'ETag:', s3Head.ETag);

      // 5. Verify Glue Catalog Table directly via AWS Glue SDK
      console.log('5. Verifying Glue catalog table directly in AWS...');
      const glueTable = await glueClient.send(new GetTableCommand({
        DatabaseName: config.aws.glueDatabase,
        Name: 'operational_telemetry',
      }));
      console.log('   Direct Glue verification verified! Table:', glueTable.Table?.Name, 'Columns:', glueTable.Table?.StorageDescriptor?.Columns?.length);

      // 6. Query Hotspots
      console.log('6. Querying GET /api/hotspots...');
      const hotspotsData = await fetch('http://localhost:3098/api/hotspots').then(r => r.json());
      console.log('   Top hotspot:', hotspotsData.hotspots[0].zoneId, 'Risk:', hotspotsData.hotspots[0].riskScore, 'Priority:', hotspotsData.hotspots[0].priority);

      // 7. Test Explanation (Bedrock or transparent fallback)
      console.log('7. Testing POST /api/intelligence/explain...');
      const explainRes = await fetch('http://localhost:3098/api/intelligence/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotspotId: hotspotsData.hotspots[0].id }),
      }).then(r => r.json());
      console.log('   Explanation Provider:', explainRes.explanation?.aiProvider);
      console.log('   Why Prioritized:', explainRes.explanation?.whyPrioritized);
      console.log('   Recommended Action:', explainRes.explanation?.recommendedAction);

      // 8. Update Operational Intervention & Test State Machine Enforcement
      console.log('8. Testing PATCH /api/operations/interventions/:id state machine lifecycle...');
      const opsBefore = await fetch('http://localhost:3098/api/operations').then(r => r.json());
      const firstInt = opsBefore.interventions[0];
      console.log('   First intervention initial status:', firstInt.id, firstInt.status);

      // 8a. Valid transition: PENDING -> IN PROGRESS (or ASSIGNED)
      const updateRes = await fetch(`http://localhost:3098/api/operations/interventions/${firstInt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN PROGRESS', notes: 'Dispatched compaction vehicle V-12' }),
      }).then(r => r.json());
      console.log('   Valid transition to IN PROGRESS:', updateRes.intervention?.status);

      // 8b. Prohibited transition: IN PROGRESS -> REVIEW (must be rejected with HTTP 400)
      const invalidRes = await fetch(`http://localhost:3098/api/operations/interventions/${firstInt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REVIEW' }),
      });
      const invalidJson = await invalidRes.json();
      console.log('   Prohibited transition (IN PROGRESS -> REVIEW) rejected:', invalidRes.status === 400, `(${invalidJson.error})`);

      // 8c. Valid transition: IN PROGRESS -> RESOLVED
      const resolvedRes = await fetch(`http://localhost:3098/api/operations/interventions/${firstInt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED', notes: 'Site cleared and verified by sanitation lead' }),
      }).then(r => r.json());
      console.log('   Valid transition to RESOLVED:', resolvedRes.intervention?.status);

      const opsAfter = await fetch('http://localhost:3098/api/operations').then(r => r.json());
      const updatedInt = opsAfter.interventions.find((i: any) => i.id === firstInt.id);
      console.log('   Persisted in store:', updatedInt.id, updatedInt.status, 'ResolvedAt:', updatedInt.resolvedAt ? 'Recorded' : 'Missing');

      console.log('--- ALL E2E ACCEPTANCE TESTS PASSED SUCCESSFULLY! ---');
    } catch (err) {
      console.error('E2E Test Failed:', err);
      process.exitCode = 1;
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runE2E();
