import { Category, Product } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-fashion',
    name: 'Fashion & Apparel',
    slug: 'fashion',
    description: 'Contemporary styles, tailored cuts, and everyday wardrobe essentials.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
    active: true,
    subcategories: ['Outerwear', 'Tops', 'Trousers', 'Footwear'],
    createdAt: Date.now() - 10000000,
  },
  {
    id: 'cat-beauty',
    name: 'Beauty, Cosmetics & Perfumes',
    slug: 'beauty',
    description: 'Restorative skincare, premium cosmetics, and captivating designer fragrances.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80',
    active: true,
    subcategories: ['Perfumes', 'Cosmetics', 'Serums', 'Skincare', 'Body Care'],
    createdAt: Date.now() - 6000000,
  },
  {
    id: 'cat-electronics',
    name: 'Audio & Electronics',
    slug: 'electronics',
    description: 'High-fidelity audio, wireless headphones, and smart electronic accessories.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    active: true,
    subcategories: ['Headphones', 'Earbuds', 'Speakers', 'Smart Accessories'],
    createdAt: Date.now() - 9000000,
  },
  {
    id: 'cat-accessories',
    name: 'Accessories & Watches',
    slug: 'accessories',
    description: 'Hand-finished leather goods, chronographs, and stylish carry essentials.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
    active: true,
    subcategories: ['Watches', 'Wallets', 'Eyewear', 'Bags'],
    createdAt: Date.now() - 7000000,
  },
  {
    id: 'cat-home',
    name: 'Home & Living',
    slug: 'home-decor',
    description: 'Ambient lighting, serene ceramics, and tasteful interior aesthetics.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
    active: true,
    subcategories: ['Lighting', 'Vases & Ceramics', 'Textiles', 'Kitchenware'],
    createdAt: Date.now() - 8000000,
  },
  {
    id: 'cat-fitness',
    name: 'Wellness & Fitness',
    slug: 'fitness',
    description: 'Ergonomic fitness gear, workout weights, and active lifestyle essentials.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
    active: true,
    subcategories: ['Weights', 'Mats', 'Recovery', 'Apparel'],
    createdAt: Date.now() - 5000000,
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'ATAL Acoustic Wireless ANC Headphones',
    slug: 'atal-acoustic-wireless-anc-headphones',
    description: 'Designed for sound purists and everyday listening. Featuring custom 45mm dynamic drivers, active noise cancellation with 4 transparency mics, memory foam pads, and up to 48 hours of lossless playback over Bluetooth 5.4 or Type-C.',
    categoryId: 'cat-electronics',
    categoryName: 'Audio & Electronics',
    subcategoryId: 'Headphones',
    brand: 'ATAL Sound',
    price: 18500,
    compareAtPrice: 22000,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=85'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    sku: 'ATAL-HP-001',
    stock: 24,
    rating: 4.9,
    reviewCount: 148,
    tags: ['wireless', 'noise-cancelling', 'headphones', 'bluetooth', 'electronics'],
    featured: true,
    bestSeller: true,
    newArrival: false,
    active: true,
    variations: [
      {
        id: 'var-1-black',
        type: 'color',
        name: 'Midnight Matte Black',
        value: '#18181b',
        sku: 'ATAL-HP-001-BLK',
        price: 18500,
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-1-silver',
        type: 'color',
        name: 'Brushed Arctic Silver',
        value: '#cbd5e1',
        sku: 'ATAL-HP-001-SLV',
        price: 18500,
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-1-sand',
        type: 'color',
        name: 'Desert Dune Khaki',
        value: '#d6c7b2',
        sku: 'ATAL-HP-001-SND',
        price: 19500,
        stock: 4,
        images: [
          'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-1-edition-std',
        type: 'size',
        name: 'Standard Wireless ANC',
        value: 'Standard Edition',
        sku: 'ATAL-HP-001-STD',
        price: 18500,
        stock: 16
      },
      {
        id: 'var-1-edition-pro',
        type: 'size',
        name: 'Studio Pro (+ DAC Cable & Hardcase)',
        value: 'Studio Pro Bundle',
        sku: 'ATAL-HP-001-PRO',
        price: 21500,
        stock: 8
      }
    ],
    specifications: [
      { name: 'Driver Size', value: '45mm Neodymium Titanium' },
      { name: 'Frequency Response', value: '10Hz – 40,000Hz' },
      { name: 'Battery Life', value: '48h (ANC On), 65h (ANC Off)' },
      { name: 'Connectivity', value: 'Bluetooth 5.4, 3.5mm Aux, USB-C DAC' },
      { name: 'Weight', value: '254g' }
    ],
    createdAt: Date.now() - 4000000,
    updatedAt: Date.now() - 4000000
  },
  {
    id: 'prod-2',
    name: 'ATAL Minimalist Chronograph Watch',
    slug: 'atal-minimalist-chronograph-watch',
    description: 'Precision Japanese quartz movement housed in surgical 316L stainless steel with a scratch-resistant sapphire crystal dome. Paired with genuine leather straps.',
    categoryId: 'cat-accessories',
    categoryName: 'Accessories & Watches',
    subcategoryId: 'Watches',
    brand: 'ATAL Timepieces',
    price: 14500,
    compareAtPrice: 17000,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    sku: 'ATAL-CH-40',
    stock: 18,
    rating: 4.8,
    reviewCount: 92,
    tags: ['watch', 'chronograph', 'leather', 'accessories'],
    featured: true,
    bestSeller: false,
    newArrival: true,
    active: true,
    variations: [
      {
        id: 'var-2-silver',
        type: 'color',
        name: 'Monochrome Silver & Slate',
        value: '#94a3b8',
        sku: 'ATAL-CH-40-SLV',
        price: 14500,
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-2-gold',
        type: 'color',
        name: 'Rose Gold & Saddle Tan',
        value: '#b45309',
        sku: 'ATAL-CH-40-RGD',
        price: 15500,
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-2-size-38',
        type: 'size',
        name: '38mm Minimalist Dial',
        value: '38mm',
        sku: 'ATAL-CH-38',
        price: 14500,
        stock: 10
      },
      {
        id: 'var-2-size-42',
        type: 'size',
        name: '42mm Executive Chrono',
        value: '42mm',
        sku: 'ATAL-CH-42',
        price: 15500,
        stock: 8
      }
    ],
    specifications: [
      { name: 'Case Diameter', value: '38mm / 42mm' },
      { name: 'Water Resistance', value: '5 ATM (50 Meters)' },
      { name: 'Glass', value: 'Sapphire Crystal with Anti-Reflective Coating' },
      { name: 'Strap', value: 'Full-Grain Leather (20mm)' }
    ],
    createdAt: Date.now() - 3500000,
    updatedAt: Date.now() - 3500000
  },
  {
    id: 'prod-3',
    name: 'Architectural Ceramic Table Lamp',
    slug: 'architectural-ceramic-table-lamp',
    description: 'Sculptural silhouette formed using tactile stoneware. Emits a warm, diffused 2700K ambient illumination through a linen-wrapped conical shade with brass rotary dimmer.',
    categoryId: 'cat-home',
    categoryName: 'Home & Living',
    subcategoryId: 'Lighting',
    brand: 'ATAL Home',
    price: 9500,
    compareAtPrice: 11500,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=85'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    sku: 'ATAL-TL-02',
    stock: 14,
    rating: 4.9,
    reviewCount: 64,
    tags: ['lighting', 'ceramic', 'decor', 'minimalist'],
    featured: true,
    bestSeller: true,
    newArrival: false,
    active: true,
    variations: [
      {
        id: 'var-3-cream',
        type: 'color',
        name: 'Textured Chalk White',
        value: '#f5f5f4',
        sku: 'ATAL-TL-02-WHT',
        price: 9500,
        stock: 9,
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-3-terracotta',
        type: 'color',
        name: 'Warm Earth Terracotta',
        value: '#c2410c',
        sku: 'ATAL-TL-02-TER',
        price: 10500,
        stock: 5,
        images: [
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-3-size-std',
        type: 'size',
        name: 'Standard Table 38cm',
        value: '38cm',
        sku: 'ATAL-TL-38',
        price: 9500,
        stock: 8
      },
      {
        id: 'var-3-size-tall',
        type: 'size',
        name: 'Tall Statement 52cm',
        value: '52cm',
        sku: 'ATAL-TL-52',
        price: 12500,
        stock: 6
      }
    ],
    specifications: [
      { name: 'Dimensions', value: '38cm H x 24cm W / 52cm H' },
      { name: 'Materials', value: 'Ceramic Stoneware, Raw Brass, Linen Shade' },
      { name: 'Bulb Fitting', value: 'E27 warm LED 6W included' }
    ],
    createdAt: Date.now() - 3000000,
    updatedAt: Date.now() - 3000000
  },
  {
    id: 'prod-4',
    name: 'Oversized French Terry Cotton Hoodie',
    slug: 'oversized-french-terry-cotton-hoodie',
    description: 'Heavyweight custom-milled French terry cotton. Drop-shoulder relaxed drape, double-layered hood without drawstrings for clean aesthetic, and reinforced ribbing.',
    categoryId: 'cat-fashion',
    categoryName: 'Fashion & Apparel',
    subcategoryId: 'Tops',
    brand: 'ATAL Fashion',
    price: 6800,
    compareAtPrice: 8200,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    sku: 'ATAL-HD-500',
    stock: 45,
    rating: 4.7,
    reviewCount: 210,
    tags: ['hoodie', 'fashion', 'streetwear', 'apparel'],
    featured: false,
    bestSeller: true,
    newArrival: true,
    active: true,
    variations: [
      {
        id: 'var-4-washed-black',
        type: 'color',
        name: 'Washed Charcoal Black',
        value: '#27272a',
        sku: 'ATAL-HD-500-BLK',
        price: 6800,
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-4-oatmeal',
        type: 'color',
        name: 'Heather Oatmeal Cream',
        value: '#e7e5e4',
        sku: 'ATAL-HD-500-OAT',
        price: 6800,
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-4-forest',
        type: 'color',
        name: 'Deep Forest Pine',
        value: '#14532d',
        sku: 'ATAL-HD-500-PNE',
        price: 7200,
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-4-size-s',
        type: 'size',
        name: 'Small (S)',
        value: 'S',
        sku: 'ATAL-HD-S',
        price: 6800,
        stock: 8
      },
      {
        id: 'var-4-size-m',
        type: 'size',
        name: 'Medium (M)',
        value: 'M',
        sku: 'ATAL-HD-M',
        price: 6800,
        stock: 15
      },
      {
        id: 'var-4-size-l',
        type: 'size',
        name: 'Large (L)',
        value: 'L',
        sku: 'ATAL-HD-L',
        price: 6800,
        stock: 12
      },
      {
        id: 'var-4-size-xl',
        type: 'size',
        name: 'Extra Large (XL)',
        value: 'XL',
        sku: 'ATAL-HD-XL',
        price: 7200,
        stock: 10
      }
    ],
    specifications: [
      { name: 'Fabric', value: '100% Premium 500 GSM French Terry Cotton' },
      { name: 'Fit', value: 'Oversized Boxy Silhouette' },
      { name: 'Care', value: 'Machine wash cold inside out' }
    ],
    createdAt: Date.now() - 2500000,
    updatedAt: Date.now() - 2500000
  },
  {
    id: 'prod-5',
    name: 'Botanical Multi-Peptide Restorative Serum',
    slug: 'botanical-multi-peptide-restorative-serum',
    description: 'An intensive biomimetic skincare concentrate formulated with copper tripeptides, niacinamide, and botanical extracts to stimulate cellular hydration, diminish fine lines, and restore glowing elasticity.',
    categoryId: 'cat-beauty',
    categoryName: 'Beauty, Cosmetics & Perfumes',
    subcategoryId: 'Serums',
    brand: 'ATAL Beauty',
    price: 4500,
    compareAtPrice: 5500,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1608248597359-0099859f518e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    sku: 'ATAL-SRM-50',
    stock: 35,
    rating: 4.9,
    reviewCount: 118,
    tags: ['skincare', 'serum', 'beauty', 'cosmetics'],
    featured: true,
    bestSeller: false,
    newArrival: true,
    active: true,
    variations: [
      {
        id: 'var-5-hydrating',
        type: 'color',
        name: 'Multi-Peptide Deep Hydration',
        value: '#38bdf8',
        sku: 'ATAL-SRM-HYD',
        price: 4500,
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1608248597359-0099859f518e?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-5-glow',
        type: 'color',
        name: 'Vitamin C Radiance Glow',
        value: '#f59e0b',
        sku: 'ATAL-SRM-GLW',
        price: 4800,
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1608248597359-0099859f518e?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-5-30ml',
        type: 'size',
        name: 'Standard 30ml Dropper',
        value: '30ml',
        sku: 'ATAL-SRM-30',
        price: 4500,
        stock: 25
      },
      {
        id: 'var-5-50ml',
        type: 'size',
        name: 'Jumbo Refill 50ml',
        value: '50ml',
        sku: 'ATAL-SRM-50',
        price: 6200,
        stock: 10
      }
    ],
    specifications: [
      { name: 'Volume', value: '30ml / 50ml' },
      { name: 'Skin Types', value: 'All skin types, sensitive friendly' },
      { name: 'Actives', value: 'Copper Tripeptide-1, Niacinamide (5%)' }
    ],
    createdAt: Date.now() - 2000000,
    updatedAt: Date.now() - 2000000
  },
  {
    id: 'prod-6',
    name: 'Precision Cast Matte Dumbbell Set',
    slug: 'precision-cast-matte-dumbbell-set',
    description: 'Forged from high-density solid cast iron enveloped in non-slip food-grade silicone matte composite. Engineered with gentle geometric anti-roll edges and ergonomic knurled stainless grips.',
    categoryId: 'cat-fitness',
    categoryName: 'Wellness & Fitness',
    subcategoryId: 'Weights',
    brand: 'ATAL Fitness',
    price: 8900,
    compareAtPrice: 10500,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    sku: 'ATAL-DB-PAIR',
    stock: 22,
    rating: 4.8,
    reviewCount: 76,
    tags: ['fitness', 'weights', 'home-gym', 'dumbbells'],
    featured: false,
    bestSeller: false,
    newArrival: true,
    active: true,
    variations: [
      {
        id: 'var-6-obsidian',
        type: 'color',
        name: 'Obsidian Matte Black',
        value: '#09090b',
        sku: 'ATAL-DB-OBS-10',
        price: 8900,
        stock: 14,
        images: [
          'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-6-sage',
        type: 'color',
        name: 'Nordic Sage Slate',
        value: '#475569',
        sku: 'ATAL-DB-SGE-10',
        price: 9500,
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-6-size-5kg',
        type: 'size',
        name: '5kg Pair (Light Conditioning)',
        value: '5kg Pair',
        sku: 'ATAL-DB-5KG',
        price: 6500,
        stock: 10
      },
      {
        id: 'var-6-size-10kg',
        type: 'size',
        name: '10kg Pair (Standard Strength)',
        value: '10kg Pair',
        sku: 'ATAL-DB-10KG',
        price: 8900,
        stock: 12
      }
    ],
    specifications: [
      { name: 'Pair Weight', value: 'Set of two (5kg / 10kg)' },
      { name: 'Grip', value: '32mm Ergonomic knurl' },
      { name: 'Coating', value: 'Impact-absorbing matte silicone coating' }
    ],
    createdAt: Date.now() - 1500000,
    updatedAt: Date.now() - 1500000
  },
  {
    id: 'prod-7',
    name: 'Handcrafted Genuine Leather Weekender Bag',
    slug: 'handcrafted-genuine-leather-weekender-bag',
    description: 'Handcrafted from full-grain bovine leather with solid brass hardware, water-resistant twill lining, padded laptop chamber, and dedicated shoe compartment.',
    categoryId: 'cat-accessories',
    categoryName: 'Accessories & Watches',
    subcategoryId: 'Bags',
    brand: 'ATAL Carry',
    price: 24500,
    compareAtPrice: 28000,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    sku: 'ATAL-WKND-01',
    stock: 12,
    rating: 5.0,
    reviewCount: 51,
    tags: ['bag', 'travel', 'leather', 'accessories'],
    featured: true,
    bestSeller: true,
    newArrival: false,
    active: true,
    variations: [
      {
        id: 'var-7-cognac',
        type: 'color',
        name: 'Heritage Cognac Brown',
        value: '#78350f',
        sku: 'ATAL-WKND-CGN',
        price: 24500,
        stock: 7,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-7-black',
        type: 'color',
        name: 'Onyx Black Leather',
        value: '#1c1917',
        sku: 'ATAL-WKND-BLK',
        price: 24500,
        stock: 5,
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-7-size-carryon',
        type: 'size',
        name: '32L Cabin Carry-On',
        value: '32L',
        sku: 'ATAL-WKND-32L',
        price: 22500,
        stock: 6
      },
      {
        id: 'var-7-size-weekender',
        type: 'size',
        name: '42L Classic Weekender',
        value: '42L',
        sku: 'ATAL-WKND-42L',
        price: 24500,
        stock: 6
      }
    ],
    specifications: [
      { name: 'Dimensions', value: '52cm x 28cm x 26cm' },
      { name: 'Capacity', value: '32L / 42L' },
      { name: 'Material', value: 'Full-Grain Genuine Cowhide Leather' }
    ],
    createdAt: Date.now() - 1000000,
    updatedAt: Date.now() - 1000000
  },
  {
    id: 'prod-8',
    name: 'Smart Ambient Sunrise Alarm & Speaker',
    slug: 'smart-ambient-sunrise-alarm-speaker',
    description: 'Wake up naturally with circadian color gradients replicating biological dawn. Enclosed in woven wool acoustic fabric with a hidden LED matrix clock face and warm 360-degree ambient acoustic sound.',
    categoryId: 'cat-electronics',
    categoryName: 'Audio & Electronics',
    subcategoryId: 'Smart Accessories',
    brand: 'ATAL Sound',
    price: 9200,
    compareAtPrice: 11000,
    images: [
      'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80',
    sku: 'ATAL-SR-CLK',
    stock: 28,
    rating: 4.7,
    reviewCount: 89,
    tags: ['smart-home', 'speaker', 'alarm', 'electronics'],
    featured: false,
    bestSeller: false,
    newArrival: true,
    active: true,
    variations: [
      {
        id: 'var-8-stone',
        type: 'color',
        name: 'Warm Stone Gray',
        value: '#71717a',
        sku: 'ATAL-SR-STN',
        price: 9200,
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-8-chalk',
        type: 'color',
        name: 'Chalk White Wool',
        value: '#f4f4f5',
        sku: 'ATAL-SR-WHT',
        price: 9200,
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-8-size-standard',
        type: 'size',
        name: 'Standard Bedside 15W',
        value: 'Standard 15W',
        sku: 'ATAL-SR-15W',
        price: 9200,
        stock: 18
      },
      {
        id: 'var-8-size-max',
        type: 'size',
        name: 'SoundPro Max 30W Stereo',
        value: 'SoundPro 30W',
        sku: 'ATAL-SR-30W',
        price: 11900,
        stock: 10
      }
    ],
    specifications: [
      { name: 'Light Spectrum', value: 'Full gamut warm sunrise simulation' },
      { name: 'Audio Drivers', value: 'Dual 2-inch full range speaker' }
    ],
    createdAt: Date.now() - 500000,
    updatedAt: Date.now() - 500000
  },
  {
    id: 'prod-9',
    name: 'Velvet Rose & Smoked Amber Eau De Parfum (100ml)',
    slug: 'velvet-rose-smoked-amber-eau-de-parfum',
    description: 'An alluring, long-lasting luxury fragrance crafted with Turkish velvet rose, dark plum, spiced cardamom, and warm smoked amber. Designed for refined day and evening occasions.',
    categoryId: 'cat-beauty',
    categoryName: 'Beauty, Cosmetics & Perfumes',
    subcategoryId: 'Perfumes',
    brand: 'ATAL Fragrances',
    price: 8500,
    compareAtPrice: 10500,
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    sku: 'ATAL-PRF-100',
    stock: 30,
    rating: 4.9,
    reviewCount: 84,
    tags: ['perfume', 'fragrance', 'beauty', 'cosmetics'],
    featured: true,
    bestSeller: true,
    newArrival: true,
    active: true,
    variations: [
      {
        id: 'var-9-scent-rose',
        type: 'color',
        name: 'Velvet Rose & Smoked Amber',
        value: '#e11d48',
        sku: 'ATAL-PRF-ROSE',
        price: 8500,
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-9-scent-oud',
        type: 'color',
        name: 'Royal Cambodian Oud Noir',
        value: '#78350f',
        sku: 'ATAL-PRF-OUD',
        price: 9200,
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85'
        ]
      },
      {
        id: 'var-9-50ml',
        type: 'size',
        name: 'Travel Flacon 50ml',
        value: '50ml',
        sku: 'ATAL-PRF-50',
        price: 5200,
        stock: 10
      },
      {
        id: 'var-9-100ml',
        type: 'size',
        name: 'Full Bottle 100ml',
        value: '100ml',
        sku: 'ATAL-PRF-100',
        price: 8500,
        stock: 20
      }
    ],
    specifications: [
      { name: 'Concentration', value: 'Eau de Parfum (22% Oil concentration)' },
      { name: 'Top Notes', value: 'Turkish Rose, Saffron, Plum' },
      { name: 'Base Notes', value: 'Smoked Amber, Madagascar Vanilla, Cedarwood' }
    ],
    createdAt: Date.now() - 200000,
    updatedAt: Date.now() - 200000
  }
];

export const INITIAL_CAROUSEL_SLIDES = [
  {
    id: 'slide-1',
    productId: 'prod-4',
    badge: 'Signature Perfumery',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    title: 'ATAL Royal Oud Eau De Parfum (100ml)',
    subtitle: 'Long-Lasting Luxury Scents',
    description: 'Rare Cambodian oud infused with Damask rose, warm tonka bean, amber and smoked woods for an unforgettable, rich aura.',
    priceTag: 'PKR 8,900',
    originalPrice: 11500,
    discountPrice: 8900,
    discountTag: 'Save PKR 2,600 (23% OFF)',
    buttonText: 'Buy Now',
    buttonLink: 'prod-4',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
    bgGradient: 'from-amber-950 via-stone-900 to-stone-950',
    active: true,
    order: 1,
    createdAt: Date.now() - 50000,
    updatedAt: Date.now() - 50000
  },
  {
    id: 'slide-2',
    productId: 'prod-5',
    badge: 'Skin Radiance Formula',
    badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    title: 'Botanical Velvet Lip & Glow Serum Kit',
    subtitle: 'Pure Glow, Clean Ingredients',
    description: 'Elevate your daily ritual with botanical-infused hydrating serums, matte velvet lips, and high-performance vitamin C complexes.',
    priceTag: 'PKR 4,800',
    originalPrice: 6200,
    discountPrice: 4800,
    discountTag: 'Save PKR 1,400 (22% OFF)',
    buttonText: 'Buy Now',
    buttonLink: 'prod-5',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85',
    bgGradient: 'from-emerald-950 via-stone-900 to-teal-950',
    active: true,
    order: 2,
    createdAt: Date.now() - 40000,
    updatedAt: Date.now() - 40000
  },
  {
    id: 'slide-3',
    productId: 'prod-1',
    badge: 'High-Fidelity Hardware',
    badgeColor: 'bg-sky-100 text-sky-950 border-sky-300',
    title: 'Acoustic Studio Wireless ANC Headphones',
    subtitle: 'Pure Acoustic Immersion',
    description: 'Dynamic titanium drivers, adaptive 40dB active noise cancellation, and ultra-fast type-C charging with 48 hours continuous battery.',
    priceTag: 'PKR 14,500',
    originalPrice: 18500,
    discountPrice: 14500,
    discountTag: 'Save PKR 4,000 (22% OFF)',
    buttonText: 'Buy Now',
    buttonLink: 'prod-1',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
    bgGradient: 'from-slate-900 via-stone-900 to-sky-950',
    active: true,
    order: 3,
    createdAt: Date.now() - 30000,
    updatedAt: Date.now() - 30000
  },
  {
    id: 'slide-4',
    productId: 'prod-2',
    badge: 'Luxury Timepieces',
    badgeColor: 'bg-rose-100 text-rose-950 border-rose-300',
    title: 'ATAL Minimalist Chronograph Watch',
    subtitle: 'Surgical Steel & Sapphire Dome',
    description: 'Precision Japanese quartz movement housed in surgical 316L stainless steel with a scratch-resistant sapphire crystal dome and leather straps.',
    priceTag: 'PKR 14,500',
    originalPrice: 17000,
    discountPrice: 14500,
    discountTag: 'Save PKR 2,500 (15% OFF)',
    buttonText: 'Buy Now',
    buttonLink: 'prod-2',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
    bgGradient: 'from-stone-900 via-stone-850 to-neutral-900',
    active: true,
    order: 4,
    createdAt: Date.now() - 20000,
    updatedAt: Date.now() - 20000
  },
  {
    id: 'slide-5',
    productId: 'prod-3',
    badge: 'Organic Apparel',
    badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    title: 'Raw Edge Heavyweight Organic Hoodie',
    subtitle: '500 GSM Portuguese Terry Cotton',
    description: 'Custom-milled heavyweight organic cotton French terry, pre-shrunk with garment dye finish and minimal tonal chest embroidery.',
    priceTag: 'PKR 7,800',
    originalPrice: 9500,
    discountPrice: 7800,
    discountTag: 'Save PKR 1,700 (18% OFF)',
    buttonText: 'Buy Now',
    buttonLink: 'prod-3',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
    bgGradient: 'from-emerald-900 via-teal-900 to-stone-950',
    active: true,
    order: 5,
    createdAt: Date.now() - 10000,
    updatedAt: Date.now() - 10000
  }
];

