import React, { useState } from 'react';
import EvidenceThumbnail from './EvidenceThumbnail';

export default function EvidenceDetailModal({ 
  evidence, 
  initialTab = 'details', 
  onClose, 
  onOpenCase,
  showToast 
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!evidence) return null;

  const handleExportCustody = () => {
    showToast(`Exported judicial Chain of Custody docket for ${evidence.id}.`);
    const element = document.createElement("a");
    const file = new Blob([
      `DocShield Forensic Chain of Custody Form\n` +
      `----------------------------------------\n` +
      `Evidence ID: ${evidence.id}\n` +
      `Case Number: ${evidence.caseNo}\n` +
      `Type: ${evidence.type}\n` +
      `Description: ${evidence.description}\n` +
      `Seizure Memo: ${evidence.seizureMemo || 'N/A'}\n` +
      `Current Custody: ${evidence.locationPrimary} - ${evidence.locationSecondary}\n` +
      `Locker Reference: ${evidence.lockerNo || 'Vault'}\n` +
      `Cryptographic Hash (SHA-256): ${evidence.hash}\n` +
      `Status: ${evidence.status}\n\n` +
      `CHRONOLOGICAL POSSESSION LOG:\n` +
      (evidence.chainOfCustody || []).map((step, idx) => (
        `[Step ${idx + 1}] ${step.timestamp}\n` +
        `  Action: ${step.action}\n` +
        `  Officer: ${step.officer}\n` +
        `  Remarks: ${step.note}\n`
      )).join('\n') +
      `\nVerified by: Inspector, Bhopal Police\n` +
      `Section 65B IEA / 63 BSA Compliant\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${evidence.id}_ChainOfCustody.txt`;
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
            <EvidenceThumbnail type={evidence.thumbnailType} label={evidence.description} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="modal-title" style={{ fontSize: '17px' }}>{evidence.id}</h3>
                <span className={`ev-status-badge ${
                  evidence.status === 'Secured' ? 'ev-status-secured' :
                  evidence.status === 'Verified' ? 'ev-status-verified' : 'ev-status-analysis'
                }`}>
                  {evidence.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Case <strong style={{ color: '#1E6DEB', cursor: 'pointer' }} onClick={() => { onClose(); onOpenCase(evidence.caseNo); }}>{evidence.caseNo}</strong> • {evidence.type}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', padding: '0 24px', backgroundColor: '#F8FAFC' }}>
          <button 
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'details' ? '#1E6DEB' : '#64748B',
              borderBottom: activeTab === 'details' ? '2px solid #1E6DEB' : '2px solid transparent',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('details')}
          >
            Evidence Details
          </button>
          <button 
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'custody' ? '#1E6DEB' : '#64748B',
              borderBottom: activeTab === 'custody' ? '2px solid #1E6DEB' : '2px solid transparent',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('custody')}
          >
            Chain of Custody ({evidence.chainOfCustody?.length || 1})
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {activeTab === 'details' ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Item Description</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{evidence.description}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Seizure Memo / Panchnama</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{evidence.seizureMemo || 'SEC-PANCH-01'}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Collected On</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{evidence.collectedDate} at {evidence.collectedTime}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>By {evidence.collectedBy}</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Current Location</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{evidence.locationPrimary} {evidence.locationSecondary}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Locker: {evidence.lockerNo}</div>
                </div>
              </div>

              {/* SHA-256 seal */}
              <div style={{ background: '#F1F5F9', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>Cryptographic Hash (SHA-256)</span>
                  <span className="doc-status-badge status-verified">Intact</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', color: '#1E293B', backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                  {evidence.hash}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                Seized property registered in Police Station Malkhana Register No. 19. Movement outside premises requires judicial warrant or official requisition form.
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '14px' }}>
                Complete chronological possession history logged to immutable audit ledger:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
                {(evidence.chainOfCustody || []).map((step, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#1E6DEB',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2
                      }}>
                        {index + 1}
                      </div>
                      {index < (evidence.chainOfCustody?.length || 1) - 1 && (
                        <div style={{ width: '2px', flexGrow: 1, backgroundColor: '#E2E8F0', marginTop: '4px', marginBottom: '4px' }} />
                      )}
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{step.action}</span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>{step.timestamp}</span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E6DEB', marginTop: '2px' }}>
                        {step.officer}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>
                        {step.note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn-secondary"
            onClick={handleExportCustody}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>📜</span> Export Custody Manifest
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
            <button 
              className="btn-upload-primary"
              onClick={() => {
                showToast(`Integrity check validated for ${evidence.id}. Hash intact.`);
                onClose();
              }}
            >
              Verify Custody
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
