"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

const FALLBACK = {
  total: 45,
  totalChange: 2,
  active: 42,
  activeChange: 1,
  byRole: [
    { label: "Admin", value: 2, color: "#64748b" },
    { label: "Doctor", value: 12, color: "#3b82f6" },
    { label: "Nurse", value: 15, color: "#10b981" },
    { label: "Receptionist", value: 5, color: "#f59e0b" },
    { label: "Other", value: 11, color: "#94a3b8" },
  ],
  byStatus: [
    { role: "Active", count: 42 },
    { role: "Inactive", count: 3 },
  ],
};

export default function UsersPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "user_management")) {
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
  const totalRole = d.byRole.reduce((s, x) => s + x.value, 0);
  const maxBar = Math.max(...d.byStatus.map((r) => r.count), 1);
  const allowCreate = auth && canCreate(auth.role, "user_management");
  const allowUpdate = auth && canUpdate(auth.role, "user_management");
  const allowDelete = auth && canDelete(auth.role, "user_management");

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
            <h1 className="text-xl font-semibold text-slate-800">User Management</h1>
            <p className="text-sm text-slate-500 mt-1">System users, roles, and access (Admin only).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total users" value={d.total} change={d.totalChange} icon={<span className="text-lg">👥</span>} />
          <MetricCard title="Active" value={d.active} change={d.activeChange} icon={<span className="text-lg">✓</span>} />
          <MetricCard title="By role" value={totalRole} change={d.totalChange} icon={<span className="text-lg">📋</span>} />
          <MetricCard title="Inactive" value={d.byStatus[1]?.count ?? 0} change={0} icon={<span className="text-lg">🚫</span>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection title="Users by role">
            <DonutChart total={totalRole} segments={d.byRole} size={160} stroke={22} />
          </DashboardSection>
          <DashboardSection title="By status">
            <BarChart items={d.byStatus} max={maxBar} barColor="bg-slate-600" />
          </DashboardSection>
        </div>

        <DashboardSection title="Content view – User list">
          <p className="text-sm text-slate-500 mb-4">
            {allowCreate && "You can add users. "}
            {allowUpdate && "You can edit roles and permissions. "}
            {allowDelete && "You can deactivate or delete. "}
            This module is Admin-only.
          </p>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            <p className="font-medium text-slate-700">User list and form</p>
            <p className="text-sm mt-1">Table and create/edit form will be implemented here.</p>
          </div>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}
