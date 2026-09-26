import React, { useState, useMemo } from 'react';
import { forensicCasesList } from '../../data/forensicOfficerData';
import { ForensicCaseModal } from './ForensicModals';

export default function ForensicCasesPage({ showToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [caseStatusFilter, setCaseStatusFilter] = useState('All');
  const [forensicStatusFilter, setForensicStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredCases = useMemo(() => {
    return forensicCasesList.filter(item => {
      const matchSearch = searchQuery === '' ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.inspector.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCaseStatus = caseStatusFilter === 'All' || item.caseStatus === caseStatusFilter;
      const matchForensicStatus = forensicStatusFilter === 'All' || item.forensicStatus.includes(forensicStatusFilter);

      return matchSearch && matchCaseStatus && matchForensicStatus;
    });
  }, [searchQuery, caseStatusFilter, forensicStatusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredCases.length / pageSize) || 1;
  const paginatedCases = filteredCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="forensic-page-container">
      
      {/* 1. Page Header */}
      <div className="forensic-page-header">
        <div className="forensic-header-left">
          <h1 className="forensic-page-title">Forensic Case Registry</h1>
          <p className="forensic-page-subtitle">
            Cases with active laboratory exhibits forwarded for expert examination & scientific reporting
          </p>
        </div>
        <div className="forensic-header-actions">
          <div className="forensic-header-badge">
            <span>Total Active References: {forensicCasesList.length}</span>
          </div>
          <button 
            className="forensic-btn forensic-btn-outline"
            onClick={() => showToast?.("Exporting RFSL Case Roster as CSV...")}
          >
            Export Case Roster
          </button>
        </div>
      </div>

      {/* 2. Clearly Bounded Filter Toolbar */}
      <div className="forensic-toolbar-container">
        <div className="forensic-toolbar-left">
          <div className="forensic-search-input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              className="forensic-search-input" 
              placeholder="Search by Case ID, title, or Investigating Officer..." 
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
            value={caseStatusFilter}
            onChange={e => {
              setCaseStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Case Statuses</option>
            <option value="Investigation Active">Investigation Active</option>
            <option value="Evidence Processing">Evidence Processing</option>
            <option value="Lab Examination">Lab Examination</option>
            <option value="Report Ready">Report Ready</option>
          </select>

          <select 
            className="forensic-select" 
            value={forensicStatusFilter}
            onChange={e => {
              setForensicStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Forensic Statuses</option>
            <option value="Ballistics">Ballistics Analysis</option>
            <option value="Digital">Digital Forensics</option>
            <option value="Chemical">Chemical Assay</option>
            <option value="DNA">DNA STR Profiling</option>
            <option value="Document">Questioned Documents</option>
          </select>

          <select 
            className="forensic-select"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          >
            <option value="All">All Dates</option>
            <option value="Today">Updated Today</option>
            <option value="Week">This Week</option>
          </select>
        </div>
      </div>

      {/* 3. Forensic Cases Table Container with Header Bar */}
      <div className="forensic-table-container">
        <div className="forensic-card-header-bar">
          <div className="forensic-card-header-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span>Assigned Forensic Case Dossiers ({filteredCases.length})</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            RFSL Master Case Roster • Bhopal Division
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="forensic-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Case Title</th>
                <th>Investigating Inspector</th>
                <th>Evidence Items</th>
                <th>Forensic Status</th>
                <th>Last Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No forensic case records found matching filters.
                  </td>
                </tr>
              ) : (
                paginatedCases.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span className="forensic-id-badge">{item.id}</span>
                    </td>
                    <td>
                      <span className="forensic-cell-title">{item.title}</span>
                      <span className="forensic-cell-sub">{item.policeStation}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{item.inspector}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1E6DEB' }}>
                        {item.evidenceCount} Exhibits
                      </span>
                    </td>
                    <td>
                      <span className={`forensic-status-badge ${item.forensicStatus.includes('Completed') ? 'verified' : 'under-exam'}`}>
                        {item.forensicStatus}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: '#475569' }}>{item.lastUpdated}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="forensic-btn forensic-btn-primary forensic-btn-sm"
                        onClick={() => setSelectedCase(item)}
                      >
                        Review Case
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
            Showing {filteredCases.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredCases.length)} of {filteredCases.length} entries
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

      {/* Case Detail Modal */}
      {selectedCase && (
        <ForensicCaseModal 
          caseItem={selectedCase} 
          onClose={() => setSelectedCase(null)} 
          showToast={showToast}
        />
      )}

    </div>
  );
}
