import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let clientPromise: Promise<MongoClient> | undefined;

export function getMongoClient() {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!clientPromise) clientPromise = new MongoClient(uri).connect();
  return clientPromise;
}

export async function getAphurantaDatabase() {
  const client = await getMongoClient();
  return client.db("aphuranta_os");
}
