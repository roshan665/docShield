// ========================================================
// DocShield — Inspector Audit Logs Dataset
// Matches SIH 26190 reference specifications
// ========================================================

export const auditCategoryCounts = {
  all: 248,
  case: 64,
  document: 72,
  evidence: 48,
  user: 36,
  security: 28
};

export const initialAuditLogsData = [
  // ROW 1
  {
    id: "AUD-2024-001",
    timestampDate: "22 Jan 2024",
    timestampTime: "11:30 AM",
    actor: "Inspector R. Sharma",
    action: "Viewed Case",
    actionType: "view",
    module: "Cases",
    categoryFilter: "case",
    recordId: "CASE-2024-1768",
    caseNo: "#2024-1768",
    ip: "192.168.1.10",
    device: "Chrome / Windows",
    status: "Success",
    description: "Inspected comprehensive case docket and primary incident narrative for Section 302 IPC investigation.",
    hash: "a4f89b2c3d1e0f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a"
  },
  // ROW 2
  {
    id: "AUD-2024-002",
    timestampDate: "22 Jan 2024",
    timestampTime: "11:15 AM",
    actor: "Inspector R. Sharma",
    action: "Uploaded Document",
    actionType: "upload",
    module: "Documents",
    categoryFilter: "document",
    recordId: "DOC-2024-045",
    caseNo: "#2024-1768",
    ip: "192.168.1.10",
    device: "Chrome / Windows",
    status: "Success",
    description: "Uploaded and cryptographically sealed 'FIR_2024-1768_Certified.pdf' with SHA-256 checksum.",
    hash: "f1e2d3c4b5a69870123456789abcdef0123456789abcdef0123456789abcdef0"
  },
  // ROW 3
  {
    id: "AUD-2024-003",
    timestampDate: "21 Jan 2024",
    timestampTime: "04:20 PM",
    actor: "Inspector A. Khan",
    action: "Evidence Transferred",
    actionType: "transfer",
    module: "Chain of Custody",
    categoryFilter: "evidence",
    recordId: "EV-2024-002",
    caseNo: "#2024-1654",
    ip: "192.168.1.12",
    device: "Chrome / Windows",
    status: "Success",
    description: "Physical custody transfer of biological evidence package to State Forensic Laboratory Bhopal.",
    hash: "8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d"
  },
  // ROW 4
  {
    id: "AUD-2024-004",
    timestampDate: "21 Jan 2024",
    timestampTime: "02:45 PM",
    actor: "Inspector R. Sharma",
    action: "Forensic Report Viewed",
    actionType: "view",
    module: "Forensic Reports",
    categoryFilter: "document",
    recordId: "FR-2024-001",
    caseNo: "#2024-1768",
    ip: "192.168.1.10",
    device: "Chrome / Windows",
    status: "Success",
    description: "Examined digital ballistic report and chemical striation analysis from Central FSL laboratory.",
    hash: "9b3c4f7a2d8e1c6b5a0f4e3d2c1b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b"
  },
  // ROW 5
  {
    id: "AUD-2024-005",
    timestampDate: "20 Jan 2024",
    timestampTime: "01:10 PM",
    actor: "Inspector A. Khan",
    action: "Charge Sheet Updated",
    actionType: "edit",
    module: "Charge Sheets",
    categoryFilter: "document",
    recordId: "CS-2024-001",
    caseNo: "#2024-1768",
    ip: "192.168.1.12",
    device: "Chrome / Windows",
    status: "Success",
    description: "Appended supplemental witness statements under Section 161 CrPC to draft judicial charge sheet.",
    hash: "3a8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b"
  },
  // ROW 6
  {
    id: "AUD-2024-006",
    timestampDate: "19 Jan 2024",
    timestampTime: "10:30 AM",
    actor: "Inspector R. Sharma",
    action: "Court Filing Submitted",
    actionType: "submit",
    module: "Court Filings",
    categoryFilter: "case",
    recordId: "CF-2024-002",
    caseNo: "#2024-1654",
    ip: "192.168.1.10",
    device: "Chrome / Windows",
    status: "Success",
    description: "Formal judicial filing of Bail Opposition Memorandum before Sessions Court, Bhopal.",
    hash: "d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3"
  },
  // ROW 7
  {
    id: "AUD-2024-007",
    timestampDate: "18 Jan 2024",
    timestampTime: "09:15 AM",
    actor: "Inspector P. Singh",
    action: "Login",
    actionType: "login",
    module: "Authentication",
    categoryFilter: "user",
    recordId: "AUTH-2024-018",
    caseNo: "—",
    ip: "192.168.1.15",
    device: "Chrome / Windows",
    status: "Success",
    description: "Two-factor authenticated police token login from authorized precinct terminal.",
    hash: "1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e"
  },
  // ROW 8
  {
    id: "AUD-2024-008",
    timestampDate: "17 Jan 2024",
    timestampTime: "03:40 PM",
    actor: "Inspector A. Khan",
    action: "Evidence Verification",
    actionType: "verify",
    module: "Evidence",
    categoryFilter: "evidence",
    recordId: "EV-2024-003",
    caseNo: "#2024-1432",
    ip: "192.168.1.12",
    device: "Chrome / Windows",
    status: "Success",
    description: "Tamper-evident verification of CCTV DVR exhibit hash against baseline custody registry.",
    hash: "6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d"
  },

  // Additional realistic audit records to support full pagination and realistic filtering
  {
    id: "AUD-2024-009",
    timestampDate: "17 Jan 2024",
    timestampTime: "11:20 AM",
    actor: "Inspector R. Sharma",
    action: "Downloaded Document",
    actionType: "download",
    module: "Documents",
    categoryFilter: "document",
    recordId: "DOC-2024-039",
    caseNo: "#2024-1287",
    ip: "192.168.1.10",
    device: "Chrome / Windows",
    status: "Success",
    description: "Downloaded encrypted forensic viscera report for trial preparation.",
    hash: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b"
  },
  {
    id: "AUD-2024-010",
    timestampDate: "16 Jan 2024",
    timestampTime: "04:50 PM",
    actor: "Forensic Analyst S. Verma",
    action: "Uploaded Report",
    actionType: "upload",
    module: "Forensic Reports",
    categoryFilter: "document",
    recordId: "FR-2024-003",
    caseNo: "#2024-1432",
    ip: "192.168.1.24",
    device: "Firefox / Linux",
    status: "Success",
    description: "Uploaded digitally signed cyber forensic extraction manifest.",
    hash: "0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e"
  },
  {
    id: "AUD-2024-011",
    timestampDate: "16 Jan 2024",
    timestampTime: "02:15 PM",
    actor: "Inspector P. Singh",
    action: "Evidence Released",
    actionType: "release",
    module: "Chain of Custody",
    categoryFilter: "evidence",
    recordId: "EV-2023-088",
    caseNo: "#2023-9845",
    ip: "192.168.1.15",
    device: "Chrome / Windows",
    status: "Success",
    description: "Released recovered valuables to complainant pursuant to judicial superdari order.",
    hash: "5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c"
  },
  {
    id: "AUD-2024-012",
    timestampDate: "15 Jan 2024",
    timestampTime: "06:05 PM",
    actor: "Inspector R. Sharma",
    action: "Integrity Check",
    actionType: "security",
    module: "Authentication",
    categoryFilter: "security",
    recordId: "SEC-2024-011",
    caseNo: "#2024-1768",
    ip: "192.168.1.10",
    device: "Chrome / Windows",
    status: "Success",
    description: "Full cryptographic integrity baseline check passed with zero tampering detected.",
    hash: "c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3"
  },
  {
    id: "AUD-2024-013",
    timestampDate: "15 Jan 2024",
    timestampTime: "09:30 AM",
    actor: "Inspector A. Khan",
    action: "Login Failed",
    actionType: "security",
    module: "Authentication",
    categoryFilter: "security",
    recordId: "AUTH-2024-012",
    caseNo: "—",
    ip: "192.168.1.45",
    device: "Safari / macOS",
    status: "Warning",
    description: "Mismatched hardware token passcode entered during secondary authorization.",
    hash: "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2"
  },
  {
    id: "AUD-2024-014",
    timestampDate: "14 Jan 2024",
    timestampTime: "05:10 PM",
    actor: "Inspector R. Sharma",
    action: "Created Case",
    actionType: "create",
    module: "Cases",
    categoryFilter: "case",
    recordId: "CASE-2024-1102",
    caseNo: "#2024-1102",
    ip: "192.168.1.10",
    device: "Chrome / Windows",
    status: "Success",
    description: "Initiated primary investigation docket for Berasia commercial arson case.",
    hash: "a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1"
  },
  {
    id: "AUD-2024-015",
    timestampDate: "14 Jan 2024",
    timestampTime: "01:40 PM",
    actor: "Inspector P. Singh",
    action: "Exported Case Logs",
    actionType: "export",
    module: "Cases",
    categoryFilter: "user",
    recordId: "EXP-2024-005",
    caseNo: "#2023-9845",
    ip: "192.168.1.15",
    device: "Chrome / Windows",
    status: "Success",
    description: "Exported audit trail manifest to encrypted police PDF archive.",
    hash: "f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8"
  },
  {
    id: "AUD-2024-016",
    timestampDate: "13 Jan 2024",
    timestampTime: "11:50 AM",
    actor: "Inspector A. Khan",
    action: "Evidence Verification Failed",
    actionType: "verify",
    module: "Evidence",
    categoryFilter: "security",
    recordId: "EV-2024-001",
    caseNo: "#2024-1654",
    ip: "192.168.1.12",
    device: "Chrome / Windows",
    status: "Failed",
    description: "Checksum discrepancy alert during automatic storage integrity scan (resolved: barcode re-aligned).",
    hash: "e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7"
  }
];

// Generate synthetic historical entries up to 248 ensuring category counts match
const sampleModules = [
  { mod: "Cases", cat: "case", action: "Viewed Case" },
  { mod: "Documents", cat: "document", action: "Uploaded Document" },
  { mod: "Evidence", cat: "evidence", action: "Evidence Verification" },
  { mod: "Chain of Custody", cat: "evidence", action: "Evidence Transferred" },
  { mod: "Authentication", cat: "user", action: "Login" },
  { mod: "Authentication", cat: "security", action: "Integrity Check" },
  { mod: "Forensic Reports", cat: "document", action: "Forensic Report Viewed" },
  { mod: "Charge Sheets", cat: "case", action: "Charge Sheet Updated" },
  { mod: "Court Filings", cat: "case", action: "Court Filing Submitted" }
];

const sampleActors = [
  "Inspector R. Sharma",
  "Inspector A. Khan",
  "Inspector P. Singh",
  "Forensic Analyst S. Verma"
];

const sampleCases = [
  "#2024-1768",
  "#2024-1654",
  "#2024-1432",
  "#2024-1287",
  "#2024-1102",
  "#2023-9845",
  "#2023-7765",
  "#2023-6654"
];

for (let i = 17; i <= 248; i++) {
  const m = sampleModules[i % sampleModules.length];
  const act = sampleActors[i % sampleActors.length];
  const cid = m.mod === "Authentication" ? "—" : sampleCases[i % sampleCases.length];
  const day = (30 - (i % 28)).toString().padStart(2, '0');
  const month = i > 120 ? 'Nov 2023' : (i > 50 ? 'Dec 2023' : 'Jan 2024');

  initialAuditLogsData.push({
    id: `AUD-2024-${i.toString().padStart(3, '0')}`,
    timestampDate: `${day} ${month}`,
    timestampTime: `${((i % 12) + 1).toString().padStart(2, '0')}:${((i * 7) % 60).toString().padStart(2, '0')} ${i % 2 === 0 ? 'AM' : 'PM'}`,
    actor: act,
    action: m.action,
    actionType: m.action.toLowerCase().includes('view') ? 'view' : (m.action.toLowerCase().includes('upload') ? 'upload' : 'general'),
    module: m.mod,
    categoryFilter: m.cat,
    recordId: `REC-2024-${(100 + i)}`,
    caseNo: cid,
    ip: `192.168.1.${10 + (i % 20)}`,
    device: i % 5 === 0 ? 'Firefox / Linux' : 'Chrome / Windows',
    status: i === 22 ? 'Failed' : (i === 35 ? 'Warning' : 'Success'),
    description: `Automated audit record generated for ${m.action} under DocShield Police Investigation Framework.`,
    hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  });
}
