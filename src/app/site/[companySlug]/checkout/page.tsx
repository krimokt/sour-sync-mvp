'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ShoppingBag, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Send, 
  Loader2, 
  CheckCircle2,
  Package,
  ArrowLeft
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import StoreHeader from '../components/StoreHeader';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website_settings?: {
    primary_color?: string;
  };
}

export default function CheckoutPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;

  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    products: '',
    quantity: '',
    notes: '',
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data } = await supabase
          .from('companies')
          .select('id, name, slug, logo_url, website_settings(primary_color)')
          .eq('slug', companySlug)
          .eq('status', 'active')
          .single();

        if (data) {
          setCompany({
            ...data,
            website_settings: Array.isArray(data.website_settings) 
              ? data.website_settings[0] 
              : data.website_settings
          });
        }
      } catch (err) {
        console.error('Error fetching company:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
  }, [companySlug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Create order/inquiry in database
      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          company_id: company?.id,
          order_number: `ORD${Date.now()}`,
          status: 'pending',
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_country: formData.country,
          shipping_city: formData.city,
          shipping_address_1: formData.address,
          customer_notes: `Products: ${formData.products}\nQuantity: ${formData.quantity}\n\nNotes: ${formData.notes}`,
          subtotal: 0,
          total: 0,
          payment_method: 'pending',
          payment_status: 'pending',
        });

      if (insertError) {
        // If orders table doesn't exist, try quotations table
        const { error: quoteError } = await supabase
          .from('quotations')
          .insert({
            company_id: company?.id,
            client_name: formData.name,
            client_email: formData.email,
            client_phone: formData.phone,
            client_country: formData.country,
            product_name: formData.products,
            quantity: formData.quantity,
            notes: `City: ${formData.city}\nAddress: ${formData.address}\n\n${formData.notes}`,
            status: 'pending',
          });

        if (quoteError) {
          console.error('Error submitting order:', quoteError);
          throw new Error('Failed to submit your order. Please try again.');
        }
      }

      setSubmitted(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const themeColor = company?.website_settings?.primary_color || '#3B82F6';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StoreHeader 
          companyName={company?.name} 
          logoUrl={company?.logo_url} 
          themeColor={themeColor} 
        />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${themeColor}20` }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: themeColor }} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Order Submitted!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your order. We&apos;ve received your request and will contact you shortly 
              with pricing and shipping details.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/site/${companySlug}/products`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Package className="w-4 h-4" />
                Browse More Products
              </Link>
              <Link
                href={`/site/${companySlug}/track`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white transition-colors"
                style={{ backgroundColor: themeColor }}
              >
                Track Your Order
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader 
        companyName={company?.name} 
        logoUrl={company?.logo_url} 
        themeColor={themeColor} 
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href={`/site/${companySlug}/products`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <ShoppingBag className="w-8 h-8" style={{ color: themeColor }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Place Your Order</h1>
          <p className="text-gray-600">
            Fill in your details and we&apos;ll get back to you with pricing and shipping information.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" style={{ color: themeColor }} />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: themeColor }} />
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="United States"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="New York"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St, Apt 4B"
                  />
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" style={{ color: themeColor }} />
                Order Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Products / Items *
                  </label>
                  <input
                    type="text"
                    name="products"
                    required
                    value={formData.products}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Product name or description"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 100 units, 50 pieces"
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" style={{ color: themeColor }} />
                Additional Notes
              </h2>
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Any special requirements, specifications, or questions..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Order Request
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              We&apos;ll review your order and contact you within 24 hours with pricing details.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
