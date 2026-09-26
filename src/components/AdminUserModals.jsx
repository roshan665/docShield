import React, { useState } from 'react';
import { allAvailablePermissions } from '../data/adminUsersData';

export function AddUserModal({ isOpen, onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'Inspector',
    department: 'Investigation',
    phone: '',
    badgeNumber: '',
    status: 'Active',
    permissions: ['Cases', 'Documents', 'Evidence', 'Forensics', 'Charge Sheets', 'Court Filings', 'Chain of Custody', 'Limited Audit']
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handlePermToggle = (permName) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permName);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permName) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permName] };
      }
    });
  };

  const handleRoleChange = (newRole) => {
    let perms = [];
    if (newRole === 'Admin') {
      perms = ['Users', 'Cases', 'Documents', 'Evidence', 'Forensics', 'Charge Sheets', 'Court Filings', 'Chain of Custody', 'Audit Logs', 'System Settings'];
    } else {
      perms = ['Cases', 'Documents', 'Evidence', 'Forensics', 'Charge Sheets', 'Court Filings', 'Chain of Custody', 'Limited Audit'];
    }
    setFormData(prev => ({
      ...prev,
      role: newRole,
      department: newRole === 'Admin' ? 'Administration' : 'Investigation',
      permissions: perms
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Official police email is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      username: formData.username.trim().toLowerCase(),
      role: formData.role,
      department: formData.department,
      status: formData.status,
      lastActive: 'Just now',
      phone: formData.phone || '+91 98260 00000',
      badgeNumber: formData.badgeNumber || `MP-${formData.role.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdOn: 'Today',
      permissions: formData.permissions,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      initials: formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    };

    onUserCreated(newUser);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-dialog large" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Create New System User</h3>
          <button className="admin-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="admin-form-input"
                  placeholder="e.g. R. Sharma or Insp. Rajesh Kumar"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <span style={{ color: '#EF4444', fontSize: '11px' }}>{errors.name}</span>}
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Official Email ID *</label>
                <input 
                  type="email" 
                  className="admin-form-input"
                  placeholder="name@police.gov.in"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <span style={{ color: '#EF4444', fontSize: '11px' }}>{errors.email}</span>}
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Username *</label>
                <input 
                  type="text" 
                  className="admin-form-input"
                  placeholder="e.g. rsharma"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
                {errors.username && <span style={{ color: '#EF4444', fontSize: '11px' }}>{errors.username}</span>}
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">System Role *</label>
                <select 
                  className="admin-form-select"
                  value={formData.role}
                  onChange={e => handleRoleChange(e.target.value)}
                >
                  <option value="Inspector">Inspector</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Department *</label>
                <select 
                  className="admin-form-select"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Investigation">Investigation</option>
                  <option value="Administration">Administration</option>
                  <option value="Cyber Crime Cell">Cyber Crime Cell</option>
                  <option value="Forensic Science Lab">Forensic Science Lab</option>
                  <option value="Prosecution Liaison">Prosecution Liaison</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Account Status</label>
                <select 
                  className="admin-form-select"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Away">Away</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Police Phone / CCTNS Ext.</label>
                <input 
                  type="text" 
                  className="admin-form-input"
                  placeholder="+91 98260 XXXXX"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Badge / Warrant No.</label>
                <input 
                  type="text" 
                  className="admin-form-input"
                  placeholder="e.g. MP-IND-0412"
                  value={formData.badgeNumber}
                  onChange={e => setFormData({ ...formData, badgeNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Security Privileges & Module Access</label>
              <div className="admin-permissions-grid">
                {allAvailablePermissions.map(perm => (
                  <label key={perm.id} className="admin-perm-checkbox-item">
                    <input 
                      type="checkbox"
                      checked={formData.permissions.includes(perm.name)}
                      onChange={() => handlePermToggle(perm.name)}
                    />
                    <span>{perm.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn-primary">+ Create User Account</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UserDetailModal({ user, isOpen, onClose, onEdit, onToggleStatus }) {
  if (!isOpen || !user) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-dialog large" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">User Account Profile</h3>
          <button className="admin-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-body">
          {/* Header Profile */}
          <div className="user-detail-profile-header">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="user-detail-large-avatar" />
            ) : (
              <div className="user-detail-large-avatar user-avatar-fallback">
                {user.initials || user.name.slice(0, 2)}
              </div>
            )}
            <div className="user-detail-header-info">
              <div className="user-detail-name">{user.name}</div>
              <div className="user-detail-tags">
                <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                <span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Dept: {user.department}</span>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="user-detail-meta-grid">
            <div className="user-meta-field">
              <span className="user-meta-field-label">Official Email</span>
              <span className="user-meta-field-val">{user.email}</span>
            </div>
            <div className="user-meta-field">
              <span className="user-meta-field-label">System Username</span>
              <span className="user-meta-field-val">@{user.username}</span>
            </div>
            <div className="user-meta-field">
              <span className="user-meta-field-label">Police Phone</span>
              <span className="user-meta-field-val">{user.phone || '+91 98260 11442'}</span>
            </div>
            <div className="user-meta-field">
              <span className="user-meta-field-label">Badge Number</span>
              <span className="user-meta-field-val">{user.badgeNumber || 'MP-POL-0421'}</span>
            </div>
            <div className="user-meta-field">
              <span className="user-meta-field-label">Account Created</span>
              <span className="user-meta-field-val">{user.createdOn || '14 Feb 2023'}</span>
            </div>
            <div className="user-meta-field">
              <span className="user-meta-field-label">Last Activity</span>
              <span className="user-meta-field-val">{user.lastActive}</span>
            </div>
          </div>

          {/* Module Permissions */}
          <div>
            <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
              Authorized Modules & Roles
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(user.permissions || ['Cases', 'Documents', 'Evidence', 'Chain of Custody']).map((perm, idx) => (
                <span 
                  key={idx} 
                  style={{
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    color: '#334155',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}
                >
                  ✓ {perm}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Auditable Activities */}
          <div>
            <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
              Recent Audit Activity
            </h4>
            <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <strong>Session Auth:</strong> Authenticated via Police MFA Token • <em>{user.lastActive}</em>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <strong>Cryptographic Seal:</strong> Validated digital integrity on docket #2024-1768 • <em>Yesterday</em>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button 
            type="button" 
            className={user.status === 'Inactive' ? 'admin-btn-primary' : 'admin-btn-danger'} 
            onClick={() => onToggleStatus(user)}
          >
            {user.status === 'Inactive' ? 'Activate Account' : 'Deactivate Account'}
          </button>
          <button type="button" className="admin-btn-secondary" onClick={() => onEdit(user)}>Edit User</button>
          <button type="button" className="admin-btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

export function EditUserModal({ user, isOpen, onClose, onUserUpdated }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Inspector',
    department: user?.department || 'Investigation',
    status: user?.status || 'Active',
    permissions: user?.permissions || []
  });

  if (!isOpen || !user) return null;

  const handlePermToggle = (permName) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permName);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permName) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permName] };
      }
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      status: formData.status,
      permissions: formData.permissions
    };
    onUserUpdated(updated);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Edit User — {user.name}</h3>
          <button className="admin-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave}>
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <label className="admin-form-label">Full Name</label>
              <input 
                type="text" 
                className="admin-form-input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Email</label>
              <input 
                type="email" 
                className="admin-form-input"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="admin-form-grid-2">
              <div className="admin-form-group">
                <label className="admin-form-label">Role</label>
                <select 
                  className="admin-form-select"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Inspector">Inspector</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Status</label>
                <select 
                  className="admin-form-select"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Away">Away</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Department</label>
              <select 
                className="admin-form-select"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Investigation">Investigation</option>
                <option value="Administration">Administration</option>
                <option value="Cyber Crime Cell">Cyber Crime Cell</option>
                <option value="Forensic Science Lab">Forensic Science Lab</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Module Permissions</label>
              <div className="admin-permissions-grid">
                {allAvailablePermissions.map(perm => (
                  <label key={perm.id} className="admin-perm-checkbox-item">
                    <input 
                      type="checkbox"
                      checked={formData.permissions.includes(perm.name)}
                      onChange={() => handlePermToggle(perm.name)}
                    />
                    <span>{perm.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ReviewApprovalModal({ request, isOpen, onClose, onAction }) {
  if (!isOpen || !request) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Review Access Request</h3>
          <button className="admin-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
            <div className="pending-item-icon-box">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6l-5-4z"/>
                <path d="M12 2v4h4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>{request.title}</div>
              <div style={{ fontSize: '12.5px', color: '#64748B' }}>{request.subtitle}</div>
            </div>
          </div>

          <div className="user-detail-meta-grid">
            <div className="user-meta-field">
              <span className="user-meta-field-label">Requested By</span>
              <span className="user-meta-field-val">{request.requestedBy}</span>
            </div>
            <div className="user-meta-field">
              <span className="user-meta-field-label">Submission Date</span>
              <span className="user-meta-field-val">{request.timestamp}</span>
            </div>
            <div className="user-meta-field">
              <span className="user-meta-field-label">Target Officer</span>
              <span className="user-meta-field-val">{request.targetUser || 'Officer Candidate'}</span>
            </div>
            <div className="user-meta-field">
              <span className="user-meta-field-label">Status</span>
              <span className="status-badge pending" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                {request.status}
              </span>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Justification & Audit Context</label>
            <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: 0, padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              {request.details}
            </p>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button 
            type="button" 
            className="admin-btn-danger" 
            onClick={() => onAction(request.id, 'reject')}
          >
            Reject Request
          </button>
          <button 
            type="button" 
            className="admin-btn-primary" 
            onClick={() => onAction(request.id, 'approve')}
          >
            Approve & Grant Privileges
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuickActionModal({ type, isOpen, onClose, showToast }) {
  if (!isOpen) return null;

  const titles = {
    roles: 'Role & Privilege Management',
    audit: 'Administrative Audit Access Log',
    settings: 'DocShield System Settings'
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{titles[type] || 'System Action'}</h3>
          <button className="admin-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-body">
          {type === 'roles' ? (
            <div>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                Configure role templates and default permission sets across investigation hierarchy:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <div style={{ padding: '10px', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#1E6DEB' }}>Inspector Role (74 Users)</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>Access to Cases, Evidence, Forensics, Charge Sheets, Court Filings, Custody</div>
                </div>
                <div style={{ padding: '10px', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#9333EA' }}>Admin Role (3 Users)</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>Full access to User Management, System Oversight, Audit Logs, Settings</div>
                </div>
              </div>
            </div>
          ) : type === 'settings' ? (
            <div>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                System Cryptography & Agency Configuration:
              </p>
              <ul style={{ fontSize: '12.5px', color: '#334155', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>SHA-256 Hashing Algorithm: <strong>Enabled & Enforced</strong></li>
                <li>Digital Signature Standard: <strong>Section 65B Indian Evidence Act</strong></li>
                <li>Audit Immutability: <strong>Append-Only Active</strong></li>
                <li>Session Timeout: <strong>30 minutes idle</strong></li>
              </ul>
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: '#475569' }}>
              Redirecting to cryptographic Audit Logs stream...
            </p>
          )}
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="admin-btn-secondary" onClick={onClose}>Close</button>
          <button 
            type="button" 
            className="admin-btn-primary" 
            onClick={() => {
              showToast?.("Administrative settings verified and saved.");
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
