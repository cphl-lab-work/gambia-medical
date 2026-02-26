"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "./DashboardCharts";

interface LabDashboardData {
  metrics: { ordersToday: number; ordersChange: number; pending: number; pendingChange: number; completed: number; completedChange: number; sentToLIS: number; lisChange: number };
  byTestType: Array<{ label: string; value: number; color: string }>;
  byStatus: Array<{ role: string; count: number }>;
  recentOrders: Array<{ id: string; patientName: string; testType: string; orderedBy: string; status: string; orderedAt: string }>;
}

const FALLBACK: LabDashboardData = {
  metrics: {
    ordersToday: 56,
    ordersChange: 14,
    pending: 12,
    pendingChange: -2,
    completed: 41,
    completedChange: 10,
    sentToLIS: 38,
    lisChange: 8,
  },
  byTestType: [
    { label: "Haematology", value: 18, color: "#ef4444" },
    { label: "Biochemistry", value: 22, color: "#3b82f6" },
    { label: "Microbiology", value: 8, color: "#10b981" },
    { label: "Serology", value: 6, color: "#f59e0b" },
    { label: "Other", value: 2, color: "#94a3b8" },
  ],
  byStatus: [
    { role: "Received", count: 56 },
    { role: "Pending", count: 12 },
    { role: "Sent to LIS", count: 38 },
    { role: "Result ready", count: 41 },
  ],
  recentOrders: [
    { id: "1", patientName: "James Okello", testType: "FBC, RFT", orderedBy: "Dr. Nazar Becks", status: "Sent to LIS", orderedAt: "10:30" },
    { id: "2", patientName: "Mary Akinyi", testType: "LFT, Blood sugar", orderedBy: "Dr. Alex Hales", status: "Pending", orderedAt: "10:45" },
    { id: "3", patientName: "Peter Ochieng", testType: "Culture & sensitivity", orderedBy: "Dr. John Darwin", status: "Result ready", orderedAt: "09:15" },
  ],
};

export default function LabTechDashboard() {
  const [data, setData] = useState<LabDashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/lab")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(FALLBACK));
  }, []);

  const d = data ?? FALLBACK;
  const { metrics, byTestType, byStatus, recentOrders } = d;
  const totalTests = byTestType.reduce((s, x) => s + x.value, 0);
  const maxBar = Math.max(...byStatus.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Laboratory (LIS)</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/lab-orders"
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
          >
            Lab orders →
          </Link>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        Orders placed via CPOE are sent to the Lab Information System (LIS). Phlebotomy or nurse draws blood; results flow back to EMR.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Orders today" value={metrics.ordersToday} change={metrics.ordersChange} icon={<span className="text-lg">🧪</span>} />
        <MetricCard title="Pending" value={metrics.pending} change={metrics.pendingChange} icon={<span className="text-lg">⏳</span>} />
        <MetricCard title="Completed" value={metrics.completed} change={metrics.completedChange} icon={<span className="text-lg">✓</span>} />
        <MetricCard title="Sent to LIS" value={metrics.sentToLIS} change={metrics.lisChange} icon={<span className="text-lg">📤</span>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection title="Orders by test type">
          <p className="text-sm text-slate-500 mb-4">Total: <span className="font-semibold text-slate-700">{totalTests}</span> orders</p>
          <DonutChart total={totalTests} segments={byTestType} size={160} stroke={22} />
        </DashboardSection>
        <DashboardSection title="Orders by status">
          <BarChart items={byStatus} max={maxBar} barColor="bg-violet-600" />
        </DashboardSection>
      </div>

      <DashboardSection
        title="Recent lab orders"
        action={
          <Link href="/dashboard/lab-orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
                <th className="pb-3 pr-4">Patient</th>
                <th className="pb-3 pr-4">Test type</th>
                <th className="pb-3 pr-4">Ordered by</th>
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4 font-medium text-slate-800">{r.patientName}</td>
                  <td className="py-3 pr-4 text-slate-600">{r.testType}</td>
                  <td className="py-3 pr-4 text-slate-600">{r.orderedBy}</td>
                  <td className="py-3 pr-4 text-slate-600">{r.orderedAt}</td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                      r.status === "Result ready" ? "bg-emerald-50 text-emerald-800" :
                      r.status === "Sent to LIS" ? "bg-blue-50 text-blue-800" : "bg-amber-50 text-amber-800"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardSection>
    </div>
  );
}
