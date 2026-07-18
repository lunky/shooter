import { store } from "./store";
import type { SavedGame, PeriodScore } from "./types";

const KEY = "savedGames";

export async function saveGame(data: {
  homeTeam: string;
  badGuys: string;
  game: PeriodScore[];
  goals: PeriodScore[];
}): Promise<void> {
  const existing = (await store.get<SavedGame[]>(KEY)) ?? [];
  const entry: SavedGame = { ...data, id: Date.now().toString(), savedAt: new Date().toISOString() };
  await store.set(KEY, [...existing, entry]);
}

export async function listGames(): Promise<SavedGame[]> {
  return (await store.get<SavedGame[]>(KEY)) ?? [];
}

export async function updateGame(id: string, patch: Partial<Pick<SavedGame, "homeTeam" | "badGuys">>): Promise<void> {
  const existing = (await store.get<SavedGame[]>(KEY)) ?? [];
  await store.set(KEY, existing.map(g => g.id === id ? { ...g, ...patch } : g));
}

export async function deleteGame(id: string): Promise<void> {
  const existing = (await store.get<SavedGame[]>(KEY)) ?? [];
  await store.set(KEY, existing.filter(g => g.id !== id));
}
