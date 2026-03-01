"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Select from "react-select";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import FacilityModal from "@/components/FacilityModal";

interface Facility {
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

const ITEMS_PER_PAGE = 10;

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
    minHeight: "36px",
    borderColor: "#e2e8f0",
  }),
  valueContainer: (base: Record<string, unknown>) => ({ ...base, padding: "0 8px" }),
  input: (base: Record<string, unknown>) => ({ ...base, margin: 0 }),
  indicatorSeparator: () => ({ display: "none" as const }),
};

export default function AllFacilitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [adminMap, setAdminMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Filters & sort
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filterType, setFilterType] = useState(searchParams.get("type") || "");
  const [sortBy, setSortBy] = useState<"name" | "code" | "created">(
    (searchParams.get("sort") as any) || "name"
  );
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    if (a.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    setAuth({ role: a.role });
    fetchFacilities();
    fetchAdminUsers();
  }, [router]);

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch("/api/users?role=admin");
      if (response.ok) {
        const users = await response.json();
        const map: Record<string, string> = {};
        users.forEach((user: any) => {
          map[user.id] = user.name;
        });
        setAdminMap(map);
      }
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  };

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/facilities");
      if (response.ok) {
        const data = await response.json();
        setFacilities(data);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (facility?: Facility) => {
    if (facility) {
      setSelectedFacility(facility);
    } else {
      setSelectedFacility(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFacility(null);
  };

  const handleSave = async () => {
    await fetchFacilities();
    handleCloseModal();
  };

  const handleDelete = async (facilityId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this facility? This action can be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/facilities/${facilityId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFacilities(
          facilities.map((f) =>
            f.id === facilityId ? { ...f, deletedAt: new Date().toISOString() } : f
          )
        );
      } else {
        alert("Error deleting facility");
      }
    } catch (error) {
      console.error("Error deleting facility:", error);
      alert("Error deleting facility");
    }
  };

  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (filterType) params.set("type", filterType);
    if (sortBy !== "name") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));

    const newUrl = params.toString()
      ? `/dashboard/facilities/all?${params.toString()}`
      : `/dashboard/facilities/all`;
    window.history.replaceState({}, "", newUrl);
  }, [searchQuery, filterType, sortBy, currentPage]);

  // Filter and sort
  const filtered = useMemo(() => {
    let out = facilities.filter((f) => !f.deletedAt);
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

    const sorted = [...out].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "code") return a.code.localeCompare(b.code);
      if (sortBy === "created")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    return sorted;
  }, [facilities, searchQuery, filterType, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (!auth) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <p className="text-slate-500">Loading…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/facilities"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-2 inline-block"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">All Active Facilities</h1>
            <p className="text-sm text-slate-500 mt-1">
              {filtered.length} facilities · Page {currentPage} of {totalPages}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm"
          >
            + Add Facility
          </button>
        </div>

        {/* Filters & Search */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
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
                  placeholder="Search by name, code, email, phone…"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="w-56">
              <Select
                classNamePrefix="rs"
                options={FACILITY_TYPE_OPTS}
                value={
                  FACILITY_TYPE_OPTS.find((o) => o.value === filterType) ||
                  FACILITY_TYPE_OPTS[0]
                }
                onChange={(opt) => {
                  setFilterType(opt?.value || "");
                  setCurrentPage(1);
                }}
                styles={selectSmall}
              />
            </div>

            <div className="w-48">
              <Select
                classNamePrefix="rs"
                options={SORT_OPTS}
                value={SORT_OPTS.find((o) => o.value === sortBy) || SORT_OPTS[0]}
                onChange={(opt) => setSortBy((opt?.value as any) || "name")}
                styles={selectSmall}
              />
            </div>

            {(searchQuery || filterType) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg border border-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="px-6 py-8 text-center text-slate-500">
                Loading facilities...
              </div>
            ) : paginatedItems.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500">
                {filtered.length === 0
                  ? "No active facilities found."
                  : "No results on this page."}
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
                      Contact
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
                  {paginatedItems.map((facility) => (
                    <tr key={facility.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {facility.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div>{facility.name}</div>
                        {facility.description && (
                          <div className="text-xs text-slate-500 mt-1">
                            {facility.description.substring(0, 50)}
                            {facility.description.length > 50 ? "..." : ""}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 capitalize">
                        {facility.facilityType?.replace("_", " ") || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {facility.facilityAdminId
                          ? adminMap[facility.facilityAdminId] || "Unknown"
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {facility.phone || facility.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {facility.address || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleOpenModal(facility)}
                          className="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(facility.id)}
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <FacilityModal
        isOpen={showModal}
        facility={selectedFacility}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}
