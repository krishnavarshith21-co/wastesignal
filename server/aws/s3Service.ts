import {
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { s3Client } from './clients';
import { config } from '../config';

export interface S3UploadResult {
  success: boolean;
  bucket: string;
  key: string;
  eTag?: string;
  error?: string;
}

export class S3Service {
  private bucket: string;

  constructor() {
    this.bucket = config.aws.s3Bucket;
  }

  async checkHealth(): Promise<{ status: 'CONNECTED' | 'NOT CONFIGURED' | 'ERROR'; bucket: string; error?: string }> {
    if (!this.bucket) {
      return { status: 'NOT CONFIGURED', bucket: '' };
    }
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return { status: 'CONNECTED', bucket: this.bucket };
    } catch (err: any) {
      const msg = err.message || err.name || 'S3 head-bucket failed';
      return { status: 'ERROR', bucket: this.bucket, error: msg };
    }
  }

  async uploadFile(key: string, body: string | Buffer, contentType = 'text/csv'): Promise<S3UploadResult> {
    if (!this.bucket) {
      throw new Error('Dataset storage unavailable: AWS_S3_BUCKET is not configured.');
    }
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: {
          'app-name': 'wastesignal',
          'uploaded-at': new Date().toISOString(),
        },
      });
      const res = await s3Client.send(command);
      return {
        success: true,
        bucket: this.bucket,
        key,
        eTag: res.ETag,
      };
    } catch (err: any) {
      throw new Error(`Dataset storage unavailable (S3 upload failed for ${key}): ${err.message || err.name}`);
    }
  }

  async getFile(key: string): Promise<string> {
    if (!this.bucket) {
      throw new Error('Dataset storage unavailable: AWS_S3_BUCKET is not configured.');
    }
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const res = await s3Client.send(command);
      if (!res.Body) {
        throw new Error(`Empty body returned for S3 key: ${key}`);
      }
      return await res.Body.transformToString();
    } catch (err: any) {
      throw new Error(`Dataset storage unavailable (S3 read failed for ${key}): ${err.message || err.name}`);
    }
  }

  async listFiles(prefix: string): Promise<Array<{ key: string; lastModified?: Date; size?: number }>> {
    if (!this.bucket) {
      throw new Error('Dataset storage unavailable: AWS_S3_BUCKET is not configured.');
    }
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });
      const res = await s3Client.send(command);
      return (res.Contents || []).map(obj => ({
        key: obj.Key || '',
        lastModified: obj.LastModified,
        size: obj.Size,
      }));
    } catch (err: any) {
      throw new Error(`Dataset storage unavailable (S3 list failed for ${prefix}): ${err.message || err.name}`);
    }
  }
}

export const s3Service = new S3Service();
