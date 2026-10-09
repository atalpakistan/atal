import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { Category, Product, Order, OrderStatus, PaymentStatus, StoreSettings, CarouselSlide, SpotlightBanner } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_CAROUSEL_SLIDES } from './seedData';

const PRODUCTS_COL = 'products';
const CATEGORIES_COL = 'categories';
const ORDERS_COL = 'orders';
const SETTINGS_COL = 'settings';
const CAROUSEL_COL = 'carousel_slides';
const SPOTLIGHT_DOC = 'spotlight_banner';
const GENERAL_SETTINGS_DOC = 'general';

const LOCAL_PRODUCTS_KEY = 'atal_store_products_cache_v4';
const LOCAL_CATEGORIES_KEY = 'atal_store_categories_cache_v4';
const LOCAL_ORDERS_KEY = 'atal_store_orders_backup_v4';
const LOCAL_SETTINGS_KEY = 'atal_store_settings_cache_v4';
const LOCAL_CAROUSEL_KEY = 'atal_store_carousel_cache_v4';
const LOCAL_SPOTLIGHT_KEY = 'atal_store_spotlight_cache_v4';

export const DEFAULT_SPOTLIGHT_BANNER: SpotlightBanner = {
  id: 'spotlight_main',
  badge: 'Spotlight Hardware',
  badgeColor: 'text-amber-400',
  title: 'Acoustic Precision.\nPure Silence.',
  description: 'Experience the Acoustic Studio Wireless ANC headphones. Engineered with titanium composite dynamic drivers, quad-mic adaptive cancellation, and 48 hours battery life.',
  price: 14500,
  compareAtPrice: 18500,
  discountTag: 'Save PKR 4,000',
  primaryButtonText: 'Shop Audio',
  primaryButtonLink: 'cat-electronics',
  secondaryButtonText: 'View Catalog',
  secondaryButtonLink: 'shop',
  image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85',
  active: true,
  updatedAt: Date.now()
};

// Master fixed primary administrator password (permanent for all time)
export const PRIMARY_ADMIN_PASSWORD = 'Umer@9157';
// Default secondary admin password (changeable; when changed, previous secondary password is no longer valid)
export const DEFAULT_SECONDARY_ADMIN_PASSWORD = 'Abu6232';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  requireCodAdvanceShipping: true,
  shippingFee: 290,
  freeShippingThreshold: 6000, // Updated to 6,000 PKR
  promoCodesEnabled: true, // Default ON
  jazzcashNumber: '03227796097',
  jazzcashTitle: 'Omar Farooq',
  easypaisaNumber: '03227796097',
  easypaisaTitle: 'Omar Farooq',
  contactEmail: 'contact.to.atal@gmail.com',
  contactPhone: '03719150297',
  customAdminPassword: 'Abu6232',
  secondaryAdminPassword: 'Abu6232',
  updatedAt: Date.now()
};

// Local storage caching helpers
function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [...INITIAL_PRODUCTS];
  } catch {
    return [...INITIAL_PRODUCTS];
  }
}

function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Failed to cache products locally', e);
  }
}

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [...INITIAL_CATEGORIES];
  } catch {
    return [...INITIAL_CATEGORIES];
  }
}

function saveLocalCategories(categories: Category[]): void {
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.warn('Failed to cache categories locally', e);
  }
}

function getLocalStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // Ignore
  }
}

export function getLocalStoreSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    return raw ? { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) } : DEFAULT_STORE_SETTINGS;
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

export function saveLocalStoreSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

// Seeding helper to ensure the store works immediately out-of-the-box
export async function seedDatabaseIfEmpty(): Promise<void> {
  try {
    const productsSnap = await getDocs(query(collection(db, PRODUCTS_COL), limit(1)));
    if (productsSnap.empty) {
      console.log('Seeding initial categories, products, carousel slides, and spotlight banner into Firestore...');
      const batch = writeBatch(db);

      // Seed categories
      for (const cat of INITIAL_CATEGORIES) {
        const catRef = doc(db, CATEGORIES_COL, cat.id);
        batch.set(catRef, cat);
      }

      // Seed products
      for (const prod of INITIAL_PRODUCTS) {
        const prodRef = doc(db, PRODUCTS_COL, prod.id);
        batch.set(prodRef, prod);
      }

      // Seed settings
      const settingsRef = doc(db, SETTINGS_COL, GENERAL_SETTINGS_DOC);
      batch.set(settingsRef, DEFAULT_STORE_SETTINGS);

      // Seed Carousel Slides
      for (const slide of INITIAL_CAROUSEL_SLIDES) {
        const slideRef = doc(db, CAROUSEL_COL, slide.id);
        batch.set(slideRef, slide);
      }

      // Seed Spotlight Hardware Banner
      const spotlightRef = doc(db, SETTINGS_COL, SPOTLIGHT_DOC);
      batch.set(spotlightRef, DEFAULT_SPOTLIGHT_BANNER);

      await batch.commit();
      saveLocalProducts(INITIAL_PRODUCTS);
      saveLocalCategories(INITIAL_CATEGORIES);
      saveLocalStoreSettings(DEFAULT_STORE_SETTINGS);
      saveLocalCarouselSlides(INITIAL_CAROUSEL_SLIDES);
      saveLocalSpotlightBanner(DEFAULT_SPOTLIGHT_BANNER);
      console.log('Initial data seeded successfully.');
    } else {
      // Ensure carousel slides collection has initial data if empty
      const carouselSnap = await getDocs(query(collection(db, CAROUSEL_COL), limit(1)));
      if (carouselSnap.empty) {
        const batch = writeBatch(db);
        for (const slide of INITIAL_CAROUSEL_SLIDES) {
          const slideRef = doc(db, CAROUSEL_COL, slide.id);
          batch.set(slideRef, slide);
        }
        await batch.commit();
        saveLocalCarouselSlides(INITIAL_CAROUSEL_SLIDES);
      }

      // Ensure spotlight doc exists
      const spotlightRef = doc(db, SETTINGS_COL, SPOTLIGHT_DOC);
      const spotSnap = await getDoc(spotlightRef);
      if (!spotSnap.exists()) {
        await setDoc(spotlightRef, DEFAULT_SPOTLIGHT_BANNER);
        saveLocalSpotlightBanner(DEFAULT_SPOTLIGHT_BANNER);
      }
    }
  } catch (error) {
    console.warn('Firestore seeding check fallback (using local catalog):', error);
  }
}

// Store Settings Services (Admin password, merchant accounts & COD toggle)
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, SETTINGS_COL, GENERAL_SETTINGS_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as StoreSettings;
      const combined = { ...DEFAULT_STORE_SETTINGS, ...data };
      saveLocalStoreSettings(combined);
      return combined;
    }
    return getLocalStoreSettings();
  } catch (err) {
    console.warn('Store settings fetch fallback:', err);
    return getLocalStoreSettings();
  }
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = getLocalStoreSettings();
  const updated: StoreSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now()
  };

  saveLocalStoreSettings(updated);

  try {
    const docRef = doc(db, SETTINGS_COL, GENERAL_SETTINGS_DOC);
    await setDoc(docRef, updated, { merge: true });
  } catch (err) {
    console.warn('Remote settings update fallback:', err);
  }

  return updated;
}

// Product Services (Customer View - Active Only)
export async function getProducts(options?: {
  categoryId?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  searchQuery?: string;
  sortBy?: 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating';
  limitCount?: number;
}): Promise<Product[]> {
  try {
    const ref = collection(db, PRODUCTS_COL);
    const snapshot = await getDocs(ref);
    let products: Product[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));

    if (products.length === 0) {
      products = getLocalProducts();
    } else {
      saveLocalProducts(products);
    }

    // Active filtering (Only active products for customers)
    products = products.filter(p => p.active !== false);

    // Category filter
    if (options?.categoryId && options.categoryId !== 'all') {
      products = products.filter(p => p.categoryId === options.categoryId);
    }

    // Flags
    if (options?.featured) {
      products = products.filter(p => p.featured);
    }
    if (options?.bestSeller) {
      products = products.filter(p => p.bestSeller);
    }
    if (options?.newArrival) {
      products = products.filter(p => p.newArrival);
    }

    // Search query
    if (options?.searchQuery && options.searchQuery.trim()) {
      const term = options.searchQuery.toLowerCase().trim();
      products = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(term)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(term)))
      );
    }

    // Sorting
    if (options?.sortBy) {
      switch (options.sortBy) {
        case 'newest':
          products.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          break;
        case 'price-low':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          products.sort((a, b) => b.rating - a.rating);
          break;
        case 'featured':
        default:
          products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          break;
      }
    }

    if (options?.limitCount) {
      products = products.slice(0, options.limitCount);
    }

    return products;
  } catch (err) {
    console.warn('Products loaded from local fallback cache:', err);
    let list = getLocalProducts().filter(p => p.active !== false);
    if (options?.categoryId && options.categoryId !== 'all') {
      list = list.filter(p => p.categoryId === options.categoryId);
    }
    if (options?.featured) list = list.filter(p => p.featured);
    if (options?.bestSeller) list = list.filter(p => p.bestSeller);
    if (options?.newArrival) list = list.filter(p => p.newArrival);
    return list;
  }
}

// Admin Products (Shows ALL products including inactive/deactivated)
export async function getAllAdminProducts(): Promise<Product[]> {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COL));
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    if (list.length === 0) {
      return getLocalProducts();
    }
    saveLocalProducts(list);
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.warn('Admin products fallback notice:', err);
    return getLocalProducts().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COL, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Product;
    }
    const local = getLocalProducts().find(p => p.id === id || p.slug === id);
    return local || null;
  } catch {
    const local = getLocalProducts().find(p => p.id === id || p.slug === id);
    return local || null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const q = query(collection(db, PRODUCTS_COL), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0];
      return { id: docData.id, ...docData.data() } as Product;
    }
    const local = getLocalProducts().find(p => p.slug === slug || p.id === slug);
    return local || null;
  } catch {
    const local = getLocalProducts().find(p => p.slug === slug || p.id === slug);
    return local || null;
  }
}

export async function saveProduct(product: Partial<Product> & { id?: string }): Promise<string> {
  const prodId = product.id || `prod-${Date.now()}`;
  const prodRef = doc(db, PRODUCTS_COL, prodId);
  const now = Date.now();

  const finalProduct: Product = {
    id: prodId,
    name: product.name || 'Untitled Product',
    slug: product.slug || (product.name ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `product-${Date.now()}`),
    description: product.description || '',
    categoryId: product.categoryId || 'cat-fashion',
    categoryName: product.categoryName || '',
    subcategoryId: product.subcategoryId || '',
    brand: product.brand || 'ATAL',
    price: Number(product.price) || 0,
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    images: product.images && product.images.length > 0 ? product.images : [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'
    ],
    thumbnail: product.thumbnail || (product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'),
    sku: product.sku || `SKU-${Date.now().toString().slice(-6)}`,
    stock: Number(product.stock) || 0,
    rating: product.rating !== undefined ? Number(product.rating) : 5.0,
    reviewCount: product.reviewCount !== undefined ? Number(product.reviewCount) : 1,
    tags: product.tags || [],
    featured: Boolean(product.featured),
    bestSeller: Boolean(product.bestSeller),
    newArrival: Boolean(product.newArrival),
    active: product.active !== undefined ? Boolean(product.active) : true,
    variations: product.variations || [],
    specifications: product.specifications || [],
    createdAt: product.createdAt || now,
    updatedAt: now,
  };

  // 1. Immediately update local storage cache
  const localList = getLocalProducts();
  const existingIdx = localList.findIndex(p => p.id === prodId);
  if (existingIdx >= 0) {
    localList[existingIdx] = finalProduct;
  } else {
    localList.unshift(finalProduct);
  }
  saveLocalProducts(localList);

  // 2. Persist to Firestore
  try {
    await setDoc(prodRef, finalProduct, { merge: true });
  } catch (err) {
    console.warn('Remote product save warning (persisted locally):', err);
  }

  return prodId;
}

export async function toggleProductActive(id: string, active: boolean): Promise<void> {
  // Update local storage
  const localList = getLocalProducts();
  const target = localList.find(p => p.id === id);
  if (target) {
    target.active = active;
    target.updatedAt = Date.now();
    saveLocalProducts(localList);
  }

  // Update Firestore
  try {
    const prodRef = doc(db, PRODUCTS_COL, id);
    await updateDoc(prodRef, { active, updatedAt: Date.now() });
  } catch (err) {
    console.warn('Remote product status toggle warning:', err);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  // 1. Remove from local cache immediately
  const localList = getLocalProducts().filter(p => p.id !== id);
  saveLocalProducts(localList);

  // 2. Remove from Firestore
  try {
    const prodRef = doc(db, PRODUCTS_COL, id);
    await deleteDoc(prodRef);
  } catch (err) {
    console.warn('Remote product deletion warning:', err);
  }
}

// Categories (Customer View - Active Only)
export async function getCategories(): Promise<Category[]> {
  try {
    const snap = await getDocs(collection(db, CATEGORIES_COL));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
    if (list.length === 0) {
      return getLocalCategories().filter(c => c.active !== false);
    }
    saveLocalCategories(list);
    return list.filter(c => c.active !== false);
  } catch (err) {
    console.warn('Categories fetch fallback:', err);
    return getLocalCategories().filter(c => c.active !== false);
  }
}

// Admin Categories (All categories including deactivated)
export async function getAllAdminCategories(): Promise<Category[]> {
  try {
    const snap = await getDocs(collection(db, CATEGORIES_COL));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
    if (list.length === 0) {
      return getLocalCategories();
    }
    saveLocalCategories(list);
    return list;
  } catch {
    return getLocalCategories();
  }
}

export async function saveCategory(category: Partial<Category> & { id?: string }): Promise<string> {
  const catId = category.id || `cat-${Date.now()}`;
  const catRef = doc(db, CATEGORIES_COL, catId);
  const now = Date.now();

  const finalCat: Category = {
    id: catId,
    name: category.name || 'New Category',
    slug: category.slug || (category.name ? category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `cat-${Date.now()}`),
    description: category.description || '',
    image: category.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80',
    active: category.active !== undefined ? Boolean(category.active) : true,
    subcategories: category.subcategories || [],
    createdAt: category.createdAt || now,
  };

  // 1. Immediately update local storage cache
  const localList = getLocalCategories();
  const existingIdx = localList.findIndex(c => c.id === catId);
  if (existingIdx >= 0) {
    localList[existingIdx] = finalCat;
  } else {
    localList.unshift(finalCat);
  }
  saveLocalCategories(localList);

  // 2. Persist to Firestore
  try {
    await setDoc(catRef, finalCat, { merge: true });
  } catch (err) {
    console.warn('Remote category save warning (persisted locally):', err);
  }

  return catId;
}

export async function toggleCategoryActive(id: string, active: boolean): Promise<void> {
  // Update local storage
  const localList = getLocalCategories();
  const target = localList.find(c => c.id === id);
  if (target) {
    target.active = active;
    saveLocalCategories(localList);
  }

  // Update Firestore
  try {
    const catRef = doc(db, CATEGORIES_COL, id);
    await updateDoc(catRef, { active });
  } catch (err) {
    console.warn('Remote category toggle warning:', err);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  // 1. Remove from local cache immediately
  const localList = getLocalCategories().filter(c => c.id !== id);
  saveLocalCategories(localList);

  // 2. Remove from Firestore
  try {
    const catRef = doc(db, CATEGORIES_COL, id);
    await deleteDoc(catRef);
  } catch (err) {
    console.warn('Remote category delete warning:', err);
  }
}

// Orders
export async function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  // Guaranteed distinct unique 9-digit order number (e.g. 849201948)
  const existingOrders = getLocalStoredOrders();
  const existingNums = new Set(existingOrders.map(o => o.orderNumber));
  
  let orderNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
  while (existingNums.has(orderNumber)) {
    orderNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
  }
  
  const now = Date.now();

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    ...orderData,
    createdAt: now,
    updatedAt: now
  };

  // 1. Cache immediately in local storage
  const localOrders = getLocalStoredOrders();
  localOrders.unshift(newOrder);
  saveLocalStoredOrders(localOrders);

  // 2. Deduct product stock in memory & local storage
  try {
    const localProds = getLocalProducts();
    orderData.items.forEach(item => {
      const prod = localProds.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    saveLocalProducts(localProds);
  } catch (stockErr) {
    console.warn('Stock update notice:', stockErr);
  }

  // 3. Persist to Firestore
  try {
    const orderRef = doc(db, ORDERS_COL, orderId);
    await setDoc(orderRef, newOrder);
  } catch (err) {
    console.warn('Remote order save warning (persisted locally):', err);
  }

  return newOrder;
}

export async function getOrders(customerId?: string, customerEmail?: string, customerPhone?: string): Promise<Order[]> {
  const localOrders = getLocalStoredOrders();
  let allOrders = localOrders;
  try {
    const snap = await getDocs(collection(db, ORDERS_COL));
    const firestoreOrders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    
    // Merge remote Firestore orders and local orders
    const orderMap = new Map<string, Order>();
    localOrders.forEach(o => orderMap.set(o.id, o));
    firestoreOrders.forEach(o => orderMap.set(o.id, o));
    
    const combined = Array.from(orderMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    saveLocalStoredOrders(combined);
    allOrders = combined;
  } catch (err) {
    console.warn('Firestore orders fetch notice (using local storage backup):', err);
    allOrders = localOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  if (customerId || customerEmail || customerPhone) {
    const cleanEmail = customerEmail?.trim().toLowerCase();
    const cleanPhone = customerPhone?.trim().replace(/\D/g, '');
    return allOrders.filter(o => {
      if (customerId && o.customerId === customerId) return true;
      if (cleanEmail && o.email && o.email.trim().toLowerCase() === cleanEmail) return true;
      if (cleanPhone && o.phone && o.phone.replace(/\D/g, '').includes(cleanPhone)) return true;
      return false;
    });
  }

  return allOrders;
}

export async function trackOrderByNumberOrContact(queryStr: string): Promise<Order[]> {
  const all = await getOrders();
  const q = queryStr.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, '');

  return all.filter(o => {
    if (o.orderNumber && (o.orderNumber.toLowerCase() === q || o.orderNumber.includes(q))) return true;
    if (qDigits.length >= 6 && o.orderNumber && o.orderNumber.includes(qDigits)) return true;
    if (o.email && o.email.toLowerCase() === q) return true;
    if (qDigits.length >= 7 && o.phone && o.phone.replace(/\D/g, '').includes(qDigits)) return true;
    if (o.transactionId && o.transactionId.toLowerCase() === q) return true;
    return false;
  });
}

export async function updateOrderStatus(orderId: string, orderStatus: OrderStatus, paymentStatus?: PaymentStatus): Promise<void> {
  const now = Date.now();
  
  // Update in local cache immediately
  const localOrders = getLocalStoredOrders();
  const updatedLocal = localOrders.map(o => {
    if (o.id === orderId) {
      return {
        ...o,
        orderStatus,
        paymentStatus: paymentStatus || o.paymentStatus,
        updatedAt: now
      };
    }
    return o;
  });
  saveLocalStoredOrders(updatedLocal);

  try {
    const orderRef = doc(db, ORDERS_COL, orderId);
    const updateData: Record<string, any> = {
      orderStatus,
      updatedAt: now
    };
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    await updateDoc(orderRef, updateData);
  } catch (err) {
    console.warn('Remote order status update warning:', err);
  }
}

// -------------------------------------------------------------
// CAROUSEL SLIDES MANAGEMENT (Customer and Admin editable)
// -------------------------------------------------------------

function getLocalCarouselSlides(): CarouselSlide[] {
  try {
    const raw = localStorage.getItem(LOCAL_CAROUSEL_KEY);
    return raw ? JSON.parse(raw) : [...INITIAL_CAROUSEL_SLIDES];
  } catch {
    return [...INITIAL_CAROUSEL_SLIDES];
  }
}

function saveLocalCarouselSlides(slides: CarouselSlide[]): void {
  try {
    localStorage.setItem(LOCAL_CAROUSEL_KEY, JSON.stringify(slides));
  } catch (e) {
    console.warn('Failed to cache carousel slides locally', e);
  }
}

export async function getCarouselSlides(): Promise<CarouselSlide[]> {
  const local = getLocalCarouselSlides();
  try {
    const q = query(
      collection(db, CAROUSEL_COL),
      where('active', '==', true)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const slides = snap.docs.map(d => ({ id: d.id, ...d.data() } as CarouselSlide));
      slides.sort((a, b) => (a.order || 0) - (b.order || 0));
      saveLocalCarouselSlides(slides);
      return slides;
    }
    const filteredLocal = local.filter(s => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    return filteredLocal.length > 0 ? filteredLocal : INITIAL_CAROUSEL_SLIDES;
  } catch (err) {
    console.warn('Carousel fetch notice (using local storage):', err);
    const filteredLocal = local.filter(s => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    return filteredLocal.length > 0 ? filteredLocal : INITIAL_CAROUSEL_SLIDES;
  }
}

export async function getAllAdminCarouselSlides(): Promise<CarouselSlide[]> {
  const local = getLocalCarouselSlides();
  try {
    const snap = await getDocs(collection(db, CAROUSEL_COL));
    if (!snap.empty) {
      const slides = snap.docs.map(d => ({ id: d.id, ...d.data() } as CarouselSlide));
      slides.sort((a, b) => (a.order || 0) - (b.order || 0));
      saveLocalCarouselSlides(slides);
      return slides;
    }
    return local && local.length > 0 ? local.sort((a, b) => (a.order || 0) - (b.order || 0)) : INITIAL_CAROUSEL_SLIDES;
  } catch (err) {
    console.warn('Admin carousel fetch notice (using local storage):', err);
    return local && local.length > 0 ? local.sort((a, b) => (a.order || 0) - (b.order || 0)) : INITIAL_CAROUSEL_SLIDES;
  }
}

export async function saveCarouselSlide(slideData: Partial<CarouselSlide>): Promise<CarouselSlide> {
  const now = Date.now();
  const id = slideData.id || `slide-${Date.now()}`;
  const completeSlide: CarouselSlide = {
    id,
    productId: slideData.productId || '',
    badge: slideData.badge || '',
    badgeColor: slideData.badgeColor || 'bg-amber-100 text-amber-900 border-amber-300',
    title: slideData.title || 'New Highlight Slide',
    subtitle: slideData.subtitle || '',
    description: slideData.description || '',
    priceTag: slideData.priceTag || '',
    originalPrice: slideData.originalPrice !== undefined ? Number(slideData.originalPrice) : undefined,
    discountPrice: slideData.discountPrice !== undefined ? Number(slideData.discountPrice) : undefined,
    discountTag: slideData.discountTag || '',
    buttonText: slideData.buttonText || 'Buy Now',
    buttonLink: slideData.buttonLink || (slideData.productId ? slideData.productId : 'shop'),
    image: slideData.image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
    bgGradient: slideData.bgGradient || 'from-amber-950 via-stone-900 to-stone-950',
    active: slideData.active !== undefined ? slideData.active : true,
    order: slideData.order || 1,
    createdAt: slideData.createdAt || now,
    updatedAt: now
  };

  // Update local cache
  const local = getLocalCarouselSlides();
  const existingIdx = local.findIndex(s => s.id === id);
  let updatedLocal: CarouselSlide[];
  if (existingIdx >= 0) {
    updatedLocal = [...local];
    updatedLocal[existingIdx] = completeSlide;
  } else {
    updatedLocal = [...local, completeSlide];
  }
  updatedLocal.sort((a, b) => (a.order || 0) - (b.order || 0));
  saveLocalCarouselSlides(updatedLocal);

  // Update Firestore
  try {
    const docRef = doc(db, CAROUSEL_COL, id);
    await setDoc(docRef, completeSlide);
  } catch (err) {
    console.warn('Remote carousel save warning (persisted locally):', err);
  }

  return completeSlide;
}

export async function deleteCarouselSlide(slideId: string): Promise<void> {
  // Update local cache
  const local = getLocalCarouselSlides();
  const updatedLocal = local.filter(s => s.id !== slideId);
  saveLocalCarouselSlides(updatedLocal);

  // Update Firestore
  try {
    await deleteDoc(doc(db, CAROUSEL_COL, slideId));
  } catch (err) {
    console.warn('Remote carousel slide delete warning:', err);
  }
}

export async function resetCarouselSlidesToDefault(): Promise<CarouselSlide[]> {
  saveLocalCarouselSlides([...INITIAL_CAROUSEL_SLIDES]);
  try {
    for (const slide of INITIAL_CAROUSEL_SLIDES) {
      await setDoc(doc(db, CAROUSEL_COL, slide.id), slide);
    }
  } catch (e) {
    console.warn('Remote reset carousel warning:', e);
  }
  return [...INITIAL_CAROUSEL_SLIDES];
}

// -------------------------------------------------------------
// SPOTLIGHT PROMO BANNER (Admin Editable Hardware Showcase)
// -------------------------------------------------------------

function getLocalSpotlightBanner(): SpotlightBanner {
  try {
    const raw = localStorage.getItem(LOCAL_SPOTLIGHT_KEY);
    return raw ? { ...DEFAULT_SPOTLIGHT_BANNER, ...JSON.parse(raw) } : DEFAULT_SPOTLIGHT_BANNER;
  } catch {
    return DEFAULT_SPOTLIGHT_BANNER;
  }
}

function saveLocalSpotlightBanner(banner: SpotlightBanner): void {
  try {
    localStorage.setItem(LOCAL_SPOTLIGHT_KEY, JSON.stringify(banner));
  } catch (e) {
    console.warn('Failed to cache spotlight banner locally', e);
  }
}

export async function getSpotlightBanner(): Promise<SpotlightBanner> {
  const local = getLocalSpotlightBanner();
  try {
    const docRef = doc(db, SETTINGS_COL, SPOTLIGHT_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = { ...DEFAULT_SPOTLIGHT_BANNER, ...snap.data() } as SpotlightBanner;
      saveLocalSpotlightBanner(data);
      return data;
    }
    return local;
  } catch (err) {
    console.warn('Spotlight fetch notice (using local storage):', err);
    return local;
  }
}

export async function updateSpotlightBanner(bannerData: Partial<SpotlightBanner>): Promise<SpotlightBanner> {
  const current = getLocalSpotlightBanner();
  const updated: SpotlightBanner = {
    ...current,
    ...bannerData,
    price: bannerData.price !== undefined ? Number(bannerData.price) : current.price,
    compareAtPrice: bannerData.compareAtPrice !== undefined ? Number(bannerData.compareAtPrice) : current.compareAtPrice,
    updatedAt: Date.now()
  };

  // Cache locally
  saveLocalSpotlightBanner(updated);

  // Persist to Firestore
  try {
    const docRef = doc(db, SETTINGS_COL, SPOTLIGHT_DOC);
    await setDoc(docRef, updated, { merge: true });
  } catch (err) {
    console.warn('Remote spotlight save warning (persisted locally):', err);
  }

  return updated;
}

// -------------------------------------------------------------
// REAL-TIME FIRESTORE LISTENERS (Admin-to-Storefront Instant Sync)
// -------------------------------------------------------------

/**
 * Real-time subscription to active storefront Carousel slides
 */
export function subscribeToCarouselSlides(callback: (slides: CarouselSlide[]) => void): Unsubscribe {
  try {
    const q = query(collection(db, CAROUSEL_COL));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const allSlides = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CarouselSlide));
          allSlides.sort((a, b) => (a.order || 0) - (b.order || 0));
          saveLocalCarouselSlides(allSlides);
          const activeOnly = allSlides.filter(s => s.active !== false);
          callback(activeOnly.length > 0 ? activeOnly : allSlides);
        } else {
          callback(INITIAL_CAROUSEL_SLIDES);
        }
      },
      (error) => {
        console.warn('Carousel real-time subscription notice (using local):', error);
        const local = getLocalCarouselSlides();
        const activeOnly = local.filter(s => s.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
        callback(activeOnly.length > 0 ? activeOnly : INITIAL_CAROUSEL_SLIDES);
      }
    );
  } catch (err) {
    console.warn('Failed to attach carousel real-time listener:', err);
    return () => {};
  }
}

/**
 * Real-time subscription to Spotlight Hardware banner data
 */
export function subscribeToSpotlightBanner(callback: (banner: SpotlightBanner) => void): Unsubscribe {
  try {
    const docRef = doc(db, SETTINGS_COL, SPOTLIGHT_DOC);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = { ...DEFAULT_SPOTLIGHT_BANNER, ...snapshot.data() } as SpotlightBanner;
          saveLocalSpotlightBanner(data);
          callback(data);
        } else {
          callback(DEFAULT_SPOTLIGHT_BANNER);
        }
      },
      (error) => {
        console.warn('Spotlight banner real-time subscription notice:', error);
        callback(getLocalSpotlightBanner());
      }
    );
  } catch (err) {
    console.warn('Failed to attach spotlight banner listener:', err);
    return () => {};
  }
}

/**
 * Real-time subscription to Orders for Admin and Customer Portals
 */
export function subscribeToOrders(callback: (orders: Order[]) => void): Unsubscribe {
  try {
    const q = query(collection(db, ORDERS_COL));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
          const localOrders = getLocalStoredOrders();
          
          const orderMap = new Map<string, Order>();
          localOrders.forEach(o => orderMap.set(o.id, o));
          firestoreOrders.forEach(o => orderMap.set(o.id, o));
          
          const combined = Array.from(orderMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          saveLocalStoredOrders(combined);
          callback(combined);
        } else {
          callback(getLocalStoredOrders());
        }
      },
      (error) => {
        console.warn('Orders real-time subscription notice (using local):', error);
        callback(getLocalStoredOrders());
      }
    );
  } catch (err) {
    console.warn('Failed to attach orders real-time listener:', err);
    return () => {};
  }
}


