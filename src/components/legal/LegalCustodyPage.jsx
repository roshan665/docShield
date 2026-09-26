import React, { useState, useMemo } from 'react';
import { legalCustodyTimelineData } from '../../data/legalOfficerData';
import { CustodyTimelineModal } from './LegalModals';

export default function LegalCustodyPage({ showToast }) {
  const [custodyRecords] = useState(legalCustodyTimelineData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter
  const filteredRecords = useMemo(() => {
    return custodyRecords.filter(item => {
      const q = searchQuery.toLowerCase();
      return !q ||
        item.evidenceId.toLowerCase().includes(q) ||
        item.caseNo.toLowerCase().includes(q) ||
        item.item.toLowerCase().includes(q) ||
        item.currentCustodian.toLowerCase().includes(q) ||
        item.currentLocation.toLowerCase().includes(q);
    });
  }, [custodyRecords, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  return (
    <div className="legal-page-container">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="legal-page-header">
        <div className="legal-header-left">
          <h1 className="legal-page-title">Chain of Custody Judicial Audit Trail</h1>
          <p className="legal-page-subtitle">
            Read-only chronological verification of evidence movement, Malkhana registers, dispatch road certificates, and wax seals for court trial.
          </p>
        </div>
        <div className="legal-header-actions">
          <button 
            className="legal-btn-secondary"
            onClick={() => showToast?.("Exporting Judicial Chain of Custody Certificate (Sec 293 CrPC)...")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export Custody Certificate
          </button>
        </div>
      </div>

      {/* ========================================================
          2. SUMMARY KPI CARDS (Structured Boundary Panels)
          ======================================================== */}
      <div className="legal-kpi-grid four-cols">
        <div className="legal-kpi-card">
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">AUDITED EXHIBITS</span>
            <div className="legal-kpi-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{custodyRecords.length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">Complete History</span>
            <span className="legal-kpi-text">No broken handovers</span>
          </div>
        </div>

        <div className="legal-kpi-card">
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">TOTAL CUSTODY TRANSFERS</span>
            <div className="legal-kpi-icon-wrap green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">
            {custodyRecords.reduce((acc, c) => acc + c.timeline.length, 0)}
          </div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">100% Sealed</span>
            <span className="legal-kpi-text">Register 19 verified</span>
          </div>
        </div>

        <div className="legal-kpi-card">
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">STATION MALKHANA DEPOSITS</span>
            <div className="legal-kpi-icon-wrap amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">2</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend amber">Vault Secured</span>
            <span className="legal-kpi-text">Bhopal Central PS</span>
          </div>
        </div>

        <div className="legal-kpi-card">
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">FORENSIC LAB TRANSIT</span>
            <div className="legal-kpi-icon-wrap purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">1</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend purple">RFSL Ballistics</span>
            <span className="legal-kpi-text">RC-BH-2024-410</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. SEARCH TOOLBAR (Dedicated Bordered Container)
          ======================================================== */}
      <div className="legal-toolbar-container">
        <div className="legal-toolbar-left">
          <div className="legal-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search by Evidence ID, Case ID, Exhibit Item, Custodian, or Location..." 
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
      </div>

      {/* ========================================================
          4. MAIN CUSTODY TABLE (Inside Clearly Bordered Content Card)
          ======================================================== */}
      <div className="legal-content-card">
        <div className="legal-card-header-bar">
          <div className="legal-card-header-left">
            <span className="legal-card-accent-bar" />
            <h2 className="legal-card-title">Secured Evidence Custody & Handover Register</h2>
            <span className="legal-card-subtitle">Showing {filteredRecords.length} audited exhibits</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="legal-table-responsive">
          <table className="legal-table">
            <thead>
              <tr>
                <th>EVIDENCE ID</th>
                <th>CASE ID</th>
                <th>EXHIBIT DESCRIPTION</th>
                <th>CURRENT CUSTODIAN</th>
                <th>CURRENT LOCATION</th>
                <th>CUSTODY STATUS</th>
                <th>LAST TRANSFER</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No custody logs found matching the filter.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(item => (
                  <tr key={item.evidenceId}>
                    <td>
                      <span style={{ fontWeight: '700', color: '#1E6DEB', fontFamily: 'monospace', fontSize: '13px' }}>
                        {item.evidenceId}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: '#0F172A', fontFamily: 'monospace', fontSize: '12.5px' }}>
                        {item.caseNo}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.item}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {item.timeline.length} transfer handovers recorded
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', color: '#1E293B', fontWeight: '500' }}>{item.currentCustodian}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#334155' }}>{item.currentLocation}</div>
                    </td>
                    <td>
                      <span className="legal-badge chain-verified">
                        {item.custodyStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {item.lastTransfer}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="legal-action-btn primary"
                        onClick={() => setSelectedRecord(item)}
                      >
                        Audit Timeline
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
            Showing <strong>{filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredRecords.length)}</strong> of <strong>{filteredRecords.length}</strong> exhibits
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

      {/* Custody Timeline Modal */}
      <CustodyTimelineModal 
        custodyRecord={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
}
