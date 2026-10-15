# Quick QR - Chrome Extension

A lightweight Chrome extension that generates a QR code for the URL of the currently active browser tab. Scan the QR code with your phone to open the same URL on your device.

## Features

- Generates QR codes for the current tab's complete URL
- Preserves URL query parameters and paths
- Updates QR code when popup is reopened on different tabs
- Simple, clean, responsive popup UI
- Handles unsupported URLs gracefully
- No external APIs or remote services
- No data collection or analytics
- Minimal permissions (only activeTab)

## Project Structure

```
chrome-ext/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html            # Popup UI
├── popup.css             # Popup styling
├── popup.js              # Popup logic
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
2. Download the latest `quick-qr-v1.0.0.zip` file
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

1. Navigate to any website in Chrome
2. Click the Quick QR extension icon in the browser toolbar
3. A popup will open displaying a QR code for the current tab's URL
4. Scan the QR code with your phone's camera app
5. Your phone will open the encoded URL

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
   - ✓ QR code is 200x200 pixels
   - ✓ Loading state shows briefly before QR code appears
   - ✓ Error messages are clear and readable

## Known Limitations

- Cannot generate QR codes for restricted Chrome pages (chrome://, chrome-extension://, edge://)
- QR code cannot be downloaded or copied (not in scope for MVP)
- No custom QR styling options (not in scope for MVP)
- No history of generated QR codes (not in scope for MVP)

## Technical Details

- **Manifest Version**: V3
- **Permissions**: `activeTab` only (minimal required permissions)
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

## Future Enhancements (Not Implemented)

The following features are out of scope for this MVP but could be added in future versions:

- Download QR code as image
- Copy URL to clipboard
- Custom QR colors and logos
- QR code history
- Settings page
- Floating button overlay

## License

This project is provided as-is for educational and personal use.

### Third-Party Licenses

This extension uses the following third-party library:

- **qrcodejs** (v1.0.0) - MIT License
  - Repository: https://github.com/davidshimjs/qrcodejs
  - Licensed under the MIT License - permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction
