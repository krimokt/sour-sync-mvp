'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product, ProductInsert, ProductVariant, Category } from '@/types/database';
import ImageUploader from './ImageUploader';

interface ProductFormProps {
  product?: Product;
  companyId: string;
  companySlug: string;
}

export default function ProductForm({ product, companyId, companySlug }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form state
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [comparePrice, setComparePrice] = useState(product?.compare_price?.toString() || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [category, setCategory] = useState(product?.category || '');
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);
  const [isPublished, setIsPublished] = useState(product?.is_published ?? true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    
    if (data) setCategories(data);
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', value: '', price_adjustment: 0 }]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name.trim()) {
      setError('Product name is required');
      setIsLoading(false);
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError('Valid price is required');
      setIsLoading(false);
      return;
    }

    try {
      const productData: ProductInsert = {
        company_id: companyId,
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        compare_price: comparePrice ? parseFloat(comparePrice) : null,
        sku: sku.trim() || null,
        stock: parseInt(stock) || 0,
        category: category || null,
        images,
        variants: variants.filter(v => v.name && v.value),
        is_published: isPublished,
      };

      if (product) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (updateError) throw updateError;
      } else {
        // Create new product
        const { error: insertError } = await supabase
          .from('products')
          .insert(productData);

        if (insertError) throw insertError;
      }

      router.push(`/store/${companySlug}/products`);
      router.refresh();
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="Describe your product..."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Images
            </h2>
            <ImageUploader
              images={images}
              onImagesChange={setImages}
              companyId={companyId}
            />
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pricing
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Compare at Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Original price to show discount</p>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Inventory
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="SKU-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Variants
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                + Add Variant
              </button>
            </div>
            
            {variants.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No variants added. Add variants like size, color, etc.
              </p>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      placeholder="Name (e.g., Size)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    />
                    <input
                      type="text"
                      value={variant.value}
                      onChange={(e) => updateVariant(index, 'value', e.target.value)}
                      placeholder="Value (e.g., Large)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price_adjustment || ''}
                      onChange={(e) => updateVariant(index, 'price_adjustment', parseFloat(e.target.value) || 0)}
                      placeholder="+/-"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded dark:hover:bg-red-900/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status
            </h2>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Published
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Product will be visible on your website
                </p>
              </div>
            </label>
          </div>

          {/* Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Organization
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Or type a new category"
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

