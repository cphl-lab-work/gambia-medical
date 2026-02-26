import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/database/connection";
import { PatientClerking } from "@/database/entity/PatientClerking";

const ARRIVAL_SOURCES = ["OPD", "Emergency Department", "Elective Admission"];
const STATUSES = ["Pending assessment", "Assessed", "Admitted"];

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await _request.json();
    const patientName = typeof body.patientName === "string" ? body.patientName.trim() : "";
    const patientId = typeof body.patientId === "string" ? body.patientId.trim() || null : null;
    const arrivalSource = typeof body.arrivalSource === "string" ? body.arrivalSource : "";
    const dateOfArrival = typeof body.dateOfArrival === "string" ? body.dateOfArrival : "";
    const timeOfArrival = typeof body.timeOfArrival === "string" ? body.timeOfArrival : "";
    const status = typeof body.status === "string" ? body.status : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() || null : null;
    const gender = typeof body.gender === "string" ? body.gender.trim() || null : null;
    const dateOfBirth = typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() || null : null;

    if (!patientName) {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }
    if (!ARRIVAL_SOURCES.includes(arrivalSource)) {
      return NextResponse.json({ error: "Invalid arrival source" }, { status: 400 });
    }
    if (!dateOfArrival || !timeOfArrival) {
      return NextResponse.json({ error: "Date and time of arrival are required" }, { status: 400 });
    }
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const ds = await getConnection();
    const repo = ds.getRepository(PatientClerking);
    const existing = await repo.findOne({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    existing.patientName = patientName;
    existing.patientId = patientId;
    existing.arrivalSource = arrivalSource;
    existing.dateOfArrival = dateOfArrival;
    existing.timeOfArrival = timeOfArrival;
    existing.status = status;
    existing.phone = phone;
    existing.gender = gender;
    existing.dateOfBirth = dateOfBirth;
    const saved = await repo.save(existing);

    return NextResponse.json({
      id: saved.id,
      patientName: saved.patientName,
      patientId: saved.patientId,
      arrivalSource: saved.arrivalSource,
      dateOfArrival: saved.dateOfArrival,
      timeOfArrival: saved.timeOfArrival,
      status: saved.status,
      phone: saved.phone,
      gender: saved.gender,
      dateOfBirth: saved.dateOfBirth,
      recordedBy: saved.recordedBy,
      createdAt: saved.createdAt,
    });
  } catch (e) {
    console.error("Clerking PUT error:", e);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}
