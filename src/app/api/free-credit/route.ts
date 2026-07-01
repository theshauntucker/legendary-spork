import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/free-credit
 *
 * DISABLED 2026-06-30: The free first analysis has been removed.
 * New users must sign up and purchase before analyzing. This endpoint no
 * longer grants any credits — it is kept only so legacy client calls don't 404.
 * Removing the free grant stops throwaway-email farming of the free analysis.
 */
export async function POST() {
  return NextResponse.json({ success: false, disabled: true, granted: 0 });
}
