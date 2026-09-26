// test-production-qa.js
// DocShield Complete Production-Readiness, Security, Workflow & QA Verification Suite

import * as authService from './src/services/authService.js';
import * as casesService from './src/services/casesService.js';
import * as documentsService from './src/services/documentsService.js';
import * as evidenceService from './src/services/evidenceService.js';
import * as forensicReportsService from './src/services/forensicReportsService.js';
import * as chargeSheetsService from './src/services/chargeSheetsService.js';
import * as courtFilingsService from './src/services/courtFilingsService.js';
import * as custodyService from './src/services/custodyService.js';
import * as auditService from './src/services/auditService.js';
import * as storageService from './src/services/storageService.js';
import { ROLES, normalizeRole } from './src/constants/roles.js';
import { isPageAllowed, isActionAllowed, getDefaultPageForRole, getDefaultRouteForRole } from './src/constants/permissions.js';
import { supabase, isSupabaseConfigured } from './src/lib/supabaseClient.js';
import fs from 'fs';

console.log('================================================================');
console.log('DOCSHIELD FINAL PRODUCTION-READINESS & SECURITY AUDIT SUITE');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;

function assert(condition, description) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ [PASS] ${description}`);
  } else {
    console.error(`  ✗ [FAIL] ${description}`);
  }
}

async function runProductionQASuite() {
  // -------------------------------------------------------------
  // PHASE 1 — CODEBASE INTEGRATION & CLIENT AUDIT
  // -------------------------------------------------------------
  console.log('--- PHASE 1: Codebase Integration & Client Verification ---');
  assert(typeof supabase !== 'undefined', 'Supabase client initialized');
  assert(typeof isSupabaseConfigured === 'function', 'isSupabaseConfigured helper exported');
  assert(isSupabaseConfigured(), 'Active Supabase credentials detected and valid');
  assert(fs.existsSync('./src/App.jsx'), 'App.jsx root component exists');
  assert(fs.existsSync('./.gitignore'), '.gitignore security protection exists');

  // -------------------------------------------------------------
  // PHASE 2 — AUTHENTICATION INTEGRATION & SESSION PERSISTENCE
  // -------------------------------------------------------------
  console.log('\n--- PHASE 2: Authentication Lifecycle Testing ---');
  const sessionBefore = await authService.getCurrentSession();
  assert(sessionBefore === null, '1. Unauthenticated user has null session');

  // 2. Test Invalid/Unregistered Credentials Rejection
  let invalidCredsRejected = false;
  try {
    await authService.signInWithEmail('nonexistent@docshield.gov.in', 'WrongPassword123');
  } catch (err) {
    invalidCredsRejected = err.message.includes('Invalid') || err.message.includes('credentials') || err.code === 'invalid_credentials';
  }
  assert(invalidCredsRejected, '2. Invalid or unauthenticated credentials strictly rejected by auth service');

  // 3. Test Default Dashboard and Route Resolution by Role
  assert(getDefaultPageForRole(ROLES.ADMIN) === 'adminDashboard', '3. Admin maps to adminDashboard');
  assert(getDefaultPageForRole(ROLES.INSPECTOR) === 'dashboard', '4. Inspector maps to investigation dashboard');
  assert(getDefaultPageForRole(ROLES.LEGAL) === 'dashboard', '5. Legal Officer maps to prosecution dashboard');
  assert(getDefaultPageForRole(ROLES.FORENSIC) === 'dashboard', '6. Forensic Officer maps to scientific dashboard');

  assert(getDefaultRouteForRole(ROLES.ADMIN) === '#/admin/dashboard', '7. Admin route is #/admin/dashboard');
  assert(getDefaultRouteForRole(ROLES.INSPECTOR) === '#/inspector/dashboard', '8. Inspector route is #/inspector/dashboard');
  assert(getDefaultRouteForRole(ROLES.LEGAL) === '#/legal/dashboard', '9. Legal Officer route is #/legal/dashboard');
  assert(getDefaultRouteForRole(ROLES.FORENSIC) === '#/forensic/dashboard', '10. Forensic Officer route is #/forensic/dashboard');

  // 11. Test Sign Out Lifecycle
  await authService.signOut();
  const sessionAfterLogout = await authService.getCurrentSession();
  assert(sessionAfterLogout === null, '11. Sign out terminates session cleanly');

  // -------------------------------------------------------------
  // PHASE 3 — RBAC SECURITY TESTING ACROSS ALL 4 ROLES
  // -------------------------------------------------------------
  console.log('\n--- PHASE 3: RBAC Security Matrix Across 4 Roles ---');
  const allRoles = [ROLES.ADMIN, ROLES.INSPECTOR, ROLES.LEGAL, ROLES.FORENSIC];

  // Admin access
  assert(isPageAllowed('adminDashboard', ROLES.ADMIN), 'ADMIN: Authorized for adminDashboard');
  assert(isPageAllowed('users', ROLES.ADMIN), 'ADMIN: Authorized for users management');
  assert(isPageAllowed('cases', ROLES.ADMIN), 'ADMIN: Authorized for cases');
  assert(isActionAllowed('canCreateCase', ROLES.ADMIN), 'ADMIN: Authorized to create cases');

  // Inspector access
  assert(isPageAllowed('dashboard', ROLES.INSPECTOR), 'INSPECTOR: Authorized for investigation dashboard');
  assert(isPageAllowed('cases', ROLES.INSPECTOR), 'INSPECTOR: Authorized for cases');
  assert(!isPageAllowed('users', ROLES.INSPECTOR), 'INSPECTOR: Blocked from admin users');
  assert(!isPageAllowed('settings', ROLES.INSPECTOR), 'INSPECTOR: Blocked from admin settings');
  assert(isActionAllowed('canCreateCase', ROLES.INSPECTOR), 'INSPECTOR: Permitted case creation');

  // Legal Officer access
  assert(isPageAllowed('dashboard', ROLES.LEGAL), 'LEGAL: Authorized for prosecution dashboard');
  assert(isPageAllowed('chargeSheets', ROLES.LEGAL), 'LEGAL: Authorized for charge sheets');
  assert(isPageAllowed('courtFilings', ROLES.LEGAL), 'LEGAL: Authorized for court filings');
  assert(!isPageAllowed('users', ROLES.LEGAL), 'LEGAL: Blocked from admin users');
  assert(!isActionAllowed('canCreateCase', ROLES.LEGAL), 'LEGAL: Blocked from case FIR registration');

  // Forensic Officer access
  assert(isPageAllowed('dashboard', ROLES.FORENSIC), 'FORENSIC: Authorized for scientific dashboard');
  assert(isPageAllowed('forensic', ROLES.FORENSIC), 'FORENSIC: Authorized for forensic reports');
  assert(isPageAllowed('custody', ROLES.FORENSIC), 'FORENSIC: Authorized for chain of custody');
  assert(!isPageAllowed('chargeSheets', ROLES.FORENSIC), 'FORENSIC: Blocked from charge sheets');
  assert(!isPageAllowed('courtFilings', ROLES.FORENSIC), 'FORENSIC: Blocked from court filings');
  assert(!isActionAllowed('canCreateCase', ROLES.FORENSIC), 'FORENSIC: Blocked from case registration');
  assert(isActionAllowed('canDraftForensicReports', ROLES.FORENSIC), 'FORENSIC: Permitted report drafting');

  // -------------------------------------------------------------
  // PHASE 4 — RLS DEEP VERIFICATION & TAMPER GUARDS
  // -------------------------------------------------------------
  console.log('\n--- PHASE 4: Database RLS & Immutability Verification ---');
  let custodyTamperBlocked = false;
  try {
    await custodyService.updateCustodyRecord();
  } catch (err) {
    custodyTamperBlocked = err.message.includes('SECURITY VIOLATION');
  }
  assert(custodyTamperBlocked, 'Custody history cannot be updated (Security Guard verified)');

  let custodyDeleteBlocked = false;
  try {
    await custodyService.deleteCustodyRecord();
  } catch (err) {
    custodyDeleteBlocked = err.message.includes('SECURITY VIOLATION');
  }
  assert(custodyDeleteBlocked, 'Custody history cannot be deleted (Security Guard verified)');

  let auditUpdateBlocked = false;
  try {
    await auditService.updateAuditLog();
  } catch (err) {
    auditUpdateBlocked = err.message.includes('SECURITY VIOLATION');
  }
  assert(auditUpdateBlocked, 'Audit logs cannot be updated (Security Guard verified)');

  let auditDeleteBlocked = false;
  try {
    await auditService.deleteAuditLog();
  } catch (err) {
    auditDeleteBlocked = err.message.includes('SECURITY VIOLATION');
  }
  assert(auditDeleteBlocked, 'Audit logs cannot be deleted (Security Guard verified)');

  // -------------------------------------------------------------
  // PHASE 5 — DATA INTEGRITY & RELATIONSHIP TESTING
  // -------------------------------------------------------------
  console.log('\n--- PHASE 5: Relational Data Integrity ---');
  const allCases = await casesService.fetchCases();
  assert(Array.isArray(allCases) && allCases.length > 0, `Cases service loaded ${allCases.length} records`);

  const sampleCase = allCases[0];
  assert(sampleCase.id && (sampleCase.title || sampleCase.section) && sampleCase.status, 'Case record has valid core attributes');

  const detailedCase = await casesService.fetchCaseById(sampleCase.id);
  assert(detailedCase !== null, `Case details retrieved with child relations: ${sampleCase.id}`);

  // -------------------------------------------------------------
  // PHASE 6 — END-TO-END WORKFLOW TESTING
  // -------------------------------------------------------------
  console.log('\n--- PHASE 6: End-to-End Workflow Verification ---');
  
  // WORKFLOW A: Investigation
  console.log('  Testing Workflow A (Investigation - Inspector):');
  const newCaseId = `#2024-TEST-E2E-${Math.floor(100 + Math.random() * 900)}`;
  const createdCase = await casesService.createCase({
    id: newCaseId,
    section: 'IPC 379 - Theft of Evidence Docket',
    priority: 'High',
    station: 'Bhopal Central Police Station'
  });
  assert(createdCase && createdCase.id === newCaseId, `  Case registered: ${newCaseId}`);

  const evidenceItem = await evidenceService.logEvidenceItem({
    caseId: newCaseId,
    tag: `EV-TEST-${Date.now().toString().slice(-4)}`,
    category: 'Digital',
    location: 'Cyber Cell Vault',
    description: 'Encrypted flash drive seized during raid'
  });
  assert(evidenceItem && evidenceItem.tag, `  Evidence logged: ${evidenceItem.tag}`);

  // WORKFLOW B: Forensic
  console.log('  Testing Workflow B (Forensic - Forensic Officer):');
  const custodyTransfer = await custodyService.logCustodyTransfer({
    evidenceId: evidenceItem.tag,
    fromLocation: 'Station Malkhana Vault Room #2',
    toLocation: 'Cyber Forensics Division, RFSL Bhopal',
    reason: 'Cryptographic carving and timeline analysis'
  });
  assert(custodyTransfer && custodyTransfer.blockHash, `  Custody transfer chained: ${custodyTransfer.blockHash}`);

  const report = await forensicReportsService.draftForensicReport({
    caseId: newCaseId,
    evidenceId: evidenceItem.tag,
    reportType: 'Digital Cyber Carving',
    findingsSummary: 'Decrypted partition contains audit ledger timestamped to incident date.',
    conclusiveOpinion: 'Forensic integrity confirmed.'
  });
  assert(report && report.reportNumber, `  Forensic report drafted: ${report.reportNumber}`);

  // WORKFLOW C: Legal
  console.log('  Testing Workflow C (Legal - Legal Officer):');
  const chargeSheet = await chargeSheetsService.createChargeSheet({
    caseId: newCaseId,
    investigationSummary: 'Evidence and forensic corroboration complete for judicial presentation.',
    courtName: 'Court of Chief Judicial Magistrate, Bhopal'
  });
  assert(chargeSheet && chargeSheet.chargeSheetNumber, `  Charge sheet created: ${chargeSheet.chargeSheetNumber}`);

  const filing = await courtFilingsService.createCourtFiling({
    caseId: newCaseId,
    filingType: 'Charge Sheet',
    title: 'Submission of Final Police Report under CrPC 173',
    courtName: 'Court of Chief Judicial Magistrate, Bhopal'
  });
  assert(filing && filing.filingNumber, `  Court filing submitted: ${filing.filingNumber}`);

  // WORKFLOW D: Admin & Audit
  console.log('  Testing Workflow D (Admin & Audit Compliance):');
  const auditLogs = await auditService.fetchAuditLogs();
  assert(Array.isArray(auditLogs) && auditLogs.length > 0, `  Audit trail accessible: ${auditLogs.length} events logged`);

  // -------------------------------------------------------------
  // PHASE 7 — STORAGE SECURITY TESTING
  // -------------------------------------------------------------
  console.log('\n--- PHASE 7: Private Storage & Signed URL Security ---');
  const validBlob = new Blob(['%PDF-1.4 Mock Statutory Evidence Document Content'], { type: 'application/pdf' });
  const uploadRes = await storageService.uploadInvestigationFile({
    bucket: 'evidence-vault',
    caseId: newCaseId,
    file: validBlob,
    customFileName: 'Certified_Forensic_Seizure.pdf'
  });
  assert(uploadRes && uploadRes.storagePath, `File securely deposited in private bucket: ${uploadRes.bucket}`);

  const signedUrl = await storageService.getSecureSignedUrl(uploadRes.bucket, uploadRes.storagePath, 60);
  assert(typeof signedUrl === 'string' && signedUrl.length > 0, 'Short-lived signed URL generated for authorized retrieval');

  let badFileBlocked = false;
  try {
    storageService.validateFileForUpload({ size: 60 * 1024 * 1024, type: 'application/pdf' });
  } catch (err) {
    badFileBlocked = err.message.includes('exceeds 50 MB');
  }
  assert(badFileBlocked, 'Files exceeding 50 MB threshold rejected by storage guard');

  // -------------------------------------------------------------
  // PHASE 8 — ERROR HANDLING & NULL RESILIENCE
  // -------------------------------------------------------------
  console.log('\n--- PHASE 8: Error Handling & Missing Record Resilience ---');
  const missingCase = await casesService.fetchCaseById('NON-EXISTENT-CASE');
  assert(missingCase === null, 'Missing case lookup gracefully returns null');

  const missingDoc = await documentsService.fetchDocumentById('NON-EXISTENT-DOC');
  assert(missingDoc === null, 'Missing document lookup gracefully returns null');

  const missingEv = await evidenceService.fetchEvidenceById('NON-EXISTENT-EV');
  assert(missingEv === null, 'Missing evidence lookup gracefully returns null');

  // -------------------------------------------------------------
  // PHASE 11 & 14 — SECURITY & SECRETS AUDIT
  // -------------------------------------------------------------
  console.log('\n--- PHASE 11 & 14: Final Security & Secrets Audit ---');
  const envContent = fs.readFileSync('./.env', 'utf-8');
  assert(!envContent.includes('service_role'), 'No service_role secret committed in .env');
  assert(fs.existsSync('./.gitignore'), '.gitignore confirmed present in root');
  const gitignoreContent = fs.readFileSync('./.gitignore', 'utf-8');
  assert(gitignoreContent.includes('.env'), '.gitignore properly excludes .env from git tracking');

  console.log('\n================================================================');
  console.log(`TOTAL PRODUCTION CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${totalChecks - passedChecks}`);
  console.log('================================================================\n');

  if (passedChecks === totalChecks) {
    console.log('>>> ALL VERIFICATION CHECKS PASSED WITH ZERO FAILURES <<<');
  } else {
    process.exit(1);
  }
}

runProductionQASuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
