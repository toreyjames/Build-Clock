# Genesis Build Clock

Opportunity tracking and market intelligence platform for Deloitte OT Cyber practice, focused on US critical infrastructure buildout (AI, power, nuclear, grid).

## Quick Reference

**Live Site:** https://usbuildclock.vercel.app
**Stack:** Next.js 16 + React 19 + Tailwind 4 + Supabase + Vercel
**Deploy:** `vercel deploy --prod`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing/redirect
│   ├── radar/page.tsx     # Live feed dashboard - real-time data sources
│   ├── insights/page.tsx  # Strategic insights - market intelligence
│   ├── goals/page.tsx     # US Strategic Goals tracker
│   ├── strategic/page.tsx # Strategic gaps analysis
│   ├── quantified/page.tsx # Roadmap/quantified gaps
│   └── api/               # API routes
│       ├── live-feed/     # Aggregates all data sources
│       ├── sam/           # SAM.gov opportunities
│       ├── goals/         # Supabase goals CRUD
│       ├── strategic-gaps/
│       ├── quantified-gaps/
│       ├── tracking/      # Opportunity tracking
│       ├── agents/        # AI agent orchestration
│       ├── signals/       # Market signals
│       └── opportunities/
├── lib/                   # Data fetching & utilities
│   ├── sam-gov.ts        # SAM.gov API client
│   ├── usaspending.ts    # USASpending.gov awards
│   ├── grants-gov.ts     # Grants.gov opportunities
│   ├── energy-gov.ts     # DOE announcements
│   ├── news.ts           # Industry news aggregation
│   ├── sec-filings.ts    # SEC 8-K filings
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # Shared TypeScript types
│   ├── us-strategic-goals.ts
│   ├── strategic-gaps.ts
│   ├── quantified-gaps.ts
│   └── agents/           # AI agent system
│       ├── types.ts
│       ├── agent-runner.ts
│       └── sector-agents.ts
└── components/ui/         # shadcn/ui components
```

## Genesis Pillars (Domain Categories)

The platform tracks opportunities across these critical infrastructure sectors:

- `power` - Grid, transmission, generation
- `ai-compute` - Data centers, AI infrastructure
- `semiconductors` - CHIPS Act, fab facilities
- `cooling` - Data center & nuclear cooling
- `supply-chain` - Critical supply chain security
- `defense` - DoD OT cyber
- `healthcare` - Medical device OT
- `energy-systems` - Broader energy infrastructure
- `manufacturing` - Industrial OT
- `research` - R&D opportunities

## Data Sources

| Source | Library | Refresh |
|--------|---------|---------|
| SAM.gov | `lib/sam-gov.ts` | API key required |
| USASpending | `lib/usaspending.ts` | Public API |
| Grants.gov | `lib/grants-gov.ts` | Public API |
| Energy.gov | `lib/energy-gov.ts` | RSS scraping |
| News | `lib/news.ts` | Web scraping |
| SEC Filings | `lib/sec-filings.ts` | EDGAR API |

## Key Pages

### /radar (Live Feed Dashboard)
- Real-time aggregation of all data sources
- Source filtering (SAM, Awards, Grants, DOE, News, SEC)
- Navigation to other views

### /insights (Strategic Insights)
- Manual market intelligence entries
- Categories: market-gap, deloitte-position, opportunity, risk
- Related pillars tagging
- Sources with links

### /goals (US Strategic Goals)
- Country-level strategic tracking
- Cloud-persisted via Supabase
- COUNTRY_FLAGS lookup for display

### /quantified (Roadmap)
- Quantified gaps and buildout progress
- Visual progress indicators

## Environment Variables

```
SAM_API_KEY=           # SAM.gov API key
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=     # For AI agents
```

## Common Tasks

### Add new insight
Edit `src/app/insights/page.tsx` - add to INSIGHTS array:
```typescript
{
  id: 'unique-slug',
  date: 'YYYY-MM-DD',
  title: 'Title',
  category: 'risk' | 'opportunity' | 'market-gap' | 'deloitte-position',
  summary: 'One sentence summary',
  analysis: ['Point 1', 'Point 2'],
  implications: ['Implication 1', 'Implication 2'],
  sources: [{ title: 'Source', url: 'https://...' }],
  relatedPillars: ['power', 'ai-compute'],
}
```

### Add new data source
1. Create fetcher in `src/lib/new-source.ts`
2. Import and call in `src/app/api/live-feed/route.ts`
3. Add to sources object in response

### Deploy
```bash
npm run build && vercel deploy --prod
```

## Code Patterns

- **useEffect dependencies**: Always set first item unconditionally when fetching lists (no `&& !selectedItem` checks)
- **Navigation**: Use Next.js `<Link>` component, not `<a>` tags
- **Container widths**: Standardized at `max-w-[1800px]`
- **API routes**: Use `Promise.allSettled` for parallel fetches with graceful fallbacks

## Supabase Tables

- `goals` - Strategic goals with cloud persistence
- `strategic_gaps` - Gap analysis data
- `quantified_gaps` - Quantified buildout gaps

## Recent Changes

- Fixed useEffect dependency bugs in goals and strategic pages
- Removed duplicate news-feed.ts (use news.ts)
- Standardized navigation labels ("Roadmap" not "Backend")
- Added Stargate project stall insight (2026-02-22)
