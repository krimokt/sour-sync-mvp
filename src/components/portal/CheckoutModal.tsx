'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { X, CreditCard, Building2, Loader2, CheckCircle, Package, MapPin, Truck, FileText, DollarSign, ShoppingCart } from 'lucide-react';
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
  destination_country?: string;
  destination_city?: string;
  shipping_method?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation;
  token: string;
  onSuccess?: () => void;
}

export default function CheckoutModal({ isOpen, onClose, quotation, token, onSuccess }: CheckoutModalProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank' | 'crypto' | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [selectedCryptoId, setSelectedCryptoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate selected price
  const getSelectedPrice = () => {
    if (!quotation.selected_option) return 0;
    const priceField = `total_price_option${quotation.selected_option}` as keyof Quotation;
    const price = quotation[priceField] as string | undefined;
    return price ? parseFloat(price) : 0;
  };

  const selectedPrice = getSelectedPrice();

  // Fetch payment methods
  useEffect(() => {
    if (!isOpen) return;

    const fetchPaymentMethods = async () => {
      setIsLoading(true);
      try {
        // Get company_id from magic link
        const linkResponse = await fetch(`/api/c/${token}/payment-methods`);
        if (linkResponse.ok) {
          const data = await linkResponse.json();
          setBankAccounts(data.bankAccounts || []);
          setCryptoWallets(data.cryptoWallets || []);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [isOpen, token]);

  const handleSubmit = async () => {
    if (!selectedPaymentMethod || (!selectedBankId && !selectedCryptoId)) {
      alert('Please select a payment method');
      return;
    }

    if (!quotation.selected_option) {
      alert('Please select a price option first');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/c/${token}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotation_id: quotation.id,
          amount: selectedPrice,
          payment_method: selectedPaymentMethod === 'bank' ? 'Bank Transfer' : 'Crypto',
          bank_account_id: selectedBankId,
          crypto_wallet_id: selectedCryptoId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment');
      }

      alert('Payment created successfully! You can now upload payment proof.');
      onSuccess?.();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Checkout</h2>
                <p className="text-blue-100 text-sm">Complete your payment</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Quotation Details - Compact Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">Order Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column - Images */}
              <div>
                {(() => {
                  const images = quotation.image_urls || quotation.product_images || (quotation.image_url ? [quotation.image_url] : []);
                  const selectedOption = quotation.selected_option;
                  let optionImages: string[] = [];
                  
                  if (selectedOption) {
                    const imageField = quotation[`image_option${selectedOption}` as keyof Quotation] as string | undefined;
                    if (imageField) {
                      try {
                        const parsed = JSON.parse(imageField);
                        optionImages = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
                      } catch {
                        if (imageField) optionImages = [imageField];
                      }
                    }
                  }
                  
                  const displayImages = optionImages.length > 0 ? optionImages : images;
                  
                  return displayImages.length > 0 ? (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {displayImages.slice(0, 4).map((img, idx) => (
                          <div key={idx} className="relative w-full h-24 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                            <Image
                              src={img}
                              alt={`Product image ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  );
                })()}
              </div>
              
              {/* Right Column - Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Product</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {quotation.product_name || 'N/A'}
                    </p>
                  </div>
                </div>
                
                {quotation.quotation_id && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Quotation ID</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                        {quotation.quotation_id}
                      </p>
                    </div>
                  </div>
                )}
                
                {quotation.quantity && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                      <span className="text-lg font-bold">×</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Quantity</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {quotation.quantity.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {quotation.destination_country && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Destination</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {quotation.destination_city ? `${quotation.destination_city}, ` : ''}
                        {quotation.destination_country}
                      </p>
                    </div>
                  </div>
                )}
                
                {quotation.shipping_method && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Shipping Method</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {quotation.shipping_method}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Price Option Summary - Enhanced */}
          {quotation.selected_option && (() => {
            const optionNum = quotation.selected_option;
            const title = quotation[`title_option${optionNum}` as keyof Quotation] as string | undefined;
            const description = quotation[`description_option${optionNum}` as keyof Quotation] as string | undefined;
            const deliveryTime = quotation[`delivery_time_option${optionNum}` as keyof Quotation] as string | undefined;
            const imageField = quotation[`image_option${optionNum}` as keyof Quotation] as string | undefined;
            
            let optionImages: string[] = [];
            if (imageField) {
              try {
                const parsed = JSON.parse(imageField);
                optionImages = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
              } catch {
                if (imageField) optionImages = [imageField];
              }
            }
            
            return (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-5 shadow-lg border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Selected Price Option</h3>
                </div>
                
                <div className="flex items-start gap-4 mb-4">
                  {optionImages.length > 0 ? (
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-blue-300 dark:border-blue-700 flex-shrink-0 shadow-md">
                      <Image
                        src={optionImages[0]}
                        alt={title || `Option ${optionNum}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-xl bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-300 dark:border-blue-700 flex items-center justify-center flex-shrink-0">
                      <Package className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {title || `Option ${optionNum}`}
                      </p>
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        Selected
                      </span>
                    </div>
                    {description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                        {description}
                      </p>
                    )}
                    {deliveryTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Truck className="w-4 h-4" />
                        <span>Delivery: {deliveryTime}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount</span>
                    </div>
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      ${selectedPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Payment Method Selection */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Select Payment Method
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {bankAccounts.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedPaymentMethod('bank');
                        setSelectedCryptoId(null);
                      }}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedPaymentMethod === 'bank'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Building2 className="w-6 h-6 text-blue-600 mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">Bank Transfer</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''} available
                      </p>
                    </button>
                  )}

                  {cryptoWallets.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedPaymentMethod('crypto');
                        setSelectedBankId(null);
                      }}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedPaymentMethod === 'crypto'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-blue-600 mb-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">Cryptocurrency</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cryptoWallets.length} wallet{cryptoWallets.length !== 1 ? 's' : ''} available
                      </p>
                    </button>
                  )}
                </div>

                {/* Bank Accounts */}
                {selectedPaymentMethod === 'bank' && bankAccounts.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Select Bank Account</h4>
                    </div>
                    {bankAccounts.map((bank) => (
                      <div
                        key={bank.id}
                        onClick={() => setSelectedBankId(bank.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedBankId === bank.id
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {bank.image_url && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={bank.image_url}
                                alt={bank.bank_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-semibold text-gray-900 dark:text-white">
                                {bank.bank_name}
                              </h5>
                              {selectedBankId === bank.id && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {bank.account_name}
                            </p>
                            {bank.account_number && (
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                Account: {bank.account_number}
                              </p>
                            )}
                            {bank.iban && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                IBAN: {bank.iban}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Crypto Wallets */}
                {selectedPaymentMethod === 'crypto' && cryptoWallets.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">Select Wallet</h4>
                    </div>
                    {cryptoWallets.map((wallet) => (
                      <div
                        key={wallet.id}
                        onClick={() => setSelectedCryptoId(wallet.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedCryptoId === wallet.id
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {wallet.qr_code_url && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={wallet.qr_code_url}
                                alt={wallet.wallet_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-semibold text-gray-900 dark:text-white">
                                {wallet.wallet_name}
                              </h5>
                              {selectedCryptoId === wallet.id && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {wallet.cryptocurrency}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono break-all">
                              {wallet.wallet_address}
                            </p>
                            {wallet.network && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Network: {wallet.network}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 p-6 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Total:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ${selectedPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedPaymentMethod || (!selectedBankId && !selectedCryptoId)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

