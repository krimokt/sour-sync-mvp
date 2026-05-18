'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{
        background: 'oklch(0.13 0.022 240)',
        fontFamily: 'var(--font-jakarta, system-ui, sans-serif)',
      }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Cyan glow blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'rgba(6,182,212,0.06)', filter: 'blur(80px)' }}
      />

      <div className="relative z-10 w-full max-w-md text-center">

        {/* Large 404 */}
        <div className="mb-4 select-none">
          <span
            className="block font-extrabold leading-none tracking-tighter"
            style={{
              fontSize: 'clamp(6rem, 20vw, 10rem)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(6,182,212,0.25) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </span>
        </div>

        {/* Accent line */}
        <div className="mx-auto mb-8 h-px w-16 rounded-full" style={{ background: '#06b6d4' }} />

        {/* Copy */}
        <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
          Page not found
        </h1>
        <p className="text-sm leading-relaxed mb-8 max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            <ArrowLeft size={14} />
            Go back
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: '#06b6d4', boxShadow: '0 4px 18px rgba(6,182,212,0.4)' }}
          >
            <Home size={14} />
            Home
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          &copy; {new Date().getFullYear()} SourSync
        </p>
      </div>
    </div>
  );
}
