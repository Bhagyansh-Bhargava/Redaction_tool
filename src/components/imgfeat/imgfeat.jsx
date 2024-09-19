"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import styles from "./imgfeat.module.css";
import Image from 'next/image';


const ImageFeat = () => {
    const [message, setMessage] = useState('');
    const router = useRouter();

    const checkIP = async () => {
        try {
        const res = await fetch('/api');
        const data = await res.json();
        
        if (res.status === 200) {
            setMessage('Redirecting to images page...');
            setTimeout(() => {
            router.push('/image'); // Redirect to the images page if IP is whitelisted
            }, 3000); // Redirect after 3 seconds
        } else {
            setMessage(data.message); // Show the error message for forbidden IP
            setTimeout(() => {
            router.push('/'); // Redirect back to home after a few seconds
            }, 3000); // Redirect after 3 seconds
        }
        } catch (error) {
        setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.text}>
                    <h2 className={styles.title}>Image Redaction</h2>
                    <p className={styles.titleText}>Detect and remove sensitive visual information. Click the button to use it!</p>
                    <a href="/image" className={styles.imageButton}>
                        Try PIReT for images
                    </a>
                    {/* <button onClick={checkIP} className={styles.imageButton}>Try PIReT for images</button> */}
                    {message && <p>{message}</p>} {/* Display message */}
                </div>
                <div className={styles.image}>
                    <Image src={"/imgRedact.png"} width={343} height={281} alt="image lock" className={styles.imgImage}/>
                </div>
            </div>
        </main>
    );
};

export default ImageFeat;