import { NextResponse } from "next/server";
import dashboardData from "@/seed/data/dashboard.json";

export async function GET() {
  return NextResponse.json(dashboardData);
}
