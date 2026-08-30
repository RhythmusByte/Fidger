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

  const { name, type, startingBalance } = await request.json();
  const update = {};
  if (name) update.name = String(name).trim();
  if (type) update.type = type;
  if (startingBalance !== undefined)
    update.startingBalance = Number(startingBalance);

  const db = await getDb();
  const result = await db
    .collection("accounts")
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
  const idStr = params.id;

  // Prevent deleting an account that still has transactions pointing at it,
  // otherwise those transactions become orphaned and balances go wrong.
  const inUse = await db.collection("transactions").findOne({
    userId,
    $or: [{ accountId: idStr }, { fromAccountId: idStr }, { toAccountId: idStr }],
  });

  if (inUse) {
    return NextResponse.json(
      { error: "Cannot delete an account that has transactions. Delete or reassign those first." },
      { status: 409 }
    );
  }

  const result = await db
    .collection("accounts")
    .deleteOne({ _id: objectId, userId });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
