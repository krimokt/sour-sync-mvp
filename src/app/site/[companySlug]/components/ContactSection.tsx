'use client';

import { useState } from 'react';
import { Mail, Phone, MessageCircle, Send } from 'lucide-react';

interface ContactInfo {
  title?: string;
  address?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  wechat?: string;
}

interface ContactSectionProps {
  companySlug: string;
  themeColor: string;
  contact?: ContactInfo;
  defaultEmail?: string;
  defaultPhone?: string;
}

export default function ContactSection({
  companySlug,
  themeColor,
  contact,
  defaultEmail,
  defaultPhone,
}: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactEmail = contact?.email || defaultEmail || '';
  const contactPhone = contact?.phone || defaultPhone || '';
  const contactWhatsapp = contact?.whatsapp || '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in every field.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/site/${companySlug}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        // Soft fallback: even if the API isn't wired yet, open the user's mail
        // client with the message pre-filled — better than a dead form.
        const mailto = contactEmail
          ? `mailto:${contactEmail}?subject=${encodeURIComponent(`Message from ${name}`)}&body=${encodeURIComponent(message + '\n\nReply to: ' + email)}`
          : null;
        if (mailto) window.location.href = mailto;
        else throw new Error('Could not send message.');
      }

      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-white border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left — contact info */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {contact?.title || 'Contact us'}
          </h2>
          <p className="mt-3 text-gray-600">
            Have a question, want to request a sample, or need a custom quote?
            Send us a message and we&apos;ll get back within one business day.
          </p>

          <div className="mt-8 space-y-4">
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-3 text-gray-700 hover:text-gray-900"
              >
                <span
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  <Mail className="w-5 h-5" />
                </span>
                <span>{contactEmail}</span>
              </a>
            )}
            {contactPhone && (
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center gap-3 text-gray-700 hover:text-gray-900"
              >
                <span
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  <Phone className="w-5 h-5" />
                </span>
                <span>{contactPhone}</span>
              </a>
            )}
            {contactWhatsapp && (
              <a
                href={`https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-700 hover:text-gray-900"
              >
                <span
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  <MessageCircle className="w-5 h-5" />
                </span>
                <span>WhatsApp {contactWhatsapp}</span>
              </a>
            )}
            {contact?.address && (
              <p className="text-sm text-gray-500">{contact.address}</p>
            )}
          </div>
        </div>

        {/* Right — form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {sent && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Message sent. We&apos;ll be in touch.
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ ['--tw-ring-color' as string]: themeColor }}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ ['--tw-ring-color' as string]: themeColor }}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ ['--tw-ring-color' as string]: themeColor }}
              placeholder="Tell us what you're looking for…"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: themeColor }}
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </section>
  );
}
