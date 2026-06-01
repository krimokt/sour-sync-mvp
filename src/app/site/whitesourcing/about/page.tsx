'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Factory, Wrench, CheckCircle2, Ship, DollarSign, Clock, Package, Globe } from 'lucide-react';

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

/* ── Timeline milestones ── */
const milestones = [
  {
    year: '2003',
    title: 'Founded in Shangqiu',
    detail: 'Started as a 12-person pipe fitting workshop in the Liangyuan District Industrial Zone, Henan Province.',
  },
  {
    year: '2006',
    title: 'First Export Order',
    detail: 'Shipped 800 steel panel radiators to a distributor in Gdansk, Poland — opening the Eastern European market.',
  },
  {
    year: '2010',
    title: 'ISO 9001 Certification',
    detail: 'Achieved ISO 9001 quality management certification. Expanded workforce to 120 staff and 6 production lines.',
  },
  {
    year: '2014',
    title: 'Factory Expansion',
    detail: 'Completed Phase 2 construction: 28,000 m² total floor area, 15+ production lines, 80+ CNC and injection moulding machines.',
  },
  {
    year: '2018',
    title: 'Underfloor Heating Line',
    detail: 'Launched dedicated PEX-A pipe and manifold production, adding a complete underfloor heating system range to the catalog.',
  },
  {
    year: '2021',
    title: 'CE Certification',
    detail: 'Obtained CE marking for steel panel radiators, aluminum radiators, and brass ball valves — enabling direct EU market entry.',
  },
  {
    year: '2023',
    title: '20th Anniversary',
    detail: 'Celebrating two decades of manufacturing: 350+ active SKUs, 40+ export countries, 200+ active distributor accounts worldwide.',
  },
];

/* ── Factory capability stats ── */
const capabilityStats = [
  {
    value: '28,000 m²',
    label: 'Factory Area',
    desc: 'Phase 1 and Phase 2 combined floor area including production, warehouse, and R&D wings.',
  },
  {
    value: '15+',
    label: 'Production Lines',
    desc: 'Dedicated lines for radiators, underfloor heating, PPR pipe, brass valves, and manifold systems.',
  },
  {
    value: '500,000+',
    label: 'Annual Capacity',
    desc: 'Units produced per year across all product categories at current staffing and shift patterns.',
  },
  {
    value: '12',
    label: 'R&D Engineers',
    desc: 'In-house product development team handling new designs, OEM customisation, and tolerance testing.',
  },
  {
    value: '20',
    label: 'QC Inspectors',
    desc: 'Dedicated quality control staff stationed across incoming material, in-process, and final inspection stages.',
  },
  {
    value: '80+',
    label: 'CNC & IM Machines',
    desc: 'Computer-controlled machining and injection moulding equipment ensuring dimensional accuracy at volume.',
  },
];

/* ── Team members ── */
const team = [
  {
    initials: 'WJ',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=85',
    name: 'Mr. Wang Jianhua',
    title: 'General Manager',
    experience: '20+ years in the heating manufacturing industry',
    desc: 'Oversees manufacturing strategy, quality system governance, and factory development. Has led Shuilida from a small workshop to a multi-line export facility serving 40+ countries.',
    color: NAVY,
  },
  {
    initials: 'LM',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=85',
    name: 'Ms. Li Mingzhu',
    title: 'Export Director',
    experience: '15+ years in international trade and HVAC export',
    desc: 'Manages all international client relationships, shipping logistics, customs documentation, and distributor onboarding. Fluent in English and Russian.',
    color: '#1a5c3a',
  },
  {
    initials: 'ZW',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=85',
    name: 'Mr. Zhang Wei',
    title: 'R&D Manager',
    experience: '10+ years in thermal product development',
    desc: 'Leads new product design and OEM customisation projects. Coordinates with European and Middle Eastern clients on specification compliance and CE certification testing.',
    color: '#7c3d12',
  },
];

/* ── Core values ── */
const values = [
  {
    icon: <Wrench size={20} />,
    title: 'Precision',
    body: 'Every millimetre matters in heating equipment. We engineer to tolerance using CNC-controlled processes, not manual approximation. Dimensional accuracy is verified at three stages before any batch ships.',
  },
  {
    icon: <Globe size={20} />,
    title: 'Reliability',
    body: 'Distributors in 40+ countries trust our products inside heating systems that run 24 hours a day through winter. That operating dependability is the one thing we never compromise.',
  },
  {
    icon: <Factory size={20} />,
    title: 'Innovation',
    body: 'Annual R&D investment covers new materials, energy-efficient radiator designs, and OEM customisation tooling. Our underfloor heating line launched in 2018 after two years of internal development.',
  },
  {
    icon: <CheckCircle2 size={20} />,
    title: 'Partnership',
    body: 'We build long-term supplier relationships with distributors and contractors, not one-off transactions. Consistent pricing, priority production scheduling, and dedicated account managers for established partners.',
  },
];

/* ── Trade term rows ── */
const tradeTerms = [
  {
    icon: <Ship size={20} />,
    label: 'Incoterms',
    value: 'FOB Qingdao, FOB Shanghai, CIF, EXW',
  },
  {
    icon: <DollarSign size={20} />,
    label: 'Payment Terms',
    value: 'T/T 30% deposit, 70% before shipment. L/C at sight accepted for orders above $20,000.',
  },
  {
    icon: <Clock size={20} />,
    label: 'Lead Time',
    value: '15–25 working days for standard stock items. 30–45 working days for OEM and custom-branded orders.',
  },
  {
    icon: <Package size={20} />,
    label: 'Packaging',
    value: 'Standard export carton with foam insert. Wooden crate for heavy or fragile items. Custom branding and labelling available.',
  },
  {
    icon: <Globe size={20} />,
    label: 'Shipping',
    value: 'Weekly container consolidation to Europe, Middle East, and Southeast Asia. Full set of export documents included.',
  },
  {
    icon: <CheckCircle2 size={20} />,
    label: 'Sample Policy',
    value: 'Free sample available for orders above $5,000 confirmed value. Buyer pays outbound freight. Samples dispatched within 5 working days.',
  },
];

/* ── Trade info card items ── */
const tradeCardItems = [
  { icon: <Ship size={16} />, label: 'FOB', value: 'Qingdao or Shanghai' },
  { icon: <DollarSign size={16} />, label: 'Payment', value: 'T/T 30% + 70%; L/C accepted' },
  { icon: <Clock size={16} />, label: 'Lead Time', value: '15–25 days (std) / 30–45 (OEM)' },
  { icon: <Package size={16} />, label: 'Packaging', value: 'Export carton; custom branding OK' },
  { icon: <Globe size={16} />, label: 'Shipping', value: 'Weekly LCL to EU, ME, SEA' },
  { icon: <CheckCircle2 size={16} />, label: 'Samples', value: 'Free above $5,000 (buyer pays freight)' },
];

export default function ShuilidaAboutPage() {
  useEffect(() => {
    const els = document.querySelectorAll('.shd-fade');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
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
      `}</style>

      {/* ══════════════════════════════════════
          SECTION 1 — PAGE HERO
      ══════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: 520,
          display: 'flex',
          overflow: 'hidden',
          backgroundColor: BLACK,
        }}
      >
        {/* Grid overlay */}
        <div
          className="shd-grid-bg"
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />
        {/* Directional gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: `linear-gradient(to right, ${BLACK} 45%, rgba(15,17,21,0.72) 70%, rgba(15,17,21,0.2) 100%)`,
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '88px 40px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            position: 'relative',
            zIndex: 2,
            gap: 56,
          }}
          className="flex-col md:flex-row px-4 md:px-10"
        >
          {/* Left: copy */}
          <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 580 }}>
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
              <Link
                href="/site/whitesourcing"
                style={{
                  color: '#9ca3af',
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
              >
                Home
              </Link>
              <span style={{ color: '#4b5563', fontSize: 13 }}>/</span>
              <span
                style={{
                  color: '#e5e7eb',
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                About
              </span>
            </nav>

            {/* Red chip label */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(226,35,26,0.14)',
                border: `1px solid rgba(226,35,26,0.38)`,
                color: '#f87171',
                padding: '6px 14px',
                borderRadius: 2,
                fontSize: 12,
                fontFamily: 'IBM Plex Sans',
                fontWeight: 600,
                letterSpacing: '0.06em',
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: RED,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              Est. 2003 · Shangqiu, Henan, China
            </div>

            <h1
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(32px, 5vw, 54px)',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                marginBottom: 20,
                textWrap: 'balance',
              }}
            >
              About Shuilida
            </h1>

            <p
              style={{
                color: '#d1d5db',
                fontSize: 17,
                lineHeight: 1.7,
                marginBottom: 0,
                maxWidth: '60ch',
              }}
            >
              Over two decades of heating and plumbing manufacturing from a single factory in Henan Province. ISO 9001:2015 certified, CE marked, and supplying distributors and contractors in 40+ countries with pressure-tested, export-ready equipment.
            </p>
          </div>

          {/* Right: factory image */}
          <div
            className="hidden md:flex"
            style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: 480 }}>
              <img
                src="/shuilida-cert.jpg"
                alt="Shuilida factory production floor, Shangqiu, Henan Province"
                style={{
                  width: '100%',
                  height: 380,
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  display: 'block',
                }}
              />
              {/* Overlay corner accent */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 4,
                  backgroundColor: RED,
                  borderRadius: '0 0 2px 2px',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — COMPANY STORY
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: '96px 40px' }}>
        <div
          style={{ maxWidth: 1280, margin: '0 auto' }}
          className="px-4 md:px-10"
        >
          <div
            className="flex flex-col lg:flex-row"
            style={{ gap: 72 }}
          >
            {/* Left: narrative (60%) */}
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 680 }}>
              <h2
                className="shd-fade"
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 'clamp(26px, 3.5vw, 38px)',
                  fontWeight: 700,
                  color: BLACK,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginBottom: 28,
                  textWrap: 'balance',
                }}
              >
                Two Decades of Manufacturing Excellence
              </h2>

              <p
                style={{
                  color: '#374151',
                  fontSize: 16,
                  lineHeight: 1.8,
                  marginBottom: 20,
                  maxWidth: '70ch',
                }}
              >
                Shuilida Heating and Plumbing Equipment Factory (商丘市水力达水暖器材厂) was founded in 2003 in the Liangyuan District Industrial Zone of Shangqiu City, Henan Province, China. The company began as a 12-person pipe fitting workshop supplying domestic construction contractors in central China. Within three years, the quality of our fittings and the reliability of our delivery schedule had attracted the attention of an international sourcing agent.
              </p>

              <p
                style={{
                  color: '#374151',
                  fontSize: 16,
                  lineHeight: 1.8,
                  marginBottom: 20,
                  maxWidth: '70ch',
                }}
              >
                In 2006, we fulfilled our first export order: 800 steel panel radiators shipped FOB Qingdao to a distributor in Gdansk, Poland. That shipment opened the Eastern European market and set the direction for everything that followed. By 2010, we had formalised our quality management system under ISO 9001 and grown to 120 staff operating six production lines.
              </p>

              <p
                style={{
                  color: '#374151',
                  fontSize: 16,
                  lineHeight: 1.8,
                  marginBottom: 20,
                  maxWidth: '70ch',
                }}
              >
                The 2014 factory expansion brought total floor area to 28,000 m², added nine further production lines, and equipped the facility with 80+ CNC machining and injection moulding machines. In 2018, responding to growing European demand for radiant floor heating, we launched a dedicated PEX-A pipe and manifold production line — bringing underfloor heating systems into our catalog alongside radiators, valves, and PPR pipe.
              </p>

              <p
                style={{
                  color: '#374151',
                  fontSize: 16,
                  lineHeight: 1.8,
                  marginBottom: 20,
                  maxWidth: '70ch',
                }}
              >
                CE certification for our core product families followed in 2021, enabling direct market entry for European distributors without third-party re-certification. Today, Shuilida operates 15+ production lines, maintains 350+ active SKUs, and serves more than 200 distributor accounts across 40+ countries, with weekly container consolidations to Europe, the Middle East, and Southeast Asia.
              </p>

              <p
                style={{
                  color: '#374151',
                  fontSize: 16,
                  lineHeight: 1.8,
                  marginBottom: 0,
                  maxWidth: '70ch',
                }}
              >
                Our operating philosophy has not changed since 2003: engineering reliability into every component. A heating system operates continuously for months at pressure and elevated temperature. Every valve seat, every weld seam, every pipe wall must perform without failure. That standard governs everything from raw material selection to final pressure testing before dispatch.
              </p>

              {/* Pull quote */}
              <div
                style={{
                  marginTop: 40,
                  padding: '24px 28px',
                  backgroundColor: STEEL,
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 4,
                    height: '100%',
                    backgroundColor: NAVY,
                    borderRadius: '2px 0 0 2px',
                  }}
                />
                <p
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 18,
                    fontWeight: 600,
                    color: NAVY,
                    lineHeight: 1.5,
                    margin: 0,
                    fontStyle: 'italic',
                  }}
                >
                  "Engineering reliability into every component."
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: '#6b7280',
                    marginTop: 10,
                    marginBottom: 0,
                    fontWeight: 500,
                  }}
                >
                  Shuilida operating philosophy since 2003
                </p>
              </div>
            </div>

            {/* Right: timeline (40%) */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#6b7280',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 36,
                }}
              >
                Company Timeline
              </h3>

              <div style={{ position: 'relative' }}>
                {/* Vertical line */}
                <div
                  style={{
                    position: 'absolute',
                    left: 19,
                    top: 8,
                    bottom: 8,
                    width: 2,
                    backgroundColor: '#e5e7eb',
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {milestones.map((m, i) => (
                    <div
                      key={m.year}
                      className="shd-fade"
                      style={{
                        display: 'flex',
                        gap: 24,
                        alignItems: 'flex-start',
                        paddingBottom: i < milestones.length - 1 ? 36 : 0,
                      }}
                    >
                      {/* Dot */}
                      <div
                        style={{
                          flexShrink: 0,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: i === milestones.length - 1 ? RED : NAVY,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          zIndex: 1,
                          boxShadow: `0 0 0 4px #fff`,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'IBM Plex Sans',
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#fff',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {m.year.slice(2)}
                        </span>
                      </div>

                      {/* Content */}
                      <div style={{ paddingTop: 8 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'IBM Plex Sans',
                              fontSize: 14,
                              fontWeight: 700,
                              color: i === milestones.length - 1 ? RED : NAVY,
                            }}
                          >
                            {m.year}
                          </span>
                          <span
                            style={{
                              fontFamily: 'IBM Plex Sans',
                              fontSize: 15,
                              fontWeight: 700,
                              color: BLACK,
                            }}
                          >
                            {m.title}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 14,
                            color: '#6b7280',
                            lineHeight: 1.6,
                            margin: 0,
                            maxWidth: '46ch',
                          }}
                        >
                          {m.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — FACTORY & CAPABILITIES
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: STEEL, padding: '96px 40px' }}>
        <div
          style={{ maxWidth: 1280, margin: '0 auto' }}
          className="px-4 md:px-10"
        >
          <h2
            className="shd-fade"
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700,
              color: BLACK,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: 56,
              textWrap: 'balance',
            }}
          >
            Our Factory &amp; Production Capabilities
          </h2>

          <div
            className="flex flex-col lg:flex-row"
            style={{ gap: 64 }}
          >
            {/* Left: 2×2 image grid */}
            <div
              className="grid grid-cols-2"
              style={{
                flex: '0 0 auto',
                width: '100%',
                maxWidth: 520,
                gap: 12,
              }}
            >
              {[
                {
                  src: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800&q=85',
                  alt: 'Industrial factory interior — production floor overview',
                },
                {
                  src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=85',
                  alt: 'Factory worker operating CNC precision machinery',
                },
                {
                  src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=85',
                  alt: 'Industrial pipe and valve manufacturing production line',
                },
                {
                  src: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=85',
                  alt: 'Quality control and inspection in manufacturing plant',
                },
              ].map((img, i) => (
                <div
                  key={i}
                  className="shd-fade"
                  style={{
                    overflow: 'hidden',
                    borderRadius: 2,
                    aspectRatio: '4/3',
                    backgroundColor: '#e5e7eb',
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
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
              ))}
            </div>

            {/* Right: capability stats */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 28,
              }}
            >
              {capabilityStats.map((stat) => (
                <div
                  key={stat.label}
                  className="shd-fade"
                  style={{
                    display: 'flex',
                    gap: 20,
                    alignItems: 'flex-start',
                    paddingBottom: 28,
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <div
                      style={{
                        fontFamily: 'IBM Plex Sans',
                        fontSize: 'clamp(22px, 3vw, 30px)',
                        fontWeight: 700,
                        color: NAVY,
                        lineHeight: 1,
                        minWidth: 100,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontFamily: 'IBM Plex Sans',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#6b7280',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        marginTop: 4,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: '#4b5563',
                      lineHeight: 1.65,
                      margin: '4px 0 0',
                      maxWidth: '50ch',
                    }}
                  >
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — MANAGEMENT & TEAM
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: '96px 40px' }}>
        <div
          style={{ maxWidth: 1280, margin: '0 auto' }}
          className="px-4 md:px-10"
        >
          <div style={{ marginBottom: 56 }}>
            <h2
              className="shd-fade"
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: 700,
                color: BLACK,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: 14,
                textWrap: 'balance',
              }}
            >
              Leadership &amp; Export Team
            </h2>
            <p
              style={{
                color: '#6b7280',
                fontSize: 16,
                lineHeight: 1.65,
                maxWidth: '62ch',
                margin: 0,
              }}
            >
              The team responsible for manufacturing quality, international logistics, and product development at Shuilida.
            </p>
          </div>

          <style suppressHydrationWarning>{`
            .shd-team-card {
              background: #fff;
              border: 1px solid #e5e7eb;
              border-radius: 20px;
              overflow: visible;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              padding: 0 28px 28px;
              transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                          box-shadow 0.35s ease,
                          border-color 0.25s ease;
              cursor: default;
              position: relative;
            }
            .shd-team-card::before {
              content: '';
              display: block;
              width: 100%;
              height: 90px;
              border-radius: 20px 20px 0 0;
              position: absolute;
              top: 0; left: 0;
              z-index: 0;
            }
            .shd-team-card:hover {
              transform: translateY(-10px) scale(1.02);
              box-shadow: 0 24px 64px rgba(27,62,132,0.15), 0 4px 16px rgba(0,0,0,0.07);
              border-color: #c7d9f8;
            }
            .shd-team-avatar {
              width: 110px;
              height: 110px;
              border-radius: 50%;
              object-fit: cover;
              object-position: center top;
              border: 4px solid #fff;
              box-shadow: 0 8px 24px rgba(0,0,0,0.15);
              transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1),
                          box-shadow 0.35s ease;
              display: block;
              position: relative;
              z-index: 1;
            }
            .shd-team-card:hover .shd-team-avatar {
              transform: scale(1.08) translateY(-4px);
              box-shadow: 0 14px 36px rgba(0,0,0,0.22);
            }
          `}</style>

          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{ gap: 32 }}
          >
            {team.map((member) => (
              <div
                key={member.name}
                className="shd-team-card shd-fade"
                style={{ '--card-color': member.color } as React.CSSProperties}
              >
                {/* Coloured top band */}
                <div style={{
                  width: 'calc(100% + 2px)',
                  height: 90,
                  marginLeft: -1,
                  marginRight: -1,
                  borderRadius: '20px 20px 0 0',
                  background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}cc 100%)`,
                  position: 'relative',
                  flexShrink: 0,
                  alignSelf: 'stretch',
                }}>
                  {/* Subtle pattern overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '20px 20px 0 0',
                    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 60%)',
                  }} />
                </div>

                {/* Circle avatar — sits between band and body */}
                <div style={{ marginTop: -55, marginBottom: 16, zIndex: 2 }}>
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="shd-team-avatar"
                  />
                </div>

                {/* Name + title */}
                <h3 style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 17, fontWeight: 700, color: BLACK,
                  marginBottom: 4, lineHeight: 1.2,
                }}>
                  {member.name}
                </h3>

                <div style={{
                  display: 'inline-block',
                  background: `${member.color}18`,
                  color: member.color,
                  padding: '3px 12px',
                  borderRadius: 999,
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  {member.title}
                </div>

                <div style={{
                  fontSize: 12, color: '#9ca3af',
                  fontStyle: 'italic', marginBottom: 14, fontWeight: 500,
                }}>
                  {member.experience}
                </div>

                <p style={{
                  fontSize: 14, color: '#4b5563',
                  lineHeight: 1.65, margin: '0 0 20px', flex: 1,
                }}>
                  {member.desc}
                </p>

                {/* Footer */}
                <div style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  paddingTop: 16,
                  borderTop: `1px solid #f3f4f6`,
                }}>
                  <div style={{
                    width: 26, height: 26,
                    backgroundColor: '#0077b5', borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'IBM Plex Sans', fontSize: 11,
                      fontWeight: 800, color: '#fff', lineHeight: 1,
                    }}>in</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Connect on LinkedIn</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5 — CORE VALUES
      ══════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: NAVY,
          color: '#fff',
          padding: '96px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="shd-grid-bg"
          style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.5 }}
        />

        <div
          style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}
          className="px-4 md:px-10"
        >
          <div style={{ marginBottom: 56 }}>
            <h2
              className="shd-fade"
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: 14,
                textWrap: 'balance',
              }}
            >
              Our Core Values
            </h2>
            <p
              style={{
                color: '#bfdbfe',
                fontSize: 16,
                lineHeight: 1.65,
                maxWidth: '58ch',
                margin: 0,
              }}
            >
              Four principles that have governed how Shuilida operates since the first production line started in 2003.
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{ gap: 24 }}
          >
            {values.map((val) => (
              <div
                key={val.title}
                className="shd-fade"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 2,
                  padding: '32px 28px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.12)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.07)')
                }
              >
                <div
                  style={{
                    fontSize: 32,
                    marginBottom: 16,
                    lineHeight: 1,
                    color: '#93c5fd',
                  }}
                >
                  {val.icon}
                </div>
                <h3
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: 12,
                    lineHeight: 1.2,
                  }}
                >
                  {val.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: '#bfdbfe',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {val.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6 — EXPORT & COMPLIANCE
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: '96px 40px' }}>
        <div
          style={{ maxWidth: 1280, margin: '0 auto' }}
          className="px-4 md:px-10"
        >
          <div style={{ marginBottom: 56 }}>
            <h2
              className="shd-fade"
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: 700,
                color: BLACK,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: 14,
                textWrap: 'balance',
              }}
            >
              Export Compliance &amp; Trade Terms
            </h2>
            <p
              style={{
                color: '#6b7280',
                fontSize: 16,
                lineHeight: 1.65,
                maxWidth: '58ch',
                margin: 0,
              }}
            >
              Standard terms applicable to all Shuilida export orders. Custom arrangements available for established distributor partners.
            </p>
          </div>

          <div
            className="flex flex-col lg:flex-row"
            style={{ gap: 56 }}
          >
            {/* Left: trade term rows */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {tradeTerms.map((term, i) => (
                  <div
                    key={term.label}
                    className="shd-fade"
                    style={{
                      display: 'flex',
                      gap: 20,
                      alignItems: 'flex-start',
                      padding: '24px 0',
                      borderBottom: i < tradeTerms.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: 44,
                        height: 44,
                        backgroundColor: STEEL,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: NAVY,
                        marginTop: 2,
                      }}
                    >
                      {term.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#9ca3af',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          marginBottom: 5,
                        }}
                      >
                        {term.label}
                      </div>
                      <p
                        style={{
                          fontSize: 15,
                          color: '#1f2937',
                          lineHeight: 1.6,
                          margin: 0,
                          maxWidth: '58ch',
                        }}
                      >
                        {term.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Trade Info summary card */}
            <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 380 }}>
              <div
                style={{
                  backgroundColor: STEEL,
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'sticky',
                  top: 100,
                }}
              >
                {/* Card header */}
                <div
                  style={{
                    backgroundColor: NAVY,
                    padding: '24px 28px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: 4,
                    }}
                  >
                    Trade Info Summary
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#93c5fd',
                      fontWeight: 500,
                    }}
                  >
                    Standard Shuilida export terms
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '24px 28px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {tradeCardItems.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}
                      >
                        <span style={{ color: NAVY, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                        <div>
                          <span
                            style={{
                              fontFamily: 'IBM Plex Sans',
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#9ca3af',
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              display: 'block',
                              marginBottom: 2,
                            }}
                          >
                            {item.label}
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              color: '#1f2937',
                              fontWeight: 500,
                              lineHeight: 1.5,
                            }}
                          >
                            {item.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 20,
                      borderTop: '1px solid #e5e7eb',
                    }}
                  >
                    <Link
                      href="/site/whitesourcing/contact"
                      style={{
                        display: 'block',
                        backgroundColor: NAVY,
                        color: '#fff',
                        padding: '13px 20px',
                        borderRadius: 2,
                        fontFamily: 'IBM Plex Sans',
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: 'none',
                        textAlign: 'center',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#142f66')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = NAVY)
                      }
                    >
                      Request a Proforma Invoice
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 7 — CTA
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: STEEL, padding: '96px 40px' }}>
        <div
          style={{
            maxWidth: 860,
            margin: '0 auto',
            textAlign: 'center',
          }}
          className="px-4 md:px-10"
        >
          <h2
            className="shd-fade"
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 'clamp(26px, 4vw, 42px)',
              fontWeight: 700,
              color: BLACK,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: 16,
              textWrap: 'balance',
            }}
          >
            Ready to work with Shuilida?
          </h2>
          <p
            style={{
              color: '#6b7280',
              fontSize: 17,
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: '54ch',
              margin: '0 auto 40px',
            }}
          >
            Our export team responds within 24 hours with pricing, datasheets, and sample availability. FOB Qingdao or Shanghai. Standard lead time 15–25 working days.
          </p>

          <div
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              href="/site/whitesourcing/products"
              style={{
                backgroundColor: BLACK,
                color: '#fff',
                padding: '15px 32px',
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
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1a1e26')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = BLACK)
              }
            >
              Browse Products
            </Link>
            <Link
              href="/site/whitesourcing/contact"
              style={{
                backgroundColor: NAVY,
                color: '#fff',
                padding: '15px 32px',
                borderRadius: 2,
                fontFamily: 'IBM Plex Sans',
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(27,62,132,0.35)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#142f66')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = NAVY)
              }
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
