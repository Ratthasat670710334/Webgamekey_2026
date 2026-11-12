
import { useNavigate } from 'react-router-dom';

function MovieCard({ movie, onSelectGame }) {
  const game = movie;
  const navigate = useNavigate();

  const openDetail = () => {
    if (onSelectGame) {
      onSelectGame(game);
    } else {
      navigate(`/game/${game.id}`);
    }
  };

  return (
    <div
      onClick={openDetail}
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#14141f] transition duration-300 hover:-translate-y-1 hover:border-purple-500/60 hover:shadow-xl hover:shadow-purple-950/30"
    >
      <div className="relative overflow-hidden">
        <img
          src={game.poster}
          alt={game.title}
          loading="lazy"
          className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />

        <span className="absolute left-3 top-3 rounded-lg bg-purple-600 px-3 py-1 text-xs font-bold text-white">
          -{game.discount}%
        </span>

        <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 text-xs text-gray-200">
          {game.platform}
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate font-bold text-white" title={game.title}>
          {game.title}
        </h3>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>{game.genre}</span>
          <span>{game.region}</span>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500 line-through">
              ฿{game.price.toLocaleString('th-TH')}
            </p>

            <p className="text-xl font-bold text-purple-400">
              ฿{game.discountPrice.toLocaleString('th-TH')}
            </p>
          </div>

          <span className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 transition group-hover:bg-purple-600 group-hover:text-white">
            ดูรายละเอียด
          </span>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
