/**
 * api.js
 * Lightweight fetch wrapper for the PurpleVision backend.
 *
 * Usage:
 *   import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api';
 *
 *   // Public endpoint
 *   const data = await apiGet('/api/medical/symptoms');
 *
 *   // Authenticated endpoint — pass the accessToken from AuthContext
 *   const result = await apiPost('/api/admin/rules', payload, { token });
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// ── Core fetch helper ──────────────────────────────────────────────────────
async function request(method, path, body = null, options = {}) {
  const { token, withCredentials = false, signal } = options;

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const init = {
    method,
    headers,
    credentials: withCredentials ? 'include' : 'same-origin',
    signal,
  };

  if (body !== null) init.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, init);

  // Attempt to parse JSON; fall back to plain text for non-JSON responses
  let data;
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    // Normalise the error shape — server may return { message } or { error }
    const message =
      (typeof data === 'object' && (data?.message ?? data?.error)) ||
      `HTTP ${res.status}: ${res.statusText}`;
    const err = new Error(message);
    err.status = res.status;
    err.data   = data;
    throw err;
  }

  return data;
}

// ── Exported methods ───────────────────────────────────────────────────────
export const apiGet    = (path, options)        => request('GET',    path, null,  options);
export const apiPost   = (path, body, options)  => request('POST',   path, body,  options);
export const apiPatch  = (path, body, options)  => request('PATCH',  path, body,  options);
export const apiPut    = (path, body, options)  => request('PUT',    path, body,  options);
export const apiDelete = (path, options)        => request('DELETE', path, null,  options);

/**
 * Convenience: attach the auth token from AuthContext without threading it
 * through every call site.
 *
 * Usage:
 *   const api = authedApi(accessToken);
 *   const profile = await api.get('/api/auth/me');
 */
export function authedApi(token) {
  return {
    get:    (path, opts)        => apiGet(path,    { token, ...opts }),
    post:   (path, body, opts)  => apiPost(path,   body, { token, ...opts }),
    patch:  (path, body, opts)  => apiPatch(path,  body, { token, ...opts }),
    put:    (path, body, opts)  => apiPut(path,    body, { token, ...opts }),
    delete: (path, opts)        => apiDelete(path, { token, ...opts }),
  };
}
