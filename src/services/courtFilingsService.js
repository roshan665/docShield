// src/services/courtFilingsService.js
// Centralized Data Service for Court Filings Module
// Routed through FastAPI /api/v1/court-filings with fallback resilience

import { apiClient } from './apiClient.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { initialCourtFilingsData } from '../data/courtFilingsData.js';
import { legalCourtFilingsList } from '../data/legalOfficerData.js';
import { resolveCaseUuid } from './casesService.js';
import { logAuditEvent } from './auditService.js';

export function normalizeFilingType(type) {
  if (!type) return 'Charge Sheet';
  const t = type.toLowerCase();
  if (t.includes('bail')) return 'Bail Application';
  if (t.includes('remand')) return 'Remand Extension';
  if (t.includes('diary')) return 'Case Diary Production';
  if (t.includes('order')) return 'Judicial Orders';
  return 'Charge Sheet';
}

export function normalizeFilingStatus(status) {
  if (!status) return 'Filed';
  const s = status.toLowerCase();
  if (s.includes('dispose') || s.includes('close') || s.includes('decide')) return 'Disposed';
  if (s.includes('review') || s.includes('pending')) return 'Under Review';
  if (s.includes('draft')) return 'Draft';
  return 'Filed';
}

function mapFilingToUI(cf) {
  return {
    id: cf.filing_number || `CF-${cf.id ? cf.id.substring(0, 8) : '2024'}`,
    dbId: cf.id,
    name: cf.title || `Court Filing - ${cf.filing_type}`,
    title: cf.title,
    type: cf.filing_type,
    filingType: cf.filing_type,
    caseNo: cf.case ? cf.case.case_number : (cf.case_number || '#2024-1768'),
    caseId: cf.case ? cf.case.case_number : (cf.case_number || '#2024-1768'),
    court: cf.court_name,
    courtName: cf.court_name,
    judge: cf.judge_name || 'Hon. Additional Sessions Judge',
    docketNumber: cf.docket_number || `DOC-MP-${cf.filing_number || '2024'}`,
    status: cf.status,
    filingStatus: cf.status,
    filingDate: cf.filing_date ? new Date(cf.filing_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jan 2024',
    dateFiled: cf.filing_date ? new Date(cf.filing_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jan 2024',
    nextHearing: cf.next_hearing_date ? `${cf.next_hearing_date} ${cf.next_hearing_time || '10:30 AM'}` : 'To Be Scheduled',
    nextHearingDate: cf.next_hearing_date || 'Pending Schedule',
    notes: cf.notes || 'Document filed before the bench under statutory seal.'
  };
}

/**
 * Fetches all court filings with joined case details.
 */
export async function fetchCourtFilings(filter = {}) {
  try {
    const params = {};
    if (filter.caseId) params.case_id = filter.caseId;
    if (filter.status && filter.status !== 'All') params.status = normalizeFilingStatus(filter.status);

    const data = await apiClient.get('/court-filings', params);
    if (Array.isArray(data) && data.length > 0) {
      return data.map(mapFilingToUI);
    }
  } catch (err) {
    console.warn('FastAPI court filings fetch notice, falling back:', err.message);
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('court_filings')
          .select(`
            *,
            case:case_id (id, case_number, title)
          `)
          .order('filing_date', { ascending: false });

        if (filter.caseId) {
          const caseUuid = await resolveCaseUuid(filter.caseId);
          if (caseUuid) query = query.eq('case_id', caseUuid);
        }

        if (filter.status && filter.status !== 'All') {
          query = query.eq('status', normalizeFilingStatus(filter.status));
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(mapFilingToUI);
        }
      } catch (sbErr) {
        console.warn('fetchCourtFilings Supabase fallback notice:', sbErr.message);
      }
    }
  }

  if (filter.role === 'legal') {
    return legalCourtFilingsList;
  }
  return initialCourtFilingsData;
}

/**
 * Fetches a single court filing by identifier.
 */
export async function fetchCourtFilingById(filingIdentifier) {
  if (!filingIdentifier) return null;

  try {
    const data = await apiClient.get(`/court-filings/${encodeURIComponent(filingIdentifier)}`);
    if (data) return mapFilingToUI(data);
  } catch (err) {
    console.warn('FastAPI fetchCourtFilingById notice, falling back:', err.message);
  }

  const all = await fetchCourtFilings();
  return all.find(cf => cf.id === filingIdentifier || cf.dbId === filingIdentifier) || null;
}

/**
 * Submits a new formal judicial court filing via FastAPI.
 */
export async function createCourtFiling(filingData) {
  const normType = normalizeFilingType(filingData.type || filingData.filingType);
  const normStatus = normalizeFilingStatus(filingData.status);

  try {
    const payload = {
      case_id: filingData.caseId || filingData.caseNo,
      court_name: filingData.court || filingData.courtName || 'Sessions Court, Bhopal Bench',
      judge_name: filingData.judge || 'Hon. Additional Sessions Judge',
      filing_type: normType,
      title: filingData.name || filingData.title || `Judicial Filing: ${normType}`,
      docket_number: filingData.docketNumber,
      status: normStatus,
      notes: filingData.notes || 'Formal memorandum submitted under statutory certification.',
      next_hearing_date: filingData.nextHearingDate !== 'Pending Schedule' ? filingData.nextHearingDate : undefined
    };

    const created = await apiClient.post('/court-filings', payload);
    if (created) {
      return {
        ...filingData,
        id: created.filing_number,
        dbId: created.id,
        status: created.status
      };
    }
  } catch (err) {
    console.warn('FastAPI createCourtFiling notice, falling back:', err.message);
  }

  // Fallback
  const filingNumber = filingData.filingNumber || `CF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const fallbackItem = {
    ...filingData,
    id: filingNumber,
    filingNumber,
    status: normStatus
  };

  initialCourtFilingsData.unshift(fallbackItem);
  return fallbackItem;
}

/**
 * Updates status or hearing details for a court filing via FastAPI.
 */
export async function updateCourtFilingStatus(filingIdentifier, newStatus, notes = null, nextHearingDate = null, nextHearingTime = null) {
  const normStatus = normalizeFilingStatus(newStatus);

  try {
    const updated = await apiClient.patch(`/court-filings/${encodeURIComponent(filingIdentifier)}/status`, {
      status: normStatus,
      notes,
      next_hearing_date: nextHearingDate,
      next_hearing_time: nextHearingTime
    });
    if (updated) return mapFilingToUI(updated);
  } catch (err) {
    console.warn('FastAPI updateCourtFilingStatus notice, falling back:', err.message);
  }

  const existing = initialCourtFilingsData.find(cf => cf.id === filingIdentifier) ||
                   legalCourtFilingsList.find(cf => cf.id === filingIdentifier);
  if (existing) {
    existing.status = normStatus;
    existing.filingStatus = normStatus;
    if (notes) existing.notes = notes;
    if (nextHearingDate) existing.nextHearingDate = nextHearingDate;
    return existing;
  }

  return { id: filingIdentifier, status: normStatus };
}
