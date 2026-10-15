// Content script for discovering images across the entire page

// Minimum image size threshold (configurable)
const MIN_IMAGE_SIZE = 32; // pixels

// MutationObserver for dynamic image detection
let observer = null;
let debounceTimer = null;

/**
 * Initialize MutationObserver to detect dynamically added images
 */
function initMutationObserver() {
  if (observer) return;

  observer = new MutationObserver((mutations) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // Notify popup that images may have changed
      chrome.runtime.sendMessage({ action: 'imagesChanged' });
    }, 500); // Debounce to avoid excessive notifications
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
}

// Initialize observer when script loads
initMutationObserver();

/**
 * Resolve a URL relative to a base URL
 */
function resolveUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).href;
  } catch (e) {
    return url; // Return as-is if resolution fails
  }
}

/**
 * Get the document base URL
 */
function getBaseUrl() {
  const baseElement = document.querySelector('base');
  if (baseElement && baseElement.href) {
    return baseElement.href;
  }
  return window.location.href;
}

/**
 * Extract image URLs from srcset attribute
 */
function extractSrcsetUrls(srcset, baseUrl) {
  if (!srcset) return [];
  const urls = [];
  const parts = srcset.split(',');
  for (const part of parts) {
    const urlPart = part.trim().split(/\s+/)[0];
    if (urlPart) {
      urls.push(resolveUrl(urlPart, baseUrl));
    }
  }
  return urls;
}

/**
 * Get the effective source URL of an image element
 */
function getImageSource(img, baseUrl) {
  // Try currentSrc first (browser-selected from srcset)
  if (img.currentSrc) {
    return img.currentSrc;
  }
  // Fallback to src
  if (img.src) {
    return img.src;
  }
  // Try srcset
  if (img.srcset) {
    const urls = extractSrcsetUrls(img.srcset, baseUrl);
    return urls[0] || null;
  }
  return null;
}

/**
 * Extract lazy-loading attributes from an element
 */
function extractLazyAttributes(element, baseUrl) {
  const lazyAttributes = [
    'data-src',
    'data-srcset',
    'data-original',
    'data-lazy-src',
    'data-url',
    'data-background',
    'data-bg',
    'data-img'
  ];

  const urls = [];
  for (const attr of lazyAttributes) {
    const value = element.getAttribute(attr);
    if (value) {
      if (attr.includes('srcset')) {
        urls.push(...extractSrcsetUrls(value, baseUrl));
      } else {
        urls.push(resolveUrl(value, baseUrl));
      }
    }
  }
  return urls;
}

/**
 * Extract images from <picture> and <source> elements
 */
function extractPictureImages(baseUrl) {
  const urls = [];
  const pictures = document.querySelectorAll('picture');

  for (const picture of pictures) {
    // Check <source> elements
    const sources = picture.querySelectorAll('source');
    for (const source of sources) {
      const srcset = source.srcset;
      if (srcset) {
        urls.push(...extractSrcsetUrls(srcset, baseUrl));
      }
    }

    // Check the fallback <img>
    const img = picture.querySelector('img');
    if (img) {
      const src = getImageSource(img, baseUrl);
      if (src) {
        urls.push(src);
      }
    }
  }

  return urls;
}

/**
 * Extract CSS background-image URLs from all elements
 */
function extractCssBackgroundImages(baseUrl) {
  const urls = [];
  const elements = document.querySelectorAll('*');

  for (const element of elements) {
    const style = window.getComputedStyle(element);
    const backgroundImage = style.backgroundImage;

    if (backgroundImage && backgroundImage !== 'none') {
      // Extract URL from background-image: url("...")
      const matches = backgroundImage.match(/url\(['"]?([^'")]+)['"]?\)/g);
      if (matches) {
        for (const match of matches) {
          const url = match.replace(/url\(['"]?|['"]?\)/g, '');
          if (url && !url.startsWith('data:')) {
            urls.push(resolveUrl(url, baseUrl));
          }
        }
      }
    }
  }

  return urls;
}

/**
 * Extract Open Graph and Twitter card images from meta tags
 */
function extractMetaImages(baseUrl) {
  const urls = [];
  const metaSelectors = [
    'meta[property="og:image"]',
    'meta[name="og:image"]',
    'meta[name="twitter:image"]',
    'meta[property="twitter:image"]',
    'meta[name="twitter:image:src"]'
  ];

  for (const selector of metaSelectors) {
    const meta = document.querySelector(selector);
    if (meta && meta.content) {
      urls.push(resolveUrl(meta.content, baseUrl));
    }
  }

  return urls;
}

/**
 * Extract images from <img> elements (all images, not just viewport)
 */
function extractImgElements(baseUrl) {
  const images = [];
  const imgElements = document.querySelectorAll('img');

  for (const img of imgElements) {
    const src = getImageSource(img, baseUrl);
    if (src) {
      // Include all images, even data URLs and tiny images
      const isLoaded = img.complete && img.naturalWidth > 0;

      images.push({
        src: src,
        naturalWidth: img.naturalWidth || 0,
        naturalHeight: img.naturalHeight || 0,
        width: img.width || 0,
        height: img.height || 0,
        alt: img.alt || '',
        sourceType: 'img',
        isLoaded: isLoaded
      });

      // Also check lazy attributes
      const lazyUrls = extractLazyAttributes(img, baseUrl);
      for (const lazyUrl of lazyUrls) {
        if (lazyUrl !== src) {
          images.push({
            src: lazyUrl,
            naturalWidth: 0,
            naturalHeight: 0,
            width: 0,
            height: 0,
            alt: img.alt || '',
            sourceType: 'lazy',
            isLoaded: false
          });
        }
      }
    }
  }

  return images;
}

/**
 * Discover all images from the page
 */
function discoverAllImages() {
  const baseUrl = getBaseUrl();
  const discoveredImages = [];
  const seenUrls = new Set();

  // Collect URLs from all sources
  const imageSources = [];

  // 1. <img> elements with metadata
  const imgImages = extractImgElements(baseUrl);
  imageSources.push(...imgImages);

  // 2. <picture> and <source> elements
  const pictureUrls = extractPictureImages(baseUrl);
  for (const url of pictureUrls) {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      imageSources.push({
        src: url,
        naturalWidth: 0,
        naturalHeight: 0,
        width: 0,
        height: 0,
        alt: '',
        sourceType: 'picture',
        isLoaded: false
      });
    }
  }

  // 3. CSS background images
  const bgUrls = extractCssBackgroundImages(baseUrl);
  for (const url of bgUrls) {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      imageSources.push({
        src: url,
        naturalWidth: 0,
        naturalHeight: 0,
        width: 0,
        height: 0,
        alt: '',
        sourceType: 'css-bg',
        isLoaded: false
      });
    }
  }

  // 4. Meta images (Open Graph, Twitter)
  const metaUrls = extractMetaImages(baseUrl);
  for (const url of metaUrls) {
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      imageSources.push({
        src: url,
        naturalWidth: 0,
        naturalHeight: 0,
        width: 0,
        height: 0,
        alt: '',
        sourceType: 'meta',
        isLoaded: false
      });
    }
  }

  // 5. Check other elements for lazy attributes
  const allElements = document.querySelectorAll('*');
  for (const element of allElements) {
    if (element.tagName !== 'IMG') {
      const lazyUrls = extractLazyAttributes(element, baseUrl);
      for (const url of lazyUrls) {
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          imageSources.push({
            src: url,
            naturalWidth: 0,
            naturalHeight: 0,
            width: 0,
            height: 0,
            alt: '',
            sourceType: 'lazy',
            isLoaded: false
          });
        }
      }
    }
  }

  // Return all images without size filtering
  return imageSources;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVisibleImages') {
    try {
      const images = discoverAllImages();
      sendResponse({ success: true, images });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  } else if (request.action === 'initObserver') {
    initMutationObserver();
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async response
});
