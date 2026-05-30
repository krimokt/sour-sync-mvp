'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useStorefrontLocale } from '@/components/storefront/LocaleProvider';

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
  const { t } = useStorefrontLocale();
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
      setError(t('form.errRequired'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('form.errEmail'));
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
      setError(t('form.errSend'));
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
      <h3 className="text-xl font-bold text-gray-900 mb-6">{t('form.title')}</h3>

      {status === 'sent' && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {t('form.sent')}
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
            <label htmlFor="srf-first" className={labelClass}>{t('form.firstName')}</label>
            <input
              id="srf-first"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t('form.firstName')}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="srf-last" className={labelClass}>{t('form.lastName')}</label>
            <input
              id="srf-last"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t('form.lastName')}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="srf-email" className={labelClass}>{t('form.email')}</label>
          <input
            id="srf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('form.email')}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="srf-company" className={labelClass}>{t('form.company')}</label>
          <input
            id="srf-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={t('form.company')}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="srf-message" className={labelClass}>{t('form.title')}</label>
          <textarea
            id="srf-message"
            name="message"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('form.messagePlaceholder')}
            className={`${fieldClass} resize-none`}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="group w-full inline-flex items-center justify-center gap-2 hover:gap-4 bg-neutral-900 hover:bg-neutral-950 shadow-lg shadow-neutral-900/30 border border-neutral-800 text-white px-5 py-3.5 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? t('form.sending') : t('form.submit')}
          {!submitting && <ArrowUpRight size={15} />}
        </button>
        <p className="text-center text-xs text-gray-500">
          {t('form.respond')}
        </p>
      </div>
    </form>
  );
}
