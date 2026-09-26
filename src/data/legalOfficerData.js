// ========================================================
// DocShield — Legal Officer / Court Prosecutor Data Store
// SIH 26190 — Prosecution & Judicial Review Data
// ========================================================

export const legalDashboardKPIs = [
  {
    id: "assignedCases",
    title: "Total Assigned Cases",
    value: "18",
    trend: "↑ +2",
    trendText: "active for scrutiny",
    trendColor: "#10B981",
    iconType: "briefcase"
  },
  {
    id: "legalReview",
    title: "Cases Under Legal Review",
    value: "7",
    trend: "Requires Scrutiny",
    trendText: "within 48 hrs",
    trendColor: "#D97706",
    iconType: "scale"
  },
  {
    id: "pendingChargeSheets",
    title: "Pending Charge Sheets",
    value: "4",
    trend: "2 Due Tomorrow",
    trendText: "statutory 60/90 days",
    trendColor: "#EF4444",
    iconType: "fileCheck"
  },
  {
    id: "pendingCourtFilings",
    title: "Pending Court Filings",
    value: "3",
    trend: "JMFC Bhopal",
    trendText: "e-filing pending",
    trendColor: "#1E6DEB",
    iconType: "landmark"
  },
  {
    id: "upcomingCourtMatters",
    title: "Upcoming Court Matters",
    value: "5",
    trend: "Next: 24 Jan, 11:00 AM",
    trendText: "Sessions Court",
    trendColor: "#9333EA",
    iconType: "calendar"
  }
];

export const legalReviewQueue = [
  {
    id: "REV-2024-001",
    caseNo: "#2024-1768",
    title: "State of M.P. vs. Vikram Yadav & Ors",
    itemType: "Final Charge Sheet U/S 173(2) CrPC",
    investigatingOfficer: "Insp. Rajesh Kumar",
    submittedDate: "22 Jan 2024",
    priority: "High",
    status: "Scrutiny Pending",
    deadline: "25 Jan 2024",
    charges: "IPC 302, 34, 120-B & Arms Act Sec 25/27"
  },
  {
    id: "REV-2024-002",
    caseNo: "#2024-1654",
    title: "State of M.P. vs. Ramesh Kushwaha",
    itemType: "DNA Forensic & Medico-Legal Report",
    investigatingOfficer: "Insp. Rajesh Kumar",
    submittedDate: "21 Jan 2024",
    priority: "Urgent",
    status: "Clarification Needed",
    deadline: "24 Jan 2024",
    charges: "IPC 376(2)(n), 506"
  },
  {
    id: "REV-2024-003",
    caseNo: "#2024-1432",
    title: "State of M.P. vs. Alok Singhal & Syndicates",
    itemType: "Supplementary Seizure Panchnama & Sec 65B Certificate",
    investigatingOfficer: "Insp. S. Gupta",
    submittedDate: "20 Jan 2024",
    priority: "Medium",
    status: "Approved",
    deadline: "28 Jan 2024",
    charges: "IPC 420, 467, 468, 471, 120-B"
  },
  {
    id: "REV-2024-004",
    caseNo: "#2024-1389",
    title: "State of M.P. vs. Mohit Bansal",
    itemType: "Draft Bail Opposition Rebuttal Affidavit",
    investigatingOfficer: "Insp. A. Khan",
    submittedDate: "23 Jan 2024",
    priority: "Urgent",
    status: "Scrutiny Pending",
    deadline: "24 Jan 2024, 02:00 PM",
    charges: "NDPS Act Sec 8/20, 29"
  }
];

export const upcomingCourtFilings = [
  {
    id: "FIL-2024-101",
    caseNo: "#2024-1768",
    court: "Judicial Magistrate First Class (JMFC-02), Bhopal",
    filingType: "Final Form / Charge Sheet U/S 173 CrPC",
    hearingDate: "25 Jan 2024",
    hearingTime: "11:30 AM",
    bench: "Shri V.K. Tiwari, Hon'ble JMFC",
    status: "Ready for Presentation",
    prosecutor: "Adv. Arvind Joshi (DPO)"
  },
  {
    id: "FIL-2024-102",
    caseNo: "#2024-1654",
    court: "Special POCSO / Fast Track Court-01, Bhopal",
    filingType: "Application for Judicial Custody Extension",
    hearingDate: "26 Jan 2024",
    hearingTime: "02:15 PM",
    bench: "Special Sessions Judge, Court No. 4",
    status: "Draft Filed",
    prosecutor: "Adv. Arvind Joshi (DPO)"
  },
  {
    id: "FIL-2024-103",
    caseNo: "#2024-1389",
    court: "Special NDPS Court, District Court Complex Bhopal",
    filingType: "Opposition to Regular Bail under Sec 37 NDPS",
    hearingDate: "27 Jan 2024",
    hearingTime: "10:30 AM",
    bench: "Additional Sessions Judge-03",
    status: "Affidavit Pre-Signed",
    prosecutor: "Adv. Arvind Joshi (DPO)"
  }
];

export const legalCasesList = [
  {
    id: "#2024-1768",
    title: "State of M.P. vs. Vikram Yadav & Ors",
    section: "IPC 302, 34 / Arms Act 25",
    io: "Insp. Rajesh Kumar",
    station: "Bhopal Central PS",
    assignedDate: "12 Jan 2024",
    lastUpdated: "22 Jan 2024",
    caseStatus: "Active",
    legalReviewStatus: "Scrutiny Pending",
    accused: "Vikram Yadav (28), Rahul Meena (26)",
    complainant: "Rajeshwar Dayal",
    court: "JMFC-02 Bhopal",
    evidenceItems: 5,
    documentsCount: 12,
    nextCourtDate: "25 Jan 2024",
    summary: "Homicide at MP Nagar Zone 1. Recovery of country-made pistol with intact ballistic matching. Charge sheet drafted within 14 days."
  },
  {
    id: "#2024-1654",
    title: "State of M.P. vs. Ramesh Kushwaha",
    section: "IPC 376(2)(n), 506",
    io: "Insp. Rajesh Kumar",
    station: "Bhopal Central PS",
    assignedDate: "10 Jan 2024",
    lastUpdated: "21 Jan 2024",
    caseStatus: "Under Review",
    legalReviewStatus: "Clarification Needed",
    accused: "Ramesh Kushwaha (34)",
    complainant: "Confidential (Victim Statement)",
    court: "Special Fast Track Court Bhopal",
    evidenceItems: 3,
    documentsCount: 8,
    nextCourtDate: "26 Jan 2024",
    summary: "Statutory fast-track trial. Section 164 statement recorded. DNA swab report requested clarification on chain of custody transit note."
  },
  {
    id: "#2024-1432",
    title: "State of M.P. vs. Alok Singhal & Syndicates",
    section: "IPC 420, 467, 468, 471, 120-B",
    io: "Insp. S. Gupta",
    station: "Bhopal Central PS",
    assignedDate: "08 Jan 2024",
    lastUpdated: "20 Jan 2024",
    caseStatus: "Active",
    legalReviewStatus: "Approved",
    accused: "Alok Singhal, Rakesh Agrawal, Sunita Verma",
    complainant: "State Bank of India Zonal Office",
    court: "Chief Judicial Magistrate (CJM) Bhopal",
    evidenceItems: 6,
    documentsCount: 15,
    nextCourtDate: "02 Feb 2024",
    summary: "Multi-party fraudulent loan disbursement syndicate. Certified under Sec 65B Evidence Act; digital forensic extraction verified."
  },
  {
    id: "#2024-1389",
    title: "State of M.P. vs. Mohit Bansal",
    section: "NDPS Act Sec 8/20, 29",
    io: "Insp. A. Khan",
    station: "Indore Central PS",
    assignedDate: "05 Jan 2024",
    lastUpdated: "23 Jan 2024",
    caseStatus: "Active",
    legalReviewStatus: "Scrutiny Pending",
    accused: "Mohit Bansal (23)",
    complainant: "Narcotics Investigation Cell",
    court: "Special NDPS Court Bhopal",
    evidenceItems: 4,
    documentsCount: 9,
    nextCourtDate: "27 Jan 2024",
    summary: "Commercial quantity seizure. Rigorous compliance with Section 42 & 50 NDPS Act search notices inspected and endorsed."
  },
  {
    id: "#2024-1290",
    title: "State of M.P. vs. Deepak Sharma",
    section: "IPC 392, 397 (Armed Robbery)",
    io: "Insp. P. Singh",
    station: "Gwalior Kotwali PS",
    assignedDate: "28 Dec 2023",
    lastUpdated: "19 Jan 2024",
    caseStatus: "Closed",
    legalReviewStatus: "Finalized",
    accused: "Deepak Sharma (29)",
    complainant: "Hira Jewellers Bhopal",
    court: "District & Sessions Court Bhopal",
    evidenceItems: 7,
    documentsCount: 14,
    nextCourtDate: "Disposed",
    summary: "Conviction secured before Sessions Court under Sec 397 IPC. Complete certified docket archived with tamper-evident seal."
  },
  {
    id: "#2024-1180",
    title: "State of M.P. vs. Farooq Ahmed",
    section: "IPC 307 (Attempt to Murder)",
    io: "Insp. N. Verma",
    station: "Jabalpur Civil Lines",
    assignedDate: "15 Dec 2023",
    lastUpdated: "18 Jan 2024",
    caseStatus: "Active",
    legalReviewStatus: "Re-investigation Needed",
    accused: "Farooq Ahmed (31)",
    complainant: "Mohd. Shakeel",
    court: "JMFC-04 Bhopal",
    evidenceItems: 3,
    documentsCount: 6,
    nextCourtDate: "30 Jan 2024",
    summary: "Returned to IO for supplementary medical expert opinion on nature of head injury before submitting charge sheet."
  }
];

export const legalDocumentsList = [
  {
    id: "DOC-LEG-01",
    name: "FIR_Form_154_Signed.pdf",
    type: "FIR",
    caseNo: "#2024-1768",
    uploadedBy: "Insp. Rajesh Kumar",
    verificationStatus: "Verified Intact",
    legalReviewStatus: "Admissible",
    hash: "a8f5c2d3e4b5a6c7...89b1",
    updatedDate: "21 Jan 2024",
    notes: "Compliant with CrPC 154 requirements. Signed by informant with thumb impression witness."
  },
  {
    id: "DOC-LEG-02",
    name: "Medical_Injury_Report_MLC_89.pdf",
    type: "Medical",
    caseNo: "#2024-1654",
    uploadedBy: "Insp. Rajesh Kumar",
    verificationStatus: "Verified Intact",
    legalReviewStatus: "Under Scrutiny",
    hash: "3c91a0f5d7e8b9c0...11f2",
    updatedDate: "18 Jan 2024",
    notes: "Doctor's registration seal verified. Awaiting clarification on precise time of physical examination."
  },
  {
    id: "DOC-LEG-03",
    name: "Sec_65B_Electronic_Evidence_Affidavit.pdf",
    type: "65B Certificate",
    caseNo: "#2024-1432",
    uploadedBy: "Insp. S. Gupta",
    verificationStatus: "Verified Intact",
    legalReviewStatus: "Admissible",
    hash: "e5d6c7b8a9f01234...9988",
    updatedDate: "16 Jan 2024",
    notes: "Mandatory statutory affidavit in terms of Arjun Panditrao Khotkar judgment. Fully admissible."
  },
  {
    id: "DOC-LEG-04",
    name: "Spot_Panchnama_Scene_01.pdf",
    type: "Panchnama",
    caseNo: "#2024-1768",
    uploadedBy: "Insp. Rajesh Kumar",
    verificationStatus: "Verified Intact",
    legalReviewStatus: "Admissible",
    hash: "7b8d4e9c1f2a3b4c...6a7b",
    updatedDate: "15 Jan 2024",
    notes: "Two independent public panchas signed. Rough site plan demarcated with compass directions."
  },
  {
    id: "DOC-LEG-05",
    name: "Seizure_Memo_NDPS_Search_Notice.pdf",
    type: "Seizure Memo",
    caseNo: "#2024-1389",
    uploadedBy: "Insp. A. Khan",
    verificationStatus: "Verified Intact",
    legalReviewStatus: "Defect Noted",
    hash: "8877665544332211...00aa",
    updatedDate: "14 Jan 2024",
    notes: "Requires IO confirmation whether right to be searched before Gazetted Officer was offered in writing under Section 50 NDPS."
  },
  {
    id: "DOC-LEG-06",
    name: "Forensic_Ballistic_Expert_Report.pdf",
    type: "Forensic",
    caseNo: "#2024-1768",
    uploadedBy: "RFSL Bhopal / Insp. Rajesh Kumar",
    verificationStatus: "Verified Intact",
    legalReviewStatus: "Admissible",
    hash: "1a2b3c4d5e6f7a8b...1234",
    updatedDate: "20 Jan 2024",
    notes: "Conclusive matching between test-fired cartridge and recovered firearm breech face marks."
  }
];

export const legalEvidenceList = [
  {
    id: "EV-LEG-001",
    caseNo: "#2024-1768",
    type: "Physical - Firearm",
    description: "Country-made 0.315 Bore Pistol with Wooden Butt",
    submittedBy: "Insp. Rajesh Kumar",
    custodyStatus: "Vault Secured",
    currentHolder: "Station Malkhana Bhopal",
    verificationStatus: "SHA-256 Verified",
    reviewStatus: "Court Admissible",
    admissibilityNotes: "Recovery memo drawn on spot with two independent witnesses. Serial seal #MP-BPL-SEAL-891 intact."
  },
  {
    id: "EV-LEG-002",
    caseNo: "#2024-1768",
    type: "Physical - Ammunition",
    description: "Spent Brass Cartridge Case (0.315)",
    submittedBy: "Insp. Rajesh Kumar",
    custodyStatus: "At FSL Bhopal",
    currentHolder: "State FSL Ballistics Division",
    verificationStatus: "SHA-256 Verified",
    reviewStatus: "Chain Verified",
    admissibilityNotes: "Forwarded via Road Certificate RC-BH-2024-410. Expert testimony cited in draft witness list."
  },
  {
    id: "EV-LEG-003",
    caseNo: "#2024-1654",
    type: "Biological - Swabs",
    description: "Sealed DNA Sample Box in Sterile Container",
    submittedBy: "Insp. Rajesh Kumar",
    custodyStatus: "Cold Storage Malkhana",
    currentHolder: "RFSL Biological Division",
    verificationStatus: "SHA-256 Verified",
    reviewStatus: "Query Raised",
    admissibilityNotes: "Clarification requested on temperature log during transit between District Hospital and Lab."
  },
  {
    id: "EV-LEG-004",
    caseNo: "#2024-1432",
    type: "Digital - Storage",
    description: "SanDisk 64GB Flash Drive containing fraudulent bank dockets",
    submittedBy: "Insp. S. Gupta",
    custodyStatus: "Cyber Evidence Locker",
    currentHolder: "Cyber Crime Cell Bhopal",
    verificationStatus: "SHA-256 Verified",
    reviewStatus: "Court Admissible",
    admissibilityNotes: "Bit-stream image extracted via write blocker with MD5/SHA-256 corroboration."
  },
  {
    id: "EV-LEG-005",
    caseNo: "#2024-1389",
    type: "Contraband - NDPS",
    description: "Two sealed plastic pouches containing 1.2 kg suspected Charas",
    submittedBy: "Insp. A. Khan",
    custodyStatus: "Judicial Malkhana",
    currentHolder: "Sessions Malkhana Bhopal",
    verificationStatus: "SHA-256 Verified",
    reviewStatus: "Court Admissible",
    admissibilityNotes: "Sample drawn before Judicial Magistrate under Section 52A NDPS Act with photographic evidence."
  }
];

export const legalForensicReportsList = [
  {
    id: "FSL-LEG-2024-041",
    caseNo: "#2024-1768",
    reportType: "Ballistics & Toolmark Examination",
    lab: "Regional Forensic Science Laboratory, Bhopal",
    expertName: "Dr. K.S. Rathore (Senior Scientific Officer)",
    submittedDate: "20 Jan 2024",
    forensicStatus: "Report Finalized",
    reviewedStatus: "Legal Clearance",
    conclusions: "The cartridge case exhibit EV-0090 was fired from the improvised firearm exhibit EV-0089 to the exclusion of all other weapons.",
    admissibilityScore: "100% Admissible under Sec 45 Indian Evidence Act"
  },
  {
    id: "FSL-LEG-2024-038",
    caseNo: "#2024-1654",
    reportType: "DNA Profiling & STR Analysis",
    lab: "Central Forensic Science Laboratory, Bhopal",
    expertName: "Dr. Anita Saxena (Deputy Director DNA)",
    submittedDate: "19 Jan 2024",
    forensicStatus: "Final Analysis Ready",
    reviewedStatus: "Clarification Requested",
    conclusions: "Single source male STR profile obtained from exhibit. Match probability exceeds 1 in 10 billion with suspect reference sample.",
    admissibilityScore: "Admissible pending transit chain note"
  },
  {
    id: "FSL-LEG-2024-029",
    caseNo: "#2024-1432",
    reportType: "Digital Forensic & Hash Verification",
    lab: "State Cyber Forensic Lab, Bhopal",
    expertName: "Er. Manish Tripathi (Cyber Examiner)",
    submittedDate: "17 Jan 2024",
    forensicStatus: "Report Finalized",
    reviewedStatus: "Legal Clearance",
    conclusions: "Forensic image matched original device SHA-256. 18 deleted PDF dockets successfully carved and authenticated.",
    admissibilityScore: "Sec 65B Certified & Fully Admissible"
  },
  {
    id: "FSL-LEG-2024-012",
    caseNo: "#2024-1389",
    reportType: "Chemical Toxicology & Narcotic Assay",
    lab: "State Forensic Science Laboratory, Sagar",
    expertName: "Dr. P.K. Mishra (Scientific Officer Chemistry)",
    submittedDate: "15 Jan 2024",
    forensicStatus: "Report Finalized",
    reviewedStatus: "Legal Clearance",
    conclusions: "Sample tested positive for Tetrahydrocannabinol (THC) content exceeding 14.2% w/w, confirming narcotic resin.",
    admissibilityScore: "Qualifies as commercial threshold under NDPS schedule"
  }
];

export const legalChargeSheetsList = [
  {
    id: "CS-LEG-2024-01",
    caseNo: "#2024-1768",
    caseTitle: "State of M.P. vs. Vikram Yadav & Ors",
    preparedBy: "Insp. Rajesh Kumar",
    station: "Bhopal Central Police Station",
    lastUpdated: "22 Jan 2024, 04:30 PM",
    statutoryDeadline: "28 Jan 2024 (Day 52/60)",
    chargeSheetStatus: "Under Review",
    legalReviewStatus: "Scrutiny in Progress",
    sectionsApplicable: ["IPC 302 (Murder)", "IPC 34 (Common Intention)", "Arms Act Sec 25/27"],
    accusedList: [
      { name: "Vikram Yadav", age: 28, custody: "Judicial Custody", arrestDate: "12 Jan 2024" },
      { name: "Rahul Meena", age: 26, custody: "Judicial Custody", arrestDate: "13 Jan 2024" }
    ],
    prosecutionWitnessesCount: 14,
    exhibitsCount: 5,
    documentsCount: 12,
    investigationSummary: "Accused Vikram Yadav had pre-existing dispute with deceased Rajeshwar Dayal over property boundary. On 12 Jan 2024 at 10:15 AM, Vikram with associate Rahul Meena intercepted the deceased and fired two shots resulting in fatal chest trauma. Firearm recovered on spot.",
    legalReviewNotes: "1. Eye witness testimonies under Sec 161 CrPC corroborated with CCTV footage.\n2. Ballistic report FSL-BP-2024-041 firmly matches recovered weapon.\n3. Sanction under Section 39 Arms Act obtained from District Magistrate Bhopal.\n4. Charge sheet is legally sound and ready for filing before JMFC-02 Bhopal."
  },
  {
    id: "CS-LEG-2024-02",
    caseNo: "#2024-1654",
    caseTitle: "State of M.P. vs. Ramesh Kushwaha",
    preparedBy: "Insp. Rajesh Kumar",
    station: "Bhopal Central Police Station",
    lastUpdated: "21 Jan 2024, 02:15 PM",
    statutoryDeadline: "26 Jan 2024 (Day 58/60)",
    chargeSheetStatus: "Returned",
    legalReviewStatus: "Observations Sent to IO",
    sectionsApplicable: ["IPC 376(2)(n) (Repeat Rape)", "IPC 506 (Criminal Intimidation)"],
    accusedList: [
      { name: "Ramesh Kushwaha", age: 34, custody: "Judicial Custody", arrestDate: "10 Jan 2024" }
    ],
    prosecutionWitnessesCount: 8,
    exhibitsCount: 3,
    documentsCount: 8,
    investigationSummary: "Complainant was coerced and subjected to repeated sexual assault under threats to circulate compromised photographs. Accused arrested with mobile device containing threatening messages.",
    legalReviewNotes: "Returned to IO with observation: Transit log of medical exhibits between District Hospital and CFSL requires signed verification by accompanying Constable Suresh Patel before submission to court."
  },
  {
    id: "CS-LEG-2024-03",
    caseNo: "#2024-1432",
    caseTitle: "State of M.P. vs. Alok Singhal & Syndicates",
    preparedBy: "Insp. S. Gupta",
    station: "Bhopal Central Police Station",
    lastUpdated: "20 Jan 2024, 11:00 AM",
    statutoryDeadline: "15 Feb 2024 (Day 42/90)",
    chargeSheetStatus: "Finalized",
    legalReviewStatus: "Approved & Signed",
    sectionsApplicable: ["IPC 420 (Cheating)", "IPC 467 (Forgery of Valuable Security)", "IPC 468", "IPC 471", "IPC 120-B"],
    accusedList: [
      { name: "Alok Singhal", age: 46, custody: "Bail with Conditions", arrestDate: "08 Jan 2024" },
      { name: "Rakesh Agrawal", age: 51, custody: "Judicial Custody", arrestDate: "09 Jan 2024" }
    ],
    prosecutionWitnessesCount: 19,
    exhibitsCount: 6,
    documentsCount: 15,
    investigationSummary: "Fraudulent creation of non-existent residential plot allotments used as collateral for Rs 3.8 Crores credit facility from State Bank of India. Certified digital audit trail attached.",
    legalReviewNotes: "Finalized. All Section 65B Indian Evidence Act certificates in order. Ready for e-filing before CJM Bhopal."
  },
  {
    id: "CS-LEG-2024-04",
    caseNo: "#2024-1389",
    caseTitle: "State of M.P. vs. Mohit Bansal",
    preparedBy: "Insp. A. Khan",
    station: "Indore Central Police Station",
    lastUpdated: "19 Jan 2024, 05:45 PM",
    statutoryDeadline: "24 Jan 2024 (Day 54/60)",
    chargeSheetStatus: "Draft",
    legalReviewStatus: "Under Legal Scrutiny",
    sectionsApplicable: ["NDPS Act Sec 8/20", "NDPS Act Sec 29"],
    accusedList: [
      { name: "Mohit Bansal", age: 23, custody: "Judicial Custody", arrestDate: "05 Jan 2024" }
    ],
    prosecutionWitnessesCount: 9,
    exhibitsCount: 4,
    documentsCount: 9,
    investigationSummary: "Apprehended near Inter-state bus terminus with commercial quantity Charas in backpack. Immediate search conducted in presence of Executive Magistrate.",
    legalReviewNotes: "Check compliance with statutory Section 52A CrPC sampling procedure order. FSL chemical report verified positive."
  }
];

export const legalCourtFilingsList = [
  {
    id: "CF-2024-001",
    caseNo: "#2024-1768",
    filingType: "Final Report / Charge Sheet (Section 173 CrPC)",
    court: "Court of Judicial Magistrate First Class (JMFC-02), Bhopal",
    status: "Ready to File",
    submissionDate: "24 Jan 2024",
    nextHearing: "25 Jan 2024, 11:30 AM",
    bench: "Shri V.K. Tiwari, JMFC",
    documentsCount: 12,
    prosecutor: "Adv. Arvind Joshi",
    stage: "Cognizance & Process Issue"
  },
  {
    id: "CF-2024-002",
    caseNo: "#2024-1654",
    filingType: "Application for Extension of Judicial Custody",
    court: "Special Fast Track Court / POCSO Court-01, Bhopal",
    status: "Filed",
    submissionDate: "20 Jan 2024",
    nextHearing: "26 Jan 2024, 02:15 PM",
    bench: "Special Judge (Fast Track), Bhopal",
    documentsCount: 4,
    prosecutor: "Adv. Arvind Joshi",
    stage: "Judicial Remand Review"
  },
  {
    id: "CF-2024-003",
    caseNo: "#2024-1389",
    filingType: "Reply Affidavit Opposing Regular Bail",
    court: "Special NDPS Court, District Court Complex Bhopal",
    status: "Draft",
    submissionDate: "23 Jan 2024",
    nextHearing: "27 Jan 2024, 10:30 AM",
    bench: "Additional Sessions Judge-03",
    documentsCount: 5,
    prosecutor: "Adv. Arvind Joshi",
    stage: "Bail Arguments Hearing"
  },
  {
    id: "CF-2024-004",
    caseNo: "#2024-1432",
    filingType: "Application for Judicial Warrant of Production U/S 267",
    court: "Chief Judicial Magistrate Court, Bhopal",
    status: "Listed",
    submissionDate: "18 Jan 2024",
    nextHearing: "02 Feb 2024, 12:00 PM",
    bench: "Chief Judicial Magistrate, Bhopal",
    documentsCount: 6,
    prosecutor: "Adv. Arvind Joshi",
    stage: "Production Warrant Issue"
  }
];

export const legalCustodyTimelineData = [
  {
    evidenceId: "EV-LEG-001",
    caseNo: "#2024-1768",
    item: "Country-made 0.315 Bore Pistol with Wooden Butt",
    currentCustodian: "Head Constable Mohit Sen (Malkhana Moharrir)",
    currentLocation: "Station Malkhana, Bhopal Central PS",
    custodyStatus: "Vault Secured",
    lastTransfer: "20 Jan 2024, 04:00 PM",
    timeline: [
      { timestamp: "12 Jan 2024, 11:20 AM", from: "Crime Scene MP Nagar", to: "Insp. Rajesh Kumar", action: "Seized under Section 100 CrPC with 2 Panchas", sealIntact: true },
      { timestamp: "12 Jan 2024, 01:15 PM", from: "Insp. Rajesh Kumar", to: "Station Malkhana Bhopal", action: "Deposited in Malkhana Register No. 19, Item #452", sealIntact: true },
      { timestamp: "15 Jan 2024, 10:30 AM", from: "Station Malkhana", to: "Constable Suresh Patel (Escort)", action: "Dispatched to RFSL Bhopal under Road Certificate RC-BH-2024-410", sealIntact: true },
      { timestamp: "15 Jan 2024, 12:10 PM", from: "Constable Suresh Patel", to: "RFSL Ballistics Receiving Officer", action: "Delivered to Forensic Lab with intact wax seal #MP-BPL-SEAL-891", sealIntact: true },
      { timestamp: "20 Jan 2024, 04:00 PM", from: "RFSL Ballistics", to: "Station Malkhana Bhopal", action: "Returned with Ballistic Report #FSL-BP-2024-041 & re-sealed in Vault", sealIntact: true }
    ]
  },
  {
    evidenceId: "EV-LEG-002",
    caseNo: "#2024-1768",
    item: "Spent Brass Cartridge Case (0.315)",
    currentCustodian: "State FSL Ballistics Division",
    currentLocation: "RFSL Bhopal Exhibit Vault",
    custodyStatus: "At FSL",
    lastTransfer: "15 Jan 2024, 12:10 PM",
    timeline: [
      { timestamp: "12 Jan 2024, 11:35 AM", from: "Spot Investigation", to: "Insp. Rajesh Kumar", action: "Recovered near pillar #4 in presence of panchas", sealIntact: true },
      { timestamp: "12 Jan 2024, 01:20 PM", from: "Insp. Rajesh Kumar", to: "Station Malkhana", action: "Logged in Register No. 19, Item #453", sealIntact: true },
      { timestamp: "15 Jan 2024, 10:30 AM", from: "Station Malkhana", to: "Constable Suresh Patel", action: "Dispatched under RC-BH-2024-410", sealIntact: true },
      { timestamp: "15 Jan 2024, 12:10 PM", from: "Constable Suresh Patel", to: "RFSL Ballistics Section", action: "Admitted for comparison with pistol", sealIntact: true }
    ]
  }
];

export const legalAuditLogsList = [
  {
    id: "AUD-LEG-001",
    timestamp: "24 Jan 2024, 11:15 AM",
    user: "Adv. Arvind Joshi",
    role: "Legal Officer / DPO",
    action: "Approved Charge Sheet Scrutiny",
    module: "Charge Sheets",
    caseNo: "#2024-1768",
    result: "Success • Signed & Endorsed",
    ipAddress: "10.42.12.89 (Police Prosecution Network)"
  },
  {
    id: "AUD-LEG-002",
    timestamp: "24 Jan 2024, 10:45 AM",
    user: "Adv. Arvind Joshi",
    role: "Legal Officer / DPO",
    action: "Verified Forensic Ballistic Report",
    module: "Forensic Reports",
    caseNo: "#2024-1768",
    result: "Success • Cryptographic Checksum Intact",
    ipAddress: "10.42.12.89 (Police Prosecution Network)"
  },
  {
    id: "AUD-LEG-003",
    timestamp: "23 Jan 2024, 04:30 PM",
    user: "Adv. Arvind Joshi",
    role: "Legal Officer / DPO",
    action: "Returned Draft with Observations",
    module: "Charge Sheets",
    caseNo: "#2024-1654",
    result: "Returned to Insp. Rajesh Kumar",
    ipAddress: "10.42.12.89 (Police Prosecution Network)"
  },
  {
    id: "AUD-LEG-004",
    timestamp: "23 Jan 2024, 02:00 PM",
    user: "Adv. Arvind Joshi",
    role: "Legal Officer / DPO",
    action: "Drafted Bail Opposition Rebuttal",
    module: "Court Filings",
    caseNo: "#2024-1389",
    result: "Success • Affidavit Prepared",
    ipAddress: "10.42.12.89 (Police Prosecution Network)"
  },
  {
    id: "AUD-LEG-005",
    timestamp: "22 Jan 2024, 03:15 PM",
    user: "Adv. Arvind Joshi",
    role: "Legal Officer / DPO",
    action: "Inspected Chain of Custody Timeline",
    module: "Chain of Custody",
    caseNo: "#2024-1768",
    result: "Success • 5 Custody Handovers Verified",
    ipAddress: "10.42.12.89 (Police Prosecution Network)"
  }
];
