// src/services/apiClient.js
// Centralized FastAPI Client for DocShield
// Manages authentication headers, base URL, timeouts, multipart uploads, and standardized error parsing

import { supabase } from '../lib/supabaseClient.js';

const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' && process.env ? process.env : {});

function resolveApiBaseUrl() {
  const raw = env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const trimmed = String(raw).trim().replace(/\/+$/, '');
  // If the user provided the domain without /api/v1 (e.g. https://docshield-api.onrender.com)
  if (!trimmed.endsWith('/api/v1')) {
    return `${trimmed}/api/v1`;
  }
  return trimmed;
}

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Retrieves the current user's Supabase JWT access token for FastAPI Authorization.
 */
async function getAuthToken() {
  try {
    if (supabase?.auth?.getSession) {
      const { data } = await supabase.auth.getSession();
      return data?.session?.access_token || null;
    }
  } catch (err) {
    console.warn('Failed to retrieve Supabase session token:', err.message);
  }
  return null;
}

/**
 * Core HTTP dispatch engine with authorization, timeout, and unified error handling.
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const timeoutMs = options.timeout || 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = options.token || await getAuthToken();
  const headers = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Parse JSON or text
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errPayload = (typeof data === 'object' && data?.error) ? data.error : {};
      const message = errPayload.message || data?.message || (typeof data === 'string' ? data : `API Error ${response.status}`);
      const code = errPayload.code || (response.status === 401 ? 'UNAUTHORIZED' : response.status === 403 ? 'FORBIDDEN' : response.status === 404 ? 'NOT_FOUND' : 'API_ERROR');
      throw new ApiError(message, response.status, code, errPayload.details || null);
    }

    // Unwrap DocShield StandardResponse if present
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      return data.data;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out after 30 seconds.', 408, 'REQUEST_TIMEOUT');
    }
    throw new ApiError(err.message || 'Network communication failure.', 0, 'NETWORK_ERROR');
  }
}

export const apiClient = {
  get: (endpoint, queryParams = {}, options = {}) => {
    let url = endpoint;
    const cleanParams = Object.entries(queryParams).filter(([_, v]) => v !== undefined && v !== null);
    if (cleanParams.length > 0) {
      const qs = new URLSearchParams(cleanParams).toString();
      url += (url.includes('?') ? '&' : '?') + qs;
    }
    return apiRequest(url, { ...options, method: 'GET' });
  },

  post: (endpoint, body, options = {}) => {
    return apiRequest(endpoint, { ...options, method: 'POST', body });
  },

  patch: (endpoint, body, options = {}) => {
    return apiRequest(endpoint, { ...options, method: 'PATCH', body });
  },

  put: (endpoint, body, options = {}) => {
    return apiRequest(endpoint, { ...options, method: 'PUT', body });
  },

  delete: (endpoint, options = {}) => {
    return apiRequest(endpoint, { ...options, method: 'DELETE' });
  },

  upload: (endpoint, formData, options = {}) => {
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: formData
    });
  }
};

export default apiClient;
