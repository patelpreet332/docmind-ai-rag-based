import { MongoClient } from "mongodb";
import { env } from "./env";

const globalForMongo = global as unknown as {
  client?: MongoClient;
};

export const client =
  globalForMongo.client ??
  new MongoClient(env.mongoUri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo.client = client;
}

export const db = client.db(env.dbName);
