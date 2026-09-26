// DocShield — Inspector Charge Sheets Data Store
// Exact sample records and status counts from SIH 26190 reference image

export const chargeSheetCategoryCounts = {
  all: 18,
  draft: 5,
  underReview: 4,
  submitted: 6,
  accepted: 2,
  returned: 1,
  others: 0
};

export const initialChargeSheetsData = [
  // ROW 1
  {
    id: "CS-2024-001",
    caseNo: "#2024-1768",
    section: "IPC 302 - Homicide",
    filedDate: "22 Jan 2024",
    filedTime: "11:30 AM",
    court: "District Court",
    city: "Bhopal",
    status: "Submitted",
    documentsCount: 12,
    accused: "Vikram Malhotra & 1 Other",
    investigatingOfficer: "Insp. Rajesh Kumar",
    courtDocketNo: "CR-CASE-2024-8891",
    hash: "a8f5c2d3e4b5a6c7d8e9f0123456789abcdef0123456789abcdef0123456789a",
    notes: "Final report under Section 173 CrPC / 193 BNSS submitted with forensic ballistic report, autopsy memo, and 12 sworn eyewitness depositions.",
    auditLogs: [
      { timestamp: "20 Jan 2024, 05:00 PM", action: "Draft finalized by Investigating Officer", officer: "Insp. Rajesh Kumar" },
      { timestamp: "21 Jan 2024, 02:30 PM", action: "Scrutiny cleared by Public Prosecutor", officer: "Adv. S. K. Pathak (APP)" },
      { timestamp: "22 Jan 2024, 11:30 AM", action: "Filed in Court of Chief Judicial Magistrate", officer: "Insp. Rajesh Kumar" }
    ]
  },
  // ROW 2
  {
    id: "CS-2024-002",
    caseNo: "#2024-1654",
    section: "IPC 376 - Assault",
    filedDate: "18 Jan 2024",
    filedTime: "02:15 PM",
    court: "Sessions Court",
    city: "Bhopal",
    status: "Under Review",
    documentsCount: 8,
    accused: "Karan Johri",
    investigatingOfficer: "Sub-Insp. Priya Sharma",
    courtDocketNo: "PENDING-SCRUTINY",
    hash: "7b8d4e9c1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
    notes: "Under preliminary legal scrutiny by Directorate of Public Prosecution prior to judicial filing.",
    auditLogs: [
      { timestamp: "18 Jan 2024, 02:15 PM", action: "Submitted for Legal Remand Scrutiny", officer: "Sub-Insp. Priya Sharma" }
    ]
  },
  // ROW 3
  {
    id: "CS-2024-003",
    caseNo: "#2024-1432",
    section: "IPC 420 - Fraud",
    filedDate: "12 Jan 2024",
    filedTime: "10:20 AM",
    court: "District Court",
    city: "Bhopal",
    status: "Draft",
    documentsCount: 15,
    accused: "Rameshwar Dayal & Apex Syndicate",
    investigatingOfficer: "Insp. Rajesh Kumar",
    courtDocketNo: "DRAFT-COMPILATION",
    hash: "3c91a0f5d7e8b9c0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
    notes: "Financial forensic audit report appended; awaiting final bank transaction certifications under Sec 65B.",
    auditLogs: [
      { timestamp: "12 Jan 2024, 10:20 AM", action: "Draft created and evidence annexures attached", officer: "Insp. Rajesh Kumar" }
    ]
  },
  // ROW 4
  {
    id: "CS-2024-004",
    caseNo: "#2024-1287",
    section: "NDPS Act",
    filedDate: "08 Jan 2024",
    filedTime: "04:45 PM",
    court: "Special Court (NDPS)",
    city: "Bhopal",
    status: "Accepted",
    documentsCount: 10,
    accused: "Samsher Khan",
    investigatingOfficer: "Insp. Rajesh Kumar",
    courtDocketNo: "NDPS-CASE-2024-012",
    hash: "9f2e3d4c5b6a708192a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
    notes: "Cognizance taken by Hon'ble Special Judge (NDPS); trial framing scheduled for next session.",
    auditLogs: [
      { timestamp: "05 Jan 2024, 11:00 AM", action: "Filed before Special NDPS Court", officer: "Insp. Rajesh Kumar" },
      { timestamp: "08 Jan 2024, 04:45 PM", action: "Judicial Cognizance Registered", officer: "Special Court Registrar" }
    ]
  },
  // ROW 5
  {
    id: "CS-2024-005",
    caseNo: "#2024-1102",
    section: "IPC 304 - Culpable Homicide",
    filedDate: "05 Jan 2024",
    filedTime: "01:10 PM",
    court: "District Court",
    city: "Bhopal",
    status: "Submitted",
    documentsCount: 11,
    accused: "Dinesh Chandel",
    investigatingOfficer: "Insp. Rajesh Kumar",
    courtDocketNo: "CR-CASE-2024-7719",
    hash: "e5d6c7b8a9f0123456789abcdef0123456789abcdef0123456789abcdef01234",
    notes: "Chargesheet lodged in compliance with statutory 90-day custody timeline.",
    auditLogs: [
      { timestamp: "05 Jan 2024, 01:10 PM", action: "Lodged in Court Registry", officer: "Insp. Rajesh Kumar" }
    ]
  },
  // ROW 6
  {
    id: "CS-2023-9845",
    caseNo: "#2023-9845",
    section: "IPC 379 - Theft",
    filedDate: "28 Dec 2023",
    filedTime: "03:25 PM",
    court: "Metropolitan Court",
    city: "Bhopal",
    status: "Returned",
    documentsCount: 7,
    accused: "Sunil Verma",
    investigatingOfficer: "Sub-Insp. Priya Sharma",
    courtDocketNo: "RETURN-DEFECT-09",
    hash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    notes: "Returned by Court Reader with objection: Certified copy of seizure panchnama page 3 missing magistrate stamp.",
    auditLogs: [
      { timestamp: "24 Dec 2023, 11:00 AM", action: "Initial submission", officer: "Sub-Insp. Priya Sharma" },
      { timestamp: "28 Dec 2023, 03:25 PM", action: "Returned with Scrutiny Defects memo", officer: "Court Chief Reader" }
    ]
  },
  // ROW 7
  {
    id: "CS-2023-7765",
    caseNo: "#2023-7765",
    section: "IPC 307 - Attempt to Murder",
    filedDate: "20 Dec 2023",
    filedTime: "11:50 AM",
    court: "Sessions Court",
    city: "Bhopal",
    status: "Submitted",
    documentsCount: 14,
    accused: "Gopal Yadav & 2 Others",
    investigatingOfficer: "Insp. Rajesh Kumar",
    courtDocketNo: "SESS-TRIAL-2023-402",
    hash: "887766554433221100aabbccddeeff0011223344556677889900aabbccddeeff",
    notes: "Complete medical injury certificate from AIIMS Bhopal and weapon recovery panchnama attached.",
    auditLogs: [
      { timestamp: "20 Dec 2023, 11:50 AM", action: "Lodged before Sessions Judge", officer: "Insp. Rajesh Kumar" }
    ]
  },
  // ROW 8
  {
    id: "CS-2023-6654",
    caseNo: "#2023-6654",
    section: "IPC 498A - Domestic Violence",
    filedDate: "15 Dec 2023",
    filedTime: "02:30 PM",
    court: "Family Court",
    city: "Bhopal",
    status: "Under Review",
    documentsCount: 9,
    accused: "Pradeep Joshi & In-laws",
    investigatingOfficer: "Sub-Insp. Priya Sharma",
    courtDocketNo: "FAM-CR-2023-118",
    hash: "33221144556677889900aabbccddeeff11223344556677889900aabbccddeeff",
    notes: "Mediation report from District Legal Services Authority (DLSA) annexed; awaiting prosecution clearance.",
    auditLogs: [
      { timestamp: "15 Dec 2023, 02:30 PM", action: "Forwarded for DLSA verification", officer: "Sub-Insp. Priya Sharma" }
    ]
  },

  // Additional 10 records for Pages 2 and 3 (Total: 18 items)
  {
    id: "CS-2023-6650",
    caseNo: "#2024-1768",
    section: "Arms Act Sec 25/27",
    filedDate: "10 Dec 2023",
    filedTime: "10:15 AM",
    court: "District Court",
    city: "Bhopal",
    status: "Accepted",
    documentsCount: 6,
    accused: "Vikram Malhotra",
    investigatingOfficer: "Insp. Rajesh Kumar",
    courtDocketNo: "ARMS-CASE-2023-88",
    hash: "2233445566778899aabbccddeeff00112233445566778899aabbccddeeff0011",
    notes: "District Magistrate sanction under Section 39 Arms Act attached.",
    auditLogs: [{ timestamp: "10 Dec 2023, 10:15 AM", action: "Sanction verified & accepted", officer: "Insp. Rajesh Kumar" }]
  },
  {
    id: "CS-2023-6648",
    caseNo: "#2024-1432",
    section: "IT Act Sec 66D - Cyber Impersonation",
    filedDate: "05 Dec 2023",
    filedTime: "03:40 PM",
    court: "District Court",
    city: "Bhopal",
    status: "Submitted",
    documentsCount: 13,
    accused: "Anonymous Syndicate Operator",
    investigatingOfficer: "Sub-Insp. Priya Sharma",
    courtDocketNo: "CYBER-CASE-2023-104",
    hash: "4455667788990011223344556677889900112233445566778899001122334455",
    notes: "IPDR logs and VPN hop tracing reports attached.",
    auditLogs: [{ timestamp: "05 Dec 2023, 03:40 PM", action: "Submitted to Cyber Magistrate", officer: "Sub-Insp. Priya Sharma" }]
  },
  {
    id: "CS-2023-6645",
    caseNo: "#2024-1102",
    section: "IPC 326 - Voluntarily Causing Grievous Hurt",
    filedDate: "01 Dec 2023",
    filedTime: "11:20 AM",
    court: "Sessions Court",
    city: "Bhopal",
    status: "Submitted",
    documentsCount: 11,
    accused: "Mukesh Yadav",
    investigatingOfficer: "Insp. Rajesh Kumar",
    courtDocketNo: "SESS-CASE-2023-91",
    hash: "5566778899001122334455667788990011223344556677889900112233445566",
    notes: "MLC hospital docket and eyewitness statements verified.",
    auditLogs: [{ timestamp: "01 Dec 2023, 11:20 AM", action: "Filed in court", officer: "Insp. Rajesh Kumar" }]
  },
  {
    id: "CS-2023-6640",
    caseNo: "#2023-9845",
    section: "IPC 411 - Dishonestly Receiving Stolen Property",
    filedDate: "25 Nov 2023",
    filedTime: "04:10 PM",
    court: "Metropolitan Court",
    city: "Bhopal",
    status: "Draft",
    documentsCount: 8,
    accused: "Pawan Scrap Traders",
    investigatingOfficer: "Sub-Insp. Priya Sharma",
    courtDocketNo: "DRAFT-STOLEN-411",
    hash: "6677889900112233445566778899001122334455667788990011223344556677",
    notes: "Recovery panchnama in draft stage.",
    auditLogs: [{ timestamp: "25 Nov 2023, 04:10 PM", action: "Drafting initiated", officer: "Sub-Insp. Priya Sharma" }]
  },
  {
    id: "CS-2023-6635",
    caseNo: "#2023-7765",
    section: "IPC 457/380 - House Trespass & Burglary",
    filedDate: "20 Nov 2023",
    filedTime: "01:05 PM",
    court: "District Court",
    city: "Bhopal",
    status: "Draft",
    documentsCount: 10,
    accused: "Unknown Burglary Crew",
    investigatingOfficer: "Insp. Rajesh Kumar",
    courtDocketNo: "DRAFT-BURGLARY-7765",
    hash: "7788990011223344556677889900112233445566778899001122334455667788",
    notes: "Forensic lock impression report awaited from laboratory.",
    auditLogs: [{ timestamp: "20 Nov 2023, 01:05 PM", action: "Interim draft created", officer: "Insp. Rajesh Kumar" }]
  },
  {
    id: "CS-2023-6630",
    caseNo: "#2024-1654",
    section: "POCSO Act Sec 4/8",
    filedDate: "15 Nov 2023",
    filedTime: "12:30 PM",
    court: "Special Court (POCSO)",
    city: "Bhopal",
    status: "Under Review",
    documentsCount: 16,
    accused: "Karan Johri",
    investigatingOfficer: "Sub-Insp. Priya Sharma",
    courtDocketNo: "POCSO-REVIEW-1654",
    hash: "8899001122334455667788990011223344556677889900112233445566778899",
    notes: "Child Welfare Committee (CWC) report and video-recorded Sec 164 statement attached.",
    auditLogs: [{ timestamp: "15 Nov 2023, 12:30 PM", action: "Forwarded to Special Prosecutor", officer: "Sub-Insp. Priya Sharma" }]
  },
  {
    id: "CS-2023-6625",
    caseNo: "#2024-1287",
    section: "IPC 201 - Causing Disappearance of Evidence",
    filedDate: "10 Nov 2023",
    filedTime: "02:15 PM",
    court: "District Court",
    city: "Bhopal",
    status: "Draft",
    documentsCount: 7,
    accused: "Associate Harish Rawat",
    investigatingOfficer: "Insp. Rajesh Kumar",
    courtDocketNo: "DRAFT-SEC201",
    hash: "9900112233445566778899001122334455667788990011223344556677889900",
    notes: "CCTV deletion audit trail being finalized.",
    auditLogs: [{ timestamp: "10 Nov 2023, 02:15 PM", action: "Drafting supplementary charge sheet", officer: "Insp. Rajesh Kumar" }]
  },
  {
    id: "CS-2023-6620",
    caseNo: "#2024-1768",
    section: "IPC 120B - Criminal Conspiracy",
    filedDate: "05 Nov 2023",
    filedTime: "09:45 AM",
    court: "Sessions Court",
    city: "Bhopal",
    status: "Submitted",
    documentsCount: 18,
    accused: "Vikram Malhotra, Rohan Verma & Syndicate",
    investigatingOfficer: "Insp. Rajesh Kumar",
    courtDocketNo: "SESS-CONSP-1768",
    hash: "0011223344556677889900112233445566778899001122334455667788990011",
    notes: "Tower location overlap data and WhatsApp chat transcripts appended.",
    auditLogs: [{ timestamp: "05 Nov 2023, 09:45 AM", action: "Submitted to Principal District Judge", officer: "Insp. Rajesh Kumar" }]
  },
  {
    id: "CS-2023-6615",
    caseNo: "#2024-1102",
    section: "Motor Vehicles Act Sec 184 - Dangerous Driving",
    filedDate: "01 Nov 2023",
    filedTime: "03:00 PM",
    court: "District Court",
    city: "Bhopal",
    status: "Under Review",
    documentsCount: 5,
    accused: "Dinesh Chandel",
    investigatingOfficer: "Insp. Rajesh Kumar",
    courtDocketNo: "MV-REVIEW-1102",
    hash: "1122334455667788990011223344556677889900112233445566778899001122",
    notes: "RTO mechanical fitness inspection certificate attached.",
    auditLogs: [{ timestamp: "01 Nov 2023, 03:00 PM", action: "Submitted to court clerk", officer: "Insp. Rajesh Kumar" }]
  },
  {
    id: "CS-2023-6610",
    caseNo: "#2023-9845",
    section: "IPC 468 - Forgery for Purpose of Cheating",
    filedDate: "28 Oct 2023",
    filedTime: "11:15 AM",
    court: "District Court",
    city: "Bhopal",
    status: "Draft",
    documentsCount: 9,
    accused: "Kailash Chand",
    investigatingOfficer: "Sub-Insp. Priya Sharma",
    courtDocketNo: "DRAFT-FORGERY-9845",
    hash: "2233445566778899001122334455667788990011223344556677889900112233",
    notes: "Questioned document examiner report to be appended.",
    auditLogs: [{ timestamp: "28 Oct 2023, 11:15 AM", action: "Initial draft generated", officer: "Sub-Insp. Priya Sharma" }]
  }
];

// Note: Status count breakdown matches the reference image exactly:
// Total: 18
// Draft: 5 (CS-2024-003, CS-2023-6640, CS-2023-6635, CS-2023-6625, CS-2023-6610)
// Under Review: 4 (CS-2024-002, CS-2023-6654, CS-2023-6630, CS-2023-6615)
// Submitted: 6 (CS-2024-001, CS-2024-005, CS-2023-7765, CS-2023-6648, CS-2023-6645, CS-2023-6620)
// Accepted: 2 (CS-2024-004, CS-2023-6650)
// Returned: 1 (CS-2023-9845)
// Others: 0
