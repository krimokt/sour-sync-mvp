'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WebsiteSection } from '@/types/website';
import RenderSection from './RenderSection';

interface PreviewWrapperProps {
  initialLayout: WebsiteSection[];
  themeColor: string;
  fontHeading?: string;
  fontBody?: string;
  companyId: string;
  companySlug: string;
  companyName: string;
  isPreview: boolean;
}

export default function PreviewWrapper({
  initialLayout,
  themeColor: initialThemeColor,
  fontHeading: initialFontHeading = 'Inter',
  fontBody: initialFontBody = 'Inter',
  companyId,
  companySlug,
  companyName,
  isPreview,
}: PreviewWrapperProps) {
  const [layout, setLayout] = useState<WebsiteSection[]>(initialLayout || []);
  const [themeColor, setThemeColor] = useState(initialThemeColor);
  const [fontHeading, setFontHeading] = useState(initialFontHeading);
  const [fontBody, setFontBody] = useState(initialFontBody);

  // Handle incoming message
  const handleMessage = useCallback((event: MessageEvent) => {
    // Accept messages from any origin in preview mode for flexibility
    const { type, layout: newLayout, theme } = event.data || {};

    if (type === 'LAYOUT_UPDATE' && newLayout) {
      console.log('[Preview] Received layout update:', newLayout.length, 'sections');
      setLayout([...newLayout]); // Create new array to force re-render
      
      if (theme) {
        if (theme.primaryColor) setThemeColor(theme.primaryColor);
        if (theme.fontHeading) setFontHeading(theme.fontHeading);
        if (theme.fontBody) setFontBody(theme.fontBody);
      }
    }

    if (type === 'THEME_UPDATE' && theme) {
      console.log('[Preview] Received theme update');
      if (theme.primaryColor) setThemeColor(theme.primaryColor);
      if (theme.fontHeading) setFontHeading(theme.fontHeading);
      if (theme.fontBody) setFontBody(theme.fontBody);
    }

    if (type === 'REFRESH') {
      console.log('[Preview] Refresh requested');
      window.location.reload();
    }
  }, []);

  // Listen for postMessage updates from the builder
  useEffect(() => {
    if (!isPreview) return;

    window.addEventListener('message', handleMessage);

    // Notify parent that preview is ready (with delay to ensure iframe is loaded)
    const readyTimeout = setTimeout(() => {
      if (window.parent !== window) {
        console.log('[Preview] Sending PREVIEW_READY to parent');
        window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
      }
    }, 100);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(readyTimeout);
    };
  }, [isPreview, handleMessage]);

  // Update CSS variable for theme color
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
    document.documentElement.style.setProperty('--font-heading', `"${fontHeading}", sans-serif`);
    document.documentElement.style.setProperty('--font-body', `"${fontBody}", sans-serif`);
  }, [themeColor, fontHeading, fontBody]);

  // Helper to generate Google Fonts URL
  const getGoogleFontUrl = (fonts: string[]) => {
    const uniqueFonts = [...new Set(fonts)].filter(f => f && f !== 'sans' && f !== 'serif' && f !== 'inherit');
    if (uniqueFonts.length === 0) return '';
    const familyString = uniqueFonts.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700`).join('&');
    return `https://fonts.googleapis.com/css2?${familyString}&display=swap`;
  };

  const fontUrl = getGoogleFontUrl([fontHeading, fontBody]);

  if (!layout || layout.length === 0) {
    return (
      <div className="py-24 text-center bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to {companyName}</h1>
          <p className="text-gray-500">
            {isPreview 
              ? 'Start adding sections to build your website!'
              : 'This store is currently setting up their website. Please check back soon!'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {fontUrl && <link href={fontUrl} rel="stylesheet" />}
      <style jsx global>{`
        body { font-family: var(--font-body); }
        h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
      `}</style>
      <div>
        {layout.map((section) => {
          // Skip hidden sections in non-preview mode
          if (!isPreview && section.settings?.isHidden) {
            return null;
          }

          return (
            <RenderSection
              key={section.id}
              section={section}
              themeColor={themeColor}
              companyId={companyId}
              companySlug={companySlug}
            />
          );
        })}
      </div>
    </>
  );
}
