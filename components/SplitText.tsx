'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface SplitTextProps {
  text?: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: 'chars' | 'words';
  from?: Record<string, number>;
  to?: Record<string, number>;
  threshold?: number;
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right';
  onLetterAnimationComplete?: () => void;
}

const easeMap: Record<string, number[]> = {
  'linear': [0, 0, 1, 1],
  'easeOut': [0, 0, 0.58, 1],
  'easeInOut': [0.42, 0, 0.58, 1],
  'power1.out': [0.33, 1, 0.68, 1],
  'power2.out': [0.25, 1, 0.5, 1],
  'power3.out': [0.16, 1, 0.3, 1],
  'power4.out': [0.075, 0.82, 0.165, 1],
  'back.out': [0.34, 1.56, 0.64, 1],
  'elastic.out': [0.68, -0.55, 0.265, 1.55],
};

const SplitText = ({
  text = '',
  className = '',
  delay = 50,
  duration = 1,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '0px',
  textAlign = 'left',
  onLetterAnimationComplete,
}: SplitTextProps) => {
  const elements = splitType === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Check if element is already in view on mount
    const rect = ref.current.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInView) {
      // Small delay to ensure initial state is rendered first
      const timer = setTimeout(() => setInView(true), 50);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const easeValues = easeMap[ease] || easeMap['power3.out'];

  // Check if className includes gradient-text
  const hasGradient = className.includes('gradient-text');

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        textAlign,
        justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {elements.map((segment, index) => (
        <motion.span
          className={`${className} inline-block will-change-[transform,opacity]`}
          key={index}
          initial={from}
          animate={inView ? to : from}
          transition={{
            duration,
            delay: (index * delay) / 1000,
            ease: easeValues,
          }}
          onAnimationComplete={
            index === elements.length - 1 ? onLetterAnimationComplete : undefined
          }
          style={hasGradient ? {
            background: 'linear-gradient(135deg, var(--accent-gold-light), var(--accent-gold), var(--accent-gold-dark))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          } : undefined}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {splitType === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </div>
  );
};

export default SplitText;
