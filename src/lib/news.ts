// News monitoring via Google News RSS
// No API key required

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  genesisPillar: string;
  sectors: string[];
  signalType: 'news' | 'funding' | 'policy' | 'contract-award';
  relevance: 'critical' | 'high' | 'medium';
  actionRequired: string | null;
}

// Search queries for Genesis-adjacent news
const NEWS_SEARCHES = [
  // AI Infrastructure
  { query: 'data center construction announcement', pillar: 'ai-compute', sectors: ['data-centers'] },
  { query: 'hyperscale data center investment', pillar: 'ai-compute', sectors: ['data-centers'] },
  { query: 'AI infrastructure investment', pillar: 'ai-compute', sectors: ['data-centers'] },

  // Nuclear
  { query: 'nuclear power plant restart', pillar: 'power', sectors: ['nuclear'] },
  { query: 'small modular reactor SMR', pillar: 'power', sectors: ['nuclear'] },
  { query: 'nuclear energy data center', pillar: 'power', sectors: ['nuclear', 'data-centers'] },

  // Grid
  { query: 'grid modernization investment', pillar: 'power', sectors: ['grid'] },
  { query: 'NERC CIP compliance', pillar: 'power', sectors: ['grid'] },
  { query: 'transmission line construction', pillar: 'power', sectors: ['grid'] },

  // Semiconductors
  { query: 'semiconductor fab construction', pillar: 'semiconductors', sectors: ['semiconductors'] },
  { query: 'CHIPS Act funding award', pillar: 'semiconductors', sectors: ['semiconductors'] },
  { query: 'chip manufacturing plant', pillar: 'semiconductors', sectors: ['semiconductors'] },

  // Critical minerals / Battery
  { query: 'battery gigafactory announcement', pillar: 'supply-chain', sectors: ['ev-battery'] },
  { query: 'rare earth mining processing', pillar: 'supply-chain', sectors: ['critical-minerals'] },
  { query: 'EV battery plant investment', pillar: 'supply-chain', sectors: ['ev-battery'] },

  // OT Security specific
  { query: 'industrial control system cybersecurity', pillar: 'power', sectors: ['grid', 'manufacturing'] },
  { query: 'critical infrastructure cyberattack', pillar: 'power', sectors: ['grid', 'water'] },
  { query: 'SCADA security breach', pillar: 'power', sectors: ['grid', 'water'] },
];

// Parse Google News RSS
async function parseGoogleNewsRSS(query: string): Promise<Array<{
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description: string;
}>> {
  const encodedQuery = encodeURIComponent(query);
  const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const response = await fetch(rssUrl, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    });

    if (!response.ok) {
      console.error(`Failed to fetch news for "${query}":`, response.status);
      return [];
    }

    const xml = await response.text();
    const items: Array<{ title: string; link: string; source: string; pubDate: string; description: string }> = [];

    // Simple XML parsing for RSS items
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    for (const itemXml of itemMatches.slice(0, 5)) { // Limit to 5 per query
      const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') || '';
      const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
      const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
      const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '') || '';
      const source = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'Google News';

      if (title && link) {
        items.push({ title, link, source, pubDate, description });
      }
    }

    return items;
  } catch (error) {
    console.error(`Error fetching news for "${query}":`, error);
    return [];
  }
}

// Detect relevance based on content
function detectRelevance(title: string, description: string): 'critical' | 'high' | 'medium' {
  const text = `${title} ${description}`.toLowerCase();

  // Critical - immediate security implications or major announcements
  if (text.includes('cyberattack') || text.includes('breach') || text.includes('vulnerability')) return 'critical';
  if (text.includes('billion') && (text.includes('invest') || text.includes('announce'))) return 'critical';
  if (text.includes('chips act') && text.includes('award')) return 'critical';

  // High - significant industry news
  if (text.includes('million') && text.includes('invest')) return 'high';
  if (text.includes('construction') || text.includes('groundbreaking')) return 'high';
  if (text.includes('contract') || text.includes('award')) return 'high';

  return 'medium';
}

// Detect signal type
function detectSignalType(title: string, description: string): 'news' | 'funding' | 'policy' | 'contract-award' {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes('award') || text.includes('contract') || text.includes('wins')) return 'contract-award';
  if (text.includes('funding') || text.includes('invest') || text.includes('grant') || text.includes('loan')) return 'funding';
  if (text.includes('regulation') || text.includes('executive order') || text.includes('policy') || text.includes('legislation')) return 'policy';

  return 'news';
}

// Generate action recommendation
function generateAction(title: string, relevance: string, signalType: string): string | null {
  if (relevance === 'critical') {
    if (signalType === 'contract-award') return 'Review award details - potential teaming or follow-on opportunity';
    if (signalType === 'funding') return 'Identify funded entities - position for security work';
    return 'Monitor closely - may indicate emerging opportunity';
  }
  if (relevance === 'high') {
    return 'Track for potential opportunity development';
  }
  return null;
}

export async function fetchNews(limit: number = 20): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];
  const seenTitles = new Set<string>();

  // Fetch from multiple search queries
  const queriesToRun = NEWS_SEARCHES.slice(0, 8); // Limit to avoid rate issues

  for (const search of queriesToRun) {
    const items = await parseGoogleNewsRSS(search.query);

    for (const item of items) {
      // Dedupe by title similarity
      const titleKey = item.title.toLowerCase().substring(0, 50);
      if (seenTitles.has(titleKey)) continue;
      seenTitles.add(titleKey);

      const relevance = detectRelevance(item.title, item.description);
      const signalType = detectSignalType(item.title, item.description);

      allNews.push({
        id: `news-${Buffer.from(item.link).toString('base64').substring(0, 20)}`,
        title: item.title.length > 100 ? item.title.substring(0, 97) + '...' : item.title,
        summary: item.description.length > 200 ? item.description.substring(0, 197) + '...' : item.description,
        source: item.source,
        sourceUrl: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        genesisPillar: search.pillar,
        sectors: search.sectors,
        signalType,
        relevance,
        actionRequired: generateAction(item.title, relevance, signalType),
      });
    }

    if (allNews.length >= limit) break;

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Sort by date, most recent first
  return allNews
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}
