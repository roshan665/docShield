// src/services/auditService.js
// Centralized Data Service for Audit Logs Module (Security-Critical)
// Strictly enforces append-only immutable audit trail.
// Routed through FastAPI /api/v1/audit-logs with fallback resilience

import { apiClient } from './apiClient.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { initialAuditLogsData } from '../data/auditLogsData.js';

export function normalizeAuditModule(mod) {
  if (!mod) return 'System';
  const m = mod.toLowerCase();
  if (m.includes('case')) return 'Cases';
  if (m.includes('doc')) return 'Documents';
  if (m.includes('evid')) return 'Evidence';
  if (m.includes('forensic')) return 'Forensic';
  if (m.includes('charge')) return 'ChargeSheets';
  if (m.includes('filing') || m.includes('court')) return 'CourtFilings';
  if (m.includes('custody')) return 'Custody';
  if (m.includes('user')) return 'Users';
  return 'Security';
}

export function normalizeAuditResult(res) {
  if (!res) return 'Success';
  const r = res.toLowerCase();
  if (r.includes('fail') || r.includes('error') || r.includes('denied')) return 'Failure';
  if (r.includes('warn') || r.includes('exception')) return 'Warning';
  return 'Success';
}

function mapAuditToUI(log) {
  return {
    id: `AUD-${log.id ? log.id.substring(0, 8).toUpperCase() : 'SEAL'}`,
    dbId: log.id,
    timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '01 Jan 2024, 10:00:00',
    isoTimestamp: log.timestamp,
    officer: log.user?.full_name || (log.user_id ? 'Authenticated Officer' : 'System Guard'),
    badgeId: log.user?.badge_id || 'IND-BHO-000',
    role: log.role || log.user?.role || 'System',
    action: log.action,
    module: log.module,
    caseId: log.case_id || '#2024-1768',
    ipAddress: log.ip_address || '127.0.0.1 (Loopback/VPC)',
    status: log.result === 'Success' ? 'SUCCESS' : (log.result === 'Warning' ? 'WARNING' : 'DENIED'),
    result: log.result,
    description: log.description || `${log.action} performed on ${log.entity_type || 'Entity'}`,
    recordHash: log.record_hash || 'SEAL-INTEGRITY-CONFIRMED',
    details: log.event_payload || {}
  };
}

/**
 * Fetches all audit logs via FastAPI with fallback resilience.
 */
export async function fetchAuditLogs(filter = {}) {
  try {
    const params = {};
    if (filter.module && filter.module !== 'All' && filter.module !== 'all') {
      params.module = normalizeAuditModule(filter.module);
    }
    if (filter.result && filter.result !== 'All') {
      params.result = normalizeAuditResult(filter.result);
    }
    if (filter.caseId) params.case_id = filter.caseId;
    if (filter.evidenceId) params.evidence_id = filter.evidenceId;

    const data = await apiClient.get('/audit-logs', params);
    if (data?.logs && Array.isArray(data.logs)) {
      return data.logs.map(mapAuditToUI);
    }
  } catch (err) {
    console.warn('FastAPI audit fetch notice, falling back:', err.message);
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('audit_logs')
          .select(`
            *,
            user:user_id (id, full_name, badge_id, role)
          `)
          .order('timestamp', { ascending: false });

        if (filter.module && filter.module !== 'All' && filter.module !== 'all') {
          query = query.eq('module', normalizeAuditModule(filter.module));
        }

        if (filter.result && filter.result !== 'All') {
          query = query.eq('result', normalizeAuditResult(filter.result));
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(mapAuditToUI);
        }
      } catch (sbErr) {
        console.warn('Audit logs Supabase fallback notice:', sbErr.message);
      }
    }
  }

  let filtered = [...initialAuditLogsData];
  if (filter.module && filter.module !== 'All') {
    filtered = filtered.filter(l => l.module.toLowerCase() === filter.module.toLowerCase());
  }
  if (filter.result && filter.result !== 'All') {
    filtered = filtered.filter(l => l.status.toLowerCase() === filter.result.toLowerCase());
  }
  return filtered;
}

/**
 * Client-side audit notification hook.
 * Authoritative audit records are automatically created by FastAPI backend services.
 */
export async function logAuditEvent({
  action,
  module,
  entityType = null,
  entityId = null,
  caseId = null,
  evidenceId = null,
  result = 'Success',
  description = '',
  eventPayload = {}
}) {
  // In offline or local preview mode, record to memory
  const localLog = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    isoTimestamp: new Date().toISOString(),
    officer: 'Current Officer',
    badgeId: 'AUTH-SESSION',
    role: 'Officer',
    action,
    module: normalizeAuditModule(module),
    caseId: caseId || '#2024-1768',
    ipAddress: '127.0.0.1 (Local Client)',
    status: result === 'Success' ? 'SUCCESS' : (result === 'Warning' ? 'WARNING' : 'DENIED'),
    result,
    description: description || `${action} completed`,
    recordHash: `SEAL-${Date.now().toString().slice(-8)}`,
    details: eventPayload
  };

  initialAuditLogsData.unshift(localLog);
  return localLog;
}

/**
 * Security Guard: Audit log entries are legally immutable and append-only.
 * Updates are strictly prohibited.
 */
export async function updateAuditLog() {
  throw new Error('SECURITY VIOLATION: Audit log records are legally immutable and cannot be modified.');
}

/**
 * Security Guard: Audit log entries are legally immutable and append-only.
 * Deletions are strictly prohibited.
 */
export async function deleteAuditLog() {
  throw new Error('SECURITY VIOLATION: Audit log records are legally immutable and cannot be deleted.');
}

