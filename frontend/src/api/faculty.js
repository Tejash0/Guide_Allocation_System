const BASE_URL = 'http://localhost:3001/api/faculty';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

export async function getAvailableGuides(domain) {
  const url = domain && domain.trim().length > 0
    ? `${BASE_URL}/available?domain=${encodeURIComponent(domain.trim())}`
    : `${BASE_URL}/available`;
  const res = await fetch(url);
  return res.json();
}

export async function getFacultyProfile() {
  const res = await fetch(`${BASE_URL}/profile`, { headers: authHeaders() });
  return res.json();
}

export async function getNotifications() {
  const res = await fetch(`${BASE_URL}/notifications`, { headers: authHeaders() });
  return res.json();
}

export async function markNotificationsRead() {
  const res = await fetch(`${BASE_URL}/notifications/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return res.json();
}

export async function updateFacultyProfile(domain) {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ domain }),
  });
  return res.json();
}
