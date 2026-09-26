import React from 'react';
import { 
  forensicOfficerKPIs, 
  forensicExamQueue, 
  recentEvidenceActivity, 
  pendingForensicReportsData, 
  custodyAlertsData,
  forensicAuditLogs
} from '../../data/forensicOfficerData';

export default function ForensicDashboardPage({ onNavigate, onSelectEvidence, onSelectReport, showToast }) {
  return (
    <div className="forensic-page-container">
      
      {/* 1. Page Header */}
      <div className="forensic-page-header">
        <div className="forensic-header-left">
          <h1 className="forensic-page-title">Forensic Operations & Evidence Oversight</h1>
          <p className="forensic-page-subtitle">
            Regional Forensic Science Laboratory (RFSL), Bhopal • Evidence Examination & Custody Gateway
          </p>
        </div>
        <div className="forensic-header-actions">
          <div className="forensic-header-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span>Lab Session: Active • RFSL-BPL-02</span>
          </div>
          <button 
            className="forensic-btn forensic-btn-primary"
            onClick={() => {
              onNavigate?.('evidence');
              showToast?.("Navigating to Evidence Examination Desk.");
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Evidence Examination Desk</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="forensic-kpi-grid">
        {/* Card 1: Assigned Cases */}
        <div className="forensic-kpi-card" onClick={() => onNavigate?.('cases')}>
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Assigned Cases</span>
            <div className="forensic-kpi-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{forensicOfficerKPIs.assignedCases}</div>
          <div className="forensic-kpi-subtext">Active forensic lab references</div>
        </div>

        {/* Card 2: Evidence Items */}
        <div className="forensic-kpi-card" onClick={() => onNavigate?.('evidence')}>
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Evidence Items</span>
            <div className="forensic-kpi-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{forensicOfficerKPIs.evidenceItems}</div>
          <div className="forensic-kpi-subtext">Exhibits sealed in RFSL vault</div>
        </div>

        {/* Card 3: Pending Examinations */}
        <div className="forensic-kpi-card" onClick={() => onNavigate?.('evidence')}>
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Pending Examinations</span>
            <div className="forensic-kpi-icon-wrap amber">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{forensicOfficerKPIs.pendingExaminations}</div>
          <div className="forensic-kpi-subtext">Queued on forensic workbenches</div>
        </div>

        {/* Card 4: Reports Pending Review */}
        <div className="forensic-kpi-card" onClick={() => onNavigate?.('forensic')}>
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Reports Pending Review</span>
            <div className="forensic-kpi-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{forensicOfficerKPIs.reportsPendingReview}</div>
          <div className="forensic-kpi-subtext">Sec 45 IEA Form IV drafts</div>
        </div>

        {/* Card 5: Chain of Custody Alerts */}
        <div className="forensic-kpi-card" onClick={() => onNavigate?.('custody')}>
          <div className="forensic-kpi-top">
            <span className="forensic-kpi-label">Custody Alerts</span>
            <div className="forensic-kpi-icon-wrap red">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
          <div className="forensic-kpi-value">{forensicOfficerKPIs.custodyAlerts}</div>
          <div className="forensic-kpi-subtext" style={{ color: '#DC2626' }}>Require immediate acknowledgement</div>
        </div>
      </div>

      {/* 3. Main Dashboard Sections with Strict Boundaries */}
      
      {/* SECTION: Evidence Examination Queue */}
      <div className="forensic-section-container">
        <div className="forensic-card-header-bar">
          <div className="forensic-card-header-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Evidence Examination Queue</span>
          </div>
          <div className="forensic-card-header-right">
            <button className="forensic-btn forensic-btn-outline forensic-btn-sm" onClick={() => onNavigate?.('evidence')}>
              View Full Queue ({forensicExamQueue.length})
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="forensic-table">
            <thead>
              <tr>
                <th>Queue ID</th>
                <th>Evidence ID</th>
                <th>Case Reference</th>
                <th>Evidence Type</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {forensicExamQueue.map(item => (
                <tr key={item.id}>
                  <td><span className="forensic-id-badge">{item.id}</span></td>
                  <td><strong>{item.evidenceId}</strong></td>
                  <td>
                    <span className="forensic-cell-title">{item.caseId}</span>
                    <span className="forensic-cell-sub">{item.caseTitle}</span>
                  </td>
                  <td>{item.evidenceType}</td>
                  <td style={{ maxWidth: '300px' }}>
                    <span style={{ fontSize: '12.5px', color: '#475569' }}>{item.itemDescription}</span>
                  </td>
                  <td>
                    <span className={`forensic-status-badge ${item.priority === 'Urgent' ? 'urgent' : item.priority === 'High' ? 'pending' : 'active'}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`forensic-status-badge ${item.status === 'In Progress' ? 'under-exam' : 'pending'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="forensic-btn forensic-btn-primary forensic-btn-sm"
                      onClick={() => {
                        onNavigate?.('evidence');
                        showToast?.(`Opening examination bench for ${item.evidenceId}`);
                      }}
                    >
                      Examine
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Grid: Pending Reports & Custody Activity */}
      <div className="forensic-grid-2col">
        
        {/* Pending Forensic Reports */}
        <div className="forensic-section-container" style={{ marginBottom: 0 }}>
          <div className="forensic-card-header-bar">
            <div className="forensic-card-header-title">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>Pending Forensic Reports</span>
            </div>
            <button className="forensic-btn forensic-btn-outline forensic-btn-sm" onClick={() => onNavigate?.('forensic')}>
              All Reports
            </button>
          </div>
          <div className="forensic-section-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingForensicReportsData.map(rep => (
                <div 
                  key={rep.id} 
                  style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => onNavigate?.('forensic')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div>
                      <span className="forensic-id-badge" style={{ marginRight: '6px' }}>{rep.id}</span>
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>{rep.reportType}</strong>
                    </div>
                    <span className={`forensic-status-badge ${rep.status === 'Pending Review' ? 'pending' : 'under-exam'}`}>
                      {rep.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
                    Case: <strong>{rep.caseId}</strong> • Evidence: <strong>{rep.evidenceId}</strong> • Due: {rep.deadline}
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${rep.progress}%`, height: '100%', backgroundColor: rep.progress > 80 ? '#10B981' : '#1E6DEB' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chain of Custody Activity & Alerts */}
        <div className="forensic-section-container" style={{ marginBottom: 0 }}>
          <div className="forensic-card-header-bar">
            <div className="forensic-card-header-title">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <span>Custody Handover Alerts & Monitoring</span>
            </div>
            <button className="forensic-btn forensic-btn-outline forensic-btn-sm" onClick={() => onNavigate?.('custody')}>
              Custody Registry
            </button>
          </div>
          <div className="forensic-section-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {custodyAlertsData.map(alert => (
                <div 
                  key={alert.id} 
                  style={{ padding: '12px 14px', backgroundColor: alert.severity === 'High' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${alert.severity === 'High' ? '#FECACA' : '#FDE68A'}`, borderRadius: '8px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px', color: alert.severity === 'High' ? '#991B1B' : '#92400E' }}>
                      {alert.type}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>{alert.time}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.4', marginBottom: '8px' }}>
                    {alert.description}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                      Exhibit: <strong>{alert.evidenceId}</strong> ({alert.caseId})
                    </span>
                    <button 
                      className="forensic-btn forensic-btn-outline forensic-btn-sm"
                      onClick={() => {
                        onNavigate?.('custody');
                        showToast?.(`Acknowledging custody alert for ${alert.evidenceId}`);
                      }}
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Recent Evidence Activity & Quick Actions */}
      <div className="forensic-grid-3col" style={{ marginTop: '22px' }}>
        
        {/* Recent Evidence Activity */}
        <div className="forensic-section-container" style={{ marginBottom: 0 }}>
          <div className="forensic-card-header-bar">
            <div className="forensic-card-header-title">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
              <span>Recent Evidence Activity</span>
            </div>
            <button className="forensic-btn forensic-btn-outline forensic-btn-sm" onClick={() => onNavigate?.('auditLogs')}>
              Audit Trails
            </button>
          </div>
          <div className="forensic-section-body">
            <div className="forensic-activity-list">
              {recentEvidenceActivity.map(act => (
                <div key={act.id} className="forensic-activity-item">
                  <div className="forensic-activity-dot"></div>
                  <div className="forensic-activity-content">
                    <div className="forensic-activity-top">
                      <span className="forensic-activity-action">{act.action}</span>
                      <span className="forensic-activity-time">{act.timestamp}</span>
                    </div>
                    <div className="forensic-activity-sub">
                      {act.details} • <strong style={{ color: '#0F172A' }}>{act.evidenceId}</strong> ({act.caseId})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="forensic-section-container" style={{ marginBottom: 0 }}>
          <div className="forensic-card-header-bar">
            <div className="forensic-card-header-title">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Forensic Quick Actions</span>
            </div>
          </div>
          <div className="forensic-section-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <div 
                className="forensic-quick-action-tile"
                onClick={() => {
                  onNavigate?.('evidence');
                  showToast?.("Opening new evidence intake register...");
                }}
              >
                <div className="forensic-quick-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <div>
                  <div className="forensic-quick-title">Log Lab Evidence Intake</div>
                  <div className="forensic-quick-desc">Verify Malkhana seal & issue formal receipt memo.</div>
                </div>
              </div>

              <div 
                className="forensic-quick-action-tile"
                onClick={() => {
                  onNavigate?.('forensic');
                  showToast?.("Opening Section 45 Scientific Report drafting wizard...");
                }}
              >
                <div className="forensic-quick-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>
                </div>
                <div>
                  <div className="forensic-quick-title">Draft Section 45 Report</div>
                  <div className="forensic-quick-desc">Prepare Form IV expert scientific opinion for court.</div>
                </div>
              </div>

              <div 
                className="forensic-quick-action-tile"
                onClick={() => {
                  onNavigate?.('custody');
                  showToast?.("Opening custody transfer verification tool...");
                }}
              >
                <div className="forensic-quick-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                  <div className="forensic-quick-title">Custody Transfer Signoff</div>
                  <div className="forensic-quick-desc">Acknowledge biometric or physical vault transit.</div>
                </div>
              </div>

              <div 
                className="forensic-quick-action-tile"
                onClick={() => {
                  onNavigate?.('auditLogs');
                  showToast?.("Opening CCTNS audit trail ledger...");
                }}
              >
                <div className="forensic-quick-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <div className="forensic-quick-title">Audit Chain Integrity</div>
                  <div className="forensic-quick-desc">Verify SHA-256 block ledger for sealed exhibits.</div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
