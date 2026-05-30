'use client';

import { useRef } from 'react';
import { ArrowRight, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { TimelineContent } from '@/components/ui/timeline-animation';
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

interface AboutHeroSectionProps {
  companyName: string;
  accentColor: string;
  heroImage?: string;
  tagline?: string;
  description1?: string;
  description2?: string;
  ownerName?: string;
  ownerRole?: string;
  socials?: SocialLinks;
  ctaHref?: string;
  stats?: {
    years?: { value: string; label: string };
    orders?: { value: string; label: string };
    brands?: { value: string; label: string };
    growth?: { value: string; label: string };
  };
}

/**
 * Brand-adapted port of AboutSection3 (timeline-animated).
 * Color flipped from red → tenant accent. Image defaults to a factory
 * production line. Copy adapted to the sourcing-platform register.
 */
export default function AboutHeroSection({
  companyName,
  accentColor,
  heroImage,
  tagline = 'Trusted manufacturing partners across China — vetted, audited, and managed end-to-end.',
  description1 = `Our team builds long-term relationships with factory floors, not brokers. We sit in audits, witness production, and approve every shipment before it leaves port.`,
  description2 = `Every brand we work with gets a dedicated sourcing strategist, real-time production updates, and quality control that reads less like a checklist and more like a guarantee.`,
  ownerName,
  ownerRole = 'Sourcing & Operations Lead',
  socials = {},
  ctaHref,
  stats = {
    years: { value: '10+', label: 'years sourcing in China' },
    orders: { value: '5,000+', label: 'orders fulfilled' },
    brands: { value: '300+', label: 'partner brands' },
    growth: { value: '40%', label: 'avg margin improvement' },
  },
}: AboutHeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const displayName = (ownerName || companyName).toUpperCase();
  const finalHero =
    heroImage ||
    'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1600&q=75';

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { delay: i * 0.08, duration: 0.32, ease: [0.22, 1, 0.36, 1] },
    }),
    hidden: { filter: 'blur(10px)', y: -20, opacity: 0 },
  };
  const scaleVariants = {
    visible: (i: number) => ({
      opacity: 1,
      filter: 'blur(0px)',
      transition: { delay: i * 0.08, duration: 0.32, ease: [0.22, 1, 0.36, 1] },
    }),
    hidden: { filter: 'blur(10px)', opacity: 0 },
  };

  return (
    <section className="py-8 px-4 bg-[#f9f9f9]" ref={heroRef}>
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* Eyebrow + social icons row, overlaid on top of the image */}
          <div className="flex justify-between items-center mb-8 w-[85%] absolute lg:top-4 md:top-0 sm:-top-2 -top-3 z-10">
            <div className="flex items-center gap-2 text-xl">
              <span className="animate-spin" style={{ color: accentColor }}>✱</span>
              <TimelineContent
                as="span"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-sm font-medium text-gray-600"
              >
                WHO WE ARE
              </TimelineContent>
            </div>
            <div className="flex gap-3 lg:gap-4">
              {[
                { url: socials.facebook, Icon: Facebook, label: 'Facebook' },
                { url: socials.instagram, Icon: Instagram, label: 'Instagram' },
                { url: socials.linkedin, Icon: Linkedin, label: 'LinkedIn' },
                { url: socials.youtube, Icon: Youtube, label: 'YouTube' },
              ]
                .filter((s) => !!s.url)
                .map((s, idx) => (
                  <TimelineContent
                    key={s.label}
                    as="a"
                    animationNum={idx}
                    timelineRef={heroRef}
                    customVariants={revealVariants}
                    href={s.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="md:w-9 md:h-9 sm:w-7 w-6 sm:h-7 h-6 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <s.Icon className="w-4 h-4 text-gray-700" />
                  </TimelineContent>
                ))}
            </div>
          </div>

          {/* Clip-masked factory photo — the asymmetric shape is what makes this section recognizable */}
          <TimelineContent
            as="figure"
            animationNum={4}
            timelineRef={heroRef}
            customVariants={scaleVariants}
            className="relative group"
          >
            <svg
              className="w-full"
              width="100%"
              height="100%"
              viewBox="0 0 100 40"
            >
              <defs>
                <clipPath id="about-clip-inverted" clipPathUnits="objectBoundingBox">
                  <path
                    d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z"
                    fill="#D9D9D9"
                  />
                </clipPath>
              </defs>
              <image
                clipPath="url(#about-clip-inverted)"
                preserveAspectRatio="xMidYMid slice"
                width="100%"
                height="100%"
                xlinkHref={finalHero}
              />
            </svg>
          </TimelineContent>

          {/* Stats — accent color comes from props */}
          <div className="flex flex-wrap lg:justify-start justify-between items-center py-3 text-sm">
            <TimelineContent
              as="div"
              animationNum={5}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex gap-4"
            >
              {stats.years && (
                <div className="flex items-center gap-2 mb-2 sm:text-base text-xs">
                  <span className="font-bold" style={{ color: accentColor }}>{stats.years.value}</span>
                  <span className="text-gray-600">{stats.years.label}</span>
                  <span className="text-gray-300">|</span>
                </div>
              )}
              {stats.orders && (
                <div className="flex items-center gap-2 mb-2 sm:text-base text-xs">
                  <span className="font-bold" style={{ color: accentColor }}>{stats.orders.value}</span>
                  <span className="text-gray-600">{stats.orders.label}</span>
                </div>
              )}
            </TimelineContent>

            <div className="lg:absolute right-0 bottom-16 flex lg:flex-col flex-row-reverse lg:gap-0 gap-4">
              {stats.brands && (
                <TimelineContent
                  as="div"
                  animationNum={6}
                  timelineRef={heroRef}
                  customVariants={revealVariants}
                  className="flex lg:text-4xl sm:text-3xl text-2xl items-center gap-2 mb-2"
                >
                  <span className="font-semibold" style={{ color: accentColor }}>{stats.brands.value}</span>
                  <span className="text-gray-600 uppercase">{stats.brands.label}</span>
                </TimelineContent>
              )}
              {stats.growth && (
                <TimelineContent
                  as="div"
                  animationNum={7}
                  timelineRef={heroRef}
                  customVariants={revealVariants}
                  className="flex items-center gap-2 mb-2 sm:text-base text-xs"
                >
                  <span className="font-bold" style={{ color: accentColor }}>{stats.growth.value}</span>
                  <span className="text-gray-600">{stats.growth.label}</span>
                  <span className="text-gray-300 lg:hidden block">|</span>
                </TimelineContent>
              )}
            </div>
          </div>
        </div>

        {/* Main body — headline + two columns of copy + brand signature */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="sm:text-4xl md:text-5xl text-2xl !leading-[110%] font-semibold text-gray-900 mb-8">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.04}
                staggerFrom="first"
                reverse
                transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.35 }}
              >
                {tagline}
              </VerticalCutReveal>
            </h1>

            <TimelineContent
              as="div"
              animationNum={9}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="grid md:grid-cols-2 gap-8 text-gray-600"
            >
              <TimelineContent
                as="div"
                animationNum={10}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="sm:text-base text-xs"
              >
                <p className="leading-relaxed text-justify">{description1}</p>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={11}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="sm:text-base text-xs"
              >
                <p className="leading-relaxed text-justify">{description2}</p>
              </TimelineContent>
            </TimelineContent>
          </div>

          <div className="md:col-span-1">
            <div className="text-right">
              <TimelineContent
                as="div"
                animationNum={12}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-2xl font-bold mb-2"
                style={{ color: accentColor }}
              >
                {displayName}
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={13}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-gray-600 text-sm mb-8"
              >
                {ownerRole}
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={14}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="mb-6"
              >
                <p className="text-gray-900 font-medium mb-4">
                  Ready to put a senior sourcing team behind your next product?
                </p>
              </TimelineContent>

              <TimelineContent
                as="a"
                animationNum={15}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href={ctaHref || '#contact'}
                className="flex w-fit ml-auto gap-2 hover:gap-4 transition-all duration-300 ease-in-out text-white px-5 py-3 rounded-lg cursor-pointer font-semibold"
                style={{
                  background: '#2596be',
                  boxShadow: '0 10px 24px -10px rgba(37,150,190,0.55), 0 1px 0 rgba(255,255,255,0.18) inset',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1f7fa0'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#2596be'; }}
              >
                LET&apos;S COLLABORATE <ArrowRight />
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
