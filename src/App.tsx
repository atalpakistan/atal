/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ShopPage } from './components/ShopPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderConfirmationPage } from './components/OrderConfirmationPage';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { AboutPage, ContactPage } from './components/AboutAndContact';
import { Footer } from './components/Footer';

import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  seedDatabaseIfEmpty,
  fetchUnifiedStoreData,
  getLocalCategories,
  getLocalProducts,
  getLocalCarouselSlides,
  getLocalSpotlightBanner,
  getLocalStoredOrders,
  DEFAULT_SPOTLIGHT_BANNER,
  subscribeToCarouselSlides,
  subscribeToSpotlightBanner,
  subscribeToOrders,
  getProductBySlug
} from './services/storeService';
import { Product, Category, Order, CarouselSlide, SpotlightBanner } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_CAROUSEL_SLIDES } from './services/seedData';
import { extractProductSlugFromLocation, getProductUrl, slugify, findProductInCatalog } from './utils/slug';
import { updateProductSeo, resetStoreSeo } from './utils/seo';
import { ProductDetailSkeleton } from './components/ProductDetailSkeleton';
import { ShoppingBag } from 'lucide-react';

interface RouteState {
  view: 'home' | 'shop' | 'product-detail' | 'checkout' | 'order-confirmation' | 'admin' | 'about' | 'contact';
  productSlug?: string | null;
  productId?: string | null;
  category?: string;
  subcategory?: string;
}

function parseLocationRoute(): RouteState {
  if (typeof window === 'undefined') {
    return { view: 'home', productSlug: null, productId: null, category: 'all', subcategory: 'all' };
  }
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash;

  // 1. Check for product slug route: /products/:slug or /product/:slug or fallback query param
  const slugFound = extractProductSlugFromLocation(pathname, window.location.search, hash);
  const catParam = params.get('category') || params.get('cat') || 'all';
  const subcatParam = params.get('subcategory') || params.get('subcat') || 'all';

  if (slugFound) {
    return {
      view: 'product-detail',
      productSlug: slugFound,
      productId: slugFound,
      category: catParam,
      subcategory: subcatParam
    };
  }

  // 2. Check path routes: /shop, /admin, /checkout, /about, /contact
  const routeSegment = pathname.replace(/^\//, '').split('/')[0];
  if (['shop', 'checkout', 'admin', 'about', 'contact'].includes(routeSegment)) {
    return {
      view: routeSegment as any,
      productSlug: null,
      productId: null,
      category: catParam,
      subcategory: subcatParam
    };
  }

  // 3. Check query param: ?page=...
  const pageParam = params.get('page') || params.get('view');
  if (pageParam && ['home', 'shop', 'checkout', 'order-confirmation', 'admin', 'about', 'contact'].includes(pageParam)) {
    return {
      view: pageParam as any,
      productSlug: null,
      productId: null,
      category: catParam,
      subcategory: subcatParam
    };
  }

  return { view: 'home', productSlug: null, productId: null, category: 'all', subcategory: 'all' };
}

function MainApp() {
  const { isAdmin, isStaff } = useAuth();
  const hasStaffOrAdminAccess = Boolean(isAdmin || isStaff);

  const initialRoute = React.useMemo(() => parseLocationRoute(), []);

  // Navigation states synchronized with separate page URL routes
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'product-detail' | 'checkout' | 'order-confirmation' | 'admin' | 'about' | 'contact'>(initialRoute.view);
  const [activeCategoryParam, setActiveCategoryParam] = useState<string>(initialRoute.category || 'all');
  const [activeSubcategoryParam, setActiveSubcategoryParam] = useState<string>(initialRoute.subcategory || 'all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    const slugOrId = initialRoute.productSlug || initialRoute.productId;
    if (slugOrId) {
      const allProds = getLocalProducts();
      return findProductInCatalog(allProds, slugOrId) || findProductInCatalog(INITIAL_PRODUCTS, slugOrId);
    }
    return null;
  });
  const [isResolvingProduct, setIsResolvingProduct] = useState<boolean>(() => {
    const slugOrId = initialRoute.productSlug || initialRoute.productId;
    if (initialRoute.view === 'product-detail' && slugOrId) {
      const allProds = getLocalProducts();
      const found = findProductInCatalog(allProds, slugOrId) || findProductInCatalog(INITIAL_PRODUCTS, slugOrId);
      return !found;
    }
    return false;
  });
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Search & Auth modal states
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [customerAuthModalOpen, setCustomerAuthModalOpen] = useState(false);
  const [customerAuthMode, setCustomerAuthMode] = useState<'login' | 'register' | 'track' | 'orders'>('login');

  // Instant zero-delay data states initialized from local disk cache
  const [categories, setCategories] = useState<Category[]>(() => {
    const list = getLocalCategories();
    return list && list.length > 0 ? list.filter(c => c.active !== false) : INITIAL_CATEGORIES;
  });
  const [adminCategories, setAdminCategories] = useState<Category[]>(() => {
    const list = getLocalCategories();
    return list && list.length > 0 ? list : INITIAL_CATEGORIES;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const list = getLocalProducts();
    return list && list.length > 0 ? list.filter(p => p.active !== false) : INITIAL_PRODUCTS;
  });
  const [adminProducts, setAdminProducts] = useState<Product[]>(() => {
    const list = getLocalProducts();
    return list && list.length > 0 ? list : INITIAL_PRODUCTS;
  });
  const [orders, setOrders] = useState<Order[]>(() => getLocalStoredOrders());
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(() => {
    const list = getLocalCarouselSlides();
    return list && list.length > 0 ? list.filter(s => s.active !== false) : INITIAL_CAROUSEL_SLIDES;
  });
  const [adminCarouselSlides, setAdminCarouselSlides] = useState<CarouselSlide[]>(() => {
    const list = getLocalCarouselSlides();
    return list && list.length > 0 ? list : INITIAL_CAROUSEL_SLIDES;
  });
  const [spotlightBanner, setSpotlightBanner] = useState<SpotlightBanner>(() => getLocalSpotlightBanner());
  const [, setLoading] = useState(false);

  // Fast-track targeted resolver for direct unique product URLs (/products/:slug)
  useEffect(() => {
    const slugOrId = initialRoute.productSlug || initialRoute.productId;
    if (currentView === 'product-detail' && slugOrId && !selectedProduct) {
      let isMounted = true;
      setIsResolvingProduct(true);
      getProductBySlug(slugOrId)
        .then((prod) => {
          if (isMounted && prod) {
            setSelectedProduct(prod);
            updateProductSeo(prod);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsResolvingProduct(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [currentView, initialRoute.productSlug, initialRoute.productId, selectedProduct]);

  // Load data: Single unified parallel pass with zero duplicates and non-blocking background seeding
  const loadData = useCallback(async () => {
    try {
      // Background non-blocking seed verification
      seedDatabaseIfEmpty().catch(() => {});
      const data = await fetchUnifiedStoreData();

      if (data.categories && data.categories.length > 0) setCategories(data.categories);
      if (data.adminCategories && data.adminCategories.length > 0) setAdminCategories(data.adminCategories);
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
        // If product page is requested, ensure fresh data is connected
        const targetSlugOrId = initialRoute.productSlug || initialRoute.productId;
        if (targetSlugOrId && !selectedProduct) {
          const matched = findProductInCatalog(data.products, targetSlugOrId);
          if (matched) {
            setSelectedProduct(matched);
            updateProductSeo(matched);
            setIsResolvingProduct(false);
          }
        } else if (selectedProduct) {
          const fresh = data.products.find(p => p.id === selectedProduct.id);
          if (fresh) {
            setSelectedProduct(fresh);
            updateProductSeo(fresh);
          }
        }
      }
      if (data.adminProducts && data.adminProducts.length > 0) setAdminProducts(data.adminProducts);
      if (data.orders) setOrders(data.orders);
      if (data.carouselSlides && data.carouselSlides.length > 0) setCarouselSlides(data.carouselSlides);
      if (data.adminCarouselSlides && data.adminCarouselSlides.length > 0) setAdminCarouselSlides(data.adminCarouselSlides);
      if (data.spotlightBanner) setSpotlightBanner(data.spotlightBanner);
    } catch (err) {
      console.warn('Initial data load gracefully handled fallback:', err);
    } finally {
      setLoading(false);
    }
  }, [initialRoute.productSlug, initialRoute.productId, selectedProduct]);

  useEffect(() => {
    loadData();

    // Attach real-time Firestore listeners for immediate admin-to-frontend synchronization
    const unsubCarousel = subscribeToCarouselSlides((updatedSlides) => {
      if (updatedSlides && updatedSlides.length > 0) {
        setCarouselSlides(updatedSlides.filter(s => s.active !== false));
        setAdminCarouselSlides(updatedSlides);
      }
    });

    const unsubSpotlight = subscribeToSpotlightBanner((updatedSpotlight) => {
      if (updatedSpotlight) {
        setSpotlightBanner(updatedSpotlight);
      }
    });

    let unsubOrders = () => {};
    if (hasStaffOrAdminAccess) {
      unsubOrders = subscribeToOrders((updatedOrders) => {
        if (updatedOrders) {
          setOrders(updatedOrders);
        }
      });
    }

    return () => {
      unsubCarousel();
      unsubSpotlight();
      unsubOrders();
    };
  }, [loadData, hasStaffOrAdminAccess]);

  // Derived sections (From active customer catalog)
  const featuredProducts = products.filter(p => p.featured);
  const bestSellers = products.filter(p => p.bestSeller);
  const newArrivals = products.filter(p => p.newArrival);

  // Navigation handler with URL pushState
  const handleNavigate = (view: string, param?: string, subparam?: string, pushHistory = true) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    resetStoreSeo();

    if (view === 'shop') {
      const cat = param || 'all';
      const sub = subparam || 'all';
      setActiveCategoryParam(cat);
      setActiveSubcategoryParam(sub);
      setCurrentView('shop');
      document.title = 'Shop All Collections | ATAL Luxury Lifestyle';
      if (pushHistory) {
        let url = '?page=shop';
        if (cat !== 'all') url += `&category=${encodeURIComponent(cat)}`;
        if (sub !== 'all') url += `&subcategory=${encodeURIComponent(sub)}`;
        window.history.pushState({ view: 'shop', category: cat, subcategory: sub }, '', url);
      }
    } else if (view === 'admin') {
      loadData();
      setCurrentView('admin');
      document.title = 'Admin Dashboard | ATAL Store';
      if (pushHistory) {
        window.history.pushState({ view: 'admin' }, '', '?page=admin');
      }
    } else if (view === 'home') {
      setCurrentView('home');
      document.title = 'ATAL – Shop Smart. Live Better. 🛍️';
      if (pushHistory) {
        window.history.pushState({ view: 'home' }, '', '/');
      }
    } else if (view === 'about' || view === 'contact' || view === 'checkout') {
      setCurrentView(view as any);
      document.title = `${view.charAt(0).toUpperCase() + view.slice(1)} | ATAL Luxury Lifestyle`;
      if (pushHistory) {
        window.history.pushState({ view }, '', `?page=${view}`);
      }
    }
  };

  // Every product opens in a dedicated separate page with deep-link SEO URL: /products/:slug
  const handleSelectProduct = (prod: Product, pushHistory = true) => {
    setSelectedProduct(prod);
    setCurrentView('product-detail');
    setIsResolvingProduct(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    updateProductSeo(prod);

    if (pushHistory) {
      const canonicalPath = getProductUrl(prod);
      window.history.pushState(
        { view: 'product-detail', slug: prod.slug, productId: prod.id },
        '',
        canonicalPath
      );
    }
  };

  const handleSelectProductById = (slugOrId: string) => {
    const prod = findProductInCatalog(products, slugOrId) ||
                 findProductInCatalog(INITIAL_PRODUCTS, slugOrId);
    if (prod) {
      handleSelectProduct(prod, true);
    } else {
      setIsResolvingProduct(true);
      setCurrentView('product-detail');
      getProductBySlug(slugOrId)
        .then(p => {
          if (p) handleSelectProduct(p, true);
        })
        .finally(() => setIsResolvingProduct(false));
    }
  };

  // Listen to browser Back / Forward buttons (PopState)
  useEffect(() => {
    const handlePopState = () => {
      const route = parseLocationRoute();
      setCurrentView(route.view);

      if (route.view === 'product-detail') {
        const slugOrId = route.productSlug || route.productId;
        if (slugOrId) {
          const allProds = getLocalProducts();
          const prod = findProductInCatalog(allProds, slugOrId) ||
                       findProductInCatalog(products, slugOrId) ||
                       findProductInCatalog(INITIAL_PRODUCTS, slugOrId);
          if (prod) {
            handleSelectProduct(prod, false);
            return;
          } else {
            setIsResolvingProduct(true);
            setSelectedProduct(null);
            getProductBySlug(slugOrId)
              .then(p => {
                if (p) handleSelectProduct(p, false);
              })
              .finally(() => setIsResolvingProduct(false));
            return;
          }
        }
      }
      handleNavigate(route.view, route.category, route.subcategory, false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Keep SEO synced if product detail view is active
  useEffect(() => {
    if (currentView === 'product-detail' && selectedProduct) {
      updateProductSeo(selectedProduct);
    }
  }, [currentView, selectedProduct]);

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentView('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadData();
  };

  const handleOpenCustomerAuth = (mode: 'login' | 'register' = 'login') => {
    setCustomerAuthMode(mode);
    setCustomerAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col justify-between selection:bg-stone-900 selection:text-white">
      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Customer Account Modal */}
      <CustomerAuthModal
        isOpen={customerAuthModalOpen}
        onClose={() => setCustomerAuthModalOpen(false)}
        defaultMode={customerAuthMode}
      />

      {/* Cart Drawer with Separate Page Navigation */}
      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
        onNavigateToShop={() => handleNavigate('shop')}
        onSelectProduct={handleSelectProductById}
      />

      {/* Header (Hidden only in full Admin screen) */}
      {currentView !== 'admin' && (
        <Header
          categories={categories}
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenCustomerAuth={handleOpenCustomerAuth}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            categories={categories}
            featuredProducts={featuredProducts}
            bestSellers={bestSellers}
            newArrivals={newArrivals}
            carouselSlides={carouselSlides}
            spotlightBanner={spotlightBanner}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'shop' && (
          <ShopPage
            allProducts={products}
            categories={categories}
            initialCategory={activeCategoryParam}
            initialSubcategory={activeSubcategoryParam}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product-detail' && (
          selectedProduct ? (
            <ProductDetailPage
              product={selectedProduct}
              relatedProducts={products.filter(p => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id)}
              onSelectProduct={handleSelectProduct}
              onBack={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  handleNavigate('shop');
                }
              }}
            />
          ) : isResolvingProduct ? (
            <ProductDetailSkeleton onBack={() => handleNavigate('shop')} />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-24 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 font-serif-display mb-2">Product Not Found</h2>
              <p className="text-stone-600 text-sm mb-6 max-w-md mx-auto">
                The requested product could not be located in our catalog. It may have been moved, renamed, or is temporarily out of stock.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleNavigate('shop')}
                  className="px-6 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-bold hover:bg-stone-850 transition cursor-pointer"
                >
                  Explore All Products
                </button>
                <button
                  onClick={() => handleNavigate('home')}
                  className="px-6 py-2.5 bg-white border border-stone-200 text-stone-800 rounded-xl text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onBackToShopping={() => handleNavigate('shop')}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentView === 'order-confirmation' && confirmedOrder && (
          <OrderConfirmationPage
            order={confirmedOrder}
            onContinueShopping={() => {
              setCurrentView('shop');
              setActiveCategoryParam('all');
            }}
          />
        )}

        {currentView === 'admin' && (
          hasStaffOrAdminAccess ? (
            <AdminDashboard
              products={adminProducts}
              categories={adminCategories}
              orders={orders}
              carouselSlides={adminCarouselSlides}
              spotlightBanner={spotlightBanner}
              onRefreshData={loadData}
              onExitAdmin={() => {
                loadData();
                setCurrentView('home');
              }}
            />
          ) : (
            <AdminLogin
              onSuccess={() => {
                loadData();
                setCurrentView('admin');
              }}
              onCancel={() => setCurrentView('home')}
            />
          )
        )}

        {currentView === 'about' && <AboutPage />}
        {currentView === 'contact' && <ContactPage />}
      </main>

      {/* Footer (Hidden only inside Admin full view) */}
      {currentView !== 'admin' && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
