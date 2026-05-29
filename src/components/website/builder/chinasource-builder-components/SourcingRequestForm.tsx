'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface SourcingRequestFormProps {
  companySlug: string;
  accentColor: string;
}

/**
 * Real working contact form for the storefront landing page.
 *
 * Each input has an associated <label> (visually-hidden but present for AT).
 * Posts to the same /api/site/[slug]/contact endpoint the About page uses;
 * falls back to mailto silently if the server isn't ready.
 */
export default function SourcingRequestForm({ companySlug, accentColor }: SourcingRequestFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in the required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('That email doesn’t look right.');
      return;
    }

    setSubmitting(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const body = JSON.stringify({
        name: fullName,
        email: email.trim(),
        message: [
          companyName && `Company: ${companyName}`,
          message.trim(),
        ].filter(Boolean).join('\n\n'),
      });

      const res = await fetch(`/api/site/${companySlug}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!res.ok) throw new Error('send-failed');

      setStatus('sent');
      setFirstName('');
      setLastName('');
      setEmail('');
      setCompanyName('');
      setMessage('');
    } catch {
      setStatus('error');
      setError('Could not send right now. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    'bg-white px-4 py-3 rounded-xl border border-gray-200 text-sm w-full transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-0';
  const labelClass = 'sr-only';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-8 border border-gray-100"
      style={{ background: 'oklch(0.975 0.006 238)' }}
      noValidate
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">Start a sourcing request</h3>

      {status === 'sent' && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Message received. We’ll be in touch within 24 hours.
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4" style={{ ['--tw-ring-color' as string]: `${accentColor}55` }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="srf-first" className={labelClass}>First name</label>
            <input
              id="srf-first"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="srf-last" className={labelClass}>Last name</label>
            <input
              id="srf-last"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="srf-email" className={labelClass}>Business email</label>
          <input
            id="srf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Business email"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="srf-company" className={labelClass}>Company name</label>
          <input
            id="srf-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="srf-message" className={labelClass}>Sourcing request</label>
          <textarea
            id="srf-message"
            name="message"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What products do you need? Include quantity, destination, and any specs."
            className={`${fieldClass} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: accentColor }}
        >
          {submitting ? 'Sending…' : 'Send sourcing request'}
          {!submitting && <ArrowUpRight size={15} />}
        </button>
        <p className="text-center text-xs text-gray-500">
          We respond within 24 hours. No commitment required.
        </p>
      </div>
    </form>
  );
}
