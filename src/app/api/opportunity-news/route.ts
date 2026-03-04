import { NextResponse } from 'next/server';

export const revalidate = 1800;

interface OpportunityNewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  snippet: string;
}

function decodeXml(input: string): string {
  return input
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(input: string): string {
  return decodeXml(input).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function parseRssItems(xml: string): OpportunityNewsItem[] {
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  return itemMatches.map((item) => {
    const title = stripTags(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
    const url = stripTags(item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '');
    const publishedAt = stripTags(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '');
    const snippet = stripTags(item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '');
    const source = stripTags(item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || 'News');
    return { title, url, source, publishedAt, snippet };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || '').trim();
  const entity = (searchParams.get('entity') || '').trim();
  const limit = Math.max(1, Math.min(8, Number(searchParams.get('limit') || 5)));

  if (!title && !entity) {
    return NextResponse.json({ items: [] });
  }

  const query = [entity, title, 'RFP OR contract OR procurement OR cybersecurity'].filter(Boolean).join(' ');
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const response = await fetch(rssUrl, {
      next: { revalidate: 1800 },
      headers: { Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8' },
    });
    if (!response.ok) {
      return NextResponse.json({ items: [], error: `News feed unavailable (${response.status})` });
    }

    const xml = await response.text();
    const parsed = parseRssItems(xml)
      .filter((item) => item.title && item.url)
      .slice(0, limit);

    return NextResponse.json({ items: parsed });
  } catch (error) {
    return NextResponse.json({
      items: [],
      error: error instanceof Error ? error.message : 'Failed to fetch opportunity news',
    });
  }
}
