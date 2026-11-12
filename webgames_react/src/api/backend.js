// ชั้นกลางสำหรับคุยกับ Go API
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
    const err = new Error(data.error?.message ?? data.error ?? `server ตอบกลับ ${res.status}`);
    err.status = res.status;                                 //    แนบเลขไว้ให้หน้าเว็บใช้ต่อ
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

// ---------- รีวิว ----------
export function getReviews(movieId) {
  return apiFetch(`/api/movies/${movieId}/reviews`);                                   // ได้ { items }
}
export function postReview(movieId, text, token) {
  return apiFetch(`/api/movies/${movieId}/reviews`, { method: 'POST', body: { text }, token });
}

// ---------- คะแนน ----------
export function putVote(movieId, score, token) {
  return apiFetch(`/api/movies/${movieId}/vote`, { method: 'PUT', body: { score }, token });
}

// ---------- Wishlist ----------
export function getWishlist(token) {
  return apiFetch('/api/me/wishlist', { token });                                       // ได้ { items }
}
export function addToWishlist(movieId, token) {
  return apiFetch(`/api/me/wishlist/${movieId}`, { method: 'PUT', token });
}
export function removeFromWishlist(movieId, token) {
  return apiFetch(`/api/me/wishlist/${movieId}`, { method: 'DELETE', token });
}

function toGame(coupon) {
  const price = Number(coupon.price ?? 0);
  return {
    id: coupon.package_id ?? coupon.id,
    title: coupon.title ?? '',
    titleTh: '',
    detail: coupon.description ?? '',
    genre: coupon.game_name ?? 'Digital Key',
    platform: 'Digital Key',
    region: 'Global',
    poster: '',
    price,
    discountPrice: price,
    discount: 0,
    rating: 0,
    maxPerUser: Number(coupon.max_per_user ?? 1),
    availableCount: coupon.available_count == null ? null : Number(coupon.available_count),
    isActive: coupon.is_active ?? true
  };
}

export async function getCoupons() {
  const data = await apiFetch('/api/coupons');
  return (data.items ?? []).map(toGame);
}

export async function searchCoupons(query) {
  const data = await apiFetch(`/api/coupons/search?q=${encodeURIComponent(query)}`);
  return (data.items ?? []).map(toGame);
}

export async function getCoupon(packageId) {
  return toGame(await apiFetch(`/api/coupons/${packageId}`));
}

export function buyCoupon(packageId, token) {
  return apiFetch(`/api/coupons/${packageId}/buy`, { method: 'POST', token });
}

export async function getMyOrders(token) {
  const orders = await apiFetch('/api/users/me/orders', { token });
  return orders.map((order) => ({
    orderId: order.order_id,
    gameName: order.game_name,
    title: order.title,
    couponCode: order.coupon_code,
    totalPrice: Number(order.purchase_price),
    date: order.purchased_at
  }));
}

export async function getAdminOrders(token) {
  const data = await apiFetch('/api/admin/orders', { token });
  return (data.items ?? []).map((order) => ({
    orderId: order.order_id,
    userId: order.user_id,
    username: order.user?.username ?? order.user?.Username ?? '',
    gameName: order.game_name,
    title: order.title,
    couponCode: order.coupon_code,
    totalPrice: Number(order.purchase_price),
    date: order.purchased_at
  }));
}

// Keep older page imports working while returning the current game-key products.
export const getMovies = getCoupons;
export const getMovie = getCoupon;

export async function getAdminStats(token) {
  const data = await apiFetch('/api/admin/stats', { token });
  const stats = data.items ?? data;
  return {
    coupons: Number(stats.coupons ?? 0),
    users: Number(stats.users ?? 0),
    admins: Number(stats.admins ?? 0),
    orders: Number(stats.orders ?? stats.Orders ?? 0),
    totals: Number(stats.totals ?? stats.Totals ?? 0),
    newestUsers: stats.newestUsers ?? [],
    topCoupons: stats.topCoupon ?? []
  };
}

function toMember(user) {
  return {
    ...user,
    displayName: user.displayName ?? user.username ?? '',
    role: user.role === 'customer' ? 'member' : user.role
  };
}

export async function getAdminMembers(token) {
  const data = await apiFetch('/api/admin/users', { token });
  return (data.items ?? []).map(toMember);
}
export function setMemberRole(memberId, role, token) {
  return apiFetch(`/api/admin/users/${memberId}/role`, {
    method: 'PUT',
    body: { role: role === 'member' ? 'customer' : role },
    token
  }).then(toMember);
}

export async function getAdminCoupons(token) {
  const data = await apiFetch('/api/admin/coupons', { token });
  return (data.items ?? []).map(toGame);
}

export async function getAdminCoupon(packageId, token) {
  return toGame(await apiFetch(`/api/admin/coupons/${packageId}`, { token }));
}

export function createCoupon(fields, token) {
  return apiFetch('/api/admin/coupons', { method: 'POST', body: fields, token });
}

export function updateCoupon(packageId, fields, token) {
  return apiFetch(`/api/admin/coupons/${packageId}`, { method: 'PUT', body: fields, token });
}

export function deleteCoupon(packageId, token) {
  return apiFetch(`/api/admin/coupons/${packageId}`, { method: 'DELETE', token });
}

