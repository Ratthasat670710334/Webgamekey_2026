import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getMe } from '../api/backend';

function About() {
  const { member, token } = useAuth();
  const [profile, setProfile] = useState(member);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    getMe(token)
      .then((user) => {
        if (!ignore) {
          setProfile({
            ...user,
            displayName: user.displayName ?? user.username,
            role: user.role === 'customer' ? 'member' : user.role
          });
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
  }, [token]);

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-black">
          MY <span className="text-purple-500">ACCOUNT</span>
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          ข้อมูลบัญชีจากระบบ Gamekey
        </p>

        {status === 'loading' && <p className="mt-8 text-gray-400">กำลังโหลดข้อมูล...</p>}
        {status === 'error' && (
          <p role="alert" className="mt-8 rounded-xl bg-red-500/10 p-4 text-red-400">
            โหลดข้อมูลบัญชีไม่สำเร็จ: {error}
          </p>
        )}
        {status === 'success' && (
          <div className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-[#14141f] p-6">
            <div>
              <p className="text-sm text-gray-400">ชื่อที่แสดง</p>
              <p className="mt-1 font-semibold">{profile.displayName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">อีเมล</p>
              <p className="mt-1 font-semibold">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">บทบาท</p>
              <p className="mt-1 font-semibold">
                {profile.role === 'admin' ? 'Administrator' : 'Member'}
              </p>
            </div>
          </div>
        )}
        <p className="mt-6 text-center text-xs text-gray-600">
          การแก้ไขโปรไฟล์ยังไม่รองรับโดย API
        </p>
      </div>
    </div>
  );
}

export default About;
