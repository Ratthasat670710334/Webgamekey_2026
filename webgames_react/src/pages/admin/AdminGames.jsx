
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getGames, createGame, updateGame, deleteGame } from '../../api/backend';

const emptyGame = {
  title: '',
  genre: 'Action',
  price: 0,
  discountPrice: 0,
  discount: 0,
  rating: 0,
  platform: 'Steam',
  region: 'Global',
  poster: '',
  detail: '',
  status: 'พร้อมจำหน่าย'
};

function AdminGames() {
  const { token } = useAuth();
  const [games, setGames] = useState([]);
  const [form, setForm] = useState(emptyGame);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadGames() {
    setLoading(true);
    try {
      setGames(await getGames());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  function updateField(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  }

  function resetForm() {
    setForm(emptyGame);
    setEditId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      alert('กรุณากรอกชื่อเกม');
      return;
    }

    let updatedGames;

    const gameData = {
      ...form,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice),
      discount: Number(form.discount),
      rating: Number(form.rating)
    };

    setError('');
    try {
      const saved = editId === null
        ? await createGame(gameData, token)
        : await updateGame(editId, gameData, token);
      if (editId !== null) {
        updatedGames = games.map((game) => game.id === editId ? saved : game);
      } else {
        updatedGames = [...games, saved];
      }
      setGames(updatedGames);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  function editGame(game) {
    setForm({
      ...game,
      price: game.price,
      discountPrice: game.discountPrice
    });

    setEditId(game.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function removeGame(id) {
    if (!window.confirm('ต้องการลบเกมนี้ใช่หรือไม่?')) {
      return;
    }

    setError('');
    try {
      await deleteGame(id, token);
      setGames(games.filter((game) => game.id !== id));
      if (editId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">จัดการเกม</h2>
        <p className="mt-2 text-sm text-gray-400">
          เพิ่ม แก้ไข และลบเกมในร้านค้า
        </p>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-white/10 bg-[#12121d] p-5"
      >
        <h3 className="mb-5 text-lg font-bold">
          {editId === null ? 'เพิ่มเกมใหม่' : 'แก้ไขข้อมูลเกม'}
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-gray-400">
              ชื่อเกม
            </label>
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              required
              className="w-full rounded-lg border border-white/10 bg-[#09090f] p-3 outline-none focus:border-purple-500"
              placeholder="ชื่อเกม"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              แนวเกม
            </label>
            <select
              name="genre"
              value={form.genre}
              onChange={updateField}
              className="w-full rounded-lg border border-white/10 bg-[#09090f] p-3 outline-none"
            >
              {['Action', 'RPG', 'Adventure', 'Racing', 'Horror', 'Simulation', 'Strategy', 'Indie'].map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              ราคาปกติ
            </label>
            <input
              type="number"
              name="price"
              min="0"
              value={form.price}
              onChange={updateField}
              className="w-full rounded-lg border border-white/10 bg-[#09090f] p-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              ราคาขาย
            </label>
            <input
              type="number"
              name="discountPrice"
              min="0"
              value={form.discountPrice}
              onChange={updateField}
              className="w-full rounded-lg border border-white/10 bg-[#09090f] p-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              ส่วนลด (%)
            </label>
            <input
              type="number"
              name="discount"
              min="0"
              max="100"
              value={form.discount}
              onChange={updateField}
              className="w-full rounded-lg border border-white/10 bg-[#09090f] p-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              คะแนนเกม
            </label>
            <input
              type="number"
              name="rating"
              min="0"
              max="10"
              step="0.1"
              value={form.rating}
              onChange={updateField}
              className="w-full rounded-lg border border-white/10 bg-[#09090f] p-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Platform
            </label>
            <input
              name="platform"
              value={form.platform}
              onChange={updateField}
              className="w-full rounded-lg border border-white/10 bg-[#09090f] p-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Region
            </label>
            <input
              name="region"
              value={form.region}
              onChange={updateField}
              className="w-full rounded-lg border border-white/10 bg-[#09090f] p-3 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-gray-400">
              URL รูปภาพเกม
            </label>
            <input
              name="poster"
              value={form.poster}
              onChange={updateField}
              className="w-full rounded-lg border border-white/10 bg-[#09090f] p-3 outline-none"
              placeholder="https://..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-gray-400">
              รายละเอียดเกม
            </label>
            <textarea
              name="detail"
              value={form.detail}
              onChange={updateField}
              rows="3"
              className="w-full rounded-lg border border-white/10 bg-[#09090f] p-3 outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500"
          >
            {editId === null ? 'เพิ่มเกม' : 'บันทึกการแก้ไข'}
          </button>

          {editId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-white/10 px-6 py-3 text-gray-300 hover:bg-white/5"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </form>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">รายการเกมทั้งหมด</h3>
        <span className="text-sm text-gray-400">{loading ? 'กำลังโหลด...' : `${games.length} เกม`}</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-[#171722] text-gray-400">
            <tr>
              <th className="p-4">เกม</th>
              <th className="p-4">แนวเกม</th>
              <th className="p-4">ราคาปกติ</th>
              <th className="p-4">ราคาขาย</th>
              <th className="p-4">จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {games.map((game) => (
              <tr key={game.id} className="border-t border-white/10">
                <td className="p-4 font-semibold">{game.title}</td>
                <td className="p-4 text-gray-400">{game.genre}</td>
                <td className="p-4">฿{Number(game.price).toLocaleString('th-TH')}</td>
                <td className="p-4 text-purple-400">
                  ฿{Number(game.discountPrice).toLocaleString('th-TH')}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => editGame(game)}
                      className="rounded-lg bg-blue-500/10 px-3 py-2 text-blue-400 hover:bg-blue-500/20"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => removeGame(game.id)}
                      className="rounded-lg bg-red-500/10 px-3 py-2 text-red-400 hover:bg-red-500/20"
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && games.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            ยังไม่มีเกมในร้านค้า
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminGames;
