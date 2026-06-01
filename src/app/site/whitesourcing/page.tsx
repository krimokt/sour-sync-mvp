'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Factory, Wrench, CheckCircle2, Globe, MapPin, Phone, Mail, MessageCircle, Ship, Award, Clock, Package } from 'lucide-react';

/* ─── Reusable responsive certificate carousel ─── */
function CertCarousel({ images, slide, setSlide, navy }: {
  images: string[];
  slide: number;
  setSlide: (fn: (s: number) => number) => void;
  navy: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [vpWidth, setVpWidth] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setVpWidth(entry.contentRect.width));
    ro.observe(el);
    setVpWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // Responsive: 1 card on mobile, 2 on tablet, 4 on desktop
  const visible  = vpWidth < 480 ? 1 : vpWidth < 768 ? 2 : 4;
  const GAP      = vpWidth < 480 ? 10 : 16;
  const CARD_W   = vpWidth > 0 ? Math.floor((vpWidth - GAP * (visible - 1)) / visible) : 220;
  const trackW   = images.length * (CARD_W + GAP);
  const offset   = slide * (CARD_W + GAP);
  const maxSlide = images.length - 1;
  const btnSize  = vpWidth < 480 ? 36 : 44;

  const prev = () => setSlide(s => Math.max(0, s - 1));
  const next = () => setSlide(s => Math.min(maxSlide, s + 1));

  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const dx = touchX - e.changedTouches[0].clientX;
    if (dx >  40) next();
    if (dx < -40) prev();
    setTouchX(null);
  };

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    flexShrink: 0, width: btnSize, height: btnSize, borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.2)',
    background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: disabled ? 'rgba(255,255,255,0.25)' : '#fff',
    fontSize: vpWidth < 480 ? 20 : 26,
    transition: 'background 0.2s',
    flexShrink: 0,
  } as React.CSSProperties);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: vpWidth < 480 ? 8 : 12 }}>
        <button onClick={prev} disabled={slide === 0} style={btnStyle(slide === 0)} aria-label="Previous">‹</button>

        {/* Viewport */}
        <div
          ref={viewportRef}
          style={{ flex: 1, overflow: 'hidden', borderRadius: 6 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Track */}
          <div style={{
            display: 'flex', gap: GAP,
            width: vpWidth > 0 ? trackW : 'auto',
            transform: `translateX(-${offset}px)`,
            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
            willChange: 'transform',
            padding: '10px 2px',
          }}>
            {images.map((src, i) => {
              const isActive = i === slide;
              const inView   = i >= slide && i < slide + visible;
              return (
                <div
                  key={i}
                  onClick={() => setSlide(() => i)}
                  style={{
                    flexShrink: 0, width: vpWidth > 0 ? CARD_W : 220,
                    borderRadius: 6, overflow: 'hidden', background: '#fff',
                    cursor: 'pointer',
                    opacity: isActive ? 1 : inView ? 0.65 : 0.25,
                    transform: isActive ? 'scale(1.03)' : 'scale(1)',
                    transition: 'opacity 0.3s, transform 0.3s, box-shadow 0.3s',
                    boxShadow: isActive
                      ? `0 0 0 2px ${navy}, 0 12px 40px rgba(0,0,0,0.55), 0 0 24px rgba(27,62,132,0.3)`
                      : '0 4px 14px rgba(0,0,0,0.3)',
                  }}
                >
                  <img
                    src={src}
                    alt={`Certificate ${i + 1}`}
                    style={{
                      width: '100%',
                      height: vpWidth < 480 ? 260 : 300,
                      objectFit: 'contain',
                      display: 'block',
                      padding: vpWidth < 480 ? 8 : 12,
                    }}
                    draggable={false}
                  />
                  <div style={{
                    textAlign: 'center', padding: '6px 0 10px',
                    fontFamily: 'IBM Plex Sans', fontSize: 10, fontWeight: 700,
                    color: isActive ? navy : '#6b7280', letterSpacing: '0.06em',
                  }}>
                    {i + 1} / {images.length}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={next} disabled={slide === maxSlide} style={btnStyle(slide === maxSlide)} aria-label="Next">›</button>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(() => i)}
            aria-label={`Certificate ${i + 1}`}
            style={{
              width: i === slide ? 22 : 8, height: 8, borderRadius: 4,
              border: 'none', cursor: 'pointer', padding: 0,
              background: i === slide ? '#60a5fa' : 'rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
              minWidth: 8,
            }}
          />
        ))}
      </div>
    </div>
  );
}
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

const CERT_IMAGES = [
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
];

/* ── Products ── */
const products = [
  {
    sku: 'SP-RAD-600',
    name: 'Steel Panel Radiators',
    desc: 'Compact high-efficiency wall-mounted heating panels. Single/double/triple panel, 300–900 mm height.',
    category: 'radiators',
    featured: true,
    img: '/shuilida-valve.png',
    alt: 'Steel panel radiator mounted on wall',
  },
  {
    sku: 'CI-COL-500',
    name: 'Cast Iron Column Radiators',
    desc: 'Traditional cast iron with superior heat retention. Corrosion-resistant, 50+ year lifespan.',
    category: 'radiators',
    featured: false,
    img: 'https://images.unsplash.com/photo-1581922819941-6ab31ab79afc?w=600&q=80',
    alt: 'Cast iron column radiator',
  },
  {
    sku: 'AL-SEC-80',
    name: 'Aluminum Section Radiators',
    desc: 'Lightweight high-output aluminum radiators. Rapid heat response, customizable section count.',
    category: 'radiators',
    featured: false,
    img: 'https://images.unsplash.com/photo-1565108993-b8be3dce1a49?w=600&q=80',
    alt: 'Aluminum section radiator',
  },
  {
    sku: 'UFH-SYS-20',
    name: 'Underfloor Heating System',
    desc: 'Complete PEX-A pipe underfloor heating kit with manifold. Compatible with all floor types.',
    category: 'heating',
    featured: false,
    img: 'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?w=600&q=80',
    alt: 'Underfloor heating installation',
  },
  {
    sku: 'PPR-HW-32',
    name: 'PPR Hot Water Pipes',
    desc: 'High-temperature resistant polypropylene pipes for hot water circulation. Rated 95°C / 1.6 MPa.',
    category: 'valves',
    featured: false,
    img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
    alt: 'PPR hot water pipes',
  },
  {
    sku: 'BBV-DN25',
    name: 'Brass Ball Valves',
    desc: 'Lead-free brass ball valves for heating circuit isolation. Full-bore design, rated PN25.',
    category: 'valves',
    featured: false,
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    alt: 'Brass ball valve industrial',
  },
  {
    sku: 'MDS-12P',
    name: 'Manifold Distribution Systems',
    desc: 'Stainless steel heating manifolds, 2–12 circuits. Integrated flow meters and actuator ports.',
    category: 'heating',
    featured: false,
    img: 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?w=600&q=80',
    alt: 'Heating manifold distribution system',
  },
  {
    sku: 'PFC-PPR-25',
    name: 'Pipe Fittings & Connectors',
    desc: 'Full range of PPR/brass compression fittings: elbows, tees, reducers, couplings.',
    category: 'valves',
    featured: false,
    img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80',
    alt: 'Pipe fittings and connectors',
  },
];

const regions = [
  {
    name: 'Eastern Europe',
    flagImg: <img src="https://flagcdn.com/24x18/pl.png" width="24" height="18" alt="Poland" style={{borderRadius:2}} />,
    markets: 'Poland, Russia, Ukraine, Romania, Czech Republic, Slovakia',
    desc: 'Primary export market for steel panel and cast iron radiators.',
  },
  {
    name: 'Middle East',
    flagImg: <img src="https://flagcdn.com/24x18/ae.png" width="24" height="18" alt="UAE" style={{borderRadius:2}} />,
    markets: 'UAE, Saudi Arabia, Egypt, Turkey, Iraq, Jordan',
    desc: 'Growing demand for underfloor heating and manifold systems.',
  },
  {
    name: 'Southeast Asia',
    flagImg: <img src="https://flagcdn.com/24x18/vn.png" width="24" height="18" alt="Vietnam" style={{borderRadius:2}} />,
    markets: 'Vietnam, Malaysia, Indonesia, Thailand, Philippines',
    desc: 'PPR pipes and fittings for fast-growing construction sectors.',
  },
  {
    name: 'Domestic China',
    flagImg: <img src="https://flagcdn.com/24x18/cn.png" width="24" height="18" alt="China" style={{borderRadius:2}} />,
    markets: 'Beijing, Shanghai, Shandong, Hebei, Henan, Liaoning',
    desc: 'Direct supply to property developers and HVAC contractors.',
  },
];

const pillars = [
  {
    icon: <Factory size={22} />,
    title: 'One-Stop Solution',
    body: 'Design, manufacturing, quality control, and export logistics handled from a single factory in Shangqiu, Henan. One supplier, zero coordination overhead.',
  },
  {
    icon: <Wrench size={22} />,
    title: 'OEM / ODM Service',
    body: 'Full customization with your brand, specifications, and packaging. MOQ 500 units. Tooling and samples within 15 working days.',
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: 'Quality Assurance',
    body: 'ISO 9001:2015 certified processes throughout production. Every product pressure-tested before shipment. CE marked for European market entry.',
  },
];

type FilterTab = 'all' | 'radiators' | 'heating' | 'valves';

export default function ShuilidaPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [formSent, setFormSent] = useState(false);
  const [dbProducts, setDbProducts] = useState<Array<{
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    sku: string | null;
    category: string | null;
    images: string[];
    stock: number;
  }>>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [certSlide, setCertSlide] = useState(0);

  // Use Supabase products if loaded, fall back to static
  const sourceProducts = dbProducts.length > 0
    ? dbProducts.map(p => ({
        sku: p.sku ?? p.id.slice(0, 8),
        name: p.name,
        desc: (p.description ?? '').slice(0, 120),
        category: (p.category ?? 'valves').toLowerCase().replace(/\s+/g, '-').includes('radiator') ? 'radiators'
          : (p.category ?? '').toLowerCase().includes('heat') || (p.category ?? '').toLowerCase().includes('floor') || (p.category ?? '').toLowerCase().includes('pipe') ? 'heating'
          : 'valves',
        featured: false,
        img: p.images?.[0] ?? '/shuilida-valve.png',
        alt: p.name,
        price: p.price,
      }))
    : products;

  const filtered =
    activeFilter === 'all'
      ? sourceProducts
      : sourceProducts.filter((p) => p.category === activeFilter);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  useEffect(() => {
    const els = document.querySelectorAll('.shd-fade:not(.visible)');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [productsLoading, activeFilter]);

  useEffect(() => {
    const supabase = createClientComponentClient();
    (async () => {
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', 'whitesourcing')
        .single();
      if (company) {
        const { data } = await supabase
          .from('products')
          .select('id, name, description, price, sku, category, images, stock')
          .eq('company_id', company.id)
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        if (data && data.length > 0) setDbProducts(data);
      }
      setProductsLoading(false);
    })();
  }, []);

  return (
    <div className="shd-root" style={{ colorScheme: 'light', color: BLACK }}>
      <style suppressHydrationWarning>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .shd-fade { opacity: 0; }
        .shd-fade.visible {
          animation: fadeInUp 0.6s ease forwards;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* ══════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════ */}
      <section
        id="hero"
        style={{
          position: 'relative',
          minHeight: 620,
          display: 'flex',
          overflow: 'hidden',
          backgroundColor: BLACK,
        }}
      >
        {/* Grid overlay */}
        <div
          className="shd-grid-bg"
          style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.8 }}
        />
        {/* Gradient fade */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: `linear-gradient(to right, ${BLACK} 40%, rgba(15,17,21,0.75) 70%, rgba(15,17,21,0.3) 100%)`,
          }}
        />
        {/* Background factory image */}
        <img
          src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80"
          alt="Industrial factory production line"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            opacity: 0.3,
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '80px 40px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            position: 'relative',
            zIndex: 2,
            gap: 48,
          }}
          className="flex-col md:flex-row px-4 md:px-10"
        >
          {/* Left: copy */}
          <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 560 }}>
            {/* Label */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(226,35,26,0.15)',
                border: `1px solid rgba(226,35,26,0.4)`,
                color: '#ff6b63',
                padding: '6px 14px',
                borderRadius: 2,
                fontSize: 12,
                fontFamily: 'IBM Plex Sans',
                fontWeight: 600,
                letterSpacing: '0.08em',
                marginBottom: 24,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: RED, display: 'inline-block' }} />
              ISO 9001:2015 Certified · CE Marked
            </div>

            <h1
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(32px, 5vw, 52px)',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: 20,
                textWrap: 'balance',
              }}
            >
              Premium Heating &amp; Plumbing Solutions
            </h1>

            <p
              style={{
                color: '#d1d5db',
                fontSize: 17,
                lineHeight: 1.65,
                marginBottom: 36,
                maxWidth: '58ch',
              }}
            >
              Shuilida Factory has supplied heating and plumbing equipment to contractors and distributors across 40+ countries since 2003. Steel panel radiators, underfloor heating systems, brass valves, and PPR pipes — all manufactured and exported from our facility in Shangqiu, Henan Province.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link
                href="/site/whitesourcing/products"
                style={{
                  backgroundColor: NAVY,
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: 2,
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(27,62,132,0.4)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#142f66')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = NAVY)}
              >
                Explore Products <span>→</span>
              </Link>
              <Link
                href="/site/whitesourcing/about"
                style={{
                  backgroundColor: 'transparent',
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.08)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent')}
              >
                Company Profile
              </Link>
            </div>

            {/* Trust bar */}
            <div
              style={{
                marginTop: 48,
                display: 'flex',
                gap: 32,
                flexWrap: 'wrap',
              }}
            >
              {[
                { val: '20+', label: 'Years' },
                { val: '350+', label: 'SKUs' },
                { val: '40+', label: 'Countries' },
                { val: 'FOB', label: 'Qingdao / Shanghai' },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 26,
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1,
                    }}
                  >
                    {s.val}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, fontWeight: 500 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: product image */}
          <div
            className="hidden md:flex"
            style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <img
              src="/shuilida-valve.png"
              alt="Steel panel radiator — SHUILIDA flagship product"
              style={{
                maxHeight: 460,
                maxWidth: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 50px rgba(27,62,132,0.4))',
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — STATS BAR
      ══════════════════════════════════════ */}
      <div
        style={{
          backgroundColor: NAVY,
          color: '#fff',
          padding: '48px 40px',
          position: 'relative',
          zIndex: 10,
          borderTop: '3px solid #142f66',
          borderBottom: '1px solid #142f66',
        }}
      >
        <div
          style={{ maxWidth: 1280, margin: '0 auto' }}
        >
          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ gap: 0 }}
          >
            {[
              { val: '20+', label: 'Years Experience' },
              { val: '350+', label: 'Product SKUs' },
              { val: '40+', label: 'Countries Exported To' },
              { val: 'ISO 9001', label: 'Certified Quality System' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="shd-fade"
                style={{
                  textAlign: 'center',
                  padding: '16px 24px',
                  borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 'clamp(28px, 4vw, 40px)',
                    fontWeight: 700,
                    marginBottom: 6,
                    color: '#fff',
                  }}
                >
                  {stat.val}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: 'IBM Plex Sans',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    color: '#93c5fd',
                    textTransform: 'uppercase',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION 3 — PRODUCT CATALOG
      ══════════════════════════════════════ */}
      <section id="products" style={{ backgroundColor: STEEL, padding: '96px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Header row */}
          <div
            className="flex flex-col md:flex-row"
            style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, gap: 24 }}
          >
            <div>
              <h2
                className="shd-fade"
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: 12,
                  letterSpacing: '-0.02em',
                }}
              >
                Product Catalog
              </h2>
              <p style={{ color: '#4b5563', fontSize: 16, lineHeight: 1.6, maxWidth: '60ch' }}>
                350+ heating and plumbing SKUs. All products pressure-tested, CE marked where applicable, and ready for FOB shipment from Qingdao or Shanghai.
              </p>
            </div>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All Products' },
                { key: 'radiators', label: 'Radiators' },
                { key: 'heating', label: 'Heating Systems' },
                { key: 'valves', label: 'Valves & Fittings' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key as FilterTab)}
                  className={`shd-filter-btn ${activeFilter === tab.key ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{ gap: 24 }}
          >
            {productsLoading ? (
              // Loading skeleton
              [0,1,2,3].map(i => (
                <div key={i} style={{ borderRadius: 2, border: '1px solid #e5e7eb', overflow: 'hidden', background: '#fff' }}>
                  <div style={{ height: 220, background: 'linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                  <div style={{ padding: 20 }}>
                    <div style={{ height: 10, width: '40%', background: '#e5e7eb', borderRadius: 2, marginBottom: 10 }} />
                    <div style={{ height: 16, width: '80%', background: '#e5e7eb', borderRadius: 2, marginBottom: 8 }} />
                    <div style={{ height: 12, width: '100%', background: '#f3f4f6', borderRadius: 2 }} />
                  </div>
                </div>
              ))
            ) : filtered.map((product) => (
              <div
                key={product.sku}
                className={`shd-product-card shd-fade ${product.featured ? 'featured' : ''}`}
                style={{ borderRadius: 2, position: 'relative' }}
              >
                {product.featured && (
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    backgroundColor: NAVY, color: '#fff',
                    padding: '4px 10px', fontSize: 11,
                    fontFamily: 'IBM Plex Sans', fontWeight: 700,
                    letterSpacing: '0.06em', borderRadius: 2, zIndex: 5,
                  }}>
                    FEATURED
                  </div>
                )}
                <div style={{ height: 220, overflow: 'hidden', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={product.img}
                    alt={product.alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '20px 20px 24px', borderTop: '1px solid #f3f4f6' }}>
                  <div className="shd-mono" style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, letterSpacing: '0.04em' }}>
                    {product.sku}
                  </div>
                  <h3 style={{ fontFamily: 'IBM Plex Sans', fontSize: 16, fontWeight: 700, color: BLACK, marginBottom: 8, lineHeight: 1.3 }}>
                    {product.name}
                  </h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55, marginBottom: 14 }}>
                    {product.desc}
                  </p>
                  {'price' in product && product.price != null && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 10, fontFamily: 'IBM Plex Sans' }}>
                      ${Number(product.price).toFixed(2)}
                    </div>
                  )}
                  <Link
                    href="/site/whitesourcing/products"
                    style={{ color: NAVY, fontFamily: 'IBM Plex Sans', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    View Specifications →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div style={{ marginTop: 48, textAlign: 'center' }}>
            <button
              style={{
                border: `2px solid ${BLACK}`,
                backgroundColor: 'transparent',
                color: BLACK,
                padding: '14px 32px',
                borderRadius: 2,
                fontFamily: 'IBM Plex Sans',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = BLACK;
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = BLACK;
              }}
            >
              ⬇ Download Full Catalog (PDF)
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — ABOUT
      ══════════════════════════════════════ */}
      <section id="about" style={{ backgroundColor: '#fff', padding: '96px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            className="flex flex-col lg:flex-row"
            style={{ gap: 72, alignItems: 'center' }}
          >
            {/* Left: factory image */}
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 520, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: -16,
                  left: -16,
                  width: 80,
                  height: 80,
                  backgroundColor: STEEL,
                  zIndex: 0,
                  borderRadius: 2,
                }}
              />
              <img
                src="/shuilida-valve.png"
                alt="Shuilida factory production floor, Shangqiu, Henan"
                style={{
                  width: '100%',
                  height: 460,
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  position: 'relative',
                  zIndex: 1,
                  filter: 'grayscale(20%)',
                  transition: 'filter 0.5s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'grayscale(0%)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'grayscale(20%)')}
              />
              {/* Est. badge */}
              <div
                className="hidden md:block"
                style={{
                  position: 'absolute',
                  bottom: -24,
                  right: -24,
                  backgroundColor: NAVY,
                  color: '#fff',
                  padding: '20px 24px',
                  borderRadius: 2,
                  zIndex: 10,
                  boxShadow: '0 8px 24px rgba(27,62,132,0.35)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: 'IBM Plex Sans', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                  2003
                </div>
                <div
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    marginTop: 6,
                    color: '#93c5fd',
                    textTransform: 'uppercase',
                  }}
                >
                  Established
                </div>
              </div>
            </div>

            {/* Right: copy */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: NAVY,
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                Corporate Profile
              </div>
              <div
                className="shd-fade"
                style={{ marginBottom: 24, borderRadius: 6, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
              >
                <img
                  src="/shuilida-cert.jpg"
                  alt="Shuilida ISO & CE Certifications"
                  style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 280 }}
                />
              </div>
              <p style={{ color: '#374151', fontSize: 16, lineHeight: 1.75, marginBottom: 12 }}>
                Shuilida Heating &amp; Plumbing Equipment Factory (商丘市水力达水暖器材厂) is located in the Liangyuan District Industrial Zone of Shangqiu City, Henan Province, China. Founded in 2003, we have built over two decades of manufacturing expertise in heating radiators, underfloor heating systems, PPR hot-water piping, and brass control valves.
              </p>
              <p style={{ color: '#374151', fontSize: 16, lineHeight: 1.75, marginBottom: 32 }}>
                With 15+ dedicated production lines and 350+ active product SKUs, our factory serves distributors, property developers, and HVAC contractors across Eastern Europe, the Middle East, and Southeast Asia, shipping FOB from Qingdao or Shanghai with 15–25 day lead times.
              </p>

              {/* Pillars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 40 }}>
                {pillars.map((pillar) => (
                  <div key={pillar.title} className="shd-fade" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        flexShrink: 0,
                        width: 44,
                        height: 44,
                        backgroundColor: STEEL,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: NAVY,
                        marginTop: 2,
                      }}
                    >
                      {pillar.icon}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 17,
                          fontWeight: 700,
                          color: BLACK,
                          marginBottom: 6,
                        }}
                      >
                        {pillar.title}
                      </h3>
                      <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6 }}>{pillar.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/site/whitesourcing/about"
                style={{
                  color: NAVY,
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderBottom: `2px solid ${NAVY}`,
                  paddingBottom: 2,
                }}
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5 — GLOBAL MARKETS
      ══════════════════════════════════════ */}
      <section
        id="markets"
        style={{
          backgroundColor: NAVY,
          color: '#fff',
          padding: '96px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* World map overlay */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.08 }}>
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&q=80"
            alt=""
            aria-hidden="true"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            className="flex flex-col md:flex-row"
            style={{ gap: 64 }}
          >
            {/* Left: headline + stats */}
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 340 }}>
              <h2
                className="shd-fade"
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 'clamp(26px, 3.5vw, 40px)',
                  fontWeight: 700,
                  marginBottom: 20,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                }}
              >
                Global Export Network
              </h2>
              <p style={{ color: '#bfdbfe', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
                From our factory in Shangqiu, Henan, we ship heating and plumbing equipment to distributors and contractors worldwide. Reliable supply, consistent quality, competitive FOB pricing.
              </p>
              <div
                className="grid grid-cols-2"
                style={{ gap: 24, marginBottom: 36 }}
              >
                <div className="shd-fade">
                  <div
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 36,
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    40+
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: 'IBM Plex Sans',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      color: '#93c5fd',
                      textTransform: 'uppercase',
                    }}
                  >
                    Countries
                  </div>
                </div>
                <div className="shd-fade">
                  <div
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 36,
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    200+
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: 'IBM Plex Sans',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      color: '#93c5fd',
                      textTransform: 'uppercase',
                    }}
                  >
                    Distributors
                  </div>
                </div>
              </div>
              <Link
                href="/site/whitesourcing/contact"
                style={{
                  backgroundColor: '#fff',
                  color: NAVY,
                  padding: '12px 24px',
                  borderRadius: 2,
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#fff')}
              >
                Become a Partner →
              </Link>
            </div>

            {/* Right: region cards */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2"
              style={{ flex: 1, gap: 20, alignContent: 'start' }}
            >
              {regions.map((region) => (
                <div
                  key={region.name}
                  className="shd-region-card shd-fade"
                  style={{ padding: '24px 28px', borderRadius: 2 }}
                >
                  <h3
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 18,
                      fontWeight: 700,
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <span>{region.flagImg}</span> {region.name}
                  </h3>
                  <p style={{ color: '#bfdbfe', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
                    {region.markets}
                  </p>
                  <p style={{ color: '#93c5fd', fontSize: 13, lineHeight: 1.55 }}>{region.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6 — CERTIFICATIONS
      ══════════════════════════════════════ */}
      <section id="certifications" style={{ backgroundColor: '#fff', padding: '96px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2
              className="shd-fade"
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(26px, 4vw, 40px)',
                fontWeight: 700,
                color: BLACK,
                marginBottom: 14,
                letterSpacing: '-0.02em',
              }}
            >
              Our Certifications
            </h2>
            <p style={{ color: '#6b7280', fontSize: 16, maxWidth: '55ch', margin: '0 auto', lineHeight: 1.6 }}>
              Internationally recognised quality standards that back every product leaving our facility.
            </p>
          </div>

          {/* Certificate image carousel — hero-style dark bg */}
          <div
            className="shd-fade"
            style={{
              position: 'relative',
              marginBottom: 48,
              borderRadius: 8,
              overflow: 'hidden',
              padding: '56px 40px 48px',
              background: BLACK,
            }}
          >
            {/* Grid overlay — same as hero */}
            <div
              className="shd-grid-bg"
              style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.7 }}
            />
            {/* Radial glow — navy centre */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0,
              background: `radial-gradient(ellipse 70% 60% at 50% 40%, rgba(27,62,132,0.55) 0%, transparent 70%)`,
            }} />
            {/* Top accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 3, background: `linear-gradient(to right, transparent, ${NAVY}, transparent)`, zIndex: 2,
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(27,62,132,0.35)', border: '1px solid rgba(27,62,132,0.6)',
                  borderRadius: 2, padding: '5px 14px', marginBottom: 16,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
                  <span style={{ fontFamily: 'IBM Plex Sans', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#93c5fd', textTransform: 'uppercase' }}>
                    Verified Quality
                  </span>
                </div>
                <h3 style={{
                  fontFamily: 'IBM Plex Sans', fontSize: 'clamp(22px,3vw,32px)',
                  fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0,
                }}>
                  Certificate Documents
                </h3>
                <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>
                  ISO 9001:2015 · CE Mark · SGS Audited
                </p>
              </div>

              {/* Responsive sliding carousel */}
              <CertCarousel
                images={CERT_IMAGES}
                slide={certSlide}
                setSlide={setCertSlide}
                navy={NAVY}
              />
            </div>{/* /content */}
          </div>{/* /carousel hero wrapper */}

          {/* Quality assurance badge */}
          <div
            style={{
              backgroundColor: STEEL,
              border: `1px solid #e5e7eb`,
              borderRadius: 2,
              padding: '32px 40px',
              textAlign: 'center',
              marginBottom: 48,
            }}
          >
            <div
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 16,
                fontWeight: 700,
                color: NAVY,
                letterSpacing: '0.04em',
                marginBottom: 4,
              }}
            >
              Quality Assurance — Buy With Confidence
            </div>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              Every batch ships with a full inspection report. Defect rate under 0.3% across all product lines.
            </p>
          </div>

          {/* Production stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ gap: 24, marginBottom: 48 }}
          >
            {[
              { val: '15+', label: 'Production Lines' },
              { val: '100%', label: 'Pressure Tested' },
              { val: 'MOQ 500', label: 'OEM Available' },
              { val: 'ISO 9001', label: 'Certified Process' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="shd-fade"
                style={{
                  backgroundColor: STEEL,
                  border: `1px solid #e5e7eb`,
                  borderRadius: 2,
                  padding: '24px 20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 28,
                    fontWeight: 700,
                    color: NAVY,
                    marginBottom: 6,
                  }}
                >
                  {stat.val}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: 'IBM Plex Sans',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* View All link */}
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/site/whitesourcing/certifications"
              style={{
                color: NAVY,
                fontFamily: 'IBM Plex Sans',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderBottom: `2px solid ${NAVY}`,
                paddingBottom: 2,
              }}
            >
              View All Certificates →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 7 — QUOTE CTA
      ══════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: BLACK,
          color: '#fff',
          padding: '96px 40px',
          textAlign: 'center',
          position: 'relative',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2
            className="shd-fade"
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 'clamp(26px, 4vw, 44px)',
              fontWeight: 700,
              marginBottom: 16,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textWrap: 'balance',
            }}
          >
            Ready to Source Premium Heating Equipment?
          </h2>
          <p
            style={{
              color: '#9ca3af',
              fontSize: 17,
              lineHeight: 1.65,
              marginBottom: 44,
              maxWidth: '52ch',
              margin: '0 auto 44px',
            }}
          >
            Our export team responds within 24 hours with pricing, datasheets, and sample availability. Minimum order 500 units. FOB Qingdao or Shanghai.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/site/whitesourcing/contact"
              style={{
                backgroundColor: NAVY,
                color: '#fff',
                padding: '16px 32px',
                borderRadius: 2,
                fontFamily: 'IBM Plex Sans',
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 4px 16px rgba(27,62,132,0.4)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#142f66')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = NAVY)}
            >
              Get a Quote
            </Link>
            <a
              href="https://wa.me/8613803708899"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#25D366',
                color: '#fff',
                padding: '16px 32px',
                borderRadius: 2,
                fontFamily: 'IBM Plex Sans',
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1da851')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#25D366')}
            >
              <MessageCircle size={18} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 8 — CONTACT FORM
      ══════════════════════════════════════ */}
      <section id="contact" style={{ backgroundColor: STEEL, padding: '96px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div
            className="flex flex-col lg:flex-row"
            style={{ gap: 72 }}
          >
            {/* Contact form */}
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 560 }}>
              <h2
                className="shd-fade"
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 'clamp(24px, 3.5vw, 36px)',
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: 12,
                  letterSpacing: '-0.02em',
                }}
              >
                Send an Enquiry
              </h2>
              <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
                Tell us the products you need, quantities, and destination. We will respond with pricing and a proforma invoice within one business day.
              </p>

              {formSent ? (
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #6ee7b7',
                    borderRadius: 2,
                    padding: '28px 32px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><CheckCircle2 size={32} color="#065f46" /></div>
                  <h3 style={{ fontFamily: 'IBM Plex Sans', fontSize: 18, fontWeight: 700, color: '#065f46', marginBottom: 8 }}>
                    Message Received
                  </h3>
                  <p style={{ color: '#047857', fontSize: 14, lineHeight: 1.6 }}>
                    Our export team will reply to your email within 24 hours with pricing and product details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: 6,
                        }}
                      >
                        Full Name *
                      </label>
                      <input
                        className="shd-input"
                        type="text"
                        placeholder="John Smith"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: 6,
                        }}
                      >
                        Email Address *
                      </label>
                      <input
                        className="shd-input"
                        type="email"
                        placeholder="john@company.com"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'IBM Plex Sans',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: 6,
                      }}
                    >
                      Company Name
                    </label>
                    <input
                      className="shd-input"
                      type="text"
                      placeholder="HVAC Distributors Ltd."
                      value={formState.company}
                      onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'IBM Plex Sans',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: 6,
                      }}
                    >
                      Products & Requirements *
                    </label>
                    <textarea
                      className="shd-textarea"
                      placeholder="e.g. 500 units Steel Panel Radiators SP-RAD-600 (double panel, 600mm height), destination: Warsaw, Poland. Please include FOB pricing and lead time."
                      required
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: NAVY,
                      color: '#fff',
                      padding: '14px 28px',
                      borderRadius: 2,
                      border: 'none',
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      alignSelf: 'flex-start',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#142f66')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                  >
                    Send Enquiry →
                  </button>
                </form>
              )}
            </div>

            {/* Contact info sidebar */}
            <div style={{ flex: 1, paddingTop: 8 }}>
              <h3
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 22,
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: 32,
                }}
              >
                Contact Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {[
                  {
                    icon: <Mail size={18} />,
                    label: 'Sales Email',
                    value: 'sales@shuilida-hvac.com',
                    href: 'mailto:sales@shuilida-hvac.com',
                  },
                  {
                    icon: <Phone size={18} />,
                    label: 'Phone',
                    value: '+86-370-8823-4567',
                    href: 'tel:+863708823456',
                  },
                  {
                    icon: <MessageCircle size={18} />,
                    label: 'WhatsApp',
                    value: '+86-138-0370-8899',
                    href: 'https://wa.me/8613803708899',
                  },
                  {
                    icon: <MapPin size={18} />,
                    label: 'Factory Address',
                    value: 'Industrial Zone, Liangyuan District, Shangqiu City, Henan Province, China 476000',
                    href: null,
                  },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        flexShrink: 0,
                        width: 44,
                        height: 44,
                        backgroundColor: '#fff',
                        border: `1px solid #e5e7eb`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: NAVY,
                        marginTop: 2,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#9ca3af',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          marginBottom: 4,
                        }}
                      >
                        {item.label}
                      </div>
                      {item.href ? (
                        <a
                          href={item.href}
                          style={{
                            color: NAVY,
                            fontWeight: 600,
                            fontSize: 15,
                            textDecoration: 'none',
                          }}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span style={{ color: '#374151', fontSize: 15, lineHeight: 1.5, display: 'block' }}>
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Fast delivery note */}
              <div
                style={{
                  marginTop: 40,
                  backgroundColor: '#fff',
                  border: `1px solid #e5e7eb`,
                  borderRadius: 2,
                  padding: '20px 24px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 14,
                    fontWeight: 700,
                    color: BLACK,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ color: NAVY }}><Ship size={18} /></span> Fast Delivery
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                  Standard lead time: 15–25 working days after order confirmation. FOB Qingdao or Shanghai. Full set of export documents included.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
