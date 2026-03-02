import { NextRequest, NextResponse } from "next/server";
import { getIntelEvents } from "@/lib/intel-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const projectId = params.get("project_id") ?? undefined;
  const limitParam = params.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(500, Number(limitParam))) : 100;

  const events = getIntelEvents(projectId).slice(0, limit);

  return NextResponse.json({
    events,
    generatedAt: new Date().toISOString(),
  });
}
