/* ============================================================
   WasteSignal — Centralized Demo Dataset
   
   This is ONE controlled synthetic dataset that powers ALL pages.
   Every metric shown in demo mode is derived from this dataset.
   No page may invent its own numbers.
   
   ALL VALUES ARE SYNTHETIC AND PROVIDED SOLELY TO DEMONSTRATE
   THE WASTESIGNAL WORKFLOW.
   ============================================================ */

import type { WasteRecord } from '../types';

// Base date for demo dataset — all timestamps are relative to this
const BASE = new Date('2026-10-04T00:00:00Z');

function daysAgo(n: number, hours = 0): string {
  const d = new Date(BASE);
  d.setDate(d.getDate() - n);
  d.setHours(hours);
  return d.toISOString();
}

/**
 * Centralized synthetic waste dataset.
 * 
 * ALL dashboard metrics MUST be calculated from this array.
 * If this dataset changes, all pages automatically update.
 */
export const DEMO_WASTE_DATA: WasteRecord[] = [
  // ── Zone 07 — Northern Residential Block ──
  { zone_id: 'Z-07', zone_name: 'Northern Residential Block', timestamp: daysAgo(0, 6), incident_type: 'OVERFLOW', incident_status: 'OPEN', collection_status: 'DELAYED', collection_delay: 45, latitude: 12.9850, longitude: 77.5920, route_id: 'R-07A', vehicle_id: 'V-12', waste_type: 'MIXED', volume: 320, source: 'FIELD_REPORT' },
  { zone_id: 'Z-07', zone_name: 'Northern Residential Block', timestamp: daysAgo(3, 14), incident_type: 'OVERFLOW', incident_status: 'RESOLVED', collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9852, longitude: 77.5918, route_id: 'R-07A', vehicle_id: 'V-12', waste_type: 'MIXED', volume: 290, source: 'FIELD_REPORT' },
  { zone_id: 'Z-07', zone_name: 'Northern Residential Block', timestamp: daysAgo(7, 9), incident_type: 'ILLEGAL_DUMPING', incident_status: 'RESOLVED', collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9855, longitude: 77.5922, route_id: 'R-07B', vehicle_id: 'V-08', waste_type: 'CONSTRUCTION', volume: 180, source: 'CITIZEN_REPORT' },
  { zone_id: 'Z-07', zone_name: 'Northern Residential Block', timestamp: daysAgo(12, 11), incident_type: 'OVERFLOW', incident_status: 'RESOLVED', collection_status: 'DELAYED', collection_delay: 30, latitude: 12.9848, longitude: 77.5925, route_id: 'R-07A', vehicle_id: 'V-12', waste_type: 'MIXED', volume: 350, source: 'SENSOR' },
  // Collection-only records for Z-07
  { zone_id: 'Z-07', zone_name: 'Northern Residential Block', timestamp: daysAgo(1, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9851, longitude: 77.5921, route_id: 'R-07A', vehicle_id: 'V-12', waste_type: 'MIXED', volume: 200, source: 'FLEET_LOG' },
  { zone_id: 'Z-07', zone_name: 'Northern Residential Block', timestamp: daysAgo(2, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9851, longitude: 77.5921, route_id: 'R-07A', vehicle_id: 'V-12', waste_type: 'ORGANIC', volume: 150, source: 'FLEET_LOG' },
  { zone_id: 'Z-07', zone_name: 'Northern Residential Block', timestamp: daysAgo(4, 7), collection_status: 'SCHEDULED', latitude: 12.9851, longitude: 77.5921, route_id: 'R-07A', vehicle_id: 'V-12', waste_type: 'MIXED', volume: 210, source: 'FLEET_LOG' },

  // ── Zone 09 — Transit Hub South ──
  { zone_id: 'Z-09', zone_name: 'Transit Hub South', timestamp: daysAgo(1, 18), incident_type: 'OVERFLOW', incident_status: 'OPEN', collection_status: 'DELAYED', collection_delay: 60, latitude: 12.9710, longitude: 77.5870, route_id: 'R-09A', vehicle_id: 'V-05', waste_type: 'MIXED', volume: 410, source: 'FIELD_REPORT' },
  { zone_id: 'Z-09', zone_name: 'Transit Hub South', timestamp: daysAgo(5, 17), incident_type: 'OVERFLOW', incident_status: 'RESOLVED', collection_status: 'DELAYED', collection_delay: 35, latitude: 12.9712, longitude: 77.5868, route_id: 'R-09A', vehicle_id: 'V-05', waste_type: 'MIXED', volume: 380, source: 'FIELD_REPORT' },
  { zone_id: 'Z-09', zone_name: 'Transit Hub South', timestamp: daysAgo(9, 16), incident_type: 'MISSED_COLLECTION', incident_status: 'RESOLVED', collection_status: 'MISSED', latitude: 12.9708, longitude: 77.5872, route_id: 'R-09B', vehicle_id: 'V-05', waste_type: 'MIXED', volume: 0, source: 'FLEET_LOG' },
  { zone_id: 'Z-09', zone_name: 'Transit Hub South', timestamp: daysAgo(2, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9710, longitude: 77.5870, route_id: 'R-09A', vehicle_id: 'V-05', waste_type: 'MIXED', volume: 260, source: 'FLEET_LOG' },
  { zone_id: 'Z-09', zone_name: 'Transit Hub South', timestamp: daysAgo(3, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9710, longitude: 77.5870, route_id: 'R-09A', vehicle_id: 'V-05', waste_type: 'MIXED', volume: 240, source: 'FLEET_LOG' },

  // ── Zone 04 — Central Market District ──
  { zone_id: 'Z-04', zone_name: 'Central Market District', timestamp: daysAgo(2, 10), incident_type: 'OVERFLOW', incident_status: 'OPEN', collection_status: 'DELAYED', collection_delay: 25, latitude: 12.9780, longitude: 77.5950, route_id: 'R-04A', vehicle_id: 'V-03', waste_type: 'ORGANIC', volume: 280, source: 'FIELD_REPORT' },
  { zone_id: 'Z-04', zone_name: 'Central Market District', timestamp: daysAgo(8, 9), incident_type: 'OVERFLOW', incident_status: 'RESOLVED', collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9782, longitude: 77.5948, route_id: 'R-04A', vehicle_id: 'V-03', waste_type: 'ORGANIC', volume: 310, source: 'SENSOR' },
  { zone_id: 'Z-04', zone_name: 'Central Market District', timestamp: daysAgo(15, 8), incident_type: 'MISSED_COLLECTION', incident_status: 'RESOLVED', collection_status: 'MISSED', latitude: 12.9778, longitude: 77.5952, route_id: 'R-04B', vehicle_id: 'V-03', waste_type: 'MIXED', volume: 0, source: 'FLEET_LOG' },
  { zone_id: 'Z-04', zone_name: 'Central Market District', timestamp: daysAgo(1, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9780, longitude: 77.5950, route_id: 'R-04A', vehicle_id: 'V-03', waste_type: 'ORGANIC', volume: 220, source: 'FLEET_LOG' },
  { zone_id: 'Z-04', zone_name: 'Central Market District', timestamp: daysAgo(3, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9780, longitude: 77.5950, route_id: 'R-04A', vehicle_id: 'V-03', waste_type: 'MIXED', volume: 190, source: 'FLEET_LOG' },
  { zone_id: 'Z-04', zone_name: 'Central Market District', timestamp: daysAgo(5, 7), collection_status: 'SCHEDULED', latitude: 12.9780, longitude: 77.5950, route_id: 'R-04A', vehicle_id: 'V-03', waste_type: 'ORGANIC', volume: 250, source: 'FLEET_LOG' },

  // ── Zone 12 — Industrial Corridor East ──
  { zone_id: 'Z-12', zone_name: 'Industrial Corridor East', timestamp: daysAgo(4, 13), incident_type: 'CONTAMINATION', incident_status: 'OPEN', collection_status: 'DELAYED', collection_delay: 90, latitude: 12.9650, longitude: 77.6100, route_id: 'R-12A', vehicle_id: 'V-15', waste_type: 'HAZARDOUS', volume: 150, source: 'FIELD_REPORT' },
  { zone_id: 'Z-12', zone_name: 'Industrial Corridor East', timestamp: daysAgo(11, 14), incident_type: 'OVERFLOW', incident_status: 'RESOLVED', collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9652, longitude: 77.6098, route_id: 'R-12A', vehicle_id: 'V-15', waste_type: 'INDUSTRIAL', volume: 480, source: 'FIELD_REPORT' },
  { zone_id: 'Z-12', zone_name: 'Industrial Corridor East', timestamp: daysAgo(3, 15), incident_type: 'ILLEGAL_DUMPING', incident_status: 'OPEN', collection_status: 'DELAYED', collection_delay: 120, latitude: 12.9648, longitude: 77.6105, route_id: 'R-12B', vehicle_id: 'V-15', waste_type: 'CONSTRUCTION', volume: 600, source: 'CITIZEN_REPORT' },
  { zone_id: 'Z-12', zone_name: 'Industrial Corridor East', timestamp: daysAgo(2, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9650, longitude: 77.6100, route_id: 'R-12A', vehicle_id: 'V-15', waste_type: 'INDUSTRIAL', volume: 350, source: 'FLEET_LOG' },

  // ── Zone 02 — Waterfront Promenade ──
  { zone_id: 'Z-02', zone_name: 'Waterfront Promenade', timestamp: daysAgo(5, 12), incident_type: 'OVERFLOW', incident_status: 'RESOLVED', collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9900, longitude: 77.5800, route_id: 'R-02A', vehicle_id: 'V-02', waste_type: 'MIXED', volume: 180, source: 'FIELD_REPORT' },
  { zone_id: 'Z-02', zone_name: 'Waterfront Promenade', timestamp: daysAgo(19, 15), incident_type: 'MISSED_COLLECTION', incident_status: 'RESOLVED', collection_status: 'MISSED', latitude: 12.9902, longitude: 77.5802, route_id: 'R-02A', vehicle_id: 'V-02', waste_type: 'MIXED', volume: 0, source: 'FLEET_LOG' },
  { zone_id: 'Z-02', zone_name: 'Waterfront Promenade', timestamp: daysAgo(1, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9900, longitude: 77.5800, route_id: 'R-02A', vehicle_id: 'V-02', waste_type: 'MIXED', volume: 140, source: 'FLEET_LOG' },
  { zone_id: 'Z-02', zone_name: 'Waterfront Promenade', timestamp: daysAgo(3, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9900, longitude: 77.5800, route_id: 'R-02A', vehicle_id: 'V-02', waste_type: 'RECYCLABLE', volume: 90, source: 'FLEET_LOG' },

  // ── Zone 15 — University Quarter ──
  { zone_id: 'Z-15', zone_name: 'University Quarter', timestamp: daysAgo(7, 11), incident_type: 'OVERFLOW', incident_status: 'RESOLVED', collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9550, longitude: 77.6050, route_id: 'R-15A', vehicle_id: 'V-09', waste_type: 'MIXED', volume: 220, source: 'FIELD_REPORT' },
  { zone_id: 'Z-15', zone_name: 'University Quarter', timestamp: daysAgo(1, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9550, longitude: 77.6050, route_id: 'R-15A', vehicle_id: 'V-09', waste_type: 'MIXED', volume: 160, source: 'FLEET_LOG' },
  { zone_id: 'Z-15', zone_name: 'University Quarter', timestamp: daysAgo(2, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9550, longitude: 77.6050, route_id: 'R-15A', vehicle_id: 'V-09', waste_type: 'RECYCLABLE', volume: 80, source: 'FLEET_LOG' },

  // ── Zone 03 — Old Town Heritage Area ──
  { zone_id: 'Z-03', zone_name: 'Old Town Heritage Area', timestamp: daysAgo(14, 10), incident_type: 'OVERFLOW', incident_status: 'RESOLVED', collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9820, longitude: 77.5880, route_id: 'R-03A', vehicle_id: 'V-07', waste_type: 'MIXED', volume: 130, source: 'FIELD_REPORT' },
  { zone_id: 'Z-03', zone_name: 'Old Town Heritage Area', timestamp: daysAgo(1, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9820, longitude: 77.5880, route_id: 'R-03A', vehicle_id: 'V-07', waste_type: 'MIXED', volume: 100, source: 'FLEET_LOG' },

  // ── Zone 11 — Logistics Park ──
  { zone_id: 'Z-11', zone_name: 'Logistics Park', timestamp: daysAgo(3, 16), incident_type: 'OVERFLOW', incident_status: 'OPEN', collection_status: 'DELAYED', collection_delay: 40, latitude: 12.9600, longitude: 77.6000, route_id: 'R-11A', vehicle_id: 'V-11', waste_type: 'PACKAGING', volume: 520, source: 'FIELD_REPORT' },
  { zone_id: 'Z-11', zone_name: 'Logistics Park', timestamp: daysAgo(10, 15), incident_type: 'OVERFLOW', incident_status: 'RESOLVED', collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9602, longitude: 77.5998, route_id: 'R-11A', vehicle_id: 'V-11', waste_type: 'PACKAGING', volume: 490, source: 'SENSOR' },
  { zone_id: 'Z-11', zone_name: 'Logistics Park', timestamp: daysAgo(2, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9600, longitude: 77.6000, route_id: 'R-11A', vehicle_id: 'V-11', waste_type: 'PACKAGING', volume: 380, source: 'FLEET_LOG' },

  // ── Zone 06 — Civic Center Plaza ──
  { zone_id: 'Z-06', zone_name: 'Civic Center Plaza', timestamp: daysAgo(21, 14), incident_type: 'OVERFLOW', incident_status: 'RESOLVED', collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9760, longitude: 77.5940, route_id: 'R-06A', vehicle_id: 'V-04', waste_type: 'MIXED', volume: 160, source: 'FIELD_REPORT' },
  { zone_id: 'Z-06', zone_name: 'Civic Center Plaza', timestamp: daysAgo(1, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9760, longitude: 77.5940, route_id: 'R-06A', vehicle_id: 'V-04', waste_type: 'MIXED', volume: 110, source: 'FLEET_LOG' },

  // ── Zone 14 — Suburban Residential West ──
  { zone_id: 'Z-14', zone_name: 'Suburban Residential West', timestamp: daysAgo(6, 8), incident_type: 'MISSED_COLLECTION', incident_status: 'RESOLVED', collection_status: 'MISSED', latitude: 12.9950, longitude: 77.5750, route_id: 'R-14A', vehicle_id: 'V-06', waste_type: 'MIXED', volume: 0, source: 'FLEET_LOG' },
  { zone_id: 'Z-14', zone_name: 'Suburban Residential West', timestamp: daysAgo(1, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9950, longitude: 77.5750, route_id: 'R-14A', vehicle_id: 'V-06', waste_type: 'MIXED', volume: 170, source: 'FLEET_LOG' },
  { zone_id: 'Z-14', zone_name: 'Suburban Residential West', timestamp: daysAgo(2, 7), collection_status: 'COMPLETED', collection_delay: 0, latitude: 12.9950, longitude: 77.5750, route_id: 'R-14A', vehicle_id: 'V-06', waste_type: 'RECYCLABLE', volume: 60, source: 'FLEET_LOG' },
];

export const DEMO_DATASET_META = {
  id: 'demo-waste-001',
  name: 'WasteSignal Synthetic Demo Dataset',
  fileName: 'demo-waste-001.csv',
  importedAt: BASE.toISOString(),
  totalRecords: DEMO_WASTE_DATA.length,
  validRecords: DEMO_WASTE_DATA.length,
  invalidRecords: 0,
  detectedColumns: [
    'zone_id', 'zone_name', 'timestamp', 'incident_type', 'incident_status',
    'collection_status', 'collection_delay', 'latitude', 'longitude',
    'route_id', 'vehicle_id', 'waste_type', 'volume', 'source'
  ],
  availableFields: [
    'zone_id', 'zone_name', 'timestamp', 'incident_type', 'incident_status',
    'collection_status', 'collection_delay', 'latitude', 'longitude',
    'route_id', 'vehicle_id', 'waste_type', 'volume', 'source'
  ],
  missingFields: ['weather', 'rainfall', 'temperature', 'footfall', 'land_use', 'commercial_activity'],
  status: 'VALIDATED' as const,
  isDemo: true,
};
