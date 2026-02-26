"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import {
  getPatientDataAccessConfig,
  setPatientDataAccessConfig,
  type PatientDataAccessConfig,
  type PatientDataCategory,
} from "@/helpers/local-storage";
import Link from "next/link";

const PATIENT_DATA_CATEGORIES: { id: PatientDataCategory; label: string }[] = [
  { id: "demographics", label: "Demographics" },
  { id: "clinical_notes", label: "Clinical notes" },
  { id: "lab_results", label: "Lab results" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "billing", label: "Billing" },
];

const ROLES = ["admin", "doctor", "nurse", "receptionist", "accountant", "pharmacist", "lab_tech"];

export default function SettingsPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<ReturnType<typeof getStoredAuth>>(null);
  const [config, setConfig] = useState<PatientDataAccessConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    setAuth(a);
    setConfig(getPatientDataAccessConfig());
  }, []);

  const isAdmin = auth?.role === "admin";

  const handleToggle = (category: PatientDataCategory, role: string, type: "view" | "edit") => {
    if (!config || !isAdmin) return;
    const entry = config[category];
    const arr = entry[type];
    const next = arr.includes(role) ? arr.filter((r) => r !== role) : [...arr, role];
    setConfig({
      ...config,
      [category]: { ...entry, [type]: next },
    });
  };

  const handleSave = () => {
    if (config) {
      setPatientDataAccessConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
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
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Preferences and roles & permissions for patient data access.</p>
          </div>
        </div>

        {/* Roles & permissions – who accesses which patient data */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-800 mb-2">Roles and permissions – Patient data access</h2>
          <p className="text-sm text-slate-500 mb-4">
            Control which roles can view and edit each type of patient data. Only admins can change these settings.
          </p>
          {config && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-left">
                      <th className="pb-3 pr-4 font-medium">Patient data</th>
                      {ROLES.map((role) => (
                        <th key={role} className="pb-3 px-2 text-center capitalize">
                          {role.replace("_", " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PATIENT_DATA_CATEGORIES.map((cat) => (
                      <tr key={cat.id} className="border-b border-slate-100">
                        <td className="py-3 pr-4 font-medium text-slate-800">{cat.label}</td>
                        {ROLES.map((role) => {
                          const entry = config[cat.id];
                          const canView = entry.view.includes(role);
                          const canEdit = entry.edit.includes(role);
                          return (
                            <td key={role} className="py-3 px-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {isAdmin ? (
                                  <>
                                    <label className="flex items-center gap-1">
                                      <input
                                        type="checkbox"
                                        checked={canView}
                                        onChange={() => handleToggle(cat.id, role, "view")}
                                        className="rounded border-slate-300"
                                      />
                                      <span className="text-xs">View</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                      <input
                                        type="checkbox"
                                        checked={canEdit}
                                        onChange={() => handleToggle(cat.id, role, "edit")}
                                        className="rounded border-slate-300"
                                      />
                                      <span className="text-xs">Edit</span>
                                    </label>
                                  </>
                                ) : (
                                  <span className="text-xs text-slate-600">
                                    {canView ? (canEdit ? "View, Edit" : "View") : "—"}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {isAdmin && (
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Save permissions
                  </button>
                  {saved && <span className="text-sm text-emerald-600">Saved.</span>}
                </div>
              )}
            </>
          )}
        </div>

        {/* General settings placeholder */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-800 mb-2">General</h2>
          <p className="text-sm text-slate-500 mb-4">Notifications, language, and display preferences.</p>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-slate-300" />
              <span className="text-sm text-slate-700">Email notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-slate-300" />
              <span className="text-sm text-slate-700">In-app notifications</span>
            </label>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
