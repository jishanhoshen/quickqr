# Quick QR - Chrome Extension

A lightweight Chrome extension that generates QR codes for the current tab's URL and discovers visible page images. Scan QR codes with your phone to open links on your device, or quickly access and download images from the current page.

## Features

### QR Code Generation
- Generates QR codes for the current tab's complete URL
- Preserves URL query parameters and paths
- Updates QR code when popup is reopened on different tabs
- Simple, clean, responsive popup UI
- Handles unsupported URLs gracefully

### Page Images
- Discovers images across the entire page (not just viewport)
- Supports multiple image sources:
  - HTML `<img>` elements
  - `<picture>` and `<source>` elements
  - CSS `background-image` URLs
  - Open Graph `og:image` metadata
  - Twitter card images
  - Lazy-loading attributes (data-src, data-srcset, etc.)
- Displays thumbnails in a compact grid
- **Bulk selection**: Select multiple images with checkboxes
- **Bulk download**: Download selected images with progress tracking
- **Auto-refresh**: MutationObserver detects dynamically added images
- **Lazy scan**: Optional scan to trigger lazy-loaded images
- Preview images in a modal
- Copy image URLs to clipboard
- Download images directly (where permitted)
- Open images in new tabs as fallback
- No size filtering - includes all images
- Deduplicates images by source URL

### Dark Mode
- Detects system theme on first use
- Manual light/dark theme toggle
- Persists theme preference locally
- Polished dark mode design

### Privacy & Security
- No external APIs or remote services
- No data collection or analytics
- Minimal permissions
- All image discovery happens locally
- No backend services

## Project Structure

```
chrome-ext/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html            # Popup UI
├── popup.css             # Popup styling
├── popup.js              # Popup logic
├── content.js            # Content script for image discovery
├── lib/
│   └── qrcode.min.js     # QR code generation library (bundled)
└── icons/
    └── icon.svg          # Extension icon
```

## Installation

### Prerequisites
- Google Chrome browser (or Chromium-based browser)

### Option 1: Install from GitHub Release (Recommended)

1. Go to the [Releases](https://github.com/jishanhoshen/quickqr/releases) page
2. Download the latest `quick-qr-v2.2.0.zip` file
3. Extract the ZIP file to a directory on your computer
4. Follow the "Load the Extension" steps below using the extracted directory

### Option 2: Install from Source

1. Clone this repository to your local machine
2. Follow the "Load the Extension" steps below using the cloned directory

### Load the Extension

1. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions` in your browser
   - Or go to the Chrome menu (three dots) → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Select the directory containing the extension files (either extracted from ZIP or cloned from repository)
   - The extension will appear in your extensions list

4. **Pin the Extension** (optional)
   - Click the puzzle piece icon in the Chrome toolbar
   - Find "Quick QR" and click the pin icon to keep it visible

## Usage

### QR Code Generation
1. Navigate to any website in Chrome
2. Click the Quick QR extension icon in the browser toolbar
3. The popup opens on the "QR Code" tab by default
4. A QR code for the current tab's URL is displayed
5. Scan the QR code with your phone's camera app
6. Your phone will open the encoded URL

### Page Images
1. Navigate to a webpage with images
2. Click the Quick QR extension icon
3. Click the "Page Images" tab
4. Images from across the entire page are displayed in a grid
5. **Select images**: Click checkboxes on images you want to download
6. **Bulk actions**:
   - Click "Select All" to select all images
   - Click "Deselect All" to clear selection
   - Click "Download Selected" to download all selected images
7. **Refresh**: Click the refresh button to rescan the page for new images
8. **Lazy scan**: Click the eye icon to scan for lazy-loaded images (may scroll page)
9. Click an image to preview it in a modal
10. Use the action buttons to:
    - **Copy URL**: Copy the image source URL to clipboard
    - **Download**: Download the image to your computer
    - **Open in Tab**: Open the image in a new browser tab

### Context Menu Actions
Right-click on any image in a webpage to access Quick QR actions:
- **Download image with Quick QR**: Download the right-clicked image
- **Copy image URL**: Copy the image's URL to clipboard
- **Find all images on this page**: Open a gallery page showing all images on the current page

### Dark Mode
1. Click the sun/moon icon in the header to toggle between light and dark themes
2. Your preference is saved and persists across sessions
3. On first use, the extension follows your system theme

### Theme Toggle
Click the theme toggle button (sun/moon icon) in the header to switch between light and dark modes. The extension remembers your choice.

## Testing

### Manual Testing Checklist

1. **Extension Loading**
   - ✓ Extension loads without errors in `chrome://extensions`
   - ✓ No warnings or errors shown in the extension card

2. **URL Detection**
   - ✓ Open https://example.com and verify QR code appears
   - ✓ Open https://example.com/path/to/page and verify path is preserved
   - ✓ Open https://example.com?param=value and verify query parameters are preserved
   - ✓ Test on multiple different websites

3. **QR Code Scanning**
   - ✓ Scan the QR code with an iPhone camera
   - ✓ Scan the QR code with an Android camera
   - ✓ Verify the URL opens correctly on your phone

4. **Special Cases**
   - ✓ Open `chrome://extensions` - should show error "Cannot generate QR code for this page"
   - ✓ Open `chrome://settings` - should show error "Cannot generate QR code for this page"
   - ✓ Open `chrome-extension://` URLs - should show error "Cannot generate QR code for this page"

5. **UI Behavior**
   - ✓ Popup has a clean, centered layout
   - ✓ QR code is 180x180 pixels
   - ✓ Loading state shows briefly before QR code appears
   - ✓ Error messages are clear and readable
   - ✓ Tab navigation works correctly
   - ✓ Theme toggle works and persists

6. **Page Images**
   - ✓ Navigate to a page with images
   - ✓ Click "Page Images" tab
   - ✓ Verify images from across the page are discovered (not just viewport)
   - ✓ Check image thumbnails display correctly
   - ✓ Test refresh button to rescan page
   - ✓ Test image preview modal
   - ✓ Test copy URL to clipboard
   - ✓ Test download functionality
   - ✓ Test open in new tab fallback
   - ✓ Test on pages with CSS background images
   - ✓ Test on pages with lazy-loaded images
   - ✓ Test on pages with Open Graph/Twitter images
   - ✓ Test bulk selection (checkboxes)
   - ✓ Test Select All / Deselect All
   - ✓ Test Download Selected with progress
   - ✓ Test lazy scan button (may scroll page)

7. **Context Menu**
   - ✓ Right-click on an image
   - ✓ Verify context menu items appear
   - ✓ Test "Download image with Quick QR"
   - ✓ Test "Copy image URL"
   - ✓ Test "Find all images on this page"
   - ✓ Verify gallery page opens correctly

7. **Dark Mode**
   - ✓ Verify system theme detection works
   - ✓ Test theme toggle button
   - ✓ Verify theme preference persists
   - ✓ Check all elements visible in dark mode
   - ✓ Verify QR code remains scannable in dark mode

## Known Limitations

### QR Code
- Cannot generate QR codes for restricted Chrome pages (chrome://, chrome-extension://, edge://)
- QR code cannot be downloaded or copied (not in scope for MVP)
- No custom QR styling options (not in scope for MVP)
- No history of generated QR codes (not in scope for MVP)

### Page Images
- Images are discovered across the entire page, not just viewport
- Content script cannot run on:
  - chrome:// pages
  - chrome-extension:// pages
  - Chrome Web Store
  - Some sandboxed iframes
- Some images cannot be downloaded due to:
  - CORS policies
  - Server restrictions
  - Hotlinking protection
  - Authentication requirements
- No size filtering - includes all images including tiny decorative icons
- Data URLs are included in image discovery
- Lazy-loaded images may not have dimensions until loaded
- CSS background images may not have dimensions available
- Meta images (Open Graph, Twitter) usually have no dimensions
- Performance may be slower on image-heavy pages
- Same image at different URLs will appear as separate entries
- Bulk downloads may trigger Chrome's multiple download confirmation
- Lazy scan will scroll page and change scroll position
- MutationObserver may miss some dynamic images (debounced with 500ms delay)
- Context menu "Find all images" opens new tab instead of popup (Chrome limitation)

## Technical Details

- **Manifest Version**: V3
- **Permissions**:
  - `activeTab`: Access the current tab's URL and inject content script
  - `downloads`: Download images to the local filesystem
  - `storage`: Persist theme preference
  - `scripting`: Programmatically inject content script into tabs
  - `contextMenus`: Add right-click context menu actions for images
- **QR Library**: qrcodejs v1.0.0 (bundled locally, no external dependencies)
- **Technologies**: Vanilla JavaScript, HTML, CSS
- **Privacy**: No data collection, no external API calls, no analytics

## Error Handling

The extension handles the following error cases gracefully:

- No active tab found
- Unable to get URL from current tab
- Restricted Chrome pages (chrome://, chrome-extension://, edge://)
- QR code generation failures

Errors are displayed with clear messages in the popup.

## Security & Privacy

- **No backend**: All QR generation happens locally in your browser
- **No data collection**: No browsing history, URLs, or user data is collected or sent anywhere
- **Minimal permissions**: Only requests `activeTab` permission to access the current tab's URL
- **No third-party services**: Does not use any external QR generation APIs

## Permissions Justification

### activeTab
- **Purpose**: Access the current tab's URL for QR code generation and inject content script for image discovery
- **Why needed**: The extension needs to know the current page's URL and inspect its DOM to find images
- **Scope**: Only active tab, no broader access

### downloads
- **Purpose**: Download images to the user's local filesystem
- **Why needed**: Users want to save images directly from the extension
- **Scope**: Only initiated by user action (clicking download button)
- **Alternative considered**: Using fetch API, but blocked by CORS for cross-origin images

### storage
- **Purpose**: Persist user's theme preference (light/dark mode)
- **Why needed**: Remember user's theme choice across sessions
- **Scope**: Only stores theme preference, no browsing data

### scripting
- **Purpose**: Programmatically inject content script into tabs
- **Why needed**: Ensure content script is available for image discovery, especially on tabs that were already open when extension was installed
- **Scope**: Only injects content.js into active tab when user opens Page Images tab

### contextMenus
- **Purpose**: Add right-click context menu actions for images
- **Why needed**: Allow users to quickly download, copy URL, or find all images when right-clicking on an image
- **Scope**: Only adds menu items for image context (contexts: ["image"])

## Future Enhancements (Not Implemented)

The following features are out of scope for this MVP but could be added in future versions:

### QR Code
- Download QR code as image
- Copy URL to clipboard
- Custom QR colors and logos
- QR code history
- Settings page
- Floating button overlay

### Page Images
- ZIP download for selected images
- Image filtering by size
- Image search/filter by type
- Image metadata display
- Advanced duplicate detection

## License

This project is provided as-is for educational and personal use.

### Third-Party Licenses

This extension uses the following third-party library:

- **qrcodejs** (v1.0.0) - MIT License
  - Repository: https://github.com/davidshimjs/qrcodejs
  - Licensed under the MIT License - permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction
