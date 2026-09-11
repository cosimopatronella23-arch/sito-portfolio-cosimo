import { NextResponse } from "next/server";
import { createHash } from "crypto";

// Endpoint temporaneo di sola diagnostica, protetto dallo stesso CRON_SECRET.
// Da rimuovere subito dopo aver risolto il problema della chiave Google.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")?.trim();
  const expected = `Bearer ${process.env.CRON_SECRET?.trim()}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "";

  return NextResponse.json({
    length: raw.length,
    startsWithQuote: raw.startsWith('"'),
    endsWithQuote: raw.endsWith('"'),
    startsWithDash: raw.startsWith("-----BEGIN"),
    containsLiteralBackslashN: raw.includes("\\n"),
    containsRealNewline: raw.includes("\n"),
    containsCarriageReturn: raw.includes("\r"),
    lineCount: raw.split(/\r\n|\r|\n/).length,
    sha256: createHash("sha256").update(raw.trim()).digest("hex"),
  });
}
