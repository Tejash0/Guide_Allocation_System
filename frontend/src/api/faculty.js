import { apiFetch, BASE as BASE_URL } from './apiClient.js';

const BASE = `${BASE_URL}/faculty`;

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

export async function getAvailableGuides(domain) {
  const url = domain && domain.trim().length > 0
    ? `${BASE}/available?domain=${encodeURIComponent(domain.trim())}`
    : `${BASE}/available`;
  // /available is unauthenticated — no auth header needed
  return apiFetch(url);
}

export async function getFacultyProfile() {
  return apiFetch(`${BASE}/profile`, { headers: authHeaders() });
}

export async function getNotifications() {
  return apiFetch(`${BASE}/notifications`, { headers: authHeaders() });
}

export async function markNotificationsRead() {
  return apiFetch(`${BASE}/notifications/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function updateFacultyProfile(domain) {
  return apiFetch(`${BASE}/profile`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ domain }),
  });
}
