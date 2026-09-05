'use client';

import { useEffect } from 'react';
import { useMotionValue, useTransform, animate, motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedCounter({
  value,
  duration = 0.8,
  formatter = (v) => Math.round(v).toLocaleString(),
  className = '',
  style = {},
}: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => formatter(latest));

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // fluid ease-out curve
    });
    return () => controls.stop();
  }, [value, count, duration]);

  return (
    <motion.span className={className} style={style}>
      {rounded}
    </motion.span>
  );
}
