import React, { useState, useMemo } from 'react';
import { legalCasesList } from '../../data/legalOfficerData';

export default function LegalCasesPage({ showToast }) {
  const [cases, setCases] = useState(legalCasesList);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Status counts
  const counts = useMemo(() => {
    return {
      all: cases.length,
      pending: cases.filter(c => c.legalReviewStatus === 'Scrutiny Pending').length,
      approved: cases.filter(c => c.legalReviewStatus === 'Approved' || c.legalReviewStatus === 'Finalized').length,
      query: cases.filter(c => c.legalReviewStatus === 'Clarification Needed' || c.legalReviewStatus === 'Re-investigation Needed').length
    };
  }, [cases]);

  // Filtering
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.io.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q);
      
      const matchesStatus = statusFilter === 'ALL' || c.caseStatus === statusFilter;
      const matchesReview = reviewFilter === 'ALL' || c.legalReviewStatus === reviewFilter;

      return matchesSearch && matchesStatus && matchesReview;
    });
  }, [cases, searchQuery, statusFilter, reviewFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCases.slice(start, start + pageSize);
  }, [filteredCases, currentPage]);

  const handleUpdateReviewStatus = (caseId, newStatus) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, legalReviewStatus: newStatus } : c));
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase(prev => ({ ...prev, legalReviewStatus: newStatus }));
    }
    showToast?.(`Case ${caseId} review status updated to "${newStatus}".`);
  };

  return (
    <div className="legal-page-container">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="legal-page-header">
        <div className="legal-header-left">
          <h1 className="legal-page-title">Assigned Cases for Legal Scrutiny</h1>
          <p className="legal-page-subtitle">
            Review criminal cases, inspect charge sheet readiness, and ensure statutory compliance for court submission.
          </p>
        </div>
        <div className="legal-header-actions">
          <button 
            className="legal-btn-secondary"
            onClick={() => showToast?.("Exporting Prosecution Scrutiny Register (PDF)...")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export Register
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
            <span className="legal-kpi-title">TOTAL ASSIGNED CASES</span>
            <div className="legal-kpi-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.all}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">Prosecution Docket</span>
            <span className="legal-kpi-text">In District jurisdiction</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${reviewFilter === 'Scrutiny Pending' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('Scrutiny Pending'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">SCRUTINY PENDING</span>
            <div className="legal-kpi-icon-wrap amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.pending}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend amber">Urgent Action</span>
            <span className="legal-kpi-text">Awaiting scrutiny</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${reviewFilter === 'Approved' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('Approved'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">APPROVED FOR FILING</span>
            <div className="legal-kpi-icon-wrap green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.approved}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">Ready for Court</span>
            <span className="legal-kpi-text">Legally vetted</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${reviewFilter === 'Clarification Needed' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('Clarification Needed'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">QUERIES RAISED TO IO</span>
            <div className="legal-kpi-icon-wrap red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.query}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend red">Returned Notice</span>
            <span className="legal-kpi-text">Observations sent</span>
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
              placeholder="Search by Case ID, Accused name, IPC section, or Investigating Officer..." 
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
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Case Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Closed">Closed</option>
            </select>
            <svg className="legal-filter-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>

          <div className="legal-filter-select-wrap">
            <select 
              className="legal-filter-select"
              value={reviewFilter}
              onChange={e => { setReviewFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Legal Scrutiny Stages</option>
              <option value="Scrutiny Pending">Scrutiny Pending</option>
              <option value="Clarification Needed">Clarification Needed</option>
              <option value="Approved">Approved</option>
              <option value="Finalized">Finalized</option>
              <option value="Re-investigation Needed">Re-investigation Needed</option>
            </select>
            <svg className="legal-filter-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN CASES TABLE (Inside Clearly Bordered Content Card)
          ======================================================== */}
      <div className="legal-content-card">
        <div className="legal-card-header-bar">
          <div className="legal-card-header-left">
            <span className="legal-card-accent-bar" />
            <h2 className="legal-card-title">Assigned Prosecution Case Docket</h2>
            <span className="legal-card-subtitle">Showing {filteredCases.length} filtered cases</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="legal-table-responsive">
          <table className="legal-table">
            <thead>
              <tr>
                <th>CASE ID</th>
                <th>CASE TITLE & SECTION</th>
                <th>INVESTIGATING INSPECTOR</th>
                <th>CASE STATUS</th>
                <th>LEGAL REVIEW STATUS</th>
                <th>COURT & NEXT DATE</th>
                <th>LAST UPDATED</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No cases match the selected legal review filters.
                  </td>
                </tr>
              ) : (
                paginatedCases.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: '700', color: '#1E6DEB', fontFamily: 'monospace', fontSize: '13px' }}>
                        {item.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.title}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{item.section}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: '#334155', fontSize: '13px' }}>{item.io}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.station}</div>
                    </td>
                    <td>
                      <span className={`legal-badge ${item.caseStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.caseStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`legal-badge ${item.legalReviewStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.legalReviewStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', fontWeight: '500', color: '#1E293B' }}>{item.court}</div>
                      <div style={{ fontSize: '11.5px', color: '#D97706', fontWeight: '600', marginTop: '2px' }}>
                        📅 {item.nextCourtDate}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {item.lastUpdated}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="legal-action-btn primary"
                        onClick={() => setSelectedCase(item)}
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
            Showing <strong>{filteredCases.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredCases.length)}</strong> of <strong>{filteredCases.length}</strong> assigned cases
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
          5. CASE LEGAL SCRUTINY MODAL (Organized into Clear Sections)
          ======================================================== */}
      {selectedCase && (
        <div className="legal-modal-overlay" onClick={() => setSelectedCase(null)}>
          <div className="legal-modal-dialog wide" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="legal-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="legal-card-accent-bar" style={{ height: '16px' }} />
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Legal Scrutiny & Case Docket — {selectedCase.id}
                  </h3>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0 11px' }}>
                  {selectedCase.title} • Trial Forum: {selectedCase.court}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedCase(null)} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#64748B', cursor: 'pointer' }}>×</button>
            </div>

            {/* Modal Body */}
            <div className="legal-modal-body">
              
              {/* SECTION 1: Case Identification & Forum */}
              <div className="legal-section-container">
                <div className="legal-section-header">
                  <span className="legal-section-header-title">
                    🏛️ Case Identification & Jurisdiction
                  </span>
                  <span className={`legal-badge ${selectedCase.caseStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedCase.caseStatus}
                  </span>
                </div>
                <div className="legal-section-content">
                  <div className="legal-kv-grid four-cols">
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">CASE ID</span>
                      <span className="legal-kv-value" style={{ color: '#1E6DEB', fontFamily: 'monospace' }}>{selectedCase.id}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">SECTIONS CHARGED</span>
                      <span className="legal-kv-value">{selectedCase.section}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">INVESTIGATING OFFICER</span>
                      <span className="legal-kv-value">{selectedCase.io}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">NEXT TRIAL DATE</span>
                      <span className="legal-kv-value" style={{ color: '#D97706' }}>📅 {selectedCase.nextCourtDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Accused & Complainant Profiles */}
              <div className="legal-section-container">
                <div className="legal-section-header">
                  <span className="legal-section-header-title">
                    👤 Accused & Complainant Parties
                  </span>
                  <span className="legal-section-header-sub">Parties to the Criminal Trial</span>
                </div>
                <div className="legal-section-content">
                  <div className="legal-kv-grid">
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">ACCUSED IN CUSTODY / ON BAIL</span>
                      <span className="legal-kv-value">{selectedCase.accused}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">COMPLAINANT / INFORMANT</span>
                      <span className="legal-kv-value">{selectedCase.complainant}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Investigation Synopsis & Evidence */}
              <div className="legal-section-container">
                <div className="legal-section-header">
                  <span className="legal-section-header-title">
                    🔍 Investigation Synopsis & Evidentiary Holdings
                  </span>
                  <span className="legal-section-header-sub">Police Case Diary Summary</span>
                </div>
                <div className="legal-section-content">
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.6', backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    {selectedCase.summary}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '12px' }}>
                    <div style={{ padding: '10px 14px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '12.5px', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📄</span>
                      <span>Attached Dockets: <strong>{selectedCase.documentsCount} documents (SHA-256 Intact)</strong></span>
                    </div>
                    <div style={{ padding: '10px 14px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', fontSize: '12.5px', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📦</span>
                      <span>Seized Exhibits: <strong>{selectedCase.evidenceItems} items (Chain Verified)</strong></span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="legal-modal-footer">
              <button className="legal-btn-secondary" onClick={() => setSelectedCase(null)}>Close</button>
              <button 
                className="legal-btn-danger"
                onClick={() => {
                  handleUpdateReviewStatus(selectedCase.id, 'Clarification Needed');
                  setSelectedCase(null);
                }}
              >
                Return with Queries to IO
              </button>
              <button 
                className="legal-btn-primary"
                onClick={() => {
                  handleUpdateReviewStatus(selectedCase.id, 'Approved');
                  setSelectedCase(null);
                }}
              >
                Endorse & Approve for Court
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
