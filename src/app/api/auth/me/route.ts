import { NextRequest, NextResponse } from "next/server";

/**
 * Optional: validate token from header and return current user.
 * For now we rely on client-stored auth; this can validate token against DB or allow list.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // In a full app you'd validate token server-side. For this demo we trust client storage.
  return NextResponse.json({ valid: true });
}
