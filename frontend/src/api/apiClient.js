const BASE = 'http://localhost:3001/api';

export async function apiFetch(url, options = {}) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    return { ok: false, error: 'Network error' };
  }

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return { ok: false, error: 'Session expired. Please log in again.' };
  }

  let json;
  try {
    json = await res.json();
  } catch {
    return { ok: false, error: 'Unexpected server response' };
  }

  // Array responses (e.g. /faculty/available) can't be spread into an object
  if (Array.isArray(json)) return json;
  return { ok: res.ok, ...json };
}

export { BASE };
