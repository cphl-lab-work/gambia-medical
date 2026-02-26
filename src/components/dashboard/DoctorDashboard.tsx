"use client";

import { useEffect, useState } from "react";
import { MetricCard, DonutChart, BarChart } from "./DashboardCharts";

interface DoctorDashboardData {
  overview: {
    todaysAppointments: number;
    activePatients: number;
    pendingReports: number;
    prescriptionsIssuedToday: number;
    urgentAlerts: number;
  };
  todaysAppointmentsPreview: Array<{ id: string; time: string; patientName: string; reason: string; status: "Waiting" | "In Consultation" | "Completed" }>;
  patients: {
    total: number;
    byStatus: Array<{ label: string; value: number; color: string }>;
  };
  prescriptions: {
    total: number;
    byStatus: Array<{ role: string; count: number }>;
  };
  todaySchedule: Array<{
    id: string;
    patientName: string;
    time: string;
    reason: string;
    status: "Waiting" | "In Consultation" | "Completed";
  }>;
  pendingTasks: Array<{ id: string; label: string; meta?: string; priority: "High" | "Medium" | "Low" }>;
  patientAlerts: Array<{ id: string; label: string; meta?: string; severity: "Critical" | "Warning" | "Info" }>;
}

const FALLBACK: DoctorDashboardData = {
  overview: {
    todaysAppointments: 12,
    activePatients: 248,
    pendingReports: 7,
    prescriptionsIssuedToday: 5,
    urgentAlerts: 2,
  },
  todaysAppointmentsPreview: [
    { id: "tp1", time: "09:00", patientName: "James Okello", reason: "Follow-up", status: "Completed" },
    { id: "tp2", time: "10:00", patientName: "Mary Akinyi", reason: "Consultation", status: "In Consultation" },
    { id: "tp3", time: "10:30", patientName: "Peter Ochieng", reason: "Check-up", status: "Waiting" },
  ],
  patients: {
    total: 3550,
    byStatus: [
      { label: "Admitted", value: 1340, color: "#0ea5e9" },
      { label: "Discharged", value: 1550, color: "#1e40af" },
      { label: "Transferred", value: 85, color: "#38bdf8" },
      { label: "Followup", value: 4880, color: "#2563eb" },
    ],
  },
  prescriptions: {
    total: 265,
    byStatus: [
      { role: "New", count: 78 },
      { role: "Pending", count: 46 },
      { role: "Dispensed", count: 121 },
      { role: "Refill", count: 14 },
      { role: "Cancelled", count: 6 },
    ],
  },
  todaySchedule: [
    { id: "s1", time: "09:00", patientName: "James Okello", reason: "Follow-up", status: "Completed" },
    { id: "s2", time: "09:30", patientName: "Mary Akinyi", reason: "New consultation", status: "Completed" },
    { id: "s3", time: "10:00", patientName: "Peter Ochieng", reason: "Breathing difficulties", status: "In Consultation" },
    { id: "s4", time: "10:30", patientName: "Grace Wambui", reason: "Diabetes follow-up", status: "Waiting" },
    { id: "s5", time: "11:00", patientName: "John Kamau", reason: "Hypertension review", status: "Waiting" },
    { id: "s6", time: "11:30", patientName: "Lucy Muthoni", reason: "General check-up", status: "Waiting" },
  ],
  pendingTasks: [
    { id: "t1", label: "Review lab results", meta: "3 results pending", priority: "High" },
    { id: "t2", label: "Follow-ups due", meta: "2 patients today", priority: "Medium" },
    { id: "t3", label: "Referral requests", meta: "1 new request", priority: "Low" },
    { id: "t4", label: "Prescription approvals", meta: "2 pending", priority: "Medium" },
  ],
  patientAlerts: [
    { id: "a1", label: "Critical lab value", meta: "K+ high · Mary Akinyi", severity: "Critical" },
    { id: "a2", label: "Allergy alert", meta: "Penicillin · James Okello", severity: "Warning" },
    { id: "a3", label: "Missed follow-up", meta: "Grace Wambui", severity: "Info" },
  ],
};

function Pill({ text, tone }: { text: string; tone: "slate" | "blue" | "emerald" | "amber" | "red" }) {
  const cls =
    tone === "emerald"
      ? "bg-emerald-100 text-emerald-800"
      : tone === "blue"
        ? "bg-blue-100 text-blue-800"
        : tone === "amber"
          ? "bg-amber-100 text-amber-800"
          : tone === "red"
            ? "bg-red-100 text-red-800"
            : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{text}</span>;
}

export default function DoctorDashboard(_props?: { role?: string | null }) {
  const [data, setData] = useState<DoctorDashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/doctor")
      .then((r) => r.json())
      .then((api) => setData({ ...FALLBACK, ...api }))
      .catch(() => setData(FALLBACK));
  }, []);

  const d = data ?? FALLBACK;
  const prescriptions = d.prescriptions ?? FALLBACK.prescriptions;
  const overview = d.overview ?? FALLBACK.overview;
  const todaysAppointmentsPreview = d.todaysAppointmentsPreview ?? FALLBACK.todaysAppointmentsPreview;
  const todaySchedule = d.todaySchedule ?? FALLBACK.todaySchedule;
  const pendingTasks = d.pendingTasks ?? FALLBACK.pendingTasks;
  const patientAlerts = d.patientAlerts ?? FALLBACK.patientAlerts;
  const { patients } = d;
  const maxPrescriptionBar = Math.max(...prescriptions.byStatus.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Doctor Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Today’s schedule, patients, tasks, and alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700">
            <option>Today</option>
            <option>This week</option>
          </select>
          <button type="button" className="text-sm border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-slate-50">
            <span>↓</span> Export
          </button>
        </div>
      </div>

      {/* 1) Overview / summary cards */} 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Today’s Appointments" value={overview.todaysAppointments} change={0} icon={<span className="text-lg">📅</span>} />
        <MetricCard title="Total Active Patients" value={overview.activePatients.toLocaleString()} change={0} icon={<span className="text-lg">👨‍⚕️</span>} />
        <MetricCard title="Pending Reports/Lab Results" value={overview.pendingReports} change={0} icon={<span className="text-lg">🧾</span>} />
        <MetricCard title="Prescriptions Issued Today" value={overview.prescriptionsIssuedToday} change={0} icon={<span className="text-lg">💊</span>} />
        <MetricCard title="Urgent Cases / Alerts" value={overview.urgentAlerts} change={0} icon={<span className="text-lg">🚨</span>} />
      </div>

      {/* Quick view for Today’s appointments */} 
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Today’s appointments (quick view)</h2>
          <Pill text={`${overview.todaysAppointments} total`} tone="slate" />
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {todaysAppointmentsPreview.map((a) => (
            <li key={a.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800 tabular-nums">{a.time}</span>
                <Pill
                  text={a.status}
                  tone={a.status === "Completed" ? "emerald" : a.status === "In Consultation" ? "blue" : "amber"}
                />
              </div>
              <p className="text-sm font-medium text-slate-800 mt-1 truncate">{a.patientName}</p>
              <p className="text-xs text-slate-600 truncate">{a.reason}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Keep the two charts */} 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow overflow-hidden min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-800">Patients by status</h2>
            <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">⋯</button>
          </div>
          <p className="text-sm text-slate-500 mb-6">Total: <span className="font-semibold text-slate-700">{patients.total.toLocaleString()}</span> patients</p>
          <div className="min-w-0 overflow-hidden">
            <DonutChart total={patients.total} segments={patients.byStatus} size={200} stroke={28} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Preescriptions</h2>
            <button type="button" className="text-slate-400 hover:text-slate-600">⋯</button>
          </div>
          <p className="text-2xl font-semibold text-slate-800 mb-4">{prescriptions.total.toLocaleString()}</p>
          <BarChart items={prescriptions.byStatus} max={maxPrescriptionBar} barColor="bg-blue-600" />
        </div>
      </div>

      {/* Middle: schedule left, tasks/alerts right */} 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2) Today’s Schedule */} 
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Today’s Schedule</h2>
            <p className="text-sm text-slate-500 mt-0.5">Time, patient, reason, and status with quick actions.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Patient</th>
                  <th className="pb-3 pr-4">Reason</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todaySchedule.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="py-3 pr-4 font-medium text-slate-800 tabular-nums">{row.time}</td>
                    <td className="py-3 pr-4 font-medium text-slate-800">{row.patientName}</td>
                    <td className="py-3 pr-4 text-slate-600">{row.reason}</td>
                    <td className="py-3 pr-4">
                      <Pill
                        text={row.status}
                        tone={row.status === "Completed" ? "emerald" : row.status === "In Consultation" ? "blue" : "amber"}
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="text-xs font-medium rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-50">
                          Open Patient File
                        </button>
                        <button type="button" className="text-xs font-medium rounded-md bg-blue-600 text-white px-2 py-1 hover:bg-blue-700">
                          Start Consultation
                        </button>
                        <button type="button" className="text-xs font-medium rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-50">
                          Reschedule
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4) Pending Tasks + 5) Patient Alerts */} 
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">Pending Tasks</h2>
            </div>
            <ul className="p-4 space-y-2">
              {pendingTasks.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{t.label}</p>
                    {t.meta && <p className="text-xs text-slate-500 mt-0.5">{t.meta}</p>}
                  </div>
                  <Pill text={t.priority} tone={t.priority === "High" ? "red" : t.priority === "Medium" ? "amber" : "slate"} />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">Patient Alerts</h2>
            </div>
            <ul className="p-4 space-y-2">
              {patientAlerts.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{a.label}</p>
                    {a.meta && <p className="text-xs text-slate-500 mt-0.5">{a.meta}</p>}
                  </div>
                  <Pill text={a.severity} tone={a.severity === "Critical" ? "red" : a.severity === "Warning" ? "amber" : "slate"} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
