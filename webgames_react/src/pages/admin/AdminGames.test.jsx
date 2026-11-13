import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../auth/AuthContext';
import AdminGames from './AdminGames';
import { deleteGame, getGames } from '../../api/backend';

jest.mock('../../api/backend');

const ME = { id: 2, email: 'admin@example.test', displayName: 'Admin', role: 'admin' };
const GAME = {
  id: 1,
  title: 'Test Game',
  genre: 'Action',
  price: 100,
  discountPrice: 80,
  discount: 20,
  rating: 8,
  platform: 'Steam',
  region: 'Global',
  poster: '',
  detail: '',
  status: 'พร้อมจำหน่าย',
};

function renderPage() {
  localStorage.setItem('gamekey_token', 'mock-token');
  localStorage.setItem('gamekey_member', JSON.stringify(ME));
  return render(
    <AuthProvider>
      <MemoryRouter><AdminGames /></MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  window.confirm = jest.fn(() => true);
  getGames.mockResolvedValue([GAME]);
});

test('แสดง popup เมื่อ API ปฏิเสธการลบเกมที่มีประวัติการซื้อ', async () => {
  const user = userEvent.setup();
  deleteGame.mockRejectedValue(Object.assign(new Error('เกมที่มีประวัติการซื้อแล้วไม่สามารถลบได้'), {
    code: 'GAME_IN_USE',
    status: 409,
  }));
  renderPage();

  await user.click(await screen.findByRole('button', { name: 'ลบ' }));

  expect(deleteGame).toHaveBeenCalledWith(GAME.id, 'mock-token');
  expect(await screen.findByRole('alertdialog')).toHaveTextContent(
    'เกมนี้มีประวัติการซื้อแล้ว จึงไม่สามารถลบได้'
  );
  expect(screen.getByText('Test Game')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'ตกลง' }));
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
});

test('ข้อผิดพลาดการลบอื่นยังแสดงเป็นข้อความทั่วไป ไม่เปิด popup นี้', async () => {
  const user = userEvent.setup();
  deleteGame.mockRejectedValue(new Error('ระบบขัดข้อง'));
  renderPage();

  await user.click(await screen.findByRole('button', { name: 'ลบ' }));

  expect(await screen.findByText('ระบบขัดข้อง')).toBeInTheDocument();
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
});
