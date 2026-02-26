"use client";

import { useState } from "react";
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
      const { user, fromLocal } = data;
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
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <span className="text-xl font-semibold text-slate-800">MediLab360</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Sign in</h1>
        <p className="text-slate-500 text-sm mb-6">
          Use your email and password, or pick a role to auto-fill seed credentials.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@medilab360.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2">Quick login (seed data):</p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => fillRole(role)}
                className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 text-slate-700"
              >
                {role.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
