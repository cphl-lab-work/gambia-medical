"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setStoredAuth } from "@/helpers/local-storage";

const ROLES = [
  "admin",
  "doctor",
  "nurse",
  "receptionist",
  "accountant",
  "pharmacist",
  "lab_tech",
] as const;

const SEED_CREDENTIALS: Record<string, { email: string; password: string }> = {
  admin: { email: "admin@medilab360.com", password: "admin123" },
  doctor: { email: "doctor@medilab360.com", password: "doctor123" },
  nurse: { email: "nurse@medilab360.com", password: "nurse123" },
  receptionist: { email: "receptionist@medilab360.com", password: "reception123" },
  accountant: { email: "accountant@medilab360.com", password: "account123" },
  pharmacist: { email: "pharmacist@medilab360.com", password: "pharma123" },
  lab_tech: { email: "labtech@medilab360.com", password: "lab123" },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fillRole = (role: (typeof ROLES)[number]) => {
    const c = SEED_CREDENTIALS[role];
    if (c) {
      setEmail(c.email);
      setPassword(c.password);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
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
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Try again or use a role button to fill credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background: hospital/clinical image + dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/images/cover-hospital.png)",
          backgroundColor: "#1e293b",
        }}
      />
      <div className="absolute inset-0 bg-slate-900/70" />

      {/* Welcome text - bottom left */}
      <div className="absolute bottom-8 left-8 right-8 max-w-md text-white z-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to MediLab360</h2>
        <p className="text-sm sm:text-base text-white/90 leading-relaxed">
          Access patient records, manage appointments, coordinate care, and streamline hospital operations through our comprehensive management platform.
        </p>
      </div>

      {/* Centered form + branding */}
      <div className="relative z-20 w-full max-w-md px-4 flex flex-col items-center">
        {/* Emblem / logo */}
        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/30 mb-3">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <p className="text-2xl font-semibold text-white tracking-tight">MediLab360</p>
        <p className="text-white/80 text-sm mb-6">Welcome Back</p>

        {/* Form card */}
        <div className="w-full bg-white rounded-xl shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Email/Username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-11 py-2.5 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-1.5 flex justify-end">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>

          {/* Quick login - compact */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">Quick login (seed):</p>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillRole(role)}
                  className="text-xs px-2 py-1 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-600"
                >
                  {role.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
