import { atom } from 'jotai'

export const playersAtom = atom<Player[]>([])
export const gameStateAtom = atom<'waiting' | 'playing' | 'ended'>('waiting')
export const robotWatchingAtom = atom<boolean>(true)

// Derived atoms for specific actions
export const addPlayerAtom = atom(
  null,
  (get, set, player: Player) => {
    const players = get(playersAtom)
    set(playersAtom, [...players, player])
  }
)

export const removePlayerAtom = atom(
  null,
  (get, set, id: string) => {
    const players = get(playersAtom)
    set(playersAtom, players.filter(p => p.id !== id))
  }
)

export const updatePlayerPositionAtom = atom(
  null,
  (get, set, { id, position }: { id: string; position: number }) => {
    const players = get(playersAtom)
    set(playersAtom, players.map(p => 
      p.id === id ? { ...p, position } : p
    ))
  }
)

export const eliminatePlayerAtom = atom(
  null,
  (get, set, id: string) => {
    const players = get(playersAtom)
    set(playersAtom, players.map(p =>
      p.id === id ? { ...p, isAlive: false } : p
    ))
  }
) 