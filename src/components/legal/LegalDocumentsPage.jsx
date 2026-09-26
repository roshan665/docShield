import React, { useState, useEffect, useMemo } from 'react';
import { legalDocumentsList } from '../../data/legalOfficerData';
import { DocumentReviewModal } from './LegalModals';
import * as documentsService from '../../services/documentsService';

export default function LegalDocumentsPage({ documents: propDocs, showToast }) {
  const [documents, setDocuments] = useState(propDocs || legalDocumentsList);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    if (propDocs && propDocs.length > 0) {
      setDocuments(propDocs);
    }
  }, [propDocs]);

  // Filter pipeline
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.caseNo.toLowerCase().includes(q) ||
        doc.type.toLowerCase().includes(q) ||
        doc.uploadedBy.toLowerCase().includes(q);

      const matchesType = typeFilter === 'ALL' || doc.type === typeFilter;
      const matchesReview = reviewFilter === 'ALL' || doc.legalReviewStatus === reviewFilter;

      return matchesSearch && matchesType && matchesReview;
    });
  }, [documents, searchQuery, typeFilter, reviewFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredDocs.length / pageSize) || 1;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocs.slice(start, start + pageSize);
  }, [filteredDocs, currentPage]);

  const handleUpdateStatus = async (docId, newStatus) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, legalReviewStatus: newStatus } : d));
    try {
      await documentsService.updateDocumentReviewStatus(docId, newStatus);
    } catch (err) {
      console.warn('Persist document review status error:', err.message);
    }
  };

  return (
    <div className="legal-page-container">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="legal-page-header">
        <div className="legal-header-left">
          <h1 className="legal-page-title">Evidence & Investigation Documents Review</h1>
          <p className="legal-page-subtitle">
            Verify statutory evidentiary requirements, Section 65B certificates, panchnamas, and forensic filings before judicial submission.
          </p>
        </div>
        <div className="legal-header-actions">
          <button 
            className="legal-btn-secondary"
            onClick={() => showToast?.("Running SHA-256 integrity re-verification on all attached dockets...")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Verify Integrity Hashes
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
            <span className="legal-kpi-title">TOTAL FILED DOCUMENTS</span>
            <div className="legal-kpi-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{documents.length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">100% SHA-256</span>
            <span className="legal-kpi-text">Tamper-evident logs</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${reviewFilter === 'Admissible' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('Admissible'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">COURT ADMISSIBLE</span>
            <div className="legal-kpi-icon-wrap green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{documents.filter(d => d.legalReviewStatus === 'Admissible').length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">Ready for Trial</span>
            <span className="legal-kpi-text">Sec 65B certified</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${reviewFilter === 'Under Scrutiny' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('Under Scrutiny'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">UNDER SCRUTINY</span>
            <div className="legal-kpi-icon-wrap amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{documents.filter(d => d.legalReviewStatus === 'Under Scrutiny').length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend amber">Vetting in Progress</span>
            <span className="legal-kpi-text">Medical & Panchnamas</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${reviewFilter === 'Defect Noted' ? 'active-tab' : ''}`}
          onClick={() => { setReviewFilter('Defect Noted'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">DEFECTS / QUERIES</span>
            <div className="legal-kpi-icon-wrap red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{documents.filter(d => d.legalReviewStatus === 'Defect Noted').length}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend red">Notice to IO</span>
            <span className="legal-kpi-text">Procedural defects</span>
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
              placeholder="Search by Document Name, Case ID, Type, or Uploading Officer..." 
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
              <option value="ALL">All Document Types</option>
              <option value="FIR">FIR</option>
              <option value="Medical">Medical / MLC</option>
              <option value="65B Certificate">65B Certificate</option>
              <option value="Panchnama">Spot Panchnama</option>
              <option value="Seizure Memo">Seizure Memo</option>
              <option value="Forensic">Forensic Report</option>
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
              <option value="ALL">All Review Statuses</option>
              <option value="Admissible">Admissible</option>
              <option value="Under Scrutiny">Under Scrutiny</option>
              <option value="Defect Noted">Defect Noted</option>
            </select>
            <svg className="legal-filter-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN DOCUMENTS TABLE (Inside Clearly Bordered Card)
          ======================================================== */}
      <div className="legal-content-card">
        <div className="legal-card-header-bar">
          <div className="legal-card-header-left">
            <span className="legal-card-accent-bar" />
            <h2 className="legal-card-title">Evidentiary Document Verification Register</h2>
            <span className="legal-card-subtitle">Showing {filteredDocs.length} documents</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="legal-table-responsive">
          <table className="legal-table">
            <thead>
              <tr>
                <th>DOCUMENT NAME & HASH</th>
                <th>DOCUMENT TYPE</th>
                <th>CASE ID</th>
                <th>UPLOADED BY</th>
                <th>INTEGRITY STATUS</th>
                <th>LEGAL REVIEW</th>
                <th>LAST UPDATED</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDocs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No evidentiary documents match the search criteria.
                  </td>
                </tr>
              ) : (
                paginatedDocs.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📄</span>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>
                        SHA: {item.hash}
                      </div>
                    </td>
                    <td>
                      <span className="legal-badge" style={{ backgroundColor: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1' }}>
                        {item.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#1E6DEB', fontFamily: 'monospace', fontSize: '13px' }}>
                        {item.caseNo}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', color: '#334155', fontWeight: '500' }}>{item.uploadedBy}</div>
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
                      <span className={`legal-badge ${item.legalReviewStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.legalReviewStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {item.updatedDate}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="legal-action-btn primary"
                        onClick={() => setSelectedDoc(item)}
                      >
                        Legal Review
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
            Showing <strong>{filteredDocs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredDocs.length)}</strong> of <strong>{filteredDocs.length}</strong> items
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

      {/* Review Modal */}
      <DocumentReviewModal 
        document={selectedDoc}
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onUpdateStatus={handleUpdateStatus}
        showToast={showToast}
      />
    </div>
  );
}
