'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, ArrowRight, CheckCircle2, Package, FileText, Truck, Mail, RefreshCw } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website_settings: {
    theme_color?: string;
    primary_color?: string;
  } | null;
}

interface ClientSignInPageProps {
  params: { companySlug: string };
}

export default function ClientSignInPage({ params }: ClientSignInPageProps) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [company, setCompany] = useState<Company | null>(null);
  const [themeColor, setThemeColor] = useState('#06b6d4');

  // OTP verification state
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  }, [searchParams]);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch(`/api/public/company/${params.companySlug}`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Company not found');
        }

        const json = await res.json();
        if (!json?.company) throw new Error('Company data not found');

        const data = json.company as Company;
        setCompany(data);

        const settings = Array.isArray(data.website_settings)
          ? data.website_settings[0]
          : data.website_settings;
        const color = settings?.primary_color || settings?.theme_color;
        if (color) setThemeColor(color);
      } catch {
        setCompany({
          id: '',
          name: params.companySlug,
          slug: params.companySlug,
          logo_url: null,
          website_settings: null,
        });
      }
    };

    fetchCompany();
  }, [params.companySlug]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/client/${params.companySlug}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server error. Please try again.');
      }

      if (!response.ok) {
        if (response.status === 429 || data.rateLimited) {
          throw new Error('Too many attempts. Please wait a few minutes.');
        }
        throw new Error(data.error || 'Sign in failed');
      }

      window.location.href = searchParams.get('next') || `/client/${params.companySlug}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  /* ── Step 1: send OTP to email ── */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!fullName || !email || !password || !companyName) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/client/${params.companySlug}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');

      setOtpStep(true);
      setOtpCode('');
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Countdown timer for resend ── */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  /* ── Step 2: verify OTP + complete account creation ── */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/client/${params.companySlug}/auth/verify-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otpCode, fullName, companyName, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      // OTP verified and account created — auto-login
      const loginRes = await fetch(`/api/client/${params.companySlug}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (loginRes.ok) {
        window.location.href = searchParams.get('next') || `/client/${params.companySlug}`;
        return;
      }

      setSuccess('Account verified! Please sign in.');
      setOtpStep(false);
      setMode('signin');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setResendCooldown(60);
    try {
      await fetch(`/api/client/${params.companySlug}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSuccess('New code sent to your email.');
    } catch {
      setError('Failed to resend. Try again.');
    }
  };

  const companyInitial = (company?.name ?? params.companySlug).charAt(0).toUpperCase();

  /* ── shared input class ── */
  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder:text-gray-400 outline-none transition-all duration-150 focus:border-transparent focus:ring-2';

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin"
          style={{ borderColor: `${themeColor} transparent transparent transparent` }}
        />
      </div>
    );
  }

  /* ── accent-derived helpers ── */
  const accentGlow  = `${themeColor}40`;
  const accentMid   = `${themeColor}28`;
  const accentFaint = `${themeColor}16`;

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: 'var(--font-jakarta, system-ui, sans-serif)' }}
    >
      {/* ════════════════════════════════
          LEFT — logistics photo + overlay
          ════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between relative overflow-hidden">

        {/* Photo layer */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&q=85&auto=format&fit=crop')`,
          }}
        />

        {/* Dark gradient — heavy at top + bottom, lighter in mid */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(5,10,22,0.92) 0%,
                rgba(5,10,22,0.55) 38%,
                rgba(5,10,22,0.60) 62%,
                rgba(5,10,22,0.96) 100%
              )
            `,
          }}
        />

        {/* Accent color bloom behind content area */}
        <div
          className="absolute bottom-[28%] left-[-60px] w-[340px] h-[340px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: accentGlow, opacity: 0.55 }}
        />

        {/* ── Top bar ── */}
        <div className="relative z-10 flex items-center justify-between px-10 pt-9">
          <div className="flex items-center gap-3">
            {company.logo_url ? (
              <Image src={company.logo_url} alt={company.name} width={34} height={34} className="rounded-lg" />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{ background: themeColor, boxShadow: `0 0 0 3px ${accentMid}` }}
              >
                {companyInitial}
              </div>
            )}
            <span className="text-white/90 font-semibold text-sm tracking-tight">
              {company.name}
            </span>
          </div>

          {/* Pill badge */}
          <div
            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
            style={{
              color: themeColor,
              borderColor: `${themeColor}55`,
              background: accentFaint,
            }}
          >
            Client Portal
          </div>
        </div>

        {/* ── Main copy ── */}
        <div className="relative z-10 px-10 pb-2 space-y-7">
          {/* Divider accent line */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: themeColor }} />
          </div>

          <div className="space-y-4">
            <h2 className="text-[2rem] font-extrabold text-white leading-[1.2] tracking-tight">
              Your sourcing <br />
              <span style={{ color: themeColor }}>operations</span>,<br />
              simplified.
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-[280px]">
              Track quotations, approve orders, monitor shipments,
              and manage payments in one secure place.
            </p>
          </div>

          {/* Feature rows */}
          <div className="space-y-3">
            {[
              { icon: FileText, label: 'Quotations',  desc: 'Review and approve sourcing quotes' },
              { icon: Package,  label: 'Orders',      desc: 'Track your product catalog live' },
              { icon: Truck,    label: 'Shipments',   desc: 'Real-time delivery tracking' },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07]"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: accentMid }}
                >
                  <Icon className="w-[15px] h-[15px]" style={{ color: themeColor }} />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold leading-none mb-0.5">{label}</p>
                  <p className="text-white/40 text-[11px]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom ── */}
        <div className="relative z-10 flex items-center justify-between px-10 pb-9">
          <a
            href={`/site/${params.companySlug}`}
            className="text-white/35 hover:text-white/65 text-xs transition-colors flex items-center gap-1.5"
          >
            ← Back to site
          </a>
          <p className="text-white/20 text-[10px]">Powered by SourSync</p>
        </div>
      </div>

      {/* ════════════════════════════════
          RIGHT — auth form
          ════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        style={{ background: 'oklch(0.975 0.005 240)' }}
      >
        {/* Mobile top bar */}
        <div className="lg:hidden flex flex-col items-center mb-8 gap-2">
          {company.logo_url ? (
            <Image src={company.logo_url} alt={company.name} width={44} height={44} className="rounded-xl" />
          ) : (
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: themeColor }}
            >
              {companyInitial}
            </div>
          )}
          <span className="font-bold text-gray-900">{company.name}</span>
        </div>

        <div className="w-full max-w-[390px]">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] border border-gray-100 p-8">

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-[1.4rem] font-bold text-gray-900 mb-1 tracking-tight">
                {otpStep
                  ? 'Check your email'
                  : mode === 'signin'
                  ? 'Welcome back'
                  : 'Create account'}
              </h1>
              <p className="text-gray-400 text-sm">
                {otpStep
                  ? `We sent a 6-digit code to ${email}`
                  : mode === 'signin'
                  ? 'Sign in to your client portal'
                  : 'Register to start managing orders'}
              </p>
            </div>

            {/* Mode toggle — hide during OTP step */}
            {!otpStep && (
              <div
                className="flex items-center gap-1 p-1 rounded-xl mb-6"
                style={{ background: 'oklch(0.95 0.005 240)' }}
              >
                {(['signin', 'signup'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); setSuccess(''); setOtpStep(false); }}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={
                      mode === m
                        ? { background: themeColor, color: '#fff', boxShadow: `0 2px 8px ${accentGlow}` }
                        : { color: 'oklch(0.55 0.01 240)' }
                    }
                  >
                    {m === 'signin' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>
            )}

            {/* Feedback */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 text-base leading-none">⚠</span>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[13px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* ── Sign In form ── */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-[13px] font-medium text-gray-600">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className={inputCls}
                    style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-[13px] font-medium text-gray-600">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`${inputCls} pr-11`}
                      style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 mt-1"
                  style={{
                    background: themeColor,
                    boxShadow: `0 4px 16px ${accentGlow}`,
                  }}
                >
                  {isLoading ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in...</>
                  ) : (
                    <>Sign In <ArrowRight size={15} /></>
                  )}
                </button>
              </form>
            )}

            {/* ── OTP verification form ── */}
            {mode === 'signup' && otpStep && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* Email icon + hint */}
                <div
                  className="flex flex-col items-center gap-3 py-5 rounded-xl"
                  style={{ background: accentFaint }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: accentMid }}
                  >
                    <Mail className="w-5 h-5" style={{ color: themeColor }} />
                  </div>
                  <p className="text-xs text-gray-500 text-center max-w-[220px]">
                    Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{email}</span>
                  </p>
                </div>

                {/* OTP input */}
                <div className="space-y-1.5">
                  <label htmlFor="otpCode" className="block text-[13px] font-medium text-gray-600">
                    Verification code
                  </label>
                  <input
                    id="otpCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '');
                      setOtpCode(v);
                      setError('');
                    }}
                    placeholder="000000"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-2xl font-bold tracking-[0.5em] text-center placeholder:text-gray-300 placeholder:tracking-[0.3em] outline-none transition-all duration-150 focus:border-transparent focus:ring-2"
                    style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ background: themeColor, boxShadow: `0 4px 16px ${accentGlow}` }}
                >
                  {isLoading ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Verifying...</>
                  ) : (
                    <>Verify & Create Account <ArrowRight size={15} /></>
                  )}
                </button>

                {/* Resend + back */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="flex items-center gap-1.5 text-xs transition-colors disabled:opacity-40"
                    style={{ color: resendCooldown > 0 ? undefined : themeColor }}
                  >
                    <RefreshCw size={12} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpStep(false); setOtpCode(''); setError(''); }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ← Change email
                  </button>
                </div>
              </form>
            )}

            {/* ── Sign Up form ── */}
            {mode === 'signup' && !otpStep && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="block text-[13px] font-medium text-gray-600">Full name</label>
                  <input
                    id="fullName" type="text" autoComplete="name"
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Jane Smith" required
                    className={inputCls}
                    style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="signupCompany" className="block text-[13px] font-medium text-gray-600">Your company</label>
                  <input
                    id="signupCompany" type="text"
                    value={companyName} onChange={e => setCompanyName(e.target.value)}
                    placeholder="Acme Corp" required
                    className={inputCls}
                    style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="signupEmail" className="block text-[13px] font-medium text-gray-600">Email address</label>
                  <input
                    id="signupEmail" type="email" autoComplete="email"
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com" required
                    className={inputCls}
                    style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="signupPassword" className="block text-[13px] font-medium text-gray-600">Password</label>
                  <div className="relative">
                    <input
                      id="signupPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters" required minLength={8}
                      className={`${inputCls} pr-11`}
                      style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 mt-1"
                  style={{
                    background: themeColor,
                    boxShadow: `0 4px 16px ${accentGlow}`,
                  }}
                >
                  {isLoading ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating account...</>
                  ) : (
                    <>Create Account <ArrowRight size={15} /></>
                  )}
                </button>

                <p className="text-center text-[11px] text-gray-400 pt-1">
                  By registering you agree to the sourcing terms of {company.name}.
                </p>
              </form>
            )}
          </div>

          {/* Mobile back link */}
          <div className="lg:hidden mt-6 text-center">
            <a
              href={`/site/${params.companySlug}`}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back to {company.name}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
