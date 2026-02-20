import { NextResponse } from 'next/server';
import { fetchSignals } from '@/lib/signals';

export async function GET() {
  const signals = await fetchSignals();

  return NextResponse.json({
    signals,
    stats: {
      total: signals.length,
      thisWeek: signals.filter(s => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(s.publishedAt) >= weekAgo;
      }).length,
      highRelevance: signals.filter(s => s.relevance === 'high').length
    }
  });
}
