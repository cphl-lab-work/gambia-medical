"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getStoredAuth,
  getStoredIpdAdmissions,
  setStoredIpdAdmissions,
  type IpdAdmission,
  type IpdAdmissionStatus,
} from "@/helpers/local-storage";

const STATUS_COLORS: Record<IpdAdmissionStatus, string> = {
  admitted: "bg-emerald-100 text-emerald-700",
  discharged: "bg-slate-100 text-slate-600",
  transferred: "bg-blue-100 text-blue-700",
};

const STATUS_LABELS: Record<IpdAdmissionStatus, string> = {
  admitted: "Admitted",
  discharged: "Discharged",
  transferred: "Transferred",
};

export default function IpdPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string; name: string } | null>(null);
  const [admissions, setAdmissions] = useState<IpdAdmission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<IpdAdmissionStatus | "">("");
  const [confirmDischarge, setConfirmDischarge] = useState<IpdAdmission | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    setAuth({ role: a.role, name: a.name });
    setAdmissions(getStoredIpdAdmissions());
  }, [router]);

  const filtered = useMemo(() => {
    let out = admissions;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.patientUhid.toLowerCase().includes(q) ||
          a.ward.toLowerCase().includes(q) ||
          a.bedNumber.toLowerCase().includes(q) ||
          a.admittingDoctor.toLowerCase().includes(q),
      );
    }
    if (filterStatus) {
      out = out.filter((a) => a.status === filterStatus);
    }
    return [...out].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [admissions, searchQuery, filterStatus]);

  const counts = useMemo(
    () => ({
      admitted: admissions.filter((a) => a.status === "admitted").length,
      discharged: admissions.filter((a) => a.status === "discharged").length,
      transferred: admissions.filter((a) => a.status === "transferred").length,
    }),
    [admissions],
  );

  const handleDischarge = (admission: IpdAdmission) => {
    const updated = admissions.map((a) =>
      a.id === admission.id
        ? {
            ...a,
            status: "discharged" as IpdAdmissionStatus,
            dischargeDate: new Date().toISOString().split("T")[0],
          }
        : a,
    );
    setAdmissions(updated);
    setStoredIpdAdmissions(updated);
    setConfirmDischarge(null);
  };

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">IPD — Inpatient Department</h1>
            <p className="text-sm text-slate-500 mt-1">Manage admitted patients and ward beds.</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/ipd/admit")}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Admission
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["admitted", "discharged", "transferred"] as IpdAdmissionStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={`rounded-xl border p-4 text-left transition-all ${
                filterStatus === s
                  ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                {STATUS_LABELS[s]}
              </p>
              <p className="text-3xl font-bold text-slate-800">{counts[s]}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search patient, ward, doctor…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {filterStatus && (
            <button
              onClick={() => setFilterStatus("")}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filter
            </button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Ward / Bed</th>
                  <th className="px-4 py-3 text-left">Admitting Doctor</th>
                  <th className="px-4 py-3 text-left">Diagnosis</th>
                  <th className="px-4 py-3 text-left">Admitted</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      {searchQuery || filterStatus
                        ? "No admissions match your search."
                        : "No IPD admissions recorded yet."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{a.patientName}</div>
                        <div className="text-xs text-slate-500">{a.patientUhid}</div>
                        {a.patientGender && (
                          <div className="text-xs text-slate-400">{a.patientGender}{a.patientAge ? `, ${a.patientAge}y` : ""}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700">{a.ward}</div>
                        <div className="text-xs text-slate-500">Bed {a.bedNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{a.admittingDoctor}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[180px]">
                        <span className="line-clamp-2">{a.diagnosis}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        <div>{a.admissionDate}</div>
                        <div className="text-xs text-slate-400">{a.admissionTime}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status]}`}
                        >
                          {STATUS_LABELS[a.status]}
                        </span>
                        {a.dischargeDate && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            Discharged {a.dischargeDate}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.status === "admitted" && (
                          <button
                            onClick={() => setConfirmDischarge(a)}
                            className="text-sm font-medium text-amber-600 hover:text-amber-700"
                          >
                            Discharge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Discharge confirmation modal */}
      {confirmDischarge && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Confirm Discharge</h2>
            <p className="text-sm text-slate-600 mb-6">
              Discharge <strong>{confirmDischarge.patientName}</strong> from{" "}
              <strong>{confirmDischarge.ward}</strong>, Bed {confirmDischarge.bedNumber}?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDischarge(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDischarge(confirmDischarge)}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
              >
                Discharge
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
