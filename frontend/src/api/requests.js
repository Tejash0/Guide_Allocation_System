const BASE_URL = 'http://localhost:3001/api/requests';

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

export async function sendRequest(faculty_id) {
  const res = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ faculty_id }),
  });
  return res.json();
}

export async function getMyRequests() {
  const res = await fetch(`${BASE_URL}/my`, { headers: headers() });
  return res.json();
}

export async function getIncomingRequests() {
  const res = await fetch(`${BASE_URL}/incoming`, { headers: headers() });
  return res.json();
}
