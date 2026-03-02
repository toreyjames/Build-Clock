import { NextRequest, NextResponse } from "next/server";
import { loadLiveStreams, upsertLiveStream } from "@/lib/intel-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const projectId = params.get("project_id") ?? undefined;
  const limitParam = params.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(500, Number(limitParam))) : 100;
  const streams = await loadLiveStreams(projectId, limit);

  return NextResponse.json({
    streams,
    generatedAt: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: string;
      projectId: string;
      title: string;
      provider: string;
      streamUrl: string;
      verified?: boolean;
      coverageScope?: string;
      lastVerifiedAt?: string | null;
    };

    if (!body?.projectId || !body?.title || !body?.provider || !body?.streamUrl) {
      return NextResponse.json({ success: false, error: "Invalid live stream payload" }, { status: 400 });
    }

    const result = await upsertLiveStream({
      id: body.id ?? `${body.projectId}-${Date.now()}`,
      projectId: body.projectId,
      title: body.title,
      provider: body.provider,
      streamUrl: body.streamUrl,
      verified: Boolean(body.verified),
      coverageScope: body.coverageScope ?? "project-area",
      lastVerifiedAt: body.lastVerifiedAt ?? new Date().toISOString(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("live streams POST failed:", error);
    return NextResponse.json({ success: false, error: "Failed to save live stream" }, { status: 500 });
  }
}
