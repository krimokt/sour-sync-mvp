'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClient } from '@/context/ClientContext';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database';
import ProductsTable from '@/components/products/ProductsTable';
import StatCard from '@/components/common/StatCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { ProductCard } from '@/components/ui/product-card-2';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ProductDetailModal from '@/components/products/ProductDetailModal';
import CheckoutModal from '@/components/products/CheckoutModal';
import CheckoutCartModal from '@/components/products/CheckoutCartModal';

export default function ClientProductsPage() {
  const router = useRouter();
  const { company, client } = useClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [orderingProductId, setOrderingProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckoutCartOpen, setIsCheckoutCartOpen] = useState(false);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);

  const fetchProducts = async () => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('company_id', company.id)
        .eq('is_published', true) // Clients can only see published products
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [company, searchTerm]);

  const publishedCount = products.filter(p => p.is_published).length;
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  if (!company) return null;

  const handleOrderProduct = async (productId: string, quantity: number): Promise<void> => {
    // Open checkout modal instead of directly ordering
    setCheckoutQuantity(quantity);
    setIsModalOpen(false); // Close product detail modal
    setIsCheckoutOpen(true); // Open checkout modal
  };

  const handleConfirmOrder = async (
    productId: string, 
    quantity: number, 
    paymentMethod: { type: 'bank' | 'crypto'; id: string },
    addressId: string
  ) => {
    if (!company || !client) {
      toast.error('Unable to place order. Please try again.');
      return;
    }

    setOrderingProductId(productId);
    try {
      const response = await fetch(`/api/client/${company.slug}/products/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product_id: productId,
          quantity,
          payment_method_type: paymentMethod.type,
          payment_method_id: paymentMethod.id,
          address_id: addressId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Success is handled by checkout modal showing confirmation
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
      throw error;
    } finally {
      setOrderingProductId(null);
    }
  };

  const handleAddToCart = async (productId: string, quantity: number) => {
    if (!company || !client) {
      toast.error('Unable to add to cart. Please try again.');
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch(`/api/client/${company.slug}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product_id: productId,
          quantity 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Failed to add to cart';
        throw new Error(errorMsg);
      }

      toast.success('Product added to cart!');
      // Dispatch event to update cart dropdown
      window.dispatchEvent(new Event('cart:updated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
      throw error;
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <PageBreadcrumb pageTitle="Products" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Browse available products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cards')}
          >
            Cards
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Available Products"
          value={products.length}
          variant="dark"
        />
        <StatCard
          title="Published Products"
          value={publishedCount}
          variant="light"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Products */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading products...</div>
          ) : (
            <ProductsTable
              products={filteredProducts}
              companySlug={company.slug}
              isReadOnly={true} // Clients can only view, not edit
              onRefresh={fetchProducts}
            />
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No products found</div>
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {filteredProducts.map((p) => {
                const firstImage =
                  (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null) ||
                  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';

                const hasDiscount = p.compare_price && p.compare_price > p.price;
                const discountAmount = hasDiscount ? p.compare_price! - p.price : 0;
                const discountPercent = hasDiscount && p.compare_price 
                  ? Math.round((discountAmount / p.compare_price) * 100) 
                  : 0;

                return (
                  <motion.div
                    key={p.id}
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: {
                          type: "spring",
                          stiffness: 100,
                          damping: 10,
                        },
                      },
                    }}
                  >
                    <ProductCard
                      imageUrl={firstImage}
                      name={p.name}
                      tagline={p.description || p.category || 'Available now'}
                      price={Number(p.price)}
                      currency="$"
                      isCouponPrice={false}
                      originalPrice={p.compare_price ? Number(p.compare_price) : undefined}
                      offerText={hasDiscount ? `${discountPercent}% Off` : 'Best Price'}
                      onViewDetails={() => handleProductClick(p)}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
        onOrderNow={handleOrderProduct}
        onCheckoutCart={() => {
          setIsCheckoutCartOpen(true);
        }}
        isAddingToCart={isAddingToCart}
        isOrdering={false}
      />

      {/* Checkout Modal (Single Product) */}
      <CheckoutModal
        product={selectedProduct}
        quantity={checkoutQuantity}
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setSelectedProduct(null);
        }}
        onConfirmOrder={handleConfirmOrder}
        isSubmitting={orderingProductId !== null}
      />

      {/* Checkout Cart Modal */}
      <CheckoutCartModal
        isOpen={isCheckoutCartOpen}
        onClose={() => setIsCheckoutCartOpen(false)}
        onSuccess={() => {
          setIsCheckoutCartOpen(false);
          router.push(`/client/${company.slug}/payments`);
        }}
      />
    </div>
  );
}




