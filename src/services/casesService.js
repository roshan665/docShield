// src/services/casesService.js
// Centralized Data Service for Cases Module
// Routed through FastAPI /api/v1/cases with fallback resilience

import { apiClient } from './apiClient.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { initialCasesData } from '../data/casesData.js';

function isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

function mapCaseToUI(c) {
  return {
    id: c.case_number,
    dbId: c.id,
    title: c.title,
    section: c.section_ipc_bns,
    status: c.status,
    priority: c.priority,
    assignedDate: c.registration_date ? new Date(c.registration_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jan 2024',
    lastUpdated: c.updated_at ? new Date(c.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jan 2024',
    documentsCount: c.documents?.length || 0,
    evidenceCount: c.evidence?.length || 0,
    complainant: c.complainant_name || 'Direct Cognizance',
    station: c.police_station,
    io: c.investigating_officer?.full_name || 'Insp. Rajesh Kumar',
    summary: c.summary || '',
    documents: (c.documents || []).map(d => ({
      id: d.id,
      name: d.document_name,
      type: d.document_type,
      hash: d.sha256_hash,
      status: d.verification_status,
      size: d.file_size_bytes ? `${(d.file_size_bytes / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB',
      date: d.created_at ? new Date(d.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jan 2024'
    })),
    evidence: (c.evidence || []).map(e => ({
      id: e.id,
      tag: e.evidence_tag,
      name: e.description,
      cat: e.evidence_type,
      holder: e.current_location,
      status: e.status,
      seal: e.seal_number,
      hash: e.sha256_hash
    })),
    chargeSheets: c.charge_sheets || [],
    courtFilings: c.court_filings || []
  };
}

/**
 * Resolves the primary key UUID of a case from either a case_number (e.g. #2024-1768) or UUID.
 */
export async function resolveCaseUuid(caseIdentifier) {
  if (!caseIdentifier) return null;
  if (isUUID(caseIdentifier)) return caseIdentifier;

  try {
    const caseData = await apiClient.get(`/cases/${encodeURIComponent(caseIdentifier)}`);
    if (caseData?.id) return caseData.id;
  } catch (e) {
    // Fallback to Supabase if backend unreachable
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('id')
          .eq('case_number', caseIdentifier)
          .maybeSingle();

        if (!error && data?.id) return data.id;
      } catch (err) {
        console.warn('resolveCaseUuid notice:', err.message);
      }
    }
  }
  return null;
}

/**
 * Fetches all cases with child documents and evidence counts.
 */
export async function fetchCases() {
  try {
    const data = await apiClient.get('/cases');
    if (Array.isArray(data) && data.length > 0) {
      return data.map(mapCaseToUI);
    }
  } catch (err) {
    console.warn('FastAPI cases fetch notice, falling back:', err.message);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select(`
            *,
            investigating_officer:investigating_officer_id (id, full_name, badge_id),
            documents:documents(id, document_name, document_type, sha256_hash, verification_status, file_size_bytes, storage_path, created_at),
            evidence:evidence(id, evidence_tag, evidence_type, description, current_location, status, seal_number, sha256_hash, collection_date)
          `)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(mapCaseToUI);
        }
      } catch (sbErr) {
        console.warn('Cases Supabase fallback notice:', sbErr.message);
      }
    }
  }

  return initialCasesData;
}

/**
 * Fetches a single case by its case_number or UUID with deep relations.
 */
export async function fetchCaseById(caseIdentifier) {
  try {
    const data = await apiClient.get(`/cases/${encodeURIComponent(caseIdentifier)}`);
    if (data) {
      return mapCaseToUI(data);
    }
  } catch (err) {
    console.warn('FastAPI fetchCaseById notice, falling back:', err.message);
    if (isSupabaseConfigured()) {
      try {
        const isIdUuid = isUUID(caseIdentifier);
        const query = supabase
          .from('cases')
          .select(`
            *,
            investigating_officer:investigating_officer_id (id, full_name, badge_id),
            assigned_legal:assigned_legal_officer_id (id, full_name),
            assigned_forensic:assigned_forensic_officer_id (id, full_name),
            documents:documents(*),
            evidence:evidence(*),
            charge_sheets:charge_sheets(*),
            court_filings:court_filings(*)
          `);

        const { data, error } = isIdUuid 
          ? await query.eq('id', caseIdentifier).single()
          : await query.eq('case_number', caseIdentifier).single();

        if (!error && data) {
          return mapCaseToUI(data);
        }
      } catch (sbErr) {
        console.warn('fetchCaseById Supabase notice:', sbErr.message);
      }
    }
  }

  return initialCasesData.find(c => c.id === caseIdentifier) || null;
}

/**
 * Registers a new investigation case via FastAPI.
 */
export async function createCase(caseData, officerId = null) {
  const payload = {
    case_number: caseData.id || undefined,
    title: caseData.section ? caseData.section.split(' - ')[1] || caseData.section : 'Investigation Case',
    section_ipc_bns: caseData.section || 'IPC 302 - Homicide',
    status: caseData.status || 'Active',
    priority: caseData.priority || 'Normal',
    complainant_name: caseData.complainant || 'Direct Police Cognizance',
    police_station: caseData.station || 'Bhopal Central Police Station',
    summary: caseData.summary || 'Preliminary investigation initialized under IO purview.',
    investigating_officer_id: officerId || undefined
  };

  try {
    const created = await apiClient.post('/cases', payload);
    if (created) {
      const res = {
        ...caseData,
        id: created.case_number,
        dbId: created.id
      };
      if (!initialCasesData.some(c => c.id === res.id)) {
        initialCasesData.unshift(res);
      }
      return res;
    }
  } catch (err) {
    console.warn('FastAPI createCase notice, falling back:', err.message);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('cases')
          .insert([payload])
          .select()
          .single();

        if (!error && data) {
          const res = {
            ...caseData,
            id: data.case_number,
            dbId: data.id
          };
          if (!initialCasesData.some(c => c.id === res.id)) {
            initialCasesData.unshift(res);
          }
          return res;
        }
      } catch (sbErr) {
        console.warn('createCase Supabase notice:', sbErr.message);
      }
    }
  }

  if (!initialCasesData.some(c => c.id === caseData.id)) {
    initialCasesData.unshift(caseData);
  }
  return caseData;
}

/**
 * Updates case metadata or status via FastAPI.
 */
export async function updateCase(caseIdentifier, updates) {
  const cleanUpdates = { ...updates };
  delete cleanUpdates.io;
  delete cleanUpdates.assignedDate;
  delete cleanUpdates.lastUpdated;
  delete cleanUpdates.documentsCount;
  delete cleanUpdates.evidenceCount;
  delete cleanUpdates.documents;
  delete cleanUpdates.evidence;
  delete cleanUpdates.chargeSheets;
  delete cleanUpdates.courtFilings;

  try {
    const updated = await apiClient.patch(`/cases/${encodeURIComponent(caseIdentifier)}`, cleanUpdates);
    if (updated) return updated;
  } catch (err) {
    console.warn('FastAPI updateCase notice, falling back:', err.message);
    if (isSupabaseConfigured()) {
      try {
        const isIdUuid = isUUID(caseIdentifier);
        const query = supabase.from('cases').update({
          ...cleanUpdates,
          updated_at: new Date().toISOString()
        });

        const { data, error } = isIdUuid
          ? await query.eq('id', caseIdentifier).select().maybeSingle()
          : await query.eq('case_number', caseIdentifier).select().maybeSingle();

        if (!error && data) return data;
      } catch (sbErr) {
        console.warn('updateCase Supabase notice:', sbErr.message);
      }
    }
  }

  const existing = initialCasesData.find(c => c.id === caseIdentifier);
  if (existing) {
    Object.assign(existing, updates);
    return existing;
  }

  return { id: caseIdentifier, ...updates };
}

/**
 * Updates case status ('Active', 'Under Review', 'Closed').
 */
export async function updateCaseStatus(caseNumber, status) {
  return updateCase(caseNumber, { status });
}

/**
 * Assigns an investigating, legal, or forensic officer to a case.
 */
export async function assignCase(caseNumber, assignment) {
  const updates = {};
  if (typeof assignment === 'string') {
    updates.io = assignment;
  } else if (assignment) {
    if (assignment.io) updates.io = assignment.io;
    if (assignment.ioId) updates.investigating_officer_id = assignment.ioId;
    if (assignment.legalId) updates.assigned_legal_officer_id = assignment.legalId;
    if (assignment.forensicId) updates.assigned_forensic_officer_id = assignment.forensicId;
  }

  return updateCase(caseNumber, updates);
}
