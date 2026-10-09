import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Mail,
  Instagram,
  Facebook
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/atal-logo.jpg"
                alt="ATAL Logo"
                className="w-12 h-12 object-contain rounded-xl border border-stone-800 bg-white p-0.5 shadow-sm"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-black font-serif-display text-emerald-400 tracking-tight leading-none">
                  ATAL
                </span>
                <span className="text-[10px] text-stone-400 font-semibold tracking-wide mt-1">
                  Shop Smart. Live Better.
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
              ATAL – Shop Smart. Live Better. 🛍️ Your trusted online store for beauty, cosmetics, perfumes, fashion &amp; electronics—quality products, stylish choices, and easy shopping, all in one place.
            </p>
            <div className="pt-1">
              <a
                href="https://wa.me/923719150297"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-700/20 text-emerald-400 border border-emerald-600/40 hover:bg-emerald-700/30 text-xs font-semibold transition"
              >
                <span>💬 WhatsApp: 03719150297</span>
              </a>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/atal.pakistan?stkn=dXM2NTl0bHBzZ21n"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow ATAL on Instagram"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white transition text-stone-300 shadow-xs"
                title="Instagram: @atal.pakistan"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@atal.pakistan"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow ATAL on TikTok"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center hover:bg-stone-800 hover:text-cyan-400 transition text-stone-300 shadow-xs"
                title="TikTok: @atal.pakistan"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.02 3.28-1.54 3.32-3.35.01-4.94.01-9.87.01-14.81z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/1DgG52novy/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow ATAL on Facebook"
                className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition text-stone-300 shadow-xs"
                title="Facebook: ATAL"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Department Links */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-bold uppercase tracking-wider">
              Departments
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('shop', 'cat-fashion')} className="hover:text-white transition">
                  Fashion & Apparel
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'cat-electronics')} className="hover:text-white transition">
                  Audio & Electronics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'cat-home')} className="hover:text-white transition">
                  Home & Living
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'cat-accessories')} className="hover:text-white transition">
                  Accessories & Watches
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'cat-beauty')} className="hover:text-white transition">
                  Beauty & Skincare
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'cat-fitness')} className="hover:text-white transition">
                  Wellness & Fitness
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-bold uppercase tracking-wider">
              Customer Care
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition">
                  Brand Philosophy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition">
                  Concierge Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition">
                  Shipping Rates & Delivery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-stone-500 hover:text-stone-300 transition text-[11px] block pt-1">
                  Staff &amp; Admin Access
                </button>
              </li>
            </ul>
          </div>

          {/* Head Office Address / Notice */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-bold uppercase tracking-wider">
              Head Office
            </h4>
            <p className="text-stone-300 leading-relaxed font-medium">
              ATAL Store <br />
              Toba Tek Singh, Punjab, Pakistan
            </p>
            <div className="pt-2 text-stone-400 space-y-1">
              <div>WhatsApp: <a href="https://wa.me/923719150297" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-semibold hover:underline">03719150297</a></div>
              <div>Mon – Sat: 09:00 AM – 09:00 PM PKT</div>
              <div><a href="mailto:contact.to.atal@gmail.com" className="hover:text-white transition">contact.to.atal@gmail.com</a></div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} ATAL Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
