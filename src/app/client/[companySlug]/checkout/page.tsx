'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { useClient } from '@/context/ClientContext';
import { toast } from 'sonner';
import { Loader2, ShoppingCart, CheckCircle, Building2, Wallet } from 'lucide-react';
import type { BankAccount, CryptoWallet } from '@/types/store';

type CartItem = {
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
};

type Cart = {
  id: string;
  items?: CartItem[];
};

export default function ClientCheckoutPage() {
  const router = useRouter();
  const { company } = useClient();

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<{ type: 'bank' | 'crypto'; id: string } | null>(null);

  const items = cart?.items || [];

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.product?.price ?? item.price_at_add ?? 0;
      return sum + Number(price) * Number(item.quantity || 0);
    }, 0);
  }, [items]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    const load = async () => {
      if (!company) return;
      setIsLoadingCart(true);
      try {
        const res = await fetch(`/api/client/${company.slug}/cart`, { cache: 'no-store' });
        const json = await res.json();
        if (res.ok && json.cart) {
          setCart(json.cart);
        } else {
          setCart(null);
        }
      } catch (e) {
        console.error(e);
        setCart(null);
      } finally {
        setIsLoadingCart(false);
      }
    };

    load();
  }, [company?.slug]);

  useEffect(() => {
    const loadPayment = async () => {
      if (!company) return;
      setIsLoadingPaymentMethods(true);
      try {
        const [bankRes, cryptoRes] = await Promise.all([
          fetch(`/api/store/${company.slug}/bank-accounts`, { cache: 'no-store' }),
          fetch(`/api/store/${company.slug}/crypto-wallets`, { cache: 'no-store' }),
        ]);

        if (bankRes.ok) {
          const bankJson = await bankRes.json();
          setBankAccounts(bankJson.accounts || []);
        }

        if (cryptoRes.ok) {
          const cryptoJson = await cryptoRes.json();
          setCryptoWallets(cryptoJson.wallets || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingPaymentMethods(false);
      }
    };

    loadPayment();
  }, [company?.slug]);

  const handleCheckout = async () => {
    if (!company) return;
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/client/${company.slug}/cart/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method_type: selectedPaymentMethod.type,
          payment_method_id: selectedPaymentMethod.id,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Checkout failed');

      toast.success(
        'The order is now in the payment page. The payment department will review your order payment.'
      );

      window.dispatchEvent(new Event('cart:updated'));
      router.push(`/client/${company.slug}/payments`);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!company) return null;

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Checkout" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cart items */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Cart</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/client/${company.slug}/products`)}
            >
              Add more
            </Button>
          </div>

          {isLoadingCart ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Your cart is empty</p>
              <div className="mt-4">
                <Button variant="primary" onClick={() => router.push(`/client/${company.slug}/products`)}>
                  Browse products
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const productImage =
                  (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0
                    ? item.product.images[0]
                    : null) ||
                  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop';
                const price = item.product?.price ?? item.price_at_add;

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <Image src={productImage} alt={item.product?.name || 'Product'} fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.product?.name || 'Product'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Qty: {item.quantity} × {formatPrice(Number(price))}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPrice(Number(price) * item.quantity)}
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment methods + submit */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>

          {isLoadingPaymentMethods ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : bankAccounts.length === 0 && cryptoWallets.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              No payment methods available. Please contact the company.
            </div>
          ) : (
            <div className="space-y-4">
              {bankAccounts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Building2 className="w-4 h-4" /> Bank Accounts
                  </div>
                  <div className="space-y-2">
                    {bankAccounts.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedPaymentMethod({ type: 'bank', id: a.id })}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          selectedPaymentMethod?.type === 'bank' && selectedPaymentMethod?.id === a.id
                            ? 'border-[#06b6d4] bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.bank_name}</div>
                            {a.account_name && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{a.account_name}</div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-500">{a.currency}</div>
                          </div>
                          {selectedPaymentMethod?.type === 'bank' && selectedPaymentMethod?.id === a.id && (
                            <CheckCircle className="w-5 h-5 text-[#06b6d4] flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {cryptoWallets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Wallet className="w-4 h-4" /> Crypto Wallets
                  </div>
                  <div className="space-y-2">
                    {cryptoWallets.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => setSelectedPaymentMethod({ type: 'crypto', id: w.id })}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          selectedPaymentMethod?.type === 'crypto' && selectedPaymentMethod?.id === w.id
                            ? 'border-[#06b6d4] bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{w.wallet_name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {w.cryptocurrency}
                              {w.network ? ` - ${w.network}` : ''}
                            </div>
                          </div>
                          {selectedPaymentMethod?.type === 'crypto' && selectedPaymentMethod?.id === w.id && (
                            <CheckCircle className="w-5 h-5 text-[#06b6d4] flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={items.length === 0 || !selectedPaymentMethod || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...
                    </>
                  ) : (
                    'Confirm Checkout'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





