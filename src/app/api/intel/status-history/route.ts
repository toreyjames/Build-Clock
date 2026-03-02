import { NextRequest, NextResponse } from "next/server";
import { appendStatusHistory, loadStatusHistory } from "@/lib/intel-store";
import type { ProjectLifecycleStatus } from "@/lib/intel-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const projectId = params.get("project_id") ?? undefined;
  const limitParam = params.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(500, Number(limitParam))) : 100;
  const history = await loadStatusHistory(projectId, limit);

  return NextResponse.json({
    history,
    generatedAt: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      projectId: string;
      fromStatus: ProjectLifecycleStatus | null;
      toStatus: ProjectLifecycleStatus;
      reason: string;
      evidenceUrl?: string | null;
      changedAt?: string;
    };

    if (!body?.projectId || !body?.toStatus || !body?.reason) {
      return NextResponse.json({ success: false, error: "Invalid status payload" }, { status: 400 });
    }

    const result = await appendStatusHistory({
      projectId: body.projectId,
      fromStatus: body.fromStatus,
      toStatus: body.toStatus,
      reason: body.reason,
      evidenceUrl: body.evidenceUrl ?? null,
      changedAt: body.changedAt ?? new Date().toISOString(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("status history POST failed:", error);
    return NextResponse.json({ success: false, error: "Failed to save status history" }, { status: 500 });
  }
}
