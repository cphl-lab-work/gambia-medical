"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import Link from "next/link";

const ARRIVAL_SOURCES = [
  { value: "OPD", label: "OPD (Out-Patient Department)" },
  { value: "Emergency Department", label: "Emergency Department" },
  { value: "Elective Admission", label: "Elective Admission" },
];

const STATUSES = [
  { value: "Pending assessment", label: "Pending assessment" },
  { value: "Assessed", label: "Assessed" },
  { value: "Admitted", label: "Admitted" },
];

const GENDERS = [
  { value: "", label: "Select..." },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

interface ClerkingRecord {
  id: string;
  patientName: string;
  patientId: string | null;
  arrivalSource: string;
  dateOfArrival: string;
  timeOfArrival: string;
  status: string;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  recordedBy: string;
  createdAt: string;
}

const emptyForm = () => ({
  patientName: "",
  patientId: "",
  arrivalSource: "OPD",
  dateOfArrival: new Date().toISOString().slice(0, 10),
  timeOfArrival: new Date().toTimeString().slice(0, 5),
  status: "Pending assessment",
  phone: "",
  gender: "",
  dateOfBirth: "",
});

function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

const SOURCE_COLORS: Record<string, string> = {
  OPD: "#3b82f6",
  "Emergency Department": "#ef4444",
  "Elective Admission": "#10b981",
};

const STATUS_COLORS: Record<string, string> = {
  "Pending assessment": "#f59e0b",
  Assessed: "#3b82f6",
  Admitted: "#10b981",
};

function DonutChart({
  total,
  segments,
  title,
}: {
  total: number;
  segments: Array<{ label: string; value: number; color: string }>;
  title: string;
}) {
  const sum = segments.reduce((s, x) => s + x.value, 0) || 1;
  const gap = 0.8;
  let offset = 0;
  const parts = segments.map((s) => {
    const pct = (s.value / sum) * 100;
    const start = offset;
    offset += pct + gap;
    return { ...s, pct, start };
  });
  const conic = parts
    .map(
      (p) =>
        `${p.color} ${p.start}%, ${p.color} ${p.start + p.pct}%, transparent ${p.start + p.pct}%, transparent ${Math.min(p.start + p.pct + gap, 100)}%`
    )
    .join(", ");
  const size = 140;
  const stroke = 22;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <div
            className="rounded-full ring-2 ring-white shadow"
            style={{
              width: size,
              height: size,
              background: sum > 0 ? `conic-gradient(from 0deg, ${conic})` : "#e2e8f0",
            }}
          />
          <div
            className="absolute flex flex-col items-center justify-center rounded-full bg-white"
            style={{ inset: stroke, width: size - stroke * 2, height: size - stroke * 2 }}
          >
            <span className="text-lg font-bold text-slate-800 tabular-nums">{total}</span>
          </div>
        </div>
        <div className="flex-1 w-full min-w-0 space-y-2">
          {segments.map((s) => {
            const pct = sum > 0 ? ((s.value / sum) * 100).toFixed(1) : "0";
            return (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white" style={{ backgroundColor: s.color }} />
                <span className="text-xs text-slate-600 truncate flex-1">{s.label}</span>
                <span className="text-xs font-medium text-slate-800 tabular-nums">{s.value}</span>
                <span className="text-xs text-slate-500 tabular-nums">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BarChartSection({
  items,
  title,
}: {
  items: Array<{ label: string; value: number }>;
  title: string;
}) {
  const m = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-28 text-xs text-slate-600 shrink-0 truncate" title={item.label}>{item.label}</span>
            <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded transition-all"
                style={{ width: `${(item.value / m) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-700 tabular-nums w-8 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClerkingPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string; name: string } | null>(null);
  const [records, setRecords] = useState<ClerkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClerkingRecord | null>(null);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    const role = a.role;
    if (role !== "receptionist" && role !== "nurse") {
      router.replace("/dashboard");
      return;
    }
    setAuth({ role, name: a.name });
  }, [router]);

  useEffect(() => {
    if (!auth) return;
    fetch("/api/clerking")
      .then((r) => r.json())
      .then((data) => setRecords(data.records ?? []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [auth]);

  const openPanelForNew = () => {
    setEditingRecord(null);
    setForm(emptyForm());
    setMessage(null);
    setPanelOpen(true);
  };

  const openPanelForEdit = (record: ClerkingRecord) => {
    setEditingRecord(record);
    setForm({
      patientName: record.patientName,
      patientId: record.patientId ?? "",
      arrivalSource: record.arrivalSource,
      dateOfArrival: record.dateOfArrival,
      timeOfArrival: record.timeOfArrival,
      status: record.status,
      phone: record.phone ?? "",
      gender: record.gender ?? "",
      dateOfBirth: record.dateOfBirth ?? "",
    });
    setMessage(null);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingRecord(null);
    setForm(emptyForm());
    setMessage(null);
  };

  const handleDelete = async (record: ClerkingRecord) => {
    if (!isUuid(record.id)) return;
    if (!confirm(`Delete clerking record for ${record.patientName}?`)) return;
    try {
      const res = await fetch(`/api/clerking/${record.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Delete failed" });
        return;
      }
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      setMessage({ type: "success", text: "Record deleted." });
    } catch {
      setMessage({ type: "error", text: "Network error." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    const a = getStoredAuth();
    const payload = {
      patientName: form.patientName.trim(),
      patientId: form.patientId.trim() || null,
      arrivalSource: form.arrivalSource,
      dateOfArrival: form.dateOfArrival,
      timeOfArrival: form.timeOfArrival,
      status: form.status,
      phone: form.phone.trim() || null,
      gender: form.gender || null,
      dateOfBirth: form.dateOfBirth || null,
      recordedBy: a?.role ?? "receptionist",
    };

    try {
      if (editingRecord && isUuid(editingRecord.id)) {
        const res = await fetch(`/api/clerking/${editingRecord.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: "error", text: data.error || "Failed to update" });
          return;
        }
        setMessage({ type: "success", text: "Record updated." });
        setRecords((prev) => prev.map((r) => (r.id === data.id ? data : r)));
      } else {
        const res = await fetch("/api/clerking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: "error", text: data.error || "Failed to save" });
          return;
        }
        setMessage({ type: "success", text: "Patient clerking record saved." });
        setForm(emptyForm());
        setRecords((prev) => [data, ...prev]);
      }
      setTimeout(() => {
        closePanel();
      }, 1200);
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  const allowCreate = canCreate(auth.role, "patient_clerking");
  const allowUpdate = canUpdate(auth.role, "patient_clerking");
  const allowDelete = canDelete(auth.role, "patient_clerking");

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Patient Clerking (Admission & Assessment)</h1>
            <p className="text-sm text-slate-500 mt-1">
              Trigger: Patient arrives via OPD, Emergency Department, or Elective Admission.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {allowCreate && (
              <button
                type="button"
                onClick={openPanelForNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                New patient clerking
              </button>
            )}
          </div>
        </div>

        {/* Trigger callout - full text and source badges */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Trigger: Patient arrives via OPD, Emergency Department, or Elective Admission.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> OPD (Out-Patient Department)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Emergency Department
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Elective Admission
            </span>
          </div>
        </div>

        {/* Charts */}
        {!loading && records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DonutChart
              title="Arrivals by source"
              total={records.length}
              segments={ARRIVAL_SOURCES.map(({ value }) => ({
                label: value === "OPD" ? "OPD" : value,
                value: records.filter((r) => r.arrivalSource === value).length,
                color: SOURCE_COLORS[value] ?? "#94a3b8",
              }))}
            />
            <DonutChart
              title="Status breakdown"
              total={records.length}
              segments={STATUSES.map(({ value }) => ({
                label: value,
                value: records.filter((r) => r.status === value).length,
                color: STATUS_COLORS[value] ?? "#94a3b8",
              }))}
            />
            <BarChartSection
              title="Last 7 days"
              items={(() => {
                const days: Array<{ label: string; value: number }> = [];
                for (let i = 6; i >= 0; i--) {
                  const d = new Date();
                  d.setDate(d.getDate() - i);
                  const key = d.toISOString().slice(0, 10);
                  const label = i === 0 ? "Today" : i === 1 ? "Yesterday" : d.toLocaleDateString("en-GB", { weekday: "short" });
                  days.push({
                    label,
                    value: records.filter((r) => r.dateOfArrival === key).length,
                  });
                }
                return days;
              })()}
            />
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Recent clerking records</h2>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : records.length === 0 ? (
            <p className="text-slate-500 text-sm">No records yet. Click &quot;New patient clerking&quot; to add one.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Arrival source</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Time</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">Recorded by</th>
                    <th className="pb-3 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3 pr-4 font-medium text-slate-800">{r.patientName}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.patientId ?? "—"}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.arrivalSource}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.dateOfArrival}</td>
                      <td className="py-3 pr-4 text-slate-600">{r.timeOfArrival}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">{r.status}</span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{r.phone ?? "—"}</td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{r.recordedBy}</td>
                      <td className="py-3">
                        <span className="flex items-center gap-2">
                          {allowUpdate && isUuid(r.id) && (
                            <button type="button" onClick={() => openPanelForEdit(r)} className="text-blue-600 hover:text-blue-700 text-xs font-medium">Edit</button>
                          )}
                          {allowDelete && isUuid(r.id) && (
                            <button type="button" onClick={() => handleDelete(r)} className="text-red-600 hover:text-red-700 text-xs font-medium">Delete</button>
                          )}
                          {!allowUpdate && !allowDelete && <span className="text-slate-400 text-xs">View only</span>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Side panel - covers content area when open */}
        {panelOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={closePanel}
              aria-hidden
            />
            <div
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {editingRecord ? "Edit patient clerking" : "New patient clerking"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Record simple patient details and arrival source.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Patient name *</label>
                      <input
                        type="text"
                        required
                        value={form.patientName}
                        onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID / OPD number</label>
                      <input
                        type="text"
                        value={form.patientId}
                        onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Arrival source *</label>
                    <select
                      required
                      value={form.arrivalSource}
                      onChange={(e) => setForm((f) => ({ ...f, arrivalSource: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {ARRIVAL_SOURCES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Date of arrival *</label>
                      <input
                        type="date"
                        required
                        value={form.dateOfArrival}
                        onChange={(e) => setForm((f) => ({ ...f, dateOfArrival: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Time of arrival *</label>
                      <input
                        type="time"
                        required
                        value={form.timeOfArrival}
                        onChange={(e) => setForm((f) => ({ ...f, timeOfArrival: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                    <select
                      required
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {STATUSES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-sm font-medium text-slate-700 mb-3">Simple patient details (optional)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Gender</label>
                        <select
                          value={form.gender}
                          onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {GENDERS.map((o) => (
                            <option key={o.value || "x"} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 mb-1">Date of birth</label>
                        <input
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {message && (
                    <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                      {message.text}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? "Saving…" : editingRecord ? "Update record" : "Save clerking record"}
                    </button>
                    <button
                      type="button"
                      onClick={closePanel}
                      className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
