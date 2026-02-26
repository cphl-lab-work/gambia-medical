"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "./DashboardCharts";

interface AccountantDashboardData {
  metrics: { revenueToday: number; revenueChange: number; pendingInvoices: number; pendingChange: number; paidToday: number; paidChange: number; totalBilling: number; billingChange: number };
  revenueByDept: Array<{ label: string; value: number; color: string }>;
  revenueByMonth: Array<{ role: string; count: number }>;
  recentTransactions: Array<{ id: string; patientName: string; amount: string; type: string; date: string; status: string }>;
}

const FALLBACK: AccountantDashboardData = {
  metrics: {
    revenueToday: 12500,
    revenueChange: 8,
    pendingInvoices: 18,
    pendingChange: -2,
    paidToday: 32,
    paidChange: 5,
    totalBilling: 185000,
    billingChange: 12,
  },
  revenueByDept: [
    { label: "OPD", value: 62000, color: "#3b82f6" },
    { label: "Emergency", value: 45000, color: "#ef4444" },
    { label: "Lab", value: 38000, color: "#10b981" },
    { label: "Pharmacy", value: 25000, color: "#f59e0b" },
    { label: "Other", value: 15000, color: "#94a3b8" },
  ],
  revenueByMonth: [
    { role: "Jan", count: 162 },
    { role: "Feb", count: 178 },
    { role: "Mar", count: 195 },
    { role: "Apr", count: 188 },
    { role: "May", count: 210 },
    { role: "Jun", count: 205 },
  ],
  recentTransactions: [
    { id: "1", patientName: "James Okello", amount: "45,000", type: "Lab + Pharmacy", date: "Today", status: "Paid" },
    { id: "2", patientName: "Mary Akinyi", amount: "120,000", type: "Admission", date: "Today", status: "Pending" },
    { id: "3", patientName: "Peter Ochieng", amount: "28,000", type: "OPD + Rx", date: "Yesterday", status: "Paid" },
  ],
};

export default function AccountantDashboard() {
  const [data, setData] = useState<AccountantDashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/accountant")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(FALLBACK));
  }, []);

  const d = data ?? FALLBACK;
  const { metrics, revenueByDept, revenueByMonth, recentTransactions } = d;
  const totalRevenue = revenueByDept.reduce((s, x) => s + x.value, 0);
  const maxBar = Math.max(...revenueByMonth.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Billing & Revenue</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/billing"
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
          >
            Invoices →
          </Link>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        Track revenue, pending invoices, and payments across OPD, Emergency, Lab, Pharmacy, and other departments.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Revenue today" value={`$${metrics.revenueToday.toLocaleString()}`} change={metrics.revenueChange} icon={<span className="text-lg">$</span>} />
        <MetricCard title="Pending invoices" value={metrics.pendingInvoices} change={metrics.pendingChange} icon={<span className="text-lg">📄</span>} />
        <MetricCard title="Paid today" value={metrics.paidToday} change={metrics.paidChange} icon={<span className="text-lg">✓</span>} />
        <MetricCard title="Total billing (MTD)" value={`$${(metrics.totalBilling / 1000).toFixed(0)}k`} change={metrics.billingChange} icon={<span className="text-lg">📊</span>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection title="Revenue by department">
          <p className="text-sm text-slate-500 mb-4">Total: <span className="font-semibold text-slate-700">${totalRevenue.toLocaleString()}</span></p>
          <DonutChart total={totalRevenue} segments={revenueByDept.map((s) => ({ ...s, value: s.value }))} size={160} stroke={22} />
        </DashboardSection>
        <DashboardSection title="Transactions by month">
          <BarChart items={revenueByMonth} max={maxBar} barColor="bg-emerald-600" />
        </DashboardSection>
      </div>

      <DashboardSection
        title="Recent transactions"
        action={
          <Link href="/dashboard/billing" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
                <th className="pb-3 pr-4">Patient</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4 font-medium text-slate-800">{r.patientName}</td>
                  <td className="py-3 pr-4 text-slate-600">{r.amount}</td>
                  <td className="py-3 pr-4 text-slate-600">{r.type}</td>
                  <td className="py-3 pr-4 text-slate-600">{r.date}</td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${r.status === "Paid" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
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
