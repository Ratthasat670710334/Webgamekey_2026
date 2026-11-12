import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeaturedCarousel from '../components/FeaturedCarousel';
import MovieGrid from '../components/MovieGrid';
import { getCoupons, searchCoupons } from '../api/backend';

function Home() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ทั้งหมด');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(async () => {
      setStatus('loading');
      setError(null);
      try {
        const items = search.trim()
          ? await searchCoupons(search.trim())
          : await getCoupons();
        if (!ignore) {
          setGames(items);
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setStatus('error');
        }
      }
    }, search.trim() ? 250 : 0);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, reloadKey]);

  const categories = useMemo(
    () => ['ทั้งหมด', ...new Set(games.map((game) => game.genre).filter(Boolean))],
    [games]
  );
  const filteredGames = games.filter(
    (game) => category === 'ทั้งหมด' || game.genre === category
  );
  const featuredGames = games.slice(0, 6);
  const mainGame = games[0];

  const openGameDetail = (game) => navigate(`/game/${game.id}`);

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <section className="bg-gradient-to-r from-[#17102f] via-[#24104a] to-[#10152e]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div>
            <span className="rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
              🎮 DIGITAL GAME KEY STORE
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              LEVEL UP
              <br />
              YOUR <span className="text-purple-400">GAMING</span>
              <br />
              EXPERIENCE
            </h1>
            <p className="mt-5 max-w-lg leading-7 text-gray-400">
              เลือกซื้อแพ็กเกจเกมและคูปองที่เชื่อมต่อกับระบบ Gamekey
            </p>
            <a href="#all-games" className="mt-8 inline-block rounded-xl bg-purple-600 px-7 py-3 font-semibold hover:bg-purple-500">
              เลือกซื้อเกม
            </a>
          </div>
          {mainGame && (
            <button type="button" onClick={() => openGameDetail(mainGame)} className="rounded-2xl border border-white/10 bg-[#14141f] p-8 text-left shadow-2xl">
              <p className="text-xs text-gray-400">FEATURED PACKAGE</p>
              <p className="mt-3 text-2xl font-bold">{mainGame.title}</p>
              <p className="mt-2 text-sm text-gray-400">{mainGame.genre}</p>
              <p className="mt-4 text-2xl font-black text-purple-400">
                ฿{mainGame.price.toLocaleString('th-TH')}
              </p>
            </button>
          )}
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <h2 className="mb-6 text-3xl font-bold">แพ็กเกจแนะนำ</h2>
        <FeaturedCarousel movies={featuredGames} onSelectGame={openGameDetail} />
      </section>

      <section id="all-games" className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <h2 className="text-3xl font-bold">แพ็กเกจทั้งหมด</h2>
        <p className="mt-2 text-sm text-gray-400">
          ข้อมูลสินค้าและราคาจาก API
          {status === 'success' && ` · พบ ${filteredGames.length} รายการ`}
        </p>
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setCategory('ทั้งหมด');
            setSearch(event.target.value);
          }}
          placeholder="ค้นหาชื่อเกมหรือแพ็กเกจ..."
          className="my-6 w-full rounded-xl border border-white/10 bg-[#151520] px-5 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500 md:max-w-md"
        />
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-lg px-4 py-2 text-sm ${
                category === item ? 'bg-purple-600' : 'border border-white/10 bg-[#151520] text-gray-400'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <MovieGrid
          movies={filteredGames}
          status={status}
          error={error}
          onRetry={() => setReloadKey((key) => key + 1)}
          onSelectGame={openGameDetail}
        />
      </section>
    </div>
  );
}

export default Home;
