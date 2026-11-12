import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { getGame, login } from '../api/backend';
import GameDetail from './GameDetail';
import Login from './Login';

jest.mock('../api/backend', () => ({
  getGame: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
}));

const GAME = {
  id: 1,
  title: 'Sample Game',
  poster: '/game.png',
  detail: 'Game details',
  discount: 10,
  discountPrice: 100,
  price: 110,
  availableKeys: 2,
  platform: 'PC',
  region: 'Global',
  rating: 9,
  genre: 'Adventure',
};

function renderDetail() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/game/1']}>
        <Routes>
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment" element={<h1>ชำระเงิน</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  getGame.mockResolvedValue(GAME);
  login.mockResolvedValue({
    token: 'valid.mock.token',
    member: {
      id: 1,
      email: 'demo@example.com',
      displayName: 'Demo',
      role: 'member',
    },
  });
});

test('guest ดูรายละเอียดเกมได้ และต้อง login ก่อนซื้อ', async () => {
  const user = userEvent.setup();
  renderDetail();

  expect(await screen.findByRole('heading', { name: 'Sample Game' })).toBeInTheDocument();
  expect(screen.getByText('Game details')).toBeInTheDocument();
  expect(screen.getByText('2 คีย์')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /ซื้อคีย์เกม/ }));
  expect(screen.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeInTheDocument();

  await user.type(screen.getByPlaceholderText('กรอกอีเมล'), 'demo@example.com');
  await user.type(screen.getByPlaceholderText('กรอกรหัสผ่าน'), 'password');
  await user.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

  expect(await screen.findByRole('heading', { name: 'Sample Game' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /ซื้อคีย์เกม/ }));
  expect(screen.getByRole('heading', { name: 'ชำระเงิน' })).toBeInTheDocument();
});
