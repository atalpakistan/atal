/**
 * Image processing utilities for client-side uploads, resizing, and WebP/JPEG compression
 */

export interface ImageFormatInfo {
  format: string;
  isBase64: boolean;
  isExternal: boolean;
  mimeType: string;
  sizeEstimate?: string;
  recommendedSpec?: string;
  badgeColor: string;
}

export function getImageFormatInfo(src?: string, sectionType: 'carousel' | 'spotlight' | 'product' = 'product'): ImageFormatInfo {
  const recommendedSpecs = {
    carousel: 'Recommended: 16:9 or 1200×500px, WebP / JPG, < 250 KB for instant hero banner loading',
    spotlight: 'Recommended: 4:3 or 16:9, 1200×800px, WebP / JPG / PNG, < 300 KB for hardware showcase',
    product: 'Recommended: 1:1 Square (800×800px), WebP / PNG / JPG, clean white or studio background'
  };

  if (!src || !src.trim()) {
    return {
      format: 'No Image Attached',
      isBase64: false,
      isExternal: false,
      mimeType: 'none',
      recommendedSpec: recommendedSpecs[sectionType],
      badgeColor: 'bg-stone-100 text-stone-600 border-stone-200'
    };
  }

  if (src.startsWith('data:image/')) {
    const mime = src.substring(5, src.indexOf(';'));
    const formatName = mime.replace('image/', '').toUpperCase();
    const approxBytes = Math.round((src.length * 3) / 4);
    const sizeKb = Math.round(approxBytes / 1024);
    return {
      format: `Base64 ${formatName} (Embedded Data URL)`,
      isBase64: true,
      isExternal: false,
      mimeType: mime,
      sizeEstimate: `${sizeKb} KB`,
      recommendedSpec: recommendedSpecs[sectionType],
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
  }

  const clean = src.split('?')[0].toLowerCase();
  let format = 'JPEG / WebP (HTTPS Web Image)';
  let mime = 'image/jpeg';
  let badgeColor = 'bg-sky-100 text-sky-800 border-sky-300';

  if (clean.endsWith('.webp')) {
    format = 'WEBP (Modern Compressed Image)';
    mime = 'image/webp';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (clean.endsWith('.png')) {
    format = 'PNG (Lossless / Transparent Image)';
    mime = 'image/png';
    badgeColor = 'bg-purple-100 text-purple-800 border-purple-300';
  } else if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) {
    format = 'JPEG (High-Definition Photography)';
    mime = 'image/jpeg';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (clean.endsWith('.svg')) {
    format = 'SVG (Scalable Vector Graphic)';
    mime = 'image/svg+xml';
    badgeColor = 'bg-pink-100 text-pink-800 border-pink-300';
  } else if (clean.endsWith('.avif')) {
    format = 'AVIF (Next-Gen Ultra Compressed)';
    mime = 'image/avif';
    badgeColor = 'bg-teal-100 text-teal-800 border-teal-300';
  } else if (src.includes('unsplash.com')) {
    format = 'Unsplash CDN (Auto WebP / Dynamic JPG)';
    mime = 'image/webp';
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
  }

  return {
    format,
    isBase64: false,
    isExternal: true,
    mimeType: mime,
    recommendedSpec: recommendedSpecs[sectionType],
    badgeColor
  };
}

export async function processImageFile(file: File, maxWidth = 750, maxHeight = 750, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down proportionally to optimal web display dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Clean white background for transparent images to avoid black artifacts in JPEG/WebP
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for ultra-lightweight size (up to 70% smaller than JPG)
        try {
          let dataUrl = canvas.toDataURL('image/webp', quality);
          // If browser doesn't support WebP or returned PNG fallback, use optimized JPEG
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          // Safety check: if dataURL is still > 100KB, do a quick further reduction
          if (dataUrl.length > 130000) {
            const smallerCanvas = document.createElement('canvas');
            smallerCanvas.width = Math.round(width * 0.8);
            smallerCanvas.height = Math.round(height * 0.8);
            const sCtx = smallerCanvas.getContext('2d');
            if (sCtx) {
              sCtx.fillStyle = '#FFFFFF';
              sCtx.fillRect(0, 0, smallerCanvas.width, smallerCanvas.height);
              sCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
              dataUrl = smallerCanvas.toDataURL('image/jpeg', 0.68);
            }
          }

          resolve(dataUrl);
        } catch {
          try {
            resolve(canvas.toDataURL('image/jpeg', 0.72));
          } catch {
            resolve(event.target?.result as string);
          }
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image file.'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file from disk.'));
    };

    reader.readAsDataURL(file);
  });
}
