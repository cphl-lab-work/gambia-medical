"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import Select from "react-select";

interface PatientRecord {
  id: string;
  uhid: string;
  phone: string;
  nationalId: string;
  name: string;
  age: number;
  gender: string;
  address: string;
  nextOfKin: string;
  arrivalSource?: "OPD" | "Emergency Department" | "Elective Admission";
  insuranceType: "self-pay" | "insurance";
  insurancePolicy?: string;
}

// Base patients used as a template
const BASE_PATIENTS: PatientRecord[] = [
  { id: "p1", uhid: "UHID-2025-0001", phone: "+255700111001", nationalId: "19900101-12345-67890", name: "James Okello", age: 34, gender: "Male", address: "Nairobi, Kenya", nextOfKin: "Mary Okello", arrivalSource: "OPD", insuranceType: "insurance", insurancePolicy: "NHIF-123456" },
  { id: "p2", uhid: "UHID-2025-0002", phone: "+255700222002", nationalId: "19850515-98765-43210", name: "Mary Akinyi", age: 29, gender: "Female", address: "Mombasa, Kenya", nextOfKin: "John Akinyi", arrivalSource: "Emergency Department", insuranceType: "self-pay" },
  { id: "p3", uhid: "UHID-2025-0003", phone: "+255700333003", nationalId: "19720820-11223-44556", name: "Peter Ochieng", age: 52, gender: "Male", address: "Kisumu, Kenya", nextOfKin: "Grace Ochieng", arrivalSource: "OPD", insuranceType: "insurance", insurancePolicy: "AAR-789" },
  { id: "p4", uhid: "UHID-2025-0004", phone: "+255700444004", nationalId: "19951210-55443-22110", name: "Grace Wambui", age: 28, gender: "Female", address: "Nakuru, Kenya", nextOfKin: "David Kamau", arrivalSource: "Elective Admission", insuranceType: "self-pay" },
  { id: "p5", uhid: "UHID-2025-0005", phone: "+255700555005", nationalId: "19880101-99887-77665", name: "John Kamau", age: 36, gender: "Male", address: "Eldoret, Kenya", nextOfKin: "Lucy Kamau", arrivalSource: "OPD", insuranceType: "insurance", insurancePolicy: "NHIF-654321" },
];

function generateManyPatients(count: number): PatientRecord[] {
  const out: PatientRecord[] = [];
  for (let i = 0; i < count; i++) {
    const base = BASE_PATIENTS[i % BASE_PATIENTS.length];
    out.push({
      ...base,
      id: `p-all-${i + 1}`,
      uhid: `UHID-2025-${String(i + 1).padStart(4, "0")}`,
    });
  }
  return out;
}

const ALL_PATIENTS = generateManyPatients(200);
const PAGE_SIZE = 20;

export default function AllPatientsPage() {
  const [search, setSearch] = useState("");
  const [insuranceFilter, setInsuranceFilter] = useState<"" | "self-pay" | "insurance">("");
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "id">("name");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let data = ALL_PATIENTS;
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.uhid.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.nationalId.toLowerCase().includes(q),
      );
    }
    if (insuranceFilter) {
      data = data.filter((p) => p.insuranceType === insuranceFilter);
    }
    if (genderFilter) {
      data = data.filter((p) => p.gender === genderFilter);
    }
    const sorted = [...data].sort((a, b) => {
      if (sortBy === "id") return a.uhid.localeCompare(b.uhid);
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [search, insuranceFilter, genderFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">All patients</h1>
            <p className="text-sm text-slate-500 mt-1">
              Limited view of all patients available for medical clerking.
            </p>
          </div>
          <Link
            href="/dashboard/medical-clerking"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            ← Back to medical clerking
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search patients"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-40">
                <Select
                  classNamePrefix="rs"
                  options={[
                    { value: "", label: "All insurance" },
                    { value: "self-pay", label: "Self-pay" },
                    { value: "insurance", label: "Insurance" },
                  ]}
                  value={
                    [
                      { value: "", label: "All insurance" },
                      { value: "self-pay", label: "Self-pay" },
                      { value: "insurance", label: "Insurance" },
                    ].find((o) => o.value === insuranceFilter) ?? {
                      value: "",
                      label: "All insurance",
                    }
                  }
                  onChange={(opt) => {
                    setInsuranceFilter((opt?.value as "" | "self-pay" | "insurance") ?? "");
                    setPage(1);
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "36px",
                      borderColor: "#e2e8f0",
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
              <div className="w-36">
                <Select
                  classNamePrefix="rs"
                  options={[
                    { value: "", label: "All genders" },
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                  value={
                    [
                      { value: "", label: "All genders" },
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Other", label: "Other" },
                    ].find((o) => o.value === genderFilter) ?? {
                      value: "",
                      label: "All genders",
                    }
                  }
                  onChange={(opt) => {
                    setGenderFilter(opt?.value ?? "");
                    setPage(1);
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "36px",
                      borderColor: "#e2e8f0",
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
              <div className="w-36">
                <Select
                  classNamePrefix="rs"
                  options={[
                    { value: "name", label: "Name A–Z" },
                    { value: "id", label: "ID" },
                  ]}
                  value={
                    [
                      { value: "name", label: "Name A–Z" },
                      { value: "id", label: "ID" },
                    ].find((o) => o.value === sortBy) ?? {
                      value: "name",
                      label: "Name A–Z",
                    }
                  }
                  onChange={(opt) =>
                    setSortBy((opt?.value as "name" | "id") ?? "name")
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "36px",
                      borderColor: "#e2e8f0",
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left text-xs uppercase tracking-wider">
                  <th className="pb-3 px-4">Name</th>
                  <th className="pb-3 px-4">ID number</th>
                  <th className="pb-3 px-4">Phone</th>
                  <th className="pb-3 px-4">National ID</th>
                  <th className="pb-3 px-4">Insurance</th>
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      {search ? "No patients match your search." : "No patients yet."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="py-3 px-4 font-medium text-slate-800">{p.name}</td>
                      <td className="py-3 px-4 text-slate-600">{p.uhid}</td>
                      <td className="py-3 px-4 text-slate-600">{p.phone}</td>
                      <td className="py-3 px-4 text-slate-600">{p.nationalId}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.insuranceType === "insurance"
                          ? p.insurancePolicy ?? "Insurance"
                          : "Self-pay"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
                          aria-label="Patient actions"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-medium">
                {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="font-medium">{filtered.length}</span> patients
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-xs text-slate-500">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

