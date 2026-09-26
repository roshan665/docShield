// ========================================================
// DocShield — Admin Dashboard Data
// Exact match for reference image media_1790179692985.png
// ========================================================

export const adminSummaryCards = [
  {
    id: "totalCases",
    title: "Total Cases",
    value: "48",
    trend: "↑ 12%",
    trendText: "vs. last 30 days",
    trendColor: "#10B981",
    iconType: "folder"
  },
  {
    id: "totalInspectors",
    title: "Total Inspectors",
    value: "24",
    trend: "↑ 9%",
    trendText: "vs. last 30 days",
    trendColor: "#10B981",
    iconType: "users"
  },
  {
    id: "totalDocuments",
    title: "Total Documents",
    value: "186",
    trend: "↑ 15%",
    trendText: "vs. last 30 days",
    trendColor: "#10B981",
    iconType: "document"
  },
  {
    id: "totalEvidence",
    title: "Total Evidence Items",
    value: "92",
    trend: "↑ 11%",
    trendText: "vs. last 30 days",
    trendColor: "#10B981",
    iconType: "shieldCheck"
  },
  {
    id: "pendingReviews",
    title: "Pending Reviews",
    value: "7",
    trend: "↑ 3%",
    trendText: "vs. last 30 days",
    trendColor: "#EF4444",
    iconType: "shield"
  },
  {
    id: "evidenceIntegrity",
    title: "Evidence Integrity",
    value: "98%",
    trend: "↑ 2%",
    trendText: "vs. last 30 days",
    trendColor: "#10B981",
    iconType: "shieldCheck"
  }
];

export const caseStatusData = {
  total: 48,
  segments: [
    { label: "Active", count: 32, percentage: "66.7%", color: "#1E6DEB" },
    { label: "Under Investigation", count: 8, percentage: "16.7%", color: "#10B981" },
    { label: "Pending Review", count: 4, percentage: "8.3%", color: "#F59E0B" },
    { label: "Closed", count: 4, percentage: "8.3%", color: "#64748B" }
  ]
};

export const recentSystemActivities = [
  {
    id: "act-1",
    title: "New case created",
    description: "Case #2024-1768 by Inspector R. Sharma",
    time: "2 hours ago",
    iconType: "case",
    iconBg: "#EBF3FC",
    iconColor: "#1E6DEB"
  },
  {
    id: "act-2",
    title: "Document uploaded",
    description: "FIR_2024-1768.pdf in Case #2024-1654",
    time: "3 hours ago",
    iconType: "document",
    iconBg: "#ECFDF5",
    iconColor: "#10B981"
  },
  {
    id: "act-3",
    title: "Evidence updated",
    description: "CCTV Footage in Case #2024-1432",
    time: "5 hours ago",
    iconType: "evidence",
    iconBg: "#F3E8FF",
    iconColor: "#9333EA"
  },
  {
    id: "act-4",
    title: "User added",
    description: "Inspector A. Khan",
    time: "6 hours ago",
    iconType: "user",
    iconBg: "#EBF3FC",
    iconColor: "#1E6DEB"
  },
  {
    id: "act-5",
    title: "Report generated",
    description: "Forensic Report #FR-2024-012",
    time: "8 hours ago",
    iconType: "report",
    iconBg: "#EBF3FC",
    iconColor: "#1E6DEB"
  }
];

export const recentAuditEvents = [
  {
    id: "aud-1",
    title: "Court Filing Created",
    description: "CF-2024-001 by Inspector R. Sharma",
    time: "1 hour ago",
    iconType: "filing",
    iconBg: "#EBF3FC",
    iconColor: "#1E6DEB"
  },
  {
    id: "aud-2",
    title: "Evidence Transferred",
    description: "EQ-2024-001 by Inspector A. Khan",
    time: "2 hours ago",
    iconType: "link",
    iconBg: "#EBF3FC",
    iconColor: "#1E6DEB"
  },
  {
    id: "aud-3",
    title: "Document Viewed",
    description: "FIR_2024-1768.pdf by Admin",
    time: "3 hours ago",
    iconType: "document",
    iconBg: "#EBF3FC",
    iconColor: "#1E6DEB"
  },
  {
    id: "aud-4",
    title: "Case Updated",
    description: "#2024-1654 by Inspector R. Sharma",
    time: "5 hours ago",
    iconType: "case",
    iconBg: "#EBF3FC",
    iconColor: "#1E6DEB"
  },
  {
    id: "aud-5",
    title: "User Login",
    description: "Inspector A. Khan",
    time: "6 hours ago",
    iconType: "auth",
    iconBg: "#EBF3FC",
    iconColor: "#1E6DEB"
  }
];

export const recentCasesData = [
  {
    caseNo: "#2024-1768",
    title: "Robbery Case",
    status: "Active",
    statusType: "active",
    assignedTo: "Inspector R. Sharma",
    lastUpdated: "2 hours ago"
  },
  {
    caseNo: "#2024-1654",
    title: "Cyber Fraud",
    status: "Under Investigation",
    statusType: "investigation",
    assignedTo: "Inspector A. Khan",
    lastUpdated: "4 hours ago"
  },
  {
    caseNo: "#2024-1432",
    title: "Theft Case",
    status: "Active",
    statusType: "active",
    assignedTo: "Inspector P. Singh",
    lastUpdated: "6 hours ago"
  },
  {
    caseNo: "#2024-1287",
    title: "NDPS Case",
    status: "Pending Review",
    statusType: "pending",
    assignedTo: "Inspector S. Verma",
    lastUpdated: "8 hours ago"
  },
  {
    caseNo: "#2024-1102",
    title: "Assault Case",
    status: "Active",
    statusType: "active",
    assignedTo: "Inspector R. Sharma",
    lastUpdated: "12 hours ago"
  }
];

export const quickActionItems = [
  {
    id: "addUser",
    title: "Add User",
    subtitle: "Create new user account",
    iconType: "userPlus"
  },
  {
    id: "addCase",
    title: "Add Case",
    subtitle: "Register a new case",
    iconType: "caseShield"
  },
  {
    id: "uploadDoc",
    title: "Upload Document",
    subtitle: "Add document to system",
    iconType: "docUpload"
  },
  {
    id: "addEvidence",
    title: "Add Evidence",
    subtitle: "Register evidence item",
    iconType: "evidenceShield"
  },
  {
    id: "generateReport",
    title: "Generate Report",
    subtitle: "Create forensic report",
    iconType: "reportShield"
  },
  {
    id: "systemSettings",
    title: "System Settings",
    subtitle: "Configure system",
    iconType: "settingsShield"
  }
];
