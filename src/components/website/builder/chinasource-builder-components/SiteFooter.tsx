'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import type { FormData, GeneratedContent } from '../chinasource-types';

interface SiteFooterProps {
  data: FormData;
  content: GeneratedContent;
  accentColor: string;
  companySlug: string;
}

export default function SiteFooter({ data, content, accentColor, companySlug }: SiteFooterProps) {
  const links = [
    { label: 'Home', href: `/site/${companySlug}` },
    { label: 'Products', href: `/site/${companySlug}/products` },
    { label: 'About', href: `/site/${companySlug}/about` },
    { label: 'Services', href: `/site/${companySlug}/services` },
    { label: 'Track Order', href: `/site/${companySlug}/track` },
    { label: 'Sign In', href: `/site/${companySlug}/signin` },
  ];

  const support = [
    { label: 'Request Quote', href: `/site/${companySlug}/products` },
    { label: 'Track Shipment', href: `/site/${companySlug}/track` },
    { label: 'Contact', href: `/site/${companySlug}/about#contact` },
  ];

  return (
    <footer className="bg-[#0b1220] text-white pt-20 pb-10 px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/10">
          {/* Brand + intro */}
          <div className="md:col-span-2">
            <Link href={`/site/${companySlug}`} className="inline-flex items-center gap-3 mb-5">
              {data.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.logoUrl} alt={data.companyName} className="h-9 w-auto" />
              ) : (
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ background: accentColor }}
                >
                  {data.companyName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-lg font-bold">{data.companyName}</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm mb-6">
              {content.hero?.subheadline ||
                'Trusted sourcing and end-to-end logistics from China to the world.'}
            </p>
            <div className="space-y-2 text-sm text-white/70">
              {content.contact?.email && (
                <a href={`mailto:${content.contact.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  {content.contact.email}
                </a>
              )}
              {content.contact?.phone && (
                <a href={`tel:${content.contact.phone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  {content.contact.phone}
                </a>
              )}
              {content.contact?.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{content.contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] mb-4 text-white/90">Browse</h4>
            <ul className="space-y-2.5 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] mb-4 text-white/90">Support</h4>
            <ul className="space-y-2.5 text-sm">
              {support.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Socials */}
            {content.contact?.socialMedia && content.contact.socialMedia.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {content.contact.socialMedia.map((s, i) => {
                  const Icon = s.platform === 'instagram' ? Instagram
                    : s.platform === 'linkedin' ? Linkedin
                    : MessageCircle;
                  return (
                    <a
                      key={i}
                      href={s.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {data.companyName}. All rights reserved.</p>
          <p>
            Powered by{' '}
            <a href="https://soursync.com" className="text-white/60 hover:text-white transition-colors">
              SourSync
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
