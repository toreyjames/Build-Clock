import { NextResponse } from 'next/server';
import { fetchNews } from '@/lib/news';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const signals = await fetchNews(limit);

    // Calculate stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total: signals.length,
      thisWeek: signals.filter(s => new Date(s.publishedAt) >= weekAgo).length,
      critical: signals.filter(s => s.relevance === 'critical').length,
      high: signals.filter(s => s.relevance === 'high').length,
      byType: {
        news: signals.filter(s => s.signalType === 'news').length,
        funding: signals.filter(s => s.signalType === 'funding').length,
        policy: signals.filter(s => s.signalType === 'policy').length,
        'contract-award': signals.filter(s => s.signalType === 'contract-award').length,
      }
    };

    return NextResponse.json({
      signals,
      stats,
      lastFetched: new Date().toISOString()
    });
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json({
      signals: [],
      stats: { total: 0, thisWeek: 0, critical: 0, high: 0, byType: {} },
      error: 'Failed to fetch news'
    });
  }
}
