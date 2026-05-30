'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, FileText, Package, Tag, ArrowRight } from 'lucide-react';

// Simple product type matching existing database schema
interface SimpleProduct {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  price: number | null;
  compare_price: number | null;
  sku: string | null;
  stock: number;
  category: string | null;
  images: string[];
  is_published: boolean;
  created_at: string;
}

interface ProductGridProps {
  products: SimpleProduct[];
  companySlug: string;
}

export default function ProductGrid({ products, companySlug }: ProductGridProps) {
  // Public storefront — unauthenticated visitors. Ordering / quoting requires
  // a client account, so route through signin with a redirect back.
  const handleAddToCart = (productId: string) => {
    const next = `/site/${companySlug}/products/${productId}`;
    window.location.href = `/site/${companySlug}/signin?next=${encodeURIComponent(next)}`;
  };

  const handleRequestQuote = (productId: string) => {
    const next = `/site/${companySlug}/products/${productId}?action=quote`;
    window.location.href = `/site/${companySlug}/signin?next=${encodeURIComponent(next)}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          companySlug={companySlug}
          onAddToCart={handleAddToCart}
          onRequestQuote={handleRequestQuote}
        />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: SimpleProduct;
  companySlug: string;
  onAddToCart: (productId: string) => void;
  onRequestQuote: (productId: string) => void;
}

function ProductCard({ product, companySlug, onAddToCart, onRequestQuote }: ProductCardProps) {
  const imageUrl = product.images?.[0] || 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image';
  const hasPrice = product.price !== null && product.price > 0;
  const hasComparePrice = product.compare_price !== null && product.compare_price > (product.price || 0);
  const inStock = product.stock > 0;
  const discountPct = hasComparePrice
    ? Math.round(((product.compare_price! - product.price!) / product.compare_price!) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col">
      {/* Image */}
      <Link
        href={`/site/${companySlug}/products/${product.id}`}
        className="block relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {hasComparePrice && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-md shadow-sm">
              -{discountPct}%
            </span>
          )}
          {!inStock && (
            <span className="px-2.5 py-1 bg-gray-800 text-white text-xs font-semibold rounded-md shadow-sm">
              Sold Out
            </span>
          )}
        </div>
        {/* Wishlist Button */}
        <button
          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"
          onClick={(e) => {
            e.preventDefault();
          }}
          aria-label="Add to wishlist"
        >
          <Heart className="w-4 h-4 text-gray-700" />
        </button>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Category */}
        {product.category && (
          <div className="flex items-center gap-1.5 mb-2">
            <Tag className="w-3 h-3 text-blue-600" />
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">{product.category}</p>
          </div>
        )}

        {/* Title */}
        <Link href={`/site/${companySlug}/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Meta row: SKU + stock */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          {product.sku && (
            <span className="inline-flex items-center gap-1">
              <span className="font-medium text-gray-400">SKU:</span> {product.sku}
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 ${inStock ? 'text-green-600' : 'text-red-500'}`}>
            <Package className="w-3.5 h-3.5" />
            {inStock ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-2 pb-4 border-b border-gray-100">
          {hasPrice ? (
            <>
              <span className="text-2xl font-bold text-gray-900">
                ${product.price!.toFixed(2)}
              </span>
              {hasComparePrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.compare_price!.toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-base font-medium text-gray-500">Price on request</span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2 mt-auto pt-2">
          {hasPrice && inStock && (
            <button
              onClick={() => onAddToCart(product.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Order Now
            </button>
          )}
          <button
            onClick={() => onRequestQuote(product.id)}
            className={`group/q relative inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg overflow-hidden transition-all border ${
              hasPrice && inStock
                ? 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'
                : 'flex-1 border-transparent text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-sm'
            }`}
          >
            <FileText className="w-4 h-4 transition-transform group-hover/q:-translate-x-0.5" />
            <span>{hasPrice && inStock ? 'Quote' : 'Get Quote'}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/q:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
