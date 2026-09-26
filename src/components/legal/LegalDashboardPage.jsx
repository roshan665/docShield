import React from 'react';
import { 
  legalDashboardKPIs, 
  legalReviewQueue, 
  upcomingCourtFilings, 
  legalDocumentsList, 
  legalAuditLogsList 
} from '../../data/legalOfficerData';

export default function LegalDashboardPage({ onNavigate, onOpenCase, showToast }) {
  const recentDocs = legalDocumentsList.slice(0, 4);
  const recentAudits = legalAuditLogsList.slice(0, 4);

  return (
    <div className="legal-page-container">
      {/* ========================================================
          1. PAGE HEADER (Consistent with Inspector / Admin Hero)
          ======================================================== */}
      <div className="legal-page-header">
        <div className="legal-header-left">
          <h1 className="legal-page-title">
            Welcome back, <span style={{ color: '#1E6DEB' }}>Legal Officer</span>
          </h1>
          <p className="legal-page-subtitle">
            Prosecution docket overview, case review queue, and court filing management for Bhopal District.
          </p>
        </div>
        <div className="legal-header-actions">
          <div className="legal-header-badge">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
            </svg>
            Court Calendar: Wed, 24 Jan 2024 • Sessions Court
          </div>
          <button 
            className="legal-btn-primary"
            onClick={() => onNavigate?.('chargeSheets')}
          >
            Review Charge Sheets
          </button>
        </div>
      </div>

      {/* ========================================================
          2. TOP 5 SUMMARY KPI CARDS (Clearly Bounded Panels)
          ======================================================== */}
      <div className="legal-kpi-grid">
        {legalDashboardKPIs.map((kpi) => (
          <div 
            key={kpi.id} 
            className="legal-kpi-card"
            onClick={() => {
              if (kpi.id === 'assignedCases') onNavigate?.('cases');
              else if (kpi.id === 'legalReview') onNavigate?.('cases');
              else if (kpi.id === 'pendingChargeSheets') onNavigate?.('chargeSheets');
              else if (kpi.id === 'pendingCourtFilings') onNavigate?.('courtFilings');
              else if (kpi.id === 'upcomingCourtMatters') onNavigate?.('courtFilings');
            }}
          >
            <div className="legal-kpi-top">
              <span className="legal-kpi-title">{kpi.title}</span>
              <div className={`legal-kpi-icon-wrap ${
                kpi.id === 'assignedCases' ? 'blue' :
                kpi.id === 'legalReview' ? 'amber' :
                kpi.id === 'pendingChargeSheets' ? 'red' :
                kpi.id === 'pendingCourtFilings' ? 'blue' : 'purple'
              }`}>
                {kpi.id === 'assignedCases' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                )}
                {kpi.id === 'legalReview' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                )}
                {kpi.id === 'pendingChargeSheets' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                  </svg>
                )}
                {kpi.id === 'pendingCourtFilings' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="21" x2="21" y2="21"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <polyline points="5 6 12 3 19 6"/>
                  </svg>
                )}
                {kpi.id === 'upcomingCourtMatters' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                )}
              </div>
            </div>
            <div className="legal-kpi-value">{kpi.value}</div>
            <div className="legal-kpi-footer">
              <span className="legal-kpi-trend" style={{ color: kpi.trendColor }}>{kpi.trend}</span>
              <span className="legal-kpi-text">{kpi.trendText}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================
          3. MAIN TWO-COLUMN DASHBOARD LAYOUT
          Each major section is placed inside its own bordered card
          ======================================================== */}
      <div className="legal-dashboard-layout">
        
        {/* Left Main Column */}
        <div className="legal-dashboard-main">
          
          {/* Card 1: Priority Legal Review Queue */}
          <div className="legal-content-card">
            <div className="legal-card-header-bar">
              <div className="legal-card-header-left">
                <span className="legal-card-accent-bar" />
                <h2 className="legal-card-title">Priority Legal Review Queue</h2>
                <span className="legal-card-subtitle">Immediate scrutiny required before court deadlines</span>
              </div>
              <button 
                className="legal-action-btn"
                onClick={() => onNavigate?.('cases')}
              >
                View All Cases →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {legalReviewQueue.map((item) => (
                <div key={item.id} className="queue-item">
                  <div className="queue-item-left">
                    <div className={`queue-icon-circle ${item.priority === 'Urgent' ? 'amber' : ''}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div className="queue-details">
                      <div className="queue-item-title">
                        <span style={{ color: '#1E6DEB', fontFamily: 'monospace', marginRight: '6px' }}>{item.caseNo}</span>
                        {item.title}
                      </div>
                      <div className="queue-item-sub">
                        {item.itemType} • IO: <strong>{item.investigatingOfficer}</strong> • {item.charges}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: '700' }}>
                        Deadline: {item.deadline}
                      </div>
                      <span className={`legal-badge ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.status}
                      </span>
                    </div>

                    <button 
                      className="legal-action-btn primary"
                      onClick={() => onNavigate?.('chargeSheets')}
                    >
                      Scrutinize
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Upcoming Court Filings & Hearings */}
          <div className="legal-content-card">
            <div className="legal-card-header-bar">
              <div className="legal-card-header-left">
                <span className="legal-card-accent-bar" />
                <h2 className="legal-card-title">Upcoming Court Hearings & Filings</h2>
                <span className="legal-card-subtitle">Scheduled appearances before Sessions & JMFC Benches</span>
              </div>
              <button 
                className="legal-action-btn"
                onClick={() => onNavigate?.('courtFilings')}
              >
                All Filings →
              </button>
            </div>

            <div>
              {upcomingCourtFilings.map((filing) => (
                <div key={filing.id} className="court-filing-item">
                  <div className="court-filing-header">
                    <div>
                      <span style={{ color: '#1E6DEB', fontWeight: '700', fontFamily: 'monospace', marginRight: '8px' }}>
                        {filing.caseNo}
                      </span>
                      <span className="court-filing-title">{filing.filingType}</span>
                    </div>
                    <span className="legal-badge ready">
                      {filing.status}
                    </span>
                  </div>

                  <div className="court-filing-court">
                    🏛️ {filing.court} • {filing.bench}
                  </div>

                  <div className="court-filing-meta">
                    <span>Assigned Prosecutor: <strong>{filing.prosecutor}</strong></span>
                    <span style={{ fontWeight: '700', color: '#D97706' }}>
                      📅 Next Hearing: {filing.hearingDate} at {filing.hearingTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Recent Legal & Prosecution Audit Trail */}
          <div className="legal-content-card" style={{ marginBottom: 0 }}>
            <div className="legal-card-header-bar">
              <div className="legal-card-header-left">
                <span className="legal-card-accent-bar" />
                <h2 className="legal-card-title">Recent Prosecution Scrutiny Audits</h2>
                <span className="legal-card-subtitle">Cryptographically recorded endorsements and defect notices</span>
              </div>
              <button 
                className="legal-action-btn"
                onClick={() => onNavigate?.('auditLogs')}
              >
                View Audit Trail →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentAudits.map((aud) => (
                <div key={aud.id} style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                      {aud.action} — <strong style={{ color: '#1E6DEB' }}>{aud.caseNo}</strong>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                      Module: {aud.module} • {aud.timestamp}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: aud.result.includes('Success') ? '#16A34A' : '#D97706' }}>
                    {aud.result}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sidebar Column */}
        <div className="legal-dashboard-side">
          
          {/* Card 4: Quick Actions Panel */}
          <div className="legal-content-card">
            <div className="legal-card-header-bar">
              <div className="legal-card-header-left">
                <span className="legal-card-accent-bar" />
                <h2 className="legal-card-title">Prosecutor Quick Actions</h2>
              </div>
            </div>

            <div className="legal-card-body">
              <div className="legal-quick-actions-grid">
                <div 
                  className="legal-quick-action-btn"
                  onClick={() => onNavigate?.('chargeSheets')}
                >
                  <div className="legal-quick-action-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <span className="legal-quick-action-label">Charge Sheets</span>
                </div>

                <div 
                  className="legal-quick-action-btn"
                  onClick={() => onNavigate?.('courtFilings')}
                >
                  <div className="legal-quick-action-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="21" x2="21" y2="21"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                      <polyline points="5 6 12 3 19 6"/>
                    </svg>
                  </div>
                  <span className="legal-quick-action-label">Court Filings</span>
                </div>

                <div 
                  className="legal-quick-action-btn"
                  onClick={() => onNavigate?.('documents')}
                >
                  <div className="legal-quick-action-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <span className="legal-quick-action-label">Sec 65B Check</span>
                </div>

                <div 
                  className="legal-quick-action-btn"
                  onClick={() => onNavigate?.('custody')}
                >
                  <div className="legal-quick-action-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="9" width="12" height="9" rx="2"/>
                      <path d="M7 9V6a3 3 0 0 1 6 0v3"/>
                    </svg>
                  </div>
                  <span className="legal-quick-action-label">Custody Audit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Recently Reviewed Evidentiary Documents */}
          <div className="legal-content-card">
            <div className="legal-card-header-bar">
              <div className="legal-card-header-left">
                <span className="legal-card-accent-bar" />
                <h2 className="legal-card-title">Reviewed Evidence Dockets</h2>
              </div>
              <button 
                className="legal-action-btn"
                onClick={() => onNavigate?.('documents')}
              >
                All Docs →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentDocs.map((doc) => (
                <div key={doc.id} style={{ padding: '12px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📄</span>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      {doc.caseNo} • {doc.type}
                    </div>
                  </div>
                  <span className={`legal-badge ${doc.legalReviewStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                    {doc.legalReviewStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 6: Statutory Guidance & Benchmark Card */}
          <div className="legal-content-card" style={{ marginBottom: 0, backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
            <div className="legal-card-header-bar" style={{ backgroundColor: '#F0FDF4', borderBottomColor: '#DCFCE7' }}>
              <div className="legal-card-header-left">
                <span className="legal-card-accent-bar" style={{ backgroundColor: '#16A34A' }} />
                <h2 className="legal-card-title" style={{ color: '#166534' }}>Statutory Prosecution Notice</h2>
              </div>
            </div>
            <div className="legal-card-body" style={{ fontSize: '12.5px', color: '#15803D', lineHeight: '1.5' }}>
              <p style={{ margin: 0 }}>
                Charge sheets in custody cases must be filed within <strong>60 days</strong> (offenses punishable up to 10 years) or <strong>90 days</strong> (heinous offenses) to prevent default bail under CrPC 167(2) / BNSS 187.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
