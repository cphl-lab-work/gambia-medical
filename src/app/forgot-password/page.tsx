"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background: same as login - hospital image + dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/images/cover-hospital.png)",
          backgroundColor: "#1e293b",
        }}
      />
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]" />

      {/* Centered content */}
      <div className="relative z-20 w-full max-w-lg px-4 flex flex-col items-center">
        {/* Emblem / logo */}
        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border-2 border-white/30 mb-3">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <p className="text-2xl font-semibold text-white tracking-tight">AHMIS</p>
        <p className="text-white/80 text-sm mb-6">Password Reset</p>

        {/* Main card */}
        <div className="w-full bg-white rounded-xl shadow-2xl p-6 sm:p-8">
          <h1 className="text-xl font-bold text-slate-800 text-center mb-2">Contact Administrator</h1>
          <p className="text-slate-600 text-sm text-center mb-6">
            To reset your password, please contact your system administrator.
          </p>

          {/* Contact details panel */}
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-5 mb-5 space-y-4">
            <div className="flex gap-3">
              <span className="text-slate-400 shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-slate-800 text-sm">System Administrator</p>
                <p className="text-slate-600 text-sm">Dr. Sarah Johnson</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-400 shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Email</p>
                <a href="mailto:admin@ahmis.com" className="text-slate-600 text-sm hover:text-blue-600">
                  admin@ahmis.com
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-slate-400 shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-slate-800 text-sm">Phone</p>
                <a href="tel:+256700123456" className="text-slate-600 text-sm hover:text-blue-600">
                  +256 700 123 456
                </a>
              </div>
            </div>
          </div>

          <p className="text-slate-600 text-sm text-center mb-6">
            Please provide your username and reason for password reset when contacting the administrator.
          </p>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
