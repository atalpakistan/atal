import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
  ArrowLeft,
  ShoppingBag,
  Truck,
  Package,
  Clock,
  Search,
  MapPin,
  Calendar,
  LogOut,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrders, trackOrderByNumberOrContact } from '../services/storeService';
import { Order, OrderStatus } from '../types';
import { formatPrice } from '../utils/format';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'track' | 'orders';
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login'
}) => {
  const { user, profile, loginCustomer, registerCustomer, sendPasswordReset, logout } = useAuth();
  
  // Modal active view mode
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'track' | 'orders'>(
    user || profile ? 'orders' : defaultMode
  );

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email or Phone for login
  const [showPassword, setShowPassword] = useState(false);

  // Order tracking states
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<Order | null>(null);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingResults, setTrackingResults] = useState<Order[] | null>(null);
  const [isSearchingTracking, setIsSearchingTracking] = useState(false);
  const [copiedOrderNum, setCopiedOrderNum] = useState<string | null>(null);

  const handleCopyTrackNumber = (orderNum: string) => {
    navigator.clipboard?.writeText(orderNum);
    setCopiedOrderNum(orderNum);
    setTimeout(() => setCopiedOrderNum(null), 2500);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Update mode and reload orders when user logs in / out or modal opens
  useEffect(() => {
    if (user || profile) {
      if (mode === 'login' || mode === 'register') {
        setMode('orders');
      }
      if (isOpen) {
        loadCustomerOrders();
      }
    }
  }, [user, profile, isOpen]);

  const loadCustomerOrders = async () => {
    setLoadingOrders(true);
    try {
      const uEmail = profile?.email || user?.email || undefined;
      const uPhone = profile?.phone || undefined;
      const uId = user?.uid || profile?.uid || undefined;
      const res = await getOrders(uId, uEmail, uPhone);
      setCustomerOrders(res);
      setSelectedTrackOrder(prev => {
        if (!prev && res.length > 0) return res[0];
        if (prev) {
          const matching = res.find(o => o.id === prev.id || o.orderNumber === prev.orderNumber);
          return matching || prev;
        }
        return null;
      });
    } catch (err) {
      console.warn('Load customer orders error:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!phone.trim()) {
      setError('Please provide a valid Pakistani mobile number (e.g. 03001234567).');
      return;
    }

    setLoading(true);
    try {
      await registerCustomer(email, phone, password, name);
      setSuccessMsg('Account created successfully! Welcome to ATAL.');
      setTimeout(() => {
        setMode('orders');
        loadCustomerOrders();
      }, 1000);
    } catch (err: any) {
      console.warn('Registration error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(err.message || 'Failed to create account. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginCustomer(identifier, password);
      setSuccessMsg('Welcome back! Signed in successfully.');
      setTimeout(() => {
        setMode('orders');
        loadCustomerOrders();
      }, 800);
    } catch (err: any) {
      console.warn('Customer login error:', err);
      setError(err.message || 'Invalid email/phone number or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setSuccessMsg(`Password reset link dispatched to ${email}. Please check your inbox.`);
    } catch (err: any) {
      console.warn('Password reset error:', err);
      setSuccessMsg(`If an account exists for ${email}, a password reset link has been dispatched.`);
    } finally {
      setLoading(false);
    }
  };

  // Direct 9-digit order search handler
  const handleSearchTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingQuery.trim()) return;

    setIsSearchingTracking(true);
    setError(null);
    try {
      const results = await trackOrderByNumberOrContact(trackingQuery);
      setTrackingResults(results);
      if (results.length > 0) {
        setSelectedTrackOrder(results[0]);
      } else {
        setError(`No orders found matching "${trackingQuery}". Please check your 9-digit order number or contact phone.`);
      }
    } catch (err) {
      setError('Unable to fetch tracking data at this time. Please try again.');
    } finally {
      setIsSearchingTracking(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Delivered</span>;
      case 'Shipped':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">Shipped (In Transit)</span>;
      case 'Processing':
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Confirmed &amp; Packing</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-300">Order Placed (Pending)</span>;
    }
  };

  const getTimelineStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Confirmed':
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in overflow-y-auto">
      <div className={`bg-white rounded-3xl w-full ${mode === 'orders' || mode === 'track' ? 'max-w-3xl' : 'max-w-md'} p-5 sm:p-8 space-y-5 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto`}>
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            {mode !== 'login' && mode !== 'orders' && (
              <button
                type="button"
                onClick={() => { setError(null); setMode(user || profile ? 'orders' : 'login'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-stone-950 text-white flex items-center justify-center font-serif-display font-black text-xs">
                A
              </div>
              <span className="font-bold text-sm font-serif-display text-stone-900">
                {user || profile ? 'Customer Portal & Order Tracking' : 'ATAL Customer Account'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(user || profile) && (
              <button
                onClick={() => {
                  logout();
                  setMode('login');
                  setCustomerOrders([]);
                  setSelectedTrackOrder(null);
                }}
                className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Sign out of customer account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher for Quick Navigation */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl text-xs font-bold">
          {(user || profile) ? (
            <>
              <button
                type="button"
                onClick={() => { setMode('orders'); setError(null); }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'orders' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>My Orders ({customerOrders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('track'); setError(null); }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'track' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Track Any 9-Digit Order</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                  mode === 'login' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                  mode === 'register' ? 'bg-white text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Create Account
              </button>

              <button
                type="button"
                onClick={() => { setMode('track'); setError(null); }}
                className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 text-emerald-800 ${
                  mode === 'track' ? 'bg-white text-stone-950 shadow-xs' : 'hover:text-stone-950'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </button>
            </>
          )}
        </div>

        {/* Status Notifications */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN MODE */}
        {mode === 'login' && !user && !profile && (
          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            <div className="text-center space-y-1 pb-1">
              <h3 className="text-xl font-bold font-serif-display text-stone-950">
                Customer Sign In
              </h3>
              <p className="text-xs text-stone-500">
                Access your order history, live shipment tracking and exclusive member savings.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Email or Phone Number *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="customer@example.com or 03001234567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-stone-500 hover:text-stone-900 font-medium cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-stone-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 transition cursor-pointer shadow-md"
            >
              {loading ? 'Signing In...' : 'Sign In to Account'}
            </button>
          </form>
        )}

        {/* 2. REGISTER MODE */}
        {mode === 'register' && !user && !profile && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs pt-1">
            <div className="text-center space-y-1 pb-1">
              <h3 className="text-xl font-bold font-serif-display text-stone-950">
                Create Customer Account
              </h3>
              <p className="text-xs text-stone-500">
                Register to track all orders in real-time across Pakistan.
              </p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ahmad Raza"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmad@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Mobile Phone (WhatsApp) *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567 or 03719150297"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Password (Min 6 chars) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full pl-9 pr-9 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-stone-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 transition cursor-pointer shadow-md"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4 pt-1">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold font-serif-display text-stone-950">Reset Password</h3>
              <p className="text-xs text-stone-500">Enter your registered email to receive reset instructions.</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-stone-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Sending...' : 'Send Password Reset Link'}</span>
            </button>
          </form>
        )}

        {/* 4. CUSTOMER LOGGED IN ORDERS & LIVE TRACKING */}
        {mode === 'orders' && (user || profile) && (
          <div className="space-y-5">
            {/* Customer Welcome Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-stone-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">
                  Customer Portal &bull; Verified Member
                </span>
                <h4 className="text-base font-bold font-serif-display text-stone-950">
                  {profile?.displayName || user?.displayName || 'Customer'}
                </h4>
                <p className="text-xs text-stone-600">
                  {profile?.email || user?.email} {profile?.phone && `• ${profile.phone}`}
                </p>
              </div>

              <button
                type="button"
                onClick={loadCustomerOrders}
                disabled={loadingOrders}
                className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 transition flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                <span>Refresh Orders</span>
              </button>
            </div>

            {loadingOrders ? (
              <div className="py-12 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-stone-400" />
                <span>Loading your order status...</span>
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="py-12 text-center p-6 border-2 border-dashed border-stone-200 rounded-2xl space-y-3">
                <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="text-sm font-bold text-stone-900">No Orders Found Yet</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  When you place orders on ATAL, each order with its unique 9-digit tracking number will appear here for live status updates.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-stone-950 text-white rounded-xl font-bold text-xs hover:bg-stone-800 transition cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Orders List Column */}
                <div className="lg:col-span-5 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                    Your Placed Orders ({customerOrders.length})
                  </span>

                  {customerOrders.map((ord) => {
                    const isSelected = selectedTrackOrder?.id === ord.id;
                    return (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => setSelectedTrackOrder(ord)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200 shadow-sm'
                            : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs text-stone-950">
                              #{ord.orderNumber}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                              9-Digit
                            </span>
                          </div>
                          {getStatusBadge(ord.orderStatus)}
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                          <span>{new Date(ord.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="font-black text-stone-900">{formatPrice(ord.total)}</span>
                        </div>

                        <div className="mt-1 text-[11px] text-stone-500 truncate">
                          {ord.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Order Detailed Tracking View */}
                {selectedTrackOrder && (
                  <div className="lg:col-span-7 bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between border-b border-stone-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-stone-400 uppercase">Tracking Order</span>
                          <span className="font-mono font-black text-sm text-stone-950 px-2 py-0.5 bg-white border border-stone-300 rounded-md">
                            #{selectedTrackOrder.orderNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyTrackNumber(selectedTrackOrder.orderNumber)}
                            className="p-1 hover:bg-stone-200 rounded text-stone-500 hover:text-stone-900 transition cursor-pointer flex items-center gap-1 text-[11px] font-sans font-bold bg-white px-2 py-0.5 border border-stone-200"
                            title="Copy 9-digit tracking number"
                          >
                            {copiedOrderNum === selectedTrackOrder.orderNumber ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy 9-Digit</span>
                              </>
                            )}
                          </button>
                        </div>
                        <span className="text-[11px] text-stone-500 mt-1 block">
                          Placed on {new Date(selectedTrackOrder.createdAt).toLocaleDateString()} at {new Date(selectedTrackOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {getStatusBadge(selectedTrackOrder.orderStatus)}
                    </div>

                    {/* LIVE 4-STEP VISUAL PROGRESS TRACKER */}
                    <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                        Live Shipment Progress
                      </span>

                      {selectedTrackOrder.orderStatus === 'Cancelled' ? (
                        <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>This order was cancelled. Please contact support if you have questions.</span>
                        </div>
                      ) : (
                        <div className="pt-2 pb-1">
                          <div className="grid grid-cols-4 gap-1 relative">
                            {['Placed', 'Confirmed', 'Shipped', 'Delivered'].map((stepName, stepIdx) => {
                              const activeIdx = getTimelineStepIndex(selectedTrackOrder.orderStatus);
                              const isComplete = activeIdx >= stepIdx;
                              const isCurrent = activeIdx === stepIdx;

                              return (
                                <div key={stepName} className="flex flex-col items-center text-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                    isComplete
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-stone-200 text-stone-500'
                                  } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}>
                                    {isComplete ? <Check className="w-3.5 h-3.5" /> : stepIdx + 1}
                                  </div>
                                  <span className={`text-[10px] mt-1 font-bold ${
                                    isCurrent ? 'text-emerald-800 font-extrabold' : isComplete ? 'text-stone-800' : 'text-stone-400'
                                  }`}>
                                    {stepName}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recipient & Payment Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Destination</span>
                        <div className="font-bold text-stone-900">{selectedTrackOrder.customerName}</div>
                        <div className="text-stone-600 text-[11px] leading-tight">
                          {selectedTrackOrder.shippingAddress.address}, {selectedTrackOrder.shippingAddress.city}
                        </div>
                        <div className="text-stone-500 font-mono text-[10px]">{selectedTrackOrder.phone}</div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Payment Summary</span>
                        <div className="font-semibold text-stone-800 text-[11px]">{selectedTrackOrder.paymentMethod}</div>
                        <div className="flex justify-between items-center pt-0.5">
                          <span className="text-stone-500">Order Total:</span>
                          <strong className="font-bold text-stone-950">{formatPrice(selectedTrackOrder.total)}</strong>
                        </div>
                        {selectedTrackOrder.transactionId && (
                          <div className="text-[10px] text-stone-500 font-mono truncate">
                            TID: {selectedTrackOrder.transactionId}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-2 text-xs">
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">Package Items</span>
                      <div className="space-y-2 max-h-36 overflow-y-auto divide-y divide-stone-100">
                        {selectedTrackOrder.items.map((it, idx) => (
                          <div key={idx} className="pt-1.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {it.thumbnail && (
                                <img src={it.thumbnail} alt={it.productName} className="w-8 h-8 rounded-lg object-cover border" />
                              )}
                              <div>
                                <span className="font-semibold text-stone-900 block line-clamp-1">{it.productName}</span>
                                <span className="text-[10px] text-stone-500">Qty: {it.quantity} {it.variation ? `• ${it.variation.name}` : ''}</span>
                              </div>
                            </div>
                            <span className="font-bold text-stone-950">{formatPrice(it.price * it.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. DIRECT 9-DIGIT ORDER TRACKING SEARCH (For Guests & Customers) */}
        {mode === 'track' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-serif-display text-stone-950">
                Track Any 9-Digit Order
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Enter your unique 9-digit order number (e.g. <strong>849201948</strong>) or recipient phone number to track package dispatch and delivery progress live.
              </p>
            </div>

            {/* Tracking Search Input */}
            <form onSubmit={handleSearchTracking} className="flex gap-2 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={trackingQuery}
                  onChange={(e) => setTrackingQuery(e.target.value)}
                  placeholder="Enter 9-digit Order # or Phone..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingTracking}
                className="px-5 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isSearchingTracking ? 'Searching...' : 'Track Package'}</span>
              </button>
            </form>

            {/* Tracking Results Card */}
            {trackingResults && trackingResults.length > 0 && selectedTrackOrder && (
              <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-400 uppercase">Found Order</span>
                      <span className="font-mono font-black text-sm text-stone-950 px-2 py-0.5 bg-white border border-stone-300 rounded-md">
                        #{selectedTrackOrder.orderNumber}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 mt-0.5 block">
                      Recipient: {selectedTrackOrder.customerName} &bull; {selectedTrackOrder.shippingAddress.city}
                    </span>
                  </div>
                  {getStatusBadge(selectedTrackOrder.orderStatus)}
                </div>

                {/* 4-Step Timeline */}
                <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Shipment Timeline
                  </span>

                  {selectedTrackOrder.orderStatus === 'Cancelled' ? (
                    <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>This order was cancelled. Please contact customer support.</span>
                    </div>
                  ) : (
                    <div className="pt-2 pb-1">
                      <div className="grid grid-cols-4 gap-1 relative">
                        {['Placed', 'Confirmed', 'Shipped', 'Delivered'].map((stepName, stepIdx) => {
                          const activeIdx = getTimelineStepIndex(selectedTrackOrder.orderStatus);
                          const isComplete = activeIdx >= stepIdx;
                          const isCurrent = activeIdx === stepIdx;

                          return (
                            <div key={stepName} className="flex flex-col items-center text-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                isComplete
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-stone-200 text-stone-500'
                              } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}>
                                {isComplete ? <Check className="w-3.5 h-3.5" /> : stepIdx + 1}
                              </div>
                              <span className={`text-[10px] mt-1 font-bold ${
                                isCurrent ? 'text-emerald-800 font-extrabold' : isComplete ? 'text-stone-800' : 'text-stone-400'
                              }`}>
                                {stepName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items & Pricing */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold text-stone-900 border-b pb-1.5">
                    <span>Order Total ({selectedTrackOrder.items.length} items):</span>
                    <span className="text-sm font-black text-stone-950">{formatPrice(selectedTrackOrder.total)}</span>
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Payment Method: <strong>{selectedTrackOrder.paymentMethod}</strong> ({selectedTrackOrder.paymentStatus})
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
