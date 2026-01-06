import React, { useState, useEffect, useCallback } from 'react';
import type { OdooInfo } from '../utils/odoo-detector';
import type { Settings } from '../services/storage';
import { storage } from '../services/storage';
import { odooClient } from '../services/odoo-client';
import { log } from '../utils/odoo-detector';
import { t } from '../utils/i18n';
import '../styles/overlay.scss';

interface Report {
  id: number;
  name: string;
  report_name: string;
  model: string;
  report_type: string;
}

interface OdooOverlayProps {
  odooInfo: OdooInfo;
  settings: Settings;
}

// Extension icon for minimized state
const OdooIcon = () => {
  const iconUrl = chrome.runtime.getURL('extension-icon.svg');
  return <img src={iconUrl} alt="Odoo Dev Tools" width="24" height="24" style={{ display: 'block' }} />;
};

export function OdooOverlay({ odooInfo, settings }: OdooOverlayProps) {
  const [minimized, setMinimized] = useState(settings.overlayMinimized);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'reports'>('info');

  // Apply dark mode class to root container
  useEffect(() => {
    const root = document.getElementById('odoo-dev-tools-root');
    if (root) {
      if (odooInfo.isDarkMode) {
        root.classList.add('odt-dark');
      } else {
        root.classList.remove('odt-dark');
      }
    }
  }, [odooInfo.isDarkMode]);

  // Load reports when model is available
  useEffect(() => {
    if (odooInfo.model && !minimized) {
      setLoadingReports(true);
      log('Loading reports for model:', odooInfo.model);
      odooClient.getReportsForModel(odooInfo.model).then((r) => {
        log('Loaded reports:', r);
        setReports(r);
        setLoadingReports(false);
      }).catch((err) => {
        log('Error loading reports:', err);
        setLoadingReports(false);
      });
    }
  }, [odooInfo.model, minimized]);

  // Persist minimized state
  useEffect(() => {
    storage.updateSettings({ overlayMinimized: minimized });
  }, [minimized]);

  const copyToClipboard = useCallback(async (value: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      log('Failed to copy:', err);
    }
  }, []);

  const toggleDebugMode = useCallback(() => {
    const url = new URL(window.location.href);
    if (odooInfo.debugMode) {
      url.searchParams.delete('debug');
    } else {
      url.searchParams.set('debug', '1');
    }
    window.location.href = url.toString();
  }, [odooInfo.debugMode]);

  const becomeSuperAdmin = useCallback(() => {
    window.location.href = '/web/become';
  }, []);

  const positionClass = `overlay-${settings.overlayPosition}`;

  // Format database display with version
  const databaseDisplay = odooInfo.database
    ? odooInfo.serverVersion
      ? `${odooInfo.database} @ ${odooInfo.serverVersion}`
      : odooInfo.database
    : null;

  // Check if we have any info to display
  const hasAnyInfo = odooInfo.database || odooInfo.userName || odooInfo.model;

  if (minimized) {
    return (
      <div className={`odoo-dev-tools-minimized ${positionClass}`} onClick={() => setMinimized(false)} title={t('extensionName')}>
        <OdooIcon />
      </div>
    );
  }

  return (
    <div className={`odoo-dev-tools-overlay ${positionClass}`}>
      <div className="overlay-header">
        <span className="overlay-title">{t('extensionName')}</span>
        <button className="minimize-btn" onClick={() => setMinimized(true)} title={t('minimize')}>
          −
        </button>
      </div>

      <div className="overlay-tabs">
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          {t('tabInfo')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          {t('tabReports')}
        </button>
      </div>

      <div className="overlay-content">
        {activeTab === 'info' && (
          <div className="info-panel">
            {!hasAnyInfo ? (
              <p className="no-info">{t('loadingOdooInfo')}</p>
            ) : (
              <>
                <InfoRow
                  label={t('labelDatabase')}
                  displayValue={databaseDisplay}
                  copyValue={odooInfo.database}
                  copyMessage={t('copiedDatabase')}
                  onCopy={copyToClipboard}
                  copied={copiedField === 'database'}
                  fieldKey="database"
                />
                <InfoRow
                  label={t('labelUser')}
                  displayValue={odooInfo.userName ? `${odooInfo.userName} (ID: ${odooInfo.userId})` : null}
                  copyValue={odooInfo.userId?.toString()}
                  copyMessage={t('copiedUserId')}
                  onCopy={copyToClipboard}
                  copied={copiedField === 'user'}
                  fieldKey="user"
                />
                <InfoRow
                  label={t('labelCompany')}
                  displayValue={odooInfo.companyName ? `${odooInfo.companyName} (ID: ${odooInfo.companyId})` : null}
                  copyValue={odooInfo.companyId?.toString()}
                  copyMessage={t('copiedCompanyId')}
                  onCopy={copyToClipboard}
                  copied={copiedField === 'company'}
                  fieldKey="company"
                />
                <InfoRow
                  label={t('labelModel')}
                  displayValue={odooInfo.model}
                  copyValue={odooInfo.model}
                  copyMessage={t('copiedModel')}
                  onCopy={copyToClipboard}
                  copied={copiedField === 'model'}
                  fieldKey="model"
                />
                <InfoRow
                  label={t('labelRecordId')}
                  displayValue={odooInfo.recordId?.toString()}
                  copyValue={odooInfo.recordId?.toString()}
                  copyMessage={t('copiedRecordId')}
                  onCopy={copyToClipboard}
                  copied={copiedField === 'recordid'}
                  fieldKey="recordid"
                />
              </>
            )}

            <div className="action-buttons">
              <button
                className={`action-btn ${odooInfo.debugMode ? 'active' : ''}`}
                onClick={toggleDebugMode}
              >
                {odooInfo.debugMode ? t('disableDebug') : t('enableDebug')}
              </button>
              <button
                className={`action-btn danger ${odooInfo.isSuperuser ? 'disabled' : ''}`}
                onClick={becomeSuperAdmin}
                disabled={odooInfo.isSuperuser}
                title={odooInfo.isSuperuser ? t('alreadySuperuser') : t('becomeSuperuser')}
              >
                {odooInfo.isSuperuser ? t('superuser') : t('turnOdooBot')}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-panel">
            {!odooInfo.model ? (
              <p className="no-data">{t('navigateToView')}</p>
            ) : loadingReports ? (
              <p className="loading">{t('loadingReports')}</p>
            ) : reports.length === 0 ? (
              <p className="no-data">{t('noReportsAvailable', odooInfo.model)}</p>
            ) : (
              <ul className="report-list">
                {reports.map((report) => (
                  <li key={report.id} className="report-item">
                    <span className="report-name">{report.name}</span>
                    <div className="report-actions">
                      {odooInfo.recordId && (
                        <>
                          <a
                            href={odooClient.getReportHtmlUrl(report.report_name, odooInfo.recordId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="report-link"
                          >
                            {t('linkHtml')}
                          </a>
                          <a
                            href={odooClient.getReportPdfUrl(report.report_name, odooInfo.recordId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="report-link"
                          >
                            {t('linkPdf')}
                          </a>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  displayValue: string | null | undefined;
  copyValue: string | null | undefined;
  copyMessage: string;
  onCopy: (value: string, fieldKey: string) => void;
  copied: boolean;
  fieldKey: string;
}

function InfoRow({ label, displayValue, copyValue, copyMessage, onCopy, copied, fieldKey }: InfoRowProps) {
  if (!displayValue) return null;

  const handleClick = () => {
    if (copyValue) {
      onCopy(copyValue, fieldKey);
    }
  };

  return (
    <div
      className={`info-row ${copied ? 'copied' : ''}`}
      onClick={handleClick}
      title={copyValue ? t('clickToCopy', copyValue) : undefined}
    >
      <span className="info-label">{label}:</span>
      <span className="info-value">{displayValue}</span>
      {copied && <span className="copy-badge">{copyMessage}</span>}
    </div>
  );
}
