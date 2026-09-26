import React, { useState } from 'react';

export default function CaseDetailModal({ caseData, onClose, onUploadDoc, onLogEvidence, showToast }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!caseData) return null;

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-case-no">{caseData.id}</div>
            <span className={`case-status-badge ${
              caseData.status === 'Active' ? 'badge-active' :
              caseData.status === 'Under Review' ? 'badge-review' : 'badge-closed'
            }`}>
              {caseData.status}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`modal-tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents ({caseData.documentsCount})
          </button>
          <button 
            className={`modal-tab ${activeTab === 'evidence' ? 'active' : ''}`}
            onClick={() => setActiveTab('evidence')}
          >
            Evidence ({caseData.evidenceCount})
          </button>
          <button 
            className={`modal-tab ${activeTab === 'custody' ? 'active' : ''}`}
            onClick={() => setActiveTab('custody')}
          >
            Chain of Custody
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-body">
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>LEGAL OFFENSE SECTION</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0E1B2C', marginTop: '2px' }}>{caseData.section}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>INVESTIGATING OFFICER (IO)</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E6DEB', marginTop: '2px' }}>{caseData.io}</div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>INCIDENT SUMMARY</label>
                <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px' }}>
                  {caseData.summary}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                <span><strong>Station:</strong> {caseData.station}</span>
                <span><strong>Assigned Date:</strong> {caseData.assignedDate}</span>
                <span><strong>Last Updated:</strong> {caseData.lastUpdated}</span>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>All documents secured with SHA-256 baseline hashing.</span>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  onClick={() => onUploadDoc(caseData.id)}
                >
                  + Upload Document
                </button>
              </div>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                {caseData.documents && caseData.documents.length > 0 ? (
                  caseData.documents.map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#0E1B2C' }}>{doc.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          Type: <strong>{doc.type}</strong> • Size: {doc.size} • SHA-256: <code className="hash-code">{doc.hash}</code>
                        </div>
                      </div>
                      <span className="case-status-badge badge-active">{doc.status}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>No documents uploaded yet.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Seized Property Schedule (Section 100 CrPC / 105 BNSS)</span>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  onClick={() => onLogEvidence(caseData.id)}
                >
                  + Log Evidence
                </button>
              </div>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                {caseData.evidence && caseData.evidence.length > 0 ? (
                  caseData.evidence.map((ev, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: '#1E6DEB', fontSize: '12px' }}>{ev.tag}</span>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#0E1B2C', marginTop: '2px' }}>{ev.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Current Custodian: <strong>{ev.holder}</strong></div>
                      </div>
                      <span className="case-status-badge badge-review">{ev.status}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>No evidence registered yet.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'custody' && (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '12px', color: '#64748B' }}>
                Unbroken Chronological Chain of Custody (Section 65B/63 Electronic Record Compliance)
              </div>
              <div style={{ paddingLeft: '4px' }}>
                <div style={{ position: 'relative', paddingLeft: '20px', marginBottom: '14px', borderLeft: '2px solid #BFDBFE' }}>
                  <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', borderRadius: '50%', background: '#1E6DEB' }}></div>
                  <div style={{ fontSize: '11px', color: '#1E6DEB', fontWeight: 700 }}>{caseData.lastUpdated}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0E1B2C', marginTop: '2px' }}>Safe Custodial Vault Deposit</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                    Released by: <strong>{caseData.io}</strong> ➔ Received by: <strong>HC R. Verma (Malkhana)</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>Road Certificate: RC-BH-2024-410</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (showToast) {
                showToast(`Exported certified digital case dossier for ${caseData.id} with SHA-256 seal.`);
              } else {
                alert(`Exported certified digital case dossier for ${caseData.id}.`);
              }
              onClose();
            }}
          >
            Export Certified Dossier
          </button>
        </div>

      </div>
    </div>
  );
}
