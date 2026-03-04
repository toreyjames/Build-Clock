import { fetchSECFilings } from '@/lib/sec-filings';

export interface CommercialSignal {
  id: string;
  title: string;
  entity: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  relevance: 'high' | 'medium' | 'low';
  note: string;
}

const UTILITY_IR_FEEDS = [
  { entity: 'Duke Energy', source: 'Duke IR', url: 'https://news.duke-energy.com/rss.xml' },
  { entity: 'Dominion Energy', source: 'Dominion IR', url: 'https://investors.dominionenergy.com/rss/news-releases.xml' },
  { entity: 'NextEra Energy', source: 'NextEra IR', url: 'https://www.investor.nexteraenergy.com/rss/news-releases.xml' },
  { entity: 'Exelon', source: 'Exelon IR', url: 'https://investors.exeloncorp.com/rss/news-releases.xml' },
];

const STATE_PROC_FEEDS = [
  { entity: 'California eProcure', source: 'CA Procurement', url: 'https://caleprocure.ca.gov/pages/index.aspx' },
  { entity: 'New York OGS Procurement', source: 'NY Procurement', url: 'https://ogs.ny.gov/procurement' },
  { entity: 'Texas SmartBuy', source: 'TX Procurement', url: 'https://www.txsmartbuy.gov/esbddetails/search/index' },
];

function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function parseRssItems(xml: string): Array<{ title: string; link: string; date: string; description: string }> {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return items.map((item) => {
    const get = (tag: string) => {
      const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return m ? stripTags(m[1]) : '';
    };
    return {
      title: get('title'),
      link: get('link'),
      date: get('pubDate'),
      description: get('description'),
    };
  });
}

function scoreRelevance(text: string): 'high' | 'medium' | 'low' {
  const t = text.toLowerCase();
  if (
    t.includes('cybersecurity') ||
    t.includes('ot security') ||
    t.includes('scada') ||
    t.includes('grid modernization') ||
    t.includes('critical infrastructure')
  ) return 'high';
  if (t.includes('digital') || t.includes('modernization') || t.includes('control system')) return 'medium';
  return 'low';
}

export async function fetchEarningsSignals(limit = 10): Promise<CommercialSignal[]> {
  const filings = await fetchSECFilings(Math.max(limit, 12));
  return filings
    .filter((f) => ['8-K', '10-Q', '10-K'].includes(f.form))
    .slice(0, limit)
    .map((f) => ({
      id: `earn-${f.id}`,
      title: `${f.ticker} ${f.form} filing signal`,
      entity: f.company,
      source: 'SEC EDGAR',
      sourceUrl: f.url,
      publishedAt: f.filedDate,
      relevance: f.relevance,
      note: `Commercial signal from ${f.form} filing activity`,
    }));
}

export async function fetchUtilityIRSignals(limit = 12): Promise<CommercialSignal[]> {
  const out: CommercialSignal[] = [];
  for (const feed of UTILITY_IR_FEEDS) {
    try {
      const response = await fetch(feed.url, { next: { revalidate: 1800 } });
      if (!response.ok) continue;
      const xml = await response.text();
      const items = parseRssItems(xml).slice(0, 4);
      items.forEach((item, idx) => {
        const relevance = scoreRelevance(`${item.title} ${item.description}`);
        out.push({
          id: `util-${feed.entity}-${idx}-${item.link || item.title}`,
          title: item.title || `${feed.entity} press update`,
          entity: feed.entity,
          source: feed.source,
          sourceUrl: item.link || feed.url,
          publishedAt: item.date || new Date().toISOString(),
          relevance,
          note: item.description || 'Investor relations pressroom signal',
        });
      });
    } catch {
      // Skip unavailable feed
    }
  }
  return out.slice(0, limit);
}

export async function fetchStateProcurementSignals(limit = 12): Promise<CommercialSignal[]> {
  // Many state portals do not expose stable APIs/RSS; keep lean signals by checking portal availability.
  const out: CommercialSignal[] = [];
  for (const feed of STATE_PROC_FEEDS) {
    try {
      const response = await fetch(feed.url, { next: { revalidate: 3600 } });
      if (!response.ok) continue;
      const html = await response.text();
      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
      out.push({
        id: `state-${feed.entity}`,
        title: titleMatch ? stripTags(titleMatch[1]) : `${feed.entity} procurement portal`,
        entity: feed.entity,
        source: feed.source,
        sourceUrl: feed.url,
        publishedAt: new Date().toISOString(),
        relevance: 'medium',
        note: 'Portal heartbeat signal for non-federal procurement monitoring',
      });
    } catch {
      // Skip unavailable portal
    }
  }
  return out.slice(0, limit);
}

