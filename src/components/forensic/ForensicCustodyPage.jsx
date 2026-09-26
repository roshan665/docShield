import React, { useState, useMemo } from 'react';
import { forensicCustodyData } from '../../data/forensicOfficerData';
import { ForensicCustodyModal } from './ForensicModals';

export default function ForensicCustodyPage({ showToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCustody, setSelectedCustody] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalTransfers = forensicCustodyData.reduce((acc, c) => acc + (c.transfersCount || 1), 0);
  const activeCustodyCount = forensicCustodyData.filter(c => c.custodyStatus.includes('Active')).length;
  const pendingCount = forensicCustodyData.filter(c => c.custodyStatus.includes('Pending')).length;
  const exceptionCount = forensicCustodyData.filter(c => c.custodyStatus.includes('Exception')).length;

  const filteredCustody = useMemo(() => {
    return forensicCustodyData.filter(item => {
      const matchSearch = searchQuery === '' ||
        item.evidenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.evidenceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.currentCustodian.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.currentLocation.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || item.custodyStatus.includes(statusFilter);

      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredCustody.length / pageSize) || 1;
  const paginatedCustody = filteredCustody.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="forensic-page-container">
      
      {/* 1. Page Header */}
      <div className="forensic-page-header">
        <div className="forensic-header-left">
          <h1 className="forensic-page-title">Evidence Chain of Custody & Vault Oversight</h1>
          <p className="forensic-page-subtitle">
            Immutable custody tracking, tamper-evident sealing audits, and laboratory vault transfer acknowledgments
          </p>
        </div>
        <div className="forensic-header-actions">
          <button 
            className="forensic-btn forensic-btn-outline"
            onClick={() => showToast?.("Exporting full Chain of Custody Audit Ledger (CSV)...")}
          >
            Export Custody Ledger
          </button>
          <button 
            className="forensic-btn forensic-btn-primary"
            onClick={() => showToast?.("Biometric custody handover scan initiated.")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Log Custody Handover</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="forensic-summary-grid four-cols">
        <div 
          className={`forensic-summary-card ${statusFilter === 'All' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('All');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Total Transfers</span>
            <div className="forensic-kpi-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{totalTransfers}</div>
          <div className="forensic-kpi-subtext">Verified custodial steps</div>
        </div>

        <div 
          className={`forensic-summary-card ${statusFilter === 'Active' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('Active');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Active Lab Custody</span>
            <div className="forensic-kpi-icon-wrap green">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{activeCustodyCount}</div>
          <div className="forensic-kpi-subtext">Inside RFSL vaults / chambers</div>
        </div>

        <div 
          className={`forensic-summary-card ${statusFilter === 'Pending' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('Pending');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Pending Verification</span>
            <div className="forensic-kpi-icon-wrap amber">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{pendingCount}</div>
          <div className="forensic-kpi-subtext">In-transit from police malkhana</div>
        </div>

        <div 
          className={`forensic-summary-card ${statusFilter === 'Exception' ? 'active-filter' : ''}`}
          onClick={() => {
            setStatusFilter('Exception');
            setCurrentPage(1);
          }}
        >
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Custody Exceptions</span>
            <div className="forensic-kpi-icon-wrap red">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{exceptionCount}</div>
          <div className="forensic-kpi-subtext" style={{ color: '#DC2626' }}>Packaging or seal irregularity</div>
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
              placeholder="Search Evidence ID, Case ID, Custodian, or Chamber Location..." 
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
            <option value="All">All Custody Statuses</option>
            <option value="Active">Active Lab Custody</option>
            <option value="Pending">Pending Verification</option>
            <option value="Exception">Custody Exception</option>
          </select>
        </div>
      </div>

      {/* 4. Custody Registry Table */}
      <div className="forensic-table-container">
        <div className="forensic-card-header-bar">
          <div className="forensic-card-header-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span>Evidence Custody & Transit Register ({filteredCustody.length})</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Section 173 CrPC / BNSS Compliant Chain of Custody
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="forensic-table">
            <thead>
              <tr>
                <th>Evidence ID</th>
                <th>Case ID</th>
                <th>Evidence Type</th>
                <th>Current Custodian</th>
                <th>Current Location</th>
                <th>Last Transfer</th>
                <th>Custody Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustody.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No custody records found matching filters.
                  </td>
                </tr>
              ) : (
                paginatedCustody.map(item => (
                  <tr key={item.id}>
                    <td><span className="forensic-id-badge">{item.evidenceId}</span></td>
                    <td><strong style={{ color: '#0F172A', fontSize: '12.5px' }}>{item.caseId}</strong></td>
                    <td><span style={{ fontWeight: '600', color: '#1E293B', fontSize: '12.5px' }}>{item.evidenceType}</span></td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: '600' }}>{item.currentCustodian}</span>
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>Authorized: {item.authorizedOfficer}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: '#334155' }}>{item.currentLocation}</span>
                    </td>
                    <td><span style={{ fontSize: '12px', color: '#64748B' }}>{item.lastTransfer}</span></td>
                    <td>
                      <span className={`forensic-status-badge ${item.custodyStatus.includes('Active') ? 'verified' : item.custodyStatus.includes('Exception') ? 'exception' : 'pending'}`}>
                        {item.custodyStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="forensic-btn forensic-btn-primary forensic-btn-sm"
                        onClick={() => setSelectedCustody(item)}
                      >
                        Custody Dossier
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
            Showing {filteredCustody.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredCustody.length)} of {filteredCustody.length} entries
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

      {/* Custody Detail Modal (8 sections) */}
      {selectedCustody && (
        <ForensicCustodyModal 
          custody={selectedCustody}
          onClose={() => setSelectedCustody(null)}
          showToast={showToast}
        />
      )}

    </div>
  );
}
