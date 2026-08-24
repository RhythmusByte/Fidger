import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { writeLog } from "@/lib/db";

export async function POST() {
  await clearSessionCookie();
  await writeLog({ scope: "auth", action: "logout", message: "Owner logged out" });
  return NextResponse.json({ ok: true });
}
