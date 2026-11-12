import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getCoupon } from '../api/backend';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, isGuest } = useAuth();
  const [game, setGame] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    if (!isLoggedIn || isGuest) return undefined;

    getCoupon(id)
      .then((item) => {
        if (!ignore) {
          setGame(item);
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
  }, [id, isLoggedIn, isGuest]);

  if (!isLoggedIn || isGuest) {
    return <Navigate to="/login" replace state={{ from: `/game/${id}` }} />;
  }

  function startCheckout() {
    const checkout = {
      packageId: game.id,
      game,
      quantity: 1,
      totalPrice: game.price
    };
    localStorage.setItem('gamekey_pending_payment', JSON.stringify(checkout));
    navigate('/payment', { state: checkout });
  }

  if (status === 'loading') {
    return <p className="min-h-screen bg-[#09090f] p-10 text-center text-gray-300">กำลังโหลดข้อมูลสินค้า...</p>;
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#09090f] px-5 py-20 text-center text-white">
        <h1 className="text-2xl font-bold">โหลดข้อมูลสินค้าไม่สำเร็จ</h1>
        <p role="alert" className="mt-3 text-red-400">{error}</p>
        <button onClick={() => navigate('/')} className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-semibold">
          กลับหน้าร้านค้า
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => navigate('/')} className="mb-8 text-sm text-gray-400 hover:text-purple-400">
          ← กลับไปหน้าร้านค้า
        </button>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950 to-[#14141f] p-8 text-center">
            <div>
              <p className="text-sm text-purple-300">{game.genre}</p>
              <h1 className="mt-3 text-3xl font-black">{game.title}</h1>
            </div>
          </div>
          <div>
            <p className="text-sm text-purple-400">{game.genre} · Digital Key</p>
            <h1 className="mt-3 text-3xl font-black">{game.title}</h1>
            <p className="mt-4 leading-7 text-gray-300">{game.detail}</p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-[#14141f] p-6">
              <p className="text-sm text-gray-400">ราคาต่อแพ็กเกจ</p>
              <p className="mt-2 text-4xl font-black text-purple-400">
                ฿{game.price.toLocaleString('th-TH')}
              </p>
              <div className="mt-5 space-y-2 text-sm text-gray-400">
                <p>
                  คูปองคงเหลือ:{' '}
                  {game.availableCount == null
                    ? 'ระบบจะตรวจสอบขณะซื้อ'
                    : game.availableCount.toLocaleString('th-TH')}
                </p>
                <p>จำกัดการซื้อ: {game.maxPerUser} รายการต่อบัญชี</p>
                {game.isActive === false && (
                  <p className="text-red-400">แพ็กเกจนี้ปิดขายอยู่</p>
                )}
              </div>
              <button
                type="button"
                onClick={startCheckout}
                disabled={game.isActive === false || game.availableCount === 0}
                className="mt-6 w-full rounded-xl bg-purple-600 py-4 font-bold hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-gray-700"
              >
                ซื้อคูปอง
              </button>
              {game.availableCount === 0 && (
                <p className="mt-3 text-center text-sm text-red-400">สินค้าหมดชั่วคราว</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
