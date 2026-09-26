import React, { useState, useEffect, useMemo } from 'react';
import { forensicReportsData } from '../../data/forensicOfficerData';
import { ForensicReportDetailModal } from './ForensicModals';

export default function ForensicReportsPage({ reports: propReports, isLoading = false, showToast }) {
  const [reportsList, setReportsList] = useState(propReports || forensicReportsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    if (propReports && propReports.length > 0) {
      setReportsList(propReports);
    }
  }, [propReports]);

  const totalReports = reportsList.length;
  const draftCount = reportsList.filter(r => r.status === 'Draft').length;
  const underExamCount = reportsList.filter(r => r.status === 'Under Examination').length;
  const pendingReviewCount = reportsList.filter(r => r.status === 'Pending Review').length;
  const finalizedCount = reportsList.filter(r => r.status === 'Finalized' || r.status === 'Completed').length;

  const filteredReports = useMemo(() => {
    return reportsList.filter(r => {
      const matchSearch = searchQuery === '' ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.evidenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.examiner.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
  const paginatedReports = filteredReports.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="forensic-page-container">
      
      {/* 1. Page Header */}
      <div className="forensic-page-header">
        <div className="forensic-header-left">
          <h1 className="forensic-page-title">Forensic Expert Reports (Section 45 IEA)</h1>
          <p className="forensic-page-subtitle">
            Statutory expert opinions, microscopic comparison records, chemical assays, and digital certificates prepared for court trial
          </p>
        </div>
        <div className="forensic-header-actions">
          <button 
            className="forensic-btn forensic-btn-primary"
            onClick={() => showToast?.("Form IV Section 45 drafting template initialized.")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Draft New Forensic Report</span>
          </button>
        </div>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="forensic-summary-grid">
        <div 
          className={`forensic-summary-card ${statusFilter === 'All' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('All');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Total Reports</span>
            <div className="forensic-kpi-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{totalReports}</div>
          <div className="forensic-kpi-subtext">All laboratory reports</div>
        </div>

        <div 
          className={`forensic-summary-card ${statusFilter === 'Draft' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('Draft');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Draft</span>
            <div className="forensic-kpi-icon-wrap amber">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{draftCount}</div>
          <div className="forensic-kpi-subtext">Preliminary analysis drafts</div>
        </div>

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
          <div className="forensic-kpi-value">{underExamCount}</div>
          <div className="forensic-kpi-subtext">Laboratory tests ongoing</div>
        </div>

        <div 
          className={`forensic-summary-card ${statusFilter === 'Pending Review' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('Pending Review');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Pending Review</span>
            <div className="forensic-kpi-icon-wrap amber">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{pendingReviewCount}</div>
          <div className="forensic-kpi-subtext">Awaiting Director Signoff</div>
        </div>

        <div 
          className={`forensic-summary-card ${statusFilter === 'Finalized' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('Finalized');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Finalized</span>
            <div className="forensic-kpi-icon-wrap green">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{finalizedCount}</div>
          <div className="forensic-kpi-subtext">Sealed & Court Dispatched</div>
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
              placeholder="Search Report ID, Case, Evidence, Discipline, or Examiner..." 
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
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Report Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Under Examination">Under Examination</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Finalized">Finalized</option>
          </select>
        </div>
      </div>

      {/* 4. Forensic Reports Table */}
      <div className="forensic-table-container">
        <div className="forensic-card-header-bar">
          <div className="forensic-card-header-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Section 45 IEA Scientific Expert Reports Register ({filteredReports.length})</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Form IV Statutory Scientific Declarations
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="forensic-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Case ID</th>
                <th>Evidence ID</th>
                <th>Report Type</th>
                <th>Lead Examiner</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Last Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No forensic report records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedReports.map(item => (
                  <tr key={item.id}>
                    <td><span className="forensic-id-badge">{item.id}</span></td>
                    <td><strong style={{ color: '#0F172A', fontSize: '12.5px' }}>{item.caseId}</strong></td>
                    <td><span className="forensic-id-badge">{item.evidenceId}</span></td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '12.5px' }}>{item.reportType}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: '#334155' }}>{item.examiner}</span>
                    </td>
                    <td>
                      <span className={`forensic-status-badge ${item.status === 'Finalized' ? 'verified' : item.status === 'Pending Review' ? 'pending' : 'under-exam'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td><span style={{ fontSize: '12px', color: '#64748B' }}>{item.createdDate}</span></td>
                    <td><span style={{ fontSize: '12px', color: '#64748B' }}>{item.lastUpdated}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="forensic-btn forensic-btn-primary forensic-btn-sm"
                        onClick={() => setSelectedReport(item)}
                      >
                        Open Dossier
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
            Showing {filteredReports.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredReports.length)} of {filteredReports.length} entries
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

      {/* Deep Forensic Report Detail Modal (9 sections) */}
      {selectedReport && (
        <ForensicReportDetailModal 
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          showToast={showToast}
        />
      )}

    </div>
  );
}
