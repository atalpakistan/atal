import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowLeft,
  Lock,
  Smartphone,
  Banknote,
  Sparkles,
  ShoppingBag,
  Copy,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, getStoreSettings } from '../services/storeService';
import { CustomerShippingAddress, Order, PaymentMethod, StoreSettings } from '../types';
import { formatPrice } from '../utils/format';

interface CheckoutPageProps {
  onBackToShopping: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBackToShopping,
  onOrderSuccess
}) => {
  const { cart, subtotal, shipping, discount, total, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [formData, setFormData] = useState<CustomerShippingAddress>(() => ({
    fullName: profile?.displayName || user?.displayName || '',
    email: user?.email || profile?.email || '',
    phone: profile?.phone || '',
    country: 'Pakistan',
    city: '',
    address: '',
    postalCode: ''
  }));

  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  
  // Transaction ID state
  const [transactionId, setTransactionId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getStoreSettings().then(settings => setStoreSettings(settings));
  }, []);

  const jcNumber = storeSettings?.jazzcashNumber || '03227796097';
  const jcTitle = storeSettings?.jazzcashTitle || 'Omar Farooq';
  const epNumber = storeSettings?.easypaisaNumber || '03227796097';
  const epTitle = storeSettings?.easypaisaTitle || 'Omar Farooq';

  // Check if admin has enabled or disabled the advance shipping requirement for Cash on Delivery
  const isCodAdvanceRequired = storeSettings ? storeSettings.requireCodAdvanceShipping : true;

  // Advance shipping calculation
  const codAdvanceAmount = shipping > 0 ? shipping : (storeSettings?.shippingFee || 290);
  
  // Remaining cash due at doorstep
  const codRemainingDoorstep = paymentMethod === 'Cash on Delivery' 
    ? (isCodAdvanceRequired ? Math.max(0, total - (shipping > 0 ? shipping : 0)) : total)
    : 0;

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 3000);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-serif-display text-stone-900">Your bag is currently empty</h2>
        <p className="text-sm text-stone-600 mt-2">
          Please add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={onBackToShopping}
          className="mt-6 px-6 py-3 bg-stone-950 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition cursor-pointer"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation for shipping details
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.address.trim() || !formData.city.trim()) {
      setErrorMessage('Please complete all required recipient and shipping address fields.');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage('Please provide a valid contact phone number.');
      return;
    }

    const cleanTrx = transactionId.trim();

    // STRICT VALIDATION BASED ON PAYMENT METHOD & ADMIN SETTINGS:
    if (paymentMethod.toLowerCase().includes('jazzcash') || paymentMethod.toLowerCase().includes('easypaisa')) {
      const activeNum = paymentMethod.toLowerCase().includes('jazzcash') ? jcNumber : epNumber;
      if (!cleanTrx) {
        setErrorMessage(`Transaction ID is required! Please transfer ${formatPrice(total)} to ${activeNum} and enter your TID / Reference number below.`);
        return;
      }
      if (cleanTrx.length < 4) {
        setErrorMessage('Please enter a valid Transaction ID / Reference number (minimum 4 characters).');
        return;
      }
    } else if (paymentMethod === 'Cash on Delivery' && isCodAdvanceRequired) {
      if (!cleanTrx) {
        setErrorMessage(`Advance shipping fee is required for COD! Please transfer ${formatPrice(codAdvanceAmount)} to ${jcNumber} or ${epNumber} and enter your Transaction ID / Reference below.`);
        return;
      }
      if (cleanTrx.length < 4) {
        setErrorMessage('Please enter a valid Transaction ID / Reference number (minimum 4 characters).');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const orderItems = cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        brand: item.brand,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.thumbnail,
        color: item.selectedColor ? item.selectedColor.name : undefined,
        size: item.selectedSize ? item.selectedSize.name : undefined,
        variation: item.selectedVariation ? {
          type: item.selectedVariation.type,
          name: item.selectedVariation.name,
          value: item.selectedVariation.value
        } : (item.selectedColor ? {
          type: 'color',
          name: item.selectedColor.name,
          value: item.selectedColor.value
        } : undefined)
      }));

      const isAdvPaid = paymentMethod === 'Cash on Delivery' ? (isCodAdvanceRequired ? codAdvanceAmount : 0) : total;
      const isDueDoorstep = paymentMethod === 'Cash on Delivery' ? (isCodAdvanceRequired ? codRemainingDoorstep : total) : 0;

      const newOrder = await createOrder({
        customerId: user?.uid || profile?.uid || undefined,
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: formData,
        items: orderItems,
        subtotal,
        shipping,
        discount,
        total,
        advancePaidAmount: isAdvPaid,
        remainingDueAtDoorstep: isDueDoorstep,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
        orderStatus: 'Pending',
        transactionId: cleanTrx || undefined,
        advanceTransactionId: (paymentMethod === 'Cash on Delivery' && isCodAdvanceRequired) ? cleanTrx : undefined,
        notes: notes.trim() ? notes : undefined
      });

      // Fire confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (cErr) {
        console.log('Confetti effect handled', cErr);
      }

      clearCart();
      onOrderSuccess(newOrder);
    } catch (err: any) {
      console.error('Order placement failure:', err);
      setErrorMessage(err.message || 'Unable to place order. Please verify your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb / Progress */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200 mb-8">
        <div>
          <button
            onClick={onBackToShopping}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-black mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shopping</span>
          </button>
          <h1 className="text-3xl font-extrabold font-serif-display text-stone-950">
            Express Checkout
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          <Lock className="w-3.5 h-3.5" />
          <span>Encrypted Safe Checkout</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Delivery + Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Customer / Shipping Info */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-lg font-bold text-stone-950 font-serif-display">
                Shipping &amp; Recipient Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Full Recipient Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="eleanor@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Phone Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="03719150297 or 03001234567"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Delivery Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House #, Street name, Mohallah or Landmark"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Toba Tek Singh, Lahore, Karachi, etc."
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Postal / ZIP Code (Optional)
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="36050"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Delivery Notes / Gate Code (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Leave package with concierge or side porch..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector & Mandatory Transaction ID */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-lg font-bold text-stone-950 font-serif-display">
                Payment Method &amp; Transaction Verification
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {/* Cash On Delivery */}
              <label
                className={`relative flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-stone-950 bg-stone-50/80 shadow-sm ring-1 ring-stone-950'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="accent-stone-950 mt-1"
                />
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900 block">
                      Cash on Delivery (COD)
                    </span>
                    {isCodAdvanceRequired && (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                        Advance Shipping Required
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-600 mt-1 block leading-relaxed">
                    {isCodAdvanceRequired ? (
                      <>
                        Nationwide shipping fee of <strong>{formatPrice(codAdvanceAmount)}</strong> is paid in advance via JazzCash ({jcNumber}) or Easypaisa ({epNumber}) to confirm courier dispatch. The remaining balance of <strong>{formatPrice(codRemainingDoorstep)}</strong> is paid in cash at your doorstep upon delivery.
                      </>
                    ) : (
                      <>
                        Pay the full amount of <strong>{formatPrice(total)}</strong> in cash to the delivery rider at your doorstep anywhere across Pakistan.
                      </>
                    )}
                  </span>
                </div>
              </label>

              {/* JazzCash Option */}
              <label
                className={`relative flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition ${
                  paymentMethod === `Jazzcash ${jcNumber}`
                    ? 'border-red-600 bg-red-50/40 shadow-sm ring-1 ring-red-600'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === `Jazzcash ${jcNumber}`}
                  onChange={() => setPaymentMethod(`Jazzcash ${jcNumber}`)}
                  className="accent-red-600 mt-1"
                />
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                  JC
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">
                      JazzCash: <span className="text-red-600 font-extrabold tracking-wide">{jcNumber}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleCopyNumber(jcNumber);
                      }}
                      className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-[11px] font-semibold text-stone-700 flex items-center gap-1 transition cursor-pointer"
                      title="Copy Number"
                    >
                      {copiedNumber === jcNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNumber === jcNumber ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <span className="text-xs text-stone-500 mt-0.5 block">
                    Full pre-payment of <strong>{formatPrice(total)}</strong> to official JazzCash: <strong>{jcNumber}</strong> (Account Title: <strong>{jcTitle}</strong>).
                  </span>
                </div>
              </label>

              {/* Easypaisa Option */}
              <label
                className={`relative flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition ${
                  paymentMethod === `Easypaisa ${epNumber}`
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-600'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === `Easypaisa ${epNumber}`}
                  onChange={() => setPaymentMethod(`Easypaisa ${epNumber}`)}
                  className="accent-emerald-600 mt-1"
                />
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                  EP
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">
                      Easypaisa: <span className="text-emerald-700 font-extrabold tracking-wide">{epNumber}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleCopyNumber(epNumber);
                      }}
                      className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-[11px] font-semibold text-stone-700 flex items-center gap-1 transition cursor-pointer"
                      title="Copy Number"
                    >
                      {copiedNumber === epNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedNumber === epNumber ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <span className="text-xs text-stone-500 mt-0.5 block">
                    Full pre-payment of <strong>{formatPrice(total)}</strong> to official Easypaisa: <strong>{epNumber}</strong> (Account Title: <strong>{epTitle}</strong>).
                  </span>
                </div>
              </label>
            </div>

            {/* MANDATORY TRANSACTION ID INPUT BOX */}
            {(paymentMethod !== 'Cash on Delivery' || isCodAdvanceRequired) && (
              <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300/80 text-xs space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                  <Smartphone className="w-5 h-5 text-amber-800 shrink-0" />
                  <span>
                    {paymentMethod === 'Cash on Delivery'
                      ? `Advance Shipping Fee Transfer: ${formatPrice(codAdvanceAmount)}`
                      : `Full Order Payment Transfer: ${formatPrice(total)}`}
                  </span>
                </div>

                {paymentMethod === 'Cash on Delivery' ? (
                  <div className="space-y-2 text-stone-800">
                    <p className="leading-relaxed font-medium">
                      To confirm your Cash on Delivery order and reserve courier booking, please transfer the advance shipping fee of <strong className="text-stone-950 underline">{formatPrice(codAdvanceAmount)}</strong> to our official account:
                    </p>
                    
                    <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900 block">JazzCash / Easypaisa:</span>
                          <span className="font-mono text-sm font-bold text-stone-950">{jcNumber}</span>
                          <span className="text-[11px] text-stone-500 block">Title: {jcTitle}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber(jcNumber)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          {copiedNumber === jcNumber ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-600 italic">
                      The remaining balance of <strong>{formatPrice(codRemainingDoorstep)}</strong> will be paid in cash at your doorstep upon parcel arrival.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-stone-800">
                    {paymentMethod.toLowerCase().includes('jazzcash') ? (
                      <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                        <div>
                          <div className="font-mono text-sm font-bold text-stone-950">{jcNumber}</div>
                          <div className="text-[11px] text-stone-500">Account Title: <strong>{jcTitle}</strong></div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber(jcNumber)}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          {copiedNumber === jcNumber ? 'Copied' : 'Copy Number'}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between">
                        <div>
                          <div className="font-mono text-sm font-bold text-stone-950">{epNumber}</div>
                          <div className="text-[11px] text-stone-500">Account Title: <strong>{epTitle}</strong></div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber(epNumber)}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold text-xs cursor-pointer"
                        >
                          {copiedNumber === epNumber ? 'Copied' : 'Copy Number'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Input for Transaction ID / TID (MANDATORY) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-black uppercase tracking-wider text-stone-900 text-xs">
                      Transaction ID / Reference Number (Mandatory) *
                    </label>
                    <span className="text-[10px] text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded-full font-bold">
                      Required for Verification
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 1092834098 or TID / Sender Mobile Number"
                    className="w-full px-4 py-3 bg-white rounded-xl border-2 border-stone-900 text-sm font-bold text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                  />
                  <span className="text-[11px] text-stone-500 block mt-1.5">
                    Enter the confirmation TID / SMS Transaction ID received after sending payment.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Summary: Cart preview & place order (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-md space-y-6">
            <h3 className="text-lg font-bold font-serif-display text-stone-950 pb-4 border-b border-stone-200">
              Order Summary ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
            </h3>

            {/* List items */}
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img
                    src={item.thumbnail}
                    alt={item.productName}
                    className="w-14 h-14 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">
                      {item.productName}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-stone-600 my-0.5">
                      {item.selectedColor && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-stone-100 border border-stone-200">
                          <span className="w-2 h-2 rounded-full border border-stone-300" style={{ backgroundColor: item.selectedColor.value }} />
                          <span>{item.selectedColor.name}</span>
                        </span>
                      )}
                      {item.selectedSize && (
                        <span className="px-1.5 py-0.2 rounded bg-stone-100 border border-stone-200">
                          Size: {item.selectedSize.name}
                        </span>
                      )}
                      {!item.selectedColor && !item.selectedSize && item.selectedVariation && (
                        <span className="truncate">
                          {item.selectedVariation.name}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-stone-500">
                      Qty: <strong>{item.quantity}</strong> × {formatPrice(item.price)}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-stone-900">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-stone-200 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Merchandise Subtotal</span>
                <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promotional Savings</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Nationwide Delivery Fee</span>
                <span>{shipping === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(shipping)}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-stone-950 pt-3 border-t border-stone-200">
                <span>Total Order Value</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Breakdown if Cash on Delivery */}
              {paymentMethod === 'Cash on Delivery' && isCodAdvanceRequired && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5 mt-2">
                  <div className="flex justify-between font-bold text-amber-950">
                    <span>Advance Shipping Paid:</span>
                    <span>{formatPrice(codAdvanceAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 border-t border-stone-200 pt-1">
                    <span>Payable at Doorstep (Cash):</span>
                    <span className="text-emerald-700">{formatPrice(codRemainingDoorstep)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-stone-950 text-white font-extrabold text-sm hover:bg-stone-800 disabled:bg-stone-400 transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Verifying &amp; Placing Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>
                    Confirm &amp; Place Order • {formatPrice(total)}
                  </span>
                </>
              )}
            </button>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-600 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Full buyer protection &amp; 100% genuine products guarantee</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
