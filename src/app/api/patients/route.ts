import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SEED_PATH = path.join(process.cwd(), "src/seed/data/patient-clerking.json");

function readSeed() {
  const raw = fs.readFileSync(SEED_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeSeed(data: Record<string, unknown>) {
  fs.writeFileSync(SEED_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function GET() {
  try {
    const seed = readSeed();
    return NextResponse.json({ patients: seed.patients ?? [] });
  } catch (e) {
    console.error("Patients GET error:", e);
    return NextResponse.json({ error: "Failed to read patients" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const patient = body.patient;
    if (!patient || !patient.id) {
      return NextResponse.json({ error: "Patient with id is required" }, { status: 400 });
    }

    const seed = readSeed();
    const patients: Record<string, unknown>[] = seed.patients ?? [];
    const idx = patients.findIndex((p: Record<string, unknown>) => p.id === patient.id);

    if (idx === -1) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    patients[idx] = { ...patients[idx], ...patient };
    seed.patients = patients;
    writeSeed(seed);

    return NextResponse.json({ patient: patients[idx] });
  } catch (e) {
    console.error("Patients PUT error:", e);
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const patient = body.patient;
    if (!patient || !patient.name) {
      return NextResponse.json({ error: "Patient with name is required" }, { status: 400 });
    }

    const seed = readSeed();
    const patients: Record<string, unknown>[] = seed.patients ?? [];
    patients.push(patient);
    seed.patients = patients;
    writeSeed(seed);

    return NextResponse.json({ patient });
  } catch (e) {
    console.error("Patients POST error:", e);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}
