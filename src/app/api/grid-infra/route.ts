import { NextResponse } from "next/server";

const FEATURE_SERVER_BASE =
  "https://services7.arcgis.com/p4qwkH3IF5hxHqd7/ArcGIS/rest/services/PowerInfrastructure/FeatureServer";

const QUERY_COMMON =
  "where=1%3D1&outFields=*&returnGeometry=true&f=geojson&outSR=102100&resultRecordCount=1200";

async function fetchLayer(layerId: number) {
  const url = `${FEATURE_SERVER_BASE}/${layerId}/query?${QUERY_COMMON}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Layer ${layerId} fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    features?: Array<{
      properties?: Record<string, unknown>;
      geometry?: { type?: string; coordinates?: unknown };
    }>;
  };

  return data.features ?? [];
}

export async function GET() {
  try {
    const [linesRaw, substationsRaw, plantsRaw] = await Promise.all([
      fetchLayer(3), // transmission lines
      fetchLayer(2), // substations / major nodes
      fetchLayer(1), // generation / infrastructure points
    ]);

    const lines = linesRaw
      .filter((f) => f.geometry?.type === "LineString" || f.geometry?.type === "MultiLineString")
      .slice(0, 2200);

    const substations = substationsRaw
      .filter((f) => f.geometry?.type === "Point")
      .slice(0, 1200);

    const plants = plantsRaw
      .filter((f) => f.geometry?.type === "Point")
      .slice(0, 1800);

    return NextResponse.json({
      source: "hifld-arcgis",
      lines,
      substations,
      plants,
      counts: {
        lines: lines.length,
        substations: substations.length,
        plants: plants.length,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("grid-infra fetch error:", error);
    return NextResponse.json(
      {
        source: "error",
        lines: [],
        substations: [],
        plants: [],
        counts: { lines: 0, substations: 0, plants: 0 },
        error: "Failed to fetch grid infrastructure",
      },
      { status: 200 },
    );
  }
}
