import React from 'react';

export default function DashboardPage({ cases, onOpenCase, onAddNewCase, onUploadDoc, onLogEvidence, onShowIntegrity, onNavigate, showToast }) {
  // Recent 5 cases for the dashboard
  const recentCases = cases.slice(0, 5);

  return (
    <div className="dashboard-content-wrap">
      
      {/* Hero Welcome */}
      <section className="hero-section">
        <div className="hero-left">
          <h1 className="hero-title">Welcome back, <span className="text-blue">Inspector</span></h1>
          <p className="hero-subtitle">Manage your cases, documents and evidence securely.</p>
        </div>

        <div className="hero-right">
          <div className="date-card">
            <div className="date-icon-box">
              <svg viewBox="0 0 20 20" fill="none" stroke="#1E6DEB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="14" height="14" rx="2"/>
                <path d="M3 8H17"/>
                <path d="M7 2V5"/>
                <path d="M13 2V5"/>
              </svg>
            </div>
            <div className="date-text">
              <span className="date-day">Tue, 23 Jan 2024</span>
              <span className="date-sub">Bhopal Police</span>
            </div>
          </div>

          <div className="hero-quote">
            “Evidence today,<br/>a safer tomorrow.”
          </div>
        </div>
      </section>

      {/* 5 KPI Metric Cards */}
      <section className="kpi-grid">
        
        {/* Card 1 */}
        <div className="kpi-card clickable" onClick={() => onNavigate ? onNavigate('cases') : window.location.hash = 'cases'}>
          <div className="kpi-icon-wrap icon-blue">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 4C3 3.44772 3.44772 3 4 3H9.58579C9.851 3 10.1054 3.10536 10.2929 3.29289L12.7071 5.70711C12.8946 5.89464 13.149 6 13.4142 6H20C20.5523 6 21 6.44772 21 7V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V4Z"/>
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-header-row"><span className="kpi-label">My Active Cases</span></div>
            <div className="kpi-value">24</div>
            <div className="kpi-subtext">
              <span className="trend-up">↑ 12%</span>
              <span className="trend-period">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="kpi-card clickable" onClick={() => onNavigate ? onNavigate('documents') : window.location.hash = 'documents'}>
          <div className="kpi-icon-wrap icon-red">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2H6ZM13 3.5L18.5 9H13V3.5ZM7 12H17V13.5H7V12ZM7 15.5H17V17H7V15.5Z"/>
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-header-row"><span className="kpi-label">Documents</span></div>
            <div className="kpi-value">156</div>
            <div className="kpi-subtext">
              <span className="trend-up">↑ 8%</span>
              <span className="trend-period">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="kpi-card clickable" onClick={() => onNavigate ? onNavigate('evidence') : window.location.hash = 'evidence'}>
          <div className="kpi-icon-wrap icon-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8 2 4 4 4 9c0 4.5 2.5 8 2.5 12"/>
              <path d="M17.5 21c0-4-2-7.5-2-12 0-3-1.5-5-3.5-5"/>
              <path d="M8.5 9c0 3 1.5 6 1.5 10"/>
              <path d="M13.5 19c0-3-.5-5.5-.5-8 0-2-1-3-2.5-3"/>
              <path d="M12 11c0 1.5.5 3 .5 5"/>
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-header-row"><span className="kpi-label">Evidence Items</span></div>
            <div className="kpi-value">32</div>
            <div className="kpi-subtext">
              <span className="trend-up">↑ 14%</span>
              <span className="trend-period">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="kpi-card clickable" onClick={() => onNavigate ? onNavigate('chargeSheets') : window.location.hash = 'chargeSheets'}>
          <div className="kpi-icon-wrap icon-purple">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4ZM13 3.5V9H18.5L13 3.5ZM8 12V13.5H16V12H8ZM8 15V16.5H14V15H8Z"/>
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-header-row"><span className="kpi-label">Charge Sheets</span></div>
            <div className="kpi-value">18</div>
            <div className="kpi-subtext">
              <span className="trend-up">↑ 6%</span>
              <span className="trend-period">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="kpi-card clickable" onClick={onShowIntegrity}>
          <div className="kpi-icon-wrap icon-mint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div className="kpi-content">
            <div className="kpi-header-row">
              <span className="kpi-label">Integrity Verified</span>
              <svg className="kpi-chevron" viewBox="0 0 16 16" fill="none" stroke="#1E6DEB" strokeWidth="2">
                <path d="M6 12L10 8L6 4"/>
              </svg>
            </div>
            <div className="kpi-value text-dark">98.7%</div>
            <div className="kpi-subtext">
              <span className="integrity-count">154 of 156 documents</span>
            </div>
          </div>
        </div>

      </section>

      {/* Main 2-Column Content */}
      <section className="main-columns-grid">
        
        {/* Left Column: Recent / Assigned Cases */}
        <div className="col-left">
          <div className="content-card">
            <div className="card-header-bar">
              <div className="card-header-title">
                <span className="accent-bar"></span>
                <h2>Recent / Assigned Cases</h2>
              </div>
              <a href="#cases" className="view-all-link">View All →</a>
            </div>

            <div className="table-responsive">
              <table className="cases-table">
                <thead>
                  <tr>
                    <th>Case No.</th>
                    <th>Type / Section</th>
                    <th>Status</th>
                    <th>Documents</th>
                    <th>Evidence</th>
                    <th>Last Updated</th>
                    <th>Action</th>
                    <th className="th-menu"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentCases.map((c) => (
                    <tr key={c.id}>
                      <td><span className="case-no-link" onClick={() => onOpenCase(c.id)}>{c.id}</span></td>
                      <td className="type-cell">{c.section}</td>
                      <td>
                        <span className={`status-pill ${
                          c.status === 'Active' ? 'status-active' :
                          c.status === 'Under Review' ? 'status-under-review' : 'status-closed'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td>{c.documentsCount}</td>
                      <td>{c.evidenceCount}</td>
                      <td className="date-cell">{c.lastUpdated}</td>
                      <td>
                        <button className="btn-open-case" onClick={() => onOpenCase(c.id)}>Open</button>
                      </td>
                      <td className="td-menu">
                        <button className="menu-dots-btn" onClick={() => onOpenCase(c.id)}>•••</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Column */}
        <div className="col-right">
          
          {/* Card 1: Document Integrity */}
          <div className="content-card integrity-card" onClick={onShowIntegrity}>
            <div className="card-header-bar">
              <div className="card-header-title">
                <span className="accent-bar"></span>
                <h2>Document Integrity</h2>
              </div>
              <svg className="header-chevron" viewBox="0 0 16 16" fill="none" stroke="#1E6DEB" strokeWidth="2">
                <path d="M6 12L10 8L6 4"/>
              </svg>
            </div>

            <div className="integrity-body">
              <div className="donut-chart-container">
                <svg className="donut-svg" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="62" fill="none" stroke="#F1F5F9" strokeWidth="15"/>
                  <circle cx="80" cy="80" r="62" fill="none" stroke="#F59E0B" strokeWidth="15" 
                          strokeDasharray="389.5" strokeDashoffset="0" 
                          transform="rotate(-90 80 80)"/>
                  <circle cx="80" cy="80" r="62" fill="none" stroke="#10B981" strokeWidth="15" 
                          strokeDasharray="384.5 389.5" strokeDashoffset="0" strokeLinecap="round"
                          transform="rotate(-90 80 80)"/>
                </svg>
                <div className="donut-center-text">
                  <div className="donut-percentage">98.7%</div>
                  <div className="donut-label">Integrity Verified</div>
                  <div className="donut-sub">154 of 156</div>
                </div>
              </div>

              <div className="integrity-legend">
                <div className="legend-row">
                  <span className="legend-dot dot-verified"></span>
                  <span className="legend-name">Verified</span>
                  <span className="legend-count">154</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot dot-pending"></span>
                  <span className="legend-name">Pending</span>
                  <span className="legend-count">2</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot dot-failed"></span>
                  <span className="legend-name">Failed</span>
                  <span className="legend-count">0</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot dot-not-uploaded"></span>
                  <span className="legend-name">Not Uploaded</span>
                  <span className="legend-count">0</span>
                </div>
              </div>
            </div>

            <div className="integrity-security-note">
              All documents are secured with cryptographic hash and tamper detection.
            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="content-card quick-actions-card">
            <h2 className="card-simple-title">Quick Actions</h2>
            <div className="quick-actions-row">
              <button className="qa-btn" onClick={onAddNewCase}>
                <div className="qa-icon-wrap qa-blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <span className="qa-text">Add New Case</span>
              </button>

              <button className="qa-btn" onClick={onUploadDoc}>
                <div className="qa-icon-wrap qa-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9m-4-4 4-4 4 4"/>
                  </svg>
                </div>
                <span className="qa-text">Upload Document</span>
              </button>

              <button className="qa-btn" onClick={onLogEvidence}>
                <div className="qa-icon-wrap qa-purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C8 2 4 4 4 9c0 4.5 2.5 8 2.5 12"/>
                    <path d="M17.5 21c0-4-2-7.5-2-12 0-3-1.5-5-3.5-5"/>
                  </svg>
                </div>
                <span className="qa-text">Add Evidence</span>
              </button>

              <button className="qa-btn" onClick={() => showToast ? showToast("Station Report Summary exported with SHA-256 digital certificate.") : alert("Station Report Summary exported.")}>
                <div className="qa-icon-wrap qa-orange">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                <span className="qa-text">Generate Report</span>
              </button>
            </div>
          </div>

          {/* Card 3: Recent Activity */}
          <div className="content-card recent-activity-card">
            <div className="card-header-bar">
              <h2 className="card-simple-title">Recent Activity</h2>
              <a 
                href="#auditLogs" 
                className="view-all-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('auditLogs');
                  else window.location.hash = 'auditLogs';
                }}
              >
                View All →
              </a>
            </div>

            <div className="activity-list">
              <div className="activity-item" onClick={() => onOpenCase('#2024-1768')}>
                <div className="act-icon-box act-blue">
                  <svg viewBox="0 0 18 18" fill="currentColor"><path d="M4 2h7l4 4v10H4V2z"/></svg>
                </div>
                <div className="act-content">
                  <p className="act-title">FIR.pdf uploaded in <span className="act-case-no">#2024-1768</span></p>
                  <span className="act-time">2 hours ago</span>
                </div>
              </div>

              <div className="activity-item" onClick={() => onOpenCase('#2024-1654')}>
                <div className="act-icon-box act-green">
                  <svg viewBox="0 0 18 18" fill="currentColor"><path d="M9 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm-6 12c0-2.5 4-3.5 6-3.5s6 1 6 3.5V16H3v-2z"/></svg>
                </div>
                <div className="act-content">
                  <p className="act-title">Evidence item added in <span className="act-case-no">#2024-1654</span></p>
                  <span className="act-time">4 hours ago</span>
                </div>
              </div>

              <div className="activity-item" onClick={() => onOpenCase('#2024-1432')}>
                <div className="act-icon-box act-purple">
                  <svg viewBox="0 0 18 18" fill="currentColor"><path d="M4 2h7l4 4v10H4V2zm6 2v3h3L10 4z"/></svg>
                </div>
                <div className="act-content">
                  <p className="act-title">Charge sheet updated in <span className="act-case-no">#2024-1432</span></p>
                  <span className="act-time">6 hours ago</span>
                </div>
              </div>

              <div className="activity-item" onClick={() => onOpenCase('#2024-1287')}>
                <div className="act-icon-box act-orange">
                  <svg viewBox="0 0 18 18" fill="currentColor"><path d="M6 2v4h6V2H6zm-2 6l-2 8h14l-2-8H4z"/></svg>
                </div>
                <div className="act-content">
                  <p className="act-title">Forensic report uploaded in <span className="act-case-no">#2024-1287</span></p>
                  <span className="act-time">1 day ago</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
