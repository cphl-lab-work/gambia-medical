"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

const FALLBACK = {
  ordersToday: 56,
  ordersChange: 14,
  pending: 12,
  pendingChange: -2,
  sentToLIS: 38,
  lisChange: 8,
  byType: [
    { label: "Haematology", value: 18, color: "#ef4444" },
    { label: "Biochemistry", value: 22, color: "#3b82f6" },
    { label: "Microbiology", value: 8, color: "#10b981" },
  ],
  byStatus: [
    { role: "Received", count: 56 },
    { role: "Pending", count: 12 },
    { role: "Sent to LIS", count: 38 },
  ],
};

export default function LabOrdersPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "lab_orders")) {
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
  const maxBar = Math.max(...d.byStatus.map((r) => r.count), 1);
  const allowCreate = auth && canCreate(auth.role, "lab_orders");
  const allowUpdate = auth && canUpdate(auth.role, "lab_orders");
  const allowDelete = auth && canDelete(auth.role, "lab_orders");

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
            <h1 className="text-xl font-semibold text-slate-800">Laboratory (LIS)</h1>
            <p className="text-sm text-slate-500 mt-1">
              CPOE lab orders are sent via HL7/FHIR to the Lab Information System. Phlebotomy or nurse draws blood; results flow back to EMR.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Orders today" value={d.ordersToday} change={d.ordersChange} icon={<span className="text-lg">🧪</span>} />
          <MetricCard title="Pending" value={d.pending} change={d.pendingChange} icon={<span className="text-lg">⏳</span>} />
          <MetricCard title="Sent to LIS" value={d.sentToLIS} change={d.lisChange} icon={<span className="text-lg">📤</span>} />
          <MetricCard title="By type (total)" value={totalType} change={d.ordersChange} icon={<span className="text-lg">📋</span>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection title="Orders by test type">
            <DonutChart total={totalType} segments={d.byType} size={160} stroke={22} />
          </DashboardSection>
          <DashboardSection title="Orders by status">
            <BarChart items={d.byStatus} max={maxBar} barColor="bg-violet-600" />
          </DashboardSection>
        </div>

        <DashboardSection title="Content view – Lab orders & results">
          <p className="text-sm text-slate-500 mb-4">
            {allowCreate && "You can create/place lab orders. "}
            {allowUpdate && "You can update order status (e.g. send to LIS). "}
            {allowDelete && "You can delete (Admin). "}
            {!allowCreate && !allowUpdate && "You have view-only access."}
          </p>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            <p className="font-medium text-slate-700">Lab orders & results</p>
            <p className="text-sm mt-1">Order entry and LIS integration will be implemented here.</p>
          </div>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}
