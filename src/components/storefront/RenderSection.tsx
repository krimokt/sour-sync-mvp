'use client';

import React from 'react';
import { 
  WebsiteSection, 
  SectionSettings,
  AnnouncementBarData,
  HeaderData,
  HeroSliderData,
  HeroBannerData,
  FeaturedCollectionData,
  PromoBannerData,
  TestimonialsData,
  ImageWithTextData,
  MulticolumnData,
  NewsletterData,
  ContactInfoData,
  ShipmentTimelineData,
  PricingTableData,
  WarehouseGalleryData,
  ProcessStepsData,
  QuoteFormData,
  LogoListData,
  FooterData,
} from '@/types/website';

// Section Components
import AnnouncementBar from './sections/AnnouncementBar';
import HeaderSection from './sections/HeaderSection';
import HeroBanner from './sections/HeroBanner';
import Newsletter from './sections/Newsletter';
import ContactInfo from './sections/ContactInfo';
import HeroSlider from './sections/HeroSlider';
import ProductCarousel from './sections/ProductCarousel';
import TestimonialsCarousel from './sections/TestimonialsCarousel';
import PromoBanner from './sections/PromoBanner';
import ShipmentTimeline from './sections/ShipmentTimeline';
import PricingTable from './sections/PricingTable';
import WarehouseGallery from './sections/WarehouseGallery';
import ProcessSteps from './sections/ProcessSteps';
import QuoteForm from './sections/QuoteForm';
import Multicolumn from './sections/Multicolumn';
import ImageWithText from './sections/ImageWithText';
import LogoList from './sections/LogoList';
import Footer from './sections/Footer';

// Legacy Section Components (for backward compatibility)
import HeroSection from './sections/HeroSection';
import ServicesSection from './sections/ServicesSection';
import ProductsSection from './sections/ProductsSection';
import ContactSection from './sections/ContactSection';
import AboutSection from './sections/AboutSection';

interface RenderSectionProps {
  section: WebsiteSection;
  themeColor: string;
  companyId: string;
  companySlug: string;
}

export default function RenderSection({ section, themeColor, companyId, companySlug }: RenderSectionProps) {
  // Skip hidden sections
  if (section.settings?.isHidden) return null;

  const sectionStyles = getSectionStyles(section.settings);
  const data = section.data as Record<string, unknown>;

  // Wrap section with styles
  const wrapSection = (content: React.ReactNode, customStyles?: React.CSSProperties) => (
    <section
      id={section.id}
      className="relative"
      style={{ ...sectionStyles, ...customStyles }}
    >
      {section.settings?.backgroundImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${section.settings.backgroundImage})`,
            backgroundPosition: section.settings.backgroundPosition || 'center',
            backgroundSize: section.settings.backgroundSize || 'cover',
          }}
        >
          {section.settings.backgroundOverlay && (
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundColor: section.settings.backgroundOverlay,
                opacity: section.settings.backgroundOverlayOpacity || 0.5,
              }}
            />
          )}
        </div>
      )}
      <div className="relative z-10">
        {content}
      </div>
    </section>
  );

  // Render based on section type
  switch (section.type) {
    // New Shopify-style sections
    case 'announcement-bar':
      return (
        <AnnouncementBar 
          data={data as unknown as AnnouncementBarData} 
          themeColor={themeColor} 
        />
      );

    case 'header':
      return (
        <HeaderSection 
          data={data as unknown as HeaderData} 
          themeColor={themeColor}
          companySlug={companySlug}
        />
      );

    case 'hero-slider':
      return (
        <HeroSlider 
          data={data as unknown as HeroSliderData} 
          themeColor={themeColor}
          companySlug={companySlug}
        />
      );

    case 'hero-banner':
      return wrapSection(
        <HeroBanner 
          data={data as unknown as HeroBannerData} 
          themeColor={themeColor} 
        />
      );

    case 'featured-collection':
    case 'product-carousel':
      return (
        <ProductCarousel 
          data={data as unknown as FeaturedCollectionData} 
          themeColor={themeColor}
          companyId={companyId}
          companySlug={companySlug}
        />
      );

    case 'promo-banner':
    case 'split-banner':
      return (
        <PromoBanner 
          data={data as unknown as PromoBannerData} 
          themeColor={themeColor} 
        />
      );

    case 'testimonials':
    case 'reviews-carousel':
      return (
        <TestimonialsCarousel 
          data={data as unknown as TestimonialsData} 
          themeColor={themeColor} 
        />
      );

    case 'image-with-text':
      return wrapSection(
        <ImageWithText 
          data={data as unknown as ImageWithTextData} 
          themeColor={themeColor} 
        />
      );

    case 'multicolumn':
      return wrapSection(
        <Multicolumn 
          data={data as unknown as MulticolumnData} 
          themeColor={themeColor} 
        />
      );

    case 'newsletter':
      return wrapSection(
        <Newsletter 
          data={data as unknown as NewsletterData} 
          themeColor={themeColor} 
        />
      );

    case 'contact-info':
      return wrapSection(
        <ContactInfo 
          data={data as unknown as ContactInfoData} 
          themeColor={themeColor} 
        />
      );

    // Logistics sections
    case 'shipment-timeline':
      return wrapSection(
        <ShipmentTimeline 
          data={data as unknown as ShipmentTimelineData} 
          themeColor={themeColor} 
        />
      );

    case 'pricing-table':
      return wrapSection(
        <PricingTable 
          data={data as unknown as PricingTableData} 
          themeColor={themeColor} 
        />
      );

    case 'warehouse-gallery':
      return wrapSection(
        <WarehouseGallery 
          data={data as unknown as WarehouseGalleryData} 
          themeColor={themeColor} 
        />
      );

    case 'process-steps':
      return wrapSection(
        <ProcessSteps 
          data={data as unknown as ProcessStepsData} 
          themeColor={themeColor} 
        />
      );

    case 'quote-form':
      return wrapSection(
        <QuoteForm 
          data={data as unknown as QuoteFormData} 
          themeColor={themeColor} 
        />
      );

    case 'logo-list':
      return wrapSection(
        <LogoList 
          data={data as unknown as LogoListData} 
          themeColor={themeColor} 
        />
      );

    case 'footer':
      return (
        <Footer 
          data={data as unknown as FooterData} 
          themeColor={themeColor} 
        />
      );

    // Legacy sections (backward compatibility)
    case 'hero':
      return <HeroSection data={data as Record<string, unknown>} _themeColor={themeColor} />;

    case 'services':
      return <ServicesSection data={data as Record<string, unknown>} _themeColor={themeColor} />;

    case 'products':
      return (
        <ProductsSection 
          data={data as Record<string, unknown>} 
          themeColor={themeColor}
          companyId={companyId}
          companySlug={companySlug}
        />
      );

    case 'contact':
    case 'contact-form':
      return <ContactSection data={data as Record<string, unknown>} _themeColor={themeColor} />;

    case 'about':
      return <AboutSection data={data as Record<string, unknown>} _themeColor={themeColor} />;

    default:
      // Fallback for unknown section types
      return (
        <div className="py-16 px-4 text-center text-gray-500">
          <p>Unknown section type: {section.type}</p>
        </div>
      );
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getSectionStyles(settings?: SectionSettings): React.CSSProperties {
  if (!settings) return {};

  return {
    backgroundColor: settings.backgroundColor || 'transparent',
    paddingTop: settings.paddingTop ? `${settings.paddingTop}px` : undefined,
    paddingBottom: settings.paddingBottom ? `${settings.paddingBottom}px` : undefined,
    paddingLeft: settings.paddingLeft ? `${settings.paddingLeft}px` : undefined,
    paddingRight: settings.paddingRight ? `${settings.paddingRight}px` : undefined,
    marginTop: settings.marginTop ? `${settings.marginTop}px` : undefined,
    marginBottom: settings.marginBottom ? `${settings.marginBottom}px` : undefined,
    minHeight: settings.minHeight ? `${settings.minHeight}px` : undefined,
  };
}
