'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X, FileText, Mail, MessageSquare, Sparkles } from 'lucide-react';

interface FloatingChatButtonProps {
  companySlug: string;
  whatsapp?: string | null;
  email?: string | null;
}

export default function FloatingChatButton({ companySlug, whatsapp, email }: FloatingChatButtonProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}` : null;
  const mailHref = email ? `mailto:${email}` : null;

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50" ref={panelRef}>
      {/* Panel */}
      <div
        className={`absolute bottom-[72px] right-0 w-[320px] sm:w-[360px] origin-bottom-right transition-all duration-200 ease-out ${
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
        role="dialog"
        aria-hidden={!open}
        aria-label="Chat with us"
      >
        <div className="rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25),0_0_0_1px_rgba(15,23,42,0.06)] overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-5 pb-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white relative">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 w-7 h-7 inline-flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/15 transition"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              We&apos;re online
            </div>
            <h3 className="mt-2 text-lg font-semibold leading-snug">Hi there 👋</h3>
            <p className="mt-1 text-sm text-blue-100/90 leading-relaxed">
              Pick how you&apos;d like to reach us. Replies within 24 hours, usually much sooner.
            </p>
          </div>

          {/* Options */}
          <div className="p-2">
            <Link
              href={`/site/${companySlug}/quote`}
              onClick={() => setOpen(false)}
              className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
            >
              <span className="shrink-0 mt-0.5 w-9 h-9 inline-flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition">
                <FileText className="w-4 h-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-slate-900">Request a quote</span>
                <span className="block text-xs text-slate-500 mt-0.5">Send specs, get pricing within 24h</span>
              </span>
            </Link>

            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
              >
                <span className="shrink-0 mt-0.5 w-9 h-9 inline-flex items-center justify-center rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100 transition">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-slate-900">Chat on WhatsApp</span>
                  <span className="block text-xs text-slate-500 mt-0.5">Fastest reply, mobile-friendly</span>
                </span>
              </a>
            )}

            {mailHref && (
              <a
                href={mailHref}
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition"
              >
                <span className="shrink-0 mt-0.5 w-9 h-9 inline-flex items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition">
                  <Mail className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-slate-900">Email us</span>
                  <span className="block text-xs text-slate-500 mt-0.5 truncate">{email}</span>
                </span>
              </a>
            )}
          </div>

          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500 text-center">
            Powered by your sourcing team
          </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="group relative w-14 h-14 rounded-full inline-flex items-center justify-center text-white bg-gradient-to-br from-blue-600 to-blue-700 shadow-[0_10px_30px_-8px_rgba(37,99,235,0.55),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_14px_36px_-8px_rgba(37,99,235,0.65),inset_0_1px_0_rgba(255,255,255,0.25)] hover:-translate-y-0.5 active:scale-95 transition-all"
      >
        {/* Pulse ring (hidden when open) */}
        {!open && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-blue-500/40 motion-safe:animate-ping"
          />
        )}
        <span className="relative">
          {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-6 h-6" />}
        </span>
        {/* Unread dot */}
        {!open && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-white"
          />
        )}
      </button>
    </div>
  );
}
