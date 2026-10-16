/**
 * Utility functions for generating, normalizing, and verifying SEO-friendly product URLs and slugs.
 */

/**
 * Converts any string into a clean, human-readable, SEO-friendly slug.
 * - Converts to lowercase
 * - Strips accents/diacritics
 * - Replaces non-alphanumeric characters with hyphens
 * - Collapses repeated hyphens and trims leading/trailing hyphens
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFKD') // decompose unicode accents
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special symbols
    .replace(/[\s_]+/g, '-') // convert whitespace and underscores to hyphens
    .replace(/-+/g, '-') // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ''); // trim leading and trailing hyphens
}

/**
 * Generates an SEO-friendly slug and guarantees that it is 100% unique across all products in the store.
 * If another product already uses the slug, it automatically appends an incremental suffix (-2, -3, etc.).
 *
 * @param desiredNameOrSlug The product title or desired slug
 * @param existingProducts Array of existing products to check collisions against
 * @param currentProductId Optional ID of the product currently being edited (allows keeping its own slug)
 */
export function generateUniqueProductSlug(
  desiredNameOrSlug: string,
  existingProducts: Array<{ id: string; slug?: string; name?: string }> = [],
  currentProductId?: string
): string {
  let baseSlug = slugify(desiredNameOrSlug);
  if (!baseSlug) {
    baseSlug = `product-${Date.now().toString(36)}`;
  }

  // Set of all other product slugs currently registered
  const takenSlugs = new Set<string>();
  for (const prod of existingProducts) {
    if (prod && prod.id !== currentProductId && prod.slug) {
      takenSlugs.add(prod.slug.toLowerCase().trim());
    }
  }

  // If base slug is not taken, use it directly
  if (!takenSlugs.has(baseSlug)) {
    return baseSlug;
  }

  // Otherwise, automatically generate a unique slug by appending -2, -3, etc.
  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;
  while (takenSlugs.has(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Returns the canonical URL path for a product: /products/:slug
 */
export function getProductUrl(product: { id: string; slug?: string }): string {
  const slug = product.slug ? slugify(product.slug) : product.id;
  return `/products/${encodeURIComponent(slug)}`;
}

/**
 * Extracts a product identifier (slug or ID) from current window location.
 * Supports:
 * - /products/:slug or /products/:slug/
 * - /product/:slug or /product/:slug/
 * - Subpaths like /store/products/:slug
 * - Hash paths: #/products/:slug, #products/:slug, #product-:slug
 * - Query parameters: ?product=:slugOrId, ?prod=:slugOrId, ?slug=:slugOrId
 */
export function extractProductSlugFromLocation(
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '',
  search: string = typeof window !== 'undefined' ? window.location.search : '',
  hash: string = typeof window !== 'undefined' ? window.location.hash : ''
): string | null {
  // 1. Direct path check /(?:products|product)/:slug
  if (pathname) {
    const cleanPath = pathname.replace(/\/+$/, '');
    const pathMatch = cleanPath.match(/(?:^|\/)(?:products|product)\/([^/?#]+)/i);
    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1]).trim();
    }
  }

  // 2. Query parameter check ?product=... or ?prod=... or ?slug=...
  if (search) {
    const params = new URLSearchParams(search);
    const paramVal = params.get('product') || params.get('prod') || params.get('slug');
    if (paramVal) {
      return decodeURIComponent(paramVal).trim();
    }
  }

  // 3. Hash routing check: #/products/:slug or #products/:slug or #product-:slug
  if (hash) {
    const hashClean = hash.replace(/^#\/?/, '');
    const hashPathMatch = hashClean.match(/(?:^|\/)(?:products|product)\/([^/?#]+)/i);
    if (hashPathMatch && hashPathMatch[1]) {
      return decodeURIComponent(hashPathMatch[1]).trim();
    }
    if (hash.startsWith('#product-')) {
      return decodeURIComponent(hash.replace('#product-', '')).trim();
    }
    if (hash.startsWith('#prod-')) {
      return decodeURIComponent(hash.replace('#', '')).trim();
    }
  }

  return null;
}

/**
 * High-speed resilient catalog lookup.
 * Finds a product in memory with zero network delay using:
 * 1. Normalized slug match
 * 2. Case-insensitive slug match
 * 3. Product ID match
 * 4. Slugified product name match
 * 5. Partial/fuzzy slug or name token match
 */
export function findProductInCatalog<T extends { id: string; slug?: string; name?: string }>(
  products: T[],
  identifier: string
): T | null {
  if (!identifier || !products || products.length === 0) return null;
  const clean = identifier.trim();
  const targetNorm = slugify(clean);
  const targetLower = clean.toLowerCase();

  // 1. Exact normalized slug
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p.slug && slugify(p.slug) === targetNorm) return p;
  }

  // 2. Exact raw slug case-insensitive
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p.slug && p.slug.toLowerCase() === targetLower) return p;
  }

  // 3. Exact ID match
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p.id && p.id.toLowerCase() === targetLower) return p;
  }

  // 4. Exact product name slugified
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (p.name && slugify(p.name) === targetNorm) return p;
  }

  // 5. Substring slug match (e.g. "wireless-earbuds" matches "wireless-earbuds-pro")
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const pSlug = p.slug ? slugify(p.slug) : slugify(p.name || '');
    if (pSlug && (pSlug.includes(targetNorm) || targetNorm.includes(pSlug))) {
      return p;
    }
  }

  // 6. Keywords match across name words
  const words = targetNorm.split('-').filter(w => w.length > 2);
  if (words.length > 0) {
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const pNameNorm = slugify(p.name || '');
      if (words.every(w => pNameNorm.includes(w))) {
        return p;
      }
    }
  }

  return null;
}
