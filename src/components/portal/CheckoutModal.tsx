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
  selected_option?: number;
  total_price_option1?: string;
  total_price_option2?: string;
  total_price_option3?: string;
  title_option1?: string;
  title_option2?: string;
  title_option3?: string;
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
          {/* Selected Price Option Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Selected Option</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {quotation.selected_option === 1 && (quotation.title_option1 || 'Option 1')}
              {quotation.selected_option === 2 && (quotation.title_option2 || 'Option 2')}
              {quotation.selected_option === 3 && (quotation.title_option3 || 'Option 3')}
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${selectedPrice.toLocaleString()}
            </p>
          </div>

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

