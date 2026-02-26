import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/database/connection";
import { Prescription } from "@/database/entity/Prescription";

function toPrescriptionJson(p: Prescription) {
  return {
    id: p.id,
    patientName: p.patientName,
    patientId: p.patientId,
    appointmentId: p.appointmentId,
    medication: p.medication,
    dosage: p.dosage,
    instructions: p.instructions,
    prescribedBy: p.prescribedBy,
    status: p.status,
    createdAt: p.createdAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const ds = await getConnection();
    const repo = ds.getRepository(Prescription);
    const { searchParams } = new URL(request.url);
    const patientNames = searchParams.get("patient_names");
    const patientIds = searchParams.get("patient_ids");
    const qb = repo.createQueryBuilder("p").orderBy("p.createdAt", "DESC").take(500);
    const conditions: string[] = [];
    const params: Record<string, string[] | undefined> = {};
    if (patientNames) {
      const names = patientNames.split(",").map((s) => s.trim()).filter(Boolean);
      if (names.length) {
        conditions.push("p.patientName IN (:...names)");
        params.names = names;
      }
    }
    if (patientIds) {
      const ids = patientIds.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length) {
        conditions.push("p.patientId IN (:...ids)");
        params.ids = ids;
      }
    }
    if (conditions.length) {
      qb.andWhere(`(${conditions.join(" OR ")})`, params);
    }
    const list = await qb.getMany();
    return NextResponse.json({ prescriptions: list.map(toPrescriptionJson) });
  } catch {
    return NextResponse.json({ prescriptions: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const patientName = typeof body.patientName === "string" ? body.patientName.trim() : "";
    const patientId = typeof body.patientId === "string" ? body.patientId.trim() || null : null;
    const appointmentId = typeof body.appointmentId === "string" ? body.appointmentId.trim() || null : null;
    const medication = typeof body.medication === "string" ? body.medication.trim() : "";
    const dosage = typeof body.dosage === "string" ? body.dosage.trim() || null : null;
    const instructions = typeof body.instructions === "string" ? body.instructions.trim() || null : null;
    const prescribedBy = typeof body.prescribedBy === "string" ? body.prescribedBy.trim() : "doctor";
    if (!patientName || !medication) {
      return NextResponse.json({ error: "patientName and medication are required" }, { status: 400 });
    }
    const ds = await getConnection();
    const repo = ds.getRepository(Prescription);
    const rx = repo.create({
      patientName,
      patientId,
      appointmentId,
      medication,
      dosage,
      instructions,
      prescribedBy,
      status: "pending",
    });
    const saved = await repo.save(rx);
    return NextResponse.json(toPrescriptionJson(saved));
  } catch (e) {
    console.error("Prescriptions POST error:", e);
    return NextResponse.json({ error: "Failed to create prescription" }, { status: 500 });
  }
}
