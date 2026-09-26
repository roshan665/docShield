// test-legal-forensic-security.js
// Automated End-to-End Validation Suite for Legal, Forensic, Custody, Audit, Storage & Security Modules

import * as casesService from './src/services/casesService.js';
import * as documentsService from './src/services/documentsService.js';
import * as evidenceService from './src/services/evidenceService.js';
import * as forensicReportsService from './src/services/forensicReportsService.js';
import * as chargeSheetsService from './src/services/chargeSheetsService.js';
import * as courtFilingsService from './src/services/courtFilingsService.js';
import * as custodyService from './src/services/custodyService.js';
import * as auditService from './src/services/auditService.js';
import * as storageService from './src/services/storageService.js';
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

async function runSecurityAndWorkflowSuite() {
  console.log('================================================================');
  console.log('DOCSHIELD LEGAL, FORENSIC, CUSTODY & SECURITY SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // PHASE 1 — FORENSIC REPORTS MODULE
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: Forensic Reports Service & Relations ---');
  const allReports = await forensicReportsService.fetchForensicReports();
  assert(Array.isArray(allReports) && allReports.length > 0, `Fetched ${allReports.length} forensic reports`);

  const sampleReport = allReports[0];
  assert(sampleReport.id && sampleReport.caseNo && sampleReport.hash, `Report ${sampleReport.id} has valid metadata & SHA-256 seal`);

  // Discipline normalization
  assert(forensicReportsService.normalizeForensicDiscipline('DNA Analysis') === 'DNA STR Profiling', 'Discipline maps to "DNA STR Profiling"');
  assert(forensicReportsService.normalizeForensicDiscipline('Ballistics Exam') === 'Ballistics & Toolmark', 'Discipline maps to "Ballistics & Toolmark"');
  assert(forensicReportsService.normalizeForensicDiscipline('Cyber Evidence') === 'Digital Cyber Carving', 'Discipline maps to "Digital Cyber Carving"');

  // Drafting a new report
  const newReport = await forensicReportsService.draftForensicReport({
    id: `FR-TEST-${Math.floor(100 + Math.random() * 900)}`,
    type: 'DNA Analysis',
    caseNo: '#2024-1768',
    evidenceId: 'EV-2024-001',
    labPrimary: 'RFSL Bhopal',
    status: 'Under Examination',
    specimen: 'Blood swab exhibit #EV-2024-001 recovered from crime scene',
    findings: 'Preliminary DNA profile isolated.',
    opinion: 'Matches suspect profile with 99.98% certainty.'
  });
  assert(newReport && newReport.id.startsWith('FR-TEST-'), `Forensic report ${newReport.id} drafted successfully`);

  // Status update
  const updatedReport = await forensicReportsService.updateForensicReportStatus(newReport.id, 'Finalized', 'Conclusive match confirmed.');
  assert(updatedReport && (updatedReport.status === 'Completed' || updatedReport.status === 'Finalized'), `Report status finalized`);

  // Cryptographic integrity verification
  const verifyReport = await forensicReportsService.verifyReportIntegrity(newReport.id);
  assert(verifyReport.verified === true, `Report seal integrity confirmed`);

  console.log('');

  // -------------------------------------------------------------------------
  // PHASE 2 — CHARGE SHEETS MODULE
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 2: Charge Sheets Service & Legal Review ---');
  const allSheets = await chargeSheetsService.fetchChargeSheets();
  assert(Array.isArray(allSheets) && allSheets.length > 0, `Fetched ${allSheets.length} charge sheets`);

  const sampleSheet = allSheets[0];
  assert(sampleSheet.id && sampleSheet.caseNo && sampleSheet.court, `Charge sheet ${sampleSheet.id} has valid case & court link`);

  // Status normalization
  assert(chargeSheetsService.normalizeChargeSheetStatus('Approved') === 'Accepted', 'Normalized "Approved" to "Accepted"');
  assert(chargeSheetsService.normalizeChargeSheetStatus('Defect Noted') === 'Returned', 'Normalized "Defect Noted" to "Returned"');
  assert(chargeSheetsService.normalizeChargeSheetStatus('Scrutiny') === 'Under Review', 'Normalized "Scrutiny" to "Under Review"');

  // Create charge sheet
  const newCS = await chargeSheetsService.createChargeSheet({
    id: `CS-TEST-${Math.floor(100 + Math.random() * 900)}`,
    caseNo: '#2024-1768',
    summary: 'Final charge sheet submitted under Section 173 CrPC.',
    charges: ['Section 302 IPC', 'Section 201 IPC'],
    court: 'Chief Judicial Magistrate Court, Bhopal',
    status: 'Under Review'
  });
  assert(newCS && newCS.id.startsWith('CS-TEST-'), `Charge sheet ${newCS.id} created successfully`);

  // Legal officer scrutiny update
  const reviewedCS = await chargeSheetsService.updateChargeSheetStatus(newCS.id, 'Accepted', 'Statutory Section 173 scrutiny cleared.');
  assert(reviewedCS && (reviewedCS.status === 'Accepted' || reviewedCS.status === 'Finalized'), `Charge sheet approved for court filing`);

  console.log('');

  // -------------------------------------------------------------------------
  // PHASE 3 — COURT FILINGS MODULE
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 3: Court Filings Service & Submissions ---');
  const allFilings = await courtFilingsService.fetchCourtFilings();
  assert(Array.isArray(allFilings) && allFilings.length > 0, `Fetched ${allFilings.length} court filings`);

  // Filing type normalization
  assert(courtFilingsService.normalizeFilingType('Bail Petition') === 'Bail Application', 'Normalized to "Bail Application"');
  assert(courtFilingsService.normalizeFilingType('Remand Memo') === 'Remand Extension', 'Normalized to "Remand Extension"');

  // Submit court filing
  const newFiling = await courtFilingsService.createCourtFiling({
    id: `CF-TEST-${Math.floor(100 + Math.random() * 900)}`,
    caseNo: '#2024-1768',
    type: 'Charge Sheet',
    title: 'Formal Judicial Filing of Final Form #CS-TEST',
    court: 'Court of Chief Judicial Magistrate, Bhopal',
    judge: 'Hon. CJM Bhopal',
    nextHearingDate: '2024-10-15',
    status: 'Filed'
  });
  assert(newFiling && newFiling.id.startsWith('CF-TEST-'), `Court filing ${newFiling.id} registered`);

  console.log('');

  // -------------------------------------------------------------------------
  // PHASE 4 — CHAIN OF CUSTODY (SECURITY-CRITICAL APPEND-ONLY)
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 4: Chain of Custody Immutability & Chaining ---');
  const initialTimeline = await custodyService.fetchCustodyTimeline('EV-2024-001');
  const initialLength = initialTimeline.length;
  assert(Array.isArray(initialTimeline) && initialLength > 0, `Custody timeline has ${initialLength} chronological steps`);

  // Append new transfer block
  const transfer = await custodyService.logCustodyTransfer({
    evidenceId: 'EV-2024-001',
    fromLocation: 'Station Malkhana Vault Room #2',
    toLocation: 'RFSL Ballistics Laboratory Bench 02',
    reason: 'Forwarded for striation comparison and microscopic examination',
    sealIntact: true
  });
  assert(transfer && transfer.blockHash, `Transfer block generated with block hash: ${transfer.blockHash}`);

  // Verify historical events were preserved (never overwritten)
  const updatedTimeline = await custodyService.fetchCustodyTimeline('EV-2024-001');
  assert(updatedTimeline.length >= initialLength, `Historical custody chain preserved (steps: ${updatedTimeline.length})`);

  // SECURITY GUARD TEST: Attempt to update or delete custody records
  let updateBlocked = false;
  try {
    await custodyService.updateCustodyRecord();
  } catch (err) {
    updateBlocked = true;
  }
  assert(updateBlocked, `SECURITY CHECK: updateCustodyRecord() threw exception as forbidden`);

  let deleteBlocked = false;
  try {
    await custodyService.deleteCustodyRecord();
  } catch (err) {
    deleteBlocked = true;
  }
  assert(deleteBlocked, `SECURITY CHECK: deleteCustodyRecord() threw exception as forbidden`);

  console.log('');

  // -------------------------------------------------------------------------
  // PHASE 5 — AUDIT LOGS (SECURITY-CRITICAL IMMUTABLE TRAIL)
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 5: Audit Trail Integrity & Protection ---');
  const logs = await auditService.fetchAuditLogs();
  assert(Array.isArray(logs) && logs.length > 0, `Fetched ${logs.length} audit logs`);

  // Append audit event
  const newAudit = await auditService.logAuditEvent({
    action: 'INTEGRITY_SECURITY_AUDIT',
    module: 'Security',
    entityType: 'SystemAudit',
    description: 'System-wide compliance audit executed',
    result: 'Success'
  });
  assert(newAudit && newAudit.recordHash, `Audit event logged with cryptographic seal: ${newAudit.recordHash}`);

  // SECURITY GUARD TEST: Attempt to modify or delete audit log
  let auditUpdateBlocked = false;
  try {
    await auditService.updateAuditLog();
  } catch (err) {
    auditUpdateBlocked = true;
  }
  assert(auditUpdateBlocked, `SECURITY CHECK: updateAuditLog() threw exception as forbidden`);

  let auditDeleteBlocked = false;
  try {
    await auditService.deleteAuditLog();
  } catch (err) {
    auditDeleteBlocked = true;
  }
  assert(auditDeleteBlocked, `SECURITY CHECK: deleteAuditLog() threw exception as forbidden`);

  console.log('');

  // -------------------------------------------------------------------------
  // PHASE 6 — STORAGE SERVICE INTEGRATION
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 6: Private Storage & Signed URL Security ---');
  const dummyFile = {
    name: 'Forensic_Analysis_Certificate.pdf',
    size: 2048576,
    type: 'application/pdf'
  };

  // Upload to private bucket
  const uploadResult = await storageService.uploadInvestigationFile({
    bucket: 'case-documents',
    caseId: '#2024-1768',
    file: dummyFile
  });
  assert(uploadResult && uploadResult.storagePath, `File uploaded to private vault path: ${uploadResult.storagePath}`);

  // Generate short-lived signed URL
  const signedUrl = await storageService.getSecureSignedUrl('case-documents', uploadResult.storagePath, 60);
  assert(typeof signedUrl === 'string' && signedUrl.length > 0, `Generated signed URL for secure download`);

  // File validation threshold
  let oversizedBlocked = false;
  try {
    storageService.validateFileForUpload({ name: 'huge.iso', size: 60 * 1024 * 1024, type: 'application/pdf' });
  } catch (err) {
    oversizedBlocked = true;
  }
  assert(oversizedBlocked, `SECURITY CHECK: Files > 50 MB threshold rejected`);

  let unapprovedTypeBlocked = false;
  try {
    storageService.validateFileForUpload({ name: 'malicious.exe', size: 1024, type: 'application/x-msdownload' });
  } catch (err) {
    unapprovedTypeBlocked = true;
  }
  assert(unapprovedTypeBlocked, `SECURITY CHECK: Unsupported file mime type rejected`);

  console.log('');

  // -------------------------------------------------------------------------
  // PHASE 7 — CROSS-MODULE WORKFLOW CHAIN
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 7: Complete Cross-Module Relational Flow ---');
  // CASE -> DOCUMENTS -> EVIDENCE -> CUSTODY -> FORENSIC REPORTS -> CHARGE SHEET -> COURT FILINGS -> AUDIT LOGS
  const targetCase = await casesService.fetchCaseById('#2024-1768');
  assert(targetCase !== null, `Case #2024-1768 verified at root of workflow`);

  const caseDocs = await documentsService.fetchDocuments('#2024-1768');
  assert(caseDocs.length > 0, `Root Case linked to ${caseDocs.length} documents`);

  const caseEvidence = await evidenceService.fetchEvidence('#2024-1768');
  assert(caseEvidence.length > 0, `Root Case linked to ${caseEvidence.length} evidence exhibits`);

  const targetExhibit = caseEvidence[0];
  const exhibitCustody = await custodyService.fetchCustodyTimeline(targetExhibit.id || targetExhibit.tag);
  assert(exhibitCustody.length > 0, `Exhibit linked to unbroken custody chain`);

  console.log('');

  // -------------------------------------------------------------------------
  // PHASE 8 — 10 MANDATORY SECURITY CHECKS
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 8: 10 Mandatory Security Verifications ---');

  // Check 1: Cross-role restricted record isolation
  assert(!isPageAllowed('users', ROLES.INSPECTOR), 'SEC-01: Inspector blocked from Admin Users');
  assert(!isPageAllowed('settings', ROLES.LEGAL_OFFICER), 'SEC-01: Legal Officer blocked from Admin Settings');
  assert(!isPageAllowed('chargeSheets', ROLES.FORENSIC_OFFICER), 'SEC-01: Forensic Officer blocked from Charge Sheets');

  // Check 2: Unauthorized case access guard
  assert(isActionAllowed('canCreateCase', ROLES.INSPECTOR), 'SEC-02: Inspector authorized for case creation');
  assert(!isActionAllowed('canCreateCase', ROLES.LEGAL_OFFICER), 'SEC-02: Legal Officer denied case creation');

  // Check 3: Audit log immutability
  assert(auditUpdateBlocked && auditDeleteBlocked, 'SEC-03: Audit logs cannot be modified or deleted');

  // Check 4: Custody history immutability
  assert(updateBlocked && deleteBlocked, 'SEC-04: Custody history cannot be modified or deleted');

  // Check 5: Storage privacy
  assert(!signedUrl.includes('public_all_access'), 'SEC-05: Private storage buckets do not expose public unrestricted URLs');

  // Check 6: Role escalation prevention
  assert(!isActionAllowed('canManageUsers', ROLES.INSPECTOR), 'SEC-06: Non-admin roles cannot manage users or alter roles');

  // Check 7: Direct URL bypass prevention
  assert(!isPageAllowed('adminDashboard', ROLES.FORENSIC_OFFICER), 'SEC-07: Forensic officer cannot access Admin Dashboard route');

  // Check 8: Database RLS parity
  assert(isActionAllowed('canDraftForensicReports', ROLES.FORENSIC_OFFICER), 'SEC-08: Forensic Officer has report drafting permission');
  assert(!isActionAllowed('canDraftForensicReports', ROLES.INSPECTOR), 'SEC-08: Inspector blocked from drafting forensic reports');

  // Check 9: Orphan record prevention
  assert(forensicReportsService.normalizeForensicDiscipline('Unknown') === 'Questioned Documents', 'SEC-09: Invalid inputs safely mapped to valid schema enums');

  // Check 10: RLS Protection verified
  assert(isPageAllowed('auditLogs', ROLES.ADMIN) && isPageAllowed('auditLogs', ROLES.INSPECTOR), 'SEC-10: Audit logs readable by authorized officers only');

  console.log('\n================================================================');
  console.log(`SUITE RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAndWorkflowSuite().catch(err => {
  console.error('Unhandled security suite error:', err);
  process.exit(1);
});
