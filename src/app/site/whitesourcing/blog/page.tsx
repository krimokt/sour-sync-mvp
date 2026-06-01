'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, Tag, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';

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
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Technical Guide': { bg: NAVY, text: '#fff' },
  'Heating Systems': { bg: '#0e4c92', text: '#fff' },
  'Standards & Compliance': { bg: '#7c3aed', text: '#fff' },
  'Sourcing Tips': { bg: '#d97706', text: '#fff' },
  Radiators: { bg: RED, text: '#fff' },
  'Industry News': { bg: '#374151', text: '#fff' },
};

type CategoryFilter =
  | 'All'
  | 'Radiators'
  | 'Heating Systems'
  | 'Standards & Compliance'
  | 'Sourcing Tips'
  | 'Industry News';

interface Article {
  id: number;
  title: string;
  category: string;
  image: string;
  imageAlt: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: 'Underfloor Heating vs. Panel Radiators: Which is Right for Your Project?',
    category: 'Heating Systems',
    image: 'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?w=600&q=80',
    imageAlt: 'Underfloor heating pipe installation in concrete screed',
    excerpt:
      'A side-by-side comparison of UFH and panel radiators covering installation cost, heat distribution efficiency, suitability for different floor types, maintenance requirements, and total cost of ownership over 10 years. For new-build projects with a poured screed, UFH typically delivers lower running costs; for retrofits or room-by-room zoning, panel radiators remain the faster and more cost-effective solution.',
    date: 'May 28, 2026',
    readTime: '9 min read',
    author: 'SHUILIDA Technical Team',
  },
  {
    id: 2,
    title: 'Understanding CE Marking for Heating Equipment: What Importers Need to Know',
    category: 'Standards & Compliance',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
    imageAlt: 'CE marking compliance documentation for heating products',
    excerpt:
      'CE marking is mandatory for heating equipment sold in the EU. This guide explains which standards apply (EN 442 for radiators, EN 1264 for underfloor heating, EN 13828 for copper fittings), what documentation customs requires at the port of entry, and how to verify a Chinese supplier\'s CE claim beyond the label printed on the box.',
    date: 'May 15, 2026',
    readTime: '7 min read',
    author: 'Compliance & Export Team',
  },
  {
    id: 3,
    title: 'PPR Pipes vs. Copper Pipes: The Complete Technical Comparison',
    category: 'Heating Systems',
    image: 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?w=600&q=80',
    imageAlt: 'PPR pipe fittings and plumbing installation',
    excerpt:
      'Polypropylene-R pipes have largely replaced copper in new construction across Eastern Europe and Asia. We compare material properties (thermal expansion, pressure rating, corrosion resistance), installation methods (heat fusion vs. compression fittings), lifespan expectations, and cost per linear meter to help specifiers make the right choice for hot-water distribution systems.',
    date: 'May 5, 2026',
    readTime: '8 min read',
    author: 'SHUILIDA Technical Team',
  },
  {
    id: 4,
    title: 'How to Source Heating Equipment from China: A Step-by-Step Procurement Guide',
    category: 'Sourcing Tips',
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&q=80',
    imageAlt: 'Container shipping port for export logistics',
    excerpt:
      'From verifying factory certifications and requesting pre-production samples to negotiating FOB terms and arranging third-party pre-shipment inspection, this guide walks European and Middle Eastern importers through the complete procurement process for heating components from Chinese manufacturers — including the documents needed to clear customs without delays.',
    date: 'April 22, 2026',
    readTime: '11 min read',
    author: 'Export Operations Team',
  },
  {
    id: 5,
    title: 'Steel Panel Radiators: Type 11, 21, 22, 33 — What\'s the Difference?',
    category: 'Radiators',
    image: '/shuilida-valve.webp',
    imageAlt: 'Steel panel radiator installed on a wall',
    excerpt:
      'The panel type number on a steel radiator tells you everything about its heat output structure. Type 11 (single panel, single convector) through Type 33 (triple panel, triple convector) — we explain heat output differences, weight and wall-loading implications, and when to specify each type based on room volume, window area, and system flow temperature.',
    date: 'April 10, 2026',
    readTime: '6 min read',
    author: 'SHUILIDA Technical Team',
  },
  {
    id: 6,
    title: 'Brass vs. Lead-Free Brass Ball Valves: What Changed and Why It Matters',
    category: 'Standards & Compliance',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    imageAlt: 'Brass ball valves for plumbing and heating circuits',
    excerpt:
      'EU Drinking Water Directive changes in 2024 tightened lead limits for plumbing components in contact with potable water. We explain what "lead-free brass" means in practice (alloy CW617N vs. DZR brass vs. silicon brass), which applications require compliant valves, and how to identify conforming products on a supplier\'s specification sheet before placing an order.',
    date: 'March 28, 2026',
    readTime: '5 min read',
    author: 'Compliance & Export Team',
  },
  {
    id: 7,
    title: 'Manifold Systems for Underfloor Heating: Sizing and Installation Guide',
    category: 'Heating Systems',
    image: 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?w=600&q=80',
    imageAlt: 'Stainless steel heating manifold with circuit connections',
    excerpt:
      'A correctly sized manifold is critical for balanced heat distribution across UFH circuits. This technical guide covers maximum circuit length limits (typically 80–100m per loop), flow rate balancing using integrated flow meters, actuator selection for zone-by-zone control, and how to specify the right manifold port count for projects ranging from a 50m² apartment to a 500m² commercial floor.',
    date: 'March 15, 2026',
    readTime: '10 min read',
    author: 'SHUILIDA Technical Team',
  },
  {
    id: 8,
    title: 'Henan Province as a Manufacturing Hub: Why Location Matters for Lead Times',
    category: 'Sourcing Tips',
    image: '/shuilida-cert.webp',
    imageAlt: 'Industrial manufacturing facility in Henan Province, China',
    excerpt:
      "Shangqiu City sits at the intersection of China's central rail logistics network, giving manufacturers direct access to Qingdao, Shanghai, and Tianjin ports without the costly inland trucking that affects factories in coastal provinces. We explain why factory location affects sea-freight booking windows, transit times, and the practical advantages this geography delivers for European buyers working to tight project schedules.",
    date: 'March 1, 2026',
    readTime: '6 min read',
    author: 'Export Operations Team',
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');

  const categories: CategoryFilter[] = [
    'All',
    'Radiators',
    'Heating Systems',
    'Standards & Compliance',
    'Sourcing Tips',
    'Industry News',
  ];

  const categoryCounts: Record<CategoryFilter, number> = {
    All: articles.length + 1, // +1 for featured
    Radiators: articles.filter((a) => a.category === 'Radiators').length,
    'Heating Systems': articles.filter((a) => a.category === 'Heating Systems').length,
    'Standards & Compliance': articles.filter((a) => a.category === 'Standards & Compliance').length,
    'Sourcing Tips': articles.filter((a) => a.category === 'Sourcing Tips').length,
    'Industry News': 0,
  };

  const filteredArticles =
    activeCategory === 'All'
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const showFeatured =
    activeCategory === 'All' || activeCategory === 'Technical Guide' as CategoryFilter;

  useEffect(() => {
    const els = document.querySelectorAll('.shd-fade');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [activeCategory]);

  return (
    <div
      className="shd-root"
      style={{ colorScheme: 'light', color: BLACK, backgroundColor: '#fff' }}
    >
      <style suppressHydrationWarning>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .shd-fade { opacity: 0; }
        .shd-fade.visible { animation: fadeInUp 0.5s ease forwards; }
      `}</style>

      {/* ══════════════════════════════════════
          PAGE HERO
      ══════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: STEEL,
          padding: '60px 40px 52px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Link
              href="/site/whitesourcing"
              style={{
                color: '#6b7280',
                textDecoration: 'none',
                fontFamily: 'IBM Plex Sans',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Home
            </Link>
            <span style={{ color: '#d1d5db', fontSize: 13 }}>/</span>
            <span
              style={{
                color: NAVY,
                fontFamily: 'IBM Plex Sans',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Blog
            </span>
          </nav>

          {/* Heading block */}
          <div
            className="flex flex-col md:flex-row"
            style={{ gap: 48, alignItems: 'flex-end', justifyContent: 'space-between' }}
          >
            <div style={{ maxWidth: 620 }}>
              <h1
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 700,
                  color: BLACK,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginBottom: 16,
                  textWrap: 'balance',
                }}
              >
                Industry Insights &amp; Technical Guides
              </h1>
              <p
                style={{
                  color: '#374151',
                  fontSize: 16,
                  lineHeight: 1.7,
                  maxWidth: '62ch',
                }}
              >
                Expert articles on heating systems, plumbing standards, export logistics, and product selection for procurement professionals.
              </p>
            </div>

            {/* Search bar */}
            <div style={{ flexShrink: 0, width: '100%', maxWidth: 320 }}>
              <div style={{ position: 'relative' }}>
                <svg
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 18,
                    height: 18,
                    color: '#9ca3af',
                    flexShrink: 0,
                  }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx={11} cy={11} r={8} />
                  <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  placeholder="Search articles..."
                  aria-label="Search articles"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 14,
                    color: BLACK,
                    border: '1px solid #d1d5db',
                    borderRadius: 4,
                    backgroundColor: '#fff',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = NAVY)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                />
              </div>
            </div>
          </div>

          {/* Category filter pills */}
          <div
            style={{
              marginTop: 36,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="shd-fade"
                  style={{
                    padding: '8px 20px',
                    borderRadius: 999,
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${isActive ? NAVY : '#d1d5db'}`,
                    backgroundColor: isActive ? NAVY : '#fff',
                    color: isActive ? '#fff' : '#4b5563',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = NAVY;
                      e.currentTarget.style.color = NAVY;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.color = '#4b5563';
                    }
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MAIN CONTENT AREA (grid + sidebar)
      ══════════════════════════════════════ */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '64px 40px',
        }}
        className="px-4 md:px-10"
      >
        <div
          className="flex flex-col lg:flex-row"
          style={{ gap: 56, alignItems: 'flex-start' }}
        >
          {/* ─── LEFT COLUMN: Featured + Article Grid ─── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ── FEATURED ARTICLE ── */}
            {showFeatured && (
              <article
                className="shd-fade"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  overflow: 'hidden',
                  marginBottom: 48,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  className="flex-col md:flex-row"
                >
                  {/* Featured image */}
                  <div
                    style={{
                      flex: '0 0 auto',
                      width: '100%',
                      overflow: 'hidden',
                      backgroundColor: '#f9fafb',
                    }}
                    className="md:w-96 lg:w-[420px]"
                  >
                    <img
                      src="/shuilida-valve.webp"
                      alt="Steel panel radiator close-up — panel type selection guide"
                      style={{
                        width: '100%',
                        height: 320,
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.5s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  </div>

                  {/* Featured content */}
                  <div
                    style={{
                      flex: 1,
                      padding: '36px 40px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span
                        style={{
                          backgroundColor: NAVY,
                          color: '#fff',
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          padding: '4px 10px',
                          borderRadius: 3,
                        }}
                      >
                        TECHNICAL GUIDE
                      </span>
                      <span
                        style={{
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          padding: '4px 10px',
                          borderRadius: 3,
                        }}
                      >
                        FEATURED
                      </span>
                    </div>

                    <h2
                      style={{
                        fontFamily: 'IBM Plex Sans',
                        fontSize: 'clamp(20px, 2.5vw, 28px)',
                        fontWeight: 700,
                        color: BLACK,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.25,
                        marginBottom: 16,
                        textWrap: 'balance',
                      }}
                    >
                      How to Select the Right Panel Radiator: A Complete Buyer&apos;s Guide
                    </h2>

                    <p
                      style={{
                        color: '#374151',
                        fontSize: 15,
                        lineHeight: 1.7,
                        marginBottom: 24,
                        maxWidth: '58ch',
                      }}
                    >
                      Walk procurement officers through BTU calculations and kW output per panel type, the differences between Type 11, 21, 22, and 33 configurations, sizing for room volume and external wall exposure, connection options (bottom centre, side, or TBOE), and what to look for in a Chinese supplier&apos;s product data sheet before requesting samples or placing a bulk order.
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 16,
                        marginBottom: 28,
                        fontSize: 13,
                        color: '#6b7280',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                    >
                      <span>June 2, 2026</span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#d1d5db', display: 'inline-block' }} />
                      <span>12 min read</span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#d1d5db', display: 'inline-block' }} />
                      <span>By SHUILIDA Technical Team</span>
                    </div>

                    <Link
                      href="/site/whitesourcing/blog/panel-radiator-buyers-guide"
                      style={{
                        color: NAVY,
                        fontFamily: 'IBM Plex Sans',
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        alignSelf: 'flex-start',
                        borderBottom: `2px solid ${NAVY}`,
                        paddingBottom: 2,
                      }}
                    >
                      Read Article <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* ── ARTICLE GRID ── */}
            {filteredArticles.length > 0 ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                style={{ gap: 28 }}
              >
                {filteredArticles.map((article) => {
                  const categoryStyle =
                    CATEGORY_COLORS[article.category] ?? { bg: '#374151', text: '#fff' };
                  return (
                    <article
                      key={article.id}
                      className="shd-fade"
                      style={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 6,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)';
                        el.style.borderColor = '#c7d2e6';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.boxShadow = 'none';
                        el.style.borderColor = '#e5e7eb';
                      }}
                    >
                      {/* Card image */}
                      <div
                        style={{
                          height: 200,
                          overflow: 'hidden',
                          backgroundColor: '#f9fafb',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={article.image}
                          alt={article.imageAlt}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.5s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      </div>

                      {/* Card body */}
                      <div
                        style={{
                          padding: '24px 24px 28px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                        }}
                      >
                        {/* Category badge */}
                        <span
                          style={{
                            backgroundColor: categoryStyle.bg,
                            color: categoryStyle.text,
                            fontFamily: 'IBM Plex Sans',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.07em',
                            padding: '3px 9px',
                            borderRadius: 3,
                            display: 'inline-block',
                            alignSelf: 'flex-start',
                            marginBottom: 14,
                          }}
                        >
                          {article.category.toUpperCase()}
                        </span>

                        <h3
                          style={{
                            fontFamily: 'IBM Plex Sans',
                            fontSize: 16,
                            fontWeight: 700,
                            color: BLACK,
                            lineHeight: 1.35,
                            marginBottom: 12,
                            textWrap: 'balance',
                          }}
                        >
                          {article.title}
                        </h3>

                        <p
                          style={{
                            color: '#4b5563',
                            fontSize: 13.5,
                            lineHeight: 1.65,
                            marginBottom: 20,
                            flex: 1,
                          }}
                        >
                          {article.excerpt}
                        </p>

                        {/* Meta */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            fontSize: 12,
                            color: '#9ca3af',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            marginBottom: 16,
                          }}
                        >
                          <span>{article.date}</span>
                          <span>·</span>
                          <span>{article.readTime}</span>
                          <span>·</span>
                          <span>{article.author}</span>
                        </div>

                        <Link
                          href={`/site/whitesourcing/blog/article-${article.id}`}
                          style={{
                            color: NAVY,
                            fontFamily: 'IBM Plex Sans',
                            fontSize: 13,
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            alignSelf: 'flex-start',
                            borderBottom: `1px solid ${NAVY}`,
                            paddingBottom: 1,
                          }}
                        >
                          Read More <ChevronRight size={16} />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Empty state for Industry News (0 articles) */
              <div
                style={{
                  textAlign: 'center',
                  padding: '64px 32px',
                  backgroundColor: STEEL,
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <BookOpen size={40} style={{ color: '#9ca3af' }} />
                </div>
                <h3
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 18,
                    fontWeight: 700,
                    color: BLACK,
                    marginBottom: 8,
                  }}
                >
                  No articles in this category yet
                </h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, maxWidth: '42ch', margin: '0 auto 20px' }}>
                  Industry news articles are published as market developments occur. Subscribe to our newsletter to be notified when new content goes live.
                </p>
                <button
                  onClick={() => setActiveCategory('All')}
                  style={{
                    backgroundColor: NAVY,
                    color: '#fff',
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '10px 22px',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  View All Articles
                </button>
              </div>
            )}

            {/* ── PAGINATION ── */}
            {filteredArticles.length > 0 && (
              <nav
                aria-label="Page navigation"
                style={{
                  marginTop: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <button
                  disabled
                  aria-label="Previous page"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 20px',
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 13,
                    fontWeight: 600,
                    border: '1px solid #e5e7eb',
                    borderRadius: 4,
                    backgroundColor: '#f9fafb',
                    color: '#9ca3af',
                    cursor: 'not-allowed',
                  }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      aria-label={`Page ${page}`}
                      aria-current={page === 1 ? 'page' : undefined}
                      style={{
                        width: 40,
                        height: 40,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'IBM Plex Sans',
                        fontSize: 14,
                        fontWeight: 600,
                        border: `1px solid ${page === 1 ? NAVY : '#e5e7eb'}`,
                        borderRadius: 4,
                        backgroundColor: page === 1 ? NAVY : '#fff',
                        color: page === 1 ? '#fff' : '#4b5563',
                        cursor: page === 1 ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (page !== 1) {
                          e.currentTarget.style.borderColor = NAVY;
                          e.currentTarget.style.color = NAVY;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (page !== 1) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.color = '#4b5563';
                        }
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  aria-label="Next page"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 20px',
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${NAVY}`,
                    borderRadius: 4,
                    backgroundColor: '#fff',
                    color: NAVY,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = NAVY;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.color = NAVY;
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </div>

          {/* ─── RIGHT SIDEBAR ─── */}
          <aside
            style={{
              width: '100%',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
            className="lg:w-80 xl:w-96"
          >
            {/* Newsletter Signup */}
            <div
              className="shd-fade"
              style={{
                backgroundColor: NAVY,
                borderRadius: 6,
                padding: '32px 28px',
              }}
            >
              <h3
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 10,
                  lineHeight: 1.3,
                }}
              >
                Subscribe to Technical Updates
              </h3>
              <p
                style={{
                  color: '#bfdbfe',
                  fontSize: 14,
                  lineHeight: 1.65,
                  marginBottom: 24,
                }}
              >
                Get new articles on heating standards, product guides, and sourcing tips delivered monthly. No spam — unsubscribe any time.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  aria-label="Email address for newsletter"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 14,
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
                />
                <button
                  type="button"
                  style={{
                    backgroundColor: RED,
                    color: '#fff',
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 14,
                    fontWeight: 700,
                    padding: '12px 20px',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'background 0.18s ease',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c41c14')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = RED)}
                >
                  Subscribe to Updates
                </button>
              </div>
            </div>

            {/* Browse by Category */}
            <div
              className="shd-fade"
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '28px 24px',
              }}
            >
              <h3
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 16,
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                Browse by Category
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(
                  [
                    { name: 'All Articles', key: 'All' as CategoryFilter },
                    { name: 'Radiators', key: 'Radiators' as CategoryFilter },
                    { name: 'Heating Systems', key: 'Heating Systems' as CategoryFilter },
                    { name: 'Standards & Compliance', key: 'Standards & Compliance' as CategoryFilter },
                    { name: 'Sourcing Tips', key: 'Sourcing Tips' as CategoryFilter },
                    { name: 'Industry News', key: 'Industry News' as CategoryFilter },
                  ] as { name: string; key: CategoryFilter }[]
                ).map(({ name, key }) => {
                  const isActive = activeCategory === key;
                  const count = categoryCounts[key];
                  return (
                    <li key={key}>
                      <button
                        onClick={() => setActiveCategory(key)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 4,
                          border: 'none',
                          backgroundColor: isActive ? `${NAVY}12` : 'transparent',
                          color: isActive ? NAVY : '#374151',
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: 14,
                          fontWeight: isActive ? 600 : 400,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span>{name}</span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: isActive ? NAVY : '#9ca3af',
                            backgroundColor: isActive ? `${NAVY}18` : '#f3f4f6',
                            padding: '2px 8px',
                            borderRadius: 999,
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Popular Tags */}
            <div
              className="shd-fade"
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '28px 24px',
              }}
            >
              <h3
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 16,
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                Popular Tags
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  '#Radiators',
                  '#CE-Marking',
                  '#UFH',
                  '#PPR-Pipes',
                  '#BallValves',
                  '#ISO9001',
                  '#Sourcing',
                  '#EasternEurope',
                  '#Henan',
                  '#OEM',
                ].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: STEEL,
                      color: '#374151',
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '5px 12px',
                      borderRadius: 999,
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = NAVY;
                      (e.currentTarget as HTMLElement).style.color = '#fff';
                      (e.currentTarget as HTMLElement).style.borderColor = NAVY;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = STEEL;
                      (e.currentTarget as HTMLElement).style.color = '#374151';
                      (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
                    }}
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Contact CTA */}
            <div
              className="shd-fade"
              style={{
                backgroundColor: STEEL,
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '28px 24px',
              }}
            >
              <div style={{ display: 'flex', marginBottom: 12 }}>
                <Mail size={28} style={{ color: NAVY }} />
              </div>
              <h3
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 16,
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: 8,
                }}
              >
                Have a Technical Question?
              </h3>
              <p
                style={{
                  color: '#4b5563',
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  marginBottom: 18,
                }}
              >
                Our engineering team answers product specification and sourcing questions directly. Typical response within 24 hours.
              </p>
              <Link
                href="/site/whitesourcing/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: NAVY,
                  color: '#fff',
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '10px 18px',
                  borderRadius: 4,
                  textDecoration: 'none',
                  transition: 'background 0.18s ease',
                  width: '100%',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#142f66')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = NAVY)}
              >
                Contact Our Team <ChevronRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: RED,
          padding: '64px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 'clamp(24px, 3.5vw, 36px)',
              fontWeight: 700,
              color: '#fff',
              marginBottom: 12,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              textWrap: 'balance',
            }}
          >
            Have a Technical Question?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.88)',
              fontSize: 16,
              lineHeight: 1.65,
              marginBottom: 36,
              maxWidth: '48ch',
              margin: '0 auto 36px',
            }}
          >
            Our engineering team answers sourcing and specification questions directly. Tell us your project requirements and we will respond with datasheets and pricing within one business day.
          </p>
          <Link
            href="/site/whitesourcing/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#fff',
              color: RED,
              fontFamily: 'IBM Plex Sans',
              fontSize: 15,
              fontWeight: 700,
              padding: '14px 32px',
              borderRadius: 4,
              textDecoration: 'none',
              transition: 'background 0.18s ease, color 0.18s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.backgroundColor = '#fff';
            }}
          >
            Contact Our Team <ChevronRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
