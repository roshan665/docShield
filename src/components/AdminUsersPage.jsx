import React, { useState, useMemo } from 'react';
import { 
  adminUserSummaryCards, 
  initialUsersList, 
  pendingApprovalsList, 
  roleDistributionData, 
  recentUserActivityData 
} from '../data/adminUsersData';
import { 
  AddUserModal, 
  UserDetailModal, 
  EditUserModal, 
  ReviewApprovalModal, 
  QuickActionModal 
} from './AdminUserModals';

export default function AdminUsersPage({ onNavigate, showToast }) {
  // Users state
  const [users, setUsers] = useState(initialUsersList);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  
  // Pending Approvals state
  const [pendingApprovals, setPendingApprovals] = useState(pendingApprovalsList);
  const [selectedApproval, setSelectedApproval] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Last Active');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Active Dropdown row ID
  const [activeMenuRowId, setActiveMenuRowId] = useState(null);

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [quickActionType, setQuickActionType] = useState(null);

  // Filter & Search logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        user.department.toLowerCase().includes(q);

      const matchRole = roleFilter === 'All' || user.role === roleFilter;
      const matchStatus = statusFilter === 'All' || user.status === statusFilter;
      const matchDept = deptFilter === 'All' || user.department.toLowerCase().includes(deptFilter.toLowerCase());

      return matchSearch && matchRole && matchStatus && matchDept;
    }).sort((a, b) => {
      if (sortBy === 'Name') {
        return a.name.localeCompare(b.name);
      }
      return 0; // Default matches visual table order
    });
  }, [users, searchQuery, roleFilter, statusFilter, deptFilter, sortBy]);

  // Pagination slice
  const displayedUsers = filteredUsers.slice(0, itemsPerPage);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(displayedUsers.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter(i => i !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  // Add User
  const handleUserCreated = (newUser) => {
    setUsers([newUser, ...users]);
    showToast?.(`User account created: ${newUser.name} (${newUser.role})`);
  };

  // Update User
  const handleUserUpdated = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    showToast?.(`User account updated: ${updatedUser.name}`);
  };

  // Toggle Status
  const handleToggleStatus = (targetUser) => {
    const nextStatus = targetUser.status === 'Inactive' ? 'Active' : 'Inactive';
    setUsers(users.map(u => u.id === targetUser.id ? { ...u, status: nextStatus } : u));
    if (detailUser && detailUser.id === targetUser.id) {
      setDetailUser({ ...detailUser, status: nextStatus });
    }
    showToast?.(`User ${targetUser.name} marked as ${nextStatus}. Audit event logged.`);
  };

  // Approval actions
  const handleApprovalAction = (reqId, actionType) => {
    const req = pendingApprovals.find(r => r.id === reqId);
    setPendingApprovals(pendingApprovals.filter(r => r.id !== reqId));
    setSelectedApproval(null);

    if (actionType === 'approve') {
      showToast?.(`Approved: ${req?.title} for ${req?.requestedBy}`);
    } else {
      showToast?.(`Rejected: ${req?.title} request`);
    }
  };

  // Click outside to close row menu
  const toggleRowMenu = (rowId, e) => {
    e.stopPropagation();
    setActiveMenuRowId(activeMenuRowId === rowId ? null : rowId);
  };

  return (
    <div className="admin-users-container" onClick={() => setActiveMenuRowId(null)}>
      
      {/* 1. PAGE HEADER */}
      <div className="admin-users-header">
        <div className="admin-users-header-left">
          <h1 className="admin-users-title">User Management</h1>
          <p className="admin-users-subtitle">Manage system users, roles and permissions.</p>
        </div>

        <button 
          className="admin-add-user-btn"
          onClick={() => setIsAddUserOpen(true)}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="4" x2="10" y2="16"/>
            <line x1="4" y1="10" x2="16" y2="10"/>
          </svg>
          <span>Add User</span>
        </button>
      </div>

      {/* 2. TOP 5 SUMMARY CARDS */}
      <div className="admin-users-summary-grid">
        {adminUserSummaryCards.map(card => (
          <div key={card.id} className="admin-users-summary-card">
            <div className="summary-card-icon-box">
              {card.iconType === 'shield' ? (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2L3 5.5v5c0 4.5 3 8 7 9.5 4-1.5 7-5 7-9.5v-5L10 2z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 17v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="10" cy="7" r="4"/>
                </svg>
              )}
            </div>

            <div className="summary-card-content">
              <span className="summary-card-label">{card.title}</span>
              <span className="summary-card-value">{card.value}</span>
              <div className="summary-card-trend-row">
                <span className="summary-card-trend-val" style={{ color: card.trendColor }}>
                  {card.trend}
                </span>
                <span className="summary-card-trend-text">{card.trendText}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. SEARCH AND FILTER BAR */}
      <div className="admin-users-filter-bar">
        <div className="admin-users-search-box">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="9" r="6"/>
            <line x1="14" y1="14" x2="19" y2="19"/>
          </svg>
          <input 
            type="text" 
            placeholder="Search by name, email, username or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Roles Filter */}
        <div className="admin-filter-select-wrap">
          <select 
            className="admin-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Inspector">Inspector</option>
            <option value="Admin">Admin</option>
          </select>
          <svg className="admin-filter-select-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 8 10 12 14 8"/>
          </svg>
        </div>

        {/* Status Filter */}
        <div className="admin-filter-select-wrap">
          <select 
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Away">Away</option>
            <option value="Inactive">Inactive</option>
          </select>
          <svg className="admin-filter-select-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 8 10 12 14 8"/>
          </svg>
        </div>

        {/* Department Filter */}
        <div className="admin-filter-select-wrap">
          <select 
            className="admin-filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Investigation">Investigation</option>
            <option value="Administration">Administration</option>
          </select>
          <svg className="admin-filter-select-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 8 10 12 14 8"/>
          </svg>
        </div>

        {/* Sort By Filter */}
        <div className="admin-sort-wrap">
          <span className="admin-sort-label">Sort by</span>
          <div className="admin-filter-select-wrap" style={{ minWidth: '120px' }}>
            <select 
              className="admin-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Last Active">Last Active</option>
              <option value="Name">Name</option>
              <option value="Date Created">Date Created</option>
            </select>
            <svg className="admin-filter-select-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 8 10 12 14 8"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 4. TWO-COLUMN MAIN LAYOUT */}
      <div className="admin-users-main-grid">
        
        {/* LEFT COLUMN: USERS TABLE + PENDING APPROVALS */}
        <div className="admin-users-left-col">
          
          {/* Main Users Table Card */}
          <div className="admin-table-card">
            <div className="admin-table-card-header">
              <h2 className="admin-table-card-title">Users</h2>
            </div>

            <div className="admin-users-table-container">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th className="table-checkbox-cell">
                      <input 
                        type="checkbox" 
                        className="table-checkbox"
                        checked={displayedUsers.length > 0 && selectedUserIds.length === displayedUsers.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map(user => {
                    const isSelected = selectedUserIds.includes(user.id);
                    const isMenuOpen = activeMenuRowId === user.id;

                    return (
                      <tr key={user.id} style={{ backgroundColor: isSelected ? '#F0F7FF' : 'transparent' }}>
                        <td className="table-checkbox-cell">
                          <input 
                            type="checkbox" 
                            className="table-checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(user.id)}
                          />
                        </td>

                        {/* Name + Role Subtitle */}
                        <td>
                          <div className="user-identity-cell">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="user-avatar-img" />
                            ) : (
                              <div className="user-avatar-fallback">{user.initials || user.name.slice(0, 2)}</div>
                            )}
                            <div className="user-identity-info">
                              <span className="user-name-text">{user.name}</span>
                              <span className="user-role-subtext">{user.role}</span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td>
                          <span className="user-email-text">{user.email}</span>
                        </td>

                        {/* Username */}
                        <td>
                          <span className="user-username-text">{user.username}</span>
                        </td>

                        {/* Role Badge */}
                        <td>
                          <span className={`role-badge ${user.role.toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Department */}
                        <td>
                          <span className="user-dept-text">{user.department}</span>
                        </td>

                        {/* Status Badge */}
                        <td>
                          <span className={`status-badge ${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>

                        {/* Last Active */}
                        <td>
                          <span className="user-last-active-text">{user.lastActive}</span>
                        </td>

                        {/* Actions */}
                        <td className="table-actions-cell">
                          <div className="table-action-btns-group">
                            {/* Eye icon - View */}
                            <button 
                              className="table-icon-btn"
                              title="View User"
                              onClick={() => setDetailUser(user)}
                            >
                              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M1 10s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z"/>
                                <circle cx="10" cy="10" r="3"/>
                              </svg>
                            </button>

                            {/* Edit icon */}
                            <button 
                              className="table-icon-btn"
                              title="Edit User"
                              onClick={() => setEditUser(user)}
                            >
                              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M14.5 2.5a2.121 2.121 0 0 1 3 3L6 17l-4 1 1-4 11.5-11.5z"/>
                              </svg>
                            </button>

                            {/* Three-dot menu */}
                            <div className="action-dropdown-wrapper">
                              <button 
                                className="table-icon-btn"
                                title="More Actions"
                                onClick={(e) => toggleRowMenu(user.id, e)}
                              >
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                  <circle cx="5" cy="10" r="1.6"/>
                                  <circle cx="10" cy="10" r="1.6"/>
                                  <circle cx="15" cy="10" r="1.6"/>
                                </svg>
                              </button>

                              {isMenuOpen && (
                                <div className="action-dropdown-menu">
                                  <button 
                                    className="action-dropdown-item"
                                    onClick={() => {
                                      setDetailUser(user);
                                      setActiveMenuRowId(null);
                                    }}
                                  >
                                    View Profile
                                  </button>
                                  <button 
                                    className="action-dropdown-item"
                                    onClick={() => {
                                      setEditUser(user);
                                      setActiveMenuRowId(null);
                                    }}
                                  >
                                    Edit User
                                  </button>
                                  <button 
                                    className="action-dropdown-item"
                                    onClick={() => {
                                      setEditUser(user);
                                      setActiveMenuRowId(null);
                                    }}
                                  >
                                    Manage Permissions
                                  </button>
                                  <button 
                                    className="action-dropdown-item"
                                    onClick={() => {
                                      setDetailUser(user);
                                      setActiveMenuRowId(null);
                                    }}
                                  >
                                    View Activity
                                  </button>
                                  <div className="action-dropdown-divider" />
                                  <button 
                                    className={`action-dropdown-item ${user.status !== 'Inactive' ? 'danger' : ''}`}
                                    onClick={() => {
                                      handleToggleStatus(user);
                                      setActiveMenuRowId(null);
                                    }}
                                  >
                                    {user.status === 'Inactive' ? 'Activate User' : 'Deactivate User'}
                                  </button>
                                  <button 
                                    className="action-dropdown-item"
                                    onClick={() => {
                                      showToast?.(`Access credentials and MFA token reset for ${user.name}`);
                                      setActiveMenuRowId(null);
                                    }}
                                  >
                                    Reset Access
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Row */}
            <div className="admin-table-pagination">
              <span className="pagination-info">Showing 1–8 of 124 users</span>
              <div className="pagination-controls">
                <button 
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                {[1, 2, 3, 4, 5].map(pageNum => (
                  <button 
                    key={pageNum}
                    className={`pagination-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(p => Math.min(5, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Pending Approvals Card */}
          <div className="admin-pending-approvals-card">
            <div className="pending-approvals-header">
              <h2 className="pending-approvals-title">Pending Approvals</h2>
              <span 
                className="view-all-link"
                onClick={() => showToast?.("Displaying all 5 pending authorization requests")}
              >
                View All
              </span>
            </div>

            <div className="pending-approvals-list">
              {pendingApprovals.map(req => (
                <div key={req.id} className="pending-approval-item">
                  <div className="pending-item-icon-box">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6l-5-4z"/>
                      <path d="M12 2v4h4"/>
                    </svg>
                  </div>

                  <div className="pending-item-main">
                    <span className="pending-item-title">{req.title}</span>
                    <span className="pending-item-subtitle">{req.subtitle}</span>
                  </div>

                  <div className="pending-item-requester">
                    Requested by: {req.requestedBy}
                  </div>

                  <div className="pending-item-timestamp">
                    {req.timestamp}
                  </div>

                  <div className="pending-item-status">
                    <span className="status-badge pending">
                      {req.status}
                    </span>
                  </div>

                  <button 
                    className="pending-review-btn"
                    onClick={() => setSelectedApproval(req)}
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ROLE DISTRIBUTION + RECENT ACTIVITY + QUICK ACTIONS */}
        <div className="admin-users-right-col">
          
          {/* Card 1: Role Distribution */}
          <div className="admin-side-card">
            <div className="admin-side-card-header">
              <h3 className="admin-side-card-title">Role Distribution</h3>
            </div>

            <div className="role-distribution-body">
              {/* SVG Donut Chart */}
              <div className="role-donut-chart-wrap">
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="14" />
                  
                  {/* Segment 1: Inspectors (59.7%) -> 59.7% of 238.76 = 142.5 */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    fill="none" 
                    stroke="#2563EB" 
                    strokeWidth="14" 
                    strokeDasharray="142.5 96.26"
                    strokeDashoffset="60"
                    strokeLinecap="butt"
                  />
                  
                  {/* Segment 2: Admins (2.4%) -> 2.4% of 238.76 = 5.73 */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    fill="none" 
                    stroke="#9333EA" 
                    strokeWidth="14" 
                    strokeDasharray="5.73 233.03"
                    strokeDashoffset="-82.5"
                    strokeLinecap="butt"
                  />

                  {/* Segment 3: Others (37.9%) -> 37.9% of 238.76 = 90.5 */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="38" 
                    fill="none" 
                    stroke="#94A3B8" 
                    strokeWidth="14" 
                    strokeDasharray="90.5 148.26"
                    strokeDashoffset="-88.23"
                    strokeLinecap="butt"
                  />
                </svg>

                {/* Donut Center */}
                <div className="donut-center-text">
                  <span className="donut-center-val">124</span>
                  <span className="donut-center-sub">Total Users</span>
                </div>
              </div>

              {/* Legend */}
              <div className="role-donut-legend">
                {roleDistributionData.map(role => (
                  <div key={role.label} className="role-legend-item">
                    <div className="role-legend-label-wrap">
                      <span className="role-legend-dot" style={{ backgroundColor: role.color }} />
                      <span>{role.label}</span>
                    </div>
                    <div className="role-legend-counts">
                      <span className="role-legend-num">{role.count}</span>
                      <span className="role-legend-pct">{role.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Recent User Activity */}
          <div className="admin-side-card">
            <div className="admin-side-card-header">
              <h3 className="admin-side-card-title">Recent User Activity</h3>
              <span 
                className="view-all-link"
                onClick={() => showToast?.("Displaying full chronological audit stream")}
              >
                View All
              </span>
            </div>

            <div className="recent-activity-list">
              {recentUserActivityData.map(act => (
                <div key={act.id} className="recent-activity-item">
                  {act.avatar ? (
                    <img src={act.avatar} alt={act.name} className="activity-user-avatar" />
                  ) : (
                    <div className="activity-user-fallback">{act.initials}</div>
                  )}

                  <div className="activity-details">
                    <span className="activity-user-name">{act.name}</span>
                    <span className="activity-action-text">{act.action}</span>
                  </div>

                  <span className="activity-time-text">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="admin-side-card">
            <div className="admin-side-card-header">
              <h3 className="admin-side-card-title">Quick Actions</h3>
            </div>

            <div className="quick-actions-grid">
              <button 
                className="quick-action-btn"
                onClick={() => setIsAddUserOpen(true)}
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="17" y1="9" x2="17" y2="13"/>
                  <line x1="15" y1="11" x2="19" y2="11"/>
                </svg>
                <span>Add User</span>
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => setQuickActionType('roles')}
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 2L3 5.5v5c0 4.5 3 8 7 9.5 4-1.5 7-5 7-9.5v-5L10 2z"/>
                  <path d="M10 7v6M7 10h6"/>
                </svg>
                <span>Manage Roles</span>
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('auditLogs');
                  } else {
                    setQuickActionType('audit');
                  }
                }}
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6l-5-4z"/>
                  <path d="M12 2v4h4"/>
                  <line x1="7" y1="10" x2="13" y2="10"/>
                  <line x1="7" y1="14" x2="13" y2="14"/>
                </svg>
                <span>View Audit Logs</span>
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => setQuickActionType('settings')}
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="10" cy="10" r="3"/>
                  <path d="M16.5 10a6.5 6.5 0 0 0-.2-1.6l1.6-1.2-1.4-2.4-1.9.7a6.6 6.6 0 0 0-2.3-1.3l-.3-2h-2.8l-.3 2a6.6 6.6 0 0 0-2.3 1.3l-1.9-.7-1.4 2.4 1.6 1.2c-.1.5-.2 1.1-.2 1.6s.1 1.1.2 1.6l-1.6 1.2 1.4 2.4 1.9-.7c.7.5 1.5 1 2.3 1.3l.3 2h2.8l.3-2a6.6 6.6 0 0 0 2.3-1.3l1.9.7 1.4-2.4-1.6-1.2c.1-.5.2-1.1.2-1.6z"/>
                </svg>
                <span>System Settings</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* MODALS */}
      <AddUserModal 
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserCreated={handleUserCreated}
      />

      <UserDetailModal 
        user={detailUser}
        isOpen={!!detailUser}
        onClose={() => setDetailUser(null)}
        onEdit={(u) => {
          setDetailUser(null);
          setEditUser(u);
        }}
        onToggleStatus={handleToggleStatus}
      />

      <EditUserModal 
        user={editUser}
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onUserUpdated={handleUserUpdated}
      />

      <ReviewApprovalModal 
        request={selectedApproval}
        isOpen={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onAction={handleApprovalAction}
      />

      <QuickActionModal 
        type={quickActionType}
        isOpen={!!quickActionType}
        onClose={() => setQuickActionType(null)}
        showToast={showToast}
      />

    </div>
  );
}
