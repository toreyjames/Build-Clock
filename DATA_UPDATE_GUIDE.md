# Data Update Guide

## Overview
The site now uses a **single source of truth** for opportunities data. All opportunities are stored in `lib/data/opportunities.ts`, and both the main page and opportunities page automatically calculate their totals from this file.

## How It Works

1. **Shared Data File**: `lib/data/opportunities.ts`
   - Contains the `Opportunity` interface
   - Contains the `opportunities` array (all 63 opportunities)
   - Contains `calculateSectorPipeline()` function that auto-calculates sector totals

2. **Main Page** (`app/page.tsx`):
   - Imports `opportunities` and `calculateSectorPipeline` from shared file
   - Sector pipeline totals are **automatically calculated** - no manual updates needed

3. **Opportunities Page** (`app/opportunities/page.tsx`):
   - Imports `opportunities` from shared file
   - All filtering, stats, and displays use this shared data

## To Update Opportunities

1. **Edit** `lib/data/opportunities.ts`
2. **Add/update/remove** opportunities in the `opportunities` array
3. **Save** - totals on main page will automatically update

## Current Status

⚠️ **ACTION NEEDED**: The shared file (`lib/data/opportunities.ts`) currently has a placeholder. You need to:

1. Copy the full opportunities array from the original `app/opportunities/page.tsx` (if you have a backup)
2. OR manually add opportunities to `lib/data/opportunities.ts`

The structure is ready - just need to populate the data.

## Automatic Updates (Future)

For truly automatic updates, you could:
- Set up a script to scrape/parse opportunity announcements
- Use an API to pull from a CRM or tracking system
- Create a simple admin interface to add/edit opportunities

For now, manual updates to `lib/data/opportunities.ts` will automatically update both pages.





