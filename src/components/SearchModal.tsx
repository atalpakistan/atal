import React, { useState } from 'react';
import { Search, X, ArrowRight, Star, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/format';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const results = searchTerm.trim()
    ? products.filter(p => {
        const q = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
        
        {/* Top Action Bar with Back & Close */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition cursor-pointer"
            title="Back to store"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Catalog Search
          </span>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
            title="Close Search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audio, apparel, home decor, wellness, SKU, or tags..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick suggestions */}
        {!searchTerm && (
          <div className="pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Popular Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {['Smart Watch', 'Wireless Headphones', 'Silk Shirt', 'Leather Shoes', 'Linen', 'Minimalist Lamp'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs text-stone-700 transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {searchTerm && (
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-stone-500">
              {results.length > 0 ? `Found ${results.length} results:` : 'No matching products found.'}
            </div>

            <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                    />
                    <div>
                      <div className="text-sm font-semibold text-stone-900 group-hover:text-amber-600 transition">
                        {p.name}
                      </div>
                      <div className="text-xs text-stone-500">
                        {p.brand} • <span className="font-bold text-stone-900">{formatPrice(p.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 group-hover:text-stone-900 transition">
                    <span>View</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
