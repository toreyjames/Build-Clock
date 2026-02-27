# OT Pipeline Tracker

Single-page OT opportunity pipeline tracker for commercial OT cyber practice. Scans for OT-relevant opportunities, qualifies with OT connection explanation, tracks pipeline stages, and pushes to Jupiter (Salesforce).

## Quick Reference

**Live Site:** https://usbuildclock.vercel.app
**Stack:** Next.js 16 + React 19 + Tailwind 4 + Supabase + Vercel
**Deploy:** `vercel deploy --prod`

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Redirects to /radar
│   ├── radar/page.tsx     # OT Pipeline Tracker (main app)
│   └── api/
│       ├── live-feed/     # News & data aggregation
│       ├── sam/           # SAM.gov opportunities
│       ├── tracking/      # Opportunity tracking (Supabase)
│       ├── opportunities/ # Curated opportunity data
│       ├── v1/opportunities/ # Versioned API
│       └── webhooks/      # Jupiter/Salesforce integration
│           ├── push-to-jupiter/  # Push opportunity to CRM
│           ├── jupiter-inbound/  # Receive updates from CRM
│           └── jupiter-confirm/  # Confirm sync
├── lib/
│   ├── types.ts           # Core types (Opportunity, GenesisPillar, etc.)
│   ├── opportunities-data.ts # 50+ curated opportunities
│   ├── webhooks.ts        # Jupiter/Salesforce webhook system
│   ├── sam-gov.ts         # SAM.gov API client
│   ├── news.ts            # Google News RSS aggregation
│   ├── supabase.ts        # Supabase client
│   └── [data sources]     # usaspending, grants-gov, energy-gov, sec-filings
└── components/ui/         # shadcn/ui components
```

## Features

### Pipeline Tracking
- **Kanban View**: Visual pipeline board with 5 stages (On Radar → Contacted → Meeting → Proposal → Closed)
- **Table View**: Spreadsheet-style list with inline status updates
- **Status Workflow**: Track opportunities through sales pipeline

### OT Qualification
- **"Why OT?" Panel**: Clear explanation of OT connection for each opportunity
  - OT Systems: SCADA, DCS, PLC, HMI, Historian, EMS, BMS, MES, SIS
  - Regulations: NERC CIP, NRC Cyber, CFATS, TSA Pipeline, FedRAMP, CMMC
  - Scope: Detailed OT security needs description
- **OT Relevance Score**: Visual indicator (Critical/High/Medium/Low)

### Filtering
- **Market**: Commercial (utilities, enterprise) vs Federal (DoD, DOE)
- **Sector**: Power, AI Compute, Semiconductors, Defense, Energy Systems, Manufacturing
- **OT Level**: Filter by OT relevance (All, High+, Critical only)
- **Search**: Full-text search across opportunities

### Jupiter Integration
- **Push to Jupiter**: Create Salesforce opportunity via webhook
- **Sync Status**: Track which opportunities are synced
- **Activity Log**: Record all status changes and pushes

### PDF Export
- **Executive Brief**: 1-page PDF summary for each opportunity
  - Header with client info, value, deadline
  - "Why OT?" section with systems, regulations, scope
  - Deloitte positioning and services
  - Competitive landscape
  - Notes (if any)
- **Download Button**: In detail panel for any opportunity

### News Feed
- **Latest OT News**: Bottom section shows recent OT-relevant news
- **Google News RSS**: Aggregates news from multiple OT search queries

## Opportunity Data Structure

```typescript
interface Opportunity {
  id: string;
  title: string;
  entity: string;
  entityType: 'federal' | 'utility' | 'enterprise' | 'state-local';
  genesisPillar: GenesisPillar;
  estimatedValue: number | null;

  // OT Specifics
  otRelevance: 'critical' | 'high' | 'medium' | 'low';
  otSystems: OTSystem[];
  otScope: string;
  regulatoryDrivers: RegulatoryDriver[];

  // Sources & Links
  sources: { title: string; url: string; date: string }[];

  // Deloitte Services
  deloitteServices: DeloitteService[];
  deloitteAngle: string;
}
```

## Environment Variables

```
SAM_API_KEY=                      # SAM.gov API key
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon key
JUPITER_WEBHOOK_URL=              # Power Automate webhook URL (optional)
```

## Supabase Tables

```sql
-- Opportunity tracking (status, notes, activity)
CREATE TABLE opportunity_tracking (
  opportunity_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'on-radar',
  notes TEXT DEFAULT '',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activity JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Common Tasks

### Add new curated opportunity
Edit `src/lib/opportunities-data.ts`:
```typescript
{
  id: 'unique-slug',
  title: 'Opportunity Name',
  entity: 'Client Entity',
  entityType: 'utility',
  genesisPillar: 'power',
  estimatedValue: 50_000_000,
  otRelevance: 'high',
  otSystems: ['scada', 'dcs'],
  otScope: 'Grid modernization requiring OT security...',
  regulatoryDrivers: ['nerc-cip'],
  // ... rest of fields
}
```

### Deploy
```bash
npm run build && vercel deploy --prod
```

## Code Patterns

- **Single Page App**: Everything on /radar, home redirects there
- **Container width**: `max-w-[1800px]`
- **Dark theme**: `bg-[#0a0a0f]` base, `bg-[#12121a]` cards
- **Status colors**: Gray (radar) → Yellow (contacted) → Blue (meeting) → Purple (proposal) → Green (closed)

## Recent Changes (2026-02-23)

- Simplified from multi-page app to single OT Pipeline Tracker
- Removed: /strategy, /integrations, /insights, /goals, /strategic, /quantified pages
- Removed: Agent system (sector agents, agent runner)
- Added: "Why OT?" panel with clear OT connection explanation
- Added: Client size indicator (Fortune 500, Enterprise, Large, Mid-Market)
- Added: Commercial/Federal filter (partner is commercial-focused)
- Added: Latest News section at bottom
- Simplified: Kanban + Table toggle (removed Timeline and Live Feed views)
- Kept: Jupiter push, pipeline tracking, source links, OT relevance scoring
- Added: PDF export (Executive Brief) using jspdf
