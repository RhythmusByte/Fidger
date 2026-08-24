import { NextResponse } from "next/server";
import { nextcloudHealthCheck } from "@/lib/nextcloud";

export async function GET() {
  try {
    const success = await nextcloudHealthCheck();
    if (!success) {
      return NextResponse.json({ ok: false, error: "Read-back content did not match what was written" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: "Nextcloud WebDAV connection verified (write, read, cleanup all succeeded)." });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
