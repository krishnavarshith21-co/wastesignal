import { handler } from '../server/lambda';

async function testLambdaHandler() {
  console.log('--- Testing server/lambda.ts Handler ---');

  // Synthetic API Gateway v2 HTTP API payload for GET /api/health
  const event = {
    version: '2.0',
    routeKey: 'GET /api/health',
    rawPath: '/api/health',
    rawQueryString: '',
    headers: {
      accept: 'application/json',
      host: 'api.wastesignal.com',
      'user-agent': 'aws-sdk-probe',
    },
    requestContext: {
      http: {
        method: 'GET',
        path: '/api/health',
        protocol: 'HTTP/1.1',
      },
    },
    isBase64Encoded: false,
  };

  const context = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'wastesignal-backend',
    memoryLimitInMB: '512',
    awsRequestId: 'req-test-12345',
  };

  try {
    const response: any = await handler(event, context);
    console.log('Lambda invocation status code:', response.statusCode);
    console.log('Headers:', response.headers);
    console.log('Body:', response.body);
    const parsed = JSON.parse(response.body);
    console.log('Parsed JSON status:', parsed.status, 'Service:', parsed.service);
    if (response.statusCode === 200 && parsed.status === 'HEALTHY') {
      console.log('✓ LAMBDA ADAPTER TEST PASSED!');
    } else {
      console.error('✗ Unexpected response from Lambda adapter');
    }
  } catch (err: any) {
    console.error('✗ Lambda handler failed:', err);
  }
}

testLambdaHandler();
