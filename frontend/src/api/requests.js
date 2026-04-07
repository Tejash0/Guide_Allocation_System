import { apiFetch, BASE as BASE_URL } from './apiClient.js';

const BASE = `${BASE_URL}/requests`;

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

export async function sendRequest(faculty_id) {
  return apiFetch(`${BASE}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ faculty_id }),
  });
}

export async function getMyRequests() {
  return apiFetch(`${BASE}/my`, { headers: headers() });
}

export async function getIncomingRequests() {
  return apiFetch(`${BASE}/incoming`, { headers: headers() });
}

export async function updateRequestStatus(requestId, status) {
  return apiFetch(`${BASE}/${requestId}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  });
}

export async function withdrawRequest(requestId) {
  return apiFetch(`${BASE}/${requestId}`, {
    method: 'DELETE',
    headers: headers(),
  });
}
