"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

const FALLBACK = {
  total: 24,
  totalChange: 2,
  active: 22,
  activeChange: 1,
  byDept: [
    { label: "General Physician", value: 8, color: "#3b82f6" },
    { label: "Gynecologist", value: 4, color: "#ec4899" },
    { label: "Radiologist", value: 3, color: "#10b981" },
  ],
  byStatus: [
    { role: "Active", count: 22 },
    { role: "On leave", count: 2 },
  ],
};

export default function DoctorsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "doctors")) {
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
  const maxBar = Math.max(...d.byStatus.map((r) => r.count), 1);
  const allowCreate = auth && canCreate(auth.role, "doctors");
  const allowUpdate = auth && canUpdate(auth.role, "doctors");
  const allowDelete = auth && canDelete(auth.role, "doctors");

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
            <h1 className="text-xl font-semibold text-slate-800">Doctors</h1>
            <p className="text-sm text-slate-500 mt-1">Doctor directory: view and manage doctors by department and status.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total doctors" value={d.total} change={d.totalChange} icon={<span className="text-lg">👤</span>} />
          <MetricCard title="Active" value={d.active} change={d.activeChange} icon={<span className="text-lg">✓</span>} />
          <MetricCard title="By department" value={totalDept} change={d.totalChange} icon={<span className="text-lg">📋</span>} />
          <MetricCard title="On leave" value={d.byStatus[1]?.count ?? 0} change={0} icon={<span className="text-lg">📅</span>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection title="Doctors by department">
            <DonutChart total={totalDept} segments={d.byDept} size={160} stroke={22} />
          </DashboardSection>
          <DashboardSection title="By status">
            <BarChart items={d.byStatus} max={maxBar} barColor="bg-blue-600" />
          </DashboardSection>
        </div>

        <DashboardSection title="Content view – Doctor directory">
          <p className="text-sm text-slate-500 mb-4">
            {allowCreate && "You can add doctors (Admin). "}
            {allowUpdate && "You can edit (Admin). "}
            {allowDelete && "You can delete (Admin). "}
            {!allowCreate && !allowUpdate && "You have view-only access."}
          </p>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            <p className="font-medium text-slate-700">Doctor list and profile form</p>
            <p className="text-sm mt-1">Directory table and create/edit form will be implemented here.</p>
          </div>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}
