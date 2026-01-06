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

  // Install XMLHttpRequest interceptor (Odoo uses XHR, not fetch!)
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._odooUrl = url;
    return originalOpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function(body) {
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

    if (url && (url.includes('/web/dataset/call_kw') || url.includes('/web/action/load'))) {
      if (config?.body) {
        processRpcData(config.body);
      }
    }

    return originalFetch.apply(this, args);
  };

  window.__odooDevTools.interceptorInstalled = true;
  console.log('[Odoo Dev Tools] RPC interceptor installed (XHR + Fetch)');

  // Notify that interceptor is ready
  window.dispatchEvent(new CustomEvent('odoo-dev-tools-ready'));
})();
