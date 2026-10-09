export interface ProductVariation {
  id: string;
  type: 'color' | 'size' | 'material' | 'edition';
  name: string;
  value: string;
  price?: number;
  stock?: number;
  sku?: string;
  images?: string[];
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  categoryName?: string;
  subcategoryId?: string;
  description: string;
  features?: string[];
  specs?: Record<string, string>;
  specifications?: Array<{ name: string; value: string }>;
  stock: number;
  sku: string;
  thumbnail: string;
  images: string[];
  variations?: ProductVariation[];
  reviews?: ProductReview[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  active: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  active: boolean;
  subcategories?: string[];
  createdAt: number;
}

export interface CartItem {
  id: string; // composite key: `${productId}_${colorId || 'base'}_${sizeId || 'base'}`
  productId: string;
  productName: string;
  productSlug: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  thumbnail: string;
  quantity: number;
  maxStock: number;
  selectedColor?: {
    id: string;
    name: string;
    value: string;
    image?: string;
  };
  selectedSize?: {
    id: string;
    name: string;
    value?: string;
  };
  selectedVariation?: {
    id: string;
    type: string;
    name: string;
    value: string;
    sku?: string;
  };
}

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  price: number;
  quantity: number;
  thumbnail: string;
  color?: string;
  size?: string;
  variation?: {
    type: string;
    name: string;
    value: string;
  };
}

export interface CustomerShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export type PaymentMethod = 'Cash on Delivery' | 'Jazzcash 03227796097' | 'Easypaisa 03227796097' | string;

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: CustomerShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  advancePaidAmount?: number;
  remainingDueAtDoorstep?: number;
  paymentMethod: PaymentMethod | string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  transactionId?: string;
  advanceTransactionId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoreSettings {
  requireCodAdvanceShipping: boolean; // Toggle for advance shipping in COD
  shippingFee: number;
  freeShippingThreshold: number;
  promoCodesEnabled: boolean; // Admin ON/OFF switch for Promo/Coupon codes
  // Official Merchant Account Configs (Admin configurable)
  jazzcashNumber: string;
  jazzcashTitle: string;
  easypaisaNumber: string;
  easypaisaTitle: string;
  contactEmail: string;
  contactPhone: string;
  customAdminPassword?: string; // Secondary changeable password
  secondaryAdminPassword?: string; // Secondary changeable password (default: Abu6232)
  updatedAt?: number;
}

export interface CarouselSlide {
  id: string;
  productId?: string; // Linked store product
  badge?: string;
  badgeColor?: string;
  title: string;
  subtitle?: string;
  description: string;
  priceTag?: string;
  originalPrice?: number;
  discountPrice?: number;
  discountTag?: string;
  buttonText: string;
  buttonLink?: string;
  image: string;
  bgGradient?: string;
  active: boolean;
  order: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface SpotlightBanner {
  id: string;
  badge: string;
  badgeColor?: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice: number;
  discountTag: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  image: string;
  active: boolean;
  updatedAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  phone?: string;
  displayName?: string;
  role: 'admin' | 'staff' | 'customer';
  createdAt: number;
}
