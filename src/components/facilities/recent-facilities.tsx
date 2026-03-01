"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Select from "react-select";

export interface Facility {
  id: string;
  code: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  facilityType: string | null;
  facilityAdminId: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RecentFacilitiesProps {
  facilities: Facility[];
  adminMap: Record<string, string>;
  onEdit: (facility: Facility) => void;
    onDelete: (facilityId: string) => void;
    onManageTeam?: (facilityId: string) => void;
  onAddFacility?: () => void;
}

const FACILITY_TYPE_OPTS = [
  { value: "", label: "All Types" },
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "health_center", label: "Health Center" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "laboratory", label: "Laboratory" },
];

const SORT_OPTS = [
  { value: "name", label: "Name A–Z" },
  { value: "code", label: "Code" },
  { value: "created", label: "Recently Created" },
];

const selectSmall = {
  control: (base: Record<string, unknown>) => ({
    ...base,
    minHeight: "32px",
    borderColor: "#e2e8f0",
  }),
  valueContainer: (base: Record<string, unknown>) => ({ ...base, padding: "0 8px" }),
  input: (base: Record<string, unknown>) => ({ ...base, margin: 0 }),
  indicatorSeparator: () => ({ display: "none" as const }),
};

export default function RecentFacilities({
  facilities,
  adminMap,
  onEdit,
  onDelete,
  onAddFacility,
}: RecentFacilitiesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "code" | "created">("name");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    let out = facilities.filter((f) => !f.deletedAt); // Only active facilities
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      out = out.filter(
        (f) =>
          f.code.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q) ||
          f.email?.toLowerCase().includes(q) ||
          f.phone?.toLowerCase().includes(q)
      );
    }

    if (filterType) {
      out = out.filter((f) => f.facilityType === filterType);
    }

    // Sort
    const sorted = [...out].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "code") return a.code.localeCompare(b.code);
      if (sortBy === "created") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    return sorted;
  }, [facilities, searchQuery, filterType, sortBy]);

  // Show only 6 on dashboard
  const display = filtered.slice(0, 6);
  const hasMore = filtered.length > 6;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-base font-semibold text-slate-800">Active Facilities</h2>
        <div className="flex items-center gap-3">
          {hasMore && (
            <Link
              href="/dashboard/facilities/all"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              View All &rarr;
            </Link>
          )}
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, code, email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div ref={filterRef} className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            Filter
          </button>
          {filterOpen && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-20 p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Facility Type
                </label>
                <Select
                  classNamePrefix="rs"
                  options={FACILITY_TYPE_OPTS}
                  value={
                    FACILITY_TYPE_OPTS.find((o) => o.value === filterType) ||
                    FACILITY_TYPE_OPTS[0]
                  }
                  onChange={(opt) => setFilterType(opt?.value ?? "")}
                  styles={selectSmall}
                />
              </div>
              {filterType && (
                <button
                  onClick={() => setFilterType("")}
                  className="w-full text-xs text-slate-600 hover:text-slate-800 font-medium py-1"
                >
                  Clear Filter
                </button>
              )}
            </div>
          )}
        </div>

        <div className="w-40">
          <Select
            classNamePrefix="rs"
            options={SORT_OPTS}
            value={SORT_OPTS.find((o) => o.value === sortBy) || SORT_OPTS[0]}
            onChange={(opt) => setSortBy((opt?.value as any) || "name")}
            styles={selectSmall}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500">
            No active facilities found.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {display.map((facility) => (
                <tr key={facility.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {facility.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{facility.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {facility.facilityType || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {facility.facilityAdminId
                      ? adminMap[facility.facilityAdminId] || "Unknown"
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {facility.address || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => onEdit(facility)}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(facility.id)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Show count if truncated */}
      {hasMore && (
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          Showing {display.length} of {filtered.length} active facilities.{" "}
          <Link
            href="/dashboard/facilities/all"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
