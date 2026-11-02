import React from 'react';
import styles from './card.module.css';
import Image from "next/image";
import Link from "next/link";
import { StaticImageData } from 'next/image';

type CardProps = {
    image: StaticImageData;
    name: string;
    link: string;
    backgroundColor: string;
    textColor?:string;
}

const Card = (props: CardProps) => {
    return (
        <>
            <Link href={`/game/${props.link}`} prefetch={true}>
                <div className={styles.singleCardContainer} style={{backgroundColor: props.backgroundColor}}>
                    <div className={styles.cardImageContainer}>
                        <Image src={props.image} alt={props.name} width={100} height={88} />
                    </div>
                    <div className={styles.cardTextContainer}>
                        <p style={{color: props.textColor}}>{props.name}</p>
                    </div>
                </div>
            </Link>
        </>
    );
};

export default Card;
