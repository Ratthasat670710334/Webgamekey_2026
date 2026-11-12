
const INVENTORY_KEY = 'gamekey_inventory';

function createKeys(game) {
  const prefix = String(game.title)
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 4)
    .toUpperCase()
    .padEnd(4, 'X');

  const keys = [];

  for (let i = 1; i <= 100; i++) {
    const part1 = String(game.id)
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();

    const part2 = i.toString(36).toUpperCase().padStart(4, '0');
    const part3 = (i * 7919).toString(36).toUpperCase().padStart(4, '0');

    keys.push(`${prefix}-${part1}-${part2}-${part3}`);
  }

  return keys;
}

function getInventory() {
  try {
    return JSON.parse(localStorage.getItem(INVENTORY_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveInventory(inventory) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

export function getGameKeys(game) {
  const inventory = getInventory();
  const gameId = String(game.id);

  if (!Array.isArray(inventory[gameId])) {
    inventory[gameId] = createKeys(game);
    saveInventory(inventory);
  }

  return inventory[gameId];
}

export function addGameKeys(game, newKeys) {
  const inventory = getInventory();
  const gameId = String(game.id);

  if (!Array.isArray(inventory[gameId])) {
    inventory[gameId] = createKeys(game);
  }

  const currentKeys = inventory[gameId];

  newKeys.forEach((key) => {
    const cleanKey = String(key).trim();

    if (cleanKey !== '' && !currentKeys.includes(cleanKey)) {
      currentKeys.push(cleanKey);
    }
  });

  saveInventory(inventory);

  return currentKeys;
}

export function deleteGameKey(game, key) {
  const inventory = getInventory();
  const gameId = String(game.id);

  if (!Array.isArray(inventory[gameId])) {
    return [];
  }

  inventory[gameId] = inventory[gameId].filter(
    (item) => item !== key
  );

  saveInventory(inventory);

  return inventory[gameId];
}

export function purchaseGameKeys(game, quantity) {
  const inventory = getInventory();
  const gameId = String(game.id);

  if (!Array.isArray(inventory[gameId])) {
    inventory[gameId] = createKeys(game);
  }

  if (inventory[gameId].length < quantity) {
    throw new Error(
      `คีย์เกมเหลือไม่เพียงพอ มีเหลือ ${inventory[gameId].length} คีย์`
    );
  }

  const purchasedKeys = inventory[gameId].slice(0, quantity);

  inventory[gameId] = inventory[gameId].slice(quantity);

  saveInventory(inventory);

  return purchasedKeys;
}
