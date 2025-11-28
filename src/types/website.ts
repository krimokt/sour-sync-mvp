// ============================================
// BLOCK TYPES - Individual draggable elements
// ============================================

export type BlockType = 
  // Text blocks
  | 'heading' 
  | 'subheading' 
  | 'paragraph'
  | 'rich-text'
  // Legacy text blocks (for backward compatibility)
  | 'title'
  | 'subtitle'
  | 'text'
  // Media blocks  
  | 'image' 
  | 'video'
  | 'image-gallery'
  // Interactive blocks
  | 'button'
  | 'button-group'
  | 'link-list'
  // Content blocks
  | 'product-card'
  | 'collection-card'
  | 'service-card'
  | 'testimonial-card'
  | 'team-member'
  | 'feature-card'
  | 'icon-box'
  // Legacy content blocks
  | 'service-item'
  | 'product-item'
  // Layout blocks
  | 'divider'
  | 'spacer'
  | 'columns'
  // Special blocks
  | 'countdown'
  | 'newsletter-form'
  | 'contact-form'
  | 'social-links'
  | 'announcement-text'
  | 'brand-logo'
  | 'rating-stars';

export interface BlockSettings {
  // Typography
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  fontFamily?: 'sans' | 'serif' | 'mono' | 'display';
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  lineHeight?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  
  // Spacing
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  
  // Appearance
  backgroundColor?: string;
  backgroundGradient?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  borderWidth?: number;
  borderColor?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  // Button specific
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  buttonFullWidth?: boolean;
  buttonIcon?: string;
  buttonIconPosition?: 'left' | 'right';
  
  // Image specific
  imageWidth?: 'auto' | 'full' | 'half' | 'third' | 'quarter';
  imageHeight?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | 'auto';
  imageOverlay?: string;
  
  // Animation
  animation?: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom-in' | 'bounce';
  animationDelay?: number;
  
  // Visibility
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
}

export interface WebsiteBlock {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  settings?: BlockSettings;
}

// ============================================
// BLOCK DATA INTERFACES
// ============================================

export interface HeadingBlockData {
  text: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface SubheadingBlockData {
  text: string;
}

export interface ParagraphBlockData {
  text: string;
}

export interface RichTextBlockData {
  html: string;
}

export interface ImageBlockData {
  src: string;
  alt?: string;
  caption?: string;
  link?: string;
}

export interface VideoBlockData {
  src: string;
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export interface ImageGalleryBlockData {
  images: { src: string; alt?: string }[];
  columns?: number;
  gap?: number;
}

export interface ButtonBlockData {
  text: string;
  link?: string;
  openInNewTab?: boolean;
}

export interface ButtonGroupBlockData {
  buttons: { text: string; link?: string; variant?: string }[];
}

export interface LinkListBlockData {
  links: { text: string; link: string; icon?: string }[];
}

export interface ProductCardBlockData {
  productId: string;
  showQuickAdd?: boolean;
  showCompare?: boolean;
  showWishlist?: boolean;
}

export interface CollectionCardBlockData {
  collectionId: string;
  imageUrl?: string;
  title?: string;
  productCount?: number;
}

export interface ServiceCardBlockData {
  title: string;
  description: string;
  icon?: string;
  link?: string;
}

export interface TestimonialCardBlockData {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export interface TeamMemberBlockData {
  name: string;
  role: string;
  bio?: string;
  image?: string;
  socialLinks?: { platform: string; url: string }[];
}

export interface FeatureCardBlockData {
  title: string;
  description: string;
  icon?: string;
  image?: string;
  link?: string;
}

export interface IconBoxBlockData {
  icon: string;
  title: string;
  description?: string;
}

export interface DividerBlockData {
  style?: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
  color?: string;
}

export interface SpacerBlockData {
  height: number;
  mobileHeight?: number;
}

export interface ColumnsBlockData {
  columns: { width: string; blocks: WebsiteBlock[] }[];
  gap?: number;
  mobileStack?: boolean;
}

export interface CountdownBlockData {
  endDate: string;
  title?: string;
  subtitle?: string;
}

export interface NewsletterFormBlockData {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  placeholder?: string;
}

export interface ContactFormBlockData {
  title?: string;
  fields: { name: string; type: string; required?: boolean; placeholder?: string }[];
  submitText?: string;
}

export interface SocialLinksBlockData {
  links: { platform: string; url: string }[];
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface AnnouncementTextBlockData {
  text: string;
  link?: string;
}

export interface BrandLogoBlockData {
  src: string;
  alt?: string;
  link?: string;
  maxWidth?: number;
}

export interface RatingStarsBlockData {
  rating: number;
  maxRating?: number;
  showLabel?: boolean;
}

// ============================================
// SECTION TYPES - Shopify-style sections
// ============================================

export type SectionType = 
  // Header sections
  | 'announcement-bar'
  | 'header'
  // Hero sections
  | 'hero-slider'
  | 'hero-banner'
  | 'hero-split'
  | 'hero-video'
  | 'hero' // Legacy
  // Collection sections
  | 'featured-collection'
  | 'collection-list'
  | 'product-grid'
  | 'product-carousel'
  | 'products' // Legacy
  // Content sections
  | 'rich-text'
  | 'image-with-text'
  | 'image-banner'
  | 'multicolumn'
  | 'collage'
  | 'services' // Legacy
  | 'about' // Legacy
  | 'gallery' // Legacy
  // Social proof sections
  | 'testimonials'
  | 'logo-list'
  | 'reviews-carousel'
  // Promotional sections
  | 'promo-banner'
  | 'countdown-banner'
  | 'split-banner'
  | 'cta' // Legacy
  // Blog sections
  | 'blog-posts'
  | 'featured-blog'
  // Contact sections
  | 'contact-form'
  | 'map'
  | 'contact-info'
  | 'contact' // Legacy
  // Newsletter sections
  | 'newsletter'
  // Logistics sections
  | 'shipment-timeline'
  | 'pricing-table'
  | 'warehouse-gallery'
  | 'process-steps'
  | 'quote-form'
  // Footer sections
  | 'footer';

export interface SectionSettings {
  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundOverlay?: string;
  backgroundOverlayOpacity?: number;
  
  // Spacing
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  
  // Layout
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  contentAlignment?: 'left' | 'center' | 'right';
  verticalAlignment?: 'top' | 'center' | 'bottom';
  minHeight?: number;
  fullWidth?: boolean;
  
  // Appearance
  borderTop?: boolean;
  borderBottom?: boolean;
  borderColor?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Visibility
  isHidden?: boolean;
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  
  // Animation
  animation?: 'none' | 'fade-in' | 'slide-up' | 'zoom-in';
  
  // Section-specific
  stickyHeader?: boolean;
  transparentHeader?: boolean;
  
  // Advanced
  customClassName?: string;
  customId?: string;
}

// ============================================
// SECTION DATA INTERFACES (Legacy + New)
// ============================================

// Announcement Bar
export interface AnnouncementBarData {
  announcements: { text: string; link?: string }[];
  showSocialLinks?: boolean;
  socialLinks?: { platform: string; url: string }[];
  showLanguageSelector?: boolean;
  showCurrencySelector?: boolean;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

// Header
export interface HeaderData {
  logo?: { src: string; alt?: string; width?: number };
  navigation?: { label: string; link: string; children?: { label: string; link: string }[] }[];
  showSearch?: boolean;
  showAccount?: boolean;
  showWishlist?: boolean;
  showCart?: boolean;
  menuStyle?: 'horizontal' | 'mega' | 'minimal' | 'split' | 'centered' | 'logistics';
  stickyHeader?: boolean;
  showAnnouncementBar?: boolean;
  ctaText?: string;
  ctaLink?: string;
  logoPosition?: 'left' | 'center' | 'right';
  menuPosition?: 'left' | 'center' | 'right';
  showContactStrip?: boolean;
  contactEmail?: string;
  contactPhone?: string;
}

// Hero Slider
export interface HeroSliderData {
  slides: {
    id: string;
    title: string;
    subtitle?: string;
    buttonText?: string;
    buttonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    image?: string;
    imagePosition?: 'left' | 'right' | 'center' | 'background';
    textAlignment?: 'left' | 'center' | 'right';
    overlayColor?: string;
    overlayOpacity?: number;
  }[];
  autoplay?: boolean;
  autoplaySpeed?: number;
  showArrows?: boolean;
  showDots?: boolean;
  height?: number;
  mobileHeight?: number;
}

// Hero Banner
export interface HeroBannerData {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image?: string;
  imagePosition?: 'left' | 'right' | 'background';
  textAlignment?: 'left' | 'center' | 'right';
  overlayColor?: string;
  overlayOpacity?: number;
}

// Featured Collection / Product Carousel
export interface FeaturedCollectionData {
  title?: string;
  subtitle?: string;
  collectionId?: string;
  productIds?: string[];
  limit?: number;
  columns?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  viewAllText?: string;
  layout?: 'grid' | 'carousel';
  showQuickAdd?: boolean;
  showCompare?: boolean;
  showWishlist?: boolean;
  showRating?: boolean;
  showPrice?: boolean;
  showBadges?: boolean;
}

// Collection List
export interface CollectionListData {
  title?: string;
  collections: {
    id: string;
    title: string;
    image?: string;
    link?: string;
  }[];
  columns?: number;
  layout?: 'grid' | 'carousel';
}

// Promotional Banner
export interface PromoBannerData {
  banners: {
    id: string;
    title: string;
    subtitle?: string;
    badge?: string;
    buttonText?: string;
    buttonLink?: string;
    image?: string;
    backgroundColor?: string;
    textColor?: string;
  }[];
  layout?: 'single' | 'split' | 'triple';
}

// Testimonials
export interface TestimonialsData {
  title?: string;
  subtitle?: string;
  testimonials: {
    id: string;
    quote: string;
    author: string;
    role?: string;
    company?: string;
    avatar?: string;
    rating?: number;
  }[];
  layout?: 'grid' | 'carousel' | 'masonry';
  columns?: number;
  showRating?: boolean;
  showAvatar?: boolean;
}

// Logo List
export interface LogoListData {
  title?: string;
  logos: { src: string; alt?: string; link?: string }[];
  columns?: number;
  autoScroll?: boolean;
  grayscale?: boolean;
}

// Image with Text
export interface ImageWithTextData {
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  imagePosition?: 'left' | 'right';
  imageWidth?: 'half' | 'third' | 'two-thirds';
  verticalAlignment?: 'top' | 'center' | 'bottom';
}

// Multicolumn
export interface MulticolumnData {
  title?: string;
  subtitle?: string;
  columns: {
    id: string;
    icon?: string;
    image?: string;
    title?: string;
    content?: string;
    buttonText?: string;
    buttonLink?: string;
  }[];
  columnsDesktop?: number;
  columnsMobile?: number;
}

// Newsletter
export interface NewsletterData {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  placeholder?: string;
  image?: string;
  layout?: 'simple' | 'with-image' | 'full-width';
}

// Contact Form
export interface ContactFormData {
  title?: string;
  subtitle?: string;
  fields: { name: string; type: string; required?: boolean; placeholder?: string; options?: string[] }[];
  submitText?: string;
  successMessage?: string;
}

// Contact Info
export interface ContactInfoData {
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
  mapUrl?: string;
  showMap?: boolean;
}

// Blog Posts
export interface BlogPostsData {
  title?: string;
  subtitle?: string;
  postIds?: string[];
  limit?: number;
  showDate?: boolean;
  showAuthor?: boolean;
  showExcerpt?: boolean;
  columns?: number;
  layout?: 'grid' | 'carousel' | 'list';
}

// Footer
export interface FooterData {
  columns: {
    id: string;
    title?: string;
    type: 'links' | 'text' | 'newsletter' | 'social' | 'contact';
    links?: { text: string; link: string }[];
    content?: string;
    socialLinks?: { platform: string; url: string }[];
  }[];
  showPaymentIcons?: boolean;
  paymentIcons?: string[];
  copyright?: string;
  bottomLinks?: { text: string; link: string }[];
}

// Shipment Timeline
export interface ShipmentTimelineData {
  title?: string;
  steps: {
    title: string;
    description?: string;
    icon?: string;
    status?: 'completed' | 'current' | 'pending';
  }[];
}

// Pricing Table
export interface PricingTableData {
  title?: string;
  subtitle?: string;
  plans: {
    id: string;
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    buttonText?: string;
    buttonLink?: string;
    isPopular?: boolean;
    highlightColor?: string;
  }[];
}

// Warehouse Gallery
export interface WarehouseGalleryData {
  title?: string;
  subtitle?: string;
  images: {
    src: string;
    alt?: string;
    caption?: string;
  }[];
  layout?: 'grid' | 'masonry' | 'slider';
  columns?: number;
}

// Process Steps (Our Process)
export interface ProcessStepsData {
  title?: string;
  subtitle?: string;
  steps: {
    number: string;
    title: string;
    description: string;
    image?: string;
  }[];
}

// Quote Form
export interface QuoteFormData {
  title?: string;
  subtitle?: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'email' | 'textarea' | 'select' | 'file';
    required?: boolean;
    options?: string[];
  }[];
  submitText?: string;
}

// Union type for all section data
export type SectionData = 
  | AnnouncementBarData 
  | HeaderData 
  | HeroSliderData 
  | HeroBannerData
  | FeaturedCollectionData 
  | CollectionListData
  | PromoBannerData
  | TestimonialsData 
  | LogoListData
  | ImageWithTextData
  | MulticolumnData
  | NewsletterData
  | ContactFormData
  | ContactInfoData
  | BlogPostsData
  | FooterData
  | ShipmentTimelineData
  | PricingTableData
  | WarehouseGalleryData
  | ProcessStepsData
  | QuoteFormData;

// ============================================
// WEBSITE SECTION - Main structure
// ============================================

export interface WebsiteSection {
  id: string;
  type: SectionType;
  name?: string; // Custom name for the section
  blocks?: WebsiteBlock[];
  settings?: SectionSettings;
  data?: SectionData | Record<string, unknown>;
}

// ============================================
// WEBSITE SETTINGS - Full configuration
// ============================================

export interface WebsiteSettings {
  id: string;
  company_id: string;
  theme_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color?: string;
  font_heading?: string;
  font_body?: string;
  homepage_layout_draft: WebsiteSection[];
  homepage_layout_published: WebsiteSection[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Theme settings
  button_style?: 'rounded' | 'square' | 'pill';
  card_style?: 'flat' | 'shadow' | 'bordered';
  animation_enabled?: boolean;
  // Social links
  social_links?: { platform: string; url: string }[];
  // SEO
  meta_title?: string;
  meta_description?: string;
  // Custom CSS/JS
  custom_css?: string;
  custom_head_code?: string;
}

export interface WebsitePage {
  id: string;
  company_id: string;
  slug: string;
  title: string;
  content: WebsiteSection[]; // draft content
  published_content?: WebsiteSection[]; // published content (if we implement draft/publish split)
  type: 'custom' | 'home' | 'contact' | 'terms' | 'privacy';
  is_published: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// SECTION TEMPLATES - Pre-defined layouts
// ============================================

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'header' | 'hero' | 'product' | 'content' | 'testimonial' | 'promo' | 'newsletter' | 'footer';
  type: SectionType;
  thumbnail?: string;
  previewImage?: string;
  defaultData: SectionData | Record<string, unknown>;
  defaultSettings: SectionSettings;
  isPremium?: boolean;
}

// ============================================
// BUILDER STATE TYPES
// ============================================

export interface DragItem {
  id: string;
  type: 'section' | 'block' | 'template';
  sectionId?: string;
  templateId?: string;
}

export interface DropResult {
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
}

export interface BuilderState {
  layout: WebsiteSection[];
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  isDragging: boolean;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  isPreviewMode: boolean;
  undoStack: WebsiteSection[][];
  redoStack: WebsiteSection[][];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function hasBlocks(section: WebsiteSection): boolean {
  return Array.isArray(section.blocks) && section.blocks.length > 0;
}

export function hasLegacyData(section: WebsiteSection): boolean {
  return section.data !== undefined && !hasBlocks(section);
}

export function getSectionDisplayName(type: SectionType): string {
  const names: Partial<Record<SectionType, string>> = {
    'announcement-bar': 'Announcement Bar',
    'header': 'Header',
    'hero-slider': 'Hero Slider',
    'hero-banner': 'Hero Banner',
    'hero-split': 'Hero Split',
    'hero-video': 'Hero Video',
    'featured-collection': 'Featured Collection',
    'collection-list': 'Collection List',
    'product-grid': 'Product Grid',
    'product-carousel': 'Product Carousel',
    'rich-text': 'Rich Text',
    'image-with-text': 'Image with Text',
    'image-banner': 'Image Banner',
    'multicolumn': 'Multicolumn',
    'collage': 'Collage',
    'testimonials': 'Testimonials',
    'logo-list': 'Logo List',
    'reviews-carousel': 'Reviews Carousel',
    'promo-banner': 'Promo Banner',
    'countdown-banner': 'Countdown Banner',
    'split-banner': 'Split Banner',
    'blog-posts': 'Blog Posts',
    'featured-blog': 'Featured Blog',
    'contact-form': 'Contact Form',
    'map': 'Map',
    'contact-info': 'Contact Info',
    'newsletter': 'Newsletter',
    'footer': 'Footer',
  };
  return names[type] || type;
}

export function getBlockDisplayName(type: BlockType): string {
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
    'testimonial-card': 'Testimonial Card',
    'team-member': 'Team Member',
    'feature-card': 'Feature Card',
    'icon-box': 'Icon Box',
    'divider': 'Divider',
    'spacer': 'Spacer',
    'columns': 'Columns',
    'countdown': 'Countdown',
    'newsletter-form': 'Newsletter Form',
    'contact-form': 'Contact Form',
    'social-links': 'Social Links',
    'announcement-text': 'Announcement',
    'brand-logo': 'Brand Logo',
    'rating-stars': 'Rating Stars',
  };
  return names[type] || type;
}
