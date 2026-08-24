import { NextResponse } from "next/server";
import { verifyOwnerPassword, createSessionToken, setSessionCookie, AuthConfigError } from "@/lib/auth";
import { writeLog } from "@/lib/db";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { password } = body || {};

  let isValid;
  try {
    isValid = await verifyOwnerPassword(password);
  } catch (error) {
    if (error instanceof AuthConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    throw error;
  }

  if (!isValid) {
    await writeLog({ scope: "auth", action: "loginFailed", message: "Failed login attempt" });
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  let token;
  try {
    token = await createSessionToken();
  } catch (error) {
    if (error instanceof AuthConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    throw error;
  }

  await setSessionCookie(token);
  await writeLog({ scope: "auth", action: "loginSuccess", message: "Owner logged in" });

  return NextResponse.json({ ok: true });
}
