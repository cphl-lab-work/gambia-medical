"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MetricCard, DashboardSection } from "./DashboardCharts";

interface AdminDashboardData {
  metrics: {
    totalUsers: number;
    totalUsersChange: number;
    totalPatients: number;
    totalPatientsChange: number;
    totalStaff: number;
    totalStaffChange: number;
    departments: number;
    departmentsChange: number;
  };
  usersByRole: Array<{ label: string; value: number; color: string }>;
  staffByDepartment: Array<{ role: string; count: number }>;
  patientsByGenderOverTime: Array<{ period: string; male: number; female: number }>;
  patientsByAgeRange: Array<{ label: string; value: number; color: string }>;
  patientStatus: { admitted: number; recovered: number; stillSick: number };
  patientStatusOverTime: Array<{ period: string; admitted: number; recovered: number; stillSick: number }>;
  appointmentStats: { scheduled: number; completed: number; cancelled: number };
  appointmentStatsOverTime: Array<{ period: string; scheduled: number; completed: number; cancelled: number }>;
}

type SeriesConfig = { key: string; color: string; label: string };

function RechartsLineChart({
  data,
  series,
  height = 220,
}: {
  data: Array<Record<string, string | number>>;
  series: SeriesConfig[];
  height?: number;
}) {
  if (data.length === 0) return <p className="text-sm text-slate-500 py-4">No data</p>;
  return (
    <div className="min-w-0 w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(value: number | undefined, name: string | undefined) => [
              Number(value ?? 0).toLocaleString(),
              series.find((s) => s.key === (name ?? ""))?.label ?? name ?? "",
            ]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => series.find((s) => s.key === value)?.label ?? value} />
          {series.map(({ key, color, label }) => (
            <Area key={key} type="monotone" dataKey={key} name={label} stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function GroupedBarChart({
  data,
  series,
  height = 220,
}: {
  data: Array<Record<string, string | number>>;
  series: SeriesConfig[];
  height?: number;
}) {
  if (data.length === 0) return <p className="text-sm text-slate-500 py-4">No data</p>;
  return (
    <div className="min-w-0 w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
          barCategoryGap="12%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(value: number | undefined, name: string | undefined) => [
              Number(value ?? 0).toLocaleString(),
              series.find((s) => s.key === (name ?? ""))?.label ?? name ?? "",
            ]}
            labelFormatter={(label) => label}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => series.find((s) => s.key === value)?.label ?? value}
          />
          {series.map(({ key, color, label }) => (
            <Bar key={key} dataKey={key} name={label} fill={color} radius={[4, 4, 0, 0]} />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RechartsDonut({ total, segments, size }: { total: number; segments: Array<{ label: string; value: number; color: string }>; size?: number }) {
  const data = segments.map((s) => ({ name: s.label, value: s.value, color: s.color }));
  if (data.length === 0) return <p className="text-sm text-slate-500 py-4">No data</p>;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 min-w-0 relative">
      <div className="relative shrink-0" style={{ width: size ?? 160, height: size ?? 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="35%"
              outerRadius="48%"
              paddingAngle={1}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number | undefined) => Number(value ?? 0).toLocaleString()} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-slate-800 tabular-nums">{total.toLocaleString()}</span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Total</span>
        </div>
      </div>
      <div className="flex-1 w-full min-w-0 grid grid-cols-2 gap-2">
        {segments.map((s) => {
          const pct = total > 0 ? ((s.value / total) * 100).toFixed(1) : "0";
          return (
            <div key={s.label} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/80 min-w-0">
              <span className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white" style={{ backgroundColor: s.color }} />
              <div className="min-w-0 overflow-hidden">
                <p className="font-medium text-slate-800 text-xs truncate">{s.label}</p>
                <p className="text-xs text-slate-500">
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

function RechartsHorizontalBar({ items, barColor = "#475569" }: { items: Array<{ role: string; count: number }>; barColor?: string }) {
  const data = items.map((i) => ({ name: i.role, count: i.count, fill: barColor }));
  if (data.length === 0) return <p className="text-sm text-slate-500 py-4">No data</p>;
  const chartHeight = Math.max(180, items.length * 32);
  return (
    <div className="min-w-0 w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(value: number | undefined) => [value ?? 0, "Staff"]} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

const FALLBACK: AdminDashboardData = {
  metrics: {
    totalUsers: 45,
    totalUsersChange: 3,
    totalPatients: 3550,
    totalPatientsChange: 150,
    totalStaff: 120,
    totalStaffChange: 5,
    departments: 12,
    departmentsChange: 0,
  },
  usersByRole: [
    { label: "Admin", value: 2, color: "#64748b" },
    { label: "Doctor", value: 12, color: "#3b82f6" },
    { label: "Nurse", value: 15, color: "#10b981" },
    { label: "Receptionist", value: 5, color: "#f59e0b" },
    { label: "Pharmacist", value: 4, color: "#8b5cf6" },
    { label: "Other", value: 7, color: "#94a3b8" },
  ],
  staffByDepartment: [
    { role: "General Medicine", count: 45 },
    { role: "Emergency", count: 28 },
    { role: "Radiology", count: 12 },
    { role: "Lab", count: 8 },
    { role: "Pharmacy", count: 6 },
  ],
  patientsByGenderOverTime: [
    { period: "Jan", male: 420, female: 380 },
    { period: "Feb", male: 445, female: 410 },
    { period: "Mar", male: 460, female: 435 },
    { period: "Apr", male: 480, female: 455 },
    { period: "May", male: 510, female: 490 },
    { period: "Jun", male: 520, female: 505 },
  ],
  patientsByAgeRange: [
    { label: "0-10", value: 320, color: "#93c5fd" },
    { label: "10-20", value: 480, color: "#60a5fa" },
    { label: "20-30", value: 720, color: "#3b82f6" },
    { label: "30-40", value: 650, color: "#2563eb" },
    { label: "40-60", value: 890, color: "#1d4ed8" },
    { label: "60-100", value: 490, color: "#1e40af" },
  ],
  patientStatus: { admitted: 284, recovered: 1840, stillSick: 1426 },
  patientStatusOverTime: [
    { period: "Jan", admitted: 220, recovered: 1650, stillSick: 1380 },
    { period: "Feb", admitted: 245, recovered: 1720, stillSick: 1395 },
    { period: "Mar", admitted: 260, recovered: 1780, stillSick: 1410 },
    { period: "Apr", admitted: 272, recovered: 1805, stillSick: 1420 },
    { period: "May", admitted: 278, recovered: 1825, stillSick: 1422 },
    { period: "Jun", admitted: 284, recovered: 1840, stillSick: 1426 },
  ],
  appointmentStats: { scheduled: 156, completed: 892, cancelled: 31 },
  appointmentStatsOverTime: [
    { period: "Jan", scheduled: 140, completed: 820, cancelled: 28 },
    { period: "Feb", scheduled: 148, completed: 845, cancelled: 29 },
    { period: "Mar", scheduled: 152, completed: 862, cancelled: 30 },
    { period: "Apr", scheduled: 154, completed: 875, cancelled: 30 },
    { period: "May", scheduled: 155, completed: 884, cancelled: 31 },
    { period: "Jun", scheduled: 156, completed: 892, cancelled: 31 },
  ],
};

/** Last 12 months: from 12 months ago through current month. Format "Mar 2025". */
function getLast12MonthLabels(): string[] {
  const now = new Date();
  const labels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleDateString("en-GB", { month: "short", year: "numeric" }));
  }
  return labels;
}

/** Build time-series fallback data for the last 12 months with trending mock values. */
function buildTimeSeriesFallback(periods: string[]) {
  const n = periods.length;
  const admitted = (i: number) => Math.round(220 + (64 * (i + 1)) / n);
  const recovered = (i: number) => Math.round(1650 + (190 * (i + 1)) / n);
  const stillSick = (i: number) => Math.round(1380 + (46 * (i + 1)) / n);
  const male = (i: number) => Math.round(420 + (100 * (i + 1)) / n);
  const female = (i: number) => Math.round(380 + (125 * (i + 1)) / n);
  const scheduled = (i: number) => Math.round(140 + (16 * (i + 1)) / n);
  const completed = (i: number) => Math.round(820 + (72 * (i + 1)) / n);
  const cancelled = (i: number) => Math.round(28 + (3 * (i + 1)) / n);

  return {
    patientsByGenderOverTime: periods.map((period, i) => ({ period, male: male(i), female: female(i) })),
    patientStatusOverTime: periods.map((period, i) => ({ period, admitted: admitted(i), recovered: recovered(i), stillSick: stillSick(i) })),
    appointmentStatsOverTime: periods.map((period, i) => ({ period, scheduled: scheduled(i), completed: completed(i), cancelled: cancelled(i) })),
  };
}

const QUICK_LINKS = [
  { href: "/dashboard/users", label: "User Management", description: "Manage users and roles" },
  { href: "/dashboard/staff", label: "Staff", description: "Staff directory" },
  { href: "/dashboard/departments", label: "Departments", description: "Departments and staffing" },
  { href: "/dashboard/patients", label: "Patients", description: "Patient registry" },
  { href: "/dashboard/reports", label: "Reports", description: "View and export reports" },
  { href: "/dashboard/billing", label: "Billing", description: "Billing and invoices" },
];

export default function AdminDashboard(_props?: { role?: string | null }) {
  const fallbackWithMonths = useMemo(() => {
    const last12Months = getLast12MonthLabels();
    const timeSeriesFallback = buildTimeSeriesFallback(last12Months);
    return {
      ...FALLBACK,
      patientsByGenderOverTime: timeSeriesFallback.patientsByGenderOverTime,
      patientStatusOverTime: timeSeriesFallback.patientStatusOverTime,
      appointmentStatsOverTime: timeSeriesFallback.appointmentStatsOverTime,
    } as AdminDashboardData;
  }, []);

  const [data, setData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/admin")
      .then((r) => r.json())
      .then((api) => setData({ ...fallbackWithMonths, ...api }))
      .catch(() => setData(fallbackWithMonths));
  }, [fallbackWithMonths]);

  const d = data ?? fallbackWithMonths;
  const totalUsersByRole = d.usersByRole.reduce((s, x) => s + x.value, 0);
  const totalAge = d.patientsByAgeRange.reduce((s, x) => s + x.value, 0);

  return (
    <div className="space-y-8">
      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Users" value={d.metrics.totalUsers} change={d.metrics.totalUsersChange} icon={<span className="text-lg">👤</span>} />
        <MetricCard title="Total Patients" value={d.metrics.totalPatients.toLocaleString()} change={d.metrics.totalPatientsChange} icon={<span className="text-lg">🩺</span>} />
        <MetricCard title="Staff" value={d.metrics.totalStaff} change={d.metrics.totalStaffChange} icon={<span className="text-lg">👥</span>} />
        <MetricCard title="Departments" value={d.metrics.departments} change={d.metrics.departmentsChange} icon={<span className="text-lg">🏥</span>} />
      </div>

      {/* Admitted / Recovered / Still sick */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Patient status</h2>
          <p className="text-sm text-slate-500 mt-0.5">Current counts: Admitted, Recovered, Still sick</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-center">
              <p className="text-2xl font-bold text-amber-800 tabular-nums">{d.patientStatus.admitted.toLocaleString()}</p>
              <p className="text-sm font-medium text-amber-700 mt-1">Admitted</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-800 tabular-nums">{d.patientStatus.recovered.toLocaleString()}</p>
              <p className="text-sm font-medium text-emerald-700 mt-1">Recovered</p>
            </div>
            <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 text-center">
              <p className="text-2xl font-bold text-sky-800 tabular-nums">{d.patientStatus.stillSick.toLocaleString()}</p>
              <p className="text-sm font-medium text-sky-700 mt-1">Still sick</p>
            </div>
          </div>
          <GroupedBarChart
            data={d.patientStatusOverTime}
            series={[
              { key: "admitted", color: "#d97706", label: "Admitted" },
              { key: "recovered", color: "#059669", label: "Recovered" },
              { key: "stillSick", color: "#0284c7", label: "Still sick" },
            ]}
            height={220}
          />
        </div>
      </div>

      {/* Appointment stats */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Appointment stats</h2>
          <p className="text-sm text-slate-500 mt-0.5">Scheduled, completed, and cancelled over time</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-center">
              <p className="text-2xl font-bold text-blue-800 tabular-nums">{d.appointmentStats.scheduled.toLocaleString()}</p>
              <p className="text-sm font-medium text-blue-700 mt-1">Scheduled</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-800 tabular-nums">{d.appointmentStats.completed.toLocaleString()}</p>
              <p className="text-sm font-medium text-emerald-700 mt-1">Completed</p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-center">
              <p className="text-2xl font-bold text-red-800 tabular-nums">{d.appointmentStats.cancelled.toLocaleString()}</p>
              <p className="text-sm font-medium text-red-700 mt-1">Cancelled</p>
            </div>
          </div>
          <GroupedBarChart
            data={d.appointmentStatsOverTime}
            series={[
              { key: "scheduled", color: "#2563eb", label: "Scheduled" },
              { key: "completed", color: "#059669", label: "Completed" },
              { key: "cancelled", color: "#dc2626", label: "Cancelled" },
            ]}
            height={220}
          />
        </div>
      </div>

      {/* Line charts row: Patients by gender + Age demography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Patients by gender</h2>
            <p className="text-sm text-slate-500 mt-0.5">Male vs female over time</p>
          </div>
          <div className="p-5">
            <RechartsLineChart
              data={d.patientsByGenderOverTime}
              series={[
                { key: "male", color: "#3b82f6", label: "Male" },
                { key: "female", color: "#ec4899", label: "Female" },
              ]}
              height={200}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-800">Patient demography by age range</h2>
            <p className="text-sm text-slate-500 mt-0.5">0-10, 10-20, 20-30, 30-40, 40-60, 60-100 years</p>
          </div>
          <div className="p-5">
            <RechartsDonut total={totalAge} segments={d.patientsByAgeRange} size={160} />
          </div>
        </div>
      </div>

      {/* Users by role & Staff by department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection title="Users by role">
          <RechartsDonut total={totalUsersByRole} segments={d.usersByRole} size={160} />
        </DashboardSection>
        <DashboardSection title="Staff by department">
          <RechartsHorizontalBar items={d.staffByDepartment} barColor="#475569" />
        </DashboardSection>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Quick links</h2>
          <p className="text-sm text-slate-500 mt-0.5">Jump to key admin modules</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-100/50 hover:shadow-sm transition-all"
              >
                <span className="font-medium text-slate-800">{link.label}</span>
                <span className="text-sm text-slate-500 mt-0.5">{link.description}</span>
                <span className="text-xs text-blue-600 mt-2 font-medium">View →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
