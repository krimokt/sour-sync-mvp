import { NextResponse } from 'next/server'

// Simplified icon version of Soursync logo (just the sync arrows, no text)
const iconSvg = `<svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="12" fill="url(#gradient)" />
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0f7aff" />
    </linearGradient>
  </defs>
  <path d="M 35 40 L 35 35 A 15 15 0 0 1 50 20 A 15 15 0 0 1 65 35 L 65 48 L 58 41 M 65 48 L 72 41" stroke="white" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 65 60 L 65 65 A 15 15 0 0 1 50 80 A 15 15 0 0 1 35 65 L 35 52 L 28 59 M 35 52 L 42 59" stroke="white" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>`

export async function GET() {
  return new NextResponse(iconSvg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
