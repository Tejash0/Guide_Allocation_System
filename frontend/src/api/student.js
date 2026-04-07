import { apiFetch, BASE as BASE_URL } from './apiClient.js';

const BASE = `${BASE_URL}/student`;

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

export async function getPreference() {
  return apiFetch(`${BASE}/preference`, { headers: headers() });
}

export async function setPreference(faculty_id) {
  return apiFetch(`${BASE}/preference`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ faculty_id }),
  });
}

export async function getInterests() {
  return apiFetch(`${BASE}/interests`, { headers: headers() });
}

export async function saveInterests(interests) {
  return apiFetch(`${BASE}/interests`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ interests }),
  });
}

export async function getProject() {
  return apiFetch(`${BASE}/project`, { headers: headers() });
}

export async function saveProject(project_title, project_description, tech_stack) {
  return apiFetch(`${BASE}/project`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ project_title, project_description, tech_stack }),
  });
}

export async function getStudentNotifications() {
  return apiFetch(`${BASE}/notifications`, { headers: headers() });
}

export async function markStudentNotificationsRead() {
  return apiFetch(`${BASE}/notifications/read`, {
    method: 'PATCH',
    headers: headers(),
  });
}
