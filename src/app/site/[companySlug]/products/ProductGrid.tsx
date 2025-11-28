'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, FileText, Heart } from 'lucide-react';

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
  const handleAddToCart = async (productId: string) => {
    // TODO: Implement add to cart
    console.log('Add to cart:', productId);
  };

  const handleRequestQuote = (productId: string) => {
    window.location.href = `/site/${companySlug}/quote?product=${productId}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
  const imageUrl = product.images?.[0] || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
  const hasPrice = product.price !== null && product.price > 0;
  const hasComparePrice = product.compare_price !== null && product.compare_price > (product.price || 0);
  const inStock = product.stock > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Image */}
      <Link href={`/site/${companySlug}/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasComparePrice && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
              Sale
            </span>
          )}
        </div>
        {/* Wishlist Button */}
        <button
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add to wishlist
          }}
        >
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 mb-1">{product.category}</p>
        )}

        {/* Title */}
        <Link href={`/site/${companySlug}/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          {hasPrice ? (
            <>
              <span className="text-lg font-bold text-gray-900">
                ${product.price!.toFixed(2)}
              </span>
              {hasComparePrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.compare_price!.toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-500">Price on request</span>
          )}
        </div>

        {/* Stock Status */}
        <p className={`text-xs mt-1 ${inStock ? 'text-green-600' : 'text-red-600'}`}>
          {inStock ? `${product.stock} in stock` : 'Out of stock'}
        </p>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {hasPrice && inStock && (
            <button
              onClick={() => onAddToCart(product.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          )}
          <button
            onClick={() => onRequestQuote(product.id)}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              hasPrice && inStock
                ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'flex-1 bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            {hasPrice && inStock ? 'Quote' : 'Get Quote'}
          </button>
        </div>
      </div>
    </div>
  );
}
