'use client';

import { useState } from 'react';

/**
 * Tiny product thumbnail for table rows.
 *
 * Why not next/image?
 *   - Next.js Image runs on a Netlify edge function with a per-request
 *     warm-up cost (~1.5s observed in production HAR for 40px thumbs).
 *   - For thumbnails this small, transcoding savings don't beat the
 *     proxy hop.
 *
 * Strategy
 *   - For Supabase Storage URLs, rewrite `/object/public/...` to
 *     `/render/image/public/...?width=80&quality=60` — Supabase serves
 *     a pre-resized webp straight from its CDN, no Next round-trip.
 *   - Other URLs (unsplash, external) are used as-is.
 *   - Renders a grey skeleton until the image decodes, then fades in.
 *   - loading="lazy" + decoding="async" keeps it off the critical path.
 */
const SUPABASE_OBJECT_PATTERN = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//;

function toSupabaseTransform(src: string, size: number): string {
  if (!SUPABASE_OBJECT_PATTERN.test(src)) return src;
  // Use ~2x display size for crisp rendering on hi-DPI screens
  const target = Math.min(size * 2, 256);
  return (
    src.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') +
    `?width=${target}&height=${target}&resize=cover&quality=60`
  );
}

interface TableThumbnailProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export default function TableThumbnail({ src, alt, size = 40, className = '' }: TableThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const finalSrc = src ? toSupabaseTransform(src, size) : '';
  const showImage = !!finalSrc && !errored;

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`}
      style={{ width: size, height: size }}
    >
      {(!loaded || !showImage) && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}
      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={finalSrc}
          alt={alt}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setErrored(true); setLoaded(true); }}
        />
      )}
    </div>
  );
}
