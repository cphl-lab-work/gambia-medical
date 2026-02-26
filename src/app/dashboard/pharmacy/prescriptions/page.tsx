"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead } from "@/helpers/module-permissions";
type Prescription = {
  id: string;
  patientName: string;
  doctor: string;
  drugCount: number;
  status: "Pending" | "Dispensed" | "Partial" | "Cancelled";
  date: string;
};

const SAMPLE_PRESCRIPTIONS: Prescription[] = [
  { id: "RX-8821", patientName: "John Smith", doctor: "Dr. Sarah Wilson", drugCount: 2, status: "Pending", date: "2025-02-26" },
  { id: "RX-8820", patientName: "Mary Johnson", doctor: "Dr. Sarah Wilson", drugCount: 1, status: "Dispensed", date: "2025-02-26" },
  { id: "RX-8819", patientName: "Robert Davis", doctor: "Dr. James Lee", drugCount: 3, status: "Partial", date: "2025-02-25" },
  { id: "RX-8818", patientName: "Anna Brown", doctor: "Dr. Sarah Wilson", drugCount: 2, status: "Dispensed", date: "2025-02-25" },
];

export default function PharmacyPrescriptionsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [prescriptions] = useState<Prescription[]>(SAMPLE_PRESCRIPTIONS);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (!canRead(a.role, "pharmacy")) {
      router.replace("/dashboard");
      return;
    }
    setAuth({ role: a.role });
  }, [router]);

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Prescriptions</h1>
            <p className="text-sm text-slate-500 mt-1">
              View and manage prescriptions sent to the pharmacy for dispensing.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Prescription ID</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Patient</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Prescribing doctor</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-700">Drugs</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.id}</td>
                    <td className="px-4 py-3 text-slate-700">{p.patientName}</td>
                    <td className="px-4 py-3 text-slate-600">{p.doctor}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">{p.drugCount}</td>
                    <td className="px-4 py-3 text-slate-500">{p.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.status === "Pending"
                            ? "px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800"
                            : p.status === "Dispensed"
                              ? "px-2 py-0.5 text-xs font-medium rounded bg-emerald-100 text-emerald-700"
                              : p.status === "Partial"
                                ? "px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700"
                                : "px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600"
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
