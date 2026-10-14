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
 * - /products/:slug
 * - /products/:slug/
 * - /product/:slug
 * - ?product=:slugOrId
 * - ?prod=:slugOrId
 * - #product-:slugOrId
 */
export function extractProductSlugFromLocation(
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '',
  search: string = typeof window !== 'undefined' ? window.location.search : '',
  hash: string = typeof window !== 'undefined' ? window.location.hash : ''
): string | null {
  // 1. Check path /products/:slug or /product/:slug
  const cleanPath = pathname.replace(/\/+$/, ''); // strip trailing slash
  const pathMatch = cleanPath.match(/^\/(?:products|product)\/([^/?#]+)/i);
  if (pathMatch && pathMatch[1]) {
    return decodeURIComponent(pathMatch[1]);
  }

  // 2. Check query params ?product=... or ?prod=...
  if (search) {
    const params = new URLSearchParams(search);
    const paramVal = params.get('product') || params.get('prod');
    if (paramVal) {
      return decodeURIComponent(paramVal);
    }
  }

  // 3. Check hash #product-...
  if (hash && hash.startsWith('#product-')) {
    return decodeURIComponent(hash.replace('#product-', ''));
  }

  return null;
}
