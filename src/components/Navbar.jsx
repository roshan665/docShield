// src/components/Navbar.jsx
// DocShield Enterprise Top Navigation Header
// Reusable, compact, responsive horizontal header matching reference specification

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  activePage, 
  setActivePage, 
  onOpenCase, 
  currentRole: propRole, 
  setCurrentRole: propSetCurrentRole,
  showToast,
  onOpenAuth
}) {
  const auth = useAuth();
  const currentRole = propRole || auth.currentRole;
  const setCurrentRole = propSetCurrentRole || auth.setCurrentRole;
  const user = auth.user;
  const profile = auth.profile;
  const activePersona = auth.activePersona;

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [hasUnread, setHasUnread] = useState(true);

  // Viewport resize tracking for intelligent overflow adaptation
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1600
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest('.nav-more-wrap')) {
        setMoreOpen(false);
      }
      if (!e.target.closest('.nav-notif-wrap')) {
        setNotifOpen(false);
      }
      if (!e.target.closest('.nav-profile-wrap')) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = currentRole === 'admin';
  const isLegal = currentRole === 'legal' || currentRole === 'legal_officer';
  const isForensic = currentRole === 'forensic' || currentRole === 'forensic_officer';

  // Navigation Items Definitions
  const dashboardItem = {
    id: isAdmin ? 'adminDashboard' : 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L10 3L17 9.5V17C17 17.5 16.5 18 16 18H4C3.5 18 3 17.5 3 17V9.5Z"/>
        <path d="M8 18V11H12V18"/>
      </svg>
    )
  };

  const usersItem = {
    id: 'users',
    label: 'Users',
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 17v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 15.5V17"/>
        <circle cx="10" cy="6.5" r="3.5"/>
      </svg>
    )
  };

  const casesItem = {
    id: 'cases',
    label: 'Cases',
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="14" height="11" rx="2"/>
        <path d="M7 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        <path d="M3 10.5h14"/>
      </svg>
    )
  };

  const documentsItem = {
    id: 'documents',
    label: 'Documents',
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5z"/>
        <polyline points="12 2 12 7 17 7"/>
        <line x1="7" y1="11" x2="13" y2="11"/>
        <line x1="7" y1="15" x2="11" y2="15"/>
      </svg>
    )
  };

  const evidenceItem = {
    id: 'evidence',
    label: 'Evidence',
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2.5L3.5 6.25V13.75L10 17.5L16.5 13.75V6.25L10 2.5Z"/>
        <path d="M10 2.5V17.5M3.5 6.25L10 10L16.5 6.25"/>
      </svg>
    )
  };

  const forensicItem = {
    id: 'forensic',
    label: 'Forensic Reports',
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3h6M10 3v5M6 17h8M10 8L6 14a2 2 0 0 0 1.7 3h4.6a2 2 0 0 0 1.7-3L10 8z"/>
      </svg>
    )
  };

  const chargeSheetsItem = {
    id: 'chargeSheets',
    label: 'Charge Sheets',
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5z"/>
        <polyline points="12 2 12 7 17 7"/>
        <path d="M8 12l2 2 4-4"/>
      </svg>
    )
  };

  const courtFilingsItem = {
    id: 'courtFilings',
    label: 'Court Filings',
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 7l8-4 8 4M3 7v9M7 7v9M11 7v9M15 7v9M1 16h18M1 19h18"/>
      </svg>
    )
  };

  const custodyItem = {
    id: 'custody',
    label: 'Chain of Custody',
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="9" width="12" height="9" rx="2"/>
        <path d="M7 9V6a3 3 0 0 1 6 0v3"/>
        <circle cx="10" cy="13.5" r="1" fill="currentColor"/>
      </svg>
    )
  };

  const auditLogsItem = {
    id: 'auditLogs',
    label: 'Audit Logs',
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2L3 5v6c0 5 7 7 7 7s7-2 7-7V5l-7-3z"/>
        <polyline points="10 7 10 10 12 12"/>
      </svg>
    )
  };

  const settingsItem = {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="3"/>
        <path d="M16.5 10c0-.3-.02-.6-.07-.9l1.64-1.28a.4.4 0 0 0 .1-.51l-1.55-2.68a.4.4 0 0 0-.49-.17l-1.93.78a5.5 5.5 0 0 0-1.56-.9l-.3-2.06A.4.4 0 0 0 12 2h-3.1a.4.4 0 0 0-.4.38l-.3 2.06c-.56.24-1.08.54-1.56.9l-1.93-.78a.4.4 0 0 0-.49.17L2.67 7.41a.4.4 0 0 0 .1.51l1.64 1.28c-.05.3-.07.6-.07.9s.02.6.07.9l-1.64 1.28a.4.4 0 0 0-.1.51l1.55 2.68c.11.2.35.27.49.17l1.93-.78c.48.36 1 .66 1.56.9l.3 2.06c.04.22.21.38.4.38H12c.2 0 .37-.16.4-.38l.3-2.06c.56-.24 1.08-.54 1.56-.9l1.93.78c.14.1.38.03.49-.17l1.55-2.68a.4.4 0 0 0-.1-.51l-1.64-1.28c.05-.3.07-.6.07-.9z"/>
      </svg>
    )
  };

  // Compile role-permitted items
  let basePrimary = [];
  let baseMore = [auditLogsItem];

  if (isAdmin) {
    basePrimary = [
      dashboardItem,
      usersItem,
      casesItem,
      documentsItem,
      evidenceItem,
      forensicItem,
      chargeSheetsItem,
      courtFilingsItem
    ];
    baseMore = [custodyItem, auditLogsItem, settingsItem];
  } else if (isForensic) {
    basePrimary = [
      dashboardItem,
      casesItem,
      evidenceItem,
      custodyItem,
      forensicItem,
      documentsItem
    ];
    baseMore = [auditLogsItem];
  } else {
    // Inspector & Legal Officer
    basePrimary = [
      dashboardItem,
      casesItem,
      documentsItem,
      evidenceItem,
      custodyItem,
      forensicItem,
      chargeSheetsItem,
      courtFilingsItem
    ];
    baseMore = [auditLogsItem];
  }

  // Responsive item distribution: fold secondary items into "More" on narrower screens
  let visiblePrimary = [...basePrimary];
  let visibleMore = [...baseMore];

  if (windowWidth < 1440 && visiblePrimary.some(i => i.id === 'courtFilings')) {
    visiblePrimary = visiblePrimary.filter(i => i.id !== 'courtFilings');
    visibleMore.unshift(courtFilingsItem);
  }
  if (windowWidth < 1340 && visiblePrimary.some(i => i.id === 'chargeSheets')) {
    visiblePrimary = visiblePrimary.filter(i => i.id !== 'chargeSheets');
    visibleMore.unshift(chargeSheetsItem);
  }
  if (windowWidth < 1220 && visiblePrimary.some(i => i.id === 'forensic')) {
    visiblePrimary = visiblePrimary.filter(i => i.id !== 'forensic');
    visibleMore.unshift(forensicItem);
  }

  const isItemActive = (id) => {
    if (id === 'adminDashboard' || id === 'dashboard') {
      return activePage === 'adminDashboard' || activePage === 'dashboard';
    }
    return activePage === id;
  };

  const isMoreActive = visibleMore.some(item => isItemActive(item.id));

  // Officer display credentials dynamically bound to active role persona
  const activeRolePersona = auth.ROLE_DETAILS?.[currentRole] || activePersona;

  // Check if profile belongs to the current active role
  const isProfileRoleMatch = profile?.role && (
    profile.role.toLowerCase() === currentRole.toLowerCase() ||
    (profile.role === 'admin' && currentRole === 'admin') ||
    (profile.role.includes('legal') && currentRole.includes('legal')) ||
    (profile.role.includes('forensic') && currentRole.includes('forensic')) ||
    (profile.role.includes('inspector') && currentRole.includes('inspector'))
  );

  const displayName = isProfileRoleMatch && profile?.full_name 
    ? profile.full_name 
    : (activeRolePersona?.name || (
        isAdmin ? "System Administrator" :
        isForensic ? "Dr. K.S. Rathore" :
        isLegal ? "Adv. Arvind Joshi" : "Insp. Rajesh Kumar"
      ));

  const displayDept = isProfileRoleMatch && profile?.station_or_lab 
    ? profile.station_or_lab 
    : (activeRolePersona?.organization || (
        isAdmin ? "MP Police Headquarters, IT Security" :
        isForensic ? "Regional Forensic Science Laboratory, Bhopal" :
        isLegal ? "Directorate of Public Prosecutions" : "Bhopal Central Police Station"
      ));

  const displayAvatar = (isProfileRoleMatch && profile?.avatar_url) 
    ? profile.avatar_url 
    : (activeRolePersona?.avatar || (
        isForensic ? "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=120" :
        isLegal ? "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=120" :
        isAdmin ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" :
        "/assets/inspector_avatar.jpg"
      ));

  const displayBadge = isProfileRoleMatch && profile?.badge_id 
    ? profile.badge_id 
    : (activeRolePersona?.badge || (
        isAdmin ? "ADM-SYS-01" :
        isForensic ? "RFSL-BPL-048" :
        isLegal ? "DPO-BPL-204" : "INSP-BH-104"
      ));

  return (
    <header className="top-navbar">
      <div className="nav-container">
        
        {/* ==================================================================
            1. LEFT BRAND SECTION
           ================================================================== */}
        <div 
          className="nav-brand" 
          onClick={() => setActivePage(isAdmin ? 'adminDashboard' : 'dashboard')} 
          style={{ cursor: 'pointer' }}
          title="DocShield Home"
        >
          <div className="brand-logo-wrap">
            <svg className="shield-logo" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 1L2 7V17.5C2 27.5 8.8 36.8 18 39.5C27.2 36.8 34 27.5 34 17.5V7L18 1Z" fill="#0B1E36" stroke="#0B1E36" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M10 13H26M10 19H26M13 25H23" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="brand-text-block">
            <span className="brand-name">DocShield</span>
            <span className="brand-tagline">Secure Documents. Stronger Justice.</span>
          </div>
        </div>

        {/* ==================================================================
            2. CENTER NAVIGATION LINKS (Clean pill active state, outline icons)
           ================================================================== */}
        <nav className="nav-menu">
          {visiblePrimary.map((item) => {
            const active = isItemActive(item.id);
            return (
              <button 
                key={item.id}
                className={`nav-link-btn nav-item ${active ? 'active' : ''}`}
                onClick={() => {
                  setActivePage(item.id);
                  setMoreOpen(false);
                }}
                title={item.label}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* More Dropdown for Secondary & Folded Items */}
          {visibleMore.length > 0 && (
            <div className="nav-more-wrap">
              <button
                className={`nav-link-btn nav-item nav-more-btn ${isMoreActive ? 'active' : ''} ${moreOpen ? 'open' : ''}`}
                onClick={() => {
                  setMoreOpen(!moreOpen);
                  setNotifOpen(false);
                  setProfileOpen(false);
                }}
                title="More options"
              >
                <svg className="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="4" cy="10" r="1.5"/>
                  <circle cx="10" cy="10" r="1.5"/>
                  <circle cx="16" cy="10" r="1.5"/>
                </svg>
                <span>More</span>
                <svg className={`nav-chevron ${moreOpen ? 'open' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6L8 10L12 6"/>
                </svg>
              </button>

              {moreOpen && (
                <div className="nav-more-dropdown" onClick={(e) => e.stopPropagation()}>
                  {visibleMore.map((item) => {
                    const active = isItemActive(item.id);
                    return (
                      <button
                        key={item.id}
                        className={`nav-dropdown-item ${active ? 'active' : ''}`}
                        onClick={() => {
                          setActivePage(item.id);
                          setMoreOpen(false);
                        }}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* ==================================================================
            3. RIGHT SECTION (Search Pill, Notification Bell, User Avatar)
           ================================================================== */}
        <div className="nav-actions">
          
          {/* Compact Pill Search */}
          <div className="nav-search-wrap">
            <svg className="nav-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="9" r="6"/>
              <path d="M13.5 13.5L17.5 17.5"/>
            </svg>
            <input 
              type="text" 
              className="nav-search-input"
              placeholder="Search..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchVal.trim()) {
                  setActivePage('cases');
                }
              }}
            />
          </div>

          {/* Notification Bell with Red Badge */}
          <div className="nav-notif-wrap">
            <button 
              className="nav-icon-btn notification-btn" 
              title="System Alerts"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setMoreOpen(false);
                setProfileOpen(false);
              }}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 7C15 4.2 12.8 2 10 2C7.2 2 5 4.2 5 7C5 12 3 13.5 3 13.5H17C17 13.5 15 12 15 7Z"/>
                <path d="M8.5 16.5C8.8 17.4 9.6 18 10.5 18C11.4 18 12.2 17.4 12.5 16.5"/>
              </svg>
              {hasUnread && <span className="nav-notif-badge">1</span>}
            </button>

            {notifOpen && (
              <div className="dropdown-panel notif-dropdown open" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-header">
                  <span className="dropdown-title">System Alerts</span>
                  <button 
                    className="text-link-btn" 
                    onClick={() => setHasUnread(false)}
                  >
                    Mark all read
                  </button>
                </div>
                <div className="notif-list">
                  <div 
                    className="notif-item unread" 
                    onClick={() => {
                      onOpenCase('#2024-1768');
                      setNotifOpen(false);
                    }}
                  >
                    <div className="notif-icon-circle blue">
                      <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v10H2z"/></svg>
                    </div>
                    <div className="notif-content">
                      <p className="notif-msg"><strong>FIR.pdf</strong> verified with SHA-256 in <strong>#2024-1768</strong></p>
                      <span className="notif-time">2 hours ago • Bhopal Central PS</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="nav-profile-wrap">
            <button 
              className="nav-profile-btn" 
              onClick={() => {
                setProfileOpen(!profileOpen);
                setMoreOpen(false);
                setNotifOpen(false);
              }}
              title="Officer Profile & Settings"
            >
              <img 
                src={displayAvatar} 
                alt={displayName} 
                className="nav-profile-avatar" 
              />
              <div className="nav-profile-info">
                <span className="nav-profile-name">{displayName}</span>
                <span className="nav-profile-sub">{displayDept}</span>
              </div>
              <svg className={`nav-chevron ${profileOpen ? 'open' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6L8 10L12 6"/>
              </svg>
            </button>

            {profileOpen && (
              <div className="dropdown-panel profile-dropdown open" onClick={(e) => e.stopPropagation()}>
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-name">
                    {displayName}
                  </div>
                  <div className="profile-dropdown-sub">
                    {displayBadge}
                  </div>
                  <div className="profile-dropdown-badge">
                    {displayDept}
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                
                {/* 4-Way Role Switcher for instant audit verification */}
                {setCurrentRole && (
                  <div style={{ padding: '6px 12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      Switch Role View
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button 
                        className={`dropdown-item ${isForensic ? 'active-role' : ''}`}
                        style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: isForensic ? '700' : '500', color: isForensic ? '#1E6DEB' : '#334155', backgroundColor: isForensic ? '#EFF6FF' : 'transparent' }}
                        onClick={() => {
                          setCurrentRole('forensic');
                          setActivePage('dashboard');
                          setProfileOpen(false);
                          showToast?.("Switched to Evidence / Forensic Officer view.");
                        }}
                      >
                        🔬 Evidence / Forensic Officer (RFSL)
                      </button>

                      <button 
                        className={`dropdown-item ${isLegal ? 'active-role' : ''}`}
                        style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: isLegal ? '700' : '500', color: isLegal ? '#1E6DEB' : '#334155', backgroundColor: isLegal ? '#EFF6FF' : 'transparent' }}
                        onClick={() => {
                          setCurrentRole('legal');
                          setActivePage('dashboard');
                          setProfileOpen(false);
                          showToast?.("Switched to Court / Legal Officer view.");
                        }}
                      >
                        ⚖️ Legal Officer (DPO Court Review)
                      </button>

                      <button 
                        className={`dropdown-item ${isAdmin ? 'active-role' : ''}`}
                        style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: isAdmin ? '700' : '500', color: isAdmin ? '#1E6DEB' : '#334155', backgroundColor: isAdmin ? '#EFF6FF' : 'transparent' }}
                        onClick={() => {
                          setCurrentRole('admin');
                          setActivePage('adminDashboard');
                          setProfileOpen(false);
                          showToast?.("Switched to System Administrator view.");
                        }}
                      >
                        🛡️ Admin (System Oversight & Users)
                      </button>

                      <button 
                        className={`dropdown-item ${!isAdmin && !isLegal && !isForensic ? 'active-role' : ''}`}
                        style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: (!isAdmin && !isLegal && !isForensic) ? '700' : '500', color: (!isAdmin && !isLegal && !isForensic) ? '#1E6DEB' : '#334155', backgroundColor: (!isAdmin && !isLegal && !isForensic) ? '#EFF6FF' : 'transparent' }}
                        onClick={() => {
                          setCurrentRole('inspector');
                          setActivePage('dashboard');
                          setProfileOpen(false);
                          showToast?.("Switched to Police Inspector view.");
                        }}
                      >
                        👮 Inspector (Field Investigation)
                      </button>
                    </div>
                  </div>
                )}

                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item text-danger" 
                  onClick={async () => {
                    try {
                      await auth.signOut();
                      showToast?.("Session signed out successfully. CCTNS security audit sealed.");
                    } catch (err) {
                      console.warn('Sign out notice:', err.message);
                    }
                    setProfileOpen(false);
                    if (onOpenAuth) onOpenAuth();
                  }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H5"/></svg>
                  <span>Sign Out Session</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
