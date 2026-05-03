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

export async function setFacultyAvailability(is_available) {
  return apiFetch(`${BASE}/availability`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ is_available }),
  });
}

export async function getMyProblemStatements() {
  return apiFetch(`${BASE}/problem-statements`, { headers: authHeaders() });
}

export async function addProblemStatement(statement) {
  return apiFetch(`${BASE}/problem-statements`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ statement }),
  });
}

export async function deleteProblemStatement(id) {
  return apiFetch(`${BASE}/problem-statements/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function getFacultyProblemStatements(facultyId) {
  return apiFetch(`${BASE}/${facultyId}/problem-statements`);
}

export async function getMyStudents() {
  return apiFetch(`${BASE}/my-students`, { headers: authHeaders() });
}

export async function getStudentComments(studentId) {
  return apiFetch(`${BASE}/students/${studentId}/comments`, { headers: authHeaders() });
}

export async function addStudentComment(studentId, comment) {
  return apiFetch(`${BASE}/students/${studentId}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ comment }),
  });
}
