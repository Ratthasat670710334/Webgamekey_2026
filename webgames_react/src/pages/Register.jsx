
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('typing');

  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordRules = [
    {
      label: 'อย่างน้อย 8 ตัวอักษร',
      valid: password.length >= 8
    },
    {
      label: 'มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)',
      valid: /[A-Z]/.test(password)
    },
    {
      label: 'มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)',
      valid: /[a-z]/.test(password)
    },
    {
      label: 'มีตัวเลขอย่างน้อย 1 ตัว (0-9)',
      valid: /[0-9]/.test(password)
    },
    {
      label: 'มีอักขระพิเศษอย่างน้อย 1 ตัว (!@#$%)',
      valid: /[^A-Za-z0-9]/.test(password)
    }
  ];

  const passwordValid = passwordRules.every((rule) => rule.valid);
  const confirmValid =
    confirmPassword.length > 0 && password === confirmPassword;

  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const formValid =
    displayName.trim().length > 0 &&
    emailValid &&
    passwordValid &&
    confirmValid;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!formValid) {
      setError('กรุณาตรวจสอบข้อมูลให้ครบทุกเงื่อนไข');
      return;
    }

    setStatus('submitting');

    try {
      await register(email.trim(), password, displayName.trim());
      navigate('/');
    } catch (err) {
      setError(err.message);
      setStatus('typing');
    }
  }

  const input =
    'w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500';

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
            สมัครสมาชิก
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            สร้างบัญชีเพื่อเริ่มซื้อเกมที่คุณชื่นชอบ
          </p>

        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold">
              ชื่อที่แสดง
            </label>

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="กรอกชื่อของคุณ"
              required
              maxLength={50}
              className={input}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              อีเมล
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className={input}
            />

            {email.length > 0 && (
              <p className={`mt-2 text-xs ${emailValid ? 'text-green-400' : 'text-red-400'}`}>
                {emailValid ? '✓ รูปแบบอีเมลถูกต้อง' : '✗ กรุณากรอกอีเมลให้ถูกต้อง'}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              รหัสผ่าน
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ตั้งรหัสผ่าน"
              required
              className={input}
            />

            {password.length > 0 && (
              <div className="mt-3 rounded-xl border border-white/10 bg-[#09090f] p-4">

                <p className="mb-3 text-sm font-semibold text-gray-300">
                  เงื่อนไขรหัสผ่าน
                </p>

                <div className="space-y-2">
                  {passwordRules.map((rule, index) => (
                    <p
                      key={index}
                      className={`text-xs ${rule.valid ? 'text-green-400' : 'text-gray-500'}`}
                    >
                      {rule.valid ? '✓' : '○'} {rule.label}
                    </p>
                  ))}
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${passwordRules.filter((rule) => rule.valid).length * 20}%`
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  ผ่าน {passwordRules.filter((rule) => rule.valid).length}/5 เงื่อนไข
                </p>

              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              ยืนยันรหัสผ่าน
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              required
              className={input}
            />

            {confirmPassword.length > 0 && (
              <p className={`mt-2 text-xs ${confirmValid ? 'text-green-400' : 'text-red-400'}`}>
                {confirmValid ? '✓ รหัสผ่านตรงกัน' : '✗ รหัสผ่านไม่ตรงกัน'}
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!formValid || status === 'submitting'}
            className="w-full rounded-xl bg-purple-600 py-3 font-bold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
          >
            {status === 'submitting'
              ? 'กำลังสมัครสมาชิก...'
              : 'สมัครสมาชิก'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          มีบัญชีแล้ว?{' '}
          <Link
            to="/login"
            className="font-semibold text-purple-400 hover:text-purple-300"
          >
            เข้าสู่ระบบ
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

export default Register;
