'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ============================================
// INTEGRATIONS HUB
// API documentation, webhooks, connections
// "How do I plug this into other systems?"
// ============================================

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  example?: string;
}

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'available' | 'coming_soon' | 'connected';
  category: 'notification' | 'crm' | 'automation' | 'analytics';
}

const API_ENDPOINTS: APIEndpoint[] = [
  { method: 'GET', path: '/api/v1/opportunities', description: 'List all opportunities with filtering', example: '?pillar=power&min_value=10000000' },
  { method: 'GET', path: '/api/v1/insights', description: 'Market intelligence and analysis', example: '?category=opportunity&urgency=high' },
  { method: 'GET', path: '/api/v1/sectors', description: 'Sector health and roadmap data', example: '?status=blocked' },
  { method: 'GET', path: '/api/v1/actions', description: 'Agent action queue', example: '?status=pending&priority=high' },
  { method: 'POST', path: '/api/v1/actions', description: 'Queue a new agent action', example: '{ "type": "draft_email", "target": {...} }' },
  { method: 'GET', path: '/api/v1/briefings', description: 'Generate briefing documents', example: '?type=partner_weekly&format=markdown' },
  { method: 'POST', path: '/api/v1/briefings', description: 'Create custom briefing', example: '{ "type": "client_meeting", "sectors": ["power"] }' },
  { method: 'GET', path: '/api/webhooks', description: 'List webhook subscriptions' },
  { method: 'POST', path: '/api/webhooks', description: 'Create webhook subscription', example: '{ "callback_url": "...", "events": [...] }' },
];

const INTEGRATIONS: Integration[] = [
  { id: 'slack', name: 'Slack', icon: '💬', description: 'Get alerts in your deal channel when deadlines approach or new opportunities surface', status: 'available', category: 'notification' },
  { id: 'teams', name: 'Microsoft Teams', icon: '👥', description: 'Push notifications to Teams channels for your OT Cyber practice', status: 'available', category: 'notification' },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', description: 'Sync opportunities to Salesforce CRM, update deal stages automatically', status: 'available', category: 'crm' },
  { id: 'servicenow', name: 'ServiceNow', icon: '🔧', description: 'Create tickets from agent alerts, track remediation actions', status: 'coming_soon', category: 'crm' },
  { id: 'power-automate', name: 'Power Automate', icon: '⚡', description: 'Build automated workflows triggered by Genesis events', status: 'available', category: 'automation' },
  { id: 'zapier', name: 'Zapier', icon: '🔗', description: 'Connect to 5000+ apps with webhook triggers', status: 'available', category: 'automation' },
  { id: 'powerbi', name: 'Power BI', icon: '📊', description: 'Import Genesis data for custom dashboards and reporting', status: 'available', category: 'analytics' },
  { id: 'tableau', name: 'Tableau', icon: '📈', description: 'Connect via REST API for visualization', status: 'available', category: 'analytics' },
];

const WEBHOOK_EVENTS = [
  { event: 'opportunity.push_to_jupiter', description: 'User pushes opportunity to Jupiter/Salesforce' },
  { event: 'opportunity.deadline_approaching', description: 'Fires 7 days before deadline' },
  { event: 'opportunity.status_changed', description: 'Deal stage updated' },
  { event: 'agent.alert_raised', description: 'Sector agent raises priority alert' },
  { event: 'sector.blocker_resolved', description: 'Policy/regulatory blocker cleared' },
  { event: 'briefing.generated', description: 'New briefing document created' },
];

const ACTION_TYPES = [
  { type: 'draft_email', description: 'Generate outreach email to contact', icon: '✉️' },
  { type: 'create_briefing', description: 'Generate partner/client briefing', icon: '📄' },
  { type: 'notify_slack', description: 'Send Slack notification', icon: '💬' },
  { type: 'update_crm', description: 'Push update to CRM system', icon: '☁️' },
  { type: 'schedule_followup', description: 'Create calendar reminder', icon: '📅' },
  { type: 'flag_for_review', description: 'Flag for human review', icon: '🚩' },
];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'api' | 'webhooks' | 'integrations' | 'actions' | 'jupiter'>('api');
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(text);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d0d14]">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl">
                  🔌
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Integrations Hub</h1>
                  <p className="text-xs text-gray-500">APIs, Webhooks, Connections</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-sm text-gray-300">
                ← Command Center
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Genesis is API-First</h2>
          <p className="text-gray-300 mb-4">
            Every piece of data in Genesis is accessible via REST API. Plug into Salesforce, trigger Slack alerts,
            build Power BI dashboards, or let agents take action automatically.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-gray-400">RESTful JSON APIs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-gray-400">Webhook subscriptions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-gray-400">Agent action queue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-gray-400">Briefing generation</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[#12121a] rounded-xl border border-gray-800 w-fit">
          {[
            { id: 'api', label: 'REST API', icon: '🔗' },
            { id: 'webhooks', label: 'Webhooks', icon: '🔔' },
            { id: 'jupiter', label: 'Jupiter Integration', icon: '☁️' },
            { id: 'actions', label: 'Agent Actions', icon: '🤖' },
            { id: 'integrations', label: 'Integrations', icon: '🔌' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? tab.id === 'jupiter' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* API Tab */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="font-semibold text-white">REST API Endpoints</h3>
                <p className="text-sm text-gray-500">All endpoints return JSON. Base URL: <code className="text-cyan-400">/api/v1</code></p>
              </div>
              <div className="divide-y divide-gray-800">
                {API_ENDPOINTS.map((endpoint, i) => (
                  <div key={i} className="px-6 py-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`${
                          endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                          endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm text-white font-mono">{endpoint.path}</code>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-gray-500 hover:text-white"
                        onClick={() => copyToClipboard(endpoint.path)}
                      >
                        {copiedEndpoint === endpoint.path ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{endpoint.description}</p>
                    {endpoint.example && (
                      <code className="text-xs text-cyan-400 mt-1 block">{endpoint.example}</code>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Example Request */}
            <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="font-semibold text-white">Example Request</h3>
              </div>
              <div className="p-6">
                <pre className="bg-[#0a0a0f] rounded-lg p-4 overflow-x-auto text-sm">
                  <code className="text-cyan-400">{`curl -X GET "https://usbuildclock.vercel.app/api/v1/opportunities?pillar=power&min_value=10000000" \\
  -H "Accept: application/json"

# Response
{
  "success": true,
  "data": [
    {
      "id": "palisades-restart",
      "title": "Palisades Nuclear Restart",
      "genesisPillar": "power",
      "estimatedValue": 25000000,
      ...
    }
  ],
  "meta": {
    "total": 12,
    "filtered": 4,
    "timestamp": "2026-02-22T10:00:00Z"
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="font-semibold text-white">Available Events</h3>
                  <p className="text-sm text-gray-500">Subscribe to receive POST requests when events occur</p>
                </div>
                <div className="divide-y divide-gray-800">
                  {WEBHOOK_EVENTS.map((event, i) => (
                    <div key={i} className="px-6 py-3 flex items-center justify-between">
                      <code className="text-sm text-cyan-400">{event.event}</code>
                      <span className="text-xs text-gray-500">{event.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="font-semibold text-white">Create Subscription</h3>
                </div>
                <div className="p-6">
                  <pre className="bg-[#0a0a0f] rounded-lg p-4 overflow-x-auto text-sm">
                    <code className="text-cyan-400">{`POST /api/webhooks
{
  "name": "Slack Deals Channel",
  "callback_url": "https://hooks.slack.com/...",
  "events": [
    "opportunity.deadline_approaching",
    "agent.alert_raised"
  ],
  "filters": {
    "min_value": 5000000,
    "sectors": ["power", "ai-compute"]
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Webhook Payload Example */}
            <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="font-semibold text-white">Example Webhook Payload</h3>
              </div>
              <div className="p-6">
                <pre className="bg-[#0a0a0f] rounded-lg p-4 overflow-x-auto text-sm">
                  <code className="text-cyan-400">{`// POST to your callback_url
{
  "event": "opportunity.deadline_approaching",
  "timestamp": "2026-02-22T10:00:00Z",
  "data": {
    "opportunity": {
      "id": "palisades-restart",
      "title": "Palisades Nuclear Restart",
      "deadline": "2026-02-24",
      "days_remaining": 2,
      "estimated_value": 25000000
    },
    "action_required": "Submit capability statement",
    "urgency": "high"
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Jupiter Integration Tab */}
        {activeTab === 'jupiter' && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Jupiter Integration via Power Automate</h3>
              <p className="text-gray-300 mb-4">
                Genesis connects to Jupiter (Salesforce) through Power Automate. When you &quot;Push to Jupiter&quot; from the Radar,
                Genesis fires a webhook that Power Automate receives and uses to create the opportunity in Salesforce.
              </p>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <span className="text-2xl">📊</span>
                  <div className="text-xs text-gray-400 mt-1">Genesis Radar</div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <span className="text-2xl">→</span>
                  <div className="text-xs text-gray-400 mt-1">Webhook</div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <span className="text-2xl">⚡</span>
                  <div className="text-xs text-gray-400 mt-1">Power Automate</div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <span className="text-2xl">☁️</span>
                  <div className="text-xs text-gray-400 mt-1">Jupiter (SFDC)</div>
                </div>
              </div>
            </div>

            {/* Setup Steps */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="font-semibold text-white">Step 1: Create Power Automate Flow</h3>
                </div>
                <div className="p-6 space-y-4 text-sm text-gray-300">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Go to <span className="text-cyan-400">make.powerautomate.com</span></li>
                    <li>Create new &quot;Automated cloud flow&quot;</li>
                    <li>Choose trigger: <span className="text-cyan-400">&quot;When an HTTP request is received&quot;</span></li>
                    <li>Copy the generated HTTP POST URL</li>
                    <li>Add action: <span className="text-cyan-400">&quot;Salesforce - Create record&quot;</span></li>
                    <li>Map fields from webhook payload to Salesforce</li>
                    <li>Add action: <span className="text-cyan-400">&quot;HTTP - POST&quot;</span> to confirm sync</li>
                  </ol>
                </div>
              </div>

              <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="font-semibold text-white">Step 2: Register Webhook in Genesis</h3>
                </div>
                <div className="p-6">
                  <pre className="bg-[#0a0a0f] rounded-lg p-4 overflow-x-auto text-sm">
                    <code className="text-cyan-400">{`POST /api/webhooks/outbound
{
  "event": "opportunity.push_to_jupiter",
  "callback_url": "https://prod-XX.westus.logic.azure.com/...",
  "enabled": true
}`}</code>
                  </pre>
                  <p className="text-xs text-gray-500 mt-3">
                    The callback_url is from Step 1. Genesis will POST to this URL when users push to Jupiter.
                  </p>
                </div>
              </div>
            </div>

            {/* Webhook Payload */}
            <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="font-semibold text-white">Push to Jupiter Payload</h3>
                <p className="text-xs text-gray-500">This is what Power Automate receives from Genesis</p>
              </div>
              <div className="p-6">
                <pre className="bg-[#0a0a0f] rounded-lg p-4 overflow-x-auto text-sm">
                  <code className="text-cyan-400">{`{
  "event": "opportunity.push_to_jupiter",
  "timestamp": "2026-02-22T10:00:00Z",
  "data": {
    "opportunity": {
      "id": "palisades-restart",
      "title": "Palisades Nuclear Restart",
      "entity": "Holtec International",
      "amount": 25000000,
      "close_date": "2026-03-15",
      "stage": "Qualification",
      "description": "NRC 10 CFR 73.54 compliance...",
      "pursuit_lead": "Tom Bradley",
      "win_probability": 50,
      "genesis_url": "https://usbuildclock.vercel.app/radar?id=palisades-restart",
      "genesis_pillar": "power",
      "ot_systems": ["scada", "dcs"],
      "regulatory_drivers": ["nrc-cyber"]
    }
  }
}`}</code>
                </pre>
              </div>
            </div>

            {/* Field Mapping */}
            <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="font-semibold text-white">Salesforce Field Mapping</h3>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-800">
                      <th className="pb-2">Genesis Field</th>
                      <th className="pb-2">Salesforce Field</th>
                      <th className="pb-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2"><code className="text-cyan-400">title</code></td>
                      <td className="py-2">Name</td>
                      <td className="py-2 text-gray-500">Opportunity Name</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2"><code className="text-cyan-400">entity</code></td>
                      <td className="py-2">Account</td>
                      <td className="py-2 text-gray-500">Create or link existing</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2"><code className="text-cyan-400">amount</code></td>
                      <td className="py-2">Amount</td>
                      <td className="py-2 text-gray-500">Deal value</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2"><code className="text-cyan-400">close_date</code></td>
                      <td className="py-2">CloseDate</td>
                      <td className="py-2 text-gray-500">Target close</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2"><code className="text-cyan-400">stage</code></td>
                      <td className="py-2">StageName</td>
                      <td className="py-2 text-gray-500">Always &quot;Qualification&quot;</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="py-2"><code className="text-cyan-400">win_probability</code></td>
                      <td className="py-2">Probability</td>
                      <td className="py-2 text-gray-500">10, 25, 50, 75, or 90</td>
                    </tr>
                    <tr>
                      <td className="py-2"><code className="text-cyan-400">genesis_url</code></td>
                      <td className="py-2">Genesis_Link__c</td>
                      <td className="py-2 text-gray-500">Custom field for traceability</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confirmation Callback */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="font-semibold text-white">Step 3: Confirm Sync</h3>
                  <p className="text-xs text-gray-500">Power Automate calls back to Genesis</p>
                </div>
                <div className="p-6">
                  <pre className="bg-[#0a0a0f] rounded-lg p-4 overflow-x-auto text-sm">
                    <code className="text-cyan-400">{`POST /api/webhooks/jupiter-confirm
{
  "genesis_id": "palisades-restart",
  "salesforce_id": "006xxxxxxxxxxxx",
  "status": "success"
}`}</code>
                  </pre>
                  <p className="text-xs text-gray-500 mt-3">
                    Genesis stores the Salesforce ID and shows &quot;Synced to Jupiter&quot; badge.
                  </p>
                </div>
              </div>

              <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="font-semibold text-white">Bidirectional Sync (Optional)</h3>
                  <p className="text-xs text-gray-500">Jupiter changes flow back to Genesis</p>
                </div>
                <div className="p-6">
                  <pre className="bg-[#0a0a0f] rounded-lg p-4 overflow-x-auto text-sm">
                    <code className="text-cyan-400">{`POST /api/webhooks/jupiter-inbound
{
  "genesis_id": "palisades-restart",
  "salesforce_id": "006xxxxxxxxxxxx",
  "stage": "Proposal",
  "amount": 28000000
}`}</code>
                  </pre>
                  <p className="text-xs text-gray-500 mt-3">
                    Create a flow triggered by Salesforce record changes to keep Genesis in sync.
                  </p>
                </div>
              </div>
            </div>

            {/* Why Power Automate */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4">Why Power Automate Instead of Direct Integration?</h3>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="text-orange-400 mb-2">IT Familiarity</h4>
                  <p className="text-gray-400">Deloitte IT already knows Power Automate. No new tools to learn.</p>
                </div>
                <div>
                  <h4 className="text-orange-400 mb-2">Compliance Built-in</h4>
                  <p className="text-gray-400">Power Automate logs all runs. Audit trail is automatic.</p>
                </div>
                <div>
                  <h4 className="text-orange-400 mb-2">Genesis Stays Lightweight</h4>
                  <p className="text-gray-400">No OAuth tokens or Salesforce SDK to maintain.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Agentic Capabilities</h3>
              <p className="text-gray-300">
                Genesis agents don&apos;t just monitor - they can take action. Queue up tasks like drafting emails,
                generating briefings, or sending notifications. Actions execute asynchronously and report results.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {ACTION_TYPES.map((action, i) => (
                <div key={i} className="bg-[#12121a] rounded-xl border border-gray-800 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{action.icon}</span>
                    <code className="text-sm text-cyan-400">{action.type}</code>
                  </div>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </div>
              ))}
            </div>

            {/* Queue Action Example */}
            <div className="bg-[#12121a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="font-semibold text-white">Queue an Action</h3>
              </div>
              <div className="p-6">
                <pre className="bg-[#0a0a0f] rounded-lg p-4 overflow-x-auto text-sm">
                  <code className="text-cyan-400">{`POST /api/v1/actions
{
  "type": "draft_email",
  "priority": "high",
  "target": {
    "type": "opportunity",
    "id": "palisades-restart",
    "name": "Palisades Nuclear Restart"
  },
  "params": {
    "contact": "Jennifer Walsh",
    "company": "Holtec International",
    "template": "initial_outreach",
    "talking_points": [
      "NRC 10 CFR 73.54 compliance expertise",
      "OT + nuclear regulatory experience"
    ]
  },
  "created_by": "agent_power"
}

// Response
{
  "success": true,
  "data": {
    "id": "action_1708646400000",
    "status": "pending",
    ...
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-4 gap-4">
            {INTEGRATIONS.map(integration => (
              <div
                key={integration.id}
                className={`bg-[#12121a] rounded-xl border p-5 ${
                  integration.status === 'connected' ? 'border-green-500/50' :
                  integration.status === 'available' ? 'border-gray-800 hover:border-gray-600' :
                  'border-gray-800 opacity-60'
                } transition-colors`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{integration.icon}</span>
                  <Badge className={`${
                    integration.status === 'connected' ? 'bg-green-500/20 text-green-400' :
                    integration.status === 'available' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {integration.status === 'connected' ? 'Connected' :
                     integration.status === 'available' ? 'Available' : 'Coming Soon'}
                  </Badge>
                </div>
                <h3 className="font-semibold text-white mb-1">{integration.name}</h3>
                <p className="text-sm text-gray-400">{integration.description}</p>
                {integration.status === 'available' && (
                  <Button size="sm" className="w-full mt-4" variant="outline">
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Architecture Note */}
        <div className="mt-8 bg-[#12121a] rounded-xl border border-gray-800 p-6">
          <h3 className="font-semibold text-white mb-4">Architecture: How This Fits Into Deloitte Systems</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-cyan-400 mb-2">Data Flows In</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• SAM.gov opportunities</li>
                <li>• Grants.gov funding</li>
                <li>• SEC filings</li>
                <li>• News feeds</li>
                <li>• Your CRM data (via API)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-400 mb-2">Data Flows Out</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Salesforce opportunity sync</li>
                <li>• Slack/Teams notifications</li>
                <li>• Power BI dashboards</li>
                <li>• Briefing documents</li>
                <li>• Email drafts</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-purple-400 mb-2">Agents Act</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Monitor sectors 24/7</li>
                <li>• Raise alerts on deadlines</li>
                <li>• Draft communications</li>
                <li>• Generate briefings</li>
                <li>• Queue CRM updates</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
