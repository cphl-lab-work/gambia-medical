"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

const FALLBACK = {
  revenueToday: 12500,
  revenueChange: 8,
  pendingInvoices: 18,
  pendingChange: -2,
  paidToday: 630000,
  paidChange: 5,
  byDept: [
    { label: "OPD", value: 62000, color: "#3b82f6" },
    { label: "Emergency", value: 45000, color: "#ef4444" },
    { label: "Lab", value: 38000, color: "#10b981" },
  ],
  byMonth: [
    { role: "Jan", count: 162 },
    { role: "Feb", count: 178 },
    { role: "Mar", count: 195 },
  ],
};

export default function BillingPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "billing")) {
      router.replace("/dashboard");
      return;
    }
    setAuth({ role: a.role });
  }, [router]);

  useEffect(() => {
    if (!auth) return;
    setStats(FALLBACK);
  }, [auth]);

  const d = stats ?? FALLBACK;
  const totalDept = d.byDept.reduce((s, x) => s + x.value, 0);
  const maxBar = Math.max(...d.byMonth.map((r) => r.count), 1);
  const allowCreate = auth && canCreate(auth.role, "billing");
  const allowUpdate = auth && canUpdate(auth.role, "billing");
  const allowDelete = auth && canDelete(auth.role, "billing");

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Billing & Invoices</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track revenue, pending invoices, and payments across departments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Revenue today (UGX)" value={`UGX ${d.revenueToday.toLocaleString()}`} change={d.revenueChange} icon={<span className="text-xs font-semibold">UGX</span>} />
          <MetricCard title="Pending invoices" value={d.pendingInvoices} change={d.pendingChange} icon={<span className="text-lg">📄</span>} />
          <MetricCard title="Paid today (UGX)" value={`UGX ${d.paidToday.toLocaleString()}`} change={d.paidChange} icon={<span className="text-xs font-semibold">UGX</span>} />
          <MetricCard title="Revenue by dept (UGX)" value={`UGX ${(totalDept / 1000).toFixed(0)}k`} change={d.revenueChange} icon={<span className="text-xs font-semibold">UGX</span>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection title="Revenue by department">
            <DonutChart total={totalDept} segments={d.byDept.map((s) => ({ ...s, value: s.value }))} size={160} stroke={22} />
          </DashboardSection>
          <DashboardSection title="Transactions by month">
            <BarChart items={d.byMonth} max={maxBar} barColor="bg-emerald-600" />
          </DashboardSection>
        </div>

        <DashboardSection title="Content view – Invoices & payments">
          <p className="text-sm text-slate-500 mb-4">
            {allowCreate && "You can create invoices. "}
            {allowUpdate && "You can record payments and edit. "}
            {allowDelete && "You can delete (Admin). "}
            {!allowCreate && !allowUpdate && "You have view-only access."}
          </p>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            <p className="font-medium text-slate-700">Invoices & payments</p>
            <p className="text-sm mt-1">Invoice list and payment recording will be implemented here.</p>
          </div>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}
