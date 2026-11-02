import React from 'react'
import styles from './page.module.css'
import Card from '@/components/Card'
import TicTacToeImage from '/public/tic-tac-toe.svg'
import SudokuImage from '/public/SudokuLogo.webp'
import SchulteImage from '/public/SchulteImage.webp'
import MemoryFlip from '/public/MemoryFlip.png'
import BulletMath from '/public/BulletMath.png'
import SimonSaysImage from '/public/SimonSays.png'
import Puzzle2560Image from '/public/puzzle-2560.svg'

const SelectGame = () => {
  return (
    <>
      <div id={styles.bgGrid}>
        <div id={styles.blurGrid}></div>
      </div>

      <div>
        <h1>Choose Your Game</h1>
      </div>

      <div className={styles.cardContainer}>
        <Card
          image={TicTacToeImage}
          name={'Tic Tac Toe'}
          link={'tic-tac-toe/single-player'}
          backgroundColor={'#FF3737'}
          textColor={'white'}
        />
        <Card
          image={SudokuImage}
          name={'Sudoku'}
          link={'sudoku'}
          backgroundColor={'#22C55E'}
        />
        <Card
          image={SchulteImage}
          name={'Schulte Table'}
          link={'schulte-table'}
          backgroundColor={'#3B82F6'}
          textColor={'white'}
        />
        <Card
          image={MemoryFlip}
          name={'Memory Flip Card'}
          link={'memory-flip-card'}
          backgroundColor={'#760172'}
          textColor={'white'}
        />
        <Card 
          image={BulletMath} 
          name={'Bullet Math'} 
          link={'bullet-math'} 
          backgroundColor={'#F59E0B'} 
          textColor={'white'} 
        />
        <Card
          image={SimonSaysImage}
          name={'Simon Says'}
          link={'simon-says'}
          backgroundColor={'#9333EA'}
          textColor={'white'}
        />
        <Card
          image={Puzzle2560Image}
          name={'2560 O.S.G'}
          link={'2050-puzzle'}
          backgroundColor={'#0F766E'}
          textColor={'white'}
        />
      </div>
    </>
  )
}

export default SelectGame
