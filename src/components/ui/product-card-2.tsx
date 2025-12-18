import * as React from "react";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Interface for the component's props for type-safety and clarity
export interface ProductCardProps extends Omit<React.ComponentPropsWithoutRef<typeof motion.div>, "children"> {
  imageUrl: string;
  name: string;
  tagline: string;
  price: number;
  currency?: string;
  isCouponPrice?: boolean;
  originalPrice?: number;
  offerText: string;
  onOrder?: () => void;
  onViewDetails?: () => void;
  isLoading?: boolean;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  (
    {
      className,
      imageUrl,
      name,
      tagline,
      price,
      currency = "$",
      isCouponPrice = false,
      originalPrice,
      offerText,
      onOrder,
      onViewDetails,
      isLoading = false,
      ...props
    },
    ref
  ) => {
    // Price formatter for consistent currency display
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      })
        .format(amount)
        .replace("$", `${currency}`);
    };

    const handleCardClick = () => {
      if (onViewDetails) {
        onViewDetails();
      }
    };

    return (
      <motion.div
        ref={ref}
        onClick={handleCardClick}
        className={cn(
          "group relative flex h-full w-full flex-col items-center justify-start overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center text-gray-900 dark:text-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:border-[#06b6d4] cursor-pointer",
          className
        )}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {/* Product Image */}
        <div className="relative mb-4 flex h-40 w-full items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
            }}
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-grow flex-col items-center gap-2 w-full">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">{name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 w-full">{tagline}</p>
        </div>

        {/* Pricing and Offers */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{formatPrice(price)}</span>
            {isCouponPrice && (
              <span className="text-xs font-medium text-primary">
                Coupon Price
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs text-gray-700 dark:text-gray-300">
            {originalPrice && (
              <span className="text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="font-semibold text-yellow-600 dark:text-yellow-500">
              {offerText}
            </span>
          </div>
        </div>

        {/* Order Button */}
        {onOrder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOrder();
            }}
            disabled={isLoading}
            className="mt-4 w-full rounded-lg bg-[#06b6d4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#06b6d4]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Adding..." : "Order Now"}
          </button>
        )}
      </motion.div>
    );
  }
);

ProductCard.displayName = "ProductCard";

export { ProductCard };





