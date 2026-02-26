"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

const FALLBACK = {
  totalStock: 1240,
  totalChange: 5,
  lowStock: 12,
  lowChange: -2,
  byType: [
    { label: "Tablets", value: 520, color: "#3b82f6" },
    { label: "Injectables", value: 180, color: "#ef4444" },
    { label: "Suspensions", value: 140, color: "#10b981" },
  ],
  byCategory: [
    { role: "Antibiotics", count: 320 },
    { role: "Analgesics", count: 280 },
    { role: "Other", count: 640 },
  ],
};

export default function MedicinePage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "medicine_management")) {
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
  const totalType = d.byType.reduce((s, x) => s + x.value, 0);
  const maxBar = Math.max(...d.byCategory.map((r) => r.count), 1);
  const allowCreate = auth && canCreate(auth.role, "medicine_management");
  const allowUpdate = auth && canUpdate(auth.role, "medicine_management");
  const allowDelete = auth && canDelete(auth.role, "medicine_management");

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
            <h1 className="text-xl font-semibold text-slate-800">Medicine Management</h1>
            <p className="text-sm text-slate-500 mt-1">Stock, dispensing, and medicine catalogue.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total stock (units)" value={d.totalStock.toLocaleString()} change={d.totalChange} icon={<span className="text-lg">💊</span>} />
          <MetricCard title="Low stock items" value={d.lowStock} change={d.lowChange} icon={<span className="text-lg">⚠️</span>} />
          <MetricCard title="By type" value={totalType.toLocaleString()} change={d.totalChange} icon={<span className="text-lg">📋</span>} />
          <MetricCard title="Categories" value={d.byCategory.length} change={0} icon={<span className="text-lg">📁</span>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection title="Stock by type">
            <DonutChart total={totalType} segments={d.byType} size={160} stroke={22} />
          </DashboardSection>
          <DashboardSection title="Stock by category">
            <BarChart items={d.byCategory} max={maxBar} barColor="bg-emerald-600" />
          </DashboardSection>
        </div>

        <DashboardSection title="Content view – Medicine catalogue">
          <p className="text-sm text-slate-500 mb-4">
            {allowCreate && "You can add medicines. "}
            {allowUpdate && "You can edit and update stock. "}
            {allowDelete && "You can delete (Admin). "}
            {!allowCreate && !allowUpdate && "You have view-only access."}
          </p>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            <p className="font-medium text-slate-700">Medicine list and stock form</p>
            <p className="text-sm mt-1">Table and create/edit form will be implemented here.</p>
          </div>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}
