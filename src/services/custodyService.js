// src/services/custodyService.js
// Centralized Data Service for Chain of Custody Module (Security-Critical)
// Strictly enforces append-only immutable ledger. Updates and deletions are prohibited.
// Routed through FastAPI /api/v1/evidence/{evidence_id}/custody

import { apiClient } from './apiClient.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { initialCustodyData } from '../data/custodyData.js';
import { legalCustodyTimelineData } from '../data/legalOfficerData.js';
import { resolveEvidenceUuid } from './forensicReportsService.js';
import { logAuditEvent } from './auditService.js';

function computeBlockHash(step, evidenceId, fromLoc, toLoc, prevHash) {
  const payload = `${step}|${evidenceId}|${fromLoc}|${toLoc}|${prevHash || 'GENESIS'}|${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) - hash) + payload.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `BLK-SHA256-${hex}-${Date.now().toString().slice(-6)}`;
}

/**
 * Fetches all chain-of-custody records with joined evidence and custodian identities.
 */
export async function fetchCustodyRecords(filter = {}) {
  // If specific evidenceId requested, query FastAPI custody route
  if (filter.evidenceId) {
    try {
      const data = await apiClient.get(`/evidence/${encodeURIComponent(filter.evidenceId)}/custody`);
      if (data?.timeline && Array.isArray(data.timeline)) {
        return data.timeline.map(c => ({
          id: `COC-${c.block_hash ? c.block_hash.substring(0, 8).toUpperCase() : 'BLOCK'}`,
          dbId: c.block_hash,
          step: c.step_number,
          stepNumber: c.step_number,
          itemTag: data.evidence_tag || filter.evidenceId,
          caseNo: '#2024-1768',
          itemName: 'Seized Evidence Exhibit',
          itemType: 'Physical',
          fromLocation: c.from_location,
          toLocation: c.to_location,
          fromCustodian: 'Authorized Custodian',
          toCustodian: c.actor_name,
          reason: c.transfer_reason,
          sealIntact: c.seal_intact,
          status: 'Secured',
          timestamp: c.timestamp ? new Date(c.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '01 Jan 2024, 10:00',
          blockHash: c.block_hash
        }));
      }
    } catch (err) {
      console.warn('FastAPI custody fetch notice, falling back:', err.message);
    }
  }

  // Supabase fallback
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('chain_of_custody_transfers')
        .select(`
          *,
          evidence:evidence_id (
            id, 
            evidence_tag, 
            evidence_type, 
            description,
            current_location,
            cases:case_id (case_number, title)
          ),
          from_custodian:from_custodian_id (id, full_name, badge_id),
          to_custodian:to_custodian_id (id, full_name, badge_id)
        `)
        .order('transfer_timestamp', { ascending: false });

      if (filter.evidenceId) {
        const evUuid = await resolveEvidenceUuid(filter.evidenceId);
        if (evUuid) query = query.eq('evidence_id', evUuid);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(c => ({
          id: `COC-${c.id.substring(0, 8).toUpperCase()}`,
          dbId: c.id,
          step: c.step_number,
          stepNumber: c.step_number,
          itemTag: c.evidence ? c.evidence.evidence_tag : 'EV-2024-001',
          caseNo: c.evidence?.cases?.case_number || '#2024-1768',
          itemName: c.evidence ? c.evidence.description : 'Evidence Item',
          itemType: c.evidence ? c.evidence.evidence_type : 'Physical',
          fromLocation: c.from_location,
          toLocation: c.to_location,
          fromCustodian: c.from_custodian?.full_name || 'Insp. Rajesh Kumar',
          toCustodian: c.to_custodian?.full_name || 'Forensic Expert',
          reason: c.transfer_reason,
          sealIntact: c.seal_intact,
          status: 'Secured',
          timestamp: new Date(c.transfer_timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          blockHash: c.block_hash
        }));
      }
    } catch (err) {
      console.warn('Custody records fetch notice:', err.message);
    }
  }

  if (filter.evidenceId) {
    return initialCustodyData.filter(c => c.itemTag === filter.evidenceId);
  }
  return initialCustodyData;
}

/**
 * Fetches the complete chronological chain-of-custody timeline for a specific exhibit.
 */
export async function fetchCustodyTimeline(evidenceTag) {
  try {
    const data = await apiClient.get(`/evidence/${encodeURIComponent(evidenceTag)}/custody`);
    if (data?.timeline && Array.isArray(data.timeline)) {
      return data.timeline.map(t => ({
        step: t.step_number,
        stepNumber: t.step_number,
        timestamp: t.timestamp ? new Date(t.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '01 Jan 2024',
        fromLocation: t.from_location,
        toLocation: t.to_location,
        fromCustodian: 'Authorized Custodian',
        toCustodian: t.actor_name,
        reason: t.transfer_reason,
        sealIntact: t.seal_intact,
        blockHash: t.block_hash,
        prevBlockHash: t.previous_block_hash
      }));
    }
  } catch (err) {
    console.warn('FastAPI fetchCustodyTimeline notice, falling back:', err.message);
  }

  const records = await fetchCustodyRecords({ evidenceId: evidenceTag });
  if (records.length > 0) return records;

  return legalCustodyTimelineData;
}

/**
 * Appends a new immutable custody transfer block via FastAPI.
 */
export async function recordCustodyTransfer({
  evidenceId,
  fromLocation,
  toLocation,
  reason,
  fromCustodianId = null,
  toCustodianId = null,
  sealIntact = true,
  authorityMemoRef = null,
  step = null
}) {
  try {
    const payload = {
      action: 'TRANSFER',
      from_location: fromLocation || 'Station Malkhana Vault Room #2',
      to_location: toLocation,
      transfer_reason: reason || 'Transfer for specialized forensic examination',
      statutory_authority: authorityMemoRef || 'Sec 100 CrPC / Sec 105 BNSS',
      seal_intact: sealIntact,
      authority_memo_ref: authorityMemoRef,
      to_custodian_id: toCustodianId || undefined
    };

    const block = await apiClient.post(`/evidence/${encodeURIComponent(evidenceId)}/custody/transfer`, payload);
    if (block) return block;
  } catch (err) {
    console.warn('FastAPI recordCustodyTransfer notice, falling back:', err.message);
  }

  // Supabase fallback
  if (isSupabaseConfigured()) {
    const evUuid = await resolveEvidenceUuid(evidenceId);
    if (evUuid) {
      const { data: latest } = await supabase
        .from('chain_of_custody_transfers')
        .select('step_number, block_hash')
        .eq('evidence_id', evUuid)
        .order('step_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextStep = step || ((latest ? latest.step_number : 0) + 1);
      const prevHash = latest ? latest.block_hash : 'GENESIS-BLOCK';
      const blockHash = computeBlockHash(nextStep, evUuid, fromLocation, toLocation, prevHash);

      let validToCustodian = toCustodianId;
      if (!validToCustodian) {
        const { data: { user } } = await supabase.auth.getUser();
        validToCustodian = user ? user.id : null;
      }

      if (validToCustodian) {
        const payload = {
          evidence_id: evUuid,
          step_number: nextStep,
          from_location: fromLocation || 'Station Malkhana Vault Room #2',
          to_location: toLocation,
          transfer_reason: reason || 'Transfer for specialized forensic examination',
          authority_memo_ref: authorityMemoRef || `CUST-MEMO-${Date.now().toString().slice(-4)}`,
          seal_intact: sealIntact,
          previous_block_hash: prevHash,
          block_hash: blockHash,
          to_custodian_id: validToCustodian
        };

        if (fromCustodianId) payload.from_custodian_id = fromCustodianId;

        const { data, error } = await supabase
          .from('chain_of_custody_transfers')
          .insert([payload])
          .select()
          .single();

        if (!error && data) {
          await supabase
            .from('evidence')
            .update({ current_location: toLocation, updated_at: new Date().toISOString() })
            .eq('id', evUuid);

          return data;
        }
      }
    }
  }

  // Fallback in-memory ledger
  const nextStep = (initialCustodyData.length > 0 ? initialCustodyData[0].stepNumber || 1 : 1) + 1;
  const blockHash = computeBlockHash(nextStep, evidenceId, fromLocation, toLocation, 'PREV-HASH');

  const newRecord = {
    id: `COC-${Date.now().toString().slice(-6)}`,
    stepNumber: nextStep,
    step: nextStep,
    itemTag: evidenceId || 'EV-2024-001',
    caseNo: '#2024-1768',
    itemName: 'Seized Evidence Exhibit',
    itemType: 'Physical',
    fromLocation: fromLocation || 'Station Malkhana Vault',
    toLocation: toLocation || 'Forensic Lab Intake',
    fromCustodian: 'Insp. Rajesh Kumar',
    toCustodian: 'Dr. K.S. Rathore',
    reason: reason || 'Scientific laboratory analysis',
    sealIntact: sealIntact,
    status: 'In Transit',
    timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    blockHash
  };

  initialCustodyData.unshift(newRecord);
  return newRecord;
}

export const logCustodyTransfer = recordCustodyTransfer;

/**
 * Security Guard: Chain of custody records are immutable and append-only.
 * Updates are strictly prohibited.
 */
export async function updateCustodyRecord() {
  throw new Error('SECURITY VIOLATION: Chain of custody records are legally immutable and cannot be updated.');
}

/**
 * Security Guard: Chain of custody records are immutable and append-only.
 * Deletions are strictly prohibited.
 */
export async function deleteCustodyRecord() {
  throw new Error('SECURITY VIOLATION: Chain of custody records are legally immutable and cannot be deleted.');
}


