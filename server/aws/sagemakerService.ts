import {
  DescribeEndpointCommand,
  ListEndpointsCommand,
} from '@aws-sdk/client-sagemaker';
import { sagemakerClient } from './clients';
import { config } from '../config';

export interface SageMakerHealthStatus {
  status: 'CONNECTED' | 'NOT CONFIGURED' | 'UNAVAILABLE' | 'ERROR';
  endpointName?: string;
  error?: string;
}

export class SageMakerService {
  private endpointName: string;

  constructor() {
    this.endpointName = config.aws.sagemakerEndpoint;
  }

  async checkHealth(): Promise<SageMakerHealthStatus> {
    if (!this.endpointName) {
      return {
        status: 'NOT CONFIGURED',
        endpointName: undefined,
      };
    }

    try {
      const res = await sagemakerClient.send(new DescribeEndpointCommand({
        EndpointName: this.endpointName,
      }));
      return {
        status: res.EndpointStatus === 'InService' ? 'CONNECTED' : 'UNAVAILABLE',
        endpointName: this.endpointName,
      };
    } catch (err: any) {
      return {
        status: 'ERROR',
        endpointName: this.endpointName,
        error: err.message || err.name,
      };
    }
  }

  async listAvailableEndpoints(): Promise<string[]> {
    try {
      const res = await sagemakerClient.send(new ListEndpointsCommand({ MaxResults: 10 }));
      return (res.Endpoints || []).map(e => e.EndpointName || '').filter(Boolean);
    } catch {
      return [];
    }
  }
}

export const sagemakerService = new SageMakerService();
