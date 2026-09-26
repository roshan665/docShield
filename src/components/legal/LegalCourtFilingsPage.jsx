import React, { useState, useEffect, useMemo } from 'react';
import { legalCourtFilingsList } from '../../data/legalOfficerData';
import { CourtFilingDetailModal } from './LegalModals';

export default function LegalCourtFilingsPage({ filings: propFilings, isLoading = false, showToast }) {
  const [filings, setFilings] = useState(propFilings || legalCourtFilingsList);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courtFilter, setCourtFilter] = useState('ALL');
  const [selectedFiling, setSelectedFiling] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    if (propFilings && propFilings.length > 0) {
      setFilings(propFilings);
    }
  }, [propFilings]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: filings.length,
      ready: filings.filter(f => f.status === 'Ready to File').length,
      filed: filings.filter(f => f.status === 'Filed' || f.status === 'Listed').length,
      draft: filings.filter(f => f.status === 'Draft').length
    };
  }, [filings]);

  // Filtering
  const filteredFilings = useMemo(() => {
    return filings.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        item.id.toLowerCase().includes(q) ||
        item.caseNo.toLowerCase().includes(q) ||
        item.filingType.toLowerCase().includes(q) ||
        item.court.toLowerCase().includes(q) ||
        item.prosecutor.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesCourt = courtFilter === 'ALL' || item.court.includes(courtFilter);

      return matchesSearch && matchesStatus && matchesCourt;
    });
  }, [filings, searchQuery, statusFilter, courtFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredFilings.length / pageSize) || 1;
  const paginatedFilings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFilings.slice(start, start + pageSize);
  }, [filteredFilings, currentPage]);

  return (
    <div className="legal-page-container">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="legal-page-header">
        <div className="legal-header-left">
          <h1 className="legal-page-title">Court Filings & Judicial Submissions Management</h1>
          <p className="legal-page-subtitle">
            Manage e-filings before Sessions Courts, JMFCs, and Special NDPS/POCSO tribunals; monitor hearing dates and causelists.
          </p>
        </div>
        <div className="legal-header-actions">
          <button 
            className="legal-btn-secondary"
            onClick={() => showToast?.("Connecting to e-Courts National Judicial Data Grid (NJDG)...")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Sync NJDG Causelist
          </button>
        </div>
      </div>

      {/* ========================================================
          2. SUMMARY KPI CARDS (Structured Boundary Panels)
          ======================================================== */}
      <div className="legal-kpi-grid four-cols">
        <div 
          className={`legal-kpi-card ${statusFilter === 'ALL' ? 'active-tab' : ''}`}
          onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">TOTAL COURT FILINGS</span>
            <div className="legal-kpi-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="21" x2="21" y2="21"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <polyline points="5 6 12 3 19 6"/>
                <line x1="4" y1="10" x2="4" y2="21"/><line x1="20" y1="10" x2="20" y2="21"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.total}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">District & Sessions</span>
            <span className="legal-kpi-text">Submissions</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${statusFilter === 'Ready to File' ? 'active-tab' : ''}`}
          onClick={() => { setStatusFilter('Ready to File'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">READY FOR PRESENTATION</span>
            <div className="legal-kpi-icon-wrap green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.ready}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">Endorsed Dockets</span>
            <span className="legal-kpi-text">Ready for e-Filing</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${statusFilter === 'Filed' ? 'active-tab' : ''}`}
          onClick={() => { setStatusFilter('Filed'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">SUBMITTED & LISTED</span>
            <div className="legal-kpi-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.filed}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend blue">On Active Causelist</span>
            <span className="legal-kpi-text">Hearings pending</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${statusFilter === 'Draft' ? 'active-tab' : ''}`}
          onClick={() => { setStatusFilter('Draft'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">DRAFT PETITIONS</span>
            <div className="legal-kpi-icon-wrap amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.draft}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend amber">Drafting Rebuttal</span>
            <span className="legal-kpi-text">Bail & remand notes</span>
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
              placeholder="Search by Filing ID, Case ID, Filing Type, Court, or Counsel..." 
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
              <option value="ALL">All Filing Statuses</option>
              <option value="Ready to File">Ready to File</option>
              <option value="Filed">Filed</option>
              <option value="Listed">Listed</option>
              <option value="Draft">Draft</option>
            </select>
            <svg className="legal-filter-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>

          <div className="legal-filter-select-wrap">
            <select 
              className="legal-filter-select"
              value={courtFilter}
              onChange={e => { setCourtFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">All Court Benches</option>
              <option value="JMFC">JMFC Courts</option>
              <option value="Fast Track">Special Fast Track / POCSO</option>
              <option value="NDPS">Special NDPS Court</option>
              <option value="Chief Judicial">CJM Court</option>
            </select>
            <svg className="legal-filter-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN COURT FILINGS TABLE (Inside Clearly Bordered Card)
          ======================================================== */}
      <div className="legal-content-card">
        <div className="legal-card-header-bar">
          <div className="legal-card-header-left">
            <span className="legal-card-accent-bar" />
            <h2 className="legal-card-title">Judicial Submissions & Causelist Docket</h2>
            <span className="legal-card-subtitle">Showing {filteredFilings.length} court filings</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="legal-table-responsive">
          <table className="legal-table">
            <thead>
              <tr>
                <th>FILING ID</th>
                <th>CASE ID</th>
                <th>FILING TYPE</th>
                <th>JUDICIAL BENCH / COURT</th>
                <th>FILING STATUS</th>
                <th>SUBMISSION DATE</th>
                <th>NEXT HEARING / DATE</th>
                <th>PROSECUTOR</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFilings.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No court filings match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedFilings.map(item => (
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
                      <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.filingType}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Stage: {item.stage}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', color: '#1E293B', fontWeight: '500' }}>{item.court}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.bench}</div>
                    </td>
                    <td>
                      <span className={`legal-badge ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {item.submissionDate}
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#D97706' }}>
                        📅 {item.nextHearing}
                      </div>
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#334155' }}>
                      {item.prosecutor}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="legal-action-btn primary"
                        onClick={() => setSelectedFiling(item)}
                      >
                        Filing Details
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
            Showing <strong>{filteredFilings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredFilings.length)}</strong> of <strong>{filteredFilings.length}</strong> filings
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

      {/* Court Filing Detail Modal */}
      <CourtFilingDetailModal 
        filing={selectedFiling}
        isOpen={!!selectedFiling}
        onClose={() => setSelectedFiling(null)}
        showToast={showToast}
      />
    </div>
  );
}
