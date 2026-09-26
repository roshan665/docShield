// src/data/forensicOfficerData.js
// Dedicated realistic dataset for DocShield Evidence / Forensic Officer role
// Regional Forensic Science Laboratory (RFSL), Bhopal Division

export const forensicOfficerKPIs = {
  assignedCases: 14,
  evidenceItems: 48,
  pendingExaminations: 9,
  reportsPendingReview: 4,
  custodyAlerts: 2
};

export const forensicExamQueue = [
  {
    id: 'EXAM-2024-089',
    evidenceId: 'EVD-2024-001',
    caseId: 'FIR-2024-0892',
    caseTitle: 'State vs. Vikram Singh (Illegal Firearm & Extortion)',
    evidenceType: 'Ballistics / Firearm',
    itemDescription: 'Country-made .315 bore country pistol with 2 live cartridges seized from crime spot.',
    priority: 'Urgent',
    daysInLab: 3,
    status: 'In Progress',
    assignedTo: 'Dr. K.S. Rathore (Ballistics Division)'
  },
  {
    id: 'EXAM-2024-091',
    evidenceId: 'EVD-2024-004',
    caseId: 'FIR-2024-0914',
    caseTitle: 'State vs. Tech Solutions (Bank Fraud & Cyber Exfiltration)',
    evidenceType: 'Digital Storage / NVMe SSD',
    itemDescription: 'Samsung 980 Pro 1TB NVMe drive with suspected encrypted crypto ledger database.',
    priority: 'High',
    daysInLab: 2,
    status: 'Pending Analysis',
    assignedTo: 'Dr. K.S. Rathore (Cyber Forensics)'
  },
  {
    id: 'EXAM-2024-094',
    evidenceId: 'EVD-2024-007',
    caseId: 'FIR-2024-0741',
    caseTitle: 'State vs. Harish Patel (Commercial Narcotics Possession)',
    evidenceType: 'Narcotics / Chemical Substance',
    itemDescription: 'White crystalline substance suspected to be Methamphetamine (approx. 450 grams).',
    priority: 'Normal',
    daysInLab: 5,
    status: 'Pending Analysis',
    assignedTo: 'Dr. K.S. Rathore (Toxicology & Chemical)'
  },
  {
    id: 'EXAM-2024-096',
    evidenceId: 'EVD-2024-012',
    caseId: 'FIR-2024-1022',
    caseTitle: 'State vs. Unknown (Arson & Warehouse Destruction)',
    evidenceType: 'Chemical Residue / Volatile Hydrocarbons',
    itemDescription: 'Charred timber samples & accelerant swabs collected from point of origin.',
    priority: 'High',
    daysInLab: 1,
    status: 'Queued',
    assignedTo: 'Dr. K.S. Rathore (Chemical Division)'
  }
];

export const recentEvidenceActivity = [
  {
    id: 'ACT-901',
    timestamp: '23 Sep 2024, 04:45 PM',
    evidenceId: 'EVD-2024-001',
    caseId: 'FIR-2024-0892',
    action: 'Microscopic Comparison Completed',
    details: 'Striation marks matched test-fired rounds with 98.4% striation confidence index.',
    actor: 'Dr. K.S. Rathore',
    badge: 'Verified'
  },
  {
    id: 'ACT-902',
    timestamp: '23 Sep 2024, 02:15 PM',
    evidenceId: 'EVD-2024-004',
    caseId: 'FIR-2024-0914',
    action: 'Bit-Stream Forensic Image Acquired',
    details: 'SHA-256 raw image verification hash calculated and matched master envelope.',
    actor: 'Dr. K.S. Rathore',
    badge: 'Image Verified'
  },
  {
    id: 'ACT-903',
    timestamp: '23 Sep 2024, 11:30 AM',
    evidenceId: 'EVD-2024-015',
    caseId: 'FIR-2024-1108',
    action: 'Lab Intake Sealed & Logged',
    details: 'Received from Sub-Inspector V. Saxena under Malkhana Chalan #MK-8841.',
    actor: 'Forensic Intake Desk',
    badge: 'Intake Complete'
  },
  {
    id: 'ACT-904',
    timestamp: '22 Sep 2024, 05:10 PM',
    evidenceId: 'EVD-2024-003',
    caseId: 'FIR-2024-0892',
    action: 'Chemical Reagent Test Completed',
    details: 'Lead styphnate primer residue detected on suspect right palm swabs.',
    actor: 'Dr. K.S. Rathore',
    badge: 'Positive'
  }
];

export const pendingForensicReportsData = [
  {
    id: 'REP-2024-041',
    caseId: 'FIR-2024-0892',
    evidenceId: 'EVD-2024-001',
    reportType: 'Ballistics & Toolmark Examination',
    examiner: 'Dr. K.S. Rathore',
    status: 'Pending Review',
    createdDate: '21 Sep 2024',
    deadline: '25 Sep 2024',
    progress: 90
  },
  {
    id: 'REP-2024-042',
    caseId: 'FIR-2024-0914',
    evidenceId: 'EVD-2024-004',
    reportType: 'Digital Forensic Extraction & Bit-Stream Analysis',
    examiner: 'Dr. K.S. Rathore',
    status: 'Under Examination',
    createdDate: '22 Sep 2024',
    deadline: '27 Sep 2024',
    progress: 65
  },
  {
    id: 'REP-2024-043',
    caseId: 'FIR-2024-0741',
    evidenceId: 'EVD-2024-007',
    reportType: 'GC-MS Chemical & Narcotic Quantitative Assay',
    examiner: 'Dr. K.S. Rathore',
    status: 'Draft',
    createdDate: '23 Sep 2024',
    deadline: '30 Sep 2024',
    progress: 35
  }
];

export const custodyAlertsData = [
  {
    id: 'ALT-101',
    evidenceId: 'EVD-2024-004',
    caseId: 'FIR-2024-0914',
    severity: 'High',
    type: 'Custody Handover Pending Acknowledgment',
    description: 'Digital SSD handed over to Cyber Forensic Lab Chamber 4; awaiting biometric sign-off from Asst. Examiner.',
    time: '2 hours ago'
  },
  {
    id: 'ALT-102',
    evidenceId: 'EVD-2024-007',
    caseId: 'FIR-2024-0741',
    severity: 'Medium',
    type: 'Vault Refrigeration Log Missing',
    description: 'Temperature variance logged for narcotics sample compartment B-2 (logged 4.8°C vs 4.0°C target).',
    time: '5 hours ago'
  }
];

export const forensicCasesList = [
  {
    id: 'FIR-2024-0892',
    title: 'State vs. Vikram Singh (Illegal Firearm & Extortion)',
    inspector: 'Insp. Rajesh Kumar',
    policeStation: 'Bhopal Central PS',
    evidenceCount: 4,
    forensicStatus: 'Under Ballistics Analysis',
    caseStatus: 'Investigation Active',
    lastUpdated: '23 Sep 2024, 04:45 PM',
    priority: 'Urgent',
    examiner: 'Dr. K.S. Rathore',
    keyExhibits: ['EVD-2024-001 (.315 Pistol)', 'EVD-2024-002 (Empty Cartridge)', 'EVD-2024-003 (Palm Swabs)']
  },
  {
    id: 'FIR-2024-0914',
    title: 'State vs. Tech Solutions (Bank Fraud & Cyber Exfiltration)',
    inspector: 'Insp. Anita Sharma',
    policeStation: 'Cyber Crime Police Station, Bhopal',
    evidenceCount: 7,
    forensicStatus: 'Digital Bit-Carving Active',
    caseStatus: 'Evidence Processing',
    lastUpdated: '23 Sep 2024, 02:15 PM',
    priority: 'High',
    examiner: 'Dr. K.S. Rathore',
    keyExhibits: ['EVD-2024-004 (NVMe SSD)', 'EVD-2024-005 (Server Logs)', 'EVD-2024-006 (Hardware Key)']
  },
  {
    id: 'FIR-2024-0741',
    title: 'State vs. Harish Patel (Commercial Narcotics Possession)',
    inspector: 'Insp. Rajesh Kumar',
    policeStation: 'Bhopal Central PS',
    evidenceCount: 3,
    forensicStatus: 'Chemical Assay Pending',
    caseStatus: 'Lab Examination',
    lastUpdated: '23 Sep 2024, 11:20 AM',
    priority: 'High',
    examiner: 'Dr. K.S. Rathore',
    keyExhibits: ['EVD-2024-007 (450g Crystalline Substance)', 'EVD-2024-008 (Digital Scale)']
  },
  {
    id: 'FIR-2024-1022',
    title: 'State vs. Unknown (Arson & Warehouse Destruction)',
    inspector: 'Insp. Vikram Malhotra',
    policeStation: 'Govindpura PS',
    evidenceCount: 5,
    forensicStatus: 'Volatile Swabs Queued',
    caseStatus: 'Lab Examination',
    lastUpdated: '23 Sep 2024, 09:40 AM',
    priority: 'Normal',
    examiner: 'Dr. K.S. Rathore',
    keyExhibits: ['EVD-2024-012 (Charred Timber)', 'EVD-2024-013 (Accelerant Swabs)']
  },
  {
    id: 'FIR-2024-0618',
    title: 'State vs. Rakesh Verma & Ors. (Homicide at MP Nagar)',
    inspector: 'Insp. Rajesh Kumar',
    policeStation: 'MP Nagar PS',
    evidenceCount: 9,
    forensicStatus: 'DNA STR Profiling Completed',
    caseStatus: 'Report Ready',
    lastUpdated: '22 Sep 2024, 06:10 PM',
    priority: 'Completed',
    examiner: 'Dr. K.S. Rathore',
    keyExhibits: ['EVD-2024-018 (Bloodstained Knife)', 'EVD-2024-019 (Suspect Clothes)']
  },
  {
    id: 'FIR-2024-1108',
    title: 'State vs. Suresh Mewada (Counterfeit Currency Printing)',
    inspector: 'Insp. Anita Sharma',
    policeStation: 'Bhopal Central PS',
    evidenceCount: 6,
    forensicStatus: 'Questioned Document Ink Analysis',
    caseStatus: 'Under Examination',
    lastUpdated: '22 Sep 2024, 01:30 PM',
    priority: 'High',
    examiner: 'Dr. K.S. Rathore',
    keyExhibits: ['EVD-2024-025 (Counterfeit 500 Notes)', 'EVD-2024-026 (Intaglio Offset Plates)']
  }
];

export const forensicEvidenceData = [
  {
    id: 'EVD-2024-001',
    caseId: 'FIR-2024-0892',
    evidenceType: 'Ballistics / Firearm',
    description: 'Country-made .315 bore firearm with 2 live cartridges seized from crime spot near MP Nagar Zone-II.',
    collectedBy: 'Insp. Rajesh Kumar',
    collectionDate: '18 Sep 2024',
    currentCustodian: 'Dr. K.S. Rathore (Ballistics Lab)',
    currentLocation: 'RFSL Bhopal — Ballistics Vault Locker #B-14',
    verificationStatus: 'Verified',
    examinationStatus: 'Under Examination',
    lastUpdated: '23 Sep 2024, 04:45 PM',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sealNumber: 'SEAL-MP-2024-88412',
    condition: 'Intact, Sealing lac verified unbroken',
    examinerNotes: 'Barrel rifling 6-grooves right hand twist examined. Comparison test fire cartridge striation matches spot spent shell with 98.4% pattern correlation.'
  },
  {
    id: 'EVD-2024-002',
    caseId: 'FIR-2024-0892',
    evidenceType: 'Ballistics / Cartridge Shell',
    description: 'Fired brass .315 cartridge casing recovered from crime scene pavement.',
    collectedBy: 'Insp. Rajesh Kumar',
    collectionDate: '18 Sep 2024',
    currentCustodian: 'Dr. K.S. Rathore (Ballistics Lab)',
    currentLocation: 'RFSL Bhopal — Ballistics Vault Locker #B-14',
    verificationStatus: 'Verified',
    examinationStatus: 'Completed',
    lastUpdated: '23 Sep 2024, 04:30 PM',
    sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    sealNumber: 'SEAL-MP-2024-88413',
    condition: 'Firing pin indentation clearly demarcated',
    examinerNotes: 'Firing pin imprint geometry directly correlates with breech face markings of exhibit EVD-2024-001.'
  },
  {
    id: 'EVD-2024-004',
    caseId: 'FIR-2024-0914',
    evidenceType: 'Digital Storage / NVMe SSD',
    description: 'Samsung 980 Pro 1TB NVMe internal solid-state drive removed from main suspect workstation.',
    collectedBy: 'Insp. Anita Sharma',
    collectionDate: '19 Sep 2024',
    currentCustodian: 'Dr. K.S. Rathore (Cyber Lab)',
    currentLocation: 'RFSL Bhopal — Cyber Lab Station #03 (Faraday Chamber)',
    verificationStatus: 'Verified',
    examinationStatus: 'Under Examination',
    lastUpdated: '23 Sep 2024, 02:15 PM',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    sealNumber: 'SEAL-CYBER-2024-0941',
    condition: 'Hardware write-blocker engaged, bit-stream image created',
    examinerNotes: 'Acquired 1000GB RAW .E01 image with hardware Tableau T8u. MD5 and SHA-256 match perfectly.'
  },
  {
    id: 'EVD-2024-007',
    caseId: 'FIR-2024-0741',
    evidenceType: 'Narcotics / Chemical Substance',
    description: 'White crystalline substance seized in heat-sealed poly pouch (approx. 450 grams).',
    collectedBy: 'Insp. Rajesh Kumar',
    collectionDate: '20 Sep 2024',
    currentCustodian: 'Dr. K.S. Rathore (Chemical Lab)',
    currentLocation: 'RFSL Bhopal — Controlled Narcotics Vault #N-03',
    verificationStatus: 'Verified',
    examinationStatus: 'Pending Examination',
    lastUpdated: '23 Sep 2024, 11:20 AM',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    sealNumber: 'SEAL-NDPS-2024-0042',
    condition: 'Gross weight 452.4g, net sample 5.0g drawn for GC-MS testing',
    examinerNotes: 'Marquis reagent preliminary spot test yields deep orange-to-brown reaction indicating methamphetamine group.'
  },
  {
    id: 'EVD-2024-012',
    caseId: 'FIR-2024-1022',
    evidenceType: 'Chemical Residue / Volatile Hydrocarbons',
    description: 'Charred timber fragments and vapor swabs collected from suspected origin of warehouse fire.',
    collectedBy: 'Insp. Vikram Malhotra',
    collectionDate: '21 Sep 2024',
    currentCustodian: 'Dr. K.S. Rathore (Chemical Lab)',
    currentLocation: 'RFSL Bhopal — Cold Room #02',
    verificationStatus: 'Pending Verification',
    examinationStatus: 'Pending Examination',
    lastUpdated: '23 Sep 2024, 09:40 AM',
    sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    sealNumber: 'SEAL-ARSON-2024-118',
    condition: 'Airtight mason jars with Teflon seals',
    examinerNotes: 'Passive headspace gas chromatography queued to determine kerosene vs diesel petroleum distillates.'
  },
  {
    id: 'EVD-2024-018',
    caseId: 'FIR-2024-0618',
    evidenceType: 'Biological / Bloodstained Weapon',
    description: 'Iron machete (length 18 inches) with dried dark brownish stains along cutting edge.',
    collectedBy: 'Insp. Rajesh Kumar',
    collectionDate: '15 Sep 2024',
    currentCustodian: 'Forensic Evidence Vault',
    currentLocation: 'RFSL Bhopal — Bio Vault Rack #A-08',
    verificationStatus: 'Verified',
    examinationStatus: 'Verified',
    lastUpdated: '22 Sep 2024, 06:10 PM',
    sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    sealNumber: 'SEAL-BIO-2024-0618',
    condition: 'Desiccated packaging intact',
    examinerNotes: 'Human blood Group O+ confirmed. 16-loci autosomal STR profile matches victim blood sample perfectly (random match probability 1 in 4.2 trillion).'
  },
  {
    id: 'EVD-2024-025',
    caseId: 'FIR-2024-1108',
    evidenceType: 'Questioned Documents / Currency',
    description: 'Bundle of 200 notes of ₹500 denomination with suspected counterfeit security features.',
    collectedBy: 'Insp. Anita Sharma',
    collectionDate: '21 Sep 2024',
    currentCustodian: 'Dr. K.S. Rathore (QD Division)',
    currentLocation: 'RFSL Bhopal — Questioned Documents Lab Cabinet #Q-04',
    verificationStatus: 'Exception',
    examinationStatus: 'Under Examination',
    lastUpdated: '22 Sep 2024, 01:30 PM',
    sha256: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    sealNumber: 'SEAL-FICN-2024-031',
    condition: 'Sealing intact; 1 note found torn along bleeding edge',
    examinerNotes: 'Optical Variable Ink test failed; color does not shift from green to blue under 45-degree angle. UV fluorescence shows absence of RBI watermarked fibers.'
  }
];

export const forensicReportsData = [
  {
    id: 'REP-2024-041',
    caseId: 'FIR-2024-0892',
    caseTitle: 'State vs. Vikram Singh (Illegal Firearm & Extortion)',
    evidenceId: 'EVD-2024-001',
    evidenceType: 'Ballistics / Firearm (.315 Pistol)',
    reportType: 'Ballistics & Toolmark Examination',
    examiner: 'Dr. K.S. Rathore (Senior Scientific Officer)',
    status: 'Pending Review',
    createdDate: '21 Sep 2024',
    lastUpdated: '23 Sep 2024, 04:45 PM',
    conclusion: 'The spent cartridge casing recovered from the crime scene (EVD-2024-002) was conclusively fired from the seized .315 country pistol (EVD-2024-001).',
    section45Certificate: 'Form IV (Section 45 Indian Evidence Act / Section 39 Bharatiya Sakshya Adhiniyam) Generated',
    hashSealed: '7d1a2f9b8c0e4d6a5e3b2c1d0f9a8b7c6e5d4c3b2a1f0e9d8c7b6a5e4d3c2b1a',
    findingsSummary: 'Comparison microscopy confirms matching breach face marks, ejector scars, and 6 right-handed micro-striation grooves on bullet jacket.'
  },
  {
    id: 'REP-2024-042',
    caseId: 'FIR-2024-0914',
    caseTitle: 'State vs. Tech Solutions (Bank Fraud & Cyber Exfiltration)',
    evidenceId: 'EVD-2024-004',
    evidenceType: 'Digital Storage / NVMe SSD',
    reportType: 'Digital Forensic Extraction & Bit-Stream Analysis',
    examiner: 'Dr. K.S. Rathore (Cyber Forensics)',
    status: 'Under Examination',
    createdDate: '22 Sep 2024',
    lastUpdated: '23 Sep 2024, 02:15 PM',
    conclusion: 'Bit-stream extraction ongoing. Encrypted volume header identified as VeraCrypt 128-bit AES container; carver currently extracting SQLite ledger remnants.',
    section45Certificate: 'Section 65B Indian Evidence Act Certificate Draft In-Progress',
    hashSealed: 'PENDING_FINALIZATION',
    findingsSummary: 'Hash match verified on raw image. Registry artifacts demonstrate suspicious outbound SSH connections to offshore VPS IPs on night of 14 Sep 2024.'
  },
  {
    id: 'REP-2024-039',
    caseId: 'FIR-2024-0618',
    caseTitle: 'State vs. Rakesh Verma & Ors. (Homicide at MP Nagar)',
    evidenceId: 'EVD-2024-018',
    evidenceType: 'Biological / Bloodstained Weapon',
    reportType: 'DNA STR Profiling & Serology Examination',
    examiner: 'Dr. K.S. Rathore (DNA Division)',
    status: 'Finalized',
    createdDate: '19 Sep 2024',
    lastUpdated: '22 Sep 2024, 06:10 PM',
    conclusion: 'DNA extracted from the bloodstains on Exhibit EVD-2024-018 matches the DNA profile of deceased Ramesh Verma across all 16 CODIS STR loci.',
    section45Certificate: 'Form IV Section 45 IEA Signed & Cryptographically Sealed',
    hashSealed: '4b825dc642cb6eb9a060e54b83c9401295b34f6e49aaa4ec543b5266fed2c2d6',
    findingsSummary: 'Serological test confirms human blood group O. PCR amplification yield 1.8ng/uL. Exclusion probability exceeds 99.999999%.'
  },
  {
    id: 'REP-2024-043',
    caseId: 'FIR-2024-0741',
    caseTitle: 'State vs. Harish Patel (Commercial Narcotics Possession)',
    evidenceId: 'EVD-2024-007',
    evidenceType: 'Narcotics / Chemical Substance',
    reportType: 'GC-MS Chemical & Narcotic Quantitative Assay',
    examiner: 'Dr. K.S. Rathore (Toxicology & Chemical)',
    status: 'Draft',
    createdDate: '23 Sep 2024',
    lastUpdated: '23 Sep 2024, 11:20 AM',
    conclusion: 'Draft analysis indicates sample tests positive for Methamphetamine Hydrochloride. Quantitative purity determination in progress.',
    section45Certificate: 'Pending Quantitative GC-MS Calibration Run',
    hashSealed: 'DRAFT_STAGE',
    findingsSummary: 'Marquis test colorimetry positive. Preliminary TLC assay confirms presence of synthetic phenethylamine base.'
  }
];

export const forensicDocumentsData = [
  {
    id: 'DOC-2024-0981',
    name: 'Form IV — Section 45 Scientific Report (Ballistics).pdf',
    type: 'Expert Forensic Opinion',
    caseId: 'FIR-2024-0892',
    relatedEvidence: 'EVD-2024-001, EVD-2024-002',
    uploadedBy: 'Dr. K.S. Rathore',
    verificationStatus: 'Cryptographically Signed',
    date: '23 Sep 2024',
    size: '3.4 MB',
    sha256: '7d1a2f9b8c0e4d6a5e3b2c1d0f9a8b7c6e5d4c3b2a1f0e9d8c7b6a5e4d3c2b1a',
    authority: 'Director, Regional Forensic Science Laboratory, Bhopal'
  },
  {
    id: 'DOC-2024-0982',
    name: 'Ballistics Comparison Microphotograph Gallery.pdf',
    type: 'Microscopic Exhibit Benchmarks',
    caseId: 'FIR-2024-0892',
    relatedEvidence: 'EVD-2024-001',
    uploadedBy: 'Dr. K.S. Rathore',
    verificationStatus: 'Verified',
    date: '23 Sep 2024',
    size: '8.1 MB',
    sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    authority: 'RFSL Ballistics Imaging Bench'
  },
  {
    id: 'DOC-2024-0974',
    name: 'Forensic Bit-Stream Image Integrity Hash Log.pdf',
    type: 'Section 65B Electronic Certificate',
    caseId: 'FIR-2024-0914',
    relatedEvidence: 'EVD-2024-004',
    uploadedBy: 'Dr. K.S. Rathore',
    verificationStatus: 'Verified',
    date: '22 Sep 2024',
    size: '1.2 MB',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    authority: 'RFSL Cyber Examination Suite'
  },
  {
    id: 'DOC-2024-0960',
    name: 'DNA Electropherogram STR Profile Chart.pdf',
    type: 'DNA Scientific Report',
    caseId: 'FIR-2024-0618',
    relatedEvidence: 'EVD-2024-018',
    uploadedBy: 'Dr. K.S. Rathore',
    verificationStatus: 'Cryptographically Signed',
    date: '22 Sep 2024',
    size: '4.8 MB',
    sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    authority: 'Central DNA Profiling Facility'
  },
  {
    id: 'DOC-2024-0955',
    name: 'Malkhana Handover Receipt & Seal Verification Memo.pdf',
    type: 'Custodial Handover Memo',
    caseId: 'FIR-2024-0741',
    relatedEvidence: 'EVD-2024-007',
    uploadedBy: 'Malkhana In-Charge',
    verificationStatus: 'Verified',
    date: '20 Sep 2024',
    size: '890 KB',
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    authority: 'Police Station Malkhana Bhopal'
  }
];

export const forensicCustodyData = [
  {
    id: 'CUST-001',
    evidenceId: 'EVD-2024-001',
    caseId: 'FIR-2024-0892',
    evidenceType: 'Ballistics / Firearm (.315 Pistol)',
    currentCustodian: 'Dr. K.S. Rathore (Senior Scientific Officer)',
    currentLocation: 'RFSL Bhopal — Ballistics Vault Locker #B-14',
    lastTransfer: '21 Sep 2024, 10:15 AM',
    custodyStatus: 'Active Lab Custody',
    source: 'Bhopal Central PS Malkhana',
    authorizedOfficer: 'Insp. Rajesh Kumar',
    sealIntact: true,
    transfersCount: 3,
    transferTimeline: [
      {
        step: 1,
        date: '18 Sep 2024, 08:30 PM',
        from: 'Crime Spot (MP Nagar Zone-II)',
        to: 'Bhopal Central PS Malkhana',
        handler: 'Insp. Rajesh Kumar',
        reason: 'Seizure under CrPC 102 & sealing with brass seal'
      },
      {
        step: 2,
        date: '20 Sep 2024, 11:00 AM',
        from: 'Bhopal Central PS Malkhana',
        to: 'Court of CJM Bhopal (Exhibit Production)',
        handler: 'Constable Mahendra #892',
        reason: 'Judicial inspection and forensic forwarding order'
      },
      {
        step: 3,
        date: '21 Sep 2024, 10:15 AM',
        from: 'Court of CJM Bhopal',
        to: 'RFSL Bhopal — Ballistics Division',
        handler: 'Dr. K.S. Rathore (Forensic Officer)',
        reason: 'Laboratory intake for Section 45 IEA ballistic examination'
      }
    ]
  },
  {
    id: 'CUST-002',
    evidenceId: 'EVD-2024-004',
    caseId: 'FIR-2024-0914',
    evidenceType: 'Digital Storage / NVMe SSD',
    currentCustodian: 'Dr. K.S. Rathore (Cyber Forensics)',
    currentLocation: 'RFSL Bhopal — Cyber Lab Station #03 (Faraday Chamber)',
    lastTransfer: '22 Sep 2024, 09:30 AM',
    custodyStatus: 'Active Lab Custody',
    source: 'Cyber Police Station Malkhana',
    authorizedOfficer: 'Insp. Anita Sharma',
    sealIntact: true,
    transfersCount: 2,
    transferTimeline: [
      {
        step: 1,
        date: '19 Sep 2024, 04:00 PM',
        from: 'Suspect Office (Tech Solutions, Arera Hills)',
        to: 'Cyber Crime PS Secure Vault',
        handler: 'Insp. Anita Sharma',
        reason: 'Seizure memo prepared under Section 65B IEA'
      },
      {
        step: 2,
        date: '22 Sep 2024, 09:30 AM',
        from: 'Cyber Crime PS Secure Vault',
        to: 'RFSL Bhopal — Cyber Examination Division',
        handler: 'Dr. K.S. Rathore (Forensic Officer)',
        reason: 'Forensic bit-stream duplication and carver analysis'
      }
    ]
  },
  {
    id: 'CUST-003',
    evidenceId: 'EVD-2024-007',
    caseId: 'FIR-2024-0741',
    evidenceType: 'Narcotics / Chemical Substance (450g)',
    currentCustodian: 'Dr. K.S. Rathore (Chemical Lab)',
    currentLocation: 'RFSL Bhopal — Controlled Vault #N-03',
    lastTransfer: '23 Sep 2024, 10:00 AM',
    custodyStatus: 'Pending Verification',
    source: 'Bhopal Central PS Malkhana',
    authorizedOfficer: 'Insp. Rajesh Kumar',
    sealIntact: true,
    transfersCount: 2,
    transferTimeline: [
      {
        step: 1,
        date: '20 Sep 2024, 09:00 PM',
        from: 'Seizure Point (Nadra Bus Stand)',
        to: 'Bhopal Central PS Malkhana',
        handler: 'Insp. Rajesh Kumar',
        reason: 'Seizure under NDPS Act Sec 21'
      },
      {
        step: 2,
        date: '23 Sep 2024, 10:00 AM',
        from: 'Bhopal Central PS Malkhana',
        to: 'RFSL Bhopal — Chemical Lab',
        handler: 'Dr. K.S. Rathore (Forensic Officer)',
        reason: 'Intake for qualitative & quantitative GC-MS analysis'
      }
    ]
  },
  {
    id: 'CUST-004',
    evidenceId: 'EVD-2024-025',
    caseId: 'FIR-2024-1108',
    evidenceType: 'Questioned Documents / Currency',
    currentCustodian: 'Dr. K.S. Rathore (QD Division)',
    currentLocation: 'RFSL Bhopal — QD Cabinet #Q-04',
    lastTransfer: '22 Sep 2024, 12:45 PM',
    custodyStatus: 'Exception',
    source: 'Bhopal Central PS',
    authorizedOfficer: 'Insp. Anita Sharma',
    sealIntact: false,
    transfersCount: 2,
    transferTimeline: [
      {
        step: 1,
        date: '21 Sep 2024, 07:00 PM',
        from: 'Printing Press Raid (Berasia Road)',
        to: 'Bhopal Central PS Safe Deposit',
        handler: 'Insp. Anita Sharma',
        reason: 'Seizure of counterfeit currency bundles'
      },
      {
        step: 2,
        date: '22 Sep 2024, 12:45 PM',
        from: 'Bhopal Central PS Safe Deposit',
        to: 'RFSL Bhopal — Questioned Documents Lab',
        handler: 'Dr. K.S. Rathore (Forensic Officer)',
        reason: 'Note envelope arrived with minor outer paper tear; logged as formal exception'
      }
    ]
  }
];

export const forensicAuditLogs = [
  {
    id: 'AUD-9901',
    timestamp: '23 Sep 2024, 04:45 PM',
    user: 'Dr. K.S. Rathore',
    role: 'Evidence / Forensic Officer',
    action: 'FORM_IV_REPORT_DRAFTED',
    module: 'Forensic Reports',
    caseId: 'FIR-2024-0892',
    evidenceId: 'EVD-2024-001',
    result: 'Success',
    ip: '10.14.88.22',
    details: 'Ballistics comparison report drafted and SHA-256 seal generated.'
  },
  {
    id: 'AUD-9902',
    timestamp: '23 Sep 2024, 02:15 PM',
    user: 'Dr. K.S. Rathore',
    role: 'Evidence / Forensic Officer',
    action: 'BITSTREAM_IMAGE_VERIFIED',
    module: 'Evidence Examination',
    caseId: 'FIR-2024-0914',
    evidenceId: 'EVD-2024-004',
    result: 'Success',
    ip: '10.14.88.24',
    details: 'RAW E01 image SHA-256 hash verified against intake envelope record.'
  },
  {
    id: 'AUD-9903',
    timestamp: '23 Sep 2024, 11:30 AM',
    user: 'Dr. K.S. Rathore',
    role: 'Evidence / Forensic Officer',
    action: 'CUSTODIAL_RECEIPT_ACK',
    module: 'Chain of Custody',
    caseId: 'FIR-2024-0741',
    evidenceId: 'EVD-2024-007',
    result: 'Success',
    ip: '10.14.88.19',
    details: '450g chemical powder exhibit received from Bhopal Central Malkhana with intact seals.'
  },
  {
    id: 'AUD-9904',
    timestamp: '22 Sep 2024, 06:10 PM',
    user: 'Dr. K.S. Rathore',
    role: 'Evidence / Forensic Officer',
    action: 'REPORT_DIGITALLY_SEALED',
    module: 'Forensic Reports',
    caseId: 'FIR-2024-0618',
    evidenceId: 'EVD-2024-018',
    result: 'Success',
    ip: '10.14.88.22',
    details: '16-loci DNA STR report signed and sealed under Section 45 Indian Evidence Act.'
  },
  {
    id: 'AUD-9905',
    timestamp: '22 Sep 2024, 01:30 PM',
    user: 'Dr. K.S. Rathore',
    role: 'Evidence / Forensic Officer',
    action: 'CUSTODY_EXCEPTION_LOGGED',
    module: 'Chain of Custody',
    caseId: 'FIR-2024-1108',
    evidenceId: 'EVD-2024-025',
    result: 'Warning',
    ip: '10.14.88.19',
    details: 'Outer envelope paper edge tear noted during Questioned Documents laboratory intake.'
  }
];
