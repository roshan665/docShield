import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CasesPage from './components/CasesPage';
import DashboardPage from './components/DashboardPage';
import DocumentsPage from './components/DocumentsPage';
import EvidencePage from './components/EvidencePage';
import ForensicPage from './components/ForensicPage';
import ChargeSheetsPage from './components/ChargeSheetsPage';
import CourtFilingsPage from './components/CourtFilingsPage';
import CustodyPage from './components/CustodyPage';
import AuditLogsPage from './components/AuditLogsPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import AdminUsersPage from './components/AdminUsersPage';
import AdminSettingsPage from './components/AdminSettingsPage';

// Legal Officer Role Pages
import LegalDashboardPage from './components/legal/LegalDashboardPage';
import LegalCasesPage from './components/legal/LegalCasesPage';
import LegalDocumentsPage from './components/legal/LegalDocumentsPage';
import LegalEvidencePage from './components/legal/LegalEvidencePage';
import LegalForensicsPage from './components/legal/LegalForensicsPage';
import LegalChargeSheetsPage from './components/legal/LegalChargeSheetsPage';
import LegalCourtFilingsPage from './components/legal/LegalCourtFilingsPage';
import LegalCustodyPage from './components/legal/LegalCustodyPage';
import LegalAuditLogsPage from './components/legal/LegalAuditLogsPage';

// Evidence / Forensic Officer Role Pages
import ForensicDashboardPage from './components/forensic/ForensicDashboardPage';
import ForensicCasesPage from './components/forensic/ForensicCasesPage';
import ForensicEvidencePage from './components/forensic/ForensicEvidencePage';
import ForensicReportsPage from './components/forensic/ForensicReportsPage';
import ForensicDocumentsPage from './components/forensic/ForensicDocumentsPage';
import ForensicCustodyPage from './components/forensic/ForensicCustodyPage';
import ForensicAuditLogsPage from './components/forensic/ForensicAuditLogsPage';

import CaseDetailModal from './components/CaseDetailModal';
import NewCaseModal from './components/NewCaseModal';
import UploadModal from './components/UploadModal';
import EvidenceModal from './components/EvidenceModal';
import IntegrityModal from './components/IntegrityModal';
import AuthModal from './components/AuthModal';
import { initialCasesData } from './data/casesData';
import { initialDocumentsData } from './data/documentsData';
import { initialEvidenceData } from './data/evidenceData';
import { initialForensicReportsData } from './data/forensicData';
import { initialChargeSheetsData } from './data/chargeSheetsData';
import { initialCourtFilingsData } from './data/courtFilingsData';
import { initialCustodyData } from './data/custodyData';
import { initialAuditLogsData } from './data/auditLogsData';

import * as casesService from './services/casesService';
import * as documentsService from './services/documentsService';
import * as evidenceService from './services/evidenceService';
import * as auditService from './services/auditService';
import * as forensicReportsService from './services/forensicReportsService';
import * as chargeSheetsService from './services/chargeSheetsService';
import * as courtFilingsService from './services/courtFilingsService';
import * as custodyService from './services/custodyService';
import * as storageService from './services/storageService';

import { ROLES, normalizeRole } from './constants/roles';
import { isPageAllowed, isActionAllowed, getDefaultPageForRole, getDefaultRouteForRole } from './constants/permissions';
import { useAuth } from './context/AuthContext';

import '../style.css';
import './styles/cases.css';
import './styles/documents.css';
import './styles/evidence.css';
import './styles/forensic.css';
import './styles/chargeSheets.css';
import './styles/courtFilings.css';
import './styles/custody.css';
import './styles/auditLogs.css';
import './styles/adminDashboard.css';
import './styles/adminUsers.css';
import './styles/adminSettings.css';
import './styles/legalOfficer.css';
import './styles/forensicOfficer.css';

export default function App() {
  const { 
    user, 
    profile, 
    currentRole, 
    setCurrentRole, 
    userRole, 
    loading: authLoading, 
    signOut 
  } = useAuth();

  // Active page initialized based on role
  const [activePage, setActivePage] = useState(() => getDefaultPageForRole(currentRole));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Core Data States
  const [cases, setCases] = useState(initialCasesData);
  const [documents, setDocuments] = useState(initialDocumentsData);
  const [evidence, setEvidence] = useState(initialEvidenceData);
  const [forensicReports, setForensicReports] = useState(initialForensicReportsData);
  const [chargeSheets, setChargeSheets] = useState(initialChargeSheetsData);
  const [courtFilings, setCourtFilings] = useState(initialCourtFilingsData);
  const [custodyRecords, setCustodyRecords] = useState(initialCustodyData);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogsData);

  // Loading flags
  const [isCasesLoading, setIsCasesLoading] = useState(false);
  const [isDocsLoading, setIsDocsLoading] = useState(false);
  const [isEvidenceLoading, setIsEvidenceLoading] = useState(false);
  const [isForensicLoading, setIsForensicLoading] = useState(false);
  const [isChargeSheetsLoading, setIsChargeSheetsLoading] = useState(false);
  const [isFilingsLoading, setIsFilingsLoading] = useState(false);
  const [isCustodyLoading, setIsCustodyLoading] = useState(false);
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  // Load all 8 modules asynchronously from centralized service layer
  useEffect(() => {
    let isMounted = true;

    // 1. Cases
    setIsCasesLoading(true);
    casesService.fetchCases().then(data => {
      if (isMounted && data && data.length > 0) setCases(data);
    }).catch(err => console.warn('Cases load notice:', err.message))
      .finally(() => { if (isMounted) setIsCasesLoading(false); });

    // 2. Documents
    setIsDocsLoading(true);
    documentsService.fetchDocuments().then(data => {
      if (isMounted && data && data.length > 0) setDocuments(data);
    }).catch(err => console.warn('Documents load notice:', err.message))
      .finally(() => { if (isMounted) setIsDocsLoading(false); });

    // 3. Evidence
    setIsEvidenceLoading(true);
    evidenceService.fetchEvidence().then(data => {
      if (isMounted && data && data.length > 0) setEvidence(data);
    }).catch(err => console.warn('Evidence load notice:', err.message))
      .finally(() => { if (isMounted) setIsEvidenceLoading(false); });

    // 4. Forensic Reports
    setIsForensicLoading(true);
    forensicReportsService.fetchForensicReports().then(data => {
      if (isMounted && data && data.length > 0) setForensicReports(data);
    }).catch(err => console.warn('Forensic reports load notice:', err.message))
      .finally(() => { if (isMounted) setIsForensicLoading(false); });

    // 5. Charge Sheets
    setIsChargeSheetsLoading(true);
    chargeSheetsService.fetchChargeSheets().then(data => {
      if (isMounted && data && data.length > 0) setChargeSheets(data);
    }).catch(err => console.warn('Charge sheets load notice:', err.message))
      .finally(() => { if (isMounted) setIsChargeSheetsLoading(false); });

    // 6. Court Filings
    setIsFilingsLoading(true);
    courtFilingsService.fetchCourtFilings().then(data => {
      if (isMounted && data && data.length > 0) setCourtFilings(data);
    }).catch(err => console.warn('Court filings load notice:', err.message))
      .finally(() => { if (isMounted) setIsFilingsLoading(false); });

    // 7. Chain of Custody
    setIsCustodyLoading(true);
    custodyService.fetchCustodyRecords().then(data => {
      if (isMounted && data && data.length > 0) setCustodyRecords(data);
    }).catch(err => console.warn('Custody records load notice:', err.message))
      .finally(() => { if (isMounted) setIsCustodyLoading(false); });

    // 8. Audit Logs
    setIsAuditLoading(true);
    auditService.fetchAuditLogs().then(data => {
      if (isMounted && data && data.length > 0) setAuditLogs(data);
    }).catch(err => console.warn('Audit logs load notice:', err.message))
      .finally(() => { if (isMounted) setIsAuditLoading(false); });

    return () => { isMounted = false; };
  }, []);
  
  // Modal states
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTargetCaseId, setUploadTargetCaseId] = useState(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [evidenceTargetCaseId, setEvidenceTargetCaseId] = useState(null);
  const [isIntegrityOpen, setIsIntegrityOpen] = useState(false);
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // Support URL hash routing with strict role security guards
  useEffect(() => {
    const handleHash = () => {
      let rawHash = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
      if (!rawHash) {
        const defaultPage = getDefaultPageForRole(currentRole);
        setActivePage(defaultPage);
        return;
      }

      // Extract parts if hierarchical, e.g. 'inspector/cases' or 'admin/users'
      const parts = rawHash.split('/');
      let prefixRole = null;
      let pageTarget = rawHash;

      if (parts[0] === 'inspector' || parts[0] === 'admin' || parts[0] === 'legal' || parts[0] === 'forensic') {
        prefixRole = parts[0];
        pageTarget = parts.slice(1).join('/');
      }

      // Canonical page normalization
      const pageMapping = {
        'dashboard': 'dashboard',
        'cases': 'cases',
        'documents': 'documents',
        'evidence': 'evidence',
        'forensic': 'forensic',
        'forensics': 'forensic',
        'charge-sheets': 'chargeSheets',
        'chargeSheets': 'chargeSheets',
        'court-filings': 'courtFilings',
        'courtFilings': 'courtFilings',
        'chain-of-custody': 'custody',
        'custody': 'custody',
        'audit-logs': 'auditLogs',
        'auditLogs': 'auditLogs',
        'users': 'users',
        'settings': 'settings',
        'adminDashboard': 'adminDashboard',
        'admin': 'adminDashboard'
      };

      let normalizedPage = pageMapping[pageTarget] || pageTarget;

      // Special case: if prefixRole is 'admin' and target is 'dashboard'
      if (prefixRole === 'admin' && normalizedPage === 'dashboard') {
        normalizedPage = 'adminDashboard';
      }

      const authoritativeRole = userRole || currentRole;

      if (prefixRole) {
        const targetRole = normalizeRole(prefixRole);

        // Security Guard: Prevent role escalation via URL tampering
        if (targetRole === ROLES.ADMIN && authoritativeRole !== ROLES.ADMIN) {
          showToast(`Access Denied: Administrative privileges required. Your verified database role is ${authoritativeRole}.`);
          const safeRoute = getDefaultRouteForRole(authoritativeRole);
          setActivePage(getDefaultPageForRole(authoritativeRole));
          window.location.hash = safeRoute;
          return;
        }

        // Verify if target role is allowed to access the target module
        if (!isPageAllowed(normalizedPage, targetRole)) {
          showToast(`Access Denied: The "${normalizedPage}" module is not accessible to role: ${targetRole}.`);
          const safeRoute = getDefaultRouteForRole(targetRole);
          setActivePage(getDefaultPageForRole(targetRole));
          window.location.hash = safeRoute;
          return;
        }

        setCurrentRole(targetRole);
        setActivePage(normalizedPage);
      } else {
        // Shorthand routes without prefix (e.g. #/users, #/cases, #/charge-sheets)
        if (!isPageAllowed(normalizedPage, authoritativeRole)) {
          showToast(`Access Denied: The "${normalizedPage}" module is restricted for role: ${authoritativeRole}.`);
          const safeRoute = getDefaultRouteForRole(authoritativeRole);
          setActivePage(getDefaultPageForRole(authoritativeRole));
          window.location.hash = safeRoute;
          return;
        }

        if (authoritativeRole === ROLES.ADMIN && normalizedPage === 'dashboard') {
          normalizedPage = 'adminDashboard';
        }

        setActivePage(normalizedPage);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentRole, userRole, profile]);

  const handleOpenCase = (caseId) => {
    setSelectedCaseId(caseId);
  };

  const handleCaseCreated = async (newCase) => {
    // RBAC Action Guard: Inspector & Admin ONLY (matching RLS policy)
    if (!isActionAllowed('canCreateCase', currentRole)) {
      showToast("Access Denied: Case registration is restricted to Police Inspectors and Administrators.");
      return;
    }
    setCases(prev => [newCase, ...prev]);
    showToast(`Case ${newCase.id} registered successfully with SHA-256 baseline.`);
    try {
      await casesService.createCase(newCase);
      await auditService.logAuditEvent({
        action: 'CASE_REGISTERED',
        module: 'Cases',
        entityType: 'Case',
        entityId: newCase.id,
        description: `FIR registered: ${newCase.id} under ${newCase.section}`
      });
    } catch (err) {
      console.warn('Persist case notice:', err.message);
    }
  };

  const handleDocumentUploaded = async (caseId, docType, fileName) => {
    // RBAC Action Guard: Inspector, Forensic Officer & Admin ONLY
    if (!isActionAllowed('canUploadDocuments', currentRole)) {
      showToast("Access Denied: Document upload is restricted to investigating and forensic officers.");
      return;
    }

    const docHash = '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d';
    const newDocItem = {
      id: `DOC-2024-${Date.now().toString().slice(-4)}`,
      name: fileName,
      caseNo: caseId,
      type: docType,
      uploadedBy: profile?.full_name || 'Insp. Rajesh Kumar',
      uploadDate: 'Today',
      size: '2.1 MB',
      hash: docHash,
      status: 'Verified',
      legalReviewStatus: 'Pending Review',
      notes: 'Uploaded and cryptographically sealed under DocShield security protocol.'
    };

    setDocuments(prev => [newDocItem, ...prev]);

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          documentsCount: (c.documentsCount || 0) + 1,
          documents: [
            ...(c.documents || []),
            { name: fileName, type: docType, hash: docHash.substring(0, 10) + '...', status: 'Verified', size: '2.1 MB' }
          ]
        };
      }
      return c;
    }));

    showToast(`Document "${fileName}" cryptographically sealed for Case ${caseId}.`);
    try {
      await documentsService.uploadDocumentMetadata({ 
        caseId, 
        fileName, 
        docType,
        uploadedBy: user?.id 
      });
      await auditService.logAuditEvent({
        action: 'DOCUMENT_UPLOADED',
        module: 'Documents',
        entityType: 'Document',
        entityId: newDocItem.id,
        description: `Document "${fileName}" (${docType}) sealed for case ${caseId}`
      });
    } catch (err) {
      console.warn('Persist document notice:', err.message);
    }
  };

  const handleEvidenceLogged = async (caseId, tag, category, location, description) => {
    // RBAC Action Guard: Inspector & Admin ONLY
    if (!isActionAllowed('canLogEvidence', currentRole)) {
      showToast("Access Denied: Seizure evidence logging is restricted to Police Inspectors and Administrators.");
      return;
    }

    const newEvidenceItem = {
      id: tag || `EV-BH-2024-${Math.floor(100 + Math.random() * 900)}`,
      tag: tag || `EV-BH-2024-${Math.floor(100 + Math.random() * 900)}`,
      name: `${category} Exhibit`,
      cat: category,
      type: category,
      category: category,
      caseNo: caseId,
      caseId: caseId,
      location: location || 'Station Malkhana Vault Room #2',
      holder: profile?.full_name || 'Insp. Rajesh Kumar',
      collectedBy: profile?.full_name || 'Insp. Rajesh Kumar',
      status: location || 'Station Malkhana Vault Room #2',
      examinationStatus: 'Pending Examination',
      verificationStatus: 'Verified',
      sealNumber: `SL-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      condition: 'Intact / Tamper-Evident Bag Sealed',
      description: description || `${category} Exhibit seized under Panchnama`,
      lastUpdated: 'Just now'
    };

    setEvidence(prev => [newEvidenceItem, ...prev]);

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          evidenceCount: (c.evidenceCount || 0) + 1,
          evidence: [
            ...(c.evidence || []),
            { tag: newEvidenceItem.tag, name: newEvidenceItem.name, cat: category, holder: newEvidenceItem.holder, status: newEvidenceItem.status }
          ]
        };
      }
      return c;
    }));

    showToast(`Evidence ${tag} seized and logged to chain of custody.`);
    try {
      await evidenceService.logEvidenceItem({ 
        caseId, 
        tag: newEvidenceItem.tag, 
        category, 
        location, 
        description,
        officerId: user?.id 
      });
      await auditService.logAuditEvent({
        action: 'EVIDENCE_SEIZED',
        module: 'Evidence',
        entityType: 'Evidence',
        entityId: newEvidenceItem.tag,
        description: `Exhibit ${newEvidenceItem.tag} (${category}) logged for case ${caseId}`
      });
    } catch (err) {
      console.warn('Persist evidence notice:', err.message);
    }
  };

  const selectedCaseData = cases.find(c => c.id === selectedCaseId);

  // Authentication Loading Screen
  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F4F7FB' }}>
        <svg className="shield-logo" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '48px', height: '54px', marginBottom: '16px' }}>
          <path d="M18 1L2 7V17.5C2 27.5 8.8 36.8 18 39.5C27.2 36.8 34 27.5 34 17.5V7L18 1Z" fill="#0B1E36" stroke="#0B1E36" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M10 13H26M10 19H26M13 25H23" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0B1E36' }}>DocShield Security Gateway</div>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>Verifying authenticated session and role cryptographic seals...</div>
      </div>
    );
  }

  return (
    <div className="app-root">
      {/* Universal Horizontal Top Navbar */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onOpenCase={handleOpenCase}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        showToast={showToast}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="dashboard-main">
        {currentRole === 'forensic' ? (
          activePage === 'cases' ? (
            <ForensicCasesPage cases={cases} showToast={showToast} />
          ) : activePage === 'evidence' ? (
            <ForensicEvidencePage evidence={evidence} cases={cases} showToast={showToast} />
          ) : activePage === 'forensic' ? (
            <ForensicReportsPage reports={forensicReports} isLoading={isForensicLoading} showToast={showToast} />
          ) : activePage === 'documents' ? (
            <ForensicDocumentsPage documents={documents} cases={cases} showToast={showToast} />
          ) : activePage === 'custody' ? (
            <ForensicCustodyPage records={custodyRecords} cases={cases} showToast={showToast} />
          ) : activePage === 'auditLogs' ? (
            <ForensicAuditLogsPage logs={auditLogs} showToast={showToast} />
          ) : (
            <ForensicDashboardPage 
              onNavigate={(page) => setActivePage(page)}
              showToast={showToast}
            />
          )
        ) : currentRole === 'legal' ? (
          activePage === 'cases' ? (
            <LegalCasesPage cases={cases} showToast={showToast} />
          ) : activePage === 'documents' ? (
            <LegalDocumentsPage documents={documents} cases={cases} showToast={showToast} />
          ) : activePage === 'evidence' ? (
            <LegalEvidencePage evidence={evidence} cases={cases} showToast={showToast} />
          ) : activePage === 'forensic' ? (
            <LegalForensicsPage reports={forensicReports} showToast={showToast} />
          ) : activePage === 'chargeSheets' ? (
            <LegalChargeSheetsPage chargeSheets={chargeSheets} cases={cases} isLoading={isChargeSheetsLoading} showToast={showToast} />
          ) : activePage === 'courtFilings' ? (
            <LegalCourtFilingsPage filings={courtFilings} cases={cases} isLoading={isFilingsLoading} showToast={showToast} />
          ) : activePage === 'custody' ? (
            <LegalCustodyPage records={custodyRecords} cases={cases} showToast={showToast} />
          ) : activePage === 'auditLogs' ? (
            <LegalAuditLogsPage logs={auditLogs} showToast={showToast} />
          ) : (
            <LegalDashboardPage 
              onNavigate={(page) => setActivePage(page)}
              onOpenCase={handleOpenCase}
              showToast={showToast}
            />
          )
        ) : activePage === 'settings' ? (
          <AdminSettingsPage showToast={showToast} />
        ) : activePage === 'users' ? (
          <AdminUsersPage 
            onNavigate={(page) => setActivePage(page)}
            showToast={showToast}
          />
        ) : activePage === 'adminDashboard' ? (
          <AdminDashboardPage 
            onNavigate={(page) => setActivePage(page)}
            onOpenCase={handleOpenCase}
            onNewCase={() => setIsNewCaseOpen(true)}
            onUploadDoc={(cid) => {
              setUploadTargetCaseId(cid || null);
              setIsUploadOpen(true);
            }}
            onAddEvidence={(cid) => {
              setEvidenceTargetCaseId(cid || null);
              setIsEvidenceOpen(true);
            }}
            showToast={showToast}
          />
        ) : activePage === 'auditLogs' ? (
          <AuditLogsPage 
            logs={auditLogs}
            isLoading={isAuditLoading}
            onOpenCase={handleOpenCase}
            showToast={showToast}
          />
        ) : activePage === 'custody' ? (
          <CustodyPage 
            cases={cases}
            records={custodyRecords}
            isLoading={isCustodyLoading}
            onOpenCase={handleOpenCase}
            showToast={showToast}
          />
        ) : activePage === 'courtFilings' ? (
          <CourtFilingsPage 
            cases={cases}
            filings={courtFilings}
            isLoading={isFilingsLoading}
            onOpenCase={handleOpenCase}
            showToast={showToast}
          />
        ) : activePage === 'chargeSheets' ? (
          <ChargeSheetsPage 
            cases={cases}
            chargeSheets={chargeSheets}
            isLoading={isChargeSheetsLoading}
            onOpenCase={handleOpenCase}
            showToast={showToast}
          />
        ) : activePage === 'forensic' ? (
          <ForensicPage 
            cases={cases}
            reports={forensicReports}
            isLoading={isForensicLoading}
            onOpenCase={handleOpenCase}
            showToast={showToast}
          />
        ) : activePage === 'evidence' ? (
          <EvidencePage 
            evidence={evidence}
            cases={cases}
            isLoading={isEvidenceLoading}
            onAddEvidence={() => {
              setEvidenceTargetCaseId(null);
              setIsEvidenceOpen(true);
            }}
            onOpenCase={handleOpenCase}
            showToast={showToast}
          />
        ) : activePage === 'documents' ? (
          <DocumentsPage 
            documents={documents}
            cases={cases}
            isLoading={isDocsLoading}
            onUploadDoc={() => {
              setUploadTargetCaseId(null);
              setIsUploadOpen(true);
            }}
            onOpenCase={handleOpenCase}
            showToast={showToast}
          />
        ) : activePage === 'cases' ? (
          <CasesPage 
            cases={cases}
            isLoading={isCasesLoading}
            onOpenCase={handleOpenCase}
            onAddNewCase={() => setIsNewCaseOpen(true)}
            onUploadDoc={(cid) => {
              setUploadTargetCaseId(cid || null);
              setIsUploadOpen(true);
            }}
            onLogEvidence={(cid) => {
              setEvidenceTargetCaseId(cid || null);
              setIsEvidenceOpen(true);
            }}
            showToast={showToast}
          />
        ) : (
          <DashboardPage 
            cases={cases}
            onOpenCase={handleOpenCase}
            onAddNewCase={() => setIsNewCaseOpen(true)}
            onUploadDoc={(cid) => {
              setUploadTargetCaseId(cid || null);
              setIsUploadOpen(true);
            }}
            onLogEvidence={(cid) => {
              setEvidenceTargetCaseId(cid || null);
              setIsEvidenceOpen(true);
            }}
            onShowIntegrity={() => setIsIntegrityOpen(true)}
            onNavigate={(page) => setActivePage(page)}
            showToast={showToast}
          />
        )}
      </main>

      {/* Universal Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-left">
            © 2024 DocShield. Secure. Transparent. Accountable.
          </div>
          <div className="footer-right">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); showToast("Government of Madhya Pradesh • Police IT Security Framework"); }}>Privacy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); showToast("CrPC Section 173 / Bharatiya Nagarik Suraksha Sanhita Compliant"); }}>Terms</a>
            <a href="#support" onClick={(e) => { e.preventDefault(); showToast("Bhopal Police Technical Command Center: Ext. 402"); }}>Support</a>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <CaseDetailModal 
        caseData={selectedCaseData}
        onClose={() => setSelectedCaseId(null)}
        onUploadDoc={(cid) => {
          setUploadTargetCaseId(cid);
          setIsUploadOpen(true);
        }}
        onLogEvidence={(cid) => {
          setEvidenceTargetCaseId(cid);
          setIsEvidenceOpen(true);
        }}
        showToast={showToast}
      />

      <NewCaseModal 
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        onCaseCreated={handleCaseCreated}
      />

      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        targetCaseId={uploadTargetCaseId}
        cases={cases}
        onUploaded={handleDocumentUploaded}
      />

      <EvidenceModal 
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        targetCaseId={evidenceTargetCaseId}
        cases={cases}
        onEvidenceAdded={handleEvidenceLogged}
      />

      <IntegrityModal 
        isOpen={isIntegrityOpen}
        onClose={() => setIsIntegrityOpen(false)}
      />

      {/* DocShield Authentication Gateway */}
      <AuthModal 
        isOpen={(!user && !authLoading) || isAuthModalOpen} 
        onClose={user ? () => setIsAuthModalOpen(false) : undefined} 
        showToast={showToast} 
      />

      {/* Toast Feedback Messages */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <svg viewBox="0 0 16 16" fill="#10B981" width="16" height="16" style={{ flexShrink: 0 }}>
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l4.992-5.99a.75.75 0 0 0-.01-1.05z"/>
            </svg>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
