const BASE_URL = 'http://localhost:3001/api/student';

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

export async function getPreference() {
  const res = await fetch(`${BASE_URL}/preference`, { headers: headers() });
  return res.json();
}

export async function setPreference(faculty_id) {
  const res = await fetch(`${BASE_URL}/preference`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ faculty_id }),
  });
  return res.json();
}

export async function getInterests() {
  const res = await fetch(`${BASE_URL}/interests`, { headers: headers() });
  return res.json();
}

export async function saveInterests(interests) {
  const res = await fetch(`${BASE_URL}/interests`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ interests }),
  });
  return res.json();
}

export async function getProject() {
  const res = await fetch(`${BASE_URL}/project`, { headers: headers() });
  return res.json();
}

export async function saveProject(project_title, project_description, tech_stack) {
  const res = await fetch(`${BASE_URL}/project`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ project_title, project_description, tech_stack }),
  });
  return res.json();
}

export async function getStudentNotifications() {
  const res = await fetch(`${BASE_URL}/notifications`, { headers: headers() });
  return res.json();
}

export async function markStudentNotificationsRead() {
  const res = await fetch(`${BASE_URL}/notifications/read`, {
    method: 'PATCH',
    headers: headers(),
  });
  return res.json();
}
