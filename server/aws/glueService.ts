import {
  GetDatabaseCommand,
  GetTableCommand,
  CreateTableCommand,
} from '@aws-sdk/client-glue';
import { glueClient } from './clients';
import { config } from '../config';

export const GLUE_COLUMNS = [
  { Name: 'record_id', Type: 'string' },
  { Name: 'timestamp', Type: 'string' },
  { Name: 'latitude', Type: 'double' },
  { Name: 'longitude', Type: 'double' },
  { Name: 'location_name', Type: 'string' },
  { Name: 'zone_id', Type: 'string' },
  { Name: 'waste_type', Type: 'string' },
  { Name: 'incident_type', Type: 'string' },
  { Name: 'incident_status', Type: 'string' },
  { Name: 'collection_status', Type: 'string' },
  { Name: 'collection_delay', Type: 'int' },
  { Name: 'reported_volume', Type: 'int' },
  { Name: 'complaint_count', Type: 'int' },
  { Name: 'previous_incidents', Type: 'int' },
  { Name: 'response_time', Type: 'int' },
  { Name: 'weather_context', Type: 'string' },
  { Name: 'day_of_week', Type: 'string' },
];

export class GlueService {
  private databaseName: string;

  constructor() {
    this.databaseName = config.aws.glueDatabase;
  }

  async checkHealth(): Promise<{ status: 'CONNECTED' | 'NOT CONFIGURED' | 'ERROR'; database: string; error?: string }> {
    if (!this.databaseName) {
      return { status: 'NOT CONFIGURED', database: '' };
    }
    try {
      await glueClient.send(new GetDatabaseCommand({ Name: this.databaseName }));
      return { status: 'CONNECTED', database: this.databaseName };
    } catch (err: any) {
      return { status: 'ERROR', database: this.databaseName, error: err.message || err.name };
    }
  }

  async ensureCatalogTable(tableName = 'operational_telemetry'): Promise<{ created: boolean; table: string }> {
    if (!this.databaseName) {
      throw new Error('Glue database not configured.');
    }

    try {
      await glueClient.send(new GetTableCommand({
        DatabaseName: this.databaseName,
        Name: tableName,
      }));
      return { created: false, table: tableName };
    } catch (err: any) {
      if (err.name === 'EntityNotFoundException') {
        const createCmd = new CreateTableCommand({
          DatabaseName: this.databaseName,
          TableInput: {
            Name: tableName,
            Description: 'WasteSignal operational telemetry dataset catalog table',
            TableType: 'EXTERNAL_TABLE',
            Parameters: {
              'classification': 'csv',
              'skip.header.line.count': '1',
            },
            StorageDescriptor: {
              Columns: GLUE_COLUMNS,
              Location: `s3://${config.aws.s3Bucket}/wastesignal/raw/`,
              InputFormat: 'org.apache.hadoop.mapred.TextInputFormat',
              OutputFormat: 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
              SerdeInfo: {
                SerializationLibrary: 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe',
                Parameters: {
                  'field.delim': ',',
                  'serialization.format': ',',
                },
              },
            },
          },
        });
        await glueClient.send(createCmd);
        return { created: true, table: tableName };
      }
      throw err;
    }
  }

  async getTableSchema(tableName = 'operational_telemetry') {
    try {
      const res = await glueClient.send(new GetTableCommand({
        DatabaseName: this.databaseName,
        Name: tableName,
      }));
      return res.Table;
    } catch (err: any) {
      return null;
    }
  }
}

export const glueService = new GlueService();
