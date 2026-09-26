import React, { useState, useEffect, useMemo } from 'react';
import { initialCourtFilingsData, courtFilingCategoryCounts } from '../data/courtFilingsData';
import { CourtFilingDetailModal, AddCourtFilingModal } from './CourtFilingModal';
import * as courtFilingsService from '../services/courtFilingsService';

export default function CourtFilingsPage({ 
  cases = [], 
  filings: propFilings,
  isLoading = false,
  onOpenCase, 
  showToast 
}) {
  // Court filings dataset state
  const [filings, setFilings] = useState(propFilings || initialCourtFilingsData);

  useEffect(() => {
    if (propFilings && propFilings.length > 0) {
      setFilings(propFilings);
    }
  }, [propFilings]);

  // Category filter state: 'all', 'plea', 'chargesheet', 'bail', 'evidence', 'courtorders', 'others'
  const [selectedCat, setSelectedCat] = useState('all');

  // Search & dropdown filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [caseFilter, setCaseFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [courtFilter, setCourtFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Selection checkbox state
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [inspectingFiling, setInspectingFiling] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // 7 Categories matching reference image
  const categories = [
    {
      id: 'all',
      label: 'All Filings',
      count: courtFilingCategoryCounts.all,
      colorClass: 'cf-icon-blue',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
          <path d="M12 2V6H16"/>
          <path d="M8 10H12M8 14H12"/>
        </svg>
      )
    },
    {
      id: 'plea',
      label: 'Plea / Application',
      count: courtFilingCategoryCounts.plea,
      colorClass: 'cf-icon-orange',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4L16 9L6 19H1V14L11 4Z"/>
          <path d="M13 2L18 7"/>
          <path d="M8 12h4"/>
        </svg>
      )
    },
    {
      id: 'chargesheet',
      label: 'Charge Sheet Filing',
      count: courtFilingCategoryCounts.chargeSheet,
      colorClass: 'cf-icon-purple',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
          <path d="M14 2v4h4"/>
          <path d="M7 10h6M7 13h4"/>
        </svg>
      )
    },
    {
      id: 'bail',
      label: 'Bail Application',
      count: courtFilingCategoryCounts.bail,
      colorClass: 'cf-icon-green',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v16M3 7l7-2 7 2M3 7l2 6h-4l2-6zm14 0l2 6h-4l2-6z"/>
        </svg>
      )
    },
    {
      id: 'evidence',
      label: 'Evidence Submission',
      count: courtFilingCategoryCounts.evidence,
      colorClass: 'cf-icon-amber',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z"/>
        </svg>
      )
    },
    {
      id: 'courtorders',
      label: 'Court Orders',
      count: courtFilingCategoryCounts.courtOrders,
      colorClass: 'cf-icon-rose',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 13l4 4M2 10l5-5 4 4-5 5-4-4zM11 6l3-3 3 3-3 3"/>
        </svg>
      )
    },
    {
      id: 'others',
      label: 'Others',
      count: courtFilingCategoryCounts.others,
      colorClass: 'cf-icon-slate',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
        </svg>
      )
    }
  ];

  // Helper for type badges
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Charge Sheet': return 'cf-type-chargesheet';
      case 'Bail Application': return 'cf-type-bail';
      case 'Evidence Submission': return 'cf-type-evidence';
      case 'Plea / Application': return 'cf-type-plea';
      case 'Court Order': return 'cf-type-courtorder';
      default: return 'cf-type-other';
    }
  };

  // Helper for status badges
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Filed': return 'cf-status-filed';
      case 'Under Review': return 'cf-status-under-review';
      case 'Accepted': return 'cf-status-accepted';
      case 'Hearing Scheduled': return 'cf-status-hearing-scheduled';
      case 'Closed': return 'cf-status-closed';
      default: return 'cf-status-filed';
    }
  };

  // Filter and sort logic
  const filteredFilings = useMemo(() => {
    let result = [...filings];

    // 1. Category tab filter
    if (selectedCat === 'plea') {
      result = result.filter(f => f.filingType === 'Plea / Application');
    } else if (selectedCat === 'chargesheet') {
      result = result.filter(f => f.filingType === 'Charge Sheet');
    } else if (selectedCat === 'bail') {
      result = result.filter(f => f.filingType === 'Bail Application');
    } else if (selectedCat === 'evidence') {
      result = result.filter(f => f.filingType === 'Evidence Submission');
    } else if (selectedCat === 'courtorders') {
      result = result.filter(f => f.filingType === 'Court Order');
    } else if (selectedCat === 'others') {
      result = result.filter(f => f.filingType === 'Other');
    }

    // 2. Search query filter (Filing Number, Case Number, Title, Type)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.id.toLowerCase().includes(q) ||
        f.caseNo.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.filingType.toLowerCase().includes(q) ||
        f.court.toLowerCase().includes(q)
      );
    }

    // 3. Dropdown: Case filter
    if (caseFilter !== 'All') {
      result = result.filter(f => f.caseNo === caseFilter);
    }

    // 4. Dropdown: Filing Type filter
    if (typeFilter !== 'All') {
      result = result.filter(f => f.filingType === typeFilter);
    }

    // 5. Dropdown: Status filter
    if (statusFilter !== 'All') {
      result = result.filter(f => f.status === statusFilter);
    }

    // 6. Dropdown: Court filter
    if (courtFilter !== 'All') {
      result = result.filter(f => f.court === courtFilter);
    }

    // 7. Sort
    if (sortBy === 'id-asc') {
      result.sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortBy === 'id-desc') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'hearing-asc') {
      result.sort((a, b) => {
        if (a.nextHearingDate === '—') return 1;
        if (b.nextHearingDate === '—') return -1;
        return a.nextHearingDate.localeCompare(b.nextHearingDate);
      });
    }

    return result;
  }, [filings, selectedCat, searchQuery, caseFilter, typeFilter, statusFilter, courtFilter, sortBy]);

  // Pagination slicing
  const totalItems = filteredFilings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentFilings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFilings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFilings, currentPage, itemsPerPage]);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(currentFilings.map(f => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllCurrentSelected = currentFilings.length > 0 && currentFilings.every(f => selectedIds.includes(f.id));

  // Quick download handler
  const handleQuickDownload = (filing) => {
    showToast(`Downloading court filing docket for ${filing.id}...`);
    const element = document.createElement("a");
    const file = new Blob([
      `DocShield Court Filing Record\n` +
      `====================================\n` +
      `Filing No: ${filing.id}\n` +
      `Case: ${filing.caseNo}\n` +
      `Type: ${filing.filingType}\n` +
      `Title: ${filing.title}\n` +
      `Court: ${filing.court}, ${filing.city}\n` +
      `Filed: ${filing.filedDate} ${filing.filedTime}\n` +
      `Next Hearing: ${filing.nextHearingDate} ${filing.nextHearingTime || ''}\n` +
      `Status: ${filing.status}\n` +
      `Digest: ${filing.hash || '8e43b1c67d1a5823c9b740ef82c5a0194871de99c3a0429f556b27d4c8ef128b'}\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${filing.id}_Docket.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAddNewFiling = async (newFiling) => {
    setFilings(prev => [newFiling, ...prev]);
    showToast(`Court Filing ${newFiling.id} registered and associated with Case ${newFiling.caseNo}.`);
    try {
      await courtFilingsService.createCourtFiling(newFiling);
    } catch (err) {
      console.warn('Persist filing notice:', err.message);
    }
  };

  return (
    <div className="courtfilings-page-container">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="courtfilings-page-header">
        <div className="courtfilings-header-left">
          <h1 className="courtfilings-title">Court Filings</h1>
          <p className="courtfilings-subtitle">Manage and track all court filings related to your cases.</p>
        </div>
        <button 
          className="btn-add-courtfiling-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z"/>
          </svg>
          + Add Court Filing
        </button>
      </div>

      {/* ========================================================
          2. CATEGORY SUMMARY STRIP (7 compact cards)
          ======================================================== */}
      <div className="courtfilings-category-strip">
        {categories.map((cat) => {
          const isActive = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              className={`cf-cat-card ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSelectedCat(cat.id);
                setCurrentPage(1);
              }}
            >
              <div className={`cf-cat-icon-box ${cat.colorClass}`}>
                {cat.icon}
              </div>
              <div className="cf-cat-text-block">
                <span className={`cf-cat-label ${isActive ? 'active' : ''}`}>{cat.label}</span>
                <span className="cf-cat-count">{cat.count}</span>
              </div>
              {isActive && <div className="cf-cat-active-line" />}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          3. SEARCH AND FILTER TOOLBAR
          ======================================================== */}
      <div className="courtfilings-filter-toolbar">
        {/* Search Bar */}
        <div className="courtfilings-search-box">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" color="#94A3B8">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by filing number, case number, title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Dropdowns Group */}
        <div className="courtfilings-controls-group">
          {/* All Cases */}
          <div className="cf-dropdown-select-wrap">
            <select
              className="cf-dropdown-select"
              value={caseFilter}
              onChange={(e) => { setCaseFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Cases</option>
              <option value="#2024-1768">#2024-1768</option>
              <option value="#2024-1654">#2024-1654</option>
              <option value="#2024-1432">#2024-1432</option>
              <option value="#2024-1287">#2024-1287</option>
              <option value="#2024-1102">#2024-1102</option>
              <option value="#2023-9845">#2023-9845</option>
              <option value="#2023-7765">#2023-7765</option>
              <option value="#2023-6654">#2023-6654</option>
            </select>
            <div className="cf-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* All Filing Types */}
          <div className="cf-dropdown-select-wrap">
            <select
              className="cf-dropdown-select"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Filing Types</option>
              <option value="Charge Sheet">Charge Sheet</option>
              <option value="Bail Application">Bail Application</option>
              <option value="Evidence Submission">Evidence Submission</option>
              <option value="Plea / Application">Plea / Application</option>
              <option value="Court Order">Court Order</option>
              <option value="Other">Other</option>
            </select>
            <div className="cf-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* All Status */}
          <div className="cf-dropdown-select-wrap">
            <select
              className="cf-dropdown-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Status</option>
              <option value="Filed">Filed</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Hearing Scheduled">Hearing Scheduled</option>
              <option value="Closed">Closed</option>
            </select>
            <div className="cf-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* All Courts */}
          <div className="cf-dropdown-select-wrap">
            <select
              className="cf-dropdown-select"
              value={courtFilter}
              onChange={(e) => { setCourtFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Courts</option>
              <option value="District Court">District Court</option>
              <option value="Sessions Court">Sessions Court</option>
              <option value="Special Court (NDPS)">Special Court (NDPS)</option>
              <option value="Metropolitan Court">Metropolitan Court</option>
              <option value="Family Court">Family Court</option>
            </select>
            <div className="cf-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* Sort by */}
          <div className="cf-sort-wrap">
            <div className="cf-sort-icon-prefix">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .354.854L9 7.207V13.5a.5.5 0 0 1-.707.447l-2-1A.5.5 0 0 1 6 12.5V7.207L1.646 1.854A.5.5 0 0 1 1.5 1.5z"/>
              </svg>
            </div>
            <select
              className="cf-dropdown-select cf-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort by</option>
              <option value="id-asc">Filing No (Asc)</option>
              <option value="id-desc">Filing No (Desc)</option>
              <option value="hearing-asc">Next Hearing</option>
            </select>
            <div className="cf-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN COURT FILINGS TABLE CONTAINER
          ======================================================== */}
      <div className="courtfilings-table-card">
        <table className="main-courtfilings-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  className="cf-checkbox"
                  checked={isAllCurrentSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>
                <span className="cf-sort-col-header" onClick={() => setSortBy(prev => prev === 'id-asc' ? 'id-desc' : 'id-asc')}>
                  Filing No.
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="cf-sort-col-header">
                  Case No.
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="cf-sort-col-header">
                  Filing Type
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th>Title / Description</th>
              <th>
                <span className="cf-sort-col-header">
                  Filed On
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="cf-sort-col-header">
                  Court
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="cf-sort-col-header" onClick={() => setSortBy('hearing-asc')}>
                  Next Hearing
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="cf-sort-col-header">
                  Status
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentFilings.map((filing) => {
              const isSelected = selectedIds.includes(filing.id);
              const isMenuOpen = activeMenuId === filing.id;

              return (
                <tr key={filing.id} className="courtfilings-tr">
                  {/* Selection Checkbox */}
                  <td>
                    <input
                      type="checkbox"
                      className="cf-checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(filing.id)}
                    />
                  </td>

                  {/* Filing No. (Clickable blue link) */}
                  <td>
                    <span
                      className="cf-id-link"
                      onClick={() => setInspectingFiling(filing)}
                    >
                      {filing.id}
                    </span>
                  </td>

                  {/* Case No. (Clickable blue link) */}
                  <td>
                    <span
                      className="cf-case-link"
                      onClick={() => onOpenCase(filing.caseNo)}
                    >
                      {filing.caseNo}
                    </span>
                  </td>

                  {/* Filing Type Badge */}
                  <td>
                    <span className={`cf-type-badge ${getTypeBadgeClass(filing.filingType)}`}>
                      {filing.filingType}
                    </span>
                  </td>

                  {/* Title / Description */}
                  <td>
                    <span className="cf-title-text">{filing.title}</span>
                  </td>

                  {/* Filed On (Date & Time) */}
                  <td>
                    <div className="cf-two-line-cell">
                      <span className="cf-primary-meta">{filing.filedDate}</span>
                      <span className="cf-secondary-meta">{filing.filedTime}</span>
                    </div>
                  </td>

                  {/* Court (Pin icon + Court & City) */}
                  <td>
                    <div className="cf-court-cell">
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0a5 5 0 0 0-5 5c0 3.75 5 11 5 11s5-7.25 5-11a5 5 0 0 0-5-5zm0 7.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                      </svg>
                      <div className="cf-two-line-cell">
                        <span className="cf-primary-meta">{filing.court}</span>
                        <span className="cf-secondary-meta">{filing.city}</span>
                      </div>
                    </div>
                  </td>

                  {/* Next Hearing (Date & Time or '—') */}
                  <td>
                    {filing.nextHearingDate !== '—' ? (
                      <div className="cf-two-line-cell">
                        <span className="cf-primary-meta">{filing.nextHearingDate}</span>
                        <span className="cf-secondary-meta">{filing.nextHearingTime}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>—</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span className={`cf-status-badge ${getStatusBadgeClass(filing.status)}`}>
                      {filing.status}
                    </span>
                  </td>

                  {/* Action Icons */}
                  <td>
                    <div className="cf-action-group">
                      {/* View Filing (Eye) */}
                      <button
                        className="cf-action-btn"
                        title="View Filing"
                        onClick={() => setInspectingFiling(filing)}
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                        </svg>
                      </button>

                      {/* Download Filing */}
                      <button
                        className="cf-action-btn"
                        title="Download Filing"
                        onClick={() => handleQuickDownload(filing)}
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                        </svg>
                      </button>

                      {/* More Actions (•••) */}
                      <button
                        className="cf-action-btn"
                        title="More Actions"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : filing.id)}
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="cf-more-menu" onMouseLeave={() => setActiveMenuId(null)}>
                          <button
                            className="cf-menu-item"
                            onClick={() => { setActiveMenuId(null); setInspectingFiling(filing); }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            </svg>
                            View Details
                          </button>
                          <button
                            className="cf-menu-item"
                            onClick={() => { setActiveMenuId(null); handleQuickDownload(filing); }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                            </svg>
                            Download
                          </button>
                          <button
                            className="cf-menu-item"
                            onClick={() => { setActiveMenuId(null); onOpenCase(filing.caseNo); }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2z"/>
                            </svg>
                            View Case
                          </button>
                          <button
                            className="cf-menu-item"
                            onClick={() => {
                              setActiveMenuId(null);
                              showToast(`Accessing related judicial evidence for case ${filing.caseNo}...`);
                            }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"/>
                            </svg>
                            View Related Documents
                          </button>
                          <button
                            className="cf-menu-item"
                            onClick={() => {
                              setActiveMenuId(null);
                              showToast(`Audit history retrieved for ${filing.id}. All cryptographic seals verified.`);
                            }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                            </svg>
                            View Audit History
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {currentFilings.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 16px', color: '#64748B' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>No court filings match your search criteria.</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>Try resetting your filters or search keywords.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================
          5. PAGINATION (Exact match to reference image)
          ======================================================== */}
      <div className="table-pagination" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '16px',
        padding: '8px 4px'
      }}>
        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
          Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} court filings
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

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
      {inspectingFiling && (
        <CourtFilingDetailModal
          filing={inspectingFiling}
          onClose={() => setInspectingFiling(null)}
          onOpenCase={onOpenCase}
          showToast={showToast}
        />
      )}

      {isAddModalOpen && (
        <AddCourtFilingModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddNewFiling}
          showToast={showToast}
        />
      )}
    </div>
  );
}
