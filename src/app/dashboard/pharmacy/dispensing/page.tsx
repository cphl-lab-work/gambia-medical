"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead } from "@/helpers/module-permissions";
type DispensingOrder = {
  id: string;
  patientName: string;
  prescriptionRef: string;
  drugs: string;
  status: "Pending" | "Dispensed" | "Partial";
  requestedAt: string;
};

const SAMPLE_ORDERS: DispensingOrder[] = [
  { id: "D-001", patientName: "John Smith", prescriptionRef: "RX-8821", drugs: "Metformin 850mg, Omeprazole 20mg", status: "Pending", requestedAt: "2025-02-26 09:15" },
  { id: "D-002", patientName: "Mary Johnson", prescriptionRef: "RX-8819", drugs: "Amoxicillin 500mg", status: "Dispensed", requestedAt: "2025-02-26 08:45" },
  { id: "D-003", patientName: "Robert Davis", prescriptionRef: "RX-8815", drugs: "Losartan 50mg, Amlodipine 5mg, Paracetamol 500mg", status: "Partial", requestedAt: "2025-02-25 14:20" },
];

export default function PharmacyDispensingPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [orders] = useState<DispensingOrder[]>(SAMPLE_ORDERS);

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
            <h1 className="text-xl font-semibold text-slate-800">Dispensing</h1>
            <p className="text-sm text-slate-500 mt-1">
              Dispense medications against prescriptions. Mark orders as dispensed or partial.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Order ID</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Patient</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Prescription</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Drugs</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Requested</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{o.id}</td>
                    <td className="px-4 py-3 text-slate-700">{o.patientName}</td>
                    <td className="px-4 py-3 text-slate-600">{o.prescriptionRef}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{o.drugs}</td>
                    <td className="px-4 py-3 text-slate-500">{o.requestedAt}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          o.status === "Pending"
                            ? "px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-800"
                            : o.status === "Dispensed"
                              ? "px-2 py-0.5 text-xs font-medium rounded bg-emerald-100 text-emerald-700"
                              : "px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700"
                        }
                      >
                        {o.status}
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
