import React, { useState, useMemo } from 'react';

export default function CasesPage({ cases, isLoading = false, onOpenCase, onAddNewCase, onUploadDoc, onLogEvidence, showToast }) {
  // State for search, filters, sorting, and pagination
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'Active', 'Under Review', 'Closed'
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'DEFAULT', 'CASE_NO', 'SECTION', 'ASSIGNED_DATE', 'LAST_UPDATED'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpenCaseId, setMenuOpenCaseId] = useState(null);
  const pageSize = 8;

  // Status counts based on all cases
  const statusCounts = useMemo(() => {
    let total = cases.length;
    let active = cases.filter(c => c.status === 'Active').length;
    let review = cases.filter(c => c.status === 'Under Review').length;
    let closed = cases.filter(c => c.status === 'Closed').length;
    return { total, active, review, closed };
  }, [cases]);

  // Unique sections list for dropdown
  const sectionsList = useMemo(() => {
    const set = new Set(cases.map(c => c.section.split(' - ')[0]));
    return Array.from(set);
  }, [cases]);

  // Handle column header sort click
  const handleSortClick = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Filter & sort pipeline
  const filteredCases = useMemo(() => {
    let list = [...cases];

    // Filter by Top Status Tab
    if (activeTab === 'Active') {
      list = list.filter(c => c.status === 'Active');
    } else if (activeTab === 'Under Review') {
      list = list.filter(c => c.status === 'Under Review');
    } else if (activeTab === 'Closed') {
      list = list.filter(c => c.status === 'Closed');
    }

    // Filter by Dropdown Status
    if (statusFilter !== 'ALL') {
      list = list.filter(c => c.status === statusFilter);
    }

    // Filter by Dropdown Section
    if (sectionFilter !== 'ALL') {
      list = list.filter(c => c.section.startsWith(sectionFilter));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.id.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q) ||
        (c.complainant && c.complainant.toLowerCase().includes(q)) ||
        (c.summary && c.summary.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'CASE_NO') {
      list.sort((a, b) => sortDirection === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id));
    } else if (sortBy === 'SECTION') {
      list.sort((a, b) => sortDirection === 'asc' ? a.section.localeCompare(b.section) : b.section.localeCompare(a.section));
    } else if (sortBy === 'STATUS') {
      list.sort((a, b) => sortDirection === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status));
    } else if (sortBy === 'ASSIGNED_DATE') {
      list.sort((a, b) => sortDirection === 'asc' ? a.assignedDate.localeCompare(b.assignedDate) : b.assignedDate.localeCompare(a.assignedDate));
    } else if (sortBy === 'LAST_UPDATED') {
      list.sort((a, b) => sortDirection === 'asc' ? a.lastUpdated.localeCompare(b.lastUpdated) : b.lastUpdated.localeCompare(a.lastUpdated));
    }

    return list;
  }, [cases, activeTab, statusFilter, sectionFilter, searchQuery, sortBy, sortDirection]);

  // Pagination calculation
  const totalCasesCount = filteredCases.length;
  const totalPages = Math.ceil(totalCasesCount / pageSize) || 1;
  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCases.slice(startIndex, startIndex + pageSize);
  }, [filteredCases, currentPage, pageSize]);

  return (
    <div className="cases-page-container">
      
      {/* ====================================================
           1. PAGE HEADER (Title, Subtitle, + Add New Case)
           ==================================================== */}
      <div className="cases-page-header">
        <div className="cases-header-left">
          <h1 className="cases-title">Cases</h1>
          <p className="cases-subtitle">View and manage your assigned cases.</p>
        </div>
        <div className="cases-header-right">
          <button className="btn-add-case-primary" onClick={onAddNewCase}>
            <span className="plus-icon">+</span>
            <span>Add New Case</span>
          </button>
        </div>
      </div>


      {/* ====================================================
           2. STATUS SUMMARY TABS & FILTER BAR (Same Row)
           ==================================================== */}
      <div className="cases-filter-toolbar">
        
        {/* Left: 4 Horizontal Status Summary Tabs */}
        <div className="status-summary-tabs">
          
          {/* Tab 1: All Cases */}
          <button 
            className={`status-tab ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => { setActiveTab('ALL'); setCurrentPage(1); }}
          >
            <div className="tab-icon-wrap blue-doc">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
                <path d="M12 2V6H16"/>
                <path d="M8 10H12M8 14H12"/>
              </svg>
            </div>
            <div className="tab-text-block">
              <span className="tab-label">All Cases</span>
              <span className="tab-count">{statusCounts.total}</span>
            </div>
            {activeTab === 'ALL' && <span className="tab-active-indicator"></span>}
          </button>

          {/* Tab 2: Active */}
          <button 
            className={`status-tab ${activeTab === 'Active' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Active'); setCurrentPage(1); }}
          >
            <span className="status-indicator-dot dot-green"></span>
            <div className="tab-text-block">
              <span className="tab-label">Active</span>
              <span className="tab-count">{statusCounts.active}</span>
            </div>
            {activeTab === 'Active' && <span className="tab-active-indicator"></span>}
          </button>

          {/* Tab 3: Under Review */}
          <button 
            className={`status-tab ${activeTab === 'Under Review' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Under Review'); setCurrentPage(1); }}
          >
            <span className="status-indicator-dot dot-blue"></span>
            <div className="tab-text-block">
              <span className="tab-label">Under Review</span>
              <span className="tab-count">{statusCounts.review}</span>
            </div>
            {activeTab === 'Under Review' && <span className="tab-active-indicator"></span>}
          </button>

          {/* Tab 4: Closed */}
          <button 
            className={`status-tab ${activeTab === 'Closed' ? 'active' : ''}`}
            onClick={() => { setActiveTab('Closed'); setCurrentPage(1); }}
          >
            <span className="status-indicator-dot dot-red"></span>
            <div className="tab-text-block">
              <span className="tab-label">Closed</span>
              <span className="tab-count">{statusCounts.closed}</span>
            </div>
            {activeTab === 'Closed' && <span className="tab-active-indicator"></span>}
          </button>

        </div>

        {/* Right: Search Input & 3 Dropdowns */}
        <div className="cases-controls-group">
          
          {/* Search Field */}
          <div className="cases-search-box">
            <svg className="search-icon-svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="6"/>
              <path d="M13.5 13.5L17.5 17.5"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search by case number, section, keyword..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>

          {/* Dropdown 1: All Sections */}
          <div className="custom-select-wrap">
            <select 
              value={sectionFilter} 
              onChange={(e) => { setSectionFilter(e.target.value); setCurrentPage(1); }}
              className="toolbar-select"
            >
              <option value="ALL">All Sections</option>
              {sectionsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <svg className="select-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>

          {/* Dropdown 2: All Status */}
          <div className="custom-select-wrap">
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="toolbar-select"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Closed">Closed</option>
            </select>
            <svg className="select-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>

          {/* Dropdown 3: Sort By */}
          <div className="custom-select-wrap sort-select-wrap">
            <svg className="sort-icon-svg" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="5" x2="15" y2="5"/>
              <line x1="5" y1="9" x2="13" y2="9"/>
              <line x1="7" y1="13" x2="11" y2="13"/>
            </svg>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="toolbar-select with-icon"
            >
              <option value="DEFAULT">Sort by</option>
              <option value="LAST_UPDATED">Last Updated</option>
              <option value="ASSIGNED_DATE">Assigned Date</option>
              <option value="CASE_NO">Case Number</option>
              <option value="SECTION">Section</option>
            </select>
            <svg className="select-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6L8 10L12 6"/>
            </svg>
          </div>

        </div>

      </div>


      {/* ====================================================
           3. MAIN CASE TABLE CARD
           ==================================================== */}
      <div className="cases-table-card">
        <div className="table-responsive-container">
          <table className="main-cases-table">
            <thead>
              <tr>
                <th className="th-sortable" onClick={() => handleSortClick('CASE_NO')}>
                  <span>Case No.</span>
                  <span className="sort-double-arrow">↕</span>
                </th>
                <th className="th-sortable" onClick={() => handleSortClick('SECTION')}>
                  <span>Type / Section</span>
                  <span className="sort-double-arrow">↕</span>
                </th>
                <th className="th-sortable" onClick={() => handleSortClick('STATUS')}>
                  <span>Status</span>
                  <span className="sort-double-arrow">↕</span>
                </th>
                <th className="th-sortable" onClick={() => handleSortClick('ASSIGNED_DATE')}>
                  <span>Assigned Date</span>
                  <span className="sort-double-arrow">↕</span>
                </th>
                <th className="th-sortable" onClick={() => handleSortClick('LAST_UPDATED')}>
                  <span>Last Updated</span>
                  <span className="sort-double-arrow">↕</span>
                </th>
                <th>
                  <span>Documents</span>
                </th>
                <th>
                  <span>Evidence</span>
                </th>
                <th className="th-action">
                  <span>Action</span>
                </th>
                <th className="th-row-menu"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.length > 0 ? (
                paginatedCases.map((c) => (
                  <tr key={c.id} className="cases-tr">
                    <td className="td-case-no">
                      <span className="case-number-link" onClick={() => onOpenCase(c.id)}>
                        {c.id}
                      </span>
                    </td>
                    <td className="td-section">
                      {c.section}
                    </td>
                    <td className="td-status">
                      <span className={`case-status-badge ${
                        c.status === 'Active' ? 'badge-active' :
                        c.status === 'Under Review' ? 'badge-review' : 'badge-closed'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="td-date">
                      {c.assignedDate}
                    </td>
                    <td className="td-date">
                      {c.lastUpdated}
                    </td>
                    <td className="td-count">
                      <div className="count-pill">
                        <svg className="cell-doc-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-8.5l-3.5-3.5z"/>
                          <path d="M10 1.5V5h3.5"/>
                        </svg>
                        <span>{c.documentsCount}</span>
                      </div>
                    </td>
                    <td className="td-count">
                      <div className="count-pill">
                        <svg className="cell-evid-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="8" cy="8" r="6"/>
                          <circle cx="8" cy="8" r="3"/>
                          <circle cx="8" cy="8" r="1"/>
                        </svg>
                        <span>{c.evidenceCount}</span>
                      </div>
                    </td>
                    <td className="td-action">
                      <button className="btn-table-open" onClick={() => onOpenCase(c.id)}>
                        Open
                      </button>
                    </td>
                    <td className="td-row-menu">
                      <button 
                        className="row-menu-dots-btn" 
                        title="More options"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenCaseId(menuOpenCaseId === c.id ? null : c.id);
                        }}
                      >
                        •••
                      </button>

                      {menuOpenCaseId === c.id && (
                        <div className="floating-row-popup" onClick={(e) => e.stopPropagation()}>
                          <button className="popup-item" onClick={() => { onOpenCase(c.id); setMenuOpenCaseId(null); }}>
                            Open Case Cockpit
                          </button>
                          <button className="popup-item" onClick={() => { 
                            if (onUploadDoc) onUploadDoc(c.id); 
                            else showToast?.(`Ready to upload document for ${c.id}`); 
                            setMenuOpenCaseId(null); 
                          }}>
                            Upload Document
                          </button>
                          <button className="popup-item" onClick={() => { 
                            if (onLogEvidence) onLogEvidence(c.id); 
                            else showToast?.(`Ready to log evidence for ${c.id}`); 
                            setMenuOpenCaseId(null); 
                          }}>
                            Log Evidence
                          </button>
                          <button className="popup-item" onClick={() => { 
                            showToast?.(`Exported certified digital case dossier for ${c.id} with SHA-256 seal.`); 
                            setMenuOpenCaseId(null); 
                          }}>
                            Export Certified Dossier
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : isLoading ? (
                <tr>
                  <td colSpan="9" className="td-empty-results">
                    <p style={{ color: '#1E6DEB', fontWeight: 600 }}>Loading investigation cases from DocShield database...</p>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="9" className="td-empty-results">
                    <p>No investigation cases found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ====================================================
             4. PAGINATION FOOTER (Inside Card)
             ==================================================== */}
        <div className="cases-pagination-bar">
          <div className="pagination-info">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCasesCount)} of {totalCasesCount} cases
          </div>

          <div className="pagination-controls">
            <button 
              className="page-nav-btn prev-btn" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button 
                key={pageNum}
                className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button 
              className="page-nav-btn next-btn" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
