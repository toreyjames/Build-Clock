import { NextRequest, NextResponse } from "next/server";
import { getIntelEvents } from "@/lib/intel-data";
import { appendStatusHistory, insertIntelEvent, loadPersistedIntelEvents } from "@/lib/intel-store";
import type { ProjectLifecycleStatus } from "@/lib/intel-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const projectId = params.get("project_id") ?? undefined;
  const limitParam = params.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(500, Number(limitParam))) : 100;

  const [staticEvents, persistedEvents] = await Promise.all([
    Promise.resolve(getIntelEvents(projectId)),
    loadPersistedIntelEvents(projectId, limit * 2),
  ]);
  const deduped = new Map<string, (typeof staticEvents)[number]>();
  for (const event of [...persistedEvents, ...staticEvents]) {
    deduped.set(event.id, event);
  }
  const events = Array.from(deduped.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  return NextResponse.json({
    events,
    storage: {
      persisted: persistedEvents.length,
      static: staticEvents.length,
    },
    generatedAt: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      event: {
        id?: string;
        projectId: string;
        timestamp?: string;
        type: "press-release" | "news" | "permit" | "procurement" | "grid" | "video";
        impact: "positive" | "neutral" | "negative";
        source: string;
        title: string;
        summary: string;
        url: string;
        tags?: string[];
      };
      statusChange?: {
        fromStatus: ProjectLifecycleStatus | null;
        toStatus: ProjectLifecycleStatus;
        reason: string;
        evidenceUrl?: string | null;
      };
    };

    if (!body?.event?.projectId || !body?.event?.title || !body?.event?.url) {
      return NextResponse.json({ success: false, error: "Invalid event payload" }, { status: 400 });
    }

    const timestamp = body.event.timestamp ?? new Date().toISOString();
    const eventResult = await insertIntelEvent({
      ...body.event,
      timestamp,
      tags: body.event.tags ?? [],
    });

    let statusResult: { success: boolean; reason?: string } = { success: true };
    if (body.statusChange) {
      statusResult = await appendStatusHistory({
        projectId: body.event.projectId,
        fromStatus: body.statusChange.fromStatus,
        toStatus: body.statusChange.toStatus,
        reason: body.statusChange.reason,
        evidenceUrl: body.statusChange.evidenceUrl ?? body.event.url,
        changedAt: timestamp,
      });
    }

    return NextResponse.json({
      success: eventResult.success && statusResult.success,
      event: eventResult,
      statusHistory: statusResult,
    });
  } catch (error) {
    console.error("intel events POST failed:", error);
    return NextResponse.json({ success: false, error: "Failed to save intel event" }, { status: 500 });
  }
}
