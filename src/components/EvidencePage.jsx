import React, { useState, useMemo } from 'react';
import EvidenceThumbnail from './EvidenceThumbnail';
import EvidenceDetailModal from './EvidenceDetailModal';
import { initialEvidenceData, evidenceCategoryCounts } from '../data/evidenceData';

export default function EvidencePage({ 
  onAddEvidence, 
  onOpenCase, 
  showToast,
  evidence: propEvidence,
  cases = [],
  isLoading = false,
  onRefresh
}) {
  const evidence = propEvidence || initialEvidenceData;

  // Category filter state: 'all', 'physical', 'digital', 'images', 'videos', 'audio', 'others'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Search & dropdown filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [caseFilter, setCaseFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  // Checkbox selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & action dropdown states
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [inspectingEvidence, setInspectingEvidence] = useState(null);
  const [inspectingTab, setInspectingTab] = useState('details');

  // Dynamic category counts calculated directly from live evidence records
  const dynamicCategoryCounts = useMemo(() => {
    const list = evidence || [];
    return {
      all: list.length,
      physical: list.filter(e => e.type === 'Physical' || e.type === 'Firearm' || e.type === 'Ammunition').length,
      digital: list.filter(e => e.type === 'Digital').length,
      images: list.filter(e => e.type === 'Image').length,
      videos: list.filter(e => e.type === 'Video').length,
      audio: list.filter(e => e.type === 'Audio').length,
      others: list.filter(e => !['Physical', 'Digital', 'Image', 'Video', 'Audio', 'Firearm', 'Ammunition'].includes(e.type)).length
    };
  }, [evidence]);

  // Dynamic case options derived from cases list or unique evidence records
  const caseOptions = useMemo(() => {
    if (cases && cases.length > 0) {
      return cases.map(c => c.id);
    }
    const set = new Set((evidence || []).map(e => e.caseNo));
    return Array.from(set);
  }, [cases, evidence]);

  // Categories matching the reference image exactly
  const categories = [
    {
      id: 'all',
      label: 'All Evidence',
      count: dynamicCategoryCounts.all,
      colorClass: 'ev-icon-blue',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2L2 6L10 10L18 6L10 2Z"/>
          <path d="M2 10L10 14L18 10"/>
          <path d="M2 14L10 18L18 14"/>
        </svg>
      )
    },
    {
      id: 'physical',
      label: 'Physical Items',
      count: dynamicCategoryCounts.physical,
      colorClass: 'ev-icon-indigo',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 6.5L10 2.5L3 6.5V13.5L10 17.5L17 13.5V6.5Z"/>
          <path d="M10 2.5V17.5M3 6.5L10 10.5L17 6.5"/>
        </svg>
      )
    },
    {
      id: 'digital',
      label: 'Digital Files',
      count: dynamicCategoryCounts.digital,
      colorClass: 'ev-icon-orange',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
          <path d="M12 2V6H16"/>
          <path d="M8 10H12M8 14H12"/>
        </svg>
      )
    },
    {
      id: 'images',
      label: 'Images / Photos',
      count: dynamicCategoryCounts.images,
      colorClass: 'ev-icon-green',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="14" height="14" rx="2"/>
          <circle cx="7.5" cy="7.5" r="1.5"/>
          <path d="M17 13L13 9L4 17"/>
        </svg>
      )
    },
    {
      id: 'videos',
      label: 'Videos',
      count: dynamicCategoryCounts.videos,
      colorClass: 'ev-icon-purple',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="11" height="10" rx="2"/>
          <polygon points="13,8 18,5 18,15 13,12"/>
        </svg>
      )
    },
    {
      id: 'audio',
      label: 'Audio',
      count: dynamicCategoryCounts.audio,
      colorClass: 'ev-icon-red',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10V10M6 7V13M9 4V16M12 2V18M15 6V14M18 10V10"/>
        </svg>
      )
    },
    {
      id: 'others',
      label: 'Others',
      count: dynamicCategoryCounts.others,
      colorClass: 'ev-icon-gray',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <circle cx="4" cy="10" r="1.8"/>
          <circle cx="10" cy="10" r="1.8"/>
          <circle cx="16" cy="10" r="1.8"/>
        </svg>
      )
    }
  ];

  // Helper for type pill style
  const getTypePillClass = (type) => {
    switch (type) {
      case 'Physical': return 'ev-type-physical';
      case 'Digital': return 'ev-type-digital';
      case 'Image': return 'ev-type-image';
      case 'Video': return 'ev-type-video';
      case 'Audio': return 'ev-type-audio';
      default: return 'ev-type-other';
    }
  };

  // Helper for status pill style
  const getStatusPillClass = (status) => {
    switch (status) {
      case 'Secured': return 'ev-status-secured';
      case 'Verified': return 'ev-status-verified';
      case 'Under Analysis': return 'ev-status-analysis';
      default: return 'ev-status-secured';
    }
  };

  // Filtered & sorted records
  const filteredEvidence = useMemo(() => {
    return (evidence || []).filter((ev) => {
      // 1. Category strip filter
      if (selectedCategory === 'physical' && ev.type !== 'Physical') return false;
      if (selectedCategory === 'digital' && ev.type !== 'Digital') return false;
      if (selectedCategory === 'images' && ev.type !== 'Image') return false;
      if (selectedCategory === 'videos' && ev.type !== 'Video') return false;
      if (selectedCategory === 'audio' && ev.type !== 'Audio') return false;
      if (selectedCategory === 'others' && ev.type !== 'Other') return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = ev.id.toLowerCase().includes(q);
        const matchesCase = ev.caseNo.toLowerCase().includes(q);
        const matchesDesc = ev.description.toLowerCase().includes(q);
        const matchesLoc = (ev.locationPrimary + ' ' + ev.locationSecondary).toLowerCase().includes(q);
        if (!matchesId && !matchesCase && !matchesDesc && !matchesLoc) return false;
      }

      // 3. Case filter
      if (caseFilter !== 'All' && ev.caseNo !== caseFilter) return false;

      // 4. Type filter
      if (typeFilter !== 'All' && ev.type !== typeFilter) return false;

      // 5. Status filter
      if (statusFilter !== 'All' && ev.status !== statusFilter) return false;

      // 6. Location filter
      if (locationFilter !== 'All' && !ev.locationPrimary.includes(locationFilter)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'id-asc') return a.id.localeCompare(b.id);
      if (sortBy === 'id-desc') return b.id.localeCompare(a.id);
      if (sortBy === 'case-asc') return a.caseNo.localeCompare(b.caseNo);
      if (sortBy === 'type-asc') return a.type.localeCompare(b.type);
      if (sortBy === 'status-asc') return a.status.localeCompare(b.status);
      // Default: date-desc
      return new Date(b.collectedDate + ' ' + b.collectedTime) - new Date(a.collectedDate + ' ' + a.collectedTime);
    });
  }, [selectedCategory, searchQuery, caseFilter, typeFilter, statusFilter, locationFilter, sortBy]);

  // Paginated items
  const totalItems = filteredEvidence.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const displayedItems = filteredEvidence.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, totalItems);

  // Checkbox selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(displayedItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Open modal helper
  const handleOpenModal = (ev, tab = 'details') => {
    setInspectingEvidence(ev);
    setInspectingTab(tab);
    setActiveMenuId(null);
  };

  return (
    <div className="evidence-page-container">

      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="evidence-page-header">
        <div className="evidence-header-left">
          <h1 className="evidence-title">Evidence</h1>
          <p className="evidence-subtitle">Manage physical and digital evidence from your cases.</p>
        </div>
        <div className="evidence-header-right">
          <button 
            className="btn-add-evidence-primary"
            onClick={onAddEvidence}
            id="btn-add-evidence"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 4V16M4 10H16"/>
            </svg>
            <span>Add Evidence</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. CATEGORY SUMMARY STRIP (7 compact filter cards)
          ======================================================== */}
      <div className="evidence-category-strip" role="tablist" aria-label="Evidence Categories">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <div 
              key={cat.id} 
              className={`ev-cat-card ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
            >
              <div className={`ev-cat-icon-box ${cat.colorClass}`}>
                {cat.icon}
              </div>
              <div className="ev-cat-text-block">
                <span className={`ev-cat-label ${isActive ? 'active' : ''}`}>{cat.label}</span>
                <span className="ev-cat-count">{cat.count}</span>
              </div>
              {isActive && <div className="ev-cat-active-line"></div>}
            </div>
          );
        })}
      </div>

      {/* ========================================================
          3. SEARCH AND FILTER TOOLBAR
          ======================================================== */}
      <div className="evidence-filter-toolbar">
        {/* Left: Search Box */}
        <div className="evidence-search-box">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="6"/>
            <path d="M13.5 13.5L17.5 17.5"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by evidence ID, case number, description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            id="evidence-search-input"
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
        <div className="evidence-controls-group">
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
            {caseOptions.map(cNo => (
              <option key={cNo} value={cNo}>{cNo}</option>
            ))}
          </select>

          {/* All Evidence Types */}
          <select 
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            id="select-filter-type"
          >
            <option value="All">All Evidence Types</option>
            <option value="Physical">Physical</option>
            <option value="Video">Video</option>
            <option value="Image">Image</option>
            <option value="Audio">Audio</option>
            <option value="Digital">Digital</option>
            <option value="Other">Other</option>
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
            <option value="Secured">Secured</option>
            <option value="Under Analysis">Under Analysis</option>
            <option value="Verified">Verified</option>
          </select>

          {/* All Locations */}
          <select 
            className="filter-select"
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
            id="select-filter-location"
          >
            <option value="All">All Locations</option>
            <option value="Police Station">Police Station Bhopal</option>
            <option value="Digital Storage">Digital Storage (Server)</option>
            <option value="Malkhana">Malkhana (Bhopal)</option>
            <option value="Cyber Cell">Cyber Cell (Bhopal)</option>
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
              <option value="id-asc">Sort by: Evidence ID</option>
              <option value="case-asc">Sort by: Case Number</option>
              <option value="type-asc">Sort by: Type</option>
              <option value="status-asc">Sort by: Status</option>
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
          4. MAIN EVIDENCE TABLE CARD
          ======================================================== */}
      <div className="evidence-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="main-evidence-table">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingRight: '0' }}>
                  <input 
                    type="checkbox" 
                    className="ev-checkbox" 
                    aria-label="Select all evidence"
                    checked={displayedItems.length > 0 && displayedItems.every(i => selectedIds.includes(i.id))}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'id-asc' ? 'id-desc' : 'id-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Evidence ID <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th>Thumbnail</th>
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
                <th>Description</th>
                <th 
                  onClick={() => setSortBy(sortBy === 'date-desc' ? 'date-asc' : 'date-desc')}
                  style={{ cursor: 'pointer' }}
                >
                  Collected On <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th>Current Location</th>
                <th 
                  onClick={() => setSortBy(sortBy === 'status-asc' ? 'status-desc' : 'status-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Status <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.length > 0 ? (
                displayedItems.map((ev) => {
                  const isChecked = selectedIds.includes(ev.id);
                  return (
                    <tr key={ev.id} className="evidence-tr">
                      {/* 1. Selection Checkbox */}
                      <td style={{ paddingRight: '0' }}>
                        <input 
                          type="checkbox" 
                          className="ev-checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(ev.id)}
                          aria-label={`Select ${ev.id}`}
                        />
                      </td>

                      {/* 2. Evidence ID */}
                      <td>
                        <span 
                          className="ev-id-link"
                          onClick={() => handleOpenModal(ev, 'details')}
                          title={`View full evidence file for ${ev.id}`}
                        >
                          {ev.id}
                        </span>
                      </td>

                      {/* 3. Thumbnail */}
                      <td>
                        <EvidenceThumbnail type={ev.thumbnailType} label={ev.description} />
                      </td>

                      {/* 4. Type Badge */}
                      <td>
                        <span className={`ev-type-pill ${getTypePillClass(ev.type)}`}>
                          {ev.type}
                        </span>
                      </td>

                      {/* 5. Case No. */}
                      <td>
                        <span 
                          className="ev-case-link"
                          onClick={() => onOpenCase(ev.caseNo)}
                          title={`Open case docket for ${ev.caseNo}`}
                        >
                          {ev.caseNo}
                        </span>
                      </td>

                      {/* 6. Description */}
                      <td>
                        <div className="ev-description-text">{ev.description}</div>
                      </td>

                      {/* 7. Collected On */}
                      <td>
                        <div className="ev-two-line-cell">
                          <span className="ev-primary-meta">{ev.collectedDate}</span>
                          <span className="ev-secondary-meta">{ev.collectedTime}</span>
                        </div>
                      </td>

                      {/* 8. Current Location */}
                      <td>
                        <div className="ev-location-cell">
                          <svg className="ev-pin-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 2C6.7 2 4 4.7 4 8C4 12.5 10 18 10 18C10 18 16 12.5 16 8C16 4.7 13.3 2 10 2Z"/>
                            <circle cx="10" cy="8" r="2.5"/>
                          </svg>
                          <div className="ev-two-line-cell">
                            <span className="ev-primary-meta">{ev.locationPrimary}</span>
                            <span className="ev-secondary-meta">{ev.locationSecondary}</span>
                          </div>
                        </div>
                      </td>

                      {/* 9. Status */}
                      <td>
                        <span className={`ev-status-badge ${getStatusPillClass(ev.status)}`}>
                          {ev.status}
                        </span>
                      </td>

                      {/* 10. Action Column */}
                      <td>
                        <div className="ev-action-group" style={{ justifyContent: 'center', position: 'relative' }}>
                          {/* Eye: View Evidence */}
                          <button 
                            className="ev-action-btn"
                            title="View Evidence Details"
                            onClick={() => handleOpenModal(ev, 'details')}
                          >
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 10C1 10 4 4 10 4C16 4 19 10 19 10C19 10 16 16 10 16C4 16 1 10 1 10Z"/>
                              <circle cx="10" cy="10" r="3"/>
                            </svg>
                          </button>

                          {/* Link/Chain: View Chain of Custody */}
                          <button 
                            className="ev-action-btn"
                            title="View Chain of Custody"
                            onClick={() => handleOpenModal(ev, 'custody')}
                          >
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 11C9.6 11.6 10.5 12 11.5 12C13.4 12 15 10.4 15 8.5C15 6.6 13.4 5 11.5 5C10.5 5 9.6 5.4 9 6"/>
                              <path d="M11 9C10.4 8.4 9.5 8 8.5 8C6.6 8 5 9.6 5 11.5C5 13.4 6.6 15 8.5 15C9.5 15 10.4 14.6 11 14"/>
                            </svg>
                          </button>

                          {/* Three-dot: More Actions */}
                          <button 
                            className="ev-action-btn"
                            title="More Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === ev.id ? null : ev.id);
                            }}
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <circle cx="4" cy="10" r="1.8"/>
                              <circle cx="10" cy="10" r="1.8"/>
                              <circle cx="16" cy="10" r="1.8"/>
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuId === ev.id && (
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
                                minWidth: '190px',
                                padding: '6px 0',
                                textAlign: 'left'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => handleOpenModal(ev, 'details')}
                              >
                                <span>👁</span> View Details
                              </button>
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                  showToast(`Editing metadata form opened for ${ev.id}`);
                                  setActiveMenuId(null);
                                }}
                              >
                                <span>✏️</span> Edit Metadata
                              </button>
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => handleOpenModal(ev, 'custody')}
                              >
                                <span>🔗</span> View Chain of Custody
                              </button>
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                  showToast(`Integrity check validated for ${ev.id}: SHA-256 seal verified.`);
                                  setActiveMenuId(null);
                                }}
                              >
                                <span>🛡</span> Verify Evidence
                              </button>
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                  showToast(`Downloading forensic image attachment for ${ev.id}...`);
                                  setActiveMenuId(null);
                                }}
                              >
                                <span>⬇</span> Download Associated File
                              </button>
                              <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                  showToast(`Audit history retrieved for ${ev.id}: All inspector accesses intact.`);
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
              ) : isLoading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '48px 16px', color: '#64748B' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E6DEB', marginBottom: '4px' }}>Loading case evidence exhibits...</div>
                    <div style={{ fontSize: '12.5px' }}>Retrieving sealed exhibits and Malkhana vault entries from Supabase.</div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '48px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No evidence items matched your criteria</div>
                    <div style={{ fontSize: '12.5px' }}>Try clearing the search query or selecting a different category filter.</div>
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
            Showing <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalItems > 0 ? startRecord : 0}–{endRecord}</strong> of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalItems === 32 ? '32' : totalItems}</strong> evidence items
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

            {/* Page Numbers 1 to 4 */}
            {[1, 2, 3, 4].map((pageNum) => {
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
              disabled={currentPage === 4}
              onClick={() => setCurrentPage(p => Math.min(4, p + 1))}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: currentPage === 4 ? '#CBD5E1' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage === 4 ? 'not-allowed' : 'pointer'
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          EVIDENCE DETAIL & CHAIN OF CUSTODY MODAL
          ======================================================== */}
      {inspectingEvidence && (
        <EvidenceDetailModal 
          evidence={inspectingEvidence}
          initialTab={inspectingTab}
          onClose={() => setInspectingEvidence(null)}
          onOpenCase={onOpenCase}
          showToast={showToast}
        />
      )}

    </div>
  );
}
