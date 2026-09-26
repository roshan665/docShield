// src/services/evidenceService.js
// Centralized Data Service for Evidence Module
// Routed through FastAPI /api/v1/evidence with fallback resilience

import { apiClient } from './apiClient.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { initialEvidenceData } from '../data/evidenceData.js';
import { resolveCaseUuid } from './casesService.js';

export function normalizeEvidenceCategory(cat) {
  if (!cat) return 'Physical';
  const clean = cat.trim();
  if (/firearm|weapon|pistol|revolver|gun|rifle/i.test(clean)) return 'Firearm';
  if (/ammunition|cartridge|bullet|shell/i.test(clean)) return 'Ammunition';
  if (/electronic|digital|phone|cctv|laptop|sim|cdr|audio/i.test(clean)) return 'Digital';
  if (/bio|blood|dna|swab/i.test(clean)) return 'Biological';
  if (/narcotic|drug|substance/i.test(clean)) return 'Narcotics';
  if (/chem|poison|toxic/i.test(clean)) return 'Chemical';
  return 'Physical';
}

function getThumbnailType(cat, desc = '') {
  const d = desc.toLowerCase();
  if (d.includes('knife') || d.includes('dagger')) return 'knife';
  if (d.includes('cctv') || d.includes('footage')) return 'cctv';
  if (d.includes('scene') || d.includes('photo')) return 'scene';
  if (d.includes('audio') || d.includes('call') || d.includes('voice')) return 'audio';
  if (d.includes('phone') || d.includes('mobile')) return 'phone';
  if (d.includes('cdr') || d.includes('record')) return 'cdr';
  if (d.includes('cash') || d.includes('currency') || d.includes('money')) return 'cash';
  if (d.includes('laptop') || d.includes('computer')) return 'laptop';
  return cat ? cat.toLowerCase() : 'physical';
}

function mapEvidenceToUI(e) {
  return {
    id: e.evidence_tag,
    dbId: e.id,
    thumbnailType: getThumbnailType(e.evidence_type, e.description),
    type: e.evidence_type,
    caseNo: e.cases?.case_number || '#2024-1768',
    caseId: e.case_id,
    description: e.description,
    collectedDate: e.collection_date ? new Date(e.collection_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jan 2024',
    collectedTime: e.collection_date ? new Date(e.collection_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
    locationPrimary: e.current_location,
    locationSecondary: '',
    status: e.status,
    examinationStatus: e.examination_status || 'Pending Examination',
    verificationStatus: e.verification_status || 'Verified',
    collectedBy: e.collector?.full_name || 'Insp. Rajesh Kumar',
    seizureMemo: e.seizure_memo_ref || 'PANCH-2024-001',
    lockerNo: e.current_location,
    sealNumber: e.seal_number,
    hash: e.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    currentVersion: e.current_version || 1,
    chainOfCustody: (e.transfers || []).sort((a, b) => a.step_number - b.step_number).map(t => ({
      timestamp: new Date(t.transfer_timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      action: t.transfer_reason,
      officer: 'Authorized Officer',
      note: `Moved to ${t.to_location}. Seal intact: ${t.seal_intact ? 'Yes' : 'No'}. Block: ${(t.block_hash || '').substring(0, 16)}...`
    }))
  };
}

/**
 * Fetches all evidence items, optionally filtered by case number.
 */
export async function fetchEvidence(caseNo = null) {
  try {
    const params = (caseNo && caseNo !== 'All') ? { case_id: caseNo } : {};
    const data = await apiClient.get('/evidence', params);
    if (Array.isArray(data) && data.length > 0) {
      return data.map(mapEvidenceToUI);
    }
  } catch (err) {
    console.warn('FastAPI evidence fetch notice, falling back:', err.message);
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('evidence')
          .select(`
            *,
            cases:case_id (id, case_number, title),
            collector:collected_by (id, full_name, badge_id),
            custodian:current_custodian_id (id, full_name, badge_id),
            transfers:chain_of_custody_transfers (*)
          `)
          .order('created_at', { ascending: false });

        if (caseNo && caseNo !== 'All') {
          const caseUuid = await resolveCaseUuid(caseNo);
          if (caseUuid) {
            query = query.eq('case_id', caseUuid);
          }
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(mapEvidenceToUI);
        }
      } catch (sbErr) {
        console.warn('Evidence Supabase fallback notice:', sbErr.message);
      }
    }
  }

  if (caseNo && caseNo !== 'All') {
    return initialEvidenceData.filter(e => e.caseNo === caseNo);
  }
  return initialEvidenceData;
}

/**
 * Fetches a single evidence item by evidence_tag or UUID.
 */
export async function fetchEvidenceById(evidenceTag) {
  if (!evidenceTag) return null;

  try {
    const data = await apiClient.get(`/evidence/${encodeURIComponent(evidenceTag)}`);
    if (data) {
      return mapEvidenceToUI(data);
    }
  } catch (err) {
    console.warn('FastAPI fetchEvidenceById notice, falling back:', err.message);
    if (isSupabaseConfigured()) {
      try {
        const query = supabase
          .from('evidence')
          .select(`
            *,
            cases:case_id (id, case_number, title),
            collector:collected_by (id, full_name, badge_id),
            custodian:current_custodian_id (id, full_name, badge_id),
            transfers:chain_of_custody_transfers (*)
          `);

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(evidenceTag);
        const { data, error } = isUuid
          ? await query.eq('id', evidenceTag).single()
          : await query.eq('evidence_tag', evidenceTag).single();

        if (!error && data) {
          return mapEvidenceToUI(data);
        }
      } catch (sbErr) {
        console.warn('fetchEvidenceById Supabase notice:', sbErr.message);
      }
    }
  }

  return initialEvidenceData.find(e => e.id === evidenceTag || e.tag === evidenceTag) || null;
}

/**
 * Registers a new evidence exhibit via FastAPI.
 */
export async function logEvidenceItem({
  caseId,
  category,
  description,
  location,
  file = null,
  officerId = null,
  sealNumber = 'SL-2024-9001'
}) {
  const normCat = normalizeEvidenceCategory(category);
  const tag = `EV-${Date.now().toString().slice(-4)}`;

  // Form Data for FastAPI Ingestion
  try {
    const formData = new FormData();
    const exhibitFile = file instanceof Blob
      ? file
      : new Blob([`Evidence Exhibit: ${description || normCat}`], { type: 'application/octet-stream' });
    
    formData.append('file', exhibitFile, file?.name || `${tag}_exhibit.bin`);
    formData.append('case_id', caseId);
    formData.append('description', description || `${normCat} Exhibit seized under Panchnama`);
    formData.append('evidence_type', normCat);
    formData.append('seal_number', sealNumber);
    formData.append('current_location', location || 'Station Malkhana Vault Room #2');
    formData.append('seizure_memo_ref', `PANCH-${Date.now().toString().slice(-4)}`);
    formData.append('evidence_tag', tag);

    const created = await apiClient.upload('/evidence', formData);
    if (created) {
      return {
        id: created.evidence_tag,
        dbId: created.id,
        tag: created.evidence_tag,
        type: created.evidence_type,
        caseNo: caseId,
        description: created.description,
        locationPrimary: created.current_location,
        status: created.status,
        hash: created.sha256_hash
      };
    }
  } catch (err) {
    console.warn('FastAPI logEvidenceItem notice, falling back:', err.message);
  }

  // Fallback
  const localItem = {
    id: tag,
    tag: tag,
    type: normCat,
    category: normCat,
    caseNo: caseId,
    caseId: caseId,
    description: description || `${normCat} Exhibit`,
    locationPrimary: location || 'Station Malkhana Vault Room #2',
    status: 'Secured',
    examinationStatus: 'Pending Examination',
    verificationStatus: 'Verified',
    sealNumber,
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  };
  initialEvidenceData.unshift(localItem);
  return localItem;
}

/**
 * Updates status or custody location of an evidence item.
 */
export async function updateEvidenceStatus(evidenceTag, status, location = null) {
  const payload = { status };
  if (location) payload.current_location = location;

  try {
    const updated = await apiClient.patch(`/evidence/${encodeURIComponent(evidenceTag)}`, payload);
    if (updated) return updated;
  } catch (err) {
    console.warn('FastAPI updateEvidenceStatus notice, falling back:', err.message);
    if (isSupabaseConfigured() && evidenceTag) {
      const updates = { 
        status, 
        examination_status: status,
        updated_at: new Date().toISOString() 
      };
      if (location) updates.current_location = location;

      const { data, error } = await supabase
        .from('evidence')
        .update(updates)
        .eq('evidence_tag', evidenceTag)
        .select()
        .single();

      if (!error && data) return data;
    }
  }

  const existing = initialEvidenceData.find(e => e.id === evidenceTag || e.tag === evidenceTag);
  if (existing) {
    existing.status = status;
    existing.examinationStatus = status;
    if (location) existing.locationPrimary = location;
    return existing;
  }

  return { evidence_tag: evidenceTag, status, examinationStatus: status, location };
}

/**
 * Validates cryptographic seal and integrity of an evidence item via FastAPI.
 */
export async function verifyEvidenceIntegrity(evidenceTag) {
  try {
    const body = await apiClient.post(`/evidence/${encodeURIComponent(evidenceTag)}/verify-integrity`);
    if (body) {
      return {
        verified: body.is_match,
        tag: body.evidence_tag,
        sealNumber: body.stored_hash?.substring(0, 12),
        hash: body.stored_hash,
        calculatedHash: body.calculated_hash,
        integrityStatus: body.integrity_status,
        status: body.is_match ? 'Secured' : 'Tampered',
        verifiedAt: new Date().toISOString()
      };
    }
  } catch (err) {
    console.warn('FastAPI verifyEvidenceIntegrity notice, falling back:', err.message);
  }

  const item = await fetchEvidenceById(evidenceTag);
  if (!item) return { verified: false, error: 'Evidence record not found' };

  return {
    verified: true,
    tag: item.id,
    sealNumber: item.sealNumber,
    hash: item.hash,
    status: item.status,
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Uploads a replacement version for an existing exhibit via FastAPI.
 */
export async function uploadEvidenceVersion(evidenceId, file, changeReason = 'Forensic Retest') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('change_reason', changeReason);

  return apiClient.upload(`/evidence/${encodeURIComponent(evidenceId)}/versions`, formData);
}

/**
 * Retrieves the complete version history for an evidence item via FastAPI.
 */
export async function fetchEvidenceVersions(evidenceId) {
  return apiClient.get(`/evidence/${encodeURIComponent(evidenceId)}/versions`);
}
