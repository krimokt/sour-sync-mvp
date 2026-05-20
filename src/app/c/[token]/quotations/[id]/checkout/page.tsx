'use client';

import { useState, useEffect, useCallback } from 'react';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalNav from '@/components/portal/PortalNav';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Loader2,
  CheckCircle,
  Package,
  MapPin,
  Truck,
  Clock,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number?: string | null;
  iban?: string | null;
  swift_code?: string | null;
  routing_number?: string | null;
  branch_name?: string | null;
  branch_address?: string | null;
  currency: string;
  instructions?: string | null;
  image_url?: string | null;
}

interface CryptoWallet {
  id: string;
  wallet_name: string;
  wallet_address: string;
  cryptocurrency: string;
  network?: string | null;
  qr_code_url?: string | null;
  image_url?: string | null;
}

interface Quotation {
  id: string;
  quotation_id?: string;
  product_name?: string;
  quantity?: number;
  selected_option?: number;
  status?: string;
  destination_country?: string;
  destination_city?: string;
  shipping_method?: string;
  total_price_option1?: string;
  total_price_option2?: string;
  total_price_option3?: string;
  title_option1?: string;
  title_option2?: string;
  title_option3?: string;
  description_option1?: string;
  description_option2?: string;
  description_option3?: string;
  delivery_time_option1?: string;
  delivery_time_option2?: string;
  delivery_time_option3?: string;
  image_option1?: string;
  image_option2?: string;
  image_option3?: string;
  image_url?: string;
  image_urls?: string[];
  product_images?: string[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono text-right">
          {value}
        </span>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const pathname = usePathname();
  const router = useRouter();
  const parts = pathname.split('/');
  const token = parts[2];
  const quotationId = parts[4];
  const basePath = `/c/${token}`;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'bank' | 'crypto' | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [quotationRes, methodsRes] = await Promise.all([
        fetch(`/api/c/${token}/quotations/${quotationId}`),
        fetch(`/api/c/${token}/payment-methods`),
      ]);

      const quotationData = await quotationRes.json();
      if (!quotationRes.ok) throw new Error(quotationData.error || 'Failed to load');
      setQuotation(quotationData.quotation);

      if (methodsRes.ok) {
        const methodsData = await methodsRes.json();
        setBankAccounts(methodsData.bankAccounts || []);
        setCryptoWallets(methodsData.cryptoWallets || []);

        // Pre-select payment type if only one available
        const hasBanks = (methodsData.bankAccounts || []).length > 0;
        const hasCrypto = (methodsData.cryptoWallets || []).length > 0;
        if (hasBanks && !hasCrypto) setSelectedPaymentType('bank');
        if (hasCrypto && !hasBanks) setSelectedPaymentType('crypto');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token, quotationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedPrice = (() => {
    if (!quotation?.selected_option) return 0;
    const field = `total_price_option${quotation.selected_option}` as keyof Quotation;
    const val = quotation[field] as string | undefined;
    return val ? parseFloat(val) : 0;
  })();

  const selectedTitle = (() => {
    if (!quotation?.selected_option) return null;
    const field = `title_option${quotation.selected_option}` as keyof Quotation;
    return quotation?.[field] as string | undefined;
  })();

  const selectedDelivery = (() => {
    if (!quotation?.selected_option) return null;
    const field = `delivery_time_option${quotation.selected_option}` as keyof Quotation;
    return quotation?.[field] as string | undefined;
  })();

  const activeAccounts = selectedPaymentType === 'bank' ? bankAccounts : cryptoWallets;
  const selectedAccount =
    selectedPaymentType === 'bank'
      ? bankAccounts.find((b) => b.id === selectedAccountId)
      : cryptoWallets.find((w) => w.id === selectedAccountId);

  const canSubmit = selectedPaymentType && selectedAccountId && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || !quotation) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/c/${token}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotation_id: quotation.id,
          amount: selectedPrice,
          payment_method: selectedPaymentType === 'bank' ? 'Bank Transfer' : 'Crypto',
          bank_account_id: selectedPaymentType === 'bank' ? selectedAccountId : null,
          crypto_wallet_id: selectedPaymentType === 'crypto' ? selectedAccountId : null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create payment');
      setIsSuccess(true);
      setTimeout(() => router.push(`${basePath}/payments`), 2500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PortalHeader />
        <PortalNav />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-[#06b6d4]" />
        </div>
      </div>
    );
  }

  if (!quotation || !quotation.selected_option) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PortalHeader />
        <PortalNav />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/60 rounded-2xl p-5">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              No option selected. Please go back and choose a pricing option first.
            </p>
          </div>
          <Link
            href={`${basePath}/quotations/${quotationId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mt-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quotation
          </Link>
        </main>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <PortalHeader />
        <PortalNav />
        <main className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Payment Initiated
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Your payment record has been created.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Redirecting to your payments...
          </p>
          <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto mt-4" />
        </main>
      </div>
    );
  }

  const productImages =
    quotation.image_urls ||
    quotation.product_images ||
    (quotation.image_url ? [quotation.image_url] : []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PortalHeader />
      <PortalNav />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5 pb-32">
        {/* Back */}
        <Link
          href={`${basePath}/quotations/${quotationId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quotation
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Checkout
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Review and confirm your payment
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-900/70 rounded-2xl border border-gray-100 dark:border-gray-800">
          {/* Product header */}
          <div className="flex items-center gap-4 p-5 border-b border-gray-50 dark:border-gray-800/80">
            {productImages[0] ? (
              <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <Image
                  src={productImages[0]}
                  alt={quotation.product_name || 'Product'}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="shrink-0 w-14 h-14 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-300 dark:text-gray-600" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {quotation.product_name || 'Quotation'}
              </p>
              <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5">
                {quotation.quotation_id || quotation.id.slice(0, 14)}
              </p>
            </div>
          </div>

          {/* Selected option */}
          <div className="p-5 border-b border-gray-50 dark:border-gray-800/80">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Selected Option
              </p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#06b6d4]/10 text-[#06b6d4]">
                Option {quotation.selected_option}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                {selectedTitle && (
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedTitle}
                  </p>
                )}
                {selectedDelivery && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedDelivery}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order details */}
          <div className="px-5 py-1">
            {quotation.quantity && (
              <div className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800/80">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" /> Quantity
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {quotation.quantity.toLocaleString()} units
                </span>
              </div>
            )}
            {(quotation.destination_city || quotation.destination_country) && (
              <div className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-800/80">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Destination
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {[quotation.destination_city, quotation.destination_country].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {quotation.shipping_method && (
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5" /> Shipping
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {quotation.shipping_method}
                </span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                Total Due
              </span>
              <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                ${selectedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white px-1">
            Payment Method
          </h2>

          {/* Type selector */}
          {bankAccounts.length > 0 && cryptoWallets.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedPaymentType('bank'); setSelectedAccountId(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  selectedPaymentType === 'bank'
                    ? 'bg-[#06b6d4] text-white border-[#06b6d4]'
                    : 'bg-white dark:bg-gray-900/70 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Bank Transfer
              </button>
              <button
                onClick={() => { setSelectedPaymentType('crypto'); setSelectedAccountId(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  selectedPaymentType === 'crypto'
                    ? 'bg-[#06b6d4] text-white border-[#06b6d4]'
                    : 'bg-white dark:bg-gray-900/70 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                <span className="text-base">₿</span>
                Cryptocurrency
              </button>
            </div>
          )}

          {bankAccounts.length > 0 && cryptoWallets.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
              Bank transfer available
            </p>
          )}
          {cryptoWallets.length > 0 && bankAccounts.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
              Cryptocurrency available
            </p>
          )}

          {/* Account list */}
          {selectedPaymentType === 'bank' && bankAccounts.length > 0 && (
            <div className="space-y-2">
              {bankAccounts.map((bank) => {
                const isSelected = selectedAccountId === bank.id;
                return (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedAccountId(bank.id)}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-[#06b6d4] bg-[#06b6d4]/5 dark:bg-[#06b6d4]/10'
                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/70 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {bank.image_url ? (
                        <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                          <Image
                            src={bank.image_url}
                            alt={bank.bank_name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {bank.bank_name}
                          </p>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-[#06b6d4] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {bank.account_name} &middot; {bank.currency}
                        </p>
                      </div>
                    </div>

                    {/* Account details revealed when selected */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-[#06b6d4]/20 space-y-0">
                        {bank.account_number && (
                          <DetailRow label="Account Number" value={bank.account_number} />
                        )}
                        {bank.iban && (
                          <DetailRow label="IBAN" value={bank.iban} />
                        )}
                        {bank.swift_code && (
                          <DetailRow label="SWIFT / BIC" value={bank.swift_code} />
                        )}
                        {bank.routing_number && (
                          <DetailRow label="Routing Number" value={bank.routing_number} />
                        )}
                        {bank.branch_name && (
                          <DetailRow label="Branch" value={bank.branch_name} />
                        )}
                        {bank.instructions && (
                          <div className="pt-3 mt-1">
                            <p className="text-xs text-gray-400 mb-1">Instructions</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {bank.instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {selectedPaymentType === 'crypto' && cryptoWallets.length > 0 && (
            <div className="space-y-2">
              {cryptoWallets.map((wallet) => {
                const isSelected = selectedAccountId === wallet.id;
                return (
                  <button
                    key={wallet.id}
                    onClick={() => setSelectedAccountId(wallet.id)}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-[#06b6d4] bg-[#06b6d4]/5 dark:bg-[#06b6d4]/10'
                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/70 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-lg font-bold text-orange-500">
                        ₿
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {wallet.wallet_name}
                          </p>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-[#06b6d4] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {wallet.cryptocurrency}
                          {wallet.network && <> &middot; {wallet.network}</>}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-[#06b6d4]/20 space-y-3">
                        {wallet.qr_code_url && (
                          <div className="flex justify-center">
                            <div className="w-36 h-36 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                              <Image
                                src={wallet.qr_code_url}
                                alt="QR Code"
                                width={144}
                                height={144}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
                            <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all leading-relaxed">
                              {wallet.wallet_address}
                            </p>
                          </div>
                          <CopyButton text={wallet.wallet_address} />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* No payment methods */}
          {!isLoading && bankAccounts.length === 0 && cryptoWallets.length === 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/60 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  No payment methods configured. Please contact your account manager.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky checkout bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/96 dark:bg-gray-950/96 backdrop-blur-md border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
              ${selectedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {submitError && (
              <p className="text-xs text-red-600 dark:text-red-400 max-w-[180px] text-right">
                {submitError}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#06b6d4] hover:bg-[#0891b2] text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
