import React, { useState } from 'react';

// ========================================================
// 1. AUDIT LOG DETAIL MODAL
// ========================================================
export function AuditLogDetailModal({ log, onClose, onOpenCase, showToast }) {
  if (!log) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(log.hash || '');
    showToast(`Audit hash copied to clipboard: ${log.hash.substring(0, 16)}...`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#EBF3FC',
              color: '#1E6DEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 2L3 5v6c0 5 7 7 7 7s7-2 7-7V5l-7-3z"/>
                <path d="M10 7v3l2 2"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="modal-title" style={{ fontSize: '17px', fontFamily: 'monospace' }}>{log.id}</h3>
                <span className={`audit-status-badge ${
                  log.status === 'Success' ? 'audit-status-success' :
                  log.status === 'Failed' ? 'audit-status-failed' : 'audit-status-warning'
                }`}>
                  {log.status}
                </span>
                <span className="audit-module-badge">{log.module}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {log.action} • {log.timestampDate} at {log.timestampTime}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Action Description */}
          <div style={{
            padding: '14px',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Action Summary & Description
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1E293B', marginTop: '3px' }}>
              {log.action}
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
              {log.description}
            </div>
          </div>

          {/* Key Audit Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ padding: '10px 12px', border: '1px solid #F1F5F9', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>User / Actor</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>{log.actor}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>Bhopal Police Investigation Wing</div>
            </div>

            <div style={{ padding: '10px 12px', border: '1px solid #F1F5F9', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Associated Case Number</div>
              {log.caseNo !== '—' ? (
                <div 
                  style={{ fontSize: '13px', fontWeight: 700, color: '#1E6DEB', marginTop: '2px', cursor: 'pointer' }}
                  onClick={() => { onClose(); onOpenCase(log.caseNo); }}
                >
                  {log.caseNo}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>—</div>
              )}
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                {log.caseNo !== '—' ? 'Click to inspect case docket' : 'Global system auth event'}
              </div>
            </div>

            <div style={{ padding: '10px 12px', border: '1px solid #F1F5F9', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Target Record Identifier</div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginTop: '2px', fontFamily: 'monospace' }}>
                {log.recordId}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>Module: {log.module}</div>
            </div>

            <div style={{ padding: '10px 12px', border: '1px solid #F1F5F9', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Network IP & Device Client</div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginTop: '2px', fontFamily: 'monospace' }}>
                {log.ip}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>{log.device}</div>
            </div>
          </div>

          {/* Cryptographic Proof */}
          <div style={{
            padding: '12px',
            backgroundColor: '#FAFCFE',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" color="#10B981">
                  <path d="M8 0L2 3v5c0 4.42 2.56 8.56 6 9.68 3.44-1.12 6-5.26 6-9.68V3L8 0zm-1 11.5L3.5 8l1.41-1.41L7 8.67l4.09-4.08L12.5 6 7 11.5z"/>
                </svg>
                SHA-256 Telemetry Hash
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1E6DEB',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Copy Hash
              </button>
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '6px 8px',
              borderRadius: '4px',
              color: '#334155',
              wordBreak: 'break-all'
            }}>
              {log.hash}
            </div>
          </div>

          {/* Immutable Security Notice */}
          <div style={{
            padding: '10px 12px',
            backgroundColor: '#F1F5F9',
            borderRadius: '6px',
            borderLeft: '3px solid #1E6DEB',
            fontSize: '11.5px',
            color: '#475569',
            lineHeight: 1.45
          }}>
            <strong style={{ color: '#1E293B' }}>Legal Compliance & Immutability:</strong> Historical audit logs in DocShield are append-only and cryptographically verified. Standard Inspector roles cannot modify, purge, or suppress audit records under SIH 26190 standards.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================================
// 2. EXPORT LOGS MODAL
// ========================================================
export function ExportLogsModal({ logs = [], onClose, showToast }) {
  const [format, setFormat] = useState('csv');
  const [includeHashes, setIncludeHashes] = useState(true);

  const handleExport = () => {
    if (format === 'csv') {
      const headers = ["Event ID", "Timestamp", "Actor", "Action", "Module", "Record ID", "Case No", "IP Address", "Device", "Status", "SHA-256 Hash"];
      const rows = logs.map(l => [
        `"${l.id}"`,
        `"${l.timestampDate} ${l.timestampTime}"`,
        `"${l.actor}"`,
        `"${l.action}"`,
        `"${l.module}"`,
        `"${l.recordId}"`,
        `"${l.caseNo}"`,
        `"${l.ip}"`,
        `"${l.device}"`,
        `"${l.status}"`,
        includeHashes ? `"${l.hash}"` : '""'
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `DocShield_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Exported ${logs.length} audit logs as CSV.`);
    } else {
      const element = document.createElement("a");
      const file = new Blob([
        `DocShield Investigation Security Audit Report (Official Police Telemetry)\n` +
        `=========================================================================\n` +
        `Generated: ${new Date().toLocaleString()}\n` +
        `Authorized Officer: Inspector, Bhopal Police\n` +
        `Total Records Exported: ${logs.length}\n` +
        `Integrity Framework: FIPS 180-4 SHA-256 Immutable Audit Chain\n\n` +
        logs.map((l, i) => 
          `[${i + 1}] Event ID: ${l.id} | ${l.timestampDate} ${l.timestampTime}\n` +
          `    Actor: ${l.actor} | Action: ${l.action} | Module: ${l.module}\n` +
          `    Case: ${l.caseNo} | Record: ${l.recordId} | Status: ${l.status}\n` +
          `    Client IP: ${l.ip} (${l.device})\n` +
          (includeHashes ? `    Audit Digest: ${l.hash}\n` : '')
        ).join('\n') +
        `\n=========================================================================\n` +
        `End of Official Police Audit Dossier\n`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `DocShield_Audit_Report_${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      showToast(`Exported ${logs.length} audit logs as certified audit dossier.`);
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#EBF3FC',
              color: '#1E6DEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
              </svg>
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '16.5px' }}>Export Audit Logs</h3>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Download certified investigation activity records
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{
            padding: '12px',
            backgroundColor: '#F8FAFC',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            marginBottom: '16px',
            fontSize: '12.5px',
            color: '#334155'
          }}>
            Preparing export for <strong style={{ color: '#1E6DEB' }}>{logs.length}</strong> activity records based on your currently applied filters.
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Export Format
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div
                onClick={() => setFormat('csv')}
                style={{
                  border: format === 'csv' ? '2px solid #1E6DEB' : '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: format === 'csv' ? '#F0F6FE' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>CSV Format</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Spreadsheet & Analysis</div>
              </div>

              <div
                onClick={() => setFormat('pdf')}
                style={{
                  border: format === 'pdf' ? '2px solid #1E6DEB' : '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: format === 'pdf' ? '#F0F6FE' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>Certified Dossier</div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Court & Forensic Proof</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#334155', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeHashes}
                onChange={(e) => setIncludeHashes(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#1E6DEB' }}
              />
              Include SHA-256 cryptographic telemetry checksums
            </label>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleExport}>
            Generate & Download
          </button>
        </div>
      </div>
    </div>
  );
}
