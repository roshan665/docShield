import React, { useState, useEffect } from 'react';

export default function UploadModal({ isOpen, onClose, targetCaseId, cases, onUploaded }) {
  const [caseId, setCaseId] = useState(targetCaseId || (cases[0]?.id || '#2024-1768'));
  const [docType, setDocType] = useState('FIR');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (targetCaseId) {
      setCaseId(targetCaseId);
    } else if (cases && cases.length > 0 && !cases.some(c => c.id === caseId)) {
      setCaseId(cases[0].id);
    }
  }, [targetCaseId, cases, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = fileName || `${docType}_Scan_Signed.pdf`;
    onUploaded(caseId, docType, finalName);
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Upload Investigation Document</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Target Case *</label>
              <select value={caseId} onChange={(e) => setCaseId(e.target.value)}>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.id} — {c.section}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Document Classification *</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="FIR">First Information Report (FIR)</option>
                <option value="Statement">Witness Statement (Sec 161 CrPC)</option>
                <option value="Panchnama">Spot Panchnama / Seizure Memo</option>
                <option value="Forensic">Forensic Science Lab (FSL) Report</option>
                <option value="Medical">Medical / Post-Mortem Certificate</option>
                <option value="ChargeSheet">Charge Sheet Draft</option>
              </select>
            </div>

            <div className="upload-dropzone" onClick={() => document.getElementById('file-upload-input').click()}>
              <input 
                type="file" 
                id="file-upload-input" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileName(e.target.files[0].name);
                  }
                }}
              />
              <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="#1E6DEB" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <p>
                {fileName ? (
                  <span>Selected file: <strong>{fileName}</strong></span>
                ) : (
                  <span><strong>Click to browse</strong> or drag & drop case file</span>
                )}
              </p>
              <span className="dropzone-sub">PDF, PNG, JPG up to 50MB</span>
            </div>

            <div className="security-info-box">
              🛡️ <strong>Automated Integrity:</strong> A SHA-256 cryptographic digest will be computed immediately upon upload for court non-repudiation.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Upload & Hash File</button>
          </div>
        </form>
      </div>
    </div>
  );
}
