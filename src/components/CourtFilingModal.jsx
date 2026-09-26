import React, { useState } from 'react';

export function CourtFilingDetailModal({ filing, onClose, onOpenCase, showToast }) {
  if (!filing) return null;

  const handleDownload = () => {
    showToast(`Downloading certified court filing docket for ${filing.id}...`);
    const element = document.createElement("a");
    const file = new Blob([
      `DocShield Judicial Court Filing Docket\n` +
      `===================================================================\n` +
      `Filing Number: ${filing.id}\n` +
      `Associated Case: ${filing.caseNo}\n` +
      `Filing Type: ${filing.filingType}\n` +
      `Title / Description: ${filing.title}\n` +
      `Designated Court: ${filing.court}, ${filing.city}\n` +
      `Date & Time Filed: ${filing.filedDate} at ${filing.filedTime}\n` +
      `Next Scheduled Hearing: ${filing.nextHearingDate !== '—' ? `${filing.nextHearingDate} at ${filing.nextHearingTime}` : 'None Scheduled'}\n` +
      `Current Status: ${filing.status}\n` +
      `E-Courts / CNR No: ${filing.cnrNumber || 'MPBP01-008741-2024'}\n` +
      `Petitioner / State: State of Madhya Pradesh (through PS Habibganj, Bhopal)\n` +
      `Investigating Officer: Inspector, Bhopal Police\n\n` +
      `DOCKET SUMMARY & NOTES:\n` +
      `${filing.notes || 'Official judicial submission verified and recorded under the digital chain of custody.'}\n\n` +
      `CRYPTOGRAPHIC INTEGRITY SEAL:\n` +
      `Algorithm: SHA-256 (FIPS 180-4)\n` +
      `Checksum: ${filing.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}\n` +
      `Timestamp Authority: Bhopal District Police Forensic Registry\n` +
      `Status: Tamper-evident, verified\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${filing.id}_CourtFiling.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Charge Sheet': return 'cf-type-chargesheet';
      case 'Bail Application': return 'cf-type-bail';
      case 'Evidence Submission': return 'cf-type-evidence';
      case 'Plea / Application': return 'cf-type-plea';
      case 'Court Order': return 'cf-type-courtorder';
      default: return 'cf-type-other';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Filed': return 'cf-status-filed';
      case 'Under Review': return 'cf-status-under-review';
      case 'Accepted': return 'cf-status-accepted';
      case 'Hearing Scheduled': return 'cf-status-hearing-scheduled';
      case 'Closed': return 'cf-status-closed';
      default: return 'cf-status-filed';
    }
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
              color: '#1E6DEB',
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
                <h3 className="modal-title" style={{ fontSize: '17px' }}>{filing.id}</h3>
                <span className={`cf-type-badge ${getTypeBadgeClass(filing.filingType)}`}>
                  {filing.filingType}
                </span>
                <span className={`cf-status-badge ${getStatusBadgeClass(filing.status)}`}>
                  {filing.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Associated Case <strong style={{ color: '#1E6DEB', cursor: 'pointer' }} onClick={() => { onClose(); onOpenCase(filing.caseNo); }}>{filing.caseNo}</strong>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Title & Description */}
          <div style={{
            padding: '14px',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filing Title & Purpose
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1E293B', marginTop: '4px' }}>
              {filing.title}
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
              {filing.notes || 'Formal submission tendered by Inspector, Bhopal Police before the competent judicial magistrate.'}
            </div>
          </div>

          {/* Key Judicial Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ padding: '10px 12px', border: '1px solid #F1F5F9', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Designated Court</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" color="#1E6DEB">
                  <path d="M8 0a5 5 0 0 0-5 5c0 3.75 5 11 5 11s5-7.25 5-11a5 5 0 0 0-5-5zm0 7.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                </svg>
                {filing.court}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px', marginLeft: '17px' }}>{filing.city}</div>
            </div>

            <div style={{ padding: '10px 12px', border: '1px solid #F1F5F9', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Filing Timestamp</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>{filing.filedDate}</div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>{filing.filedTime}</div>
            </div>

            <div style={{ padding: '10px 12px', border: '1px solid #F1F5F9', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Next Scheduled Hearing</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: filing.nextHearingDate !== '—' ? '#1E293B' : '#94A3B8', marginTop: '2px' }}>
                {filing.nextHearingDate}
              </div>
              {filing.nextHearingTime && (
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>{filing.nextHearingTime}</div>
              )}
            </div>

            <div style={{ padding: '10px 12px', border: '1px solid #F1F5F9', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>E-Courts / CNR Identifier</div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B', marginTop: '2px', fontFamily: 'monospace' }}>
                {filing.cnrNumber || 'MPBP01-008741-2024'}
              </div>
              <div style={{ fontSize: '11px', color: '#10B981', marginTop: '1px' }}>● Verified in State Judicial Registry</div>
            </div>
          </div>

          {/* Cryptographic Proof */}
          <div style={{
            padding: '12px',
            backgroundColor: '#FAFCFE',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" color="#10B981">
                  <path d="M8 0L2 3v5c0 4.42 2.56 8.56 6 9.68 3.44-1.12 6-5.26 6-9.68V3L8 0zm-1 11.5L3.5 8l1.41-1.41L7 8.67l4.09-4.08L12.5 6 7 11.5z"/>
                </svg>
                SHA-256 Tamper-Proof Seal
              </span>
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>INTEGRITY VALID</span>
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '6px 8px',
              borderRadius: '4px',
              color: '#334155',
              wordBreak: 'break-all'
            }}>
              {filing.hash || '8e43b1c67d1a5823c9b740ef82c5a0194871de99c3a0429f556b27d4c8ef128b'}
            </div>
          </div>

          {/* Audit History Snapshot */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Recent Audit Events
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', padding: '6px 10px', background: '#F8FAFC', borderRadius: '4px' }}>
                <span style={{ color: '#1E293B' }}>Filing certified and logged by Inspector (Bhopal Police)</span>
                <span style={{ color: '#64748B' }}>{filing.filedDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', padding: '6px 10px', background: '#F8FAFC', borderRadius: '4px' }}>
                <span style={{ color: '#1E293B' }}>E-Courts CNR linkage confirmed</span>
                <span style={{ color: '#64748B' }}>{filing.filedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={handleDownload}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Download Court Filing
          </button>
        </div>
      </div>
    </div>
  );
}

export function AddCourtFilingModal({ onClose, onAdd, showToast }) {
  const [formData, setFormData] = useState({
    caseNo: '#2024-1768',
    filingType: 'Charge Sheet',
    title: '',
    court: 'District Court',
    city: 'Bhopal',
    filedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    filedTime: '10:00 AM',
    nextHearingDate: '',
    nextHearingTime: '',
    notes: '',
    fileName: ''
  });

  const availableCases = [
    '#2024-1768',
    '#2024-1654',
    '#2024-1432',
    '#2024-1287',
    '#2024-1102',
    '#2023-9845',
    '#2023-7765',
    '#2023-6654'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.caseNo) {
      showToast('A court filing must be associated with an active Case.');
      return;
    }
    if (!formData.title.trim()) {
      showToast('Please specify a title / description for the filing.');
      return;
    }

    const nextIdNum = Math.floor(100 + Math.random() * 900);
    const newFiling = {
      id: `CF-2024-${nextIdNum}`,
      caseNo: formData.caseNo,
      filingType: formData.filingType,
      title: formData.title,
      filedDate: formData.filedDate,
      filedTime: formData.filedTime,
      court: formData.court,
      city: formData.city,
      nextHearingDate: formData.nextHearingDate || '—',
      nextHearingTime: formData.nextHearingTime || '',
      status: 'Filed',
      cnrNumber: `MPBP01-${Math.floor(100000 + Math.random() * 900000)}-2024`,
      notes: formData.notes || 'Formal court filing submitted by Inspector, Bhopal Police.',
      hash: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
    };

    onAdd(newFiling);
    showToast(`Court filing ${newFiling.id} registered and associated with Case ${formData.caseNo}.`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#EBF3FC',
              color: '#1E6DEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 4v12M4 10h12"/>
              </svg>
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '16.5px' }}>Add Court Filing</h3>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                File and track legal documents associated with an investigation
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Associated Case (Required) */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Associated Case Number <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                className="cf-dropdown-select"
                style={{ width: '100%' }}
                value={formData.caseNo}
                onChange={(e) => setFormData({ ...formData, caseNo: e.target.value })}
                required
              >
                {availableCases.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                Every court filing must be formally anchored to an active investigation case.
              </div>
            </div>

            {/* Filing Type & Court */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Filing Type <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  className="cf-dropdown-select"
                  style={{ width: '100%' }}
                  value={formData.filingType}
                  onChange={(e) => setFormData({ ...formData, filingType: e.target.value })}
                >
                  <option value="Charge Sheet">Charge Sheet</option>
                  <option value="Bail Application">Bail Application</option>
                  <option value="Evidence Submission">Evidence Submission</option>
                  <option value="Plea / Application">Plea / Application</option>
                  <option value="Court Order">Court Order</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Adjudicating Court <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  className="cf-dropdown-select"
                  style={{ width: '100%' }}
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                >
                  <option value="District Court">District Court (Bhopal)</option>
                  <option value="Sessions Court">Sessions Court (Bhopal)</option>
                  <option value="Special Court (NDPS)">Special Court (NDPS)</option>
                  <option value="Metropolitan Court">Metropolitan Court</option>
                  <option value="Family Court">Family Court</option>
                </select>
              </div>
            </div>

            {/* Title / Description */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Filing Title / Description <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Filing of Charge Sheet, Bail Opposition Application..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Next Hearing Scheduled (Optional) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Next Hearing Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15 Feb 2024"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                  value={formData.nextHearingDate}
                  onChange={(e) => setFormData({ ...formData, nextHearingDate: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Next Hearing Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:30 AM"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                  value={formData.nextHearingTime}
                  onChange={(e) => setFormData({ ...formData, nextHearingTime: e.target.value })}
                />
              </div>
            </div>

            {/* Filing Document Upload Simulation */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Court Filing Document (PDF / Signed Copy)
              </label>
              <div style={{
                border: '1.5px dashed #CBD5E1',
                borderRadius: '8px',
                padding: '14px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer'
              }} onClick={() => {
                const dummyName = `${formData.title ? formData.title.replace(/\s+/g, '_') : 'Court_Filing'}_certified.pdf`;
                setFormData({ ...formData, fileName: dummyName });
                showToast(`Attached ${dummyName}`);
              }}>
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="#64748B" strokeWidth="1.6" style={{ margin: '0 auto 6px' }}>
                  <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
                  <path d="M12 2V6H16"/>
                </svg>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E6DEB' }}>
                  {formData.fileName ? formData.fileName : 'Click to select court document to attach'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                  PDF up to 25MB • Generates SHA-256 seal automatically
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Case Notes / Compliance Directives
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of court instructions, judicial observations or filing details..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Submit Court Filing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
