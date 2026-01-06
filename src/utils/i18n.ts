/**
 * Internationalization (i18n) utility
 *
 * Provides a simple wrapper around Chrome's i18n API for getting translated messages.
 * Translations are stored in public/_locales/{lang}/messages.json
 *
 * Supported languages: en (English), de (German), it (Italian), es (Spanish), fr (French)
 */

/**
 * Get a translated message by key
 * @param key - The message key from messages.json
 * @param substitutions - Optional substitution values for placeholders
 * @returns The translated message string
 */
export function t(key: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

/**
 * Get the current UI language
 * @returns The language code (e.g., 'en', 'de', 'it', 'es', 'fr')
 */
export function getUILanguage(): string {
  return chrome.i18n.getUILanguage();
}

/**
 * Check if a language is RTL (Right-To-Left)
 * @param lang - The language code (defaults to current UI language)
 * @returns true if the language is RTL
 */
export function isRTL(lang?: string): boolean {
  const language = lang || getUILanguage();
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language.split('-')[0]);
}
