import { NextResponse } from 'next/server';
import { fetchSAMOpportunities } from '@/lib/sam-gov';
import { fetchRecentAwards } from '@/lib/usaspending';
import { fetchGrants } from '@/lib/grants-gov';
import { fetchDOEAnnouncements } from '@/lib/energy-gov';
import { fetchNews } from '@/lib/news';
import { fetchSECFilings } from '@/lib/sec-filings';
import { fetchEarningsSignals, fetchStateProcurementSignals, fetchUtilityIRSignals } from '@/lib/commercial-signals';

export const revalidate = 1800; // Revalidate every 30 minutes

// Sample data for when APIs are unavailable
const SAMPLE_SAM = [
  { id: 'sam-1', title: 'SCADA Cybersecurity Assessment Services', type: 'solicitation', date: '2026-02-18', agency: 'DOE', deadline: '2026-03-15', value: '$2.5M' },
  { id: 'sam-2', title: 'ICS Security Monitoring for Federal Facilities', type: 'presolicitation', date: '2026-02-15', agency: 'DHS', deadline: '2026-03-20', value: '$5M' },
  { id: 'sam-3', title: 'Nuclear Plant Cyber Risk Assessment', type: 'solicitation', date: '2026-02-12', agency: 'NRC', deadline: '2026-03-10', value: '$1.8M' },
];

const SAMPLE_AWARDS = [
  { id: 'award-1', title: 'Grid Modernization Cybersecurity', recipient: 'Booz Allen Hamilton', amount: '$12.3M', date: '2026-02-19', agency: 'DOE' },
  { id: 'award-2', title: 'Critical Infrastructure Protection', recipient: 'Accenture Federal', amount: '$8.7M', date: '2026-02-16', agency: 'CISA' },
  { id: 'award-3', title: 'OT Security Operations Center', recipient: 'Leidos', amount: '$15.2M', date: '2026-02-14', agency: 'DoD' },
];

const SAMPLE_GRANTS = [
  { id: 'grant-1', title: 'State Energy Program - Cybersecurity', agency: 'DOE', deadline: '2026-04-01', amount: '$50M' },
  { id: 'grant-2', title: 'Rural Water System Security Upgrades', agency: 'EPA', deadline: '2026-03-28', amount: '$25M' },
  { id: 'grant-3', title: 'Grid Resilience Formula Grants', agency: 'DOE', deadline: '2026-04-15', amount: '$100M' },
];

const SAMPLE_EARNINGS = [
  { id: 'earn-1', title: 'Utility Q4 filing references cybersecurity modernization spend', entity: 'Large Utility', source: 'SEC EDGAR', sourceUrl: 'https://www.sec.gov', publishedAt: '2026-02-20', relevance: 'high', note: 'Sample fallback signal' },
  { id: 'earn-2', title: 'Industrial manufacturer 10-Q notes control system uplift', entity: 'Industrial Co', source: 'SEC EDGAR', sourceUrl: 'https://www.sec.gov', publishedAt: '2026-02-18', relevance: 'medium', note: 'Sample fallback signal' },
];

const SAMPLE_UTILITY_IR = [
  { id: 'util-1', title: 'Grid modernization investment update', entity: 'Utility IR', source: 'Utility IR Feed', sourceUrl: 'https://example.com', publishedAt: '2026-02-22', relevance: 'medium', note: 'Sample fallback signal' },
  { id: 'util-2', title: 'Resilience and substation digitalization program', entity: 'Utility IR', source: 'Utility IR Feed', sourceUrl: 'https://example.com', publishedAt: '2026-02-16', relevance: 'high', note: 'Sample fallback signal' },
];

const SAMPLE_STATE_PROC = [
  { id: 'state-1', title: 'State procurement portal heartbeat: cybersecurity services category active', entity: 'State Portal', source: 'State Procurement', sourceUrl: 'https://example.com', publishedAt: '2026-02-21', relevance: 'medium', note: 'Sample fallback signal' },
  { id: 'state-2', title: 'State procurement portal heartbeat: critical infrastructure technology postings', entity: 'State Portal', source: 'State Procurement', sourceUrl: 'https://example.com', publishedAt: '2026-02-19', relevance: 'medium', note: 'Sample fallback signal' },
];

export async function GET() {
  const now = new Date();

  // Fetch all sources in parallel
  const [samResult, awardsResult, grantsResult, doeResult, newsResult, secResult, earningsResult, utilityIrResult, stateProcResult] = await Promise.allSettled([
    // SAM.gov
    (async () => {
      const samApiKey = process.env.SAM_API_KEY;
      if (!samApiKey) throw new Error('API key not configured');
      return await fetchSAMOpportunities(samApiKey, 20);
    })(),
    // USASpending
    fetchRecentAwards(12),
    // Grants.gov
    fetchGrants(10),
    // DOE
    fetchDOEAnnouncements(8),
    // News
    fetchNews(15),
    // SEC
    fetchSECFilings(12),
    // Earnings/transcript-style commercial signals
    fetchEarningsSignals(10),
    // Utility investor relations feeds
    fetchUtilityIRSignals(10),
    // State procurement portal signals
    fetchStateProcurementSignals(10),
  ]);

  // Use sample data as fallback when APIs fail
  const samData = samResult.status === 'fulfilled' && samResult.value.length > 0 ? samResult.value : SAMPLE_SAM;
  const awardsData = awardsResult.status === 'fulfilled' && awardsResult.value.length > 0 ? awardsResult.value : SAMPLE_AWARDS;
  const grantsData = grantsResult.status === 'fulfilled' && grantsResult.value.length > 0 ? grantsResult.value : SAMPLE_GRANTS;
  const samFallback = !(samResult.status === 'fulfilled' && samResult.value.length > 0);
  const awardsFallback = !(awardsResult.status === 'fulfilled' && awardsResult.value.length > 0);
  const grantsFallback = !(grantsResult.status === 'fulfilled' && grantsResult.value.length > 0);
  const earningsData = earningsResult.status === 'fulfilled' && earningsResult.value.length > 0 ? earningsResult.value : SAMPLE_EARNINGS;
  const utilityIrData = utilityIrResult.status === 'fulfilled' && utilityIrResult.value.length > 0 ? utilityIrResult.value : SAMPLE_UTILITY_IR;
  const stateProcData = stateProcResult.status === 'fulfilled' && stateProcResult.value.length > 0 ? stateProcResult.value : SAMPLE_STATE_PROC;
  const earningsFallback = !(earningsResult.status === 'fulfilled' && earningsResult.value.length > 0);
  const utilityIrFallback = !(utilityIrResult.status === 'fulfilled' && utilityIrResult.value.length > 0);
  const stateProcFallback = !(stateProcResult.status === 'fulfilled' && stateProcResult.value.length > 0);

  return NextResponse.json({
    fetchedAt: now.toISOString(),
    sources: {
      sam: {
        name: 'SAM.gov',
        description: 'Federal contract opportunities',
        icon: '📋',
        count: samData.length,
        status: samFallback ? 'fallback' : 'ok',
        fallback: samFallback,
        error: samResult.status === 'rejected' ? samResult.reason?.message : undefined,
        data: samData,
      },
      awards: {
        name: 'USASpending.gov',
        description: 'Recent federal contract awards',
        icon: '💰',
        count: awardsData.length,
        status: awardsFallback ? 'fallback' : 'ok',
        fallback: awardsFallback,
        error: awardsResult.status === 'rejected' ? awardsResult.reason?.message : undefined,
        data: awardsData,
      },
      grants: {
        name: 'Grants.gov',
        description: 'Federal grant opportunities',
        icon: '🎓',
        count: grantsData.length,
        status: grantsFallback ? 'fallback' : 'ok',
        fallback: grantsFallback,
        error: grantsResult.status === 'rejected' ? grantsResult.reason?.message : undefined,
        data: grantsData,
      },
      doe: {
        name: 'Energy.gov',
        description: 'DOE announcements & funding',
        icon: '⚡',
        count: doeResult.status === 'fulfilled' ? doeResult.value.length : 0,
        status: doeResult.status === 'fulfilled' ? 'ok' : 'error',
        error: doeResult.status === 'rejected' ? doeResult.reason?.message : undefined,
        data: doeResult.status === 'fulfilled' ? doeResult.value : [],
      },
      news: {
        name: 'News Feed',
        description: 'Industry news & announcements',
        icon: '📰',
        count: newsResult.status === 'fulfilled' ? newsResult.value.length : 0,
        status: newsResult.status === 'fulfilled' ? 'ok' : 'error',
        error: newsResult.status === 'rejected' ? newsResult.reason?.message : undefined,
        data: newsResult.status === 'fulfilled' ? newsResult.value : [],
      },
      sec: {
        name: 'SEC Filings',
        description: 'Company filings & disclosures',
        icon: '📊',
        count: secResult.status === 'fulfilled' ? secResult.value.length : 0,
        status: secResult.status === 'fulfilled' ? 'ok' : 'error',
        error: secResult.status === 'rejected' ? secResult.reason?.message : undefined,
        data: secResult.status === 'fulfilled' ? secResult.value : [],
      },
      earnings: {
        name: 'Earnings Signals',
        description: 'Commercial filing-based earnings/transcript proxies',
        icon: '🧾',
        count: earningsData.length,
        status: earningsFallback ? 'fallback' : 'ok',
        fallback: earningsFallback,
        error: earningsResult.status === 'rejected' ? earningsResult.reason?.message : undefined,
        data: earningsData,
      },
      utilityIr: {
        name: 'Utility IR',
        description: 'Utility investor relations pressroom feeds',
        icon: '🏢',
        count: utilityIrData.length,
        status: utilityIrFallback ? 'fallback' : 'ok',
        fallback: utilityIrFallback,
        error: utilityIrResult.status === 'rejected' ? utilityIrResult.reason?.message : undefined,
        data: utilityIrData,
      },
      stateProc: {
        name: 'State Procurement',
        description: 'State/local non-federal procurement portal signals',
        icon: '🏛️',
        count: stateProcData.length,
        status: stateProcFallback ? 'fallback' : 'ok',
        fallback: stateProcFallback,
        error: stateProcResult.status === 'rejected' ? stateProcResult.reason?.message : undefined,
        data: stateProcData,
      },
    },
    summary: {
      totalItems:
        samData.length +
        awardsData.length +
        grantsData.length +
        (doeResult.status === 'fulfilled' ? doeResult.value.length : 0) +
        (newsResult.status === 'fulfilled' ? newsResult.value.length : 0) +
        (secResult.status === 'fulfilled' ? secResult.value.length : 0) +
        earningsData.length +
        utilityIrData.length +
        stateProcData.length,
      sourcesActive: 9,
      lastUpdated: now.toISOString(),
    },
  });
}
