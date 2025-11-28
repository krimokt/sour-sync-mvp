'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';

interface ShopifyPreviewProps {
  companySlug: string;
  pageSlug?: string;
  devicePreview: 'desktop' | 'tablet' | 'mobile';
}

export default function ShopifyPreview({ companySlug, pageSlug = '/', devicePreview }: ShopifyPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    // Set preview URL with draft mode flag
    const path = pageSlug === '/' ? '' : `/${pageSlug}`;
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/site/${companySlug}${path}?preview=true&t=${Date.now()}`
      : '';
    setPreviewUrl(url);
  }, [companySlug, pageSlug]);

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      const path = pageSlug === '/' ? '' : `/${pageSlug}`;
      iframeRef.current.src = `${window.location.origin}/site/${companySlug}${path}?preview=true&t=${Date.now()}`;
    }
  };

  const handleOpenInNewTab = () => {
    const path = pageSlug === '/' ? '' : `/${pageSlug}`;
    window.open(`${window.location.origin}/site/${companySlug}${path}?preview=true`, '_blank');
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <span className="text-sm text-gray-500">Loading preview...</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={handleOpenInNewTab}
          className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
        <button
          onClick={handleRefresh}
          className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          title="Refresh preview"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>


      {/* Preview Frame - Full size iframe */}
      {previewUrl && (
        <iframe
          ref={iframeRef}
          id="preview-frame"
          src={previewUrl}
          className="w-full h-full border-none"
          onLoad={() => setIsLoading(false)}
          title="Website Preview"
        />
      )}
    </div>
  );
}
