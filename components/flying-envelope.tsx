'use client';

import { useEffect, useId, useState, useSyncExternalStore, type CSSProperties } from 'react';
import styles from './flying-envelope.module.css';

const envelopeAnimation = {
  flightDuration: 3,
  flapOpenDuration: 0.8,
  cardRiseDuration: 0.95,
  floatDuration: 4.5,
  openDelay: 3.05,
  cardDelay: 3.45,
  sparkleDelay: 3.6,
};

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

type FlyingEnvelopeProps = {
  className?: string;
  'aria-label'?: string;
};

export function FlyingEnvelope({
  className = '',
  'aria-label': ariaLabel = 'Animated envelope delivering a thank-you message',
}: FlyingEnvelopeProps) {
  const reactId = useId().replace(/:/g, '');
  const bodyGradientId = `env-body-${reactId}`;
  const flapGradientId = `env-flap-${reactId}`;

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  const stageVars = {
    '--flight-duration': `${envelopeAnimation.flightDuration}s`,
    '--open-delay': `${envelopeAnimation.openDelay}s`,
    '--card-delay': `${envelopeAnimation.cardDelay}s`,
    '--sparkle-delay': `${envelopeAnimation.sparkleDelay}s`,
    '--float-duration': `${envelopeAnimation.floatDuration}s`,
    '--flap-duration': `${envelopeAnimation.flapOpenDuration}s`,
    '--card-duration': `${envelopeAnimation.cardRiseDuration}s`,
  } as CSSProperties;

  return (
    <div
      className={[styles.stage, animate && styles.animate, reducedMotion && styles.reduced, className]
        .filter(Boolean)
        .join(' ')}
      style={stageVars}
      role="img"
      aria-label={ariaLabel}
    >
      <div className={styles.trail} aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} className={styles.trailDot} style={{ '--i': index } as CSSProperties} />
        ))}
      </div>

      <div className={styles.flyer} aria-hidden="true">
        <div className={styles.float}>
          <div className={styles.envelope}>
            <div className={styles.card}>
              <svg className={styles.heart} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path
                  fill="#142560"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
              <span className={styles.check} aria-hidden="true">
                <svg viewBox="0 0 20 20" focusable="false">
                  <circle cx="10" cy="10" r="9" fill="#0f1c4a" />
                  <path
                    d="M6 10.2 L8.6 12.8 L14 7.2"
                    fill="none"
                    stroke="#F8F6EF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            <div className={styles.body}>
              <svg viewBox="0 0 160 90" className={styles.bodySvg} focusable="false" aria-hidden="true">
                <defs>
                  <linearGradient id={bodyGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F8F6EF" />
                    <stop offset="100%" stopColor="#e8eef8" />
                  </linearGradient>
                </defs>
                <rect
                  x="4"
                  y="4"
                  width="152"
                  height="82"
                  rx="10"
                  fill={`url(#${bodyGradientId})`}
                  stroke="#142560"
                  strokeWidth="3"
                />
                <path
                  d="M8 10 L80 58 L152 10"
                  fill="none"
                  stroke="#142560"
                  strokeOpacity="0.16"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            <div className={styles.flap}>
              <svg viewBox="0 0 160 56" className={styles.flapSvg} focusable="false" aria-hidden="true">
                <defs>
                  <linearGradient id={flapGradientId} x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#142560" />
                    <stop offset="100%" stopColor="#0f1c4a" />
                  </linearGradient>
                </defs>
                <path
                  d="M6 50 L80 6 L154 50 Z"
                  fill={`url(#${flapGradientId})`}
                  stroke="#0f1c4a"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <path
                  d="M32 42 L80 16 L128 42"
                  fill="none"
                  stroke="#F8F6EF"
                  strokeOpacity="0.35"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className={styles.sparkles} aria-hidden="true">
              {Array.from({ length: 8 }).map((_, index) => (
                <span key={index} className={styles.sparkle} style={{ '--s': index } as CSSProperties} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlyingEnvelope;
