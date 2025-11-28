'use client';

import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, ExternalLink, Loader2 } from 'lucide-react';

interface BuilderPreviewProps {
  companySlug: string;
}

export default function BuilderPreview({ companySlug }: BuilderPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);
  
  // Preview URL with preview mode enabled
  const previewUrl = `${window.location.origin}/site/${companySlug}?preview=true`;

  const handleRefresh = () => {
    setIsLoading(true);
    setKey(prev => prev + 1);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Listen for layout updates from parent to refresh if needed
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'REFRESH_PREVIEW') {
        handleRefresh();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
            {companySlug}.soursync.com
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#06b6d4] animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading preview...</p>
            </div>
          </div>
        )}
        
        {/* iframe */}
        <iframe
          id="preview-frame"
          key={key}
          ref={iframeRef}
          src={previewUrl}
          onLoad={handleLoad}
          className="w-full h-full border-0"
          title="Website Preview"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
