"use client";

import { useState } from "react";
import Link from "next/link";

/* ── helpers ──────────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;

const SEMESTER_OPTIONS = [
  "Year 1 Semester 1",
  "Year 1 Semester 2",
  "Year 2 Semester 1",
  "Year 2 Semester 2",
  "Year 3 Semester 1",
  "Year 3 Semester 2",
  "Year 4 Semester 1",
  "Year 4 Semester 2",
];
const GENDERS = ["Male", "Female", "Prefer not to say"];
const POSITIONS = [
  "Professor",
  "Associate Professor",
  "Senior Lecturer",
  "Lecturer",
  "Assistant Lecturer",
  "Visiting Lecturer",
  "Instructor",
  "Teaching Assistant",
];

/* ── types ────────────────────────────────────────────────────── */
interface StudentForm {
  name: string; email: string; contact: string;
  semester: string;
  gender: string; age: string;
  password: string; confirmPassword: string;
}
interface LecturerForm {
  name: string; email: string; position: string;
  contact: string; password: string; confirmPassword: string;
}
type FieldErrors<T> = Partial<Record<keyof T, string>>;

/* ── shared field component ───────────────────────────────────── */
function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#1a3262" }}>
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-medium" style={{ color: "#dc2626" }}>{error}</p>}
    </div>
  );
}

const inputBase = {
  background: "#f8fafc",
  color: "#1e293b",
};
const inputClass = "w-full px-3.5 py-3 rounded-xl text-sm border outline-none transition-all";
const iconWrap   = "absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none";

function focusStyle(hasError: boolean) {
  return {
    borderColor: hasError ? "#dc2626" : "#e2e8f0",
    ...inputBase,
  };
}

function onFocusBorder(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) {
  e.currentTarget.style.borderColor = hasError ? "#dc2626" : "#1a3262";
  e.currentTarget.style.boxShadow   = `0 0 0 3px ${hasError ? "rgba(220,38,38,0.12)" : "rgba(26,50,98,0.12)"}`;
}
function onBlurBorder(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>, hasError: boolean) {
  e.currentTarget.style.borderColor = hasError ? "#dc2626" : "#e2e8f0";
  e.currentTarget.style.boxShadow   = "none";
}

/* ── icons ────────────────────────────────────────────────────── */
const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconEmail = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconPhone = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const IconLock = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconEyeOff = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);
const IconEye = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

/* ── password input with show/hide ────────────────────────────── */
function PasswordInput({
  value, onChange, placeholder, error,
}: { value: string; onChange: (v: string) => void; placeholder: string; error?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <span className={iconWrap} style={{ color: "#94a3b8" }}><IconLock /></span>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pl-10 pr-11`}
        style={focusStyle(!!error)}
        onFocus={(e) => onFocusBorder(e, !!error)}
        onBlur={(e)  => onBlurBorder(e, !!error)}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2"
        style={{ color: "#94a3b8" }}
        tabIndex={-1}
      >
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* STUDENT FORM                                                   */
/* ══════════════════════════════════════════════════════════════ */
function StudentRegistrationForm() {
  const [form, setForm] = useState<StudentForm>({
    name: "", email: "", contact: "",
    semester: "",
    gender: "", age: "",
    password: "", confirmPassword: "",
  });
  const [errors, setErrors]   = useState<FieldErrors<StudentForm>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(field: keyof StudentForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): FieldErrors<StudentForm> {
    const e: FieldErrors<StudentForm> = {};
    if (!form.name.trim())                                   e.name     = "Full name is required.";
    if (!form.email.trim())                                  e.email    = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim()))              e.email    = "Enter a valid email address.";
    if (!form.contact.trim())                                e.contact  = "Contact number is required.";
    else if (!PHONE_RE.test(form.contact.trim()))            e.contact  = "Enter a valid contact number.";
    if (!form.semester)                                      e.semester = "Please select a semester.";
    if (!form.gender)                                        e.gender   = "Please select your gender.";
    if (!form.age.trim())                                    e.age      = "Age is required.";
    else if (isNaN(Number(form.age)) || Number(form.age) < 16 || Number(form.age) > 60)
                                                             e.age      = "Enter a valid age (16–60).";
    if (!form.password)                                      e.password = "Password is required.";
    else if (form.password.length < 8)                       e.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(form.password))                  e.password = "Password must contain at least one uppercase letter.";
    else if (!/[0-9]/.test(form.password))                  e.password = "Password must contain at least one number.";
    if (!form.confirmPassword)                               e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)         e.confirmPassword = "Passwords do not match.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "student", ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ email: data.error ?? "Registration failed. Please try again." });
      } else {
        setSuccess(true);
      }
    } catch {
      setErrors({ email: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (success) return <SuccessBanner role="Student" />;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Name */}
      <Field label="Full Name" error={errors.name}>
        <div className="relative">
          <span className={iconWrap} style={{ color: "#94a3b8" }}><IconUser /></span>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Sandeepa Mallawarachchi"
            className={`${inputClass} pl-10`} style={focusStyle(!!errors.name)}
            onFocus={(e) => onFocusBorder(e, !!errors.name)}
            onBlur={(e)  => onBlurBorder(e, !!errors.name)}
          />
        </div>
      </Field>

      {/* Email */}
      <Field label="Email Address" error={errors.email}>
        <div className="relative">
          <span className={iconWrap} style={{ color: "#94a3b8" }}><IconEmail /></span>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
            placeholder="you@university.edu"
            className={`${inputClass} pl-10`} style={focusStyle(!!errors.email)}
            onFocus={(e) => onFocusBorder(e, !!errors.email)}
            onBlur={(e)  => onBlurBorder(e, !!errors.email)}
          />
        </div>
      </Field>

      {/* Contact */}
      <Field label="Contact Number" error={errors.contact}>
        <div className="relative">
          <span className={iconWrap} style={{ color: "#94a3b8" }}><IconPhone /></span>
          <input type="tel" value={form.contact} onChange={(e) => set("contact", e.target.value)}
            placeholder="+94 77 123 4567"
            className={`${inputClass} pl-10`} style={focusStyle(!!errors.contact)}
            onFocus={(e) => onFocusBorder(e, !!errors.contact)}
            onBlur={(e)  => onBlurBorder(e, !!errors.contact)}
          />
        </div>
      </Field>

      {/* Semester */}
      <Field label="Current Semester" error={errors.semester}>
        <select value={form.semester} onChange={(e) => set("semester", e.target.value)}
          className={`${inputClass} appearance-none`} style={focusStyle(!!errors.semester)}
          onFocus={(e) => onFocusBorder(e, !!errors.semester)}
          onBlur={(e)  => onBlurBorder(e, !!errors.semester)}
        >
          <option value="">Select your current semester</option>
          {SEMESTER_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Field>

      {/* Gender + Age */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Gender" error={errors.gender}>
          <select value={form.gender} onChange={(e) => set("gender", e.target.value)}
            className={`${inputClass} appearance-none`} style={focusStyle(!!errors.gender)}
            onFocus={(e) => onFocusBorder(e, !!errors.gender)}
            onBlur={(e)  => onBlurBorder(e, !!errors.gender)}
          >
            <option value="">Select gender</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>

        <Field label="Age" error={errors.age}>
          <input type="number" min={16} max={60} value={form.age} onChange={(e) => set("age", e.target.value)}
            placeholder="e.g. 21"
            className={inputClass} style={focusStyle(!!errors.age)}
            onFocus={(e) => onFocusBorder(e, !!errors.age)}
            onBlur={(e)  => onBlurBorder(e, !!errors.age)}
          />
        </Field>
      </div>

      {/* Password */}
      <Field label="Password" error={errors.password}>
        <PasswordInput value={form.password} onChange={(v) => set("password", v)}
          placeholder="Min 8 chars, 1 uppercase, 1 number" error={!!errors.password} />
      </Field>

      {/* Confirm Password */}
      <Field label="Confirm Password" error={errors.confirmPassword}>
        <PasswordInput value={form.confirmPassword} onChange={(v) => set("confirmPassword", v)}
          placeholder="Re-enter your password" error={!!errors.confirmPassword} />
        {form.password && form.confirmPassword && form.password === form.confirmPassword && (
          <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: "#059669" }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Passwords match
          </p>
        )}
      </Field>

      <RequestButton loading={loading} />
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* LECTURER FORM                                                  */
/* ══════════════════════════════════════════════════════════════ */
function LecturerRegistrationForm() {
  const [form, setForm] = useState<LecturerForm>({
    name: "", email: "", position: "",
    contact: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors]   = useState<FieldErrors<LecturerForm>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(field: keyof LecturerForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): FieldErrors<LecturerForm> {
    const e: FieldErrors<LecturerForm> = {};
    if (!form.name.trim())                                   e.name            = "Full name is required.";
    if (!form.email.trim())                                  e.email           = "Email is required.";
    else if (!EMAIL_RE.test(form.email.trim()))              e.email           = "Enter a valid email address.";
    if (!form.position)                                      e.position        = "Please select your position.";
    if (!form.contact.trim())                                e.contact         = "Contact number is required.";
    else if (!PHONE_RE.test(form.contact.trim()))            e.contact         = "Enter a valid contact number.";
    if (!form.password)                                      e.password        = "Password is required.";
    else if (form.password.length < 8)                       e.password        = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(form.password))                  e.password        = "Password must contain at least one uppercase letter.";
    else if (!/[0-9]/.test(form.password))                  e.password        = "Password must contain at least one number.";
    if (!form.confirmPassword)                               e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)         e.confirmPassword = "Passwords do not match.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "lecturer", ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ email: data.error ?? "Registration failed. Please try again." });
      } else {
        setSuccess(true);
      }
    } catch {
      setErrors({ email: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (success) return <SuccessBanner role="Lecturer" />;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Name */}
      <Field label="Full Name" error={errors.name}>
        <div className="relative">
          <span className={iconWrap} style={{ color: "#94a3b8" }}><IconUser /></span>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Dr. Nimal Perera"
            className={`${inputClass} pl-10`} style={focusStyle(!!errors.name)}
            onFocus={(e) => onFocusBorder(e, !!errors.name)}
            onBlur={(e)  => onBlurBorder(e, !!errors.name)}
          />
        </div>
      </Field>

      {/* Email */}
      <Field label="Email Address" error={errors.email}>
        <div className="relative">
          <span className={iconWrap} style={{ color: "#94a3b8" }}><IconEmail /></span>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
            placeholder="you@university.edu"
            className={`${inputClass} pl-10`} style={focusStyle(!!errors.email)}
            onFocus={(e) => onFocusBorder(e, !!errors.email)}
            onBlur={(e)  => onBlurBorder(e, !!errors.email)}
          />
        </div>
      </Field>

      {/* Position */}
      <Field label="Position / Designation" error={errors.position}>
        <select value={form.position} onChange={(e) => set("position", e.target.value)}
          className={`${inputClass} appearance-none`} style={focusStyle(!!errors.position)}
          onFocus={(e) => onFocusBorder(e, !!errors.position)}
          onBlur={(e)  => onBlurBorder(e, !!errors.position)}
        >
          <option value="">Select your position</option>
          {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>

      {/* Contact */}
      <Field label="Contact Number" error={errors.contact}>
        <div className="relative">
          <span className={iconWrap} style={{ color: "#94a3b8" }}><IconPhone /></span>
          <input type="tel" value={form.contact} onChange={(e) => set("contact", e.target.value)}
            placeholder="+94 77 123 4567"
            className={`${inputClass} pl-10`} style={focusStyle(!!errors.contact)}
            onFocus={(e) => onFocusBorder(e, !!errors.contact)}
            onBlur={(e)  => onBlurBorder(e, !!errors.contact)}
          />
        </div>
      </Field>

      {/* Password */}
      <Field label="Password" error={errors.password}>
        <PasswordInput value={form.password} onChange={(v) => set("password", v)}
          placeholder="Min 8 chars, 1 uppercase, 1 number" error={!!errors.password} />
      </Field>

      {/* Confirm Password */}
      <Field label="Confirm Password" error={errors.confirmPassword}>
        <PasswordInput value={form.confirmPassword} onChange={(v) => set("confirmPassword", v)}
          placeholder="Re-enter your password" error={!!errors.confirmPassword} />
        {form.password && form.confirmPassword && form.password === form.confirmPassword && (
          <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: "#059669" }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Passwords match
          </p>
        )}
      </Field>

      <RequestButton loading={loading} />
    </form>
  );
}

/* ── Request Registration button ──────────────────────────────── */
function RequestButton({ loading }: { loading: boolean }) {
  return (
    <div className="pt-2 space-y-3">
      {/* Info notice */}
      <div
        className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs font-medium"
        style={{ background: "rgba(232,160,32,0.1)", borderLeft: "3px solid #e8a020", color: "#92600a" }}
      >
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Your registration will be reviewed by the Super Admin. You will be notified once your account is approved.
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "#e8a020", color: "#0e1f45" }}
        onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#f0b84a"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#e8a020"; }}
      >
        {loading
          ? <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Submitting Request…
            </>
          : <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Request Registration
            </>
        }
      </button>
    </div>
  );
}

/* ── Success banner ────────────────────────────────────────────── */
function SuccessBanner({ role }: { role: string }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-lg"
        style={{ background: "rgba(5,150,105,0.12)" }}
      >
        <svg className="w-10 h-10" fill="none" stroke="#059669" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-black mb-2" style={{ color: "#1a3262" }}>Request Submitted!</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-1">
        Your <strong>{role}</strong> registration request has been received.
      </p>
      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
        The Super Admin will review your details and notify you upon approval.
      </p>
      <Link
        href="/login"
        className="mt-8 flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all hover:scale-105"
        style={{ background: "#1a3262", color: "#e8a020" }}
      >
        Back to Login
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/* PAGE                                                           */
/* ══════════════════════════════════════════════════════════════ */
type Tab = "student" | "lecturer";

export default function RegisterPage() {
  const [tab, setTab] = useState<Tab>("student");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(135deg, #0e1f45 0%, #1a3262 45%, #1e3d72 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "#e8a020", transform: "translate(40%, -40%)" }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "#e8a020", transform: "translate(-40%, 40%)" }}
      />

      <div className="relative w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Gold top strip */}
          <div className="h-1.5 w-full" style={{ background: "#e8a020" }} />

          <div className="px-8 pt-8 pb-10">

            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 mb-3">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="20" cy="20" r="20" fill="#1a3262" />
                  <path d="M8 27 L20 11 L32 27" stroke="#e8a020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M13 27 L20 17 L27 27" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <rect x="14" y="27" width="12" height="3.5" rx="1" fill="#e8a020"/>
                  <circle cx="20" cy="9" r="2.2" fill="white"/>
                </svg>
              </div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: "#1a3262" }}>
                Edu<span style={{ color: "#e8a020" }}>Mind</span>
              </h1>
              <p className="text-xs font-semibold tracking-widest uppercase mt-0.5" style={{ color: "#94a3b8" }}>
                University Platform
              </p>
            </div>

            <h2 className="text-xl font-black mb-1" style={{ color: "#1a3262" }}>Create an Account</h2>
            <p className="text-sm text-gray-400 mb-6">Select your role and fill in your details below.</p>

            {/* Tabs */}
            <div
              className="flex rounded-xl p-1 mb-7"
              style={{ background: "#f1f5f9" }}
            >
              {(["student", "lecturer"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-300"
                  style={
                    tab === t
                      ? { background: "#1a3262", color: "#e8a020", boxShadow: "0 2px 8px rgba(26,50,98,0.25)" }
                      : { background: "transparent", color: "#64748b" }
                  }
                >
                  {t === "student"
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                  }
                  {t === "student" ? "Student" : "Lecturer"}
                </button>
              ))}
            </div>

            {/* Form */}
            {tab === "student" ? <StudentRegistrationForm /> : <LecturerRegistrationForm />}

            {/* Sign in link */}
            <div className="flex items-center gap-3 mt-7">
              <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
              <span className="text-xs text-gray-400 font-medium">Already have an account?</span>
              <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
            </div>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-300 hover:scale-[1.02]"
              style={{ borderColor: "#1a3262", color: "#1a3262" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(26,50,98,0.06)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              Sign In Instead
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
