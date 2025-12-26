'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { BankAccount, CryptoWallet } from '@/types/store';
import { Building2, Wallet, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyPaymentMethodsProps {
  companySlug: string;
}

export default function CompanyPaymentMethods({ companySlug }: CompanyPaymentMethodsProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPaymentMethods();
  }, [companySlug]);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      
      // Fetch bank accounts
      const bankResponse = await fetch(`/api/store/${companySlug}/bank-accounts`, {
        cache: 'no-store', // Prevent caching
      });
      if (bankResponse.ok) {
        const bankData = await bankResponse.json();
        const accounts = bankData.accounts || [];
        console.log('Bank accounts fetched:', accounts.length, accounts);
        setBankAccounts(accounts);
      } else {
        const errorText = await bankResponse.text();
        console.error('Failed to fetch bank accounts:', bankResponse.status, errorText);
        toast.error('Failed to load bank accounts');
      }

      // Fetch crypto wallets
      const cryptoResponse = await fetch(`/api/store/${companySlug}/crypto-wallets`, {
        cache: 'no-store', // Prevent caching
      });
      if (cryptoResponse.ok) {
        const cryptoData = await cryptoResponse.json();
        const wallets = cryptoData.wallets || [];
        console.log('Crypto wallets fetched:', wallets.length, wallets);
        setCryptoWallets(wallets);
      } else {
        const errorText = await cryptoResponse.text();
        console.error('Failed to fetch crypto wallets:', cryptoResponse.status, errorText);
        toast.error('Failed to load crypto wallets');
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const toggleAccount = (id: string) => {
    setExpandedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
        <div className="text-center text-gray-500">Loading payment methods...</div>
      </div>
    );
  }

  if (bankAccounts.length === 0 && cryptoWallets.length === 0) {
    return null; // Don't show anything if no payment methods
  }

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bank Accounts Section */}
        {bankAccounts.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Bank Account Information
            </h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Use one of the following bank accounts to make your payment
          </p>

          <div className="space-y-2">
            {bankAccounts.length === 0 ? (
              <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-xs">
                No bank accounts available
              </div>
            ) : (
              bankAccounts.map((account) => {
                const isExpanded = expandedAccounts.has(`bank-${account.id}`);
                return (
                  <div
                    key={account.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
                  >
                  <button
                    onClick={() => toggleAccount(`bank-${account.id}`)}
                    className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {account.image_url ? (
                        <Image
                          src={account.image_url}
                          alt={account.bank_name}
                          width={40}
                          height={32}
                          className="rounded object-contain bg-white p-0.5 border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-10 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                          {account.bank_name}
                        </h3>
                        {account.account_name && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {account.account_name}
                          </p>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 space-y-2">
                      {account.account_number && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Account Number:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-medium text-gray-800 dark:text-white">
                              {account.account_number}
                            </span>
                            <button
                              onClick={() => copyToClipboard(account.account_number!, `account-${account.id}`)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
                              {copiedId === `account-${account.id}` ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {account.rib && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">RIB:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-medium text-gray-800 dark:text-white">
                              {account.rib}
                            </span>
                            <button
                              onClick={() => copyToClipboard(account.rib!, `rib-${account.id}`)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
                              {copiedId === `rib-${account.id}` ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {account.iban && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">IBAN:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-medium text-gray-800 dark:text-white">
                              {account.iban}
                            </span>
                            <button
                              onClick={() => copyToClipboard(account.iban!, `iban-${account.id}`)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
                              {copiedId === `iban-${account.id}` ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {account.swift_code && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">SWIFT/BIC:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-medium text-gray-800 dark:text-white">
                              {account.swift_code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(account.swift_code!, `swift-${account.id}`)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
                              {copiedId === `swift-${account.id}` ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Currency:</span>
                        <span className="text-xs font-medium text-gray-800 dark:text-white">
                          {account.currency}
                        </span>
                      </div>
                    </div>
                  )}
                  </div>
                );
              })
            )}
          </div>
          </div>
        )}

        {/* Crypto Wallets Section */}
        {cryptoWallets.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Cryptocurrency Wallets
            </h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Use one of the following cryptocurrency wallets to make your payment
          </p>

          <div className="space-y-2">
            {cryptoWallets.length === 0 ? (
              <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-xs">
                No crypto wallets available
              </div>
            ) : (
              cryptoWallets.map((wallet) => {
                const isExpanded = expandedAccounts.has(`crypto-${wallet.id}`);
                return (
                  <div
                    key={wallet.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
                  >
                  <button
                    onClick={() => toggleAccount(`crypto-${wallet.id}`)}
                    className="w-full p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {wallet.image_url ? (
                        <Image
                          src={wallet.image_url}
                          alt={wallet.wallet_name}
                          width={40}
                          height={32}
                          className="rounded object-contain bg-white p-0.5 border border-gray-200 dark:border-gray-700"
                        />
                      ) : wallet.qr_code_url ? (
                        <Image
                          src={wallet.qr_code_url}
                          alt="QR Code"
                          width={40}
                          height={40}
                          className="rounded object-contain bg-white p-0.5 border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-10 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                          {wallet.wallet_name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {wallet.cryptocurrency}
                          {wallet.network && ` - ${wallet.network}`}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Wallet Address:</span>
                        <div className="flex items-center gap-2 max-w-[70%]">
                          <span className="text-xs font-mono font-medium text-gray-800 dark:text-white break-all text-right">
                            {wallet.wallet_address}
                          </span>
                          <button
                            onClick={() => copyToClipboard(wallet.wallet_address, `wallet-${wallet.id}`)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
                          >
                            {copiedId === `wallet-${wallet.id}` ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {wallet.qr_code_url && (
                        <div className="flex flex-col items-center gap-1.5 pt-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">QR Code:</span>
                          <Image
                            src={wallet.qr_code_url}
                            alt="QR Code"
                            width={120}
                            height={120}
                            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white p-1.5"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                );
              })
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}














