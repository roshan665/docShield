import React from 'react';

// =========================================================================
// 1. EVIDENCE DETAIL MODAL (Deep Review with 10 clearly bounded sections)
// =========================================================================
export function EvidenceDetailModal({ evidence, onClose, onAction, showToast }) {
  if (!evidence) return null;

  return (
    <div className="forensic-modal-backdrop" onClick={onClose}>
      <div className="forensic-modal-container" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="forensic-modal-header">
          <div className="forensic-modal-header-left">
            <span className="forensic-id-badge">{evidence.id}</span>
            <div>
              <h3 className="forensic-modal-title">{evidence.evidenceType}</h3>
              <div className="forensic-modal-sub">Linked to {evidence.caseId} • Forensic Laboratory Intake Record</div>
            </div>
          </div>
          <button className="forensic-modal-close-btn" onClick={onClose} title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Modal Body with 10 Bounded Sections */}
        <div className="forensic-modal-body">
          
          {/* Section 1: Evidence Overview */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                1. Evidence Overview
              </span>
              <span className={`forensic-status-badge ${evidence.verificationStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                {evidence.verificationStatus}
              </span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid three-col">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Evidence Identifier</span>
                  <span className="forensic-kv-value">{evidence.id}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Category / Nature</span>
                  <span className="forensic-kv-value">{evidence.evidenceType}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Examination Status</span>
                  <span className="forensic-kv-value">{evidence.examinationStatus}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Packaging Seal Number</span>
                  <span className="forensic-kv-value">{evidence.sealNumber}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Physical Condition</span>
                  <span className="forensic-kv-value">{evidence.condition}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Last Lab Timestamp</span>
                  <span className="forensic-kv-value">{evidence.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Case Information */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                2. Case Information
              </span>
              <span className="forensic-id-badge">{evidence.caseId}</span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Case Registration Number</span>
                  <span className="forensic-kv-value">{evidence.caseId}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Investigating Agency</span>
                  <span className="forensic-kv-value">Bhopal Central Police Station</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Judicial Jurisdiction</span>
                  <span className="forensic-kv-value">Chief Judicial Magistrate (CJM), Bhopal District Court</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Forwarding Magistrate Memo</span>
                  <span className="forensic-kv-value">FSL-FWD/CJM/2024/774</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Collection Information */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                3. Collection Information
              </span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid three-col">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Seized / Collected By</span>
                  <span className="forensic-kv-value">{evidence.collectedBy}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Date of Seizure</span>
                  <span className="forensic-kv-value">{evidence.collectionDate}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Seizure Memo Reference</span>
                  <span className="forensic-kv-value">Panchama Seizure Memo #PSM-8812</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Current Custody */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                4. Current Custody
              </span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Active Custodian</span>
                  <span className="forensic-kv-value">{evidence.currentCustodian}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Physical Vault / Chamber Location</span>
                  <span className="forensic-kv-value">{evidence.currentLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Evidence Description */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                5. Evidence Description
              </span>
            </div>
            <div className="forensic-section-body">
              <p style={{ margin: 0, fontSize: '13.5px', color: '#1E293B', lineHeight: '1.6' }}>
                {evidence.description}
              </p>
            </div>
          </div>

          {/* Section 6: Verification Information */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                6. Verification Information & Integrity Hash
              </span>
            </div>
            <div className="forensic-section-body">
              <div style={{ marginBottom: '12px' }}>
                <span className="forensic-kv-label">Cryptographic SHA-256 Digest</span>
                <div className="forensic-hash-display">{evidence.sha256}</div>
              </div>
              <div className="forensic-kv-grid">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Seal Verification Status</span>
                  <span className="forensic-kv-value" style={{ color: '#059669' }}>Verified Intact Upon Delivery</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Malkhana Delivery Receipt</span>
                  <span className="forensic-kv-value">Malkhana Entry #MK-2024-9921</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Examination Information */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                7. Examination Information & Scientific Notes
              </span>
            </div>
            <div className="forensic-section-body">
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.6', backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                {evidence.examinerNotes}
              </p>
            </div>
          </div>

          {/* Section 8: Related Documents */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                8. Related Documents & Certificates
              </span>
            </div>
            <div className="forensic-section-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#0F172A' }}>📄 Form IV Section 45 Scientific Report.pdf</span>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>Signed & Sealed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#0F172A' }}>📄 Malkhana Forwarding & Intake Chalan.pdf</span>
                  <span style={{ fontSize: '11px', color: '#1E6DEB', fontWeight: '700' }}>Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 9: Chain of Custody */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                9. Chain of Custody Handover Log
              </span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-timeline-step">
                <div className="forensic-timeline-badge">1</div>
                <div className="forensic-timeline-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                    <span>Initial Crime Scene Seizure</span>
                    <span>18 Sep 2024, 08:30 PM</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Seized by Insp. Rajesh Kumar under Panchama Seizure Memo #PSM-8812.
                  </div>
                </div>
              </div>
              <div className="forensic-timeline-step">
                <div className="forensic-timeline-badge">2</div>
                <div className="forensic-timeline-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                    <span>Malkhana Intake & Court Forwarding</span>
                    <span>20 Sep 2024, 11:00 AM</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Lodged at PS Malkhana, produced before CJM Bhopal, forwarded to RFSL.
                  </div>
                </div>
              </div>
              <div className="forensic-timeline-step">
                <div className="forensic-timeline-badge">3</div>
                <div className="forensic-timeline-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                    <span>RFSL Laboratory Intake</span>
                    <span>21 Sep 2024, 10:15 AM</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Transferred to Dr. K.S. Rathore for microscopic comparison & ballistics assay.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 10: Activity History */}
          <div className="forensic-section-container" style={{ marginBottom: 0 }}>
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                10. Activity History & Immutable Audit Trail
              </span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-activity-list">
                <div className="forensic-activity-item">
                  <div className="forensic-activity-dot"></div>
                  <div className="forensic-activity-content">
                    <div className="forensic-activity-top">
                      <span className="forensic-activity-action">Microscopic Comparison Completed</span>
                      <span className="forensic-activity-time">{evidence.lastUpdated}</span>
                    </div>
                    <div className="forensic-activity-sub">Conducted by Dr. K.S. Rathore at Ballistics Bench 02. Striation correlation: 98.4%.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="forensic-modal-footer">
          <button className="forensic-btn forensic-btn-outline" onClick={onClose}>
            Close Review
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="forensic-btn forensic-btn-outline"
              onClick={() => {
                showToast?.(`SHA-256 seal re-verified: Match confirmed.`);
              }}
            >
              Verify Hash Digest
            </button>
            <button 
              className="forensic-btn forensic-btn-primary"
              onClick={() => {
                showToast?.(`Forensic examination log updated for ${evidence.id}.`);
                onClose();
              }}
            >
              Update Examination Record
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// 2. FORENSIC REPORT DETAIL MODAL (9 Clearly Bounded Sections)
// =========================================================================
export function ForensicReportDetailModal({ report, onClose, showToast }) {
  if (!report) return null;

  return (
    <div className="forensic-modal-backdrop" onClick={onClose}>
      <div className="forensic-modal-container" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="forensic-modal-header">
          <div className="forensic-modal-header-left">
            <span className="forensic-id-badge">{report.id}</span>
            <div>
              <h3 className="forensic-modal-title">{report.reportType}</h3>
              <div className="forensic-modal-sub">Case: {report.caseId} • Section 45 Indian Evidence Act / Section 39 BSA</div>
            </div>
          </div>
          <button className="forensic-modal-close-btn" onClick={onClose} title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="forensic-modal-body">

          {/* Section 1: Report Overview */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">1. Report Overview</span>
              <span className={`forensic-status-badge ${report.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {report.status}
              </span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid three-col">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Report Number</span>
                  <span className="forensic-kv-value">{report.id}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Report Discipline</span>
                  <span className="forensic-kv-value">{report.reportType}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Drafted Date</span>
                  <span className="forensic-kv-value">{report.createdDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Case Information */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">2. Case Information</span>
              <span className="forensic-id-badge">{report.caseId}</span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Case Title</span>
                  <span className="forensic-kv-value">{report.caseTitle}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Forwarding Reference</span>
                  <span className="forensic-kv-value">FSL-FWD/CJM/2024/774</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Evidence Examined */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">3. Evidence Examined</span>
              <span className="forensic-id-badge">{report.evidenceId}</span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Evidence Identifier</span>
                  <span className="forensic-kv-value">{report.evidenceId}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Exhibit Type</span>
                  <span className="forensic-kv-value">{report.evidenceType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Examination Details */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">4. Examination Details & Methodology</span>
            </div>
            <div className="forensic-section-body">
              <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', lineHeight: '1.6' }}>
                Standard Operating Procedure (SOP-RFSL-BL-04) strictly observed. Standard test cartridges were test-fired into a water recovery tank. Micro-striations along land and groove impressions were indexed under a Leica FS-CB comparison microscope at 40x magnification with calibrated lateral cross-lighting.
              </p>
            </div>
          </div>

          {/* Section 5: Findings */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">5. Scientific Findings & Conclusion</span>
            </div>
            <div className="forensic-section-body">
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '14px', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Conclusive Scientific Opinion (Section 45 IEA):
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#14532D', lineHeight: '1.5' }}>
                  {report.conclusion}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                {report.findingsSummary}
              </p>
            </div>
          </div>

          {/* Section 6: Supporting Documents */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">6. Supporting Documents & Photomicrographs</span>
            </div>
            <div className="forensic-section-body">
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '12.5px', color: '#0F172A', fontWeight: '600' }}>
                  📸 Striation-Comparison-Split-View.png (4.2 MB)
                </div>
                <div style={{ padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '12.5px', color: '#0F172A', fontWeight: '600' }}>
                  📊 Calibration-Log-Sheet.pdf (1.1 MB)
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Examiner Information */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">7. Examiner Information & Credentials</span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Reporting Officer</span>
                  <span className="forensic-kv-value">{report.examiner}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Laboratory Institution</span>
                  <span className="forensic-kv-value">Regional Forensic Science Laboratory, Bhopal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Review Status */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">8. Review Status & Cryptographic Hash</span>
            </div>
            <div className="forensic-section-body">
              <div style={{ marginBottom: '10px' }}>
                <span className="forensic-kv-label">Digital Hash Signature</span>
                <div className="forensic-hash-display">{report.hashSealed}</div>
              </div>
              <div className="forensic-kv-item">
                <span className="forensic-kv-label">Statutory Certification</span>
                <span className="forensic-kv-value">{report.section45Certificate}</span>
              </div>
            </div>
          </div>

          {/* Section 9: Activity History */}
          <div className="forensic-section-container" style={{ marginBottom: 0 }}>
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">9. Activity History</span>
            </div>
            <div className="forensic-section-body">
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                • Report initiated on {report.createdDate} by Dr. K.S. Rathore.<br/>
                • Comparison microscopy concluded on {report.lastUpdated}.<br/>
                • Cryptographic sealing prepared for Court Transmission.
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="forensic-modal-footer">
          <button className="forensic-btn forensic-btn-outline" onClick={onClose}>
            Back
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="forensic-btn forensic-btn-outline"
              onClick={() => showToast?.("Form IV preview generated for download.")}
            >
              Export Form IV PDF
            </button>
            <button 
              className="forensic-btn forensic-btn-primary"
              onClick={() => {
                showToast?.(`Report ${report.id} submitted for Director Approval.`);
                onClose();
              }}
            >
              Submit for Director Approval
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// 3. FORENSIC DOCUMENT PREVIEW MODAL
// =========================================================================
export function ForensicDocumentModal({ doc, onClose, showToast }) {
  if (!doc) return null;

  return (
    <div className="forensic-modal-backdrop" onClick={onClose}>
      <div className="forensic-modal-container" onClick={e => e.stopPropagation()}>
        <div className="forensic-modal-header">
          <div className="forensic-modal-header-left">
            <span className="forensic-id-badge">{doc.id}</span>
            <div>
              <h3 className="forensic-modal-title">{doc.name}</h3>
              <div className="forensic-modal-sub">{doc.type} • Case {doc.caseId}</div>
            </div>
          </div>
          <button className="forensic-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="forensic-modal-body">
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">Document Metadata & Verification</span>
              <span className="forensic-status-badge verified">{doc.verificationStatus}</span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid three-col">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Related Exhibits</span>
                  <span className="forensic-kv-value">{doc.relatedEvidence}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Uploaded / Sealed By</span>
                  <span className="forensic-kv-value">{doc.uploadedBy}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Date of Filing</span>
                  <span className="forensic-kv-value">{doc.date}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Issuing Authority</span>
                  <span className="forensic-kv-value">{doc.authority}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">File Size</span>
                  <span className="forensic-kv-value">{doc.size}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="forensic-section-container" style={{ marginBottom: 0 }}>
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">Cryptographic SHA-256 Checksum</span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-hash-display">{doc.sha256}</div>
            </div>
          </div>
        </div>

        <div className="forensic-modal-footer">
          <button className="forensic-btn forensic-btn-outline" onClick={onClose}>Close</button>
          <button 
            className="forensic-btn forensic-btn-primary"
            onClick={() => {
              showToast?.(`Document ${doc.name} downloaded with digital seal.`);
              onClose();
            }}
          >
            Download Verified Document
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. FORENSIC CUSTODY DETAIL MODAL (8 Clearly Bounded Sections)
// =========================================================================
export function ForensicCustodyModal({ custody, onClose, showToast }) {
  if (!custody) return null;

  return (
    <div className="forensic-modal-backdrop" onClick={onClose}>
      <div className="forensic-modal-container" onClick={e => e.stopPropagation()}>
        <div className="forensic-modal-header">
          <div className="forensic-modal-header-left">
            <span className="forensic-id-badge">{custody.id}</span>
            <div>
              <h3 className="forensic-modal-title">Custody Dossier: {custody.evidenceId}</h3>
              <div className="forensic-modal-sub">Case {custody.caseId} • {custody.evidenceType}</div>
            </div>
          </div>
          <button className="forensic-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="forensic-modal-body">
          
          {/* Section 1: Evidence Overview */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">1. Evidence Overview</span>
              <span className="forensic-id-badge">{custody.evidenceId}</span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Evidence Type</span>
                  <span className="forensic-kv-value">{custody.evidenceType}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Originating Source</span>
                  <span className="forensic-kv-value">{custody.source}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Current Custodian */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">2. Current Custodian</span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Custodian Name & Rank</span>
                  <span className="forensic-kv-value">{custody.currentCustodian}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Authorized Handover Officer</span>
                  <span className="forensic-kv-value">{custody.authorizedOfficer}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Current Location */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">3. Current Location</span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-item">
                <span className="forensic-kv-label">Physical Vault / Security Chamber</span>
                <span className="forensic-kv-value">{custody.currentLocation}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Custody Status */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">4. Custody Status</span>
              <span className={`forensic-status-badge ${custody.custodyStatus.toLowerCase().includes('active') ? 'verified' : custody.custodyStatus.toLowerCase().includes('exception') ? 'exception' : 'pending'}`}>
                {custody.custodyStatus}
              </span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Seal Integrity Condition</span>
                  <span className="forensic-kv-value" style={{ color: custody.sealIntact ? '#059669' : '#DC2626' }}>
                    {custody.sealIntact ? '✓ Seal Intact & Verified' : '⚠ Exception / Compromised'}
                  </span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Total Verified Transfers</span>
                  <span className="forensic-kv-value">{custody.transfersCount} Custody Steps Logged</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Complete Custody Timeline */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">5. Complete Custody Timeline</span>
            </div>
            <div className="forensic-section-body">
              {custody.transferTimeline?.map((item) => (
                <div key={item.step} className="forensic-timeline-step">
                  <div className="forensic-timeline-badge">{item.step}</div>
                  <div className="forensic-timeline-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                      <span>{item.from} ➔ {item.to}</span>
                      <span>{item.date}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                      Handler: <strong style={{ color: '#0F172A' }}>{item.handler}</strong> • Reason: {item.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Transfer History */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">6. Transfer History & Handover Memos</span>
            </div>
            <div className="forensic-section-body">
              <div style={{ fontSize: '13px', color: '#334155' }}>
                All transfers accompanied by biometric verification, dual-signee custody receipts, and registered on CCTNS custody portal.
              </div>
            </div>
          </div>

          {/* Section 7: Verification Information */}
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">7. Verification Information</span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-item">
                <span className="forensic-kv-label">Tamper-Evident Bag UID</span>
                <span className="forensic-kv-value">RFSL-TEB-88219-MP</span>
              </div>
            </div>
          </div>

          {/* Section 8: Audit History */}
          <div className="forensic-section-container" style={{ marginBottom: 0 }}>
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">8. Audit History</span>
            </div>
            <div className="forensic-section-body">
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                Every custody change is cryptographically audited with timestamped SHA-256 ledger block hashing.
              </div>
            </div>
          </div>

        </div>

        <div className="forensic-modal-footer">
          <button className="forensic-btn forensic-btn-outline" onClick={onClose}>Close</button>
          <button 
            className="forensic-btn forensic-btn-primary"
            onClick={() => {
              showToast?.(`Custody verification certificate downloaded for ${custody.evidenceId}.`);
              onClose();
            }}
          >
            Export Custody Audit Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 5. FORENSIC AUDIT LOG DETAIL MODAL
// =========================================================================
export function ForensicAuditModal({ log, onClose }) {
  if (!log) return null;

  return (
    <div className="forensic-modal-backdrop" onClick={onClose}>
      <div className="forensic-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="forensic-modal-header">
          <div className="forensic-modal-header-left">
            <span className="forensic-id-badge">{log.id}</span>
            <div>
              <h3 className="forensic-modal-title">Audit Record: {log.action}</h3>
              <div className="forensic-modal-sub">{log.timestamp} • IP: {log.ip}</div>
            </div>
          </div>
          <button className="forensic-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="forensic-modal-body">
          <div className="forensic-section-container" style={{ marginBottom: 0 }}>
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">Audit Execution Details</span>
              <span className={`forensic-status-badge ${log.result === 'Success' ? 'verified' : 'exception'}`}>
                {log.result}
              </span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">User / Examiner</span>
                  <span className="forensic-kv-value">{log.user}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Role</span>
                  <span className="forensic-kv-value">{log.role}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Module</span>
                  <span className="forensic-kv-value">{log.module}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Associated Case</span>
                  <span className="forensic-kv-value">{log.caseId}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Associated Evidence</span>
                  <span className="forensic-kv-value">{log.evidenceId}</span>
                </div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <span className="forensic-kv-label">Audit Event Payload / Details</span>
                <div style={{ fontSize: '13px', color: '#1E293B', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E2E8F0', marginTop: '4px' }}>
                  {log.details}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="forensic-modal-footer">
          <button className="forensic-btn forensic-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 6. FORENSIC CASE DETAIL MODAL
// =========================================================================
export function ForensicCaseModal({ caseItem, onClose, showToast }) {
  if (!caseItem) return null;

  return (
    <div className="forensic-modal-backdrop" onClick={onClose}>
      <div className="forensic-modal-container" onClick={e => e.stopPropagation()}>
        <div className="forensic-modal-header">
          <div className="forensic-modal-header-left">
            <span className="forensic-id-badge">{caseItem.id}</span>
            <div>
              <h3 className="forensic-modal-title">{caseItem.title}</h3>
              <div className="forensic-modal-sub">{caseItem.policeStation} • Assigned Officer: {caseItem.inspector}</div>
            </div>
          </div>
          <button className="forensic-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="forensic-modal-body">
          <div className="forensic-section-container">
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">Case Forensic Status</span>
              <span className="forensic-status-badge under-exam">{caseItem.forensicStatus}</span>
            </div>
            <div className="forensic-section-body">
              <div className="forensic-kv-grid three-col">
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Total Evidence Items</span>
                  <span className="forensic-kv-value">{caseItem.evidenceCount} Exhibits Seized</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Lead Forensic Examiner</span>
                  <span className="forensic-kv-value">{caseItem.examiner}</span>
                </div>
                <div className="forensic-kv-item">
                  <span className="forensic-kv-label">Priority Level</span>
                  <span className="forensic-kv-value">{caseItem.priority}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="forensic-section-container" style={{ marginBottom: 0 }}>
            <div className="forensic-card-header-bar">
              <span className="forensic-card-header-title">Key Exhibits Under Laboratory Analysis</span>
            </div>
            <div className="forensic-section-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {caseItem.keyExhibits?.map((exhibit, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                    🔬 {exhibit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="forensic-modal-footer">
          <button className="forensic-btn forensic-btn-outline" onClick={onClose}>Close</button>
          <button 
            className="forensic-btn forensic-btn-primary"
            onClick={() => {
              showToast?.(`Opened evidence repository for ${caseItem.id}.`);
              onClose();
            }}
          >
            View Exhibits in Lab
          </button>
        </div>
      </div>
    </div>
  );
}
