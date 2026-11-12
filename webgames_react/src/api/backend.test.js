import {
  apiFetch,
  buyCoupon,
  getAdminMembers,
  getCoupons,
  getMe,
  getMyOrders,
  login,
  register,
  setMemberRole
} from './backend';

// ตัวช่วยสร้าง "คำตอบปลอม" ของ fetch: ใส่แค่ status กับ body ที่อยากให้ server ตอบ
function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,          // fetch ของจริงคำนวณ ok แบบนี้
    status,
    json: () => Promise.resolve(body),         // res.json() คืน Promise เสมอ
  };
}

beforeEach(() => {
  // แทน fetch ของเบราว์เซอร์ด้วยฟังก์ชันปลอมที่เราควบคุมคำตอบได้ และจดทุกครั้งที่ถูกเรียก
  global.fetch = jest.fn();
});

test('GET ธรรมดา: ไม่มี body ไม่มี Authorization และคืน object ที่แปลงแล้ว', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { items: [{ id: 1 }] }));

  const data = await apiFetch('/api/coupons');

  expect(data).toEqual({ items: [{ id: 1 }] });
  const [url, options] = fetch.mock.calls[0];            // อาร์กิวเมนต์ที่ apiFetch ส่งให้ fetch
  expect(url).toBe('/api/coupons');
  expect(options.method).toBe('GET');
  expect(options.body).toBeUndefined();
  expect(options.headers.Authorization).toBeUndefined();
});

test('register ส่งชื่อในฟิลด์ username ที่ API Go ต้องการ', async () => {
  fetch.mockResolvedValue(fakeResponse(201, { id: 7 }));

  await register('member@example.com', 'Password-123!', 'Member');

  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/auth/register');
  expect(options.method).toBe('POST');
  expect(JSON.parse(options.body)).toEqual({
    email: 'member@example.com',
    password: 'Password-123!',
    username: 'Member'
  });
});

test('โหลดแพ็กเกจจาก API และแปลงข้อมูลสำหรับการ์ดสินค้า', async () => {
  fetch.mockResolvedValue(fakeResponse(200, {
    items: [{
      package_id: 12,
      game_name: 'Valorant',
      title: '500 VP',
      price: 150,
      available_count: 3
    }]
  }));

  await expect(getCoupons()).resolves.toEqual([expect.objectContaining({
    id: 12,
    title: '500 VP',
    genre: 'Valorant',
    price: 150,
    availableCount: 3
  })]);
  expect(fetch.mock.calls[0][0]).toBe('/api/coupons');
});

test('ซื้อคูปองส่ง POST ไปยัง package endpoint พร้อม token', async () => {
  fetch.mockResolvedValue(fakeResponse(201, { coupon_code: 'ABC-123' }));

  await buyCoupon(12, 'api-token');

  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/coupons/12/buy');
  expect(options.method).toBe('POST');
  expect(options.headers.Authorization).toBe('Bearer api-token');
});

test('admin members และ role ใช้เส้นทางกับ role values ของ Go API', async () => {
  fetch
    .mockResolvedValueOnce(fakeResponse(200, {
      items: [{ id: 9, username: 'Player', email: 'player@example.com', role: 'customer' }]
    }))
    .mockResolvedValueOnce(fakeResponse(200, {
      id: 9, username: 'Player', email: 'player@example.com', role: 'admin'
    }));

  await expect(getAdminMembers('admin-token')).resolves.toEqual([
    expect.objectContaining({ id: 9, displayName: 'Player', role: 'member' })
  ]);
  await setMemberRole(9, 'member', 'admin-token');

  expect(fetch.mock.calls[0][0]).toBe('/api/admin/users');
  expect(fetch.mock.calls[1][0]).toBe('/api/admin/users/9/role');
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ role: 'customer' });
});

test('โหลดโปรไฟล์และประวัติซื้อผ่าน endpoint Go พร้อมแนบ token', async () => {
  fetch.mockResolvedValueOnce(fakeResponse(200, {
    id: 7,
    username: 'Member',
    email: 'member@example.com',
    role: 'customer'
  }));
  fetch.mockResolvedValueOnce(fakeResponse(200, []));

  await getMe('abc123');
  await getMyOrders('abc123');

  const [profileUrl, profileOptions] = fetch.mock.calls[0];
  const [ordersUrl, ordersOptions] = fetch.mock.calls[1];
  expect(profileUrl).toBe('/api/users/me');
  expect(profileOptions.headers.Authorization).toBe('Bearer abc123');
  expect(ordersUrl).toBe('/api/users/me/orders');
  expect(ordersOptions.headers.Authorization).toBe('Bearer abc123');
  expect(ordersOptions.body).toBeUndefined();
});

test('ไม่ใช่ 2xx ต้องโยน Error ที่มีข้อความจาก server และเลข status', async () => {
  fetch.mockResolvedValue(fakeResponse(401, { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }));

  await expect(login('a@b.c', 'wrong')).rejects.toThrow('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

  const err = await login('a@b.c', 'wrong').catch(e => e);
  expect(err.status).toBe(401);
});

test('204 คืน null โดยไม่เรียก res.json()', async () => {
  const res = fakeResponse(204, null);
  res.json = jest.fn();
  fetch.mockResolvedValue(res);

  const data = await apiFetch('/api/admin/coupons/1', { method: 'DELETE', token: 'abc' });

  expect(data).toBeNull();
  expect(res.json).not.toHaveBeenCalled();
});

test('server ตอบมาไม่ใช่ JSON ต้องได้ข้อความที่เข้าใจได้ ไม่ใช่ SyntaxError', async () => {
  fetch.mockResolvedValue({ ok: false, status: 404, json: () => Promise.reject(new SyntaxError('Unexpected token <')) });

  await expect(apiFetch('/api/coupons')).rejects.toThrow('server ไม่ได้ตอบเป็น JSON');
});