import styles from "./docfeat.module.css";
import Image from 'next/image';


const DocFeat = () => {
    return (
        <main className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.image}>
                    <Image src={"/imgRedact.png"} width={343} height={281} alt="image lock" className={styles.imgImage}/>
                </div>
                <div className={styles.text}>
                    <h2 className={styles.title}>Document Redaction</h2>
                    <p className={styles.titleText}>Detect and remove sensitive information in your documents. Click the button to use it!</p>
                    <a href="/docs" className={styles.imageButton}>
                        Try PIReT for docs
                    </a>
                </div>
            </div>
        </main>
    );
};

export default DocFeat;