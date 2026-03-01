"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getStoredFacilities, getStoredAuth } from "@/helpers/local-storage";
import type { StaffRecord } from "./recent-staff";

const ROLE_OPTS = [
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "receptionist", label: "Receptionist" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "lab_technician", label: "Lab Technician" },
  { value: "other", label: "Other" },
];

const selectStyles = {
  control: (base: Record<string, unknown>) => ({ ...base, borderColor: "#e2e8f0", minHeight: "38px" }),
  valueContainer: (base: Record<string, unknown>) => ({ ...base, padding: "0 8px" }),
  input: (base: Record<string, unknown>) => ({ ...base, margin: 0 }),
  indicatorSeparator: () => ({ display: "none" as const }),
};

export interface NewStaffFormProps {
  initial?: Partial<StaffRecord>;
  onSave: (s: StaffRecord) => void;
  onClose: () => void;
}

export default function NewStaffForm({ initial, onSave, onClose }: NewStaffFormProps) {
  const [form, setForm] = useState<Partial<StaffRecord> & { firstName?: string; lastName?: string }>(() => {
    const base: Partial<StaffRecord> = { phone: "", email: "", role: "", department: "", ...initial };
    const fullName = (initial?.name ?? "").trim();
    const parts = fullName ? fullName.split(" ") : [];
    return {
      ...base,
      firstName: parts.length ? parts[0] : "",
      lastName: parts.length > 1 ? parts.slice(1).join(" ") : "",
    };
  });

  const [facilities, setFacilities] = useState<{ id: string; name: string }[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);

  useEffect(() => {
    const f = getStoredFacilities();
    setFacilities(f.map((x) => ({ id: x.id, name: x.name })));
    const auth = getStoredAuth();
    if (f.length === 1) setSelectedFacility(f[0].id);
    // if auth exists and has staffId or other info we could filter, but show all facilities for now
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const first = (form.firstName ?? "").trim();
    const last = (form.lastName ?? "").trim();
    if (!first || !last) return;
    const staff: StaffRecord = {
      id: `s${Date.now()}`,
      staffCode: `ST-${Date.now().toString().slice(-6)}`,
      name: `${first} ${last}`,
      phone: form.phone || "",
      email: form.email || "",
      role: form.role || "",
      department: form.department || "",
      createdAt: new Date().toISOString(),
    };
    // attach facility info on save via sync or API caller
    onSave(staff);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">New staff</h2>
            <p className="text-sm text-slate-500 mt-0">Register a new staff member and assign to a facility.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 pb-28">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First name *</label>
                    <input type="text" value={form.firstName ?? ""} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last name *</label>
                    <input type="text" value={form.lastName ?? ""} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <Select classNamePrefix="rs" options={ROLE_OPTS} value={ROLE_OPTS.find((o) => o.value === (form.role ?? "")) ?? null} onChange={(opt) => setForm((p) => ({ ...p, role: opt?.value ?? "" }))} styles={selectStyles} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <div className="w-full rounded-lg border border-slate-200 text-sm">
                    <PhoneInput country={"ug"} value={form.phone ?? ""} onChange={(value) => setForm((p) => ({ ...p, phone: value }))} inputClass="!w-full !h-[38px] !border-0 !text-sm !bg-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={form.email ?? ""} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input type="text" value={form.department ?? ""} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>

              {facilities.length > 1 ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Facility</label>
                  <Select classNamePrefix="rs" options={facilities.map((f) => ({ value: f.id, label: f.name }))} value={facilities.find((f) => f.id === selectedFacility) ? { value: selectedFacility, label: facilities.find((f) => f.id === selectedFacility)!.name } : null} onChange={(opt) => setSelectedFacility((opt as any)?.value ?? null)} styles={selectStyles} />
                </div>
              ) : facilities.length === 1 ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Facility</label>
                  <div className="text-sm text-slate-700">{facilities[0].name}</div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Facility</label>
                  <div className="text-sm text-slate-500">No facilities available</div>
                </div>
              )}

            </div>
          </div>

          <div className="shrink-0 absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-6 py-3 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Save staff</button>
          </div>
        </form>
      </div>
    </>
  );
}
