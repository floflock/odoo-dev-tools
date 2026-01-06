import React, { useState, useEffect, useCallback } from 'react';
import type { OdooInfo } from '../utils/odoo-detector';
import type { Settings } from '../services/storage';
import { storage } from '../services/storage';
import { odooClient } from '../services/odoo-client';
import { log } from '../utils/odoo-detector';
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

// Odoo-style icon for minimized state
const OdooIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

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
      <div className={`odoo-dev-tools-minimized ${positionClass}`} onClick={() => setMinimized(false)} title="Odoo Dev Tools">
        <OdooIcon />
      </div>
    );
  }

  return (
    <div className={`odoo-dev-tools-overlay ${positionClass}`}>
      <div className="overlay-header">
        <span className="overlay-title">Odoo Dev Tools</span>
        <button className="minimize-btn" onClick={() => setMinimized(true)} title="Minimize">
          −
        </button>
      </div>

      <div className="overlay-tabs">
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Info
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      <div className="overlay-content">
        {activeTab === 'info' && (
          <div className="info-panel">
            {!hasAnyInfo ? (
              <p className="no-info">Loading Odoo info... Try refreshing if this persists.</p>
            ) : (
              <>
                <InfoRow
                  label="Database"
                  displayValue={databaseDisplay}
                  copyValue={odooInfo.database}
                  copyMessage="Database copied"
                  onCopy={copyToClipboard}
                  copied={copiedField === 'database'}
                  fieldKey="database"
                />
                <InfoRow
                  label="User"
                  displayValue={odooInfo.userName ? `${odooInfo.userName} (ID: ${odooInfo.userId})` : null}
                  copyValue={odooInfo.userId?.toString()}
                  copyMessage="User ID copied"
                  onCopy={copyToClipboard}
                  copied={copiedField === 'user'}
                  fieldKey="user"
                />
                <InfoRow
                  label="Company"
                  displayValue={odooInfo.companyName ? `${odooInfo.companyName} (ID: ${odooInfo.companyId})` : null}
                  copyValue={odooInfo.companyId?.toString()}
                  copyMessage="Company ID copied"
                  onCopy={copyToClipboard}
                  copied={copiedField === 'company'}
                  fieldKey="company"
                />
                <InfoRow
                  label="Model"
                  displayValue={odooInfo.model}
                  copyValue={odooInfo.model}
                  copyMessage="Model copied"
                  onCopy={copyToClipboard}
                  copied={copiedField === 'model'}
                  fieldKey="model"
                />
                <InfoRow
                  label="Record ID"
                  displayValue={odooInfo.recordId?.toString()}
                  copyValue={odooInfo.recordId?.toString()}
                  copyMessage="Record ID copied"
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
                {odooInfo.debugMode ? 'Disable Debug' : 'Enable Debug'}
              </button>
              <button
                className={`action-btn danger ${odooInfo.isSuperuser ? 'disabled' : ''}`}
                onClick={becomeSuperAdmin}
                disabled={odooInfo.isSuperuser}
                title={odooInfo.isSuperuser ? 'Already superuser' : 'Become superuser'}
              >
                {odooInfo.isSuperuser ? 'Superuser' : 'Turn OdooBot'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-panel">
            {!odooInfo.model ? (
              <p className="no-data">Navigate to a view to see available reports</p>
            ) : loadingReports ? (
              <p className="loading">Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="no-data">No reports available for {odooInfo.model}</p>
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
                            HTML
                          </a>
                          <a
                            href={odooClient.getReportPdfUrl(report.report_name, odooInfo.recordId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="report-link"
                          >
                            PDF
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
      title={copyValue ? `Click to copy: ${copyValue}` : undefined}
    >
      <span className="info-label">{label}:</span>
      <span className="info-value">{displayValue}</span>
      {copied && <span className="copy-badge">{copyMessage}</span>}
    </div>
  );
}
