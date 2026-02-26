import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/database/connection";
import { PatientClerking } from "@/database/entity/PatientClerking";
import patientClerkingSeed from "@/seed/data/patient-clerking.json";

const ARRIVAL_SOURCES = ["OPD", "Emergency Department", "Elective Admission"];
const STATUSES = ["Pending assessment", "Assessed", "Admitted"];

export async function GET() {
  try {
    const ds = await getConnection();
    const repo = ds.getRepository(PatientClerking);
    const list = await repo.find({
      order: { createdAt: "DESC" },
      take: 100,
    });
    const records = list.map((r) => ({
      id: r.id,
      patientName: r.patientName,
      patientId: r.patientId,
      arrivalSource: r.arrivalSource,
      dateOfArrival: r.dateOfArrival,
      timeOfArrival: r.timeOfArrival,
      status: r.status,
      phone: r.phone,
      gender: r.gender,
      dateOfBirth: r.dateOfBirth,
      recordedBy: r.recordedBy,
      createdAt: r.createdAt,
    }));
    return NextResponse.json({ records });
  } catch {
    const raw = (patientClerkingSeed as { clerkingRecords?: unknown[] }).clerkingRecords ?? [];
    const records = raw as Record<string, unknown>[];
    return NextResponse.json({
      records: records.map((r) => ({
        id: r.id,
        patientName: r.patientName,
        patientId: r.patientId ?? null,
        arrivalSource: r.arrivalSource,
        dateOfArrival: r.dateOfArrival,
        timeOfArrival: r.timeOfArrival,
        status: r.status,
        phone: null,
        gender: null,
        dateOfBirth: null,
        recordedBy: "seed",
        createdAt: r.recordedAt,
      })),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const patientName = typeof body.patientName === "string" ? body.patientName.trim() : "";
    const patientId = typeof body.patientId === "string" ? body.patientId.trim() || null : null;
    const arrivalSource = typeof body.arrivalSource === "string" ? body.arrivalSource : "";
    const dateOfArrival = typeof body.dateOfArrival === "string" ? body.dateOfArrival : "";
    const timeOfArrival = typeof body.timeOfArrival === "string" ? body.timeOfArrival : "";
    const status = typeof body.status === "string" ? body.status : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() || null : null;
    const gender = typeof body.gender === "string" ? body.gender.trim() || null : null;
    const dateOfBirth = typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() || null : null;
    const recordedBy = typeof body.recordedBy === "string" ? body.recordedBy : "receptionist";

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
    const record = repo.create({
      patientName,
      patientId,
      arrivalSource,
      dateOfArrival,
      timeOfArrival,
      status,
      phone,
      gender,
      dateOfBirth,
      recordedBy,
    });
    const saved = await repo.save(record);
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
    console.error("Clerking POST error:", e);
    return NextResponse.json(
      { error: "Failed to save clerking record. Is the database running?" },
      { status: 500 }
    );
  }
}
