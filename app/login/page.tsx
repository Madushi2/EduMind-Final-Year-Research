"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "Enter a valid email address.";
    }
    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error ?? "Invalid email or password." });
      } else {
        router.push(data.role === "superadmin" ? "/admin" : data.role === "lecturer" ? "/lecturer" : "/student");
      }
    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(135deg, #0e1f45 0%, #1a3262 45%, #1e3d72 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none fixed top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "#e8a020", transform: "translate(-40%, -40%)" }}
      />
      <div
        className="pointer-events-none fixed bottom-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "#e8a020", transform: "translate(40%, 40%)" }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Gold top strip */}
          <div className="h-1.5 w-full" style={{ background: "#e8a020" }} />

          <div className="px-8 pt-8 pb-10">

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 mb-3">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="20" cy="20" r="20" fill="#1a3262" />
                  <path d="M8 27 L20 11 L32 27" stroke="#e8a020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M13 27 L20 17 L27 27" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <rect x="14" y="27" width="12" height="3.5" rx="1" fill="#e8a020"/>
                  <circle cx="20" cy="9" r="2.2" fill="white"/>
                </svg>
              </div>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: "#1a3262" }}>
                Edu<span style={{ color: "#e8a020" }}>Mind</span>
              </h1>
              <p className="text-xs font-semibold tracking-widest uppercase mt-1" style={{ color: "#94a3b8" }}>
                University Platform
              </p>
            </div>

            <h2 className="text-xl font-black mb-1" style={{ color: "#1a3262" }}>Welcome back</h2>
            <p className="text-sm text-gray-400 mb-7">Sign in to your account to continue.</p>

            {errors.general && (
              <div className="flex items-center gap-2 mb-5 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)" }}>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#1a3262" }}>
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#94a3b8" }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all"
                    style={{
                      borderColor: errors.email ? "#dc2626" : "#e2e8f0",
                      background: "#f8fafc",
                      color: "#1e293b",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = errors.email ? "#dc2626" : "#1a3262"; e.currentTarget.style.boxShadow = `0 0 0 3px ${errors.email ? "rgba(220,38,38,0.12)" : "rgba(26,50,98,0.12)"}`; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = errors.email ? "#dc2626" : "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs font-medium" style={{ color: "#dc2626" }}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#1a3262" }}>
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#94a3b8" }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm border outline-none transition-all"
                    style={{
                      borderColor: errors.password ? "#dc2626" : "#e2e8f0",
                      background: "#f8fafc",
                      color: "#1e293b",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = errors.password ? "#dc2626" : "#1a3262"; e.currentTarget.style.boxShadow = `0 0 0 3px ${errors.password ? "rgba(220,38,38,0.12)" : "rgba(26,50,98,0.12)"}`; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = errors.password ? "#dc2626" : "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "#94a3b8" }}
                    tabIndex={-1}
                  >
                    {showPass
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs font-medium" style={{ color: "#dc2626" }}>{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{ background: "#1a3262", color: "#e8a020" }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#0e1f45"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1a3262"; }}
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Signing in…
                    </span>
                  : "Sign In"
                }
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
              <span className="text-xs text-gray-400 font-medium">Don&apos;t have an account?</span>
              <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
            </div>

            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold border-2 transition-all duration-300 hover:scale-[1.02]"
              style={{ borderColor: "#e8a020", color: "#e8a020" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(232,160,32,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              Request Registration
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.35)" }}>
          © 2026 EduMind · University Platform
        </p>
      </div>
    </div>
  );
}
