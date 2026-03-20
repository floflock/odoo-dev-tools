/**
 * Odoo RPC Interceptor Bridge
 *
 * This script runs in the page context (not content script context) to bypass
 * Content Security Policy restrictions. It intercepts Odoo's RPC calls and
 * extracts model information.
 *
 * Architecture:
 * - Intercepts XMLHttpRequest and fetch calls to /web/dataset/call_kw
 * - Parses JSON-RPC payload to extract model, method, and record ID
 * - Dispatches custom events ('odoo-dev-tools-rpc') to notify content script
 * - Maintains state in window.__odooDevTools for debugging
 *
 * Note: This must be loaded as a web-accessible resource and injected via
 * script tag to run in page context.
 */
(function() {
  // Initialize storage
  window.__odooDevTools = window.__odooDevTools || {
    lastRpcInfo: { model: null, resId: null, method: null },
    interceptorInstalled: false
  };

  // Don't install twice
  if (window.__odooDevTools.interceptorInstalled) {
    return;
  }

  // Helper function to process RPC data
  function processRpcData(body) {
    try {
      const data = typeof body === 'string' ? JSON.parse(body) : body;
      const params = data.params;

      if (!params) return;

      // web_read: Loading a specific record (form view)
      if (params.model && params.method === 'web_read') {
        const oldModel = window.__odooDevTools.lastRpcInfo.model;

        window.__odooDevTools.lastRpcInfo.model = params.model;
        window.__odooDevTools.lastRpcInfo.method = params.method;
        window.__odooDevTools.lastRpcInfo.resId = null;

        // Extract resId from args (various patterns)
        if (params.args && Array.isArray(params.args) && params.args.length > 0) {
          const firstArg = params.args[0];
          // Pattern 1: [id] or [id1, id2, ...]
          if (Array.isArray(firstArg) && firstArg.length > 0) {
            const id = firstArg[0];
            if (typeof id === 'number' && id > 0) {
              window.__odooDevTools.lastRpcInfo.resId = id;
            }
          }
          // Pattern 2: direct number as first arg
          else if (typeof firstArg === 'number' && firstArg > 0) {
            window.__odooDevTools.lastRpcInfo.resId = firstArg;
          }
        }

        // Also check kwargs for res_id
        if (!window.__odooDevTools.lastRpcInfo.resId && params.kwargs) {
          if (params.kwargs.res_id && typeof params.kwargs.res_id === 'number') {
            window.__odooDevTools.lastRpcInfo.resId = params.kwargs.res_id;
          }
        }

        console.log('[Odoo Dev Tools] RPC captured (web_read):', {
          model: params.model,
          method: params.method,
          resId: window.__odooDevTools.lastRpcInfo.resId,
          changed: oldModel !== params.model
        });

        window.dispatchEvent(new CustomEvent('odoo-dev-tools-rpc', {
          detail: window.__odooDevTools.lastRpcInfo
        }));
      }
      // web_search_read: Loading a list/dashboard - reset model info
      else if (params.method === 'web_search_read') {
        // Clear model and recordId when navigating to list view
        window.__odooDevTools.lastRpcInfo.model = null;
        window.__odooDevTools.lastRpcInfo.method = params.method;
        window.__odooDevTools.lastRpcInfo.resId = null;

        console.log('[Odoo Dev Tools] RPC captured (web_search_read) - clearing model info');

        window.dispatchEvent(new CustomEvent('odoo-dev-tools-rpc', {
          detail: window.__odooDevTools.lastRpcInfo
        }));
      }
    } catch (e) {
      console.error('[Odoo Dev Tools] Failed to parse RPC:', e);
    }
  }

  // Helper: check if a URL+body should be mocked for RKSV signing
  function shouldMockRksv(url, body) {
    if (!window.__odooDevTools.mockRksvSigningActive) return false;
    if (!url || !url.includes('/web/dataset/call_kw/pos.order/sign_order_receipt')) return false;
    return true;
  }

  // Helper: build a mock RKSV signing response
  function buildRksvMockResponse(body) {
    try {
      var data = typeof body === 'string' ? JSON.parse(body) : body;
      var requestId = data.id || 1;
      // Use the order ID from args as receipt number if available
      var receiptNumber = 1;
      if (data.params && data.params.args && data.params.args.length > 0) {
        receiptNumber = data.params.args[0];
      }
      var response = {
        jsonrpc: '2.0',
        id: requestId,
        result: [true, receiptNumber, false]
      };
      console.log('[Odoo Dev Tools] RKSV signing mocked for order:', receiptNumber);
      return JSON.stringify(response);
    } catch (e) {
      console.error('[Odoo Dev Tools] Failed to build RKSV mock response:', e);
      return JSON.stringify({ jsonrpc: '2.0', id: 1, result: [true, 1, false] });
    }
  }

  // Install XMLHttpRequest interceptor (Odoo uses XHR, not fetch!)
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._odooUrl = url;
    this._odooMethod = method;
    return originalOpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function(body) {
    // Mock RKSV signing: intercept and return fake response without hitting server
    if (shouldMockRksv(this._odooUrl, body)) {
      var xhr = this;
      var mockResponse = buildRksvMockResponse(body);

      // Simulate async response
      setTimeout(function() {
        Object.defineProperty(xhr, 'readyState', { writable: true, value: 4 });
        Object.defineProperty(xhr, 'status', { writable: true, value: 200 });
        Object.defineProperty(xhr, 'statusText', { writable: true, value: 'OK' });
        Object.defineProperty(xhr, 'responseText', { writable: true, value: mockResponse });
        Object.defineProperty(xhr, 'response', { writable: true, value: mockResponse });

        xhr.dispatchEvent(new Event('readystatechange'));
        xhr.dispatchEvent(new Event('load'));
        xhr.dispatchEvent(new Event('loadend'));
      }, 50);
      return;
    }

    if (this._odooUrl && (
      this._odooUrl.includes('/web/dataset/call_kw') ||
      this._odooUrl.includes('/web/action/load')
    )) {
      processRpcData(body);
    }
    return originalSend.apply(this, arguments);
  };

  // Also install fetch interceptor as fallback
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [resource, config] = args;
    const url = typeof resource === 'string' ? resource : resource.url;

    // Mock RKSV signing for fetch
    if (shouldMockRksv(url, config?.body)) {
      var mockResponse = buildRksvMockResponse(config.body);
      return Promise.resolve(new Response(mockResponse, {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    if (url && (url.includes('/web/dataset/call_kw') || url.includes('/web/action/load'))) {
      if (config?.body) {
        processRpcData(config.body);
      }
    }

    return originalFetch.apply(this, args);
  };

  // Listen for RKSV signing mock toggle
  window.addEventListener('odoo-dev-tools-mock-rksv', function(event) {
    var detail = event.detail || {};
    window.__odooDevTools.mockRksvSigningActive = !!detail.enabled;
    console.log('[Odoo Dev Tools] RKSV signing mock:', detail.enabled ? 'ENABLED' : 'DISABLED');
    window.dispatchEvent(new CustomEvent('odoo-dev-tools-mock-rksv-status', {
      detail: { active: window.__odooDevTools.mockRksvSigningActive }
    }));
  });

  // Listen for POS receipt-to-PDF override request
  window.addEventListener('odoo-dev-tools-pos-receipt-pdf', function() {
    function applyPosReceiptOverride() {
      try {
        var modules = odoo && odoo.loader && odoo.loader.modules;
        if (!modules) return false;

        var PS = modules.get('@point_of_sale/app/services/printer_service');
        if (!PS || !PS.PrinterService) return false;

        PS.PrinterService.prototype.printHtml = async function(el) {
          this.printWeb(el);
          return { successful: true };
        };

        window.__odooDevTools.posReceiptOverrideActive = true;
        console.log('[Odoo Dev Tools] POS receipt-to-PDF override installed');
        window.dispatchEvent(new CustomEvent('odoo-dev-tools-pos-receipt-pdf-status', {
          detail: { active: true }
        }));
        return true;
      } catch (e) {
        console.error('[Odoo Dev Tools] Failed to install POS receipt override:', e);
        return false;
      }
    }

    // Try immediately, then retry with delays (POS modules load asynchronously)
    if (!applyPosReceiptOverride()) {
      var attempts = 0;
      var maxAttempts = 10;
      var retryInterval = setInterval(function() {
        attempts++;
        if (applyPosReceiptOverride() || attempts >= maxAttempts) {
          clearInterval(retryInterval);
          if (attempts >= maxAttempts && !window.__odooDevTools.posReceiptOverrideActive) {
            console.warn('[Odoo Dev Tools] POS receipt override: PrinterService not found after retries');
            window.dispatchEvent(new CustomEvent('odoo-dev-tools-pos-receipt-pdf-status', {
              detail: { active: false, error: 'PrinterService not found' }
            }));
          }
        }
      }, 1000);
    }
  });

  window.__odooDevTools.interceptorInstalled = true;
  console.log('[Odoo Dev Tools] RPC interceptor installed (XHR + Fetch)');

  // Notify that interceptor is ready
  window.dispatchEvent(new CustomEvent('odoo-dev-tools-ready'));
})();
