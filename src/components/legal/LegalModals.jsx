import React, { useState } from 'react';

// ========================================================
// 1. CHARGE SHEET IN-DEPTH SCRUTINY & LEGAL REVIEW MODAL
// Organized into dedicated bordered section containers
// ========================================================
export function ChargeSheetReviewModal({ chargeSheet, isOpen, onClose, onAction, showToast }) {
  const [reviewNote, setReviewNote] = useState('');

  if (!isOpen || !chargeSheet) return null;

  const handleApprove = () => {
    onAction?.(chargeSheet.id, 'Approved', reviewNote);
    showToast?.(`Charge Sheet ${chargeSheet.id} approved & cryptographically sealed for court filing.`);
    onClose();
  };

  const handleReturn = () => {
    onAction?.(chargeSheet.id, 'Returned', reviewNote);
    showToast?.(`Charge Sheet ${chargeSheet.id} returned to ${chargeSheet.preparedBy} with observations.`);
    onClose();
  };

  return (
    <div className="legal-modal-overlay" onClick={onClose}>
      <div className="legal-modal-dialog wide" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="legal-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="legal-card-accent-bar" style={{ height: '16px' }} />
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Charge Sheet Scrutiny & Legal Review — {chargeSheet.id}
              </h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0 11px' }}>
              Statutory Scrutiny under Section 173(2) CrPC / Section 193 Bharatiya Nagarik Suraksha Sanhita (BNSS)
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#64748B', cursor: 'pointer' }}>×</button>
        </div>

        {/* Modal Body */}
        <div className="legal-modal-body">
          
          {/* SECTION 1: Charge Sheet Overview & Identity */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                📋 Charge Sheet Overview
              </span>
              <span className={`legal-badge ${chargeSheet.chargeSheetStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                {chargeSheet.chargeSheetStatus}
              </span>
            </div>
            <div className="legal-section-content">
              <div className="legal-kv-grid four-cols">
                <div className="legal-kv-item">
                  <span className="legal-kv-label">CHARGE SHEET ID</span>
                  <span className="legal-kv-value" style={{ color: '#1E6DEB', fontFamily: 'monospace' }}>{chargeSheet.id}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">CRIMINAL CASE NO.</span>
                  <span className="legal-kv-value">{chargeSheet.caseNo}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">STATUTORY DEADLINE</span>
                  <span className="legal-kv-value" style={{ color: '#DC2626' }}>{chargeSheet.statutoryDeadline}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">LEGAL REVIEW STATUS</span>
                  <span className="legal-kv-value" style={{ color: '#D97706' }}>{chargeSheet.legalReviewStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Case & Station Information */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                🏛️ Case & Police Station Information
              </span>
              <span className="legal-section-header-sub">Primary Investigating Unit</span>
            </div>
            <div className="legal-section-content">
              <div className="legal-kv-grid three-cols">
                <div className="legal-kv-item">
                  <span className="legal-kv-label">CASE TITLE</span>
                  <span className="legal-kv-value">{chargeSheet.caseTitle}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">INVESTIGATING OFFICER</span>
                  <span className="legal-kv-value">{chargeSheet.preparedBy}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">POLICE STATION / JURISDICTION</span>
                  <span className="legal-kv-value">{chargeSheet.station}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Accused Persons & Custody Details */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                👤 Accused Roster & Remand Status
              </span>
              <span className="legal-section-header-sub">{chargeSheet.accusedList.length} Accused Persons Listed</span>
            </div>
            <div className="legal-section-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {chargeSheet.accusedList.map((acc, idx) => (
                  <div key={idx} style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{acc.name} ({acc.age} yrs)</div>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>Arrested: {acc.arrestDate}</div>
                    </div>
                    <span className="legal-badge" style={{ backgroundColor: '#E2E8F0', color: '#334155', fontWeight: '600' }}>
                      {acc.custody}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: Applicable Penal Sections & Charges */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                ⚖️ Applicable Sections & Penal Charges
              </span>
              <span className="legal-section-header-sub">Indian Penal Code / Bharatiya Nyaya Sanhita</span>
            </div>
            <div className="legal-section-content">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {chargeSheet.sectionsApplicable.map((sec, idx) => (
                  <span key={idx} style={{ padding: '5px 12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', fontSize: '12.5px', fontWeight: '700', color: '#1E40AF' }}>
                    § {sec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: Investigation Summary & Evidence References */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                🔍 Investigation Summary & Evidentiary Corroboration
              </span>
              <span className="legal-section-header-sub">CrPC 173 Synopsis</span>
            </div>
            <div className="legal-section-content">
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.6', backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                {chargeSheet.investigationSummary}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
                <div style={{ padding: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#1E6DEB' }}>{chargeSheet.prosecutionWitnessesCount}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>CHARGE SHEET WITNESSES (PW)</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#16A34A' }}>{chargeSheet.exhibitsCount}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>SEIZED EXHIBITS (P-1 to P-{chargeSheet.exhibitsCount})</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#9333EA' }}>{chargeSheet.documentsCount}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>SUPPORTING DOCKETS (SHA-256)</div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: Document Preview & Forensic References */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                📑 Attached Document Previews & Forensic Reports
              </span>
              <span className="legal-section-header-sub">Cryptographic Integrity Sealed</span>
            </div>
            <div className="legal-section-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📄</span>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#0F172A' }}>Charge_Sheet_Form_173_Signed.pdf</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Primary Police Final Form • 18 Pages</div>
                    </div>
                  </div>
                  <span className="legal-badge verified">✓ SHA-256 Verified</span>
                </div>

                <div style={{ padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🔬</span>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#0F172A' }}>RFSL_Ballistic_Expert_Report.pdf</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Sec 45 IEA Scientific Clearance • Dr. K.S. Rathore</div>
                    </div>
                  </div>
                  <span className="legal-badge verified">✓ SHA-256 Verified</span>
                </div>

                <div style={{ padding: '10px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📜</span>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#0F172A' }}>Section_65B_Electronic_Affidavit.pdf</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>CCTV & Device Extraction Certificate</div>
                    </div>
                  </div>
                  <span className="legal-badge verified">✓ SHA-256 Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 7: Public Prosecutor Legal Scrutiny Notes & Directives */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                📝 Public Prosecutor Legal Scrutiny Observations
              </span>
              <span className="legal-section-header-sub">Mandatory for Return or Endorsement</span>
            </div>
            <div className="legal-section-content">
              <div style={{ padding: '12px 14px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', fontSize: '12.5px', color: '#92400E', lineHeight: '1.5', marginBottom: '12px' }}>
                <strong>Existing Prosecution Observations:</strong>
                <pre style={{ margin: '6px 0 0 0', fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
                  {chargeSheet.legalReviewNotes}
                </pre>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Add / Modify Legal Officer Observations for IO:
                </label>
                <textarea 
                  rows="3"
                  className="legal-filter-select"
                  style={{ width: '100%', height: 'auto', padding: '10px', fontSize: '13px', lineHeight: '1.4' }}
                  placeholder="Enter specific legal defect observations, sanction notes, or endorse trial compliance..."
                  value={reviewNote}
                  onChange={e => setReviewNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SECTION 8: Activity & Audit History */}
          <div className="legal-section-container" style={{ marginBottom: 0 }}>
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                🕒 Activity History & Audit Log
              </span>
              <span className="legal-section-header-sub">Station & Judicial Trail</span>
            </div>
            <div className="legal-section-content">
              <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>• <strong>22 Jan 2024, 04:30 PM:</strong> Draft Charge Sheet received at Directorate of Public Prosecutions from Insp. Rajesh Kumar.</div>
                <div>• <strong>23 Jan 2024, 11:15 AM:</strong> Forensic checksum verification completed with RFSL Bhopal central database.</div>
                <div>• <strong>24 Jan 2024, 10:00 AM:</strong> Under scrutiny by Adv. Arvind Joshi (DPO).</div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer (Review Actions) */}
        <div className="legal-modal-footer">
          <button className="legal-btn-secondary" onClick={onClose}>Close Scrutiny</button>
          <button 
            className="legal-btn-danger" 
            onClick={handleReturn}
          >
            Return to IO with Observations
          </button>
          <button 
            className="legal-btn-primary" 
            onClick={handleApprove}
          >
            Endorse & Sign for Court Submission
          </button>
        </div>

      </div>
    </div>
  );
}

// ========================================================
// 2. COURT FILING DETAIL & TRANSMISSION MODAL
// Organized into dedicated bordered section containers
// ========================================================
export function CourtFilingDetailModal({ filing, isOpen, onClose, showToast }) {
  if (!isOpen || !filing) return null;

  return (
    <div className="legal-modal-overlay" onClick={onClose}>
      <div className="legal-modal-dialog wide" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="legal-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="legal-card-accent-bar" style={{ height: '16px' }} />
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Court Submission & E-Filing Docket — {filing.id}
              </h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0 11px' }}>
              Judicial Submission before Hon'ble Court of Law
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#64748B', cursor: 'pointer' }}>×</button>
        </div>

        {/* Modal Body */}
        <div className="legal-modal-body">
          
          {/* SECTION 1: Filing Overview */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                🏛️ Filing Overview
              </span>
              <span className={`legal-badge ${filing.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {filing.status}
              </span>
            </div>
            <div className="legal-section-content">
              <div className="legal-kv-grid four-cols">
                <div className="legal-kv-item">
                  <span className="legal-kv-label">FILING ID</span>
                  <span className="legal-kv-value" style={{ color: '#1E6DEB', fontFamily: 'monospace' }}>{filing.id}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">CASE NO.</span>
                  <span className="legal-kv-value">{filing.caseNo}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">SUBMISSION DATE</span>
                  <span className="legal-kv-value">{filing.submissionDate}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">CURRENT STAGE</span>
                  <span className="legal-kv-value" style={{ color: '#1E6DEB' }}>{filing.stage}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Court & Bench Information */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                ⚖️ Judicial Bench & Hearing Schedule
              </span>
              <span className="legal-section-header-sub">Causelist Listing</span>
            </div>
            <div className="legal-section-content">
              <div className="legal-kv-grid three-cols">
                <div className="legal-kv-item">
                  <span className="legal-kv-label">ADJUDICATING COURT</span>
                  <span className="legal-kv-value">{filing.court}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">PRESIDING JUDGE / BENCH</span>
                  <span className="legal-kv-value">{filing.bench}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">NEXT HEARING DATE & TIME</span>
                  <span className="legal-kv-value" style={{ color: '#D97706' }}>📅 {filing.nextHearing}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Filing Documents & Dockets */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                📑 Attached Court Dockets
              </span>
              <span className="legal-section-header-sub">{filing.documentsCount} Supporting Documents Attached</span>
            </div>
            <div className="legal-section-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>📄 Formal_Petition_Dossier_Signed.pdf</span>
                  <span className="legal-badge verified">✓ SHA-256 Sealed</span>
                </div>
                <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>📄 Certified_Seizure_Memo_Schedule.pdf</span>
                  <span className="legal-badge verified">✓ SHA-256 Sealed</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Court Timeline & Filing History */}
          <div className="legal-section-container" style={{ marginBottom: 0 }}>
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                ⏱️ Court Timeline & Audit Status
              </span>
              <span className="legal-section-header-sub">National Judicial Data Grid (NJDG)</span>
            </div>
            <div className="legal-section-content">
              <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>• <strong>Prosecuting Counsel:</strong> {filing.prosecutor} (District Prosecution Office)</div>
                <div>• <strong>Transmission Hash:</strong> <code style={{ color: '#1E6DEB' }}>7c9a2f183b9e4a81c5d0...92b4</code></div>
                <div>• <strong>e-Court Filing Status:</strong> Synchronized with District Court Complex Registry.</div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="legal-modal-footer">
          <button className="legal-btn-secondary" onClick={onClose}>Close</button>
          <button 
            className="legal-btn-primary" 
            onClick={() => {
              showToast?.(`Filing dossier for ${filing.caseNo} synchronized with JMFC e-Court portal.`);
              onClose();
            }}
          >
            Transmit to JMFC e-Court
          </button>
        </div>

      </div>
    </div>
  );
}

// ========================================================
// 3. DOCUMENT REVIEW & ADMISSIBILITY MODAL
// Organized into dedicated bordered section containers
// ========================================================
export function DocumentReviewModal({ document, isOpen, onClose, onUpdateStatus, showToast }) {
  if (!isOpen || !document) return null;

  return (
    <div className="legal-modal-overlay" onClick={onClose}>
      <div className="legal-modal-dialog" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="legal-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="legal-card-accent-bar" style={{ height: '16px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Evidence Document Admissibility Review
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 11px' }}>
              {document.name} • Case: {document.caseNo}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#64748B', cursor: 'pointer' }}>×</button>
        </div>

        {/* Modal Body */}
        <div className="legal-modal-body">
          
          {/* SECTION 1: Document Metadata & Checksum */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                📋 Document Identity & Cryptographic Integrity
              </span>
              <span className={`legal-badge ${document.legalReviewStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                {document.legalReviewStatus}
              </span>
            </div>
            <div className="legal-section-content">
              <div className="legal-kv-grid">
                <div className="legal-kv-item">
                  <span className="legal-kv-label">DOCUMENT TYPE</span>
                  <span className="legal-kv-value">{document.type}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">UPLOADED BY</span>
                  <span className="legal-kv-value">{document.uploadedBy}</span>
                </div>
                <div className="legal-kv-item" style={{ gridColumn: 'span 2' }}>
                  <span className="legal-kv-label">SHA-256 CHECKSUM</span>
                  <code style={{ fontSize: '11.5px', color: '#1E6DEB', backgroundColor: '#F8FAFC', padding: '6px 8px', borderRadius: '4px', border: '1px solid #E2E8F0', wordBreak: 'break-all' }}>
                    {document.hash}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Prosecutor Review Observations */}
          <div className="legal-section-container" style={{ marginBottom: 0 }}>
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                📝 Admissibility Scrutiny Notes
              </span>
              <span className="legal-section-header-sub">Sec 65B & CrPC 154/161</span>
            </div>
            <div className="legal-section-content">
              <p style={{ margin: 0, fontSize: '13px', color: '#92400E', lineHeight: '1.5', padding: '12px 14px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                {document.notes}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="legal-modal-footer">
          <button className="legal-btn-secondary" onClick={onClose}>Close</button>
          <button 
            className="legal-btn-danger"
            onClick={() => {
              onUpdateStatus?.(document.id, 'Defect Noted');
              showToast?.(`Marked defect on ${document.name}. Notification sent to IO.`);
              onClose();
            }}
          >
            Mark Defect for IO
          </button>
          <button 
            className="legal-btn-primary"
            onClick={() => {
              onUpdateStatus?.(document.id, 'Admissible');
              showToast?.(`Marked ${document.name} as Court Admissible.`);
              onClose();
            }}
          >
            Endorse as Admissible
          </button>
        </div>

      </div>
    </div>
  );
}

// ========================================================
// 4. CHAIN OF CUSTODY TIMELINE MODAL
// Organized into dedicated bordered section containers
// ========================================================
export function CustodyTimelineModal({ custodyRecord, isOpen, onClose }) {
  if (!isOpen || !custodyRecord) return null;

  return (
    <div className="legal-modal-overlay" onClick={onClose}>
      <div className="legal-modal-dialog wide" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="legal-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="legal-card-accent-bar" style={{ height: '16px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Chain of Custody Judicial Audit Log — {custodyRecord.evidenceId}
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 11px' }}>
              Exhibit: {custodyRecord.item} • Case: {custodyRecord.caseNo}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#64748B', cursor: 'pointer' }}>×</button>
        </div>

        {/* Modal Body */}
        <div className="legal-modal-body">
          
          {/* SECTION 1: Custody Status Overview */}
          <div className="legal-section-container">
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                🔒 Current Custody Status
              </span>
              <span className="legal-badge chain-verified">{custodyRecord.custodyStatus}</span>
            </div>
            <div className="legal-section-content">
              <div className="legal-kv-grid three-cols">
                <div className="legal-kv-item">
                  <span className="legal-kv-label">CURRENT CUSTODIAN</span>
                  <span className="legal-kv-value">{custodyRecord.currentCustodian}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">PHYSICAL LOCATION</span>
                  <span className="legal-kv-value">{custodyRecord.currentLocation}</span>
                </div>
                <div className="legal-kv-item">
                  <span className="legal-kv-label">LAST RECORDED HANDOVER</span>
                  <span className="legal-kv-value" style={{ color: '#1E6DEB' }}>{custodyRecord.lastTransfer}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Chronological Handover Timeline */}
          <div className="legal-section-container" style={{ marginBottom: 0 }}>
            <div className="legal-section-header">
              <span className="legal-section-header-title">
                ⏱️ Chronological Custody Audit Trail
              </span>
              <span className="legal-section-header-sub">{custodyRecord.timeline.length} Handover Nodes Verified</span>
            </div>
            <div className="legal-section-content">
              <div className="custody-timeline-wrap">
                {custodyRecord.timeline.map((step, idx) => (
                  <div key={idx} className="custody-node">
                    <div className="custody-node-dot" />
                    <div className="custody-node-body">
                      <span className="custody-node-time">Handover #{idx + 1} • {step.timestamp}</span>
                      <span className="custody-node-action">{step.action}</span>
                      <span className="custody-node-meta">
                        <strong>Relinquished by:</strong> {step.from} ➔ <strong>Received by:</strong> {step.to}
                      </span>
                      {step.sealIntact && (
                        <div style={{ fontSize: '11px', color: '#15803D', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>✓ Tamper-evident wax seal intact & authenticated under Register No. 19</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="legal-modal-footer">
          <button className="legal-btn-primary" onClick={onClose}>Close Custody Audit</button>
        </div>

      </div>
    </div>
  );
}
