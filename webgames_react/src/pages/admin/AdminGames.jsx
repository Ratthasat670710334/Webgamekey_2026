import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import {
  createCoupon,
  deleteCoupon,
  getAdminCoupons,
  updateCoupon
} from '../../api/backend';

const EMPTY_FORM = {
  gameName: '',
  title: '',
  description: '',
  price: '',
  maxPerUser: '1',
  isActive: true
};

function AdminGames() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    getAdminCoupons(token)
      .then((items) => {
        if (!ignore) {
          setCoupons(items);
          setStatus('success');
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
          setStatus('error');
        }
      });
    return () => {
      ignore = true;
    };
  }, [token, reloadKey]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      game_name: form.gameName.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      max_per_user: Number(form.maxPerUser),
      is_active: form.isActive
    };
    try {
      if (editId === null) {
        await createCoupon(payload, token);
      } else {
        await updateCoupon(editId, payload, token);
      }
      resetForm();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function editCoupon(coupon) {
    setForm({
      gameName: coupon.genre,
      title: coupon.title,
      description: coupon.detail,
      price: String(coupon.price),
      maxPerUser: String(coupon.maxPerUser),
      isActive: coupon.isActive
    });
    setEditId(coupon.id);
  }

  async function removeCoupon(coupon) {
    if (!window.confirm(`ต้องการลบ "${coupon.title}" ใช่หรือไม่?`)) return;
    setError('');
    try {
      await deleteCoupon(coupon.id, token);
      if (editId === coupon.id) resetForm();
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">จัดการแพ็กเกจเกม</h2>
        <p className="mt-2 text-sm text-gray-400">
          รายการและการแก้ไขเชื่อมกับ coupon packages ในฐานข้อมูล
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-white/10 bg-[#12121d] p-5">
        <h3 className="mb-5 text-lg font-bold">{editId === null ? 'เพิ่มแพ็กเกจ' : 'แก้ไขแพ็กเกจ'}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-gray-400">
            ชื่อเกม
            <input name="gameName" value={form.gameName} onChange={updateField} required maxLength={100}
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] p-3 text-white" />
          </label>
          <label className="text-sm text-gray-400">
            ชื่อแพ็กเกจ
            <input name="title" value={form.title} onChange={updateField} required maxLength={150}
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] p-3 text-white" />
          </label>
          <label className="text-sm text-gray-400">
            ราคา
            <input type="number" name="price" value={form.price} onChange={updateField} required min="0" step="0.01"
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] p-3 text-white" />
          </label>
          <label className="text-sm text-gray-400">
            จำกัดจำนวนซื้อต่อคน
            <input type="number" name="maxPerUser" value={form.maxPerUser} onChange={updateField} required min="1"
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] p-3 text-white" />
          </label>
          <label className="text-sm text-gray-400 md:col-span-2">
            รายละเอียด
            <textarea name="description" value={form.description} onChange={updateField} rows="3"
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] p-3 text-white" />
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-300 md:col-span-2">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={updateField} />
            เปิดขาย
          </label>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-6 py-3 font-semibold disabled:opacity-50">
            {saving ? 'กำลังบันทึก...' : editId === null ? 'เพิ่มแพ็กเกจ' : 'บันทึก'}
          </button>
          {editId !== null && (
            <button type="button" onClick={resetForm} className="rounded-lg border border-white/10 px-6 py-3">
              ยกเลิก
            </button>
          )}
        </div>
      </form>

      {status === 'loading' && <p className="py-8 text-center text-gray-400">กำลังโหลดแพ็กเกจ...</p>}
      {status === 'error' && (
        <div className="rounded-xl bg-red-500/10 p-5 text-red-300">
          <p role="alert">{error}</p>
          <button onClick={() => setReloadKey((key) => key + 1)} className="mt-3 underline">ลองใหม่</button>
        </div>
      )}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#171722] text-gray-400">
              <tr>
                <th className="p-4">แพ็กเกจ</th>
                <th className="p-4">ราคา</th>
                <th className="p-4">จำกัด/คน</th>
                <th className="p-4">สถานะ</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t border-white/10">
                  <td className="p-4">
                    <p className="font-semibold">{coupon.title}</p>
                    <p className="text-gray-400">{coupon.genre}</p>
                  </td>
                  <td className="p-4">฿{coupon.price.toLocaleString('th-TH')}</td>
                  <td className="p-4">{coupon.maxPerUser}</td>
                  <td className="p-4">{coupon.isActive ? 'เปิดขาย' : 'ปิดขาย'}</td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button onClick={() => editCoupon(coupon)} className="text-blue-400 hover:underline">แก้ไข</button>
                      <button onClick={() => removeCoupon(coupon)} className="text-red-400 hover:underline">ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">ยังไม่มีแพ็กเกจ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminGames;
