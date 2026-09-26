import React, { useState } from 'react';

export default function AdminSettingsPage({ showToast }) {
  const [settings, setSettings] = useState({
    shaEnforced: true,
    sec65bCompliant: true,
    autoAuditSync: true,
    custodySeals: true,
    mfaRequired: true,
    autoTimeout: '30',
    failedLockout: '5',
    immutableLogs: true,
    cctnsSync: true,
    jmfcCourtApi: true,
    tamperAlertSms: true,
    custodyTransferAlert: true
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    showToast?.("Security settings saved & verified against police IT standard baseline.");
  };

  const handleReset = () => {
    setSettings({
      shaEnforced: true,
      sec65bCompliant: true,
      autoAuditSync: true,
      custodySeals: true,
      mfaRequired: true,
      autoTimeout: '30',
      failedLockout: '5',
      immutableLogs: true,
      cctnsSync: true,
      jmfcCourtApi: true,
      tamperAlertSms: true,
      custodyTransferAlert: true
    });
    showToast?.("Settings reset to official police headquarters baseline.");
  };

  return (
    <div className="admin-settings-container">
      {/* Page Header */}
      <div className="admin-settings-header">
        <div>
          <h1 className="admin-settings-title">System Settings</h1>
          <p className="admin-settings-subtitle">
            Configure cryptographic security parameters, CCTNS synchronization, and access policies.
          </p>
        </div>

        <div className="admin-settings-actions">
          <button className="admin-btn-secondary" onClick={handleReset}>
            Reset to Default
          </button>
          <button className="admin-btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="admin-settings-grid">
        
        {/* Card 1: Cryptographic Integrity Baseline */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-box blue">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 2L3 5v6c0 5 7 7 7 7s7-2 7-7V5l-7-3z"/>
                <path d="M8 10l2 2 4-4"/>
              </svg>
            </div>
            <div>
              <h2 className="settings-card-title">Cryptographic Integrity Baseline</h2>
              <p className="settings-card-desc">Hashing and mathematical verification standards</p>
            </div>
          </div>

          <div className="settings-items-list">
            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Enforce SHA-256 Checksums</span>
                <span className="settings-row-sub">Every uploaded document generates immutable hash seal</span>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.shaEnforced} 
                  onChange={() => handleToggle('shaEnforced')} 
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Section 65B Electronic Evidence Standard</span>
                <span className="settings-row-sub">Indian Evidence Act electronic certificate automation</span>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.sec65bCompliant} 
                  onChange={() => handleToggle('sec65bCompliant')} 
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Tamper-Evident Custody Seals</span>
                <span className="settings-row-sub">Require cryptographic key signature for physical & digital transfers</span>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.custodySeals} 
                  onChange={() => handleToggle('custodySeals')} 
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Baseline Health Check</span>
                <span className="settings-row-sub">Automated verification interval: 15 minutes</span>
              </div>
              <span className="settings-status-pill">
                ● 98.7% Verified
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Authentication & Access Security */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-box purple">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="9" width="14" height="9" rx="2"/>
                <path d="M6 9V5a4 4 0 0 1 8 0v4"/>
              </svg>
            </div>
            <div>
              <h2 className="settings-card-title">Authentication & Access Policies</h2>
              <p className="settings-card-desc">Officer session control and identity protection</p>
            </div>
          </div>

          <div className="settings-items-list">
            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Multi-Factor Token Authentication</span>
                <span className="settings-row-sub">Enforced hardware/mobile token for Inspectors and Admins</span>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.mfaRequired} 
                  onChange={() => handleToggle('mfaRequired')} 
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Session Idle Timeout</span>
                <span className="settings-row-sub">Automatic sign-out duration when workstation is inactive</span>
              </div>
              <select 
                className="admin-form-select" 
                style={{ width: '130px' }}
                value={settings.autoTimeout}
                onChange={e => setSettings({ ...settings, autoTimeout: e.target.value })}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Failed Login Lockout</span>
                <span className="settings-row-sub">Attempts before temporary officer account suspension</span>
              </div>
              <select 
                className="admin-form-select" 
                style={{ width: '130px' }}
                value={settings.failedLockout}
                onChange={e => setSettings({ ...settings, failedLockout: e.target.value })}
              >
                <option value="3">3 attempts</option>
                <option value="5">5 attempts</option>
                <option value="10">10 attempts</option>
              </select>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Append-Only Immutable Logs</span>
                <span className="settings-row-sub">Prevents deletion or modification of historical records</span>
              </div>
              <span className="settings-status-pill">
                ● Enforced
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Agency & Judicial Node Integration */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-box green">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 6h14M3 10h14M3 14h14M10 2L2 6v12h16V6l-8-4z"/>
              </svg>
            </div>
            <div>
              <h2 className="settings-card-title">Agency & Judicial Node Integration</h2>
              <p className="settings-card-desc">CCTNS, court filing gateways and forensic laboratory sync</p>
            </div>
          </div>

          <div className="settings-items-list">
            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">CCTNS Core Sync Gateway</span>
                <span className="settings-row-sub">Automated FIR & docket sync with State Police Data Center</span>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.cctnsSync} 
                  onChange={() => handleToggle('cctnsSync')} 
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">JMFC Court Filing API</span>
                <span className="settings-row-sub">Electronic charge sheet submission to Judicial Magistrate</span>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.jmfcCourtApi} 
                  onChange={() => handleToggle('jmfcCourtApi')} 
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Assigned Police Command Node</span>
                <span className="settings-row-sub">MP-BPL-CENTRAL-01 (Bhopal Central Police Station)</span>
              </div>
              <span className="settings-status-pill">
                ● Connected
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Security Alerts & Incident Monitoring */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-box orange">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M15 7C15 4.2 12.8 2 10 2C7.2 2 5 4.2 5 7C5 12 3 13.5 3 13.5H17C17 13.5 15 12 15 7Z"/>
                <path d="M8.5 16.5C8.8 17.4 9.6 18 10.5 18C11.4 18 12.2 17.4 12.5 16.5"/>
              </svg>
            </div>
            <div>
              <h2 className="settings-card-title">Security Notifications & Alerts</h2>
              <p className="settings-card-desc">Instant alerts on critical anomalies and evidence custody events</p>
            </div>
          </div>

          <div className="settings-items-list">
            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Tamper Detection Alert Stream</span>
                <span className="settings-row-sub">Immediate notification if hash checksum verification fails</span>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.tamperAlertSms} 
                  onChange={() => handleToggle('tamperAlertSms')} 
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Chain of Custody Handover Alerts</span>
                <span className="settings-row-sub">SMS & Email alert when high-value physical evidence moves</span>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.custodyTransferAlert} 
                  onChange={() => handleToggle('custodyTransferAlert')} 
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Incident Dispatch Contact</span>
                <span className="settings-row-sub">superintendent-bhopal@police.gov.in</span>
              </div>
              <span className="settings-status-pill">
                ● Active
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
