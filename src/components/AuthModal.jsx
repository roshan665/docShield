// src/components/AuthModal.jsx
// DocShield Secure Authentication Modal
// Adheres strictly to the existing DocShield design language, tokens, and modal architecture

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS } from '../services/authService';
import { ROLES } from '../constants/roles';

export default function AuthModal({ isOpen, onClose, showToast }) {
  const { signIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('admin@docshield.gov.in');
  const [password, setPassword] = useState('DocShield@2024');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both official email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await signIn(email, password);
      showToast?.('Authentication successful. Session established under CCTNS protocols.');
      if (onClose) onClose();
    } catch (err) {
      console.warn('Sign in error:', err.message);
      setErrorMessage(err.message || 'Invalid officer credentials or unverified session token.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (cred) => {
    setEmail(cred.email);
    setPassword('DocShield@2024');
    setErrorMessage('');
  };

  return (
    <div className="modal-backdrop open" style={{ zIndex: 1000 }}>
      <div 
        className="modal-container" 
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with DocShield Brand Shield */}
        <div className="modal-header" style={{ padding: '20px 24px', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-logo-wrap" style={{ width: '38px', height: '38px' }}>
              <svg className="shield-logo" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '32px' }}>
                <path d="M18 1L2 7V17.5C2 27.5 8.8 36.8 18 39.5C27.2 36.8 34 27.5 34 17.5V7L18 1Z" fill="#0B1E36" stroke="#0B1E36" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M10 13H26M10 19H26M13 25H23" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '17px', color: '#0B1E36', fontWeight: 800 }}>
                DocShield Security Gateway
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                State Police Department • Authentication & RBAC
              </p>
            </div>
          </div>
          {onClose && (
            <button className="modal-close" onClick={onClose} title="Dismiss">✕</button>
          )}
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '20px 24px' }}>
            
            {/* Error Message Alert */}
            {errorMessage && (
              <div 
                style={{ 
                  backgroundColor: '#FEF2F2', 
                  border: '1px solid #FCA5A5', 
                  color: '#DC2626', 
                  padding: '10px 14px', 
                  borderRadius: '6px', 
                  fontSize: '12.5px', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Official Email */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Official Email Address
              </label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@docshield.gov.in"
                style={{ 
                  width: '100%', 
                  padding: '9px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid #CBD5E1', 
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              />
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Password / Secure Passcode
              </label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ 
                  width: '100%', 
                  padding: '9px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid #CBD5E1', 
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              />
            </div>

            {/* Quick Officer Persona Selection for Demo & Evaluation */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Quick Access Officer Personas (Demo & Evaluation):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {DEMO_CREDENTIALS.map((cred) => {
                  const isSelected = email.toLowerCase() === cred.email.toLowerCase();
                  return (
                    <button
                      key={cred.email}
                      type="button"
                      onClick={() => handleQuickSelect(cred)}
                      style={{
                        padding: '8px 10px',
                        border: isSelected ? '1.5px solid #1E6DEB' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                        borderRadius: '6px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#1E6DEB' : '#0F172A' }}>
                        {cred.role === ROLES.ADMIN ? '🛡️ Admin' :
                         cred.role === ROLES.INSPECTOR ? '👮 Inspector' :
                         cred.role === ROLES.LEGAL ? '⚖️ Legal Officer' : '🔬 Forensic Officer'}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {cred.badge}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '12px', lineHeight: '1.4' }}>
              Protected by Supabase Auth with Row Level Security (RLS). All authentication attempts are logged to the immutable audit trail.
            </div>
          </div>

          {/* Footer with Submit Button */}
          <div className="modal-footer" style={{ padding: '14px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            {onClose && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || authLoading}
              style={{ minWidth: '130px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true">⏳</span>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
