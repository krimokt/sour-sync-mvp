'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button/Button';
import { Product } from '@/types/database';
import { Minus, Plus, ShoppingCart, CheckCircle, Package, Tag, Layers, DollarSign, Calendar, Hash, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string, quantity: number) => Promise<void>;
  onOrderNow: (productId: string, quantity: number) => Promise<void>;
  onCheckoutCart?: () => void;
  isAddingToCart?: boolean;
  isOrdering?: boolean;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onOrderNow,
  onCheckoutCart,
  isAddingToCart = false,
  isOrdering = false,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'pricing'>('overview');

  // Reset quantity when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setAddedToCart(false);
      setSelectedImageIndex(0);
      setActiveTab('overview');
    }
  }, [isOpen, product?.id]);

  if (!product) return null;

  const productImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop'];

  const currentImage = productImages[selectedImageIndex] || productImages[0];

  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountAmount = hasDiscount ? product.compare_price! - product.price : 0;
  const discountPercent =
    hasDiscount && product.compare_price
      ? Math.round((discountAmount / product.compare_price) * 100)
      : 0;

  const totalPrice = Number(product.price) * quantity;
  const totalOriginalPrice = product.compare_price
    ? Number(product.compare_price) * quantity
    : null;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAddToCart = async () => {
    if (quantity < 1) {
      toast.error('Please select a valid quantity');
      return;
    }

    try {
      console.log('Adding to cart:', { productId: product.id, quantity });
      await onAddToCart(product.id, quantity);
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
        setQuantity(1); // Reset quantity
        onClose();
      }, 1500);
    } catch (error) {
      // Error is handled by parent
      console.error('Add to cart error in modal:', error);
    }
  };

  const handleOrderNow = () => {
    if (quantity < 1) {
      toast.error('Please select a valid quantity');
      return;
    }

    // Call parent handler which will open checkout modal
    // Don't close this modal here - parent will handle it
    onOrderNow(product.id, quantity);
    setQuantity(1); // Reset quantity
  };

  const incrementQuantity = () => {
    const maxQty = product.moq ? Math.max(product.moq, product.stock || 0) : product.stock;
    if (maxQty && quantity >= maxQty) return;
    setQuantity((q) => q + 1);
  };

  const decrementQuantity = () => {
    const minQty = product.moq || 1;
    if (quantity > minQty) {
      setQuantity((q) => q - 1);
    }
  };

  const minQuantity = product.moq || 1;
  const maxQuantity = product.stock || undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-0">
        <div className="flex flex-col flex-shrink-0">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 flex-shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#06b6d4] text-[#06b6d4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-[#06b6d4] text-[#06b6d4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pricing'
                  ? 'border-[#06b6d4] text-[#06b6d4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Pricing & Variants
            </button>
          </div>
        </div>

        {/* Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0 overscroll-contain">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Image
                      src={currentImage}
                      alt={product.name}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  {productImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {productImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-[#06b6d4] ring-2 ring-[#06b6d4]'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info & Actions */}
                <div className="flex flex-col gap-6">
                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(Number(product.price))}
                      </span>
                      {hasDiscount && product.compare_price && (
                        <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                          {formatPrice(Number(product.compare_price))}
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-full">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Description
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {product.category && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Category
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.category}
                        </div>
                      </div>
                    )}
                    {product.sku && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          SKU
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.sku}
                        </div>
                      </div>
                    )}
                    {product.stock !== null && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Stock
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                        </div>
                      </div>
                    )}
                    {product.moq && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          MOQ
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.moq} units
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                      Quantity
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={decrementQuantity}
                        disabled={quantity <= minQuantity}
                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={minQuantity}
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || minQuantity;
                          if (value < minQuantity) {
                            setQuantity(minQuantity);
                          } else if (maxQuantity && value > maxQuantity) {
                            setQuantity(maxQuantity);
                          } else {
                            setQuantity(value);
                          }
                        }}
                        className="w-24 h-10 text-lg font-semibold text-gray-900 dark:text-white text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent dark:bg-gray-700"
                      />
                      <button
                        onClick={incrementQuantity}
                        disabled={maxQuantity !== undefined && quantity >= maxQuantity}
                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                        {product.moq && `Min: ${product.moq}`}
                        {product.moq && product.stock && ' • '}
                        {product.stock !== null && `Max: ${product.stock}`}
                      </div>
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Total:
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(totalPrice)}
                        </span>
                        {totalOriginalPrice && (
                          <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                            {formatPrice(totalOriginalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      variant="primary"
                      onClick={() => handleAddToCart()}
                      disabled={isAddingToCart || isOrdering || addedToCart || quantity < minQuantity}
                      className="w-full flex items-center justify-center gap-2 h-12"
                    >
                      {addedToCart ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleOrderNow()}
                      disabled={isAddingToCart || isOrdering || quantity < minQuantity}
                      className="w-full h-12"
                    >
                      {isOrdering ? 'Placing Order...' : 'Order Now'}
                    </Button>

                    {onCheckoutCart && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          onCheckoutCart();
                          onClose();
                        }}
                        disabled={isAddingToCart || isOrdering}
                        className="w-full h-12"
                      >
                        Checkout Cart
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Product ID</div>
                        <div className="text-sm text-gray-900 dark:text-white font-mono">{product.id}</div>
                      </div>
                      {product.sku && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            SKU
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white">{product.sku}</div>
                        </div>
                      )}
                      {product.category && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Category
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white">{product.category}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Stock Quantity
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {product.stock !== null ? `${product.stock} units` : 'Unlimited'}
                        </div>
                      </div>
                      {product.moq && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            Minimum Order Quantity (MOQ)
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white">{product.moq} units</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Dates */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Status & Dates
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Publication Status</div>
                        <div className="inline-flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.is_published
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {product.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Created At</div>
                        <div className="text-sm text-gray-900 dark:text-white">{formatDate(product.created_at)}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</div>
                        <div className="text-sm text-gray-900 dark:text-white">{formatDate(product.updated_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Full Description</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Images */}
                {productImages.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Product Images ({productImages.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {productImages.map((img, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                          <Image
                            src={img}
                            alt={`${product.name} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                {/* Pricing Information */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Pricing Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Current Price</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(Number(product.price))}
                      </div>
                    </div>
                    {product.compare_price && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Compare Price</div>
                        <div className="text-xl font-semibold text-gray-600 dark:text-gray-400 line-through">
                          {formatPrice(Number(product.compare_price))}
                        </div>
                        {hasDiscount && (
                          <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Save {formatPrice(discountAmount)} ({discountPercent}% off)
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Total for {quantity} units</div>
                      <div className="text-2xl font-bold text-[#06b6d4]">
                        {formatPrice(totalPrice)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Tiers */}
                {product.price_tiers && product.price_tiers.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Volume Pricing</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity Range</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Unit Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.price_tiers.map((tier, index) => (
                            <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                                {tier.min_qty}
                                {tier.max_qty ? ` - ${tier.max_qty}` : '+'} units
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white text-right font-medium">
                                {formatPrice(tier.base_price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Variants */}
                {product.variant_groups && product.variant_groups.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Variants</h3>
                    <div className="space-y-4">
                      {product.variant_groups.map((group, groupIndex) => (
                        <div key={groupIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{group.name}</h4>
                          <div className="flex flex-wrap gap-2">
                            {group.values.map((value, valueIndex) => (
                              <div
                                key={valueIndex}
                                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">{value.name}</div>
                                {value.moq && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">MOQ: {value.moq}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legacy Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Options</h3>
                    <div className="space-y-2">
                      {product.variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{variant.name}:</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{variant.value}</span>
                          </div>
                          {variant.price_adjustment && variant.price_adjustment !== 0 && (
                            <span className={`text-sm font-medium ${
                              variant.price_adjustment > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {variant.price_adjustment > 0 ? '+' : ''}{formatPrice(variant.price_adjustment)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
      </DialogContent>
    </Dialog>
  );
}



