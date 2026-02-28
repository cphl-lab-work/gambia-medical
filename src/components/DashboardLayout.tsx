"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getStoredAuth, setStoredAuth, clearStoredAuth } from "@/helpers/local-storage";

const iconClass = "w-5 h-5 shrink-0";

const icons = {
  dashboard: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  doctors: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  staff: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  patients: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  appointments: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  departments: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  laboratory: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  account: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  clerking: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  recipe: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  medicine: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  users: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  logout: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  triage: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  medicalClerking: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  imaging: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 0H3m14 0h2m2 0h-2M5 15H3m2 0H3m14 0h2m2 0h-2M3 5h2m14 0h2M3 15h2m14 0h2" />
    </svg>
  ),
  pharmacy: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  billing: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  reports: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  hr: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

type NavLinkItem = { href: string; label: string; icon: React.ReactNode; roles?: string[] };
type NavGroupItem = { label: string; icon: React.ReactNode; roles?: string[]; children: { href: string; label: string }[] };
type NavItem = NavLinkItem | NavGroupItem;

function isNavGroup(item: NavItem): item is NavGroupItem {
  return "children" in item && Array.isArray((item as NavGroupItem).children);
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: icons.dashboard },
  { href: "/dashboard/clerking", label: "Patient clerking", icon: icons.clerking, roles: ["receptionist", "nurse"] },
  { href: "/dashboard/triage", label: "Triage & Registration", icon: icons.triage, roles: ["receptionist", "nurse"] },
  { href: "/dashboard/medical-clerking", label: "Medical clerking", icon: icons.medicalClerking, roles: ["admin", "doctor"] },
  { href: "/dashboard/doctors", label: "Doctors", icon: icons.doctors, roles: ["admin", "doctor", "receptionist"] },
  { href: "/dashboard/staff", label: "Staff", icon: icons.staff, roles: ["admin"] },
  { href: "/dashboard/patients", label: "Patients", icon: icons.patients, roles: ["admin", "doctor", "receptionist", "nurse"] },
  { href: "/dashboard/appointments", label: "Appointments", icon: icons.appointments, roles: ["admin", "doctor", "receptionist", "nurse", "accountant"] },
  { href: "/dashboard/departments", label: "Departments", icon: icons.departments, roles: ["admin", "doctor"] },
  { href: "/dashboard/lab-orders", label: "Laboratory", icon: icons.laboratory, roles: ["admin", "doctor", "lab_tech"] },
  { href: "/dashboard/imaging", label: "Imaging (RIS)", icon: icons.imaging, roles: ["admin", "doctor", "lab_tech"] },
  {
    label: "Pharmacy",
    icon: icons.pharmacy,
    roles: ["admin", "pharmacist"],
    children: [
      { href: "/dashboard/pharmacy", label: "Overview" },
      { href: "/dashboard/pharmacy/inventory", label: "Inventory" },
      { href: "/dashboard/pharmacy/inventory-types", label: "Inventory Types" },
      { href: "/dashboard/pharmacy/dispensing", label: "Dispensing" },
      { href: "/dashboard/pharmacy/prescriptions", label: "Prescriptions" },
      { href: "/dashboard/pharmacy/point-of-sale", label: "Point of Sale" },
    ],
  },
  { href: "/dashboard/billing", label: "Billing", icon: icons.billing, roles: ["admin", "accountant"] },
  { href: "/dashboard/reports", label: "Reports", icon: icons.reports, roles: ["admin", "accountant", "receptionist", "doctor", "nurse", "pharmacist", "lab_tech"] },
  {
    label: "Human Resources",
    icon: icons.hr,
    roles: ["admin"],
    children: [
      { href: "/dashboard/hr/attendance", label: "Attendance" },
      { href: "/dashboard/hr/time-tracker", label: "Time Tracker" },
      { href: "/dashboard/hr/project", label: "Project" },
      { href: "/dashboard/hr/employee", label: "Employee" },
      { href: "/dashboard/hr/timesheet", label: "Timesheet" },
      { href: "/dashboard/hr/calendar", label: "Calendar" },
      { href: "/dashboard/hr/payment", label: "Payment" },
      { href: "/dashboard/hr/employee-satisfaction", label: "Employee Satisfaction" },
      { href: "/dashboard/hr/training-development", label: "Training and Development" },
      { href: "/dashboard/hr/reporting", label: "Reporting" },
    ],
  },
  { href: "#", label: "Account", icon: icons.account },
];

const SYSTEM: NavLinkItem[] = [
  { href: "/dashboard/recipe", label: "Recipe Management", icon: icons.recipe, roles: ["admin", "pharmacist"] },
  { href: "/dashboard/medicine", label: "Medicine Management", icon: icons.medicine, roles: ["admin", "pharmacist"] },
  { href: "/dashboard/users", label: "User Management", icon: icons.users, roles: ["admin"] },
];

/** Profiles available for quick switch (seed credentials); same roles as login. */
const SWITCH_PROFILES: { role: string; name: string; email: string; password: string }[] = [
  { role: "admin", name: "Admin User", email: "admin@ahmis.com", password: "admin123" },
  { role: "doctor", name: "Nazar Becks", email: "doctor@ahmis.com", password: "doctor123" },
  { role: "nurse", name: "Sarah Nurse", email: "nurse@ahmis.com", password: "nurse123" },
  { role: "receptionist", name: "Mary Reception", email: "receptionist@ahmis.com", password: "reception123" },
  { role: "accountant", name: "Tom Accountant", email: "accountant@ahmis.com", password: "account123" },
  { role: "pharmacist", name: "Jane Pharmacist", email: "pharmacist@ahmis.com", password: "pharma123" },
  { role: "lab_tech", name: "Dave LabTech", email: "labtech@ahmis.com", password: "lab123" },
];

function canSeeNavItem(item: NavItem, role: string | null): boolean {
  if (!role) return false;
  if (!item.roles || item.roles.length === 0) return true;
  return item.roles.includes(role);
}

// Messages grouped by date (sender, date, message, icon/initial)
const MESSAGES_BY_DATE: { date: string; items: { sender: string; time: string; message: string; initial: string; unread?: boolean }[] }[] = [
  {
    date: "Today",
    items: [
      { sender: "Lab Results", time: "10:32 AM", message: "Blood work for John Doe is ready for review.", initial: "L", unread: true },
      { sender: "Appointments", time: "9:15 AM", message: "Reminder: Patient Sarah – 2:00 PM today.", initial: "A", unread: true },
    ],
  },
  {
    date: "Yesterday",
    items: [
      { sender: "Dr. Nazar Becks", time: "4:45 PM", message: "Please send over the latest lab reports when you can.", initial: "N" },
      { sender: "Pharmacy", time: "11:20 AM", message: "Prescription #8821 is ready for pickup.", initial: "P" },
    ],
  },
  {
    date: "Feb 23, 2025",
    items: [
      { sender: "Admin", time: "3:00 PM", message: "System maintenance scheduled for Sunday 2am–4am.", initial: "S" },
      { sender: "Reception", time: "10:00 AM", message: "New patient forms uploaded for Merina Farah.", initial: "R" },
    ],
  },
];

// Notifications grouped by date
const NOTIFICATIONS_BY_DATE: { date: string; items: { title: string; time: string; message: string; icon: "user" | "calendar" | "system" | "alert" }[] }[] = [
  {
    date: "Today",
    items: [
      { title: "New patient assigned", time: "10:30 AM", message: "John Doe has been assigned to your list.", icon: "user" },
      { title: "Appointment confirmed", time: "9:00 AM", message: "Sarah – Gynecologist visit at 2:00 PM.", icon: "calendar" },
    ],
  },
  {
    date: "Yesterday",
    items: [
      { title: "Lab results available", time: "5:20 PM", message: "Lab #4421 results are ready for review.", icon: "alert" },
      { title: "System update", time: "6:00 PM", message: "Scheduled maintenance completed successfully.", icon: "system" },
    ],
  },
  {
    date: "Feb 23, 2025",
    items: [
      { title: "Shift reminder", time: "8:00 AM", message: "You have an early shift tomorrow at 7:00 AM.", icon: "calendar" },
      { title: "New message", time: "2:15 PM", message: "You have a new message from Dr. Alex Hales.", icon: "user" },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<{ name: string; role: string; email?: string } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"mail" | "notifications" | "profile" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Accordion: which nav groups are explicitly expanded (toggle on parent click)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }
    setAuth({ name: a.name, role: a.role, email: a.email });
  }, [router]);

  const handleLogout = () => {
    clearStoredAuth();
    router.replace("/login");
    router.refresh();
  };

  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [switchProfileOpen, setSwitchProfileOpen] = useState(false);

  const handleSwitchProfile = async (profile: (typeof SWITCH_PROFILES)[number]) => {
    if (!auth || (profile.role === auth.role && profile.email === auth.email)) {
      setOpenDropdown(null);
      return;
    }
    setSwitchError(null);
    setSwitchingTo(profile.role);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, password: profile.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSwitchError(data.error || "Switch failed");
        return;
      }
      const { user } = data;
      setStoredAuth({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        token: user.token || "",
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
      setAuth({ name: user.name, role: user.role, email: user.email });
      setOpenDropdown(null);
      // Reload the page so role-dependent content (dashboard, nav, etc.) updates
      window.location.href = pathname || "/dashboard";
    } catch {
      setSwitchError("Network error");
    } finally {
      setSwitchingTo(null);
    }
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - fixed on scroll */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-30 bg-[var(--sidebar-bg)] text-white flex flex-col h-screen transition-[width] ${
          sidebarCollapsed ? "w-16" : "w-56"
        }`}
      >
        <div className="p-4 flex items-center justify-between shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/ahmis-logo.png"
                  alt="AHMIS logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="font-semibold">AHMIS</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="p-1 rounded hover:bg-white/10"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto py-2">
          {NAV.filter((item) => canSeeNavItem(item, auth.role)).map((item) =>
            isNavGroup(item) ? (() => {
              const group = item as NavGroupItem;
              const isGroupOpen = expandedGroups.has(group.label);
              return (
                <div key={group.label}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left font-medium rounded-none ${
                      isGroupOpen ? "bg-white/10 text-white" : "text-white/90 hover:bg-white/10"
                    }`}
                    aria-expanded={isGroupOpen}
                  >
                    <span className="flex items-center justify-center text-white shrink-0">{group.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 min-w-0">{group.label}</span>
                        <span
                          className={`shrink-0 transition-transform ${isGroupOpen ? "rotate-90" : ""}`}
                          aria-hidden
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </>
                    )}
                  </button>
                  {!sidebarCollapsed && isGroupOpen &&
                    group.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-3 pl-10 pr-4 py-2 text-sm ${
                          pathname === child.href ? "bg-white/20" : "hover:bg-white/10"
                        }`}
                      >
                        <span className="flex-1 min-w-0">{child.label}</span>
                      </Link>
                    ))}
                </div>
              );
            })() : (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                  pathname === item.href ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <span className="flex items-center justify-center text-white">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="flex-1 min-w-0">{item.label}</span>
                )}
              </Link>
            )
          )}
        </nav>
        <div className="mt-auto shrink-0 border-t border-white/20 py-2 bg-[var(--sidebar-bg)]">
          {SYSTEM.filter((item) => canSeeNavItem(item, auth.role)).length > 0 && (
            <>
              <div className={sidebarCollapsed ? "px-2" : "px-4 py-1 text-xs text-white/70"}>
                {!sidebarCollapsed && "System Settings"}
              </div>
              {SYSTEM.filter((item) => canSeeNavItem(item, auth.role)).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10"
                >
                  <span className="flex items-center justify-center text-white">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="flex-1 min-w-0">{item.label}</span>
                  )}
                </Link>
              ))}
            </>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10"
          >
            <span className="flex items-center justify-center text-white">{icons.logout}</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Spacer for fixed sidebar */}
      <div className={sidebarCollapsed ? "w-16 shrink-0" : "w-56 shrink-0"} aria-hidden />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 shrink-0 border-b border-slate-200 bg-white flex items-center px-6 gap-4">
          <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 max-w-md">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search"
              className="bg-transparent border-0 w-full text-sm focus:ring-0"
            />
          </div>
          <div ref={dropdownRef} className="ml-auto flex items-center gap-1 relative">
            {/* Mail – opens right panel */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown((d) => (d === "mail" ? null : "mail"))}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                aria-expanded={openDropdown === "mail"}
                aria-haspopup="true"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
            {/* Notifications – opens right panel */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown((d) => (d === "notifications" ? null : "notifications"))}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                aria-expanded={openDropdown === "notifications"}
                aria-haspopup="true"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
            {/* Profile dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setSwitchProfileOpen(false); setOpenDropdown((d) => (d === "profile" ? null : "profile")); }}
                className="flex items-center gap-2 p-1 rounded-full ring-2 ring-transparent hover:ring-slate-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-shadow"
                aria-expanded={openDropdown === "profile"}
                aria-haspopup="true"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold shadow-md ring-2 ring-white">
                  {auth.name.charAt(0)}
                </div>
              </button>
              {openDropdown === "profile" && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
                  {/* Profile header */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-4 pt-5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-semibold shadow-lg ring-4 ring-white/80 shrink-0">
                        {auth.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{auth.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{auth.role.replace("_", " ")}</p>
                        {auth.email && <p className="text-xs text-slate-400 truncate mt-0.5">{auth.email}</p>}
                      </div>
                    </div>
                  </div>
                  {/* Switch profile – collapsible dropdown */}
                  <div className="border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSwitchProfileOpen((o) => !o)}
                      className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="font-medium">Switch profile</span>
                      </span>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${switchProfileOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {switchProfileOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/50 max-h-48 overflow-y-auto">
                        {SWITCH_PROFILES.map((profile) => {
                          const isCurrent = auth.role === profile.role && auth.email === profile.email;
                          const isSwitching = switchingTo === profile.role;
                          return (
                            <button
                              key={profile.role + profile.email}
                              type="button"
                              onClick={() => handleSwitchProfile(profile)}
                              disabled={isCurrent || !!switchingTo}
                              className="flex w-full items-center gap-3 px-4 py-2.5 pl-8 text-sm text-left hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold shrink-0">
                                {profile.name.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-800 truncate">{profile.name}</p>
                                <p className="text-xs text-slate-500 capitalize truncate">{profile.role.replace("_", " ")}</p>
                              </div>
                              {isCurrent && (
                                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              {isSwitching && (
                                <svg className="w-4 h-4 animate-spin text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                        {switchError && (
                          <p className="px-4 py-2 mx-2 mb-2 text-xs text-red-600 bg-red-50 rounded-lg">{switchError}</p>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Menu groups */}
                  <div className="py-2">
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Account</p>
                    <Link href="/dashboard/profile" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      My profile
                    </Link>
                    <Link href="/dashboard/activity" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Activity log
                    </Link>
                    <Link href="/dashboard/messages" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Messages
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 py-2">
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Preferences</p>
                    <Link href="/dashboard/settings" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Settings
                    </Link>
                    <Link href="/dashboard/privacy" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Privacy & security
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 py-2">
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Support</p>
                    <Link href="/dashboard/help" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Help center
                    </Link>
                    <Link href="/dashboard/contact" onClick={() => setOpenDropdown(null)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      Contact us
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 py-2">
                    <button
                      type="button"
                      onClick={() => { setOpenDropdown(null); handleLogout(); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      {/* Messages right panel */}
      {openDropdown === "mail" && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpenDropdown(null)}
            aria-hidden
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Messages</h2>
                <p className="text-xs text-slate-500">2 unread</p>
              </div>
              <button type="button" onClick={() => setOpenDropdown(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {MESSAGES_BY_DATE.map((group) => (
                <div key={group.date} className="py-3">
                  <p className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">{group.date}</p>
                  {group.items.map((item, i) => (
                    <a key={i} href="#" className={`flex gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50 ${item.unread ? "bg-blue-50/50" : ""}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        {item.initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-800 truncate">{item.sender}</span>
                          <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-0.5">{item.message}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t border-slate-200 p-3">
              <a href="#" className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700">View all messages</a>
            </div>
          </div>
        </>
      )}

      {/* Notifications right panel */}
      {openDropdown === "notifications" && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpenDropdown(null)}
            aria-hidden
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
                <p className="text-xs text-slate-500">2 new</p>
              </div>
              <button type="button" onClick={() => setOpenDropdown(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {NOTIFICATIONS_BY_DATE.map((group) => (
                <div key={group.date} className="py-3">
                  <p className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">{group.date}</p>
                  {group.items.map((item, i) => (
                    <a key={i} href="#" className="flex gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-50">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        {item.icon === "user" && (
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        )}
                        {item.icon === "calendar" && (
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        )}
                        {item.icon === "system" && (
                          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        )}
                        {item.icon === "alert" && (
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-800">{item.title}</span>
                          <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-0.5">{item.message}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t border-slate-200 p-3">
              <a href="#" className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700">View all notifications</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
