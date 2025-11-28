'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSliderData } from '@/types/website';

interface HeroSliderProps {
  data: HeroSliderData;
  themeColor?: string;
}

export default function HeroSlider({ data, themeColor = '#000000' }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = data.slides || [];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay
  useEffect(() => {
    if (!data.autoplay || slides.length <= 1) return;
    const interval = setInterval(nextSlide, data.autoplaySpeed || 5000);
    return () => clearInterval(interval);
  }, [data.autoplay, data.autoplaySpeed, slides.length, nextSlide]);

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];
  const isBackgroundImage = slide.imagePosition === 'background' || slide.imagePosition === 'center';

  return (
    <section 
      className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50"
      style={{ minHeight: data.height || 600 }}
    >
      {/* Background Image Mode */}
      {isBackgroundImage && slide.image && (
        <div className="absolute inset-0 z-0">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {slide.overlayColor && (
            <div 
              className="absolute inset-0" 
              style={{ 
                backgroundColor: slide.overlayColor, 
                opacity: slide.overlayOpacity || 0.4 
              }}
            />
          )}
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div 
          className={`flex items-center h-full ${
            slide.imagePosition === 'left' ? 'flex-row-reverse' : 'flex-row'
          }`}
          style={{ minHeight: data.height || 600 }}
        >
          {/* Text Content */}
          <div 
            className={`flex-1 py-16 md:py-24 ${
              slide.textAlignment === 'center' ? 'text-center mx-auto max-w-3xl' :
              slide.textAlignment === 'right' ? 'text-right ml-auto' : 'text-left'
            } ${!isBackgroundImage && slide.image ? 'md:w-1/2' : 'w-full'}`}
          >
            <h1 
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 ${
                isBackgroundImage ? 'text-white' : 'text-gray-900'
              }`}
              style={{ fontFamily: 'var(--font-display, inherit)' }}
            >
              {slide.title}
            </h1>
            
            {slide.subtitle && (
              <p 
                className={`text-lg md:text-xl mb-10 max-w-xl ${
                  slide.textAlignment === 'center' ? 'mx-auto' : ''
                } ${isBackgroundImage ? 'text-white/90' : 'text-gray-600'}`}
              >
                {slide.subtitle}
              </p>
            )}

            <div className={`flex gap-4 ${
              slide.textAlignment === 'center' ? 'justify-center' :
              slide.textAlignment === 'right' ? 'justify-end' : 'justify-start'
            }`}>
              {slide.buttonText && (
                <Link
                  href={slide.buttonLink || '#'}
                  className="inline-flex items-center px-8 py-4 rounded-full text-base font-medium transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ 
                    backgroundColor: isBackgroundImage ? '#ffffff' : themeColor,
                    color: isBackgroundImage ? themeColor : '#ffffff'
                  }}
                >
                  {slide.buttonText}
                </Link>
              )}
              
              {slide.secondaryButtonText && (
                <Link
                  href={slide.secondaryButtonLink || '#'}
                  className={`inline-flex items-center px-8 py-4 rounded-full text-base font-medium transition-all duration-300 border-2 ${
                    isBackgroundImage 
                      ? 'border-white text-white hover:bg-white hover:text-gray-900' 
                      : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                  }`}
                >
                  {slide.secondaryButtonText}
                </Link>
              )}
            </div>
          </div>

          {/* Side Image (non-background mode) */}
          {!isBackgroundImage && slide.image && (
            <div className="hidden md:block flex-1 relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-contain object-center"
                style={{ maxHeight: data.height || 600 }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {data.showArrows && slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {data.showDots && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

