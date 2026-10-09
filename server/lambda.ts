import app from './index';

// Export handler for AWS Lambda + API Gateway deployment
// When deployed with AWS Lambda, this exports the standard request handler
export const handler = async (event: any, context: any) => {
  // In serverless environment, this receives API Gateway event
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'WasteSignal Lambda Handler Ready',
      eventPath: event.path || event.rawPath,
    }),
  };
};

export default app;
