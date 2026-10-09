export interface RawWasteInputRecord {
  record_id?: string;
  timestamp?: string;
  latitude?: number | string;
  longitude?: number | string;
  location_name?: string;
  zone_id?: string;
  waste_type?: string;
  incident_type?: string;
  incident_status?: string;
  collection_status?: string;
  collection_frequency?: string;
  reported_volume?: number | string;
  complaint_count?: number | string;
  previous_incidents?: number | string;
  response_time?: number | string;
  collection_delay?: number | string;
  weather_context?: string;
  day_of_week?: string;
  [key: string]: any;
}

export interface ValidatedWasteRecord {
  record_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  location_name: string;
  zone_id: string;
  waste_type: string;
  incident_type?: string;
  incident_status?: string;
  collection_status: string;
  collection_frequency?: string;
  reported_volume: number;
  complaint_count: number;
  previous_incidents: number;
  response_time: number;
  collection_delay: number;
  weather_context?: string;
  day_of_week?: string;
}

export interface ValidationErrorItem {
  recordIndex: number;
  recordId?: string;
  field: string;
  message: string;
}

export interface DatasetValidationResult {
  valid: boolean;
  totalRecords: number;
  validRecordsCount: number;
  invalidRecordsCount: number;
  errors: ValidationErrorItem[];
  warnings: string[];
  records: ValidatedWasteRecord[];
}

export const SUPPORTED_WASTE_TYPES = [
  'MIXED',
  'ORGANIC',
  'RECYCLABLE',
  'CONSTRUCTION',
  'HAZARDOUS',
  'INDUSTRIAL',
  'PACKAGING',
  'ELECTRONIC',
  'BULKY',
];

export function validateAndNormalizeDataset(rawRows: RawWasteInputRecord[]): DatasetValidationResult {
  const errors: ValidationErrorItem[] = [];
  const warnings: string[] = [];
  const validRecords: ValidatedWasteRecord[] = [];
  const seenRecordIds = new Set<string>();

  rawRows.forEach((row, idx) => {
    const recordId = row.record_id ? String(row.record_id).trim() : `REC-${idx + 1}`;

    // Duplicate record detection
    if (seenRecordIds.has(recordId)) {
      errors.push({
        recordIndex: idx,
        recordId,
        field: 'record_id',
        message: `Duplicate record_id detected: '${recordId}'. Record IDs must be unique.`,
      });
      return;
    }
    seenRecordIds.add(recordId);

    // Timestamp validation
    if (!row.timestamp) {
      errors.push({
        recordIndex: idx,
        recordId,
        field: 'timestamp',
        message: 'Missing required field: timestamp.',
      });
      return;
    }
    const parsedDate = new Date(row.timestamp);
    if (isNaN(parsedDate.getTime())) {
      errors.push({
        recordIndex: idx,
        recordId,
        field: 'timestamp',
        message: `Invalid ISO 8601 timestamp value: '${row.timestamp}'.`,
      });
      return;
    }

    // Coordinates validation
    const lat = row.latitude !== undefined && row.latitude !== '' ? Number(row.latitude) : NaN;
    const lng = row.longitude !== undefined && row.longitude !== '' ? Number(row.longitude) : NaN;

    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push({
        recordIndex: idx,
        recordId,
        field: 'latitude',
        message: `Invalid latitude: '${row.latitude}'. Must be a number between -90 and 90.`,
      });
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push({
        recordIndex: idx,
        recordId,
        field: 'longitude',
        message: `Invalid longitude: '${row.longitude}'. Must be a number between -180 and 180.`,
      });
      return;
    }

    // Location / Zone name validation
    const locationName = (row.location_name || row.zone_name || row.zone_id || `Location ${recordId}`).trim();
    const zoneId = (row.zone_id || `Z-${idx + 1}`).trim();

    // Waste Type validation
    const wasteType = (row.waste_type || 'MIXED').toUpperCase().trim();
    if (!SUPPORTED_WASTE_TYPES.includes(wasteType)) {
      warnings.push(`Record ${recordId}: Non-standard waste type '${wasteType}'. Standard types are: ${SUPPORTED_WASTE_TYPES.join(', ')}.`);
    }

    // Numeric validations
    const reportedVolume = Number(row.reported_volume ?? row.volume ?? 0);
    if (isNaN(reportedVolume) || reportedVolume < 0) {
      errors.push({
        recordIndex: idx,
        recordId,
        field: 'reported_volume',
        message: `Invalid reported_volume: '${row.reported_volume}'. Must be a non-negative number.`,
      });
      return;
    }

    const complaintCount = Number(row.complaint_count ?? 0);
    const previousIncidents = Number(row.previous_incidents ?? 0);
    const responseTime = Number(row.response_time ?? 0);
    const collectionDelay = Number(row.collection_delay ?? 0);

    // Day of week
    const dayOfWeek = row.day_of_week || parsedDate.toLocaleDateString('en-US', { weekday: 'long' });

    validRecords.push({
      record_id: recordId,
      timestamp: parsedDate.toISOString(),
      latitude: lat,
      longitude: lng,
      location_name: locationName,
      zone_id: zoneId,
      waste_type: wasteType,
      incident_type: row.incident_type ? String(row.incident_type).toUpperCase().trim() : undefined,
      incident_status: row.incident_status ? String(row.incident_status).toUpperCase().trim() : undefined,
      collection_status: (row.collection_status || 'SCHEDULED').toUpperCase().trim(),
      collection_frequency: row.collection_frequency || 'DAILY',
      reported_volume: reportedVolume,
      complaint_count: isNaN(complaintCount) ? 0 : Math.max(0, complaintCount),
      previous_incidents: isNaN(previousIncidents) ? 0 : Math.max(0, previousIncidents),
      response_time: isNaN(responseTime) ? 0 : Math.max(0, responseTime),
      collection_delay: isNaN(collectionDelay) ? 0 : Math.max(0, collectionDelay),
      weather_context: row.weather_context || row.weather || 'CLEAR',
      day_of_week: dayOfWeek,
    });
  });

  return {
    valid: errors.length === 0,
    totalRecords: rawRows.length,
    validRecordsCount: validRecords.length,
    invalidRecordsCount: errors.length,
    errors,
    warnings,
    records: validRecords,
  };
}
