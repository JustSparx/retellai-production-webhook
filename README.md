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

### Render.com Deployment Guide

#### Step 1: Repository Setup
1. **Push this repository to GitHub** (if not already done)
2. **Log into Render.com** and connect your GitHub account

#### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. **Connect Repository**: Select this GitHub repository
3. **Service Configuration**:
   - **Name**: `retellai-emergency-webhook` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### Step 3: Environment Variables
In the Render dashboard, add these environment variables:

```bash
# Required: Your Airtable Personal Access Token
AIRTABLE_TOKEN=your_airtable_personal_access_token_here

# Required: Your Airtable Base ID
BASE_ID=your_airtable_base_id_here

# Optional: Table name (defaults to AfterHoursCallLog)
AFTERHOURS_TABLE_NAME=AfterHoursCallLog

# Optional: Port (Render automatically sets this)
PORT=3000
```

#### Step 4: Getting Airtable Credentials

##### Airtable Personal Access Token:
1. Go to [Airtable Developer Hub](https://airtable.com/create/tokens)
2. Click **"Create token"**
3. **Name**: `RetellAI Emergency Webhook`
4. **Scopes**: Select `data.records:write` and `data.records:read`
5. **Access**: Choose your workspace and specific base
6. **Copy the token** (starts with `pat...`)

**Note**: Token format should look like: `patABC123XYZ.1234567890abcdef...`

##### Airtable Base ID:
1. Open your Airtable base
2. Go to **Help** → **API Documentation**
3. **Base ID** is shown at the top (starts with `app...`)

#### Step 5: Deploy & Test
1. **Deploy**: Click **"Create Web Service"** in Render
2. **Wait for build**: Monitor build logs for any errors
3. **Get webhook URL**: Copy your Render service URL
4. **Test health endpoint**: Visit `https://your-service.onrender.com/health`

#### Step 6: Verify Deployment
Check the health endpoint response:
```json
{
  "status": "OK",
  "timestamp": "2025-06-17T...",
  "endpoints": ["/emergency-webhook", "/health"],
  "environment": {
    "has_airtable_token": true,
    "has_base_id": true,
    "afterhours_table": "AfterHoursCallLog"
  }
}
```

All environment flags should be `true`.

#### Step 7: Configure RetellAI
1. **Webhook URL**: `https://your-service.onrender.com/emergency-webhook`
2. **Tool Name**: `log-the-emergency`
3. **Method**: `POST`
4. **Test**: Make a test call to verify data flows to Airtable

#### Step 8: Quick Test (Optional)
Test your deployment with curl:
```bash
curl -X POST https://your-service.onrender.com/emergency-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "log-the-emergency",
    "args": {
      "caller": "Test Caller",
      "callback_number": "555-123-4567",
      "emergency_type": "Test Emergency",
      "address_of_emergency": "Test Property",
      "property_manager": "Test Manager",
      "company_name": "Test Company",
      "call_transcription": "This is a test emergency call"
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "record_id": "rec...",
  "message": "Emergency logged to AfterHoursCallLog"
}
```

Check your Airtable to verify the test record was created.

### Troubleshooting

#### Common Issues:

**❌ "Missing environment variables"**
- Verify all environment variables are set in Render dashboard
- Check spelling of variable names
- Ensure tokens don't have extra spaces

**❌ "Airtable authentication failed"**
- Verify Personal Access Token has correct scopes
- Check Base ID is correct
- Ensure token isn't expired

**❌ "Field mapping errors"**
- Verify Airtable table has all required fields
- Check field names match exactly (case-sensitive):
  - `Timestamp` (DateTime)
  - `Caller Name` (Single line text)  
  - `Property Name` (Single line text)
  - `Manager Name` (Single line text)
  - `Company Name` (Single line text)
  - `Emergency Type` (Single line text)
  - `Transcript` (Long text)
  - `Callback Number` (Phone number)
- Ensure field types are correct as listed above

**❌ "Render build fails"**
- Check Node.js version compatibility (requires 16+)
- Verify package.json dependencies
- Review build logs for specific errors

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