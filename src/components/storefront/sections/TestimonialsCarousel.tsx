'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { TestimonialsData } from '@/types/website';

interface TestimonialsCarouselProps {
  data: TestimonialsData;
  themeColor?: string;
}

export default function TestimonialsCarousel({ data, themeColor = '#000000' }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonials = data.testimonials || [];
  const itemsPerView = 3;
  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  const next = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (data.layout !== 'carousel' || testimonials.length <= itemsPerView) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [maxIndex, testimonials.length, data.layout]);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {(data.title || data.subtitle) && (
          <div className="text-center mb-12">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {data.title}
              </h2>
            )}
            {data.subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {data.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          {testimonials.length > itemsPerView && (
            <>
              <button
                onClick={prev}
                disabled={currentIndex === 0}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              
              <button
                onClick={next}
                disabled={currentIndex >= maxIndex}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next testimonials"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Testimonials Grid */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={testimonial.id || index}
                  testimonial={testimonial}
                  themeColor={themeColor}
                  showRating={data.showRating}
                  showAvatar={data.showAvatar}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dots Indicator */}
        {testimonials.length > itemsPerView && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                style={index === currentIndex ? { backgroundColor: themeColor } : {}}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Testimonial Card Component
interface TestimonialCardProps {
  testimonial: {
    id?: string;
    quote: string;
    author: string;
    role?: string;
    company?: string;
    avatar?: string;
    rating?: number;
  };
  themeColor: string;
  showRating?: boolean;
  showAvatar?: boolean;
}

function TestimonialCard({ testimonial, themeColor, showRating = true, showAvatar = true }: TestimonialCardProps) {
  return (
    <div className="flex-shrink-0 w-full md:w-1/3 px-3">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        {/* Quote Icon */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: `${themeColor}15` }}
        >
          <Quote className="w-6 h-6" style={{ color: themeColor }} />
        </div>

        {/* Title & Rating */}
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 text-lg mb-2">
            {testimonial.role || 'Great Experience'}!
          </h3>
          {showRating && (
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-5 h-5 ${
                    i < (testimonial.rating || 5) 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quote Text */}
        <p className="text-gray-600 leading-relaxed flex-grow mb-6">
          &quot;{testimonial.quote}&quot;
        </p>

        {/* Author */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          {showAvatar && testimonial.avatar && (
            <div className="w-12 h-12 rounded-full overflow-hidden bg-yellow-400 flex-shrink-0">
              <img
                src={testimonial.avatar}
                alt={testimonial.author}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {showAvatar && !testimonial.avatar && (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
              style={{ backgroundColor: themeColor }}
            >
              {testimonial.author.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{testimonial.author}</p>
            {testimonial.role && (
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

