"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Select from "react-select";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface PatientRecord {
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
  createdAt?: string;
}

interface RecentPatientsProps {
  patients: PatientRecord[];
  allowCreate?: boolean;
  onAddPatient: () => void;
  onEditPatient: (patient: PatientRecord) => void;
  onViewPatient: (patient: PatientRecord) => void;
}

const INSURANCE_OPTS = [
  { value: "", label: "All" },
  { value: "self-pay", label: "Self-pay" },
  { value: "insurance", label: "Insurance" },
];

const GENDER_OPTS = [
  { value: "", label: "All" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const SORT_OPTS = [
  { value: "name", label: "Name A–Z" },
  { value: "id", label: "ID" },
];

const selectSmall = {
  control: (base: Record<string, unknown>) => ({ ...base, minHeight: "32px", borderColor: "#e2e8f0" }),
  valueContainer: (base: Record<string, unknown>) => ({ ...base, padding: "0 8px" }),
  input: (base: Record<string, unknown>) => ({ ...base, margin: 0 }),
  indicatorSeparator: () => ({ display: "none" as const }),
};

const selectSort = {
  control: (base: Record<string, unknown>) => ({ ...base, minHeight: "36px", borderColor: "#e2e8f0" }),
  valueContainer: (base: Record<string, unknown>) => ({ ...base, padding: "0 8px" }),
  input: (base: Record<string, unknown>) => ({ ...base, margin: 0 }),
  indicatorSeparator: () => ({ display: "none" as const }),
};

export default function RecentPatients({
  patients,
  allowCreate,
  onAddPatient,
  onEditPatient,
  onViewPatient,
}: RecentPatientsProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterInsurance, setFilterInsurance] = useState<"" | "self-pay" | "insurance">("");
  const [filterGender, setFilterGender] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "id">("name");
  const [filterOpen, setFilterOpen] = useState(false);
  const [actionRowId, setActionRowId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const actionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setActionRowId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    let out = patients;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.uhid.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q),
      );
    }
    if (filterInsurance) {
      out = out.filter((p) => p.insuranceType === filterInsurance);
    }
    if (filterGender) {
      out = out.filter((p) => p.gender === filterGender);
    }
    return [...out].sort((a, b) =>
      sortBy === "id" ? a.id.localeCompare(b.id) : a.name.localeCompare(b.name),
    );
  }, [patients, searchQuery, filterInsurance, filterGender, sortBy]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-base font-semibold text-slate-800">Recent Patients</h2>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/medical-clerking/patients"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View All &rarr;
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-slate-50/50 border-b border-slate-200">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, ID, phone…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={() => {}}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        <div ref={filterRef} className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Filter
          </button>
          {filterOpen && (
            <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-slate-200 rounded-lg shadow-lg z-20 p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Insurance</label>
                <Select
                  classNamePrefix="rs"
                  options={INSURANCE_OPTS}
                  value={INSURANCE_OPTS.find((o) => o.value === filterInsurance) ?? INSURANCE_OPTS[0]}
                  onChange={(opt) => setFilterInsurance((opt?.value as "" | "self-pay" | "insurance") ?? "")}
                  styles={selectSmall}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
                <Select
                  classNamePrefix="rs"
                  options={GENDER_OPTS}
                  value={GENDER_OPTS.find((o) => o.value === filterGender) ?? GENDER_OPTS[0]}
                  onChange={(opt) => setFilterGender(opt?.value ?? "")}
                  styles={selectSmall}
                />
              </div>
              {(filterInsurance || filterGender) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterInsurance("");
                    setFilterGender("");
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        <div className="min-w-[140px]">
          <Select
            classNamePrefix="rs"
            options={SORT_OPTS}
            value={SORT_OPTS.find((o) => o.value === sortBy) ?? SORT_OPTS[0]}
            onChange={(opt) => setSortBy((opt?.value as "name" | "id") ?? "name")}
            styles={selectSort}
          />
        </div>

        {allowCreate && (
          <button
            type="button"
            onClick={onAddPatient}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New patient
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
              <th className="pb-3 pt-4 px-4">Name</th>
              <th className="pb-3 pt-4 px-4">ID number</th>
              <th className="pb-3 pt-4 px-4">Phone</th>
              <th className="pb-3 pt-4 px-4">Next of Kin</th>
              <th className="pb-3 pt-4 px-4">Registration Date</th>
              <th className="pb-3 pt-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  {searchQuery ? "No patients match your search." : "No patients yet."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">{p.name}</td>
                  <td className="py-3 px-4 text-slate-600">{p.uhid}</td>
                  <td className="py-3 px-4 text-slate-600">{p.phone}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {p.nextOfKin ? `${p.nextOfKin}${p.nextOfKinRelationship ? ` (${p.nextOfKinRelationship})` : ""}` : "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div
                      ref={actionRowId === p.id ? actionRef : null}
                      className="relative inline-block text-left"
                    >
                      <button
                        type="button"
                        onClick={() => setActionRowId(actionRowId === p.id ? null : p.id)}
                        className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
                        aria-label="Patient actions"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                        </svg>
                      </button>
                      {actionRowId === p.id && (
                        <div className="absolute right-0 mt-1 w-40 origin-top-right rounded-lg border border-slate-200 bg-white shadow-lg z-30 py-1">
                          <button
                            type="button"
                            onClick={() => {
                              onViewPatient(p);
                              setActionRowId(null);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onEditPatient(p);
                              setActionRowId(null);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Edit Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              sessionStorage.setItem(`opd_patient_${p.id}`, JSON.stringify(p));
                              setActionRowId(null);
                              router.push(`/dashboard/medical-clerking/opd?patientId=${p.id}`);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            Start OPD
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
