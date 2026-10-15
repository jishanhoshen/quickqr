// Gallery page script for Quick QR

document.addEventListener('DOMContentLoaded', function() {
  const content = document.getElementById('content');
  const urlParams = new URLSearchParams(window.location.search);
  const tabId = urlParams.get('tabId');

  if (!tabId) {
    showError('No tab ID provided');
    return;
  }

  loadImages(tabId);
});

function loadImages(tabId) {
  showLoading();

  chrome.tabs.get(parseInt(tabId), (tab) => {
    if (chrome.runtime.lastError || !tab) {
      showError('Tab not found');
      return;
    }

    // Inject content script and get images
    chrome.scripting.executeScript({
      target: { tabId: parseInt(tabId) },
      files: ['content.js']
    }, () => {
      chrome.tabs.sendMessage(parseInt(tabId), { action: 'getVisibleImages' }, (response) => {
        if (chrome.runtime.lastError) {
          showError('Content script not available');
          return;
        }

        if (!response || !response.success) {
          showError(response?.error || 'Failed to discover images');
          return;
        }

        displayImages(response.images);
      });
    });
  });
}

function displayImages(images) {
  if (images.length === 0) {
    showEmpty();
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'images-grid';

  images.forEach((image, index) => {
    const item = document.createElement('div');
    item.className = 'image-item';

    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.alt || `Image ${index + 1}`;

    const actions = document.createElement('div');
    actions.className = 'image-actions';

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', () => downloadImage(image.src));

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy URL';
    copyBtn.className = 'secondary';
    copyBtn.addEventListener('click', () => copyImageUrl(image.src));

    actions.appendChild(downloadBtn);
    actions.appendChild(copyBtn);
    item.appendChild(img);
    item.appendChild(actions);
    grid.appendChild(item);
  });

  content.innerHTML = '';
  content.appendChild(grid);
}

function downloadImage(url) {
  const filename = getFilenameFromUrl(url);
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: false
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error('Download failed:', chrome.runtime.lastError);
      chrome.tabs.create({ url: url });
    }
  });
}

function copyImageUrl(url) {
  navigator.clipboard.writeText(url).then(() => {
    alert('URL copied to clipboard');
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy URL');
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
    const timestamp = Date.now();
    return `image-${timestamp}.png`;
  } catch (e) {
    const timestamp = Date.now();
    return `image-${timestamp}.png`;
  }
}

function showLoading() {
  content.innerHTML = '<div class="loading">Loading images...</div>';
}

function showError(message) {
  content.innerHTML = `<div class="error">${message}</div>`;
}

function showEmpty() {
  content.innerHTML = '<div class="empty">No images found on this page</div>';
}
