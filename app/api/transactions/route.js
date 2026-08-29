import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { getSessionUserId } from "../../../lib/getSessionUser";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const transactions = await db
    .collection("transactions")
    .find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .toArray();

  return NextResponse.json(transactions);
}

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, amount, category, date, note } = body;

  if (!type || !amount || !category || !date) {
    return NextResponse.json(
      { error: "type, amount, category, and date are required" },
      { status: 400 }
    );
  }

  if (type !== "income" && type !== "expense") {
    return NextResponse.json(
      { error: "type must be 'income' or 'expense'" },
      { status: 400 }
    );
  }

  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const doc = {
    userId,
    type,
    amount: numericAmount,
    category: String(category).trim(),
    date,
    note: note ? String(note).trim() : "",
    createdAt: new Date(),
  };

  const result = await db.collection("transactions").insertOne(doc);

  return NextResponse.json({ ...doc, _id: result.insertedId });
}
