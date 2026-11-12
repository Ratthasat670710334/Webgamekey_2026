
import MovieCard from './MovieCard';

function MovieGrid({ movies, status, error, onRetry, onSelectGame }) {
  if (status === 'loading') {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-[#14141f]"
          >
            <div className="aspect-video bg-[#252535]" />

            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 rounded bg-[#252535]" />
              <div className="h-3 w-1/2 rounded bg-[#252535]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
        <p className="font-semibold text-red-400">
          โหลดข้อมูลไม่สำเร็จ
        </p>

        <p className="mt-2 text-sm text-gray-400">
          {error?.message}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300"
          >
            ลองใหม่
          </button>
        )}
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <p className="py-16 text-center text-gray-500">
        🎮 ไม่พบเกมที่ค้นหา ลองค้นหาด้วยคำอื่น
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {movies.map(game => (
        <MovieCard
          key={game.id}
          movie={game}
          onSelectGame={onSelectGame}
        />
      ))}
    </div>
  );
}

export default MovieGrid;
