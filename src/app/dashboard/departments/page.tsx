"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

const FALLBACK = {
  total: 12,
  totalChange: 0,
  byStaff: [
    { role: "General Medicine", count: 45 },
    { role: "Emergency", count: 28 },
    { role: "Radiology", count: 12 },
    { role: "Lab", count: 8 },
    { role: "Pharmacy", count: 6 },
  ],
};

export default function DepartmentsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "departments")) {
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
  const maxBar = Math.max(...d.byStaff.map((r) => r.count), 1);
  const allowCreate = auth && canCreate(auth.role, "departments");
  const allowUpdate = auth && canUpdate(auth.role, "departments");
  const allowDelete = auth && canDelete(auth.role, "departments");

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
            <h1 className="text-xl font-semibold text-slate-800">Departments</h1>
            <p className="text-sm text-slate-500 mt-1">Department directory and staffing overview.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard title="Total departments" value={d.total} change={d.totalChange} icon={<span className="text-lg">🏥</span>} />
          <MetricCard title="Staff across depts" value={d.byStaff.reduce((s, x) => s + x.count, 0)} change={2} icon={<span className="text-lg">👥</span>} />
        </div>

        <DashboardSection title="Staff by department">
          <BarChart items={d.byStaff} max={maxBar} barColor="bg-teal-600" />
        </DashboardSection>

        <DashboardSection title="Content view – Department directory">
          <p className="text-sm text-slate-500 mb-4">
            {allowCreate && "You can add departments (Admin). "}
            {allowUpdate && "You can edit (Admin). "}
            {allowDelete && "You can delete (Admin). "}
            {!allowCreate && !allowUpdate && "You have view-only access."}
          </p>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            <p className="font-medium text-slate-700">Department list and form</p>
            <p className="text-sm mt-1">Table and create/edit form will be implemented here.</p>
          </div>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}
