import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Sparkles,
  LogOut,
  UserCheck,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Category } from '../types';

interface HeaderProps {
  categories: Category[];
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenSearch: () => void;
  onOpenCustomerAuth: (mode?: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenCustomerAuth
}) => {
  const { itemCount, setIsCartOpen, promoCodesEnabled } = useCart();
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleCategoryClick = (catId: string) => {
    setCategoryDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate('shop', catId);
  };

  return (
    <>
      {/* Top Banner Notice */}
      <div className="bg-emerald-100/90 text-emerald-950 text-xs py-2.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-emerald-200/90">
        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
        <span>
          Nationwide Delivery: Flat PKR 290 • Free Shipping on orders over PKR 6,000
          {promoCodesEnabled && (
            <>
              {' • '}Use code <strong className="text-emerald-950 font-bold underline underline-offset-2">ATAL8</strong> for 8% off
            </>
          )}
        </span>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 text-[#2e8710]" style={{ color: '#2e8710' }}>
            {/* Left: Mobile hamburger & Brand */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="lg:hidden p-2 text-stone-700 hover:text-black rounded-lg hover:bg-stone-100 transition cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-3 text-left group cursor-pointer"
              >
                <img
                  src="/atal-logo.jpg"
                  alt="ATAL Logo"
                  className="w-11 h-11 object-contain rounded-xl shadow-xs border border-stone-200/80 bg-white transition-transform group-hover:scale-105"
                />
                <div className="flex flex-col">
                  <span className="font-black text-2xl tracking-tight leading-none text-emerald-600 font-serif-display transition-colors group-hover:text-emerald-700">
                    ATAL
                  </span>
                  <span className="text-[10px] tracking-[0.25em] text-stone-500 font-semibold uppercase mt-0.5">
                    Lifestyle • Fashion
                  </span>
                </div>
              </button>
            </div>

            {/* Middle: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 font-medium text-stone-600 text-sm">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'home'
                    ? 'text-stone-950 font-semibold bg-stone-100/80'
                    : 'hover:text-stone-950 hover:bg-stone-50'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => onNavigate('shop')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'shop'
                    ? 'text-stone-950 font-semibold bg-stone-100/80'
                    : 'hover:text-stone-950 hover:bg-stone-50'
                }`}
              >
                Shop All
              </button>

              <button
                onClick={() => onNavigate('shop', 'new-arrivals')}
                className="px-3.5 py-2 rounded-lg hover:text-stone-950 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                New Arrivals
              </button>

              <button
                onClick={() => onNavigate('shop', 'best-sellers')}
                className="px-3.5 py-2 rounded-lg hover:text-stone-950 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Best Sellers
              </button>

              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCategoryDropdownOpen(true)}
                onMouseLeave={() => setCategoryDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 px-3.5 py-2 rounded-lg hover:text-stone-950 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  <span>Categories</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 w-80 bg-white border border-stone-200 shadow-2xl rounded-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="text-xs font-semibold text-stone-600 uppercase tracking-wider px-3 py-2">
                      Department Collections
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-left transition group cursor-pointer"
                        >
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200 group-hover:scale-105 transition"
                          />
                          <div>
                            <div className="text-sm font-semibold text-stone-900 group-hover:text-black">
                              {cat.name}
                            </div>
                            <div className="text-xs text-stone-600 line-clamp-1">
                              {cat.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onNavigate('about')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'about'
                    ? 'text-stone-950 font-semibold bg-stone-100/80'
                    : 'hover:text-stone-950 hover:bg-stone-50'
                }`}
              >
                About
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                  currentView === 'contact'
                    ? 'text-stone-950 font-semibold bg-stone-100/80'
                    : 'hover:text-stone-950 hover:bg-stone-50'
                }`}
              >
                Contact
              </button>
            </nav>

            {/* Right: Search, Customer Account Dropdown & Cart */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="p-2.5 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                title="Search products"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Customer Account Dropdown (Exclusively Customer Access) */}
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className={`p-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    user || profile
                      ? 'text-stone-950 bg-stone-100 hover:bg-stone-200'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                  title="Account"
                  aria-label="Account"
                >
                  <UserIcon className="w-5 h-5" />
                  {profile?.displayName && (
                    <span className="hidden md:inline text-xs font-semibold max-w-[80px] truncate">
                      {profile.displayName.split(' ')[0]}
                    </span>
                  )}
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 shadow-xl rounded-2xl p-2.5 z-50 animate-in fade-in">
                    {user || profile ? (
                      <div>
                        <div className="px-3 py-2.5 border-b border-stone-100 text-xs text-stone-600">
                          <span className="text-[11px] text-stone-400 block font-medium">Customer Account</span>
                          <strong className="text-stone-900 text-sm font-bold truncate block">
                            {profile?.displayName || user?.displayName || user?.email || 'Valued Shopper'}
                          </strong>
                          {profile?.phone && (
                            <span className="text-[11px] text-stone-500 block font-mono mt-0.5">
                              {profile.phone}
                            </span>
                          )}
                          <span className="text-[11px] text-stone-500 truncate block">
                            {profile?.email || user?.email}
                          </span>
                        </div>

                        {/* Customer Orders & Tracking */}
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onOpenCustomerAuth('orders' as any);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-stone-900 hover:bg-emerald-50 rounded-xl mt-1.5 flex items-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                          <span>My Orders &amp; Tracking</span>
                        </button>

                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onOpenCustomerAuth('track' as any);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5 text-sky-600" />
                          <span>Track 9-Digit Order #</span>
                        </button>

                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl mt-1 font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-xs font-semibold text-stone-900 border-b border-stone-100">
                          Customer Account
                        </div>

                        {/* Customer Login / Register */}
                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onOpenCustomerAuth('login');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-stone-900 hover:bg-stone-100 rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>Customer Sign In</span>
                        </button>

                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onOpenCustomerAuth('register');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          <span>Create Customer Account</span>
                        </button>

                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            onOpenCustomerAuth('track' as any);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-xl border-t border-stone-100 mt-1 flex items-center gap-2 cursor-pointer"
                        >
                          <Truck className="w-4 h-4 text-emerald-600" />
                          <span>Track Order (9-Digit)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center p-2.5 bg-stone-950 text-white rounded-xl hover:bg-stone-800 transition shadow-sm group cursor-pointer"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-stone-950 text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ONE-LINE CATEGORIES BAR (PC, ANDROID & TABLET IN ONE LINE) */}
        <div className="border-t border-stone-100 bg-stone-50/80 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-2 scroll-smooth text-xs whitespace-nowrap">
              <button
                type="button"
                onClick={() => onNavigate('shop', 'all')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 text-white font-bold shadow-2xs cursor-pointer hover:bg-emerald-800 transition shrink-0 text-[11px] sm:text-xs"
              >
                <span>All Departments</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onNavigate('shop', cat.id)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200/90 text-stone-700 hover:text-emerald-800 hover:border-emerald-400 font-semibold transition shrink-0 cursor-pointer shadow-2xs hover:bg-emerald-50/60 text-[11px] sm:text-xs"
                >
                  {cat.image && (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-4 h-4 rounded-full object-cover border border-stone-200"
                    />
                  )}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-5 py-6 space-y-4 shadow-xl">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('home');
                }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 text-stone-800"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('shop');
                }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 text-stone-800 font-semibold"
              >
                Shop All
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('shop', 'new-arrivals');
                }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 text-stone-800"
              >
                New Arrivals
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('shop', 'best-sellers');
                }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 text-stone-800"
              >
                Best Sellers
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('about');
                }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 text-stone-800"
              >
                About Us
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('contact');
                }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-stone-100 text-stone-800"
              >
                Contact
              </button>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                Customer Account
              </div>
              {user || profile ? (
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl text-xs">
                  <div>
                    <span className="font-bold text-stone-900 block">{profile?.displayName || user?.email}</span>
                    <span className="text-stone-500">{profile?.email || user?.email}</span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="text-red-600 font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCustomerAuth('login');
                    }}
                    className="py-2.5 bg-stone-950 text-white rounded-xl text-xs font-bold"
                  >
                    Customer Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCustomerAuth('register');
                    }}
                    className="py-2.5 border border-stone-300 text-stone-900 rounded-xl text-xs font-bold"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-100">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                Categories
              </div>
              <div className="grid grid-cols-1 gap-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCategoryClick(c.id)}
                    className="flex items-center justify-between text-sm py-2 px-3 rounded-lg hover:bg-stone-50 text-stone-800 cursor-pointer"
                  >
                    <span>{c.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
