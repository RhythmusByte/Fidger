import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { getSessionUserId } from "../../../lib/getSessionUser";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const todos = await db
    .collection("todos")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(todos);
}

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await request.json();
  if (!text || !String(text).trim()) {
    return NextResponse.json(
      { error: "Todo text is required" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const doc = {
    userId,
    text: String(text).trim(),
    done: false,
    createdAt: new Date(),
  };

  const result = await db.collection("todos").insertOne(doc);
  return NextResponse.json({ ...doc, _id: result.insertedId });
}
