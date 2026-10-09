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
  getProducts,
  getAllAdminProducts,
  getCategories,
  getAllAdminCategories,
  getOrders,
  getCarouselSlides,
  getAllAdminCarouselSlides,
  getSpotlightBanner,
  DEFAULT_SPOTLIGHT_BANNER,
  subscribeToCarouselSlides,
  subscribeToSpotlightBanner,
  subscribeToOrders
} from './services/storeService';
import { Product, Category, Order, CarouselSlide, SpotlightBanner } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_CAROUSEL_SLIDES } from './services/seedData';

function MainApp() {
  const { isAdmin, isStaff } = useAuth();

  // Navigation states
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'product-detail' | 'checkout' | 'order-confirmation' | 'admin' | 'about' | 'contact'>('home');
  const [activeCategoryParam, setActiveCategoryParam] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Search & Auth modal states
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [customerAuthModalOpen, setCustomerAuthModalOpen] = useState(false);
  const [customerAuthMode, setCustomerAuthMode] = useState<'login' | 'register' | 'track' | 'orders'>('login');

  // Data states
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [adminCategories, setAdminCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [adminProducts, setAdminProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(INITIAL_CAROUSEL_SLIDES);
  const [adminCarouselSlides, setAdminCarouselSlides] = useState<CarouselSlide[]>(INITIAL_CAROUSEL_SLIDES);
  const [spotlightBanner, setSpotlightBanner] = useState<SpotlightBanner>(DEFAULT_SPOTLIGHT_BANNER);
  const [loading, setLoading] = useState(true);

  // Load data: Customer view gets active items; Admin gets complete inventory
  const loadData = useCallback(async () => {
    try {
      await seedDatabaseIfEmpty();
      const [fetchedCats, fetchedProds, fetchedAdminCats, fetchedAdminProds, fetchedOrders, fetchedSlides, fetchedAdminSlides, fetchedSpotlight] = await Promise.all([
        getCategories(),
        getProducts(),
        getAllAdminCategories(),
        getAllAdminProducts(),
        getOrders(),
        getCarouselSlides(),
        getAllAdminCarouselSlides(),
        getSpotlightBanner()
      ]);

      if (fetchedCats) setCategories(fetchedCats);
      if (fetchedProds) setProducts(fetchedProds);
      if (fetchedAdminCats) setAdminCategories(fetchedAdminCats);
      if (fetchedAdminProds) setAdminProducts(fetchedAdminProds);
      if (fetchedOrders) setOrders(fetchedOrders);
      if (fetchedSlides && fetchedSlides.length > 0) {
        setCarouselSlides(fetchedSlides);
      } else if (fetchedSlides) {
        setCarouselSlides(fetchedSlides);
      }
      if (fetchedAdminSlides && fetchedAdminSlides.length > 0) {
        setAdminCarouselSlides(fetchedAdminSlides);
      } else if (fetchedAdminSlides) {
        setAdminCarouselSlides(fetchedAdminSlides);
      }
      if (fetchedSpotlight) setSpotlightBanner(fetchedSpotlight);
    } catch (err) {
      console.warn('Initial data load gracefully handled fallback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

    const unsubOrders = subscribeToOrders((updatedOrders) => {
      if (updatedOrders) {
        setOrders(updatedOrders);
      }
    });

    return () => {
      unsubCarousel();
      unsubSpotlight();
      unsubOrders();
    };
  }, [loadData]);

  // Derived sections (From active customer catalog)
  const featuredProducts = products.filter(p => p.featured);
  const bestSellers = products.filter(p => p.bestSeller);
  const newArrivals = products.filter(p => p.newArrival);

  // Navigation handler
  const handleNavigate = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'shop') {
      setActiveCategoryParam(param || 'all');
      setCurrentView('shop');
    } else if (view === 'admin') {
      loadData();
      setCurrentView('admin');
    } else if (view === 'home' || view === 'about' || view === 'contact' || view === 'checkout') {
      setCurrentView(view as any);
    }
  };

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const hasStaffOrAdminAccess = isAdmin || isStaff;

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

      {/* Cart Drawer */}
      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
        onNavigateToShop={() => handleNavigate('shop')}
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
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            relatedProducts={products.filter(p => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id)}
            onSelectProduct={handleSelectProduct}
            onBack={() => handleNavigate('shop')}
          />
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
