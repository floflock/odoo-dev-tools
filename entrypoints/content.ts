import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { OdooOverlay } from '../src/components/OdooOverlay';
import { detectOdoo, log, setDebugEnabled } from '../src/utils/odoo-detector';
import { storage } from '../src/services/storage';
import type { OdooInfo } from '../src/utils/odoo-detector';

/**
 * Content Script Architecture:
 *
 * 1. odoo-bridge.js (runs in page context):
 *    - Intercepts XMLHttpRequest and fetch calls to /web/dataset/call_kw
 *    - Extracts model name and record ID from RPC payloads
 *    - Dispatches 'odoo-dev-tools-rpc' custom events
 *
 * 2. Content script (this file, runs in isolated context):
 *    - Installs the bridge script on page load
 *    - Listens for RPC events from the bridge
 *    - Updates the React overlay with real-time model info
 *    - Handles settings changes and overlay re-rendering
 *
 * This architecture allows us to bypass CSP restrictions and access
 * Odoo's RPC calls while maintaining extension isolation.
 */

// Global state
let overlayRoot: ReturnType<typeof createRoot> | null = null;
let currentOdooInfo: OdooInfo | null = null;

// Install RPC interceptor in page context (bypasses CSP)
function installRpcInterceptor() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('odoo-bridge.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
  log('Installing RPC interceptor...');
}

// Listen for RPC events from the bridge and update overlay
function setupRpcListener(settings: Awaited<ReturnType<typeof storage.getSettings>>) {
  window.addEventListener('odoo-dev-tools-rpc', async (event: Event) => {
    const customEvent = event as CustomEvent<{ model: string; resId: number | null; method: string }>;
    const rpcInfo = customEvent.detail;

    log('RPC event received:', rpcInfo);

    if (!currentOdooInfo) return;

    // Update model info from RPC
    const updatedInfo: OdooInfo = {
      ...currentOdooInfo,
      model: rpcInfo.model,
      recordId: rpcInfo.resId,
    };

    currentOdooInfo = updatedInfo;

    // Re-render overlay with new info
    if (overlayRoot && settings.showOverlay) {
      overlayRoot.render(createElement(OdooOverlay, { odooInfo: updatedInfo, settings }));
      log('Overlay updated with model:', rpcInfo.model);
    }
  });

  log('RPC listener setup complete');
}

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_start',

  async main() {
    log('Content script starting...');

    // Install RPC interceptor ASAP
    installRpcInterceptor();

    // Get settings early
    const settings = await storage.getSettings();

    // Initialize debug logging based on settings
    setDebugEnabled(settings.extensionDebug);

    // Setup RPC listener IMMEDIATELY (before page loads)
    // This ensures we catch RPC calls that happen during initial page load
    setupRpcListener(settings);
    log('RPC listener ready - will capture all RPC calls from now on');

    // Wait for page to load
    if (document.readyState === 'loading') {
      await new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Wait a bit more for Odoo to initialize
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Detect if this is an Odoo page
    const odooInfo = await detectOdoo();
    log('Initial Odoo detection:', odooInfo);

    if (!odooInfo.isOdoo) {
      log('Not an Odoo page, exiting');
      return;
    }

    currentOdooInfo = odooInfo;

    // Auto-enable debug mode if configured
    if (settings.autoDebug && !odooInfo.debugMode) {
      log('Auto-enabling debug mode');
      const url = new URL(window.location.href);
      url.searchParams.set('debug', '1');
      window.location.href = url.toString();
      return;
    }

    // Show overlay if enabled
    if (settings.showOverlay) {
      log('Rendering overlay...');

      let container = document.getElementById('odoo-dev-tools-root');
      if (!container) {
        container = document.createElement('div');
        container.id = 'odoo-dev-tools-root';
        document.body.appendChild(container);
      }

      overlayRoot = createRoot(container);
      overlayRoot.render(createElement(OdooOverlay, { odooInfo, settings }));

      log('Overlay rendered - waiting for RPC calls to update model info');
    }

    // Listen for settings changes and update overlay
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes['odoo-dev-tools-settings']) {
        const newSettings = changes['odoo-dev-tools-settings'].newValue;

        // Update debug logging state
        setDebugEnabled(newSettings.extensionDebug);

        log('Settings changed, updating overlay');

        // Re-render overlay with new settings
        if (overlayRoot && newSettings.showOverlay && currentOdooInfo) {
          overlayRoot.render(createElement(OdooOverlay, { odooInfo: currentOdooInfo, settings: newSettings }));
        }
      }
    });
  },
});
