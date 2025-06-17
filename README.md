# RetellAI Emergency Webhook

Production webhook service for processing RetellAI emergency tool calls and automatically logging them to Airtable.

## Overview

This webhook receives RetellAI tool call data (specifically `log-the-emergency` calls) and writes structured emergency information to an Airtable `AfterHoursCallLog` table. Designed for property management after-hours emergency services.

## Features

- ✅ Processes `log-the-emergency` tool calls from RetellAI
- ✅ Maps tool call data to Airtable AfterHoursCallLog schema
- ✅ Environment variable configuration (no hardcoded credentials)
- ✅ Comprehensive logging and error handling
- ✅ Health check endpoint for monitoring
- ✅ Deploy-ready for render.com

## API Endpoints

### `POST /emergency-webhook`
Processes RetellAI emergency tool calls and writes to Airtable.

**Expected payload format:**
```json
{
  "name": "log-the-emergency",
  "args": {
    "caller": "John Doe",
    "callback_number": "555-123-4567",
    "emergency_type": "Water leak in basement",
    "address_of_emergency": "123 Main St, City",
    "property_manager": "Jane Smith",
    "company_name": "ABC Properties",
    "call_transcription": "Full conversation transcript..."
  },
  "call": { ... }
}
```

### `GET /health`
Health check and configuration status.

## Environment Variables

Required environment variables for deployment:

```
AIRTABLE_TOKEN=your_airtable_personal_access_token
BASE_ID=your_airtable_base_id
AFTERHOURS_TABLE_NAME=AfterHoursCallLog
PORT=3000
```

## Airtable Schema

The webhook writes to the `AfterHoursCallLog` table with these fields:

- **Timestamp** (DateTime) - When the emergency was logged
- **Caller Name** (Single line text) - Person reporting the emergency
- **Property Name** (Single line text) - Property address/name
- **Manager Name** (Single line text) - Assigned property manager
- **Company Name** (Single line text) - Property management company
- **Emergency Type** (Single line text) - Type of emergency reported
- **Transcript** (Long text) - Full conversation transcript
- **Callback Number** (Phone number) - Caller's contact number

## Deployment

### Render.com

1. Connect this GitHub repository to Render
2. Create a new Web Service
3. Set environment variables in Render dashboard
4. Deploy

### Local Development

```bash
npm install
node webhook.js
```

## Usage

1. Deploy webhook to render.com
2. Configure RetellAI agent to call webhook URL
3. Emergency calls automatically flow to Airtable
4. Use Airtable automations for notifications/routing

## Success Response

```json
{
  "success": true,
  "record_id": "rec1234567890",
  "message": "Emergency logged to AfterHoursCallLog",
  "processed_data": {
    "caller": "John Doe",
    "emergency_type": "Water leak",
    "property": "123 Main St",
    "manager": "Jane Smith"
  }
}
```

## Error Handling

- Validates required emergency data
- Handles Airtable API errors gracefully
- Provides detailed error logging
- Returns appropriate HTTP status codes

Built with ❤️ for property management emergency response automation.