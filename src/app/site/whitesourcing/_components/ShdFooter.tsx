'use client';

import Link from 'next/link';
import { Mail, Phone, MessageCircle, MapPin, Ship, Linkedin } from 'lucide-react';

const NAVY = '#1B3E84';
const BLACK = '#0F1115';

const quickLinks = [
  { label: 'Products', href: '/site/whitesourcing/products' },
  { label: 'About Us', href: '/site/whitesourcing/about' },
  { label: 'Certifications', href: '/site/whitesourcing/certifications' },
  { label: 'Blog', href: '/site/whitesourcing/blog' },
  { label: 'Contact & Quote', href: '/site/whitesourcing/contact' },
  { label: 'Privacy Policy', href: '/site/whitesourcing' },
];

export function ShdFAB() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 100,
      }}
    >
      <a
        href="https://wa.me/8613803708899"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
        aria-label="Chat with Shuilida on WhatsApp"
        style={{
          width: 56,
          height: 56,
          backgroundColor: NAVY,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(27,62,132,0.45)',
          textDecoration: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          color: '#fff',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.1)';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 28px rgba(27,62,132,0.55)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(27,62,132,0.45)';
        }}
      >
        <MessageCircle size={24} />
      </a>
    </div>
  );
}

export default function ShdFooter() {
  return (
    <>
      <footer style={{ backgroundColor: BLACK, color: '#9ca3af', paddingTop: 64, paddingBottom: 0 }}>
        <div
          style={{ maxWidth: 1280, margin: '0 auto', padding: '0 40px 48px' }}
          className="px-4 md:px-10"
        >
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            style={{ gap: 48 }}
          >
            {/* Col 1: Brand */}
            <div>
              <Link
                href="/site/whitesourcing"
                style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, textDecoration: 'none' }}
              >
                <span
                  style={{
                    backgroundColor: NAVY,
                    color: '#fff',
                    padding: '4px 8px',
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    borderRadius: 2,
                  }}
                >
                  SHD
                </span>
                <span style={{ fontFamily: 'IBM Plex Sans', fontSize: 17, fontWeight: 700, color: '#fff' }}>
                  SHUILIDA
                </span>
              </Link>
              <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20, color: '#6b7280' }}>
                商丘市水力达水暖器材厂 — ISO 9001 certified manufacturer of heating and plumbing equipment since 2003. Exporting from Shangqiu, Henan to 40+ countries.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'LinkedIn', icon: <Linkedin size={18} /> },
                  { label: 'Alibaba', char: 'A' },
                  { label: 'WeChat', char: 'W' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    title={social.label}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      color: '#6b7280',
                      textDecoration: 'none',
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280';
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.12)';
                    }}
                  >
                    {'icon' in social ? social.icon : social.char}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Contact */}
            <div>
              <h4 style={{ fontFamily: 'IBM Plex Sans', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
                Contact
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <li style={{ fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#6b7280', marginTop: 2, flexShrink: 0 }}><Mail size={16} /></span>
                    <a href="mailto:sales@shuilida-hvac.com" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                      sales@shuilida-hvac.com
                    </a>
                  </div>
                </li>
                <li style={{ fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#6b7280', marginTop: 2, flexShrink: 0 }}><Phone size={16} /></span>
                    <span>+86-370-8823-4567</span>
                  </div>
                </li>
                <li style={{ fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#6b7280', marginTop: 2, flexShrink: 0 }}><MessageCircle size={16} /></span>
                    <a
                      href="https://wa.me/8613803708899"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#9ca3af', textDecoration: 'none' }}
                    >
                      +86-138-0370-8899 (WhatsApp)
                    </a>
                  </div>
                </li>
                <li style={{ fontSize: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#6b7280', marginTop: 2, flexShrink: 0 }}><MapPin size={16} /></span>
                    <span style={{ lineHeight: 1.6 }}>
                      Industrial Zone, Liangyuan District,<br />
                      Shangqiu City, Henan Province,<br />
                      China 476000
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Col 3: Quick Links */}
            <div>
              <h4 style={{ fontFamily: 'IBM Plex Sans', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        color: '#9ca3af',
                        fontSize: 14,
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                        display: 'inline-block',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#9ca3af')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Newsletter */}
            <div>
              <h4 style={{ fontFamily: 'IBM Plex Sans', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 20 }}>
                Stay Updated
              </h4>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20, color: '#6b7280' }}>
                Subscribe for new product releases, trade show announcements, and export pricing updates.
              </p>
              <div style={{ display: 'flex' }}>
                <input
                  type="email"
                  placeholder="Your email"
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRight: 'none',
                    color: '#fff',
                    padding: '10px 14px',
                    fontSize: 14,
                    fontFamily: 'Inter',
                    outline: 'none',
                    borderRadius: '2px 0 0 2px',
                  }}
                />
                <button
                  style={{
                    backgroundColor: NAVY,
                    color: '#fff',
                    padding: '10px 18px',
                    border: 'none',
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    borderRadius: '0 2px 2px 0',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#142f66')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = NAVY)}
                >
                  Join
                </button>
              </div>

              {/* Certifications mini */}
              <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
                {['ISO 9001', 'CE Mark'].map((cert) => (
                  <div
                    key={cert}
                    style={{
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 2,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontFamily: 'IBM Plex Sans',
                      fontWeight: 600,
                      color: '#93c5fd',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '20px 40px',
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
          className="px-4 md:px-10"
        >
          <p style={{ fontSize: 12, color: '#4b5563', letterSpacing: '0.02em' }}>
            © 2024 商丘市水力达水暖器材厂 (Shuilida Heating &amp; Plumbing Equipment Factory). All Rights Reserved.
          </p>
          <p style={{ fontSize: 12, color: '#4b5563' }}>
            Powered by{' '}
            <a
              href="https://soursync.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#6b7280', textDecoration: 'none' }}
            >
              SourSync
            </a>
          </p>
        </div>
      </footer>

      <ShdFAB />
    </>
  );
}
