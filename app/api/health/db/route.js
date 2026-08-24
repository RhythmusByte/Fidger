import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

export async function GET() {
  try {
    const healthCollection = await getCollection("healthChecks");
    const probeDoc = { probe: true, createdAt: new Date() };
    const insertResult = await healthCollection.insertOne(probeDoc);
    const readBack = await healthCollection.findOne({ _id: insertResult.insertedId });
    await healthCollection.deleteOne({ _id: insertResult.insertedId });

    if (!readBack) {
      return NextResponse.json({ ok: false, error: "Write succeeded but read-back failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "MongoDB connection verified (write, read, cleanup all succeeded)." });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
