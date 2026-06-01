'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Factory, Wrench, CheckCircle2, Package, ShieldCheck, Clock, Truck, Star } from 'lucide-react';

/* ─────────────────────────────────────────────
   Brand palette
   Deep Navy  : #1B3E84
   Signal Red : #E2231A
   Steel Gray : #F4F6FA
   Black      : #0F1115
───────────────────────────────────────────── */

const NAVY = '#1B3E84';
const RED = '#E2231A';
const STEEL = '#F4F6FA';
const BLACK = '#0F1115';

/* ── Category badge colors ── */
const BADGE: Record<string, { bg: string; color: string; label: string }> = {
  radiators: { bg: '#EBF2FF', color: '#1B3E84', label: 'Radiators' },
  heating:   { bg: '#ECFDF5', color: '#065F46', label: 'Heating Systems' },
  valves:    { bg: '#FFF7ED', color: '#92400E', label: 'Valves & Fittings' },
};

/* ── Static fallback products data ── */
const STATIC_PRODUCTS = [
  {
    sku: 'SP-RAD-600',
    name: 'Steel Panel Radiators',
    category: 'radiators',
    img: '/shuilida-valve.webp',
    alt: 'Steel panel radiator wall-mounted',
    description: 'Compact, high-efficiency steel panel radiators suitable for residential and light commercial heating. Available in single, double, and triple panel configurations with bottom or side connection options.',
    price: null as number | null,
    specs: [
      'Types: Type 11 / 21 / 22 / 33',
      'Height: 300–900 mm | Width: 400–3000 mm',
      'Max working pressure: 10 bar',
      'Max working temperature: 95°C | Connection: Bottom/Side',
    ],
  },
  {
    sku: 'CI-COL-500',
    name: 'Cast Iron Column Radiators',
    category: 'radiators',
    img: 'https://images.unsplash.com/photo-1581922819941-6ab31ab79afc?w=600&q=80',
    alt: 'Traditional cast iron column radiator',
    description: 'Traditional-style cast iron column radiators with exceptional heat retention and corrosion resistance. Ideal for heritage buildings and high-humidity environments such as bathrooms and conservatories.',
    price: null as number | null,
    specs: [
      'Sections: 3–20 per unit, field-configurable',
      'Heat output: 140 W per section (Delta T 60°C)',
      'Max pressure: 6 bar | Finish: Primer or RAL powder coat',
      'Lifespan: 50+ years under normal operating conditions',
    ],
  },
  {
    sku: 'AL-SEC-80',
    name: 'Aluminum Section Radiators',
    category: 'radiators',
    img: '/shuilida-cert.webp',
    alt: 'Aluminum section radiator in silver finish',
    description: 'Lightweight, high-output aluminum radiators with rapid heat-up response. Superior thermal conductivity makes these ideal for low-temperature underfloor heating systems and modern condensing boiler setups.',
    price: null as number | null,
    specs: [
      'Section height: 500 mm or 600 mm',
      'Heat output: 180 W per section (Delta T 60°C)',
      'Weight: 1.1 kg per section | Max pressure: 8 bar',
      'Rapid heat response: full operating temperature in under 15 min',
    ],
  },
  {
    sku: 'UFH-SYS-20',
    name: 'Underfloor Heating System',
    category: 'heating',
    img: 'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?w=600&q=80',
    alt: 'Underfloor heating PEX pipe installation',
    description: 'Complete PEX-A pipe underfloor heating kit supplied with stainless steel manifold, clips, and installation accessories. Compatible with tile, engineered wood, and screed floor finishes.',
    price: null as number | null,
    specs: [
      'Pipe spec: PEX-A 16×2 mm, oxygen-barrier EVOH layer',
      'Pipe spacing: 100 / 150 / 200 mm | Max circuit area: 20 m²',
      'Manifold: SS304 stainless, 2–12 circuits with flow meters',
      'Floor compatibility: Ceramic tile, engineered wood, anhydrite screed',
    ],
  },
  {
    sku: 'PPR-HW-32',
    name: 'PPR Hot Water Pipes',
    category: 'heating',
    img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
    alt: 'Green PPR hot water pipes',
    description: 'High-temperature polypropylene random copolymer (PPR) pipes for domestic hot and cold water distribution. Heat-fusion jointing produces a monolithic, leak-free system with a service life exceeding 50 years.',
    price: null as number | null,
    specs: [
      'Sizes: DN20 / DN25 / DN32 / DN40 / DN50 mm',
      'Pressure rating: PN20 at 95°C continuous service',
      'Standard compliance: ISO 15874, EN 15874',
      'Colour: Green or Grey | Jointing method: Socket heat fusion',
    ],
  },
  {
    sku: 'BBV-DN25',
    name: 'Brass Ball Valves',
    category: 'valves',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    alt: 'Lead-free brass ball valve with handle',
    description: 'Full-bore lead-free brass ball valves for heating circuit isolation and zone control. Machined from CW617N alloy bar stock with PTFE seats and a blowout-proof stem design for reliable shut-off over 50,000+ operating cycles.',
    price: null as number | null,
    specs: [
      'Sizes: DN15 / DN20 / DN25 / DN32 / DN40 / DN50',
      'Pressure rating: PN25 | Temperature range: -20°C to 120°C',
      'Material: Lead-free brass CW617N (DZR dezincification-resistant)',
      'End connections: BSP (ISO 228) or NPT on request',
    ],
  },
  {
    sku: 'MDS-12P',
    name: 'Manifold Distribution Systems',
    category: 'heating',
    img: 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?w=600&q=80',
    alt: 'Stainless steel heating manifold with flow meters',
    description: 'Pre-assembled SS304 stainless steel manifolds for underfloor and multi-zone heating distribution. Each circuit has an integrated flow meter and actuator port for zone-valve control. Supplied with pressure/temperature gauge and auto air vent.',
    price: null as number | null,
    specs: [
      'Circuit count: 2 to 12 per manifold assembly',
      'Body material: SS304 stainless steel, 1" bore',
      'Integrated rotameter flow meters: 1–5 L/min per circuit',
      'Actuator ports: 24 V NC/NO, M30×1.5 thread | Connections: 1" euroconus',
    ],
  },
  {
    sku: 'PFC-PPR-25',
    name: 'Pipe Fittings & Connectors',
    category: 'valves',
    img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80',
    alt: 'Assorted pipe fittings elbows tees couplings',
    description: 'Comprehensive range of PPR, brass, and bronze compression fittings for heating and plumbing installations. All fittings are 100% pressure-tested at the factory and certified to international standards. Private-label and custom-dimension orders accepted.',
    price: null as number | null,
    specs: [
      'Types: 90° Elbows, Equal Tees, Reducers, Couplings, End caps, Unions',
      'Materials available: PPR, Lead-free brass, Bronze',
      'Standard compliance: ISO 15874, EN 1254-1/2/3',
      'MOQ: 500 pcs per SKU | Custom dimensions and labelling accepted',
    ],
  },
];

/* ── Supabase product shape ── */
interface SupabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number | null;
  sku: string | null;
  category: string | null;
  images: string[] | null;
  stock: number | null;
}

/* ── Unified display product shape ── */
interface DisplayProduct {
  sku: string;
  name: string;
  category: string;
  img: string;
  alt: string;
  description: string;
  price: number | null;
  specs: string[];
}

/* ── Category counts helper ── */
type Category = 'all' | 'radiators' | 'heating' | 'valves' | 'oem';

const filterTabs: { key: Category; label: string }[] = [
  { key: 'all', label: 'All Products' },
  { key: 'radiators', label: 'Radiators' },
  { key: 'heating', label: 'Heating Systems' },
  { key: 'valves', label: 'Valves & Fittings' },
  { key: 'oem', label: 'Custom OEM' },
];

function getCategoryCounts(products: DisplayProduct[]): Record<Category, number> {
  return {
    all: products.length,
    radiators: products.filter((p) => p.category === 'radiators').length,
    heating: products.filter((p) => p.category === 'heating').length,
    valves: products.filter((p) => p.category === 'valves').length,
    oem: 0,
  };
}

/* ── Loading skeleton card ── */
function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 220,
          backgroundColor: '#e5e7eb',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 10, width: '40%', backgroundColor: '#e5e7eb', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 16, width: '75%', backgroundColor: '#e5e7eb', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 12, backgroundColor: '#e5e7eb', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 12, width: '85%', backgroundColor: '#e5e7eb', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 12, width: '60%', backgroundColor: '#e5e7eb', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 36, width: 120, backgroundColor: '#e5e7eb', borderRadius: 4, marginTop: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch from Supabase on mount ── */
  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabase = createClientComponentClient();

        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('slug', 'whitesourcing')
          .single();

        if (company) {
          const { data: products } = await supabase
            .from('products')
            .select('id, name, description, price, sku, category, images, stock')
            .eq('company_id', company.id)
            .eq('is_published', true)
            .order('created_at', { ascending: false });

          if (products && products.length > 0) {
            const mapped: DisplayProduct[] = (products as SupabaseProduct[]).map((p) => ({
              sku: p.sku ?? '',
              name: p.name,
              category: p.category ?? 'radiators',
              img: p.images && p.images.length > 0
                ? p.images[0]
                : '/shuilida-valve.webp',
              alt: p.name,
              description: p.description,
              price: p.price,
              specs: [],
            }));
            setDisplayProducts(mapped);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fall through to static fallback
      }
      // Fallback to static data
      setDisplayProducts(STATIC_PRODUCTS);
      setLoading(false);
    }

    fetchProducts();
  }, []);

  /* ── Scroll-triggered fade-in animations ── */
  useEffect(() => {
    if (loading) return;
    const els = document.querySelectorAll('[data-animate]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('shd-animate'), i * 80);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading, activeFilter]);

  const categoryCounts = getCategoryCounts(displayProducts);

  const filtered =
    activeFilter === 'all'
      ? displayProducts
      : activeFilter === 'oem'
      ? []
      : displayProducts.filter((p) => p.category === activeFilter);

  return (
    <div className="shd-root" style={{ colorScheme: 'light', color: BLACK }}>

      {/* ── Animation styles ── */}
      <style suppressHydrationWarning>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .shd-animate {
          opacity: 0;
          animation: fadeInUp 0.55s ease forwards;
        }
      `}</style>

      {/* ══════════════════════════════════════
          SECTION 1 — HERO BANNER
      ══════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: NAVY,
          position: 'relative',
          overflow: 'hidden',
          padding: '72px 40px 80px',
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="shd-grid-bg"
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />
        {/* Slight vignette at right edge */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'radial-gradient(ellipse at 100% 50%, rgba(14,26,56,0.55) 0%, transparent 60%)',
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 32,
              fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <Link
              href="/site/whitesourcing"
              style={{
                color: 'rgba(255,255,255,0.65)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)')}
            >
              Home
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>›</span>
            <span style={{ color: '#fff' }}>Products</span>
          </nav>

          {/* Title block */}
          <div style={{ maxWidth: 720 }}>
            <h1
              style={{
                fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
                fontSize: 'clamp(32px, 5vw, 54px)',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                marginBottom: 20,
                textWrap: 'balance',
              }}
            >
              Our Product Catalog
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.78)',
                fontSize: 'clamp(15px, 2vw, 18px)',
                lineHeight: 1.65,
                maxWidth: '62ch',
                marginBottom: 40,
              }}
            >
              350+ SKUs across 8 product lines — ISO 9001 certified, CE marked, exported to 40+ countries. Every product pressure-tested before shipment. FOB Qingdao or Shanghai, 15–25 day standard lead time.
            </p>

            {/* Quick stats row */}
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
              {[
                { val: '350+', sub: 'Active SKUs' },
                { val: '8', sub: 'Product Lines' },
                { val: '40+', sub: 'Export Countries' },
                { val: '15–25d', sub: 'Lead Time' },
              ].map((s) => (
                <div key={s.sub} data-animate>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: 26,
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.55)',
                      fontWeight: 500,
                      marginTop: 5,
                    }}
                  >
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — STICKY FILTER BAR
      ══════════════════════════════════════ */}
      <div
        style={{
          position: 'sticky',
          top: 68,
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          zIndex: 40,
          padding: '0 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            overflowX: 'auto',
            padding: '14px 0',
            scrollbarWidth: 'none',
          }}
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`shd-filter-btn ${activeFilter === tab.key ? 'active' : ''}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
            >
              {tab.label}
              {tab.key !== 'oem' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    fontSize: 11,
                    fontWeight: 700,
                    backgroundColor: activeFilter === tab.key ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                    color: activeFilter === tab.key ? '#fff' : '#6b7280',
                  }}
                >
                  {categoryCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION 3 — PRODUCT GRID
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: STEEL, padding: '64px 40px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* OEM placeholder (when OEM filter active) */}
          {activeFilter === 'oem' && (
            <div
              style={{
                textAlign: 'center',
                padding: '80px 24px',
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, color: NAVY }}>
                <Factory size={48} />
              </div>
              <h2
                data-animate
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: 26,
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: 12,
                }}
              >
                Custom OEM Products
              </h2>
              <p style={{ color: '#6b7280', fontSize: 16, lineHeight: 1.6, maxWidth: '52ch', margin: '0 auto 32px' }}>
                All SHUILIDA product lines are available for OEM manufacture under your brand. Scroll down to the OEM section for full details, or contact us directly.
              </p>
              <Link
                href="/site/whitesourcing/contact"
                style={{
                  backgroundColor: NAVY,
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: 2,
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Request OEM Quote →
              </Link>
            </div>
          )}

          {/* Loading skeletons */}
          {activeFilter !== 'oem' && loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" style={{ gap: 24 }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* Product cards */}
          {activeFilter !== 'oem' && !loading && (
            <>
              <p
                style={{
                  fontSize: 13,
                  color: '#9ca3af',
                  fontWeight: 500,
                  marginBottom: 28,
                }}
              >
                Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
                {activeFilter !== 'all' ? ` in ${BADGE[activeFilter as keyof typeof BADGE]?.label ?? activeFilter}` : ''}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" style={{ gap: 24 }}>
                {filtered.map((product) => {
                  const badge = BADGE[product.category] ?? { bg: '#F3F4F6', color: '#374151', label: product.category };
                  const descTruncated =
                    product.description && product.description.length > 120
                      ? product.description.slice(0, 120) + '…'
                      : product.description;
                  return (
                    <div
                      key={product.sku || product.name}
                      data-animate
                      className="shd-product-card"
                      style={{ borderRadius: 4, display: 'flex', flexDirection: 'column' }}
                    >
                      {/* Image */}
                      <div
                        style={{
                          height: 220,
                          overflow: 'hidden',
                          backgroundColor: '#f9fafb',
                          position: 'relative',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={product.img}
                          alt={product.alt}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        {/* Category badge overlay */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            backgroundColor: badge.bg,
                            color: badge.color,
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: 11,
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {badge.label}
                        </div>
                      </div>

                      {/* Card body */}
                      <div
                        style={{
                          padding: '20px 22px 24px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                        }}
                      >
                        {/* SKU */}
                        {product.sku && (
                          <div
                            className="shd-mono"
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 11,
                              color: '#9ca3af',
                              marginBottom: 7,
                              letterSpacing: '0.05em',
                            }}
                          >
                            {product.sku}
                          </div>
                        )}

                        {/* Name */}
                        <h3
                          style={{
                            fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
                            fontSize: 17,
                            fontWeight: 700,
                            color: BLACK,
                            marginBottom: 10,
                            lineHeight: 1.25,
                          }}
                        >
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p
                          style={{
                            fontSize: 13,
                            color: '#4b5563',
                            lineHeight: 1.6,
                            marginBottom: product.specs && product.specs.length > 0 ? 16 : 0,
                          }}
                        >
                          {descTruncated}
                        </p>

                        {/* Price */}
                        {product.price !== null && (
                          <div
                            style={{
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              fontSize: 15,
                              fontWeight: 700,
                              color: NAVY,
                              marginBottom: 12,
                            }}
                          >
                            ${Number(product.price).toFixed(2)}
                          </div>
                        )}

                        {/* Specs list (static fallback only) */}
                        {product.specs && product.specs.length > 0 && (
                          <ul
                            style={{
                              listStyle: 'none',
                              padding: 0,
                              margin: '0 0 20px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6,
                            }}
                          >
                            {product.specs.map((spec, i) => (
                              <li
                                key={i}
                                style={{
                                  fontSize: 12,
                                  color: '#374151',
                                  lineHeight: 1.5,
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 8,
                                }}
                              >
                                <span
                                  style={{
                                    flexShrink: 0,
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    backgroundColor: NAVY,
                                    marginTop: 6,
                                    display: 'inline-block',
                                  }}
                                />
                                {spec}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Actions */}
                        <div
                          style={{
                            marginTop: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            paddingTop: 16,
                            borderTop: '1px solid #f3f4f6',
                          }}
                        >
                          <Link
                            href="/site/whitesourcing/contact"
                            style={{
                              backgroundColor: RED,
                              color: '#fff',
                              padding: '10px 18px',
                              borderRadius: 2,
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              fontSize: 13,
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              flexShrink: 0,
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#c01c14')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = RED)}
                          >
                            Request Quote
                          </Link>
                          <Link
                            href="/site/whitesourcing/contact"
                            style={{
                              color: NAVY,
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              fontSize: 13,
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              opacity: 0.9,
                            }}
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — OEM / CUSTOM
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: '88px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2
              data-animate
              style={{
                fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
                fontSize: 'clamp(26px, 4vw, 40px)',
                fontWeight: 700,
                color: BLACK,
                marginBottom: 14,
                letterSpacing: '-0.022em',
                lineHeight: 1.1,
                textWrap: 'balance',
              }}
            >
              Custom OEM Manufacturing
            </h2>
            <p
              style={{
                color: '#4b5563',
                fontSize: 16,
                lineHeight: 1.65,
                maxWidth: '58ch',
                margin: '0 auto',
              }}
            >
              Every product line in our catalog is available for private-label or fully custom manufacture. We work with distributors, wholesalers, and property developers to deliver branded, specification-compliant products with a minimum order of 500 units.
            </p>
          </div>

          {/* 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 32, marginBottom: 52 }}>
            {[
              {
                icon: <Star size={36} color={NAVY} />,
                title: 'Custom Branding',
                items: [
                  'Your logo laser-engraved, silk-screened, or cast into the product body',
                  'Custom RAL/NCS colour powder coat on radiators and manifolds',
                  'Private-label packaging with your brand name and barcode',
                  'Custom technical datasheets and CE declaration of conformity under your brand',
                ],
              },
              {
                icon: <Wrench size={36} color={NAVY} />,
                title: 'Custom Specifications',
                items: [
                  'Non-standard heights, widths, and section counts on radiators',
                  'Bespoke pipe diameters and wall thicknesses for PPR systems',
                  'Custom manifold circuit counts (up to 16 circuits) with client-specified accessories',
                  'Modified thread standards (BSP, NPT, G-thread) and end-connection types',
                ],
              },
              {
                icon: <Package size={36} color={NAVY} />,
                title: 'Custom Packaging',
                items: [
                  'Full outer carton design and print with your artwork and text',
                  'Palletisation to your warehouse specification (EURO/UK/US pallet)',
                  'Individual polybag or foam inner pack with your label',
                  'Retail-ready shelf-ready unit packaging for distributor networks',
                ],
              },
            ].map((col) => (
              <div
                key={col.title}
                data-animate
                style={{
                  backgroundColor: STEEL,
                  border: '1px solid #e5e7eb',
                  borderRadius: 4,
                  padding: '36px 32px',
                }}
              >
                <div style={{ marginBottom: 16 }}>{col.icon}</div>
                <h3
                  style={{
                    fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
                    fontSize: 19,
                    fontWeight: 700,
                    color: BLACK,
                    marginBottom: 18,
                  }}
                >
                  {col.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.items.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: 14,
                        color: '#374151',
                        lineHeight: 1.55,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: NAVY,
                          color: '#fff',
                          fontSize: 9,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 2,
                        }}
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* OEM CTA */}
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/site/whitesourcing/contact"
              style={{
                backgroundColor: NAVY,
                color: '#fff',
                padding: '15px 32px',
                borderRadius: 2,
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(27,62,132,0.3)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#142f66')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = NAVY)}
            >
              Request OEM Quote →
            </Link>
            <p style={{ marginTop: 14, fontSize: 13, color: '#9ca3af' }}>
              Tooling and samples within 15 working days. MOQ from 500 units.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5 — WHY CHOOSE OUR PRODUCTS
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: STEEL, padding: '80px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2
              data-animate
              style={{
                fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
                fontSize: 'clamp(24px, 3.5vw, 36px)',
                fontWeight: 700,
                color: BLACK,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                textWrap: 'balance',
              }}
            >
              Built to Ship, Certified to Comply
            </h2>
          </div>

          {/* 4 stat tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4" style={{ gap: 20 }}>
            {[
              {
                icon: <CheckCircle2 size={32} color={NAVY} />,
                value: '100%',
                label: 'Pressure Tested',
                desc: 'Every unit hydro-tested to 1.5× rated working pressure before leaving the factory floor.',
              },
              {
                icon: <ShieldCheck size={32} color={NAVY} />,
                value: 'ISO 9001',
                label: 'Quality Certified',
                desc: 'Third-party audited quality management system covering raw materials through final dispatch.',
              },
              {
                icon: <Factory size={32} color={NAVY} />,
                value: 'CE',
                label: 'CE Marked',
                desc: 'Steel panel radiators, aluminum radiators, and brass valves carry full CE conformity declarations.',
              },
              {
                icon: <Truck size={32} color={NAVY} />,
                value: '15–25d',
                label: 'Standard Lead Time',
                desc: 'FOB Qingdao or Shanghai, full export documentation included with every shipment.',
              },
            ].map((tile) => (
              <div
                key={tile.label}
                data-animate
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 4,
                  padding: '32px 28px',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{tile.icon}</div>
                <div
                  style={{
                    fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
                    fontSize: 30,
                    fontWeight: 700,
                    color: NAVY,
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {tile.value}
                </div>
                <div
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    color: BLACK,
                    marginBottom: 10,
                    letterSpacing: '0.01em',
                  }}
                >
                  {tile.label}
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>
                  {tile.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6 — CATALOG CTA BANNER
      ══════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: NAVY,
          position: 'relative',
          overflow: 'hidden',
          padding: '88px 40px',
          textAlign: 'center',
        }}
      >
        {/* Grid overlay */}
        <div
          className="shd-grid-bg"
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />

        <div
          style={{
            maxWidth: 680,
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px',
              color: '#fff',
            }}
          >
            <Clock size={28} />
          </div>

          <h2
            data-animate
            style={{
              fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
              fontSize: 'clamp(24px, 4vw, 38px)',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.022em',
              lineHeight: 1.12,
              marginBottom: 16,
              textWrap: 'balance',
            }}
          >
            Download Our Full Product Catalog (PDF)
          </h2>

          <p
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 16,
              lineHeight: 1.65,
              marginBottom: 36,
              maxWidth: '52ch',
              margin: '0 auto 36px',
            }}
          >
            8 product lines, 350+ SKUs, full technical specifications, dimensional drawings, and certifications — compiled for importers and HVAC distributors.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 24,
            }}
          >
            <Link
              href="/site/whitesourcing/contact"
              style={{
                backgroundColor: RED,
                color: '#fff',
                padding: '14px 28px',
                borderRadius: 2,
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#c01c14')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = RED)}
            >
              Get a Quote Instead →
            </Link>
            <span
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 13,
              }}
            >
              or
            </span>
            <a
              href="mailto:sales@shuilida-hvac.com?subject=Product Catalog Request"
              style={{
                color: '#fff',
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.4)',
                paddingBottom: 2,
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderBottomColor = '#fff')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'rgba(255,255,255,0.4)')}
            >
              Request catalog by email
            </a>
          </div>

          <p
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.45)',
              fontStyle: 'italic',
            }}
          >
            Catalog available upon request via email — sent within one business day.
          </p>
        </div>
      </section>

    </div>
  );
}
