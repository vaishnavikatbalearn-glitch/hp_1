// ─── AUTH FLOW — extracted from P1 (hp_p1) ───────────────────────────────────
// Screens: splash, welcome, role, login, forgot, otp, reset, reg1-5, success, face, profile
// Navigation is handled internally; on completion calls onAuthComplete(role)

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, ArrowRight, Eye, EyeOff, Check, ChevronDown, Upload, Camera,
  User, BookOpen, Users, Phone, FileText, Shield, Building2,
  DollarSign, Shirt, Home, Bell, Settings, Lock, Mail, RefreshCw,
  CheckCircle, AlertCircle, X, Plus,
} from "lucide-react";

type Screen =
  | "splash" | "welcome" | "role" | "login" | "forgot" | "otp" | "reset"
  | "reg1" | "reg2" | "reg3" | "reg4" | "reg5" | "success" | "face" | "profile"
  // Staff activation flow
  | "staff-activate" | "staff-otp" | "staff-create-password" | "staff-activation-success";

export interface AuthFlowProps {
  onAuthComplete: (role: string) => void;
}

// ── Mobile Shell ──────────────────────────────────────────────────────────────
function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 font-[Inter,sans-serif]">
      <div
        className="relative bg-[#F8FAFC] w-[390px] h-[844px] rounded-[44px] overflow-hidden shadow-2xl"
        style={{ fontFamily: "Inter, sans-serif", boxShadow: "0 40px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.15)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-8 z-50">
          <span className="text-xs font-semibold text-current opacity-80">9:41</span>
          <div className="w-28 h-7 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-0" />
          <div className="flex items-center gap-1 opacity-80">
            <div className="flex gap-0.5 items-end h-3">
              {[2, 3, 4, 4].map((h, i) => (
                <div key={i} className="w-0.5 rounded-full bg-current" style={{ height: `${h * 3}px` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}

function PrimaryButton({ label, onClick, disabled, loading, icon }: {
  label: string; onClick?: () => void; disabled?: boolean; loading?: boolean; icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-14 rounded-2xl bg-[#2563EB] text-white font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30"
      style={{ background: disabled ? "#94A3B8" : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" }}
    >
      {loading ? <RefreshCw size={20} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

function SecondaryButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full h-14 rounded-2xl border-2 border-[#2563EB] text-[#2563EB] font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all bg-white"
    >
      {label}
    </button>
  );
}

function InputField({ label, placeholder, type = "text", icon, rightIcon, value, onChange, error, helper }: {
  label?: string; placeholder?: string; type?: string; icon?: React.ReactNode; rightIcon?: React.ReactNode;
  value?: string; onChange?: (v: string) => void; error?: string; helper?: string;
}) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>}
      <div className={`relative flex items-center h-14 rounded-2xl bg-white border-2 px-4 transition-all ${error ? "border-red-400" : "border-slate-100 focus-within:border-[#2563EB]"}`}
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {icon && <span className="text-slate-400 mr-3 flex-shrink-0">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-sm font-medium"
        />
        {rightIcon && <span className="ml-3 flex-shrink-0 text-slate-400">{rightIcon}</span>}
      </div>
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
      {helper && !error && <p className="text-xs text-slate-400 mt-1">{helper}</p>}
    </div>
  );
}

function BackHeader({ title, onBack, light }: { title?: string; onBack?: () => void; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-5 pt-14 pb-4 ${light ? "text-white" : "text-slate-800"}`}>
      <button onClick={onBack} className={`w-10 h-10 rounded-2xl flex items-center justify-center ${light ? "bg-white/20" : "bg-white shadow-sm border border-slate-100"}`}>
        <ArrowLeft size={20} />
      </button>
      {title && <h2 className="font-bold text-lg flex-1">{title}</h2>}
    </div>
  );
}

function StepIndicator({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5 px-5 pt-14 pb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 rounded-full transition-all ${i < current ? "bg-[#2563EB] flex-1" : i === current ? "bg-[#2563EB] flex-[2]" : "bg-slate-200 flex-1"}`} />
      ))}
    </div>
  );
}

function SplashScreen({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    const t = setTimeout(onNext, 2800);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, #1E40AF 0%, #2563EB 40%, #3B82F6 70%, #14B8A6 100%)" }}>
      {/* Abstract blobs */}
      <div className="absolute top-[-80px] right-[-60px] w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-100px] left-[-50px] w-80 h-80 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #14B8A6 0%, transparent 70%)" }} />
      <div className="absolute top-1/3 left-[-40px] w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #93C5FD 0%, transparent 70%)" }} />

      {/* Logo mark */}
      <div className="relative mb-6">
        <div className="w-28 h-28 rounded-[32px] bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
          <div className="w-20 h-20 rounded-[24px] bg-white flex items-center justify-center">
            <div className="text-center">
              <Building2 size={28} className="text-[#2563EB] mx-auto" />
              <div className="text-[8px] font-black text-[#2563EB] tracking-tight leading-none mt-0.5">HP</div>
            </div>
          </div>
        </div>
        {/* Ping rings */}
        <div className="absolute inset-0 rounded-[32px] border-2 border-white/30 animate-ping" style={{ animationDuration: "2s" }} />
      </div>

      <h1 className="text-white font-black text-4xl tracking-tight">HostelPaglu</h1>
      <p className="text-blue-100 text-base font-medium mt-2 tracking-wide">Smart Hostel Management</p>

      {/* Loading dots */}
      <div className="absolute bottom-16 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      <p className="absolute bottom-8 text-blue-200/60 text-xs">v2.1.0</p>
    </div>
  );
}

// ── 2. Welcome Screen ─────────────────────────────────────────────────────────

function WelcomeScreen({ onNext, onLogin }: { onNext: () => void; onLogin: () => void }) {
  const slides = [
    { icon: <Building2 size={40} className="text-[#2563EB]" />, title: "One Platform,\nAll Hostel Needs", desc: "Manage rooms, fees, complaints, and more from a single unified dashboard." },
    { icon: <Shield size={40} className="text-[#2563EB]" />, title: "Face-ID\nSecured Entry", desc: "Biometric face enrollment ensures only authorized residents enter the premises." },
    { icon: <Bell size={40} className="text-[#2563EB]" />, title: "Real-time\nAlerts & Updates", desc: "Instant notifications for fees, visitors, maintenance, and hostel announcements." },
  ];
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#F8FAFC]">
      {/* Top visual */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: "55%" }}>
        <div style={{ background: "linear-gradient(150deg, #EFF6FF 0%, #DBEAFE 60%, #BFDBFE 100%)" }} className="w-full h-full flex items-center justify-center">
          <div className="w-56 h-56 rounded-[48px] bg-white shadow-xl flex items-center justify-center"
            style={{ boxShadow: "0 20px 60px rgba(37,99,235,0.15)" }}>
            <div className="text-center transition-all duration-500">
              <div className="w-20 h-20 rounded-3xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-3">
                {slides[slide].icon}
              </div>
            </div>
          </div>
        </div>
        {/* Wave */}
        <svg viewBox="0 0 390 60" className="absolute bottom-0 left-0 w-full" fill="#F8FAFC" preserveAspectRatio="none">
          <path d="M0 40 Q97.5 0 195 30 Q292.5 60 390 20 L390 60 L0 60 Z" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex-1 flex flex-col px-6 pt-2 pb-8">
        <div className="flex-1">
          <h2 className="font-black text-3xl text-slate-800 leading-tight whitespace-pre-line transition-all duration-500">
            {slides[slide].title}
          </h2>
          <p className="text-slate-500 text-base mt-3 leading-relaxed">{slides[slide].desc}</p>
          {/* Dots */}
          <div className="flex gap-2 mt-5">
            {slides.map((_, i) => (
              <div key={i} onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === slide ? "w-6 bg-[#2563EB]" : "w-2 bg-slate-200"}`} />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <PrimaryButton label="Get Started" onClick={onNext} icon={<ArrowRight size={20} />} />
          <button onClick={onLogin} className="w-full text-[#2563EB] font-semibold text-base py-2">
            Already have an account? <span className="underline">Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 3. Role Selection ─────────────────────────────────────────────────────────

const ROLES = [
  { id: "student", label: "Student", icon: <User size={22} />, color: "#2563EB", bg: "#EFF6FF", desc: "Resident & Fees" },
  { id: "parent", label: "Parent", icon: <Users size={22} />, color: "#8B5CF6", bg: "#F3F0FF", desc: "Monitor Ward" },
  { id: "warden", label: "Warden", icon: <Shield size={22} />, color: "#14B8A6", bg: "#F0FDFA", desc: "Hostel Control" },
  { id: "admin", label: "Admin", icon: <Settings size={22} />, color: "#F59E0B", bg: "#FFFBEB", desc: "Management" },
  { id: "superadmin", label: "Super Admin", icon: <Lock size={22} />, color: "#EF4444", bg: "#FEF2F2", desc: "Full Access" },
  { id: "trustee", label: "Trustee", icon: <Building2 size={22} />, color: "#0EA5E9", bg: "#F0F9FF", desc: "Oversight" },
  { id: "accountant", label: "Accountant", icon: <DollarSign size={22} />, color: "#10B981", bg: "#F0FDF4", desc: "Finance" },
  { id: "laundry", label: "Laundry Staff", icon: <Shirt size={22} />, color: "#F97316", bg: "#FFF7ED", desc: "Services" },
];

function RoleScreen({ onSelect }: { onSelect: (r: string) => void }) {
  const [selected, setSelected] = useState("");

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      <div className="pt-14 pb-2 px-5">
        <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-4">
          <Users size={20} className="text-[#2563EB]" />
        </div>
        <h1 className="font-black text-2xl text-slate-800">Who are you?</h1>
        <p className="text-slate-500 text-sm mt-1">Select your role to continue</p>
      </div>

      <div className="flex-1 px-5 py-3 grid grid-cols-2 gap-3">
        {ROLES.map((r) => (
          <button key={r.id} onClick={() => setSelected(r.id)}
            className={`relative p-4 rounded-2xl text-left transition-all active:scale-[0.97] border-2 ${selected === r.id ? "border-[#2563EB] bg-[#EFF6FF]" : "border-transparent bg-white"}`}
            style={{ boxShadow: selected === r.id ? "0 4px 16px rgba(37,99,235,0.2)" : "0 1px 4px rgba(0,0,0,0.06)" }}>
            {selected === r.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2" style={{ background: r.bg, color: r.color }}>
              {r.icon}
            </div>
            <p className="font-bold text-slate-800 text-sm">{r.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
          </button>
        ))}
      </div>

      <div className="px-5 pb-10 pt-2">
        <PrimaryButton label="Continue" onClick={() => selected && onSelect(selected)} disabled={!selected} />
      </div>
    </div>
  );
}

// ── 4. Login Screen ───────────────────────────────────────────────────────────

function LoginScreen({ onLogin, onForgot, onBack, onRegister }: {
  onLogin: () => void; onForgot: () => void; onBack: () => void; onRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = email.trim() !== "" && emailRegex.test(email);
  const passValid = pass.length >= 8 && /[A-Z]/.test(pass) && /\d/.test(pass);
  const isFormValid = emailValid && passValid;

  const emailError = email.trim() === "" ? "Email is required" : !emailRegex.test(email) ? "Invalid email format" : "";
  const passError = pass === "" ? "Password is required" : pass.length < 8 ? "Password must be at least 8 characters" : !/[A-Z]/.test(pass) ? "Password must include an uppercase letter" : !/\d/.test(pass) ? "Password must include a number" : "";

  const handleLogin = () => {
    if (!isFormValid) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1500);
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      {/* Header gradient */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(150deg, #1E40AF 0%, #2563EB 100%)", height: 200 }}>
        <div className="absolute top-[-40px] right-[-30px] w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 rounded-full bg-white/5" />
        <div className="pt-14 px-5">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white font-black text-2xl">Welcome Back 👋</h1>
          <p className="text-blue-100 text-sm mt-1">Sign in to your HostelPaglu account</p>
        </div>
        <svg viewBox="0 0 390 40" className="absolute bottom-0 left-0 w-full" fill="#F8FAFC" preserveAspectRatio="none">
          <path d="M0 20 Q195 0 390 20 L390 40 L0 40 Z" />
        </svg>
      </div>

      <div className="flex-1 px-5 pt-4 pb-10 flex flex-col gap-4">
        <InputField label="Email Address" placeholder="student@hostelpaglu.in" icon={<Mail size={18} />} type="email" value={email} onChange={setEmail} error={emailError} />
        <InputField label="Password" placeholder="Enter your password" icon={<Lock size={18} />} type={showPass ? "text" : "password"} value={pass} onChange={setPass}
          rightIcon={<button onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>} error={passError} />

        <button onClick={onForgot} className="text-[#2563EB] font-semibold text-sm text-right w-full">Forgot Password?</button>

        {/* Biometric */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">or sign in with</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="flex gap-3">
          {[{ label: "Face ID", icon: <Camera size={20} className="text-[#2563EB]" /> }, { label: "Fingerprint", icon: <Shield size={20} className="text-[#14B8A6]" /> }].map((b) => (
            <button key={b.label} className="flex-1 h-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center gap-2 font-semibold text-sm text-slate-700"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {b.icon} {b.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <PrimaryButton label={loading ? "Signing In…" : "Sign In"} onClick={handleLogin} loading={loading} disabled={!isFormValid} />
        <p className="text-center text-sm text-slate-500">
          New student? <button onClick={onRegister} className="text-[#2563EB] font-bold">Register Here</button>
        </p>
      </div>
    </div>
  );
}

// ── 5. Forgot Password ────────────────────────────────────────────────────────

function ForgotScreen({ onSend, onBack }: { onSend: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = email.trim() !== "" && emailRegex.test(email);
  const emailError = email.trim() === "" ? "Email is required" : !emailRegex.test(email) ? "Invalid email format" : "";

  const handle = () => {
    if (!emailValid) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); setTimeout(onSend, 1200); }, 1500);
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      <BackHeader title="Forgot Password" onBack={onBack} />
      <div className="flex-1 px-5 pt-4 pb-10 flex flex-col">
        {/* Illustration */}
        <div className="w-full h-44 rounded-3xl bg-[#EFF6FF] flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-white mx-auto flex items-center justify-center mb-2 shadow-md">
              <Mail size={36} className="text-[#2563EB]" />
            </div>
            <p className="text-sm font-semibold text-[#2563EB]">Password Recovery</p>
          </div>
        </div>

        <h2 className="font-black text-xl text-slate-800">Reset Your Password</h2>
        <p className="text-slate-500 text-sm mt-2 mb-6 leading-relaxed">
          Enter your registered email address. We will send a 6-digit OTP to reset your password.
        </p>

        <InputField label="Registered Email" placeholder="your@email.com" icon={<Mail size={18} />} type="email" value={email} onChange={setEmail}
          error={emailError} helper={!emailError ? "OTP will be sent to this email" : undefined} />

        {sent && (
          <div className="mt-4 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">OTP sent! Check your inbox.</p>
          </div>
        )}

        <div className="flex-1" />
        <PrimaryButton label="Send OTP" onClick={handle} loading={loading} disabled={!emailValid} />
      </div>
    </div>
  );
}

// ── 6. OTP Verification ───────────────────────────────────────────────────────

function OTPScreen({ onVerify, onBack }: { onVerify: () => void; onBack: () => void }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [timer, setTimer] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(t => t - 1), 1000); return () => clearTimeout(t); }
  }, [timer]);

  const handleInput = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };
  const handleKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };
  const filled = otp.every((d) => d !== "");
  const handle = () => { setLoading(true); setTimeout(() => { setLoading(false); onVerify(); }, 1500); };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      <BackHeader title="OTP Verification" onBack={onBack} />
      <div className="flex-1 px-5 pt-4 pb-10 flex flex-col">
        <div className="w-20 h-20 rounded-3xl bg-[#EFF6FF] mx-auto flex items-center justify-center mb-5">
          <Shield size={36} className="text-[#2563EB]" />
        </div>
        <h2 className="font-black text-xl text-slate-800 text-center">Enter Verification Code</h2>
        <p className="text-slate-500 text-sm mt-2 mb-8 text-center leading-relaxed">
          We sent a 6-digit code to<br /><span className="font-semibold text-slate-700">aryan.sharma@gmail.com</span>
        </p>

        {/* OTP boxes */}
        <div className="flex gap-2 justify-center mb-6">
          {otp.map((d, i) => (
            <input key={i} ref={(el) => { refs.current[i] = el; }}
              value={d} onChange={(e) => handleInput(i, e.target.value)} onKeyDown={(e) => handleKey(i, e)}
              maxLength={1} type="tel"
              className={`w-12 h-14 rounded-2xl text-center text-xl font-bold outline-none border-2 transition-all bg-white ${d ? "border-[#2563EB] text-[#2563EB]" : "border-slate-200 text-slate-800"} focus:border-[#2563EB]`}
              style={{ boxShadow: d ? "0 4px 12px rgba(37,99,235,0.15)" : "0 1px 4px rgba(0,0,0,0.06)" }}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="text-center mb-8">
          {timer > 0 ? (
            <p className="text-sm text-slate-500">Resend OTP in <span className="font-bold text-[#2563EB]">00:{String(timer).padStart(2, "0")}</span></p>
          ) : (
            <button onClick={() => { setTimer(30); setResent(true); }} className="text-sm font-bold text-[#2563EB]">
              Resend OTP
            </button>
          )}
          {resent && <p className="text-xs text-green-600 mt-1 font-medium">New OTP sent!</p>}
        </div>

        {filled && !loading && (
          <div className="mb-4 p-3 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <p className="text-xs text-green-700 font-medium">Code looks good! Tap verify to continue.</p>
          </div>
        )}

        <div className="flex-1" />
        <PrimaryButton label="Verify OTP" onClick={handle} loading={loading} disabled={!filled} />
      </div>
    </div>
  );
}

// ── 7. Reset Password ─────────────────────────────────────────────────────────

// ── 5.5 Staff activation steps (reuse OTP + reset UIs, no redesign) ──────────────

function StaffActivateScreen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = staffId.trim().length >= 3;
  const error = staffId.trim() === "" ? "Staff identifier is required" : staffId.trim().length < 3 ? "Enter a valid identifier" : "";

  const handle = () => {
    if (!valid || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 1500);
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      <BackHeader title="Staff Activation" onBack={onBack} />
      <div className="flex-1 px-5 pt-4 pb-10 flex flex-col">
        <div className="w-full h-44 rounded-3xl bg-[#EFF6FF] flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-white mx-auto flex items-center justify-center mb-2 shadow-md">
              <Shield size={36} className="text-[#2563EB]" />
            </div>
            <p className="text-sm font-semibold text-[#2563EB]">Activate your staff account</p>
          </div>
        </div>

        <h2 className="font-black text-xl text-slate-800">Verify your account</h2>
        <p className="text-slate-500 text-sm mt-2 mb-6 leading-relaxed">
          Enter your staff identifier. We will send a 6-digit OTP to verify the activation.
        </p>

        <InputField
          label="Staff Identifier"
          placeholder="e.g. staff@hostelpaglu.in"
          icon={<Mail size={18} />}
          type="text"
          value={staffId}
          onChange={setStaffId}
          error={error ? error : undefined}
          helper={!error ? "OTP will be sent after verification" : undefined}
        />

        <div className="flex-1" />
        <PrimaryButton label={loading ? "Sending OTP…" : "Send OTP"} onClick={handle} loading={loading} disabled={!valid} />
      </div>
    </div>
  );
}

function StaffOTPScreen({ onVerify, onBack }: { onVerify: () => void; onBack: () => void }) {
  // Reuse OTP UI with staff-specific messaging.
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [timer, setTimer] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((x) => x - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleInput = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };

  const filled = otp.every((d) => d !== "");
  const handle = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onVerify();
    }, 1500);
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      <BackHeader title="OTP Verification" onBack={onBack} />
      <div className="flex-1 px-5 pt-4 pb-10 flex flex-col">
        <div className="w-20 h-20 rounded-3xl bg-[#EFF6FF] mx-auto flex items-center justify-center mb-5">
          <Shield size={36} className="text-[#2563EB]" />
        </div>
        <h2 className="font-black text-xl text-slate-800 text-center">Enter Verification Code</h2>
        <p className="text-slate-500 text-sm mt-2 mb-8 text-center leading-relaxed">
          We sent a 6-digit code to<br />
          <span className="font-semibold text-slate-700">your registered email</span>
        </p>

        <div className="flex gap-2 justify-center mb-6">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              maxLength={1}
              type="tel"
              className={`w-12 h-14 rounded-2xl text-center text-xl font-bold outline-none border-2 transition-all bg-white ${d ? "border-[#2563EB] text-[#2563EB]" : "border-slate-200 text-slate-800"} focus:border-[#2563EB]`}
              style={{ boxShadow: d ? "0 4px 12px rgba(37,99,235,0.15)" : "0 1px 4px rgba(0,0,0,0.06)" }}
            />
          ))}
        </div>

        <div className="text-center mb-8">
          {timer > 0 ? (
            <p className="text-sm text-slate-500">Resend OTP in <span className="font-bold text-[#2563EB]">00:{String(timer).padStart(2, "0")}</span></p>
          ) : (
            <button
              onClick={() => {
                setTimer(30);
                setResent(true);
              }}
              className="text-sm font-bold text-[#2563EB]"
            >
              Resend OTP
            </button>
          )}
          {resent && <p className="text-xs text-green-600 mt-1 font-medium">New OTP sent!</p>}
        </div>

        {filled && !loading && (
          <div className="mb-4 p-3 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <p className="text-xs text-green-700 font-medium">Code looks good! Tap verify to continue.</p>
          </div>
        )}

        <div className="flex-1" />
        <PrimaryButton label="Verify OTP" onClick={handle} loading={loading} disabled={!filled} />
      </div>
    </div>
  );
}

function StaffCreatePasswordScreen({ onCreate, onBack }: { onCreate: () => void; onBack: () => void }) {
  // Reuse Reset password UI with staff activation success wording.
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = pass.length === 0 ? 0 : pass.length < 6 ? 1 : pass.length < 10 ? 2 : /[A-Z]/.test(pass) && /\d/.test(pass) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#EF4444", "#F59E0B", "#10B981", "#2563EB"][strength];

  const valid = pass.length >= 8 && pass === confirm;
  const handle = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onCreate();
    }, 1500);
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      <BackHeader title="Create Password" onBack={onBack} />
      <div className="flex-1 px-5 pt-4 pb-10 flex flex-col gap-5">
        <div className="p-4 rounded-2xl bg-[#EFF6FF] flex items-start gap-3">
          <CheckCircle size={20} className="text-[#2563EB] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#1E40AF] font-medium">OTP verified. Create a secure password for your staff account.</p>
        </div>

        <div>
          <InputField
            label="New Password"
            placeholder="Min 8 characters"
            icon={<Lock size={18} />}
            type={show1 ? "text" : "password"}
            value={pass}
            onChange={setPass}
            rightIcon={<button onClick={() => setShow1(!show1)}>{show1 ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
          />
          {pass.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= strength ? strengthColor : "#E2E8F0" }}
                  />
                ))}
              </div>
              <p className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel} password</p>
            </div>
          )}
        </div>

        <InputField
          label="Confirm Password"
          placeholder="Repeat your password"
          icon={<Lock size={18} />}
          type={show2 ? "text" : "password"}
          value={confirm}
          onChange={setConfirm}
          rightIcon={<button onClick={() => setShow2(!show2)}>{show2 ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
          error={confirm.length > 0 && pass !== confirm ? "Passwords do not match" : undefined}
        />

        <div className="space-y-2">
          {[
            { rule: "At least 8 characters", ok: pass.length >= 8 },
            { rule: "One uppercase letter", ok: /[A-Z]/.test(pass) },
            { rule: "One number", ok: /\d/.test(pass) },
          ].map((r) => (
            <div key={r.rule} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${r.ok ? "bg-green-500" : "bg-slate-200"}`}>
                {r.ok && <Check size={10} className="text-white" />}
              </div>
              <span className={`text-xs font-medium ${r.ok ? "text-green-700" : "text-slate-400"}`}>{r.rule}</span>
            </div>
          ))}
        </div>

        <div className="flex-1" />
        <PrimaryButton label={loading ? "Creating…" : "Create Password"} onClick={handle} loading={loading} disabled={!valid} />
      </div>
    </div>
  );
}

function StaffActivationSuccessScreen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8FAFC] px-6">
      <div className="relative mb-8">
        <div className="w-36 h-36 rounded-full bg-green-100 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-xl shadow-green-200">
            <Check size={44} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-30" />
      </div>

      <h1 className="font-black text-3xl text-slate-800 text-center">Account Activated!</h1>
      <p className="text-slate-500 text-base mt-3 text-center leading-relaxed">
        Your staff account is now active. You can sign in to access your dashboard.
      </p>

      <div className="w-full mt-6 p-5 rounded-3xl bg-white border border-slate-100 shadow-lg">
        <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Next Steps</p>
        <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
          <span className="text-sm text-slate-500 font-medium">Sign in</span>
          <span className="text-sm font-bold text-slate-800">to continue</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm text-slate-500 font-medium">Need help?</span>
          <span className="text-xs font-bold text-blue-700">Contact admin</span>
        </div>
      </div>

      <div className="w-full mt-6 space-y-3">
        <PrimaryButton label="Go to Sign In" onClick={onNext} icon={<ArrowRight size={20} />} />
        <button onClick={onBack} className="w-full text-[#2563EB] font-semibold text-base py-2">
          Back
        </button>
      </div>
    </div>
  );
}

function ResetScreen({ onReset, onBack }: { onReset: () => void; onBack: () => void }) {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = pass.length === 0 ? 0 : pass.length < 6 ? 1 : pass.length < 10 ? 2 : /[A-Z]/.test(pass) && /\d/.test(pass) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#EF4444", "#F59E0B", "#10B981", "#2563EB"][strength];

  const valid = pass.length >= 8 && pass === confirm;
  const handle = () => { setLoading(true); setTimeout(() => { setLoading(false); onReset(); }, 1500); };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      <BackHeader title="Reset Password" onBack={onBack} />
      <div className="flex-1 px-5 pt-4 pb-10 flex flex-col gap-5">
        <div className="p-4 rounded-2xl bg-[#EFF6FF] flex items-start gap-3">
          <CheckCircle size={20} className="text-[#2563EB] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#1E40AF] font-medium">OTP verified successfully. Create a new strong password.</p>
        </div>

        <div>
          <InputField label="New Password" placeholder="Min 8 characters" icon={<Lock size={18} />}
            type={show1 ? "text" : "password"} value={pass} onChange={setPass}
            rightIcon={<button onClick={() => setShow1(!show1)}>{show1 ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />
          {pass.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= strength ? strengthColor : "#E2E8F0" }} />
                ))}
              </div>
              <p className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel} password</p>
            </div>
          )}
        </div>

        <InputField label="Confirm Password" placeholder="Repeat your password" icon={<Lock size={18} />}
          type={show2 ? "text" : "password"} value={confirm} onChange={setConfirm}
          rightIcon={<button onClick={() => setShow2(!show2)}>{show2 ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
          error={confirm.length > 0 && pass !== confirm ? "Passwords do not match" : undefined} />

        {/* Rules */}
        <div className="space-y-2">
          {[
            { rule: "At least 8 characters", ok: pass.length >= 8 },
            { rule: "One uppercase letter", ok: /[A-Z]/.test(pass) },
            { rule: "One number", ok: /\d/.test(pass) },
          ].map((r) => (
            <div key={r.rule} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${r.ok ? "bg-green-500" : "bg-slate-200"}`}>
                {r.ok && <Check size={10} className="text-white" />}
              </div>
              <span className={`text-xs font-medium ${r.ok ? "text-green-700" : "text-slate-400"}`}>{r.rule}</span>
            </div>
          ))}
        </div>

        <div className="flex-1" />
        <PrimaryButton label="Reset Password" onClick={handle} loading={loading} disabled={!valid} />
      </div>
    </div>
  );
}

// ── Registration shared ───────────────────────────────────────────────────────

function RegShell({ step, total, title, subtitle, onBack, onNext, nextLabel = "Continue", children, nextDisabled }: {
  step: number; total: number; title: string; subtitle: string; onBack: () => void; onNext: () => void;
  nextLabel?: string; children: React.ReactNode; nextDisabled?: boolean;
}) {
  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      <div style={{ background: "linear-gradient(150deg, #1E40AF 0%, #2563EB 100%)" }} className="relative overflow-hidden px-5 pt-14 pb-6">
        <div className="absolute top-[-30px] right-[-20px] w-32 h-32 rounded-full bg-white/10" />
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-white font-black text-xl">{title}</h1>
        <p className="text-blue-100 text-sm mt-0.5">{subtitle}</p>
        <svg viewBox="0 0 390 30" className="absolute bottom-0 left-0 w-full" fill="#F8FAFC" preserveAspectRatio="none">
          <path d="M0 15 Q195 0 390 15 L390 30 L0 30 Z" />
        </svg>
      </div>
      <StepIndicator total={total} current={step} />
      <div className="flex-1 px-5 py-2 flex flex-col gap-4 overflow-y-auto pb-6">
        {children}
      </div>
      <div className="px-5 pb-10 pt-2 bg-[#F8FAFC]">
        <PrimaryButton label={nextLabel} onClick={onNext} icon={<ArrowRight size={18} />} disabled={nextDisabled} />
      </div>
    </div>
  );
}

// ── 8. Reg Step 1: Personal Details ──────────────────────────────────────────

function Reg1({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [form, setForm] = useState({ name: "Aryan Sharma", dob: "2004-08-15", gender: "Male", phone: "9876543210", alt: "", blood: "B+" });
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Validation
  const nameValid = form.name.trim() !== "";
  const dobValid = form.dob.trim() !== "";
  const genderValid = form.gender.trim() !== "";
  const phoneValid = /^\d{10}$/.test(form.phone.replace(/\D/g, ""));
  const bloodValid = form.blood.trim() !== "";
  const isFormValid = nameValid && dobValid && genderValid && phoneValid && bloodValid;

  const nameError = form.name.trim() === "" ? "Full name is required" : "";
  const dobError = form.dob.trim() === "" ? "Date of birth is required" : "";
  const phoneError = form.phone.trim() === "" ? "Mobile number is required" : !/^\d{10}$/.test(form.phone.replace(/\D/g, "")) ? "Mobile number must be exactly 10 digits" : "";

  return (
    <RegShell step={1} total={5} title="Personal Details" subtitle="Tell us about yourself" onBack={onBack} onNext={onNext} nextDisabled={!isFormValid}>
      {/* Photo upload */}
      <div className="flex justify-center py-2">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-[#EFF6FF] border-2 border-dashed border-[#93C5FD] flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <Camera size={28} className="text-[#93C5FD] mx-auto mb-1" />
              <p className="text-xs text-[#93C5FD] font-medium">Add Photo</p>
            </div>
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shadow-lg">
            <Plus size={14} className="text-white" />
          </button>
        </div>
      </div>

      <InputField label="Full Name *" placeholder="As on Aadhaar card" value={form.name} onChange={set("name")} icon={<User size={18} />} error={nameError} />
      <InputField label="Date of Birth *" placeholder="YYYY-MM-DD" type="date" value={form.dob} onChange={set("dob")} error={dobError} />

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender *</label>
        <div className="flex gap-2">
          {["Male", "Female", "Other"].map((g) => (
            <button key={g} onClick={() => set("gender")(g)}
              className={`flex-1 h-12 rounded-2xl font-semibold text-sm transition-all border-2 ${form.gender === g ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-slate-100 bg-white text-slate-600"}`}>
              {g}
            </button>
          ))}
        </div>
        {!genderValid && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />Gender is required</p>}
      </div>

      <InputField label="Mobile Number *" placeholder="10-digit mobile number" icon={<Phone size={18} />} value={form.phone} onChange={set("phone")} error={phoneError} />
      <InputField label="Alternate Number" placeholder="Optional" icon={<Phone size={18} />} value={form.alt} onChange={set("alt")} />

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Blood Group *</label>
        <div className="grid grid-cols-4 gap-2">
          {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => (
            <button key={b} onClick={() => set("blood")(b)}
              className={`h-10 rounded-xl font-bold text-sm transition-all border-2 ${form.blood === b ? "border-[#EF4444] bg-red-50 text-red-600" : "border-slate-100 bg-white text-slate-600"}`}>
              {b}
            </button>
          ))}
        </div>
        {!bloodValid && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />Blood group is required</p>}
      </div>
    </RegShell>
  );
}

// ── 9. Reg Step 2: Academic ───────────────────────────────────────────────────

function Reg2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [form, setForm] = useState({ college: "Pune Institute of Computer Technology", course: "B.Tech CSE", year: "2nd Year", rollno: "PICT2024CS127", hostel: "Block A", room: "" });
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Validation
  const collegeValid = form.college.trim() !== "";
  const courseValid = form.course.trim() !== "";
  const yearValid = form.year.trim() !== "";
  const rollnoValid = form.rollno.trim() !== "";
  const isFormValid = collegeValid && courseValid && yearValid && rollnoValid;

  const collegeError = form.college.trim() === "" ? "College/University is required" : "";
  const courseError = form.course.trim() === "" ? "Course is required" : "";
  const rollnoError = form.rollno.trim() === "" ? "Roll number is required" : "";

  return (
    <RegShell step={2} total={5} title="Academic Details" subtitle="Your institution & course info" onBack={onBack} onNext={onNext} nextDisabled={!isFormValid}>
      <InputField label="College / University *" placeholder="Full institution name" icon={<Building2 size={18} />} value={form.college} onChange={set("college")} error={collegeError} />
      <InputField label="Course / Program *" placeholder="e.g. B.Tech Computer Science" icon={<BookOpen size={18} />} value={form.course} onChange={set("course")} error={courseError} />

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Academic Year *</label>
        <div className="grid grid-cols-2 gap-2">
          {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => (
            <button key={y} onClick={() => set("year")(y)}
              className={`h-12 rounded-2xl font-semibold text-sm transition-all border-2 ${form.year === y ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-slate-100 bg-white text-slate-600"}`}>
              {y}
            </button>
          ))}
        </div>
        {!yearValid && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />Academic year is required</p>}
      </div>

      <InputField label="Roll Number / Enrollment ID *" placeholder="College roll number" value={form.rollno} onChange={set("rollno")} error={rollnoError} />

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hostel Block Preference</label>
        <div className="grid grid-cols-3 gap-2">
          {["Block A", "Block B", "Block C"].map((b) => (
            <button key={b} onClick={() => set("hostel")(b)}
              className={`h-12 rounded-2xl font-semibold text-sm transition-all border-2 ${form.hostel === b ? "border-[#14B8A6] bg-[#F0FDFA] text-[#0D9488]" : "border-slate-100 bg-white text-slate-600"}`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      <InputField label="Room Number (if allotted)" placeholder="Leave blank if not allotted" icon={<Home size={18} />} value={form.room} onChange={set("room")} helper="Room will be allotted by admin if left blank" />
    </RegShell>
  );
}

// ── 10. Reg Step 3: Parent Details ────────────────────────────────────────────

function Reg3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [form, setForm] = useState({ fName: "Rajesh Sharma", fPhone: "9823456701", fOcc: "Engineer", mName: "Priya Sharma", mPhone: "9823456702", addr: "45, Shivaji Nagar, Pune - 411005", city: "Pune", state: "Maharashtra" });
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Validation
  const fNameValid = form.fName.trim() !== "";
  const fPhoneValid = /^\d{10}$/.test(form.fPhone.replace(/\D/g, ""));
  const mNameValid = form.mName.trim() !== "";
  const mPhoneValid = /^\d{10}$/.test(form.mPhone.replace(/\D/g, ""));
  const isFormValid = fNameValid && fPhoneValid && mNameValid && mPhoneValid;

  const fNameError = form.fName.trim() === "" ? "Father's name is required" : "";
  const fPhoneError = form.fPhone.trim() === "" ? "Father's mobile is required" : !/^\d{10}$/.test(form.fPhone.replace(/\D/g, "")) ? "Mobile must be 10 digits" : "";
  const mNameError = form.mName.trim() === "" ? "Mother's name is required" : "";
  const mPhoneError = form.mPhone.trim() === "" ? "Mother's mobile is required" : !/^\d{10}$/.test(form.mPhone.replace(/\D/g, "")) ? "Mobile must be 10 digits" : "";

  return (
    <RegShell step={3} total={5} title="Parent Details" subtitle="Guardian & family information" onBack={onBack} onNext={onNext} nextDisabled={!isFormValid}>
      <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
        <p className="text-xs text-blue-700 font-semibold">Father's Information</p>
      </div>
      <InputField label="Father's Full Name *" placeholder="Enter father's name" icon={<User size={18} />} value={form.fName} onChange={set("fName")} error={fNameError} />
      <InputField label="Father's Mobile *" placeholder="10-digit number" icon={<Phone size={18} />} value={form.fPhone} onChange={set("fPhone")} error={fPhoneError} />
      <InputField label="Occupation" placeholder="e.g. Business, Service" value={form.fOcc} onChange={set("fOcc")} />

      <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 mt-1">
        <p className="text-xs text-purple-700 font-semibold">Mother's Information</p>
      </div>
      <InputField label="Mother's Full Name *" placeholder="Enter mother's name" icon={<User size={18} />} value={form.mName} onChange={set("mName")} error={mNameError} />
      <InputField label="Mother's Mobile *" placeholder="10-digit number" icon={<Phone size={18} />} value={form.mPhone} onChange={set("mPhone")} error={mPhoneError} />

      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 mt-1">
        <p className="text-xs text-slate-700 font-semibold">Home Address</p>
      </div>
      <InputField label="Full Address" placeholder="Street, locality, area" value={form.addr} onChange={set("addr")} />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="City" placeholder="City" value={form.city} onChange={set("city")} />
        <InputField label="State" placeholder="State" value={form.state} onChange={set("state")} />
      </div>
    </RegShell>
  );
}

// ── 11. Reg Step 4: Emergency Contacts ───────────────────────────────────────

function Reg4({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [contacts, setContacts] = useState([
    { name: "Rajesh Sharma", relation: "Father", phone: "9823456701" },
    { name: "Priya Sharma", relation: "Mother", phone: "9823456702" },
  ]);

  const relations = ["Father", "Mother", "Guardian", "Sibling", "Relative"];

  // Validation
  const contactsMinValid = contacts.length >= 2;
  const eachContactValid = (c: typeof contacts[0]) => {
    const nameValid = c.name.trim() !== "";
    const relationValid = c.relation.trim() !== "";
    const phoneValid = /^\d{10}$/.test(c.phone.replace(/\D/g, ""));
    return nameValid && relationValid && phoneValid;
  };
  const allContactsValid = contacts.every(eachContactValid);
  const isFormValid = contactsMinValid && allContactsValid;

  return (
    <RegShell step={4} total={5} title="Emergency Contacts" subtitle="People to contact in emergencies" onBack={onBack} onNext={onNext} nextDisabled={!isFormValid}>
      <div className="p-3 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
        <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
        <p className="text-xs text-red-700 font-medium">These contacts will be notified during emergencies. Add at least 2 contacts.</p>
      </div>

      {contacts.map((c, i) => {
        const nameError = c.name.trim() === "" ? "Name is required" : "";
        const relationError = c.relation.trim() === "" ? "Relation is required" : "";
        const phoneError = c.phone.trim() === "" ? "Phone is required" : !/^\d{10}$/.test(c.phone.replace(/\D/g, "")) ? "Phone must be 10 digits" : "";
        return (
          <div key={i} className="p-4 rounded-2xl bg-white border-2 border-slate-100 relative"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#EFF6FF] flex items-center justify-center text-xs font-bold text-[#2563EB]">{i + 1}</div>
                <span className="font-bold text-sm text-slate-800">Contact {i + 1}</span>
              </div>
              {contacts.length > 2 && (
                <button onClick={() => setContacts((cs) => cs.filter((_, ci) => ci !== i))}
                  className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                  <X size={14} className="text-red-500" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              <InputField placeholder="Full Name *" value={c.name} onChange={(v) => setContacts((cs) => cs.map((cc, ci) => ci === i ? { ...cc, name: v } : cc))} error={nameError} />
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Relation *</label>
                <div className="flex gap-2">
                  {relations.map((r) => (
                    <button key={r} onClick={() => setContacts((cs) => cs.map((cc, ci) => ci === i ? { ...cc, relation: r } : cc))}
                      className={`flex-1 h-9 rounded-xl text-xs font-semibold transition-all border-2 ${c.relation === r ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-slate-100 bg-slate-50 text-slate-500"}`}>
                      {r}
                    </button>
                  ))}
                </div>
                {relationError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{relationError}</p>}
              </div>
              <InputField placeholder="Mobile Number *" icon={<Phone size={16} />} value={c.phone}
                onChange={(v) => setContacts((cs) => cs.map((cc, ci) => ci === i ? { ...cc, phone: v } : cc))} error={phoneError} />
            </div>
          </div>
        );
      })}

      {contacts.length < 4 && (
        <button onClick={() => setContacts((cs) => [...cs, { name: "", relation: "Guardian", phone: "" }])}
          className="w-full h-12 rounded-2xl border-2 border-dashed border-[#93C5FD] bg-[#F8FAFC] flex items-center justify-center gap-2 text-[#2563EB] font-semibold text-sm" disabled={!allContactsValid}>
          <Plus size={18} /> Add Another Contact
        </button>
      )}
      {!contactsMinValid && <p className="text-xs text-red-500 mt-2 flex items-center gap-1 text-center"><AlertCircle size={12} />Minimum 2 emergency contacts are required</p>}
    </RegShell>
  );
}

// ── 12. Reg Step 5: Document Upload ──────────────────────────────────────────

const DOCS = [
  { id: "photo", label: "Passport Photo", icon: <Camera size={20} />, required: true, hint: "Recent passport-size photo" },
  { id: "aadhaar", label: "Aadhaar Card", icon: <FileText size={20} />, required: true, hint: "Front & back scan" },
  { id: "college_id", label: "College ID Card", icon: <BookOpen size={20} />, required: true, hint: "Current year ID" },
  { id: "admission", label: "Admission Letter", icon: <FileText size={20} />, required: true, hint: "From college/university" },
  { id: "tenth", label: "10th Result", icon: <FileText size={20} />, required: false, hint: "Mark sheet or certificate" },
  { id: "twelfth", label: "12th Result", icon: <FileText size={20} />, required: false, hint: "Mark sheet or certificate" },
];

function Reg5({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [uploads, setUploads] = useState<Record<string, "uploading" | "done" | "">>({
    photo: "done", aadhaar: "done", college_id: "", admission: "", tenth: "", twelfth: "",
  });

  const toggle = (id: string) => {
    if (uploads[id] === "done") { setUploads((u) => ({ ...u, [id]: "" })); return; }
    setUploads((u) => ({ ...u, [id]: "uploading" }));
    setTimeout(() => setUploads((u) => ({ ...u, [id]: "done" })), 1200);
  };

  const requiredDone = DOCS.filter((d) => d.required).every((d) => uploads[d.id] === "done");

  return (
    <RegShell step={5} total={5} title="Document Upload" subtitle="Upload required documents" onBack={onBack} onNext={onNext} nextLabel="Submit Application" nextDisabled={!requiredDone}>
      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2">
        <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 font-medium">Upload clear scans. Max file size: 5MB. Accepted: JPG, PNG, PDF.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {DOCS.map((doc) => {
          const status = uploads[doc.id];
          return (
            <button key={doc.id} onClick={() => toggle(doc.id)}
              className={`p-4 rounded-2xl flex items-center gap-4 text-left border-2 transition-all ${status === "done" ? "border-green-300 bg-green-50" : status === "uploading" ? "border-[#2563EB] bg-[#EFF6FF]" : "border-slate-100 bg-white"}`}
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${status === "done" ? "bg-green-500" : status === "uploading" ? "bg-[#2563EB]" : "bg-slate-100"}`}>
                {status === "done" ? <Check size={22} className="text-white" /> : status === "uploading" ? <RefreshCw size={20} className="text-white animate-spin" /> : <span className={doc.required ? "text-slate-600" : "text-slate-400"}>{doc.icon}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-slate-800 truncate">{doc.label}</p>
                  {doc.required && <span className="text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">Required</span>}
                </div>
                <p className={`text-xs mt-0.5 ${status === "done" ? "text-green-700 font-medium" : "text-slate-400"}`}>
                  {status === "done" ? "Uploaded successfully ✓" : status === "uploading" ? "Uploading…" : doc.hint}
                </p>
              </div>
              {status !== "uploading" && (
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${status === "done" ? "bg-green-100" : "bg-slate-100"}`}>
                  {status === "done" ? <X size={16} className="text-slate-500" /> : <Upload size={16} className="text-slate-500" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 rounded-2xl bg-[#EFF6FF] flex items-center gap-3">
        <div className="text-sm font-bold text-[#2563EB]">
          {DOCS.filter((d) => uploads[d.id] === "done").length}/{DOCS.length}
        </div>
        <div className="flex-1">
          <div className="h-2 bg-[#DBEAFE] rounded-full overflow-hidden">
            <div className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
              style={{ width: `${(DOCS.filter((d) => uploads[d.id] === "done").length / DOCS.length) * 100}%` }} />
          </div>
        </div>
        <p className="text-xs text-[#1E40AF] font-medium">documents uploaded</p>
      </div>
    </RegShell>
  );
}

// ── 13. Registration Success ──────────────────────────────────────────────────

function SuccessScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8FAFC] px-6">
      {/* Success ring */}
      <div className="relative mb-8">
        <div className="w-36 h-36 rounded-full bg-green-100 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-xl shadow-green-200">
            <Check size={44} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-30" />
      </div>

      <h1 className="font-black text-3xl text-slate-800 text-center">Application Submitted!</h1>
      <p className="text-slate-500 text-base mt-3 text-center leading-relaxed">
        Your registration has been received. The admin will review and activate your account.
      </p>

      {/* Details card */}
      <div className="w-full mt-6 p-5 rounded-3xl bg-white border border-slate-100 shadow-lg">
        <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Application Details</p>
        {[
          { label: "Application ID", value: "HP2024CS001127" },
          { label: "Applicant", value: "Aryan Sharma" },
          { label: "Status", value: "Under Review", badge: true },
          { label: "Expected Activation", value: "1-2 working days" },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
            <span className="text-sm text-slate-500 font-medium">{r.label}</span>
            {r.badge ? (
              <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-full">{r.value}</span>
            ) : (
              <span className="text-sm font-bold text-slate-800">{r.value}</span>
            )}
          </div>
        ))}
      </div>

      <div className="w-full mt-6 space-y-3">
        <PrimaryButton label="Complete Face Enrollment" onClick={onNext} icon={<Camera size={20} />} />
        <p className="text-center text-xs text-slate-400">You will receive an SMS/email confirmation shortly</p>
      </div>
    </div>
  );
}

// ── 14. Face Enrollment ───────────────────────────────────────────────────────

function FaceScreen({ onNext }: { onNext: () => void }) {
  const [step, setStep] = useState<"intro" | "scanning" | "done">("intro");
  const [progress, setProgress] = useState(0);

  const startScan = () => {
    setStep("scanning");
    let p = 0;
    const t = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) { clearInterval(t); setTimeout(() => setStep("done"), 300); }
    }, 60);
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      <div style={{ background: "linear-gradient(150deg, #0F172A 0%, #1E293B 100%)" }} className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
        {step !== "done" && (
          <>
            {/* Camera frame */}
            <div className="relative mb-8">
              <div className="w-64 h-64 rounded-full bg-white/5 flex items-center justify-center">
                <div className="w-52 h-52 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                    {step === "scanning" ? (
                      <div className="w-full h-full bg-[#2563EB]/20 flex items-center justify-center">
                        <Camera size={48} className="text-[#60A5FA]" />
                      </div>
                    ) : (
                      <User size={56} className="text-white/30" />
                    )}
                  </div>
                </div>
              </div>
              {/* Corner markers */}
              {[["top-3 left-3", "border-t-4 border-l-4"], ["top-3 right-3", "border-t-4 border-r-4"], ["bottom-3 left-3", "border-b-4 border-l-4"], ["bottom-3 right-3", "border-b-4 border-r-4"]].map(([pos, b]) => (
                <div key={pos} className={`absolute ${pos} w-8 h-8 border-[#2563EB] rounded-sm ${b} ${step === "scanning" ? "animate-pulse" : ""}`} />
              ))}
              {step === "scanning" && (
                <div className="absolute inset-4 rounded-full overflow-hidden">
                  <div className="w-full h-1 bg-[#2563EB] absolute animate-bounce" style={{ top: `${progress}%` }} />
                </div>
              )}
            </div>

            <h2 className="text-white font-black text-2xl text-center">Face Enrollment</h2>
            <p className="text-slate-400 text-sm mt-2 text-center px-8 leading-relaxed">
              {step === "intro"
                ? "Position your face within the frame. Ensure good lighting for accurate scanning."
                : `Scanning… ${progress}% — Hold still, looking for face landmarks`}
            </p>
            {step === "scanning" && (
              <div className="mt-4 w-48 h-2 rounded-full bg-white/10">
                <div className="h-full bg-[#2563EB] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
            )}
          </>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center px-6 text-center">
            <div className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-xl shadow-green-500/30">
              <Check size={52} className="text-white" strokeWidth={3} />
            </div>
            <h2 className="text-white font-black text-2xl">Face Enrolled!</h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">Your biometric data has been securely saved. You can now use Face ID for hostel entry.</p>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      <div className="bg-[#F8FAFC] px-5 pt-5 pb-10 space-y-3">
        {step === "intro" && (
          <>
            <div className="flex gap-4">
              {[{ label: "Good lighting", ok: true }, { label: "Glasses removed", ok: true }, { label: "Face uncovered", ok: false }].map((t) => (
                <div key={t.label} className={`flex-1 p-2 rounded-xl text-center text-xs font-semibold ${t.ok ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {t.ok ? "✓" : "!"} {t.label}
                </div>
              ))}
            </div>
            <PrimaryButton label="Start Face Scan" onClick={startScan} icon={<Camera size={20} />} />
          </>
        )}
        {step === "scanning" && (
          <div className="h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <p className="text-slate-500 font-medium text-sm">Scanning in progress…</p>
          </div>
        )}
        {step === "done" && (
          <PrimaryButton label="Go to Profile Setup" onClick={onNext} icon={<ArrowRight size={20} />} />
        )}
        <p className="text-center text-xs text-slate-400">Your biometric data is encrypted and stored securely</p>
      </div>
    </div>
  );
}

// ── 15. Profile Completion ────────────────────────────────────────────────────

function ProfileScreen({ onDone }: { onDone: () => void }) {
  const [bio, setBio] = useState("CSE sophomore at PICT Pune. Hostel life enthusiast 🏠");
  const [editBio, setEditBio] = useState(false);

  const fields = [
    { label: "Full Name", value: "Aryan Sharma", done: true },
    { label: "Email", value: "aryan.sharma@gmail.com", done: true },
    { label: "Mobile", value: "+91 9876543210", done: true },
    { label: "College", value: "PICT, Pune", done: true },
    { label: "Room Number", value: "A-204", done: true },
    { label: "Profile Photo", value: "Photo added", done: true },
    { label: "Emergency Contact", value: "Rajesh Sharma", done: true },
    { label: "Bank Details", value: "Not added", done: false },
    { label: "Preferences", value: "Not set", done: false },
  ];

  const completion = Math.round((fields.filter((f) => f.done).length / fields.length) * 100);

  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div style={{ background: "linear-gradient(150deg, #1E40AF 0%, #2563EB 100%)" }} className="relative overflow-hidden px-5 pt-14 pb-20">
        <div className="absolute top-[-40px] right-[-30px] w-40 h-40 rounded-full bg-white/10" />
        <h1 className="text-white font-black text-xl">Complete Your Profile</h1>
        <p className="text-blue-100 text-sm mt-0.5">A complete profile gets faster room allotment</p>
        <svg viewBox="0 0 390 50" className="absolute bottom-0 left-0 w-full" fill="#F8FAFC" preserveAspectRatio="none">
          <path d="M0 25 Q195 0 390 25 L390 50 L0 50 Z" />
        </svg>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center -mt-12 mb-3 px-5">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-[#DBEAFE] border-4 border-white flex items-center justify-center shadow-xl">
            <User size={36} className="text-[#2563EB]" />
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shadow-lg border-2 border-white">
            <Camera size={14} className="text-white" />
          </button>
        </div>
        <h2 className="font-black text-xl text-slate-800 mt-3">Aryan Sharma</h2>
        <p className="text-slate-500 text-sm">Student · Room A-204</p>

        {/* Progress ring */}
        <div className="mt-4 w-full p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-700">Profile Completion</span>
            <span className="text-sm font-black text-[#2563EB]">{completion}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${completion}%`, background: "linear-gradient(90deg, #2563EB, #14B8A6)" }} />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">{fields.filter((f) => !f.done).length} items remaining to complete</p>
        </div>
      </div>

      {/* Bio */}
      <div className="px-5 mb-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-700">Bio</span>
            <button onClick={() => setEditBio(!editBio)} className="text-xs text-[#2563EB] font-semibold">{editBio ? "Save" : "Edit"}</button>
          </div>
          {editBio ? (
            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
              className="w-full text-sm text-slate-600 leading-relaxed bg-transparent outline-none resize-none" rows={2} />
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">{bio}</p>
          )}
        </div>
      </div>

      {/* Fields list */}
      <div className="px-5 pb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Profile Fields</p>
        <div className="space-y-2">
          {fields.map((f) => (
            <div key={f.label} className={`flex items-center gap-3 p-3 rounded-2xl border ${f.done ? "bg-white border-slate-100" : "bg-amber-50 border-amber-100"}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${f.done ? "bg-green-100" : "bg-amber-100"}`}>
                {f.done ? <Check size={16} className="text-green-600" /> : <Plus size={16} className="text-amber-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500">{f.label}</p>
                <p className={`text-sm font-bold truncate ${f.done ? "text-slate-800" : "text-amber-700"}`}>{f.value}</p>
              </div>
              {!f.done && <button className="text-xs text-[#2563EB] font-bold flex-shrink-0">Add →</button>}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-10 pt-2">
        <PrimaryButton label="Go to Dashboard" onClick={onDone} icon={<Home size={20} />} />
      </div>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────


// ─── AuthFlow Entry Point ─────────────────────────────────────────────────────
export default function AuthFlow({ onAuthComplete }: AuthFlowProps) {
  const [screen, setScreen] = useState<Screen>("splash");
  const [selectedRole, setSelectedRole] = useState<string>("student");
  const nav = (s: Screen) => () => setScreen(s);

  const handleRoleSelect = (r: string) => {
    setSelectedRole(r);
    setScreen("login");
  };

  const handleLoginSuccess = () => {
    onAuthComplete(selectedRole);
  };

  const renderScreen = () => {
    switch (screen) {
      case "splash":   return <SplashScreen onNext={nav("welcome")} />;
      case "welcome":  return <WelcomeScreen onNext={nav("role")} onLogin={nav("login")} />;
      case "role":     return <RoleScreen onSelect={handleRoleSelect} />;
      case "login":    return <LoginScreen onLogin={handleLoginSuccess} onForgot={nav("forgot")} onBack={nav("welcome")} onRegister={nav("reg1")} />;
      case "forgot":   return <ForgotScreen onSend={nav("otp")} onBack={nav("login")} />;
      case "otp":      return <OTPScreen onVerify={nav("reset")} onBack={nav("forgot")} />;
      case "reset":    return <ResetScreen onReset={nav("login")} onBack={nav("otp")} />;
      case "reg1":     return <Reg1 onNext={nav("reg2")} onBack={nav("login")} />;
      case "reg2":     return <Reg2 onNext={nav("reg3")} onBack={nav("reg1")} />;
      case "reg3":     return <Reg3 onNext={nav("reg4")} onBack={nav("reg2")} />;
      case "reg4":     return <Reg4 onNext={nav("reg5")} onBack={nav("reg3")} />;
      case "reg5":     return <Reg5 onNext={nav("success")} onBack={nav("reg4")} />;
      case "success":  return <SuccessScreen onNext={nav("face")} />;
      case "face":     return <FaceScreen onNext={nav("profile")} />;
      case "profile":  return <ProfileScreen onDone={() => onAuthComplete(selectedRole)} />;
      default:         return <SplashScreen onNext={nav("welcome")} />;
    }
  };

  return (
    <>
      <style>{`
        body { font-family: 'Inter', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes ping { 75%, 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-bounce { animation: bounce 1s infinite; }
        .animate-ping { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.4; }
      `}</style>
      <MobileShell>{renderScreen()}</MobileShell>
    </>
  );
}
