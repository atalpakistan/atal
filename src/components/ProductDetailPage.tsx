import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  Share2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Product, ProductVariation } from '../types';
import { useCart } from '../context/CartContext';
import { ProductCard } from './ProductCard';
import { formatPrice } from '../utils/format';

interface ProductDetailPageProps {
  product: Product;
  relatedProducts: Product[];
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  relatedProducts,
  onBack,
  onSelectProduct
}) => {
  const { addToCart, setIsCartOpen } = useCart();

  // Color variations list
  const colorVariations = (product.variations || []).filter(v => v.type === 'color');
  // Size / Edition variations list
  const sizeVariations = (product.variations || []).filter(v => v.type === 'size' || v.type === 'material' || v.type === 'edition');
  // Generic variations
  const genericVariations = (product.variations || []).filter(v => v.type !== 'color' && v.type !== 'size' && v.type !== 'material' && v.type !== 'edition');

  // Active color variation
  const [selectedColor, setSelectedColor] = useState<ProductVariation | undefined>(
    colorVariations.length > 0 ? colorVariations[0] : undefined
  );

  // Active size variation
  const [selectedSize, setSelectedSize] = useState<ProductVariation | undefined>(
    sizeVariations.length > 0 ? sizeVariations[0] : undefined
  );

  // Active generic variation
  const [selectedGeneric, setSelectedGeneric] = useState<ProductVariation | undefined>(
    genericVariations.length > 0 ? genericVariations[0] : undefined
  );

  // Combine product images ensuring all minimum 3 pictures are accessible
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (selectedColor?.images && selectedColor.images.length > 0) {
      list.push(...selectedColor.images);
    }
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (!list.includes(img)) list.push(img);
      });
    }
    if (product.thumbnail && !list.includes(product.thumbnail)) {
      list.push(product.thumbnail);
    }
    return list.length > 0 ? list : [product.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'];
  }, [product, selectedColor]);

  // Active gallery image
  const [selectedImage, setSelectedImage] = useState<string>(allImages[0] || product.thumbnail);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Whenever selectedColor changes, switch to color image
  useEffect(() => {
    if (selectedColor?.images && selectedColor.images.length > 0) {
      setSelectedImage(selectedColor.images[0]);
      setActiveImageIndex(0);
    } else if (allImages.length > 0) {
      setSelectedImage(allImages[0]);
      setActiveImageIndex(0);
    }
  }, [selectedColor, allImages]);

  // Effective price based on variations
  const currentPrice = selectedSize?.price !== undefined
    ? selectedSize.price
    : (selectedColor?.price !== undefined
      ? selectedColor.price
      : (selectedGeneric?.price !== undefined ? selectedGeneric.price : product.price));

  // Effective stock
  const currentStock = (() => {
    let stock = product.stock;
    if (selectedColor?.stock !== undefined && selectedSize?.stock !== undefined) {
      stock = Math.min(selectedColor.stock, selectedSize.stock);
    } else if (selectedColor?.stock !== undefined) {
      stock = selectedColor.stock;
    } else if (selectedSize?.stock !== undefined) {
      stock = selectedSize.stock;
    } else if (selectedGeneric?.stock !== undefined) {
      stock = selectedGeneric.stock;
    }
    return stock;
  })();

  const currentSku = selectedSize?.sku || selectedColor?.sku || selectedGeneric?.sku || product.sku;

  const discountPercentage = product.compareAtPrice && product.compareAtPrice > currentPrice
    ? Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)
    : 0;

  const handleNextImage = () => {
    const nextIdx = (activeImageIndex + 1) % allImages.length;
    setActiveImageIndex(nextIdx);
    setSelectedImage(allImages[nextIdx]);
  };

  const handlePrevImage = () => {
    const prevIdx = (activeImageIndex - 1 + allImages.length) % allImages.length;
    setActiveImageIndex(prevIdx);
    setSelectedImage(allImages[prevIdx]);
  };

  const handleSelectImageIndex = (idx: number) => {
    setActiveImageIndex(idx);
    setSelectedImage(allImages[idx]);
  };

  const handleColorSelect = (variation: ProductVariation) => {
    setSelectedColor(variation);
    setQuantity(1);
    if (variation.images && variation.images.length > 0) {
      setSelectedImage(variation.images[0]);
      setActiveImageIndex(0);
    }
  };

  const handleSizeSelect = (variation: ProductVariation) => {
    setSelectedSize(variation);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (currentStock <= 0) return;
    addToCart(product, selectedGeneric, quantity, selectedColor, selectedSize);

    const variationDetails: string[] = [];
    if (selectedColor) variationDetails.push(`Color: ${selectedColor.name}`);
    if (selectedSize) variationDetails.push(`Size: ${selectedSize.name}`);
    const detailStr = variationDetails.length > 0 ? ` (${variationDetails.join(', ')})` : '';

    setNotification(`Added ${quantity} × ${product.name}${detailStr} to your bag`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBuyNow = () => {
    if (currentStock <= 0) return;
    addToCart(product, selectedGeneric, quantity, selectedColor, selectedSize);
    setIsCartOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setNotification('Link copied to clipboard!');
      setTimeout(() => setNotification(null), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 bg-stone-950 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Breadcrumbs & Back */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200 mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-stone-700 hover:text-black hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalog</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          <span>{product.categoryName || 'Products'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          <span className="text-stone-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-black py-1.5 px-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Main Product Showcase: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Interactive Image Gallery with Minimum 3 Pictures Display */}
        <div className="space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square w-full rounded-3xl bg-stone-100 overflow-hidden border border-stone-200/80 shadow-sm group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-102"
            />
            {discountPercentage > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-md">
                Save {discountPercentage}%
              </span>
            )}

            {/* Photo Counter */}
            <span className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold bg-stone-900/75 backdrop-blur-md text-white border border-white/20 shadow-md">
              Photo {activeImageIndex + 1} of {allImages.length}
            </span>

            {/* Prev / Next navigation arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail list (Minimum 3 pictures showcase) */}
          {allImages.length > 1 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-500 px-1">
                <span>Product Views ({allImages.length} Photos)</span>
                <span>Click to preview</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectImageIndex(idx)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-stone-950 scale-105 shadow-sm ring-2 ring-stone-950/20'
                        : 'border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 py-0.2 bg-stone-900/80 text-white rounded">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Buy Box & Specs */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header: Brand & Reviews */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                <span>{product.brand}</span>
                <span className="text-stone-600">SKU: {currentSku}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold font-serif-display text-stone-950 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-current'
                          : i < product.rating
                          ? 'fill-current opacity-60'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs font-bold text-stone-900">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-stone-600">
                  • {product.reviewCount} customer reviews
                </span>
                <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Buyer Favorite
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pb-6 border-b border-stone-200">
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-950">
                {formatPrice(currentPrice)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                <span className="text-lg text-stone-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              <span className="text-xs font-medium text-stone-600">
                (Tax included, delivery fee PKR 290)
              </span>
            </div>

            {/* 1. DISTINCT COLOR VARIATION SELECTOR */}
            {colorVariations.length > 0 && (
              <div className="space-y-3 pb-6 border-b border-stone-200">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="uppercase tracking-wider text-stone-700 flex items-center gap-2">
                    <span>1. Select Color:</span>
                    <strong className="text-stone-950 text-sm">{selectedColor?.name || 'Standard'}</strong>
                  </span>
                  <span className="text-stone-600 font-medium">
                    {selectedColor?.stock && selectedColor.stock > 0
                      ? `${selectedColor.stock} available in this color`
                      : 'Backorder color'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {colorVariations.map((variation) => {
                    const isSelected = selectedColor?.id === variation.id;
                    return (
                      <button
                        key={variation.id}
                        onClick={() => handleColorSelect(variation)}
                        className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'border-stone-950 bg-stone-50 ring-2 ring-stone-950 text-stone-950 shadow-sm'
                            : 'border-stone-200 hover:border-stone-400 text-stone-700 bg-white'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-stone-300 shadow-xs"
                          style={{ backgroundColor: variation.value }}
                        />
                        <span>{variation.name}</span>
                        {variation.price && variation.price !== product.price && (
                          <span className="text-[10px] text-stone-600">({formatPrice(variation.price)})</span>
                        )}
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-stone-950 ml-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. DISTINCT SIZE & EDITION VARIATION SELECTOR */}
            {sizeVariations.length > 0 && (
              <div className="space-y-3 pb-6 border-b border-stone-200">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="uppercase tracking-wider text-stone-700 flex items-center gap-2">
                    <span>2. Select Size / Edition:</span>
                    <strong className="text-stone-950 text-sm">{selectedSize?.name || 'Standard'}</strong>
                  </span>
                  <span className="text-stone-600 font-medium">
                    {selectedSize?.stock && selectedSize.stock > 0
                      ? `${selectedSize.stock} units available`
                      : 'Out of stock in size'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {sizeVariations.map((variation) => {
                    const isSelected = selectedSize?.id === variation.id;
                    return (
                      <button
                        key={variation.id}
                        onClick={() => handleSizeSelect(variation)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-stone-950 bg-stone-950 text-white shadow-sm'
                            : 'border-stone-200 hover:border-stone-400 text-stone-800 bg-white'
                        }`}
                      >
                        <span>{variation.name}</span>
                        {variation.price && variation.price !== product.price && (
                          <span className={`text-[10px] ${isSelected ? 'text-amber-300' : 'text-stone-500'}`}>
                            ({formatPrice(variation.price)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. DISTINCT QUANTITY SELECTION & LIVE STOCK */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  3. Select Quantity:
                </span>
                <span className="text-xs font-medium text-stone-500">
                  Max: {currentStock} units
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1 shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 font-bold text-base cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-base font-extrabold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 font-bold text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs">
                  {currentStock > 5 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> In Stock ({currentStock} available)
                    </span>
                  ) : currentStock > 0 ? (
                    <span className="text-amber-700 font-bold">
                      Limited stock: only {currentStock} left!
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold">Currently Sold Out</span>
                  )}
                  <span className="text-stone-600 block mt-0.5">Dispatched within 24-48 business hours</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className="py-4 px-6 rounded-xl bg-stone-950 text-white font-bold text-sm hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Bag</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={currentStock <= 0}
                  className="py-4 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm disabled:bg-stone-200 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Instant Checkout</span>
                </button>
              </div>

              {/* Wishlist toggle */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="w-full py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-2 transition"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Description */}
            <div className="pt-6 border-t border-stone-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Product Details
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications Table */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="pt-6 border-t border-stone-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
                  Technical Specifications
                </h3>
                <dl className="grid grid-cols-1 gap-2 text-xs">
                  {product.specifications.map((spec, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-2 px-3 rounded-lg bg-stone-50 border border-stone-100"
                    >
                      <dt className="text-stone-600 font-medium">{spec.name}</dt>
                      <dd className="text-stone-900 font-semibold">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Shipping & Delivery Perks */}
            <div className="pt-6 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-stone-800" />
                <span>Nationwide Shipping (PKR 290)</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-stone-800" />
                <span>Cash on Delivery Available</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-800" />
                <span>100% Genuine Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-24 pt-16 border-t border-stone-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-amber-600">
                Curated Suggestions
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-950 mt-1">
                You May Also Admire
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {relatedProducts.slice(0, 12).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
