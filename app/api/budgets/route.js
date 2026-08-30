import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { getSessionUserId } from "../../../lib/getSessionUser";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const budgets = await db
    .collection("budgets")
    .find({ userId })
    .sort({ category: 1 })
    .toArray();

  return NextResponse.json(budgets);
}

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { category, limit } = await request.json();

  if (!category || limit === undefined) {
    return NextResponse.json(
      { error: "category and limit are required" },
      { status: 400 }
    );
  }

  const numericLimit = Number(limit);
  if (Number.isNaN(numericLimit) || numericLimit <= 0) {
    return NextResponse.json(
      { error: "limit must be a positive number" },
      { status: 400 }
    );
  }

  const normalizedCategory = String(category).trim();
  const db = await getDb();

  // One budget per category per user: upsert so re-adding an existing
  // category just updates its limit instead of creating a duplicate.
  await db.collection("budgets").updateOne(
    { userId, category: normalizedCategory },
    { $set: { userId, category: normalizedCategory, limit: numericLimit } },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
