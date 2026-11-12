
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeaturedCarousel from '../components/FeaturedCarousel';
import GameGrid from '../components/GameGrid';
import { getGames } from '../api/backend';

const categories = [
  'ทั้งหมด',
  'Action',
  'RPG',
  'Adventure',
  'Racing',
  'Horror',
  'Simulation',
  'Strategy',
  'Indie'
];

function Home() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ทั้งหมด');

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const items = await getGames();
        if (!ignore) {
          setGames(items);
          setStatus('success');
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setStatus('error');
        }
      }
    }
    load();
    return () => { ignore = true; };
  }, [reloadKey]);

  const openGameDetail = (game) => {
    navigate(`/game/${game.id}`, {
      state: { game: game }
    });
  };

  const featuredGames = games.filter((game) =>
    [1, 2, 3, 4, 6, 7].includes(game.id)
  );

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchSearch = game.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchCategory =
        category === 'ทั้งหมด' || game.genre === category;

      return matchSearch && matchCategory;
    });
  }, [games, search, category]);

  const mainGame = games[0];

  return (
    <div className="min-h-screen bg-[#09090f] text-white">

      <section className="relative overflow-hidden bg-gradient-to-r from-[#17102f] via-[#24104a] to-[#10152e]">
        <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div>
            <span className="inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
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
              ค้นพบเกมที่คุณชื่นชอบในราคาสุดพิเศษ
              รวมคีย์เกม PC เกมดัง และเกมยอดนิยมไว้ในที่เดียว
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#all-games"
                className="rounded-xl bg-purple-600 px-7 py-3 font-semibold transition hover:bg-purple-500"
              >
                เลือกซื้อเกม
              </a>

              <a
                href="#featured"
                className="rounded-xl border border-white/20 px-7 py-3 font-semibold transition hover:bg-white/10"
              >
                เกมแนะนำ
              </a>
            </div>

            <div className="mt-10 flex gap-10">
              <div>
                <p className="text-2xl font-bold">
                  {games.length}+
                </p>
                <p className="text-sm text-gray-500">เกมในร้าน</p>
              </div>

              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-sm text-gray-500">ออนไลน์ตลอดเวลา</p>
              </div>

              <div>
                <p className="text-2xl font-bold">SALE</p>
                <p className="text-sm text-gray-500">โปรโมชั่นพิเศษ</p>
              </div>
            </div>
          </div>

          <div className="relative">
            {mainGame && (
              <>
                <img
                  src={mainGame.poster}
                  alt={mainGame.title}
                  className="w-full cursor-pointer rounded-2xl border border-white/10 shadow-2xl shadow-purple-950/50"
                  onClick={() => openGameDetail(mainGame)}
                />

                <div className="absolute -bottom-5 left-4 rounded-xl border border-white/10 bg-[#171522] p-4 shadow-xl">
                  <p className="text-xs text-gray-400">FEATURED GAME</p>
                  <p className="mt-1 font-bold">{mainGame.title}</p>
                  <p className="mt-1 text-lg font-bold text-purple-400">
                    ฿{Number(mainGame.discountPrice).toLocaleString('th-TH')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-12 md:grid-cols-3 md:px-8">
        {[
          {
            icon: '⚡',
            title: 'Digital Game Key',
            detail: 'สินค้าคีย์เกมรูปแบบดิจิทัล'
          },
          {
            icon: '🎮',
            title: 'เกมหลากหลาย',
            detail: 'รวมเกมหลายแนวไว้ในที่เดียว'
          },
          {
            icon: '🔥',
            title: 'Special Offers',
            detail: 'พบกับเกมราคาพิเศษ'
          }
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#14141f] p-5"
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{item.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
            Handpicked for you
          </p>

          <h2 className="mt-2 text-3xl font-bold">เกมแนะนำ</h2>

          <p className="mt-2 text-sm text-gray-500">
            เกมยอดนิยมที่เราเลือกมาให้คุณ
          </p>
        </div>

        {status === 'success' ? (
          <FeaturedCarousel movies={featuredGames} onSelectGame={openGameDetail} />
        ) : (
          <GameGrid movies={[]} status={status} error={error} onRetry={() => setReloadKey((key) => key + 1)} />
        )}
      </section>

      <section id="all-games" className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
            Explore our collection
          </p>

          <h2 className="mt-2 text-3xl font-bold">เกมทั้งหมด</h2>

          <p className="mt-2 text-sm text-gray-500">
            ค้นหาเกมที่คุณต้องการ
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 ค้นหาชื่อเกม..."
          className="mb-6 w-full rounded-xl border border-white/10 bg-[#151520] px-5 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-500 md:max-w-md"
        />

        <div className="mb-7 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                category === item
                  ? 'bg-purple-600 text-white'
                  : 'border border-white/10 bg-[#151520] text-gray-400 hover:border-purple-500 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <GameGrid
          movies={filteredGames}
          status={status}
          error={error}
          onRetry={() => setReloadKey((key) => key + 1)}
          onSelectGame={openGameDetail}
        />

        <p className="mt-6 text-center text-sm text-gray-500">
          พบเกมทั้งหมด {filteredGames.length} รายการ
        </p>
      </section>

      <section className="mx-5 mb-16 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-[#21113e] to-[#111a35] px-6 py-12 text-center md:mx-auto md:max-w-7xl">
        <p className="text-sm font-semibold tracking-widest text-purple-400">
          READY TO PLAY?
        </p>

        <h2 className="mt-3 text-3xl font-black">
          เกมที่ใช่ รอคุณอยู่
        </h2>

        <p className="mt-3 text-gray-400">
          เลือกเกมโปรดแล้วเตรียมพร้อมสำหรับการผจญภัย
        </p>

        <a
          href="#all-games"
          className="mt-6 inline-block rounded-xl bg-purple-600 px-7 py-3 font-semibold hover:bg-purple-500"
        >
          ดูเกมทั้งหมด
        </a>
      </section>

    </div>
  );
}

export default Home;
