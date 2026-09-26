import React, { useState, useEffect, useMemo } from 'react';
import { legalChargeSheetsList } from '../../data/legalOfficerData';
import { ChargeSheetReviewModal } from './LegalModals';
import * as chargeSheetsService from '../../services/chargeSheetsService';

export default function LegalChargeSheetsPage({ chargeSheets: propCS, isLoading = false, showToast }) {
  const [chargeSheets, setChargeSheets] = useState(propCS || legalChargeSheetsList);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [selectedChargeSheet, setSelectedChargeSheet] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    if (propCS && propCS.length > 0) {
      setChargeSheets(propCS);
    }
  }, [propCS]);

  // Counts for summary cards
  const counts = useMemo(() => {
    return {
      total: chargeSheets.length,
      underReview: chargeSheets.filter(c => c.chargeSheetStatus === 'Under Review').length,
      draft: chargeSheets.filter(c => c.chargeSheetStatus === 'Draft').length,
      finalized: chargeSheets.filter(c => c.chargeSheetStatus === 'Finalized' || c.chargeSheetStatus === 'Accepted').length,
      returned: chargeSheets.filter(c => c.chargeSheetStatus === 'Returned').length
    };
  }, [chargeSheets]);

  // Filtering
  const filteredSheets = useMemo(() => {
    return chargeSheets.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        item.id.toLowerCase().includes(q) ||
        item.caseNo.toLowerCase().includes(q) ||
        item.caseTitle.toLowerCase().includes(q) ||
        item.preparedBy.toLowerCase().includes(q) ||
        item.station.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || item.chargeSheetStatus === statusFilter;
      const matchesReview = reviewFilter === 'ALL' || item.legalReviewStatus === reviewFilter;

      return matchesSearch && matchesStatus && matchesReview;
    });
  }, [chargeSheets, searchQuery, statusFilter, reviewFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredSheets.length / pageSize) || 1;
  const paginatedSheets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSheets.slice(start, start + pageSize);
  }, [filteredSheets, currentPage]);

  const handleChargeSheetAction = async (id, actionType, notes) => {
    setChargeSheets(prev => prev.map(cs => {
      if (cs.id === id) {
        if (actionType === 'Approved') {
          return {
            ...cs,
            chargeSheetStatus: 'Finalized',
            legalReviewStatus: 'Approved & Signed',
            legalReviewNotes: notes || cs.legalReviewNotes
          };
        } else if (actionType === 'Returned') {
          return {
            ...cs,
            chargeSheetStatus: 'Returned',
            legalReviewStatus: 'Observations Sent to IO',
            legalReviewNotes: notes ? `Observations: ${notes}` : cs.legalReviewNotes
          };
        }
      }
      return cs;
    }));

    try {
      const targetStatus = actionType === 'Approved' ? 'Accepted' : 'Returned';
      await chargeSheetsService.updateChargeSheetStatus(id, targetStatus, notes);
    } catch (err) {
      console.warn('Persist charge sheet review error:', err.message);
    }
  };

  return (
    <div className="legal-page-container">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="legal-page-header">
        <div className="legal-header-left">
          <h1 className="legal-page-title">Police Charge Sheets (Final Reports U/S 173 CrPC)</h1>
          <p className="legal-page-subtitle">
            Statutory prosecution scrutiny of Final Forms, accused custody status, penal charge sections, and witness schedules before judicial cognizance.
          </p>
        </div>
        <div className="legal-header-actions">
          <button 
            className="legal-btn-secondary"
            onClick={() => showToast?.("Generating Statutory 60/90 Days CrPC Compliance Audit...")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Statutory 60/90 Day Audits
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
            <span className="legal-kpi-title">TOTAL CHARGE SHEETS</span>
            <div className="legal-kpi-icon-wrap blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.total}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">CrPC 173(2)</span>
            <span className="legal-kpi-text">In prosecution system</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${statusFilter === 'Under Review' ? 'active-tab' : ''}`}
          onClick={() => { setStatusFilter('Under Review'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">SCRUTINY IN PROGRESS</span>
            <div className="legal-kpi-icon-wrap amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.underReview}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend amber">Active Scrutiny</span>
            <span className="legal-kpi-text">Prosecutor vetting</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${statusFilter === 'Finalized' ? 'active-tab' : ''}`}
          onClick={() => { setStatusFilter('Finalized'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">FINALIZED & APPROVED</span>
            <div className="legal-kpi-icon-wrap green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.finalized}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend green">Signed & Sealed</span>
            <span className="legal-kpi-text">Ready for JMFC</span>
          </div>
        </div>

        <div 
          className={`legal-kpi-card ${statusFilter === 'Returned' ? 'active-tab' : ''}`}
          onClick={() => { setStatusFilter('Returned'); setCurrentPage(1); }}
        >
          <div className="legal-kpi-top">
            <span className="legal-kpi-title">RETURNED TO IO</span>
            <div className="legal-kpi-icon-wrap red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
          </div>
          <div className="legal-kpi-value">{counts.returned}</div>
          <div className="legal-kpi-footer">
            <span className="legal-kpi-trend red">Notice Issued</span>
            <span className="legal-kpi-text">Defects to rectify</span>
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
              placeholder="Search by Sheet ID, Case ID, Offense Title, or Investigating Officer..." 
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
              <option value="ALL">All Sheet Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Finalized">Finalized</option>
              <option value="Returned">Returned</option>
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
              <option value="Scrutiny in Progress">Scrutiny in Progress</option>
              <option value="Approved & Signed">Approved & Signed</option>
              <option value="Observations Sent to IO">Observations Sent to IO</option>
              <option value="Under Legal Scrutiny">Under Legal Scrutiny</option>
            </select>
            <svg className="legal-filter-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN CHARGE SHEETS TABLE (Inside Clearly Bordered Card)
          ======================================================== */}
      <div className="legal-content-card">
        <div className="legal-card-header-bar">
          <div className="legal-card-header-left">
            <span className="legal-card-accent-bar" />
            <h2 className="legal-card-title">Police Final Reports Register U/S 173 CrPC</h2>
            <span className="legal-card-subtitle">Showing {filteredSheets.length} charge sheets</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="legal-table-responsive">
          <table className="legal-table">
            <thead>
              <tr>
                <th>CHARGE SHEET ID</th>
                <th>CASE ID</th>
                <th>CASE TITLE</th>
                <th>PREPARED BY & STATION</th>
                <th>STATUTORY DEADLINE</th>
                <th>SHEET STATUS</th>
                <th>LEGAL REVIEW STATUS</th>
                <th>LAST UPDATED</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSheets.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No charge sheets found for the specified filter.
                  </td>
                </tr>
              ) : (
                paginatedSheets.map(item => (
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
                      <div style={{ fontWeight: '600', color: '#0F172A', fontSize: '13px' }}>{item.caseTitle}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                        {item.sectionsApplicable.join(', ')}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', color: '#334155', fontWeight: '500' }}>{item.preparedBy}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.station}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>
                        {item.statutoryDeadline}
                      </span>
                    </td>
                    <td>
                      <span className={`legal-badge ${item.chargeSheetStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.chargeSheetStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`legal-badge ${item.legalReviewStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.legalReviewStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748B' }}>
                      {item.lastUpdated}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="legal-action-btn primary"
                        onClick={() => setSelectedChargeSheet(item)}
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
            Showing <strong>{filteredSheets.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredSheets.length)}</strong> of <strong>{filteredSheets.length}</strong> charge sheets
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
          5. CHARGE SHEET IN-DEPTH REVIEW MODAL
          Contains 8 clearly separated section containers
          ======================================================== */}
      <ChargeSheetReviewModal 
        chargeSheet={selectedChargeSheet}
        isOpen={!!selectedChargeSheet}
        onClose={() => setSelectedChargeSheet(null)}
        onAction={handleChargeSheetAction}
        showToast={showToast}
      />
    </div>
  );
}
