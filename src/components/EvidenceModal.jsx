import React, { useState, useEffect } from 'react';

export default function EvidenceModal({ isOpen, onClose, targetCaseId, cases, onEvidenceAdded }) {
  const [caseId, setCaseId] = useState(targetCaseId || (cases[0]?.id || '#2024-1768'));
  const [tag, setTag] = useState(`EV-BH-2024-${Math.floor(100 + Math.random() * 900)}`);
  const [category, setCategory] = useState('Firearm');
  const [location, setLocation] = useState('Station Malkhana Vault Room #2');
  const [description, setDescription] = useState('');

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
    onEvidenceAdded(caseId, tag, category, location, description);
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Log Seized Evidence Item</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Associated Case *</label>
              <select value={caseId} onChange={(e) => setCaseId(e.target.value)}>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.id} — {c.section}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Evidence Tag / Barcode ID *</label>
              <input type="text" required value={tag} onChange={(e) => setTag(e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Evidence Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Firearm">Firearm / Weapon</option>
                  <option value="Electronic">Electronic / Phone / CCTV</option>
                  <option value="Biological">Biological / Blood Sample</option>
                  <option value="Documentary">Documentary Evidence</option>
                  <option value="Narcotics">Narcotics / Substance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Initial Custody Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Item Description & Seizure Panchnama Reference</label>
              <textarea 
                rows="2" 
                placeholder="e.g. 0.315 Bore pistol recovered from crime scene..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save & Register Custody</button>
          </div>
        </form>
      </div>
    </div>
  );
}
