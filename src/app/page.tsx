// "use client";

import Image from "next/image";
import Link from "next/link";
import TicTacToeImage from "/public/tic-tac-toe.svg";
import styles from "./page.module.css";

// import { useRouter } from 'next/navigation'; // Import useRouter from Next.js
// import io from 'socket.io-client'; // Import Socket.io client library
// Connect to the Socket.io server using the URL from environment variables or default to localhost
// const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');

export default function Home() {

    // const router = useRouter();
    // const handleCreateGame = () => {
    //     socket.emit('createGame'); // Emit create game event to the server
    //     socket.on('gameCreated', ({ gameNumber }) => { // get 'gameCreated' code from the server
    //         // Automatically redirect to the game page once the game is created
    //         router.push(`/game/tic-tac-toe/${gameNumber}/X`);
    //     });
    // };


    return (
        <header className={styles.headerContainer}>
            <div id={styles.bgGrid}>
                <div id={styles.blurGrid}></div>
            </div>

            <div className={styles.heroSection}>
                <div className={styles.tictactoeImageConatiner}>
                    <Image src={TicTacToeImage} alt={"tic-tac-toe.svg"} width={"100"} height={"88"} loading={"eager"} priority={true} />
                </div>
                <h1>Unlock Your Mind&apos;s Potential</h1>
                <p>Train Smarter, Not Harder!</p>

                <div className={styles.urlConatiner}>
                    <div className={styles.tictactoeUrlConatiner}>
                        {/*<button className={styles.tictactoeButton} onClick={handleCreateGame}>Start Game</button>*/}
                        <Link href="/game" prefetch={true}>Start Game</Link>
                        {/*<Link href="/game/tic-tac-toe">Start Game</Link>*/}
                    </div>
                    <div className={styles.githubUrlConatiner}>
                        <Link href="https://github.com/ajaynegi45/Time-Pass">See Github</Link>
                    </div>
                </div>
            </div>
        </header>
    );
}


// "dev": "concurrently \"next dev\" \"npm run websocket:dev\"",