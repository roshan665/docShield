import React, { useState, useEffect, useMemo } from 'react';
import { initialCustodyData, custodyCategoryCounts } from '../data/custodyData';
import { CustodyDetailModal, CustodyHistoryModal, AddCustodyRecordModal } from './CustodyModal';
import * as custodyService from '../services/custodyService';

export default function CustodyPage({ 
  cases = [], 
  records: propRecords,
  isLoading = false,
  onOpenCase, 
  showToast 
}) {
  // Custody records state
  const [records, setRecords] = useState(propRecords || initialCustodyData);

  useEffect(() => {
    if (propRecords && propRecords.length > 0) {
      setRecords(propRecords);
    }
  }, [propRecords]);

  // Category filter state: 'all', 'evidence', 'documents', 'transfers', 'inStorage', 'inTransit', 'released'
  const [selectedCat, setSelectedCat] = useState('all');

  // Search & dropdown filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [caseFilter, setCaseFilter] = useState('All');
  const [itemTypeFilter, setItemTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Selection checkbox state
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [inspectingRecord, setInspectingRecord] = useState(null);
  const [timelineRecord, setTimelineRecord] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // 7 Categories matching reference image
  const categories = [
    {
      id: 'all',
      label: 'All Records',
      count: custodyCategoryCounts.all,
      colorClass: 'coc-icon-blue',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="10" r="2.5"/>
          <circle cx="15" cy="5" r="2.5"/>
          <circle cx="15" cy="15" r="2.5"/>
          <path d="M7.5 9L12.5 6M7.5 11L12.5 14"/>
        </svg>
      )
    },
    {
      id: 'evidence',
      label: 'Evidence Items',
      count: custodyCategoryCounts.evidence,
      colorClass: 'coc-icon-indigo',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 6.5L10 2.5L3 6.5V13.5L10 17.5L17 13.5V6.5Z"/>
          <path d="M10 2.5V17.5M3 6.5L10 10.5L17 6.5"/>
        </svg>
      )
    },
    {
      id: 'documents',
      label: 'Documents',
      count: custodyCategoryCounts.documents,
      colorClass: 'coc-icon-orange',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
          <path d="M12 2V6H16"/>
          <path d="M8 10H12M8 14H12"/>
        </svg>
      )
    },
    {
      id: 'transfers',
      label: 'Transfers',
      count: custodyCategoryCounts.transfers,
      colorClass: 'coc-icon-green',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h12M13 4l3 3-3 3M16 13H4M7 16l-3-3 3-3"/>
        </svg>
      )
    },
    {
      id: 'inStorage',
      label: 'In Storage',
      count: custodyCategoryCounts.inStorage,
      colorClass: 'coc-icon-purple',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="14" height="12" rx="2"/>
          <path d="M7 8h6M9 12h2"/>
        </svg>
      )
    },
    {
      id: 'inTransit',
      label: 'In Transit',
      count: custodyCategoryCounts.inTransit,
      colorClass: 'coc-icon-rose',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="11" height="8" rx="1"/>
          <path d="M13 8h3l2 3v2h-5V8z"/>
          <circle cx="5.5" cy="14.5" r="1.5"/>
          <circle cx="15.5" cy="14.5" r="1.5"/>
        </svg>
      )
    },
    {
      id: 'released',
      label: 'Released',
      count: custodyCategoryCounts.released,
      colorClass: 'coc-icon-mint',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="7.5"/>
          <path d="M7 10l2 2 4-4"/>
        </svg>
      )
    }
  ];

  // Helper for status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In Lab': return 'coc-status-in-lab';
      case 'Stored': return 'coc-status-stored';
      case 'In Analysis': return 'coc-status-in-analysis';
      case 'In Storage': return 'coc-status-in-storage';
      case 'Received': return 'coc-status-received';
      case 'Released': return 'coc-status-released';
      case 'Submitted': return 'coc-status-submitted';
      default: return 'coc-status-stored';
    }
  };

  // Helper for item type icon inside table row
  const renderItemTypeIcon = (type, name) => {
    if (type === 'Document') {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
          <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"/>
        </svg>
      );
    }
    // Evidence icon variations
    if (name.toLowerCase().includes('phone') || name.toLowerCase().includes('mobile')) {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
          <path d="M11 1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM8 13.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"/>
        </svg>
      );
    }
    if (name.toLowerCase().includes('cctv') || name.toLowerCase().includes('footage')) {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
          <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
        </svg>
      );
    }
    if (name.toLowerCase().includes('cash') || name.toLowerCase().includes('ornament')) {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
          <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
          <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5z"/>
        </svg>
      );
    }
    if (name.toLowerCase().includes('blood') || name.toLowerCase().includes('sample')) {
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
          <path d="M8 1a3 3 0 0 0-3 3v5.26a4.5 4.5 0 1 0 6 0V4a3 3 0 0 0-3-3z"/>
        </svg>
      );
    }
    // Default evidence tool/knife icon
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
        <path d="M14.046 3.494a.75.75 0 0 0-1.06 0L4.148 12.332a.75.75 0 0 0 0 1.061l.53.53a.75.75 0 0 0 1.06 0l8.838-8.838a.75.75 0 0 0 0-1.06l-.53-.531z"/>
      </svg>
    );
  };

  // Filter and sort logic
  const filteredRecords = useMemo(() => {
    let result = [...records];

    // 1. Category tab filter
    if (selectedCat === 'evidence') {
      result = result.filter(r => r.categoryFilter === 'evidence');
    } else if (selectedCat === 'documents') {
      result = result.filter(r => r.categoryFilter === 'documents');
    } else if (selectedCat === 'transfers') {
      result = result.filter(r => r.subStatus === 'transfers');
    } else if (selectedCat === 'inStorage') {
      result = result.filter(r => r.subStatus === 'inStorage');
    } else if (selectedCat === 'inTransit') {
      result = result.filter(r => r.subStatus === 'inTransit');
    } else if (selectedCat === 'released') {
      result = result.filter(r => r.subStatus === 'released');
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.id.toLowerCase().includes(q) ||
        r.caseNo.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        r.itemType.toLowerCase().includes(q) ||
        r.currentLocation.toLowerCase().includes(q) ||
        r.fromPerson.toLowerCase().includes(q) ||
        r.toPerson.toLowerCase().includes(q)
      );
    }

    // 3. Dropdown: Case filter
    if (caseFilter !== 'All') {
      result = result.filter(r => r.caseNo === caseFilter);
    }

    // 4. Dropdown: Item Type filter
    if (itemTypeFilter !== 'All') {
      result = result.filter(r => r.itemType === itemTypeFilter);
    }

    // 5. Dropdown: Custody Status filter
    if (statusFilter !== 'All') {
      result = result.filter(r => r.status === statusFilter);
    }

    // 6. Dropdown: Location filter
    if (locationFilter !== 'All') {
      result = result.filter(r => r.currentLocation === locationFilter);
    }

    // 7. Sort
    if (sortBy === 'id-asc') {
      result.sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortBy === 'id-desc') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'case-asc') {
      result.sort((a, b) => a.caseNo.localeCompare(b.caseNo));
    }

    return result;
  }, [records, selectedCat, searchQuery, caseFilter, itemTypeFilter, statusFilter, locationFilter, sortBy]);

  // Pagination calculations
  const totalItems = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const currentRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  // Checkbox selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(currentRecords.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllCurrentSelected = currentRecords.length > 0 && currentRecords.every(r => selectedIds.includes(r.id));

  const handleAddNewRecord = async (newRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    showToast(`Custody transfer step logged for Exhibit ${newRecord.itemTag}.`);
    try {
      await custodyService.logCustodyTransfer({
        evidenceId: newRecord.itemTag,
        fromLocation: newRecord.fromLocation,
        toLocation: newRecord.toLocation,
        reason: newRecord.reason,
        sealIntact: newRecord.sealIntact
      });
    } catch (err) {
      console.warn('Persist custody transfer notice:', err.message);
    }
  };

  return (
    <div className="custody-page-container">
      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="custody-page-header">
        <div className="custody-header-left">
          <h1 className="custody-title">Chain of Custody</h1>
          <p className="custody-subtitle">Track the complete custody history of evidence and documents.</p>
        </div>
        <button 
          className="btn-add-custody-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z"/>
          </svg>
          + Add Custody Record
        </button>
      </div>

      {/* ========================================================
          2. SUMMARY / CATEGORY STRIP (7 compact filter cards)
          ======================================================== */}
      <div className="custody-category-strip">
        {categories.map((cat) => {
          const isActive = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              className={`coc-cat-card ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSelectedCat(cat.id);
                setCurrentPage(1);
              }}
            >
              <div className={`coc-cat-icon-box ${cat.colorClass}`}>
                {cat.icon}
              </div>
              <div className="coc-cat-text-block">
                <span className={`coc-cat-label ${isActive ? 'active' : ''}`}>{cat.label}</span>
                <span className="coc-cat-count">{cat.count}</span>
              </div>
              {isActive && <div className="coc-cat-active-line" />}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          3. SEARCH AND FILTER TOOLBAR
          ======================================================== */}
      <div className="custody-filter-toolbar">
        {/* Search Input */}
        <div className="custody-search-box">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" color="#94A3B8">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by evidence ID, document name, case number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Dropdowns Group */}
        <div className="custody-controls-group">
          {/* All Cases */}
          <div className="coc-dropdown-select-wrap">
            <select
              className="coc-dropdown-select"
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
            <div className="coc-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* All Item Types */}
          <div className="coc-dropdown-select-wrap">
            <select
              className="coc-dropdown-select"
              value={itemTypeFilter}
              onChange={(e) => { setItemTypeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Item Types</option>
              <option value="Evidence">Evidence</option>
              <option value="Document">Document</option>
            </select>
            <div className="coc-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* All Custody Status */}
          <div className="coc-dropdown-select-wrap">
            <select
              className="coc-dropdown-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Custody Status</option>
              <option value="In Lab">In Lab</option>
              <option value="Stored">Stored</option>
              <option value="In Analysis">In Analysis</option>
              <option value="In Storage">In Storage</option>
              <option value="Received">Received</option>
              <option value="Released">Released</option>
              <option value="Submitted">Submitted</option>
            </select>
            <div className="coc-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* All Locations */}
          <div className="coc-dropdown-select-wrap">
            <select
              className="coc-dropdown-select"
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Locations</option>
              <option value="Forensic Lab">Forensic Lab</option>
              <option value="Record Room">Record Room</option>
              <option value="Cyber Lab">Cyber Lab</option>
              <option value="Malkhana">Malkhana</option>
              <option value="Police Station">Police Station</option>
              <option value="District Court">District Court</option>
              <option value="Sessions Court">Sessions Court</option>
              <option value="Transit Escort">Transit Escort</option>
            </select>
            <div className="coc-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>

          {/* Sort by */}
          <div className="coc-sort-wrap">
            <div className="coc-sort-icon-prefix">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .354.854L9 7.207V13.5a.5.5 0 0 1-.707.447l-2-1A.5.5 0 0 1 6 12.5V7.207L1.646 1.854A.5.5 0 0 1 1.5 1.5z"/>
              </svg>
            </div>
            <select
              className="coc-dropdown-select coc-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort by</option>
              <option value="id-asc">Record ID (Asc)</option>
              <option value="id-desc">Record ID (Desc)</option>
              <option value="case-asc">Case Number</option>
            </select>
            <div className="coc-dropdown-chevron">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. MAIN CUSTODY TABLE CONTAINER
          ======================================================== */}
      <div className="custody-table-card">
        <table className="main-custody-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  className="coc-checkbox"
                  checked={isAllCurrentSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>
                <span className="coc-sort-col-header" onClick={() => setSortBy(prev => prev === 'id-asc' ? 'id-desc' : 'id-asc')}>
                  Record ID
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th>Item Type</th>
              <th>Item Name</th>
              <th>
                <span className="coc-sort-col-header" onClick={() => setSortBy('case-asc')}>
                  Case No.
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="coc-sort-col-header">
                  From (Transferred By)
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th>
                <span className="coc-sort-col-header">
                  To (Received By)
                  <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </span>
              </th>
              <th>Transfer Date & Time</th>
              <th>Current Location</th>
              <th>
                <span className="coc-sort-col-header">
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
            {currentRecords.map((record) => {
              const isSelected = selectedIds.includes(record.id);
              const isMenuOpen = activeMenuId === record.id;

              return (
                <tr key={record.id} className="custody-tr">
                  {/* Selection Checkbox */}
                  <td>
                    <input
                      type="checkbox"
                      className="coc-checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(record.id)}
                    />
                  </td>

                  {/* Record ID (Clickable Blue Link) */}
                  <td>
                    <span
                      className="coc-id-link"
                      onClick={() => setInspectingRecord(record)}
                    >
                      {record.id}
                    </span>
                  </td>

                  {/* Item Type (Pill + Icon) */}
                  <td>
                    <span className={`coc-type-pill ${record.itemType === 'Evidence' ? 'coc-type-evidence' : 'coc-type-document'}`}>
                      <span className="coc-type-icon">
                        {renderItemTypeIcon(record.itemType, record.itemName)}
                      </span>
                      {record.itemType}
                    </span>
                  </td>

                  {/* Item Name */}
                  <td>
                    <span className="coc-item-name">{record.itemName}</span>
                  </td>

                  {/* Case No. (Clickable Blue Link) */}
                  <td>
                    <span
                      className="coc-case-link"
                      onClick={() => onOpenCase(record.caseNo)}
                    >
                      {record.caseNo}
                    </span>
                  </td>

                  {/* From (Transferred By) + Direction arrow in row layout */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div className="coc-transfer-side">
                        <span className="coc-transfer-role">{record.fromRole}</span>
                        <span className="coc-transfer-person">{record.fromPerson}</span>
                      </div>
                      <span className="coc-transfer-arrow">→</span>
                    </div>
                  </td>

                  {/* To (Received By) */}
                  <td>
                    <div className="coc-transfer-side">
                      <span className="coc-transfer-role">{record.toRole}</span>
                      <span className="coc-transfer-person">{record.toPerson}</span>
                    </div>
                  </td>

                  {/* Transfer Date & Time (2 lines) */}
                  <td>
                    <div className="coc-two-line-cell">
                      <span className="coc-primary-meta">{record.transferDate}</span>
                      <span className="coc-secondary-meta">{record.transferTime}</span>
                    </div>
                  </td>

                  {/* Current Location (Pin icon + 2 lines) */}
                  <td>
                    <div className="coc-location-cell">
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0a5 5 0 0 0-5 5c0 3.75 5 11 5 11s5-7.25 5-11a5 5 0 0 0-5-5zm0 7.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                      </svg>
                      <div className="coc-two-line-cell">
                        <span className="coc-primary-meta">{record.currentLocation}</span>
                        <span className="coc-secondary-meta">{record.currentCity}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span className={`coc-status-badge ${getStatusBadgeClass(record.status)}`}>
                      {record.status}
                    </span>
                  </td>

                  {/* Action Icons */}
                  <td>
                    <div className="coc-action-group">
                      {/* View Record (Eye) */}
                      <button
                        className="coc-action-btn"
                        title="View Record"
                        onClick={() => setInspectingRecord(record)}
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                        </svg>
                      </button>

                      {/* View Custody History (Clock) */}
                      <button
                        className="coc-action-btn"
                        title="View Custody History"
                        onClick={() => setTimelineRecord(record)}
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                        </svg>
                      </button>

                      {/* More Actions (•••) */}
                      <button
                        className="coc-action-btn"
                        title="More Actions"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : record.id)}
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="coc-more-menu" onMouseLeave={() => setActiveMenuId(null)}>
                          <button
                            className="coc-menu-item"
                            onClick={() => { setActiveMenuId(null); setInspectingRecord(record); }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                            </svg>
                            View Details
                          </button>
                          <button
                            className="coc-menu-item"
                            onClick={() => { setActiveMenuId(null); setTimelineRecord(record); }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                            </svg>
                            View Full Custody History
                          </button>
                          <button
                            className="coc-menu-item"
                            onClick={() => { setActiveMenuId(null); onOpenCase(record.caseNo); }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2z"/>
                            </svg>
                            View Case
                          </button>
                          <button
                            className="coc-menu-item"
                            onClick={() => {
                              setActiveMenuId(null);
                              showToast(`Accessing exhibit details for ${record.itemName}...`);
                            }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"/>
                            </svg>
                            View Evidence / Document
                          </button>
                          <button
                            className="coc-menu-item"
                            onClick={() => {
                              setActiveMenuId(null);
                              showToast(`Audit history retrieved for ${record.id}. Digital seal is tamper-free.`);
                            }}
                          >
                            <svg viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 0L2 3v5c0 4.42 2.56 8.56 6 9.68 3.44-1.12 6-5.26 6-9.68V3L8 0zm-1 11.5L3.5 8l1.41-1.41L7 8.67l4.09-4.08L12.5 6 7 11.5z"/>
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

            {currentRecords.length === 0 && (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '40px 16px', color: '#64748B' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>No custody records match your search criteria.</div>
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
          Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} custody records
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

          {/* Page numbers: 1 to 5 as shown in reference */}
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
      {inspectingRecord && (
        <CustodyDetailModal
          record={inspectingRecord}
          onClose={() => setInspectingRecord(null)}
          onOpenCase={onOpenCase}
          showToast={showToast}
        />
      )}

      {timelineRecord && (
        <CustodyHistoryModal
          record={timelineRecord}
          onClose={() => setTimelineRecord(null)}
        />
      )}

      {isAddModalOpen && (
        <AddCustodyRecordModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddNewRecord}
          showToast={showToast}
        />
      )}
    </div>
  );
}
