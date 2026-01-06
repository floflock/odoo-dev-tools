# CLAUDE.md

This file provides guidance to AI assistants when working with code in this repository.

## Quick Start

```bash
pnpm install      # Install dependencies
pnpm dev          # Start development server with hot reload
pnpm build        # Build for production (Chrome)
pnpm zip          # Create distributable ZIP for Chrome Web Store
```

**Requirements:**
- Node.js 22+ (use `nvm use` to switch)
- pnpm package manager

## Project Architecture

### Tech Stack
- **WXT Framework** 0.20.13 - Modern web extension development
- **React 19** with TypeScript - UI components
- **Vite 6** - Build tool (pinned via pnpm override)
- **SCSS** - Styling with CSS modules
- **Chrome Manifest V3** - Modern extension standard

### Project Structure
```
odoo-dev-tools/
├── entrypoints/
│   ├── popup/              # Extension settings popup
│   ├── content.ts          # Content script (runs on Odoo pages)
│   └── background.ts       # Service worker
├── public/
│   ├── _locales/           # i18n translations (en, de, it, es, fr)
│   └── odoo-bridge.js      # RPC interceptor (page context)
├── src/
│   ├── components/         # React components
│   │   └── OdooOverlay.tsx # Main developer overlay
│   ├── services/
│   │   ├── odoo-client.ts  # Odoo JSON-RPC client
│   │   └── storage.ts      # Chrome storage wrapper
│   ├── utils/
│   │   ├── odoo-detector.ts # Odoo detection & session extraction
│   │   └── i18n.ts         # Internationalization utility
│   └── styles/             # SCSS stylesheets
├── wxt.config.ts           # WXT configuration
└── package.json
```

## Key Technical Concepts

### RPC Interception Architecture
The extension uses RPC interception to reliably detect model and record information:

1. **Bridge Script** (`public/odoo-bridge.js`)
   - Runs in **page context** (not content script) to bypass CSP
   - Intercepts `XMLHttpRequest` and `fetch` calls to `/web/dataset/call_kw`
   - Filters for `web_read` (form views) and `web_search_read` (list views)
   - Dispatches custom events to content script

2. **Content Script** (`entrypoints/content.ts`)
   - Runs in isolated extension context
   - Listens for RPC events from bridge
   - Updates React overlay with real-time model information

3. **Why This Architecture**
   - Odoo 18+ removed `data-res-model` DOM attributes
   - URL slugs don't contain actual model names
   - RPC payloads are the most reliable source of truth
   - CSP restrictions prevent content scripts from accessing page JavaScript

### Internationalization (i18n)
- Translations stored in `public/_locales/{lang}/messages.json`
- Supported languages: en, de, it, es, fr
- Use `t('key')` utility function from `src/utils/i18n.ts`
- Chrome automatically selects language based on browser locale
- Manifest uses `__MSG_key__` placeholders for name/description

### Odoo Detection
- Only activates on web client pages (body has `o_web_client` class)
- Extracts session info from embedded `odoo.session_info` script tags
- Detects Odoo versions 17, 18, and 19+
- Dark mode detection via stylesheet presence

## Development Guidelines

### Code Patterns
- Console logging only on localhost: use `log()` from odoo-detector.ts
- All settings persist via Chrome storage API: use `storage` service
- All user-facing strings must use `t()` for translations
- RPC calls use `odooClient` service from odoo-client.ts

### Adding New Features
1. Add translatable strings to all `messages.json` files
2. Use `t('key')` in React components
3. Update README.md with feature documentation
4. Test on both Odoo 17 and 18+

### Important Notes
- Dev server may stop after rebuild - just restart with `pnpm dev`
- Bridge script changes require extension reload AND page refresh
- RPC interception is the primary method for model detection
- Don't use Vite 7 (compatibility issues - stays on Vite 6)

## Implemented Features

1. **Debug Mode Toggle** - One-click enable/disable with auto-enable option
2. **Developer Info Overlay** - Real-time display of database, user, company, model, record ID
3. **Quick Reports Access** - Automatic detection and links to HTML/PDF reports
4. **Become Superadmin** - Direct link to `/web/become`
5. **Internationalization** - Full i18n support (English, German, Italian, Spanish, French)

All features work on both localhost and production instances for Odoo 17, 18, and 19+.