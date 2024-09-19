'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import { Search } from 'lucide-react'

import Problem from "../components/problem/problem";
import RedactionComponent from '../components/redact/redaction';
import ImageFeat from "../components/imgfeat/imgfeat";
import DocFeat from "../components/docfeat/docfeat";
import TeamCard from "../components/team/team";

import styles from "../app/page.module.css"
import Image from 'next/image';

export default function RedactLanding() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const nameRef = useRef(null);
  const [nameHoverPosition, setNameHoverPosition] = useState({ x: 0, y: 0 });
  const [isNameHovered, setIsNameHovered] = useState(false);

  const blurProps = useSpring({
    opacity: 0.5,
    config: { mass: 1, tension: 280, friction: 60 },
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // const cursorFollow = useEffect(() => {
  //   return (`translate(${cursorPosition.x}px, ${cursorPosition.y + window.scrollY}px)`);
  // })

  const handleNameMouseMove = useCallback((e) => {
    if (nameRef.current) {
      const rect = nameRef.current.getBoundingClientRect();
      setNameHoverPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  return (
    <div className={styles.redactLanding}>
      <animated.div
        style={{
          ...blurProps,
          transform: `translate(${cursorPosition.x}px, ${cursorPosition.y + (typeof window !== "undefined" ? window.scrollY : 0)}px)`,
        }}
        className="cursor-blur"
        aria-hidden="true"
      />

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <div className={styles.heroSection}>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                <span>Secure your text with<br /></span>{' '}
                <span 
                  ref={nameRef}
                  className={`brand-name ${isNameHovered ? 'hovered' : ''}`}
                  onMouseEnter={() => setIsNameHovered(true)}
                  onMouseLeave={() => setIsNameHovered(false)}
                  onMouseMove={handleNameMouseMove}
                >
                  <div className={styles.title}>PIReT</div>
                  
                  {isNameHovered && (
                    <div 
                      className="hover-circle"
                      style={{
                        left: `${nameHoverPosition.x - 25}px`,
                        top: `${nameHoverPosition.y - 25}px`,
                      }}
                    />
                  )}
                  {isNameHovered && (
                    <Search 
                      className="search-icon"
                      style={{
                        left: `${nameHoverPosition.x - 12}px`,
                        top: `${nameHoverPosition.y - 12}px`,
                      }}
                    />
                  )}
                </span>
              </h1>
              <p className={styles.heroSubtitle}>
                Private Information Redaction Tool protects sensitive information with our advanced redaction tool. Easily obscure confidential data in your documents.
              </p>
              <div className={styles.ctaButtons}>
                <button className={styles.ctaButtonPrimary}>Get started</button>
                <button className={styles.ctaButtonSecondary}>Learn more</button>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.redactCircle}>
                <div className={styles.pulseCircle}></div>
                <div className={styles.pulseCircle}></div>
                <div className={styles.pulseCircle}></div>
                <div className={styles.pulseCircle}></div>
                <div className={styles.imageContainer}>
                  <div className={styles.p1Container}>
                    <Image src="/bg2.png" alt="Rotating circle 1" width={500} height={500} className={styles.p1} />
                  </div>
                  <div className={styles.p3Container}>
                    <Image src="/p3.svg" alt="PIReT" width={200} height={200} className={styles.p3} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.styleDiv1}></div>
        <Problem />
        <div className={styles.styleDiv1}></div>
        <RedactionComponent />
        <div className={styles.styleDiv1}></div>
        <ImageFeat />
        <div className={styles.styleDiv1}></div>
        <DocFeat />
        <div className={styles.styleDiv1}></div>
        <div className={styles.styleDiv1}></div>
      </main>
    </div>
  );
}

