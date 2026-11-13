// ชั้นกลางสำหรับคุยกับ Go API (หรือ mock server ที่พอร์ต 4000)
// ต่างจาก tmdb.js ตรงที่มี POST / PUT / DELETE และต้องแนบ token สำหรับ endpoint ที่ต้อง login

// '' = origin เดียวกับหน้าเว็บ; CRA proxy /api ไปที่ Go บน localhost:8080
// สำหรับ production ตั้ง REACT_APP_API_URL เป็น URL ของ Go API
const BASE = process.env.REACT_APP_API_URL || '';


// ฟังก์ชันเดียวที่ fetch จริง ทุกฟังก์ชันด้านล่างเรียกผ่านตัวนี้
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };   // 1) บอก server ว่า body เป็น JSON
  if (token) headers.Authorization = `Bearer ${token}`;      //    และแนบบัตรผ่านถ้ามี

  const res = await fetch(BASE + path, {                     // 2) ยิงจริง
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,           //    object ต้องแปลงเป็นข้อความก่อนส่ง
  });

  if (res.status === 204) return null;                       // 3) ลบสำเร็จ ไม่มี body ให้อ่าน

  const data = await res.json()                              //    อ่านคำตอบเป็น JSON
    .catch(() => ({ error: 'server ไม่ได้ตอบเป็น JSON' }));
  if (!res.ok) {                                             // 4) 400 / 401 / 404 / 409 มาลงตรงนี้
    /*const err = new Error(
      data.error?.message ??
      data.error ??
      `server ตอบกลับ ${res.status}`
    );*/


    const err = new Error(data.error?.message ?? data.error ?? `server ตอบกลับ ${res.status}`);
    err.status = res.status;                                 //    แนบเลขไว้ให้หน้าเว็บใช้ต่อ
    err.code = data.error?.code;
    throw err;
  }
  return data;
}

// ---------- สมาชิก ----------
export function register(email, password, displayName) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { email, password, displayName } });
}
export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });   // ได้ { token, member }
}
export function getMe(token) {
  return apiFetch('/api/users/me', { token });
}
export function updateProfile(fields, token) {
  return apiFetch('/api/users/me', { method: 'PUT', body: fields, token });
}


// ---------- หลังบ้าน (ทุกตัวต้องแนบ token ของ admin ถ้าเป็น member Go ตอบ 403) ----------
export function getAdminStats(token) {
  return apiFetch('/api/admin/dashboard', { token });
}
export async function getAdminMembers(token) {
  const data = await apiFetch('/api/admin/users', { token });
  return data.items;
}
export function setMemberRole(memberId, role, token) {
  return apiFetch(`/api/admin/users/${memberId}/role`, { method: 'PUT', body: { role }, token });
}

// ---------- เกมและคลังคีย์ ----------
export async function getGames({ q = '', genre = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (genre) params.set('genre', genre);
  const query = params.toString();
  const suffix = query ? `?${query}` : '';
  const data = await apiFetch(`/api/games${suffix}`);
  return data.items;
}
export function getGame(gameId) {
  return apiFetch(`/api/games/${gameId}`);
}
export function createGame(fields, token) {
  return apiFetch('/api/admin/games', { method: 'POST', body: fields, token });
}
export function updateGame(gameId, fields, token) {
  return apiFetch(`/api/admin/games/${gameId}`, { method: 'PUT', body: fields, token });
}
export function deleteGame(gameId, token) {
  return apiFetch(`/api/admin/games/${gameId}`, { method: 'DELETE', token });
}
export async function getGameKeys(gameId, token) {
  const data = await apiFetch(`/api/admin/games/${gameId}/keys`, { token });
  return data.items;
}
export async function addGameKeys(gameId, keys, token) {
  const data = await apiFetch(`/api/admin/games/${gameId}/keys`, {
    method: 'POST', body: { keys }, token,
  });
  return data.items;
}
export function deleteGameKey(gameId, keyId, token) {
  return apiFetch(`/api/admin/games/${gameId}/keys/${keyId}`, { method: 'DELETE', token });
}
export function buyGame(gameId, quantity, token) {
  return apiFetch('/api/game-orders', { method: 'POST', body: { gameId, quantity }, token });
}
export async function getGameOrders(token) {
  const data = await apiFetch('/api/users/me/game-orders', { token });
  return data.items;
}
export async function getAdminGameOrders(token) {
  const data = await apiFetch('/api/admin/game-orders', { token });
  return data.items;
}
