'use client';

import React from 'react';
import { LandingPageTemplate } from '@/components/website/builder/chinasource-builder-components/LandingPageTemplate';
import { FormData, GeneratedContent } from '@/components/website/builder/chinasource-types';
import type { CaseStudySeo, TestimonialSeo } from '@/lib/seo-data';

interface PublishedBuilderSiteProps {
  formData: FormData;
  generatedContent: GeneratedContent;
  companySlug?: string;
  caseStudies?: CaseStudySeo[];
  testimonials?: TestimonialSeo[];
}

export default function PublishedBuilderSite({ formData, generatedContent, companySlug, caseStudies, testimonials }: PublishedBuilderSiteProps) {
  // Disable edit functionality for published site
  const handleEdit = () => {
    // No-op for published site
  };

  return (
    <div className="w-full">
      <LandingPageTemplate
        data={formData}
        content={generatedContent}
        onEdit={handleEdit}
        hideSidebar={true}
        readOnly={true}
        companySlug={companySlug}
        caseStudies={caseStudies}
        testimonials={testimonials}
      />
    </div>
  );
}

