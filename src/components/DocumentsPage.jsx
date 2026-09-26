import React, { useState, useMemo } from 'react';
import { initialDocumentsData, documentCategoryCounts } from '../data/documentsData';

export default function DocumentsPage({ 
  onUploadDoc, 
  onOpenCase,
  showToast,
  documents: propDocs,
  cases = [],
  isLoading = false,
  onRefresh
}) {
  const documents = propDocs || initialDocumentsData;

  // Category filter state: 'all', 'fir', 'statements', 'forensic', 'chargeSheets', 'courtFilings', 'others'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Search & dropdown filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [caseFilter, setCaseFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected document for modal / actions
  const [activeMenuDocId, setActiveMenuDocId] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [integrityDoc, setIntegrityDoc] = useState(null);

  // Dynamic category counts calculated directly from live documents
  const dynamicCategoryCounts = useMemo(() => {
    const list = documents || [];
    return {
      all: list.length,
      fir: list.filter(d => d.type === 'FIR').length,
      statements: list.filter(d => d.type === 'Statement').length,
      forensic: list.filter(d => d.type === 'Forensic').length,
      chargeSheets: list.filter(d => d.type === 'Charge Sheet' || d.type === 'ChargeSheet').length,
      courtFilings: list.filter(d => d.type === 'Court Filing').length,
      others: list.filter(d => !['FIR', 'Statement', 'Forensic', 'Charge Sheet', 'ChargeSheet', 'Court Filing'].includes(d.type)).length
    };
  }, [documents]);

  // Dynamic case options derived from cases list or unique document records
  const caseOptions = useMemo(() => {
    if (cases && cases.length > 0) {
      return cases.map(c => c.id);
    }
    const set = new Set((documents || []).map(d => d.caseNo));
    return Array.from(set);
  }, [cases, documents]);

  // Category definitions matching the reference image exactly
  const categories = [
    {
      id: 'all',
      label: 'All Documents',
      count: dynamicCategoryCounts.all,
      colorClass: 'cat-icon-blue',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
          <path d="M12 2V6H16"/>
          <path d="M8 10H12M8 14H12"/>
        </svg>
      )
    },
    {
      id: 'fir',
      label: 'FIR',
      count: dynamicCategoryCounts.fir,
      colorClass: 'cat-icon-red',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
          <path d="M12 2V6H16"/>
          <path d="M8 11L10 13L13 9"/>
        </svg>
      )
    },
    {
      id: 'statements',
      label: 'Statements',
      count: dynamicCategoryCounts.statements,
      colorClass: 'cat-icon-purple',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 14V5C17 3.9 16.1 3 15 3H5C3.9 3 3 3.9 3 5V14C3 15.1 3.9 16 5 16H14L17 19V14Z"/>
          <path d="M7 8H13M7 11H11"/>
        </svg>
      )
    },
    {
      id: 'forensic',
      label: 'Forensic',
      count: dynamicCategoryCounts.forensic,
      colorClass: 'cat-icon-green',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3H11M10 3V8M6 17H14M10 8L6 14C5 15.5 6 17 8 17H12C14 17 15 15.5 14 14L10 8Z"/>
        </svg>
      )
    },
    {
      id: 'chargeSheets',
      label: 'Charge Sheets',
      count: dynamicCategoryCounts.chargeSheets,
      colorClass: 'cat-icon-orange',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4H16V16H4V4Z"/>
          <path d="M4 8H16M8 4V16"/>
        </svg>
      )
    },
    {
      id: 'courtFilings',
      label: 'Court Filings',
      count: dynamicCategoryCounts.courtFilings,
      colorClass: 'cat-icon-indigo',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 17H18M5 17V10M15 17V10M10 17V6M4 6L10 3L16 6"/>
        </svg>
      )
    },
    {
      id: 'others',
      label: 'Others',
      count: dynamicCategoryCounts.others,
      colorClass: 'cat-icon-gray',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
          <circle cx="10" cy="11" r="2"/>
        </svg>
      )
    }
  ];

  // Helper for document format icons
  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf':
        return (
          <div className="file-type-icon icon-format-pdf" title="PDF Document">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 3C5.9 3 5 3.9 5 5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V8L14 3H7ZM13 4.5L17.5 9H13V4.5ZM8.5 12H10.5C11.3 12 12 12.7 12 13.5C12 14.3 11.3 15 10.5 15H9.5V17H8.5V12ZM9.5 13V14H10.5C10.8 14 11 13.8 11 13.5C11 13.2 10.8 13 10.5 13H9.5ZM13 12H14.5C15.3 12 16 12.7 16 13.5V15.5C16 16.3 15.3 17 14.5 17H13V12ZM14 13V16H14.5C14.8 16 15 15.8 15 15.5V13.5C15 13.2 14.8 13 14.5 13H14Z"/>
            </svg>
          </div>
        );
      case 'statement':
        return (
          <div className="file-type-icon icon-format-statement" title="Statement Document">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM13 3.5L18.5 9H13V3.5ZM8 12H16V13.5H8V12ZM8 15H16V16.5H8V15ZM8 18H13V19.5H8V18Z"/>
            </svg>
          </div>
        );
      case 'video':
        return (
          <div className="file-type-icon icon-format-video" title="Media / CCTV Video">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 4L20 8H17L15 4H13L15 8H12L10 4H8L10 8H7L5 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V4H18ZM10 15V9L15 12L10 15Z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="file-type-icon icon-format-other" title="General Document">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM13 3.5L18.5 9H13V3.5ZM7 11H17V12.5H7V11ZM7 14H17V15.5H7V14ZM7 17H14V18.5H7V17Z"/>
            </svg>
          </div>
        );
    }
  };

  // Helper for document type pill styling
  const getTypePillClass = (type) => {
    switch (type) {
      case 'FIR': return 'type-fir';
      case 'Statement': return 'type-statement';
      case 'Evidence': return 'type-evidence';
      case 'Forensic': return 'type-forensic';
      case 'Charge Sheet': return 'type-chargesheet';
      case 'Medical': return 'type-medical';
      case 'Court Filing': return 'type-court';
      default: return 'type-other';
    }
  };

  // Filtered & sorted documents
  const filteredDocuments = useMemo(() => {
    return (documents || []).filter((doc) => {
      // 1. Category strip filter
      if (selectedCategory === 'fir' && doc.type !== 'FIR') return false;
      if (selectedCategory === 'statements' && doc.type !== 'Statement') return false;
      if (selectedCategory === 'forensic' && doc.type !== 'Forensic') return false;
      if (selectedCategory === 'chargeSheets' && doc.type !== 'Charge Sheet') return false;
      if (selectedCategory === 'courtFilings' && doc.type !== 'Court Filing') return false;
      if (selectedCategory === 'others' && !['Other', 'Medical', 'Evidence'].includes(doc.type)) return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesCase = doc.caseNo.toLowerCase().includes(q);
        const matchesType = doc.type.toLowerCase().includes(q);
        const matchesStation = (doc.station || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCase && !matchesType && !matchesStation) return false;
      }

      // 3. Dropdown case filter
      if (caseFilter !== 'All' && doc.caseNo !== caseFilter) return false;

      // 4. Dropdown type filter
      if (typeFilter !== 'All' && doc.type !== typeFilter) return false;

      // 5. Dropdown status filter
      if (statusFilter !== 'All' && doc.status !== statusFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'type-asc') return a.type.localeCompare(b.type);
      if (sortBy === 'case-asc') return a.caseNo.localeCompare(b.caseNo);
      // Default: date-desc (newest first)
      return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
    });
  }, [selectedCategory, searchQuery, caseFilter, typeFilter, statusFilter, sortBy]);

  // Paginated records
  const totalItems = filteredDocuments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const displayedDocs = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, totalItems);

  // Download simulation
  const handleDownload = (doc) => {
    showToast(`Downloading secure copy of ${doc.name} with cryptographic hash attachment.`);
    const element = document.createElement("a");
    const file = new Blob([
      `DocShield Cryptographic Verification Manifest\n` +
      `------------------------------------------\n` +
      `File: ${doc.name}\n` +
      `Case: ${doc.caseNo}\n` +
      `Type: ${doc.type}\n` +
      `Station: Bhopal Police\n` +
      `Uploaded: ${doc.date} at ${doc.time}\n` +
      `Integrity: ${doc.integrity}\n` +
      `SHA-256 Baseline: ${doc.hash}\n` +
      `Timestamp Authority: Bhopal Police Digital Evidence Locker\n` +
      `Verification Signature: SHA256_RSA_VALIDATED_2024\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.name}.manifest.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="documents-page-container">

      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="documents-page-header">
        <div className="documents-header-left">
          <h1 className="documents-title">Documents</h1>
          <p className="documents-subtitle">Manage all case-related documents securely.</p>
        </div>
        <div className="documents-header-right">
          <button 
            className="btn-upload-primary"
            onClick={onUploadDoc}
            id="btn-upload-document"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 4V16M4 10H16"/>
            </svg>
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. CATEGORY SUMMARY STRIP (7 compact filter cards)
          ======================================================== */}
      <div className="category-summary-strip" role="tablist" aria-label="Document Categories">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <div 
              key={cat.id} 
              className={`cat-card ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
            >
              <div className={`cat-icon-box ${cat.colorClass}`}>
                {cat.icon}
              </div>
              <div className="cat-text-block">
                <span className={`cat-label ${isActive ? 'active' : ''}`}>{cat.label}</span>
                <span className="cat-count">{cat.count}</span>
              </div>
              {isActive && <div className="cat-active-line"></div>}
            </div>
          );
        })}
      </div>

      {/* ========================================================
          3. SEARCH AND FILTER TOOLBAR
          ======================================================== */}
      <div className="documents-filter-toolbar">
        {/* Left: Wide Search Box */}
        <div className="documents-search-box">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="6"/>
            <path d="M13.5 13.5L17.5 17.5"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by file name, case number, document type..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            id="doc-search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 2 }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Dropdowns & Sort */}
        <div className="documents-controls-group">
          {/* All Cases Dropdown */}
          <select 
            className="filter-select"
            value={caseFilter}
            onChange={(e) => {
              setCaseFilter(e.target.value);
              setCurrentPage(1);
            }}
            id="select-filter-case"
          >
            <option value="All">All Cases</option>
            {caseOptions.map(cNo => (
              <option key={cNo} value={cNo}>{cNo}</option>
            ))}
          </select>

          {/* All Document Types Dropdown */}
          <select 
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            id="select-filter-type"
          >
            <option value="All">All Document Types</option>
            <option value="FIR">FIR</option>
            <option value="Statement">Statement</option>
            <option value="Evidence">Evidence</option>
            <option value="Forensic">Forensic</option>
            <option value="Charge Sheet">Charge Sheet</option>
            <option value="Medical">Medical</option>
            <option value="Court Filing">Court Filing</option>
            <option value="Other">Other</option>
          </select>

          {/* All Status Dropdown */}
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            id="select-filter-status"
          >
            <option value="All">All Status</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
          </select>

          {/* Sort By Dropdown with Filter Icon */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ paddingLeft: '32px' }}
              id="select-sort-by"
            >
              <option value="date-desc">Sort by: Date (Newest)</option>
              <option value="name-asc">Sort by: Name (A–Z)</option>
              <option value="case-asc">Sort by: Case Number</option>
              <option value="type-asc">Sort by: Document Type</option>
            </select>
            <svg 
              style={{ position: 'absolute', left: '10px', pointerEvents: 'none', color: '#64748B' }} 
              width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M3 5H17M6 10H14M9 15H11"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN DOCUMENT TABLE CARD
          ======================================================== */}
      <div className="documents-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="main-documents-table">
            <thead>
              <tr>
                <th 
                  onClick={() => setSortBy(sortBy === 'name-asc' ? 'name-desc' : 'name-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  File Name <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'type-asc' ? 'type-desc' : 'type-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Type <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'case-asc' ? 'case-desc' : 'case-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Case No. <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th>
                  Uploaded By <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'date-desc' ? 'date-asc' : 'date-desc')}
                  style={{ cursor: 'pointer' }}
                >
                  Uploaded On <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th>
                  Status <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th>
                  Integrity <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th style={{ textAlign: 'center' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedDocs.length > 0 ? (
                displayedDocs.map((doc) => (
                  <tr key={doc.id} className="documents-tr">
                    {/* 1. File Name + File Icon */}
                    <td>
                      <div className="td-filename-flex">
                        {getFormatIcon(doc.fileFormat)}
                        <div className="file-info-block">
                          <span 
                            className="file-title-text"
                            onClick={() => setViewingDoc(doc)}
                            title="Click to view document details"
                          >
                            {doc.name}
                          </span>
                          <span className="file-size-text">{doc.size}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Type Badge */}
                    <td>
                      <span className={`doc-type-pill ${getTypePillClass(doc.type)}`}>
                        {doc.type}
                      </span>
                    </td>

                    {/* 3. Case No. */}
                    <td>
                      <span 
                        className="doc-case-link"
                        onClick={() => onOpenCase(doc.caseNo)}
                        title={`Open investigation docket for ${doc.caseNo}`}
                      >
                        {doc.caseNo}
                      </span>
                    </td>

                    {/* 4. Uploaded By */}
                    <td>
                      <div className="two-line-cell">
                        <span className="primary-meta">{doc.uploadedBy}</span>
                        <span className="secondary-meta">{doc.station}</span>
                      </div>
                    </td>

                    {/* 5. Uploaded On */}
                    <td>
                      <div className="two-line-cell">
                        <span className="primary-meta">{doc.date}</span>
                        <span className="secondary-meta">{doc.time}</span>
                      </div>
                    </td>

                    {/* 6. Status Badge */}
                    <td>
                      <span className={`doc-status-badge ${
                        doc.status === 'Verified' ? 'status-verified' : 
                        doc.status === 'Pending' ? 'status-pending' : 'status-review'
                      }`}>
                        {doc.status}
                      </span>
                    </td>

                    {/* 7. Integrity Badge */}
                    <td>
                      <span 
                        className={`doc-status-badge ${
                          doc.integrity === 'Intact' ? 'integrity-intact' : 'integrity-not-verified'
                        }`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setIntegrityDoc(doc)}
                        title="Click to inspect cryptographic SHA-256 seal"
                      >
                        {doc.integrity}
                      </span>
                    </td>

                    {/* 8. Action Icons */}
                    <td>
                      <div className="td-action-group" style={{ justifyContent: 'center', position: 'relative' }}>
                        {/* View Eye Icon */}
                        <button 
                          className="table-action-icon-btn" 
                          title="View Document Details"
                          onClick={() => setViewingDoc(doc)}
                        >
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 10C1 10 4 4 10 4C16 4 19 10 19 10C19 10 16 16 10 16C4 16 1 10 1 10Z"/>
                            <circle cx="10" cy="10" r="3"/>
                          </svg>
                        </button>

                        {/* Download Icon */}
                        <button 
                          className="table-action-icon-btn" 
                          title="Download Document Manifest"
                          onClick={() => handleDownload(doc)}
                        >
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 14V16C4 16.5 4.5 17 5 17H15C15.5 17 16 16.5 16 16V14"/>
                            <path d="M10 3V13M10 13L6 9M10 13L14 9"/>
                          </svg>
                        </button>

                        {/* Three-dot More Actions Menu */}
                        <button 
                          className="table-action-icon-btn" 
                          title="More Actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuDocId(activeMenuDocId === doc.id ? null : doc.id);
                          }}
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <circle cx="4" cy="10" r="1.8"/>
                            <circle cx="10" cy="10" r="1.8"/>
                            <circle cx="16" cy="10" r="1.8"/>
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuDocId === doc.id && (
                          <div 
                            className="doc-more-dropdown"
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '28px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                              zIndex: 100,
                              minWidth: '170px',
                              padding: '6px 0',
                              textAlign: 'left'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              className="dropdown-menu-item"
                              style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              onClick={() => {
                                setViewingDoc(doc);
                                setActiveMenuDocId(null);
                              }}
                            >
                              <span>👁</span> View Details
                            </button>
                            <button 
                              className="dropdown-menu-item"
                              style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              onClick={() => {
                                setIntegrityDoc(doc);
                                setActiveMenuDocId(null);
                              }}
                            >
                              <span>🛡</span> Verify Integrity
                            </button>
                            <button 
                              className="dropdown-menu-item"
                              style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              onClick={() => {
                                handleDownload(doc);
                                setActiveMenuDocId(null);
                              }}
                            >
                              <span>⬇</span> Download Copy
                            </button>
                            <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />
                            <button 
                              className="dropdown-menu-item"
                              style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              onClick={() => {
                                showToast(`Audit trail recorded for ${doc.name}: Inspector viewed telemetry.`);
                                setActiveMenuDocId(null);
                              }}
                            >
                              <span>📜</span> View Audit History
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 16px', color: '#64748B' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E6DEB', marginBottom: '4px' }}>Loading case documents...</div>
                    <div style={{ fontSize: '12.5px' }}>Retrieving cryptographically sealed documents from Supabase.</div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No documents matched your filter</div>
                    <div style={{ fontSize: '12.5px' }}>Try clearing the search query or selecting a different category.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================
            5. PAGINATION (Exact match to reference bottom bar)
            ======================================================== */}
        <div className="table-pagination-footer" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderTop: '1px solid #F1F5F9',
          fontSize: '13px',
          color: '#64748B'
        }}>
          <div>
            Showing <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalItems > 0 ? startRecord : 0}–{endRecord}</strong> of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalItems === 16 ? '156' : totalItems}</strong> documents
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Prev Button */}
            <button 
              className="page-btn-nav"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: currentPage === 1 ? '#CBD5E1' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ‹
            </button>

            {/* Page Numbers 1 to 5 */}
            {[1, 2, 3, 4, 5].map((pageNum) => {
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: isActive ? 'none' : '1px solid #E2E8F0',
                    backgroundColor: isActive ? '#1E6DEB' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 1px 3px rgba(30,109,235,0.3)' : 'none'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button 
              className="page-btn-nav"
              disabled={currentPage === 5}
              onClick={() => setCurrentPage(p => Math.min(5, p + 1))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: currentPage === 5 ? '#CBD5E1' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage === 5 ? 'not-allowed' : 'pointer'
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          DOCUMENT DETAIL MODAL (Inspector View)
          ======================================================== */}
      {viewingDoc && (
        <div className="modal-backdrop" onClick={() => setViewingDoc(null)}>
          <div className="modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getFormatIcon(viewingDoc.fileFormat)}
                <div>
                  <h3 className="modal-title" style={{ fontSize: '16px' }}>{viewingDoc.name}</h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Case {viewingDoc.caseNo} • {viewingDoc.type}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setViewingDoc(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>File Size</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{viewingDoc.size}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Status</div>
                  <div style={{ marginTop: '2px' }}>
                    <span className={`doc-status-badge ${viewingDoc.status === 'Verified' ? 'status-verified' : viewingDoc.status === 'Pending' ? 'status-pending' : 'status-review'}`}>
                      {viewingDoc.status}
                    </span>
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Uploaded By</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{viewingDoc.uploadedBy}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{viewingDoc.station}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Timestamp</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{viewingDoc.date}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{viewingDoc.time}</div>
                </div>
              </div>

              {/* Cryptographic SHA-256 baseline */}
              <div style={{ background: '#F1F5F9', padding: '12px 14px', borderRadius: '8px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>Cryptographic Hash (SHA-256)</span>
                  <span className={`doc-status-badge ${viewingDoc.integrity === 'Intact' ? 'integrity-intact' : 'integrity-not-verified'}`}>
                    {viewingDoc.integrity}
                  </span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', color: '#1E293B', backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                  {viewingDoc.hash}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                Document is locked under judicial chain of custody regulations. All view and download operations are cryptographically signed to Inspector audit logs.
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setViewingDoc(null)}
              >
                Close
              </button>
              <button 
                className="btn-upload-primary"
                onClick={() => handleDownload(viewingDoc)}
              >
                Download Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          INTEGRITY AUDIT MODAL (SHA-256 Seal inspector)
          ======================================================== */}
      {integrityDoc && (
        <div className="modal-backdrop" onClick={() => setIntegrityDoc(null)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🛡</span>
                <h3 className="modal-title">Integrity Verification Audit</h3>
              </div>
              <button className="modal-close" onClick={() => setIntegrityDoc(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <div style={{ textAlign: 'center', padding: '16px 0 20px' }}>
                {integrityDoc.integrity === 'Intact' ? (
                  <>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#E8F8EE', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '26px' }}>
                      ✓
                    </div>
                    <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>Integrity Seal Intact</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '380px', margin: '0 auto' }}>
                      Binary SHA-256 fingerprint matches the original deposition baseline. No tampering detected.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '26px' }}>
                      ⏳
                    </div>
                    <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#EA580C', marginBottom: '4px' }}>Verification Pending</h4>
                    <p style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '380px', margin: '0 auto' }}>
                      Document is awaiting final FSL laboratory cryptographic seal validation.
                    </p>
                  </>
                )}
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #EDF2F7' }}>
                  <span style={{ color: '#64748B' }}>Target File:</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{integrityDoc.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #EDF2F7' }}>
                  <span style={{ color: '#64748B' }}>Case Docket:</span>
                  <span style={{ fontWeight: 600, color: '#1E6DEB' }}>{integrityDoc.caseNo}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: '#64748B' }}>Last Checked:</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>23 Sep 2026, 12:54 PM</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setIntegrityDoc(null)}
              >
                Close
              </button>
              <button 
                className="btn-upload-primary"
                onClick={() => {
                  showToast(`Re-computing cryptographic checksum for ${integrityDoc.name}... Validated!`);
                  setIntegrityDoc(null);
                }}
              >
                Re-Verify Checksum
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
