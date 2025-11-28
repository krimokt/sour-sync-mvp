'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingBag, Heart, BarChart2, Star } from 'lucide-react';
import { FeaturedCollectionData } from '@/types/website';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  rating?: number;
  review_count?: number;
}

interface ProductCarouselProps {
  data: FeaturedCollectionData;
  themeColor?: string;
  companyId: string;
  companySlug: string;
}

export default function ProductCarousel({ data, themeColor = '#000000', companyId, companySlug }: ProductCarouselProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('id, name, slug, price, compare_at_price, images')
          .eq('company_id', companyId)
          .eq('is_published', true)
          .limit(data.limit || 8);

        if (data.productIds && data.productIds.length > 0) {
          query = query.in('id', data.productIds);
        }

        const { data: productsData, error } = await query;

        if (error) throw error;
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [companyId, data.limit, data.productIds]);

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.8;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;
    
    carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      setScrollPosition(carouselRef.current.scrollLeft);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-12"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-gray-200 rounded-xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white">
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

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-xl"
            aria-label="Previous products"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-xl"
            aria-label="Next products"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          {/* Products Container */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                companySlug={companySlug}
                themeColor={themeColor}
                showQuickAdd={data.showQuickAdd}
                showCompare={data.showCompare}
                showWishlist={data.showWishlist}
                showRating={data.showRating}
                showPrice={data.showPrice}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        {data.showViewAll && (
          <div className="text-center mt-12">
            <Link
              href={data.viewAllLink || '/shop'}
              className="inline-flex items-center px-8 py-3 rounded-full text-base font-medium transition-all duration-300 border-2 hover:scale-105"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              {data.viewAllText || 'View All Products'}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// Product Card Component
interface ProductCardProps {
  product: Product;
  companySlug: string;
  themeColor: string;
  showQuickAdd?: boolean;
  showCompare?: boolean;
  showWishlist?: boolean;
  showRating?: boolean;
  showPrice?: boolean;
}

function ProductCard({
  product,
  companySlug,
  themeColor,
  showQuickAdd = true,
  showCompare = true,
  showWishlist = true,
  showRating = true,
  showPrice = true,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price / product.compare_at_price!) * 100) 
    : 0;

  const productUrl = `/site/${companySlug}/products/${product.slug || product.id}`;

  return (
    <div
      className="flex-shrink-0 w-72 snap-start group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
        <Link href={productUrl}>
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
          {/* Second Image on Hover */}
          {product.images?.[1] && (
            <img
              src={product.images[1]}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </Link>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}

        {/* Quick Actions */}
        <div 
          className={`absolute right-3 top-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}
        >
          {showQuickAdd && (
            <button 
              className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              style={{ color: themeColor }}
              aria-label="Quick add"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          )}
          {showWishlist && (
            <button 
              className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Add to wishlist"
            >
              <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
            </button>
          )}
          {showCompare && (
            <button 
              className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Add to compare"
            >
              <BarChart2 className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Quick Add Bar (Bottom) */}
        <div 
          className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <button 
            className="w-full py-3 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: themeColor }}
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-1">
        {/* Rating */}
        {showRating && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < (product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            {product.review_count !== undefined && (
              <span className="text-sm text-gray-500 ml-1">({product.review_count})</span>
            )}
          </div>
        )}

        {/* Product Name */}
        <Link href={productUrl}>
          <h3 className="font-medium text-gray-900 hover:underline line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        {showPrice && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${product.compare_at_price?.toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

