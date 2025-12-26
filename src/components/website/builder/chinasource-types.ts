
export type ThemeColor = 'amber' | 'blue' | 'red' | 'emerald' | 'indigo' | 'zinc';
export type TemplateId = 'industrial' | 'modern' | 'minimal';

export interface FormData {
  companyName: string;
  logo: File | null;
  logoUrl: string | null;
  services: string;
  countries: string;
  themeColor: ThemeColor;
  templateId: TemplateId;
  email?: string;
  phone?: string;
  whatsapp?: string;
  wechat?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
}

export interface TrustMetric {
  label: string;
  value: string;
  suffix?: string;
}

export interface GeneratedContent {
  hero: {
    tagline: string;
    headline: string;
    subheadline: string;
    ctaPrimary: { text: string; href: string };
    backgroundImage: string;
  };
  solutions: {
    title: string;
    description: string;
    items: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
  howItWorks: {
    title: string;
    steps: {
      title: string;
      description: string;
      icon: string;
    }[];
  };
  about: {
    title: string;
    description: string;
    image: string;
    trustMetrics: TrustMetric[];
  };
  contact: {
    title: string;
    address: string;
    email: string;
    phone: string;
    wechat: string;
    whatsapp: string;
  };
  socials: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
}

export type AppState = 'input' | 'generating' | 'preview';
