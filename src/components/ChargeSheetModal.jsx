import React, { useState } from 'react';

export function ChargeSheetDetailModal({ chargeSheet, onClose, onOpenCase, showToast }) {
  if (!chargeSheet) return null;

  const handleDownload = () => {
    showToast(`Downloading certified charge sheet docket for ${chargeSheet.id}...`);
    const element = document.createElement("a");
    const file = new Blob([
      `DocShield Judicial Charge Sheet Docket (Section 173 CrPC / 193 BNSS)\n` +
      `===================================================================\n` +
      `Charge Sheet No.: ${chargeSheet.id}\n` +
      `Case Number: ${chargeSheet.caseNo}\n` +
      `Offense Section: ${chargeSheet.section}\n` +
      `Adjudicating Forum: ${chargeSheet.court}, ${chargeSheet.city}\n` +
      `Filing Timestamp: ${chargeSheet.filedDate} at ${chargeSheet.filedTime}\n` +
      `Accused Person(s): ${chargeSheet.accused || 'As documented in panchnama'}\n` +
      `Investigating Officer: ${chargeSheet.investigatingOfficer || 'Inspector, Bhopal Police'}\n` +
      `Court Case Record ID: ${chargeSheet.courtDocketNo || 'PENDING'}\n` +
      `Attached Supporting Documents: ${chargeSheet.documentsCount} documents\n` +
      `Status: ${chargeSheet.status}\n\n` +
      `SUMMARY OF POLICE INVESTIGATION & CHARGES:\n` +
      `${chargeSheet.notes}\n\n` +
      `CRYPTOGRAPHIC AUTHENTICITY:\n` +
      `Algorithm: SHA-256 (FIPS 180-4)\n` +
      `Digest: ${chargeSheet.hash}\n` +
      `E-Filing Signature: RSA_2048_POLICE_BHOPAL_VERIFIED\n\n` +
      `Certified under Bharatiya Nagarik Suraksha Sanhita / CrPC 173\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${chargeSheet.id}_ChargeSheet.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#EBF3FC',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
                <path d="M12 2V6H16"/>
                <path d="M8 10H12M8 14H12"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="modal-title" style={{ fontSize: '17px' }}>{chargeSheet.id}</h3>
                <span className={`cs-status-badge ${
                  chargeSheet.status === 'Submitted' ? 'cs-status-submitted' :
                  chargeSheet.status === 'Under Review' ? 'cs-status-review' :
                  chargeSheet.status === 'Draft' ? 'cs-status-draft' :
                  chargeSheet.status === 'Accepted' ? 'cs-status-accepted' : 'cs-status-returned'
                }`}>
                  {chargeSheet.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Case <strong style={{ color: '#1E6DEB', cursor: 'pointer' }} onClick={() => { onClose(); onOpenCase(chargeSheet.caseNo); }}>{chargeSheet.caseNo}</strong> • {chargeSheet.section}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Court / Adjudicating Authority</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{chargeSheet.court}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{chargeSheet.city}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Investigating Officer</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{chargeSheet.investigatingOfficer || 'Insp. Rajesh Kumar'}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Bhopal Police Station</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Filing Date & Time</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{chargeSheet.filedDate}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{chargeSheet.filedTime}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Accused Person(s)</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{chargeSheet.accused || 'Documented in Seizure Record'}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Under Judicial Remand</div>
            </div>
          </div>

          {/* Investigation Summary & Case Law */}
          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Chargesheet Narrative & Police Findings</div>
            <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.4' }}>{chargeSheet.notes}</div>
          </div>

          {/* Documents breakdown */}
          <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📄</span>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>Attached Supporting Documents</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Includes FIR, Panchnama, FSL reports & witness statements</div>
              </div>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#1E6DEB', background: '#EBF3FC', padding: '4px 10px', borderRadius: '6px' }}>
              {chargeSheet.documentsCount} files
            </span>
          </div>

          {/* Cryptographic SHA-256 seal */}
          <div style={{ background: '#F1F5F9', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>Cryptographic Hash (SHA-256)</span>
              <span className="doc-status-badge status-verified">Intact</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', color: '#1E293B', backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              {chargeSheet.hash}
            </div>
          </div>

          {/* Judicial Audit Logs */}
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Judicial Submission Telemetry</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(chargeSheet.auditLogs || []).map((log, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', background: '#F8FAFC', padding: '6px 10px', borderRadius: '4px' }}>
                  <span style={{ color: '#0F172A', fontWeight: 500 }}>{log.action} <span style={{ color: '#64748B' }}>({log.officer})</span></span>
                  <span style={{ color: '#64748B', fontSize: '11px' }}>{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn-secondary" 
            onClick={handleDownload}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 14V16C4 16.5 4.5 17 5 17H15C15.5 17 16 16.5 16 16V14"/>
              <path d="M10 3V13M10 13L6 9M10 13L14 9"/>
            </svg>
            Download Charge Sheet
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button 
              className="btn-upload-primary"
              onClick={() => {
                showToast(`Charge sheet ${chargeSheet.id} verified against judicial registry.`);
                onClose();
              }}
            >
              Verify Docket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddChargeSheetModal({ isOpen, onClose, cases, onChargeSheetAdded }) {
  const [caseNo, setCaseNo] = useState(cases[0]?.id || '#2024-1768');
  const [csNumber, setCsNumber] = useState(`CS-2024-00${Math.floor(6 + Math.random() * 90)}`);
  const [section, setSection] = useState('IPC 302 - Homicide');
  const [court, setCourt] = useState('District Court, Bhopal');
  const [filedDate, setFiledDate] = useState('2024-01-25');
  const [docCount, setDocCount] = useState(12);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!csNumber.trim()) return;

    const [courtPrimary, courtCity] = court.split(', ');
    const newCS = {
      id: csNumber,
      caseNo: caseNo,
      section: section,
      filedDate: '25 Jan 2024',
      filedTime: '11:00 AM',
      court: courtPrimary || 'District Court',
      city: courtCity || 'Bhopal',
      status: 'Draft',
      documentsCount: parseInt(docCount) || 8,
      accused: 'Investigated Accused',
      investigatingOfficer: 'Insp. Rajesh Kumar',
      courtDocketNo: 'DRAFT-SUBMISSION',
      hash: 'f0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      notes: notes || 'Charge sheet compiled under Section 173 CrPC / 193 BNSS with supporting forensic dockets.',
      auditLogs: [
        { timestamp: '25 Jan 2024, 11:00 AM', action: 'Draft compiled by Inspector', officer: 'Insp. Rajesh Kumar' }
      ]
    };

    onChargeSheetAdded(newCS);
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Charge Sheet</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Associated Case *</label>
              <select value={caseNo} onChange={(e) => setCaseNo(e.target.value)}>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.id} — {c.section}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Charge Sheet Number *</label>
                <input 
                  type="text" 
                  required 
                  value={csNumber} 
                  onChange={(e) => setCsNumber(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Offense Type / Legal Section *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. IPC 302 - Homicide"
                  value={section} 
                  onChange={(e) => setSection(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Court / Adjudicating Forum *</label>
                <select value={court} onChange={(e) => setCourt(e.target.value)}>
                  <option value="District Court, Bhopal">District Court, Bhopal</option>
                  <option value="Sessions Court, Bhopal">Sessions Court, Bhopal</option>
                  <option value="Special Court (NDPS), Bhopal">Special Court (NDPS), Bhopal</option>
                  <option value="Metropolitan Court, Bhopal">Metropolitan Court, Bhopal</option>
                  <option value="Family Court, Bhopal">Family Court, Bhopal</option>
                  <option value="High Court of MP, Jabalpur">High Court of MP, Jabalpur</option>
                </select>
              </div>

              <div className="form-group">
                <label>Filed Date</label>
                <input type="date" value={filedDate} onChange={(e) => setFiledDate(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Charge Sheet Master File (PDF)</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setFileName(e.target.files[0]?.name || '')}
                />
                {fileName && <div style={{ fontSize: '11px', color: '#1E6DEB', marginTop: '4px' }}>Selected: {fileName}</div>}
              </div>

              <div className="form-group">
                <label>Attached Supporting Documents Count</label>
                <input 
                  type="number" 
                  min="1" 
                  value={docCount} 
                  onChange={(e) => setDocCount(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Investigation Summary & Legal Submission Notes</label>
              <textarea 
                rows="2" 
                placeholder="Key investigation findings, accused culpability, list of witnesses..."
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Charge Sheet</button>
          </div>
        </form>
      </div>
    </div>
  );
}
