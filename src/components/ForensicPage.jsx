import React, { useState, useEffect, useMemo } from 'react';
import { initialForensicReportsData, forensicCategoryCounts } from '../data/forensicData';
import { ForensicDetailModal, AddForensicReportModal } from './ForensicReportModal';
import * as forensicReportsService from '../services/forensicReportsService';

export default function ForensicPage({ 
  cases = [], 
  reports: propReports,
  isLoading = false,
  onOpenCase, 
  showToast 
}) {
  // Reports dataset state (allows adding new reports)
  const [reports, setReports] = useState(propReports || initialForensicReportsData);

  useEffect(() => {
    if (propReports && propReports.length > 0) {
      setReports(propReports);
    }
  }, [propReports]);

  // Category filter state: 'all', 'dna', 'fingerprints', 'ballistics', 'toxicology', 'cyber', 'others'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Search & dropdown filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [caseFilter, setCaseFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [labFilter, setLabFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  // Selection checkbox state
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [inspectingReport, setInspectingReport] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // 7 Categories matching reference image
  const categories = [
    {
      id: 'all',
      label: 'All Reports',
      count: forensicCategoryCounts.all,
      colorClass: 'fr-icon-blue',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
          <path d="M12 2V6H16"/>
          <path d="M8 10H12M8 14H12"/>
        </svg>
      )
    },
    {
      id: 'dna',
      label: 'DNA Analysis',
      count: forensicCategoryCounts.dna,
      colorClass: 'fr-icon-blue',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 3C5 5 7 6 10 6C13 6 15 5 16 3"/>
          <path d="M4 17C5 15 7 14 10 14C13 14 15 15 16 17"/>
          <path d="M5 8H15M6 12H14"/>
          <line x1="10" y1="2" x2="10" y2="18"/>
        </svg>
      )
    },
    {
      id: 'fingerprints',
      label: 'Fingerprints',
      count: forensicCategoryCounts.fingerprints,
      colorClass: 'fr-icon-pink',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2C6.7 2 4 4.7 4 8C4 11 5.5 13.5 7 15"/>
          <path d="M10 5C8.3 5 7 6.3 7 8C7 10 8 12 9 14"/>
          <path d="M10 8C9.5 8 9 8.5 9 9C9 11 11 13 11 15"/>
          <path d="M13 6C14.5 7.5 15 9.5 15 12C15 14 14 16 13 18"/>
        </svg>
      )
    },
    {
      id: 'ballistics',
      label: 'Ballistics',
      count: forensicCategoryCounts.ballistics,
      colorClass: 'fr-icon-green',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="7"/>
          <circle cx="10" cy="10" r="3"/>
          <line x1="10" y1="1" x2="10" y2="5"/>
          <line x1="10" y1="15" x2="10" y2="19"/>
          <line x1="1" y1="10" x2="5" y2="10"/>
          <line x1="15" y1="10" x2="19" y2="10"/>
        </svg>
      )
    },
    {
      id: 'toxicology',
      label: 'Toxicology',
      count: forensicCategoryCounts.toxicology,
      colorClass: 'fr-icon-purple',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3H11M10 3V8M6 17H14M10 8L6 14C5 15.5 6 17 8 17H12C14 17 15 15.5 14 14L10 8Z"/>
          <circle cx="9" cy="14" r="1" fill="currentColor"/>
          <circle cx="11.5" cy="12" r="0.7" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'cyber',
      label: 'Cyber Forensics',
      count: forensicCategoryCounts.cyber,
      colorClass: 'fr-icon-blue',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="16" height="10" rx="2"/>
          <line x1="6" y1="17" x2="14" y2="17"/>
          <line x1="10" y1="14" x2="10" y2="17"/>
        </svg>
      )
    },
    {
      id: 'others',
      label: 'Others',
      count: forensicCategoryCounts.others,
      colorClass: 'fr-icon-gray',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <circle cx="4" cy="10" r="1.8"/>
          <circle cx="10" cy="10" r="1.8"/>
          <circle cx="16" cy="10" r="1.8"/>
        </svg>
      )
    }
  ];

  // Helper for small Report ID icon
  const getReportIdIcon = (report) => {
    switch (report.iconType) {
      case 'dna':
        return (
          <div className="fr-id-icon-box" style={{ backgroundColor: report.iconBg, color: report.iconColor }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 3C5 5 7 6 10 6C13 6 15 5 16 3M4 17C5 15 7 14 10 14C13 14 15 15 16 17M6 10H14"/>
            </svg>
          </div>
        );
      case 'fingerprint':
        return (
          <div className="fr-id-icon-box" style={{ backgroundColor: report.iconBg, color: report.iconColor }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 2C6.7 2 4 4.7 4 8C4 11 5.5 13.5 7 15M10 5C8.3 5 7 6.3 7 8M13 6C14.5 7.5 15 9.5 15 12"/>
            </svg>
          </div>
        );
      case 'target':
        return (
          <div className="fr-id-icon-box" style={{ backgroundColor: report.iconBg, color: report.iconColor }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="10" cy="10" r="6"/>
              <circle cx="10" cy="10" r="2"/>
            </svg>
          </div>
        );
      case 'flask':
        return (
          <div className="fr-id-icon-box" style={{ backgroundColor: report.iconBg, color: report.iconColor }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 3H11M10 3V8M6 17H14M10 8L6 14C5 15.5 6 17 8 17H12C14 17 15 15.5 14 14L10 8Z"/>
            </svg>
          </div>
        );
      case 'monitor':
        return (
          <div className="fr-id-icon-box" style={{ backgroundColor: report.iconBg, color: report.iconColor }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="4" width="16" height="10" rx="2"/>
              <line x1="8" y1="17" x2="12" y2="17"/>
              <line x1="10" y1="14" x2="10" y2="17"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="fr-id-icon-box" style={{ backgroundColor: report.iconBg || '#EBF3FC', color: report.iconColor || '#2563EB' }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
              <path d="M12 2V6H16"/>
            </svg>
          </div>
        );
    }
  };

  // Helper for type pill class
  const getTypePillClass = (type) => {
    switch (type) {
      case 'DNA Analysis': return 'fr-type-dna';
      case 'Fingerprints': return 'fr-type-fingerprints';
      case 'Ballistics': return 'fr-type-ballistics';
      case 'Toxicology': return 'fr-type-toxicology';
      case 'Cyber Forensics': return 'fr-type-cyber';
      case 'Digital Analysis': return 'fr-type-digital';
      case 'Document Analysis': return 'fr-type-document';
      case 'Biological': return 'fr-type-biological';
      default: return 'fr-type-dna';
    }
  };

  // Helper for status pill class
  const getStatusPillClass = (status) => {
    switch (status) {
      case 'Completed': return 'fr-status-completed';
      case 'In Progress': return 'fr-status-progress';
      case 'Under Review': return 'fr-status-review';
      default: return 'fr-status-completed';
    }
  };

  // Filter & sort logic
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // 1. Category tab filter
      if (selectedCategory === 'dna' && r.type !== 'DNA Analysis') return false;
      if (selectedCategory === 'fingerprints' && r.type !== 'Fingerprints') return false;
      if (selectedCategory === 'ballistics' && r.type !== 'Ballistics') return false;
      if (selectedCategory === 'toxicology' && r.type !== 'Toxicology') return false;
      if (selectedCategory === 'cyber' && r.type !== 'Cyber Forensics') return false;
      if (selectedCategory === 'others' && !['Digital Analysis', 'Document Analysis', 'Biological'].includes(r.type)) return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = r.id.toLowerCase().includes(q);
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCase = r.caseNo.toLowerCase().includes(q);
        const matchesType = r.type.toLowerCase().includes(q);
        const matchesLab = (r.labPrimary + ' ' + r.labCity).toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesCase && !matchesType && !matchesLab) return false;
      }

      // 3. Case filter
      if (caseFilter !== 'All' && r.caseNo !== caseFilter) return false;

      // 4. Analysis type filter
      if (typeFilter !== 'All' && r.type !== typeFilter) return false;

      // 5. Status filter
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;

      // 6. Lab filter
      if (labFilter !== 'All' && !r.labPrimary.includes(labFilter)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'id-asc') return a.id.localeCompare(b.id);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'case-asc') return a.caseNo.localeCompare(b.caseNo);
      if (sortBy === 'status-asc') return a.status.localeCompare(b.status);
      // Default: date-desc
      return new Date(b.submittedDate + ' ' + b.submittedTime) - new Date(a.submittedDate + ' ' + a.submittedTime);
    });
  }, [reports, selectedCategory, searchQuery, caseFilter, typeFilter, statusFilter, labFilter, sortBy]);

  // Paginated items
  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const displayedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, totalItems);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(displayedReports.map(r => r.id));
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
  const handleDownloadReport = (report) => {
    showToast(`Downloading forensic lab docket for ${report.id} (${report.name})...`);
    const element = document.createElement("a");
    const file = new Blob([
      `DocShield Certified Forensic Analysis Docket\n` +
      `============================================\n` +
      `Report ID: ${report.id}\n` +
      `Report Title: ${report.name}\n` +
      `Investigation Case: ${report.caseNo}\n` +
      `Division: ${report.type}\n` +
      `Testing Authority: ${report.labPrimary}, ${report.labCity}\n` +
      `Lead Examiner: ${report.leadScientist || 'Senior Scientific Officer'}\n` +
      `Submission Timestamp: ${report.submittedDate} ${report.submittedTime}\n` +
      `Received / Certified: ${report.receivedDate} ${report.receivedTime}\n` +
      `Status: ${report.status}\n\n` +
      `SPECIMEN & EXHIBIT:\n` +
      `${report.specimen || 'Evidentiary sample submitted under official magistrate seal'}\n\n` +
      `LABORATORY FINDINGS:\n` +
      `${report.findings}\n\n` +
      `CRYPTOGRAPHIC AUTHENTICITY:\n` +
      `SHA-256 Digest: ${report.hash}\n` +
      `Integrity Status: INTACT / VALIDATED\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${report.id}_ForensicReport.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleReportAdded = async (newReport) => {
    setReports(prev => [newReport, ...prev]);
    showToast(`Forensic Report ${newReport.id} registered and associated with Case ${newReport.caseNo}.`);
    try {
      await forensicReportsService.draftForensicReport(newReport);
    } catch (err) {
      console.warn('Persist report notice:', err.message);
    }
  };

  return (
    <div className="forensic-page-container">

      {/* ========================================================
          1. PAGE HEADER
          ======================================================== */}
      <div className="forensic-page-header">
        <div className="forensic-header-left">
          <h1 className="forensic-title">Forensic Reports</h1>
          <p className="forensic-subtitle">View and manage forensic analysis reports from your cases.</p>
        </div>
        <div className="forensic-header-right">
          <button 
            className="btn-add-forensic-primary"
            onClick={() => setIsAddModalOpen(true)}
            id="btn-add-forensic-report"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 4V16M4 10H16"/>
            </svg>
            <span>Add Forensic Report</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. CATEGORY SUMMARY STRIP (7 compact filter cards)
          ======================================================== */}
      <div className="forensic-category-strip" role="tablist" aria-label="Forensic Report Categories">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <div 
              key={cat.id} 
              className={`fr-cat-card ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
            >
              <div className={`fr-cat-icon-box ${cat.colorClass}`}>
                {cat.icon}
              </div>
              <div className="fr-cat-text-block">
                <span className={`fr-cat-label ${isActive ? 'active' : ''}`}>{cat.label}</span>
                <span className="fr-cat-count">{cat.count}</span>
              </div>
              {isActive && <div className="fr-cat-active-line"></div>}
            </div>
          );
        })}
      </div>

      {/* ========================================================
          3. SEARCH AND FILTER TOOLBAR
          ======================================================== */}
      <div className="forensic-filter-toolbar">
        {/* Left: Search Box */}
        <div className="forensic-search-box">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="6"/>
            <path d="M13.5 13.5L17.5 17.5"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by report name, case number, analysis type..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            id="forensic-search-input"
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
        <div className="forensic-controls-group">
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
          </select>

          {/* All Analysis Types */}
          <select 
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            id="select-filter-type"
          >
            <option value="All">All Analysis Types</option>
            <option value="DNA Analysis">DNA Analysis</option>
            <option value="Fingerprints">Fingerprints</option>
            <option value="Ballistics">Ballistics</option>
            <option value="Toxicology">Toxicology</option>
            <option value="Cyber Forensics">Cyber Forensics</option>
            <option value="Digital Analysis">Digital Analysis</option>
            <option value="Document Analysis">Document Analysis</option>
            <option value="Biological">Biological</option>
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
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
          </select>

          {/* All Labs */}
          <select 
            className="filter-select"
            value={labFilter}
            onChange={(e) => {
              setLabFilter(e.target.value);
              setCurrentPage(1);
            }}
            id="select-filter-lab"
          >
            <option value="All">All Labs</option>
            <option value="State Forensic Lab">State Forensic Lab Bhopal</option>
            <option value="CFSL">CFSL New Delhi</option>
            <option value="Cyber Forensic Lab">Cyber Forensic Lab Bhopal</option>
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
              <option value="id-asc">Sort by: Report ID</option>
              <option value="name-asc">Sort by: Report Name</option>
              <option value="case-asc">Sort by: Case Number</option>
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
          4. MAIN FORENSIC REPORT TABLE CARD
          ======================================================== */}
      <div className="forensic-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="main-forensic-table">
            <thead>
              <tr>
                <th style={{ width: '40px', paddingRight: '0' }}>
                  <input 
                    type="checkbox" 
                    className="fr-checkbox" 
                    aria-label="Select all forensic reports"
                    checked={displayedReports.length > 0 && displayedReports.every(r => selectedIds.includes(r.id))}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'id-asc' ? 'id-desc' : 'id-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Report ID <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th>Report Name</th>
                <th 
                  onClick={() => setSortBy(sortBy === 'type-asc' ? 'type-desc' : 'type-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Analysis Type <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'case-asc' ? 'case-desc' : 'case-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Case No. <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'lab-asc' ? 'lab-desc' : 'lab-asc')}
                  style={{ cursor: 'pointer' }}
                >
                  Laboratory <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th 
                  onClick={() => setSortBy(sortBy === 'date-desc' ? 'date-asc' : 'date-desc')}
                  style={{ cursor: 'pointer' }}
                >
                  Submitted On <span style={{ opacity: 0.6 }}>↕</span>
                </th>
                <th>Received On</th>
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
              {displayedReports.length > 0 ? (
                displayedReports.map((report) => {
                  const isChecked = selectedIds.includes(report.id);
                  return (
                    <tr key={report.id} className="forensic-tr">
                      {/* 1. Selection Checkbox */}
                      <td style={{ paddingRight: '0' }}>
                        <input 
                          type="checkbox" 
                          className="fr-checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(report.id)}
                          aria-label={`Select ${report.id}`}
                        />
                      </td>

                      {/* 2. Report ID with Icon Box */}
                      <td>
                        <div className="fr-id-flex">
                          {getReportIdIcon(report)}
                          <span 
                            className="fr-id-link"
                            onClick={() => setInspectingReport(report)}
                            title={`View lab docket for ${report.id}`}
                          >
                            {report.id}
                          </span>
                        </div>
                      </td>

                      {/* 3. Report Name */}
                      <td>
                        <span 
                          className="fr-report-name-text"
                          onClick={() => setInspectingReport(report)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view full forensic analysis details"
                        >
                          {report.name}
                        </span>
                      </td>

                      {/* 4. Analysis Type Badge */}
                      <td>
                        <span className={`fr-type-pill ${getTypePillClass(report.type)}`}>
                          {report.type}
                        </span>
                      </td>

                      {/* 5. Case No. */}
                      <td>
                        <span 
                          className="fr-case-link"
                          onClick={() => onOpenCase(report.caseNo)}
                          title={`Open case docket for ${report.caseNo}`}
                        >
                          {report.caseNo}
                        </span>
                      </td>

                      {/* 6. Laboratory */}
                      <td>
                        <div className="fr-two-line-cell">
                          <span className="fr-primary-meta">{report.labPrimary}</span>
                          <span className="fr-secondary-meta">{report.labCity}</span>
                        </div>
                      </td>

                      {/* 7. Submitted On */}
                      <td>
                        <div className="fr-two-line-cell">
                          <span className="fr-primary-meta">{report.submittedDate}</span>
                          <span className="fr-secondary-meta">{report.submittedTime}</span>
                        </div>
                      </td>

                      {/* 8. Received On */}
                      <td>
                        <div className="fr-two-line-cell">
                          <span className="fr-primary-meta">{report.receivedDate}</span>
                          <span className="fr-secondary-meta">{report.receivedTime}</span>
                        </div>
                      </td>

                      {/* 9. Status */}
                      <td>
                        <span className={`fr-status-badge ${getStatusPillClass(report.status)}`}>
                          {report.status}
                        </span>
                      </td>

                      {/* 10. Action Column */}
                      <td>
                        <div className="fr-action-group" style={{ justifyContent: 'center', position: 'relative' }}>
                          {/* Eye: View Report */}
                          <button 
                            className="fr-action-btn"
                            title="View Forensic Report"
                            onClick={() => setInspectingReport(report)}
                          >
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 10C1 10 4 4 10 4C16 4 19 10 19 10C19 10 16 16 10 16C4 16 1 10 1 10Z"/>
                              <circle cx="10" cy="10" r="3"/>
                            </svg>
                          </button>

                          {/* Download Report */}
                          <button 
                            className="fr-action-btn"
                            title="Download Forensic Report"
                            onClick={() => handleDownloadReport(report)}
                          >
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 14V16C4 16.5 4.5 17 5 17H15C15.5 17 16 16.5 16 16V14"/>
                              <path d="M10 3V13M10 13L6 9M10 13L14 9"/>
                            </svg>
                          </button>

                          {/* Three-dot More Actions */}
                          <button 
                            className="fr-action-btn"
                            title="More Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === report.id ? null : report.id);
                            }}
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <circle cx="4" cy="10" r="1.8"/>
                              <circle cx="10" cy="10" r="1.8"/>
                              <circle cx="16" cy="10" r="1.8"/>
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuId === report.id && (
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
                                  setInspectingReport(report);
                                  setActiveMenuId(null);
                                }}
                              >
                                <span>👁</span> View Details
                              </button>
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                  handleDownloadReport(report);
                                  setActiveMenuId(null);
                                }}
                              >
                                <span>⬇</span> Download Report
                              </button>
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#1E293B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                  onOpenCase(report.caseNo);
                                  setActiveMenuId(null);
                                }}
                              >
                                <span>📁</span> View Case
                              </button>
                              <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />
                              <button 
                                style={{ width: '100%', padding: '8px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onClick={() => {
                                  showToast(`Retrieved forensic custody telemetry for ${report.id}. All chain logs verified.`);
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
                  <td colSpan="10" style={{ textAlign: 'center', padding: '48px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No forensic reports matched your filters</div>
                    <div style={{ fontSize: '12.5px' }}>Try resetting search query or selecting a different category.</div>
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
            Showing <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalItems > 0 ? startRecord : 0}–{endRecord}</strong> of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalItems === 18 ? '18' : totalItems}</strong> forensic reports
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
          FORENSIC REPORT DETAIL MODAL
          ======================================================== */}
      {inspectingReport && (
        <ForensicDetailModal 
          report={inspectingReport}
          onClose={() => setInspectingReport(null)}
          onOpenCase={onOpenCase}
          showToast={showToast}
        />
      )}

      {/* ========================================================
          ADD FORENSIC REPORT MODAL
          ======================================================== */}
      <AddForensicReportModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        cases={cases}
        onReportAdded={handleReportAdded}
      />

    </div>
  );
}
