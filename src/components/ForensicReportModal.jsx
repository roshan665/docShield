import React, { useState } from 'react';

export function ForensicDetailModal({ report, onClose, onOpenCase, showToast }) {
  if (!report) return null;

  const handleDownloadReport = () => {
    showToast(`Downloading forensic lab dossier for ${report.id} (${report.name})...`);
    const element = document.createElement("a");
    const file = new Blob([
      `DocShield Certified Forensic Analysis Dossier\n` +
      `=============================================\n` +
      `Report ID: ${report.id}\n` +
      `Report Title: ${report.name}\n` +
      `Investigation Case: ${report.caseNo}\n` +
      `Analysis Division: ${report.type}\n` +
      `Testing Authority: ${report.labPrimary}, ${report.labCity}\n` +
      `Lead Scientist / Examiner: ${report.leadScientist || 'Dr. A. K. Sharma'}\n` +
      `Submission Timestamp: ${report.submittedDate} ${report.submittedTime}\n` +
      `Received / Certified: ${report.receivedDate} ${report.receivedTime}\n` +
      `Status: ${report.status}\n\n` +
      `EVIDENTIARY SPECIMEN:\n` +
      `${report.specimen || 'Direct evidentiary sample lifted from scene'}\n\n` +
      `LABORATORY FINDINGS & EXPERT OPINION:\n` +
      `${report.findings || 'Full quantitative and comparative analysis verified'}\n\n` +
      `CRYPTOGRAPHIC AUTHENTICITY:\n` +
      `Algorithm: SHA-256 (FIPS 180-4)\n` +
      `Digest Baseline: ${report.hash}\n` +
      `Chain of Custody Wax Seal: INTACT / VALIDATED\n\n` +
      `Section 45 Indian Evidence Act / Section 39 Bharatiya Sakshya Adhiniyam Compliant\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${report.id}_ForensicReport.txt`;
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
              backgroundColor: report.iconBg || '#EBF3FC',
              color: report.iconColor || '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2H5C4.4 2 4 2.4 4 3V17C4 17.6 4.4 18 5 18H15C15.6 18 16 17.6 16 17V6L12 2Z"/>
                <path d="M12 2V6H16"/>
                <path d="M8 10H12M8 14H12"/>
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="modal-title" style={{ fontSize: '17px' }}>{report.name}</h3>
                <span className={`fr-status-badge ${
                  report.status === 'Completed' ? 'fr-status-completed' :
                  report.status === 'In Progress' ? 'fr-status-progress' : 'fr-status-review'
                }`}>
                  {report.status}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Report <strong style={{ color: '#1E6DEB' }}>{report.id}</strong> • Case <strong style={{ color: '#1E6DEB', cursor: 'pointer' }} onClick={() => { onClose(); onOpenCase(report.caseNo); }}>{report.caseNo}</strong>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Laboratory</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{report.labPrimary}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{report.labCity}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Lead Examiner</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{report.leadScientist || 'Dr. A. K. Sharma'}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Senior Scientific Officer</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Submitted On</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{report.submittedDate}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{report.submittedTime}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Received On</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>{report.receivedDate}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{report.receivedTime}</div>
            </div>
          </div>

          {/* Specimen Analyzed */}
          <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Tested Specimen / Exhibit</div>
            <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.4' }}>{report.specimen || 'Evidence exhibits submitted under magistrate seal'}</div>
          </div>

          {/* Key Findings */}
          <div style={{ background: '#F0FDF4', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>Scientific Conclusion & Findings</div>
            <div style={{ fontSize: '12.5px', color: '#15803D', lineHeight: '1.4', fontWeight: 500 }}>{report.findings}</div>
          </div>

          {/* Cryptographic SHA-256 seal */}
          <div style={{ background: '#F1F5F9', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>Cryptographic Hash (SHA-256)</span>
              <span className="doc-status-badge status-verified">Intact</span>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all', color: '#1E293B', backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
              {report.hash}
            </div>
          </div>

          {/* Chronological Audit Logs */}
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Chain of Custody & Laboratory Telemetry</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(report.auditLogs || []).map((log, idx) => (
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
            onClick={handleDownloadReport}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 14V16C4 16.5 4.5 17 5 17H15C15.5 17 16 16.5 16 16V14"/>
              <path d="M10 3V13M10 13L6 9M10 13L14 9"/>
            </svg>
            Download Lab Report
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button 
              className="btn-upload-primary"
              onClick={() => {
                showToast(`Report ${report.id} integrity re-verified against RFSL ledger.`);
                onClose();
              }}
            >
              Verify Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddForensicReportModal({ isOpen, onClose, cases, onReportAdded }) {
  const [caseNo, setCaseNo] = useState(cases[0]?.id || '#2024-1768');
  const [reportName, setReportName] = useState('');
  const [analysisType, setAnalysisType] = useState('DNA Analysis');
  const [laboratory, setLaboratory] = useState('State Forensic Lab, Bhopal');
  const [submittedDate, setSubmittedDate] = useState('2024-01-20');
  const [receivedDate, setReceivedDate] = useState('2024-01-25');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reportName.trim()) return;

    const [labPrimary, labCity] = laboratory.split(', ');
    const newReport = {
      id: `FR-2024-${Math.floor(100 + Math.random() * 900)}`,
      name: reportName,
      type: analysisType,
      caseNo: caseNo,
      labPrimary: labPrimary || 'State Forensic Lab',
      labCity: labCity || 'Bhopal',
      submittedDate: '20 Jan 2024',
      submittedTime: '11:00 AM',
      receivedDate: '25 Jan 2024',
      receivedTime: '03:30 PM',
      status: 'Completed',
      iconType: analysisType === 'DNA Analysis' ? 'dna' : analysisType === 'Fingerprints' ? 'fingerprint' : analysisType === 'Ballistics' ? 'target' : 'document',
      iconColor: '#2563EB',
      iconBg: '#EBF3FC',
      fileSize: '3.1 MB',
      leadScientist: 'Dr. A. K. Sharma (Senior Scientific Officer)',
      specimen: notes || 'Specimen submitted under official chain of custody',
      findings: 'Certified scientific laboratory report uploaded and verified under Section 45 IEA / 39 BSA.',
      hash: 'd8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123456789a',
      auditLogs: [
        { timestamp: '20 Jan 2024, 11:00 AM', action: 'Uploaded to DocShield by Inspector', officer: 'Insp. Rajesh Kumar' },
        { timestamp: '25 Jan 2024, 03:30 PM', action: 'Digital Seal Generated', officer: 'DocShield Verification Engine' }
      ]
    };

    onReportAdded(newReport);
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Forensic Report</h3>
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

            <div className="form-group">
              <label>Report Name *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. DNA Analysis Report, Ballistics Examination" 
                value={reportName} 
                onChange={(e) => setReportName(e.target.value)} 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Analysis Type *</label>
                <select value={analysisType} onChange={(e) => setAnalysisType(e.target.value)}>
                  <option value="DNA Analysis">DNA Analysis</option>
                  <option value="Fingerprints">Fingerprints</option>
                  <option value="Ballistics">Ballistics</option>
                  <option value="Toxicology">Toxicology</option>
                  <option value="Cyber Forensics">Cyber Forensics</option>
                  <option value="Digital Analysis">Digital Analysis</option>
                  <option value="Document Analysis">Document Analysis</option>
                  <option value="Biological">Biological</option>
                </select>
              </div>

              <div className="form-group">
                <label>Forensic Laboratory *</label>
                <select value={laboratory} onChange={(e) => setLaboratory(e.target.value)}>
                  <option value="State Forensic Lab, Bhopal">State Forensic Lab, Bhopal</option>
                  <option value="CFSL, New Delhi">CFSL, New Delhi</option>
                  <option value="Cyber Forensic Lab, Bhopal">Cyber Forensic Lab, Bhopal</option>
                  <option value="RFSL, Gwalior">RFSL, Gwalior</option>
                  <option value="RFSL, Indore">RFSL, Indore</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Submitted Date</label>
                <input type="date" value={submittedDate} onChange={(e) => setSubmittedDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Received Date</label>
                <input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Report File (PDF / Certified Docket)</label>
              <input 
                type="file" 
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFileName(e.target.files[0]?.name || '')}
              />
              {fileName && <div style={{ fontSize: '11px', color: '#1E6DEB', marginTop: '4px' }}>Selected: {fileName}</div>}
            </div>

            <div className="form-group">
              <label>Specimen Details & Analysis Remarks</label>
              <textarea 
                rows="2" 
                placeholder="e.g. Blood stained weapon swab forwarded via official seal..."
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save & Register Forensic Report</button>
          </div>
        </form>
      </div>
    </div>
  );
}
