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

  if (!type || !amount || !date) {
    return NextResponse.json(
      { error: "type, amount, and date are required" },
      { status: 400 }
    );
  }

  const validTypes = ["income", "expense", "transfer"];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: "type must be 'income', 'expense', or 'transfer'" },
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
    date,
    note: note ? String(note).trim() : "",
    createdAt: new Date(),
  };

  if (type === "transfer") {
    const { fromAccountId, toAccountId } = body;
    if (!fromAccountId || !toAccountId) {
      return NextResponse.json(
        { error: "fromAccountId and toAccountId are required for transfers" },
        { status: 400 }
      );
    }
    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        { error: "fromAccountId and toAccountId must be different" },
        { status: 400 }
      );
    }
    doc.fromAccountId = fromAccountId;
    doc.toAccountId = toAccountId;
    doc.category = "Transfer";
  } else {
    const { accountId } = body;
    if (!accountId || !category) {
      return NextResponse.json(
        { error: "accountId and category are required for income/expense" },
        { status: 400 }
      );
    }
    doc.accountId = accountId;
    doc.category = String(category).trim();
  }

  const result = await db.collection("transactions").insertOne(doc);

  return NextResponse.json({ ...doc, _id: result.insertedId });
}
