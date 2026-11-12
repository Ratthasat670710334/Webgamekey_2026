
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Navbar() {
  const { member, isLoggedIn, isAdmin, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    setProfileOpen(false);
    logout();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0c0c14]/95 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-5 px-5 py-4 md:px-8">
        <Link to="/" className="text-2xl font-black tracking-tight text-white">
          <span className="text-purple-500">GAME</span>KEY
          <span className="ml-2 text-xs font-normal text-gray-500">
            STORE
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-5">
          <Link to="/" className="text-sm text-purple-400 hover:text-white">
            หน้าแรก
          </Link>

          <a href="/#all-games" className="text-sm text-gray-400 hover:text-white">
            เกมทั้งหมด
          </a>

          <a href="/#featured" className="text-sm text-gray-400 hover:text-white">
            เกมแนะนำ
          </a>

          {isLoggedIn && member?.role === 'member' && (
            <Link to="/orders" className="text-sm text-gray-400 hover:text-white">
              ประวัติการสั่งซื้อ
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-semibold text-purple-400 hover:text-white"
            >
              จัดการร้านค้า
            </Link>
          )}
        </div>

        <div className="relative ml-auto flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:border-purple-500 hover:text-white"
              >
                <span>👤</span>
                <span>Profile (Demo)</span>

                {isAdmin && (
                  <span className="rounded-md bg-purple-500/20 px-2 py-1 text-xs text-purple-400">
                    ADMIN
                  </span>
                )}

                <span className="text-xs">
                  {profileOpen ? '▲' : '▼'}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#14141f] shadow-xl">
                  <Link
                    to="/about"
                    onClick={() => setProfileOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-300 transition hover:bg-purple-500/10 hover:text-purple-400"
                  >
                    👤 My Account
                  </Link>

                  <div className="border-t border-white/10" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    ↪ Log Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
