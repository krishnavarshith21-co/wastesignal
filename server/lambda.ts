import serverlessExpress from '@codegenie/serverless-express';
import app from './index';

let serverlessExpressInstance: any;

function setup() {
  return serverlessExpress({ app });
}

/**
 * AWS Lambda Handler compatible with:
 * - Amazon API Gateway HTTP API (Payload v2.0)
 * - Amazon API Gateway REST API (Payload v1.0)
 * - AWS Lambda Function URLs
 */
export const handler = async (event: any, context: any, callback?: any) => {
  if (!serverlessExpressInstance) {
    serverlessExpressInstance = setup();
  }
  return serverlessExpressInstance(event, context, callback);
};

export default app;
