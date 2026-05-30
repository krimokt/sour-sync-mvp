'use client';

import React from 'react';
import SolutionsList from '@/components/website/builder/chinasource-builder-components/SolutionsList';
import ProcessTimeline from '@/components/website/builder/chinasource-builder-components/ProcessTimeline';
import FactoryCertifications from '@/components/website/builder/chinasource-builder-components/FactoryCertifications';
import SourcingRequestForm from '@/components/website/builder/chinasource-builder-components/SourcingRequestForm';
import { Mail, MapPin } from 'lucide-react';
import type { GeneratedContent, ThemeColor } from '@/components/website/builder/chinasource-types';

// These builder section components are interactive editors; on standalone
// public pages we render them read-only with a no-op content updater.
const noop = () => {};

const sectionWrap = 'py-16 md:py-20 px-6';
const inner = 'max-w-6xl mx-auto';

export function SolutionsStandalone({
  solutions,
  accentHex,
  themeColor,
}: {
  solutions: GeneratedContent['solutions'];
  accentHex: string;
  themeColor: ThemeColor;
}) {
  return (
    <section className={sectionWrap} style={{ background: '#f8fafc' }}>
      <div className={inner}>
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.12em] mb-3 block" style={{ color: accentHex }}>
            What We Do
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            {solutions.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">{solutions.description}</p>
        </div>
        <SolutionsList
          items={solutions.items}
          accentHex={accentHex}
          themeColor={themeColor}
          updateContent={noop}
          readOnly
        />
      </div>
    </section>
  );
}

export function ProcessStandalone({
  howItWorks,
  accentHex,
}: {
  howItWorks: GeneratedContent['howItWorks'];
  accentHex: string;
}) {
  return (
    <section className={`${sectionWrap} bg-white`}>
      <div className={inner}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{howItWorks.title}</h1>
        </div>
        <ProcessTimeline steps={howItWorks.steps} accentHex={accentHex} updateContent={noop} readOnly />
      </div>
    </section>
  );
}

export function CertificationsStandalone({
  certificates,
  accentHex,
}: {
  certificates?: GeneratedContent['certificates'];
  accentHex: string;
}) {
  return (
    <section className="bg-white">
      <div className="pt-16 md:pt-20 px-6">
        <div className={`${inner} text-center mb-4`}>
          <span className="text-xs font-bold uppercase tracking-[0.12em] mb-3 block" style={{ color: accentHex }}>
            Quality &amp; Compliance
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {certificates?.title || 'Certifications'}
          </h1>
          {certificates?.subtitle && (
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">{certificates.subtitle}</p>
          )}
        </div>
      </div>
      <FactoryCertifications accentColor={accentHex} uploaded={certificates?.items} />
    </section>
  );
}

export function ContactStandalone({
  contact,
  companySlug,
  accentHex,
}: {
  contact: GeneratedContent['contact'];
  companySlug: string;
  accentHex: string;
}) {
  return (
    <section className={`${sectionWrap} bg-white`}>
      <div className={`${inner} grid grid-cols-1 lg:grid-cols-2 gap-16`}>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
            {contact.title || 'Contact Us'}
          </h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            Tell us what you need. We&apos;ll get back within 24 hours with a sourcing plan.
          </p>
          <div className="space-y-6">
            {contact.email && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accentHex}12` }}>
                  <Mail size={18} style={{ color: accentHex }} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</div>
                  <div className="text-base font-semibold text-gray-900">{contact.email}</div>
                </div>
              </div>
            )}
            {contact.address && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accentHex}12` }}>
                  <MapPin size={18} style={{ color: accentHex }} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location</div>
                  <div className="text-base font-medium text-gray-700 max-w-xs">{contact.address}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <SourcingRequestForm companySlug={companySlug} accentColor={accentHex} />
      </div>
    </section>
  );
}
