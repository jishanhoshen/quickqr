document.addEventListener('DOMContentLoaded', function() {
  const qrcodeContainer = document.getElementById('qrcode');
  const errorElement = document.getElementById('error');
  const loadingElement = document.getElementById('loading');

  // Show loading state
  loadingElement.classList.remove('hidden');
  errorElement.classList.add('hidden');

  // Get the current active tab's URL
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

    // Check if URL is accessible (not a restricted Chrome page)
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://')) {
      showError('Cannot generate QR code for this page');
      return;
    }

    // Generate QR code
    try {
      qrcodeContainer.innerHTML = '';
      new QRCode(qrcodeContainer, {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (error) {
      showError('Failed to generate QR code: ' + error.message);
    }
  });

  function showError(message) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    qrcodeContainer.innerHTML = '';
  }
});
