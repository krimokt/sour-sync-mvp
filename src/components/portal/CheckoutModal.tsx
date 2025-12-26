'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { X, CreditCard, Building2, Loader2, CheckCircle } from 'lucide-react';
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quotation Details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quotation Details</h3>
            
            {/* Product Images */}
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
                  <div className="grid grid-cols-3 gap-2">
                    {displayImages.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="relative w-full h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
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
              ) : null;
            })()}
            
            {/* Product Info */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Product:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {quotation.product_name || 'N/A'}
                </span>
              </div>
              
              {quotation.quotation_id && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Quotation ID:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {quotation.quotation_id}
                  </span>
                </div>
              )}
              
              {quotation.quantity && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {quotation.quantity}
                  </span>
                </div>
              )}
              
              {quotation.destination_country && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Destination:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {quotation.destination_city ? `${quotation.destination_city}, ` : ''}
                    {quotation.destination_country}
                  </span>
                </div>
              )}
              
              {quotation.shipping_method && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Shipping:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {quotation.shipping_method}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Selected Price Option Summary */}
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
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Selected Price Option</h3>
                
                <div className="flex items-start gap-4 mb-3">
                  {optionImages.length > 0 && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-blue-300 dark:border-blue-700 flex-shrink-0">
                      <Image
                        src={optionImages[0]}
                        alt={title || `Option ${optionNum}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      {title || `Option ${optionNum}`}
                    </p>
                    {description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {description}
                      </p>
                    )}
                    {deliveryTime && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Delivery: {deliveryTime}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Select Payment Method
                </h3>
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
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Select Bank Account</h4>
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
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Select Wallet</h4>
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
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedPaymentMethod || (!selectedBankId && !selectedCryptoId)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Create Payment'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

