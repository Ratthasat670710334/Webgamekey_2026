
import { Link } from 'react-router-dom';

function MovieCard({ movie, onSelectGame }) {
  const game = movie;
  const openDetail = () => {
    if (onSelectGame) {
      onSelectGame(game);
    }
  };

  return (
    <Link
      to={`/game/${game.id}`}
      onClick={(event) => {
        if (onSelectGame) {
          event.preventDefault();
          openDetail();
        }
      }}
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#14141f] transition duration-300 hover:-translate-y-1 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-950/30"
    >
      <div className="relative overflow-hidden">
        {game.poster ? (
          <img
            src={game.poster}
            alt={game.title}
            loading="lazy"
            className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="grid aspect-video place-items-center bg-gradient-to-br from-purple-950 to-[#252535] text-4xl">
            🎮
          </div>
        )}

        {Number(game.discount ?? 0) > 0 && (
          <span className="absolute left-3 top-3 rounded-lg bg-purple-600 px-3 py-1 text-xs font-bold text-white">
            -{Number(game.discount)}%
          </span>
        )}

        <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 text-xs text-gray-200">
          {game.platform ?? 'Digital Key'}
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate font-bold text-white" title={game.title}>
          {game.title}
        </h3>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>{game.genre ?? 'Digital Key'}</span>
          <span>{game.region ?? 'Global'}</span>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            {Number(game.discountPrice ?? game.price ?? 0) < Number(game.price ?? 0) && (
              <p className="text-xs text-gray-500 line-through">
                ฿{Number(game.price ?? 0).toLocaleString('th-TH')}
              </p>
            )}

            <p className="text-xl font-bold text-purple-400">
              ฿{Number(game.discountPrice ?? game.price ?? 0).toLocaleString('th-TH')}
            </p>
          </div>

          <span className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 transition group-hover:bg-purple-600 group-hover:text-white">
            ดูรายละเอียด
          </span>
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;
