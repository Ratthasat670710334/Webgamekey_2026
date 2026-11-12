
import { useState } from 'react';
import GameCard from './GameCard';

const PER_PAGE = 4;

function FeaturedCarousel({ movies = [], onSelectGame }) {
  const [page, setPage] = useState(0);

  const total = Math.ceil(movies.length / PER_PAGE);

  if (movies.length === 0) {
    return (
      <p className="py-10 text-center text-gray-500">
        ยังไม่มีเกมแนะนำ
      </p>
    );
  }

  const shown = movies.slice(
    page * PER_PAGE,
    page * PER_PAGE + PER_PAGE
  );

  const prev = () => setPage(p => (p - 1 + total) % total);
  const next = () => setPage(p => (p + 1) % total);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {shown.map(game => (
          <GameCard
            key={game.id}
            movie={game}
            onSelectGame={onSelectGame}
          />
        ))}
      </div>

      {total > 1 && (
        <div className="mt-6 flex items-center justify-center gap-5 text-sm text-gray-400">
          <button
            onClick={prev}
            className="rounded-lg border border-white/10 bg-[#151520] px-4 py-2 transition hover:border-purple-500 hover:text-white"
          >
            ← ก่อนหน้า
          </button>

          <span>
            หน้า {page + 1} / {total}
          </span>

          <button
            onClick={next}
            className="rounded-lg border border-white/10 bg-[#151520] px-4 py-2 transition hover:border-purple-500 hover:text-white"
          >
            ถัดไป →
          </button>
        </div>
      )}
    </div>
  );
}

export default FeaturedCarousel;
