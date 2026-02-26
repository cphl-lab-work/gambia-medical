import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/database/connection";
import { Appointment } from "@/database/entity/Appointment";

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

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid appointment id" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";

    const ds = await getConnection();
    const repo = ds.getRepository(Appointment);
    const apt = await repo.findOne({ where: { id } });
    if (!apt) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (action === "record_payment") {
      if (apt.status !== "pending_payment") {
        return NextResponse.json({ error: "Appointment is not pending payment" }, { status: 400 });
      }
      apt.status = "paid";
      apt.paidAt = new Date();
      const saved = await repo.save(apt);
      return NextResponse.json(toAppointmentJson(saved));
    }

    if (action === "allocate") {
      if (apt.status !== "paid") {
        return NextResponse.json({ error: "Appointment must be paid before allocating date" }, { status: 400 });
      }
      const allocatedDoctor = typeof body.allocatedDoctor === "string" ? body.allocatedDoctor.trim() || null : null;
      const allocatedDate = typeof body.allocatedDate === "string" ? body.allocatedDate : null;
      const allocatedTime = typeof body.allocatedTime === "string" ? body.allocatedTime.trim() || null : null;
      if (!allocatedDate || !allocatedTime) {
        return NextResponse.json({ error: "allocatedDate and allocatedTime are required" }, { status: 400 });
      }
      apt.status = "scheduled";
      apt.allocatedDoctor = allocatedDoctor ?? apt.preferredDoctor;
      apt.allocatedDate = allocatedDate;
      apt.allocatedTime = allocatedTime;
      const saved = await repo.save(apt);
      return NextResponse.json(toAppointmentJson(saved));
    }

    if (action === "start") {
      if (apt.status !== "scheduled") {
        return NextResponse.json({ error: "Only scheduled appointments can be started" }, { status: 400 });
      }
      apt.status = "in_progress";
      const saved = await repo.save(apt);
      return NextResponse.json(toAppointmentJson(saved));
    }

    if (action === "finish") {
      if (apt.status !== "in_progress") {
        return NextResponse.json({ error: "Only in-progress appointments can be finished" }, { status: 400 });
      }
      apt.status = "completed";
      const saved = await repo.save(apt);
      return NextResponse.json(toAppointmentJson(saved));
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("Appointments PATCH error:", e);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const ds = await getConnection();
    const repo = ds.getRepository(Appointment);
    const apt = await repo.findOne({ where: { id } });
    if (!apt) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json(toAppointmentJson(apt));
  } catch {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }
}
