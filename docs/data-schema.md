# WasteSignal — Operational Telemetry Schema

## 1. Specification

WasteSignal defines a formal operational schema accommodating municipal, campus, and industrial waste collection telemetry.

| Field Name | Type | Required | Valid Range / Format | Description |
|---|---|---|---|---|
| `record_id` | String | Yes | Unique string | Unique identifier for each operational event |
| `timestamp` | String | Yes | ISO 8601 | Event or collection timestamp (e.g. `2026-10-04T08:00:00Z`) |
| `latitude` | Number | Yes | `-90` to `90` | Geographic latitude in decimal degrees |
| `longitude` | Number | Yes | `-180` to `180` | Geographic longitude in decimal degrees |
| `location_name` | String | Yes | Non-empty string | Human-readable location / landmark name |
| `zone_id` | String | Yes | Non-empty string | Municipal operational zone identifier (e.g. `Z-07`) |
| `waste_type` | String | Yes | Standard types | `MIXED`, `ORGANIC`, `RECYCLABLE`, `CONSTRUCTION`, `HAZARDOUS`, `INDUSTRIAL`, `PACKAGING` |
| `incident_type` | String | No | Enum | `OVERFLOW`, `ILLEGAL_DUMPING`, `MISSED_COLLECTION`, `CONTAMINATION` |
| `incident_status` | String | No | Enum | `OPEN`, `RESOLVED`, `MONITORING` |
| `collection_status` | String | Yes | Enum | `COMPLETED`, `DELAYED`, `MISSED`, `SCHEDULED` |
| `collection_delay` | Number | No | `>= 0` | Delay in minutes against scheduled route window |
| `reported_volume` | Number | Yes | `>= 0` | Estimated waste volume (kg, liters, or bin fill percentage) |
| `complaint_count` | Number | No | `>= 0` | Number of citizen or facility complaints logged |
| `previous_incidents`| Number | No | `>= 0` | Historical incidents logged at this node in past 90 days |
| `response_time` | Number | No | `>= 0` | Minutes elapsed between incident report and dispatch |
| `weather_context` | String | No | String | Contextual condition (`CLEAR`, `RAIN`, `HUMID`) |
| `day_of_week` | String | No | Weekday string | `Monday`, `Tuesday`, etc. |

## 2. Validation Rules
- **Duplicate Records**: If a `record_id` is repeated, the ingestion engine rejects the duplicate.
- **Geographic Bounds**: Coordinates outside legitimate Earth lat/lng boundaries trigger rejection.
- **Timestamp Integrity**: Malformed date strings trigger field-level validation errors.
- **Missing Required Telemetry**: Records lacking timestamp, coordinates, or zone identifiers are flagged with detailed diagnostic messages.
