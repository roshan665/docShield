import React, { useState, useMemo } from 'react';
import { legalAuditLogsList } from '../../data/legalOfficerData';

export default function LegalAuditLogsPage({ showToast }) {
  const [logs] = useState(legalAuditLogsList);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter
  const filteredLogs = useMemo(() => {
    return logs.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        item.id.toLowerCase().includes(q) ||
        item.user.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.caseNo.toLowerCase().includes(q) ||
        item.result.toLowerCase().includes(q);

      const matchesModule = moduleFilter === 'ALL' || item.module === moduleFilter;

      return matchesSearch && matchesModule;
    });
  }, [logs, searchQuery, moduleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage]);

  return (
    <div className="legal-page-container">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="legal-page-header">
        <div className="legal-header-left">
          <h1 className="legal-page-title">Prosecution Legal Officer Audit Logs</h1>
          <p className="legal-page-subtitle">
            Cryptographically sealed and immutable audit logs of legal scrutiny reviews, return memos, and court filings.
          </p>
        </div>
        <div className="legal-header-actions">
          <button 
            className="legal-btn-secondary"
            onClick={() => showToast?.("Exporting Legal Audit Trail (CSV)...")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export Audit Trail
          </button>
        </div>
      </div>

      {/* ========================================================
          2. SUMMARY KPI CARDS (Structured Boundary Panels)
          ======================================================== */}
      <div className="legal-kpi-grid four-cols">
        <div 
          className={`legal-kpi-card ${moduleFilter === 'ALL' ? 'active-tab' : ''}`}
          onClick={() => { setModuleFilter('ALL'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">TOTAL AUDIT ENTRIES</span>
            <div className="legal-kpi-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{logs.length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">HMAC-SHA256</span>
            <span className="legal-kpi-text">Immutable records</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${moduleFilter === 'Charge Sheets' ? 'active-tab' : ''}`}
          onClick={() => { setModuleFilter('Charge Sheets'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">CHARGE SHEET REVIEWS</span>
            <div className="legal-kpi-icon-wrap green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{logs.filter(l => l.module === 'Charge Sheets').length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">Signed & Sealed</span>
            <span className="legal-kpi-text">CrPC 173 trail</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${moduleFilter === 'Forensic Reports' ? 'active-tab' : ''}`}
          onClick={() => { setModuleFilter('Forensic Reports'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">FSL AUDITS</span>
            <div className="legal-kpi-icon-wrap purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{logs.filter(l => l.module === 'Forensic Reports').length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend purple">Expert Clearances</span>
            <span className="legal-kpi-text">Sec 45 IEA</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${moduleFilter === 'Court Filings' ? 'active-tab' : ''}`}
          onClick={() => { setModuleFilter('Court Filings'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">COURT SUBMISSIONS</span>
            <div className="legal-kpi-icon-wrap amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="21" x2="21" y2="21"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <polyline points="5 6 12 3 19 6"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{logs.filter(l => l.module === 'Court Filings').length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend amber">Judicial Filings</span>
            <span className="legal-kpi-text">JMFC & Sessions</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. SEARCH & FILTER TOOLBAR (Dedicated Bordered Container)
          ======================================================== */}
      <div className="legal-toolbar-container">
        <div className="legal-toolbar-left">
          <div className="legal-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search by Action, User, Case ID, or Result..." 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="legal-toolbar-right">
          <div className="legal-filter-select-wrap">
            <select 
              className="legal-filter-select"
              value={moduleFilter}
              onChange={e => { setModuleFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Legal Modules</option>
              <option value="Charge Sheets">Charge Sheets</option>
              <option value="Forensic Reports">Forensic Reports</option>
              <option value="Court Filings">Court Filings</option>
              <option value="Chain of Custody">Chain of Custody</option>
              <option value="Documents">Documents</option>
            </select>
            <svg className="legal-filter-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN AUDIT LOGS TABLE (Inside Clearly Bordered Card)
          ======================================================== */}
      <div className="legal-content-card">
        <div className="legal-card-header-bar">
          <div className="legal-card-header-left">
            <span className="legal-card-accent-bar" />
            <h2 className="legal-card-title">Cryptographic Legal Audit Stream</h2>
            <span className="legal-card-subtitle">Showing {filteredLogs.length} audit entries</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="legal-table-responsive">
          <table className="legal-table">
            <thead>
              <tr>
                <th>LOG ID</th>
                <th>TIMESTAMP</th>
                <th>USER & ROLE</th>
                <th>ACTION PERFORMED</th>
                <th>MODULE</th>
                <th>CASE ID</th>
                <th>RESULT / STATUS</th>
                <th style={{ textAlign: 'right' }}>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No audit logs found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: '700', color: '#64748B', fontFamily: 'monospace', fontSize: '12px' }}>
                        {item.id}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#334155' }}>
                      {item.timestamp}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.user}</div>
                      <div style={{ fontSize: '11px', color: '#1E6DEB', fontWeight: '500' }}>{item.role}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '500', color: '#1E293B', fontSize: '13px' }}>{item.action}</span>
                    </td>
                    <td>
                      <span className="legal-badge" style={{ backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1' }}>
                        {item.module}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#1E6DEB', fontFamily: 'monospace', fontSize: '12.5px' }}>
                        {item.caseNo}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: item.result.includes('Success') ? '#16A34A' : '#D97706' 
                      }}>
                        {item.result}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="legal-action-btn primary"
                        onClick={() => setSelectedLog(item)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Integrated Pagination Bar */}
        <div className="legal-pagination-bar">
          <div className="legal-pagination-info">
            Showing <strong>{filteredLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredLogs.length)}</strong> of <strong>{filteredLogs.length}</strong> logs
          </div>
          <div className="legal-pagination-controls">
            <button 
              className="legal-page-btn" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`legal-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="legal-page-btn" 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. READ-ONLY AUDIT LOG DETAIL MODAL (Structured Sections)
          ======================================================== */}
      {selectedLog && (
        <div className="legal-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="legal-modal-dialog" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="legal-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="legal-card-accent-bar" style={{ height: '16px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Audit Trail Detail — {selectedLog.id}
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 11px' }}>
                  HMAC-SHA256 Authenticated System Log
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#64748B', cursor: 'pointer' }}>×</button>
            </div>

            {/* Modal Body */}
            <div className="legal-modal-body">
              
              {/* SECTION 1: Event Log Identity */}
              <div className="legal-section-container">
                <div className="legal-section-header">
                  <span className="legal-section-header-title">
                    🛡️ Event Log Identity & Verification
                  </span>
                  <span className="legal-badge verified">✓ Cryptographically Intact</span>
                </div>
                <div className="legal-section-content">
                  <div className="legal-kv-grid">
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">LOG ENTRY ID</span>
                      <code style={{ fontSize: '12px', color: '#1E6DEB' }}>{selectedLog.id}</code>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">TIMESTAMP</span>
                      <span className="legal-kv-value">{selectedLog.timestamp}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">AUTHENTICATED USER</span>
                      <span className="legal-kv-value">{selectedLog.user} ({selectedLog.role})</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">MODULE / AREA</span>
                      <span className="legal-kv-value">{selectedLog.module}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Action & Terminal Diagnostics */}
              <div className="legal-section-container" style={{ marginBottom: 0 }}>
                <div className="legal-section-header">
                  <span className="legal-section-header-title">
                    💻 Action Execution & Network Terminal
                  </span>
                  <span className="legal-section-header-sub">Prosecution Intranet Node</span>
                </div>
                <div className="legal-section-content">
                  <div className="legal-kv-grid">
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">ACTION PERFORMED</span>
                      <span className="legal-kv-value">{selectedLog.action}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">ASSOCIATED CASE ID</span>
                      <span className="legal-kv-value" style={{ color: '#1E6DEB', fontFamily: 'monospace' }}>{selectedLog.caseNo}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">EXECUTION RESULT</span>
                      <span className="legal-kv-value" style={{ color: '#16A34A' }}>{selectedLog.result}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">SOURCE NETWORK IP</span>
                      <code style={{ fontSize: '12px', color: '#475569' }}>{selectedLog.ipAddress}</code>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="legal-modal-footer">
              <button className="legal-btn-primary" onClick={() => setSelectedLog(null)}>Close</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
