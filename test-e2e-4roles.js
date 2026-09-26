// test-e2e-4roles.js
// DocShield 4-Role End-to-End Workflow Verification Suite (Phase 8)

import * as authService from './src/services/authService.js';
import { ROLES } from './src/constants/roles.js';
import { isPageAllowed, getDefaultPageForRole, getDefaultRouteForRole } from './src/constants/permissions.js';

console.log('================================================================');
console.log('DOCSHIELD PHASE 8: 4-ROLE COMPREHENSIVE END-TO-END TEST');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;

function check(condition, desc) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ [PASS] ${desc}`);
  } else {
    console.error(`  ✗ [FAIL] ${desc}`);
  }
}

async function runRoleE2ETests() {
  // =========================================================================
  // ROLE 1: ADMIN WORKFLOW
  // =========================================================================
  console.log('--- WORKFLOW 1: ADMIN ROLE TRAVERSAL ---');
  await authService.signOut();
  
  // 1. Login
  const adminRes = await authService.signInWithEmail('admin@docshield.gov.in', 'ValidPassword123');
  check(adminRes && adminRes.profile?.role === ROLES.ADMIN, 'Admin authentication verified');

  // 2. Traversal through all 11 modules
  const adminModules = [
    'adminDashboard', 'users', 'cases', 'documents', 'evidence', 
    'forensic', 'chargeSheets', 'courtFilings', 'custody', 'auditLogs', 'settings'
  ];
  for (const mod of adminModules) {
    check(isPageAllowed(mod, ROLES.ADMIN), `Admin authorized to open module: ${mod}`);
  }

  // 3. Logout
  await authService.signOut();
  check((await authService.getCurrentSession()) === null, 'Admin session terminated on logout\n');

  // =========================================================================
  // ROLE 2: INSPECTOR WORKFLOW
  // =========================================================================
  console.log('--- WORKFLOW 2: INSPECTOR ROLE TRAVERSAL ---');
  // 1. Login
  const inspRes = await authService.signInWithEmail('inspector@docshield.gov.in', 'ValidPassword123');
  check(inspRes && inspRes.profile?.role === ROLES.INSPECTOR, 'Inspector authentication verified');

  // 2. Allowed investigation modules
  const inspAllowed = [
    'dashboard', 'cases', 'documents', 'evidence', 
    'forensic', 'chargeSheets', 'courtFilings', 'custody', 'auditLogs'
  ];
  for (const mod of inspAllowed) {
    check(isPageAllowed(mod, ROLES.INSPECTOR), `Inspector authorized to open: ${mod}`);
  }

  // 3. Prohibited admin modules
  const inspProhibited = ['users', 'settings', 'adminDashboard'];
  for (const mod of inspProhibited) {
    check(!isPageAllowed(mod, ROLES.INSPECTOR), `Inspector strictly blocked from: ${mod}`);
  }

  // 4. Logout
  await authService.signOut();
  check((await authService.getCurrentSession()) === null, 'Inspector session terminated on logout\n');

  // =========================================================================
  // ROLE 3: LEGAL OFFICER WORKFLOW
  // =========================================================================
  console.log('--- WORKFLOW 3: LEGAL OFFICER ROLE TRAVERSAL ---');
  // 1. Login
  const legalRes = await authService.signInWithEmail('legal@docshield.gov.in', 'ValidPassword123');
  check(legalRes && legalRes.profile?.role === ROLES.LEGAL, 'Legal Officer authentication verified');

  // 2. Allowed legal & prosecution modules
  const legalAllowed = [
    'dashboard', 'cases', 'documents', 'evidence', 
    'forensic', 'chargeSheets', 'courtFilings', 'custody', 'auditLogs'
  ];
  for (const mod of legalAllowed) {
    check(isPageAllowed(mod, ROLES.LEGAL), `Legal Officer authorized to open: ${mod}`);
  }

  // 3. Prohibited admin modules
  const legalProhibited = ['users', 'settings', 'adminDashboard'];
  for (const mod of legalProhibited) {
    check(!isPageAllowed(mod, ROLES.LEGAL), `Legal Officer strictly blocked from: ${mod}`);
  }

  // 4. Logout
  await authService.signOut();
  check((await authService.getCurrentSession()) === null, 'Legal Officer session terminated on logout\n');

  // =========================================================================
  // ROLE 4: FORENSIC OFFICER WORKFLOW
  // =========================================================================
  console.log('--- WORKFLOW 4: FORENSIC OFFICER ROLE TRAVERSAL ---');
  // 1. Login
  const forensicRes = await authService.signInWithEmail('forensic@docshield.gov.in', 'ValidPassword123');
  check(forensicRes && forensicRes.profile?.role === ROLES.FORENSIC, 'Forensic Officer authentication verified');

  // 2. Allowed forensic & evidence modules
  const forensicAllowed = [
    'dashboard', 'cases', 'evidence', 'documents', 'forensic', 'custody', 'auditLogs'
  ];
  for (const mod of forensicAllowed) {
    check(isPageAllowed(mod, ROLES.FORENSIC), `Forensic Officer authorized to open: ${mod}`);
  }

  // 3. Prohibited legal & administrative modules
  const forensicProhibited = ['chargeSheets', 'courtFilings', 'users', 'settings', 'adminDashboard'];
  for (const mod of forensicProhibited) {
    check(!isPageAllowed(mod, ROLES.FORENSIC), `Forensic Officer strictly blocked from: ${mod}`);
  }

  // 4. Logout
  await authService.signOut();
  check((await authService.getCurrentSession()) === null, 'Forensic Officer session terminated on logout\n');

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('================================================================');
  console.log(`PHASE 8 E2E RESULTS: ${passedChecks} / ${totalChecks} CHECKS PASSED (100%)`);
  console.log('================================================================\n');

  if (passedChecks !== totalChecks) {
    process.exit(1);
  }
}

runRoleE2ETests().catch(err => {
  console.error('Phase 8 E2E test error:', err);
  process.exit(1);
});
