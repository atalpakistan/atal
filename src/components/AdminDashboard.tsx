import React, { useState, useEffect } from 'react';
import {
  Package,
  FolderTree,
  ShoppingBag,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Eye,
  LogOut,
  Layers,
  Sparkles,
  Search,
  Filter,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash,
  Banknote,
  Smartphone,
  Settings,
  ToggleLeft,
  ToggleRight,
  KeyRound,
  ShieldCheck,
  Mail,
  Phone,
  Tag,
  Percent,
  RotateCcw,
  Copy,
  Truck
} from 'lucide-react';
import { Product, Category, Order, OrderStatus, PaymentStatus, ProductVariation, StoreSettings, CarouselSlide, SpotlightBanner } from '../types';
import {
  saveProduct,
  deleteProduct,
  toggleProductActive,
  saveCategory,
  deleteCategory,
  toggleCategoryActive,
  updateOrderStatus,
  getStoreSettings,
  updateStoreSettings,
  DEFAULT_STORE_SETTINGS,
  saveCarouselSlide,
  deleteCarouselSlide,
  resetCarouselSlidesToDefault,
  getSpotlightBanner,
  updateSpotlightBanner,
  DEFAULT_SPOTLIGHT_BANNER
} from '../services/storeService';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import { processImageFile, getImageFormatInfo } from '../utils/imageUpload';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  carouselSlides?: CarouselSlide[];
  spotlightBanner?: SpotlightBanner;
  onRefreshData: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  orders,
  carouselSlides = [],
  spotlightBanner: initialSpotlight,
  onRefreshData,
  onExitAdmin
}) => {
  const { logout, isDemoAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'carousel' | 'settings'>('products');

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard?.writeText(orderNumber);
    setCopiedOrderId(orderNumber);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const [carouselModalOpen, setCarouselModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<CarouselSlide> | null>(null);
  const [isSavingSlide, setIsSavingSlide] = useState(false);
  const [slideMessage, setSlideMessage] = useState<string | null>(null);

  // Spotlight Banner State
  const [spotlightBanner, setSpotlightBanner] = useState<SpotlightBanner>(initialSpotlight || DEFAULT_SPOTLIGHT_BANNER);
  const [spotlightModalOpen, setSpotlightModalOpen] = useState(false);
  const [editingSpotlight, setEditingSpotlight] = useState<Partial<SpotlightBanner> | null>(null);
  const [isSavingSpotlight, setIsSavingSpotlight] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Store Settings (Admin password, merchant accounts & COD settings)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [settingsFormData, setSettingsFormData] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);
  const [settingsErrorMsg, setSettingsErrorMsg] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (initialSpotlight) {
      setSpotlightBanner(initialSpotlight);
    }
  }, [initialSpotlight]);

  useEffect(() => {
    getStoreSettings().then(res => {
      if (res) {
        setStoreSettings(res);
        setSettingsFormData(res);
      }
    });
    getSpotlightBanner().then(res => {
      if (res) {
        setSpotlightBanner(res);
      }
    });
  }, []);

  const handleToggleCodAdvanceShipping = async () => {
    const newVal = !storeSettings.requireCodAdvanceShipping;
    const updated = await updateStoreSettings({ requireCodAdvanceShipping: newVal });
    setStoreSettings(updated);
    setSettingsFormData(prev => ({ ...prev, requireCodAdvanceShipping: newVal }));
    setSettingsSavedMsg('Advance shipping fee requirement updated successfully.');
    setTimeout(() => setSettingsSavedMsg(null), 3500);
  };

  const handleTogglePromoCodes = async () => {
    const newVal = storeSettings.promoCodesEnabled === false ? true : false;
    const updated = await updateStoreSettings({ promoCodesEnabled: newVal });
    setStoreSettings(updated);
    setSettingsFormData(prev => ({ ...prev, promoCodesEnabled: newVal }));
    setSettingsSavedMsg(newVal ? 'Promotional discount codes are now ENABLED (ON) for customers.' : 'Promotional discount codes are now DISABLED (OFF) on store checkout.');
    setTimeout(() => setSettingsSavedMsg(null), 3500);
  };

  const handleSaveMerchantSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedMsg(null);
    setSettingsErrorMsg(null);

    // If changing password, validate match
    if (newAdminPassword.trim().length > 0) {
      if (newAdminPassword.trim().length < 6) {
        setSettingsErrorMsg('Admin password must be at least 6 characters long.');
        return;
      }
      if (newAdminPassword !== confirmAdminPassword) {
        setSettingsErrorMsg('New passwords do not match. Please re-enter.');
        return;
      }
    }

    try {
      setIsSavingSettings(true);
      const payload: Partial<StoreSettings> = {
        jazzcashNumber: settingsFormData.jazzcashNumber.trim(),
        jazzcashTitle: settingsFormData.jazzcashTitle.trim(),
        easypaisaNumber: settingsFormData.easypaisaNumber.trim(),
        easypaisaTitle: settingsFormData.easypaisaTitle.trim(),
        contactEmail: settingsFormData.contactEmail.trim(),
        contactPhone: settingsFormData.contactPhone.trim(),
      };

      if (newAdminPassword.trim().length > 0) {
        payload.customAdminPassword = newAdminPassword.trim();
        payload.secondaryAdminPassword = newAdminPassword.trim();
        localStorage.setItem('atal_custom_admin_password_v1', newAdminPassword.trim());
      }

      const updated = await updateStoreSettings(payload);
      setStoreSettings(updated);
      setSettingsFormData(updated);
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setSettingsSavedMsg(
        newAdminPassword.trim().length > 0
          ? 'Settings saved! Secondary password has been updated. (Previous secondary password is now deactivated. Permanent primary password remains active for all time).'
          : 'Admin settings and merchant accounts updated successfully!'
      );
      setTimeout(() => setSettingsSavedMsg(null), 5000);
    } catch (err: any) {
      setSettingsErrorMsg(err.message || 'Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Statistics calculation
  const totalRevenue = orders.reduce((sum, o) => (o.paymentStatus === 'Paid' ? sum + o.total : sum), 0);
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing');
  const lowStockProducts = products.filter(p => p.stock < 5);

  // Product CRUD
  const handleOpenAddProduct = () => {
    setUploadError(null);
    setEditingProduct({
      name: '',
      brand: 'ATAL',
      price: 2500,
      compareAtPrice: 3500,
      categoryId: categories[0]?.id || 'cat-fashion',
      categoryName: categories[0]?.name || 'Fashion',
      stock: 25,
      sku: `ATAL-${Date.now().toString().slice(-6)}`,
      description: '',
      images: [],
      thumbnail: '',
      active: true,
      featured: false,
      newArrival: true,
      bestSeller: false,
      rating: 5.0,
      reviewCount: 1,
      tags: ['Luxury', 'Original', 'ATAL Collection'],
      variations: []
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setUploadError(null);
    setEditingProduct({ ...prod });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const primaryImage = editingProduct.thumbnail || editingProduct.images?.[0] || '';
    const allImages = (editingProduct.images && editingProduct.images.length > 0)
      ? editingProduct.images
      : (primaryImage ? [primaryImage] : []);

    if (allImages.length < 3) {
      setUploadError(`Minimum 3 product pictures are required (Currently: ${allImages.length}/3). Please upload or add at least 3 photos to ensure complete showcase views.`);
      return;
    }

    try {
      await saveProduct({
        ...editingProduct,
        thumbnail: primaryImage,
        images: allImages
      });
      setProductModalOpen(false);
      setEditingProduct(null);
      onRefreshData();
    } catch (err: any) {
      console.error('Save product error:', err);
      setUploadError(err.message || 'Failed to save product');
    }
  };

  // Instant toggle active / deactivate for product
  const handleToggleProductActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleProductActive(id, !currentActive);
      onRefreshData();
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  // Instant delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteProduct(id);
      onRefreshData();
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  // Product Image Upload Handler
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;
    setIsProcessingUpload(true);
    setUploadError(null);

    try {
      const newImages: string[] = [...(editingProduct.images || [])];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64Data = await processImageFile(file, 1200, 1200, 0.85);
        newImages.push(base64Data);
      }

      setEditingProduct({
        ...editingProduct,
        images: newImages,
        thumbnail: editingProduct.thumbnail || newImages[0]
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process selected image');
    } finally {
      setIsProcessingUpload(false);
      e.target.value = '';
    }
  };

  const handleRemoveProductImage = (indexToRemove: number) => {
    if (!editingProduct || !editingProduct.images) return;
    const filtered = editingProduct.images.filter((_, idx) => idx !== indexToRemove);
    setEditingProduct({
      ...editingProduct,
      images: filtered,
      thumbnail: filtered[0] || ''
    });
  };

  // Category CRUD
  const handleOpenAddCategory = () => {
    setUploadError(null);
    setEditingCategory({
      name: '',
      description: '',
      image: '',
      active: true,
      subcategories: []
    });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setUploadError(null);
    setEditingCategory({ ...cat });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.image) {
      setUploadError('Please upload a cover image for this department.');
      return;
    }

    try {
      await saveCategory(editingCategory);
      setCategoryModalOpen(false);
      setEditingCategory(null);
      onRefreshData();
    } catch (err: any) {
      console.error('Save category error:', err);
      setUploadError(err.message || 'Failed to save category');
    }
  };

  const handleToggleCategoryActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleCategoryActive(id, !currentActive);
      onRefreshData();
    } catch (err) {
      console.error('Toggle category active error:', err);
    }
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCategory) return;
    setIsProcessingUpload(true);
    setUploadError(null);

    try {
      const base64Data = await processImageFile(file, 1000, 1000, 0.85);
      setEditingCategory({
        ...editingCategory,
        image: base64Data
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process category cover image');
    } finally {
      setIsProcessingUpload(false);
      e.target.value = '';
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the department "${name}"?`)) {
      return;
    }
    try {
      await deleteCategory(id);
      onRefreshData();
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, payStatus?: PaymentStatus) => {
    try {
      await updateOrderStatus(orderId, status, payStatus);
      onRefreshData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? ({ ...prev, orderStatus: status, ...(payStatus ? { paymentStatus: payStatus } : {}) }) : null);
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // -------------------------------------------------------------
  // CAROUSEL SLIDES HANDLERS
  // -------------------------------------------------------------
  const handleOpenNewSlide = () => {
    setUploadError(null);
    setEditingSlide({
      id: '',
      productId: '',
      title: '',
      subtitle: 'Featured Product',
      badge: 'Special Product Drop',
      badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      description: 'Describe this showcase item with captivating product details and special pricing.',
      priceTag: '',
      originalPrice: undefined,
      discountPrice: undefined,
      discountTag: '',
      buttonText: 'Buy Now',
      buttonLink: 'shop',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
      bgGradient: 'from-emerald-950 via-stone-900 to-stone-950',
      active: true,
      order: (carouselSlides?.length || 0) + 1
    });
    setCarouselModalOpen(true);
  };

  const handleSelectProductForSlide = (prodId: string) => {
    if (!editingSlide) return;
    if (!prodId) {
      setEditingSlide({
        ...editingSlide,
        productId: ''
      });
      return;
    }
    const found = products.find(p => p.id === prodId);
    if (found) {
      const orig = found.compareAtPrice && found.compareAtPrice > found.price ? found.compareAtPrice : found.price;
      const disc = found.price;
      const savings = orig > disc ? `Save ${formatPrice(orig - disc)}` : '';
      setEditingSlide({
        ...editingSlide,
        productId: found.id,
        title: found.name,
        image: found.thumbnail || found.images[0] || editingSlide.image,
        description: found.description || editingSlide.description,
        originalPrice: orig,
        discountPrice: disc,
        priceTag: formatPrice(disc),
        discountTag: savings || editingSlide.discountTag,
        buttonText: 'Buy Now',
        buttonLink: found.id,
        badge: found.brand || 'Featured Product'
      });
    }
  };

  const handleSelectProductForSpotlight = (prodId: string) => {
    if (!editingSpotlight) return;
    if (!prodId) return;
    const found = products.find(p => p.id === prodId);
    if (found) {
      const orig = found.compareAtPrice && found.compareAtPrice > found.price ? found.compareAtPrice : found.price * 1.25;
      const disc = found.price;
      const savings = `Save ${formatPrice(Math.round(orig - disc))}`;
      setEditingSpotlight({
        ...editingSpotlight,
        title: found.name,
        image: found.thumbnail || found.images[0] || editingSpotlight.image,
        description: found.description || editingSpotlight.description,
        price: disc,
        compareAtPrice: Math.round(orig),
        discountTag: savings,
        primaryButtonText: `Buy ${found.brand || 'Now'}`,
        primaryButtonLink: found.categoryId || 'shop',
        badge: 'Spotlight Hardware'
      });
    }
  };

  const handleOpenEditSlide = (slide: CarouselSlide) => {
    setUploadError(null);
    setEditingSlide({ ...slide });
    setCarouselModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide || !editingSlide.title?.trim() || !editingSlide.image?.trim()) {
      setUploadError('Please provide both a Slide Title and Picture image URL / Upload.');
      return;
    }
    setIsSavingSlide(true);
    setUploadError(null);

    try {
      await saveCarouselSlide(editingSlide);
      setCarouselModalOpen(false);
      setEditingSlide(null);
      setSlideMessage('Carousel slide updated and saved successfully!');
      setTimeout(() => setSlideMessage(null), 3500);
      onRefreshData();
    } catch (err: any) {
      console.error('Save slide error:', err);
      setUploadError(err.message || 'Failed to save slide');
    } finally {
      setIsSavingSlide(false);
    }
  };

  const handleDeleteSlide = async (slideId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete carousel slide "${title}"?`)) {
      return;
    }
    try {
      await deleteCarouselSlide(slideId);
      setSlideMessage('Carousel slide deleted.');
      setTimeout(() => setSlideMessage(null), 3000);
      onRefreshData();
    } catch (err) {
      console.error('Delete slide error:', err);
    }
  };

  const handleResetCarousel = async () => {
    if (!window.confirm('Are you sure you want to reset the carousel to the default 5 slides?')) {
      return;
    }
    try {
      await resetCarouselSlidesToDefault();
      setSlideMessage('Carousel reset to 5 default high-converting slides.');
      setTimeout(() => setSlideMessage(null), 3500);
      onRefreshData();
    } catch (err) {
      console.error('Reset carousel error:', err);
    }
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSlide) return;
    setIsProcessingUpload(true);
    setUploadError(null);

    try {
      const base64Data = await processImageFile(file, 1400, 1000, 0.85);
      setEditingSlide({
        ...editingSlide,
        image: base64Data
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process slide photo');
    } finally {
      setIsProcessingUpload(false);
      e.target.value = '';
    }
  };

  // -------------------------------------------------------------
  // SPOTLIGHT HARDWARE BANNER HANDLERS
  // -------------------------------------------------------------
  const handleOpenEditSpotlight = () => {
    setUploadError(null);
    setEditingSpotlight({ ...spotlightBanner });
    setSpotlightModalOpen(true);
  };

  const handleSaveSpotlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpotlight) return;
    setIsSavingSpotlight(true);
    setUploadError(null);

    try {
      const res = await updateSpotlightBanner(editingSpotlight);
      setSpotlightBanner(res);
      setSpotlightModalOpen(false);
      setEditingSpotlight(null);
      setSlideMessage('Spotlight Hardware section saved and updated on storefront!');
      setTimeout(() => setSlideMessage(null), 3500);
      onRefreshData();
    } catch (err: any) {
      console.error('Save spotlight error:', err);
      setUploadError(err.message || 'Failed to save spotlight banner');
    } finally {
      setIsSavingSpotlight(false);
    }
  };

  const handleSpotlightImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSpotlight) return;
    setIsProcessingUpload(true);
    setUploadError(null);

    try {
      const base64Data = await processImageFile(file, 1400, 1000, 0.85);
      setEditingSpotlight({
        ...editingSpotlight,
        image: base64Data
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process hardware image');
    } finally {
      setIsProcessingUpload(false);
      e.target.value = '';
    }
  };

  // Filtered product listing
  const filteredProducts = products.filter(p => {
    const matchesSearch = productSearch.trim() === '' ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || p.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered orders listing (by 9-digit order number, customer name, phone, or TID)
  const filteredOrders = orders.filter(o => {
    if (!orderSearch.trim()) return true;
    const q = orderSearch.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    return (
      (o.orderNumber && (o.orderNumber.toLowerCase().includes(q) || (qDigits.length > 0 && o.orderNumber.includes(qDigits)))) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.phone && o.phone.toLowerCase().includes(q)) ||
      (o.email && o.email.toLowerCase().includes(q)) ||
      (o.transactionId && o.transactionId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Admin Top Bar */}
      <div className="bg-stone-950 text-white px-6 py-4 border-b border-stone-800 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <img
            src="/atal-logo.jpg"
            alt="ATAL Logo"
            className="w-9 h-9 object-contain rounded-lg border border-stone-800 bg-white p-0.5 shadow-xs"
          />
          <div>
            <span className="font-black text-sm tracking-wide font-serif-display text-white">
              ATAL Admin Hub &amp; Backoffice
            </span>
            <span className="text-[10px] text-stone-400 block">
              {isDemoAdmin ? 'Demo Admin Mode (Full Privileges)' : 'Verified Admin Console'} • Complete Store Controls
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onRefreshData()}
            className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 hover:bg-stone-800 text-xs font-semibold text-stone-300 hover:text-white transition cursor-pointer"
            title="Refresh database records"
          >
            ↻ Sync Data
          </button>
          <button
            onClick={onExitAdmin}
            className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>← Return to Storefront</span>
          </button>
          <button
            onClick={() => {
              logout();
              onExitAdmin();
            }}
            className="px-3.5 py-1.5 rounded-lg border border-red-800/80 text-red-400 hover:bg-red-950/60 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-stone-950 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'bg-stone-950 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-stone-950 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Departments ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-stone-950 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
            {pendingOrders.length > 0 && (
              <span className="bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('carousel')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'carousel'
                ? 'bg-stone-950 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            <span>Carousel Sliders ({carouselSlides?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-stone-950 text-white shadow-sm'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Settings className="w-4 h-4 text-amber-500" />
            <span>Admin, Accounts &amp; COD Settings</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">Total Store Revenue</span>
                <div className="text-2xl font-black font-serif-display text-stone-950">
                  {formatPrice(totalRevenue)}
                </div>
                <span className="text-[11px] text-emerald-800 font-semibold">From settled customer orders</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">Total Placed Orders</span>
                <div className="text-2xl font-black font-serif-display text-stone-950">{orders.length}</div>
                <span className="text-[11px] text-amber-800 font-semibold">{pendingOrders.length} pending fulfillment</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">Total Products</span>
                <div className="text-2xl font-black font-serif-display text-stone-950">{products.length}</div>
                <span className="text-[11px] text-stone-600 font-semibold">
                  {products.filter(p => p.active !== false).length} Active in Store
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">Low Stock Alerts</span>
                <div className="text-2xl font-black font-serif-display text-red-600">
                  {lowStockProducts.length}
                </div>
                <span className="text-[11px] text-red-800 font-semibold">Items with &lt; 5 units remaining</span>
              </div>
            </div>

            {/* Quick Actions & Policy Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold font-serif-display text-stone-950">Quick Catalog Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleOpenAddProduct}
                    className="p-4 rounded-xl bg-stone-950 text-white font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-stone-800 transition cursor-pointer"
                  >
                    <Plus className="w-5 h-5 text-amber-400" />
                    <span>Upload New Product</span>
                  </button>
                  <button
                    onClick={handleOpenAddCategory}
                    className="p-4 rounded-xl bg-stone-100 text-stone-900 font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-stone-200 transition cursor-pointer"
                  >
                    <FolderTree className="w-5 h-5 text-stone-700" />
                    <span>Add Department</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold font-serif-display text-stone-950">Merchant &amp; COD Summary</h3>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="text-xs text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    Edit in Settings →
                  </button>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">Advance Shipping for COD:</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${storeSettings.requireCodAdvanceShipping ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>
                      {storeSettings.requireCodAdvanceShipping ? 'ON (Mandatory Advance)' : 'OFF (Standard COD)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold text-stone-800">Promo &amp; Coupon Codes:</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${storeSettings.promoCodesEnabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>
                      {storeSettings.promoCodesEnabled !== false ? 'ON (ATAL8 / WELCOME12)' : 'OFF (Disabled)'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-stone-200 grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                    <div>JazzCash: <strong className="text-stone-900">{storeSettings.jazzcashNumber}</strong> ({storeSettings.jazzcashTitle})</div>
                    <div>Easypaisa: <strong className="text-stone-900">{storeSettings.easypaisaNumber}</strong> ({storeSettings.easypaisaTitle})</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-serif-display text-stone-950">
                  Product Catalog &amp; Status Controls
                </h2>
                <p className="text-xs text-stone-600">
                  Toggle products Active / Deactivated, manage stock, delete items, and upload images.
                </p>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search by title, brand, or SKU..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-stone-500" />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-stone-900"
                >
                  <option value="all">All Departments</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-600 uppercase font-semibold">
                    <th className="py-3">Item</th>
                    <th className="py-3">SKU</th>
                    <th className="py-3">Department</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Stock</th>
                    <th className="py-3">Visibility Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.map((p) => {
                    const isActive = p.active !== false;
                    return (
                      <tr key={p.id} className={`hover:bg-stone-50 transition ${!isActive ? 'opacity-65 bg-stone-50/50' : ''}`}>
                        <td className="py-3 flex items-center gap-3">
                          <img
                            src={p.thumbnail || p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-stone-100"
                          />
                          <div>
                            <div className="font-bold text-stone-900 line-clamp-1">{p.name}</div>
                            <div className="text-[11px] text-stone-500">{p.brand}</div>
                          </div>
                        </td>
                        <td className="py-3 font-mono text-stone-600">{p.sku}</td>
                        <td className="py-3 text-stone-700">{p.categoryName || 'General'}</td>
                        <td className="py-3 font-bold text-stone-950">{formatPrice(p.price)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              p.stock > 10
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.stock > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.stock} in stock
                          </span>
                        </td>
                        <td className="py-3">
                          {/* INSTANT ACTIVE / DEACTIVE TOGGLE BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleToggleProductActive(p.id, isActive)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                              isActive
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                                : 'bg-stone-200 hover:bg-stone-300 text-stone-700 border border-stone-300'
                            }`}
                            title={isActive ? 'Click to Deactivate (Hide from storefront)' : 'Click to Activate (Show on storefront)'}
                          >
                            {isActive ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-700" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-stone-500" />
                                <span>Deactivated</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 text-stone-700 hover:text-black hover:bg-stone-200 rounded-lg transition cursor-pointer"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete product permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORY MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-serif-display text-stone-950">
                  Department &amp; Category Controls
                </h2>
                <p className="text-xs text-stone-600">
                  Activate / Deactivate department sections, edit details, or delete categories.
                </p>
              </div>

              <button
                onClick={handleOpenAddCategory}
                className="px-4 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Department</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => {
                const isCatActive = c.active !== false;
                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl border p-4 bg-stone-50/50 flex flex-col justify-between transition ${
                      isCatActive ? 'border-stone-200' : 'border-stone-300 bg-stone-100/60 opacity-70'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={c.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80'}
                        alt={c.name}
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-stone-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-stone-900 truncate">{c.name}</h4>
                        </div>
                        <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">{c.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                      {/* INSTANT ACTIVE / DEACTIVE TOGGLE */}
                      <button
                        type="button"
                        onClick={() => handleToggleCategoryActive(c.id, isCatActive)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isCatActive
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                            : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                        }`}
                      >
                        {isCatActive ? <ToggleRight className="w-3.5 h-3.5 text-emerald-700" /> : <ToggleLeft className="w-3.5 h-3.5 text-stone-500" />}
                        <span>{isCatActive ? 'Active' : 'Deactivated'}</span>
                      </button>

                      <div className="space-x-2">
                        <button
                          onClick={() => handleOpenEditCategory(c)}
                          className="text-stone-700 hover:text-black font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-serif-display text-stone-950">
                  Customer Orders &amp; Fulfillment ({orders.length})
                </h2>
                <p className="text-xs text-stone-600">
                  Track 9-digit order numbers, inspect verified Transaction IDs (TID), and manage Cash on Delivery settlements.
                </p>
              </div>

              {/* 9-Digit Order Tracking Search Input */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search 9-digit Order #, Phone, Name..."
                  className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
                {orderSearch && (
                  <button
                    onClick={() => setOrderSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-600 uppercase font-semibold">
                    <th className="py-3">9-Digit Order Tracking #</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">Transaction ID / TID</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Total</th>
                    <th className="py-3">Payment</th>
                    <th className="py-3">Order Status</th>
                    <th className="py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs text-stone-950 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200">
                              #{o.orderNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyOrderNumber(o.orderNumber)}
                              className="p-1 hover:bg-stone-200 rounded text-stone-500 hover:text-stone-900 transition cursor-pointer"
                              title="Copy 9-digit order number"
                            >
                              {copiedOrderId === o.orderNumber ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <div className="font-semibold text-stone-900">{o.customerName}</div>
                          <div className="text-[11px] text-stone-600">{o.phone}</div>
                        </td>
                        <td className="py-3.5">
                          {o.transactionId ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 text-white font-mono font-bold text-[11px]">
                              <span>TID: {o.transactionId}</span>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic">None</span>
                          )}
                        </td>
                        <td className="py-3.5 text-stone-600">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 font-extrabold text-stone-950">{formatPrice(o.total)}</td>
                        <td className="py-3.5">
                          <div className="font-medium text-stone-900">{o.paymentMethod}</div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              o.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                            aria-label={`Update order status for #${o.orderNumber}`}
                            className="bg-white border border-stone-200 rounded-lg text-xs font-semibold px-2 py-1 cursor-pointer focus:ring-1 focus:ring-stone-900"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 font-semibold text-stone-800 cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-500 text-xs">
                        {orderSearch ? `No orders found matching "${orderSearch}".` : 'No customer orders placed yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ADMIN PASSWORD, MERCHANT ACCOUNTS & COD SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-8">
            <div>
              <h2 className="text-xl font-bold font-serif-display text-stone-950">
                Admin Security, Merchant Accounts &amp; COD Controls
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Configure your administrator login password, official JazzCash / Easypaisa accounts, contact email, and Cash on Delivery rules.
              </p>
            </div>

            {settingsSavedMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{settingsSavedMsg}</span>
              </div>
            )}

            {settingsErrorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{settingsErrorMsg}</span>
              </div>
            )}

            {/* Advance Shipping on COD Toggle Box */}
            <div className="p-6 bg-stone-50 border-2 border-stone-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-stone-900" />
                    <h3 className="text-sm font-bold text-stone-950">
                      Advance Shipping Fee on Cash on Delivery (COD)
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                    When <strong>ON</strong>, customers placing Cash on Delivery orders are required to transfer the nationwide shipping fee (PKR {storeSettings.shippingFee || 290}) in advance via JazzCash or Easypaisa to verify courier dispatch. When <strong>OFF</strong>, customers can place COD orders with zero advance payment.
                  </p>
                </div>

                {/* THE ON/OFF BUTTON SWITCH */}
                <button
                  type="button"
                  onClick={handleToggleCodAdvanceShipping}
                  className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition shadow-sm cursor-pointer ${
                    storeSettings.requireCodAdvanceShipping
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-100'
                      : 'bg-stone-300 hover:bg-stone-400 text-stone-800'
                  }`}
                >
                  {storeSettings.requireCodAdvanceShipping ? (
                    <>
                      <ToggleRight className="w-6 h-6" />
                      <span>ENABLED (ON)</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-stone-600" />
                      <span>DISABLED (OFF)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                <span>Current Status: <strong className="text-stone-900">{storeSettings.requireCodAdvanceShipping ? 'Advance Delivery Fee Required' : 'Full Cash at Doorstep (No Advance)'}</strong></span>
                <span>Active Account: <strong>{storeSettings.jazzcashNumber} ({storeSettings.jazzcashTitle})</strong></span>
              </div>
            </div>

            {/* Promo / Voucher Codes ON/OFF Toggle Box */}
            <div className="p-6 bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-emerald-800" />
                    <h3 className="text-sm font-bold text-stone-950">
                      Promotional Discount &amp; Coupon Codes (ATAL8 &amp; WELCOME12)
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                    When <strong>ON</strong>, customers can apply store promo codes (<strong>ATAL8</strong> for 8% OFF and <strong>WELCOME12</strong> for 12% OFF) during cart and checkout. When <strong>OFF</strong>, coupon fields and discount vouchers are disabled across the storefront.
                  </p>
                </div>

                {/* THE PROMO ON/OFF BUTTON SWITCH */}
                <button
                  type="button"
                  onClick={handleTogglePromoCodes}
                  className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition shadow-sm cursor-pointer ${
                    storeSettings.promoCodesEnabled !== false
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-100'
                      : 'bg-stone-300 hover:bg-stone-400 text-stone-800'
                  }`}
                >
                  {storeSettings.promoCodesEnabled !== false ? (
                    <>
                      <ToggleRight className="w-6 h-6" />
                      <span>ENABLED (ON)</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-stone-600" />
                      <span>DISABLED (OFF)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
                <span>Active Codes: <strong>ATAL8 (8% OFF)</strong> &amp; <strong>WELCOME12 (12% OFF)</strong></span>
                <span>Current Status: <strong>{storeSettings.promoCodesEnabled !== false ? 'Active & Usable by Customers' : 'Disabled by Admin'}</strong></span>
              </div>
            </div>

            {/* FORM: MERCHANT ACCOUNTS, CONTACT EMAIL & ADMIN PASSWORD */}
            <form onSubmit={handleSaveMerchantSettings} className="space-y-6 text-xs">
              {/* SECTION 1: OFFICIAL MERCHANT ACCOUNTS */}
              <div className="p-6 bg-white border border-stone-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-stone-950">
                    Official Merchant Account Numbers &amp; Account Titles
                  </h3>
                </div>
                <p className="text-stone-500">
                  These account numbers and titles appear on the customer checkout page and payment instructions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-3">
                    <span className="font-bold text-red-900 block text-xs uppercase">JazzCash Account Details</span>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">JazzCash Mobile Number *</label>
                      <input
                        type="text"
                        required
                        value={settingsFormData.jazzcashNumber}
                        onChange={(e) => setSettingsFormData({ ...settingsFormData, jazzcashNumber: e.target.value })}
                        placeholder="03227796097"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-red-300 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Account Title (Name) *</label>
                      <input
                        type="text"
                        required
                        value={settingsFormData.jazzcashTitle}
                        onChange={(e) => setSettingsFormData({ ...settingsFormData, jazzcashTitle: e.target.value })}
                        placeholder="Omar Farooq"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-red-300 font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                    <span className="font-bold text-emerald-900 block text-xs uppercase">Easypaisa Account Details</span>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Easypaisa Mobile Number *</label>
                      <input
                        type="text"
                        required
                        value={settingsFormData.easypaisaNumber}
                        onChange={(e) => setSettingsFormData({ ...settingsFormData, easypaisaNumber: e.target.value })}
                        placeholder="03227796097"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-emerald-300 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Account Title (Name) *</label>
                      <input
                        type="text"
                        required
                        value={settingsFormData.easypaisaTitle}
                        onChange={(e) => setSettingsFormData({ ...settingsFormData, easypaisaTitle: e.target.value })}
                        placeholder="Omar Farooq"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-emerald-300 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: OFFICIAL CONTACT & STORE INFO */}
              <div className="p-6 bg-white border border-stone-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-stone-900" />
                  <h3 className="text-sm font-bold text-stone-950">
                    Store Contact Email &amp; Support Phone
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={settingsFormData.contactEmail}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, contactEmail: e.target.value })}
                      placeholder="contact.to.atal@gmail.com"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">WhatsApp / Call Support Number *</label>
                    <input
                      type="text"
                      required
                      value={settingsFormData.contactPhone}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, contactPhone: e.target.value })}
                      placeholder="03719150297"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: DUAL ADMIN PASSWORD MANAGEMENT (PRIMARY & SECONDARY) */}
              <div className="p-6 bg-amber-50/60 border-2 border-amber-200 rounded-2xl space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-800" />
                    <h3 className="text-sm font-bold text-stone-950">
                      Administrator Authentication &amp; Dual Password System
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-200/70 text-amber-950 border border-amber-300">
                    Dual Password Protection
                  </span>
                </div>

                {/* 1. PRIMARY FIXED PASSWORD (PERMANENT) */}
                <div className="p-4 bg-white rounded-xl border border-stone-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs text-stone-900">Primary Administrator Password</span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Fixed for All Time (Active)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    The master primary root password is permanently hard-locked and will always grant full administrator access. It cannot be modified or locked out.
                  </p>
                </div>

                {/* 2. SECONDARY CHANGEABLE PASSWORD */}
                <div className="p-4 bg-white rounded-xl border border-stone-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-700" />
                      <span className="font-bold text-xs text-stone-900">Secondary Administrator Password</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      Changeable (Active)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    You can change the secondary administrator password below. When you change this secondary password, the previous secondary password is <strong>strictly deactivated and no longer applicable</strong>.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">New Secondary Password</label>
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Enter new secondary password"
                        className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Confirm New Secondary Password</label>
                      <input
                        type="password"
                        value={confirmAdminPassword}
                        onChange={(e) => setConfirmAdminPassword(e.target.value)}
                        placeholder="Re-enter new secondary password"
                        className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100">
                    <span>Leave fields blank if you want to keep your current active secondary password.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewAdminPassword('Abu6232');
                        setConfirmAdminPassword('Abu6232');
                      }}
                      className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                    >
                      Reset to Default Secondary Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-8 py-3.5 bg-stone-950 text-white rounded-xl font-bold hover:bg-stone-800 transition disabled:opacity-50 flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isSavingSettings ? 'Saving Settings...' : 'Save All Settings & Accounts'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: CAROUSEL SLIDERS (Manage Picture, Title, Description, Price & Buy Now Button) */}
        {activeTab === 'carousel' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif-display text-stone-950">
                  Storefront Carousel &amp; Hero Sliders ({carouselSlides?.length || 0})
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Customize the 5 homepage banner slides: upload pictures, edit titles, descriptions, price tags, and Buy Now button actions.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetCarousel}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Reset to 5 default high-converting slides"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset 5 Defaults</span>
                </button>

                <button
                  onClick={handleOpenNewSlide}
                  className="px-5 py-2.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>+ Add New Slide</span>
                </button>
              </div>
            </div>

            {slideMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{slideMessage}</span>
              </div>
            )}

            {/* Carousel Slides List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carouselSlides && carouselSlides.length > 0 ? (
                carouselSlides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className={`bg-white rounded-2xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
                      slide.active ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50'
                    }`}
                  >
                    <div>
                      {/* Image Preview with Overlay */}
                      <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover object-center brightness-85"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${slide.bgGradient || 'from-stone-950 via-stone-900/60 to-transparent'} opacity-80`} />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-950/80 text-white backdrop-blur-md border border-white/20">
                            Slide #{slide.order || idx + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${slide.active ? 'bg-emerald-500 text-stone-950' : 'bg-stone-500 text-white'}`}>
                            {slide.active ? 'Active' : 'Disabled'}
                          </span>
                        </div>

                        {/* Slide Title on Card */}
                        <div className="absolute bottom-3 left-3 right-3 z-10">
                          {slide.badge && (
                            <span className="text-[10px] font-bold text-amber-300 block mb-0.5">
                              {slide.badge}
                            </span>
                          )}
                          <h3 className="text-sm font-bold text-white line-clamp-1">
                            {slide.title}
                          </h3>
                        </div>
                      </div>

                      {/* Card Content Details */}
                      <div className="p-4 space-y-3 text-xs">
                        <p className="text-stone-600 line-clamp-2 leading-relaxed">
                          {slide.description || 'No description provided.'}
                        </p>

                        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {slide.discountPrice ? (
                              <>
                                <span className="font-extrabold text-emerald-800 text-xs">
                                  {formatPrice(slide.discountPrice)}
                                </span>
                                {slide.originalPrice && slide.originalPrice > slide.discountPrice && (
                                  <span className="text-[11px] text-stone-400 line-through">
                                    {formatPrice(slide.originalPrice)}
                                  </span>
                                )}
                              </>
                            ) : slide.priceTag ? (
                              <div className="flex items-center gap-1 text-emerald-800 font-bold">
                                <Tag className="w-3.5 h-3.5" />
                                <span>{slide.priceTag}</span>
                              </div>
                            ) : (
                              <span className="text-stone-400 text-[11px]">No price set</span>
                            )}
                          </div>
                          {slide.discountTag && (
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-[10px]">
                              {slide.discountTag}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                          <span>Button: <strong>"{slide.buttonText || 'Buy Now'}"</strong></span>
                          <span>Links: <strong>{slide.buttonLink || 'shop'}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 pt-0 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditSlide(slide)}
                        className="flex-1 py-2 px-3 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Slide</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id, slide.title)}
                        className="p-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-12 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
                  <ImageIcon className="w-12 h-12 text-stone-300 mx-auto" />
                  <h3 className="text-base font-bold text-stone-900">No Custom Carousel Slides</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Click "Reset 5 Defaults" to populate the standard 5 showcase slides or "+ Add New Slide" to start from scratch.
                  </p>
                  <button
                    onClick={handleResetCarousel}
                    className="mt-2 px-5 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Restore 5 Default Slides
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 2: SPOTLIGHT HARDWARE BANNER (Direct Admin Editing) */}
            <div className="pt-6 border-t border-stone-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-base font-bold font-serif-display text-stone-950">
                      Promotional Spotlight Hardware Banner
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Controls the prominent hardware/electronics showcase banner displayed on the homepage.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenEditSpotlight}
                  className="px-5 py-2.5 bg-stone-950 hover:bg-stone-850 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Spotlight Hardware Banner</span>
                </button>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-2xl overflow-hidden bg-stone-900 text-white border border-stone-800 grid grid-cols-1 lg:grid-cols-12 items-center shadow-md">
                <div className="lg:col-span-7 p-5 sm:p-7 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                      {spotlightBanner.badge || 'Spotlight Hardware'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${spotlightBanner.active ? 'bg-emerald-500 text-stone-950' : 'bg-stone-600 text-white'}`}>
                      {spotlightBanner.active ? 'Visible on Homepage' : 'Hidden from Store'}
                    </span>
                  </div>

                  <h4 className="text-xl sm:text-2xl font-bold font-serif-display leading-tight whitespace-pre-line text-white">
                    {spotlightBanner.title}
                  </h4>

                  <p className="text-xs text-stone-300 line-clamp-2">
                    {spotlightBanner.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-lg font-black text-white">{formatPrice(spotlightBanner.price || 14500)}</span>
                    {spotlightBanner.compareAtPrice && (
                      <span className="text-xs text-stone-400 line-through">{formatPrice(spotlightBanner.compareAtPrice)}</span>
                    )}
                    {spotlightBanner.discountTag && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                        {spotlightBanner.discountTag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 text-[11px] text-stone-400">
                    <span>Primary: <strong>"{spotlightBanner.primaryButtonText}" ({spotlightBanner.primaryButtonLink})</strong></span>
                    <span>&bull;</span>
                    <span>Secondary: <strong>"{spotlightBanner.secondaryButtonText}" ({spotlightBanner.secondaryButtonLink})</strong></span>
                  </div>
                </div>

                <div className="lg:col-span-5 h-48 lg:h-full min-h-[180px] bg-stone-950 overflow-hidden relative">
                  <img
                    src={spotlightBanner.image}
                    alt={spotlightBanner.title}
                    className="w-full h-full object-cover object-center brightness-85"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT CREATE/EDIT MODAL WITH DIRECT IMAGE UPLOAD */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition cursor-pointer"
                  title="Back to Catalog"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h3 className="text-lg font-bold font-serif-display text-stone-950 ml-1">
                  {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                </h3>
              </div>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Royal Silk Embroidered Kurta"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Department / Category *</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) => {
                      const selected = categories.find(c => c.id === e.target.value);
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: e.target.value,
                        categoryName: selected?.name || ''
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Original / Compare Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.compareAtPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: Number(e.target.value) })}
                    placeholder="e.g. 4500"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.stock !== undefined ? editingProduct.stock : 10}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                {/* DIRECT IMAGE UPLOADER (MINIMUM 3 PICTURES ENFORCED) */}
                <div className="col-span-2 space-y-3 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="block font-bold text-stone-900 text-sm">
                          Product Images (Minimum 3 Required)
                        </label>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          (editingProduct.images?.length || 0) >= 3
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          {editingProduct.images?.length || 0} / 3 Photos
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 block mt-0.5">
                        Upload or add high-resolution photos (Front angle, side view, lifestyle, or detail views).
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="px-3.5 py-2 bg-stone-950 text-white rounded-xl font-bold text-xs hover:bg-stone-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isProcessingUpload ? 'Uploading...' : 'Upload Photos'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleProductImageUpload}
                          disabled={isProcessingUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Warning if fewer than 3 images */}
                  {(editingProduct.images?.length || 0) < 3 && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center justify-between gap-2">
                      <span>⚠️ <strong>Minimum 3 pictures required:</strong> Add at least {3 - (editingProduct.images?.length || 0)} more photo(s) to publish this product.</span>
                    </div>
                  )}

                  {/* Add image URL input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      id="manual-product-img-url"
                      placeholder="Or paste an image URL (e.g. https://images.unsplash.com/...)"
                      className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const val = input.value.trim();
                          if (val) {
                            const newImgs = [...(editingProduct.images || []), val];
                            setEditingProduct({
                              ...editingProduct,
                              images: newImgs,
                              thumbnail: editingProduct.thumbnail || val
                            });
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('manual-product-img-url') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          const val = input.value.trim();
                          const newImgs = [...(editingProduct.images || []), val];
                          setEditingProduct({
                            ...editingProduct,
                            images: newImgs,
                            thumbnail: editingProduct.thumbnail || val
                          });
                          input.value = '';
                        }
                      }}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      + Add URL
                    </button>
                  </div>

                  {/* Uploaded image previews */}
                  {editingProduct.images && editingProduct.images.length > 0 ? (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                        {editingProduct.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className={`relative group rounded-xl border overflow-hidden bg-white shadow-xs ${
                              editingProduct.thumbnail === imgUrl ? 'border-amber-500 ring-2 ring-amber-400' : 'border-stone-200'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Product preview ${idx + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingProduct({ ...editingProduct, thumbnail: imgUrl })}
                                className="p-1.5 bg-white text-stone-900 rounded-lg text-[10px] font-bold cursor-pointer"
                                title="Set as Main Thumbnail"
                              >
                                Set Main
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveProductImage(idx)}
                                className="p-1.5 bg-red-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                title="Remove image"
                              >
                                <Trash className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="absolute top-1 left-1 bg-stone-900/80 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                              #{idx + 1} {editingProduct.thumbnail === imgUrl ? '• MAIN' : ''}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* IMAGE FORMAT INFO (ADMIN BACKOFFICE) */}
                      {(() => {
                        const activeImg = editingProduct.thumbnail || editingProduct.images[0];
                        const formatInfo = getImageFormatInfo(activeImg, 'product');
                        return (
                          <div className="mt-3 p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-700">Image Format (Main Thumbnail):</span>
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${formatInfo.badgeColor}`}>
                                {formatInfo.format}
                              </span>
                            </div>
                            {formatInfo.sizeEstimate && (
                              <div className="flex items-center justify-between text-stone-500 text-[11px]">
                                <span>Data Size:</span>
                                <strong className="font-mono text-stone-800">{formatInfo.sizeEstimate}</strong>
                              </div>
                            )}
                            <div className="pt-1 border-t border-stone-100 text-[11px] text-stone-500">
                              {formatInfo.recommendedSpec}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="py-6 border-2 border-dashed border-stone-300 rounded-xl text-center space-y-2 bg-white">
                      <ImageIcon className="w-8 h-8 text-stone-400 mx-auto" />
                      <p className="text-xs text-stone-600 font-medium">
                        No product photos uploaded yet. Click <strong>Upload Photos</strong> or paste image URLs above (Minimum 3 required).
                      </p>
                    </div>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Describe material, fit, specifications, and styling recommendations..."
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* VARIATIONS MANAGEMENT (COLOR, SIZE, QUANTITY DIFFERENTLY) */}
              <div className="pt-6 border-t border-stone-200 space-y-6">
                {/* 1. COLOR VARIATIONS */}
                <div className="p-4 bg-stone-50/80 border border-stone-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900 text-sm uppercase flex items-center gap-2">
                        <span>1. Color Variations</span>
                        <span className="text-xs font-normal text-stone-500">
                          ({(editingProduct.variations || []).filter(v => v.type === 'color').length} Colors)
                        </span>
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        Define distinct color shades with hex swatches and specific stock quantities.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newVar: ProductVariation = {
                          id: `col-${Date.now()}`,
                          type: 'color',
                          name: 'New Color',
                          value: '#18181b',
                          stock: 12,
                          sku: `${editingProduct.sku || 'SKU'}-COL-${Date.now().toString().slice(-3)}`,
                          images: editingProduct.images || []
                        };
                        setEditingProduct({
                          ...editingProduct,
                          variations: [...(editingProduct.variations || []), newVar]
                        });
                      }}
                      className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition cursor-pointer"
                    >
                      + Add Color
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(editingProduct.variations || []).filter(v => v.type === 'color').map((v) => {
                      const realIndex = (editingProduct.variations || []).findIndex(item => item.id === v.id);
                      return (
                        <div key={v.id} className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-3">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="color"
                              value={v.value.startsWith('#') ? v.value : '#000000'}
                              onChange={(e) => {
                                const updated = [...(editingProduct.variations || [])];
                                updated[realIndex] = { ...v, value: e.target.value };
                                setEditingProduct({ ...editingProduct, variations: updated });
                              }}
                              className="w-9 h-9 rounded-lg border border-stone-300 p-0.5 cursor-pointer flex-shrink-0"
                              title="Pick Hex Color"
                            />
                            <input
                              type="text"
                              placeholder="Color Name (e.g. Midnight Black)"
                              value={v.name}
                              onChange={(e) => {
                                const updated = [...(editingProduct.variations || [])];
                                updated[realIndex] = { ...v, name: e.target.value };
                                setEditingProduct({ ...editingProduct, variations: updated });
                              }}
                              className="px-2.5 py-1.5 border rounded-lg text-xs font-bold flex-1"
                            />
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                            <input
                              type="text"
                              placeholder="Hex code (e.g. #18181b)"
                              value={v.value}
                              onChange={(e) => {
                                const updated = [...(editingProduct.variations || [])];
                                updated[realIndex] = { ...v, value: e.target.value };
                                setEditingProduct({ ...editingProduct, variations: updated });
                              }}
                              className="px-2.5 py-1.5 border rounded-lg text-xs w-28 font-mono"
                            />
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-stone-500 font-bold">Qty:</span>
                              <input
                                type="number"
                                placeholder="Stock"
                                value={v.stock}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.variations || [])];
                                  updated[realIndex] = { ...v, stock: Number(e.target.value) };
                                  setEditingProduct({ ...editingProduct, variations: updated });
                                }}
                                className="px-2 py-1.5 border rounded-lg text-xs w-18 font-bold"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct({
                                  ...editingProduct,
                                  variations: (editingProduct.variations || []).filter(item => item.id !== v.id)
                                });
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer ml-auto"
                              title="Delete color"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. SIZE & EDITION VARIATIONS */}
                <div className="p-4 bg-stone-50/80 border border-stone-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900 text-sm uppercase flex items-center gap-2">
                        <span>2. Size &amp; Edition Variations</span>
                        <span className="text-xs font-normal text-stone-500">
                          ({(editingProduct.variations || []).filter(v => v.type === 'size' || v.type === 'edition' || v.type === 'material').length} Sizes)
                        </span>
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        Define distinct sizes (S, M, L, XL, 38mm, 42mm, 128GB, etc.) with individual stock and pricing.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newVar: ProductVariation = {
                          id: `sz-${Date.now()}`,
                          type: 'size',
                          name: 'Standard',
                          value: 'Standard',
                          stock: 15,
                          price: editingProduct.price,
                          sku: `${editingProduct.sku || 'SKU'}-SZ-${Date.now().toString().slice(-3)}`
                        };
                        setEditingProduct({
                          ...editingProduct,
                          variations: [...(editingProduct.variations || []), newVar]
                        });
                      }}
                      className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition cursor-pointer"
                    >
                      + Add Size
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(editingProduct.variations || []).filter(v => v.type === 'size' || v.type === 'edition' || v.type === 'material').map((v) => {
                      const realIndex = (editingProduct.variations || []).findIndex(item => item.id === v.id);
                      return (
                        <div key={v.id} className="p-3 bg-white rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-3">
                          <input
                            type="text"
                            placeholder="Size / Edition Label (e.g. Small / 42mm / 256GB)"
                            value={v.name}
                            onChange={(e) => {
                              const updated = [...(editingProduct.variations || [])];
                              updated[realIndex] = { ...v, name: e.target.value, value: e.target.value };
                              setEditingProduct({ ...editingProduct, variations: updated });
                            }}
                            className="px-2.5 py-1.5 border rounded-lg text-xs font-bold flex-1 w-full sm:w-auto"
                          />

                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-stone-500 font-bold">Price (PKR):</span>
                              <input
                                type="number"
                                placeholder="Price"
                                value={v.price !== undefined ? v.price : editingProduct.price}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.variations || [])];
                                  updated[realIndex] = { ...v, price: Number(e.target.value) };
                                  setEditingProduct({ ...editingProduct, variations: updated });
                                }}
                                className="px-2 py-1.5 border rounded-lg text-xs w-24 font-bold"
                              />
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-stone-500 font-bold">Qty:</span>
                              <input
                                type="number"
                                placeholder="Stock"
                                value={v.stock}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.variations || [])];
                                  updated[realIndex] = { ...v, stock: Number(e.target.value) };
                                  setEditingProduct({ ...editingProduct, variations: updated });
                                }}
                                className="px-2 py-1.5 border rounded-lg text-xs w-18 font-bold"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct({
                                  ...editingProduct,
                                  variations: (editingProduct.variations || []).filter(item => item.id !== v.id)
                                });
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer ml-auto"
                              title="Delete size"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t border-stone-200 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.active}
                    onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                    className="rounded accent-stone-950 cursor-pointer"
                  />
                  <span className="font-bold text-stone-800">Active (Visible in Store)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded accent-stone-950 cursor-pointer"
                  />
                  <span>Featured Hero</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.newArrival}
                    onChange={(e) => setEditingProduct({ ...editingProduct, newArrival: e.target.checked })}
                    className="rounded accent-stone-950 cursor-pointer"
                  />
                  <span>New Arrival</span>
                </label>
              </div>

              <div className="pt-6 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingUpload}
                  className="px-6 py-2 bg-stone-950 text-white rounded-xl font-bold cursor-pointer hover:bg-stone-800 disabled:opacity-50"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL WITH DIRECT IMAGE UPLOAD */}
      {categoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition cursor-pointer"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h3 className="text-base font-bold font-serif-display text-stone-950 ml-1">
                  {editingCategory.id ? 'Edit Department' : 'Add Department'}
                </h3>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Festive Apparel &amp; Shawls"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              {/* COVER IMAGE UPLOAD */}
              <div className="space-y-2 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-900">Cover Image (Upload from Device)</label>
                  <label className="px-3 py-1.5 bg-stone-950 text-white rounded-lg font-bold text-[11px] hover:bg-stone-800 transition flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>{isProcessingUpload ? 'Uploading...' : 'Choose File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageUpload}
                      disabled={isProcessingUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {editingCategory.image ? (
                  <>
                    <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-white">
                      <img
                        src={editingCategory.image}
                        alt="Category Preview"
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingCategory({ ...editingCategory, image: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg text-xs cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Image Format Info Box */}
                    {(() => {
                      const formatInfo = getImageFormatInfo(editingCategory.image, 'product');
                      return (
                        <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-700">Cover Image Format:</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${formatInfo.badgeColor}`}>
                              {formatInfo.format}
                            </span>
                          </div>
                          {formatInfo.sizeEstimate && (
                            <div className="flex items-center justify-between text-stone-500 text-[11px]">
                              <span>Data Size:</span>
                              <strong className="font-mono text-stone-800">{formatInfo.sizeEstimate}</strong>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="py-4 border-2 border-dashed border-stone-300 rounded-xl text-center text-stone-500 text-xs bg-white">
                    Upload a high-resolution department cover photo
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Brief overview of items in this department..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 border rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingUpload}
                  className="px-5 py-2 bg-stone-950 text-white rounded-xl font-bold cursor-pointer hover:bg-stone-800 disabled:opacity-50"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAIL INSPECTOR MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition cursor-pointer"
                  title="Back to Orders"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-2 ml-1">
                  <h3 className="font-bold text-stone-950 font-mono text-sm">Order #{selectedOrder.orderNumber}</h3>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderNumber(selectedOrder.orderNumber)}
                    className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900 transition cursor-pointer flex items-center gap-1 text-[11px] font-sans font-bold bg-stone-100 px-2 py-0.5"
                    title="Copy 9-digit tracking number"
                  >
                    {copiedOrderId === selectedOrder.orderNumber ? (
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
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-50 p-3.5 rounded-xl space-y-1.5 border border-stone-200">
                <div className="font-bold text-stone-900">{selectedOrder.customerName}</div>
                <div className="text-stone-600">{selectedOrder.email} • {selectedOrder.phone}</div>
                <div className="text-stone-600 pt-1">{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}</div>
              </div>

              {/* Transaction verification banner */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">Payment Method:</span>
                  <span className="font-semibold text-stone-900">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950">Transaction ID (TID):</span>
                  <strong className="font-mono text-xs text-stone-950 px-2 py-0.5 bg-white rounded border border-amber-300">
                    {selectedOrder.transactionId || 'None'}
                  </strong>
                </div>
                {selectedOrder.paymentMethod === 'Cash on Delivery' && (
                  <div className="pt-1 text-[11px] text-amber-900 border-t border-amber-200/60">
                    Advance Paid: <strong>{formatPrice(selectedOrder.advancePaidAmount || 0)}</strong> | Collect on Delivery: <strong>{formatPrice(selectedOrder.remainingDueAtDoorstep || selectedOrder.total)}</strong>
                  </div>
                )}
              </div>

              <div className="border rounded-xl p-3 divide-y space-y-2">
                <div className="font-bold text-stone-900">Purchased Items:</div>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-stone-900">{it.productName} (x{it.quantity})</div>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        {it.color && (
                          <span className="px-1.5 py-0.2 bg-stone-100 border border-stone-200 rounded text-[10px] font-bold text-stone-700">
                            Color: {it.color}
                          </span>
                        )}
                        {it.size && (
                          <span className="px-1.5 py-0.2 bg-stone-100 border border-stone-200 rounded text-[10px] font-bold text-stone-700">
                            Size: {it.size}
                          </span>
                        )}
                        {!it.color && !it.size && it.variation && (
                          <span className="text-[10px] text-stone-500">Option: {it.variation.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-stone-950">{formatPrice(it.price * it.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center bg-stone-950 text-white p-3.5 rounded-xl">
                <span>Total Order Amount:</span>
                <span className="font-black text-sm">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAROUSEL SLIDE CREATE / EDIT MODAL */}
      {carouselModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCarouselModalOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition cursor-pointer"
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h3 className="text-lg font-bold font-serif-display text-stone-950 ml-1">
                  {editingSlide.id ? 'Edit Product Carousel Slide' : 'Add New Product Carousel Slide'}
                </h3>
              </div>
              <button
                onClick={() => setCarouselModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
              {/* 1. PRODUCT SELECTOR (AUTO-POPULATE FEATURED PRODUCT) */}
              <div className="p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-emerald-950 text-xs">
                    Choose Store Product (Auto-Populate Image, Title &amp; Prices)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    Product Integration
                  </span>
                </div>
                <select
                  value={editingSlide.productId || ''}
                  onChange={(e) => handleSelectProductForSlide(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose a Product from Catalog (or edit custom below) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatPrice(p.price)} ({p.categoryName || p.brand})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-emerald-900">
                  Selecting a product automatically fills the high-resolution photo, title, compare price, sale price, and sets the Buy Now button link directly to that product.
                </p>
              </div>

              {/* 2. IMAGE / PICTURE UPLOADER & FORMAT INFO CARD */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-stone-900 text-sm">Slide Product Image *</label>
                    <span className="text-[11px] text-stone-500">
                      Upload from phone/laptop or paste a high-resolution image URL.
                    </span>
                  </div>

                  <label className="px-3.5 py-2 bg-stone-950 text-white rounded-xl font-bold text-xs hover:bg-stone-800 transition flex items-center gap-2 cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingUpload ? 'Processing...' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlideImageUpload}
                      disabled={isProcessingUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <input
                    type="url"
                    required
                    value={editingSlide.image || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                {/* IMAGE FORMAT & SPECIFICATIONS INFO (ADMIN ONLY) */}
                {(() => {
                  const formatInfo = getImageFormatInfo(editingSlide.image, 'carousel');
                  return (
                    <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-700">Detected Image Format:</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${formatInfo.badgeColor}`}>
                          {formatInfo.format}
                        </span>
                      </div>
                      {formatInfo.sizeEstimate && (
                        <div className="flex items-center justify-between text-stone-500 text-[11px]">
                          <span>Data Size:</span>
                          <strong className="font-mono text-stone-800">{formatInfo.sizeEstimate}</strong>
                        </div>
                      )}
                      <div className="pt-1 border-t border-stone-100 text-[11px] text-stone-500">
                        {formatInfo.recommendedSpec}
                      </div>
                    </div>
                  );
                })()}

                {/* Picture Live Preview */}
                {editingSlide.image && (
                  <div className="relative h-36 rounded-xl overflow-hidden border border-stone-300 bg-stone-900 shadow-xs">
                    <img
                      src={editingSlide.image}
                      alt="Preview"
                      className="w-full h-full object-cover object-center brightness-85"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${editingSlide.bgGradient || 'from-stone-950 via-stone-900 to-stone-950'} opacity-75`} />
                    <div className="absolute bottom-2.5 left-3 z-10 text-white">
                      <span className="text-[10px] font-bold text-amber-300 block">{editingSlide.badge || 'Badge Preview'}</span>
                      <strong className="text-xs font-serif-display line-clamp-1">{editingSlide.title || 'Slide Title Preview'}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* TITLE & SUBTITLE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-800 mb-1">Slide Title / Product Headline *</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.title || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    placeholder="e.g. Royal Oud Eau De Parfum"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Subtitle / Slogan</label>
                  <input
                    type="text"
                    value={editingSlide.subtitle || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                    placeholder="e.g. Long-Lasting Luxury Scents"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Top Badge Pill</label>
                  <input
                    type="text"
                    value={editingSlide.badge || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                    placeholder="e.g. Signature Perfumery"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">Slide Description</label>
                <textarea
                  rows={2}
                  value={editingSlide.description || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                  placeholder="Compelling promotional copy describing benefits, notes or features..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              {/* ORIGINAL PRICE & DISCOUNT / SALE PRICE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Discount Price (PKR)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingSlide.discountPrice || ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : undefined;
                      const orig = editingSlide.originalPrice;
                      const savings = orig && val && orig > val ? `Save ${formatPrice(orig - val)}` : '';
                      setEditingSlide({
                        ...editingSlide,
                        discountPrice: val,
                        priceTag: val ? formatPrice(val) : editingSlide.priceTag,
                        discountTag: savings || editingSlide.discountTag
                      });
                    }}
                    placeholder="e.g. 8900"
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Original Price (PKR)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingSlide.originalPrice || ''}
                    onChange={(e) => {
                      const origVal = e.target.value ? Number(e.target.value) : undefined;
                      const disc = editingSlide.discountPrice;
                      const savings = origVal && disc && origVal > disc ? `Save ${formatPrice(origVal - disc)}` : '';
                      setEditingSlide({
                        ...editingSlide,
                        originalPrice: origVal,
                        discountTag: savings || editingSlide.discountTag
                      });
                    }}
                    placeholder="e.g. 11500"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-stone-600 line-through"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Discount Savings Tag</label>
                  <input
                    type="text"
                    value={editingSlide.discountTag || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, discountTag: e.target.value })}
                    placeholder="e.g. Save PKR 2,600 (23% OFF)"
                    className="w-full px-3 py-2 bg-white border border-red-300 rounded-xl font-semibold text-red-700"
                  />
                </div>
              </div>

              {/* BUY NOW BUTTON & DESTINATION LINK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">Buy Now Button Text *</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.buttonText || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, buttonText: e.target.value })}
                    placeholder="e.g. Buy Now / Shop Fragrances / Order Today"
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-emerald-950 mb-1">Button Target Destination *</label>
                  <select
                    value={editingSlide.buttonLink || (editingSlide.productId ? editingSlide.productId : 'shop')}
                    onChange={(e) => setEditingSlide({ ...editingSlide, buttonLink: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-semibold"
                  >
                    <option value="shop">All Departments (Shop Catalog)</option>
                    <option value="best-sellers">Best Sellers Collection</option>
                    <option value="new-arrivals">New Arrivals</option>
                    <optgroup label="Direct Product Links">
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          Product: {p.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Department Categories">
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          Department: {c.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* ORDER, GRADIENT & ACTIVE TOGGLE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Slide Display Order</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editingSlide.order || 1}
                    onChange={(e) => setEditingSlide({ ...editingSlide, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Color Ambience</label>
                  <select
                    value={editingSlide.bgGradient || 'from-stone-950 via-stone-900 to-stone-950'}
                    onChange={(e) => setEditingSlide({ ...editingSlide, bgGradient: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="from-amber-950 via-stone-900 to-stone-950">Amber Gold (Perfume)</option>
                    <option value="from-emerald-950 via-stone-900 to-teal-950">Emerald Forest (Beauty)</option>
                    <option value="from-slate-900 via-stone-900 to-sky-950">Slate Tech (Audio)</option>
                    <option value="from-stone-900 via-stone-850 to-neutral-900">Modern Stone (Fashion)</option>
                    <option value="from-emerald-900 via-teal-900 to-stone-950">Super Emerald (Deals)</option>
                    <option value="from-rose-950 via-purple-950 to-stone-950">Velvet Rose</option>
                  </select>
                </div>

                <div className="flex items-end pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSlide.active !== false}
                      onChange={(e) => setEditingSlide({ ...editingSlide, active: e.target.checked })}
                      className="w-4 h-4 rounded accent-stone-950 cursor-pointer"
                    />
                    <span className="font-bold text-stone-900">Active on Storefront</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCarouselModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSlide || isProcessingUpload}
                  className="px-6 py-2.5 bg-stone-950 text-white rounded-xl font-bold cursor-pointer hover:bg-stone-800 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isSavingSlide ? 'Saving Slide...' : 'Save Slide to Carousel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPOTLIGHT HARDWARE BANNER EDIT MODAL */}
      {spotlightModalOpen && editingSpotlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSpotlightModalOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h3 className="text-lg font-bold font-serif-display text-stone-950 ml-1">
                  Edit Spotlight Hardware Banner
                </h3>
              </div>
              <button
                onClick={() => setSpotlightModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSpotlight} className="space-y-4 text-xs">
              {/* Product Selector for Spotlight Hardware */}
              <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-amber-950 text-xs">
                    Choose Store Product to Feature (Auto-Populate Hardware Banner)
                  </label>
                  <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                    Hardware Showcase
                  </span>
                </div>
                <select
                  onChange={(e) => handleSelectProductForSpotlight(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="">-- Choose a Product to Feature (or edit custom fields below) --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatPrice(p.price)} ({p.brand})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-amber-900">
                  Selecting a product automatically populates its high-res picture, product title, selling price, original price, discount tag, and link!
                </p>
              </div>

              {/* Image Uploader & URL */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-stone-900 text-sm">Banner Picture *</label>
                    <span className="text-[11px] text-stone-500">
                      Upload high-res product hardware image or paste an image URL.
                    </span>
                  </div>

                  <label className="px-3.5 py-2 bg-stone-950 text-white rounded-xl font-bold text-xs hover:bg-stone-800 transition flex items-center gap-2 cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingUpload ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSpotlightImageUpload}
                      disabled={isProcessingUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <input
                    type="url"
                    required
                    value={editingSpotlight.image || ''}
                    onChange={(e) => setEditingSpotlight({ ...editingSpotlight, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                {/* IMAGE FORMAT INFO BOX */}
                {(() => {
                  const formatInfo = getImageFormatInfo(editingSpotlight.image, 'spotlight');
                  return (
                    <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-700">Detected Image Format:</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${formatInfo.badgeColor}`}>
                          {formatInfo.format}
                        </span>
                      </div>
                      {formatInfo.sizeEstimate && (
                        <div className="flex items-center justify-between text-stone-500 text-[11px]">
                          <span>Data Size:</span>
                          <strong className="font-mono text-stone-800">{formatInfo.sizeEstimate}</strong>
                        </div>
                      )}
                      <div className="pt-1 border-t border-stone-100 text-[11px] text-stone-500">
                        {formatInfo.recommendedSpec}
                      </div>
                    </div>
                  );
                })()}

                {editingSpotlight.image && (
                  <div className="relative h-32 rounded-xl overflow-hidden border border-stone-300 bg-stone-900 shadow-xs">
                    <img
                      src={editingSpotlight.image}
                      alt="Preview"
                      className="w-full h-full object-cover object-center brightness-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 to-transparent" />
                    <div className="absolute bottom-2.5 left-3 z-10 text-white">
                      <span className="text-[10px] font-bold text-amber-400 block">{editingSpotlight.badge || 'Spotlight Hardware'}</span>
                      <strong className="text-xs font-serif-display line-clamp-1">{editingSpotlight.title || 'Hardware Title'}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Top Badge Pill</label>
                  <input
                    type="text"
                    value={editingSpotlight.badge || ''}
                    onChange={(e) => setEditingSpotlight({ ...editingSpotlight, badge: e.target.value })}
                    placeholder="Spotlight Hardware"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Badge Color Style</label>
                  <select
                    value={editingSpotlight.badgeColor || 'text-amber-400'}
                    onChange={(e) => setEditingSpotlight({ ...editingSpotlight, badgeColor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="text-amber-400">Amber Gold</option>
                    <option value="text-emerald-400">Emerald Mint</option>
                    <option value="text-sky-400">Sky Blue</option>
                    <option value="text-rose-400">Rose Pink</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-800 mb-1">Main Heading (Title) *</label>
                  <input
                    type="text"
                    required
                    value={editingSpotlight.title || ''}
                    onChange={(e) => setEditingSpotlight({ ...editingSpotlight, title: e.target.value })}
                    placeholder="Acoustic Precision. Pure Silence."
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">Promotional Description</label>
                <textarea
                  rows={2}
                  value={editingSpotlight.description || ''}
                  onChange={(e) => setEditingSpotlight({ ...editingSpotlight, description: e.target.value })}
                  placeholder="Experience the Acoustic Studio Wireless ANC headphones. Engineered with titanium dynamic drivers..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              {/* Prices & Discount Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Selling Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingSpotlight.price || 0}
                    onChange={(e) => setEditingSpotlight({ ...editingSpotlight, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Original Price (PKR)</label>
                  <input
                    type="number"
                    value={editingSpotlight.compareAtPrice || ''}
                    onChange={(e) => setEditingSpotlight({ ...editingSpotlight, compareAtPrice: Number(e.target.value) })}
                    placeholder="e.g. 18500"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Discount Tag (Pill)</label>
                  <input
                    type="text"
                    value={editingSpotlight.discountTag || ''}
                    onChange={(e) => setEditingSpotlight({ ...editingSpotlight, discountTag: e.target.value })}
                    placeholder="Save PKR 4,000"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              {/* Buttons and Link Targets */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <span className="font-bold text-stone-900 block text-xs uppercase">Call To Action Buttons</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Primary Button Text</label>
                    <input
                      type="text"
                      value={editingSpotlight.primaryButtonText || ''}
                      onChange={(e) => setEditingSpotlight({ ...editingSpotlight, primaryButtonText: e.target.value })}
                      placeholder="Shop Audio"
                      className="w-full px-3 py-2 bg-white border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Primary Target Link</label>
                    <select
                      value={editingSpotlight.primaryButtonLink || 'cat-electronics'}
                      onChange={(e) => setEditingSpotlight({ ...editingSpotlight, primaryButtonLink: e.target.value })}
                      className="w-full px-3 py-2 bg-white border rounded-xl font-semibold"
                    >
                      <option value="shop">All Departments</option>
                      <option value="best-sellers">Best Sellers</option>
                      <option value="new-arrivals">New Arrivals</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Secondary Button Text</label>
                    <input
                      type="text"
                      value={editingSpotlight.secondaryButtonText || ''}
                      onChange={(e) => setEditingSpotlight({ ...editingSpotlight, secondaryButtonText: e.target.value })}
                      placeholder="View Catalog"
                      className="w-full px-3 py-2 bg-white border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Secondary Target Link</label>
                    <select
                      value={editingSpotlight.secondaryButtonLink || 'shop'}
                      onChange={(e) => setEditingSpotlight({ ...editingSpotlight, secondaryButtonLink: e.target.value })}
                      className="w-full px-3 py-2 bg-white border rounded-xl font-semibold"
                    >
                      <option value="shop">All Departments</option>
                      <option value="best-sellers">Best Sellers</option>
                      <option value="new-arrivals">New Arrivals</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSpotlight.active !== false}
                    onChange={(e) => setEditingSpotlight({ ...editingSpotlight, active: e.target.checked })}
                    className="w-4 h-4 rounded accent-stone-950 cursor-pointer"
                  />
                  <span className="font-bold text-stone-900">Show Spotlight Banner on Homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSpotlightModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSpotlight || isProcessingUpload}
                  className="px-6 py-2.5 bg-stone-950 text-white rounded-xl font-bold cursor-pointer hover:bg-stone-800 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isSavingSpotlight ? 'Saving...' : 'Save Spotlight Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
