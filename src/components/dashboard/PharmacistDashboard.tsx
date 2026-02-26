"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "./DashboardCharts";

interface PharmacistDashboardData {
  metrics: { prescriptionsToday: number; rxChange: number; pendingDispense: number; pendingChange: number; dispensed: number; dispensedChange: number; ordersFromEMR: number; emrChange: number };
  byType: Array<{ label: string; value: number; color: string }>;
  byStatus: Array<{ role: string; count: number }>;
  recentOrders: Array<{ id: string; patientName: string; medication: string; prescriber: string; status: string; time: string }>;
}

const FALLBACK: PharmacistDashboardData = {
  metrics: {
    prescriptionsToday: 48,
    rxChange: 6,
    pendingDispense: 9,
    pendingChange: -1,
    dispensed: 39,
    dispensedChange: 8,
    ordersFromEMR: 45,
    emrChange: 12,
  },
  byType: [
    { label: "Tablets/Capsules", value: 28, color: "#3b82f6" },
    { label: "Injectables", value: 8, color: "#ef4444" },
    { label: "Suspensions", value: 6, color: "#10b981" },
    { label: "Topical", value: 4, color: "#f59e0b" },
    { label: "Other", value: 2, color: "#94a3b8" },
  ],
  byStatus: [
    { role: "Received", count: 48 },
    { role: "Pending", count: 9 },
    { role: "Dispensed", count: 39 },
  ],
  recentOrders: [
    { id: "1", patientName: "James Okello", medication: "Amlodipine 5mg, Metformin", prescriber: "Dr. Nazar Becks", status: "Dispensed", time: "10:15" },
    { id: "2", patientName: "Mary Akinyi", medication: "Insulin, Glucophage", prescriber: "Dr. Alex Hales", status: "Pending", time: "10:40" },
    { id: "3", patientName: "Peter Ochieng", medication: "Salbutamol inhaler", prescriber: "Dr. John Darwin", status: "Dispensed", time: "09:50" },
  ],
};

export default function PharmacistDashboard() {
  const [data, setData] = useState<PharmacistDashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/pharmacist")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(FALLBACK));
  }, []);

  const d = data ?? FALLBACK;
  const { metrics, byType, byStatus, recentOrders } = d;
  const totalRx = byType.reduce((s, x) => s + x.value, 0);
  const maxBar = Math.max(...byStatus.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Pharmacy</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/pharmacy"
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
          >
            Pharmacy orders →
          </Link>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        Orders placed via CPOE are routed to the Pharmacy module. Dispense and track prescriptions from the EMR.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Prescriptions today" value={metrics.prescriptionsToday} change={metrics.rxChange} icon={<span className="text-lg">💊</span>} />
        <MetricCard title="Pending dispense" value={metrics.pendingDispense} change={metrics.pendingChange} icon={<span className="text-lg">⏳</span>} />
        <MetricCard title="Dispensed" value={metrics.dispensed} change={metrics.dispensedChange} icon={<span className="text-lg">✓</span>} />
        <MetricCard title="Orders from EMR" value={metrics.ordersFromEMR} change={metrics.emrChange} icon={<span className="text-lg">📋</span>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection title="Orders by type">
          <p className="text-sm text-slate-500 mb-4">Total: <span className="font-semibold text-slate-700">{totalRx}</span> prescriptions</p>
          <DonutChart total={totalRx} segments={byType} size={160} stroke={22} />
        </DashboardSection>
        <DashboardSection title="Orders by status">
          <BarChart items={byStatus} max={maxBar} barColor="bg-amber-600" />
        </DashboardSection>
      </div>

      <DashboardSection
        title="Recent pharmacy orders"
        action={
          <Link href="/dashboard/pharmacy" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
                <th className="pb-3 pr-4">Patient</th>
                <th className="pb-3 pr-4">Medication</th>
                <th className="pb-3 pr-4">Prescriber</th>
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4 font-medium text-slate-800">{r.patientName}</td>
                  <td className="py-3 pr-4 text-slate-600">{r.medication}</td>
                  <td className="py-3 pr-4 text-slate-600">{r.prescriber}</td>
                  <td className="py-3 pr-4 text-slate-600">{r.time}</td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${r.status === "Dispensed" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
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
