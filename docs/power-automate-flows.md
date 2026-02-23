# Genesis x Power Automate Integration Guide

This guide shows IT how to set up Power Automate flows to connect Genesis with Jupiter (Salesforce) and Microsoft Teams.

## Architecture Overview

```
Genesis (Intelligence Layer)
    |
    | Fires webhook events
    v
Power Automate (Integration Layer)
    |
    +--> Creates opportunity in Jupiter (Salesforce)
    +--> Sends Teams notification
    +--> Calls Genesis confirmation endpoint
    v
Jupiter (Salesforce CRM)
    |
    | Changes trigger reverse flow
    v
Genesis (receives updates)
```

**Why Power Automate?**
- Deloitte IT already knows Power Automate
- Pre-built Salesforce and Teams connectors
- Built-in retry logic and error handling
- Automatic audit logging for compliance
- Genesis stays lightweight (no OAuth management)

---

## Flow 1: Push to Jupiter (Salesforce)

### Trigger
When Genesis user clicks "Push to Jupiter", Genesis fires a webhook to this flow.

### Steps to Create

1. **Go to Power Automate**
   - Navigate to https://make.powerautomate.com
   - Click "Create" → "Automated cloud flow"

2. **Add HTTP Trigger**
   - Search for "When a HTTP request is received"
   - Leave "Request Body JSON Schema" empty for now
   - Save the flow to get the HTTP POST URL
   - Copy this URL for Genesis webhook configuration

3. **Parse JSON**
   - Add action: "Data Operations" → "Parse JSON"
   - Content: `@{triggerBody()}`
   - Schema:
   ```json
   {
     "type": "object",
     "properties": {
       "event": { "type": "string" },
       "timestamp": { "type": "string" },
       "data": {
         "type": "object",
         "properties": {
           "opportunity": {
             "type": "object",
             "properties": {
               "id": { "type": "string" },
               "title": { "type": "string" },
               "entity": { "type": "string" },
               "amount": { "type": ["integer", "null"] },
               "close_date": { "type": ["string", "null"] },
               "stage": { "type": "string" },
               "description": { "type": "string" },
               "pursuit_lead": { "type": "string" },
               "win_probability": { "type": "integer" },
               "genesis_url": { "type": "string" },
               "genesis_pillar": { "type": "string" },
               "ot_systems": { "type": "array" },
               "regulatory_drivers": { "type": "array" }
             }
           }
         }
       }
     }
   }
   ```

4. **Search for Existing Account (Optional)**
   - Add action: "Salesforce" → "Get records"
   - Object type: Account
   - Filter: `Name eq '@{body('Parse_JSON')?['data']?['opportunity']?['entity']}'`
   - If found, use existing Account ID

5. **Create Account if Not Found (Condition)**
   - Add action: "Salesforce" → "Create a new record"
   - Object type: Account
   - Name: `@{body('Parse_JSON')?['data']?['opportunity']?['entity']}`

6. **Create Opportunity in Salesforce**
   - Add action: "Salesforce" → "Create a new record"
   - Object type: Opportunity
   - Field mappings:

   | Salesforce Field | Power Automate Expression |
   |-----------------|---------------------------|
   | Name | `@{body('Parse_JSON')?['data']?['opportunity']?['title']}` |
   | AccountId | Use Account ID from step 4/5 |
   | Amount | `@{body('Parse_JSON')?['data']?['opportunity']?['amount']}` |
   | CloseDate | `@{body('Parse_JSON')?['data']?['opportunity']?['close_date']}` |
   | StageName | `Qualification` |
   | Probability | `@{body('Parse_JSON')?['data']?['opportunity']?['win_probability']}` |
   | Description | `@{body('Parse_JSON')?['data']?['opportunity']?['description']}` |
   | Genesis_Link__c | `@{body('Parse_JSON')?['data']?['opportunity']?['genesis_url']}` |

   > **Note:** Create a custom field `Genesis_Link__c` (URL type) in Salesforce to store the Genesis link.

7. **Post to Teams (Optional)**
   - Add action: "Microsoft Teams" → "Post message in a chat or channel"
   - Team: Select your OT Cyber team
   - Channel: Select deals/opportunities channel
   - Message:
   ```
   ✅ **New Opportunity in Jupiter**

   **@{body('Parse_JSON')?['data']?['opportunity']?['title']}**
   Account: @{body('Parse_JSON')?['data']?['opportunity']?['entity']}
   Amount: $@{body('Parse_JSON')?['data']?['opportunity']?['amount']}
   Pursuit Lead: @{body('Parse_JSON')?['data']?['opportunity']?['pursuit_lead']}

   [View in Genesis](@{body('Parse_JSON')?['data']?['opportunity']?['genesis_url']})
   ```

8. **Confirm Sync to Genesis**
   - Add action: "HTTP" → "HTTP"
   - Method: POST
   - URI: `https://usbuildclock.vercel.app/api/webhooks/jupiter-confirm`
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
     "genesis_id": "@{body('Parse_JSON')?['data']?['opportunity']?['id']}",
     "salesforce_id": "@{body('Create_Opportunity')?['Id']}",
     "status": "success"
   }
   ```

9. **Add Error Handling**
   - Configure "Run after" on the HTTP action to run even if Salesforce fails
   - For failures, POST status: "error" with error message

### Register Webhook in Genesis

After saving your flow and getting the HTTP POST URL, register it in Genesis:

```bash
curl -X POST "https://usbuildclock.vercel.app/api/webhooks/outbound" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "opportunity.push_to_jupiter",
    "callback_url": "YOUR_POWER_AUTOMATE_URL_HERE",
    "enabled": true
  }'
```

---

## Flow 2: Deadline Alert to Teams

### Trigger
Genesis fires `opportunity.deadline_approaching` 7 days and 1 day before deadlines.

### Steps to Create

1. **Add HTTP Trigger** (same as Flow 1)

2. **Parse JSON**
   Schema:
   ```json
   {
     "type": "object",
     "properties": {
       "event": { "type": "string" },
       "timestamp": { "type": "string" },
       "data": {
         "type": "object",
         "properties": {
           "opportunity_id": { "type": "string" },
           "title": { "type": "string" },
           "deadline": { "type": "string" },
           "days_remaining": { "type": "integer" },
           "amount": { "type": ["integer", "null"] },
           "urgency": { "type": "string" },
           "genesis_url": { "type": "string" }
         }
       }
     }
   }
   ```

3. **Post Adaptive Card to Teams**
   - Add action: "Microsoft Teams" → "Post adaptive card in a chat or channel"
   - Card JSON:
   ```json
   {
     "type": "AdaptiveCard",
     "body": [
       {
         "type": "TextBlock",
         "size": "Medium",
         "weight": "Bolder",
         "text": "⏰ Deadline Approaching",
         "color": "@{if(equals(body('Parse_JSON')?['data']?['urgency'], 'critical'), 'Attention', 'Warning')}"
       },
       {
         "type": "TextBlock",
         "text": "@{body('Parse_JSON')?['data']?['title']}",
         "weight": "Bolder",
         "size": "Large",
         "wrap": true
       },
       {
         "type": "FactSet",
         "facts": [
           {
             "title": "Deadline",
             "value": "@{body('Parse_JSON')?['data']?['deadline']}"
           },
           {
             "title": "Days Remaining",
             "value": "@{body('Parse_JSON')?['data']?['days_remaining']}"
           },
           {
             "title": "Amount",
             "value": "$@{body('Parse_JSON')?['data']?['amount']}"
           }
         ]
       }
     ],
     "actions": [
       {
         "type": "Action.OpenUrl",
         "title": "View in Genesis",
         "url": "@{body('Parse_JSON')?['data']?['genesis_url']}"
       }
     ],
     "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
     "version": "1.4"
   }
   ```

4. **Optional: Create Planner Task**
   - Add action: "Planner" → "Create a task"
   - Plan Id: Your OT Cyber plan
   - Bucket Id: Deadlines bucket
   - Title: `@{body('Parse_JSON')?['data']?['title']} - Due @{body('Parse_JSON')?['data']?['deadline']}`

---

## Flow 3: Jupiter to Genesis Sync (Bidirectional)

### Trigger
When a Salesforce opportunity with a Genesis link is modified.

### Steps to Create

1. **Add Salesforce Trigger**
   - Search for "Salesforce" → "When a record is modified"
   - Object type: Opportunity
   - Filter (if available): `Genesis_Link__c != null`

2. **Check for Genesis Link**
   - Add condition: Genesis_Link__c is not empty
   - If false, terminate flow

3. **Extract Genesis ID**
   - Add action: "Compose"
   - Expression to extract ID from URL:
   ```
   last(split(triggerBody()?['Genesis_Link__c'], 'id='))
   ```

4. **POST to Genesis**
   - Add action: "HTTP" → "HTTP"
   - Method: POST
   - URI: `https://usbuildclock.vercel.app/api/webhooks/jupiter-inbound`
   - Headers: `Content-Type: application/json`
   - Body:
   ```json
   {
     "genesis_id": "@{outputs('Extract_Genesis_ID')}",
     "salesforce_id": "@{triggerBody()?['Id']}",
     "stage": "@{triggerBody()?['StageName']}",
     "amount": @{triggerBody()?['Amount']},
     "close_date": "@{triggerBody()?['CloseDate']}",
     "owner_name": "@{triggerBody()?['Owner']?['Name']}",
     "probability": @{triggerBody()?['Probability']}
   }
   ```

---

## Testing

### Test Push to Jupiter

1. Configure Power Automate flow
2. Register webhook in Genesis
3. Go to Genesis Radar
4. Find an opportunity in "Contacted" status
5. Click "Push to Jupiter"
6. Fill in Pursuit Lead and Win Probability
7. Click "Push to Jupiter" button
8. Check:
   - Power Automate flow run history
   - Salesforce for new opportunity
   - Teams channel for notification (if configured)
   - Genesis shows "Jupiter" badge on opportunity

### Test Deadline Alerts

1. Configure deadline flow
2. Register webhook for `opportunity.deadline_approaching`
3. Wait for deadline event (or manually trigger via API)
4. Check Teams channel for Adaptive Card

### Test Bidirectional Sync

1. Configure Jupiter-to-Genesis flow
2. Update stage in Salesforce
3. Check Genesis shows updated status

---

## Troubleshooting

### Webhook not firing

1. Check webhook subscription exists:
   ```
   GET https://usbuildclock.vercel.app/api/webhooks/outbound
   ```
2. Verify `enabled: true`
3. Check callback_url is correct

### Power Automate flow not triggering

1. Check flow is turned on
2. Verify HTTP trigger URL matches webhook subscription
3. Check flow run history for errors

### Salesforce creation fails

1. Verify Salesforce connection in Power Automate
2. Check required fields are populated
3. Verify user has permission to create opportunities
4. Check for validation rule failures

### Genesis not showing sync confirmation

1. Check `jupiter-confirm` endpoint response
2. Verify genesis_id matches opportunity ID
3. Check Power Automate HTTP action succeeded

---

## Salesforce Custom Field Setup

Create these custom fields on the Opportunity object:

| Field Label | API Name | Type | Description |
|-------------|----------|------|-------------|
| Genesis Link | Genesis_Link__c | URL | Link back to Genesis record |
| Genesis Pillar | Genesis_Pillar__c | Text(50) | OT Cyber pillar (power, ai-compute, etc.) |
| OT Systems | OT_Systems__c | Text(255) | Comma-separated list (SCADA, DCS, etc.) |

---

## Support

For issues with:
- **Genesis webhooks**: Check the Genesis integrations page or contact the Genesis team
- **Power Automate**: Use Power Automate's built-in help or contact Deloitte IT
- **Salesforce**: Contact your Salesforce admin
