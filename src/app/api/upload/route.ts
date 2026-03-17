import { NextResponse } from "next/server";

// This route is deprecated — uploads now go directly to Supabase Storage
// via signed URLs. See /api/upload/signed-url and /api/upload/complete.
export async function POST() {
  return NextResponse.json(
    {
      error: "This upload endpoint has been replaced. Please use the updated upload flow.",
      redirect: "/upload",
    },
    { status: 410 }
  );
}
