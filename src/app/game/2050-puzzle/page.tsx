import type { Metadata } from 'next'
import styles from './page.module.css'
import Game from './Game'
import { GAME_NAME, MODES } from './Puzzle2050'

export const metadata: Metadata = {
  title: `${GAME_NAME} | Old School Game`,
  description:
    'A slow-paced sliding-tile puzzle on a 4x4 grid. Merge equal tiles, plan ahead and reach the goal.',
}

const Page = () => {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{GAME_NAME}</h1>
      <p className={styles.subtitle}>
        Slide, merge and plan ahead. Reach {MODES.normal.target} (Normal) or{' '}
        {MODES.pro.target} (Pro).
      </p>

      <Game />

      <div className={styles.docs}>
        <section aria-labelledby="how-to-play">
          <h2 id="how-to-play">How to Play</h2>
          <ol>
            <li>
              Move all tiles with the <strong>arrow keys</strong> (or{' '}
              <strong>swipe</strong> on the board on mobile). Every tile slides as far as it
              can in that direction.
            </li>
            <li>
              When two tiles with the <strong>same number</strong> collide, they merge into
              one tile with the double value (5 + 5 → 10, 10 + 10 → 20…).
            </li>
            <li>
              Each valid move adds a new tile (5 or 10) to an empty cell. Moves that change
              nothing do not add a tile.
            </li>
            <li>
              <strong>Normal:</strong> merge two <strong>1280</strong> tiles to form{' '}
              <strong>2560</strong> and win.
            </li>
            <li>
              <strong>Pro:</strong> merge two <strong>5120</strong> tiles to form{' '}
              <strong>10240</strong> and win.
            </li>
            <li>You lose when the board is full and no neighbouring tiles can merge.</li>
          </ol>
          <p className={styles.chain}>
            5 → 10 → 20 → 40 → 80 → 160 → 320 → 640 → 1280 → 2560 → 5120 → 10240
          </p>
          <p>
            The final tile is never placed on the board: the game ends the moment the two
            last tiles merge. Tip: keep your biggest tile in a corner and think a few
            moves ahead. There is no timer, so take your time.
          </p>
        </section>
      </div>
    </main>
  )
}

export default Page
