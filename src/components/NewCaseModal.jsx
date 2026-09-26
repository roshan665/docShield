import React, { useState } from 'react';

export default function NewCaseModal({ isOpen, onClose, onCaseCreated }) {
  const [caseNo, setCaseNo] = useState(`#2024-${Math.floor(1800 + Math.random() * 200)}`);
  const [section, setSection] = useState('IPC 302 - Homicide');
  const [status, setStatus] = useState('Active');
  const [summary, setSummary] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caseNo || !section) return;

    const newCase = {
      id: caseNo,
      section,
      status,
      assignedDate: 'Today',
      lastUpdated: 'Just now',
      documentsCount: 1,
      evidenceCount: 0,
      complainant: 'Direct Police Cognizance',
      station: 'Bhopal Central Police Station',
      io: 'Insp. Rajesh Kumar',
      summary: summary || 'Preliminary investigation initialized under IO purview.',
      documents: [
        { name: 'Initial_Registration_Memo.pdf', type: 'FIR', hash: 'a1b2c3d4...8899', status: 'Verified', size: '1.2 MB' }
      ],
      evidence: []
    };

    onCaseCreated(newCase);
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create New Investigation Case</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Case / Crime Number *</label>
              <input 
                type="text" 
                required 
                value={caseNo} 
                onChange={(e) => setCaseNo(e.target.value)} 
              />
            </div>
            
            <div className="form-group">
              <label>Legal Offense Section (IPC / BNS) *</label>
              <select value={section} onChange={(e) => setSection(e.target.value)}>
                <option value="IPC 302 - Homicide">IPC 302 - Homicide</option>
                <option value="IPC 376 - Assault">IPC 376 - Assault</option>
                <option value="IPC 420 - Fraud">IPC 420 - Fraud</option>
                <option value="NDPS Act">NDPS Act</option>
                <option value="IPC 304 - Culpable Homicide">IPC 304 - Culpable Homicide</option>
                <option value="IPC 379 - Theft">IPC 379 - Theft</option>
                <option value="IPC 307 - Attempt to Murder">IPC 307 - Attempt to Murder</option>
                <option value="IPC 498A - Domestic Violence">IPC 498A - Domestic Violence</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Initial Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>
              <div className="form-group">
                <label>Police Station</label>
                <input type="text" value="Bhopal Central PS" readOnly className="input-readonly" />
              </div>
            </div>

            <div className="form-group">
              <label>Brief Case Summary</label>
              <textarea 
                rows="3" 
                placeholder="Enter preliminary details and complainant information..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">+ Register Case</button>
          </div>
        </form>
      </div>
    </div>
  );
}
