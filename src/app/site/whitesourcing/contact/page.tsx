'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageCircle, MapPin, Clock, CheckCircle2, Building2, Globe } from 'lucide-react';

/* ─────────────────────────────────────────────
   Brand palette
   Deep Navy  : #1B3E84
   Signal Red : #E2231A
   Steel Gray : #F4F6FA
   Black      : #0F1115
───────────────────────────────────────────── */

const NAVY = '#1B3E84';
const RED = '#E2231A';
const STEEL = '#F4F6FA';
const BLACK = '#0F1115';

type FormState = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  subject: string;
  productsOfInterest: string;
  message: string;
  privacyAgreed: boolean;
};

const INITIAL_FORM: FormState = {
  fullName: '',
  companyName: '',
  email: '',
  phone: '',
  country: '',
  subject: '',
  productsOfInterest: '',
  message: '',
  privacyAgreed: false,
};

const SUBJECT_OPTIONS = [
  'General Product Enquiry',
  'Request a Quote',
  'OEM / Custom Manufacturing',
  'Sample Request',
  'Third-Party Inspection',
  'Certification Documents',
  'Partnership / Distributor',
  'Other',
];

const FAQ = [
  {
    question: 'What is your MOQ?',
    answer:
      '500 pieces for standard products. 1,000 pieces for OEM and custom orders. No minimum order quantity applies to samples.',
  },
  {
    question: 'Do you accept L/C payment?',
    answer:
      'Yes. Letter of Credit at sight is accepted. T/T 30% deposit + 70% before shipment is preferred. PayPal is available for small sample orders.',
  },
  {
    question: 'Can I visit the factory?',
    answer:
      'Factory visits are welcome. Please contact us at least two weeks in advance to arrange an accompanied visit and full production tour.',
  },
];

const TRADE_SHOWS = [
  {
    name: 'China International Hardware Fair (CIFF)',
    location: 'Guangzhou, China',
    date: 'March 2027',
    desc: "China's largest hardware and plumbing trade fair. We exhibit annually with a full product display and export team on site.",
  },
  {
    name: 'ISH Frankfurt',
    location: 'Frankfurt, Germany',
    date: 'March 2027',
    desc: "Europe's premier HVAC and plumbing exhibition. We attend with our European distribution partners.",
  },
  {
    name: 'The Big 5 Dubai',
    location: 'Dubai, UAE',
    date: 'November 2026',
    desc: "The Middle East's largest construction and building materials exhibition. Meet our MEA export team at our booth.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formSent, setFormSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  useEffect(() => {
    const els = document.querySelectorAll('.shd-fade');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [formSent]);

  return (
    <div className="shd-root" style={{ colorScheme: 'light', color: BLACK }}>
      <style suppressHydrationWarning>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .shd-fade { opacity: 0; }
        .shd-fade.visible { animation: fadeInUp 0.5s ease forwards; }
      `}</style>

      {/* ══════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          backgroundColor: NAVY,
          overflow: 'hidden',
          padding: '72px 40px 80px',
        }}
      >
        {/* Grid overlay */}
        <div
          className="shd-grid-bg"
          style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 1 }}
        />
        {/* Bottom fade */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            zIndex: 1,
            background: `linear-gradient(to bottom, transparent, rgba(27,62,132,0.35))`,
          }}
        />

        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
          }}
        >
          {/* Breadcrumb */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 32,
              fontSize: 13,
              fontFamily: 'IBM Plex Sans',
              fontWeight: 600,
            }}
            aria-label="Breadcrumb"
          >
            <Link
              href="/site/whitesourcing"
              style={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)')}
            >
              Home
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
            <span style={{ color: '#fff' }}>Contact</span>
          </nav>

          <h1
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 'clamp(32px, 5vw, 54px)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              marginBottom: 20,
              textWrap: 'balance',
            }}
          >
            Get in Touch
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.82)',
              fontSize: 18,
              lineHeight: 1.65,
              marginBottom: 44,
              maxWidth: '62ch',
              margin: '0 auto 44px',
            }}
          >
            Send us a quote request, product inquiry, or OEM requirement. Our export team responds within 24 hours.
          </p>

          {/* Quick-contact chips */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              { icon: <Mail size={16} />, label: 'Email response in 24h' },
              { icon: <MessageCircle size={16} />, label: 'WhatsApp available' },
              { icon: <Globe size={16} />, label: 'English / Arabic / French spoken' },
            ].map((chip) => (
              <div
                key={chip.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  color: '#fff',
                  padding: '9px 18px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontFamily: 'IBM Plex Sans',
                  fontWeight: 600,
                }}
              >
                <span>{chip.icon}</span>
                {chip.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — CONTACT FORM + INFO
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: '80px 40px' }}>
        <div
          style={{ maxWidth: 1280, margin: '0 auto' }}
          className="flex flex-col lg:flex-row"
        >
          {/* ── Left: Enquiry Form (60%) ── */}
          <div
            className="shd-fade lg:pr-16"
            style={{
              flex: '0 0 auto',
              width: '100%',
              maxWidth: 700,
              paddingRight: 0,
            }}
          >
            <h2
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 700,
                color: BLACK,
                marginBottom: 10,
                letterSpacing: '-0.02em',
              }}
            >
              Send an Enquiry
            </h2>
            <p style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.65, marginBottom: 36 }}>
              Fill in the form below with your product requirements and destination. We will respond with pricing, technical datasheets, and sample availability within one business day.
            </p>

            {formSent ? (
              /* ── Success state ── */
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 4,
                  padding: '40px 36px',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <CheckCircle2 size={40} style={{ color: '#22c55e' }} />
                </div>
                <h3
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#166534',
                    marginBottom: 10,
                  }}
                >
                  Your enquiry has been sent!
                </h3>
                <p style={{ color: '#15803d', fontSize: 15, lineHeight: 1.65, maxWidth: '48ch', margin: '0 auto 20px' }}>
                  Our export team will respond within 24 hours with pricing and product details. If you don't hear from us, please check your spam folder.
                </p>
                <button
                  onClick={() => { setForm(INITIAL_FORM); setFormSent(false); }}
                  style={{
                    backgroundColor: NAVY,
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: 2,
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Row: Full Name + Company Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 20 }}>
                  <div>
                    <label style={labelStyle}>Full Name <span style={{ color: RED }}>*</span></label>
                    <input
                      className="shd-input"
                      type="text"
                      name="fullName"
                      placeholder="e.g. Ahmed Al-Rashid"
                      required
                      value={form.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Company Name <span style={{ color: RED }}>*</span></label>
                    <input
                      className="shd-input"
                      type="text"
                      name="companyName"
                      placeholder="e.g. Warsaw HVAC Supplies Ltd."
                      required
                      value={form.companyName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Row: Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 20 }}>
                  <div>
                    <label style={labelStyle}>Email Address <span style={{ color: RED }}>*</span></label>
                    <input
                      className="shd-input"
                      type="email"
                      name="email"
                      placeholder="you@company.com"
                      required
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone / WhatsApp</label>
                    <input
                      className="shd-input"
                      type="tel"
                      name="phone"
                      placeholder="+1 555 000 0000 or +86 138..."
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Row: Country + Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 20 }}>
                  <div>
                    <label style={labelStyle}>Country</label>
                    <input
                      className="shd-input"
                      type="text"
                      name="country"
                      placeholder="e.g. Poland, UAE, Germany..."
                      value={form.country}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Subject <span style={{ color: RED }}>*</span></label>
                    <select
                      className="shd-input"
                      name="subject"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      style={{
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        paddingRight: 40,
                        cursor: 'pointer',
                      }}
                    >
                      <option value="" disabled>Select a topic...</option>
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Products of Interest */}
                <div>
                  <label style={labelStyle}>
                    Product(s) of Interest <span style={{ color: RED }}>*</span>
                  </label>
                  <textarea
                    className="shd-textarea"
                    name="productsOfInterest"
                    required
                    rows={4}
                    placeholder="e.g. Steel Panel Radiators Type 22, 500mm height, 1000mm width, qty 2000 pcs. Destination: Warsaw, Poland. Please include FOB Qingdao pricing and lead time."
                    value={form.productsOfInterest}
                    onChange={handleChange}
                    style={{ minHeight: 110 }}
                  />
                </div>

                {/* Message */}
                <div>
                  <label style={labelStyle}>
                    Additional Message <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    className="shd-textarea"
                    name="message"
                    rows={3}
                    placeholder="Any additional context, delivery requirements, certification requests, or questions for our team..."
                    value={form.message}
                    onChange={handleChange}
                    style={{ minHeight: 90 }}
                  />
                </div>

                {/* Privacy checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <input
                    type="checkbox"
                    id="privacy"
                    name="privacyAgreed"
                    required
                    checked={form.privacyAgreed}
                    onChange={handleChange}
                    style={{
                      marginTop: 3,
                      width: 16,
                      height: 16,
                      accentColor: NAVY,
                      flexShrink: 0,
                      cursor: 'pointer',
                    }}
                  />
                  <label
                    htmlFor="privacy"
                    style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.55, cursor: 'pointer' }}
                  >
                    I agree to SHUILIDA processing my data to respond to this enquiry. Your information will not be shared with third parties or used for unsolicited marketing.
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  style={{
                    backgroundColor: NAVY,
                    color: '#fff',
                    padding: '15px 28px',
                    border: 'none',
                    borderRadius: 2,
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%',
                    letterSpacing: '0.01em',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#142f66')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                >
                  Send Enquiry
                </button>
              </form>
            )}
          </div>

          {/* ── Right: Contact Info Card (40%) ── */}
          <div
            className="shd-fade mt-12 lg:mt-0"
            style={{
              flex: 1,
              marginTop: 0,
            }}
          >
            <div
              style={{
                backgroundColor: STEEL,
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                padding: '36px 32px',
                height: '100%',
              }}
            >
              {/* Export Office */}
              <InfoSection title="Export Office">
                <InfoRow icon={<Mail size={18} />}>
                  <a
                    href="mailto:sales@shuilida-hvac.com"
                    style={{ color: NAVY, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
                  >
                    sales@shuilida-hvac.com
                  </a>
                </InfoRow>
                <InfoRow icon={<Phone size={18} />}>
                  <a
                    href="tel:+863708823456"
                    style={{ color: NAVY, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
                  >
                    +86-370-8823-4567
                  </a>
                </InfoRow>
                <InfoRow icon={<MessageCircle size={18} />}>
                  <span style={{ color: '#374151', fontSize: 14 }}>WhatsApp: </span>
                  <a
                    href="https://wa.me/8613803708899"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: NAVY, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
                  >
                    +86-138-0370-8899
                  </a>
                </InfoRow>
                <InfoRow icon={<MapPin size={18} />}>
                  <span style={{ color: '#374151', fontSize: 14, lineHeight: 1.55 }}>
                    Industrial Zone, Liangyuan District, Shangqiu City, Henan Province, China 476000
                  </span>
                </InfoRow>
              </InfoSection>

              <Divider />

              {/* Business Hours */}
              <InfoSection title="Business Hours">
                <HoursRow label="Mon – Fri" value="08:00 – 18:00 CST (UTC+8)" />
                <HoursRow label="Saturday" value="09:00 – 14:00 CST" />
                <HoursRow label="Sunday" value="Closed" muted />
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 10, lineHeight: 1.55 }}>
                  Outside hours? WhatsApp messages are answered within 12 hours.
                </p>
              </InfoSection>

              <Divider />

              {/* Response Times */}
              <InfoSection title="Response Times">
                <ResponseRow label="Standard enquiry" value="Within 24 hours" />
                <ResponseRow label="Quote request" value="24 – 48 hours" />
                <ResponseRow label="Sample request" value="3 – 5 business days" />
                <ResponseRow label="OEM consultation" value="Schedule via email" />
              </InfoSection>

              <Divider />

              {/* Regional Contacts */}
              <InfoSection title="Export Contacts by Region">
                <RegionRow flag="🇵🇱" region="Eastern Europe" email="exports-eu@shuilida-hvac.com" />
                <RegionRow flag="🇦🇪" region="Middle East" email="exports-me@shuilida-hvac.com" />
                <RegionRow flag="🌏" region="Asia & Other" email="sales@shuilida-hvac.com" />
              </InfoSection>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/8613803708899"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  marginTop: 28,
                  backgroundColor: NAVY,
                  color: '#fff',
                  padding: '14px 20px',
                  borderRadius: 2,
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  width: '100%',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#142f66')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = NAVY)}
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — FAQ STRIP
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: STEEL, padding: '72px 40px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 700,
              color: BLACK,
              marginBottom: 8,
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            Common Questions
          </h2>
          <p
            style={{
              color: '#6b7280',
              fontSize: 15,
              textAlign: 'center',
              marginBottom: 48,
              maxWidth: '55ch',
              margin: '0 auto 48px',
            }}
          >
            Quick answers to questions we receive from importers and distributors worldwide.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
            {FAQ.map((faq) => (
              <div
                key={faq.question}
                className="shd-fade"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 4,
                  padding: '28px 28px 32px',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(27,62,132,0.10)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = 'none')}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: NAVY,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <span style={{ color: '#fff', fontSize: 16 }}>?</span>
                </div>
                <h3
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 16,
                    fontWeight: 700,
                    color: BLACK,
                    marginBottom: 10,
                    lineHeight: 1.35,
                  }}
                >
                  {faq.question}
                </h3>
                <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.65 }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — MAP PLACEHOLDER
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: '72px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="shd-fade" style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(22px, 3vw, 32px)',
                fontWeight: 700,
                color: BLACK,
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}
            >
              Find Our Factory
            </h2>
            <p style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.65, maxWidth: '60ch' }}>
              Our manufacturing facility is located in Shangqiu City, Henan Province. Use Google Maps or Baidu Maps to navigate directly to our industrial zone.
            </p>
          </div>

          {/* Map placeholder */}
          <div
            className="shd-fade"
            style={{
              backgroundColor: STEEL,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              height: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative grid pattern */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                opacity: 0.5,
              }}
            />
            {/* Decorative road lines */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: '#d1d5db',
                transform: 'translateY(-50%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '35%',
                width: 3,
                backgroundColor: '#d1d5db',
              }}
            />

            {/* Pin content */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                textAlign: 'center',
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: '20px 28px',
                maxWidth: 420,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <MapPin size={28} style={{ color: RED }} />
              </div>
              <div
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 15,
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: 4,
                }}
              >
                SHUILIDA Factory
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
                Industrial Zone, Liangyuan District, Shangqiu City, Henan Province 476000, China
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.55 }}>
                Nearest airport: Shangqiu Airport (SQJ), 12 km.
                Nearest high-speed rail: Shangqiu Station, 8 km.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="https://maps.google.com/maps?q=Shangqiu+City+Henan+China"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: NAVY,
                color: '#fff',
                padding: '11px 22px',
                borderRadius: 2,
                fontFamily: 'IBM Plex Sans',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#142f66')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = NAVY)}
            >
              <MapPin size={16} /> Get Directions
            </a>
            <a
              href="mailto:sales@shuilida-hvac.com?subject=Factory Visit Request"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'transparent',
                color: BLACK,
                padding: '11px 22px',
                borderRadius: 2,
                border: `1px solid #d1d5db`,
                fontFamily: 'IBM Plex Sans',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = NAVY;
                (e.currentTarget as HTMLAnchorElement).style.color = NAVY;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#d1d5db';
                (e.currentTarget as HTMLAnchorElement).style.color = BLACK;
              }}
            >
              <Clock size={16} /> Request Factory Visit
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5 — TRADE SHOWS
      ══════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: NAVY,
          padding: '80px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid overlay */}
        <div
          className="shd-grid-bg"
          style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.7 }}
        />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: 52, maxWidth: 640 }}>
            <h2
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(24px, 3.5vw, 38px)',
                fontWeight: 700,
                color: '#fff',
                marginBottom: 14,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Meet Us at Trade Shows
            </h2>
            <p style={{ color: '#bfdbfe', fontSize: 16, lineHeight: 1.7 }}>
              We exhibit at major international trade fairs. Visit our booth to see product samples, meet our export team, and discuss OEM requirements in person.
            </p>
          </div>

          {/* Show cards */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
            {TRADE_SHOWS.map((show) => (
              <div
                key={show.name}
                className="shd-fade"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.09)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 4,
                  padding: '28px 28px 32px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.15)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.09)')}
              >
                {/* Date badge */}
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#93c5fd',
                    padding: '4px 12px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontFamily: 'IBM Plex Sans',
                    fontWeight: 700,
                    marginBottom: 16,
                    letterSpacing: '0.04em',
                  }}
                >
                  {show.date}
                </div>
                <h3
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: 6,
                    lineHeight: 1.35,
                  }}
                >
                  {show.name}
                </h3>
                <div
                  style={{
                    fontSize: 13,
                    fontFamily: 'IBM Plex Sans',
                    fontWeight: 600,
                    color: '#93c5fd',
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <MapPin size={14} /> {show.location}
                </div>
                <p style={{ color: '#bfdbfe', fontSize: 14, lineHeight: 1.65 }}>
                  {show.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div style={{ marginTop: 44, textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
              Want to meet us at an upcoming show?{' '}
              <a
                href="mailto:sales@shuilida-hvac.com?subject=Trade Show Meeting Request"
                style={{ color: '#93c5fd', fontWeight: 700, textDecoration: 'none' }}
              >
                Email us to schedule a booth meeting.
              </a>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ─── Small inline helper components ─── */

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 0 }}>
      <div
        style={{
          fontFamily: 'IBM Plex Sans',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: NAVY,
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ flexShrink: 0, marginTop: 1, color: NAVY, display: 'flex' }}>{icon}</span>
      <div style={{ lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function HoursRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: muted ? '#9ca3af' : BLACK,
          fontFamily: 'IBM Plex Sans',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ResponseRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
      <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          fontFamily: 'IBM Plex Sans',
          fontWeight: 700,
          color: NAVY,
          backgroundColor: 'rgba(27,62,132,0.08)',
          padding: '3px 10px',
          borderRadius: 999,
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function RegionRow({ flag, region, email }: { flag: string; region: string; email: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 15 }}>{flag}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', minWidth: 120 }}>{region}</span>
      <a
        href={`mailto:${email}`}
        style={{ fontSize: 13, color: NAVY, fontWeight: 600, textDecoration: 'none' }}
      >
        {email}
      </a>
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        backgroundColor: '#e5e7eb',
        margin: '22px 0',
      }}
    />
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'IBM Plex Sans',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 7,
};
