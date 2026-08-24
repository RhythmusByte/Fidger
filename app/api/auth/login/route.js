import { NextResponse } from "next/server";
import { verifyOwnerPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { writeLog } from "@/lib/db";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { password } = body || {};
  const isValid = await verifyOwnerPassword(password);

  if (!isValid) {
    await writeLog({ scope: "auth", action: "loginFailed", message: "Failed login attempt" });
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  await setSessionCookie(token);
  await writeLog({ scope: "auth", action: "loginSuccess", message: "Owner logged in" });

  return NextResponse.json({ ok: true });
}
