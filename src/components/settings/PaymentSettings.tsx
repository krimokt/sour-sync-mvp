'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { BankAccount, CryptoWallet } from '@/types/store';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { Plus, Edit2, Trash2, X, Upload, Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface PaymentSettingsProps {
  companyId: string;
  companySlug: string;
}

export default function PaymentSettings({ companyId, companySlug }: PaymentSettingsProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddWalletForm, setShowAddWalletForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingQrCode, setUploadingQrCode] = useState(false);
  const [uploadingWalletImage, setUploadingWalletImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrCodeInputRef = useRef<HTMLInputElement>(null);
  const walletImageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    bank_name: '',
    owner_name: '',
    account_number: '',
    rib: '',
    currency: 'USD',
    image_url: '',
  });

  const [walletFormData, setWalletFormData] = useState({
    wallet_name: '',
    wallet_address: '',
    cryptocurrency: 'BTC',
    network: '',
    qr_code_url: '',
    image_url: '',
  });

  useEffect(() => {
    fetchAccounts();
    fetchWallets();
  }, [companySlug]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`/api/admin/${companySlug}/bank-accounts`);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      const response = await fetch(`/api/admin/${companySlug}/crypto-wallets`);
      if (response.ok) {
        const data = await response.json();
        setWallets(data.wallets || []);
      }
    } catch (error) {
      console.error('Error fetching crypto wallets:', error);
      toast.error('Failed to load crypto wallets');
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type (PNG only)
    if (file.type !== 'image/png') {
      toast.error('Please upload a PNG image only');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bank-accounts/${companyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images') // Using existing bucket, or create a new one
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        // Provide more specific error messages
        if (error.message?.includes('new row violates row-level security policy')) {
          throw new Error('Permission denied. Please check your account permissions.');
        } else if (error.message?.includes('The resource already exists')) {
          throw new Error('A file with this name already exists. Please try again.');
        } else {
          throw new Error(error.message || 'Failed to upload image');
        }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get image URL');
      }

      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bank_name || !formData.owner_name || !formData.account_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (accounts.length >= 4 && !editingId) {
      toast.error('Maximum of 4 bank accounts allowed');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        bank_name: formData.bank_name,
        account_name: formData.owner_name, // Bank owner name
        account_number: formData.account_number,
        rib: formData.rib || null,
        currency: formData.currency,
        image_url: formData.image_url || null,
        is_active: true,
      };

      let response;
      if (editingId) {
        // Update existing
        response = await fetch(`/api/admin/${companySlug}/bank-accounts/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new
        response = await fetch(`/api/admin/${companySlug}/bank-accounts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save bank account');
      }

      toast.success(editingId ? 'Bank account updated' : 'Bank account added');
      resetForm();
      fetchAccounts();
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save bank account');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (account: BankAccount) => {
    setFormData({
      bank_name: account.bank_name,
      owner_name: account.account_name || '',
      account_number: account.account_number || '',
      rib: account.rib || '',
      currency: account.currency || 'USD',
      image_url: account.image_url || '',
    });
    setEditingId(account.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/${companySlug}/bank-accounts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bank account');
      }

      toast.success('Bank account deleted');
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting bank account:', error);
      toast.error('Failed to delete bank account');
    }
  };

  const handleQrCodeUpload = async (file: File) => {
    if (!file) return;

    if (file.type !== 'image/png') {
      toast.error('Please upload a PNG image only');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingQrCode(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `crypto-wallets/${companyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        if (error.message?.includes('new row violates row-level security policy')) {
          throw new Error('Permission denied. Please check your account permissions.');
        } else if (error.message?.includes('The resource already exists')) {
          throw new Error('A file with this name already exists. Please try again.');
        } else {
          throw new Error(error.message || 'Failed to upload image');
        }
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get image URL');
      }

      setWalletFormData(prev => ({ ...prev, qr_code_url: urlData.publicUrl }));
      toast.success('QR code uploaded successfully');
    } catch (error) {
      console.error('Error uploading QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload QR code';
      toast.error(errorMessage);
    } finally {
      setUploadingQrCode(false);
    }
  };

  const handleWalletImageUpload = async (file: File) => {
    if (!file) return;

    if (file.type !== 'image/png') {
      toast.error('Please upload a PNG image only');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingWalletImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `crypto-wallets/${companyId}/images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        if (error.message?.includes('new row violates row-level security policy')) {
          throw new Error('Permission denied. Please check your account permissions.');
        } else if (error.message?.includes('The resource already exists')) {
          throw new Error('A file with this name already exists. Please try again.');
        } else {
          throw new Error(error.message || 'Failed to upload image');
        }
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get image URL');
      }

      setWalletFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      toast.success('Wallet image uploaded successfully');
    } catch (error) {
      console.error('Error uploading wallet image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload wallet image';
      toast.error(errorMessage);
    } finally {
      setUploadingWalletImage(false);
    }
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletFormData.wallet_name || !walletFormData.wallet_address || !walletFormData.cryptocurrency) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (wallets.length >= 4 && !editingWalletId) {
      toast.error('Maximum of 4 crypto wallets allowed');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        wallet_name: walletFormData.wallet_name,
        wallet_address: walletFormData.wallet_address,
        cryptocurrency: walletFormData.cryptocurrency,
        network: walletFormData.network || null,
        qr_code_url: walletFormData.qr_code_url || null,
        image_url: walletFormData.image_url || null,
        is_active: true,
      };

      let response;
      if (editingWalletId) {
        response = await fetch(`/api/admin/${companySlug}/crypto-wallets/${editingWalletId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/admin/${companySlug}/crypto-wallets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save crypto wallet');
      }

      toast.success(editingWalletId ? 'Crypto wallet updated' : 'Crypto wallet added');
      resetWalletForm();
      fetchWallets();
    } catch (error) {
      console.error('Error saving crypto wallet:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save crypto wallet');
    } finally {
      setSaving(false);
    }
  };

  const handleEditWallet = (wallet: CryptoWallet) => {
    setWalletFormData({
      wallet_name: wallet.wallet_name,
      wallet_address: wallet.wallet_address,
      cryptocurrency: wallet.cryptocurrency,
      network: wallet.network || '',
      qr_code_url: wallet.qr_code_url || '',
      image_url: wallet.image_url || '',
    });
    setEditingWalletId(wallet.id);
    setShowAddWalletForm(true);
  };

  const handleDeleteWallet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this crypto wallet?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/${companySlug}/crypto-wallets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete crypto wallet');
      }

      toast.success('Crypto wallet deleted');
      fetchWallets();
    } catch (error) {
      console.error('Error deleting crypto wallet:', error);
      toast.error('Failed to delete crypto wallet');
    }
  };

  const resetForm = () => {
    setFormData({
      bank_name: '',
      owner_name: '',
      account_number: '',
      rib: '',
      currency: 'USD',
      image_url: '',
    });
    setEditingId(null);
    setShowAddForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetWalletForm = () => {
    setWalletFormData({
      wallet_name: '',
      wallet_address: '',
      cryptocurrency: 'BTC',
      network: '',
      qr_code_url: '',
      image_url: '',
    });
    setEditingWalletId(null);
    setShowAddWalletForm(false);
    if (qrCodeInputRef.current) {
      qrCodeInputRef.current.value = '';
    }
    if (walletImageInputRef.current) {
      walletImageInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bank Accounts Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Bank Accounts
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage bank accounts (Max 4)
            </p>
          </div>
          {!showAddForm && accounts.length < 4 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddForm(true)}
              startIcon={<Plus className="w-4 h-4" />}
            >
              Add Bank Account
            </Button>
          )}
        </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {editingId ? 'Edit Bank Account' : 'Add Bank Account'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Bank Name *</Label>
              <Input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                placeholder="e.g., Bank of America"
                required
              />
            </div>

            <div>
              <Label>Bank Owner Name *</Label>
              <Input
                type="text"
                value={formData.owner_name}
                onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                placeholder="e.g., John Doe or Company Name"
                required
              />
            </div>

            <div>
              <Label>Account Number *</Label>
              <Input
                type="text"
                value={formData.account_number}
                onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="Account number"
                required
              />
            </div>

            <div>
              <Label>RIB (Relevé d&apos;Identité Bancaire)</Label>
              <Input
                type="text"
                value={formData.rib}
                onChange={(e) => setFormData(prev => ({ ...prev, rib: e.target.value }))}
                placeholder="RIB code (optional)"
              />
            </div>

            <div>
              <Label>Currency *</Label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CNY">CNY - Chinese Yuan</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="MAD">MAD - Moroccan Dirham</option>
                <option value="AED">AED - UAE Dirham</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label>Bank Image (PNG only)</Label>
              <div className="mt-2">
                {formData.image_url ? (
                  <div className="relative inline-block">
                    <Image
                      src={formData.image_url}
                      alt="Bank logo"
                      width={150}
                      height={100}
                      className="rounded-lg border border-gray-300 dark:border-gray-700 object-contain bg-white p-2"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png"
                      onChange={handleFileInput}
                      className="hidden"
                      id="bank-image-upload"
                    />
                    <label
                      htmlFor="bank-image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload PNG image
                          </span>
                          <span className="text-xs text-gray-500">
                            Max 5MB, PNG only
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              type="submit"
              disabled={saving || uploadingImage}
              className="flex-1"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add Bank Account'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No bank accounts added yet. Click &quot;Add Bank Account&quot; to get started.
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-start justify-between gap-4"
            >
              <div className="flex-1 flex items-start gap-4">
                {account.image_url ? (
                  <Image
                    src={account.image_url}
                    alt={account.bank_name}
                    width={80}
                    height={60}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 object-contain bg-white p-2"
                  />
                ) : (
                  <div className="w-20 h-15 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-400">No Image</span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-white">
                    {account.bank_name}
                  </h4>
                  {account.account_name && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Owner: {account.account_name}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Account: {account.account_number || 'N/A'}
                  </p>
                  {account.rib && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      RIB: {account.rib}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Currency: {account.currency}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(account)}
                  className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>

      {/* Crypto Wallets Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Crypto Wallets
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage cryptocurrency wallets (Max 4)
            </p>
          </div>
          {!showAddWalletForm && wallets.length < 4 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddWalletForm(true)}
              startIcon={<Plus className="w-4 h-4" />}
            >
              Add Crypto Wallet
            </Button>
          )}
        </div>

        {showAddWalletForm && (
          <form onSubmit={handleWalletSubmit} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {editingWalletId ? 'Edit Crypto Wallet' : 'Add Crypto Wallet'}
              </h3>
              <button
                type="button"
                onClick={resetWalletForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Wallet Name *</Label>
                <Input
                  type="text"
                  value={walletFormData.wallet_name}
                  onChange={(e) => setWalletFormData(prev => ({ ...prev, wallet_name: e.target.value }))}
                  placeholder="e.g., Bitcoin Wallet"
                  required
                />
              </div>

              <div>
                <Label>Cryptocurrency *</Label>
                <select
                  value={walletFormData.cryptocurrency}
                  onChange={(e) => setWalletFormData(prev => ({ ...prev, cryptocurrency: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="BTC">BTC - Bitcoin</option>
                  <option value="ETH">ETH - Ethereum</option>
                  <option value="USDT">USDT - Tether</option>
                  <option value="USDC">USDC - USD Coin</option>
                  <option value="BNB">BNB - Binance Coin</option>
                  <option value="ADA">ADA - Cardano</option>
                  <option value="SOL">SOL - Solana</option>
                  <option value="XRP">XRP - Ripple</option>
                  <option value="DOGE">DOGE - Dogecoin</option>
                  <option value="MATIC">MATIC - Polygon</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label>Wallet Address *</Label>
                <Input
                  type="text"
                  value={walletFormData.wallet_address}
                  onChange={(e) => setWalletFormData(prev => ({ ...prev, wallet_address: e.target.value }))}
                  placeholder="Enter wallet address"
                  required
                />
              </div>

              <div>
                <Label>Network</Label>
                <Input
                  type="text"
                  value={walletFormData.network}
                  onChange={(e) => setWalletFormData(prev => ({ ...prev, network: e.target.value }))}
                  placeholder="e.g., Ethereum, Binance Smart Chain"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Wallet Image (PNG only)</Label>
                <div className="mt-2">
                  {walletFormData.image_url ? (
                    <div className="relative inline-block">
                      <Image
                        src={walletFormData.image_url}
                        alt="Wallet logo"
                        width={150}
                        height={100}
                        className="rounded-lg border border-gray-300 dark:border-gray-700 object-contain bg-white p-2"
                      />
                      <button
                        type="button"
                        onClick={() => setWalletFormData(prev => ({ ...prev, image_url: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                      <input
                        ref={walletImageInputRef}
                        type="file"
                        accept="image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleWalletImageUpload(file);
                        }}
                        className="hidden"
                        id="wallet-image-upload"
                      />
                      <label
                        htmlFor="wallet-image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        {uploadingWalletImage ? (
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Click to upload wallet image (PNG)
                            </span>
                            <span className="text-xs text-gray-500">
                              Max 5MB, PNG only
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>QR Code (PNG only)</Label>
                <div className="mt-2">
                  {walletFormData.qr_code_url ? (
                    <div className="relative inline-block">
                      <Image
                        src={walletFormData.qr_code_url}
                        alt="QR Code"
                        width={150}
                        height={150}
                        className="rounded-lg border border-gray-300 dark:border-gray-700 object-contain bg-white p-2"
                      />
                      <button
                        type="button"
                        onClick={() => setWalletFormData(prev => ({ ...prev, qr_code_url: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                      <input
                        ref={qrCodeInputRef}
                        type="file"
                        accept="image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleQrCodeUpload(file);
                        }}
                        className="hidden"
                        id="qr-code-upload"
                      />
                      <label
                        htmlFor="qr-code-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        {uploadingQrCode ? (
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Click to upload QR code (PNG)
                            </span>
                            <span className="text-xs text-gray-500">
                              Max 5MB, PNG only
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                type="submit"
                disabled={saving || uploadingQrCode || uploadingWalletImage}
                className="flex-1"
              >
                {saving ? 'Saving...' : editingWalletId ? 'Update' : 'Add Crypto Wallet'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetWalletForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {wallets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No crypto wallets added yet. Click &quot;Add Crypto Wallet&quot; to get started.
            </div>
          ) : (
            wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-start justify-between gap-4"
              >
                <div className="flex-1 flex items-start gap-4">
                  {wallet.image_url ? (
                    <Image
                      src={wallet.image_url}
                      alt={wallet.wallet_name}
                      width={80}
                      height={60}
                      className="rounded-lg border border-gray-300 dark:border-gray-700 object-contain bg-white p-2"
                    />
                  ) : wallet.qr_code_url ? (
                    <Image
                      src={wallet.qr_code_url}
                      alt="QR Code"
                      width={80}
                      height={80}
                      className="rounded-lg border border-gray-300 dark:border-gray-700 object-contain bg-white p-2"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Wallet className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      {wallet.wallet_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-medium">{wallet.cryptocurrency}</span>
                      {wallet.network && ` - ${wallet.network}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono break-all">
                      {wallet.wallet_address}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditWallet(wallet)}
                    className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWallet(wallet.id)}
                    className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}




