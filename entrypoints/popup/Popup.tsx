import React, { useEffect, useState } from 'react';
import { storage, type Settings, defaultSettings } from '../../src/services/storage';
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
          <span className="popup-title">Odoo Dev Tools</span>
        </div>
        <div className="popup-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="popup-header">
        <span className="popup-title">Odoo Dev Tools</span>
      </div>

      <div className="popup-content">
        <div className="settings-section">
          <h2>Settings</h2>

          <div className="setting-item">
            <span className="setting-label">Auto-enable debug mode</span>
            <ToggleSwitch
              id="autoDebug"
              checked={settings.autoDebug}
              onChange={(checked) => updateSetting('autoDebug', checked)}
            />
          </div>

          <div className="setting-item">
            <span className="setting-label">Show overlay</span>
            <ToggleSwitch
              id="showOverlay"
              checked={settings.showOverlay}
              onChange={(checked) => updateSetting('showOverlay', checked)}
            />
          </div>

          <div className="setting-item">
            <span className="setting-label">Overlay position</span>
            <select
              value={settings.overlayPosition}
              onChange={(e) => updateSetting('overlayPosition', e.target.value as OverlayPosition)}
            >
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>
        </div>

        <div className="info-section">
          <p className="version">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
