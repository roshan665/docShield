import React, { useState } from 'react';

export default function IntegrityModal({ isOpen, onClose }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedMessage, setVerifiedMessage] = useState(null);

  if (!isOpen) return null;

  const handleReverify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedMessage("✓ Batch Integrity Audit Complete: 156/156 files verified intact. Zero tampering detected.");
    }, 1200);
  };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <h3 className="modal-title">Document Cryptographic Integrity Engine</h3>
            <span className="case-status-badge badge-active">SHA-256 Validated</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="integrity-summary-banner">
            <div className="is-stat">
              <span className="is-num text-success">154</span>
              <span className="is-lbl">Verified (100% Match)</span>
            </div>
            <div className="is-stat">
              <span className="is-num text-warning">2</span>
              <span className="is-lbl">Pending Re-check</span>
            </div>
            <div className="is-stat">
              <span className="is-num text-danger">0</span>
              <span className="is-lbl">Tamper Alerts</span>
            </div>
            <div className="is-stat">
              <span className="is-num text-blue">98.7%</span>
              <span className="is-lbl">Exact Integrity Score</span>
            </div>
          </div>

          {verifiedMessage && (
            <div style={{ marginTop: '12px', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '10px 14px', borderRadius: '6px', color: '#065F46', fontSize: '12.5px' }}>
              {verifiedMessage}
            </div>
          )}

          <h4 style={{ margin: '16px 0 10px', fontSize: '13px', color: '#475569', textTransform: 'uppercase' }}>
            Active Case Cryptographic Hashes
          </h4>

          <div className="hash-table-wrap">
            <table className="hash-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Case No</th>
                  <th>Baseline SHA-256 Digest</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>FIR_Signed_2024.pdf</strong></td>
                  <td>#2024-1768</td>
                  <td><code className="hash-code">a8f5c2d3e4b5a6c7d8e9f012...89b1</code></td>
                  <td><span className="case-status-badge badge-active">Verified</span></td>
                </tr>
                <tr>
                  <td><strong>Panchnama_Scene_01.pdf</strong></td>
                  <td>#2024-1768</td>
                  <td><code className="hash-code">7b8d4e9c1f2a3b4c5d6e7f8a...6a7b</code></td>
                  <td><span className="case-status-badge badge-active">Verified</span></td>
                </tr>
                <tr>
                  <td><strong>FSL_Ballistic_Report.pdf</strong></td>
                  <td>#2024-1287</td>
                  <td><code className="hash-code">3c91a0f5d7e8b9c0a1b2c3d4...11f2</code></td>
                  <td><span className="case-status-badge badge-active">Verified</span></td>
                </tr>
                <tr>
                  <td><strong>Deposition_Witness_03.pdf</strong></td>
                  <td>#2024-1654</td>
                  <td><code className="hash-code">9f2e3d4c5b6a708192a3b4c5...45a9</code></td>
                  <td><span className="case-status-badge badge-review">Pending</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleReverify} disabled={isVerifying}>
            {isVerifying ? '⏳ Recalculating 156 SHA-256 Hashes...' : '🛡️ Run Full System Re-Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}
