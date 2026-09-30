import { NextResponse } from "next/server";
import { HEALTH_MARKER } from "@/lib/domain";

/** Usato per verificare che un dominio punti davvero a questo sito. */
export function GET() {
  return NextResponse.json(
    { site: HEALTH_MARKER },
    { headers: { "Cache-Control": "no-store" } },
  );
}
