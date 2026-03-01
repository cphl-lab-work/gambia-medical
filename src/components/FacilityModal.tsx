"use client";

import { useEffect, useState } from "react";
import SlidePanel from "@/components/ui/SlidePanel";

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

interface User {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string };
}

interface FacilityModalProps {
  isOpen: boolean;
  facility: Facility | null;
  onClose: () => void;
  onSave: () => void;
}

export default function FacilityModal({
  isOpen,
  facility,
  onClose,
  onSave,
}: FacilityModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    facilityType: "hospital",
    address: "",
    phone: "",
    email: "",
    description: "",
    facilityAdminId: "",
  });

  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateFacilityCode = () => {
    const prefixes: Record<string, string> = {
      hospital: "HOSP",
      clinic: "CLN",
      health_center: "HC",
      pharmacy: "PHM",
      lab: "LAB",
      other: "FAC",
    };

    const prefix = prefixes[formData.facilityType] || "FAC";
    const randomNum = String(Math.floor(Math.random() * 9000000) + 1000000).padStart(7, "0");
    return `${prefix}-${randomNum}`;
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminUsers();
    }
    if (facility) {
      setFormData({
        name: facility.name || "",
        code: facility.code || "",
        facilityType: facility.facilityType || "hospital",
        address: facility.address || "",
        phone: facility.phone || "",
        email: facility.email || "",
        description: facility.description || "",
        facilityAdminId: facility.facilityAdminId || "",
      });
    } else {
      // Auto-generate code for new facility
      setFormData({
        name: "",
        code: generateFacilityCode(),
        facilityType: "hospital",
        address: "",
        phone: "",
        email: "",
        description: "",
        facilityAdminId: "",
      });
    }
    setError("");
  }, [facility, isOpen]);

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch("/api/users?role=admin");
      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data);
      }
    } catch (error) {
      console.error("Error fetching admin users:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If facility type changes and it's a new facility, regenerate code
    if (name === "facilityType" && !facility) {
      const prefixes: Record<string, string> = {
        hospital: "HOSP",
        clinic: "CLN",
        health_center: "HC",
        pharmacy: "PHM",
        lab: "LAB",
        other: "FAC",
      };

      const prefix = prefixes[value] || "FAC";
      const randomNum = String(Math.floor(Math.random() * 9000000) + 1000000).padStart(7, "0");
      setFormData((prev) => ({
        ...prev,
        facilityType: value,
        code: `${prefix}-${randomNum}`,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = facility
        ? `/api/facilities/${facility.id}`
        : "/api/facilities";
      const method = facility ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Error saving facility");
        return;
      }

      onSave();
    } catch (err) {
      setError("Error saving facility");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SlidePanel
      open={isOpen}
      onClose={onClose}
      title={facility ? "Edit Facility" : "Create Facility"}
    >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {facility ? "Edit Facility" : "Create Facility"}
            </h2>
            <p className="text-sm text-slate-500 mt-0">
              {facility ? "Update facility information." : "Record facility details and configuration."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 pb-28">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Facility Code */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 capitalize">
                  Facility Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. CPHL-0002310"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  {!facility && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          code: generateFacilityCode(),
                        }));
                      }}
                      className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium text-sm whitespace-nowrap"
                      title="Generate new code"
                    >
                      🔄 Regenerate
                    </button>
                  )}
                </div>
              </div>

              {/* Facility Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Central Public Hospital"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Facility Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Facility Type
                </label>
                <select
                  name="facilityType"
                  value={formData.facilityType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                  <option value="health_center">Health Center</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="lab">Laboratory</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Location / Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter facility address"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Details / Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter facility details"
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-6 py-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : facility ? "Update" : "Save facility"}
            </button>
          </div>
        </form>
    </SlidePanel>
  );
}
