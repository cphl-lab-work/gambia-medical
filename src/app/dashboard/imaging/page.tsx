"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

const FALLBACK = {
  ordersToday: 24,
  ordersChange: 6,
  pending: 5,
  pendingChange: -1,
  reported: 19,
  reportedChange: 5,
  byModality: [
    { label: "X-Ray", value: 12, color: "#3b82f6" },
    { label: "Ultrasound", value: 6, color: "#10b981" },
    { label: "CT", value: 4, color: "#f59e0b" },
  ],
  byStatus: [
    { role: "Ordered", count: 24 },
    { role: "Pending", count: 5 },
    { role: "Report ready", count: 19 },
  ],
};

export default function ImagingPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "imaging")) {
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
  const totalModality = d.byModality.reduce((s, x) => s + x.value, 0);
  const maxBar = Math.max(...d.byStatus.map((r) => r.count), 1);
  const allowCreate = auth && canCreate(auth.role, "imaging");
  const allowUpdate = auth && canUpdate(auth.role, "imaging");
  const allowDelete = auth && canDelete(auth.role, "imaging");

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
            <h1 className="text-xl font-semibold text-slate-800">Imaging (RIS)</h1>
            <p className="text-sm text-slate-500 mt-1">
              Imaging orders from CPOE are routed to the Radiology Information System (RIS).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Orders today" value={d.ordersToday} change={d.ordersChange} icon={<span className="text-lg">🩻</span>} />
          <MetricCard title="Pending" value={d.pending} change={d.pendingChange} icon={<span className="text-lg">⏳</span>} />
          <MetricCard title="Report ready" value={d.reported} change={d.reportedChange} icon={<span className="text-lg">✓</span>} />
          <MetricCard title="By modality" value={totalModality} change={d.ordersChange} icon={<span className="text-lg">📋</span>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection title="Orders by modality">
            <DonutChart total={totalModality} segments={d.byModality} size={160} stroke={22} />
          </DashboardSection>
          <DashboardSection title="Orders by status">
            <BarChart items={d.byStatus} max={maxBar} barColor="bg-sky-600" />
          </DashboardSection>
        </div>

        <DashboardSection title="Content view – Imaging orders & reports">
          <p className="text-sm text-slate-500 mb-4">
            {allowCreate && "You can place imaging orders. "}
            {allowUpdate && "You can update status / report. "}
            {allowDelete && "You can delete (Admin). "}
            {!allowCreate && !allowUpdate && "You have view-only access."}
          </p>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            <p className="font-medium text-slate-700">Imaging orders & reports</p>
            <p className="text-sm mt-1">Order entry and RIS integration will be implemented here.</p>
          </div>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}
