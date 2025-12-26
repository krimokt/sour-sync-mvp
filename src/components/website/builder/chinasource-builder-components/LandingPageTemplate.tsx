'use client';

import React, { useState, useEffect } from 'react';
import { FormData, GeneratedContent, ThemeColor, TemplateId } from '../chinasource-types';
import { 
  Mail, MapPin, 
  ArrowUpRight, LogIn, ExternalLink,
  ShieldCheck, Zap, Instagram, Linkedin, MessageCircle
} from 'lucide-react';
import { EditableText, EditableIcon, EditableImage } from './EditorComponents';
import Sidebar from './Sidebar';

interface LandingPageTemplateProps {
  data: FormData;
  content: GeneratedContent;
  onEdit: () => void;
  hideSidebar?: boolean;
  hasTopBar?: boolean;
  readOnly?: boolean;
}

const themeStyles: Record<ThemeColor, {
  primary: string;
  primaryHover: string;
  light: string;
  text: string;
  border: string;
  shadow: string;
}> = {
  amber: { primary: 'bg-amber-500', primaryHover: 'hover:bg-amber-600', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', shadow: 'shadow-amber-500/20' },
  blue: { primary: 'bg-blue-600', primaryHover: 'hover:bg-blue-700', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', shadow: 'shadow-blue-500/20' },
  red: { primary: 'bg-red-600', primaryHover: 'hover:bg-red-700', light: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', shadow: 'shadow-red-500/20' },
  emerald: { primary: 'bg-emerald-600', primaryHover: 'hover:bg-emerald-700', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', shadow: 'shadow-emerald-500/20' },
  indigo: { primary: 'bg-indigo-600', primaryHover: 'hover:bg-indigo-700', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', shadow: 'shadow-indigo-500/20' },
  zinc: { primary: 'bg-zinc-900', primaryHover: 'hover:bg-zinc-800', light: 'bg-zinc-100', text: 'text-zinc-900', border: 'border-zinc-300', shadow: 'shadow-zinc-900/20' },
};

export const LandingPageTemplate: React.FC<LandingPageTemplateProps> = ({ data, content: initialContent, hideSidebar = false, hasTopBar = false, readOnly = false }) => {
  // Ensure socialMedia array exists
  const normalizedContent = {
    ...initialContent,
    contact: {
      ...initialContent.contact,
      socialMedia: initialContent.contact.socialMedia || [],
    },
  };
  const [content, setContent] = useState<GeneratedContent>(normalizedContent);
  const [activeSection, setActiveSection] = useState<string | null>('hero');
  const [themeColor, setThemeColor] = useState<ThemeColor>(data.themeColor);
  const [templateId, setTemplateId] = useState<TemplateId>(data.templateId);
  const [scrolled, setScrolled] = useState(false);

  const theme = themeStyles[themeColor];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const updateContent = (path: string, value: unknown) => {
    setContent(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let current = newState;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newState;
    });
  };

  const Navbar = () => (
    <nav className={`fixed ${hasTopBar ? 'top-16' : 'top-0'} ${!hideSidebar ? 'left-80' : 'left-0'} right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 h-16' : 'bg-transparent h-24'}`}>
      <div className="max-w-7xl mx-auto px-10 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${theme.primary} w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg rotate-3`}>
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tighter text-gray-900 uppercase italic">
            {data.companyName}
          </span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex gap-8 text-[11px] font-black text-gray-400 uppercase tracking-widest">
            <a href="#solutions" className="hover:text-gray-900 transition">Solutions</a>
            <a href="#process" className="hover:text-gray-900 transition">Process</a>
            <a href="#about" className="hover:text-gray-900 transition">Expertise</a>
            <a href="#contact" className="hover:text-gray-900 transition">Connect</a>
          </div>
          <div className="flex items-center gap-3 border-l border-gray-100 pl-8">
            <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-700 hover:text-gray-900 transition">
              <LogIn size={14} /> Sign In
            </button>
            <button className={`${theme.primary} ${theme.primaryHover} text-white px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2`}>
              Get Started <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-gray-900 selection:text-white">
      {!hideSidebar && (
        <Sidebar 
          content={content} 
          onUpdate={updateContent} 
          activeSection={activeSection}
          onSectionClick={setActiveSection}
          themeColor={themeColor}
          onThemeChange={setThemeColor}
          templateId={templateId}
          onTemplateChange={setTemplateId}
        />
      )}

      <main className={`flex-1 relative ${!hideSidebar ? 'ml-80' : ''}`} style={{ minHeight: '100vh', overflow: 'visible', paddingTop: hasTopBar ? '0' : '0' }}>
        <Navbar />

        {/* 1. HERO: The Gateway */}
        <section id="hero" className="relative h-screen flex items-center px-12 pt-24 overflow-hidden" onClick={() => setActiveSection('hero')}>
          <div className="absolute inset-0 z-0">
            <img src={content.hero.backgroundImage} className="w-full h-full object-cover scale-105" alt="Hero" />
            <div className={`absolute inset-0 bg-gradient-to-tr from-white via-white/95 to-white/40`} />
          </div>
          
          <div className="relative z-10 max-w-5xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-slideUp">
              <ShieldCheck size={14} className="text-emerald-400" />
              <EditableText value={content.hero.tagline} onChange={(v) => updateContent('hero.tagline', v)} />
            </div>
            
            <EditableText 
              value={content.hero.headline} 
              onChange={(v) => updateContent('hero.headline', v)} 
              tag="h1"
              className="text-7xl lg:text-[100px] font-black text-gray-900 leading-[0.9] tracking-tighter mb-10 drop-shadow-sm"
              readOnly={readOnly}
            />
            
            <p className="text-xl text-gray-600 max-w-2xl mb-12 font-medium leading-relaxed border-l-4 border-gray-900 pl-8">
              <EditableText value={content.hero.subheadline} onChange={(v) => updateContent('hero.subheadline', v)} readOnly={readOnly} />
            </p>
            
            <div className="flex flex-wrap gap-5">
              <a href="#contact" className={`${theme.primary} ${theme.primaryHover} text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl ${theme.shadow} transition-all hover:-translate-y-1`}>
                {content.hero.ctaPrimary.text}
              </a>
              <a href="#solutions" className="bg-white border-2 border-gray-900 text-gray-900 px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-gray-900 hover:text-white transition-all">
                Explore Solutions
              </a>
            </div>
          </div>

          <div className="absolute bottom-10 right-12 animate-bounce hidden lg:block">
             <div className="w-px h-24 bg-gradient-to-b from-gray-900 to-transparent" />
          </div>
        </section>

        {/* 2. SOLUTIONS: The Capability */}
        <section id="solutions" className="py-40 px-20 bg-gray-50" onClick={() => setActiveSection('solutions')}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
              <div className="max-w-3xl">
                <h2 className="text-5xl font-black text-gray-900 mb-8 tracking-tighter leading-none">
                  <EditableText value={content.solutions.title} onChange={(v) => updateContent('solutions.title', v)} readOnly={readOnly} />
                </h2>
                <p className="text-xl text-gray-500 font-medium leading-relaxed">
                  <EditableText value={content.solutions.description} onChange={(v) => updateContent('solutions.description', v)} readOnly={readOnly} />
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.solutions.items.map((item, idx) => (
                <div key={idx} className="group bg-white border border-gray-100 p-12 rounded-[40px] shadow-sm hover:shadow-3xl hover:-translate-y-4 transition-all duration-500 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${theme.light} opacity-0 group-hover:opacity-40 rounded-bl-full transition-opacity`} />
                  <div className={`w-16 h-16 rounded-2xl ${theme.light} ${theme.text} flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform`}>
                    <EditableIcon iconName={item.icon} themeColor={themeColor} onChange={(v) => updateContent(`solutions.items.${idx}.icon`, v)} className="w-8 h-8" readOnly={readOnly} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                    <EditableText value={item.title} onChange={(v) => updateContent(`solutions.items.${idx}.title`, v)} readOnly={readOnly} />
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    <EditableText value={item.description} onChange={(v) => updateContent(`solutions.items.${idx}.description`, v)} readOnly={readOnly} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. PROCESS: The Lifecycle */}
        <section id="process" className="py-40 px-20 bg-white" onClick={() => setActiveSection('howItWorks')}>
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-24">
              <EditableText value={content.howItWorks.title} onChange={(v) => updateContent('howItWorks.title', v)} readOnly={readOnly} />
            </h2>
            
            <div className="flex flex-col lg:flex-row items-start justify-between gap-16 relative">
              <div className="hidden lg:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-100 to-transparent -z-0" />
              
              {content.howItWorks.steps.map((step, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group z-10">
                  <div className={`w-24 h-24 rounded-full ${theme.primary} text-white flex items-center justify-center text-3xl font-black shadow-2xl mb-10 transition-transform group-hover:scale-110 ring-8 ring-white`}>
                    0{idx + 1}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                    <EditableText value={step.title} onChange={(v) => updateContent(`howItWorks.steps.${idx}.title`, v)} readOnly={readOnly} />
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed max-w-xs">
                    <EditableText value={step.description} onChange={(v) => updateContent(`howItWorks.steps.${idx}.description`, v)} readOnly={readOnly} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. EXPERTISE: The Trust */}
        <section id="about" className="py-40 px-20 bg-gray-900 overflow-hidden relative" onClick={() => setActiveSection('about')}>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/2" />
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-32 relative z-10">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 border-8 border-gray-800 rounded-full" />
              <EditableImage 
                src={content.about.image} 
                alt="Factory" 
                onChange={(v) => updateContent('about.image', v)} 
                className="w-full aspect-[4/5] object-cover rounded-[60px] shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-700"
                readOnly={readOnly}
              />
              <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-[40px] shadow-2xl">
                 <div className="text-gray-900 font-black text-5xl mb-2">99%</div>
                 <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Client Retention</div>
              </div>
            </div>
            
            <div className="lg:w-1/2 text-white">
              <h2 className="text-6xl font-black mb-10 tracking-tighter leading-none">
                <EditableText value={content.about.title} onChange={(v) => updateContent('about.title', v)} readOnly={readOnly} />
              </h2>
              <p className="text-xl text-gray-400 font-medium leading-relaxed mb-16 border-l-2 border-white/20 pl-8">
                <EditableText value={content.about.description} onChange={(v) => updateContent('about.description', v)} readOnly={readOnly} />
              </p>
              
              <div className="grid grid-cols-2 gap-12">
                {content.about.trustMetrics.map((m, i) => (
                  <div key={i} className="group">
                    <div className="text-4xl font-black mb-2 flex items-baseline gap-1 group-hover:translate-x-2 transition-transform">
                      {m.value}{m.suffix}
                    </div>
                    <div className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. CONTACT: The Close */}
        <section id="contact" className="py-40 px-20 bg-white" onClick={() => setActiveSection('contact')}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
              <div>
                <h2 className="text-6xl font-black text-gray-900 mb-10 tracking-tighter">
                  <EditableText value={content.contact.title} onChange={(v) => updateContent('contact.title', v)} readOnly={readOnly} />
                </h2>
                
                <div className="space-y-12 mb-20">
                  <div className="flex gap-8 group">
                    <div className={`w-14 h-14 rounded-2xl ${theme.light} ${theme.text} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition`}>
                      <Mail size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Inquiries</div>
                      <div className="text-2xl font-black text-gray-900 border-b-4 border-gray-100">
                        <EditableText value={content.contact.email} onChange={(v) => updateContent('contact.email', v)} readOnly={readOnly} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-8 group">
                    <div className={`w-14 h-14 rounded-2xl ${theme.light} ${theme.text} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition`}>
                      <MapPin size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Asia Operations Hub</div>
                      <div className="text-xl font-bold text-gray-600 max-w-sm">
                        <EditableText value={content.contact.address} onChange={(v) => updateContent('contact.address', v)} readOnly={readOnly} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Social Media</div>
                  <div className="flex flex-wrap gap-4">
                    {content.contact.socialMedia && content.contact.socialMedia.length > 0 ? (
                      content.contact.socialMedia.map((social, idx) => {
                        const getIcon = () => {
                          switch (social.platform) {
                            case 'instagram':
                              return <Instagram size={20} />;
                            case 'linkedin':
                              return <Linkedin size={20} />;
                            case 'wechat':
                              return <MessageCircle size={20} />;
                            default:
                              return <ExternalLink size={20} />;
                          }
                        };
                        return (
                          <a 
                            key={idx} 
                            href={social.url || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-14 h-14 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all group relative"
                            title={social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                          >
                            {getIcon()}
                            {!readOnly && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const newSocials = [...(content.contact.socialMedia || [])];
                                  newSocials.splice(idx, 1);
                                  updateContent('contact.socialMedia', newSocials);
                                }}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black"
                                title="Delete"
                              >
                                ×
                              </button>
                            )}
                          </a>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-400 italic">No social media links added</div>
                    )}
                    {!readOnly && (
                      <button
                        onClick={() => {
                          const newSocials = [...(content.contact.socialMedia || [])];
                          newSocials.push({ platform: 'instagram', url: '' });
                          updateContent('contact.socialMedia', newSocials);
                        }}
                        className="w-14 h-14 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all"
                        title="Add Social Media"
                      >
                        +
                      </button>
                    )}
                  </div>
                  {!readOnly && content.contact.socialMedia && content.contact.socialMedia.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {content.contact.socialMedia.map((social, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <select
                            value={social.platform}
                            onChange={(e) => {
                              const newSocials = [...(content.contact.socialMedia || [])];
                              newSocials[idx].platform = e.target.value as 'instagram' | 'linkedin' | 'wechat';
                              updateContent('contact.socialMedia', newSocials);
                            }}
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-gray-900 outline-none"
                          >
                            <option value="instagram">Instagram</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="wechat">WeChat</option>
                          </select>
                          <input
                            type="url"
                            value={social.url}
                            onChange={(e) => {
                              const newSocials = [...(content.contact.socialMedia || [])];
                              newSocials[idx].url = e.target.value;
                              updateContent('contact.socialMedia', newSocials);
                            }}
                            placeholder="https://..."
                            className="flex-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-gray-900 outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-16 rounded-[60px] shadow-3xl">
                <h3 className="text-3xl font-black text-gray-900 mb-10 uppercase tracking-tighter">Secure Your Supply Chain</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <input type="text" placeholder="First Name" className="bg-white px-8 py-5 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-gray-900/5 outline-none transition w-full" />
                    <input type="text" placeholder="Last Name" className="bg-white px-8 py-5 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-gray-900/5 outline-none transition w-full" />
                  </div>
                  <input type="email" placeholder="Business Email Address" className="bg-white px-8 py-5 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-gray-900/5 outline-none transition w-full" />
                  <textarea rows={5} placeholder="Describe your product sourcing requirements..." className="bg-white px-8 py-5 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-gray-900/5 outline-none transition w-full resize-none" />
                  <button className={`${theme.primary} ${theme.primaryHover} text-white w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl ${theme.shadow} transition-all active:scale-95`}>
                    Initialize Sourcing Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-20 px-20 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className={`${theme.primary} w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black`}>
                {data.companyName.charAt(0)}
              </div>
              <span className="font-black text-sm tracking-tighter text-gray-900 uppercase">
                {data.companyName}
              </span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              Powered by SourSync.com • Legal • Privacy • Terms
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};
