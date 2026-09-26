// src/services/forensicReportsService.js
// Centralized Data Service for Forensic Reports Module
// Routed through FastAPI /api/v1/forensic-reports with fallback resilience

import { apiClient } from './apiClient.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { initialForensicReportsData } from '../data/forensicData.js';
import { forensicReportsData } from '../data/forensicOfficerData.js';
import { resolveCaseUuid } from './casesService.js';
import { logAuditEvent } from './auditService.js';

export function normalizeForensicDiscipline(type) {
  if (!type) return 'DNA STR Profiling';
  const t = type.toLowerCase();
  if (t.includes('ballistic') || t.includes('toolmark') || t.includes('firearm')) {
    return 'Ballistics & Toolmark';
  }
  if (t.includes('cyber') || t.includes('digital') || t.includes('phone') || t.includes('cctv')) {
    return 'Digital Cyber Carving';
  }
  if (t.includes('dna') || t.includes('str') || t.includes('blood') || t.includes('biological')) {
    return 'DNA STR Profiling';
  }
  if (t.includes('toxic') || t.includes('chemical') || t.includes('poison') || t.includes('narcotic')) {
    return 'Toxicology & Chemical Assay';
  }
  return 'Questioned Documents';
}

export function normalizeForensicStatus(status) {
  if (!status) return 'Draft';
  const s = status.toLowerCase();
  if (s.includes('final') || s.includes('complete') || s.includes('accepted')) {
    return 'Finalized';
  }
  if (s.includes('review') || s.includes('submitted')) {
    return 'Pending Review';
  }
  if (s.includes('exam') || s.includes('progress') || s.includes('lab')) {
    return 'Under Examination';
  }
  return 'Draft';
}

export async function resolveEvidenceUuid(evidenceIdentifier) {
  if (!evidenceIdentifier) return null;
  if (isSupabaseConfigured()) {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(evidenceIdentifier);
      if (isUUID) return evidenceIdentifier;

      const { data, error } = await supabase
        .from('evidence')
        .select('id')
        .eq('evidence_tag', evidenceIdentifier)
        .maybeSingle();

      if (!error && data) return data.id;
    } catch (err) {
      console.warn('resolveEvidenceUuid notice:', err.message);
    }
  }
  return null;
}

function mapForensicToUI(r) {
  return {
    id: r.report_number,
    dbId: r.id,
    reportNumber: r.report_number,
    caseId: r.case?.case_number || r.case_id || '#2024-1768',
    itemTag: r.evidence?.evidence_tag || r.evidence_id || 'EV-2024-001',
    evidenceName: r.evidence?.description || 'Physical Evidence Exhibit',
    evidenceCategory: r.evidence?.evidence_type || 'Physical',
    type: r.report_type,
    discipline: r.report_type,
    examiner: r.examiner?.full_name || 'Dr. K.S. Rathore',
    examinerBadge: r.examiner?.badge_id || 'FSL-DIR-009',
    lab: r.laboratory_division || 'Regional Forensic Science Laboratory, Bhopal',
    status: r.status === 'Finalized' ? 'Completed' : r.status,
    rawStatus: r.status,
    submittedDate: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jan 2024',
    finalizedDate: r.finalized_at ? new Date(r.finalized_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
    hash: r.hash_signature,
    findings: r.findings_summary || r.conclusive_opinion || '',
    examinationDetails: r.examination_details || '',
    certificate: r.statutory_certificate || 'Form IV Section 45 IEA / Sec 39 BSA'
  };
}

/**
 * Fetches all forensic reports with joined case and evidence records.
 */
export async function fetchForensicReports(filter = {}) {
  try {
    const params = {};
    if (filter.caseId) params.case_id = filter.caseId;
    if (filter.status && filter.status !== 'All') params.status = normalizeForensicStatus(filter.status);

    const data = await apiClient.get('/forensic-reports', params);
    if (Array.isArray(data) && data.length > 0) {
      return data.map(mapForensicToUI);
    }
  } catch (err) {
    console.warn('FastAPI forensic reports fetch notice, falling back:', err.message);
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('forensic_reports')
          .select(`
            *,
            case:case_id (id, case_number, title),
            evidence:evidence_id (id, evidence_tag, evidence_type, description),
            examiner:examiner_id (id, full_name, badge_id)
          `)
          .order('created_at', { ascending: false });

        if (filter.caseId) {
          const caseUuid = await resolveCaseUuid(filter.caseId);
          if (caseUuid) query = query.eq('case_id', caseUuid);
        }

        if (filter.status && filter.status !== 'All') {
          query = query.eq('status', normalizeForensicStatus(filter.status));
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(mapForensicToUI);
        }
      } catch (sbErr) {
        console.warn('Forensic reports Supabase fallback notice:', sbErr.message);
      }
    }
  }

  return initialForensicReportsData;
}

/**
 * Fetches a single forensic report by report_number or UUID.
 */
export async function fetchForensicReportById(reportIdentifier) {
  if (!reportIdentifier) return null;

  try {
    const data = await apiClient.get(`/forensic-reports/${encodeURIComponent(reportIdentifier)}`);
    if (data) return mapForensicToUI(data);
  } catch (err) {
    console.warn('FastAPI fetchForensicReportById notice, falling back:', err.message);
  }

  const all = await fetchForensicReports();
  return all.find(r => r.id === reportIdentifier || r.reportNumber === reportIdentifier) || null;
}

/**
 * Creates/drafts a new statutory forensic report via FastAPI.
 */
export async function draftForensicReport(reportData) {
  const normDiscipline = normalizeForensicDiscipline(reportData.type || reportData.discipline);
  const normStatus = normalizeForensicStatus(reportData.status);

  try {
    const payload = {
      case_id: reportData.caseId,
      evidence_id: reportData.itemTag || reportData.evidenceId,
      report_type: normDiscipline,
      laboratory_division: reportData.lab || 'Regional Forensic Science Laboratory, Bhopal',
      examination_details: reportData.examinationDetails || 'Spectrometric, microscopic, and chromatographic chemical assay performed under standard operating protocols.',
      findings_summary: reportData.findings || 'Conclusive positive match identified in forensic analysis.',
      conclusive_opinion: reportData.opinion || reportData.findings || 'Conclusive scientific opinion formulated under Section 45 IEA.',
      statutory_certificate: 'Form IV Section 45 IEA / Sec 39 BSA'
    };

    const created = await apiClient.post('/forensic-reports', payload);
    if (created) {
      return {
        ...reportData,
        id: created.report_number,
        dbId: created.id,
        status: created.status
      };
    }
  } catch (err) {
    console.warn('FastAPI draftForensicReport notice, falling back:', err.message);
  }

  // Fallback
  const reportNumber = reportData.reportNumber || `FR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const fallbackItem = {
    ...reportData,
    id: reportNumber,
    reportNumber,
    status: normStatus === 'Finalized' ? 'Completed' : normStatus,
    type: normDiscipline
  };

  initialForensicReportsData.unshift(fallbackItem);
  return fallbackItem;
}

/**
 * Updates a forensic report's status via FastAPI.
 */
export async function updateForensicReportStatus(reportIdentifier, newStatus, conclusiveOpinion = null) {
  const normStatus = normalizeForensicStatus(newStatus);

  try {
    const updated = await apiClient.patch(`/forensic-reports/${encodeURIComponent(reportIdentifier)}/status`, {
      status: normStatus,
      conclusive_opinion: conclusiveOpinion
    });
    if (updated) return mapForensicToUI(updated);
  } catch (err) {
    console.warn('FastAPI updateForensicReportStatus notice, falling back:', err.message);
  }

  const existing = initialForensicReportsData.find(r => r.id === reportIdentifier) ||
                   forensicReportsData.find(r => r.id === reportIdentifier);
  if (existing) {
    existing.status = normStatus === 'Finalized' ? 'Completed' : normStatus;
    if (conclusiveOpinion) existing.findings = conclusiveOpinion;
    return existing;
  }

  return { id: reportIdentifier, status: normStatus };
}
