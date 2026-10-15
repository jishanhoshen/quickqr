// Service Worker for Quick QR Extension

// Context Menu IDs
const MENU_DOWNLOAD = 'quickqr-download-image';
const MENU_COPY = 'quickqr-copy-url';
const MENU_FIND_ALL = 'quickqr-find-all';

// Create context menus on install
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

function createContextMenus() {
  // Remove existing menus if any
  chrome.contextMenus.removeAll(() => {
    // Download image with Quick QR
    chrome.contextMenus.create({
      id: MENU_DOWNLOAD,
      title: 'Download image with Quick QR',
      contexts: ['image']
    });

    // Copy image URL
    chrome.contextMenus.create({
      id: MENU_COPY,
      title: 'Copy image URL',
      contexts: ['image']
    });

    // Find all images on this page
    chrome.contextMenus.create({
      id: MENU_FIND_ALL,
      title: 'Find all images on this page',
      contexts: ['image']
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.srcUrl) return;

  switch (info.menuItemId) {
    case MENU_DOWNLOAD:
      downloadImage(info.srcUrl, tab);
      break;
    case MENU_COPY:
      copyImageUrl(info.srcUrl, tab);
      break;
    case MENU_FIND_ALL:
      findAllImages(tab);
      break;
  }
});

// Download image
function downloadImage(url, tab) {
  const filename = getFilenameFromUrl(url);
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: false
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error('Download failed:', chrome.runtime.lastError);
      // Fallback: open in new tab
      chrome.tabs.create({ url: url });
    }
  });
}

// Copy image URL to clipboard
function copyImageUrl(url, tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (urlToCopy) => {
      navigator.clipboard.writeText(urlToCopy).then(() => {
        // Could show a notification here
        console.log('URL copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    },
    args: [url]
  });
}

// Find all images - open extension gallery page
function findAllImages(tab) {
  // Open a new tab with the extension's image gallery
  chrome.tabs.create({
    url: chrome.runtime.getURL('gallery.html?tabId=' + tab.id)
  });
}

// Get filename from URL
function getFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    if (filename && filename.includes('.')) {
      return filename;
    }
    const timestamp = Date.now();
    return `image-${timestamp}.png`;
  } catch (e) {
    const timestamp = Date.now();
    return `image-${timestamp}.png`;
  }
}
