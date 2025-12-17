'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, X, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/button/Button';
import CheckoutCartModal from '@/components/products/CheckoutCartModal';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_add: number;
  product?: {
    id: string;
    name: string;
    images: string[] | null;
    price: number;
  };
}

interface Cart {
  id: string;
  items?: CartItem[];
}

interface ClientCartDropdownProps {
  companySlug: string;
}

export default function ClientCartDropdown({ companySlug }: ClientCartDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice = cart?.items?.reduce((sum, item) => {
    const price = item.product?.price || item.price_at_add;
    return sum + price * item.quantity;
  }, 0) || 0;

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/client/${companySlug}/cart`);
      const data = await response.json();

      if (response.ok && data.cart) {
        setCart(data.cart);
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companySlug]);

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    setIsRemoving(itemId);
    try {
      const response = await fetch(`/api/client/${companySlug}/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove item');
      }

      toast.success('Item removed from cart');
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove item');
    } finally {
      setIsRemoving(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchCart();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, fetchCart]);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener('cart:updated', handleCartUpdate);
    return () => {
      window.removeEventListener('cart:updated', handleCartUpdate);
    };
  }, [fetchCart]);

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#0f7aff] hover:border-[#0f7aff]/30 dark:hover:text-[#0f7aff] dark:hover:border-[#0f7aff]/30 shadow-sm"
        aria-label="Shopping Cart"
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-[#06b6d4] rounded-full">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Shopping Cart
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : !cart?.items || cart.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your cart is empty
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => {
                  const productImage =
                    (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0
                      ? item.product.images[0]
                      : null) ||
                    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop';
                  const productPrice = item.product?.price || item.price_at_add;

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <Image
                          src={productImage}
                          alt={item.product?.name || 'Product'}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.product?.name || 'Product'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Qty: {item.quantity} × {formatPrice(productPrice)}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                          {formatPrice(productPrice * item.quantity)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isRemoving === item.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        {isRemoving === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart?.items && cart.items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total:
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setIsOpen(false);
                  setIsCheckoutOpen(true);
                }}
              >
                Checkout
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Checkout Cart Modal */}
      <CheckoutCartModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          fetchCart();
        }}
      />
    </div>
  );
}
