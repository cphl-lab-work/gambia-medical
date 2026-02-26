"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  metrics: {
    totalPatients: number;
    totalPatientsChange: number;
    totalDoctors: number;
    totalDoctorsChange: number;
    appointments: number;
    appointmentsChange: number;
    totalEarnings: number;
    totalEarningsChange: number;
  };
  patients: {
    total: number;
    byStatus: Array<{ label: string; value: number; color: string }>;
  };
  employees: {
    total: number;
    byRole: Array<{ role: string; count: number }>;
  };
  topDoctors: Array<{ id: string; name: string; department: string; status: string }>;
  newPatients: Array<{ id: string; name: string; department: string; status: string }>;
}

const FALLBACK: DashboardData = {
  metrics: {
    totalPatients: 3550,
    totalPatientsChange: 150,
    totalDoctors: 100,
    totalDoctorsChange: 20,
    appointments: 1079,
    appointmentsChange: -5,
    totalEarnings: 55000,
    totalEarningsChange: 220,
  },
  patients: {
    total: 3550,
    byStatus: [
      { label: "Admitted", value: 1340, color: "#0ea5e9" },
      { label: "Discharged", value: 1550, color: "#1e40af" },
      { label: "Transferred", value: 85, color: "#38bdf8" },
      { label: "Followup", value: 4880, color: "#2563eb" },
    ],
  },
  employees: {
    total: 55000,
    byRole: [
      { role: "Doctors", count: 600 },
      { role: "Nurses", count: 500 },
      { role: "Volunteers", count: 1600 },
      { role: "Pharmacists", count: 1300 },
      { role: "Dietitians", count: 500 },
      { role: "Others", count: 100 },
    ],
  },
  topDoctors: [
    { id: "1", name: "Nazar Becks", department: "Gynecologist", status: "Active" },
    { id: "2", name: "John Darwin", department: "Radiologist & ECG", status: "Active" },
    { id: "3", name: "Alex Hales", department: "General Physician", status: "InActive" },
  ],
  newPatients: [
    { id: "1", name: "Sarah", department: "Gynecologist", status: "Active" },
    { id: "2", name: "Merina Farah", department: "Radiologist & ECG", status: "Active" },
    { id: "3", name: "John Doe", department: "General Physician", status: "InActive" },
  ],
};

function MetricCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}) {
  const isPositive = change >= 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
          <p className={`text-xs mt-1 ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
            {isPositive ? "+" : ""}{change}% vs past month
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DonutChart({ total, segments }: { total: number; segments: Array<{ label: string; value: number; color: string }> }) {
  const sum = segments.reduce((s, x) => s + x.value, 0) || 1;
  const gap = 0.8; // gap % between segments
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
        `${p.color} ${p.start}%, ${p.color} ${p.start + p.pct}%, transparent ${p.start + p.pct}%, transparent ${p.start + p.pct + gap}%`
    )
    .join(", ");
  const size = 200;
  const stroke = 28;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 min-w-0 overflow-hidden">
      <div className="relative shrink-0 max-w-full" style={{ width: size, height: size, minWidth: 0 }}>
        <div
          className="rounded-full ring-2 ring-white shadow-md"
          style={{
            width: size,
            height: size,
            maxWidth: "100%",
            maxHeight: "100%",
            background: `conic-gradient(from 0deg, ${conic})`,
          }}
        />
        <div
          className="absolute flex flex-col items-center justify-center rounded-full bg-white shadow-inner"
          style={{ inset: stroke, width: size - stroke * 2, height: size - stroke * 2 }}
        >
          <span className="text-xl font-bold text-slate-800 tabular-nums">{total.toLocaleString()}</span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Total</span>
        </div>
      </div>
      <div className="flex-1 w-full min-w-0 grid grid-cols-2 gap-2 overflow-hidden">
        {segments.map((s) => {
          const pct = ((s.value / sum) * 100).toFixed(1);
          return (
            <div
              key={s.label}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/80 hover:bg-slate-100/80 transition-colors min-w-0"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white"
                style={{ backgroundColor: s.color }}
              />
              <div className="min-w-0 overflow-hidden">
                <p className="font-medium text-slate-800 text-xs truncate">{s.label}</p>
                <p className="text-xs text-slate-500 truncate">
                  <span className="font-semibold text-slate-700 tabular-nums">{s.value.toLocaleString()}</span>
                  <span className="mx-0.5">·</span>
                  <span className="tabular-nums">{pct}%</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BarChart({ items, max }: { items: Array<{ role: string; count: number }>; max?: number }) {
  const m = max ?? Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.role} className="flex items-center gap-3">
          <span className="w-24 text-sm text-slate-600 shrink-0">{item.role}</span>
          <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded"
              style={{ width: `${(item.count / m) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-800 w-12">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function TableRow({
  name,
  department,
  status,
}: {
  name: string;
  department: string;
  status: string;
}) {
  const isActive = status === "Active";
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium">
            {name.charAt(0)}
          </div>
          <span className="text-sm font-medium text-slate-800">{name}</span>
        </div>
      </td>
      <td className="py-3 text-sm text-slate-600">{department}</td>
      <td className="py-3">
        <span className={`inline-flex items-center gap-1 text-sm ${isActive ? "text-blue-600" : "text-pink-600"}`}>
          <span className={`w-2 h-2 rounded-full ${isActive ? "bg-blue-500" : "bg-pink-500"}`} />
          {status}
        </span>
      </td>
      <td className="py-3 text-slate-400">
        <button type="button" className="p-1 hover:text-slate-600">✎</button>
        <button type="button" className="p-1 hover:text-red-600">🗑</button>
      </td>
    </tr>
  );
}

export default function DoctorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(FALLBACK));
  }, []);

  const d = data ?? FALLBACK;
  const { metrics, patients, employees, topDoctors, newPatients } = d;
  const maxBar = Math.max(...employees.byRole.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Dashboard Overview</h1>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700">
            <option>Last Week</option>
          </select>
          <button type="button" className="text-sm border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-slate-50">
            <span>↓</span> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Patients"
          value={metrics.totalPatients.toLocaleString()}
          change={metrics.totalPatientsChange}
          icon={<span className="text-lg">👤</span>}
        />
        <MetricCard
          title="Total Doctors"
          value={metrics.totalDoctors}
          change={metrics.totalDoctorsChange}
          icon={<span className="text-lg">👤</span>}
        />
        <MetricCard
          title="Appointments"
          value={metrics.appointments.toLocaleString()}
          change={metrics.appointmentsChange}
          icon={<span className="text-lg">📅</span>}
        />
        <MetricCard
          title="Total Earnings"
          value={`$${metrics.totalEarnings.toLocaleString()}`}
          change={metrics.totalEarningsChange}
          icon={<span className="text-lg">$</span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow overflow-hidden min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-800">Patients by status</h2>
            <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">⋯</button>
          </div>
          <p className="text-sm text-slate-500 mb-6">Total: <span className="font-semibold text-slate-700">{patients.total.toLocaleString()}</span> patients</p>
          <div className="min-w-0 overflow-hidden">
            <DonutChart total={patients.total} segments={patients.byStatus} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Employees</h2>
            <button type="button" className="text-slate-400 hover:text-slate-600">⋯</button>
          </div>
          <p className="text-2xl font-semibold text-slate-800 mb-4">{employees.total.toLocaleString()}</p>
          <BarChart items={employees.byRole} max={maxBar} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Top Doctors</h2>
            <button type="button" className="text-slate-400 hover:text-slate-600">⋯</button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider">
                <th className="pb-2">Doctors ↓</th>
                <th className="pb-2">Department ↓</th>
                <th className="pb-2">Status ↓</th>
                <th className="pb-2 w-16" />
              </tr>
            </thead>
            <tbody>
              {topDoctors.map((row) => (
                <TableRow key={row.id} name={row.name} department={row.department} status={row.status} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">New Patients</h2>
            <button type="button" className="text-slate-400 hover:text-slate-600">⋯</button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider">
                <th className="pb-2">Name ↓</th>
                <th className="pb-2">Department ↓</th>
                <th className="pb-2">Status ↓</th>
                <th className="pb-2 w-16" />
              </tr>
            </thead>
            <tbody>
              {newPatients.map((row) => (
                <TableRow key={row.id} name={row.name} department={row.department} status={row.status} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
