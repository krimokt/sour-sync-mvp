'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button/Button';
import InputField from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useClient } from '@/context/ClientContext';
import { toast } from 'sonner';
import { Loader2, ShoppingCart, CheckCircle, Building2, Wallet, MapPin, Plus, X, Copy } from 'lucide-react';
import type { BankAccount, CryptoWallet } from '@/types/store';
import { countries as countryCodes } from 'country-flag-icons';
import { CloseIcon } from '@/icons';

// Helper function to get emoji flag from country code
const getCountryEmoji = (countryCode: string): string => {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    console.warn(`Failed to generate emoji for country code: ${countryCode}`, error);
    return '🏳️'; // Default flag emoji
  }
};

// Helper function to get country name from code
const getCountryName = (code: string): string => {
  if (!code) return code;
  
  // Filter out subdivision codes (codes with hyphens like "GB-ENG", "ES-CT")
  // These are ISO 3166-2 subdivision codes, not ISO 3166-1 country codes
  if (code.includes('-')) {
    // Extract the country part (before the hyphen)
    const countryCode = code.split('-')[0];
    code = countryCode;
  }
  
  // Validate it's a 2-letter country code
  if (code.length !== 2) {
    return code;
  }
  
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const name = displayNames.of(code.toUpperCase());
    return name || code;
  } catch (error) {
    // Silently return the code if DisplayNames fails
    return code;
  }
};

// Type for country data
interface CountryData {
  code: string;
  name: string;
  emoji: string;
}

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

type ClientAddress = {
  id: string;
  user_id: string;
  company_id: string;
  full_name: string | null;
  company_name: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

interface CheckoutCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CheckoutCartModal({ isOpen, onClose, onSuccess }: CheckoutCartModalProps) {
  const { company } = useClient();

  const [cart, setCart] = useState(null as Cart | null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bankAccounts, setBankAccounts] = useState([] as BankAccount[]);
  const [cryptoWallets, setCryptoWallets] = useState([] as CryptoWallet[]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);

  const [addresses, setAddresses] = useState([] as ClientAddress[]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null as string | null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null as ClientAddress | null);

  // New address form
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    company_name: '',
    address_line_1: '',
    city: '',
    country: '',
    phone: '',
    is_default: false,
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    null as { type: 'bank' | 'crypto'; id: string } | null
  );
  const [copiedId, setCopiedId] = useState(null as string | null);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  const items = cart?.items || [];

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.product?.price ?? item.price_at_add ?? 0;
      return sum + Number(price) * Number(item.quantity || 0);
    }, 0);
  }, [items]);

  // Build countries list - filter by quotation settings if available
  const countries = useMemo(() => {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    let countryList: CountryData[] = countryCodes
      .map((code) => {
        // Skip subdivision codes (codes with hyphens)
        if (code.includes('-')) {
          return null;
        }
        
        // Only process 2-letter country codes
        if (code.length !== 2) {
          return null;
        }
        
        try {
          const name = displayNames.of(code);
          if (!name) return null;
          
          return {
            code: code.toLowerCase(),
            name: name,
            emoji: getCountryEmoji(code)
          };
        } catch (error) {
          // Skip invalid country codes silently
          return null;
        }
      })
      .filter((country): country is CountryData => country !== null);
    
    // Filter by quotation countries if they are set
    if (company?.quotation_countries && Array.isArray(company.quotation_countries) && company.quotation_countries.length > 0) {
      // Normalize allowed codes - extract country part from subdivision codes
      const allowedCodes = company.quotation_countries.map(code => {
        const normalized = code.includes('-') ? code.split('-')[0] : code;
        return normalized.toLowerCase();
      });
      countryList = countryList.filter(country => allowedCodes.includes(country.code));
    }
    
    // Sort countries by name
    countryList.sort((a, b) => a.name.localeCompare(b.name));
    
    return countryList;
  }, [company?.quotation_countries]);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!countrySearchQuery.trim()) return countries;
    return countries.filter(country => 
      country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) || 
      country.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );
  }, [countries, countrySearchQuery]);

  const handleCountrySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountrySearchQuery(value);
    // If input is cleared, clear the country selection
    if (!value.trim() && newAddress.country) {
      setNewAddress({ ...newAddress, country: '' });
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    if (isOpen && company) {
      loadCart();
      loadPaymentMethods();
      loadAddresses();
    }
  }, [isOpen, company?.slug]);

  const loadCart = async () => {
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

  const loadPaymentMethods = async () => {
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

  const loadAddresses = async () => {
    if (!company) return;
    setIsLoadingAddresses(true);
    try {
      const res = await fetch(`/api/client/${company.slug}/addresses`, { cache: 'no-store' });
      const json = await res.json();
      if (res.ok && json.addresses) {
        setAddresses(json.addresses);
        if (json.addresses.length > 0) {
          setSelectedAddressId(json.addresses[0].id);
        } else {
          setSelectedAddressId(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleAddAddress = async () => {
    if (!company) return;
    if (!newAddress.full_name || !newAddress.address_line_1 || !newAddress.city || !newAddress.country) {
      toast.error('Please fill in required fields (Full Name, Address Line 1, City, Country)');
      return;
    }

    try {
      // Optimistically update the address in the list immediately
      const updatedAddress: ClientAddress = {
        id: editingAddress?.id || `temp-${Date.now()}`,
        user_id: editingAddress?.user_id || '',
        company_id: editingAddress?.company_id || company.id,
        full_name: newAddress.full_name,
        company_name: newAddress.company_name,
        address_line_1: newAddress.address_line_1,
        address_line_2: null,
        city: newAddress.city,
        country: newAddress.country,
        phone: newAddress.phone,
        is_default: true,
        created_at: editingAddress?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update addresses list immediately for instant UI feedback
      if (editingAddress) {
        setAddresses(prev => prev.map(addr => 
          addr.id === editingAddress.id ? updatedAddress : addr
        ));
      } else {
        setAddresses(prev => [updatedAddress, ...prev]);
        setSelectedAddressId(updatedAddress.id);
      }

      const res = await fetch(`/api/client/${company.slug}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });

      const json = await res.json();
      if (!res.ok) {
        // Revert optimistic update on error
        await loadAddresses();
        throw new Error(json.error || 'Failed to save address');
      }

      toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
      setShowAddAddress(false);
      setEditingAddress(null);
      setNewAddress({
        full_name: '',
        company_name: '',
        address_line_1: '',
        city: '',
        country: '',
        phone: '',
        is_default: false,
      });
      setCountrySearchQuery('');
      
      // Refresh addresses to ensure consistency
      await loadAddresses();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to save address');
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

  const handleCheckout = async () => {
    if (!company) return;
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
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
          address_id: selectedAddressId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Checkout failed');

      toast.success(
        'The order is now in the payment page. The payment department will review your order payment.'
      );

      window.dispatchEvent(new Event('cart:updated'));
      onClose();
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Cart Items + Delivery Address */}
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Cart</h3>
              </div>

              {isLoadingCart ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your cart is empty</p>
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

            {/* Delivery Address */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/20 p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Address</h3>
              </div>

            {isLoadingAddresses ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-[#06b6d4] bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {addr.full_name || 'N/A'}
                        </div>
                        {addr.company_name && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {addr.company_name}
                          </div>
                        )}
                        {addr.address_line_1 && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {addr.address_line_1}
                            {addr.address_line_2 && `, ${addr.address_line_2}`}
                          </div>
                        )}
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {addr.city}, {getCountryName(addr.country)}
                        </div>
                        {addr.phone && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Phone: {addr.phone}</div>
                        )}
                      </div>
                      {selectedAddressId === addr.id && (
                        <CheckCircle className="w-5 h-5 text-[#06b6d4] flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setEditingAddress(addr);
                        const countryCode = addr.country || '';
                        setNewAddress({
                          full_name: addr.full_name || '',
                          company_name: addr.company_name || '',
                          address_line_1: addr.address_line_1 || '',
                          city: addr.city || '',
                          country: countryCode,
                          phone: addr.phone || '',
                          is_default: false,
                        });
                        // Set country search query to show the country name
                        if (countryCode) {
                          const countryName = countries.find(c => c.code === countryCode)?.name || '';
                          setCountrySearchQuery(countryName);
                        } else {
                          setCountrySearchQuery('');
                        }
                        setShowAddAddress(true);
                      }}
                    >
                      Edit Address
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                No address added yet
              </div>
            )}

            {!showAddAddress ? (
              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={() => setShowAddAddress(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                {addresses.length > 0 ? 'Update Address' : 'Add Address'}
              </Button>
            ) : (
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {editingAddress ? 'Edit Address' : 'Add Address'}
                      </h4>
                      <button
                        onClick={() => {
                          setShowAddAddress(false);
                          setEditingAddress(null);
                          setNewAddress({
                            full_name: '',
                            company_name: '',
                            address_line_1: '',
                            city: '',
                            country: '',
                            phone: '',
                            is_default: false,
                          });
                          setCountrySearchQuery('');
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <Label>Full Name *</Label>
                      <InputField
                        value={newAddress.full_name}
                        onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div>
                      <Label>Company Name (Optional)</Label>
                      <InputField
                        value={newAddress.company_name}
                        onChange={(e) => setNewAddress({ ...newAddress, company_name: e.target.value })}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label>Adress line *</Label>
                      <InputField
                        value={newAddress.address_line_1}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                        placeholder="Street address"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>City *</Label>
                        <InputField
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="relative">
                        <Label>Country *</Label>
                        <div className="space-y-2">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search countries..."
                              value={newAddress.country && !countrySearchQuery 
                                ? countries.find(c => c.code === newAddress.country)?.name || "" 
                                : countrySearchQuery}
                              onChange={handleCountrySearchChange}
                              onFocus={() => {
                                // When user focuses on input, clear it if it shows the selected country name
                                if (newAddress.country && countrySearchQuery === countries.find(c => c.code === newAddress.country)?.name) {
                                  setCountrySearchQuery("");
                                }
                              }}
                              className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                              required
                            />
                            {newAddress.country && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewAddress({ ...newAddress, country: '' });
                                  setCountrySearchQuery("");
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title="Clear selection"
                              >
                                <CloseIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className={`overflow-y-auto border border-gray-300 rounded-md transition-all duration-200 ${
                            newAddress.country ? 'h-auto max-h-[60px]' : 'h-[200px]'
                          }`}>
                            {filteredCountries.length === 0 ? (
                              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No countries found matching your search.
                              </div>
                            ) : (
                              filteredCountries.map((countryOption) => (
                                <div
                                  key={countryOption.code}
                                  onClick={() => {
                                    setNewAddress({ ...newAddress, country: countryOption.code });
                                    setCountrySearchQuery(countryOption.name);
                                  }}
                                  className={`flex items-center gap-2 p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                    newAddress.country === countryOption.code
                                      ? "bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 border-l-2 border-l-[#06b6d4] dark:border-l-[#06b6d4]"
                                      : ""
                                  }`}
                                >
                                  <span className="text-xl">{countryOption.emoji}</span>
                                  <span className="text-gray-900 dark:text-white">{countryOption.name}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <InputField
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="Phone number"
                      />
                    </div>
                    <Button variant="primary" onClick={handleAddAddress} className="w-full">
                      {editingAddress ? 'Update Address' : 'Save Address'}
                    </Button>
                  </div>
                )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className={`rounded-2xl border-2 bg-white dark:bg-gray-900/20 p-5 space-y-4 transition-all ${
            !selectedPaymentMethod 
              ? 'border-[#06b6d4] border-dashed bg-[#06b6d4]/5 dark:bg-[#06b6d4]/10' 
              : 'border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Payment Method</h3>
              {!selectedPaymentMethod && (
                <span className="text-xs text-[#06b6d4] font-medium animate-pulse">
                  Please select a payment method
                </span>
              )}
            </div>

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
                      {bankAccounts.map((a) => {
                        const isSelected = selectedPaymentMethod?.type === 'bank' && selectedPaymentMethod?.id === a.id;
                        return (
                          <div
                            key={a.id}
                            className={`border-2 rounded-xl overflow-hidden transition-all ${
                              isSelected
                                ? 'border-[#06b6d4] bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <button
                              onClick={() => setSelectedPaymentMethod({ type: 'bank', id: a.id })}
                              className="w-full p-3 text-left"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  {a.image_url ? (
                                    <Image
                                      src={a.image_url}
                                      alt={a.bank_name}
                                      width={40}
                                      height={32}
                                      className="rounded object-contain bg-white p-0.5 border border-gray-200 dark:border-gray-700 flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                                      <Building2 className="w-5 h-5 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.bank_name}</div>
                                    {a.account_name && (
                                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{a.account_name}</div>
                                    )}
                                    <div className="text-xs text-gray-500 dark:text-gray-500">{a.currency}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isSelected && (
                                    <CheckCircle className="w-5 h-5 text-[#06b6d4] flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            </button>
                            
                            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 space-y-2">
                              {a.account_number && (
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">Account Number:</span>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs font-mono font-medium text-gray-800 dark:text-white truncate">
                                      {a.account_number}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(a.account_number!, `acc-${a.id}`);
                                      }}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    >
                                      {copiedId === `acc-${a.id}` ? (
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-gray-500" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {a.rib && (
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">RIB:</span>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs font-mono font-medium text-gray-800 dark:text-white truncate">
                                      {a.rib}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(a.rib!, `rib-${a.id}`);
                                      }}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    >
                                      {copiedId === `rib-${a.id}` ? (
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-gray-500" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {a.iban && (
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">IBAN:</span>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs font-mono font-medium text-gray-800 dark:text-white truncate">
                                      {a.iban}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(a.iban!, `iban-${a.id}`);
                                      }}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    >
                                      {copiedId === `iban-${a.id}` ? (
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-gray-500" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {a.swift_code && (
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">SWIFT/BIC:</span>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs font-mono font-medium text-gray-800 dark:text-white truncate">
                                      {a.swift_code}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(a.swift_code!, `swift-${a.id}`);
                                      }}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    >
                                      {copiedId === `swift-${a.id}` ? (
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-gray-500" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {a.routing_number && (
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">Routing Number:</span>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs font-mono font-medium text-gray-800 dark:text-white truncate">
                                      {a.routing_number}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(a.routing_number!, `routing-${a.id}`);
                                      }}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    >
                                      {copiedId === `routing-${a.id}` ? (
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-gray-500" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {a.branch_name && (
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">Branch:</span>
                                  <span className="text-xs font-medium text-gray-800 dark:text-white truncate">
                                    {a.branch_name}
                                  </span>
                                </div>
                              )}
                              {a.instructions && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">Instructions:</span>
                                  <p className="text-xs text-gray-800 dark:text-white mt-1">{a.instructions}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {cryptoWallets.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Wallet className="w-4 h-4" /> Crypto Wallets
                    </div>
                    <div className="space-y-2">
                      {cryptoWallets.map((w) => {
                        const isSelected = selectedPaymentMethod?.type === 'crypto' && selectedPaymentMethod?.id === w.id;
                        return (
                          <div
                            key={w.id}
                            className={`border-2 rounded-xl overflow-hidden transition-all ${
                              isSelected
                                ? 'border-[#06b6d4] bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <button
                              onClick={() => setSelectedPaymentMethod({ type: 'crypto', id: w.id })}
                              className="w-full p-3 text-left"
                            >
                              <div className="flex items-center gap-3">
                                {w.image_url ? (
                                  <Image
                                    src={w.image_url}
                                    alt={w.wallet_name}
                                    width={40}
                                    height={32}
                                    className="rounded object-contain bg-white p-0.5 border border-gray-200 dark:border-gray-700 flex-shrink-0"
                                  />
                                ) : w.qr_code_url ? (
                                  <Image
                                    src={w.qr_code_url}
                                    alt="QR Code"
                                    width={40}
                                    height={40}
                                    className="rounded object-contain bg-white p-0.5 border border-gray-200 dark:border-gray-700 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                                    <Wallet className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{w.wallet_name}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {w.cryptocurrency}
                                    {w.network ? ` - ${w.network}` : ''}
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="w-5 h-5 text-[#06b6d4] flex-shrink-0" />
                                )}
                              </div>
                            </button>
                            
                            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 space-y-2">
                              {w.wallet_address && (
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">Wallet Address:</span>
                                  <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                                    <span className="text-xs font-mono font-medium text-gray-800 dark:text-white truncate text-right">
                                      {w.wallet_address}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(w.wallet_address, `wallet-${w.id}`);
                                      }}
                                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
                                    >
                                      {copiedId === `wallet-${w.id}` ? (
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-gray-500" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {w.qr_code_url && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <span className="text-xs text-gray-600 dark:text-gray-400 block mb-2">QR Code:</span>
                                  <div className="flex justify-center">
                                    <Image
                                      src={w.qr_code_url}
                                      alt="QR Code"
                                      width={150}
                                      height={150}
                                      className="rounded border border-gray-200 dark:border-gray-700 bg-white p-2"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Confirm Checkout Button - Centered at bottom */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="primary"
            onClick={handleCheckout}
            disabled={items.length === 0 || !selectedAddressId || !selectedPaymentMethod || isSubmitting}
            className="min-w-[200px] px-8 py-3 text-base font-semibold"
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
      </DialogContent>
    </Dialog>
  );
}



