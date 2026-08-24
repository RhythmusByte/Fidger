import { NextResponse } from "next/server";
import { checkEnvVars } from "@/lib/envCheck";

export async function GET() {
  const problems = checkEnvVars();
  return NextResponse.json({
    ok: problems.length === 0,
    problems,
  });
}
