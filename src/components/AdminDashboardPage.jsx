import React from 'react';
import {
  adminSummaryCards,
  caseStatusData,
  recentSystemActivities,
  recentAuditEvents,
  recentCasesData,
  quickActionItems
} from '../data/adminDashboardData';

export default function AdminDashboardPage({
  onNavigate,
  onOpenCase,
  onNewCase,
  onUploadDoc,
  onAddEvidence,
  showToast
}) {
  // SVG Donut chart calculation
  // Circumference = 2 * PI * r
  // For r = 50, C = 2 * 3.14159 * 50 = 314.159
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  // Compute strokes for each segment
  let cumulativePercent = 0;
  const donutSegments = caseStatusData.segments.map((seg) => {
    const fraction = seg.count / caseStatusData.total;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePercent * circumference;
    cumulativePercent += fraction;

    return {
      ...seg,
      strokeDasharray,
      strokeDashoffset
    };
  });

  const renderIcon = (type) => {
    switch (type) {
      case 'folder':
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 5a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z"/>
          </svg>
        );
      case 'users':
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17 19v-2a4 4 0 0 0-3-3.87M9 19v-2a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M19 8a3 3 0 0 0 0-6"/>
          </svg>
        );
      case 'document':
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
            <path d="M12 2V6H16"/>
            <path d="M8 10H12M8 14H12"/>
          </svg>
        );
      case 'shieldCheck':
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 2L3 5v6c0 5 7 7 7 7s7-2 7-7V5l-7-3z"/>
            <path d="M8 10l2 2 4-4"/>
          </svg>
        );
      case 'shield':
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 2L3 5v6c0 5 7 7 7 7s7-2 7-7V5l-7-3z"/>
          </svg>
        );
      case 'case':
        return (
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 5a2 2 0 0 1 2-2h4l2 2h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z"/>
          </svg>
        );
      case 'evidence':
        return (
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.761V6.838L1 4.239v7.923l6.5 2.6z"/>
          </svg>
        );
      case 'user':
        return (
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
          </svg>
        );
      case 'report':
        return (
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"/>
          </svg>
        );
      case 'filing':
        return (
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
          </svg>
        );
      case 'link':
        return (
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
            <path d="M6.586 1 7.2 1.615a1.002 1.002 0 0 0 .154-.199 2 2 0 0 1-.861-3.337L8.32.71A2 2 0 1 1 11.15 3.54l-.793.792c.04.425.08.853.128 1.287l1.372-1.372a3 3 0 0 0-4.243-4.243L5.786 1.832z"/>
          </svg>
        );
      case 'auth':
        return (
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          </svg>
        );
      case 'userPlus':
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M16 19v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="17" y1="8" x2="17" y2="14"/>
            <line x1="14" y1="11" x2="20" y2="11"/>
          </svg>
        );
      case 'caseShield':
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 2L3 5v6c0 5 7 7 7 7s7-2 7-7V5l-7-3z"/>
            <path d="M8 10l2 2 4-4"/>
          </svg>
        );
      case 'docUpload':
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
            <path d="M12 11l-2-2-2 2"/>
            <path d="M10 9v5"/>
          </svg>
        );
      case 'evidenceShield':
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 2L3 5v6c0 5 7 7 7 7s7-2 7-7V5l-7-3z"/>
            <circle cx="10" cy="11" r="2"/>
          </svg>
        );
      case 'reportShield':
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 2L3 5v6c0 5 7 7 7 7s7-2 7-7V5l-7-3z"/>
            <line x1="8" y1="9" x2="12" y2="9"/>
            <line x1="8" y1="13" x2="12" y2="13"/>
          </svg>
        );
      case 'settingsShield':
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M10 2L3 5v6c0 5 7 7 7 7s7-2 7-7V5l-7-3z"/>
            <circle cx="10" cy="10.5" r="2.5"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="10" cy="10" r="8"/>
          </svg>
        );
    }
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'addUser':
        onNavigate('users');
        break;
      case 'addCase':
        onNewCase();
        break;
      case 'uploadDoc':
        onUploadDoc();
        break;
      case 'addEvidence':
        onAddEvidence();
        break;
      case 'generateReport':
        showToast('Initiating cryptographic forensic report generator...');
        break;
      case 'systemSettings':
        onNavigate('settings');
        break;
      default:
        break;
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* ========================================================
          1. ADMIN DASHBOARD HEADER
          ======================================================== */}
      <div className="admin-page-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">System overview and key metrics for DocShield.</p>
        </div>
        <div className="admin-last-updated-badge">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
          </svg>
          Last updated: 24 Jan 2024, 02:30 PM
        </div>
      </div>

      {/* ========================================================
          2. TOP 6 SUMMARY CARDS
          ======================================================== */}
      <div className="admin-summary-grid">
        {adminSummaryCards.map((card) => (
          <div
            key={card.id}
            className="admin-summary-card"
            onClick={() => {
              if (card.id === 'totalCases') onNavigate('cases');
              else if (card.id === 'totalDocuments') onNavigate('documents');
              else if (card.id === 'totalEvidence') onNavigate('evidence');
              else if (card.id === 'totalInspectors') onNavigate('users');
              else if (card.id === 'pendingReviews') showToast('7 documents and charge sheets currently pending supervisor sign-off.');
              else if (card.id === 'evidenceIntegrity') showToast('All 92 evidence custody seals verified against cryptographic baseline.');
            }}
          >
            <div className="admin-card-icon-wrap">
              {renderIcon(card.iconType)}
            </div>
            <span className="admin-card-label">{card.title}</span>
            <span className="admin-card-value">{card.value}</span>
            <div className="admin-card-trend-row">
              <span className="admin-trend-pct" style={{ color: card.trendColor }}>{card.trend}</span>
              <span className="admin-trend-text">{card.trendText}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================
          3. MIDDLE 3-COLUMN SECTION
          ======================================================== */}
      <div className="admin-middle-grid">
        {/* Card 1: Case Status Overview */}
        <div className="admin-content-card">
          <div className="admin-card-header-row">
            <h2 className="admin-card-title">Case Status Overview</h2>
          </div>
          <div className="case-donut-wrap">
            {/* SVG Donut Chart */}
            <div className="donut-svg-container">
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                {donutSegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="16"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                  />
                ))}
              </svg>
              <div className="donut-center-label">
                <span className="donut-center-number">{caseStatusData.total}</span>
                <span className="donut-center-sub">Total Cases</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="case-donut-legend">
              {caseStatusData.segments.map((seg, idx) => (
                <div key={idx} className="legend-item">
                  <span className="legend-color-dot" style={{ backgroundColor: seg.color }} />
                  <span className="legend-name">{seg.label}</span>
                  <span className="legend-count">{seg.count}</span>
                  <span className="legend-percent">{seg.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Recent System Activity */}
        <div className="admin-content-card">
          <div className="admin-card-header-row">
            <h2 className="admin-card-title">Recent System Activity</h2>
          </div>
          <div className="admin-activity-list">
            {recentSystemActivities.map((act) => (
              <div key={act.id} className="admin-activity-item">
                <div className="admin-act-left">
                  <div
                    className="admin-act-icon-circle"
                    style={{ backgroundColor: act.iconBg, color: act.iconColor }}
                  >
                    {renderIcon(act.iconType)}
                  </div>
                  <div className="admin-act-text">
                    <span className="admin-act-title">{act.title}</span>
                    <span className="admin-act-desc">{act.description}</span>
                  </div>
                </div>
                <span className="admin-act-time">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Recent Audit Events */}
        <div className="admin-content-card">
          <div className="admin-card-header-row">
            <h2 className="admin-card-title">Recent Audit Events</h2>
            <span
              className="admin-view-all-link"
              onClick={() => onNavigate('auditLogs')}
            >
              View All
            </span>
          </div>
          <div className="admin-activity-list">
            {recentAuditEvents.map((aud) => (
              <div key={aud.id} className="admin-activity-item">
                <div className="admin-act-left">
                  <div
                    className="admin-act-icon-circle"
                    style={{ backgroundColor: aud.iconBg, color: aud.iconColor }}
                  >
                    {renderIcon(aud.iconType)}
                  </div>
                  <div className="admin-act-text">
                    <span className="admin-act-title">{aud.title}</span>
                    <span className="admin-act-desc">{aud.description}</span>
                  </div>
                </div>
                <span className="admin-act-time">{aud.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. BOTTOM 2-COLUMN SECTION (Recent Cases + Quick Actions)
          ======================================================== */}
      <div className="admin-bottom-grid">
        {/* Recent Cases Card */}
        <div className="admin-content-card">
          <div className="admin-card-header-row">
            <h2 className="admin-card-title">Recent Cases</h2>
            <span
              className="admin-view-all-link"
              onClick={() => onNavigate('cases')}
            >
              View All
            </span>
          </div>
          <div className="admin-table-responsive">
            <table className="admin-cases-table">
            <thead>
              <tr>
                <th>Case No.</th>
                <th>Title</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentCasesData.map((c) => (
                <tr key={c.caseNo} className="admin-cases-tr">
                  <td>
                    <span
                      className="admin-case-link"
                      onClick={() => onOpenCase(c.caseNo)}
                    >
                      {c.caseNo}
                    </span>
                  </td>
                  <td>
                    <span className="admin-case-title">{c.title}</span>
                  </td>
                  <td>
                    <span className={`admin-badge-${c.statusType}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <span>{c.assignedTo}</span>
                  </td>
                  <td>
                    <span style={{ color: '#64748B' }}>{c.lastUpdated}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="admin-content-card">
          <div className="admin-card-header-row">
            <h2 className="admin-card-title">Quick Actions</h2>
          </div>
          <div className="quick-actions-grid">
            {quickActionItems.map((action) => (
              <button
                key={action.id}
                className="quick-action-tile"
                onClick={() => handleQuickAction(action.id)}
              >
                <div className="quick-tile-left">
                  <div className="quick-tile-icon-box">
                    {renderIcon(action.iconType)}
                  </div>
                  <div className="quick-tile-text">
                    <span className="quick-tile-title">{action.title}</span>
                    <span className="quick-tile-subtitle">{action.subtitle}</span>
                  </div>
                </div>
                <span className="quick-tile-chevron">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
