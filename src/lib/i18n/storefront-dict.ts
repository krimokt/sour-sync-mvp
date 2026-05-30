/**
 * Storefront UI translations (chrome only).
 *
 * These cover the fixed interface — navigation, buttons, section labels,
 * the contact form, the footer — across the storefront's supported
 * languages. Tenant-authored content (hero copy, solutions, about text,
 * case studies, posts) is NOT translated here; it stays in the language
 * the tenant wrote it in until per-locale content lands (Phase 5b).
 */

export const STOREFRONT_LOCALES = ['en', 'zh', 'ar', 'ru'] as const;
export type StorefrontLocale = (typeof STOREFRONT_LOCALES)[number];

export const DEFAULT_LOCALE: StorefrontLocale = 'en';

/** Locales that render right-to-left. */
export const RTL_LOCALES: ReadonlySet<StorefrontLocale> = new Set(['ar']);

export function isStorefrontLocale(v: unknown): v is StorefrontLocale {
  return typeof v === 'string' && (STOREFRONT_LOCALES as readonly string[]).includes(v);
}

export function dirFor(locale: StorefrontLocale): 'ltr' | 'rtl' {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

/** Native names shown in the language switcher. */
export const LOCALE_LABELS: Record<StorefrontLocale, string> = {
  en: 'English',
  zh: '中文',
  ar: 'العربية',
  ru: 'Русский',
};

/** Short code shown on the collapsed switcher button. */
export const LOCALE_SHORT: Record<StorefrontLocale, string> = {
  en: 'EN',
  zh: '中文',
  ar: 'ع',
  ru: 'RU',
};

export type StorefrontStringKey =
  | 'nav.products' | 'nav.solutions' | 'nav.process' | 'nav.projects'
  | 'nav.certifications' | 'nav.about' | 'nav.blog' | 'nav.contact'
  | 'cta.getQuote' | 'cta.clientPortal' | 'cta.seeServices'
  | 'cta.viewAllProducts' | 'cta.readMore' | 'cta.allArticles'
  | 'section.trustedBy' | 'section.selectedProjects' | 'section.selectedProjectsSub'
  | 'section.testimonials' | 'section.testimonialsSub'
  | 'form.title' | 'form.firstName' | 'form.lastName' | 'form.email'
  | 'form.company' | 'form.messagePlaceholder' | 'form.submit' | 'form.sending'
  | 'form.sent' | 'form.respond' | 'form.errRequired' | 'form.errEmail' | 'form.errSend'
  | 'footer.browse' | 'footer.support' | 'footer.home' | 'footer.services'
  | 'footer.trackOrder' | 'footer.signIn' | 'footer.requestQuote' | 'footer.trackShipment'
  | 'footer.rights' | 'footer.poweredBy' | 'footer.tagline'
  | 'lang.label';

type Dict = Record<StorefrontStringKey, string>;

const en: Dict = {
  'nav.products': 'Products',
  'nav.solutions': 'Solutions',
  'nav.process': 'Process',
  'nav.projects': 'Projects',
  'nav.certifications': 'Certifications',
  'nav.about': 'About',
  'nav.blog': 'Blog',
  'nav.contact': 'Contact',
  'cta.getQuote': 'Get a Quote',
  'cta.clientPortal': 'Client Portal',
  'cta.seeServices': 'See Our Services',
  'cta.viewAllProducts': 'View all products',
  'cta.readMore': 'Read more',
  'cta.allArticles': 'All articles',
  'section.trustedBy': 'Trusted across the global sourcing supply chain',
  'section.selectedProjects': 'Selected projects',
  'section.selectedProjectsSub': 'A sample of work delivered for buyers around the world.',
  'section.testimonials': 'What buyers say',
  'section.testimonialsSub': 'Feedback from companies we source for.',
  'form.title': 'Start a sourcing request',
  'form.firstName': 'First name',
  'form.lastName': 'Last name',
  'form.email': 'Business email',
  'form.company': 'Company name',
  'form.messagePlaceholder': 'What products do you need? Include quantity, destination, and any specs.',
  'form.submit': 'Send sourcing request',
  'form.sending': 'Sending…',
  'form.sent': 'Message received. We’ll be in touch within 24 hours.',
  'form.respond': 'We respond within 24 hours. No commitment required.',
  'form.errRequired': 'Please fill in the required fields.',
  'form.errEmail': 'That email doesn’t look right.',
  'form.errSend': 'Could not send right now. Please try again or email us directly.',
  'footer.browse': 'Browse',
  'footer.support': 'Support',
  'footer.home': 'Home',
  'footer.services': 'Services',
  'footer.trackOrder': 'Track Order',
  'footer.signIn': 'Sign In',
  'footer.requestQuote': 'Request Quote',
  'footer.trackShipment': 'Track Shipment',
  'footer.rights': 'All rights reserved.',
  'footer.poweredBy': 'Powered by',
  'footer.tagline': 'Trusted sourcing and end-to-end logistics from China to the world.',
  'lang.label': 'Language',
};

const zh: Dict = {
  'nav.products': '产品',
  'nav.solutions': '解决方案',
  'nav.process': '流程',
  'nav.projects': '项目案例',
  'nav.certifications': '认证',
  'nav.about': '关于我们',
  'nav.blog': '博客',
  'nav.contact': '联系我们',
  'cta.getQuote': '获取报价',
  'cta.clientPortal': '客户门户',
  'cta.seeServices': '查看服务',
  'cta.viewAllProducts': '查看所有产品',
  'cta.readMore': '阅读更多',
  'cta.allArticles': '所有文章',
  'section.trustedBy': '受全球采购供应链信赖',
  'section.selectedProjects': '精选项目',
  'section.selectedProjectsSub': '我们为全球买家交付的部分项目。',
  'section.testimonials': '买家评价',
  'section.testimonialsSub': '来自我们服务过的公司的反馈。',
  'form.title': '发起采购需求',
  'form.firstName': '名',
  'form.lastName': '姓',
  'form.email': '企业邮箱',
  'form.company': '公司名称',
  'form.messagePlaceholder': '您需要什么产品？请注明数量、目的地和规格。',
  'form.submit': '发送采购需求',
  'form.sending': '发送中…',
  'form.sent': '信息已收到，我们将在24小时内与您联系。',
  'form.respond': '我们在24小时内回复，无需任何承诺。',
  'form.errRequired': '请填写必填项。',
  'form.errEmail': '邮箱格式不正确。',
  'form.errSend': '暂时无法发送，请重试或直接邮件联系我们。',
  'footer.browse': '浏览',
  'footer.support': '支持',
  'footer.home': '首页',
  'footer.services': '服务',
  'footer.trackOrder': '订单追踪',
  'footer.signIn': '登录',
  'footer.requestQuote': '索取报价',
  'footer.trackShipment': '货运追踪',
  'footer.rights': '版权所有。',
  'footer.poweredBy': '技术支持：',
  'footer.tagline': '值得信赖的采购与端到端物流，从中国到全球。',
  'lang.label': '语言',
};

const ar: Dict = {
  'nav.products': 'المنتجات',
  'nav.solutions': 'الحلول',
  'nav.process': 'آلية العمل',
  'nav.projects': 'المشاريع',
  'nav.certifications': 'الشهادات',
  'nav.about': 'من نحن',
  'nav.blog': 'المدونة',
  'nav.contact': 'اتصل بنا',
  'cta.getQuote': 'اطلب عرض سعر',
  'cta.clientPortal': 'بوابة العملاء',
  'cta.seeServices': 'تعرّف على خدماتنا',
  'cta.viewAllProducts': 'عرض كل المنتجات',
  'cta.readMore': 'اقرأ المزيد',
  'cta.allArticles': 'كل المقالات',
  'section.trustedBy': 'موثوق به عبر سلسلة التوريد العالمية',
  'section.selectedProjects': 'مشاريع مختارة',
  'section.selectedProjectsSub': 'نماذج من الأعمال التي نفّذناها لمشترين حول العالم.',
  'section.testimonials': 'آراء المشترين',
  'section.testimonialsSub': 'تعليقات من الشركات التي نوفّر لها مصادر التوريد.',
  'form.title': 'ابدأ طلب توريد',
  'form.firstName': 'الاسم الأول',
  'form.lastName': 'اسم العائلة',
  'form.email': 'البريد الإلكتروني للعمل',
  'form.company': 'اسم الشركة',
  'form.messagePlaceholder': 'ما المنتجات التي تحتاجها؟ يرجى ذكر الكمية والوجهة والمواصفات.',
  'form.submit': 'إرسال طلب التوريد',
  'form.sending': 'جارٍ الإرسال…',
  'form.sent': 'تم استلام رسالتك. سنتواصل معك خلال 24 ساعة.',
  'form.respond': 'نرد خلال 24 ساعة، دون أي التزام.',
  'form.errRequired': 'يرجى ملء الحقول المطلوبة.',
  'form.errEmail': 'البريد الإلكتروني غير صحيح.',
  'form.errSend': 'تعذّر الإرسال الآن. حاول مرة أخرى أو راسلنا مباشرة.',
  'footer.browse': 'تصفّح',
  'footer.support': 'الدعم',
  'footer.home': 'الرئيسية',
  'footer.services': 'الخدمات',
  'footer.trackOrder': 'تتبّع الطلب',
  'footer.signIn': 'تسجيل الدخول',
  'footer.requestQuote': 'طلب عرض سعر',
  'footer.trackShipment': 'تتبّع الشحنة',
  'footer.rights': 'جميع الحقوق محفوظة.',
  'footer.poweredBy': 'مشغّل بواسطة',
  'footer.tagline': 'توريد موثوق وخدمات لوجستية متكاملة من الصين إلى العالم.',
  'lang.label': 'اللغة',
};

const ru: Dict = {
  'nav.products': 'Продукция',
  'nav.solutions': 'Решения',
  'nav.process': 'Процесс',
  'nav.projects': 'Проекты',
  'nav.certifications': 'Сертификаты',
  'nav.about': 'О нас',
  'nav.blog': 'Блог',
  'nav.contact': 'Контакты',
  'cta.getQuote': 'Запросить расчёт',
  'cta.clientPortal': 'Клиентский портал',
  'cta.seeServices': 'Наши услуги',
  'cta.viewAllProducts': 'Все товары',
  'cta.readMore': 'Подробнее',
  'cta.allArticles': 'Все статьи',
  'section.trustedBy': 'Нам доверяют по всей глобальной цепочке поставок',
  'section.selectedProjects': 'Избранные проекты',
  'section.selectedProjectsSub': 'Примеры работ, выполненных для покупателей по всему миру.',
  'section.testimonials': 'Отзывы покупателей',
  'section.testimonialsSub': 'Отзывы компаний, для которых мы организуем поставки.',
  'form.title': 'Оставить заявку на поставку',
  'form.firstName': 'Имя',
  'form.lastName': 'Фамилия',
  'form.email': 'Рабочая почта',
  'form.company': 'Название компании',
  'form.messagePlaceholder': 'Какие товары вам нужны? Укажите количество, направление и характеристики.',
  'form.submit': 'Отправить заявку',
  'form.sending': 'Отправка…',
  'form.sent': 'Сообщение получено. Свяжемся с вами в течение 24 часов.',
  'form.respond': 'Отвечаем в течение 24 часов. Без обязательств.',
  'form.errRequired': 'Пожалуйста, заполните обязательные поля.',
  'form.errEmail': 'Похоже, адрес почты неверный.',
  'form.errSend': 'Не удалось отправить. Попробуйте снова или напишите нам напрямую.',
  'footer.browse': 'Навигация',
  'footer.support': 'Поддержка',
  'footer.home': 'Главная',
  'footer.services': 'Услуги',
  'footer.trackOrder': 'Отслеживание заказа',
  'footer.signIn': 'Войти',
  'footer.requestQuote': 'Запросить расчёт',
  'footer.trackShipment': 'Отслеживание отгрузки',
  'footer.rights': 'Все права защищены.',
  'footer.poweredBy': 'Работает на',
  'footer.tagline': 'Надёжный поиск поставщиков и логистика полного цикла из Китая по всему миру.',
  'lang.label': 'Язык',
};

export const STOREFRONT_DICT: Record<StorefrontLocale, Dict> = { en, zh, ar, ru };

export function translate(locale: StorefrontLocale, key: StorefrontStringKey): string {
  return STOREFRONT_DICT[locale]?.[key] ?? en[key];
}

/** hreflang alternates for a page: default (English) + ?lang= variants. */
export function localeAlternates(baseUrl: string): Record<string, string> {
  // Strip any existing query so we always append a single ?lang=.
  const base = baseUrl.split('?')[0];
  const out: Record<string, string> = { 'x-default': base, en: base };
  for (const l of STOREFRONT_LOCALES) {
    if (l !== DEFAULT_LOCALE) out[l] = `${base}?lang=${l}`;
  }
  return out;
}

/** Nav label (English, also used to build the href) → translation key. */
export const NAV_LABEL_KEY: Record<string, StorefrontStringKey> = {
  Products: 'nav.products',
  Solutions: 'nav.solutions',
  Process: 'nav.process',
  Projects: 'nav.projects',
  Certifications: 'nav.certifications',
  About: 'nav.about',
  Blog: 'nav.blog',
  Contact: 'nav.contact',
};
