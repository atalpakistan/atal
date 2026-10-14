import { Product } from '../types';

const STORE_NAME = 'ATAL';
const STORE_TAGLINE = 'Shop Smart. Live Better. 🛍️';
const DEFAULT_TITLE = 'ATAL – Shop Smart. Live Better.';
const DEFAULT_DESCRIPTION = 'ATAL – Shop Smart. Live Better. 🛍️ Your trusted online store for beauty, cosmetics, perfumes, fashion & electronics—quality products, stylish choices, and easy shopping, all in one place.';

function setMetaTag(selector: string, attribute: string, value: string, createIfMissing: { name?: string; property?: string }): void {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    if (createIfMissing.name) element.setAttribute('name', createIfMissing.name);
    if (createIfMissing.property) element.setAttribute('property', createIfMissing.property);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function setCanonical(url: string): void {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setStructuredData(id: string, data: object): void {
  if (typeof document === 'undefined') return;
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

function removeStructuredData(id: string): void {
  if (typeof document === 'undefined') return;
  const script = document.getElementById(id);
  if (script && script.parentNode) {
    script.parentNode.removeChild(script);
  }
}

/**
 * Updates document head with rich SEO metadata for an individual product page.
 */
export function updateProductSeo(product: Product): void {
  if (typeof window === 'undefined' || !product) return;

  const origin = window.location.origin;
  const productUrl = `${origin}/products/${encodeURIComponent(product.slug || product.id)}`;
  const title = `${product.name} | ${STORE_NAME}`;
  const rawDescription = product.description
    ? product.description.replace(/\s+/g, ' ').trim()
    : `Buy ${product.name} by ${product.brand || 'ATAL'} online in Pakistan with fast delivery and Cash on Delivery at ATAL online store.`;
  const metaDescription = rawDescription.length > 160 ? rawDescription.slice(0, 157) + '...' : rawDescription;
  const imageUrl = product.thumbnail || product.images?.[0] || `${origin}/atal-logo.jpg`;

  // 1. Page Title
  document.title = title;

  // 2. Canonical URL
  setCanonical(productUrl);

  // 3. Standard Meta Description
  setMetaTag('meta[name="description"]', 'content', metaDescription, { name: 'description' });

  // 4. OpenGraph Tags
  setMetaTag('meta[property="og:title"]', 'content', title, { property: 'og:title' });
  setMetaTag('meta[property="og:description"]', 'content', metaDescription, { property: 'og:description' });
  setMetaTag('meta[property="og:url"]', 'content', productUrl, { property: 'og:url' });
  setMetaTag('meta[property="og:image"]', 'content', imageUrl, { property: 'og:image' });
  setMetaTag('meta[property="og:type"]', 'content', 'product', { property: 'og:type' });
  setMetaTag('meta[property="og:site_name"]', 'content', STORE_NAME, { property: 'og:site_name' });
  setMetaTag('meta[property="product:price:amount"]', 'content', product.price.toString(), { property: 'product:price:amount' });
  setMetaTag('meta[property="product:price:currency"]', 'content', 'PKR', { property: 'product:price:currency' });

  // 5. Twitter Card Tags
  setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image', { name: 'twitter:card' });
  setMetaTag('meta[name="twitter:title"]', 'content', title, { name: 'twitter:title' });
  setMetaTag('meta[name="twitter:description"]', 'content', metaDescription, { name: 'twitter:description' });
  setMetaTag('meta[name="twitter:image"]', 'content', imageUrl, { name: 'twitter:image' });

  // 6. Schema.org JSON-LD Structured Data for Product
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images && product.images.length > 0 ? product.images : [imageUrl],
    description: metaDescription,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || STORE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'PKR',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: (product.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: STORE_NAME
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 5.0,
      reviewCount: product.reviewCount || 1,
      bestRating: 5,
      worstRating: 1
    }
  };

  setStructuredData('product-json-ld', productSchema);
}

/**
 * Resets document SEO back to general store branding when exiting a product page.
 */
export function resetStoreSeo(): void {
  if (typeof window === 'undefined') return;
  const origin = window.location.origin;

  document.title = DEFAULT_TITLE;
  setCanonical(origin);
  setMetaTag('meta[name="description"]', 'content', DEFAULT_DESCRIPTION, { name: 'description' });
  setMetaTag('meta[property="og:title"]', 'content', DEFAULT_TITLE, { property: 'og:title' });
  setMetaTag('meta[property="og:description"]', 'content', DEFAULT_DESCRIPTION, { property: 'og:description' });
  setMetaTag('meta[property="og:url"]', 'content', origin, { property: 'og:url' });
  setMetaTag('meta[property="og:type"]', 'content', 'website', { property: 'og:type' });
  setMetaTag('meta[property="og:site_name"]', 'content', STORE_NAME, { property: 'og:site_name' });
  setMetaTag('meta[name="twitter:title"]', 'content', DEFAULT_TITLE, { name: 'twitter:title' });
  setMetaTag('meta[name="twitter:description"]', 'content', DEFAULT_DESCRIPTION, { name: 'twitter:description' });

  removeStructuredData('product-json-ld');
}
