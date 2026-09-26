// test-investigation-workflow.js
// Automated End-to-End Investigation Workflow Integration Test
// Validates Cases, Documents, Evidence, Core Relationships, and RBAC

import * as casesService from './src/services/casesService.js';
import * as documentsService from './src/services/documentsService.js';
import * as evidenceService from './src/services/evidenceService.js';
import * as auditService from './src/services/auditService.js';
import { ROLES } from './src/constants/roles.js';
import { isPageAllowed, isActionAllowed } from './src/constants/permissions.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('DOCSHIELD INVESTIGATION WORKFLOW INTEGRATION SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // PHASE 1 — CASES MODULE
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Cases Service & Data Operations ---');
  const allCases = await casesService.fetchCases();
  assert(Array.isArray(allCases) && allCases.length > 0, `Fetched ${allCases.length} cases`);

  const firstCase = allCases[0];
  assert(firstCase.id && firstCase.section && firstCase.status, `Case ${firstCase.id} has valid fields`);

  const singleCase = await casesService.fetchCaseById(firstCase.id);
  assert(singleCase && singleCase.id === firstCase.id, `fetchCaseById retrieved case ${firstCase.id}`);

  // Test Case Creation
  const newCasePayload = {
    id: `#2024-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    section: 'Section 420 IPC - Cheating and Fraud',
    title: 'Automated Test Case for Supabase Integration',
    summary: 'Investigation into digital identity tampering and document falsification.',
    io: 'Insp. Rajesh Kumar',
    station: 'Cyber Crime Police Station, Bhopal',
    status: 'Active',
    priority: 'High',
    assignedDate: '24 Sep 2024',
    lastUpdated: 'Just now'
  };

  const createdCase = await casesService.createCase(newCasePayload);
  assert(createdCase && createdCase.id === newCasePayload.id, `Case ${createdCase.id} successfully created`);

  // Test Case Status Update
  const updatedStatus = await casesService.updateCaseStatus(createdCase.id, 'Under Review');
  assert(updatedStatus.status === 'Under Review', `Case status updated to "Under Review"`);

  // Test Case Assignment
  const assigned = await casesService.assignCase(createdCase.id, 'Insp. Vikram Singh');
  assert(assigned.io === 'Insp. Vikram Singh', `Case successfully reassigned to Insp. Vikram Singh`);

  console.log('');

  // -------------------------------------------------------------------------
  // PHASE 2 — DOCUMENTS MODULE
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 2: Documents Service & Case Relationship ---');
  const allDocs = await documentsService.fetchDocuments();
  assert(Array.isArray(allDocs) && allDocs.length > 0, `Fetched ${allDocs.length} documents`);

  const firstDoc = allDocs[0];
  assert(firstDoc.id && firstDoc.caseNo && firstDoc.hash, `Document ${firstDoc.id} has valid metadata & hash`);

  // Normalization check
  assert(documentsService.normalizeDocClassification('FIR') === 'FIR', 'Normalizes FIR classification');
  assert(documentsService.normalizeDocClassification('Spot Panchnama') === 'Panchnama', 'Normalizes Panchnama classification');
  assert(documentsService.normalizeDocClassification('Medical Certificate') === 'Medical', 'Normalizes Medical classification');

  // Test Document Upload & Case Linkage
  const uploadedDoc = await documentsService.uploadDocumentMetadata({
    caseId: createdCase.id,
    fileName: 'Forensic_Extraction_Log_65B.pdf',
    docType: 'Forensic'
  });
  assert(uploadedDoc && uploadedDoc.caseNo === createdCase.id, `Document linked to case ${createdCase.id}`);
  assert(uploadedDoc.hash && uploadedDoc.hash.length === 64, `Document sealed with 64-char SHA-256 hash`);

  // Test Review Status Update
  const reviewedDoc = await documentsService.updateDocumentReviewStatus(uploadedDoc.id, 'Admissible');
  assert(reviewedDoc.legalReviewStatus === 'Admissible', `Document review status updated to "Admissible"`);

  // Test Integrity Verification
  const verifyDoc = await documentsService.verifyDocumentIntegrity(uploadedDoc.id);
  assert(verifyDoc.verified === true, `Document cryptographic integrity confirmed (verified: true)`);

  console.log('');

  // -------------------------------------------------------------------------
  // PHASE 3 — EVIDENCE MODULE & CHAIN OF CUSTODY
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 3: Evidence Service & Chain of Custody ---');
  const allEvidence = await evidenceService.fetchEvidence();
  assert(Array.isArray(allEvidence) && allEvidence.length > 0, `Fetched ${allEvidence.length} evidence items`);

  // Category normalization check
  assert(evidenceService.normalizeEvidenceCategory('Glock 19 Pistol') === 'Firearm', 'Normalizes Glock 19 to Firearm');
  assert(evidenceService.normalizeEvidenceCategory('iPhone 13 Pro Max') === 'Digital', 'Normalizes iPhone to Digital');
  assert(evidenceService.normalizeEvidenceCategory('Blood-Stained Swab') === 'Biological', 'Normalizes Swab to Biological');

  // Test Evidence Seizure Logging
  const testTag = `EV-TEST-${Math.floor(100 + Math.random() * 900)}`;
  const loggedEvidence = await evidenceService.logEvidenceItem({
    caseId: createdCase.id,
    tag: testTag,
    category: 'Digital',
    location: 'Station Malkhana Vault Room #2',
    description: 'Encrypted flash drive recovered from crime scene'
  });
  assert(loggedEvidence && loggedEvidence.tag === testTag, `Evidence ${testTag} logged successfully`);
  assert(loggedEvidence.caseNo === createdCase.id, `Evidence linked to case ${createdCase.id}`);

  // Test Evidence Status Update
  const updatedEvidence = await evidenceService.updateEvidenceStatus(loggedEvidence.id, 'Examined');
  assert(updatedEvidence.examinationStatus === 'Examined', `Evidence examination status updated to "Examined"`);

  // Test Evidence Integrity Verification
  const verifyEvidence = await evidenceService.verifyEvidenceIntegrity(loggedEvidence.id);
  assert(verifyEvidence.verified === true, `Evidence cryptographic seal confirmed (verified: true)`);

  console.log('');

  // -------------------------------------------------------------------------
  // PHASE 4 — CORE RELATIONSHIPS & AUDIT TRAIL
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 4: Core Relationships & Audit Logging ---');
  const caseWithRelations = await casesService.fetchCaseById(createdCase.id);
  assert(caseWithRelations !== null, `Case details retrieved with full relational hierarchy`);

  // Audit Log recording
  const auditEvent = await auditService.logAuditEvent({
    action: 'INTEGRATION_TEST_EXECUTION',
    module: 'Testing',
    entityType: 'Workflow',
    entityId: createdCase.id,
    description: `Investigation workflow verified for case ${createdCase.id}`
  });
  assert(auditEvent !== null, `Audit log event successfully committed to audit trail`);

  console.log('');

  // -------------------------------------------------------------------------
  // PHASE 5 — RBAC PERMISSION INTEGRITY ACROSS ALL 4 ROLES
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 5: Role-Based Access Control Verification ---');
  
  // ADMIN Role Checks
  assert(isPageAllowed('cases', ROLES.ADMIN), 'ADMIN can access cases');
  assert(isPageAllowed('documents', ROLES.ADMIN), 'ADMIN can access documents');
  assert(isPageAllowed('evidence', ROLES.ADMIN), 'ADMIN can access evidence');
  assert(isPageAllowed('users', ROLES.ADMIN), 'ADMIN can access users management');
  assert(isActionAllowed('canCreateCase', ROLES.ADMIN), 'ADMIN can create cases');
  assert(isActionAllowed('canUploadDocuments', ROLES.ADMIN), 'ADMIN can upload documents');
  assert(isActionAllowed('canLogEvidence', ROLES.ADMIN), 'ADMIN can log evidence');

  // INSPECTOR Role Checks
  assert(isPageAllowed('cases', ROLES.INSPECTOR), 'INSPECTOR can access cases');
  assert(isPageAllowed('documents', ROLES.INSPECTOR), 'INSPECTOR can access documents');
  assert(isPageAllowed('evidence', ROLES.INSPECTOR), 'INSPECTOR can access evidence');
  assert(!isPageAllowed('users', ROLES.INSPECTOR), 'INSPECTOR cannot access admin users');
  assert(!isPageAllowed('settings', ROLES.INSPECTOR), 'INSPECTOR cannot access admin settings');
  assert(isActionAllowed('canCreateCase', ROLES.INSPECTOR), 'INSPECTOR can create cases');
  assert(isActionAllowed('canUploadDocuments', ROLES.INSPECTOR), 'INSPECTOR can upload documents');
  assert(isActionAllowed('canLogEvidence', ROLES.INSPECTOR), 'INSPECTOR can log evidence');

  // LEGAL OFFICER Role Checks
  assert(isPageAllowed('cases', ROLES.LEGAL_OFFICER), 'LEGAL OFFICER can access cases');
  assert(isPageAllowed('documents', ROLES.LEGAL_OFFICER), 'LEGAL OFFICER can access documents');
  assert(isPageAllowed('chargeSheets', ROLES.LEGAL_OFFICER), 'LEGAL OFFICER can access charge sheets');
  assert(isPageAllowed('courtFilings', ROLES.LEGAL_OFFICER), 'LEGAL OFFICER can access court filings');
  assert(!isPageAllowed('users', ROLES.LEGAL_OFFICER), 'LEGAL OFFICER cannot access admin users');
  assert(!isActionAllowed('canCreateCase', ROLES.LEGAL_OFFICER), 'LEGAL OFFICER cannot create cases (IO/Admin only)');
  assert(!isActionAllowed('canLogEvidence', ROLES.LEGAL_OFFICER), 'LEGAL OFFICER cannot log initial seizure evidence');

  // FORENSIC OFFICER Role Checks
  assert(isPageAllowed('cases', ROLES.FORENSIC_OFFICER), 'FORENSIC OFFICER can access cases');
  assert(isPageAllowed('evidence', ROLES.FORENSIC_OFFICER), 'FORENSIC OFFICER can access evidence desk');
  assert(isPageAllowed('forensic', ROLES.FORENSIC_OFFICER), 'FORENSIC OFFICER can access forensic reports');
  assert(!isPageAllowed('chargeSheets', ROLES.FORENSIC_OFFICER), 'FORENSIC OFFICER cannot access charge sheets');
  assert(!isPageAllowed('courtFilings', ROLES.FORENSIC_OFFICER), 'FORENSIC OFFICER cannot access court filings');
  assert(!isActionAllowed('canCreateCase', ROLES.FORENSIC_OFFICER), 'FORENSIC OFFICER cannot register FIR cases');
  assert(isActionAllowed('canUploadDocuments', ROLES.FORENSIC_OFFICER), 'FORENSIC OFFICER can upload forensic reports');

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
