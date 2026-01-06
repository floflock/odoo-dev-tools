import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    version: '1.1.0',
    default_locale: 'en',
    permissions: ['storage', 'activeTab'],
    host_permissions: ['*://*/*'],
    web_accessible_resources: [
      {
        resources: ['odoo-bridge.js'],
        matches: ['*://*/*'],
      },
    ],
  },
});
