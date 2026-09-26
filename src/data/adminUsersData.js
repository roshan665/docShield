// ========================================================
// DocShield — Admin User Management Data
// Exact match for reference image media_1790180424578.png
// ========================================================

export const adminUserSummaryCards = [
  {
    id: "totalUsers",
    title: "Total Users",
    value: "124",
    trend: "↑ +12%",
    trendText: "vs. last 30 days",
    trendColor: "#10B981",
    iconType: "user"
  },
  {
    id: "inspectors",
    title: "Inspectors",
    value: "74",
    trend: "↑ -8%",
    trendText: "vs. last 30 days",
    trendColor: "#10B981",
    iconType: "user"
  },
  {
    id: "admins",
    title: "Admins",
    value: "3",
    trend: "↑ +0%",
    trendText: "vs. last 30 days",
    trendColor: "#64748B",
    iconType: "user"
  },
  {
    id: "inactiveUsers",
    title: "Inactive Users",
    value: "8",
    trend: "↑ -2%",
    trendText: "vs. last 30 days",
    trendColor: "#EF4444",
    iconType: "user"
  },
  {
    id: "pendingApprovals",
    title: "Pending Approvals",
    value: "5",
    trend: "↑ +3%",
    trendText: "vs. last 30 days",
    trendColor: "#D97706",
    iconType: "shield"
  }
];

export const initialUsersList = [
  {
    id: "USR-001",
    name: "R. Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    initials: "RS",
    email: "r.sharma@police.gov.in",
    username: "rsharma",
    role: "Inspector",
    department: "Investigation",
    status: "Active",
    lastActive: "2 min ago",
    phone: "+91 98260 11442",
    badgeNumber: "MP-IND-0412",
    createdOn: "14 Feb 2023",
    permissions: ["Cases", "Documents", "Evidence", "Forensics", "Charge Sheets", "Court Filings", "Chain of Custody", "Limited Audit"]
  },
  {
    id: "USR-002",
    name: "A. Khan",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    initials: "AK",
    email: "a.khan@police.gov.in",
    username: "akhan",
    role: "Inspector",
    department: "Investigation",
    status: "Active",
    lastActive: "12 min ago",
    phone: "+91 94251 33201",
    badgeNumber: "MP-BPL-0288",
    createdOn: "03 May 2023",
    permissions: ["Cases", "Documents", "Evidence", "Forensics", "Charge Sheets", "Court Filings", "Chain of Custody", "Limited Audit"]
  },
  {
    id: "USR-003",
    name: "P. Singh",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    initials: "PS",
    email: "p.singh@police.gov.in",
    username: "psingh",
    role: "Inspector",
    department: "Investigation",
    status: "Active",
    lastActive: "28 min ago",
    phone: "+91 98930 45812",
    badgeNumber: "MP-GWL-0194",
    createdOn: "19 Nov 2022",
    permissions: ["Cases", "Documents", "Evidence", "Forensics", "Charge Sheets", "Court Filings", "Chain of Custody", "Limited Audit"]
  },
  {
    id: "USR-004",
    name: "N. Verma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    initials: "NV",
    email: "n.verma@police.gov.in",
    username: "nverma",
    role: "Inspector",
    department: "Investigation",
    status: "Away",
    lastActive: "1 hr ago",
    phone: "+91 97555 88921",
    badgeNumber: "MP-JBP-0319",
    createdOn: "08 Aug 2023",
    permissions: ["Cases", "Documents", "Evidence", "Forensics", "Charge Sheets", "Court Filings", "Chain of Custody"]
  },
  {
    id: "USR-005",
    name: "S. Gupta",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80",
    initials: "SG",
    email: "s.gupta@police.gov.in",
    username: "sgupta",
    role: "Inspector",
    department: "Investigation",
    status: "Active",
    lastActive: "2 hrs ago",
    phone: "+91 91112 40489",
    badgeNumber: "MP-UJN-0511",
    createdOn: "12 Jan 2024",
    permissions: ["Cases", "Documents", "Evidence", "Forensics", "Charge Sheets", "Court Filings", "Chain of Custody", "Limited Audit"]
  },
  {
    id: "USR-006",
    name: "T. Sharma",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
    initials: "TS",
    email: "t.sharma@police.gov.in",
    username: "tsharma",
    role: "Admin",
    department: "Administration",
    status: "Active",
    lastActive: "3 hrs ago",
    phone: "+91 94250 88711",
    badgeNumber: "MP-HQ-ADMIN-01",
    createdOn: "10 Oct 2021",
    permissions: ["Users", "Cases", "Documents", "Evidence", "Forensics", "Charge Sheets", "Court Filings", "Chain of Custody", "Audit Logs", "System Settings"]
  },
  {
    id: "USR-007",
    name: "V. Patel",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80",
    initials: "VP",
    email: "v.patel@police.gov.in",
    username: "vpatel",
    role: "Admin",
    department: "Administration",
    status: "Active",
    lastActive: "4 hrs ago",
    phone: "+91 98261 77654",
    badgeNumber: "MP-HQ-ADMIN-02",
    createdOn: "15 Jan 2022",
    permissions: ["Users", "Cases", "Documents", "Evidence", "Forensics", "Charge Sheets", "Court Filings", "Chain of Custody", "Audit Logs", "System Settings"]
  },
  {
    id: "USR-008",
    name: "K. Mehta",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    initials: "KM",
    email: "k.mehta@police.gov.in",
    username: "kmehta",
    role: "Admin",
    department: "Administration",
    status: "Inactive",
    lastActive: "1 day ago",
    phone: "+91 94065 12093",
    badgeNumber: "MP-HQ-ADMIN-03",
    createdOn: "20 Mar 2022",
    permissions: ["Users", "Cases", "Documents", "Evidence", "Forensics", "Charge Sheets", "Court Filings", "Chain of Custody", "Audit Logs"]
  },
  // Additional simulated users for pagination and search
  {
    id: "USR-009",
    name: "M. Joshi",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
    initials: "MJ",
    email: "m.joshi@police.gov.in",
    username: "mjoshi",
    role: "Inspector",
    department: "Investigation",
    status: "Active",
    lastActive: "2 days ago",
    phone: "+91 94250 55112",
    badgeNumber: "MP-SAG-0442",
    createdOn: "18 Jun 2023",
    permissions: ["Cases", "Documents", "Evidence", "Forensics"]
  },
  {
    id: "USR-010",
    name: "D. Yadav",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    initials: "DY",
    email: "d.yadav@police.gov.in",
    username: "dyadav",
    role: "Inspector",
    department: "Investigation",
    status: "Away",
    lastActive: "3 days ago",
    phone: "+91 98270 99318",
    badgeNumber: "MP-REWA-0128",
    createdOn: "05 Nov 2023",
    permissions: ["Cases", "Documents", "Evidence", "Charge Sheets"]
  }
];

export const pendingApprovalsList = [
  {
    id: "REQ-2024-001",
    title: "Inspector Account Request",
    subtitle: "New inspector registration — S. Kumar",
    requestedBy: "A. Khan",
    timestamp: "24 Jan 2024, 10:30 AM",
    status: "Pending",
    details: "New Field Inspector registration for Indore Central Police Division. Requires access to Cases, Documents, and Chain of Custody modules.",
    targetUser: "S. Kumar (Sub-Inspector)",
    department: "Investigation"
  },
  {
    id: "REQ-2024-002",
    title: "Role Change Request",
    subtitle: "Change role from Inspector to Admin",
    requestedBy: "P. Singh",
    timestamp: "23 Jan 2024, 04:15 PM",
    status: "Pending",
    details: "Elevation to System Administrator role recommended by DIG Office for zonal IT oversight and forensic evidence audit delegation.",
    targetUser: "P. Singh",
    department: "Administration"
  },
  {
    id: "REQ-2024-003",
    title: "Access Permission Request",
    subtitle: "Access to forensic reports module",
    requestedBy: "N. Verma",
    timestamp: "22 Jan 2024, 11:20 AM",
    status: "Pending",
    details: "Request for read/write access to Digital Forensics & Forensic Ballistics report vault for ongoing NDPS Case #2024-1768.",
    targetUser: "N. Verma",
    department: "Investigation"
  }
];

export const roleDistributionData = [
  { label: "Inspectors", count: 74, percentage: 59.7, color: "#2563EB" },
  { label: "Admins", count: 3, percentage: 2.4, color: "#9333EA" },
  { label: "Others", count: 47, percentage: 37.9, color: "#94A3B8" }
];

export const recentUserActivityData = [
  {
    id: "ACT-01",
    name: "R. Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    initials: "RS",
    action: "Logged in to the system",
    time: "2 min ago"
  },
  {
    id: "ACT-02",
    name: "A. Khan",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    initials: "AK",
    action: "Updated case #2024-1768",
    time: "12 min ago"
  },
  {
    id: "ACT-03",
    name: "T. Sharma",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
    initials: "TS",
    action: "Created new user account",
    time: "1 hr ago"
  },
  {
    id: "ACT-04",
    name: "V. Patel",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80",
    initials: "VP",
    action: "Changed user permissions",
    time: "2 hrs ago"
  },
  {
    id: "ACT-05",
    name: "K. Mehta",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    initials: "KM",
    action: "Logged out from the system",
    time: "3 hrs ago"
  }
];

export const allAvailablePermissions = [
  { id: "cases", name: "Case Access", desc: "View, create and update criminal case dossiers" },
  { id: "documents", name: "Document Access", desc: "Upload and verify cryptographically sealed documents" },
  { id: "evidence", name: "Evidence Access", desc: "Manage evidence tags and tamper-evident custody" },
  { id: "forensics", name: "Forensic Reports", desc: "Access forensic ballistics and digital lab reports" },
  { id: "chargeSheets", name: "Charge Sheets", desc: "Draft and review judicial charge sheets" },
  { id: "courtFilings", name: "Court Filings", desc: "Submit e-filings to Judicial Magistrate First Class" },
  { id: "custody", name: "Chain of Custody", desc: "Transfer and audit physical/digital item custody" },
  { id: "auditLogs", name: "Audit Logs", desc: "View immutable system-wide access and mutation logs" },
  { id: "users", name: "User Management", desc: "Administer user accounts, credentials, and roles" },
  { id: "settings", name: "System Settings", desc: "Configure cryptography, storage and agency nodes" }
];
