import React, { useState, useMemo } from 'react';
import { legalForensicReportsList } from '../../data/legalOfficerData';

export default function LegalForensicsPage({ showToast }) {
  const [reports, setReports] = useState(legalForensicReportsList);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter pipeline
  const filteredReports = useMemo(() => {
    return reports.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        item.id.toLowerCase().includes(q) ||
        item.caseNo.toLowerCase().includes(q) ||
        item.reportType.toLowerCase().includes(q) ||
        item.expertName.toLowerCase().includes(q) ||
        item.lab.toLowerCase().includes(q);

      const matchesReview = reviewFilter === 'ALL' || item.reviewedStatus === reviewFilter;

      return matchesSearch && matchesReview;
    });
  }, [reports, searchQuery, reviewFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, currentPage]);

  const handleUpdateStatus = (reportId, newStatus) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, reviewedStatus: newStatus } : r));
    showToast?.(`Report ${reportId} status updated to "${newStatus}".`);
    setSelectedReport(null);
  };

  return (
    <div className="legal-page-container">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="legal-page-header">
        <div className="legal-header-left">
          <h1 className="legal-page-title">Forensic Science Lab Reports Scrutiny</h1>
          <p className="legal-page-subtitle">
            Review expert opinions under Section 45 Indian Evidence Act, ballistic matching, DNA profiling, and digital cyber certifications.
          </p>
        </div>
        <div className="legal-header-actions">
          <button 
            className="legal-btn-secondary"
            onClick={() => showToast?.("Validating FSL digital signatures & lab accreditation certificates...")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Verify Expert Signatures
          </button>
        </div>
      </div>

      {/* ========================================================
          2. SUMMARY KPI CARDS (Structured Boundary Panels)
          ======================================================== */}
      <div className="legal-kpi-grid four-cols">
        <div 
          className={`legal-kpi-card ${reviewFilter === 'ALL' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('ALL'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">TOTAL FSL REPORTS</span>
            <div className="legal-kpi-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{reports.length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">RFSL / CFSL</span>
            <span className="legal-kpi-text">Under scrutiny</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${reviewFilter === 'Legal Clearance' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('Legal Clearance'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">LEGAL CLEARANCE ISSUED</span>
            <div className="legal-kpi-icon-wrap green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{reports.filter(r => r.reviewedStatus === 'Legal Clearance').length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">Trial Ready</span>
            <span className="legal-kpi-text">Sec 45 IEA compliant</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${reviewFilter === 'Clarification Requested' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('Clarification Requested'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">CLARIFICATION PENDING</span>
            <div className="legal-kpi-icon-wrap amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{reports.filter(r => r.reviewedStatus === 'Clarification Requested').length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend amber">Query to Director</span>
            <span className="legal-kpi-text">Transit note pending</span>
          </div>
        </div>

        <div 
          className="legal-kpi-card"
          onClick={() => showToast?.("Section 45 Indian Evidence Act requires expert qualifications to be certified.")}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">LAB ACCREDITATION</span>
            <div className="legal-kpi-icon-wrap purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">100%</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend purple">NABL Certified</span>
            <span className="legal-kpi-text">State FSL Network</span>
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
              placeholder="Search by Report ID, Case ID, Examination Type, Expert, or Laboratory..." 
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
              value={reviewFilter}
              onChange={e => { setReviewFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Legal Scrutiny Stages</option>
              <option value="Legal Clearance">Legal Clearance</option>
              <option value="Clarification Requested">Clarification Requested</option>
            </select>
            <svg className="legal-filter-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN FORENSIC REPORTS TABLE (Inside Clearly Bordered Content Card)
          ======================================================== */}
      <div className="legal-content-card">
        <div className="legal-card-header-bar">
          <div className="legal-card-header-left">
            <span className="legal-card-accent-bar" />
            <h2 className="legal-card-title">Scientific Laboratory Reports Scrutiny</h2>
            <span className="legal-card-subtitle">Showing {filteredReports.length} forensic reports</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="legal-table-responsive">
          <table className="legal-table">
            <thead>
              <tr>
                <th>REPORT ID</th>
                <th>CASE ID</th>
                <th>REPORT TYPE & LAB</th>
                <th>SCIENTIFIC EXAMINER</th>
                <th>FORENSIC STATUS</th>
                <th>SUBMITTED DATE</th>
                <th>REVIEW STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No forensic reports matched your query.
                  </td>
                </tr>
              ) : (
                paginatedReports.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: '700', color: '#1E6DEB', fontFamily: 'monospace', fontSize: '13px' }}>
                        {item.id}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: '#0F172A', fontFamily: 'monospace', fontSize: '12.5px' }}>
                        {item.caseNo}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.reportType}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{item.lab}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', color: '#334155', fontWeight: '500' }}>{item.expertName}</div>
                    </td>
                    <td>
                      <span className="legal-badge verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {item.forensicStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {item.submittedDate}
                    </td>
                    <td>
                      <span className={`legal-badge ${item.reviewedStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.reviewedStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="legal-action-btn primary"
                        onClick={() => setSelectedReport(item)}
                      >
                        Legal Scrutiny
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
            Showing <strong>{filteredReports.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredReports.length)}</strong> of <strong>{filteredReports.length}</strong> reports
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
          5. FORENSIC REPORT SCRUTINY MODAL (Structured Sections)
          ======================================================== */}
      {selectedReport && (
        <div className="legal-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="legal-modal-dialog wide" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="legal-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="legal-card-accent-bar" style={{ height: '16px' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Forensic Science Report Review — {selectedReport.id}
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 11px' }}>
                  Case: {selectedReport.caseNo} • {selectedReport.reportType}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#64748B', cursor: 'pointer' }}>×</button>
            </div>

            {/* Modal Body */}
            <div className="legal-modal-body">
              
              {/* SECTION 1: Examining Laboratory Metadata */}
              <div className="legal-section-container">
                <div className="legal-section-header">
                  <span className="legal-section-header-title">
                    🔬 Examining Laboratory & Scientific Examiner
                  </span>
                  <span className={`legal-badge ${selectedReport.reviewedStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedReport.reviewedStatus}
                  </span>
                </div>
                <div className="legal-section-content">
                  <div className="legal-kv-grid three-cols">
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">EXAMINING LABORATORY</span>
                      <span className="legal-kv-value">{selectedReport.lab}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">SCIENTIFIC EXPERT</span>
                      <span className="legal-kv-value">{selectedReport.expertName}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">SUBMISSION DATE</span>
                      <span className="legal-kv-value">{selectedReport.submittedDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Findings & Judicial Admissibility */}
              <div className="legal-section-container" style={{ marginBottom: 0 }}>
                <div className="legal-section-header">
                  <span className="legal-section-header-title">
                    ⚖️ Expert Opinion & Section 45 IEA Admissibility
                  </span>
                  <span className="legal-section-header-sub">Indian Evidence Act Benchmark</span>
                </div>
                <div className="legal-section-content">
                  <p style={{ margin: 0, fontSize: '13px', color: '#0F172A', lineHeight: '1.6', padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontStyle: 'italic', marginBottom: '12px' }}>
                    "{selectedReport.conclusions}"
                  </p>

                  <div style={{ padding: '10px 14px', backgroundColor: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>✓</span>
                    <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#047857' }}>
                      {selectedReport.admissibilityScore}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="legal-modal-footer">
              <button className="legal-btn-secondary" onClick={() => setSelectedReport(null)}>Close</button>
              <button 
                className="legal-btn-danger"
                onClick={() => handleUpdateStatus(selectedReport.id, 'Clarification Requested')}
              >
                Request Clarification from Expert
              </button>
              <button 
                className="legal-btn-primary"
                onClick={() => handleUpdateStatus(selectedReport.id, 'Legal Clearance')}
              >
                Grant Legal Clearance
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
