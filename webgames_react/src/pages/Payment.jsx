
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { purchaseGameKeys } from '../data/keyInventory';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const [checkout] = useState(() => {
    if (location.state) {
      return location.state;
    }

    return JSON.parse(
      localStorage.getItem('gamekey_pending_payment') || 'null'
    );
  });

  const [timeLeft, setTimeLeft] = useState(900);
  const [error, setError] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (checkout) {
      localStorage.setItem(
        'gamekey_pending_payment',
        JSON.stringify(checkout)
      );
    }
  }, [checkout]);

  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!checkout || !checkout.game) {
    return (
      <div className="min-h-screen bg-[#09090f] px-5 py-20 text-center text-white">
        <h1 className="text-2xl font-bold">
          ไม่พบคำสั่งซื้อ
        </h1>

        <p className="mt-3 text-gray-400">
          กรุณากลับไปเลือกเกมที่ต้องการซื้อก่อน
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500"
        >
          กลับหน้าร้านค้า
        </button>
      </div>
    );
  }

  const game = checkout.game;
  const quantity = Number(checkout.quantity) || 1;
  const totalPrice = Number(checkout.totalPrice) ||
    Number(game.discountPrice) * quantity;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const qrText = encodeURIComponent(
    `GAMEKEY STORE MOCK PAYMENT | ORDER: ${checkout.orderId || 'NEW'} | AMOUNT: ${totalPrice} THB`
  );

  const confirmPayment = () => {
    if (isPaying || timeLeft <= 0) {
      return;
    }

    setIsPaying(true);
    setError('');

    try {
      const savedOrders = JSON.parse(
        localStorage.getItem('gamekey_orders') || '[]'
      );

      const existingOrder = savedOrders.find(
        (order) => order.orderId === checkout.orderId
      );

      if (existingOrder) {
        localStorage.removeItem('gamekey_pending_payment');
        navigate('/orders');
        return;
      }

      const purchasedKeys = purchaseGameKeys(game, quantity);

      const newOrder = {
        orderId: checkout.orderId || 'GK' + Date.now(),
        gameId: game.id,
        title: game.title,
        poster: game.poster,
        platform: game.platform,
        region: game.region,
        quantity: quantity,
        totalPrice: totalPrice,
        date: new Date().toLocaleString('th-TH'),
        status: 'ชำระเงินสำเร็จ',
        keys: purchasedKeys
      };

      savedOrders.unshift(newOrder);

      localStorage.setItem(
        'gamekey_orders',
        JSON.stringify(savedOrders)
      );

      localStorage.removeItem('gamekey_pending_payment');

      navigate('/orders');
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการชำระเงิน');
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        <h1 className="text-3xl font-black">
          ชำระเงิน
        </h1>

        <p className="mt-2 text-gray-400">
          สแกน QR Code เพื่อดำเนินการชำระเงิน
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl border border-white/10 bg-[#14141f] p-6">

            <h2 className="text-xl font-bold">
              รายละเอียดคำสั่งซื้อ
            </h2>

            <div className="mt-5 flex gap-4">
              <img
                src={game.poster}
                alt={game.title}
                className="h-24 w-36 rounded-lg object-cover"
              />

              <div>
                <h3 className="font-bold">
                  {game.title}
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  {game.platform} / {game.region}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  จำนวน {quantity} คีย์
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5">

              <div className="flex justify-between text-gray-400">
                <span>ราคาต่อชิ้น</span>
                <span>
                  ฿{Number(game.discountPrice).toLocaleString('th-TH')}
                </span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>จำนวน</span>
                <span>{quantity}</span>
              </div>

              <div className="flex justify-between border-t border-white/10 pt-4">
                <span className="font-semibold">
                  ยอดชำระทั้งหมด
                </span>

                <span className="text-2xl font-black text-purple-400">
                  ฿{totalPrice.toLocaleString('th-TH')}
                </span>
              </div>

            </div>

            <div className="mt-6 rounded-xl bg-yellow-500/10 p-4 text-sm text-yellow-400">
              นี่คือระบบชำระเงินจำลอง ไม่มีการโอนเงินจริง
            </div>

          </div>

          <div className="rounded-2xl border border-white/10 bg-[#14141f] p-6 text-center">

            <h2 className="text-xl font-bold">
              สแกน QR Code
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              QR Code สำหรับทดสอบระบบ GAMEKEY STORE
            </p>

            <div className="mx-auto mt-5 flex h-60 w-60 items-center justify-center rounded-xl bg-white p-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrText}`}
                alt="Mock payment QR code"
                className="h-full w-full object-contain"
              />
            </div>

            <p className="mt-5 text-sm text-gray-400">
              ยอดที่ต้องชำระ
            </p>

            <p className="mt-1 text-3xl font-black text-purple-400">
              ฿{totalPrice.toLocaleString('th-TH')}
            </p>

            <div className="mt-5 rounded-xl bg-[#09090f] p-4">
              <p className="text-sm text-gray-400">
                เวลาที่เหลือสำหรับชำระเงิน
              </p>

              <p className="mt-1 text-2xl font-bold text-yellow-400">
                {String(minutes).padStart(2, '0')}:
                {String(seconds).padStart(2, '0')}
              </p>
            </div>

            {timeLeft > 0 ? (
              <button
                type="button"
                onClick={confirmPayment}
                disabled={isPaying}
                className="mt-6 w-full rounded-xl bg-green-600 px-6 py-4 font-bold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPaying
                  ? 'กำลังดำเนินการ...'
                  : '✓ จำลองการชำระเงินสำเร็จ'}
              </button>
            ) : (
              <div className="mt-6 rounded-xl bg-red-500/10 p-4 text-red-400">
                หมดเวลาชำระเงินแล้ว กรุณากลับไปสั่งซื้อใหม่
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('gamekey_pending_payment');
                    navigate('/');
                  }}
                  className="mt-3 block w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500"
                >
                  กลับหน้าร้านค้า
                </button>
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-4 text-sm text-gray-400 hover:text-white"
            >
              ยกเลิกและกลับหน้าร้านค้า
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Payment;
