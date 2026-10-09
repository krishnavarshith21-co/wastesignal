import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  aws: {
    region: process.env.AWS_REGION || 'ap-southeast-2',
    profile: process.env.AWS_PROFILE || 'krishna',
    s3Bucket: process.env.AWS_S3_BUCKET || 'wastesignal-data-683023468572-ap-southeast-2',
    glueDatabase: process.env.GLUE_DATABASE || 'wastesignal_db',
    athenaDatabase: process.env.ATHENA_DATABASE || 'wastesignal_db',
    athenaOutputLocation: process.env.ATHENA_OUTPUT_LOCATION || 's3://wastesignal-data-683023468572-ap-southeast-2/wastesignal/athena-results/',
    bedrockModelId: process.env.BEDROCK_MODEL_ID || 'amazon.nova-micro-v1:0',
    sagemakerEndpoint: process.env.SAGEMAKER_ENDPOINT_NAME || '',
  },
};
