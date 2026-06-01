'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAVY = '#1B3E84';

const navLinks = [
  { label: 'HOME',         href: '/site/whitesourcing' },
  { label: 'PRODUCTS',     href: '/site/whitesourcing/products' },
  { label: 'ABOUT',        href: '/site/whitesourcing/about' },
  { label: 'CERTIFICATES', href: '/site/whitesourcing/certifications' },
  { label: 'BLOG',         href: '/site/whitesourcing/blog' },
  { label: 'CONTACT',      href: '/site/whitesourcing/contact' },
];

const LANGUAGES = [
  { code: 'en',    label: 'EN', flag: 'gb', name: 'English'  },
  { code: 'ar',    label: 'AR', flag: 'sa', name: 'العربية'  },
  { code: 'fr',    label: 'FR', flag: 'fr', name: 'Français' },
  { code: 'ru',    label: 'RU', flag: 'ru', name: 'Русский'  },
  { code: 'zh-CN', label: 'ZH', flag: 'cn', name: '中文'    },
];

/* ─── Loading overlay ─── */
function showOverlay(lang: string) {
  if (document.getElementById('shd-translate-overlay')) return;
  const labels: Record<string, string> = {
    ar: 'جاري الترجمة...', fr: 'Traduction...', ru: 'Перевод...', en: 'Restoring English...',
  };
  const el = document.createElement('div');
  el.id = 'shd-translate-overlay';
  el.style.cssText = 'position:fixed;inset:0;background:rgba(27,62,132,0.88);display:flex;align-items:center;justify-content:center;z-index:99999;backdrop-filter:blur(4px);';
  el.innerHTML = `
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    <div style="color:#fff;font-family:IBM Plex Sans,sans-serif;font-size:18px;font-weight:600;display:flex;align-items:center;gap:12px;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;flex-shrink:0">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      ${labels[lang] ?? 'Translating...'}
    </div>`;
  document.body.appendChild(el);
}

function clearGoogleTranslate() {
  const expired = '; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0';
  [`googtrans=; path=/${expired}`, `googtrans=; path=/site${expired}`, `googtrans=; path=/site/whitesourcing${expired}`, `googtrans=; path=/; domain=${location.hostname}${expired}`, `googtrans=; path=/; domain=.${location.hostname}${expired}`]
    .forEach(c => { try { document.cookie = c; } catch (_) {} });
  ['googtrans', 'goog-te-lang', 'googtrans_new'].forEach(k => {
    try { localStorage.removeItem(k); } catch (_) {}
    try { sessionStorage.removeItem(k); } catch (_) {}
  });
}

function triggerGoogleTranslate(langCode: string) {
  if (langCode === 'en') {
    showOverlay('en');
    clearGoogleTranslate();
    setTimeout(() => window.location.replace(window.location.href), 250);
    return;
  }
  const val = `/en/${langCode}`;
  [`googtrans=${val}; path=/`, `googtrans=${val}; path=/; domain=${location.hostname}`, `googtrans=${val}; path=/; domain=.${location.hostname}`]
    .forEach(c => { try { document.cookie = c; } catch (_) {} });
  if (typeof (window as any).doGTranslate === 'function') { (window as any).doGTranslate(`en|${langCode}`); return; }
  const sel = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (sel) { sel.value = langCode; sel.dispatchEvent(new Event('change', { bubbles: true })); return; }
  showOverlay(langCode);
  setTimeout(() => window.location.reload(), 280);
}

function getCurrentLang(): string {
  const m = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
  return m ? m[1] : 'en';
}

export default function ShdNav() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [activeLang, setActiveLang] = useState('en');
  const [langOpen,  setLangOpen]  = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setActiveLang(getCurrentLang()); }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close lang dropdown on outside click
  useEffect(() => {
    if (!langOpen) return;
    const close = () => setLangOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [langOpen]);

  const isActive = (href: string) =>
    href === '/site/whitesourcing' ? pathname === href : pathname.startsWith(href);

  const handleLang = (code: string) => {
    setActiveLang(code);
    setLangOpen(false);
    setMenuOpen(false);
    triggerGoogleTranslate(code);
  };

  const currentLang = LANGUAGES.find(l => l.code === activeLang) ?? LANGUAGES[0];

  return (
    <>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@600&display=swap');

        .shd-nav-link {
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
          transition: color 0.2s; background: none; border: none;
          cursor: pointer; padding: 0; text-decoration: none;
          color: #374151; display: inline-block;
        }
        .shd-nav-link:hover, .shd-nav-link.shd-nav-active { color: ${NAVY}; }

        .shd-lang-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 10px; border-radius: 4px; border: 1px solid #e5e7eb;
          background: #fff; cursor: pointer; font-family: 'IBM Plex Sans', sans-serif;
          font-size: 12px; font-weight: 700; color: #374151;
          transition: border-color 0.2s, background 0.2s; white-space: nowrap;
        }
        .shd-lang-btn:hover { border-color: ${NAVY}; color: ${NAVY}; background: #f0f4ff; }

        .shd-lang-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12); min-width: 170px;
          overflow: hidden; z-index: 200;
        }
        .shd-lang-option {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          cursor: pointer; font-family: 'IBM Plex Sans', sans-serif;
          font-size: 13px; font-weight: 600; color: #374151;
          transition: background 0.15s; border: none; background: none;
          width: 100%; text-align: left;
        }
        .shd-lang-option:hover { background: #f0f4ff; color: ${NAVY}; }
        .shd-lang-option.active { background: #eff6ff; color: ${NAVY}; }

        /* Mobile drawer overlay */
        .shd-drawer-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          z-index: 998; backdrop-filter: blur(2px);
          animation: shd-fade-in 0.2s ease;
        }
        /* Mobile drawer panel */
        .shd-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(320px, 88vw);
          background: #fff; z-index: 999;
          display: flex; flex-direction: column;
          box-shadow: -8px 0 40px rgba(0,0,0,0.15);
          animation: shd-slide-in 0.28s cubic-bezier(0.4,0,0.2,1);
          overflow-y: auto;
        }
        @keyframes shd-slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes shd-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Hamburger → X animation */
        .shd-ham { display: flex; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; }
        .shd-ham span {
          display: block; height: 2px; border-radius: 2px;
          background: #374151; transition: all 0.25s ease; transform-origin: center;
        }
        .shd-ham.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .shd-ham.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .shd-ham.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        /* Mobile nav link */
        .shd-mobile-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; border-bottom: 1px solid #f3f4f6;
          font-family: 'IBM Plex Sans', sans-serif; font-size: 15px; font-weight: 600;
          color: #374151; text-decoration: none; transition: color 0.15s;
        }
        .shd-mobile-link:hover, .shd-mobile-link.active { color: ${NAVY}; }
        .shd-mobile-link .chevron { font-size: 16px; color: #d1d5db; }
        .shd-mobile-link.active .chevron { color: ${NAVY}; }

        /* Google Translate UI suppressed */
        .goog-te-banner-frame, .goog-te-balloon-frame, .goog-te-menu-frame { display: none !important; }
        .skiptranslate { display: none !important; }
        body > .skiptranslate { display: none !important; }
        .goog-te-gadget { display: none !important; }
        body { top: 0 !important; }
        html body { margin-top: 0 !important; }
        html.translated-ltr .shd-fade, html.translated-rtl .shd-fade { opacity: 1 !important; animation: none !important; transform: none !important; }
      `}</style>

      {/* ── Sticky navbar bar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: scrolled ? '#fff' : 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid #e5e7eb',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
        transition: 'box-shadow 0.3s, background-color 0.3s',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '0 24px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', height: 64,
        }}>
          {/* Logo */}
          <Link href="/site/whitesourcing" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ backgroundColor: NAVY, color: '#fff', padding: '4px 8px', fontFamily: 'IBM Plex Sans', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', borderRadius: 2 }}>SHD</span>
            <span style={{ fontFamily: 'IBM Plex Sans', fontSize: 17, fontWeight: 700, color: NAVY, letterSpacing: '-0.01em' }}>SHUILIDA</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 24 }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={`shd-nav-link${isActive(link.href) ? ' shd-nav-active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: 10 }}>
            {/* Language selector */}
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button className="shd-lang-btn" onClick={() => setLangOpen(o => !o)} aria-label="Select language">
                <img src={`https://flagcdn.com/20x15/${currentLang.flag}.png`} width={20} height={15} alt={currentLang.name} style={{ borderRadius: 2, flexShrink: 0 }} />
                <span>{currentLang.label}</span>
                <span style={{ fontSize: 8, color: '#9ca3af' }}>▼</span>
              </button>
              {langOpen && (
                <div className="shd-lang-dropdown">
                  {LANGUAGES.map(lang => (
                    <button key={lang.code} className={`shd-lang-option${activeLang === lang.code ? ' active' : ''}`} onClick={() => handleLang(lang.code)}>
                      <img src={`https://flagcdn.com/20x15/${lang.flag}.png`} width={20} height={15} alt={lang.name} style={{ borderRadius: 2, flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{lang.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af' }}>{lang.label}</span>
                      {activeLang === lang.code && <span style={{ color: NAVY }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/site/sourcing-white/signin"
              style={{ border: `1px solid ${NAVY}`, color: NAVY, padding: '8px 16px', borderRadius: 2, fontFamily: 'IBM Plex Sans', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block', transition: 'background 0.2s, color 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = NAVY; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = NAVY; }}
            >Sign In</Link>

            <Link href="/site/whitesourcing/contact"
              style={{ backgroundColor: NAVY, color: '#fff', padding: '9px 18px', borderRadius: 2, fontFamily: 'IBM Plex Sans', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 8px rgba(27,62,132,0.25)', display: 'inline-block', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#142f66')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = NAVY)}
            >Get a Quote</Link>
          </div>

          {/* Mobile right: lang flag + hamburger */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Current lang flag — quick tap to open drawer */}
            <button
              onClick={() => setMenuOpen(true)}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}
              aria-label="Language"
            >
              <img src={`https://flagcdn.com/20x15/${currentLang.flag}.png`} width={18} height={13} alt={currentLang.name} style={{ borderRadius: 2 }} />
              <span style={{ fontFamily: 'IBM Plex Sans', fontSize: 11, fontWeight: 700, color: '#374151' }}>{currentLang.label}</span>
            </button>

            {/* Animated hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div className={`shd-ham${menuOpen ? ' open' : ''}`} style={{ width: 22 }}>
                <span style={{ width: '100%' }} />
                <span style={{ width: '70%' }} />
                <span style={{ width: '100%' }} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer overlay ── */}
      {menuOpen && (
        <>
          <div className="shd-drawer-overlay lg:hidden" onClick={() => setMenuOpen(false)} />
          <div className="shd-drawer lg:hidden">
            {/* Drawer header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
              <Link href="/site/whitesourcing" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <span style={{ backgroundColor: NAVY, color: '#fff', padding: '3px 7px', fontFamily: 'IBM Plex Sans', fontSize: 11, fontWeight: 700, borderRadius: 2 }}>SHD</span>
                <span style={{ fontFamily: 'IBM Plex Sans', fontSize: 15, fontWeight: 700, color: NAVY }}>SHUILIDA</span>
              </Link>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280', padding: 4, lineHeight: 1 }} aria-label="Close menu">✕</button>
            </div>

            {/* Nav links */}
            <div style={{ padding: '8px 20px 0', flex: 1 }}>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`shd-mobile-link${isActive(link.href) ? ' active' : ''}`}
                >
                  <span>{link.label}</span>
                  <span className="chevron">›</span>
                </Link>
              ))}
            </div>

            {/* Language section */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6', marginTop: 8 }}>
              <div style={{ fontFamily: 'IBM Plex Sans', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 12 }}>
                Language
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLang(lang.code)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 8,
                      border: `1.5px solid ${activeLang === lang.code ? NAVY : '#e5e7eb'}`,
                      background: activeLang === lang.code ? '#eff6ff' : '#fafafa',
                      color: activeLang === lang.code ? NAVY : '#374151',
                      fontFamily: 'IBM Plex Sans', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                    }}
                  >
                    <img src={`https://flagcdn.com/24x18/${lang.flag}.png`} width={22} height={16} alt={lang.name} style={{ borderRadius: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{lang.name}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{lang.label}</div>
                    </div>
                    {activeLang === lang.code && <span style={{ marginLeft: 'auto', color: NAVY, fontSize: 14 }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div style={{ padding: '12px 20px 28px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
              <Link
                href="/site/sourcing-white/signin"
                onClick={() => setMenuOpen(false)}
                style={{ display: 'block', textAlign: 'center', padding: '13px', border: `1.5px solid ${NAVY}`, borderRadius: 8, fontFamily: 'IBM Plex Sans', fontSize: 14, fontWeight: 700, color: NAVY, textDecoration: 'none' }}
              >
                Sign In
              </Link>
              <Link
                href="/site/whitesourcing/contact"
                onClick={() => setMenuOpen(false)}
                style={{ display: 'block', textAlign: 'center', padding: '13px', backgroundColor: NAVY, borderRadius: 8, fontFamily: 'IBM Plex Sans', fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', boxShadow: '0 4px 14px rgba(27,62,132,0.3)' }}
              >
                Get a Quote →
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
