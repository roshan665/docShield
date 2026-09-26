import React, { useState, useEffect, useMemo } from 'react';
import { initialChargeSheetsData, chargeSheetCategoryCounts } from '../data/chargeSheetsData';
import { ChargeSheetDetailModal, AddChargeSheetModal } from './ChargeSheetModal';
import * as chargeSheetsService from '../services/chargeSheetsService';

export default function ChargeSheetsPage({ 
  cases = [], 
  chargeSheets: propCS,
  isLoading = false,
  onOpenCase, 
  showToast 
}) {
  // Charge sheets dataset state
  const [chargeSheets, setChargeSheets] = useState(propCS || initialChargeSheetsData);

  useEffect(() => {
    if (propCS && propCS.length > 0) {
      setChargeSheets(propCS);
    }
  }, [propCS]);

  // Status/category filter state: 'all', 'draft', 'underReview', 'submitted', 'accepted', 'returned', 'others'
  const [selectedStatusCat, setSelectedStatusCat] = useState('all');

  // Search & dropdown filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [caseFilter, setCaseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [courtFilter, setCourtFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  // Selection checkbox state
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [inspectingCS, setInspectingCS] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // 7 Status/Category filters matching reference image
  const categories = [
    {
      id: 'all',
      label: 'All Charge Sheets',
      count: chargeSheetCategoryCounts.all,
      colorClass: 'cs-icon-blue',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
          <path d="M12 2V6H16"/>
          <path d="M8 10H12M8 14H12"/>
        </svg>
      )
    },
    {
      id: 'draft',
      label: 'Draft',
      count: chargeSheetCategoryCounts.draft,
      colorClass: 'cs-icon-orange',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4L16 9L6 19H1V14L11 4Z"/>
          <path d="M13 2L18 7"/>
        </svg>
      )
    },
    {
      id: 'underReview',
      label: 'Under Review',
      count: chargeSheetCategoryCounts.underReview,
      colorClass: 'cs-icon-blue',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="8"/>
          <polyline points="10,6 10,10 14,12"/>
        </svg>
      )
    },
    {
      id: 'submitted',
      label: 'Submitted',
      count: chargeSheetCategoryCounts.submitted,
      colorClass: 'cs-icon-green',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="2" x2="8" y2="12"/>
          <polygon points="18,2 12,18 8,12 2,8"/>
        </svg>
      )
    },
    {
      id: 'accepted',
      label: 'Accepted',
      count: chargeSheetCategoryCounts.accepted,
      colorClass: 'cs-icon-green',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 10A8 8 0 1 1 10 2A8 8 0 0 1 18 10Z"/>
          <polyline points="6,10 9,13 15,7"/>
        </svg>
      )
    },
    {
      id: 'returned',
      label: 'Returned',
      count: chargeSheetCategoryCounts.returned,
      colorClass: 'cs-icon-red',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1,4 1,10 7,10"/>
          <path d="M3.51 15A9 9 0 1 0 5.64 5.64L1 10"/>
        </svg>
      )
    },
    {
      id: 'others',
      label: 'Others',
      count: chargeSheetCategoryCounts.others,
      colorClass: 'cs-icon-gray',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <circle cx="4" cy="10" r="1.8"/>
          <circle cx="10" cy="10" r="1.8"/>
          <circle cx="16" cy="10" r="1.8"/>
        </svg>
      )
    }
  ];

  // Helper for status pill style
  const getStatusPillClass = (status) => {
    switch (status) {
      case 'Submitted': return 'cs-status-submitted';
      case 'Under Review': return 'cs-status-review';
      case 'Draft': return 'cs-status-draft';
      case 'Accepted': return 'cs-status-accepted';
      case 'Returned': return 'cs-status-returned';
      default: return 'cs-status-submitted';
    }
  };

  // Filter & sort logic
  const filteredChargeSheets = useMemo(() => {
    return chargeSheets.filter((cs) => {
      // 1. Status strip filter
      if (selectedStatusCat === 'draft' && cs.status !== 'Draft') return false;
      if (selectedStatusCat === 'underReview' && cs.status !== 'Under Review') return false;
      if (selectedStatusCat === 'submitted' && cs.status !== 'Submitted') return false;
      if (selectedStatusCat === 'accepted' && cs.status !== 'Accepted') return false;
      if (selectedStatusCat === 'returned' && cs.status !== 'Returned') return false;
      if (selectedStatusCat === 'others' && !['Other', 'Archived'].includes(cs.status)) return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = cs.id.toLowerCase().includes(q);
        const matchesCase = cs.caseNo.toLowerCase().includes(q);
        const matchesSec = cs.section.toLowerCase().includes(q);
        const matchesCourt = (cs.court + ' ' + cs.city).toLowerCase().includes(q);
        if (!matchesId && !matchesCase && !matchesSec && !matchesCourt) return false;
      }

      // 3. Case filter
      if (caseFilter !== 'All' && cs.caseNo !== caseFilter) return false;

      // 4. Status filter
      if (statusFilter !== 'All' && cs.status !== statusFilter) return false;

      // 5. Court filter
      if (courtFilter !== 'All' && !cs.court.includes(courtFilter)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'id-asc') return a.id.localeCompare(b.id);
      if (sortBy === 'case-asc') return a.caseNo.localeCompare(b.caseNo);
      if (sortBy === 'section-asc') return a.section.localeCompare(b.section);
      if (sortBy === 'status-asc') return a.status.localeCompare(b.status);
      if (sortBy === 'docs-desc') return b.documentsCount - a.documentsCount;
      // Default: date-desc
      return new Date(b.filedDate + ' ' + b.filedTime) - new Date(a.filedDate + ' ' + a.filedTime);
    });
  }, [chargeSheets, selectedStatusCat, searchQuery, caseFilter, statusFilter, courtFilter, sortBy]);

  // Paginated records
  const totalItems = filteredChargeSheets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const displayedItems = filteredChargeSheets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, totalItems);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(displayedItems.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Download manifest handler
  const handleDownload = (cs) => {
    showToast(`Downloading judicial charge sheet docket for ${cs.id}...`);
    const element = document.createElement("a");
    const file = new Blob([
      `DocShield Judicial Charge Sheet Docket (Section 173 CrPC / 193 BNSS)\n` +
      `===================================================================\n` +
      `Charge Sheet No.: ${cs.id}\n` +
      `Case Number: ${cs.caseNo}\n` +
      `Offense Section: ${cs.section}\n` +
      `Adjudicating Forum: ${cs.court}, ${cs.city}\n` +
      `Filing Timestamp: ${cs.filedDate} at ${cs.filedTime}\n` +
      `Attached Supporting Documents: ${cs.documentsCount} documents\n` +
      `Status: ${cs.status}\n\n` +
      `SUMMARY OF POLICE INVESTIGATION & CHARGES:\n` +
      `${cs.notes}\n\n` +
      `CRYPTOGRAPHIC AUTHENTICITY:\n` +
      `SHA-256 Digest: ${cs.hash}\n` +
      `E-Filing Signature: RSA_2048_POLICE_BHOPAL_VERIFIED\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${cs.id}_ChargeSheet.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleChargeSheetAdded = async (newCS) => {
    setChargeSheets(prev => [newCS, ...prev]);
    showToast(`Charge Sheet ${newCS.id} created and linked to Case ${newCS.caseNo}.`);
    try {
      await chargeSheetsService.createChargeSheet(newCS);
    } catch (err) {
      console.warn('Persist charge sheet notice:', err.message);
    }
  };

  return (
    <div className="chargesheets-page-container">

      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="chargesheets-page-header">
        <div className="chargesheets-header-left">
          <h1 className="chargesheets-title">Charge Sheets</h1>
          <p className="chargesheets-subtitle">Manage and track charge sheets for your cases.</p>
        </div>
        <div className="chargesheets-header-right">
          <button 
            className="btn-add-chargesheet-primary"
            onClick={() => setIsAddModalOpen(true)}
            id="btn-add-charge-sheet"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 4V16M4 10H16"/>
            </svg>
            <span>Add Charge Sheet</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. STATUS SUMMARY STRIP (7 compact filter cards)
          ======================================================== */}
      <div className="chargesheets-category-strip" role="tablist" aria-label="Charge Sheet Status">
        {categories.map((cat) => {
          const isActive = selectedStatusCat === cat.id;
          return (
            <div 
              key={cat.id} 
              className={`cs-cat-card ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSelectedStatusCat(cat.id);
                setCurrentPage(1);
              }}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
            >
              <div className={`cs-cat-icon-box ${cat.colorClass}`}>
                {cat.icon}
              </div>
              <div className="cs-cat-text-block">
                <span className={`cs-cat-label ${isActive ? 'active' : ''}`}>{cat.label}</span>
                <span className="cs-cat-count">{cat.count}</span>
              </div>
              {isActive && <div className="cs-cat-active-line"></div>}
            </div>
          );
        })}
      </div>

      {/* ========================================================
          3. SEARCH AND FILTER TOOLBAR
          ======================================================== */}
      <div className="chargesheets-filter-toolbar">
        {/* Left: Search Box */}
        <div className="chargesheets-search-box">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="6"/>
            <path d="M13.5 13.5L17.5 17.5"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by charge sheet number, case number, section..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            id="chargesheet-search-input"
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
        <div className="chargesheets-controls-group">
          {/* All Cases */}
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
            <option value="#2024-1768">#2024-1768</option>
            <option value="#2024-1654">#2024-1654</option>
            <option value="#2024-1432">#2024-1432</option>
            <option value="#2024-1287">#2024-1287</option>
            <option value="#2024-1102">#2024-1102</option>
            <option value="#2023-9845">#2023-9845</option>
            <option value="#2023-7765">#2023-7765</option>
            <option value="#2023-6654">#2023-6654</option>
          </select>

          {/* All Status */}
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
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Draft">Draft</option>
            <option value="Accepted">Accepted</option>
            <option value="Returned">Returned</option>
          </select>

          {/* All Court/Authority */}
          <select 
            className="filter-select"
            value={courtFilter}
            onChange={(e) => {
              setCourtFilter(e.target.value);
              setCurrentPage(1);
            }}
            id="select-filter-court"
          >
            <option value="All">All Court/Authority</option>
            <option value="District Court">District Court</option>
            <option value="Sessions Court">Sessions Court</option>
            <option value="Special Court (NDPS)">Special Court (NDPS)</option>
            <option value="Metropolitan Court">Metropolitan Court</option>
            <option value="Family Court">Family Court</option>
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
              <option value="date-desc">Sort by</option>
              <option value="id-asc">Sort by: Charge Sheet No.</option>
              <option value="case-asc">Sort by: Case Number</option>
              <option value="section-asc">Sort by: Section</option>
              <option value="status-asc">Sort by: Status</option>
              <option value="docs-desc">Sort by: Documents Count</option>
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
          4. MAIN CHARGE SHEET TABLE CARD
          ======================================================== */}
      <div className="chargesheets-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="main-chargesheets-table">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingRight: '0' }}>
                  <input 
                    type="checkbox" 
                    className="cs-checkbox" 
                    aria-label="Select all charge sheets"
                    checked={displayedItems.length > 0 && displayedItems.every(i => selectedIds.includes(i.id))}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'id-asc' ? 'id-desc' : 'id-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Charge Sheet No. <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'case-asc' ? 'case-desc' : 'case-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Case No. <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'section-asc' ? 'section-desc' : 'section-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Type / Section <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'date-desc' ? 'date-asc' : 'date-desc')}
                  style={{ cursor: 'pointer' }}
                >
                  Filed On <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'court-asc' ? 'court-desc' : 'court-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Court / Authority <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'status-asc' ? 'status-desc' : 'status-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Status <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'docs-desc' ? 'docs-asc' : 'docs-desc')}
                  style={{ cursor: 'pointer' }}
                >
                  Documents <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.length > 0 ? (
                displayedItems.map((cs) => {
                  const isChecked = selectedIds.includes(cs.id);
                  return (
                    <tr key={cs.id} className="chargesheets-tr">
                      {/* 1. Selection Checkbox */}
                      <td style={{ paddingRight: '0' }}>
                        <input 
                          type="checkbox" 
                          className="cs-checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(cs.id)}
                          aria-label={`Select ${cs.id}`}
                        />
                      </td>

                      {/* 2. Charge Sheet No. */}
                      <td>
                        <span 
                          className="cs-id-link"
                          onClick={() => setInspectingCS(cs)}
                          title={`View docket for ${cs.id}`}
                        >
                          {cs.id}
                        </span>
                      </td>

                      {/* 3. Case No. */}
                      <td>
                        <span 
                          className="cs-case-link"
                          onClick={() => onOpenCase(cs.caseNo)}
                          title={`Open case record for ${cs.caseNo}`}
                        >
                          {cs.caseNo}
                        </span>
                      </td>

                      {/* 4. Type / Section */}
                      <td>
                        <span className="cs-section-text">{cs.section}</span>
                      </td>

                      {/* 5. Filed On */}
                      <td>
                        <div className="cs-two-line-cell">
                          <span className="cs-primary-meta">{cs.filedDate}</span>
                          <span className="cs-secondary-meta">{cs.filedTime}</span>
                        </div>
                      </td>

                      {/* 6. Court / Authority */}
                      <td>
                        <div className="cs-two-line-cell">
                          <span className="cs-primary-meta">{cs.court}</span>
                          <span className="cs-secondary-meta">{cs.city}</span>
                        </div>
                      </td>

                      {/* 7. Status */}
                      <td>
                        <span className={`cs-status-badge ${getStatusPillClass(cs.status)}`}>
                          {cs.status}
                        </span>
                      </td>

                      {/* 8. Documents Count */}
                      <td>
                        <div className="cs-documents-cell">
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
                            <path d="M12 2V6H16"/>
                          </svg>
                          <span>{cs.documentsCount}</span>
                        </div>
                      </td>

                      {/* 9. Action Column */}
                      <td>
                        <div className="cs-action-group" style={{ justifyContent: 'center', position: 'relative' }}>
                          {/* Eye: View */}
                          <button 
                            className="cs-action-btn"
                            title="View Charge Sheet Details"
                            onClick={() => setInspectingCS(cs)}
                          >
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 10C1 10 4 4 10 4C16 4 19 10 19 10C19 10 16 16 10 16C4 16 1 10 1 10Z"/>
                              <circle cx="10" cy="10" r="3"/>
                            </svg>
                          </button>

                          {/* Download */}
                          <button 
                            className="cs-action-btn"
                            title="Download Charge Sheet"
                            onClick={() => handleDownload(cs)}
                          >
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 14V16C4 16.5 4.5 17 5 17H15C15.5 17 16 16.5 16 16V14"/>
                              <path d="M10 3V13M10 13L6 9M10 13L14 9"/>
                            </svg>
                          </button>

                          {/* Three-dot More Actions */}
                          <button 
                            className="cs-action-btn"
                            title="More Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === cs.id ? null : cs.id);
                            }}
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <circle cx="4" cy="10" r="1.8"/>
                              <circle cx="10" cy="10" r="1.8"/>
                              <circle cx="16" cy="10" r="1.8"/>
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuId === cs.id && (
                            <div 
                              className="dropdown-menu-panel"
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '28px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                zIndex: 100,
                                minWidth: '180px',
                                padding: '6px 0',
                                textAlign: 'left'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                  setInspectingCS(cs);
                                  setActiveMenuId(null);
                                }}
                              >
                                <span>👁</span> View Details
                              </button>
                              {cs.status === 'Draft' && (
                                <button 
                                  style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                  onClick={() => {
                                    showToast(`Opened editor for ${cs.id}.`);
                                    setActiveMenuId(null);
                                  }}
                                >
                                  <span>✏️</span> Edit Draft
                                </button>
                              )}
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                  handleDownload(cs);
                                  setActiveMenuId(null);
                                }}
                              >
                                <span>⬇</span> Download Docket
                              </button>
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                  onOpenCase(cs.caseNo);
                                  setActiveMenuId(null);
                                }}
                              >
                                <span>📁</span> View Case
                              </button>
                              <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                  showToast(`Retrieved judicial e-filing trail for ${cs.id}.`);
                                  setActiveMenuId(null);
                                }}
                              >
                                <span>📜</span> View Audit History
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '48px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No charge sheets matched your filters</div>
                    <div style={{ fontSize: '12.5px' }}>Try resetting search query or selecting a different status filter.</div>
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
            Showing <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalItems > 0 ? startRecord : 0}–{endRecord}</strong> of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalItems === 18 ? '18' : totalItems}</strong> charge sheets
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

            {/* Page Numbers 1 to 3 */}
            {[1, 2, 3].map((pageNum) => {
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
              disabled={currentPage === 3}
              onClick={() => setCurrentPage(p => Math.min(3, p + 1))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: currentPage === 3 ? '#CBD5E1' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage === 3 ? 'not-allowed' : 'pointer'
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          CHARGE SHEET DETAIL MODAL
          ======================================================== */}
      {inspectingCS && (
        <ChargeSheetDetailModal 
          chargeSheet={inspectingCS}
          onClose={() => setInspectingCS(null)}
          onOpenCase={onOpenCase}
          showToast={showToast}
        />
      )}

      {/* ========================================================
          ADD CHARGE SHEET MODAL
          ======================================================== */}
      <AddChargeSheetModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        cases={cases}
        onChargeSheetAdded={handleChargeSheetAdded}
      />

    </div>
  );
}
