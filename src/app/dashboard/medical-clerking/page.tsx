"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import Link from "next/link";

const FALLBACK = {
  encountersToday: 18,
  encountersChange: 5,
  withDiagnosis: 12,
  diagnosisChange: 4,
  bySource: [
    { label: "Emergency", value: 6, color: "#ef4444" },
    { label: "OPD", value: 9, color: "#3b82f6" },
    { label: "Transfer", value: 3, color: "#10b981" },
  ],
  byStatus: [
    { role: "New", count: 18 },
    { role: "HPC documented", count: 14 },
    { role: "Diagnosis entered", count: 12 },
  ],
};

export default function MedicalClerkingPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "medical_clerking")) {
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
  const totalSource = d.bySource.reduce((s, x) => s + x.value, 0);
  const maxBar = Math.max(...d.byStatus.map((r) => r.count), 1);
  const allowCreate = auth && canCreate(auth.role, "medical_clerking");
  const allowUpdate = auth && canUpdate(auth.role, "medical_clerking");
  const allowDelete = auth && canDelete(auth.role, "medical_clerking");

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
            <h1 className="text-xl font-semibold text-slate-800">Medical Clerking</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Encounters today" value={d.encountersToday} change={d.encountersChange} icon={<span className="text-lg">📋</span>} />
          <MetricCard title="With diagnosis" value={d.withDiagnosis} change={d.diagnosisChange} icon={<span className="text-lg">🩺</span>} />
          <MetricCard title="By source (total)" value={totalSource} change={d.encountersChange} icon={<span className="text-lg">📥</span>} />
          <MetricCard title="HPC documented" value={d.byStatus[1]?.count ?? 0} change={4} icon={<span className="text-lg">✓</span>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection title="Encounters by source">
            <DonutChart total={totalSource} segments={d.bySource} size={160} stroke={22} />
          </DashboardSection>
          <DashboardSection title="Documentation status">
            <BarChart items={d.byStatus} max={maxBar} barColor="bg-blue-600" />
          </DashboardSection>
        </div>

        <DashboardSection title="Content view – Medical clerking & encounters">
          <p className="text-sm text-slate-500 mb-4">
            {allowCreate && "You can create new encounters. "}
            {allowUpdate && "You can edit encounters. "}
            {allowDelete && "You can delete (Admin). "}
            {!allowCreate && !allowUpdate && "You have view-only access."}
          </p>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            <p className="font-medium text-slate-700">Encounter form, HPC, PMH, medications</p>
            <p className="text-sm mt-1">Full form and encounter list will be implemented here.</p>
          </div>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}
