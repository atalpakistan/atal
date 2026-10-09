import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariation, StoreSettings } from '../types';
import { getStoreSettings, getLocalStoreSettings } from '../services/storeService';

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    variation?: ProductVariation,
    quantity?: number,
    colorOption?: ProductVariation,
    sizeOption?: ProductVariation
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  changeVariation: (cartItemId: string, newVariation: ProductVariation, product: Product) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode: string;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  promoCodesEnabled: boolean;
}

const CART_STORAGE_KEY = 'novastore_cart_v1';
const COUPON_STORAGE_KEY = 'novastore_coupon_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    try {
      return localStorage.getItem(COUPON_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const [discountPercent, setDiscountPercent] = useState<number>(() => {
    const code = (localStorage.getItem(COUPON_STORAGE_KEY) || '').toUpperCase();
    return code === 'ATAL8' ? 8 : code === 'WELCOME12' ? 12 : 0;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => getLocalStoreSettings());
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync settings
  useEffect(() => {
    getStoreSettings().then(res => {
      if (res) setStoreSettings(res);
    });
  }, []);

  const promoCodesEnabled = storeSettings.promoCodesEnabled !== false;

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (couponCode && promoCodesEnabled) {
        localStorage.setItem(COUPON_STORAGE_KEY, couponCode);
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }, [couponCode, promoCodesEnabled]);

  const addToCart = (
    product: Product,
    variation?: ProductVariation,
    quantity: number = 1,
    colorOption?: ProductVariation,
    sizeOption?: ProductVariation
  ) => {
    // Resolve color and size options
    const activeColor = colorOption || (variation?.type === 'color' ? variation : undefined);
    const activeSize = sizeOption || (variation?.type === 'size' ? variation : undefined);
    const genericVar = (!activeColor && !activeSize) ? variation : undefined;

    const colorKey = activeColor ? `col_${activeColor.id}` : 'c0';
    const sizeKey = activeSize ? `sz_${activeSize.id}` : 's0';
    const genKey = genericVar ? `var_${genericVar.id}` : 'base';
    const cartItemId = `${product.id}_${colorKey}_${sizeKey}_${genKey}`;

    // Price calculation
    let effectivePrice = product.price;
    if (activeSize?.price !== undefined) {
      effectivePrice = activeSize.price;
    } else if (activeColor?.price !== undefined) {
      effectivePrice = activeColor.price;
    } else if (genericVar?.price !== undefined) {
      effectivePrice = genericVar.price;
    }

    // Stock calculation
    let effectiveStock = product.stock;
    if (activeColor?.stock !== undefined && activeSize?.stock !== undefined) {
      effectiveStock = Math.min(activeColor.stock, activeSize.stock);
    } else if (activeColor?.stock !== undefined) {
      effectiveStock = activeColor.stock;
    } else if (activeSize?.stock !== undefined) {
      effectiveStock = activeSize.stock;
    } else if (genericVar?.stock !== undefined) {
      effectiveStock = genericVar.stock;
    }

    // Thumbnail calculation
    const effectiveThumb =
      activeColor?.images?.[0] ||
      genericVar?.images?.[0] ||
      product.thumbnail ||
      product.images?.[0];

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, effectiveStock);
        return prev.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: newQty }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          brand: product.brand,
          price: effectivePrice,
          compareAtPrice: product.compareAtPrice,
          thumbnail: effectiveThumb,
          quantity: Math.min(quantity, effectiveStock),
          maxStock: effectiveStock,
          selectedColor: activeColor ? {
            id: activeColor.id,
            name: activeColor.name,
            value: activeColor.value,
            image: activeColor.images?.[0]
          } : undefined,
          selectedSize: activeSize ? {
            id: activeSize.id,
            name: activeSize.name,
            value: activeSize.value
          } : undefined,
          selectedVariation: genericVar ? {
            id: genericVar.id,
            type: genericVar.type,
            name: genericVar.name,
            value: genericVar.value,
            sku: genericVar.sku
          } : (activeColor ? {
            id: activeColor.id,
            type: activeColor.type,
            name: activeColor.name,
            value: activeColor.value,
            sku: activeColor.sku
          } : undefined)
        };
        return [...prev, newItem];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        return {
          ...item,
          quantity: Math.min(quantity, item.maxStock || 99)
        };
      }
      return item;
    }));
  };

  const changeVariation = (cartItemId: string, newVariation: ProductVariation, product: Product) => {
    const oldItem = cart.find(i => i.id === cartItemId);
    if (!oldItem) return;

    const newCartItemId = `${product.id}_${newVariation.id}`;
    const effectivePrice = newVariation.price !== undefined ? newVariation.price : product.price;
    const effectiveStock = newVariation.stock !== undefined ? newVariation.stock : product.stock;
    const effectiveThumb = newVariation.images?.[0] || product.thumbnail || product.images?.[0];

    setCart(prev => {
      const filtered = prev.filter(i => i.id !== cartItemId);
      const existingMatch = filtered.find(i => i.id === newCartItemId);
      if (existingMatch) {
        return filtered.map(i => {
          if (i.id === newCartItemId) {
            return {
              ...i,
              quantity: Math.min(i.quantity + oldItem.quantity, effectiveStock)
            };
          }
          return i;
        });
      }
      return [
        ...filtered,
        {
          id: newCartItemId,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          brand: product.brand,
          price: effectivePrice,
          compareAtPrice: product.compareAtPrice,
          thumbnail: effectiveThumb,
          quantity: Math.min(oldItem.quantity, effectiveStock),
          maxStock: effectiveStock,
          selectedVariation: {
            id: newVariation.id,
            type: newVariation.type,
            name: newVariation.name,
            value: newVariation.value,
            sku: newVariation.sku
          }
        }
      ];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyCoupon = (code: string) => {
    if (!promoCodesEnabled) {
      return { success: false, message: 'Promotional discount codes are currently disabled by store administration.' };
    }

    const clean = code.trim().toUpperCase();
    if (clean === 'ATAL8') {
      setCouponCode('ATAL8');
      setDiscountPercent(8);
      return { success: true, message: 'Promo Code ATAL8 applied! (8% OFF Entire Order)' };
    } else if (clean === 'WELCOME12') {
      setCouponCode('WELCOME12');
      setDiscountPercent(12);
      return { success: true, message: 'Welcome Voucher WELCOME12 applied! (12% OFF Entire Order)' };
    }
    return { success: false, message: 'Invalid or expired promotional code. Try ATAL8 or WELCOME12' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
  };

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const effectiveDiscountPercent = promoCodesEnabled ? discountPercent : 0;
  const discount = Math.round((subtotal * effectiveDiscountPercent) / 100);
  
  // Free delivery threshold (defaults to PKR 6,000)
  const shippingThreshold = storeSettings.freeShippingThreshold || 6000;
  const standardShipping = storeSettings.shippingFee || 290;
  const shipping = subtotal >= shippingThreshold || subtotal === 0 ? 0 : standardShipping;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        changeVariation,
        clearCart,
        itemCount,
        subtotal,
        shipping,
        discount,
        couponCode: promoCodesEnabled ? couponCode : '',
        applyCoupon,
        removeCoupon,
        total,
        isCartOpen,
        setIsCartOpen,
        promoCodesEnabled
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
