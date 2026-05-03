const BASE_URL = 'http://localhost:3001/api/admin';

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

export async function getStats() {
  const res = await fetch(`${BASE_URL}/stats`, { headers: headers() });
  return res.json();
}

export async function getStudents() {
  const res = await fetch(`${BASE_URL}/students`, { headers: headers() });
  return res.json();
}

export async function getFaculty() {
  const res = await fetch(`${BASE_URL}/faculty`, { headers: headers() });
  return res.json();
}

export async function approveFaculty(id) {
  const res = await fetch(`${BASE_URL}/faculty/${id}/approve`, { method: 'POST', headers: headers() });
  return res.json();
}

export async function removeFaculty(id) {
  const res = await fetch(`${BASE_URL}/faculty/${id}`, { method: 'DELETE', headers: headers() });
  return res.json();
}

export async function assignSlots(id, max_teams) {
  const res = await fetch(`${BASE_URL}/faculty/${id}/slots`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ max_teams }),
  });
  return res.json();
}

export async function setStudentMaxGuides(id, max_guides) {
  const res = await fetch(`${BASE_URL}/students/${id}/max-guides`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ max_guides }),
  });
  return res.json();
}

export async function bulkSetMaxGuides(max_guides, student_id_prefix = '') {
  const res = await fetch(`${BASE_URL}/students/bulk/max-guides`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ max_guides, student_id_prefix }),
  });
  return res.json();
}
