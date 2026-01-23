import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    version: '1.2.0',
    default_locale: 'en',
    permissions: ['storage', 'activeTab'],
    host_permissions: ['*://*/*'],
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
      512: 'icons/icon-512.png',
    },
    web_accessible_resources: [
      {
        resources: ['odoo-bridge.js'],
        matches: ['*://*/*'],
      },
    ],
  },
});
