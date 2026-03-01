"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TeamMember {
  id: string;
  staffId: string;
  facilityId: string;
  status: "active" | "inactive" | "on_leave" | "suspended";
  details: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface FacilityTeamModalProps {
  isOpen: boolean;
  facilityId: string | null;
  onClose: () => void;
  onSave?: () => void;
}

export default function FacilityTeamModal({
  isOpen,
  facilityId,
  onClose,
  onSave,
}: FacilityTeamModalProps) {
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [status, setStatus] = useState<"active" | "inactive" | "on_leave" | "suspended">("active");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && facilityId) {
      fetchStaffUsers();
      fetchTeamMembers();
    }
  }, [isOpen, facilityId]);

  const fetchStaffUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        // Filter out already assigned staff
        const availableStaff = data.filter((user: User) =>
          !teamMembers.some((tm) => tm.staffId === user.id)
        );
        setStaffUsers(availableStaff);
      }
    } catch (error) {
      console.error("Error fetching staff users:", error);
    }
  };

  const fetchTeamMembers = async () => {
    if (!facilityId) return;
    try {
      const response = await fetch(`/api/facility-team?facilityId=${facilityId}`);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!selectedStaff || !facilityId) {
      setError("Please select a staff member");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/facility-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: selectedStaff,
          facilityId,
          status,
          details: details || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error adding team member");
        return;
      }

      setSelectedStaff("");
      setStatus("active");
      setDetails("");
      await fetchTeamMembers();
      await fetchStaffUsers();
      onSave?.();
    } catch (error) {
      setError("Error adding team member");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeamMember = async (teamMemberId: string) => {
    if (!window.confirm("Remove this team member?")) return;

    try {
      const response = await fetch(`/api/facility-team/${teamMemberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Error removing team member");
        return;
      }

      await fetchTeamMembers();
      await fetchStaffUsers();
    } catch (error) {
      console.error("Error removing team member:", error);
      alert("Error removing team member");
    }
  };

  const handleStatusChange = async (teamMemberId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/facility-team/${teamMemberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        alert("Error updating status");
        return;
      }

      await fetchTeamMembers();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  };

  if (!isOpen) return null;

  const getStaffName = (staffId: string) => {
    const user = staffUsers.find((u) => u.id === staffId);
    return user?.name || "Unknown";
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div
        className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Manage Facility Team
            </h2>
            <p className="text-sm text-slate-500 mt-0">
              Add and manage staff members for this facility.
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
        <div className="flex-1 overflow-y-auto px-6 py-4 pb-28">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Add Team Member Form */}
          <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <h3 className="font-semibold text-slate-800 mb-3">Add Staff Member</h3>
            <form onSubmit={handleAddTeamMember} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Staff *
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Choose a staff member --</option>
                  {staffUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Additional Details
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g., Department assignment, notes..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedStaff}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Staff Member"}
              </button>
            </form>
          </div>

          {/* Team Members List */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-3">Current Team ({teamMembers.length})</h3>
            {teamMembers.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                No team members assigned yet.
              </div>
            ) : (
              <div className="space-y-2">
                {teamMembers.map((member) => {
                  const staffUser = staffUsers.find((u) => u.id === member.staffId);
                  return (
                    <div
                      key={member.id}
                      className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-800">
                            {staffUser?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500">{staffUser?.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <select
                          value={member.status}
                          onChange={(e) => handleStatusChange(member.id, e.target.value)}
                          className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="on_leave">On Leave</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        <span className="text-xs text-slate-500">
                          Added {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {member.details && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                          {member.details}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
