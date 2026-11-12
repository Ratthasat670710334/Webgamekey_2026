
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getGame } from '../api/backend';

function MovieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { isLoggedIn, isGuest } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [game, setGame] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    getGame(id).then((item) => {
      if (!ignore) {
        setGame(item);
        setStatus('success');
      }
    }).catch((err) => {
      if (!ignore) {
        setError(err.message);
        setStatus('error');
      }
    });
    return () => { ignore = true; };
  }, [id]);

  if (isGuest || !isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (status === 'loading') {
    return <p className="min-h-screen bg-[#09090f] p-10 text-center text-white">กำลังโหลดข้อมูลเกม...</p>;
  }

  if (status === 'error' || !game) {
    return (
      <div className="min-h-screen bg-[#09090f] px-5 py-20 text-center text-white">
        <h1 className="text-2xl font-bold">{status === 'error' ? error : 'ไม่พบข้อมูลเกม'}</h1>

        <p className="mt-3 text-gray-400">
          เกมนี้อาจถูกลบออกจากร้านค้าแล้ว
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

  const availableKeys = Number(game.availableKeys) || 0;
  const totalPrice = Number(game.discountPrice) * quantity;

  const increase = () => {
    if (quantity < availableKeys) {
      setQuantity(quantity + 1);
    }
  };

  const decrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const buyGame = () => {
    const checkout = {
      game: game,
      quantity: quantity,
      totalPrice: totalPrice
    };

    navigate('/payment', {
      state: checkout
    });
  };

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-sm text-gray-400 transition hover:text-purple-400"
        >
          ← กลับไปหน้าร้านค้า
        </button>

        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <img
              src={game.poster}
              alt={game.title}
              className="w-full rounded-2xl border border-white/10 shadow-xl shadow-purple-950/30"
            />

            <div className="mt-5 rounded-xl border border-white/10 bg-[#14141f] p-5">
              <p className="mb-3 text-sm font-semibold text-purple-400">
                รายละเอียดสินค้า
              </p>

              <p className="leading-7 text-gray-300">
                {game.detail}
              </p>
            </div>
          </div>

          <div>
            <span className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-bold">
              ลดราคา {game.discount}%
            </span>

            <h1 className="mt-5 text-3xl font-black md:text-4xl">
              {game.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-lg border border-white/10 bg-[#14141f] px-3 py-2 text-sm text-gray-300">
                🎮 {game.platform}
              </span>

              <span className="rounded-lg border border-white/10 bg-[#14141f] px-3 py-2 text-sm text-gray-300">
                🌎 {game.region}
              </span>

              <span className="rounded-lg border border-white/10 bg-[#14141f] px-3 py-2 text-sm text-gray-300">
                ⭐ {game.rating}
              </span>

              <span className="rounded-lg border border-white/10 bg-[#14141f] px-3 py-2 text-sm text-gray-300">
                {game.genre}
              </span>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#14141f] p-6">
              <p className="text-sm text-gray-500">
                ราคาสินค้า
              </p>

              <div className="mt-2 flex items-center gap-3">
                <p className="text-lg text-gray-500 line-through">
                  ฿{Number(game.price).toLocaleString('th-TH')}
                </p>

                <span className="rounded-md bg-red-500/10 px-2 py-1 text-xs font-bold text-red-400">
                  -{game.discount}%
                </span>
              </div>

              <p className="mt-1 text-4xl font-black text-purple-400">
                ฿{Number(game.discountPrice).toLocaleString('th-TH')}
              </p>

              <div className="mt-5 rounded-lg bg-[#09090f] p-3">
                <p className="text-sm text-gray-400">
                  คีย์คงเหลือในคลัง
                </p>

                <p className="mt-1 text-xl font-bold text-green-400">
                  {availableKeys.length} คีย์
                </p>
              </div>

              <div className="mt-7">
                <p className="mb-3 text-sm font-semibold">
                  จำนวนคีย์ที่ต้องการ
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={decrease}
                    disabled={quantity === 1}
                    className="h-11 w-11 rounded-lg border border-white/10 bg-[#20202d] text-xl transition hover:border-purple-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    -
                  </button>

                  <span className="min-w-8 text-center text-xl font-bold">
                    {quantity}
                  </span>

                  <button
                    onClick={increase}
                    disabled={quantity >= availableKeys.length}
                    className="h-11 w-11 rounded-lg border border-white/10 bg-[#20202d] text-xl transition hover:border-purple-500 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                <p className="text-gray-400">
                  ราคารวม
                </p>

                <p className="text-2xl font-black text-purple-400">
                  ฿{totalPrice.toLocaleString('th-TH')}
                </p>
              </div>

              <button
                onClick={buyGame}
                disabled={availableKeys.length === 0}
                className="mt-6 w-full rounded-xl bg-purple-600 py-4 font-bold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-gray-700"
              >
                🛒 ซื้อคีย์เกม
              </button>

              {availableKeys.length === 0 && (
                <p className="mt-3 text-center text-sm text-red-400">
                  คีย์เกมหมดชั่วคราว
                </p>
              )}
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-[#14141f] p-4">
              <p className="text-sm text-gray-400">
                ⚡ สินค้าดิจิทัล Game Key
              </p>

              <p className="mt-2 text-sm text-gray-400">
                🎮 แพลตฟอร์ม: {game.platform}
              </p>

              <p className="mt-2 text-sm text-gray-400">
                🌎 โซนใช้งาน: {game.region}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
