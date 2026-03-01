"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth, getStoredAppointments, setStoredAppointments, getStoredPrescriptions, setStoredPrescriptions } from "@/helpers/local-storage";
import { v4 as uuidv4 } from "uuid";
import { canCreate, canRead, canUpdate, canDelete } from "@/helpers/module-permissions";
import Link from "next/link";

type AppointmentStatus = "pending_payment" | "paid" | "scheduled" | "in_progress" | "completed";

const STATUS_ORDER: AppointmentStatus[] = ["completed", "in_progress", "scheduled", "paid", "pending_payment"];
function sortAppointmentsFinishedToUnfinished(list: AppointmentRecord[]): AppointmentRecord[] {
  return [...list].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
}

interface AppointmentRecord {
  id: string;
  patientName: string;
  patientId: string | null;
  phone: string | null;
  reason: string | null;
  preferredDoctor: string | null;
  status: AppointmentStatus;
  appointmentFee: number;
  paidAt: string | null;
  allocatedDoctor: string | null;
  allocatedDate: string | null;
  allocatedTime: string | null;
  bookedBy: string;
  createdAt: string;
}

const DOCTORS = ["Dr. Nazar Becks", "Dr. John Darwin", "Dr. Alex Hales"];
const DEFAULT_FEE = 50000;

export default function AppointmentsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string; name: string } | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AppointmentStatus | "">("");
  const [showBookForm, setShowBookForm] = useState(false);
  const [allocatingId, setAllocatingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [prescriptionsForPatients, setPrescriptionsForPatients] = useState<Array<{
    id: string;
    patientName: string;
    patientId: string | null;
    medication: string;
    dosage: string | null;
    instructions: string | null;
    status: string;
    prescribedBy: string;
  }>>([]);

  const [form, setForm] = useState({
    patientName: "",
    patientId: "",
    phone: "",
    reason: "",
    preferredDoctor: "",
    appointmentFee: DEFAULT_FEE,
  });
  const [allocateForm, setAllocateForm] = useState({
    allocatedDoctor: "",
    allocatedDate: "",
    allocatedTime: "",
  });

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    const role = a.role;
    const allowed = ["admin", "doctor", "receptionist", "nurse", "accountant"];
    if (!allowed.includes(role)) {
      router.replace("/dashboard");
      return;
    }
    setAuth({ role, name: a.name });
  }, [router]);

  useEffect(() => {
    if (!auth) return;
    const stored = getStoredAppointments() as AppointmentRecord[];
    if (stored.length > 0) {
      const list = filter ? stored.filter((a) => a.status === filter) : stored;
      setAppointments(sortAppointmentsFinishedToUnfinished(list));
      setLoading(false);
      return;
    }
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((data) => {
        const fetched = (data.appointments ?? []) as AppointmentRecord[];
        if (fetched.length) setStoredAppointments(fetched);
        return fetched;
      })
      .catch(() => [])
      .then((fetched: AppointmentRecord[]) => {
        const list = filter ? fetched.filter((a) => a.status === filter) : fetched;
        setAppointments(sortAppointmentsFinishedToUnfinished(list));
      })
      .finally(() => setLoading(false));
  }, [auth, filter]);

  useEffect(() => {
    if (appointments.length === 0) {
      setPrescriptionsForPatients([]);
      return;
    }
    let stored = getStoredPrescriptions() as Array<{ patientName?: string; patientId?: string | null }>;
    if (stored.length === 0) {
      const names = [...new Set(appointments.map((a) => a.patientName).filter(Boolean))];
      const ids = [...new Set(appointments.map((a) => a.patientId).filter((id): id is string => id != null))];
      const params = new URLSearchParams();
      if (names.length) params.set("patient_names", names.join(","));
      if (ids.length) params.set("patient_ids", ids.join(","));
      if (names.length > 0 || ids.length > 0) {
        fetch(`/api/prescriptions?${params}`)
          .then((r) => r.json())
          .then((data) => {
            const list = (data.prescriptions ?? []) as typeof prescriptionsForPatients;
            setStoredPrescriptions(list);
            setPrescriptionsForPatients(list);
          })
          .catch(() => {});
      }
      return;
    }
    const names = new Set(appointments.map((a) => a.patientName).filter(Boolean));
    const ids = new Set(appointments.map((a) => a.patientId).filter((id): id is string => id != null));
    const filtered = stored.filter(
      (p) => (p.patientName && names.has(p.patientName)) || (p.patientId && ids.has(p.patientId))
    );
    setPrescriptionsForPatients(filtered as typeof prescriptionsForPatients);
  }, [appointments]);

  const refetch = () => {
    let list = getStoredAppointments() as AppointmentRecord[];
    if (filter) list = list.filter((a) => a.status === filter);
    setAppointments(sortAppointmentsFinishedToUnfinished(list));
  };

  const handleStart = (id: string) => {
    setMessage(null);
    const all = getStoredAppointments() as AppointmentRecord[];
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) {
      setMessage({ type: "error", text: "Appointment not found" });
      return;
    }
    if (all[idx].status !== "scheduled") {
      setMessage({ type: "error", text: "Only scheduled appointments can be started" });
      return;
    }
    all[idx] = { ...all[idx], status: "in_progress" };
    setStoredAppointments(all);
    refetch();
    setMessage({ type: "success", text: "Appointment started." });
  };

  const handleFinish = (id: string) => {
    setMessage(null);
    const all = getStoredAppointments() as AppointmentRecord[];
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) {
      setMessage({ type: "error", text: "Appointment not found" });
      return;
    }
    if (all[idx].status !== "in_progress") {
      setMessage({ type: "error", text: "Only in-progress appointments can be finished" });
      return;
    }
    all[idx] = { ...all[idx], status: "completed" };
    setStoredAppointments(all);
    refetch();
    setMessage({ type: "success", text: "Appointment marked completed." });
  };

  const canBook = auth && canCreate(auth.role, "appointments");
  const canMarkPaid = auth && canUpdate(auth.role, "appointments"); // accountant records payment
  const canAllocate = auth && canUpdate(auth.role, "appointments"); // receptionist allocates
  const canViewList = auth && canRead(auth.role, "appointments");
  const canDeleteApt = auth && canDelete(auth.role, "appointments");

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const all = getStoredAppointments() as AppointmentRecord[];
    const now = new Date().toISOString();
    const newApt: AppointmentRecord = {
      id: uuidv4(),
      patientName: form.patientName.trim(),
      patientId: form.patientId.trim() || null,
      phone: form.phone.trim() || null,
      reason: form.reason.trim() || null,
      preferredDoctor: form.preferredDoctor.trim() || null,
      status: "pending_payment",
      appointmentFee: form.appointmentFee,
      paidAt: null,
      allocatedDoctor: null,
      allocatedDate: null,
      allocatedTime: null,
      bookedBy: auth?.role ?? "receptionist",
      createdAt: now,
    };
    const next = [newApt, ...all];
    setStoredAppointments(next);
    setMessage({ type: "success", text: "Appointment booked. Patient must pay the fee at the accountant." });
    setForm({ patientName: "", patientId: "", phone: "", reason: "", preferredDoctor: "", appointmentFee: DEFAULT_FEE });
    setShowBookForm(false);
    refetch();
  };

  const handleMarkPaid = (id: string) => {
    setPayingId(id);
    setMessage(null);
    const all = getStoredAppointments() as AppointmentRecord[];
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) {
      setMessage({ type: "error", text: "Appointment not found" });
      setPayingId(null);
      return;
    }
    if (all[idx].status !== "pending_payment") {
      setMessage({ type: "error", text: "Appointment is not pending payment" });
      setPayingId(null);
      return;
    }
    all[idx] = { ...all[idx], status: "paid", paidAt: new Date().toISOString() };
    setStoredAppointments(all);
    setMessage({ type: "success", text: "Payment recorded. Receptionist can now allocate date & doctor." });
    refetch();
    setPayingId(null);
  };

  const handleAllocate = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    setMessage(null);
    const all = getStoredAppointments() as AppointmentRecord[];
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) {
      setMessage({ type: "error", text: "Appointment not found" });
      setAllocatingId(null);
      return;
    }
    if (all[idx].status !== "paid") {
      setMessage({ type: "error", text: "Appointment must be paid before allocating date" });
      setAllocatingId(null);
      return;
    }
    if (!allocateForm.allocatedDate || !allocateForm.allocatedTime) {
      setMessage({ type: "error", text: "Date and time are required" });
      return;
    }
    all[idx] = {
      ...all[idx],
      status: "scheduled",
      allocatedDoctor: allocateForm.allocatedDoctor || all[idx].preferredDoctor,
      allocatedDate: allocateForm.allocatedDate,
      allocatedTime: allocateForm.allocatedTime,
    };
    setStoredAppointments(all);
    setMessage({ type: "success", text: "Date and doctor allocated. Patient is scheduled." });
    setAllocatingId(null);
    setAllocateForm({ allocatedDoctor: "", allocatedDate: "", allocatedTime: "" });
    refetch();
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  const pendingPayment = appointments.filter((a) => a.status === "pending_payment");
  const paid = appointments.filter((a) => a.status === "paid");
  const scheduled = appointments.filter((a) => a.status === "scheduled");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Appointments</h1>
            <p className="text-sm text-slate-500 mt-1">
              End-to-end flow: Book (reception/nurse) → Pay fee (accountant) → Allocate date & doctor (reception/nurse).
            </p>
          </div>
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        {/* Book appointment (receptionist / nurse) */}
        {canBook && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Step 1: Book appointment</h2>
              <button
                type="button"
                onClick={() => setShowBookForm((s) => !s)}
                className="text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showBookForm ? "Cancel" : "Book appointment"}
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              When a patient calls or meets a nurse/receptionist, capture details and create an appointment. Status: <strong>Pending payment</strong>.
            </p>
            {showBookForm && (
              <form onSubmit={handleBook} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient name *</label>
                  <input
                    type="text"
                    required
                    value={form.patientName}
                    onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID (optional)</label>
                  <input
                    type="text"
                    value={form.patientId}
                    onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    placeholder="OPD number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    placeholder="+256..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason / complaint</label>
                  <input
                    type="text"
                    value={form.reason}
                    onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    placeholder="e.g. General check-up"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preferred doctor (optional)</label>
                  <select
                    value={form.preferredDoctor}
                    onChange={(e) => setForm((f) => ({ ...f, preferredDoctor: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <option value="">Select...</option>
                    {DOCTORS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Appointment fee (UGX)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.appointmentFee}
                    onChange={(e) => setForm((f) => ({ ...f, appointmentFee: Number(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save appointment (pending payment)
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Accountant: Mark as paid */}
        {canMarkPaid && pendingPayment.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-800 mb-2">Step 2: Record payment (accountant)</h2>
            <p className="text-sm text-slate-500 mb-4">
              Patient pays the appointment fee at the accountant. Mark as paid to allow date allocation.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Patient</th>
                    <th className="pb-3 pr-4">Reason</th>
                    <th className="pb-3 pr-4">Fee (UGX)</th>
                    <th className="pb-3 w-32">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayment.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-800">{a.patientName}</td>
                      <td className="py-3 pr-4 text-slate-600">{a.reason ?? "—"}</td>
                      <td className="py-3 pr-4 text-slate-600">{a.appointmentFee.toLocaleString()}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          disabled={payingId === a.id}
                          onClick={() => handleMarkPaid(a.id)}
                          className="text-sm px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {payingId === a.id ? "..." : "Mark as paid"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Allocate date & doctor (receptionist / nurse) */}
        {canAllocate && paid.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-800 mb-2">Step 3: Allocate date & doctor</h2>
            <p className="text-sm text-slate-500 mb-4">
              After payment, allocate a date and doctor so the patient knows when to come.
            </p>
            <div className="space-y-4">
              {paid.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-medium text-slate-800">{a.patientName}</p>
                    <p className="text-xs text-slate-500">Fee paid · {a.preferredDoctor ? `Preferred: ${a.preferredDoctor}` : "No preference"}</p>
                  </div>
                  {allocatingId === a.id ? (
                    <form
                      onSubmit={(e) => handleAllocate(e, a.id)}
                      className="flex flex-wrap items-end gap-3"
                    >
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Doctor</label>
                        <select
                          value={allocateForm.allocatedDoctor}
                          onChange={(e) => setAllocateForm((f) => ({ ...f, allocatedDoctor: e.target.value }))}
                          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">Select...</option>
                          {DOCTORS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Date</label>
                        <input
                          type="date"
                          required
                          value={allocateForm.allocatedDate}
                          onChange={(e) => setAllocateForm((f) => ({ ...f, allocatedDate: e.target.value }))}
                          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Time</label>
                        <input
                          type="time"
                          required
                          value={allocateForm.allocatedTime}
                          onChange={(e) => setAllocateForm((f) => ({ ...f, allocatedTime: e.target.value }))}
                          className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                      <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        Allocate
                      </button>
                      <button type="button" onClick={() => setAllocatingId(null)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAllocatingId(a.id);
                        setAllocateForm({
                          allocatedDoctor: a.preferredDoctor ?? "",
                          allocatedDate: "",
                          allocatedTime: "",
                        });
                      }}
                      className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Allocate date & doctor
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All appointments list */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">All appointments</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilter("")}
                className={`text-sm px-3 py-1.5 rounded-lg ${filter === "" ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-600"}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("pending_payment")}
                className={`text-sm px-3 py-1.5 rounded-lg ${filter === "pending_payment" ? "bg-amber-200 text-amber-900" : "bg-slate-100 text-slate-600"}`}
              >
                Pending payment
              </button>
              <button
                type="button"
                onClick={() => setFilter("paid")}
                className={`text-sm px-3 py-1.5 rounded-lg ${filter === "paid" ? "bg-blue-200 text-blue-900" : "bg-slate-100 text-slate-600"}`}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => setFilter("scheduled")}
                className={`text-sm px-3 py-1.5 rounded-lg ${filter === "scheduled" ? "bg-emerald-200 text-emerald-900" : "bg-slate-100 text-slate-600"}`}
              >
                Scheduled
              </button>
              <button
                type="button"
                onClick={() => setFilter("in_progress")}
                className={`text-sm px-3 py-1.5 rounded-lg ${filter === "in_progress" ? "bg-blue-200 text-blue-900" : "bg-slate-100 text-slate-600"}`}
              >
                In progress
              </button>
              <button
                type="button"
                onClick={() => setFilter("completed")}
                className={`text-sm px-3 py-1.5 rounded-lg ${filter === "completed" ? "bg-slate-300 text-slate-900" : "bg-slate-100 text-slate-600"}`}
              >
                Completed
              </button>
            </div>
          </div>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : appointments.length === 0 ? (
            <p className="text-slate-500 text-sm">No appointments.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Patient</th>
                    <th className="pb-3 pr-4">Reason</th>
                    <th className="pb-3 pr-4">Fee</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Doctor / Date</th>
                    <th className="pb-3 pr-4">Booked by</th>
                    {(canAllocate || auth?.role === "doctor") && <th className="pb-3 pr-4 w-28">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-800">{a.patientName}</p>
                        {a.patientId && <p className="text-xs text-slate-500">{a.patientId}</p>}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{a.reason ?? "—"}</td>
                      <td className="py-3 pr-4 text-slate-600">{a.appointmentFee.toLocaleString()} UGX</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                            a.status === "completed"
                              ? "bg-slate-200 text-slate-800"
                              : a.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : a.status === "scheduled"
                              ? "bg-emerald-50 text-emerald-800"
                              : a.status === "paid"
                              ? "bg-blue-50 text-blue-800"
                              : "bg-amber-50 text-amber-800"
                          }`}
                        >
                          {a.status === "pending_payment"
                            ? "Pending payment"
                            : a.status === "paid"
                            ? "Paid"
                            : a.status === "scheduled"
                            ? "Scheduled"
                            : a.status === "in_progress"
                            ? "In progress"
                            : "Completed"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {(a.status === "scheduled" || a.status === "in_progress" || a.status === "completed") && a.allocatedDate && a.allocatedTime ? (
                          <span>{a.allocatedDoctor ?? "—"} · {a.allocatedDate} {a.allocatedTime}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{a.bookedBy}</td>
                      {(canAllocate || auth?.role === "doctor") && (
                        <td className="py-3 pr-4">
                          {a.status === "scheduled" && (
                            <button
                              type="button"
                              onClick={() => handleStart(a.id)}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                              Start
                            </button>
                          )}
                          {a.status === "in_progress" && (
                            <button
                              type="button"
                              onClick={() => handleFinish(a.id)}
                              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                            >
                              Finish
                            </button>
                          )}
                          {a.status !== "scheduled" && a.status !== "in_progress" && "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Prescriptions for appointment patients */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 mt-6">
          <h2 className="font-semibold text-slate-800 mb-4">Prescriptions for appointment patients</h2>
          {prescriptionsForPatients.length === 0 ? (
            <p className="text-slate-500 text-sm">No prescriptions for the patients in the current list.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Patient</th>
                    <th className="pb-3 pr-4">Medication</th>
                    <th className="pb-3 pr-4">Dosage</th>
                    <th className="pb-3 pr-4">Instructions</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Prescribed by</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptionsForPatients.map((rx) => (
                    <tr key={rx.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-800">{rx.patientName}</p>
                        {rx.patientId && <p className="text-xs text-slate-500">{rx.patientId}</p>}
                      </td>
                      <td className="py-3 pr-4 text-slate-700">{rx.medication}</td>
                      <td className="py-3 pr-4 text-slate-600">{rx.dosage ?? "—"}</td>
                      <td className="py-3 pr-4 text-slate-600 max-w-xs truncate" title={rx.instructions ?? ""}>{rx.instructions ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${rx.status === "dispensed" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                          {rx.status === "dispensed" ? "Dispensed" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{rx.prescribedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
