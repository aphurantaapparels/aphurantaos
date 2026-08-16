import { auth } from "@/auth";
import { getAphurantaDatabase } from "@/lib/mongodb";

type StoreDocument = {
  workspace: string;
  records: unknown[];
  activities: string[];
  notifications: string[];
  updatedAt: Date;
};

const workspace = "aphuranta";
const emptyStore = { records: [], activities: [], notifications: [] };

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getAphurantaDatabase();
  const document = await db.collection<StoreDocument>("workspaces").findOne(
    { workspace },
    { projection: { _id: 0, records: 1, activities: 1, notifications: 1 } },
  );
  return Response.json(document ?? emptyStore);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const store = {
    records: Array.isArray(body.records) ? body.records.slice(0, 10000) : [],
    activities: Array.isArray(body.activities) ? body.activities.slice(0, 1000) : [],
    notifications: Array.isArray(body.notifications) ? body.notifications.slice(0, 500) : [],
  };
  const db = await getAphurantaDatabase();
  await db.collection<StoreDocument>("workspaces").updateOne(
    { workspace },
    { $set: { ...store, updatedAt: new Date() }, $setOnInsert: { workspace } },
    { upsert: true },
  );
  return Response.json({ ok: true });
}
