import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/database/connection";
import { Appointment } from "@/database/entity/Appointment";

const DEFAULT_FEE = 50000;
const STATUSES = ["pending_payment", "paid", "scheduled", "in_progress", "completed"] as const;

function toAppointmentJson(a: Appointment) {
  return {
    id: a.id,
    patientName: a.patientName,
    patientId: a.patientId,
    phone: a.phone,
    reason: a.reason,
    preferredDoctor: a.preferredDoctor,
    status: a.status,
    appointmentFee: Number(a.appointmentFee),
    paidAt: a.paidAt ? new Date(a.paidAt).toISOString() : null,
    allocatedDoctor: a.allocatedDoctor,
    allocatedDate: a.allocatedDate,
    allocatedTime: a.allocatedTime,
    bookedBy: a.bookedBy,
    createdAt: a.createdAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const ds = await getConnection();
    const repo = ds.getRepository(Appointment);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const allocatedDate = searchParams.get("allocated_date");
    const allocatedDoctor = searchParams.get("allocated_doctor");
    const qb = repo.createQueryBuilder("a").orderBy("a.allocatedTime", "ASC").orderBy("a.createdAt", "DESC").take(200);
    if (status && STATUSES.includes(status as (typeof STATUSES)[number])) {
      qb.andWhere("a.status = :status", { status });
    }
    if (allocatedDate) {
      qb.andWhere("a.allocatedDate = :allocatedDate", { allocatedDate });
      qb.andWhere("(a.status = :scheduled OR a.status = :inProgress OR a.status = :completed)", {
        scheduled: "scheduled",
        inProgress: "in_progress",
        completed: "completed",
      });
    }
    if (allocatedDoctor) {
      qb.andWhere("a.allocatedDoctor = :allocatedDoctor", { allocatedDoctor });
    }
    const list = await qb.getMany();
    return NextResponse.json({ appointments: list.map(toAppointmentJson) });
  } catch {
    return NextResponse.json({
      appointments: [
        {
          id: "apt-seed-1",
          patientName: "James Okello",
          patientId: "OPD-2025-001",
          phone: "+256700111222",
          reason: "General check-up",
          preferredDoctor: "Dr. Nazar Becks",
          status: "pending_payment",
          appointmentFee: DEFAULT_FEE,
          paidAt: null,
          allocatedDoctor: null,
          allocatedDate: null,
          allocatedTime: null,
          bookedBy: "receptionist",
          createdAt: new Date().toISOString(),
        },
        {
          id: "apt-seed-2",
          patientName: "Mary Akinyi",
          patientId: null,
          phone: "+256700333444",
          reason: "Follow-up",
          preferredDoctor: null,
          status: "paid",
          appointmentFee: DEFAULT_FEE,
          paidAt: new Date().toISOString(),
          allocatedDoctor: null,
          allocatedDate: null,
          allocatedTime: null,
          bookedBy: "nurse",
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const patientName = typeof body.patientName === "string" ? body.patientName.trim() : "";
    const patientId = typeof body.patientId === "string" ? body.patientId.trim() || null : null;
    const phone = typeof body.phone === "string" ? body.phone.trim() || null : null;
    const reason = typeof body.reason === "string" ? body.reason.trim() || null : null;
    const preferredDoctor = typeof body.preferredDoctor === "string" ? body.preferredDoctor.trim() || null : null;
    const fee = typeof body.appointmentFee === "number" ? body.appointmentFee : DEFAULT_FEE;
    const bookedBy = typeof body.bookedBy === "string" ? body.bookedBy : "receptionist";

    if (!patientName) {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }

    const ds = await getConnection();
    const repo = ds.getRepository(Appointment);
    const apt = repo.create({
      patientName,
      patientId,
      phone,
      reason,
      preferredDoctor,
      status: "pending_payment",
      appointmentFee: String(fee),
      paidAt: null,
      allocatedDoctor: null,
      allocatedDate: null,
      allocatedTime: null,
      bookedBy,
    });
    const saved = await repo.save(apt);
    return NextResponse.json(toAppointmentJson(saved));
  } catch (e) {
    console.error("Appointments POST error:", e);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
