"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth, getStoredPatients, setStoredPatients } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import RecentPatients from "@/components/patients/recent-patients";
import NewPatientForm from "@/components/patients/new-patient-form";
import Link from "next/link";

const FALLBACK = {
  total: 3550,
  totalChange: 150,
  newThisMonth: 120,
  newChange: 12,
  byStatus: [
    { label: "Active", value: 2800, color: "#10b981" },
    { label: "Inactive", value: 550, color: "#94a3b8" },
    { label: "Archived", value: 200, color: "#64748b" },
  ],
  bySource: [
    { role: "OPD", count: 2100 },
    { role: "Emergency", count: 800 },
    { role: "Elective", count: 650 },
  ],
};

export default function PatientsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "patients")) {
      router.replace("/dashboard");
      return;
    }
    setAuth({ role: a.role });
  }, [router]);

  useEffect(() => {
    if (!auth) return;
    const stored = getStoredPatients();
    if (stored && stored.length) setPatients(stored as any[]);
  }, [auth]);

  useEffect(() => {
    if (!auth) return;
    setStats(FALLBACK);
  }, [auth]);

  const d = stats ?? FALLBACK;
  const totalStatus = d.byStatus.reduce((s, x) => s + x.value, 0);
  const maxBar = Math.max(...d.bySource.map((r) => r.count), 1);
  const allowCreate = auth && (canCreate(auth.role, "patients") || auth.role === "nurse");
  const allowUpdate = auth && canUpdate(auth.role, "patients");
  const allowDelete = auth && canDelete(auth.role, "patients");

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
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Patients</h1>
          <p className="text-sm text-slate-500 mt-1">Patient registry: view and manage patient records.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total patients" value={d.total.toLocaleString()} change={d.totalChange} icon={<span className="text-lg">👤</span>} />
          <MetricCard title="New this month" value={d.newThisMonth} change={d.newChange} icon={<span className="text-lg">📥</span>} />
          <MetricCard title="By status" value={totalStatus.toLocaleString()} change={d.totalChange} icon={<span className="text-lg">📋</span>} />
          <MetricCard title="Active" value={d.byStatus[0]?.value.toLocaleString() ?? "0"} change={d.totalChange} icon={<span className="text-lg">✓</span>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection title="Patients by status">
            <DonutChart total={totalStatus} segments={d.byStatus} size={160} stroke={22} />
          </DashboardSection>
          <DashboardSection title="By registration source">
            <BarChart items={d.bySource} max={maxBar} barColor="bg-blue-600" />
          </DashboardSection>
        </div>

        <DashboardSection title="Registered Patients">
          <RecentPatients
            patients={patients}
            allowCreate={!!allowCreate}
            onAddPatient={() => setShowNewPatient(true)}
            onEditPatient={(p) => {
              setEditingPatient(p);
              setShowNewPatient(true);
            }}
            onViewPatient={(p) => router.push(`/dashboard/medical-clerking?view=${p.id}`)}
          />
        </DashboardSection>
        {showNewPatient && (
          <NewPatientForm
            editingPatientId={editingPatient?.id ?? null}
            pendingEncId={editingPatient?.uhid ?? null}
            initialData={editingPatient || undefined}
            onSave={(p) => {
              const next = editingPatient
                ? patients.map((x) => (x.id === p.id ? p : x))
                : [...patients, p];
              setPatients(next);
              setStoredPatients(next);
              setShowNewPatient(false);
              setEditingPatient(null);
            }}
            onClose={() => {
              setShowNewPatient(false);
              setEditingPatient(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
