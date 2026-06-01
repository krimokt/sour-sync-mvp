'use client';

import { useEffect } from 'react';

export default function GoogleTranslate() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('shd-gt-script')) return;

    // Must be on window BEFORE the script loads
    (window as any).googleTranslateElementInit = function () {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,ar,fr,ru,zh-CN',
          // autoDisplay NOT set to false — widget must auto-translate from cookie
          multilanguagePage: true,
        },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.id = 'shd-gt-script';
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);

    // After 1.5 s, force-show any shd-fade elements still at opacity:0
    // This covers the case where translation is active but IntersectionObserver
    // hasn't re-fired (e.g., elements already in viewport when Google repaints).
    const forceVisible = setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.shd-fade:not(.visible)').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.animation = 'none';
      });
    }, 1500);

    return () => clearTimeout(forceVisible);
  }, []);

  return (
    <>
      {/*
        MUST be visible to the browser (even if 0-size).
        display:none prevents the widget from injecting its internals.
      */}
      <div
        id="google_translate_element"
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          top: 0,
          left: 0,
        }}
      />
      <style suppressHydrationWarning>{`
        /* ── Hide all Google Translate chrome ── */
        .goog-te-banner-frame,
        .goog-te-balloon-frame,
        .goog-te-menu-frame   { display: none !important; height: 0 !important; }
        .skiptranslate        { display: none !important; }
        body > .skiptranslate { display: none !important; }
        .goog-te-gadget       { display: none !important; }

        /* ── Stop Google from shifting the body down ── */
        body        { top: 0 !important; }
        html body   { margin-top: 0 !important; }

        /* ── When translation is active, force ALL fade-in elements visible ──
           Google Translate adds .translated-ltr or .translated-rtl to <html>.
           Without this, shd-fade elements stay at opacity:0 forever because
           the IntersectionObserver fires before Google re-renders the DOM.     */
        html.translated-ltr .shd-fade,
        html.translated-rtl .shd-fade {
          opacity: 1 !important;
          animation: none !important;
          transform: none !important;
        }

        /* ── Also show images inside product cards immediately ── */
        html.translated-ltr .shd-product-card img,
        html.translated-rtl .shd-product-card img {
          opacity: 1 !important;
          transform: none !important;
        }

        /* ── RTL support for Arabic ── */
        html.translated-rtl .shd-root {
          direction: rtl;
        }

        /* ── Prevent Google from highlighting translated text ── */
        .goog-text-highlight { background: none !important; box-shadow: none !important; }
      `}</style>
    </>
  );
}
