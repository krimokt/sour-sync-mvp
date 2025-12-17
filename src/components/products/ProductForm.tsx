'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product, ProductInsert, ProductVariant, VariantGroup, VariantValue, PriceTier, Category } from '@/types/database';
import ImageUploader from './ImageUploader';
import { Plus, X, Package, DollarSign, Layers, Tag, CheckCircle2 } from 'lucide-react';

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
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>(product?.variant_groups || []);
  const [moq, setMoq] = useState<number | undefined>(product?.moq);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>(product?.price_tiers || []);
  const [isPublished, setIsPublished] = useState(product?.is_published ?? true);

  useEffect(() => {
    fetchCategories();
    if (product?.id) {
      fetchPriceTiers(product.id);
    }
  }, [product?.id]);

  const fetchPriceTiers = async (productId: string) => {
    const { data, error } = await supabase
      .from('price_tiers')
      .select('*')
      .eq('product_id', productId)
      .order('min_qty', { ascending: true });
    
    if (data && !error) {
      setPriceTiers(data);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    
    if (data) setCategories(data);
  };


  // New variant group functions (Alibaba-style)
  const addVariantGroup = () => {
    const newGroup: VariantGroup = {
      id: `group-${Date.now()}`,
      name: '',
      values: []
    };
    setVariantGroups([...variantGroups, newGroup]);
  };

  const updateVariantGroup = (index: number, field: keyof VariantGroup, value: string) => {
    const newGroups = [...variantGroups];
    newGroups[index] = { ...newGroups[index], [field]: value };
    setVariantGroups(newGroups);
  };

  const removeVariantGroup = (index: number) => {
    setVariantGroups(variantGroups.filter((_, i) => i !== index));
  };

  const addVariantValue = (groupIndex: number) => {
    const newGroups = [...variantGroups];
    const newValue: VariantValue = {
      id: `value-${Date.now()}`,
      name: '',
      images: [],
      moq: undefined
    };
    newGroups[groupIndex].values.push(newValue);
    setVariantGroups(newGroups);
  };

  const updateVariantValue = (groupIndex: number, valueIndex: number, field: keyof VariantValue, value: string | string[] | number | undefined) => {
    const newGroups = [...variantGroups];
    newGroups[groupIndex].values[valueIndex] = {
      ...newGroups[groupIndex].values[valueIndex],
      [field]: value
    };
    setVariantGroups(newGroups);
  };

  const removeVariantValue = (groupIndex: number, valueIndex: number) => {
    const newGroups = [...variantGroups];
    newGroups[groupIndex].values = newGroups[groupIndex].values.filter((_, i) => i !== valueIndex);
    setVariantGroups(newGroups);
  };

  const addPriceTier = () => {
    setPriceTiers([...priceTiers, { min_qty: 1, max_qty: null, base_price: parseFloat(price) || 0 }]);
  };

  const updatePriceTier = (index: number, field: keyof PriceTier, value: number | string | null) => {
    const newTiers = [...priceTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setPriceTiers(newTiers);
  };

  const removePriceTier = (index: number) => {
    setPriceTiers(priceTiers.filter((_, i) => i !== index));
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
        variants: variants.filter(v => v.name && v.value), // Legacy support
        variant_groups: variantGroups.filter(g => g.name && g.values.length > 0), // New Alibaba-style
        moq: moq && moq > 0 ? moq : undefined,
        is_published: isPublished,
      };

      let productId: string;

      if (product) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (updateError) throw updateError;
        productId = product.id;
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();

        if (insertError) throw insertError;
        if (!newProduct) throw new Error('Failed to create product');
        productId = newProduct.id;
      }

      const validTiers = priceTiers.filter(t => t.min_qty > 0 && t.base_price >= 0);
      
      if (validTiers.length > 0) {
        await supabase
          .from('price_tiers')
          .delete()
          .eq('product_id', productId);

        const tiersToInsert = validTiers.map(tier => ({
          product_id: productId,
          min_qty: tier.min_qty,
          max_qty: tier.max_qty,
          base_price: tier.base_price,
          sort_order: tier.sort_order || 0,
        }));

        const { error: tiersError } = await supabase
          .from('price_tiers')
          .insert(tiersToInsert);

        if (tiersError) {
          console.error('Error saving price tiers:', tiersError);
        }
      } else {
        await supabase
          .from('price_tiers')
          .delete()
          .eq('product_id', productId);
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
    <div className="max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-error-50 border-l-4 border-error-500 text-error-700 rounded-r-lg dark:bg-error-900/20 dark:border-error-500 dark:text-error-400">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Basic Information
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
                    placeholder="Describe your product..."
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Images
                </h2>
              </div>
              <div className="p-6">
                <ImageUploader
                  images={images}
                  onImagesChange={setImages}
                  companyId={companyId}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-brand-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pricing
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price <span className="text-error-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compare at Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={comparePrice}
                        onChange={(e) => setComparePrice(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Original price to show discount</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Tiers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-500" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Price Tiers
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Quantity-based pricing discounts
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addPriceTier}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tier
                  </button>
                </div>
              </div>
              <div className="p-6">
                {priceTiers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No price tiers added</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {priceTiers.map((tier, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                              Min Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={tier.min_qty}
                              onChange={(e) => updatePriceTier(index, 'min_qty', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                              placeholder="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                              Max Quantity
                            </label>
                            <input
                              type="number"
                              min={tier.min_qty}
                              value={tier.max_qty || ''}
                              onChange={(e) => updatePriceTier(index, 'max_qty', e.target.value ? parseInt(e.target.value) : null)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                              placeholder="Unlimited"
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Leave empty for unlimited</p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                              Price
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={tier.base_price}
                                onChange={(e) => updatePriceTier(index, 'base_price', parseFloat(e.target.value) || 0)}
                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePriceTier(index)}
                          className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors mt-6"
                          title="Remove tier"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-brand-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Inventory
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                      placeholder="SKU-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MOQ */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-brand-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Minimum Order Quantity (MOQ)
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Global MOQ
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={moq || ''}
                    onChange={(e) => setMoq(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    placeholder="Enter minimum order quantity"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Global MOQ applies to all variants. You can also set specific MOQ per variant value below.
                  </p>
                </div>
              </div>
            </div>

            {/* Variant Groups (Alibaba-style) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-500" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Variant Groups
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Create groups like Color, Size, Material, etc.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantGroup}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Group
                  </button>
                </div>
              </div>
              <div className="p-6">
                {variantGroups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No variant groups added</p>
                    <p className="text-xs mt-1">Examples: Color, Size, Material, Voltage, Packaging</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {variantGroups.map((group, groupIndex) => (
                      <div key={group.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => updateVariantGroup(groupIndex, 'name', e.target.value)}
                            placeholder="Group name (e.g., Color, Size)"
                            className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantGroup(groupIndex)}
                            className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {group.values.map((value, valueIndex) => (
                            <div key={value.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="grid grid-cols-12 gap-3 items-start">
                                <div className="col-span-4">
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Value Name
                                  </label>
                                  <input
                                    type="text"
                                    value={value.name}
                                    onChange={(e) => updateVariantValue(groupIndex, valueIndex, 'name', e.target.value)}
                                    placeholder="e.g., Black, White, S, M"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                  />
                                </div>
                                
                                <div className="col-span-3">
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    MOQ (Optional)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={value.moq || ''}
                                    onChange={(e) => updateVariantValue(groupIndex, valueIndex, 'moq', e.target.value ? parseInt(e.target.value) : undefined)}
                                    placeholder="MOQ"
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                                  />
                                </div>
                                
                                <div className="col-span-5">
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Images (Optional)
                                  </label>
                                  <div className="min-h-[60px]">
                                    <ImageUploader
                                      images={value.images || []}
                                      onImagesChange={(images) => updateVariantValue(groupIndex, valueIndex, 'images', images)}
                                      companyId={companyId}
                                      maxImages={3}
                                    />
                                  </div>
                                </div>
                                
                                <div className="col-span-1 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => removeVariantValue(groupIndex, valueIndex)}
                                    className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors mt-6"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <button
                            type="button"
                            onClick={() => addVariantValue(groupIndex)}
                            className="w-full px-3 py-2 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Value
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Status
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white block">
                      Published
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Product will be visible on your website
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Category
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Or Create New
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Type a new category"
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-500 shadow-sm hover:shadow-md"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    product ? 'Update Product' : 'Create Product'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
