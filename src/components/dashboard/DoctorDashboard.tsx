"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredAuth } from "@/helpers/local-storage";
import { getStoredProfile } from "@/helpers/local-storage";

interface WaitingAppointment {
  id: string;
  patientName: string;
  patientId: string | null;
  reason: string | null;
  allocatedTime: string | null;
  allocatedDate: string | null;
}

interface MeetingItem {
  id: string;
  title: string;
  time: string;
  location: string;
  type: "rounds" | "staff" | "handover" | "other";
}

interface OperationItem {
  id: string;
  time: string;
  patientName: string;
  procedure: string;
  theatre: string;
  status: "scheduled" | "in_progress" | "completed";
}

const MOCK_MEETINGS_TODAY: MeetingItem[] = [
  { id: "m1", title: "Ward round", time: "08:00", location: "Ward A", type: "rounds" },
  { id: "m2", title: "Staff meeting", time: "13:00", location: "Conference room", type: "staff" },
  { id: "m3", title: "Handover", time: "16:00", location: "Doctor's office", type: "handover" },
];

const MOCK_OPERATIONS_TODAY: OperationItem[] = [
  { id: "o1", time: "09:00", patientName: "John Doe", procedure: "Appendectomy", theatre: "Theatre 2", status: "scheduled" },
  { id: "o2", time: "11:30", patientName: "Jane Smith", procedure: "Cataract surgery", theatre: "Theatre 1", status: "scheduled" },
  { id: "o3", time: "14:00", patientName: "Peter Ochieng", procedure: "Hernia repair", theatre: "Theatre 2", status: "scheduled" },
];

function todayDateString(): string {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export default function DoctorDashboard({ role }: { role?: string | null }) {
  const [waitingAppointments, setWaitingAppointments] = useState<WaitingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const today = todayDateString();

  useEffect(() => {
    const auth = getStoredAuth();
    const profile = getStoredProfile();
    const doctorName = profile?.name || auth?.name || "";
    if (!doctorName) {
      setWaitingAppointments([]);
      setLoading(false);
      return;
    }
    const params = new URLSearchParams({ allocated_date: today, allocated_doctor: doctorName });
    fetch(`/api/appointments?${params}`)
      .then((r) => r.json())
      .then((data: { appointments?: Array<{ id: string; patientName: string; patientId?: string | null; reason?: string | null; allocatedTime?: string | null; allocatedDate?: string | null; status?: string }> }) => {
        const list = data.appointments ?? [];
        const waiting: WaitingAppointment[] = list
          .filter((a) => a.status === "scheduled" && (a.allocatedDate === today || !a.allocatedDate))
          .map((a) => ({
            id: a.id,
            patientName: a.patientName,
            patientId: a.patientId ?? null,
            reason: a.reason ?? null,
            allocatedTime: a.allocatedTime ?? null,
            allocatedDate: a.allocatedDate ?? null,
          }))
          .sort((a, b) => (a.allocatedTime || "").localeCompare(b.allocatedTime || ""));
        setWaitingAppointments(waiting);
      })
      .catch(() => setWaitingAppointments([]))
      .finally(() => setLoading(false));
  }, [today]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Doctor dashboard</h1>
        <p className="text-sm text-slate-500">{today}</p>
      </div>

      {/* Waiting appointments of the day */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Waiting appointments today</h2>
          <Link
            href="/dashboard/appointments"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : waitingAppointments.length === 0 ? (
          <p className="text-sm text-slate-500">No scheduled appointments for today.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {waitingAppointments.map((apt) => (
              <li key={apt.id} className="py-3 first:pt-0 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-800">{apt.patientName}</p>
                  <p className="text-sm text-slate-500">{apt.reason || "—"}</p>
                  {apt.patientId && (
                    <p className="text-xs text-slate-400 mt-0.5">ID: {apt.patientId}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-sm font-medium">
                    {apt.allocatedTime || "—"}
                  </span>
                  <Link
                    href="/dashboard/medical-clerking"
                    className="block text-xs text-blue-600 hover:text-blue-700 mt-1"
                  >
                    Open clerking
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Meetings */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Meetings today</h2>
        <ul className="space-y-3">
          {MOCK_MEETINGS_TODAY.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span className="shrink-0 w-14 text-sm font-medium text-slate-700">{m.time}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800">{m.title}</p>
                <p className="text-sm text-slate-500">{m.location}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400 capitalize">{m.type.replace("_", " ")}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Operations */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Operations today</h2>
        <ul className="space-y-3">
          {MOCK_OPERATIONS_TODAY.map((op) => (
            <li
              key={op.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span className="shrink-0 w-14 text-sm font-medium text-slate-700">{op.time}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800">{op.procedure}</p>
                <p className="text-sm text-slate-600">{op.patientName}</p>
                <p className="text-xs text-slate-500">{op.theatre}</p>
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
                  op.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : op.status === "in_progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {op.status.replace("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
