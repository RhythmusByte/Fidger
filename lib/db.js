import { MongoClient } from "mongodb";
import { constants as cryptoConstants } from "crypto";

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "fidger";

if (!mongoUri) {
  throw new Error("MONGODB_URI is not set. Add it to your environment variables.");
}

let cachedClient = global._fidgerMongoClient;
let cachedDb = global._fidgerMongoDb;

async function getDb() {
  if (cachedDb) {
    return cachedDb;
  }
  if (!cachedClient) {
    cachedClient = new MongoClient(mongoUri, {
      maxPoolSize: 5,
      family: 4,
      serverSelectionTimeoutMS: 10000,
      secureContext: {
        secureOptions: cryptoConstants.SSL_OP_LEGACY_SERVER_CONNECT,
      },
    });
    global._fidgerMongoClient = cachedClient;
  }
  const client = await cachedClient.connect();
  const db = client.db(dbName);
  cachedDb = db;
  global._fidgerMongoDb = db;
  return db;
}

export async function getCollection(collectionName) {
  const db = await getDb();
  return db.collection(collectionName);
}

export const COLLECTIONS = {
  debts: "debts",
  debtTransactions: "debtTransactions",
  creditCards: "creditCards",
  cardTransactions: "cardTransactions",
  accounts: "accounts",
  transactions: "transactions",
  categories: "categories",
  tags: "tags",
  goals: "goals",
  recurringItems: "recurringItems",
  subscriptions: "subscriptions",
  dismissedSuggestions: "dismissedSuggestions",
  budgets: "budgets",
  documents: "documents",
  notes: "notes",
  logs: "logs",
  settings: "settings",
  notifications: "notifications",
};

export async function writeLog({ scope, action, entityType, entityId, message, meta }) {
  try {
    const logs = await getCollection(COLLECTIONS.logs);
    await logs.insertOne({
      scope,
      action,
      entityType: entityType || null,
      entityId: entityId || null,
      message,
      meta: meta || null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("writeLog failed (non-fatal):", error.message);
  }
}

export default getDb;
