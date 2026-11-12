
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

function About() {
  const { member, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(member?.displayName || '');
  const [email, setEmail] = useState(member?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    setMessage('');
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (!displayName.trim() || !email.trim()) {
      setError('กรุณากรอกชื่อและอีเมลให้ครบ');
      return;
    }

    try {
      updateProfile(
        displayName.trim(),
        email.trim(),
        newPassword
      );

      setNewPassword('');
      setConfirmPassword('');
      setMessage('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCancel() {
    setDisplayName(member?.displayName || '');
    setEmail(member?.email || '');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setError('');
  }

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <h1 className="text-3xl font-black">
            MY <span className="text-purple-500">ACCOUNT</span>
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            จัดการข้อมูลส่วนตัวและบัญชีผู้ใช้งานของคุณ
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#14141f]">

          <div className="h-32 bg-gradient-to-r from-purple-900 via-purple-600 to-indigo-900" />

          <div className="px-6 pb-8 md:px-8">

            <div className="-mt-12 flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#14141f] bg-purple-600 text-3xl font-black">
                {(member?.displayName || 'U').charAt(0).toUpperCase()}
              </div>

              <div className="pb-2">
                <h2 className="text-xl font-bold">
                  {member?.displayName}
                </h2>

                <p className="text-sm text-purple-400">
                  {member?.role === 'admin' ? 'Administrator' : 'Member'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">

              <div>
                <h3 className="mb-4 text-lg font-bold text-purple-400">
                  ข้อมูลส่วนตัว
                </h3>

                <label className="mb-2 block text-sm font-semibold">
                  ชื่อที่แสดง
                </label>

                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="กรอกชื่อที่ต้องการแสดง"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition focus:border-purple-500"
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
                  placeholder="กรอกอีเมล"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition focus:border-purple-500"
                />
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="mb-2 text-lg font-bold text-purple-400">
                  เปลี่ยนรหัสผ่าน
                </h3>

                <p className="mb-4 text-xs text-gray-500">
                  หากไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นว่างไว้
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      รหัสผ่านใหม่
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านใหม่"
                      className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      ยืนยันรหัสผ่านใหม่
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                      className="w-full rounded-xl border border-white/10 bg-[#09090f] px-4 py-3 text-white outline-none transition focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
                  {error}
                </p>
              )}

              {message && (
                <p className="rounded-xl bg-green-500/10 p-4 text-sm text-green-400">
                  {message}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-500"
                >
                  บันทึกข้อมูล
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                >
                  ยกเลิก
                </button>
              </div>

            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          GAMEKEY STORE · My Account
        </p>

      </div>
    </div>
  );
}

export default About;
