"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getStoredAuth, getStoredProfile, setStoredProfile, setStoredAuth } from "@/helpers/local-storage";
import Link from "next/link";

const MEDICAL_ROLES = ["doctor", "nurse", "receptionist", "admin", "lab_tech", "pharmacist"];

const ACTIVITY_HISTORY = [
  { id: "1", action: "Logged in", detail: "Dashboard", at: "2025-02-26T09:00:00" },
  { id: "2", action: "Viewed patient clerking", detail: "James Okello", at: "2025-02-26T09:15:00" },
  { id: "3", action: "Updated clerking record", detail: "OPD arrival", at: "2025-02-26T09:22:00" },
  { id: "4", action: "Viewed appointments", detail: "Appointments list", at: "2025-02-26T09:30:00" },
  { id: "5", action: "Logged in", detail: "Dashboard", at: "2025-02-25T08:00:00" },
];

function formatActivityDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `Today ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
}

export default function ProfilePage() {
  const router = useRouter();
  const [auth, setAuthState] = useState<ReturnType<typeof getStoredAuth>>(null);
  const [profile, setProfileState] = useState<ReturnType<typeof getStoredProfile>>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    setAuthState(a);
    setProfileState(getStoredProfile());
  }, [router]);

  const form = {
    name: profile?.name ?? auth?.name ?? "",
    email: profile?.email ?? auth?.email ?? "",
    phone: profile?.phone ?? "",
    department: profile?.department ?? "",
    title: profile?.title ?? "",
  };

  const [edit, setEdit] = useState(form);

  useEffect(() => {
    setEdit({
      name: profile?.name ?? auth?.name ?? "",
      email: profile?.email ?? auth?.email ?? "",
      phone: profile?.phone ?? "",
      department: profile?.department ?? "",
      title: profile?.title ?? "",
    });
  }, [auth, profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setMessage(null);
    setSaving(true);
    try {
      const nextProfile = {
        name: edit.name.trim() || undefined,
        email: edit.email.trim() || undefined,
        phone: edit.phone.trim() || undefined,
        department: edit.department.trim() || undefined,
        title: edit.title.trim() || undefined,
      };
      setStoredProfile(nextProfile);
      setStoredAuth({
        ...auth,
        name: nextProfile.name ?? auth.name,
        email: nextProfile.email ?? auth.email,
      });
      setProfileState(getStoredProfile());
      setAuthState(getStoredAuth());
      setMessage({ type: "success", text: "Profile updated." });
    } catch {
      setMessage({ type: "error", text: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  const displayName = profile?.name ?? auth.name;
  const displayEmail = profile?.email ?? auth.email;
  const isMedical = MEDICAL_ROLES.includes(auth.role);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">My profile</h1>
        </div>

        {/* Medical user profile card */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-6 flex flex-wrap items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-semibold">
              {displayName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{displayName}</h2>
              <p className="text-sm text-slate-500 capitalize">{auth.role.replace("_", " ")}</p>
              {displayEmail && <p className="text-sm text-slate-600">{displayEmail}</p>}
              {isMedical && (
                <p className="text-xs text-slate-400 mt-1">Medical personnel · Profile & history</p>
              )}
            </div>
          </div>

          {/* Profile update form */}
          <div className="px-6 py-5 border-t border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4">Update profile</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                  <input
                    type="text"
                    value={edit.name}
                    onChange={(e) => setEdit((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={edit.email}
                    onChange={(e) => setEdit((p) => ({ ...p, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={edit.phone}
                    onChange={(e) => setEdit((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    placeholder="+256..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={edit.department}
                    onChange={(e) => setEdit((p) => ({ ...p, department: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                    placeholder="e.g. General Medicine"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={edit.title}
                  onChange={(e) => setEdit((p) => ({ ...p, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  placeholder="e.g. Senior Nurse"
                />
              </div>
              {message && (
                <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
              )}
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>
        </div>

        {/* Medical user profile – History */}
        {isMedical && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Activity history</h3>
            <p className="text-sm text-slate-500 mb-4">Recent activity for this medical user account.</p>
            <ul className="space-y-3">
              {ACTIVITY_HISTORY.map((item) => (
                <li key={item.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 ml-auto">{formatActivityDate(item.at)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
