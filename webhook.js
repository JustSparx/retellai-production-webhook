const express = require('express');
const axios = require('axios');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Environment variables
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.BASE_ID;
const AFTERHOURS_TABLE_NAME = process.env.AFTERHOURS_TABLE_NAME || 'AfterHoursCallLog';

// Construct Airtable API URL
const afterhoursAirtableURL = `https://api.airtable.com/v0/${BASE_ID}/${AFTERHOURS_TABLE_NAME}`;

// Tool call handler for emergency logging
app.post('/emergency-webhook', async (req, res) => {
    console.log('📞 Emergency webhook received:', JSON.stringify(req.body, null, 2));

    try {
        // Extract tool call data
        const toolName = req.body?.name;
        const args = req.body?.args || {};
        const callData = req.body?.call || {};
        
        // Validate this is an emergency tool call
        if (toolName !== 'log-the-emergency') {
            console.log(`ℹ️  Ignoring non-emergency tool: ${toolName}`);
            return res.status(200).json({ 
                success: true, 
                message: `Tool ${toolName} received but not processed by emergency handler` 
            });
        }

        // Extract emergency data from args
        const timestamp = new Date().toISOString();
        const callerName = args.caller || 'Unknown Caller';
        const propertyName = args.address_of_emergency || 'Unknown Property';
        const managerName = args.property_manager || 'Unknown Manager';
        const companyName = args.company_name || 'Unknown Company';
        const emergencyType = args.emergency_type || 'Unknown Emergency';
        const transcript = args.call_transcription || 'No transcript available';
        const callbackNumber = args.callback_number || 'No callback number';

        console.log(`🚨 Processing emergency:`, {
            caller: callerName,
            emergency: emergencyType,
            property: propertyName,
            manager: managerName
        });

        // Validate required data
        if (!callerName || !emergencyType) {
            console.warn("❌ Missing required emergency data");
            return res.status(400).json({ 
                error: "Missing required emergency data",
                required: ["caller", "emergency_type"]
            });
        }

        // Prepare Airtable record
        const record = {
            fields: {
                "Timestamp": timestamp,
                "Caller Name": callerName,
                "Property Name": propertyName,
                "Manager Name": managerName,
                "Company Name": companyName,
                "Emergency Type": emergencyType,
                "Transcript": transcript,
                "Callback Number": callbackNumber
            }
        };

        console.log(`💾 Writing emergency to Airtable:`, record);

        // Write to Airtable
        const response = await axios.post(afterhoursAirtableURL, {
            records: [record]
        }, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        const recordId = response.data.records[0].id;
        console.log(`✅ Emergency logged successfully: Record ID ${recordId}`);

        return res.status(200).json({
            success: true,
            record_id: recordId,
            message: "Emergency logged to AfterHoursCallLog",
            processed_data: {
                caller: callerName,
                emergency_type: emergencyType,
                property: propertyName,
                manager: managerName
            }
        });

    } catch (error) {
        console.error('❌ Emergency logging error:', error.response?.data || error.message);
        
        // Log detailed error for debugging
        if (error.response?.data?.error?.details) {
            console.error('Airtable field errors:', error.response.data.error.details);
        }

        return res.status(500).json({ 
            error: 'Failed to log emergency', 
            details: error.response?.data || error.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        endpoints: ['/emergency-webhook', '/health'],
        environment: {
            has_airtable_token: !!AIRTABLE_TOKEN,
            has_base_id: !!BASE_ID,
            afterhours_table: AFTERHOURS_TABLE_NAME
        }
    });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 RetellAI Emergency Webhook listening on port ${port}`);
    console.log(`📍 Endpoints:`);
    console.log(`   POST /emergency-webhook    - Process emergency tool calls`);
    console.log(`   GET  /health               - Health check & config`);
    console.log(`💾 Target: Airtable ${AFTERHOURS_TABLE_NAME} table`);
});