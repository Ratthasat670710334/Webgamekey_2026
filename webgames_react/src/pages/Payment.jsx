import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { buyCoupon } from '../api/backend';

function getCheckout(location) {
  try {
    return location.state ?? JSON.parse(localStorage.getItem('gamekey_pending_payment') || 'null');
  } catch {
    return null;
  }
}

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [checkout] = useState(() => getCheckout(location));
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');

  if (!checkout?.game || !(checkout.packageId ?? checkout.game.id)) {
    return (
      <div className="min-h-screen bg-[#09090f] px-5 py-20 text-center text-white">
        <h1 className="text-2xl font-bold">ไม่พบรายการซื้อ</h1>
        <button onClick={() => navigate('/')} className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-semibold">
          กลับหน้าร้านค้า
        </button>
      </div>
    );
  }

  const { game } = checkout;
  const packageId = checkout.packageId ?? game.id;

  async function confirmPurchase() {
    if (isPaying || couponCode) return;
    setIsPaying(true);
    setError('');
    try {
      const result = await buyCoupon(packageId, token);
      setCouponCode(result.coupon_code);
      localStorage.removeItem('gamekey_pending_payment');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-black">ยืนยันการซื้อ</h1>
        <p className="mt-2 text-gray-400">
          คำสั่งซื้อจะถูกบันทึกในระบบเมื่อยืนยัน
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#14141f] p-6">
          <p className="text-sm text-gray-400">แพ็กเกจ</p>
          <h2 className="mt-2 text-xl font-bold">{game.title}</h2>
          <p className="mt-5 text-sm text-gray-400">ยอดชำระ</p>
          <p className="mt-1 text-3xl font-black text-purple-400">
            ฿{Number(game.price).toLocaleString('th-TH')}
          </p>
          <p className="mt-6 rounded-xl bg-yellow-500/10 p-4 text-sm text-yellow-300">
            ระบบ Go ยังไม่มีการเชื่อมต่อผู้ให้บริการชำระเงินจริง การยืนยันด้านล่างจะซื้อคูปองจากคลังทันที
          </p>

          {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
          {couponCode && (
            <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
              <p className="font-semibold text-green-300">ซื้อสำเร็จ · รหัสคูปอง</p>
              <p className="mt-2 break-all font-mono text-lg">{couponCode}</p>
            </div>
          )}

          {couponCode ? (
            <button onClick={() => navigate('/orders')} className="mt-6 w-full rounded-xl bg-purple-600 py-3 font-bold hover:bg-purple-500">
              ดูประวัติการซื้อ
            </button>
          ) : (
            <button
              type="button"
              onClick={confirmPurchase}
              disabled={isPaying}
              className="mt-6 w-full rounded-xl bg-green-600 py-3 font-bold hover:bg-green-500 disabled:opacity-50"
            >
              {isPaying ? 'กำลังซื้อ...' : 'ยืนยันการซื้อ'}
            </button>
          )}
          <button onClick={() => navigate('/')} className="mt-4 w-full text-sm text-gray-400 hover:text-white">
            ยกเลิกและกลับหน้าร้านค้า
          </button>
        </div>
      </div>
    </div>
  );
}

export default Payment;
