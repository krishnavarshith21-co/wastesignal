import { s3Service } from './s3Service';
import { glueService } from './glueService';
import { athenaService } from './athenaService';
import { bedrockService } from './bedrockService';
import { sagemakerService } from './sagemakerService';
import { config } from '../config';

export interface AwsInfrastructureStatus {
  timestamp: string;
  region: string;
  services: {
    s3: {
      status: 'CONNECTED' | 'NOT CONFIGURED' | 'ERROR';
      bucket: string;
      error?: string;
    };
    glue: {
      status: 'CONNECTED' | 'NOT CONFIGURED' | 'ERROR';
      database: string;
      error?: string;
    };
    athena: {
      status: 'CONNECTED' | 'NOT CONFIGURED' | 'ERROR';
      database: string;
      workgroup: string;
      error?: string;
    };
    bedrock: {
      status: 'CONNECTED' | 'UNAVAILABLE' | 'NOT CONFIGURED' | 'ERROR';
      modelId: string;
      error?: string;
    };
    sagemaker: {
      status: 'CONNECTED' | 'NOT CONFIGURED' | 'UNAVAILABLE' | 'ERROR';
      endpointName?: string;
      error?: string;
    };
    lambda: {
      status: 'CONNECTED' | 'READY' | 'NOT CONFIGURED';
      handler: string;
      environment: 'AWS_LAMBDA' | 'LOCAL_EXPRESS_PROXY';
    };
  };
  overallStatus: 'OPERATIONAL' | 'DEGRADED' | 'CONFIG_REQUIRED';
}

export async function getLiveAwsStatus(): Promise<AwsInfrastructureStatus> {
  const [s3, glue, athena, bedrock, sagemaker] = await Promise.all([
    s3Service.checkHealth(),
    glueService.checkHealth(),
    athenaService.checkHealth(),
    bedrockService.checkHealth(),
    sagemakerService.checkHealth(),
  ]);

  const isLambdaEnv = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const lambdaStatus = {
    status: isLambdaEnv ? ('CONNECTED' as const) : ('READY' as const),
    handler: 'server/lambda.handler',
    environment: isLambdaEnv ? ('AWS_LAMBDA' as const) : ('LOCAL_EXPRESS_PROXY' as const),
  };

  const hasCore = s3.status === 'CONNECTED';
  const overallStatus = hasCore ? 'OPERATIONAL' : 'CONFIG_REQUIRED';

  return {
    timestamp: new Date().toISOString(),
    region: config.aws.region,
    services: {
      s3,
      glue,
      athena,
      bedrock,
      sagemaker,
      lambda: lambdaStatus,
    },
    overallStatus,
  };
}
