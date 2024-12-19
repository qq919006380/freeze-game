import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface Player {
  id: string;
  position: number;
  isAlive: boolean;
  // ... other player properties
}

// 基础状态原子
export const playersAtom = atom<Array<Player>>([]);
export const gameStateAtom = atom<'waiting' | 'playing' | 'ended'>('waiting');
export const robotWatchingAtom = atom<boolean>(true);

// 派生原子用于修改状态
export const addPlayerAtom = atom(
  null,
  (get, set, player: Player) => {
    const players = get(playersAtom);
    set(playersAtom, [...players, player]);
  }
);

export const removePlayerAtom = atom(
  null,
  (get, set, id: string) => {
    const players = get(playersAtom);
    set(playersAtom, players.filter(p => p.id !== id));
  }
);

export const updatePlayerPositionAtom = atom(
  null,
  (get, set, update: { id: string; position: number }) => {
    const players = get(playersAtom);
    set(playersAtom, players.map(p =>
      p.id === update.id ? { ...p, position: update.position } : p
    ));
  }
);

export const eliminatePlayerAtom = atom(
  null,
  (get, set, id: string) => {
    const players = get(playersAtom);
    set(playersAtom, players.map(p =>
      p.id === id ? { ...p, isAlive: false } : p
    ));
  }
);