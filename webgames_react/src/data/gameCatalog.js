
import defaultGames from './games';

const GAMES_KEY = 'gamekey_games';

export function getGames() {
  try {
    const savedGames = localStorage.getItem(GAMES_KEY);

    if (savedGames !== null) {
      const parsedGames = JSON.parse(savedGames);
      return Array.isArray(parsedGames) ? parsedGames : defaultGames;
    }
  } catch {
    return defaultGames;
  }

  return defaultGames;
}

export function saveGames(games) {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
}
