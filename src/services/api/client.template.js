/**
 * Template for the future API client.
 * NOT imported by the current app — kept as a reference.
 * Copy to `client.js` when wiring a real backend.
 */
export class ApiError extends Error {
  constructor(payload, status) {
    super(payload?.message || `HTTP ${status}`);
    this.payload = payload;
    this.status = status;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const getToken = () => sessionStorage.getItem('ezy.token'); // NEVER in this phase

export const request = async (method, path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let payload = null;
    try { payload = await res.json(); } catch { /* non-JSON error */ }
    throw new ApiError(payload, res.status);
  }
  return res.status === 204 ? null : res.json();
};

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
};