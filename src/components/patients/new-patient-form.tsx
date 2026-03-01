"use client";

import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import patientClerkingSeed from "@/seed/data/patient-clerking.json";
import type { PatientRecord } from "./recent-patients";

type CountrySeed = { code: string; name: string };
type UgandaDistrictSeed = { name: string; subCounties: string[] };

const SEED_COUNTRIES = (patientClerkingSeed as { countries?: CountrySeed[] }).countries ?? [
  { code: "UG", name: "Uganda" },
  { code: "TZ", name: "Tanzania" },
  { code: "KE", name: "Kenya" },
];

const UGANDA_DISTRICTS =
  (patientClerkingSeed as { ugandaDistricts?: UgandaDistrictSeed[] }).ugandaDistricts ??
  ([] as UgandaDistrictSeed[]);

const GENDER_OPTIONS = [
  { value: "", label: "Select" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "", label: "Select" },
  { value: "Spouse", label: "Spouse" },
  { value: "Parent", label: "Parent" },
  { value: "Child", label: "Child" },
  { value: "Sibling", label: "Sibling" },
  { value: "Grandparent", label: "Grandparent" },
  { value: "Uncle/Aunt", label: "Uncle/Aunt" },
  { value: "Cousin", label: "Cousin" },
  { value: "Friend", label: "Friend" },
  { value: "Other", label: "Other" },
];

const selectStyles = {
  control: (base: Record<string, unknown>) => ({ ...base, borderColor: "#e2e8f0", minHeight: "38px" }),
  valueContainer: (base: Record<string, unknown>) => ({ ...base, padding: "0 8px" }),
  input: (base: Record<string, unknown>) => ({ ...base, margin: 0 }),
  indicatorSeparator: () => ({ display: "none" as const }),
};

export interface NewPatientFormProps {
  editingPatientId: string | null;
  pendingEncId: string | null;
  initialData?: Partial<PatientRecord>;
  onSave: (patient: PatientRecord) => void;
  onClose: () => void;
}

export default function NewPatientForm({
  editingPatientId,
  pendingEncId,
  initialData,
  onSave,
  onClose,
}: NewPatientFormProps) {
  const [form, setForm] = useState<Partial<PatientRecord>>({
    name: "",
    age: 0,
    gender: "",
    address: "",
    nextOfKin: "",
    phone: "",
    countryCode: "UG",
    district: "",
    arrivalSource: "OPD",
    insuranceType: "self-pay",
    insurancePolicy: "",
    ...initialData,
  });

  const countryOptions = SEED_COUNTRIES.map((c) => ({ value: c.code, label: c.name }));
  const ugandaDistrictOptions = UGANDA_DISTRICTS.map((d) => ({ value: d.name, label: d.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.gender) return;

    const patient: PatientRecord = {
      id: editingPatientId ?? `p${Date.now()}`,
      uhid: pendingEncId ?? "",
      phone: form.phone ?? "",
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      address: form.address ?? "",
      nextOfKin: form.nextOfKin ?? "",
      nextOfKinPhone: form.nextOfKinPhone ?? "",
      nextOfKinRelationship: form.nextOfKinRelationship ?? "",
      arrivalSource: (form.arrivalSource as PatientRecord["arrivalSource"]) ?? "OPD",
      countryCode: form.countryCode ?? null,
      district: form.district ?? null,
      email: form.email ?? "",
      insuranceType: (form.insuranceType as "self-pay" | "insurance") ?? "self-pay",
      insurancePolicy: form.insuranceType === "insurance" ? form.insurancePolicy : undefined,
    };

    onSave(patient);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 mt-0"
        style={{ marginTop: 0 }}
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col mt-0"
        style={{ marginTop: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {editingPatientId ? "Edit patient" : "New patient"}
            </h2>
            <p className="text-sm text-slate-500 mt-0">
              {editingPatientId
                ? "Update patient demographics."
                : "Record simple patient demographics for medical clerking."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 pb-28">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Patient ID / UHID
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={pendingEncId ?? "(assigned on save)"}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    min={0}
                    value={form.age || ""}
                    onChange={(e) => setForm((p) => ({ ...p, age: Number(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                  <Select
                    classNamePrefix="rs"
                    options={GENDER_OPTIONS}
                    value={GENDER_OPTIONS.find((o) => o.value === (form.gender ?? "")) ?? GENDER_OPTIONS[0]}
                    onChange={(opt) => setForm((p) => ({ ...p, gender: opt?.value ?? "" }))}
                    styles={selectStyles}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <Select
                    classNamePrefix="rs"
                    options={countryOptions}
                    value={countryOptions.find((o) => o.value === (form.countryCode ?? "UG")) ?? countryOptions[0]}
                    onChange={(opt) =>
                      setForm((p) => ({
                        ...p,
                        countryCode: opt?.value ?? "UG",
                        district: opt?.value === "UG" ? p.district ?? "" : "",
                      }))
                    }
                    styles={selectStyles}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                  {form.countryCode === "UG" ? (
                    <Select
                      classNamePrefix="rs"
                      options={ugandaDistrictOptions}
                      value={ugandaDistrictOptions.find((o) => o.value === (form.district ?? "")) ?? null}
                      onChange={(opt) => setForm((p) => ({ ...p, district: opt?.value ?? "" }))}
                      styles={selectStyles}
                    />
                  ) : (
                    <input
                      type="text"
                      value={form.district ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="District / region"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <div className="w-full rounded-lg border border-slate-200 text-sm">
                    <PhoneInput
                      country={"ug"}
                      value={form.phone ?? ""}
                      onChange={(value) => setForm((p) => ({ ...p, phone: value }))}
                      inputClass="!w-full !h-[38px] !border-0 !text-sm !bg-transparent focus:!shadow-none"
                      buttonClass="!border-0 !bg-transparent"
                      containerClass="!w-full"
                      dropdownClass="!text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                  <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="example@email.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Next of kin</label>
                <input
                  type="text"
                  value={form.nextOfKin ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, nextOfKin: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Next of kin phone</label>
                  <div className="w-full rounded-lg border border-slate-200 text-sm">
                    <PhoneInput
                      country={"ug"}
                      value={form.nextOfKinPhone ?? ""}
                      onChange={(value) => setForm((p) => ({ ...p, nextOfKinPhone: value }))}
                      inputClass="!w-full !h-[38px] !border-0 !text-sm !bg-transparent focus:!shadow-none"
                      buttonClass="!border-0 !bg-transparent"
                      containerClass="!w-full"
                      dropdownClass="!text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Relationship with patient</label>
                  <Select
                    classNamePrefix="rs"
                    options={RELATIONSHIP_OPTIONS}
                    value={RELATIONSHIP_OPTIONS.find((o) => o.value === (form.nextOfKinRelationship ?? "")) ?? RELATIONSHIP_OPTIONS[0]}
                    onChange={(opt) => setForm((p) => ({ ...p, nextOfKinRelationship: opt?.value ?? "" }))}
                    styles={selectStyles}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="shrink-0 absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-6 py-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              {editingPatientId ? "Update patient" : "Save patient"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
