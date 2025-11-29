import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  images: string[];
  category: string | null;
}

interface ProductCardProps {
  product: Product;
  companySlug: string;
  showPrice?: boolean;
  themeColor?: string;
}

export default function ProductCard({ 
  product, 
  companySlug, 
  showPrice = true,
  themeColor = '#3B82F6' 
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  return (
    <Link
      href={`/site/${companySlug}/products/${product.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <span 
            className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold text-white rounded-full"
            style={{ backgroundColor: themeColor }}
          >
            -{discountPercentage}%
          </span>
        )}

        {/* Category Badge */}
        {product.category && (
          <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 rounded-full">
            {product.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 mb-2">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {product.description}
          </p>
        )}

        {showPrice && (
          <div className="flex items-center gap-2 mt-auto">
            <span 
              className="text-lg font-bold"
              style={{ color: themeColor }}
            >
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_price!)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div 
        className="px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <span 
          className="block w-full py-2 text-center text-sm font-medium text-white rounded-lg transition-colors"
          style={{ backgroundColor: themeColor }}
        >
          View Details
        </span>
      </div>
    </Link>
  );
}




