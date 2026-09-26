import React, { useState, useEffect, useMemo } from 'react';
import { forensicEvidenceData } from '../../data/forensicOfficerData';
import { EvidenceDetailModal } from './ForensicModals';

export default function ForensicEvidencePage({ evidence: propEvidence, showToast }) {
  const [evidenceList, setEvidenceList] = useState(propEvidence || forensicEvidenceData);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (propEvidence && propEvidence.length > 0) {
      setEvidenceList(propEvidence);
    }
  }, [propEvidence]);

  // Calculate summary metrics
  const totalEvidence = evidenceList.length;
  const pendingExam = evidenceList.filter(e => e.examinationStatus === 'Pending Examination').length;
  const underExam = evidenceList.filter(e => e.examinationStatus === 'Under Examination').length;
  const verifiedCount = evidenceList.filter(e => e.verificationStatus === 'Verified').length;
  const exceptionsCount = evidenceList.filter(e => e.verificationStatus === 'Exception').length;

  const filteredEvidence = useMemo(() => {
    return evidenceList.filter(item => {
      const matchSearch = searchQuery === '' ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.collectedBy.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchType = typeFilter === 'All' || item.evidenceType.toLowerCase().includes(typeFilter.toLowerCase());
      const matchStatus = statusFilter === 'All' || 
        item.examinationStatus === statusFilter || 
        item.verificationStatus === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [searchQuery, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredEvidence.length / pageSize) || 1;
  const paginatedEvidence = filteredEvidence.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="forensic-page-container">
      
      {/* 1. Page Header */}
      <div className="forensic-page-header">
        <div className="forensic-header-left">
          <h1 className="forensic-page-title">Evidence Examination & Forensic Analysis Desk</h1>
          <p className="forensic-page-subtitle">
            Primary scientific workbench: physical exhibit inspection, microscopic comparison, chemical extraction, and digital bit-stream imaging
          </p>
        </div>
        <div className="forensic-header-actions">
          <button 
            className="forensic-btn forensic-btn-outline"
            onClick={() => showToast?.("Running batch SHA-256 seal verification on all exhibits...")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Batch Hash Audit</span>
          </button>
          <button 
            className="forensic-btn forensic-btn-primary"
            onClick={() => showToast?.("Lab intake register opened. Ready to scan exhibit barcode.")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Intake New Exhibit</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Summary Cards */}
      <div className="forensic-summary-grid">
        {/* Total Evidence */}
        <div 
          className={`forensic-summary-card ${statusFilter === 'All' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('All');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Total Evidence</span>
            <div className="forensic-kpi-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{totalEvidence}</div>
          <div className="forensic-kpi-subtext">All logged exhibits in lab</div>
        </div>

        {/* Pending Examination */}
        <div 
          className={`forensic-summary-card ${statusFilter === 'Pending Examination' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('Pending Examination');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Pending Examination</span>
            <div className="forensic-kpi-icon-wrap amber">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{pendingExam}</div>
          <div className="forensic-kpi-subtext">Queued on lab workbenches</div>
        </div>

        {/* Under Examination */}
        <div 
          className={`forensic-summary-card ${statusFilter === 'Under Examination' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('Under Examination');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Under Examination</span>
            <div className="forensic-kpi-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{underExam}</div>
          <div className="forensic-kpi-subtext">Active scientific tests in lab</div>
        </div>

        {/* Verified */}
        <div 
          className={`forensic-summary-card ${statusFilter === 'Verified' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('Verified');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Verified</span>
            <div className="forensic-kpi-icon-wrap green">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{verifiedCount}</div>
          <div className="forensic-kpi-subtext">Intact seal & SHA-256 match</div>
        </div>

        {/* Exceptions */}
        <div 
          className={`forensic-summary-card ${statusFilter === 'Exception' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('Exception');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Exceptions</span>
            <div className="forensic-kpi-icon-wrap red">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{exceptionsCount}</div>
          <div className="forensic-kpi-subtext" style={{ color: '#DC2626' }}>Requires discrepancy audit</div>
        </div>
      </div>

      {/* 3. Filter Toolbar */}
      <div className="forensic-toolbar-container">
        <div className="forensic-toolbar-left">
          <div className="forensic-search-input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              className="forensic-search-input" 
              placeholder="Search Evidence ID, Case, Officer, Description, or Seal..." 
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="forensic-toolbar-filters">
          <select 
            className="forensic-select"
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Evidence Disciplines</option>
            <option value="Ballistics">Ballistics & Toolmarks</option>
            <option value="Digital">Digital Storage & Cyber</option>
            <option value="Narcotics">Narcotics & Toxicology</option>
            <option value="Chemical">Chemical Residue / Arson</option>
            <option value="Biological">Biological & DNA</option>
            <option value="Documents">Questioned Documents</option>
          </select>

          <select 
            className="forensic-select"
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Examination Statuses</option>
            <option value="Pending Examination">Pending Examination</option>
            <option value="Under Examination">Under Examination</option>
            <option value="Verified">Verified</option>
            <option value="Completed">Completed</option>
            <option value="Exception">Exception</option>
          </select>
        </div>
      </div>

      {/* 4. Primary Evidence Table */}
      <div className="forensic-table-container">
        <div className="forensic-card-header-bar">
          <div className="forensic-card-header-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <span>Evidence Inventory & Laboratory Examination Registry ({filteredEvidence.length})</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Section 45 IEA / Bharatiya Sakshya Adhiniyam Lab Registry
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="forensic-table">
            <thead>
              <tr>
                <th>Evidence ID</th>
                <th>Case ID</th>
                <th>Evidence Type</th>
                <th>Description</th>
                <th>Collected By</th>
                <th>Current Custodian</th>
                <th>Verification</th>
                <th>Examination Status</th>
                <th>Last Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvidence.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No evidence records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedEvidence.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span className="forensic-id-badge">{item.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#0F172A', fontSize: '12.5px' }}>{item.caseId}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: '#1E293B', fontSize: '12.5px' }}>{item.evidenceType}</span>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <span style={{ fontSize: '12.5px', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: '#334155' }}>{item.collectedBy}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#0F172A', fontWeight: '500' }}>{item.currentCustodian}</span>
                    </td>
                    <td>
                      <span className={`forensic-status-badge ${item.verificationStatus === 'Verified' ? 'verified' : item.verificationStatus === 'Exception' ? 'exception' : 'pending'}`}>
                        {item.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`forensic-status-badge ${item.examinationStatus === 'Completed' || item.examinationStatus === 'Verified' ? 'verified' : item.examinationStatus === 'Under Examination' ? 'under-exam' : 'pending'}`}>
                        {item.examinationStatus}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>{item.lastUpdated}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="forensic-btn forensic-btn-primary forensic-btn-sm"
                        onClick={() => setSelectedEvidence(item)}
                      >
                        Examine & Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="forensic-pagination-bar">
          <div>
            Showing {filteredEvidence.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredEvidence.length)} of {filteredEvidence.length} entries
          </div>
          <div className="forensic-pagination-actions">
            <button 
              className="forensic-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button 
                key={p} 
                className={`forensic-page-btn ${currentPage === p ? 'active' : ''}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button 
              className="forensic-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Deep Evidence Review Modal (10 Sections) */}
      {selectedEvidence && (
        <EvidenceDetailModal 
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
          showToast={showToast}
        />
      )}

    </div>
  );
}
