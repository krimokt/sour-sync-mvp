import Link from 'next/link';
import Image from 'next/image';

interface Company {
  name: string;
  slug: string;
  website_settings: {
    hero_title?: string;
    hero_subtitle?: string;
    hero_image?: string | null;
    theme_color?: string;
  } | null;
}

interface HeroSectionProps {
  company: Company;
}

export default function HeroSection({ company }: HeroSectionProps) {
  const settings = company.website_settings || {};
  const heroTitle = settings.hero_title || `Welcome to ${company.name}`;
  const heroSubtitle = settings.hero_subtitle || 'Quality products from trusted sources';
  const themeColor = settings.theme_color || '#3B82F6';

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${themeColor} 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Hero Image Overlay */}
      {settings.hero_image && (
        <div className="absolute inset-0">
          <Image
            src={settings.hero_image}
            alt="Hero background"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
            {heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/site/${company.slug}/products`}
              className="inline-flex items-center px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 hover:scale-105"
              style={{ backgroundColor: themeColor }}
            >
              Browse Products
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)` }}
      />
    </section>
  );
}


