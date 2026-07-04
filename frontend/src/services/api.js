import { API_BASE, AI_BASE } from '../config.js';

export async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error || data.detail || data.message || `Request failed (${response.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  return data;
}

export async function apiRequest(path, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const storedToken = token || localStorage.getItem('token');
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  return parseJsonResponse(response);
}

export async function aiRequest(path, body) {
  const response = await fetch(`${AI_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJsonResponse(response);
}

export { API_BASE, AI_BASE };
