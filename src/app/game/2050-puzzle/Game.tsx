'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './page.module.css'
import {
  MODES,
  Direction,
  Grid,
  Mode,
  Status,
  canMove,
  createInitialGrid,
  flattenTiles,
  move,
  parseStoredScore,
  spawnTile,
  valueOf,
} from './Puzzle2050'

const SWIPE_MIN = 30
const STORAGE_KEY: Record<Mode, string> = {
  normal: 'puzzle-best-normal',
  pro: 'puzzle-best-pro',
}
const KEY_TO_DIR: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

const readBest = (mode: Mode): number => {
  try {
    return parseStoredScore(window.localStorage.getItem(STORAGE_KEY[mode]))
  } catch {
    return 0
  }
}

const writeBest = (mode: Mode, value: number) => {
  try {
    window.localStorage.setItem(STORAGE_KEY[mode], String(value))
  } catch {
    /* storage unavailable (private mode, quota): ignore */
  }
}

const Game = () => {
  const [mode, setMode] = useState<Mode>('normal')
  const [grid, setGrid] = useState<Grid | null>(null)
  const [nextId, setNextId] = useState(1)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [status, setStatus] = useState<Status>('playing')
  const [pendingMode, setPendingMode] = useState<Mode | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const startGame = useCallback((m: Mode) => {
    const init = createInitialGrid()
    setMode(m)
    setGrid(init.grid)
    setNextId(init.nextId)
    setScore(0)
    setStatus('playing')
    setBest(readBest(m))
  }, [])

  // Random board is generated on the client only (avoids hydration mismatch).
  useEffect(() => {
    startGame('normal')
  }, [startGame])

  const handleMove = useCallback(
    (dir: Direction) => {
      if (!grid || status !== 'playing' || pendingMode) return
      const res = move(grid, dir, mode, nextId)
      if (!res.moved) return

      const newScore = score + res.gained
      setScore(newScore)
      if (newScore > best) {
        setBest(newScore)
        writeBest(mode, newScore)
      }

      if (res.won) {
        setGrid(res.grid)
        setNextId(res.nextId)
        setStatus('won')
        return
      }

      const spawned = spawnTile(res.grid, res.nextId, mode)
      setGrid(spawned.grid)
      setNextId(spawned.nextId)
      if (!canMove(spawned.grid)) setStatus('lost')
    },
    [grid, status, pendingMode, mode, nextId, score, best],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIR[e.key]
      if (!dir) return
      if (e.ctrlKey || e.altKey || e.metaKey) return
      if (status !== 'playing' || pendingMode) return
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return
      e.preventDefault()
      if (e.repeat) return
      handleMove(dir)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleMove, status, pendingMode])

  useEffect(() => {
    if (!pendingMode) return
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPendingMode(null)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [pendingMode])

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    if (t) touchStart.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    const t = e.changedTouches[0]
    if (!start || !t) return
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 'right' : 'left')
    else handleMove(dy > 0 ? 'down' : 'up')
  }

  const requestMode = (m: Mode, el: HTMLElement) => {
    el.blur()
    if (m === mode) return
    if (score > 0 && status === 'playing') setPendingMode(m)
    else startGame(m)
  }

  const tiles = grid ? flattenTiles(grid) : []
  const target = MODES[mode].target

  return (
    <section className={styles.game} aria-label="Game">
      <div className={styles.toggle} role="group" aria-label="Difficulty">
        {(Object.keys(MODES) as Mode[]).map(m => (
          <button
            key={m}
            type="button"
            className={`${styles.toggleBtn} ${mode === m ? styles.toggleActive : ''}`}
            aria-pressed={mode === m}
            aria-label={`${MODES[m].label} mode, goal ${MODES[m].target}`}
            onClick={e => requestMode(m, e.currentTarget)}
          >
            {MODES[m].label} · {MODES[m].target}
          </button>
        ))}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Score</span>
          <span className={styles.statValue}>{score}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Best</span>
          <span className={styles.statValue}>{best}</span>
        </div>
        <button
          type="button"
          className={styles.restartBtn}
          aria-label="Restart game"
          onClick={e => {
            e.currentTarget.blur()
            startGame(mode)
          }}
        >
          Restart
        </button>
      </div>

      <div
        className={styles.board}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-label="Game board"
      >
        <div className={styles.cells} aria-hidden="true">
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} className={styles.cell} />
          ))}
        </div>
        <div className={styles.tiles}>
          {tiles.map(t => (
            <div
              key={t.id}
              className={styles.tile}
              style={{ '--r': t.row, '--c': t.col } as React.CSSProperties}
            >
              <div
                className={`${styles.tileInner} ${styles[`k${t.k}`]} ${
                  t.isNew ? styles.appear : ''
                } ${t.merged ? styles.merge : ''}`}
              >
                {valueOf(t.k)}
              </div>
            </div>
          ))}
        </div>

        {status !== 'playing' && (
          <div className={styles.overlay} role="status">
            <p className={styles.overlayTitle}>
              {status === 'won' ? `You reached ${target}! 🎉` : 'No more moves'}
            </p>
            <p className={styles.overlayScore}>Score: {score}</p>
            <div className={styles.overlayActions}>
              <button type="button" className={styles.restartBtn} onClick={() => startGame(mode)}>
                Play again
              </button>
              <button
                type="button"
                className={styles.restartBtn}
                onClick={() => startGame(mode === 'normal' ? 'pro' : 'normal')}
              >
                Switch to {mode === 'normal' ? 'Pro' : 'Normal'}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className={styles.hint}>Arrow keys or swipe on the board to move the tiles.</p>

      {pendingMode && (
        <div className={styles.modalBackdrop}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <h2 id="confirm-title">Change mode?</h2>
            <p>Your current game will be lost.</p>
            <div className={styles.overlayActions}>
              <button
                type="button"
                className={styles.restartBtn}
                autoFocus
                onClick={() => {
                  const m = pendingMode
                  setPendingMode(null)
                  startGame(m)
                }}
              >
                Change
              </button>
              <button
                type="button"
                className={styles.restartBtn}
                onClick={() => setPendingMode(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Game
