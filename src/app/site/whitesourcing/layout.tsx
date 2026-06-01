import type { Metadata } from 'next';
import ShdNav from './_components/ShdNav';
import ShdFooter from './_components/ShdFooter';
import GoogleTranslate from './_components/GoogleTranslate';

export const metadata: Metadata = {
  title: 'SHUILIDA | Heating & Plumbing Equipment Factory — Shangqiu, Henan, China',
  description:
    'Shuilida Heating & Plumbing Equipment Factory (商丘市水力达水暖器材厂) — ISO 9001 certified manufacturer of steel panel radiators, cast iron radiators, aluminum radiators, underfloor heating systems, PPR pipes, brass ball valves and manifold systems. Exporting to 40+ countries since 2003.',
  keywords: [
    'steel panel radiator manufacturer',
    'cast iron radiator China',
    'aluminum radiator factory',
    'underfloor heating system',
    'PPR hot water pipe',
    'brass ball valve',
    'manifold distribution system',
    'heating equipment manufacturer China',
    'Shangqiu Henan factory',
    'OEM radiator supplier',
  ],
  openGraph: {
    title: 'SHUILIDA Heating & Plumbing Equipment Factory',
    description:
      'ISO 9001 certified manufacturer of radiators, underfloor heating, PPR pipes and brass valves. 20+ years, 350+ SKUs, exporting to 40+ countries.',
    type: 'website',
    locale: 'en_US',
    siteName: 'SHUILIDA',
  },
  robots: { index: true, follow: true },
};

export default function WhiteSourcingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ colorScheme: 'light', backgroundColor: '#ffffff', minHeight: '100vh' }}
      className="[&_*]:![color-scheme:light]"
    >
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .shd-root {
          font-family: 'Inter', system-ui, sans-serif;
          color: #0F1115;
          background: #fff;
          -webkit-font-smoothing: antialiased;
        }

        .shd-root h1, .shd-root h2, .shd-root h3, .shd-root h4 {
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
        }

        .shd-mono {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
        }

        .shd-grid-bg {
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .shd-product-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .shd-product-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.10);
          border-color: #d1d5db;
        }
        .shd-product-card.featured {
          border: 2px solid #1B3E84;
        }
        .shd-product-card img {
          transition: transform 0.5s ease;
        }
        .shd-product-card:hover img {
          transform: scale(1.06);
        }

        .shd-region-card {
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.18);
          transition: background 0.2s ease;
        }
        .shd-region-card:hover {
          background: rgba(255,255,255,0.18);
        }

        .shd-nav-link {
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .shd-nav-link:hover { color: #1B3E84; }
        .shd-nav-link.active { color: #1B3E84; }

        .shd-filter-btn {
          padding: 8px 20px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'IBM Plex Sans', sans-serif;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .shd-filter-btn.active {
          background: #1B3E84;
          color: #fff;
          border-color: #1B3E84;
        }
        .shd-filter-btn:not(.active) {
          background: #fff;
          color: #4b5563;
        }
        .shd-filter-btn:not(.active):hover {
          border-color: #1B3E84;
          color: #1B3E84;
        }

        .shd-cert-badge {
          background: #F4F6FA;
          border: 1px solid #e5e7eb;
          transition: box-shadow 0.2s;
        }
        .shd-cert-badge:hover {
          box-shadow: 0 4px 16px rgba(27,62,132,0.12);
        }

        .shd-input {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #0F1115;
          padding: 12px 16px;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
          border-radius: 2px;
        }
        .shd-input:focus { border-color: #1B3E84; }

        .shd-textarea {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #0F1115;
          padding: 12px 16px;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          width: 100%;
          outline: none;
          resize: vertical;
          min-height: 120px;
          transition: border-color 0.2s;
          border-radius: 2px;
        }
        .shd-textarea:focus { border-color: #1B3E84; }

        @media (prefers-reduced-motion: reduce) {
          .shd-product-card img,
          .shd-product-card,
          .shd-region-card { transition: none; }
        }
      `}</style>

      <GoogleTranslate />
      <ShdNav />
      {children}
      <ShdFooter />
    </div>
  );
}
