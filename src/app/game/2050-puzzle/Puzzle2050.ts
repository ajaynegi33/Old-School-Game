/**
 * Pure game logic for "2560 O.S.G" (no React, no side effects).
 *
 * Tiles store an exponent `k`; the displayed value is 5 * 2^k.
 * An empty cell is always `null` (never 0, because k = 0 is the tile "5").
 */

export const GAME_NAME = '2560 O.S.G'
export const SIZE = 4

export type Mode = 'normal' | 'pro'
export type Direction = 'up' | 'down' | 'left' | 'right'
export type Status = 'playing' | 'won' | 'lost'

export interface Tile {
  id: number
  k: number
  row: number
  col: number
  isNew?: boolean
  merged?: boolean
}

export type Cell = Tile | null
export type Grid = Cell[][]
export type Rng = () => number

export interface ModeConfig {
  maxK: number
  label: string
  target: number
  spawnHigh: number
}

/** maxK = highest exponent that may exist on the board. Merging two of them wins. */
export const MODES: Record<Mode, ModeConfig> = {
  normal: { maxK: 8, label: 'Normal', target: 2560, spawnHigh: 0.45 },
  pro: { maxK: 10, label: 'Pro', target: 10240, spawnHigh: 0.25 },
}

export const valueOf = (k: number): number => 5 * 2 ** k

export const emptyGrid = (): Grid =>
  Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(null))

export interface MoveResult {
  grid: Grid
  gained: number
  moved: boolean
  won: boolean
  nextId: number
}

export interface SlideResult {
  line: Cell[]
  gained: number
  won: boolean
  nextId: number
}

/**
 * Slides one line towards index 0.
 * 1) compact, 2) merge equal neighbours once per move, 3) pad with null.
 * Two tiles with k === maxK vanish (victory) instead of creating a new tile.
 */
export const slideLineStart = (
  line: Cell[],
  maxK: number,
  nextId: number,
): SlideResult => {
  const tiles = line.filter((c): c is Tile => c !== null)
  const out: Cell[] = []
  let gained = 0
  let won = false
  let id = nextId

  for (let i = 0; i < tiles.length; i++) {
    const cur = tiles[i]
    const next = tiles[i + 1]
    if (next && next.k === cur.k) {
      gained += valueOf(cur.k + 1)
      if (cur.k === maxK) {
        won = true
      } else {
        out.push({ id: id++, k: cur.k + 1, row: 0, col: 0, merged: true })
      }
      i++ // both tiles consumed
    } else {
      out.push({ ...cur, isNew: false, merged: false })
    }
  }
  while (out.length < SIZE) out.push(null)
  return { line: out, gained, won, nextId: id }
}

/** Maps (line index, position in line) to grid coordinates for a direction. */
const coord = (dir: Direction, line: number, pos: number): [number, number] => {
  switch (dir) {
    case 'left':
      return [line, pos]
    case 'right':
      return [line, SIZE - 1 - pos]
    case 'up':
      return [pos, line]
    default:
      return [SIZE - 1 - pos, line]
  }
}

export const move = (
  grid: Grid,
  dir: Direction,
  mode: Mode,
  nextId: number,
): MoveResult => {
  const { maxK } = MODES[mode]
  const result = emptyGrid()
  let gained = 0
  let won = false
  let id = nextId
  let moved = false

  for (let l = 0; l < SIZE; l++) {
    const input: Cell[] = []
    for (let p = 0; p < SIZE; p++) {
      const [r, c] = coord(dir, l, p)
      input.push(grid[r][c])
    }
    const s = slideLineStart(input, maxK, id)
    id = s.nextId
    gained += s.gained
    won = won || s.won
    for (let p = 0; p < SIZE; p++) {
      const [r, c] = coord(dir, l, p)
      const tile = s.line[p]
      result[r][c] = tile ? { ...tile, row: r, col: c } : null
      if ((grid[r][c]?.id ?? null) !== (tile?.id ?? null)) moved = true
    }
  }

  return { grid: result, gained, moved, won, nextId: id }
}

/** Adds one tile (k=1 with the mode's spawnHigh chance, else k=0) on a random empty cell. Returns the same grid if full. */
export const spawnTile = (
  grid: Grid,
  nextId: number,
  mode: Mode = 'pro',
  rng: Rng = Math.random,
): { grid: Grid; nextId: number } => {
  const empty: [number, number][] = []
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (!grid[r][c]) empty.push([r, c])
  if (empty.length === 0) return { grid, nextId }

  const [r, c] = empty[Math.min(empty.length - 1, Math.floor(rng() * empty.length))]
  const k = rng() < MODES[mode].spawnHigh ? 1 : 0
  const copy = grid.map(row => row.slice())
  copy[r][c] = { id: nextId, k, row: r, col: c, isNew: true }
  return { grid: copy, nextId: nextId + 1 }
}

export const createInitialGrid = (
  rng: Rng = Math.random,
): { grid: Grid; nextId: number } => {
  let state = { grid: emptyGrid(), nextId: 1 }
  state = spawnTile(state.grid, state.nextId, 'pro', rng)
  state = spawnTile(state.grid, state.nextId, 'pro', rng)
  return state
}

export const canMove = (grid: Grid): boolean => {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const t = grid[r][c]
      if (!t) return true
      if (c + 1 < SIZE && grid[r][c + 1]?.k === t.k) return true
      if (r + 1 < SIZE && grid[r + 1][c]?.k === t.k) return true
    }
  }
  return false
}

export const flattenTiles = (grid: Grid): Tile[] =>
  grid.flat().filter((c): c is Tile => c !== null)

/** Validates a value read from localStorage. */
export const parseStoredScore = (raw: string | null): number => {
  if (raw === null) return 0
  const n = Number(raw)
  return Number.isSafeInteger(n) && n >= 0 ? n : 0
}
