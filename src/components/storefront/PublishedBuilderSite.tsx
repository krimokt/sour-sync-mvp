'use client';

import React from 'react';
import { LandingPageTemplate } from '@/components/website/builder/chinasource-builder-components/LandingPageTemplate';
import { FormData, GeneratedContent } from '@/components/website/builder/chinasource-types';

interface PublishedBuilderSiteProps {
  formData: FormData;
  generatedContent: GeneratedContent;
  companySlug?: string;
}

export default function PublishedBuilderSite({ formData, generatedContent, companySlug }: PublishedBuilderSiteProps) {
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
      />
    </div>
  );
}

