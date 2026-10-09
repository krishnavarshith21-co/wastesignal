import {
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  ListWorkGroupsCommand,
} from '@aws-sdk/client-athena';
import { athenaClient } from './clients';
import { config } from '../config';

export class AthenaService {
  private database: string;
  private outputLocation: string;

  constructor() {
    this.database = config.aws.athenaDatabase;
    this.outputLocation = config.aws.athenaOutputLocation;
  }

  async checkHealth(): Promise<{ status: 'CONNECTED' | 'NOT CONFIGURED' | 'ERROR'; workgroup: string; database: string; error?: string }> {
    if (!this.database || !this.outputLocation) {
      return { status: 'NOT CONFIGURED', workgroup: '', database: this.database };
    }
    try {
      const res = await athenaClient.send(new ListWorkGroupsCommand({}));
      const primary = res.WorkGroups?.find(w => w.Name === 'primary') || res.WorkGroups?.[0];
      return {
        status: 'CONNECTED',
        workgroup: primary?.Name || 'primary',
        database: this.database,
      };
    } catch (err: any) {
      return {
        status: 'ERROR',
        workgroup: 'primary',
        database: this.database,
        error: err.message || err.name,
      };
    }
  }

  async runQuery(queryString: string, maxWaitMs = 25000): Promise<{ rows: Array<Record<string, string>>; queryExecutionId: string }> {
    if (!this.database || !this.outputLocation) {
      throw new Error('Analytics query failed: Athena database or output location not configured.');
    }

    let executionId: string;
    try {
      const startRes = await athenaClient.send(new StartQueryExecutionCommand({
        QueryString: queryString,
        QueryExecutionContext: { Database: this.database },
        ResultConfiguration: { OutputLocation: this.outputLocation },
      }));
      executionId = startRes.QueryExecutionId || '';
      if (!executionId) throw new Error('No QueryExecutionId returned by Athena.');
    } catch (err: any) {
      throw new Error(`Analytics query failed to start: ${err.message || err.name}`);
    }

    // Poll until query completes
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const checkRes = await athenaClient.send(new GetQueryExecutionCommand({
        QueryExecutionId: executionId,
      }));
      const state = checkRes.QueryExecution?.Status?.State;

      if (state === 'SUCCEEDED') {
        const resultsRes = await athenaClient.send(new GetQueryResultsCommand({
          QueryExecutionId: executionId,
        }));

        const resultRows = resultsRes.ResultSet?.Rows || [];
        if (resultRows.length <= 1) {
          return { rows: [], queryExecutionId: executionId };
        }

        const headers = (resultRows[0].Data || []).map(col => col.VarCharValue || '');
        const rows: Array<Record<string, string>> = [];

        for (let i = 1; i < resultRows.length; i++) {
          const rowObj: Record<string, string> = {};
          const rowData = resultRows[i].Data || [];
          headers.forEach((h, idx) => {
            rowObj[h] = rowData[idx]?.VarCharValue || '';
          });
          rows.push(rowObj);
        }

        return { rows, queryExecutionId: executionId };
      }

      if (state === 'FAILED' || state === 'CANCELLED') {
        const reason = checkRes.QueryExecution?.Status?.StateChangeReason || 'Unknown Athena error';
        throw new Error(`Analytics query failed (${state}): ${reason}`);
      }

      await new Promise(r => setTimeout(r, 1200));
    }

    throw new Error('Analytics query failed: Athena execution timed out.');
  }

  // Predefined analytical queries on operational_telemetry
  async getHotspotFrequency() {
    const q = `
      SELECT zone_id, location_name, COUNT(*) AS incident_count,
             COUNT(CASE WHEN incident_status = 'OPEN' THEN 1 END) AS open_incidents
      FROM operational_telemetry
      WHERE incident_type IS NOT NULL AND incident_type != ''
      GROUP BY zone_id, location_name
      ORDER BY incident_count DESC
      LIMIT 15;
    `;
    return this.runQuery(q);
  }

  async getCollectionPerformance() {
    const q = `
      SELECT collection_status, COUNT(*) AS status_count,
             ROUND(AVG(collection_delay), 1) AS avg_delay_minutes
      FROM operational_telemetry
      WHERE collection_status IS NOT NULL AND collection_status != ''
      GROUP BY collection_status;
    `;
    return this.runQuery(q);
  }

  async getDayOfWeekPatterns() {
    const q = `
      SELECT day_of_week, COUNT(*) AS incident_count
      FROM operational_telemetry
      WHERE incident_type IS NOT NULL AND incident_type != ''
      GROUP BY day_of_week
      ORDER BY incident_count DESC;
    `;
    return this.runQuery(q);
  }
}

export const athenaService = new AthenaService();
