import { createContext, useContext, useState } from 'react';
import {
  login as loginRequest,
  register as registerRequest
} from '../api/backend';

const AuthContext = createContext(null);

const TOKEN_KEY = 'gamekey_token';
const MEMBER_KEY = 'gamekey_member';

function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(MEMBER_KEY);
}

function getStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token || token.startsWith('mock-token-')) {
    clearStoredSession();
    return { token: null, member: null };
  }

  try {
    const storedMember = JSON.parse(localStorage.getItem(MEMBER_KEY) || 'null');
    if (
      !storedMember ||
      storedMember.id == null ||
      typeof storedMember.email !== 'string' ||
      typeof (storedMember.displayName ?? storedMember.username) !== 'string' ||
      typeof storedMember.role !== 'string'
    ) {
      clearStoredSession();
      return { token: null, member: null };
    }

    const member = {
      ...storedMember,
      displayName: storedMember.displayName ?? storedMember.username,
      role: storedMember.role === 'customer' ? 'member' : storedMember.role
    };
    return { token, member };
  } catch {
    clearStoredSession();
    return { token: null, member: null };
  }
}

function getSessionFromResponse(response) {
  const { token, member } = response || {};
<<<<<<< HEAD
  const displayName = member?.displayName ?? member?.username;
  const role = member?.role === 'customer' ? 'member' : member?.role;
=======
>>>>>>> parent of 81e1cee (edit)
  if (
    typeof token !== 'string' ||
    token.length === 0 ||
    !member ||
    member.id == null ||
    typeof member.email !== 'string' ||
<<<<<<< HEAD
    typeof displayName !== 'string' ||
    typeof role !== 'string'
=======
    typeof member.displayName !== 'string' ||
    typeof member.role !== 'string'
>>>>>>> parent of 81e1cee (edit)
  ) {
    throw new Error('เซิร์ฟเวอร์ส่งข้อมูลเข้าสู่ระบบไม่ครบ');
  }

<<<<<<< HEAD
  return { token, member: { ...member, displayName, role } };
=======
  return { token, member };
>>>>>>> parent of 81e1cee (edit)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);
  const [isGuest, setIsGuest] = useState(false);
  const { token, member } = session;

  function remember(response) {
    const nextSession = getSessionFromResponse(response);
    setSession(nextSession);
    setIsGuest(false);
    localStorage.setItem(TOKEN_KEY, nextSession.token);
    localStorage.setItem(MEMBER_KEY, JSON.stringify(nextSession.member));
  }

  async function login(email, password) {
    const response = await loginRequest(email, password);
    remember(response);
  }

  async function register(email, password, displayName) {
    await registerRequest(email, password, displayName);
    const response = await loginRequest(email, password);
    remember(response);
  }

  function updateProfile() {
    if (!member) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    throw new Error('Backend ยังไม่มี API สำหรับแก้ไขโปรไฟล์');
  }

  function loginAsGuest() {
    setSession({ token: null, member: null });
    setIsGuest(true);
    clearStoredSession();
  }

  function logout() {
    setSession({ token: null, member: null });
    setIsGuest(false);
    clearStoredSession();
  }

  const isAdmin = member?.role === 'admin';

  const value = {
    token,
    member,
    isGuest,
    isLoggedIn: Boolean(token),
    isAdmin,
    login,
    register,
    updateProfile,
    loginAsGuest,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
