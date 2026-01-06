import React, { useEffect, useState } from 'react';
import { storage, type Settings, defaultSettings } from '../../src/services/storage';
import { t } from '../../src/utils/i18n';
import '../../src/styles/popup.scss';

type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}

function ToggleSwitch({ checked, onChange, id }: ToggleSwitchProps) {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider" />
    </label>
  );
}

export function Popup() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const updateSetting = async <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await storage.setSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="popup-header">
          <span className="popup-title">{t('extensionName')}</span>
        </div>
        <div className="popup-content">
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="popup-header">
        <span className="popup-title">{t('extensionName')}</span>
      </div>

      <div className="popup-content">
        <div className="settings-section">
          <h2>{t('settings')}</h2>

          <div className="setting-item">
            <span className="setting-label">{t('settingAutoDebug')}</span>
            <ToggleSwitch
              id="autoDebug"
              checked={settings.autoDebug}
              onChange={(checked) => updateSetting('autoDebug', checked)}
            />
          </div>

          <div className="setting-item">
            <span className="setting-label">{t('settingShowOverlay')}</span>
            <ToggleSwitch
              id="showOverlay"
              checked={settings.showOverlay}
              onChange={(checked) => updateSetting('showOverlay', checked)}
            />
          </div>

          <div className="setting-item">
            <span className="setting-label">{t('settingOverlayPosition')}</span>
            <select
              value={settings.overlayPosition}
              onChange={(e) => updateSetting('overlayPosition', e.target.value as OverlayPosition)}
            >
              <option value="top-left">{t('positionTopLeft')}</option>
              <option value="top-right">{t('positionTopRight')}</option>
              <option value="bottom-left">{t('positionBottomLeft')}</option>
              <option value="bottom-right">{t('positionBottomRight')}</option>
            </select>
          </div>
        </div>

        <div className="info-section">
          <p className="version">v1.1.0</p>
        </div>
      </div>
    </div>
  );
}
