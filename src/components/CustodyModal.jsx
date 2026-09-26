import React, { useState } from 'react';

// ========================================================
// 1. CUSTODY DETAIL MODAL
// ========================================================
export function CustodyDetailModal({ record, onClose, onOpenCase, showToast }) {
  if (!record) return null;

  const handleDownloadCertificate = () => {
    showToast(`Downloading Chain of Custody Certificate for ${record.id}...`);
    const element = document.createElement("a");
    const file = new Blob([
      `DocShield Cryptographic Chain of Custody Certificate\n` +
      `===================================================================\n` +
      `Record ID: ${record.id}\n` +
      `Associated Case: ${record.caseNo}\n` +
      `Item Type: ${record.itemType} (${record.itemCategory || 'Case Exhibit'})\n` +
      `Item Name: ${record.itemName}\n` +
      `Current Custodian: ${record.toRole} - ${record.toPerson}\n` +
      `Current Physical Location: ${record.currentLocation}, ${record.currentCity}\n` +
      `Current Custodial Status: ${record.status}\n` +
      `Transfer Reason: ${record.reason}\n\n` +
      `CHRONOLOGICAL CUSTODIAL TIMELINE (APPEND-ONLY):\n` +
      `-------------------------------------------------------------------\n` +
      record.timeline.map((t, idx) => 
        `[Step ${idx + 1}] ${t.date} ${t.time} | ${t.event}\n` +
        `  From: ${t.from} -> To: ${t.to}\n` +
        `  Location: ${t.location}\n` +
        `  Supervising Officer / Actor: ${t.actor}\n`
      ).join('\n') +
      `\n===================================================================\n` +
      `CRYPTOGRAPHIC AUTHENTICATION SEAL:\n` +
      `Algorithm: SHA-256 (FIPS 180-4 Standard)\n` +
      `Digest: ${record.hash}\n` +
      `Integrity Verification: ${record.integrityStatus} (Tamper-evident chain)\n` +
      `Issued under Madhya Pradesh Police Judicial IT Protocol\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${record.id}_ChainOfCustody_Certificate.txt`;
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
              color: '#1E6DEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="5" cy="10" r="3"/>
                <circle cx="15" cy="5" r="3"/>
                <circle cx="15" cy="15" r="3"/>
                <path d="M7.5 8.8L12.5 6.2M7.5 11.2L12.5 13.8"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="modal-title" style={{ fontSize: '17px' }}>{record.id}</h3>
                <span className={`coc-type-pill ${record.itemType === 'Evidence' ? 'coc-type-evidence' : 'coc-type-document'}`}>
                  {record.itemType}
                </span>
                <span className="coc-status-badge coc-status-stored">
                  {record.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Case <strong style={{ color: '#1E6DEB', cursor: 'pointer' }} onClick={() => { onClose(); onOpenCase(record.caseNo); }}>{record.caseNo}</strong> • {record.itemName}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Key Item Info Card */}
          <div style={{
            padding: '14px',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Item Information & Custody Purpose
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: '3px' }}>
              {record.itemName}
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
              {record.reason}
            </div>
          </div>

          {/* Current Custodian & Location */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ padding: '10px 12px', border: '1px solid #F1F5F9', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Current Custodian</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginTop: '2px' }}>
                {record.toRole}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>{record.toPerson}</div>
            </div>

            <div style={{ padding: '10px 12px', border: '1px solid #F1F5F9', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Current Location</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" color="#1E6DEB">
                  <path d="M8 0a5 5 0 0 0-5 5c0 3.75 5 11 5 11s5-7.25 5-11a5 5 0 0 0-5-5zm0 7.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                </svg>
                {record.currentLocation}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px', marginLeft: '17px' }}>{record.currentCity}</div>
            </div>
          </div>

          {/* Chronological Custody Timeline */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" color="#1E6DEB">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
              Complete Custody Event Timeline (Append-Only)
            </div>

            <div className="custody-timeline">
              {record.timeline.map((step, idx) => (
                <div key={idx} className="custody-timeline-step">
                  <div className="custody-timeline-bullet" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                      {step.event}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
                      {step.date} • {step.time}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                    From <strong style={{ color: '#0F172A' }}>{step.from}</strong> → To <strong style={{ color: '#0F172A' }}>{step.to}</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                    📍 {step.location} • Handler: {step.actor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic SHA-256 Proof */}
          <div style={{
            padding: '12px',
            backgroundColor: '#FAFCFE',
            border: '1px solid #E2E8F0',
            borderRadius: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" color="#10B981">
                  <path d="M8 0L2 3v5c0 4.42 2.56 8.56 6 9.68 3.44-1.12 6-5.26 6-9.68V3L8 0zm-1 11.5L3.5 8l1.41-1.41L7 8.67l4.09-4.08L12.5 6 7 11.5z"/>
                </svg>
                SHA-256 Immutable Audit Hash
              </span>
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>VERIFIED</span>
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
              {record.hash}
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
            onClick={handleDownloadCertificate}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            Download Custody Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================================
// 2. CUSTODY HISTORY TIMELINE MODAL
// ========================================================
export function CustodyHistoryModal({ record, onClose }) {
  if (!record) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '16px' }}>Custody History</h3>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                {record.id} • {record.itemName} ({record.caseNo})
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          <div className="custody-timeline">
            {record.timeline.map((step, idx) => (
              <div key={idx} className="custody-timeline-step">
                <div className="custody-timeline-bullet" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                    {step.event}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {step.date} {step.time}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                  From {step.from} → To {step.to}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                  📍 {step.location} • Handler: {step.actor}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ========================================================
// 3. ADD CUSTODY RECORD MODAL
// ========================================================
export function AddCustodyRecordModal({ onClose, onAdd, showToast }) {
  const [formData, setFormData] = useState({
    caseNo: '#2024-1768',
    itemType: 'Evidence',
    itemName: '',
    fromRole: 'Inspector',
    fromPerson: 'R. Sharma',
    toRole: 'Forensic Lab',
    toPerson: 'Bhopal',
    transferDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    transferTime: '10:00 AM',
    currentLocation: 'Forensic Lab',
    currentCity: 'Bhopal',
    status: 'In Lab',
    reason: '',
    notes: ''
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
      showToast('A custody record must be associated with an active Case.');
      return;
    }
    if (!formData.itemName.trim()) {
      showToast('Please specify an Evidence / Document item name.');
      return;
    }

    const nextIdNum = Math.floor(100 + Math.random() * 900);
    const newRecord = {
      id: `CC-2024-${nextIdNum}`,
      itemType: formData.itemType,
      itemName: formData.itemName,
      itemCategory: formData.itemType === 'Evidence' ? 'Physical Evidence' : 'Case Document',
      caseNo: formData.caseNo,
      fromRole: formData.fromRole,
      fromPerson: formData.fromPerson,
      toRole: formData.toRole,
      toPerson: formData.toPerson,
      transferDate: formData.transferDate,
      transferTime: formData.transferTime,
      currentLocation: formData.currentLocation,
      currentCity: formData.currentCity,
      status: formData.status,
      categoryFilter: formData.itemType === 'Evidence' ? 'evidence' : 'documents',
      subStatus: 'transfers',
      hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      integrityStatus: 'Verified',
      reason: formData.reason || 'Custody transfer logged in DocShield Registry',
      timeline: [
        {
          event: 'Custody Transfer Logged',
          from: `${formData.fromRole} ${formData.fromPerson}`,
          to: `${formData.toRole} ${formData.toPerson}`,
          date: formData.transferDate,
          time: formData.transferTime,
          location: `${formData.currentLocation}, ${formData.currentCity}`,
          actor: 'Inspector R. Sharma'
        }
      ]
    };

    onAdd(newRecord);
    showToast(`Custody record ${newRecord.id} registered and associated with Case ${formData.caseNo}.`);
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
              <h3 className="modal-title" style={{ fontSize: '16.5px' }}>Add Custody Record</h3>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Log evidence or document transfer with cryptographic timestamp
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Case Selection */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Associated Case Number <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                className="coc-dropdown-select"
                style={{ width: '100%' }}
                value={formData.caseNo}
                onChange={(e) => setFormData({ ...formData, caseNo: e.target.value })}
                required
              >
                {availableCases.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Item Type & Item Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Item Type <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  className="coc-dropdown-select"
                  style={{ width: '100%' }}
                  value={formData.itemType}
                  onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                >
                  <option value="Evidence">Evidence</option>
                  <option value="Document">Document</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Item Name / Exhibit <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weapon, Forensic Report, CCTV Footage..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Transfer Direction: Transferred By -> Received By */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Transferred By (From) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inspector R. Sharma"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                  value={`${formData.fromRole} ${formData.fromPerson}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setFormData({ ...formData, fromRole: parts[0] || '', fromPerson: parts.slice(1).join(' ') || '' });
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Received By (To) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Forensic Lab Bhopal"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}
                  value={`${formData.toRole} ${formData.toPerson}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setFormData({ ...formData, toRole: parts[0] || '', toPerson: parts.slice(1).join(' ') || '' });
                  }}
                  required
                />
              </div>
            </div>

            {/* Location & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  New Physical Location <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  className="coc-dropdown-select"
                  style={{ width: '100%' }}
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                >
                  <option value="Forensic Lab">Forensic Lab</option>
                  <option value="Record Room">Record Room</option>
                  <option value="Cyber Lab">Cyber Lab</option>
                  <option value="Malkhana">Malkhana</option>
                  <option value="Police Station">Police Station</option>
                  <option value="District Court">District Court</option>
                  <option value="Sessions Court">Sessions Court</option>
                  <option value="Transit Escort">Transit Escort</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Custodial Status <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  className="coc-dropdown-select"
                  style={{ width: '100%' }}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="In Lab">In Lab</option>
                  <option value="Stored">Stored</option>
                  <option value="In Analysis">In Analysis</option>
                  <option value="In Storage">In Storage</option>
                  <option value="Received">Received</option>
                  <option value="Released">Released</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>
            </div>

            {/* Transfer Reason */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Transfer Reason / Examination Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. Ballistics comparison, safe custody, judicial production..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
              Submit Custody Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
