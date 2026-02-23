// SEC EDGAR API Integration
// Tracks company filings for major Genesis-relevant companies

const SEC_API_BASE = 'https://data.sec.gov';

// Companies to track (CIK numbers)
const TRACKED_COMPANIES: Record<string, { name: string; cik: string; pillar: string }> = {
  'MSFT': { name: 'Microsoft', cik: '0000789019', pillar: 'ai-compute' },
  'GOOGL': { name: 'Alphabet/Google', cik: '0001652044', pillar: 'ai-compute' },
  'AMZN': { name: 'Amazon', cik: '0001018724', pillar: 'ai-compute' },
  'NVDA': { name: 'NVIDIA', cik: '0001045810', pillar: 'semiconductors' },
  'INTC': { name: 'Intel', cik: '0000050863', pillar: 'semiconductors' },
  'TSM': { name: 'TSMC', cik: '0001046179', pillar: 'semiconductors' },
  'CEG': { name: 'Constellation Energy', cik: '0001868275', pillar: 'power' },
  'VST': { name: 'Vistra', cik: '0001692819', pillar: 'power' },
  'LMT': { name: 'Lockheed Martin', cik: '0000936468', pillar: 'defense' },
  'RTX': { name: 'RTX Corp', cik: '0000101829', pillar: 'defense' },
  'NOC': { name: 'Northrop Grumman', cik: '0001133421', pillar: 'defense' },
  'PFE': { name: 'Pfizer', cik: '0000078003', pillar: 'healthcare' },
  'TSLA': { name: 'Tesla', cik: '0001318605', pillar: 'manufacturing' },
  'MP': { name: 'MP Materials', cik: '0001801368', pillar: 'supply-chain' },
};

// Filing types to track
const RELEVANT_FORMS = ['8-K', '10-K', '10-Q', 'S-1', '424B'];

export interface SECFiling {
  id: string;
  company: string;
  ticker: string;
  form: string;
  filedDate: string;
  description: string;
  url: string;
  pillar: string;
  relevance: 'high' | 'medium' | 'low';
}

function detectRelevance(form: string, description: string): 'high' | 'medium' | 'low' {
  const lower = description.toLowerCase();

  // 8-K with material events are high relevance
  if (form === '8-K') {
    if (lower.includes('acquisition') || lower.includes('merger')) return 'high';
    if (lower.includes('contract') || lower.includes('agreement')) return 'high';
    if (lower.includes('investment') || lower.includes('capital')) return 'high';
    if (lower.includes('expansion') || lower.includes('facility')) return 'high';
    return 'medium';
  }

  // Annual and quarterly reports
  if (form === '10-K' || form === '10-Q') return 'medium';

  return 'low';
}

export async function fetchSECFilings(limit: number = 15): Promise<SECFiling[]> {
  const results: SECFiling[] = [];

  try {
    // Fetch recent filings for tracked companies
    for (const [ticker, company] of Object.entries(TRACKED_COMPANIES)) {
      try {
        const response = await fetch(
          `${SEC_API_BASE}/submissions/CIK${company.cik}.json`,
          {
            headers: {
              'User-Agent': 'GenesisTracker/1.0 (contact@example.com)',
              'Accept': 'application/json',
            },
            next: { revalidate: 3600 },
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        const filings = data.filings?.recent || {};

        // Get recent filings
        const forms = filings.form || [];
        const dates = filings.filingDate || [];
        const accessions = filings.accessionNumber || [];
        const descriptions = filings.primaryDocument || [];

        for (let i = 0; i < Math.min(forms.length, 5); i++) {
          const form = forms[i];
          if (!RELEVANT_FORMS.some(f => form.startsWith(f))) continue;

          const accession = accessions[i]?.replace(/-/g, '');
          const filing: SECFiling = {
            id: `sec-${ticker}-${accession}`,
            company: company.name,
            ticker,
            form,
            filedDate: dates[i],
            description: descriptions[i] || form,
            url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${company.cik}&type=${form}&dateb=&owner=include&count=10`,
            pillar: company.pillar,
            relevance: detectRelevance(form, descriptions[i] || ''),
          };

          results.push(filing);
        }
      } catch (error) {
        console.error(`Error fetching SEC data for ${ticker}:`, error);
      }

      // Small delay between companies
      await new Promise(r => setTimeout(r, 100));
    }
  } catch (error) {
    console.error('Error fetching SEC filings:', error);
  }

  // Sort by date (most recent first) and relevance
  return results
    .sort((a, b) => {
      const dateCompare = new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      if (a.relevance !== b.relevance) {
        return a.relevance === 'high' ? -1 : 1;
      }
      return 0;
    })
    .slice(0, limit);
}
