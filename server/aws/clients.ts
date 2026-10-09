import { S3Client } from '@aws-sdk/client-s3';
import { GlueClient } from '@aws-sdk/client-glue';
import { AthenaClient } from '@aws-sdk/client-athena';
import { BedrockClient } from '@aws-sdk/client-bedrock';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { SageMakerClient } from '@aws-sdk/client-sagemaker';
import { config } from '../config';

const clientConfig = {
  region: config.aws.region,
};

export const s3Client = new S3Client(clientConfig);
export const glueClient = new GlueClient(clientConfig);
export const athenaClient = new AthenaClient(clientConfig);
export const bedrockClient = new BedrockClient(clientConfig);
export const bedrockRuntimeClient = new BedrockRuntimeClient(clientConfig);
export const sagemakerClient = new SageMakerClient(clientConfig);
