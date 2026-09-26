export const initialCasesData = [
  {
    id: "#2024-1768",
    section: "IPC 302 - Homicide",
    status: "Active",
    assignedDate: "12 Jan 2024",
    lastUpdated: "21 Jan 2024",
    documentsCount: 12,
    evidenceCount: 5,
    complainant: "Rajeshwar Dayal",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Fatal physical altercation at M.P. Nagar Zone-1. Accused apprehended at site of offense with country-made firearm.",
    documents: [
      { name: "FIR_Form_154_Signed.pdf", type: "FIR", hash: "a8f5c2d3...89b1", status: "Verified", size: "2.4 MB" },
      { name: "Spot_Panchnama_Scene_01.pdf", type: "Panchnama", hash: "7b8d4e9c...6a7b", status: "Verified", size: "4.1 MB" },
      { name: "Post_Mortem_Exam_Report.pdf", type: "Medical", hash: "3c91a0f5...11f2", status: "Verified", size: "1.8 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2024-0089", name: "Country-made 0.315 Pistol", cat: "Firearm", holder: "Station Malkhana", status: "In Vault" },
      { tag: "EV-BH-2024-0090", name: "Spent Brass Cartridge (0.315)", cat: "Ammunition", holder: "State FSL Bhopal", status: "At FSL" }
    ]
  },
  {
    id: "#2024-1654",
    section: "IPC 376 - Assault",
    status: "Under Review",
    assignedDate: "10 Jan 2024",
    lastUpdated: "18 Jan 2024",
    documentsCount: 8,
    evidenceCount: 3,
    complainant: "Victim Statement (Confidential)",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Investigation ongoing under statutory fast-track mandate. Medical examination completed; DNA swabs dispatched to Central Forensic Science Lab.",
    documents: [
      { name: "FIR_CrPC_154_Redacted.pdf", type: "FIR", hash: "e5d6c7b8...9988", status: "Verified", size: "1.9 MB" },
      { name: "Medico_Legal_Certificate.pdf", type: "Medical", hash: "1a2b3c4d...1234", status: "Verified", size: "3.2 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2024-0072", name: "Victim Apparel Sample", cat: "Biological", holder: "CFSL Bhopal", status: "At FSL" }
    ]
  },
  {
    id: "#2024-1432",
    section: "IPC 420 - Fraud",
    status: "Active",
    assignedDate: "08 Jan 2024",
    lastUpdated: "16 Jan 2024",
    documentsCount: 15,
    evidenceCount: 6,
    complainant: "State Bank of India (Zonal Branch)",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Multi-party fraudulent loan disbursement syndicate. Forged property deeds and unauthorized collateral guarantees seized under Section 91 CrPC.",
    documents: [
      { name: "Bank_Complaint_Audit_Log.pdf", type: "Other", hash: "55443322...ccdd", status: "Verified", size: "5.8 MB" },
      { name: "Forged_Registry_Deed_04.pdf", type: "Evidence Doc", hash: "88776655...00aa", status: "Verified", size: "4.3 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2024-0055", name: "Forged Notary Stamp & Seal", cat: "Documentary", holder: "Station Malkhana", status: "In Vault" }
    ]
  },
  {
    id: "#2024-1287",
    section: "NDPS Act",
    status: "Closed",
    assignedDate: "05 Jan 2024",
    lastUpdated: "10 Jan 2024",
    documentsCount: 10,
    evidenceCount: 4,
    complainant: "Narcotics Flying Squad",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Seizure of 4.2 kg contraband psychotropic substance. Forensic qualitative test confirmed positive. Formal charge sheet filed before Special NDPS Court.",
    documents: [
      { name: "NDPS_Seizure_Panchnama.pdf", type: "Panchnama", hash: "77665544...ffaa", status: "Verified", size: "3.5 MB" },
      { name: "Chemical_Examiner_FSL_Result.pdf", type: "Forensic", hash: "11223344...aacc", status: "Verified", size: "1.4 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2024-0031", name: "Sealed Contraband Pouch", cat: "Narcotics", holder: "Court Malkhana", status: "In Court" }
    ]
  },
  {
    id: "#2024-1102",
    section: "IPC 304 - Culpable Homicide",
    status: "Active",
    assignedDate: "02 Jan 2024",
    lastUpdated: "08 Jan 2024",
    documentsCount: 11,
    evidenceCount: 5,
    complainant: "Dr. Vinod Saxena",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Hit-and-run collision on Hoshangabad Road. Offending vehicle identified via smart-city CCTV surveillance feed. Driver arrested.",
    documents: [
      { name: "FIR_Road_Accident_Sec304.pdf", type: "FIR", hash: "99887766...1122", status: "Verified", size: "1.7 MB" },
      { name: "CCTV_Junction_04_Extraction.mp4", type: "Media", hash: "aabbccdd...2233", status: "Verified", size: "38.2 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2024-0018", name: "Impounded Vehicle MP-04", cat: "Vehicle", holder: "Station Premises", status: "In Impound" }
    ]
  },
  {
    id: "#2023-9845",
    section: "IPC 379 - Theft",
    status: "Under Review",
    assignedDate: "28 Dec 2023",
    lastUpdated: "02 Jan 2024",
    documentsCount: 7,
    evidenceCount: 2,
    complainant: "Anil Soni (Jewelers Assoc)",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Night burglary at commercial establishment. CCTV footage obtained, finger impressions lifted by scientific investigation team.",
    documents: [
      { name: "FIR_Burglary_Sec379.pdf", type: "FIR", hash: "44332211...7788", status: "Verified", size: "1.5 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2023-0941", name: "Crowbar & Lock Pick Set", cat: "Weapon", holder: "Station Malkhana", status: "In Vault" }
    ]
  },
  {
    id: "#2023-7765",
    section: "IPC 307 - Attempt to Murder",
    status: "Active",
    assignedDate: "20 Dec 2023",
    lastUpdated: "28 Dec 2023",
    documentsCount: 14,
    evidenceCount: 6,
    complainant: "Govind Narang",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Armed attack outside market square. Victim hospitalized in critical condition. Sharp-edged weapon recovered under disclosure memo.",
    documents: [
      { name: "FIR_Attempt_Murder_307.pdf", type: "FIR", hash: "66778899...3344", status: "Verified", size: "2.1 MB" },
      { name: "Hospital_MLC_Report.pdf", type: "Medical", hash: "1100aa22...bb33", status: "Verified", size: "2.8 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2023-0870", name: "Sharp Steel Knife (9 inch)", cat: "Weapon", holder: "Station Malkhana", status: "In Vault" }
    ]
  },
  {
    id: "#2023-6654",
    section: "IPC 498A - Domestic Violence",
    status: "Closed",
    assignedDate: "15 Dec 2023",
    lastUpdated: "20 Dec 2023",
    documentsCount: 9,
    evidenceCount: 3,
    complainant: "Sunita Tiwari",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Cruelty and matrimonial dowry harassment matter. Family counseling cell mediation report filed; compromise decree recorded before Lok Adalat.",
    documents: [
      { name: "FIR_Domestic_Harassment.pdf", type: "FIR", hash: "22334455...6677", status: "Verified", size: "1.9 MB" },
      { name: "Mediation_Lok_Adalat_Decree.pdf", type: "Court", hash: "99aa0011...2233", status: "Verified", size: "3.1 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2023-0780", name: "WhatsApp Chat Audio Exports", cat: "Electronic", holder: "Station Malkhana", status: "In Vault" }
    ]
  },
  // Additional page 2 & 3 cases to make 24 total cases
  {
    id: "#2023-5542",
    section: "IPC 392 - Robbery",
    status: "Active",
    assignedDate: "10 Dec 2023",
    lastUpdated: "18 Dec 2023",
    documentsCount: 8,
    evidenceCount: 4,
    complainant: "Manish Shrivastav",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Highway snatching reported near bypass. Cash and two mobile devices recovered.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-4431",
    section: "IPC 406 - Criminal Breach of Trust",
    status: "Under Review",
    assignedDate: "05 Dec 2023",
    lastUpdated: "14 Dec 2023",
    documentsCount: 6,
    evidenceCount: 2,
    complainant: "Apex Logistics Ltd",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Misappropriation of commercial consignment inventory during transit.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-3320",
    section: "IPC 354 - Outraging Modesty",
    status: "Active",
    assignedDate: "01 Dec 2023",
    lastUpdated: "12 Dec 2023",
    documentsCount: 10,
    evidenceCount: 3,
    complainant: "Pooja Chawla",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Stalking and public harassment recorded on street surveillance camera.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-2219",
    section: "IPC 326 - Voluntarily Causing Grievous Hurt",
    status: "Active",
    assignedDate: "24 Nov 2023",
    lastUpdated: "08 Dec 2023",
    documentsCount: 13,
    evidenceCount: 5,
    complainant: "Karan Johar",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Assault with dangerous weapon causing bone fracture during neighborhood dispute.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-1108",
    section: "IPC 411 - Dishonestly Receiving Stolen Property",
    status: "Under Review",
    assignedDate: "18 Nov 2023",
    lastUpdated: "30 Nov 2023",
    documentsCount: 5,
    evidenceCount: 2,
    complainant: "Police Patrol Squad",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Recovery of dismantled motorcycle parts from unauthorized garage.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-0997",
    section: "IPC 302 - Homicide",
    status: "Closed",
    assignedDate: "12 Nov 2023",
    lastUpdated: "25 Nov 2023",
    documentsCount: 16,
    evidenceCount: 7,
    complainant: "State of MP",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Trial concluded before 4th Additional Sessions Judge. Conviction secured.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-0886",
    section: "IPC 376 - Assault",
    status: "Active",
    assignedDate: "05 Nov 2023",
    lastUpdated: "20 Nov 2023",
    documentsCount: 9,
    evidenceCount: 3,
    complainant: "Confidential",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Charge sheet filed within statutory 60-day period. Case committed to Sessions.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-0775",
    section: "IPC 420 - Fraud",
    status: "Active",
    assignedDate: "28 Oct 2023",
    lastUpdated: "15 Nov 2023",
    documentsCount: 12,
    evidenceCount: 4,
    complainant: "ICICI Bank Ltd",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Online phishing and unauthorized credit card cloning syndicate.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-0664",
    section: "NDPS Act",
    status: "Under Review",
    assignedDate: "22 Oct 2023",
    lastUpdated: "10 Nov 2023",
    documentsCount: 7,
    evidenceCount: 3,
    complainant: "City Task Force",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Commercial quantity seizure awaiting final chemical analysis confirmation.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-0553",
    section: "IPC 304 - Culpable Homicide",
    status: "Closed",
    assignedDate: "15 Oct 2023",
    lastUpdated: "05 Nov 2023",
    documentsCount: 11,
    evidenceCount: 4,
    complainant: "Rameshwar Sen",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Industrial negligence boiler accident. Investigation concluded with safety board report.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-0442",
    section: "IPC 379 - Theft",
    status: "Active",
    assignedDate: "08 Oct 2023",
    lastUpdated: "28 Oct 2023",
    documentsCount: 6,
    evidenceCount: 2,
    complainant: "Deepak Mehra",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Stolen motor vehicle recovered using automatic number plate recognition camera.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-0331",
    section: "IPC 307 - Attempt to Murder",
    status: "Under Review",
    assignedDate: "01 Oct 2023",
    lastUpdated: "20 Oct 2023",
    documentsCount: 13,
    evidenceCount: 5,
    complainant: "Kamlesh Rathore",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Gang rivalry incident; ballistic report pending from State FSL.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-0220",
    section: "IPC 498A - Domestic Violence",
    status: "Active",
    assignedDate: "25 Sep 2023",
    lastUpdated: "15 Oct 2023",
    documentsCount: 8,
    evidenceCount: 2,
    complainant: "Rekha Yadav",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Notice served under Section 41A CrPC. Evidence gathering in progress.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-0119",
    section: "IPC 420 - Fraud",
    status: "Active",
    assignedDate: "18 Sep 2023",
    lastUpdated: "08 Oct 2023",
    documentsCount: 14,
    evidenceCount: 6,
    complainant: "Mukesh Agarwal",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Real estate duplicate registry plot sales scam.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-0098",
    section: "NDPS Act",
    status: "Under Review",
    assignedDate: "10 Sep 2023",
    lastUpdated: "30 Sep 2023",
    documentsCount: 8,
    evidenceCount: 3,
    complainant: "Railway Protection Force",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Seizure of illicit consignment from railway express train luggage rake.",
    documents: [],
    evidence: []
  },
  {
    id: "#2023-0087",
    section: "IPC 302 - Homicide",
    status: "Active",
    assignedDate: "02 Sep 2023",
    lastUpdated: "22 Sep 2023",
    documentsCount: 15,
    evidenceCount: 6,
    complainant: "State Police Suo Motu",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: "Unidentified body recovered near railway culvert. Fingerprint biometric matching underway.",
    documents: [],
    evidence: []
  }
];
