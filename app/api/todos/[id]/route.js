import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongodb";
import { getSessionUserId } from "../../../../lib/getSessionUser";

export async function PUT(request, { params }) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { text, done } = await request.json();
  const update = {};
  if (text !== undefined) update.text = String(text).trim();
  if (done !== undefined) update.done = Boolean(done);

  const db = await getDb();
  const result = await db
    .collection("todos")
    .updateOne({ _id: objectId, userId }, { $set: update });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db
    .collection("todos")
    .deleteOne({ _id: objectId, userId });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
