import { NextRequest, NextResponse } from "next/server";
export function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => NextResponse.redirect(new URL(`/api/spotlight/pdf?id=${id}`, request.url)));
}
