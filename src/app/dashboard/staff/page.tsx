"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

const FALLBACK = {
  total: 120,
  totalChange: 5,
  byRole: [
    { role: "Nurses", count: 35 },
    { role: "Receptionists", count: 12 },
    { role: "Lab techs", count: 8 },
    { role: "Pharmacists", count: 6 },
    { role: "Other", count: 59 },
  ],
};

export default function StaffPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "staff")) {
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
  const maxBar = Math.max(...d.byRole.map((r) => r.count), 1);
  const allowCreate = auth && canCreate(auth.role, "staff");
  const allowUpdate = auth && canUpdate(auth.role, "staff");
  const allowDelete = auth && canDelete(auth.role, "staff");

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
            <h1 className="text-xl font-semibold text-slate-800">Staff</h1>
            <p className="text-sm text-slate-500 mt-1">Staff directory and management (Admin only).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard title="Total staff" value={d.total} change={d.totalChange} icon={<span className="text-lg">👥</span>} />
          <MetricCard title="By role" value={d.byRole.length} change={0} icon={<span className="text-lg">📋</span>} />
        </div>

        <DashboardSection title="Staff by role">
          <BarChart items={d.byRole} max={maxBar} barColor="bg-slate-600" />
        </DashboardSection>

        <DashboardSection title="Content view – Staff directory">
          <p className="text-sm text-slate-500 mb-4">
            {allowCreate && "You can add staff. "}
            {allowUpdate && "You can edit. "}
            {allowDelete && "You can delete. "}
            This module is Admin-only for create, edit, delete.
          </p>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            <p className="font-medium text-slate-700">Staff list and management form</p>
            <p className="text-sm mt-1">Table and create/edit form will be implemented here.</p>
          </div>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}
