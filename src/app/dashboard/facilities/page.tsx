"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth } from "@/helpers/local-storage";
import FacilityModal from "@/components/FacilityModal";
import RecentFacilities from "@/components/facilities/recent-facilities";

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

export default function FacilitiesPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ role: string } | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [adminMap, setAdminMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

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

  if (!auth) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <p className="text-slate-500">Loading…</p>
        </div>
      </DashboardLayout>
    );
  }

  const activeFacilities = facilities.filter((f) => !f.deletedAt);
  const deletedFacilities = facilities.filter((f) => f.deletedAt);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Facilities</h1>
            <p className="text-sm text-slate-500 mt-1">
              Create and manage healthcare facilities.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm"
          >
            + Add Facility
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Active Facilities</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {activeFacilities.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Deleted Facilities</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {deletedFacilities.length}
            </p>
          </div>
        </div>

        {/* Recent Facilities Component */}
        <RecentFacilities
          facilities={facilities}
          adminMap={adminMap}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onAddFacility={() => handleOpenModal()}
        />

        {/* Deleted Facilities Table */}
        {deletedFacilities.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">Deleted Facilities</h2>
            </div>
            <div className="overflow-x-auto">
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
                      Deleted At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {deletedFacilities.map((facility) => (
                    <tr key={facility.id} className="opacity-60">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {facility.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {facility.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(facility.deletedAt!).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
