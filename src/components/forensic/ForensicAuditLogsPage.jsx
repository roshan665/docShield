import React, { useState, useMemo } from 'react';
import { forensicAuditLogs } from '../../data/forensicOfficerData';
import { ForensicAuditModal } from './ForensicModals';

export default function ForensicAuditLogsPage({ showToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [caseFilter, setCaseFilter] = useState('All');
  const [evidenceFilter, setEvidenceFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredLogs = useMemo(() => {
    return forensicAuditLogs.filter(log => {
      const matchSearch = searchQuery === '' ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.evidenceId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchModule = moduleFilter === 'All' || log.module === moduleFilter;
      const matchCase = caseFilter === 'All' || log.caseId === caseFilter;
      const matchEvidence = evidenceFilter === 'All' || log.evidenceId === evidenceFilter;

      return matchSearch && matchModule && matchCase && matchEvidence;
    });
  }, [searchQuery, moduleFilter, caseFilter, evidenceFilter, dateFilter]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="forensic-page-container">
      
      {/* 1. Page Header */}
      <div className="forensic-page-header">
        <div className="forensic-header-left">
          <h1 className="forensic-page-title">Forensic Audit & Examination Logs</h1>
          <p className="forensic-page-subtitle">
            Cryptographically sealed, append-only security logs of all forensic examinations, hash verifications, and custodial handovers
          </p>
        </div>
        <div className="forensic-header-actions">
          <div className="forensic-header-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Ledger Integrity: Verified SHA-256</span>
          </div>
          <button 
            className="forensic-btn forensic-btn-outline"
            onClick={() => showToast?.("Exporting CCTNS Forensic Audit Trail as PDF...")}
          >
            Export Signed Audit Trail
          </button>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="forensic-toolbar-container">
        <div className="forensic-toolbar-left">
          <div className="forensic-search-input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              className="forensic-search-input" 
              placeholder="Search audit action, officer, case, evidence, or IP..." 
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
            value={moduleFilter}
            onChange={e => {
              setModuleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Modules</option>
            <option value="Forensic Reports">Forensic Reports</option>
            <option value="Evidence Examination">Evidence Examination</option>
            <option value="Chain of Custody">Chain of Custody</option>
          </select>

          <select 
            className="forensic-select"
            value={caseFilter}
            onChange={e => {
              setCaseFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Cases</option>
            <option value="FIR-2024-0892">FIR-2024-0892</option>
            <option value="FIR-2024-0914">FIR-2024-0914</option>
            <option value="FIR-2024-0741">FIR-2024-0741</option>
            <option value="FIR-2024-0618">FIR-2024-0618</option>
            <option value="FIR-2024-1108">FIR-2024-1108</option>
          </select>

          <select 
            className="forensic-select"
            value={evidenceFilter}
            onChange={e => {
              setEvidenceFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Evidence</option>
            <option value="EVD-2024-001">EVD-2024-001</option>
            <option value="EVD-2024-004">EVD-2024-004</option>
            <option value="EVD-2024-007">EVD-2024-007</option>
            <option value="EVD-2024-018">EVD-2024-018</option>
            <option value="EVD-2024-025">EVD-2024-025</option>
          </select>

          <select 
            className="forensic-select"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
          </select>
        </div>
      </div>

      {/* 3. Audit Logs Table */}
      <div className="forensic-table-container">
        <div className="forensic-card-header-bar">
          <div className="forensic-card-header-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            <span>Immutable Forensic Event Ledger ({filteredLogs.length})</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            ISO 17025 Laboratory Quality & Audit Compliance
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="forensic-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Examiner / User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Module</th>
                <th>Case ID</th>
                <th>Evidence ID</th>
                <th>Result</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No audit records found matching filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: '600' }}>{item.timestamp}</span>
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>{item.ip}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{item.user}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#475569' }}>{item.role}</span>
                    </td>
                    <td>
                      <span className="forensic-id-badge" style={{ backgroundColor: '#F1F5F9', color: '#0F172A', borderColor: '#E2E8F0' }}>
                        {item.action}
                      </span>
                    </td>
                    <td><span style={{ fontSize: '12.5px', color: '#334155' }}>{item.module}</span></td>
                    <td><strong style={{ color: '#0F172A', fontSize: '12.5px' }}>{item.caseId}</strong></td>
                    <td><span className="forensic-id-badge">{item.evidenceId}</span></td>
                    <td>
                      <span className={`forensic-status-badge ${item.result === 'Success' ? 'verified' : 'exception'}`}>
                        {item.result}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="forensic-btn forensic-btn-primary forensic-btn-sm"
                        onClick={() => setSelectedLog(item)}
                      >
                        Inspect Log
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
            Showing {filteredLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
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

      {/* Audit Detail Modal */}
      {selectedLog && (
        <ForensicAuditModal 
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}

    </div>
  );
}
