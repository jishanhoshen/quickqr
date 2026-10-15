document.addEventListener('DOMContentLoaded', function() {
  // Theme Management
  const themeToggle = document.getElementById('themeToggle');
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');

  // Load saved theme or detect system theme
  chrome.storage.local.get(['theme'], function(result) {
    if (result.theme) {
      applyTheme(result.theme);
    } else {
      // Detect system theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  }

  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    chrome.storage.local.set({ theme: newTheme });
  });

  // Listen for image changes from MutationObserver
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'imagesChanged') {
      // Auto-refresh images if on images tab
      const imagesTab = document.getElementById('imagesTab');
      if (imagesTab.classList.contains('active')) {
        loadImages();
      }
    }
  });

  // Tab Management
  const tabs = document.querySelectorAll('.tab');
  const qrTab = document.getElementById('qrTab');
  const imagesTab = document.getElementById('imagesTab');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');

      // Update tab buttons
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Update tab content
      if (tabName === 'qr') {
        qrTab.classList.add('active');
        imagesTab.classList.remove('active');
      } else {
        qrTab.classList.remove('active');
        imagesTab.classList.add('active');
        loadImages();
      }
    });
  });

  // QR Code Generation
  const qrcodeContainer = document.getElementById('qrcode');
  const errorElement = document.getElementById('error');
  const loadingElement = document.getElementById('loading');

  generateQRCode();

  function generateQRCode() {
    loadingElement.classList.remove('hidden');
    errorElement.classList.add('hidden');

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      loadingElement.classList.add('hidden');

      if (tabs.length === 0) {
        showError('No active tab found');
        return;
      }

      const tab = tabs[0];
      const url = tab.url;

      if (!url) {
        showError('Unable to get URL from current tab');
        return;
      }

      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://')) {
        showError('Cannot generate QR code for this page');
        return;
      }

      try {
        qrcodeContainer.innerHTML = '';
        new QRCode(qrcodeContainer, {
          text: url,
          width: 180,
          height: 180,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (error) {
        showError('Failed to generate QR code: ' + error.message);
      }
    });
  }

  function showError(message) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    qrcodeContainer.innerHTML = '';
  }

  // Page Images
  const imagesGrid = document.getElementById('imagesGrid');
  const imagesLoading = document.getElementById('imagesLoading');
  const imagesError = document.getElementById('imagesError');
  const imagesEmpty = document.getElementById('imagesEmpty');
  const imagesCount = document.getElementById('imagesCount');
  const refreshBtn = document.getElementById('refreshBtn');
  const lazyScanBtn = document.getElementById('lazyScanBtn');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const deselectAllBtn = document.getElementById('deselectAllBtn');
  const selectedCountEl = document.getElementById('selectedCount');
  const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');
  const downloadProgress = document.getElementById('downloadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  let currentImages = [];
  let selectedImages = new Set();

  // Refresh button handler
  refreshBtn.addEventListener('click', loadImages);

  // Lazy scan button handler
  lazyScanBtn.addEventListener('click', performLazyScan);

  // Select All handler
  selectAllBtn.addEventListener('click', () => {
    currentImages.forEach((img, index) => {
      selectedImages.add(index);
      const checkbox = document.querySelector(`.image-checkbox[data-index="${index}"]`);
      if (checkbox) {
        checkbox.classList.add('checked');
      }
    });
    updateSelectedCount();
  });

  // Deselect All handler
  deselectAllBtn.addEventListener('click', () => {
    selectedImages.clear();
    document.querySelectorAll('.image-checkbox').forEach(checkbox => {
      checkbox.classList.remove('checked');
    });
    updateSelectedCount();
  });

  // Download Selected handler
  downloadSelectedBtn.addEventListener('click', downloadSelectedImages);

  function updateSelectedCount() {
    const count = selectedImages.size;
    selectedCountEl.textContent = `${count} selected`;
    downloadSelectedBtn.disabled = count === 0;
  }

  function performLazyScan() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length === 0) return;
      const tab = tabs[0];
      
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
        showImagesError('Cannot perform lazy scan on this page');
        return;
      }

      // Send message to content script to perform lazy scan
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return new Promise((resolve) => {
            // Scroll to bottom to trigger lazy loading
            window.scrollTo(0, document.body.scrollHeight);
            // Wait for images to load
            setTimeout(() => {
              // Scroll back to top
              window.scrollTo(0, 0);
              resolve(true);
            }, 2000);
          });
        }
      }, () => {
        // Reload images after lazy scan
        loadImages();
      });
    });
  }

  function loadImages() {
    imagesLoading.classList.remove('hidden');
    imagesError.classList.add('hidden');
    imagesEmpty.classList.add('hidden');
    imagesGrid.innerHTML = '';
    imagesCount.textContent = '0 images found';

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length === 0) {
        showImagesError('No active tab found');
        return;
      }

      const tab = tabs[0];
      const url = tab.url;

      if (!url) {
        showImagesError('Unable to access current tab');
        return;
      }

      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://')) {
        showImagesError('Cannot access images on this page');
        return;
      }

      // Inject content script and then send message
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      }, function() {
        if (chrome.runtime.lastError) {
          // Script may already be injected, try sending message anyway
          sendMessageToContentScript(tab.id);
        } else {
          // Script injected successfully, send message
          sendMessageToContentScript(tab.id);
        }
      });
    });
  }

  function sendMessageToContentScript(tabId) {
    chrome.tabs.sendMessage(tabId, { action: 'getVisibleImages' }, function(response) {
      imagesLoading.classList.add('hidden');

      if (chrome.runtime.lastError) {
        showImagesError('Content script not available. Refresh the page and try again.');
        return;
      }

      if (!response || !response.success) {
        showImagesError(response?.error || 'Failed to discover images');
        return;
      }

      currentImages = response.images;
      displayImages(currentImages);
    });
  }

  function showImagesError(message) {
    imagesLoading.classList.add('hidden');
    imagesError.textContent = message;
    imagesError.classList.remove('hidden');
  }

  function displayImages(images) {
    if (images.length === 0) {
      imagesEmpty.classList.remove('hidden');
      imagesCount.textContent = '0 images found';
      return;
    }

    imagesCount.textContent = `${images.length} image${images.length === 1 ? '' : 's'} found`;
    currentImages = images;
    selectedImages.clear();

    images.forEach((image, index) => {
      const item = document.createElement('div');
      item.className = 'image-item';
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `View image ${index + 1}`);

      // Checkbox
      const checkbox = document.createElement('div');
      checkbox.className = 'image-checkbox';
      checkbox.setAttribute('data-index', index);
      checkbox.setAttribute('aria-label', `Select image ${index + 1}`);
      checkbox.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-5.58-5.59L9 16.17z"/></svg>';
      
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSelection(index);
      });

      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.alt || `Image ${index + 1}`;
      img.loading = 'lazy';

      const actions = document.createElement('div');
      actions.className = 'image-actions';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'image-action-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.setAttribute('aria-label', 'Copy image URL');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(image.src);
      });

      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'image-action-btn';
      downloadBtn.textContent = 'Download';
      downloadBtn.setAttribute('aria-label', 'Download image');
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadImage(image.src);
      });

      actions.appendChild(copyBtn);
      actions.appendChild(downloadBtn);
      item.appendChild(checkbox);
      item.appendChild(img);
      item.appendChild(actions);

      item.addEventListener('click', () => openPreview(image.src));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPreview(image.src);
        }
      });

      imagesGrid.appendChild(item);
    });

    updateSelectedCount();
  }

  function toggleSelection(index) {
    if (selectedImages.has(index)) {
      selectedImages.delete(index);
    } else {
      selectedImages.add(index);
    }
    const checkbox = document.querySelector(`.image-checkbox[data-index="${index}"]`);
    if (checkbox) {
      checkbox.classList.toggle('checked');
    }
    updateSelectedCount();
  }

  async function downloadSelectedImages() {
    if (selectedImages.size === 0) return;

    const selectedArray = Array.from(selectedImages).sort((a, b) => a - b);
    const total = selectedArray.length;
    let completed = 0;
    let failed = 0;

    downloadProgress.classList.remove('hidden');
    downloadSelectedBtn.disabled = true;

    for (const index of selectedArray) {
      const image = currentImages[index];
      try {
        await downloadImageWithTracking(image.src);
        completed++;
      } catch (error) {
        failed++;
        console.error('Download failed:', error);
      }

      const progress = Math.round((completed + failed) / total * 100);
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${completed + failed} / ${total} downloaded`;
    }

    downloadSelectedBtn.disabled = false;
    setTimeout(() => {
      downloadProgress.classList.add('hidden');
    }, 2000);
  }

  function downloadImageWithTracking(url) {
    return new Promise((resolve, reject) => {
      const filename = getFilenameFromUrl(url);
      chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: false
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(downloadId);
        }
      });
    });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('URL copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  function downloadImage(url) {
    const filename = getFilenameFromUrl(url);
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    }, function(downloadId) {
      if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError);
        // Fallback: open in new tab
        chrome.tabs.create({ url: url });
      }
    });
  }

  function getFilenameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      if (filename && filename.includes('.')) {
        return filename;
      }
      // If no valid filename, generate one
      const timestamp = Date.now();
      return `image-${timestamp}.png`;
    } catch (e) {
      const timestamp = Date.now();
      return `image-${timestamp}.png`;
    }
  }

  // Preview Modal
  const previewModal = document.getElementById('previewModal');
  const modalImage = document.getElementById('modalImage');
  const modalClose = document.getElementById('modalClose');
  const modalCopy = document.getElementById('modalCopy');
  const modalDownload = document.getElementById('modalDownload');
  const modalOpen = document.getElementById('modalOpen');
  let currentPreviewUrl = '';

  function openPreview(url) {
    currentPreviewUrl = url;
    modalImage.src = url;
    previewModal.classList.add('active');
  }

  function closePreview() {
    previewModal.classList.remove('active');
    modalImage.src = '';
    currentPreviewUrl = '';
  }

  modalClose.addEventListener('click', closePreview);
  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
      closePreview();
    }
  });

  modalCopy.addEventListener('click', () => {
    copyToClipboard(currentPreviewUrl);
  });

  modalDownload.addEventListener('click', () => {
    downloadImage(currentPreviewUrl);
  });

  modalOpen.addEventListener('click', () => {
    chrome.tabs.create({ url: currentPreviewUrl });
  });

  // Keyboard navigation for modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewModal.classList.contains('active')) {
      closePreview();
    }
  });
});
