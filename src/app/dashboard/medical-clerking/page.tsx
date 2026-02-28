"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import Link from "next/link";
import patientClerkingSeed from "@/seed/data/patient-clerking.json";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import { canRead, canCreate, canUpdate, canDelete } from "@/helpers/module-permissions";
import { MetricCard, DonutChart, BarChart, DashboardSection } from "@/components/dashboard/DashboardCharts";
import RecentPatients from "@/components/patients/recent-patients";

/** Patient record for list and form. Nurse/receptionist see limited fields. */
interface PatientRecord {
  id: string;
  uhid: string;
  phone: string;
  name: string;
  age: number;
  gender: string;
  address: string;
  nextOfKin: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  countryCode?: string | null;
  district?: string | null;
  arrivalSource?: "OPD" | "Emergency Department" | "Elective Admission";
  email?: string;
  insuranceType: "self-pay" | "insurance";
  insurancePolicy?: string;
}

const FALLBACK_STATS = {
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

const SEED_PATIENTS: PatientRecord[] =
  (patientClerkingSeed as { patients?: PatientRecord[] }).patients ?? [];

function generateEncId(): string {
  const n = Math.floor(Math.random() * 90000) + 10000;
  return `ENC-${n}`;
}

export default function MedicalClerkingPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [stats, setStats] = useState<typeof FALLBACK_STATS | null>(null);
  const [patients, setPatients] = useState<PatientRecord[]>(SEED_PATIENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [patientsFilterInsurance, setPatientsFilterInsurance] = useState<"" | "self-pay" | "insurance">("");
  const [patientsFilterGender, setPatientsFilterGender] = useState<string>("");
  const [patientsSortBy, setPatientsSortBy] = useState<"name" | "id">("name");
  const patientsFilterRef = useRef<HTMLDivElement | null>(null);
  const [patientsFilterOpen, setPatientsFilterOpen] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [pendingEncId, setPendingEncId] = useState<string | null>(null);
  const [patientsActionRowId, setPatientsActionRowId] = useState<string | null>(null);
  const patientsActionRef = useRef<HTMLDivElement | null>(null);
  const [viewPatient, setViewPatient] = useState<PatientRecord | null>(null);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [newPatient, setNewPatient] = useState<Partial<PatientRecord>>({
    name: "",
    age: "",
    gender: "",
    address: "",
    nextOfKin: "",
    phone: "",
    countryCode: "UG",
    district: "",
    arrivalSource: "OPD",
    insuranceType: "self-pay",
    insurancePolicy: "",
  });

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
    setStats(FALLBACK_STATS);
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => {
        if (data.patients?.length) setPatients(data.patients);
      })
      .catch(() => {});
  }, [auth]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (patientsFilterRef.current && !patientsFilterRef.current.contains(e.target as Node)) {
        setPatientsFilterOpen(false);
      }
      if (
        patientsActionRef.current &&
        !patientsActionRef.current.contains(e.target as Node)
      ) {
        setPatientsActionRowId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const d = stats ?? FALLBACK_STATS;
  const totalSource = d.bySource.reduce((s, x) => s + x.value, 0);
  const maxBar = Math.max(...d.byStatus.map((r) => r.count), 1);
  const allowCreate = auth && canCreate(auth.role, "medical_clerking");
  const allowUpdate = auth && canUpdate(auth.role, "medical_clerking");
  const allowDelete = auth && canDelete(auth.role, "medical_clerking");
  const isNurseOrReceptionist = auth?.role === "nurse" || auth?.role === "receptionist";

  const countryOptions = SEED_COUNTRIES.map((c) => ({
    value: c.code,
    label: c.name,
  }));

  const ugandaDistrictOptions = UGANDA_DISTRICTS.map((d) => ({
    value: d.name,
    label: d.name,
  }));

  const openNewPatientPanel = () => {
    setEditingPatientId(null);
    setPendingEncId(generateEncId());
    setNewPatient({
      name: "",
      age: "",
      gender: "",
      address: "",
      nextOfKin: "",
      phone: "",
      countryCode: "UG",
      district: "",
      arrivalSource: "OPD",
      insuranceType: "self-pay",
      insurancePolicy: "",
    });
    setShowNewPatientForm(true);
  };

  const openEditPatientPanel = (patient: PatientRecord) => {
    setEditingPatientId(patient.id);
    setPendingEncId(patient.uhid);
    setNewPatient({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      address: patient.address,
      nextOfKin: patient.nextOfKin,
      nextOfKinPhone: patient.nextOfKinPhone ?? "",
      nextOfKinRelationship: patient.nextOfKinRelationship ?? "",
      phone: patient.phone,
      email: patient.email ?? "",
      countryCode: patient.countryCode ?? "UG",
      district: patient.district ?? "",
      arrivalSource: patient.arrivalSource ?? "OPD",
      insuranceType: patient.insuranceType,
      insurancePolicy: patient.insurancePolicy ?? "",
    });
    setPatientsActionRowId(null);
    setShowNewPatientForm(true);
  };

  const closeNewPatientPanel = () => {
    setShowNewPatientForm(false);
    setEditingPatientId(null);
  };

  const filteredPatients = useMemo(() => {
    let out = patients;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.uhid.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)
      );
    }
    if (patientsFilterInsurance) {
      out = out.filter((p) => p.insuranceType === patientsFilterInsurance);
    }
    if (patientsFilterGender) {
      out = out.filter((p) => p.gender === patientsFilterGender);
    }
    const sorted = [...out].sort((a, b) => {
      if (patientsSortBy === "id") {
        return a.id.localeCompare(b.id);
      }
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [patients, searchQuery, patientsFilterInsurance, patientsFilterGender, patientsSortBy]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const np = newPatient;
    if (!np.name || np.age === "" || !np.gender) return;

    const patientData: PatientRecord = {
      id: editingPatientId ?? `p${Date.now()}`,
      uhid: pendingEncId ?? generateEncId(),
      phone: np.phone ?? "",
      name: np.name,
      age: Number(np.age),
      gender: np.gender,
      address: np.address ?? "",
      nextOfKin: np.nextOfKin ?? "",
      nextOfKinPhone: np.nextOfKinPhone ?? "",
      nextOfKinRelationship: np.nextOfKinRelationship ?? "",
      arrivalSource: (np.arrivalSource as PatientRecord["arrivalSource"]) ?? "OPD",
      countryCode: np.countryCode ?? null,
      district: np.district ?? null,
      email: np.email ?? "",
      insuranceType: (np.insuranceType as "self-pay" | "insurance") ?? "self-pay",
      insurancePolicy: np.insuranceType === "insurance" ? np.insurancePolicy : undefined,
    };

    try {
      if (editingPatientId) {
        await fetch("/api/patients", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patient: patientData }),
        });
        setPatients((prev) =>
          prev.map((p) => (p.id === editingPatientId ? patientData : p)),
        );
      } else {
        await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patient: patientData }),
        });
        setPatients((prev) => [...prev, patientData]);
      }
    } catch (err) {
      console.error("Failed to save patient:", err);
    }

    setNewPatient({ name: "", age: "", gender: "", address: "", nextOfKin: "", phone: "", email: "", insuranceType: "self-pay", insurancePolicy: "" });
    setPendingEncId(null);
    setEditingPatientId(null);
    setShowNewPatientForm(false);
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

        {/* Patient at facility section removed as requested */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardSection title="Encounters by source">
            <DonutChart total={totalSource} segments={d.bySource} size={160} stroke={22} />
          </DashboardSection>
          <DashboardSection title="Documentation status">
            <BarChart items={d.byStatus} max={maxBar} barColor="bg-blue-600" />
          </DashboardSection>
        </div>

        <RecentPatients
          patients={patients}
          allowCreate={!allowCreate}
          onAddPatient={openNewPatientPanel}
          onEditPatient={openEditPatientPanel}
          onViewPatient={setViewPatient}
        />


      </div>
      {showNewPatientForm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeNewPatientPanel}
            aria-hidden
          />
          <div
            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
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
                onClick={closeNewPatientPanel}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreatePatient} className="flex-1 flex flex-col min-h-0">
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={newPatient.name ?? ""}
                        onChange={(e) =>
                          setNewPatient((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={newPatient.age ?? ""}
                        onChange={(e) =>
                          setNewPatient((p) => ({ ...p, age: e.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Gender *
                      </label>
                      <Select
                        classNamePrefix="rs"
                        options={[
                          { value: "", label: "Select" },
                          { value: "Male", label: "Male" },
                          { value: "Female", label: "Female" },
                          { value: "Other", label: "Other" },
                        ]}
                        value={
                          [
                            { value: "", label: "Select" },
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                            { value: "Other", label: "Other" },
                          ].find((o) => o.value === (newPatient.gender ?? "")) ?? {
                            value: "",
                            label: "Select",
                          }
                        }
                        onChange={(opt) =>
                          setNewPatient((p) => ({
                            ...p,
                            gender: opt?.value ?? "",
                          }))
                        }
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: "#e2e8f0",
                            minHeight: "38px",
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: "0 8px",
                          }),
                          input: (base) => ({ ...base, margin: 0 }),
                          indicatorSeparator: () => ({ display: "none" }),
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Country
                      </label>
                      <Select
                        classNamePrefix="rs"
                        options={countryOptions}
                        value={
                          countryOptions.find(
                            (o) => o.value === (newPatient.countryCode ?? "UG"),
                          ) ?? countryOptions[0]
                        }
                        onChange={(opt) =>
                          setNewPatient((p) => ({
                            ...p,
                            countryCode: opt?.value ?? "UG",
                            // reset district when country changes
                            district: opt?.value === "UG" ? p.district ?? "" : "",
                          }))
                        }
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: "#e2e8f0",
                            minHeight: "38px",
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: "0 8px",
                          }),
                          input: (base) => ({ ...base, margin: 0 }),
                          indicatorSeparator: () => ({ display: "none" }),
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        District
                      </label>
                      {newPatient.countryCode === "UG" ? (
                        <Select
                          classNamePrefix="rs"
                          options={ugandaDistrictOptions}
                          value={
                            ugandaDistrictOptions.find(
                              (o) => o.value === (newPatient.district ?? ""),
                            ) ?? null
                          }
                          onChange={(opt) =>
                            setNewPatient((p) => ({
                              ...p,
                              district: opt?.value ?? "",
                            }))
                          }
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderColor: "#e2e8f0",
                              minHeight: "38px",
                            }),
                            valueContainer: (base) => ({
                              ...base,
                              padding: "0 8px",
                            }),
                            input: (base) => ({ ...base, margin: 0 }),
                            indicatorSeparator: () => ({ display: "none" }),
                          }}
                        />
                      ) : (
                        <input
                          type="text"
                          value={newPatient.district ?? ""}
                          onChange={(e) =>
                            setNewPatient((p) => ({
                              ...p,
                              district: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          placeholder="District / region"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={newPatient.address ?? ""}
                      onChange={(e) =>
                        setNewPatient((p) => ({ ...p, address: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Phone
                      </label>
                      <div className="w-full rounded-lg border border-slate-200 text-sm">
                        <PhoneInput
                          country={"ug"}
                          value={newPatient.phone ?? ""}
                          onChange={(value) =>
                            setNewPatient((p) => ({ ...p, phone: value }))
                          }
                          inputClass="!w-full !h-[38px] !border-0 !text-sm !bg-transparent focus:!shadow-none"
                          buttonClass="!border-0 !bg-transparent"
                          containerClass="!w-full"
                          dropdownClass="!text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={newPatient.email ?? ""}
                        onChange={(e) =>
                          setNewPatient((p) => ({ ...p, email: e.target.value }))
                        }
                        placeholder="example@email.com"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Next of kin
                    </label>
                    <input
                      type="text"
                      value={newPatient.nextOfKin ?? ""}
                      onChange={(e) =>
                        setNewPatient((p) => ({ ...p, nextOfKin: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Next of kin phone
                      </label>
                      <div className="w-full rounded-lg border border-slate-200 text-sm">
                        <PhoneInput
                          country={"ug"}
                          value={newPatient.nextOfKinPhone ?? ""}
                          onChange={(value) =>
                            setNewPatient((p) => ({ ...p, nextOfKinPhone: value }))
                          }
                          inputClass="!w-full !h-[38px] !border-0 !text-sm !bg-transparent focus:!shadow-none"
                          buttonClass="!border-0 !bg-transparent"
                          containerClass="!w-full"
                          dropdownClass="!text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Relationship with patient
                      </label>
                      <Select
                        classNamePrefix="rs"
                        options={[
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
                        ]}
                        value={
                          [
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
                          ].find((o) => o.value === (newPatient.nextOfKinRelationship ?? "")) ?? {
                            value: "",
                            label: "Select",
                          }
                        }
                        onChange={(opt) =>
                          setNewPatient((p) => ({
                            ...p,
                            nextOfKinRelationship: opt?.value ?? "",
                          }))
                        }
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: "#e2e8f0",
                            minHeight: "38px",
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            padding: "0 8px",
                          }),
                          input: (base) => ({ ...base, margin: 0 }),
                          indicatorSeparator: () => ({ display: "none" }),
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="shrink-0 absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-6 py-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeNewPatientPanel}
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
      )}
      {viewPatient && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setViewPatient(null)}
            aria-hidden
          />
          <div
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800">Patient Details</h2>
              <button
                type="button"
                onClick={() => setViewPatient(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-bold">
                  {viewPatient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">{viewPatient.name}</h3>
                  <p className="text-sm text-slate-500">{viewPatient.uhid}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Age</p>
                    <p className="text-sm text-slate-800 mt-0.5">{viewPatient.age}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Gender</p>
                    <p className="text-sm text-slate-800 mt-0.5">{viewPatient.gender}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Phone</p>
                    <p className="text-sm text-slate-800 mt-0.5">{viewPatient.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Email</p>
                    <p className="text-sm text-slate-800 mt-0.5">{viewPatient.email || "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Address</p>
                  <p className="text-sm text-slate-800 mt-0.5">{viewPatient.address || "—"}</p>
                </div>
                {(viewPatient.countryCode || viewPatient.district) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Country</p>
                      <p className="text-sm text-slate-800 mt-0.5">
                        {SEED_COUNTRIES.find((c) => c.code === viewPatient.countryCode)?.name ?? viewPatient.countryCode ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">District</p>
                      <p className="text-sm text-slate-800 mt-0.5">{viewPatient.district || "—"}</p>
                    </div>
                  </div>
                )}
                <hr className="border-slate-100" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Next of Kin</p>
                  <p className="text-sm text-slate-800 mt-0.5">{viewPatient.nextOfKin || "—"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Next of Kin Phone</p>
                    <p className="text-sm text-slate-800 mt-0.5">{viewPatient.nextOfKinPhone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Relationship</p>
                    <p className="text-sm text-slate-800 mt-0.5">{viewPatient.nextOfKinRelationship || "—"}</p>
                  </div>
                </div>
                <hr className="border-slate-100" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Insurance</p>
                    <p className="text-sm text-slate-800 mt-0.5">
                      {viewPatient.insuranceType === "insurance" ? "Insurance" : "Self-pay"}
                    </p>
                  </div>
                  {viewPatient.insuranceType === "insurance" && viewPatient.insurancePolicy && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Policy</p>
                      <p className="text-sm text-slate-800 mt-0.5">{viewPatient.insurancePolicy}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-slate-200 px-6 py-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewPatient(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = viewPatient;
                  setViewPatient(null);
                  openEditPatientPanel(p);
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
