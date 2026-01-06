import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Odoo Dev Tools',
    description: 'Developer tools for Odoo - Debug mode, quick links, reports, and more',
    version: '1.0.0',
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
