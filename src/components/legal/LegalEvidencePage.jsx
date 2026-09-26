import React, { useState, useMemo } from 'react';
import { legalEvidenceList, legalCustodyTimelineData } from '../../data/legalOfficerData';
import { CustodyTimelineModal } from './LegalModals';

export default function LegalEvidencePage({ showToast }) {
  const [evidenceList, setEvidenceList] = useState(legalEvidenceList);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [selectedCustody, setSelectedCustody] = useState(null);
  const [selectedEvidenceDetail, setSelectedEvidenceDetail] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter pipeline
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        item.id.toLowerCase().includes(q) ||
        item.caseNo.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.submittedBy.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q);

      const matchesType = typeFilter === 'ALL' || item.type.includes(typeFilter);
      const matchesReview = reviewFilter === 'ALL' || item.reviewStatus === reviewFilter;

      return matchesSearch && matchesType && matchesReview;
    });
  }, [evidenceList, searchQuery, typeFilter, reviewFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEvidence.length / pageSize) || 1;
  const paginatedEvidence = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvidence.slice(start, start + pageSize);
  }, [filteredEvidence, currentPage]);

  const handleOpenTimeline = (item) => {
    const record = legalCustodyTimelineData.find(c => c.evidenceId === item.id) || {
      evidenceId: item.id,
      caseNo: item.caseNo,
      item: item.description,
      currentCustodian: item.currentHolder,
      currentLocation: item.custodyStatus,
      custodyStatus: item.custodyStatus,
      lastTransfer: "20 Jan 2024",
      timeline: [
        { timestamp: "12 Jan 2024, 11:30 AM", from: "Crime Scene", to: item.submittedBy, action: "Seized under Panchnama", sealIntact: true },
        { timestamp: "12 Jan 2024, 02:00 PM", from: item.submittedBy, to: item.currentHolder, action: "Secured in Evidence Lock", sealIntact: true }
      ]
    };
    setSelectedCustody(record);
  };

  return (
    <div className="legal-page-container">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="legal-page-header">
        <div className="legal-header-left">
          <h1 className="legal-page-title">Physical & Digital Evidence Admissibility Review</h1>
          <p className="legal-page-subtitle">
            Verify recovery memos, custody seals, forensic lab dispatches, and court admissibility for physical exhibits.
          </p>
        </div>
        <div className="legal-header-actions">
          <button 
            className="legal-btn-secondary"
            onClick={() => showToast?.("Exporting Court Exhibit Schedule (Form 17)...")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export Exhibit Schedule
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
            <span className="legal-kpi-title">TOTAL EXHIBITS</span>
            <div className="legal-kpi-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{evidenceList.length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">Physical & Digital</span>
            <span className="legal-kpi-text">Under scrutiny</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${reviewFilter === 'Court Admissible' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('Court Admissible'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">COURT ADMISSIBLE</span>
            <div className="legal-kpi-icon-wrap green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{evidenceList.filter(e => e.reviewStatus === 'Court Admissible').length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">Evidence Certified</span>
            <span className="legal-kpi-text">Panch witness endorsed</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${reviewFilter === 'Chain Verified' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('Chain Verified'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">CHAIN AUDITED</span>
            <div className="legal-kpi-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{evidenceList.filter(e => e.reviewStatus === 'Chain Verified').length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">Transit Verified</span>
            <span className="legal-kpi-text">Road certs logged</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${reviewFilter === 'Query Raised' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('Query Raised'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">DEFECT / QUERY RAISED</span>
            <div className="legal-kpi-icon-wrap amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{evidenceList.filter(e => e.reviewStatus === 'Query Raised').length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend amber">Transit Note Clarification</span>
            <span className="legal-kpi-text">Awaiting IO memo</span>
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
              placeholder="Search by Evidence ID, Case ID, Description, or Seizing Officer..." 
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
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Evidence Categories</option>
              <option value="Physical">Physical (Weapons/Ballistics)</option>
              <option value="Biological">Biological (DNA/Fluids)</option>
              <option value="Digital">Digital (Storage/Devices)</option>
              <option value="Contraband">Contraband (NDPS)</option>
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
              <option value="ALL">All Legal Admissibility Stages</option>
              <option value="Court Admissible">Court Admissible</option>
              <option value="Chain Verified">Chain Verified</option>
              <option value="Query Raised">Query Raised</option>
            </select>
            <svg className="legal-filter-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN EVIDENCE TABLE (Inside Clearly Bordered Content Card)
          ======================================================== */}
      <div className="legal-content-card">
        <div className="legal-card-header-bar">
          <div className="legal-card-header-left">
            <span className="legal-card-accent-bar" />
            <h2 className="legal-card-title">Physical & Digital Exhibit Scrutiny Docket</h2>
            <span className="legal-card-subtitle">Showing {filteredEvidence.length} exhibits</span>
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
                <th>TYPE</th>
                <th>EXHIBIT DESCRIPTION</th>
                <th>SUBMITTED BY</th>
                <th>CURRENT CUSTODIAN & LOCATION</th>
                <th>VERIFICATION STATUS</th>
                <th>LEGAL STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvidence.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No evidence records match the search filter.
                  </td>
                </tr>
              ) : (
                paginatedEvidence.map(item => (
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
                      <span className="legal-badge" style={{ backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1' }}>
                        {item.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.description}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {item.admissibilityNotes.substring(0, 55)}...
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', color: '#334155', fontWeight: '500' }}>{item.submittedBy}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1E293B' }}>{item.currentHolder}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{item.custodyStatus}</div>
                    </td>
                    <td>
                      <span className="legal-badge verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {item.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`legal-badge ${item.reviewStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.reviewStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          className="legal-action-btn primary"
                          onClick={() => setSelectedEvidenceDetail(item)}
                        >
                          Scrutiny
                        </button>
                        <button 
                          className="legal-action-btn"
                          onClick={() => handleOpenTimeline(item)}
                        >
                          Custody Log
                        </button>
                      </div>
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
            Showing <strong>{filteredEvidence.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredEvidence.length)}</strong> of <strong>{filteredEvidence.length}</strong> exhibits
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
          5. EXHIBIT ADMISSIBILITY SCRUTINY MODAL (Structured Sections)
          ======================================================== */}
      {selectedEvidenceDetail && (
        <div className="legal-modal-overlay" onClick={() => setSelectedEvidenceDetail(null)}>
          <div className="legal-modal-dialog" onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="legal-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="legal-card-accent-bar" style={{ height: '16px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    Exhibit Legal Scrutiny — {selectedEvidenceDetail.id}
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 11px' }}>
                  Case: {selectedEvidenceDetail.caseNo} • {selectedEvidenceDetail.type}
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedEvidenceDetail(null)} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#64748B', cursor: 'pointer' }}>×</button>
            </div>

            {/* Modal Body */}
            <div className="legal-modal-body">
              
              {/* SECTION 1: Exhibit Identity & Seizure */}
              <div className="legal-section-container">
                <div className="legal-section-header">
                  <span className="legal-section-header-title">
                    📦 Exhibit Identification & Seizure Details
                  </span>
                  <span className={`legal-badge ${selectedEvidenceDetail.reviewStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedEvidenceDetail.reviewStatus}
                  </span>
                </div>
                <div className="legal-section-content">
                  <div className="legal-kv-grid">
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">DESCRIPTION</span>
                      <span className="legal-kv-value">{selectedEvidenceDetail.description}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">EXHIBIT CATEGORY</span>
                      <span className="legal-kv-value">{selectedEvidenceDetail.type}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">SUBMITTING OFFICER</span>
                      <span className="legal-kv-value">{selectedEvidenceDetail.submittedBy}</span>
                    </div>
                    <div className="legal-kv-item">
                      <span className="legal-kv-label">MALKHANA LOCATION</span>
                      <span className="legal-kv-value">{selectedEvidenceDetail.currentHolder}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Admissibility Analysis */}
              <div className="legal-section-container" style={{ marginBottom: 0 }}>
                <div className="legal-section-header">
                  <span className="legal-section-header-title">
                    ⚖️ Court Admissibility & Witness Panchnama
                  </span>
                  <span className="legal-section-header-sub">Indian Evidence Act Analysis</span>
                </div>
                <div className="legal-section-content">
                  <p style={{ margin: 0, fontSize: '13px', color: '#1E40AF', lineHeight: '1.5', padding: '12px 14px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                    {selectedEvidenceDetail.admissibilityNotes}
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="legal-modal-footer">
              <button className="legal-btn-secondary" onClick={() => setSelectedEvidenceDetail(null)}>Close</button>
              <button 
                className="legal-btn-primary"
                onClick={() => {
                  setEvidenceList(prev => prev.map(e => e.id === selectedEvidenceDetail.id ? { ...e, reviewStatus: 'Court Admissible' } : e));
                  showToast?.(`Exhibit ${selectedEvidenceDetail.id} certified as Court Admissible.`);
                  setSelectedEvidenceDetail(null);
                }}
              >
                Certify Admissibility
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custody Timeline Modal */}
      <CustodyTimelineModal 
        custodyRecord={selectedCustody}
        isOpen={!!selectedCustody}
        onClose={() => setSelectedCustody(null)}
      />
    </div>
  );
}
