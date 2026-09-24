import { auth } from "@/auth";
import { getAphurantaDatabase } from "@/lib/mongodb";

type StoreDocument = { workspace: string; records: unknown[]; activities: string[]; notifications: string[]; updatedAt?: Date };
const workspace = "aphuranta";
const emptyStore = { records: [], activities: [], notifications: [] };
const jsonHeaders = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401, headers: jsonHeaders });
  const db = await getAphurantaDatabase();
  const document = await db.collection<StoreDocument>("workspaces").findOne({ workspace }, { projection: { _id: 0, records: 1, activities: 1, notifications: 1 } });
  return Response.json(document ?? emptyStore, { headers: jsonHeaders });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401, headers: jsonHeaders });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12 * 1024 * 1024) return Response.json({ error: "Workspace payload is too large" }, { status: 413, headers: jsonHeaders });
  const body = await request.json();
  const store = {
    records: Array.isArray(body.records) ? body.records.slice(0, 10000) : [],
    activities: Array.isArray(body.activities) ? body.activities.slice(0, 1000) : [],
    notifications: Array.isArray(body.notifications) ? body.notifications.slice(0, 500) : [],
  };
  const db = await getAphurantaDatabase();
  await db.collection<StoreDocument>("workspaces").updateOne({ workspace }, { $set: { ...store, updatedAt: new Date() }, $setOnInsert: { workspace } }, { upsert: true });
  return Response.json({ ok: true }, { headers: jsonHeaders });
}
