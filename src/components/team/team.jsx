import Image from "next/image";
import styles from "../team/team.module.css";
import Link from "next/link";

const TeamCard = ({name, img, role, likedin, twitter}) => {
    return (
        <main className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.imgDiv}>
                    <Image src={img} alt="Name" className={styles.imgp} width={142} height={142} />
                </div>
                <div className={styles.text}>
                    <h2 className={styles.name}>
                    {name === 'Bhagyansh' ? (
                        <>
                        Bhagyansh<br />
                        {/* Bhargava */}
                        </>
                    ) : (
                        name
                    )}
                    </h2>
                    <p className={styles.role}><i>{role}</i></p>
                    <Link href={likedin} target="_blank" className={styles.linkp}>LinkedIn</Link>
                    <Link href={twitter} target="_blank" className={styles.linkp}>Twitter</Link>
                </div>
            </div>
        </main>
    )
}

export default TeamCard;