import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { getSessionUserId } from "../../../lib/getSessionUser";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const notes = await db
    .collection("notes")
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();

  return NextResponse.json(notes);
}

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content } = await request.json();

  if (!title && !content) {
    return NextResponse.json(
      { error: "Note must have a title or content" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const now = new Date();
  const doc = {
    userId,
    title: title ? String(title).trim() : "Untitled",
    content: content ? String(content) : "",
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("notes").insertOne(doc);
  return NextResponse.json({ ...doc, _id: result.insertedId });
}
