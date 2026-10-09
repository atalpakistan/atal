import React, { useState } from 'react';
import { Star, ShoppingBag, Heart, Check } from 'lucide-react';
import { Product, ProductVariation } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, compact = false }) => {
  const { addToCart } = useCart();
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(
    product.variations && product.variations.length > 0 ? product.variations[0] : undefined
  );
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // Dynamic image based on active variation
  const currentImage = selectedVariation?.images?.[0] || product.thumbnail || product.images?.[0];
  const currentPrice = selectedVariation?.price !== undefined ? selectedVariation.price : product.price;
  const currentStock = selectedVariation?.stock !== undefined ? selectedVariation.stock : product.stock;

  const discountPercentage = product.compareAtPrice && product.compareAtPrice > currentPrice
    ? Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStock <= 0) return;
    addToCart(product, selectedVariation, 1);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1800);
  };

  const handleColorChange = (e: React.MouseEvent, variation: ProductVariation) => {
    e.stopPropagation();
    setSelectedVariation(variation);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-lg hover:border-stone-300 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-10">
          {product.newArrival && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white shadow-xs">
              New
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white shadow-xs">
              -{discountPercentage}%
            </span>
          )}
          {product.bestSeller && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-xs">
              Hot
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition shadow-xs z-10 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/85 text-stone-600 hover:text-stone-950 hover:bg-white border border-stone-200/60'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Overlay on hover (or touch button) */}
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-2.5 sm:bottom-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleQuickAdd}
            disabled={currentStock <= 0}
            className={`w-full py-1.5 sm:py-2 px-2.5 rounded-lg sm:rounded-xl font-medium text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-md transition duration-200 ${
              currentStock <= 0
                ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
                : addedNotice
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-950 text-white hover:bg-stone-800'
            }`}
          >
            {addedNotice ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Added</span>
              </>
            ) : currentStock <= 0 ? (
              <span>Sold Out</span>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-0.5">
            <span className="truncate">{product.brand}</span>
            <div className="flex items-center gap-0.5 text-amber-600 flex-shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-emerald-700 transition">
            {product.name}
          </h3>

          {/* Color variation swatches */}
          {product.variations && product.variations.some(v => v.type === 'color') && (
            <div className="mt-1.5 flex items-center gap-1">
              {product.variations
                .filter(v => v.type === 'color')
                .slice(0, 4)
                .map((variation) => {
                  const isActive = selectedVariation?.id === variation.id;
                  return (
                    <button
                      key={variation.id}
                      onClick={(e) => handleColorChange(e, variation)}
                      title={`${variation.name} (${(variation.stock ?? 0) > 0 ? 'In Stock' : 'Out of stock'})`}
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition-all ${
                        isActive
                          ? 'ring-1.5 ring-stone-950 ring-offset-0.5 scale-110'
                          : 'border-stone-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: variation.value }}
                    />
                  );
                })}
            </div>
          )}
        </div>

        {/* Price & Stock info */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-extrabold text-stone-900">
              {formatPrice(currentPrice)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <span className="text-[10px] text-stone-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="text-[9px] sm:text-[10px] font-medium flex-shrink-0">
            {currentStock > 5 ? (
              <span className="text-emerald-700">In Stock</span>
            ) : currentStock > 0 ? (
              <span className="text-amber-700 font-semibold">{currentStock} left</span>
            ) : (
              <span className="text-red-700 font-semibold">Out</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
