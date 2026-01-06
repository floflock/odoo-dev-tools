export interface OdooInfo {
  isOdoo: boolean;
  version: number | null;
  serverVersion: string | null;
  database: string | null;
  userId: number | null;
  userName: string | null;
  companyId: number | null;
  companyName: string | null;
  model: string | null;
  recordId: number | null;
  debugMode: boolean;
  isLocalhost: boolean;
  isDarkMode: boolean;
  isSuperuser: boolean;
}

// Try to extract session info from embedded script tags
function extractFromScriptTags(): Partial<OdooInfo> | null {
  // Odoo often embeds session info in a script tag
  const scripts = document.querySelectorAll('script:not([src])');

  for (const script of scripts) {
    const content = script.textContent || '';

    // Look for odoo.session_info or similar patterns
    const patterns = [
      /odoo\.session_info\s*=\s*({[\s\S]*?});/,
      /odoo\.__session_info__\s*=\s*({[\s\S]*?});/,
      /"session_info"\s*:\s*({[\s\S]*?})\s*[,}]/,
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        try {
          const sessionInfo = JSON.parse(match[1]);
          log('Found session info in script tag:', sessionInfo);
          return parseSessionInfo(sessionInfo);
        } catch (e) {
          log('Failed to parse session info:', e);
        }
      }
    }

    // Also check for simple patterns
    if (content.includes('session_info') || content.includes('odoo.define')) {
      // Try to extract individual fields
      const dbMatch = content.match(/"db"\s*:\s*"([^"]+)"/);
      const uidMatch = content.match(/"uid"\s*:\s*(\d+)/);
      const versionMatch = content.match(/"server_version"\s*:\s*"(\d+)/);

      if (dbMatch || uidMatch) {
        return {
          isOdoo: true,
          database: dbMatch ? dbMatch[1] : null,
          userId: uidMatch ? parseInt(uidMatch[1], 10) : null,
          version: versionMatch ? parseInt(versionMatch[1], 10) : null,
        };
      }
    }
  }

  return null;
}

function parseSessionInfo(session: any): Partial<OdooInfo> {
  const info: Partial<OdooInfo> = {
    isOdoo: true,
  };

  // Version (both numeric and full string)
  if (session.server_version_info) {
    info.version = session.server_version_info[0];
  }
  if (session.server_version) {
    info.serverVersion = String(session.server_version);
    if (!info.version) {
      const match = info.serverVersion.match(/^(\d+)/);
      if (match) info.version = parseInt(match[1], 10);
    }
  }

  info.database = session.db || null;
  info.userId = session.uid || null;
  info.userName = session.name || session.username || null;

  // Company
  if (session.user_companies?.current_company) {
    info.companyId = session.user_companies.current_company;
    const companies = session.user_companies.allowed_companies;
    if (companies && info.companyId) {
      const company = companies[String(info.companyId)];
      info.companyName = company?.name || null;
    }
  } else if (session.company_id) {
    if (Array.isArray(session.company_id)) {
      info.companyId = session.company_id[0];
      info.companyName = session.company_id[1] || null;
    } else {
      info.companyId = session.company_id;
    }
  }

  return info;
}

// Check for Odoo by looking at DOM elements and meta tags
function detectOdooFromDOM(): { isOdoo: boolean; version: number | null } {
  // Check for Odoo-specific elements
  const hasOdooElements =
    document.querySelector('.o_web_client') !== null ||
    document.querySelector('.o_action_manager') !== null ||
    document.querySelector('.o_main_navbar') !== null ||
    document.querySelector('[data-server-info]') !== null;

  // Check for Odoo assets
  const hasOdooAssets =
    document.querySelector('script[src*="/web/assets"]') !== null ||
    document.querySelector('link[href*="/web/assets"]') !== null;

  // Try to get version from meta or data attributes
  let version: number | null = null;
  const serverInfo = document.querySelector('[data-server-info]');
  if (serverInfo) {
    try {
      const info = JSON.parse(serverInfo.getAttribute('data-server-info') || '{}');
      if (info.server_version_info) {
        version = info.server_version_info[0];
      }
    } catch {}
  }

  return {
    isOdoo: hasOdooElements || hasOdooAssets,
    version,
  };
}

export async function detectOdoo(): Promise<OdooInfo> {
  log('Starting Odoo detection...');

  const info: OdooInfo = {
    isOdoo: false,
    version: null,
    serverVersion: null,
    database: null,
    userId: null,
    userName: null,
    companyId: null,
    companyName: null,
    model: null,
    recordId: null,
    debugMode: false,
    isLocalhost: isLocalhost(),
    isDarkMode: false,
    isSuperuser: false,
  };

  // Method 1: Check DOM for Odoo elements
  const domCheck = detectOdooFromDOM();
  log('DOM detection result:', domCheck);

  if (domCheck.isOdoo) {
    info.isOdoo = true;
    if (domCheck.version) info.version = domCheck.version;
  }

  // Method 2: Extract from embedded script tags
  const scriptData = extractFromScriptTags();
  log('Script tag extraction result:', scriptData);

  if (scriptData) {
    info.isOdoo = true;
    if (scriptData.version) info.version = scriptData.version;
    if (scriptData.serverVersion) info.serverVersion = scriptData.serverVersion;
    if (scriptData.database) info.database = scriptData.database;
    if (scriptData.userId) info.userId = scriptData.userId;
    if (scriptData.userName) info.userName = scriptData.userName;
    if (scriptData.companyId) info.companyId = scriptData.companyId;
    if (scriptData.companyName) info.companyName = scriptData.companyName;
  }

  if (!info.isOdoo) {
    log('Not an Odoo page');
    return info;
  }

  // Only show on Odoo web client (backend), not on website/portal pages
  const isWebClient = document.body.classList.contains('o_web_client');
  if (!isWebClient) {
    log('Odoo detected but not web client (portal/website page), exiting');
    info.isOdoo = false;
    return info;
  }

  // Debug mode from URL
  const url = new URL(window.location.href);
  info.debugMode =
    url.searchParams.get('debug') === '1' ||
    url.searchParams.get('debug') === 'true' ||
    url.searchParams.get('debug') === 'assets';

  // Initial model detection (will be updated dynamically by RPC interception):
  // - DOM attributes (Odoo 17, sometimes works in 18+)
  // - RPC interceptor provides real-time updates as user navigates (primary method)
  //
  // Note: The RPC interceptor (odoo-bridge.js) is the primary source of model info.
  // Initial detection here provides a starting point, but the overlay will update
  // automatically when web_read RPC calls are intercepted.

  info.model = getModelFromDOM();
  info.recordId = getRecordIdFromDOM();

  log('Initial model detection (RPC will provide updates):', { model: info.model, recordId: info.recordId });

  // Dark mode
  info.isDarkMode = detectDarkModeFromDOM();

  // Superuser detection (body has class o_is_superuser)
  info.isSuperuser = document.body.classList.contains('o_is_superuser');

  log('Final detection result:', info);
  return info;
}

function getModelFromDOM(): string | null {
  // Try data-res-model attribute (works in Odoo 17 and sometimes in 18+)
  const selectors = [
    '.o_action_manager .o_action[data-res-model]',
    '.o_content [data-res-model]',
    '.o_form_view[data-res-model]',
    '.o_list_view[data-res-model]',
    '[data-res-model]',
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const model = el.getAttribute('data-res-model');
      if (model) {
        log('Found model from DOM attribute:', model);
        return model;
      }
    }
  }

  // No model found - RPC interceptor will provide it dynamically
  return null;
}

function getRecordIdFromDOM(): number | null {
  const el = document.querySelector('[data-res-id]');
  const id = el?.getAttribute('data-res-id');
  if (id) {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed) && parsed > 0) {
      log('Found record ID from DOM:', parsed);
      return parsed;
    }
  }
  return null;
}

function detectDarkModeFromDOM(): boolean {
  // Primary method: Check for dark mode stylesheet (most reliable for Odoo 18+)
  const darkStylesheet = document.querySelector(
    'link[href*="web.assets_web_dark"], link[href*="assets_web_dark"]'
  );
  if (darkStylesheet) {
    log('Dark mode detected via stylesheet');
    return true;
  }

  // Fallback checks for older versions or different setups
  const html = document.documentElement;
  const body = document.body;

  const checks = [
    // Odoo dark mode classes
    html.classList.contains('o_dark'),
    body.classList.contains('o_dark'),
    document.querySelector('.o_web_client.o_dark') !== null,

    // Bootstrap theme attribute
    html.getAttribute('data-bs-theme') === 'dark',
    body.getAttribute('data-bs-theme') === 'dark',

    // Color scheme attributes
    html.getAttribute('data-color-scheme') === 'dark',
    body.getAttribute('data-color-scheme') === 'dark',
    body.getAttribute('data-theme') === 'dark',
  ];

  const isDark = checks.some((check) => check);
  log('Dark mode detection:', { stylesheetFound: !!darkStylesheet, checks, isDark });
  return isDark;
}

function isLocalhost(): boolean {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function log(...args: unknown[]): void {
  console.log('[Odoo Dev Tools]', ...args);
}
