import { NextResponse } from "next/server";
import receptionistData from "@/seed/data/receptionist.json";
import patientClerkingData from "@/seed/data/patient-clerking.json";

export async function GET() {
  return NextResponse.json({
    ...receptionistData,
    patientClerking: patientClerkingData,
  });
}
