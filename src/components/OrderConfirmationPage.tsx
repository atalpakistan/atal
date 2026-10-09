import React from 'react';
import { CheckCircle2, Package, ArrowRight, Printer, Sparkles, Smartphone, Banknote, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { formatPrice } from '../utils/format';

interface OrderConfirmationPageProps {
  order: Order;
  onContinueShopping: () => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onContinueShopping
}) => {
  const isCOD = order.paymentMethod === 'Cash on Delivery';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-xl text-center space-y-8">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm animate-in zoom-in duration-300">
          <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Order Successfully Placed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-display text-stone-950">
            Thank you, {order.customerName}!
          </h1>
          <p className="mt-2 text-sm text-stone-600 max-w-md mx-auto">
            We have registered your order. A confirmation email has been dispatched to{' '}
            <strong className="text-stone-900">{order.email}</strong>.
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className="bg-stone-50 rounded-2xl p-6 text-left border border-stone-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-stone-200 gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Unique 9-Digit Order Number
              </div>
              <div className="text-xl font-mono font-black text-stone-950 flex items-center gap-2 mt-0.5">
                <span>#{order.orderNumber}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-sans font-bold">
                  Trackable
                </span>
              </div>
              <span className="text-[11px] text-stone-500">Use this 9-digit number to track live delivery progress.</span>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                Live Status
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 mt-0.5">
                {order.orderStatus}
              </span>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                Payment Method
              </div>
              <div className="text-xs font-semibold text-stone-900">
                {order.paymentMethod}
              </div>
              {order.transactionId && (
                <div className="text-[10px] text-stone-600 font-mono mt-0.5 font-bold">
                  Verified TID: {order.transactionId}
                </div>
              )}
            </div>
          </div>

          {/* Payment & Settlement Summary */}
          {isCOD && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <Banknote className="w-4 h-4 text-amber-800" />
                <span>Cash on Delivery Settlement Breakdown</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Advance Shipping Paid (TID: {order.transactionId}):</span>
                <span className="font-bold text-emerald-800">
                  {formatPrice(order.advancePaidAmount || order.shipping || 290)} (Verified)
                </span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold border-t border-amber-200/80 pt-1">
                <span>Payable to Rider at Doorstep (Cash):</span>
                <span className="text-base text-stone-950 font-black">
                  {formatPrice(order.remainingDueAtDoorstep || Math.max(0, order.total - (order.shipping || 290)))}
                </span>
              </div>
            </div>
          )}

          {/* Items Summary */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Purchased Items
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-3">
                  <img
                    src={item.thumbnail}
                    alt={item.productName}
                    className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                  />
                  <div>
                    <span className="font-semibold text-stone-900">{item.productName}</span>
                    {item.variation && (
                      <span className="text-stone-600 block text-[11px]">
                        ({item.variation.name})
                      </span>
                    )}
                  </div>
                </div>
                <div className="font-bold text-stone-900">
                  {item.quantity} × {formatPrice(item.price)} = {formatPrice(item.quantity * item.price)}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Destination */}
          <div className="pt-4 border-t border-stone-200 text-xs text-stone-600">
            <span className="font-bold text-stone-900 block mb-1">Shipping Destination:</span>
            <p>
              {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            <p className="mt-1">Phone: {order.phone}</p>
          </div>

          {/* Grand Total */}
          <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
            <span className="text-sm font-bold text-stone-900">Total Order Value</span>
            <span className="text-xl font-extrabold text-stone-950">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-stone-300 text-stone-800 text-xs font-bold hover:bg-stone-50 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <button
            onClick={onContinueShopping}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-stone-950 text-white text-xs font-bold hover:bg-stone-800 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
