import React, { useState, useMemo } from 'react';
import { forensicDocumentsData } from '../../data/forensicOfficerData';
import { ForensicDocumentModal } from './ForensicModals';

export default function ForensicDocumentsPage({ showToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const filteredDocs = useMemo(() => {
    return forensicDocumentsData.filter(d => {
      const matchSearch = searchQuery === '' ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.relatedEvidence.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchType = typeFilter === 'All' || d.type.toLowerCase().includes(typeFilter.toLowerCase());

      return matchSearch && matchType;
    });
  }, [searchQuery, typeFilter]);

  const totalPages = Math.ceil(filteredDocs.length / pageSize) || 1;
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="forensic-page-container">
      
      {/* 1. Page Header */}
      <div className="forensic-page-header">
        <div className="forensic-header-left">
          <h1 className="forensic-page-title">Forensic & Scientific Documents</h1>
          <p className="forensic-page-subtitle">
            Repository of cryptographically verified expert opinions, Section 65B certificates, and laboratory exhibits
          </p>
        </div>
        <div className="forensic-header-actions">
          <button 
            className="forensic-btn forensic-btn-primary"
            onClick={() => showToast?.("Document upload portal ready. Please select Form IV or test result PDF.")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Upload Forensic Document</span>
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
              placeholder="Search document name, case, exhibit ID, or officer..." 
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
            <option value="All">All Document Classes</option>
            <option value="Expert">Expert Opinions</option>
            <option value="Microscopic">Microscopic Benchmarks</option>
            <option value="Section 65B">Section 65B Certificates</option>
            <option value="DNA">DNA Profiles</option>
            <option value="Handover">Custodial Handover Memos</option>
          </select>
        </div>
      </div>

      {/* 3. Forensic Documents Table */}
      <div className="forensic-table-container">
        <div className="forensic-card-header-bar">
          <div className="forensic-card-header-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Archived Forensic Documents ({filteredDocs.length})</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            All documents cryptographically hashed with SHA-256
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="forensic-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Document Type</th>
                <th>Case ID</th>
                <th>Related Evidence</th>
                <th>Uploaded By</th>
                <th>Verification</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDocs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                    No forensic document records found.
                  </td>
                </tr>
              ) : (
                paginatedDocs.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E6DEB" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <div>
                          <span className="forensic-cell-title">{item.name}</span>
                          <span className="forensic-cell-sub">{item.size} • {item.authority}</span>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '12.5px', color: '#334155', fontWeight: '500' }}>{item.type}</span></td>
                    <td><strong style={{ color: '#0F172A', fontSize: '12.5px' }}>{item.caseId}</strong></td>
                    <td><span className="forensic-id-badge">{item.relatedEvidence}</span></td>
                    <td><span style={{ fontSize: '12.5px', color: '#334155' }}>{item.uploadedBy}</span></td>
                    <td>
                      <span className="forensic-status-badge verified">
                        {item.verificationStatus}
                      </span>
                    </td>
                    <td><span style={{ fontSize: '12px', color: '#64748B' }}>{item.date}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="forensic-btn forensic-btn-primary forensic-btn-sm"
                        onClick={() => setSelectedDoc(item)}
                      >
                        Preview & Verify
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
            Showing {filteredDocs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredDocs.length)} of {filteredDocs.length} entries
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

      {/* Document Detail & Preview Modal */}
      {selectedDoc && (
        <ForensicDocumentModal 
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          showToast={showToast}
        />
      )}

    </div>
  );
}
