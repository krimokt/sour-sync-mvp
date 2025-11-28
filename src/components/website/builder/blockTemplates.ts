import { 
  WebsiteSection, 
  WebsiteBlock, 
  SectionType, 
  BlockType,
  SectionSettings,
  BlockSettings,
  SectionTemplate,
  AnnouncementBarData,
  HeroSliderData,
  HeroBannerData,
  FeaturedCollectionData,
  PromoBannerData,
  TestimonialsData,
  ImageWithTextData,
  MulticolumnData,
  NewsletterData,
  FooterData,
} from '@/types/website';

// ============================================
// BLOCK FACTORY
// ============================================

export function createBlockByType(type: BlockType): WebsiteBlock {
  return {
    id: crypto.randomUUID(),
    type,
    data: getDefaultBlockData(type),
    settings: getDefaultBlockSettings(type),
  };
}

export function getDefaultBlockData(type: BlockType): Record<string, unknown> {
  switch (type) {
    case 'heading':
      return { text: 'Your Heading Here', level: 'h2' };
    case 'subheading':
      return { text: 'Your subheading text goes here' };
    case 'paragraph':
      return { text: 'Enter your paragraph text here. You can describe your products, services, or any other content.' };
    case 'rich-text':
      return { html: '<p>Enter your rich text content here.</p>' };
    case 'image':
      return { src: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', alt: 'Image' };
    case 'video':
      return { src: '', poster: '', autoplay: false, loop: false, muted: true };
    case 'image-gallery':
      return { images: [], columns: 3, gap: 16 };
    case 'button':
      return { text: 'Shop Now', link: '/shop' };
    case 'button-group':
      return { buttons: [{ text: 'Primary', link: '#', variant: 'primary' }, { text: 'Secondary', link: '#', variant: 'outline' }] };
    case 'link-list':
      return { links: [] };
    case 'product-card':
      return { productId: '', showQuickAdd: true, showCompare: true, showWishlist: true };
    case 'collection-card':
      return { collectionId: '', title: 'Collection Name' };
    case 'service-card':
      return { title: 'Service Title', description: 'Describe your service here', icon: 'Package' };
    case 'testimonial-card':
      return { quote: 'Amazing product! Highly recommended.', author: 'John Doe', role: 'Customer', rating: 5 };
    case 'team-member':
      return { name: 'Team Member', role: 'Position', bio: '' };
    case 'feature-card':
      return { title: 'Feature Title', description: 'Feature description', icon: 'Star' };
    case 'icon-box':
      return { icon: 'Package', title: 'Icon Box', description: 'Description text' };
    case 'divider':
      return { style: 'solid', thickness: 1, color: '#e5e7eb' };
    case 'spacer':
      return { height: 40, mobileHeight: 24 };
    case 'columns':
      return { columns: [], gap: 24, mobileStack: true };
    case 'countdown':
      return { endDate: '', title: 'Sale Ends In', subtitle: '' };
    case 'newsletter-form':
      return { title: 'Subscribe', subtitle: 'Get the latest updates', buttonText: 'Subscribe', placeholder: 'Enter your email' };
    case 'contact-form':
      return { title: 'Contact Us', fields: [], submitText: 'Send Message' };
    case 'social-links':
      return { links: [], showLabels: false, size: 'md' };
    case 'announcement-text':
      return { text: 'Free shipping on orders over $50', link: '/shipping' };
    case 'brand-logo':
      return { src: '', alt: 'Logo', maxWidth: 150 };
    case 'rating-stars':
      return { rating: 5, maxRating: 5, showLabel: true };
    default:
      return {};
  }
}

export function getDefaultBlockSettings(type: BlockType): BlockSettings {
  const common: BlockSettings = {
    marginBottom: 16,
  };

  switch (type) {
    case 'heading':
      return { ...common, fontSize: '3xl', fontWeight: 'bold', textAlign: 'left' };
    case 'subheading':
      return { ...common, fontSize: 'lg', fontWeight: 'normal', textColor: '#6b7280', textAlign: 'left' };
    case 'paragraph':
      return { ...common, fontSize: 'base', lineHeight: 'relaxed', textColor: '#374151' };
    case 'button':
      return { ...common, buttonVariant: 'primary', buttonSize: 'md' };
    case 'image':
      return { ...common, imageWidth: 'full', objectFit: 'cover', borderRadius: 'lg' };
    case 'testimonial-card':
      return { ...common, backgroundColor: '#ffffff', borderRadius: 'xl', shadow: 'md', paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24 };
    case 'service-card':
    case 'feature-card':
      return { ...common, backgroundColor: '#ffffff', borderRadius: 'xl', shadow: 'sm', paddingTop: 32, paddingBottom: 32, paddingLeft: 24, paddingRight: 24, textAlign: 'center' };
    case 'divider':
      return { ...common, marginTop: 24, marginBottom: 24 };
    default:
      return common;
  }
}

// ============================================
// SECTION FACTORY
// ============================================

export function createSection(type: SectionType): WebsiteSection {
  return {
    id: crypto.randomUUID(),
    type,
    name: getSectionDefaultName(type),
    blocks: getDefaultSectionBlocks(type),
    settings: getDefaultSectionSettings(type),
    data: getDefaultSectionData(type),
  };
}

function getSectionDefaultName(type: SectionType): string {
  const names: Partial<Record<SectionType, string>> = {
    'announcement-bar': 'Announcement',
    'header': 'Header',
    'hero-slider': 'Hero Slideshow',
    'hero-banner': 'Hero Banner',
    'featured-collection': 'Featured Products',
    'testimonials': 'Customer Reviews',
    'promo-banner': 'Promotional Banner',
    'newsletter': 'Newsletter Signup',
    'footer': 'Footer',
  };
  return names[type] || type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function getDefaultSectionSettings(type: SectionType): SectionSettings {
  const common: SectionSettings = {
    paddingTop: 64,
    paddingBottom: 64,
    maxWidth: 'xl',
    contentAlignment: 'center',
  };

  switch (type) {
    case 'announcement-bar':
      return {
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: '#1f2937',
        maxWidth: 'full',
        fullWidth: true,
      };
    case 'header':
      return {
        paddingTop: 0,
        paddingBottom: 0,
        backgroundColor: '#ffffff',
        maxWidth: 'full',
        fullWidth: true,
        stickyHeader: true,
        borderBottom: true,
        borderColor: '#e5e7eb',
      };
    case 'hero-slider':
    case 'hero-banner':
      return {
        paddingTop: 0,
        paddingBottom: 0,
        maxWidth: 'full',
        fullWidth: true,
        minHeight: 600,
      };
    case 'featured-collection':
    case 'product-carousel':
      return {
        ...common,
        paddingTop: 80,
        paddingBottom: 80,
        backgroundColor: '#ffffff',
      };
    case 'testimonials':
      return {
        ...common,
        paddingTop: 80,
        paddingBottom: 80,
        backgroundColor: '#f9fafb',
      };
    case 'promo-banner':
    case 'split-banner':
      return {
        paddingTop: 0,
        paddingBottom: 0,
        maxWidth: 'xl',
      };
    case 'newsletter':
      return {
        ...common,
        paddingTop: 80,
        paddingBottom: 80,
        backgroundColor: '#1f2937',
      };
    case 'footer':
      return {
        paddingTop: 64,
        paddingBottom: 32,
        backgroundColor: '#111827',
        maxWidth: 'full',
        fullWidth: true,
      };
    default:
      return common;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDefaultSectionBlocks(type: SectionType): WebsiteBlock[] {
  // Most sections use data instead of blocks for their primary content
  // Blocks are used for custom additions within sections
  return [];
}

function getDefaultSectionData(type: SectionType): Record<string, unknown> {
  switch (type) {
    case 'announcement-bar':
      return {
        announcements: [
          { text: 'Welcome to our store', link: '#' },
          { text: 'Free shipping on orders over $50', link: '/shipping' },
        ],
        showSocialLinks: true,
        socialLinks: [
          { platform: 'instagram', url: '#' },
          { platform: 'twitter', url: '#' },
          { platform: 'facebook', url: '#' },
        ],
        autoRotate: true,
        rotationSpeed: 4000,
      } as AnnouncementBarData;

    case 'hero-slider':
      return {
        slides: [
          {
            id: crypto.randomUUID(),
            title: 'Summer Style Sensations.',
            subtitle: 'Having plain clothing makes you look ordinary. We can assist you in choosing the right dresses with our collection.',
            buttonText: 'Shop Now',
            buttonLink: '/shop',
            image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200',
            imagePosition: 'right',
            textAlignment: 'left',
          },
          {
            id: crypto.randomUUID(),
            title: 'New Arrivals',
            subtitle: 'Discover our latest collection of premium fashion items.',
            buttonText: 'Explore',
            buttonLink: '/new-arrivals',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
            imagePosition: 'right',
            textAlignment: 'left',
          },
        ],
        autoplay: true,
        autoplaySpeed: 5000,
        showArrows: true,
        showDots: false,
        height: 600,
        mobileHeight: 500,
      } as HeroSliderData;

    case 'hero-banner':
      return {
        title: 'New Collection',
        subtitle: 'Discover our latest arrivals and find your perfect style.',
        buttonText: 'Shop Now',
        buttonLink: '/shop',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
        imagePosition: 'background',
        textAlignment: 'center',
        overlayColor: '#000000',
        overlayOpacity: 0.4,
      } as HeroBannerData;

    case 'featured-collection':
    case 'product-carousel':
      return {
        title: 'Featured Products',
        subtitle: 'Handpicked selections just for you',
        limit: 8,
        columns: 4,
        showViewAll: true,
        viewAllLink: '/collections/all',
        viewAllText: 'View All',
        layout: 'carousel',
        showQuickAdd: true,
        showCompare: true,
        showWishlist: true,
        showRating: true,
        showPrice: true,
        showBadges: true,
      } as FeaturedCollectionData;

    case 'promo-banner':
    case 'split-banner':
      return {
        banners: [
          {
            id: crypto.randomUUID(),
            title: 'Spring Collection',
            subtitle: 'Free Shipping Over Order $150',
            buttonText: 'Explore now',
            buttonLink: '/collections/spring',
            image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
            backgroundColor: '#fef3c7',
          },
          {
            id: crypto.randomUUID(),
            title: '-25% Off Items',
            subtitle: 'Limited time offer',
            buttonText: 'Explore now',
            buttonLink: '/sale',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
            backgroundColor: '#dbeafe',
          },
        ],
        layout: 'split',
      } as PromoBannerData;

    case 'testimonials':
      return {
        title: 'Customer Reviews',
        subtitle: 'What our customers say about us',
        testimonials: [
          {
            id: crypto.randomUUID(),
            quote: 'I absolutely love shopping here! The selection is fantastic, the prices are competitive, Highly recommend.',
            author: 'Wade Warren',
            role: 'Customer',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            rating: 5,
          },
          {
            id: crypto.randomUUID(),
            quote: 'I had a great experience shopping on this website. The interface is user-friendly, making it easy to find what I needed.',
            author: 'Kristin Watson',
            role: 'Customer',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
            rating: 5,
          },
          {
            id: crypto.randomUUID(),
            quote: "I'm so impressed with the level of customer service I received. I had an issue with my order, and the support team resolved it quickly.",
            author: 'Esther Howard',
            role: 'Designer',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
            rating: 5,
          },
        ],
        layout: 'carousel',
        showRating: true,
        showAvatar: true,
      } as TestimonialsData;

    case 'image-with-text':
      return {
        title: 'About Our Brand',
        subtitle: 'Quality & Craftsmanship',
        content: 'We believe in creating products that last. Every item in our collection is carefully crafted with attention to detail and quality materials.',
        buttonText: 'Learn More',
        buttonLink: '/about',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
        imagePosition: 'right',
        imageWidth: 'half',
        verticalAlignment: 'center',
      } as ImageWithTextData;

    case 'multicolumn':
      return {
        title: 'Why Choose Us',
        columns: [
          {
            id: crypto.randomUUID(),
            icon: 'Truck',
            title: 'Free Shipping',
            content: 'Free shipping on all orders over $50',
          },
          {
            id: crypto.randomUUID(),
            icon: 'ShieldCheck',
            title: 'Secure Payment',
            content: '100% secure payment processing',
          },
          {
            id: crypto.randomUUID(),
            icon: 'RotateCcw',
            title: 'Easy Returns',
            content: '30-day hassle-free returns',
          },
          {
            id: crypto.randomUUID(),
            icon: 'Headphones',
            title: '24/7 Support',
            content: 'Dedicated customer support',
          },
        ],
        columnsDesktop: 4,
        columnsMobile: 2,
      } as MulticolumnData;

    case 'newsletter':
      return {
        title: 'Join Our Newsletter',
        subtitle: 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.',
        buttonText: 'Subscribe',
        placeholder: 'Enter your email address',
        layout: 'simple',
      } as NewsletterData;

    case 'footer':
      return {
        columns: [
          {
            id: crypto.randomUUID(),
            title: 'Quick Links',
            type: 'links',
            links: [
              { text: 'Shop All', link: '/shop' },
              { text: 'About Us', link: '/about' },
              { text: 'Contact', link: '/contact' },
              { text: 'FAQ', link: '/faq' },
            ],
          },
          {
            id: crypto.randomUUID(),
            title: 'Customer Service',
            type: 'links',
            links: [
              { text: 'Shipping Info', link: '/shipping' },
              { text: 'Returns', link: '/returns' },
              { text: 'Size Guide', link: '/size-guide' },
              { text: 'Track Order', link: '/track-order' },
            ],
          },
          {
            id: crypto.randomUUID(),
            title: 'Contact Us',
            type: 'contact',
          },
          {
            id: crypto.randomUUID(),
            title: 'Follow Us',
            type: 'social',
            socialLinks: [
              { platform: 'instagram', url: '#' },
              { platform: 'facebook', url: '#' },
              { platform: 'twitter', url: '#' },
              { platform: 'pinterest', url: '#' },
            ],
          },
        ],
        showPaymentIcons: true,
        paymentIcons: ['visa', 'mastercard', 'amex', 'paypal', 'applepay'],
        copyright: '© 2024 Your Store. All rights reserved.',
        bottomLinks: [
          { text: 'Privacy Policy', link: '/privacy' },
          { text: 'Terms of Service', link: '/terms' },
        ],
      } as FooterData;

    default:
      return {};
  }
}

// ============================================
// SECTION TEMPLATES LIBRARY
// ============================================

export const sectionTemplates: SectionTemplate[] = [
  // Hero Templates
  {
    id: 'hero-slider-fashion',
    name: 'Fashion Hero Slider',
    description: 'Full-width slider with large images and text overlay',
    category: 'hero',
    type: 'hero-slider',
    thumbnail: '/templates/hero-slider-fashion.jpg',
    defaultData: {
      slides: [
        {
          id: '1',
          title: 'Summer Style Sensations.',
          subtitle: 'Having plain clothing makes you look ordinary. We can assist you in choosing the right dresses.',
          buttonText: 'Shop Now',
          buttonLink: '/shop',
          image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200',
          imagePosition: 'right',
          textAlignment: 'left',
        },
      ],
      autoplay: true,
      showArrows: true,
    },
    defaultSettings: {
      paddingTop: 0,
      paddingBottom: 0,
      maxWidth: 'full',
      minHeight: 600,
    },
  },
  {
    id: 'hero-banner-centered',
    name: 'Centered Hero Banner',
    description: 'Full-width banner with centered text and overlay',
    category: 'hero',
    type: 'hero-banner',
    thumbnail: '/templates/hero-banner-centered.jpg',
    defaultData: {
      title: 'New Collection 2024',
      subtitle: 'Discover the latest trends in fashion',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      imagePosition: 'background',
      textAlignment: 'center',
      overlayOpacity: 0.5,
    },
    defaultSettings: {
      paddingTop: 0,
      paddingBottom: 0,
      maxWidth: 'full',
      minHeight: 500,
    },
  },

  // Product Templates
  {
    id: 'product-carousel-modern',
    name: 'Modern Product Carousel',
    description: 'Horizontal scrolling product showcase with quick actions',
    category: 'product',
    type: 'featured-collection',
    thumbnail: '/templates/product-carousel-modern.jpg',
    defaultData: {
      title: 'Trending Now',
      layout: 'carousel',
      showQuickAdd: true,
      showWishlist: true,
      showRating: true,
    },
    defaultSettings: {
      paddingTop: 80,
      paddingBottom: 80,
      backgroundColor: '#ffffff',
    },
  },
  {
    id: 'product-grid-minimal',
    name: 'Minimal Product Grid',
    description: 'Clean grid layout for product display',
    category: 'product',
    type: 'product-grid',
    thumbnail: '/templates/product-grid-minimal.jpg',
    defaultData: {
      title: 'Our Products',
      columns: 4,
      layout: 'grid',
    },
    defaultSettings: {
      paddingTop: 64,
      paddingBottom: 64,
    },
  },

  // Promotional Templates
  {
    id: 'split-banner-promo',
    name: 'Split Promotional Banner',
    description: 'Two side-by-side promotional banners',
    category: 'promo',
    type: 'split-banner',
    thumbnail: '/templates/split-banner-promo.jpg',
    defaultData: {
      banners: [
        { id: '1', title: 'Spring Collection', buttonText: 'Explore' },
        { id: '2', title: '-25% Off Items', buttonText: 'Shop Sale' },
      ],
      layout: 'split',
    },
    defaultSettings: {
      paddingTop: 32,
      paddingBottom: 32,
    },
  },

  // Testimonial Templates
  {
    id: 'testimonials-carousel',
    name: 'Testimonials Carousel',
    description: 'Rotating customer reviews with ratings',
    category: 'testimonial',
    type: 'testimonials',
    thumbnail: '/templates/testimonials-carousel.jpg',
    defaultData: {
      title: 'What Our Customers Say',
      layout: 'carousel',
      showRating: true,
      showAvatar: true,
    },
    defaultSettings: {
      paddingTop: 80,
      paddingBottom: 80,
      backgroundColor: '#f9fafb',
    },
  },

  // Newsletter Templates
  {
    id: 'newsletter-dark',
    name: 'Dark Newsletter',
    description: 'Newsletter signup with dark background',
    category: 'newsletter',
    type: 'newsletter',
    thumbnail: '/templates/newsletter-dark.jpg',
    defaultData: {
      title: 'Stay Updated',
      subtitle: 'Subscribe for exclusive offers and updates',
      buttonText: 'Subscribe',
    },
    defaultSettings: {
      paddingTop: 80,
      paddingBottom: 80,
      backgroundColor: '#1f2937',
    },
  },

  // Content Templates
  {
    id: 'image-text-alternating',
    name: 'Image with Text',
    description: 'Image and text side by side',
    category: 'content',
    type: 'image-with-text',
    thumbnail: '/templates/image-text.jpg',
    defaultData: {
      title: 'Our Story',
      content: 'Tell your brand story here...',
      imagePosition: 'right',
    },
    defaultSettings: {
      paddingTop: 80,
      paddingBottom: 80,
    },
  },
  {
    id: 'multicolumn-features',
    name: 'Feature Columns',
    description: 'Multiple columns with icons and text',
    category: 'content',
    type: 'multicolumn',
    thumbnail: '/templates/multicolumn-features.jpg',
    defaultData: {
      title: 'Why Choose Us',
      columnsDesktop: 4,
    },
    defaultSettings: {
      paddingTop: 64,
      paddingBottom: 64,
      backgroundColor: '#f9fafb',
    },
  },
];

// ============================================
// TEMPLATE HELPERS
// ============================================

export function getTemplatesByCategory(category: SectionTemplate['category']): SectionTemplate[] {
  return sectionTemplates.filter(t => t.category === category);
}

export function getTemplateById(id: string): SectionTemplate | undefined {
  return sectionTemplates.find(t => t.id === id);
}

export function createSectionFromTemplate(template: SectionTemplate): WebsiteSection {
  return {
    id: crypto.randomUUID(),
    type: template.type,
    name: template.name,
    blocks: [],
    settings: { ...template.defaultSettings },
    data: { ...template.defaultData },
  };
}

// ============================================
// SECTION CATEGORIES
// ============================================

export const sectionCategories = [
  { id: 'header', label: 'Header', icon: 'LayoutTop' },
  { id: 'hero', label: 'Hero', icon: 'Image' },
  { id: 'product', label: 'Products', icon: 'ShoppingBag' },
  { id: 'content', label: 'Content', icon: 'FileText' },
  { id: 'testimonial', label: 'Testimonials', icon: 'MessageSquare' },
  { id: 'promo', label: 'Promotional', icon: 'Tag' },
  { id: 'newsletter', label: 'Newsletter', icon: 'Mail' },
  { id: 'footer', label: 'Footer', icon: 'LayoutBottom' },
] as const;

export type SectionCategory = typeof sectionCategories[number]['id'];

// ============================================
// DISPLAY NAME HELPERS
// ============================================

export function getSectionTypeName(type: SectionType): string {
  const names: Partial<Record<SectionType, string>> = {
    'hero': 'Slideshow',
    'hero-slider': 'Slideshow',
    'hero-banner': 'Hero Banner',
    'services': 'Multicolumn',
    'multicolumn': 'Multicolumn',
    'products': 'Featured Collection',
    'featured-collection': 'Featured Collection',
    'product-grid': 'Product Grid',
    'product-carousel': 'Product Carousel',
    'testimonials': 'Testimonials',
    'about': 'Rich Text',
    'image-with-text': 'Image with Text',
    'gallery': 'Image Gallery',
    'contact': 'Contact Form',
    'cta': 'Newsletter',
    'newsletter': 'Newsletter',
    'promo-banner': 'Promo Banner',
    'split-banner': 'Split Banner',
    'header': 'Header',
    'footer': 'Footer',
    'announcement-bar': 'Announcement Bar',
  };
  return names[type] || type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function getBlockTypeName(type: BlockType): string {
  const names: Partial<Record<BlockType, string>> = {
    'heading': 'Heading',
    'subheading': 'Subheading',
    'paragraph': 'Paragraph',
    'rich-text': 'Rich Text',
    'image': 'Image',
    'video': 'Video',
    'image-gallery': 'Image Gallery',
    'button': 'Button',
    'button-group': 'Button Group',
    'link-list': 'Link List',
    'product-card': 'Product Card',
    'collection-card': 'Collection Card',
    'service-card': 'Service Card',
    'testimonial-card': 'Testimonial',
    'team-member': 'Team Member',
    'feature-card': 'Feature',
    'icon-box': 'Icon Box',
    'divider': 'Divider',
    'spacer': 'Spacer',
    'columns': 'Columns',
    'countdown': 'Countdown',
    'newsletter-form': 'Newsletter Form',
    'contact-form': 'Contact Form',
    'social-links': 'Social Links',
    'announcement-text': 'Announcement',
    'brand-logo': 'Logo',
    'rating-stars': 'Rating',
    // Legacy types
    'title': 'Title',
    'subtitle': 'Subtitle',
    'text': 'Text',
    'service-item': 'Service Item',
    'product-item': 'Product Item',
  };
  return names[type] || type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function getAvailableBlockTypes(sectionType: SectionType): BlockType[] {
  // Common blocks available in most sections
  const commonBlocks: BlockType[] = ['heading', 'subheading', 'paragraph', 'image', 'button', 'divider', 'spacer'];
  
  // Section-specific blocks
  const sectionBlocks: Partial<Record<SectionType, BlockType[]>> = {
    'hero': [...commonBlocks, 'video'],
    'hero-slider': [...commonBlocks, 'video'],
    'hero-banner': [...commonBlocks, 'video'],
    'services': [...commonBlocks, 'service-card', 'icon-box', 'feature-card'],
    'multicolumn': [...commonBlocks, 'service-card', 'icon-box', 'feature-card'],
    'products': [...commonBlocks, 'product-card', 'collection-card'],
    'featured-collection': [...commonBlocks, 'product-card'],
    'testimonials': [...commonBlocks, 'testimonial-card'],
    'about': [...commonBlocks, 'rich-text', 'team-member'],
    'image-with-text': [...commonBlocks],
    'gallery': [...commonBlocks, 'image-gallery'],
    'contact': [...commonBlocks, 'contact-form', 'social-links'],
    'cta': [...commonBlocks, 'newsletter-form', 'countdown'],
    'newsletter': [...commonBlocks, 'newsletter-form'],
    'header': ['brand-logo', 'link-list', 'button', 'social-links'],
    'footer': ['heading', 'paragraph', 'link-list', 'social-links', 'newsletter-form'],
    'announcement-bar': ['announcement-text'],
  };

  return sectionBlocks[sectionType] || commonBlocks;
}
