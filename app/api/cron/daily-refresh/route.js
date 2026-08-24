import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS, writeLog } from "@/lib/db";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

async function refreshDebtStatuses() {
  const debts = await getCollection(COLLECTIONS.debts);
  const today = startOfToday();
  const activeDebts = await debts.find({ status: "active", finished: { $ne: true } }).toArray();

  let overdueCount = 0;
  for (const debt of activeDebts) {
    if (!debt.paymentDay) continue;
    const dueThisMonth = new Date(today.getFullYear(), today.getMonth(), debt.paymentDay);
    const isOverdue = today > dueThisMonth && debt.currentStatus !== "onTrack";
    const nextStatus = today > dueThisMonth ? "overdue" : "onTrack";
    if (nextStatus !== debt.currentStatus) {
      await debts.updateOne({ _id: debt._id }, { $set: { currentStatus: nextStatus, updatedAt: new Date() } });
      if (nextStatus === "overdue") overdueCount += 1;
    }
  }
  return overdueCount;
}

async function refreshCardStatuses() {
  const cards = await getCollection(COLLECTIONS.creditCards);
  const today = startOfToday();
  const activeCards = await cards.find({ status: "active" }).toArray();

  let overdueCount = 0;
  for (const card of activeCards) {
    if (!card.dueDay) continue;
    const dueThisMonth = new Date(today.getFullYear(), today.getMonth(), card.dueDay);
    const nextStatus = today > dueThisMonth && card.outstandingAmount > 0 ? "overdue" : "onTime";
    if (nextStatus !== card.dueStatus) {
      await cards.updateOne({ _id: card._id }, { $set: { dueStatus: nextStatus, updatedAt: new Date() } });
      if (nextStatus === "overdue") overdueCount += 1;
    }
  }
  return overdueCount;
}

async function writeNotification(message, type) {
  const notifications = await getCollection(COLLECTIONS.notifications);
  await notifications.insertOne({
    message,
    type,
    read: false,
    createdAt: new Date(),
  });
}

export async function GET() {
  try {
    const overdueDebts = await refreshDebtStatuses();
    const overdueCards = await refreshCardStatuses();

    if (overdueDebts > 0) {
      await writeNotification(`${overdueDebts} debt(s) marked overdue during today's automated check.`, "warning");
    }
    if (overdueCards > 0) {
      await writeNotification(`${overdueCards} credit card(s) marked overdue during today's automated check.`, "warning");
    }

    await writeLog({
      scope: "automation",
      action: "dailyRefresh",
      message: "Daily 8PM automation completed",
      meta: { overdueDebts, overdueCards },
    });

    return NextResponse.json({ ok: true, overdueDebts, overdueCards });
  } catch (error) {
    await writeLog({ scope: "automation", action: "dailyRefreshFailed", message: error.message });
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
