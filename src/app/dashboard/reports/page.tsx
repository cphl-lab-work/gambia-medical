"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canViewReportType } from "@/helpers/module-permissions";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

const TRANSACTIONS_FALLBACK = {
  totalCount: 1842,
  totalChange: 8,
  totalAmount: 185000,
  amountChange: 12,
  byType: [
    { label: "Payment received", value: 1200, color: "#10b981" },
    { label: "Invoice raised", value: 420, color: "#3b82f6" },
    { label: "Refund", value: 122, color: "#f59e0b" },
  ],
  byMonth: [
    { role: "Jan", count: 280 },
    { role: "Feb", count: 312 },
    { role: "Mar", count: 295 },
    { role: "Apr", count: 318 },
  ],
};

const APPOINTMENTS_REPORT_FALLBACK = {
  scheduled: 156,
  completed: 142,
  cancelled: 14,
  byStatus: [
    { role: "Scheduled", count: 156 },
    { role: "Completed", count: 142 },
    { role: "Cancelled", count: 14 },
  ],
};

const CLERKING_REPORT_FALLBACK = {
  total: 89,
  bySource: [
    { label: "OPD", value: 52, color: "#3b82f6" },
    { label: "Emergency", value: 28, color: "#ef4444" },
    { label: "Elective", value: 9, color: "#10b981" },
  ],
};

const BILLING_REPORT_FALLBACK = {
  revenue: 125000,
  pending: 18500,
  byDept: [
    { role: "OPD", count: 62000 },
    { role: "Lab", count: 38000 },
    { role: "Pharmacy", count: 25000 },
  ],
};

export default function ReportsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "reports")) {
      router.replace("/dashboard");
      return;
    }
    setAuth({ role: a.role });
  }, [router]);

  const allowExport = auth && canCreate(auth.role, "reports");
  const canTransactions = auth && canViewReportType(auth.role, "transactions");
  const canAppointments = auth && canViewReportType(auth.role, "appointments_summary");
  const canClerking = auth && canViewReportType(auth.role, "clerking_summary");
  const canBilling = auth && canViewReportType(auth.role, "billing_summary");

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  const tx = TRANSACTIONS_FALLBACK;
  const apt = APPOINTMENTS_REPORT_FALLBACK;
  const clerk = CLERKING_REPORT_FALLBACK;
  const bill = BILLING_REPORT_FALLBACK;
  const totalTx = tx.byType.reduce((s, x) => s + x.value, 0);
  const totalClerk = clerk.bySource.reduce((s, x) => s + x.value, 0);
  const maxApt = Math.max(...apt.byStatus.map((r) => r.count), 1);
  const maxBill = Math.max(...bill.byDept.map((r) => r.count), 1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Reports</h1>
            <p className="text-sm text-slate-500 mt-1">
              View reports by type. Access to each report is restricted by your role.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {allowExport && (
              <button
                type="button"
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-700"
              >
                Export report
              </button>
            )}
          </div>
        </div>

        {canTransactions && (
          <DashboardSection
            title="Transactions report"
            action={
              <span className="text-xs text-slate-500">Visible to: Admin, Accountant</span>
            }
          >
            <p className="text-sm text-slate-500 mb-4">Financial transactions: payments, invoices, refunds.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard title="Total transactions" value={tx.totalCount.toLocaleString()} change={tx.totalChange} icon={<span className="text-lg">📄</span>} />
              <MetricCard title="Total amount (UGX)" value={`${(tx.totalAmount / 1000).toFixed(0)}k`} change={tx.amountChange} icon={<span className="text-xs font-semibold">UGX</span>} />
              <MetricCard title="By type (count)" value={totalTx.toLocaleString()} change={tx.totalChange} icon={<span className="text-lg">📋</span>} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Transactions by type</h3>
                <DonutChart total={totalTx} segments={tx.byType} size={140} stroke={20} />
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Transactions by month</h3>
                <BarChart items={tx.byMonth} barColor="bg-emerald-600" />
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Amount (UGX)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: "2025-02-26", type: "Payment received", patient: "James Okello", amount: "45,000", status: "Paid" },
                    { date: "2025-02-26", type: "Invoice raised", patient: "Mary Akinyi", amount: "120,000", status: "Pending" },
                    { date: "2025-02-25", type: "Payment received", patient: "Peter Ochieng", amount: "28,000", status: "Paid" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 px-4 text-slate-600">{row.date}</td>
                      <td className="py-3 px-4 text-slate-600">{row.type}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{row.patient}</td>
                      <td className="py-3 px-4 text-slate-600">{row.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${row.status === "Paid" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardSection>
        )}

        {canAppointments && (
          <DashboardSection
            title="Appointments summary"
            action={<span className="text-xs text-slate-500">Visible to: Admin, Receptionist, Nurse, Accountant</span>}
          >
            <p className="text-sm text-slate-500 mb-4">Scheduled, completed, and cancelled appointments.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <MetricCard title="Scheduled" value={apt.scheduled} change={5} icon={<span className="text-lg">📅</span>} />
              <MetricCard title="Completed" value={apt.completed} change={8} icon={<span className="text-lg">✓</span>} />
              <MetricCard title="Cancelled" value={apt.cancelled} change={-2} icon={<span className="text-lg">✕</span>} />
            </div>
            <div className="max-w-sm">
              <BarChart items={apt.byStatus} max={maxApt} barColor="bg-blue-600" />
            </div>
          </DashboardSection>
        )}

        {canClerking && (
          <DashboardSection
            title="Clerking summary"
            action={<span className="text-xs text-slate-500">Visible to: Admin, Receptionist, Nurse</span>}
          >
            <p className="text-sm text-slate-500 mb-4">Patient clerking by arrival source.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <MetricCard title="Total clerking records" value={clerk.total} change={6} icon={<span className="text-lg">📋</span>} />
            </div>
            <DonutChart total={totalClerk} segments={clerk.bySource} size={160} stroke={22} />
          </DashboardSection>
        )}

        {canBilling && (
          <DashboardSection
            title="Billing summary"
            action={<span className="text-xs text-slate-500">Visible to: Admin, Accountant, Receptionist</span>}
          >
            <p className="text-sm text-slate-500 mb-4">Revenue and pending by department.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <MetricCard title="Revenue (UGX)" value={`${(bill.revenue / 1000).toFixed(0)}k`} change={10} icon={<span className="text-xs font-semibold">UGX</span>} />
              <MetricCard title="Pending (UGX)" value={`${(bill.pending / 1000).toFixed(0)}k`} change={-3} icon={<span className="text-lg">⏳</span>} />
            </div>
            <BarChart items={bill.byDept} max={maxBill} barColor="bg-teal-600" />
          </DashboardSection>
        )}

        {!canTransactions && !canAppointments && !canClerking && !canBilling && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            <p className="font-medium text-slate-700">No reports available for your role</p>
            <p className="text-sm mt-1">Contact an administrator if you need access to reports.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
