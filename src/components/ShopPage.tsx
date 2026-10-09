import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  X,
  Search as SearchIcon,
  ChevronDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Category, Product } from '../types';
import { ProductCard } from './ProductCard';
import { formatPrice } from '../utils/format';

interface ShopPageProps {
  categories: Category[];
  initialCategory?: string;
  onSelectProduct: (product: Product) => void;
  allProducts: Product[];
}

export const ShopPage: React.FC<ShopPageProps> = ({
  categories,
  initialCategory = 'all',
  onSelectProduct,
  allProducts
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available subcategories based on current selected category
  const activeCategoryObj = useMemo(() => {
    return categories.find(c => c.id === selectedCategory);
  }, [categories, selectedCategory]);

  const availableSubcategories = activeCategoryObj?.subcategories || [];

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && selectedCategory !== 'new-arrivals' && selectedCategory !== 'best-sellers') {
        if (product.categoryId !== selectedCategory) return false;
      }
      if (selectedCategory === 'new-arrivals' && !product.newArrival) return false;
      if (selectedCategory === 'best-sellers' && !product.bestSeller) return false;

      // Subcategory filter
      if (selectedSubcategory !== 'all' && product.subcategoryId !== selectedSubcategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchBrand = product.brand.toLowerCase().includes(query);
        const matchSku = product.sku.toLowerCase().includes(query);
        const matchCategory = product.categoryName?.toLowerCase().includes(query);
        const matchTags = product.tags?.some((t) => t.toLowerCase().includes(query));

        if (!matchName && !matchBrand && !matchSku && !matchCategory && !matchTags) {
          return false;
        }
      }

      // Price range
      const price = product.price;
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      // Stock status
      if (inStockOnly && product.stock <= 0) {
        return false;
      }

      // Color filter
      if (selectedColor !== 'all') {
        const hasColor = product.variations?.some(
          v => v.type === 'color' && (v.name.toLowerCase().includes(selectedColor.toLowerCase()) || v.value.toLowerCase().includes(selectedColor.toLowerCase()))
        );
        if (!hasColor) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
  }, [allProducts, selectedCategory, selectedSubcategory, searchQuery, priceRange, inStockOnly, selectedColor, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSearchQuery('');
    setPriceRange([0, 100000]);
    setInStockOnly(false);
    setSelectedColor('all');
    setSortBy('featured');
  };

  const commonColors = [
    { label: 'Black', value: 'black', hex: '#18181b' },
    { label: 'White / Cream', value: 'white', hex: '#f4f4f5' },
    { label: 'Silver / Slate', value: 'silver', hex: '#94a3b8' },
    { label: 'Brown / Earth', value: 'brown', hex: '#78350f' },
    { label: 'Green / Olive', value: 'green', hex: '#15803d' },
    { label: 'Sand / Dune', value: 'sand', hex: '#d6c7b2' }
  ];

  return (
    <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif-display text-stone-950">
          {selectedCategory === 'all'
            ? 'Complete Collection'
            : selectedCategory === 'new-arrivals'
            ? 'New Arrivals'
            : selectedCategory === 'best-sellers'
            ? 'Best Sellers'
            : activeCategoryObj?.name || 'Department Collection'}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-2xl">
          {activeCategoryObj?.description ||
            'Your trusted online store for beauty, cosmetics, perfumes, fashion & electronics—quality products, stylish choices, and easy shopping, all in one place.'}
        </p>
      </div>

      {/* Main Filter & Sort Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-stone-200">
        {/* Search inside shop */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product, brand, tag or SKU..."
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-600 hover:text-stone-900"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Category Chips (Desktop & Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSubcategory('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-stone-950 text-white'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            All Products ({allProducts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedSubcategory('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-950 text-white'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filter Trigger and Sort */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm font-semibold text-stone-800 shadow-2xs cursor-pointer hover:bg-stone-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-600">
            <span className="hidden sm:inline">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products by"
                className="appearance-none bg-white border border-stone-200 text-stone-900 font-medium text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 pr-7 sm:pr-8 focus:outline-none focus:ring-2 focus:ring-stone-900 cursor-pointer shadow-2xs"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rating</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-600 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories Bar if active */}
      {availableSubcategories.length > 0 && (
        <div className="flex items-center gap-2 py-3 overflow-x-auto border-b border-stone-100">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap">
            Subcategories:
          </span>
          <button
            onClick={() => setSelectedSubcategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedSubcategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {availableSubcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedSubcategory === sub
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Active filter tags */}
      <div className="flex flex-wrap items-center gap-2 pt-4 mb-4">
        <span className="text-xs text-stone-600 font-medium">
          Showing <strong>{filteredProducts.length}</strong> products
        </span>

        {selectedCategory !== 'all' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-[11px] font-medium text-stone-800">
            {activeCategoryObj?.name || selectedCategory}
            <button onClick={() => setSelectedCategory('all')} className="cursor-pointer">
              <X className="w-3 h-3 hover:text-red-500" />
            </button>
          </span>
        )}

        {selectedSubcategory !== 'all' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-[11px] font-medium text-stone-800">
            Subcategory: {selectedSubcategory}
            <button onClick={() => setSelectedSubcategory('all')} className="cursor-pointer">
              <X className="w-3 h-3 hover:text-red-500" />
            </button>
          </span>
        )}

        {selectedColor !== 'all' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-[11px] font-medium text-stone-800">
            Color: {selectedColor}
            <button onClick={() => setSelectedColor('all')} className="cursor-pointer">
              <X className="w-3 h-3 hover:text-red-500" />
            </button>
          </span>
        )}

        {inStockOnly && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-[11px] font-medium text-stone-800">
            In Stock Only
            <button onClick={() => setInStockOnly(false)} className="cursor-pointer">
              <X className="w-3 h-3 hover:text-red-500" />
            </button>
          </span>
        )}

        {(selectedCategory !== 'all' || selectedSubcategory !== 'all' || selectedColor !== 'all' || inStockOnly || searchQuery) && (
          <button
            onClick={resetFilters}
            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* EXACT USER SPECIFIED GRID LAYOUT:
          - Mobile mode: 2 products in row (grid-cols-2)
          - Tablet mode: 3 products in row (md:grid-cols-3)
          - PC / Desktop mode: 6 products in row (xl:grid-cols-6)
      */}
      {filteredProducts.length > 0 ? (
        <main className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 pt-2">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </main>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center max-w-lg mx-auto mt-6 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No Products Matched</h3>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            We couldn't find any items matching your selected criteria. Try adjusting your filters or price range.
          </p>
          <button
            onClick={resetFilters}
            className="mt-6 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Slide-over Filter Drawer (Desktop & Mobile accessible) */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs">
          <div className="ml-auto w-full max-w-sm bg-white h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                  <span className="text-base font-bold text-stone-900 font-serif-display">Filter Catalog</span>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-stone-500 hover:text-black hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Department */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Department
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubcategory('all');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-stone-950 text-white'
                        : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    All ({allProducts.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory('all');
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left truncate transition cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-stone-950 text-white'
                          : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Price Budget: {formatPrice(priceRange[1])}
                </h4>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-stone-950"
                />
                <div className="flex justify-between text-[11px] text-stone-500 mt-1">
                  <span>PKR 0</span>
                  <span>PKR 100,000+</span>
                </div>
              </div>

              {/* Color Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Color Shade
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedColor('all')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left cursor-pointer ${
                      selectedColor === 'all'
                        ? 'border-stone-950 bg-stone-50 font-bold'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    All Colors
                  </button>
                  {commonColors.map((col) => (
                    <button
                      key={col.value}
                      onClick={() => setSelectedColor(col.value)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                        selectedColor === col.value
                          ? 'border-stone-950 bg-stone-50 font-bold text-stone-950'
                          : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-stone-300 flex-shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="truncate">{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock toggle */}
              <div className="pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-stone-950 focus:ring-stone-950 accent-stone-950 cursor-pointer"
                  />
                  <span>Show In-Stock Items Only</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-200 space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-stone-950 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition cursor-pointer"
              >
                Apply &amp; View Results ({filteredProducts.length})
              </button>
              <button
                onClick={resetFilters}
                className="w-full py-2.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-medium hover:bg-stone-200 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
