import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { putVote, addToWishlist, removeFromWishlist } from '../api/backend';

// แถบปุ่มใต้ชื่อหนัง: ให้คะแนน 1 ถึง 10 และปุ่มเพิ่มเข้า wishlist
function MovieActions({ movieId }) {
  const { isLoggedIn, token } = useAuth();

  const [myScore, setMyScore] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-sm text-slate-500">
        <Link to="/login" className="text-emerald-600 hover:underline">
          เข้าสู่ระบบ
        </Link>{' '}
        เพื่อให้คะแนนและเพิ่มเข้ารายการที่อยากดู
      </p>
    );
  }

  async function handleVote(score) {
    if (saving) return;

    setSaving(true);
    setMessage(null);

    try {
      // ต้องส่งไป server สำเร็จก่อน
      await putVote(movieId, score, token);

      // ค่อยเปลี่ยน state หลัง server ตอบสำเร็จ
      setMyScore(score);
      setMessage('บันทึกคะแนนแล้ว');
    } catch (err) {
      // ถ้า server error จะไม่เปลี่ยน myScore
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleWishlist() {
    if (saving) return;

    setSaving(true);
    setMessage(null);

    try {
      if (inWishlist) {
        // เอาออกจาก wishlist
        await removeFromWishlist(movieId, token);
        setInWishlist(false);
        setMessage('นำออกจากรายการที่อยากดูแล้ว');
      } else {
        // เพิ่มเข้า wishlist
        await addToWishlist(movieId, token);
        setInWishlist(true);
        setMessage('เพิ่มเข้ารายการที่อยากดูแล้ว');
      }
    } catch (err) {
      // ถ้า server error จะไม่เปลี่ยน inWishlist
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-2 text-sm text-slate-500">ให้คะแนน</span>

        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => handleVote(n)}
            disabled={saving}
            className={
              'h-8 w-8 rounded-lg border text-sm disabled:cursor-not-allowed disabled:opacity-50 ' +
              (myScore === n
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50')
            }
          >
            {n}
          </button>
        ))}
      </div>

      <button
        onClick={handleWishlist}
        disabled={saving}
        className={
          'rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 ' +
          (inWishlist
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : 'border-emerald-200 bg-white text-slate-600 hover:bg-emerald-50')
        }
      >
        {inWishlist
          ? '❤️ อยู่ในรายการที่อยากดูแล้ว'
          : '🤍 เพิ่มเข้ารายการที่อยากดู'}
      </button>

      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}

export default MovieActions;
