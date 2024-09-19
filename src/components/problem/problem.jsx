// "use client";
// import React, { useState, useRef, useEffect } from "react";
import styles from "../problem/problem.module.css"

const Problem = () => {
    return (
        <main className={styles.mainContainer}>
            <div className={styles.container}>
                <div className={styles.prblm}>
                    <span className={styles.prblmText}>The Problem</span>
                </div>
                <div className={styles.miniContainer}>
                    <div className={styles.text}>
                        <h2 className={styles.title}>Secure data handling challenges businesses</h2>
                        <div className={styles.points}>
                            <p className={styles.point}>Data breaches risk sensitive information</p>
                            <p className={styles.point}>Manual redaction is time-consuming and error-prone</p>
                            <p className={styles.point}>Compliance with data protection regulations is complex</p>
                        </div>
                    </div>
                    <div className={styles.dragComp}>
                        <div className={styles.drag}>
                            <p className={styles.dragText1}>data breaches</p>
                            <p className={styles.dragText2}>time consuming</p>
                            <p className={styles.dragText3}>data exposure</p>
                            <p className={styles.dragText4}>saftey improved</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Problem;