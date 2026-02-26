"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

const FALLBACK = {
  vitalsToday: 42,
  vitalsChange: 12,
  pending: 8,
  pendingChange: -3,
  completed: 34,
  completedChange: 8,
  byStatus: [
    { label: "Completed", value: 34, color: "#10b981" },
    { label: "Pending", value: 8, color: "#f59e0b" },
    { label: "In progress", value: 5, color: "#3b82f6" },
  ],
  byHour: [
    { role: "08:00", count: 6 },
    { role: "09:00", count: 12 },
    { role: "10:00", count: 9 },
    { role: "11:00", count: 7 },
  ],
};

export default function TriagePage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "triage")) {
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
  const totalTriage = d.byStatus.reduce((s, x) => s + x.value, 0);
  const maxBar = Math.max(...d.byHour.map((r) => r.count), 1);
  const allowCreate = auth && canCreate(auth.role, "triage");
  const allowUpdate = auth && canUpdate(auth.role, "triage");
  const allowDelete = auth && canDelete(auth.role, "triage");

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
            <h1 className="text-xl font-semibold text-slate-800">Triage & Registration (Clinical)</h1>
            <p className="text-sm text-slate-500 mt-1">
              Nursing staff performs initial triage and records vital signs: Unique Patient ID, Name, Age, DOB, Gender, Weight, BP, HR, Temp, RR, SpO2, Height/Weight.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Vitals recorded today" value={d.vitalsToday} change={d.vitalsChange} icon={<span className="text-lg">🩺</span>} />
          <MetricCard title="Pending triage" value={d.pending} change={d.pendingChange} icon={<span className="text-lg">⏳</span>} />
          <MetricCard title="Completed today" value={d.completed} change={d.completedChange} icon={<span className="text-lg">✓</span>} />
          <MetricCard title="Total (today)" value={totalTriage} change={d.completedChange} icon={<span className="text-lg">📋</span>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection title="Triage by status">
            <DonutChart total={totalTriage} segments={d.byStatus} size={160} stroke={22} />
          </DashboardSection>
          <DashboardSection title="Vitals by hour">
            <BarChart items={d.byHour} max={maxBar} barColor="bg-emerald-600" />
          </DashboardSection>
        </div>

        <DashboardSection title="Content view – Triage records">
          <p className="text-sm text-slate-500 mb-4">
            {allowCreate && "You can create new triage records. "}
            {allowUpdate && "You can edit existing records. "}
            {allowDelete && "You can delete records (Admin). "}
            {!allowCreate && !allowUpdate && "You have view-only access."}
          </p>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            <p className="font-medium text-slate-700">Vitals & triage form</p>
            <p className="text-sm mt-1">Form and list view will be implemented here (EMR integration).</p>
          </div>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}
