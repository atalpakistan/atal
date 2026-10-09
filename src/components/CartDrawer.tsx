import React, { useState } from 'react';
import {
  X,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

interface CartDrawerProps {
  onCheckout: () => void;
  onNavigateToShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onCheckout,
  onNavigateToShop
}) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    shipping,
    discount,
    total,
    couponCode,
    applyCoupon,
    removeCoupon,
    isCartOpen,
    setIsCartOpen,
    promoCodesEnabled
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    setCouponFeedback(res);
    if (res.success) {
      setInputCoupon('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header with Back Button */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition cursor-pointer"
                title="Back to store"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className="flex items-center gap-1.5 ml-2">
                <ShoppingBag className="w-4 h-4 text-stone-900" />
                <h2 className="text-base font-bold font-serif-display text-stone-950">
                  Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)})
                </h2>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shipping Progress bar */}
          <div className="bg-stone-50 px-6 py-3 border-b border-stone-200">
            {subtotal >= 6000 ? (
              <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>You qualify for Free Nationwide Shipping!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="text-xs text-stone-600 flex justify-between font-medium">
                  <span>Add <strong>{formatPrice(6000 - subtotal)}</strong> more for Free Shipping</span>
                  <span>{formatPrice(subtotal)} / {formatPrice(6000)}</span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-950 transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / 6000) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-stone-900">Your bag is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mt-1 mb-6">
                  Explore our curated collections and add your favorite luxury pieces.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateToShop();
                  }}
                  className="px-6 py-3 bg-stone-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition cursor-pointer"
                >
                  Browse Store Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-2xl bg-stone-50 border border-stone-200/80 items-center"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.productName}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-stone-900 truncate">
                      {item.productName}
                    </h4>
                    
                    {/* Variation badges */}
                    <div className="flex flex-wrap items-center gap-1.5 my-1">
                      {item.selectedColor && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[10px] font-semibold text-stone-700">
                          <span
                            className="w-2 h-2 rounded-full border border-stone-300"
                            style={{ backgroundColor: item.selectedColor.value }}
                          />
                          <span>{item.selectedColor.name}</span>
                        </span>
                      )}
                      {item.selectedSize && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[10px] font-semibold text-stone-700">
                          Size: {item.selectedSize.name}
                        </span>
                      )}
                      {!item.selectedColor && !item.selectedSize && item.selectedVariation && (
                        <span className="text-[11px] text-stone-500 block">
                          {item.selectedVariation.name}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-extrabold text-stone-900 block mt-0.5">
                      {formatPrice(item.price)}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-stone-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-stone-600 hover:text-black font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-stone-600 hover:text-black font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-600 transition p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50/70 space-y-4">
              {/* Coupon Form (Controlled by Admin Promo Codes ON/OFF setting) */}
              {promoCodesEnabled && (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={inputCoupon}
                        onChange={(e) => setInputCoupon(e.target.value)}
                        placeholder="Promo Code (e.g. ATAL8)"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  {couponCode && (
                    <div className="flex items-center justify-between text-xs text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <span>Applied: <strong>{couponCode}</strong></span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-stone-500 hover:text-red-600 underline text-[11px] cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {couponFeedback && !couponFeedback.success && (
                    <div className="text-xs text-red-600 font-medium">
                      {couponFeedback.message}
                    </div>
                  )}
                </form>
              )}

              {/* Order breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nationwide Shipping</span>
                  <span className="font-semibold text-stone-900">
                    {shipping === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatPrice(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-stone-950 border-t border-stone-200 pt-2">
                  <span>Estimated Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3.5 bg-stone-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secure Checkout • Cash on Delivery &amp; Mobile Banking</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
