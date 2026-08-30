import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { getSessionUserId } from "../../../lib/getSessionUser";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const accounts = await db
    .collection("accounts")
    .find({ userId })
    .sort({ createdAt: 1 })
    .toArray();

  return NextResponse.json(accounts);
}

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, type, startingBalance } = await request.json();

  if (!name || !type) {
    return NextResponse.json(
      { error: "name and type are required" },
      { status: 400 }
    );
  }

  const validTypes = ["cash", "bank", "ewallet", "credit"];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const db = await getDb();
  const doc = {
    userId,
    name: String(name).trim(),
    type,
    startingBalance: Number(startingBalance) || 0,
    createdAt: new Date(),
  };

  const result = await db.collection("accounts").insertOne(doc);
  return NextResponse.json({ ...doc, _id: result.insertedId });
}
