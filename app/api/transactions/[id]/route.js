import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongodb";
import { getSessionUserId } from "../../../../lib/getSessionUser";

export async function PUT(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let objectId;
  try {
    objectId = new ObjectId(params.id);
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const { type, amount, category, date, note } = body;

  const update = {};
  if (type) update.type = type;
  if (amount !== undefined) update.amount = Number(amount);
  if (category) update.category = String(category).trim();
  if (date) update.date = date;
  if (note !== undefined) update.note = String(note).trim();

  const db = await getDb();
  // userId filter here is what prevents one account from editing another's data.
  const result = await db
    .collection("transactions")
    .updateOne({ _id: objectId, userId }, { $set: update });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let objectId;
  try {
    objectId = new ObjectId(params.id);
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db
    .collection("transactions")
    .deleteOne({ _id: objectId, userId });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
