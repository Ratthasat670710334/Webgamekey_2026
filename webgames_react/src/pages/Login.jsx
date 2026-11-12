
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Login() {
  const [email, setEmail] = useState('demo@moviehub.test');
  const [password, setPassword] = useState('1234');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('typing');

  const { login, loginAsGuest } = useAuth();

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setStatus('submitting');
    setError('');

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setStatus('typing');
    }
  }

  function handleGuest() {
    loginAsGuest();
    navigate('/', { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090f] px-5 py-12 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14141f] p-8 shadow-2xl shadow-purple-950/20">
        <div className="text-center">
          <Link to="/" className="text-3xl font-black">
            <span className="text-purple-500">GAME</span>KEY
            <span className="ml-2 text-xs font-normal text-gray-500">
              STORE
            </span>
          </Link>

          <h1 className="mt-8 text-2xl font-bold">
            เข้าสู่ระบบ
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            ยินดีต้อนรับกลับสู่ GAMEKEY STORE
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              อีเมล
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="กรอกอีเมล"
              required
              className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition focus:border-purple-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              รหัสผ่าน
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              required
              className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition focus:border-purple-500"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-xl bg-purple-600 py-3 font-bold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            {status === 'submitting'
              ? 'กำลังเข้าสู่ระบบ...'
              : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-gray-500">หรือ</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGuest}
          className="w-full rounded-xl border border-purple-500/40 bg-purple-500/10 py-3 font-bold text-purple-300 transition hover:bg-purple-500/20"
        >
          เข้าใช้งานแบบ Guest
        </button>

        <p className="mt-2 text-center text-xs text-gray-500">
          Guest สามารถดูหน้าร้านค้าได้เท่านั้น
        </p>

        <p className="mt-6 text-center text-sm text-gray-400">
          ยังไม่มีบัญชี?{' '}
          <Link
            to="/register"
            className="font-semibold text-purple-400 hover:text-purple-300"
          >
            สมัครสมาชิก
          </Link>
        </p>

        <div className="mt-5 text-center">
          <Link
            to="/"
            className="text-sm text-gray-400 transition hover:text-purple-400"
          >
            ← กลับหน้าร้านค้า
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
