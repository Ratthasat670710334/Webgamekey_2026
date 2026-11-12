import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getMyOrders } from '../api/backend';

function OrderHistory() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [copiedOrder, setCopiedOrder] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setStatus('loading');
    setError('');
    getMyOrders(token)
      .then((items) => {
        if (!ignore) {
          setOrders(items);
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

  async function copyCode(order) {
    try {
      await navigator.clipboard.writeText(order.couponCode);
      setCopiedOrder(order.orderId);
      setTimeout(() => setCopiedOrder(null), 2000);
    } catch {
      setError('คัดลอกรหัสไม่ได้ กรุณาเลือกและคัดลอกรหัสด้วยตนเอง');
    }
  }

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black">ประวัติการสั่งซื้อ</h1>
        <p className="mt-2 text-gray-400">รายการซื้อและรหัสคูปองจากบัญชีของคุณ</p>

        {status === 'loading' && <p className="mt-8 text-center text-gray-400">กำลังโหลดประวัติ...</p>}
        {status === 'error' && (
          <div className="mt-8 rounded-xl bg-red-500/10 p-5 text-red-300">
            <p role="alert">{error}</p>
            <button onClick={() => setReloadKey((key) => key + 1)} className="mt-3 underline">
              ลองใหม่
            </button>
          </div>
        )}
        {status === 'success' && orders.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#14141f] p-10 text-center">
            <p className="text-5xl">🛒</p>
            <h2 className="mt-4 text-xl font-bold">ยังไม่มีประวัติการสั่งซื้อ</h2>
          </div>
        )}
        {status === 'success' && orders.length > 0 && (
          <div className="mt-8 space-y-5">
            {orders.map((order) => (
              <article key={order.orderId} className="rounded-2xl border border-white/10 bg-[#14141f] p-6">
                <div className="flex flex-wrap justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-gray-400">คำสั่งซื้อ #{order.orderId}</p>
                    <h2 className="mt-1 text-lg font-bold">{order.title}</h2>
                    <p className="text-sm text-gray-400">{order.gameName}</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(order.date).toLocaleString('th-TH')}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-400">รหัสคูปอง</p>
                    <p className="mt-1 break-all font-mono font-semibold">{order.couponCode}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCode(order)}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500"
                  >
                    {copiedOrder === order.orderId ? 'คัดลอกแล้ว' : 'คัดลอกรหัส'}
                  </button>
                </div>
                <div className="mt-5 flex justify-between border-t border-white/10 pt-4">
                  <span className="text-gray-400">ยอดชำระ</span>
                  <span className="text-xl font-black text-purple-400">
                    ฿{order.totalPrice.toLocaleString('th-TH')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;
