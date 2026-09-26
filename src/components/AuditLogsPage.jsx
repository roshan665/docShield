import React, { useState, useEffect, useMemo } from 'react';
import { initialAuditLogsData, auditCategoryCounts } from '../data/auditLogsData';
import { AuditLogDetailModal, ExportLogsModal } from './AuditLogModal';

export default function AuditLogsPage({ 
  logs: propLogs,
  isLoading = false,
  onOpenCase, 
  showToast 
}) {
  // Audit logs data state
  const [logs, setLogs] = useState(propLogs || initialAuditLogsData);

  useEffect(() => {
    if (propLogs && propLogs.length > 0) {
      setLogs(propLogs);
    }
  }, [propLogs]);

  // Category filter state: 'all', 'case', 'document', 'evidence', 'user', 'security'
  const [selectedCat, setSelectedCat] = useState('all');

  // Search & dropdown filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRangeFilter, setDateRangeFilter] = useState('All Time');
  const [sortBy, setSortBy] = useState('default');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [inspectingLog, setInspectingLog] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Summary categories matching specifications
  const categories = [
    {
      id: 'all',
      label: 'All Activities',
      count: auditCategoryCounts.all,
      colorClass: 'audit-icon-blue',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      )
    },
    {
      id: 'case',
      label: 'Case Activities',
      count: auditCategoryCounts.case,
      colorClass: 'audit-icon-indigo',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      id: 'document',
      label: 'Document Activities',
      count: auditCategoryCounts.document,
      colorClass: 'audit-icon-orange',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      )
    },
    {
      id: 'evidence',
      label: 'Evidence Activities',
      count: auditCategoryCounts.evidence,
      colorClass: 'audit-icon-green',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      )
    },
    {
      id: 'user',
      label: 'User Activities',
      count: auditCategoryCounts.user,
      colorClass: 'audit-icon-purple',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    {
      id: 'security',
      label: 'Security Events',
      count: auditCategoryCounts.security,
      colorClass: 'audit-icon-rose',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="14" height="8" rx="2"/>
          <path d="M7 11V7a3 3 0 0 1 6 0v4"/>
        </svg>
      )
    }
  ];

  // Helper for action icons
  const renderActionIcon = (action) => {
    const act = action.toLowerCase();
    if (act.includes('view')) {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
        </svg>
      );
    }
    if (act.includes('upload')) {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
        </svg>
      );
    }
    if (act.includes('transfer')) {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
        </svg>
      );
    }
    if (act.includes('edit') || act.includes('update')) {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
        </svg>
      );
    }
    if (act.includes('submit')) {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.8 14.5a.5.5 0 0 1-.928.008l-3.26-6.52L.456 6.414a.5.5 0 0 1 .008-.928L14.964.036a.5.5 0 0 1 .89.11z"/>
        </svg>
      );
    }
    if (act.includes('login')) {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
        </svg>
      );
    }
    if (act.includes('verify') || act.includes('check')) {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l4.992-5.99a.75.75 0 0 0-.01-1.05z"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 16 16" fill="currentColor">
        <circle cx="8" cy="8" r="6"/>
      </svg>
    );
  };

  // Filter and sort logic
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // 1. Summary strip filter
    if (selectedCat !== 'all') {
      result = result.filter(l => l.categoryFilter === selectedCat);
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.id.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.recordId.toLowerCase().includes(q) ||
        l.caseNo.toLowerCase().includes(q) ||
        l.module.toLowerCase().includes(q)
      );
    }

    // 3. Dropdown: Module filter
    if (moduleFilter !== 'All') {
      result = result.filter(l => l.module === moduleFilter);
    }

    // 4. Dropdown: Action filter
    if (actionFilter !== 'All') {
      result = result.filter(l => l.action === actionFilter);
    }

    // 5. Dropdown: User filter
    if (userFilter !== 'All') {
      result = result.filter(l => l.actor === userFilter);
    }

    // 6. Dropdown: Status filter
    if (statusFilter !== 'All') {
      result = result.filter(l => l.status === statusFilter);
    }

    // 7. Dropdown: Date Range filter
    if (dateRangeFilter === 'Jan 2024') {
      result = result.filter(l => l.timestampDate.includes('Jan 2024'));
    } else if (dateRangeFilter === 'Dec 2023') {
      result = result.filter(l => l.timestampDate.includes('Dec 2023'));
    }

    // 8. Sort
    if (sortBy === 'id-asc') {
      result.sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortBy === 'id-desc') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'time-oldest') {
      result.reverse();
    }

    return result;
  }, [logs, selectedCat, searchQuery, moduleFilter, actionFilter, userFilter, statusFilter, dateRangeFilter, sortBy]);

  // Pagination calculation
  const totalItems = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const handleRefresh = () => {
    showToast('Audit log stream synchronized. All cryptographic telemetry up to date.');
  };

  return (
    <div className="auditlogs-page-container">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="auditlogs-page-header">
        <div className="auditlogs-header-left">
          <h1 className="auditlogs-title">Audit Logs</h1>
          <p className="auditlogs-subtitle">Track and review activities across your investigation records.</p>
        </div>
        <div className="auditlogs-header-actions">
          <button 
            className="btn-refresh-audit"
            onClick={handleRefresh}
            title="Refresh Audit Telemetry"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            Refresh
          </button>
          <button 
            className="btn-export-logs-primary"
            onClick={() => setIsExportModalOpen(true)}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Export Logs
          </button>
        </div>
      </div>

      {/* ========================================================
          2. COMPACT SUMMARY STRIP (6 compact cards)
          ======================================================== */}
      <div className="auditlogs-category-strip">
        {categories.map((cat) => {
          const isActive = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              className={`audit-cat-card ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSelectedCat(cat.id);
                setCurrentPage(1);
              }}
            >
              <div className={`audit-cat-icon-box ${cat.colorClass}`}>
                {cat.icon}
              </div>
              <div className="audit-cat-text-block">
                <span className={`audit-cat-label ${isActive ? 'active' : ''}`}>{cat.label}</span>
                <span className="audit-cat-count">{cat.count}</span>
              </div>
              {isActive && <div className="audit-cat-active-line" />}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          3. SEARCH AND FILTER TOOLBAR
          ======================================================== */}
      <div className="auditlogs-filter-toolbar">
        {/* Search Input */}
        <div className="auditlogs-search-box">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" color="#94A3B8">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by action, user, case number, record ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Dropdowns Group */}
        <div className="auditlogs-controls-group">
          {/* All Modules */}
          <div className="audit-dropdown-select-wrap">
            <select
              className="audit-dropdown-select"
              value={moduleFilter}
              onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Modules</option>
              <option value="Cases">Cases</option>
              <option value="Documents">Documents</option>
              <option value="Chain of Custody">Chain of Custody</option>
              <option value="Forensic Reports">Forensic Reports</option>
              <option value="Charge Sheets">Charge Sheets</option>
              <option value="Court Filings">Court Filings</option>
              <option value="Evidence">Evidence</option>
              <option value="Authentication">Authentication</option>
            </select>
            <div className="audit-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* All Actions */}
          <div className="audit-dropdown-select-wrap">
            <select
              className="audit-dropdown-select"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Actions</option>
              <option value="Viewed Case">Viewed Case</option>
              <option value="Uploaded Document">Uploaded Document</option>
              <option value="Evidence Transferred">Evidence Transferred</option>
              <option value="Forensic Report Viewed">Forensic Report Viewed</option>
              <option value="Charge Sheet Updated">Charge Sheet Updated</option>
              <option value="Court Filing Submitted">Court Filing Submitted</option>
              <option value="Login">Login</option>
              <option value="Evidence Verification">Evidence Verification</option>
            </select>
            <div className="audit-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* All Users */}
          <div className="audit-dropdown-select-wrap">
            <select
              className="audit-dropdown-select"
              value={userFilter}
              onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Users</option>
              <option value="Inspector R. Sharma">Inspector R. Sharma</option>
              <option value="Inspector A. Khan">Inspector A. Khan</option>
              <option value="Inspector P. Singh">Inspector P. Singh</option>
              <option value="Forensic Analyst S. Verma">Forensic Analyst S. Verma</option>
            </select>
            <div className="audit-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* All Status */}
          <div className="audit-dropdown-select-wrap">
            <select
              className="audit-dropdown-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Warning">Warning</option>
            </select>
            <div className="audit-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* Date Range */}
          <div className="audit-dropdown-select-wrap">
            <select
              className="audit-dropdown-select"
              value={dateRangeFilter}
              onChange={(e) => { setDateRangeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All Time">Date Range: All</option>
              <option value="Jan 2024">Jan 2024</option>
              <option value="Dec 2023">Dec 2023</option>
            </select>
            <div className="audit-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* Sort by */}
          <div className="audit-sort-wrap">
            <div className="audit-sort-icon-prefix">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .354.854L9 7.207V13.5a.5.5 0 0 1-.707.447l-2-1A.5.5 0 0 1 6 12.5V7.207L1.646 1.854A.5.5 0 0 1 1.5 1.5z"/>
              </svg>
            </div>
            <select
              className="audit-dropdown-select audit-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort by</option>
              <option value="id-asc">Event ID (Asc)</option>
              <option value="id-desc">Event ID (Desc)</option>
              <option value="time-oldest">Timestamp (Oldest)</option>
            </select>
            <div className="audit-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN AUDIT LOGS TABLE CONTAINER
          ======================================================== */}
      <div className="auditlogs-table-card">
        <div className="auditlogs-table-header-strip">
          <div className="auditlogs-table-heading">Activity History</div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            FIPS 180-4 SHA-256 Validated • Append-Only Ledger
          </div>
        </div>

        <table className="main-auditlogs-table">
          <thead>
            <tr>
              <th>
                <span className="audit-sort-col-header" onClick={() => setSortBy(prev => prev === 'id-asc' ? 'id-desc' : 'id-asc')}>
                  Event ID
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th>Timestamp</th>
              <th>User / Actor</th>
              <th>Action</th>
              <th>Module</th>
              <th>Record ID</th>
              <th>Case No.</th>
              <th>IP / Device</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Action Menu</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log) => {
              const isMenuOpen = activeMenuId === log.id;

              return (
                <tr key={log.id} className="auditlogs-tr">
                  {/* Event ID */}
                  <td>
                    <span 
                      className="audit-id-link"
                      onClick={() => setInspectingLog(log)}
                    >
                      {log.id}
                    </span>
                  </td>

                  {/* Timestamp (2 lines) */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#334155', fontSize: '12px' }}>{log.timestampDate}</span>
                      <span style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>{log.timestampTime}</span>
                    </div>
                  </td>

                  {/* User / Actor */}
                  <td>
                    <span className="audit-actor-text">{log.actor}</span>
                  </td>

                  {/* Action with Icon */}
                  <td>
                    <span className="audit-action-cell">
                      {renderActionIcon(log.action)}
                      {log.action}
                    </span>
                  </td>

                  {/* Module */}
                  <td>
                    <span className="audit-module-badge">{log.module}</span>
                  </td>

                  {/* Record ID */}
                  <td>
                    <span className="audit-record-text">{log.recordId}</span>
                  </td>

                  {/* Case No. */}
                  <td>
                    {log.caseNo !== '—' ? (
                      <span 
                        className="audit-case-link"
                        onClick={() => onOpenCase(log.caseNo)}
                      >
                        {log.caseNo}
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>—</span>
                    )}
                  </td>

                  {/* IP / Device (2 lines) */}
                  <td>
                    <div className="audit-device-cell">
                      <span className="audit-ip-text">{log.ip}</span>
                      <span className="audit-os-text">{log.device}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span className={`audit-status-badge ${
                      log.status === 'Success' ? 'audit-status-success' :
                      log.status === 'Failed' ? 'audit-status-failed' : 'audit-status-warning'
                    }`}>
                      {log.status}
                    </span>
                  </td>

                  {/* Action Menu */}
                  <td>
                    <div className="audit-action-group">
                      {/* View Details Eye Icon */}
                      <button
                        className="audit-action-btn"
                        title="View Details"
                        onClick={() => setInspectingLog(log)}
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                        </svg>
                      </button>

                      {/* More actions (•••) */}
                      <button
                        className="audit-action-btn"
                        title="More Actions"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : log.id)}
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="audit-more-menu" onMouseLeave={() => setActiveMenuId(null)}>
                          <button
                            className="audit-menu-item"
                            onClick={() => { setActiveMenuId(null); setInspectingLog(log); }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            </svg>
                            View Details
                          </button>
                          {log.caseNo !== '—' && (
                            <button
                              className="audit-menu-item"
                              onClick={() => { setActiveMenuId(null); onOpenCase(log.caseNo); }}
                            >
                              <svg viewBox="0 0 16 16" fill="currentColor">
                                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2z"/>
                              </svg>
                              View Case
                            </button>
                          )}
                          <button
                            className="audit-menu-item"
                            onClick={() => {
                              setActiveMenuId(null);
                              navigator.clipboard.writeText(log.hash);
                              showToast(`Telemetry hash copied: ${log.hash.slice(0, 16)}...`);
                            }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                            </svg>
                            Copy SHA-256 Hash
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {currentLogs.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 16px', color: '#64748B' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>No audit logs match your search criteria.</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>Try resetting your filters or search terms.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================
          5. PAGINATION (Exact match to specifications)
          ======================================================== */}
      <div className="table-pagination" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '16px',
        padding: '8px 4px'
      }}>
        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
          Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} activities
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Previous Page */}
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{
              padding: '6px 10px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              color: currentPage === 1 ? '#CBD5E1' : '#64748B',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            &lt;
          </button>

          {/* Page numbers: 1 to 5 */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: pageNum === currentPage ? 'none' : '1px solid #E2E8F0',
                backgroundColor: pageNum === currentPage ? '#1E6DEB' : '#FFFFFF',
                color: pageNum === currentPage ? '#FFFFFF' : '#334155',
                fontWeight: pageNum === currentPage ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Page */}
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{
              padding: '6px 10px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              color: currentPage === totalPages ? '#CBD5E1' : '#64748B',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* ========================================================
          6. MODALS
          ======================================================== */}
      {inspectingLog && (
        <AuditLogDetailModal
          log={inspectingLog}
          onClose={() => setInspectingLog(null)}
          onOpenCase={onOpenCase}
          showToast={showToast}
        />
      )}

      {isExportModalOpen && (
        <ExportLogsModal
          logs={filteredLogs}
          onClose={() => setIsExportModalOpen(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
