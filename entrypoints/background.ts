export default defineBackground(() => {
  // Background service worker for Odoo Dev Tools
  // Handle extension installation
  browser.runtime.onInstalled.addListener(() => {
    console.log('Odoo Dev Tools installed');
  });
});
