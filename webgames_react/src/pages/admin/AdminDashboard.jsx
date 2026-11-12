import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getAdminOrders, getAdminStats } from '../../api/backend';

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2
  });
}

function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    Promise.all([getAdminStats(token), getAdminOrders(token)])
      .then(([nextStats, nextOrders]) => {
        if (!ignore) {
          setStats(nextStats);
          setOrders(nextOrders.slice(0, 5));
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

  const cards = stats
    ? [
        ['แพ็กเกจทั้งหมด', stats.coupons],
        ['สมาชิกทั้งหมด', stats.users],
        ['ผู้ดูแลระบบ', stats.admins],
        ['คำสั่งซื้อ', stats.orders],
        ['ยอดขายรวม', formatMoney(stats.totals)]
      ]
    : [];

  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="mt-2 text-sm text-gray-400">ภาพรวมจากฐานข้อมูล Gamekey</p>

      {status === 'loading' && <p className="mt-8 text-gray-400">กำลังโหลดข้อมูล...</p>}
      {status === 'error' && (
        <div className="mt-8 rounded-xl bg-red-500/10 p-5 text-red-300">
          <p role="alert">{error}</p>
          <button onClick={() => setReloadKey((key) => key + 1)} className="mt-3 underline">ลองใหม่</button>
        </div>
      )}
      {status === 'success' && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-[#12121d] p-5">
                <p className="text-sm text-gray-400">{label}</p>
                <p className="mt-4 text-2xl font-bold">{label === 'ยอดขายรวม' ? value : Number(value).toLocaleString('th-TH')}</p>
              </div>
            ))}
          </div>
          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#12121d]">
            <div className="border-b border-white/10 px-5 py-5">
              <h3 className="text-lg font-bold">คำสั่งซื้อล่าสุด</h3>
            </div>
            {orders.length === 0 ? (
              <p className="p-8 text-center text-gray-400">ยังไม่มีคำสั่งซื้อ</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-white/5 text-gray-400">
                    <tr>
                      <th className="px-5 py-3">คำสั่งซื้อ</th>
                      <th className="px-5 py-3">ลูกค้า</th>
                      <th className="px-5 py-3">แพ็กเกจ</th>
                      <th className="px-5 py-3">ยอดซื้อ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.orderId} className="border-t border-white/5">
                        <td className="px-5 py-3">#{order.orderId}</td>
                        <td className="px-5 py-3">{order.username || order.userId}</td>
                        <td className="px-5 py-3">{order.title}</td>
                        <td className="px-5 py-3">{formatMoney(order.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <p className="mt-5 text-xs text-gray-500">
            จัดการแพ็กเกจ สมาชิก และคลังคูปองได้จากเมนูด้านข้าง
          </p>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
