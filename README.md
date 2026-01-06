# Odoo Dev Tools

A Chrome extension that significantly improves the daily workflow of Odoo developers. It serves as a developer control plane with strong focus on safety, clarity, and productivity for Odoo 17+ instances.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Odoo 17+](https://img.shields.io/badge/Odoo-17%2B-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)

## Overview

Odoo Dev Tools provides essential development features directly in your browser while working with Odoo instances. Whether you're developing on localhost or debugging production issues, this extension gives you instant access to critical information and commonly-used developer actions.

The extension intelligently detects Odoo pages and only activates on the web client (backend), not on public-facing pages like portals or e-commerce sites.

## Features

### 1. Debug Mode Toggle

Quickly enable or disable Odoo's debug mode without manually editing the URL:

- **One-click toggle**: Enable/disable debug mode instantly
- **Auto-enable debug mode**: Automatically activates debug when entering any Odoo instance (configurable in settings)
- **Smart URL handling**: Properly handles Odoo's URL structure across different versions
- **Persistent setting**: Your preference is saved and remembered

**Use case**: Constantly switching between debug and normal mode during development? One click does it all.

### 2. Developer Info Overlay

A sleek, minimizable overlay that displays essential development context at a glance:

#### Information Displayed:
- **Database name** with Odoo version (e.g., "my_db (18.0)")
- **Current user** name and ID
- **Company** name and ID
- **Current model** being viewed (e.g., `sale.order`, `account.move`)
- **Record ID** for form views

#### Overlay Features:
- **Click to copy**: Click any field to instantly copy its value to clipboard
- **Real-time updates**: Model and record ID update automatically as you navigate through Odoo
- **Position configurability**: Place in any corner (top-left, top-right, bottom-left, bottom-right)
- **Minimizable**: Collapse to a small icon to reduce screen clutter
- **Dark mode support**: Automatically adapts to Odoo's dark mode
- **Tab interface**: Switch between Info and Reports views

**Technical note**: The extension uses RPC call interception to detect model changes in real-time, working reliably with both Odoo 17 and 18+ where DOM-based detection is unreliable.

### 3. Quick Reports Access

Automatically detects and lists available reports for the current model and record:

- **Automatic detection**: Fetches all `ir.actions.report` records matching the current model
- **Dual view access**: Open reports in both HTML (preview) and PDF format
- **Context-aware**: Only shows when you're on a form view with a specific record
- **One-click access**: Direct links to report URLs with proper record ID

**Use case**: Debugging a report template? Quickly view the HTML output or generated PDF without navigating through Odoo's menus.

### 4. Become Superadmin

Instantly become a superadmin user for testing and debugging:

- **One-click access**: Direct link to `/web/become`
- **Status indicator**: Shows if you're already a superuser
- **Disabled when active**: Button is disabled if you're already OdooBot

**Use case**: Testing access rights or need to access system-level records? Become superadmin with one click.

### 5. Internationalization (i18n)

Full multilingual support with automatic language detection:

- **Supported languages**: English, German (Deutsch), Italian (Italiano), Spanish (Español), French (Français)
- **Automatic detection**: Uses your browser's language setting
- **Complete translation**: All UI elements, labels, messages, and tooltips are translated
- **Maintainable**: Clean structure with separate translation files for easy updates
- **Extensible**: New languages can be easily added via the `public/_locales` directory

**Technical details**: The extension uses Chrome's built-in i18n API with translations stored in `messages.json` files. The language is automatically selected based on your browser locale, ensuring consistency with your system preferences.

## Installation

### From Source (Development)

#### Prerequisites
- **Node.js 22+** (required for the build tools)
  - Check with: `node --version`
  - Install via [nvm](https://github.com/nvm-sh/nvm): `nvm install 22 && nvm use 22`
- **pnpm** (package manager)
  - Install globally: `npm install -g pnpm`

#### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/floflock/odoo-dev-tools.git
   cd odoo-dev-tools
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

   This starts WXT's development server with:
   - Hot module reloading (changes rebuild automatically)
   - Watch mode for file changes
   - Output to `.output/chrome-mv3-dev`

4. **Load the extension in Chrome**
   - Open `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in top-right corner)
   - Click **"Load unpacked"**
   - Select the `.output/chrome-mv3-dev` folder
   - The extension is now installed!

5. **Development workflow**
   - Edit source files in `src/`, `entrypoints/`, or `public/`
   - WXT automatically rebuilds when files change
   - Click the reload icon (⟳) on `chrome://extensions` to reload the extension
   - Refresh your Odoo page to see changes

### Production Build

Build an optimized version for distribution:

```bash
pnpm build
```

The production build will be in `.output/chrome-mv3/` and includes:
- Minified JavaScript
- Optimized assets
- Source maps removed
- Full performance optimizations

### Create Distribution Package

Create a ZIP file ready for Chrome Web Store submission:

```bash
pnpm zip
```

The ZIP file will be created in `.output/` directory.

### Firefox Build

Build for Firefox:

```bash
pnpm build:firefox
```

The Firefox build will be in `.output/firefox-mv3/`.

## Usage

### First Time Setup

1. **Install the extension** following the installation steps above
2. **Navigate to any Odoo instance** (e.g., `http://localhost:8069` or your production URL)
3. **The overlay appears automatically** in the bottom-right corner (default position)
4. **Click the extension icon** in the toolbar to access settings

### Settings Configuration

Click the extension icon in Chrome's toolbar to open the settings popup:

| Setting | Description | Default |
|---------|-------------|---------|
| **Auto-enable debug mode** | Automatically adds `?debug=1` when entering Odoo | Off |
| **Show overlay** | Toggle the developer info overlay visibility | On |
| **Overlay position** | Choose corner placement: top-left, top-right, bottom-left, bottom-right | bottom-right |

**Note**: Settings changes apply immediately without requiring a page refresh.

### Using the Overlay

#### Info Tab
Displays current development context. Click any field to copy its value:
- Database name and version
- User information
- Company information
- Current model (updates automatically)
- Record ID (updates automatically)

#### Reports Tab
Lists available reports for the current model:
- Shows all reports when on a form view with a record ID
- Click **"HTML"** to open report preview
- Click **"PDF"** to open report in PDF format
- Shows helpful message if no model/record is detected

#### Action Buttons
- **Enable/Disable Debug**: Toggles Odoo debug mode
- **Turn OdooBot**: Become superadmin (disabled if already superuser)

#### Minimizing
Click the minimize button (−) to collapse the overlay to a small icon. Click the icon to restore.

## Supported Odoo Versions

- ✅ **Odoo 17**
- ✅ **Odoo 18**
- ✅ **Odoo 19+**

The extension automatically detects the Odoo version and adapts its behavior accordingly.

## Technical Architecture

### Technology Stack

- **Framework**: [WXT](https://wxt.dev/) - Next-gen web extension framework
- **UI Library**: React 19 with TypeScript
- **Styling**: SCSS with CSS modules
- **Build Tool**: Vite 6
- **Package Manager**: pnpm
- **Manifest Version**: V3 (modern Chrome extensions standard)

### Project Structure

```
odoo-dev-tools/
├── entrypoints/
│   ├── popup/              # Extension settings popup
│   │   ├── App.tsx         # Popup React component
│   │   └── index.html      # Popup HTML entry
│   ├── content.ts          # Content script (runs on Odoo pages)
│   └── background.ts       # Service worker (background tasks)
├── public/
│   └── odoo-bridge.js      # RPC interceptor (runs in page context)
├── src/
│   ├── components/
│   │   └── OdooOverlay.tsx # Main overlay component
│   ├── services/
│   │   ├── odoo-client.ts  # Odoo JSON-RPC client
│   │   └── storage.ts      # Chrome storage wrapper
│   ├── utils/
│   │   └── odoo-detector.ts # Odoo detection & session extraction
│   ├── styles/
│   │   ├── overlay.scss    # Overlay styles
│   │   └── popup.scss      # Popup styles
│   └── config/
├── wxt.config.ts           # WXT configuration
├── package.json
└── README.md
```

### How It Works

#### RPC Interception System

The extension uses a sophisticated RPC interception architecture to reliably detect model and record information:

1. **Bridge Script (`public/odoo-bridge.js`)**:
   - Runs in the **page context** (not content script context) to bypass CSP restrictions
   - Intercepts `XMLHttpRequest` and `fetch` calls to `/web/dataset/call_kw`
   - Extracts model name, method, and record ID from JSON-RPC payloads
   - Dispatches custom events (`odoo-dev-tools-rpc`) to communicate with content script
   - Filters for `web_read` (form views) and `web_search_read` (list views) methods

2. **Content Script (`entrypoints/content.ts`)**:
   - Runs in **isolated extension context**
   - Installs the bridge script on page load
   - Listens for RPC events from the bridge
   - Updates React overlay with real-time model information
   - Handles settings changes from popup

3. **Event Flow**:
   ```
   User navigates to record
         ↓
   Odoo makes RPC call: POST /web/dataset/call_kw/sale.order/web_read
         ↓
   Bridge intercepts XHR, extracts: {model: "sale.order", resId: 123}
         ↓
   Bridge dispatches: CustomEvent('odoo-dev-tools-rpc', {detail: {...}})
         ↓
   Content script receives event
         ↓
   React overlay re-renders with new model info
   ```

This architecture is necessary because:
- **Odoo 18+** removed `data-res-model` DOM attributes
- **URL slugs** don't contain actual model names
- **RPC payloads** are the most reliable source of truth
- **CSP restrictions** prevent content scripts from accessing page JavaScript

#### Odoo Detection

The extension uses multiple methods to detect Odoo and extract session information:

1. **DOM Analysis**: Checks for Odoo-specific elements (`.o_web_client`, `.o_action_manager`)
2. **Script Tag Parsing**: Extracts session info from embedded `odoo.session_info` objects
3. **Web Client Filter**: Only activates when `<body>` has class `o_web_client`
4. **Dark Mode Detection**: Checks for dark mode stylesheet to adapt overlay theme

#### Model Detection Priority

For **initial page load**:
1. DOM attributes (`data-res-model`) - works in Odoo 17, sometimes in 18+
2. Defaults to `null` - RPC interceptor will update

For **navigation updates** (primary method):
1. RPC interception of `web_read` calls - sets model and record ID
2. RPC interception of `web_search_read` calls - clears model and record ID

## Development Guide

### Development Workflow

1. **Start the dev server**:
   ```bash
   pnpm dev
   ```

   The server runs continuously and watches for file changes.

2. **Make your changes** to source files

3. **Verify auto-rebuild**: Check terminal for "✔ Reloaded extension" message

4. **Reload extension** in Chrome:
   - Go to `chrome://extensions`
   - Click reload (⟳) on "Odoo Dev Tools"

5. **Test on Odoo**: Refresh your Odoo page and verify changes

### Key Development Commands

```bash
# Development with hot reload
pnpm dev

# Production build
pnpm build

# Firefox build
pnpm build:firefox

# Create distributable ZIP
pnpm zip

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Adding New Features

#### Adding a New Overlay Field

1. Update `OdooInfo` interface in `src/utils/odoo-detector.ts`
2. Extract the value in `detectOdoo()` function
3. Add an `<InfoRow>` component in `src/components/OdooOverlay.tsx`

#### Adding a New Settings Option

1. Update `Settings` interface in `src/services/storage.ts`
2. Add default value in `defaultSettings`
3. Add toggle/input in `entrypoints/popup/App.tsx`
4. Handle the setting in `entrypoints/content.ts`

#### Modifying RPC Interception Logic

Edit `public/odoo-bridge.js` to change:
- Which RPC methods to intercept
- How to extract model/record information
- When to dispatch events

**Important**: After modifying `odoo-bridge.js`, reload the extension AND refresh the Odoo page (the bridge script is injected on page load).

#### Adding Translations (i18n)

To add a new translatable string:

1. **Add the key to all language files** in `public/_locales/{lang}/messages.json`:
   ```json
   "myNewKey": {
     "message": "Translated text here",
     "description": "Description of what this text is for"
   }
   ```

2. **Use the translation in your component**:
   ```typescript
   import { t } from '../utils/i18n';

   // Simple translation
   <span>{t('myNewKey')}</span>

   // With placeholder
   <span>{t('myKeyWithPlaceholder', someValue)}</span>
   ```

3. **For placeholder support**, define it in messages.json:
   ```json
   "myKeyWithPlaceholder": {
     "message": "Value is: $VALUE$",
     "description": "Shows a value",
     "placeholders": {
       "value": {
         "content": "$1",
         "example": "example"
       }
     }
   }
   ```

**Supported languages**: en (English), de (German), it (Italian), es (Spanish), fr (French)

### Debugging Tips

#### Console Logs

The extension includes debug logging (only on localhost):
- `[Odoo Dev Tools] Content script starting...`
- `[Odoo Dev Tools] RPC interceptor installed (XHR + Fetch)`
- `[Odoo Dev Tools] RPC captured (web_read): {...}`
- `[Odoo Dev Tools] Overlay updated with model: ...`

#### Inspecting Extension Context

- **Content script**: Right-click on Odoo page → Inspect → Console tab
- **Popup**: Right-click extension icon → "Inspect popup"
- **Background worker**: Go to `chrome://extensions` → Click "service worker"

#### Checking RPC State

In browser console on Odoo page:
```javascript
// Check if interceptor is installed
window.__odooDevTools

// Output:
// {
//   lastRpcInfo: {model: "sale.order", resId: 123, method: "web_read"},
//   interceptorInstalled: true
// }
```

### Common Issues

#### Dev server keeps stopping
The dev server should stay running but sometimes completes after rebuilding. Simply run `pnpm dev` again. The build output is preserved in `.output/chrome-mv3-dev`.

#### Extension not updating after code changes
1. Verify dev server is running (`pnpm dev`)
2. Check terminal for "✔ Reloaded" message
3. Reload extension on `chrome://extensions`
4. Hard refresh Odoo page (Ctrl+Shift+R / Cmd+Shift+R)

#### Overlay not showing
1. Check if you're on an Odoo web client page (backend, not website/portal)
2. Verify body has class `o_web_client`
3. Check settings popup - is "Show overlay" enabled?
4. Open console and look for `[Odoo Dev Tools]` logs

#### Model/Record ID not updating
1. Check console for "RPC captured" messages
2. Verify you're on a form view (not list/kanban)
3. Check if Odoo is using `web_read` RPC method
4. Inspect `window.__odooDevTools.lastRpcInfo`

## Privacy & Security

This extension:
- ✅ **Only activates on Odoo web client pages** (detects `.o_web_client` body class)
- ✅ **Does not collect or transmit any data** outside your browser
- ✅ **Stores all settings locally** in Chrome's storage API
- ✅ **Only communicates with the Odoo instance you're viewing** (for fetching reports via JSON-RPC)
- ✅ **Open source** - you can review all code
- ✅ **No external dependencies at runtime** - all code bundled in the extension
- ✅ **No tracking, analytics, or telemetry**

### Permissions Explained

The extension requests these permissions:

| Permission | Purpose |
|------------|---------|
| `storage` | Store user settings (overlay position, auto-debug preference) locally |
| `activeTab` | Access the current Odoo page to inject overlay and read session info |
| `*://*/*` (host permissions) | Required to detect Odoo on any domain (localhost, production, etc.) |

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome | ✅ Fully supported (90+) |
| Edge | ✅ Fully supported (90+) |
| Brave | ✅ Fully supported |
| Firefox | 🚧 Build available (`pnpm build:firefox`) - not tested extensively |
| Safari | ❌ Not supported (different extension API) |

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs**: Open an issue with reproduction steps
2. **Suggest features**: Open an issue with your idea
3. **Submit PRs**: Fork, create a branch, make changes, submit PR
4. **Improve docs**: Fix typos, clarify instructions, add examples

### Development Setup for Contributors

```bash
# Fork the repo, then clone your fork
git clone https://github.com/YOUR_USERNAME/odoo-dev-tools.git
cd odoo-dev-tools

# Install dependencies
pnpm install

# Create a feature branch
git checkout -b feature/your-feature-name

# Start dev server
pnpm dev

# Make your changes and test thoroughly

# Commit with descriptive messages
git commit -am "Add feature: description"

# Push and create a pull request
git push origin feature/your-feature-name
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/floflock/odoo-dev-tools/issues)
- **Discussions**: [GitHub Discussions](https://github.com/floflock/odoo-dev-tools/discussions)

## Acknowledgments

Built with:
- [WXT](https://wxt.dev/) - Amazing web extension framework
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

**Made with ❤️ for Odoo developers**
