export type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface Settings {
  autoDebug: boolean;
  showOverlay: boolean;
  overlayPosition: OverlayPosition;
  overlayMinimized: boolean;
}

export const defaultSettings: Settings = {
  autoDebug: false,
  showOverlay: true,
  overlayPosition: 'bottom-right',
  overlayMinimized: false,
};

const SETTINGS_KEY = 'odoo-dev-tools-settings';

export const storage = {
  async getSettings(): Promise<Settings> {
    try {
      const result = await browser.storage.local.get(SETTINGS_KEY);
      return { ...defaultSettings, ...result[SETTINGS_KEY] };
    } catch {
      return defaultSettings;
    }
  },

  async setSettings(settings: Settings): Promise<void> {
    await browser.storage.local.set({ [SETTINGS_KEY]: settings });
  },

  async updateSettings(partial: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    const updated = { ...current, ...partial };
    await this.setSettings(updated);
    return updated;
  },
};
