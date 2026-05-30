'use client';

import React, { ElementType, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { motion, Variants } from 'framer-motion';

interface TimelineContentProps {
  as?: ElementType;
  animationNum: number;
  timelineRef: RefObject<HTMLElement | null>;
  customVariants?: Variants | ((i: number) => unknown);
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

/**
 * Triggers framer-motion variants once `timelineRef` enters the viewport.
 * Drop-in replacement for the missing `@/components/ui/timeline-animation`
 * dependency referenced by the imported AboutSection component.
 */
export function TimelineContent({
  as: Component = 'div',
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
  ...rest
}: TimelineContentProps) {
  const [visible, setVisible] = useState(false);
  const internalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = timelineRef?.current;
    if (!el) {
      // Fallback — animate as soon as our own element is in view.
      const self = internalRef.current;
      if (!self) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      io.observe(self);
      return () => io.disconnect();
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [timelineRef]);

  // CRITICAL: `motion(Component)` returns a NEW component type each call.
  // If we recreate it every render, React unmounts/remounts the child every
  // tick — which on a parent that depends on intersection state becomes an
  // infinite loop. Memoize per Component prop so it's stable.
  const MotionComponent = useMemo(
    () => motion(Component as React.ElementType),
    [Component],
  );

  return (
    <MotionComponent
      ref={internalRef}
      custom={animationNum}
      initial="hidden"
      animate={visible ? 'visible' : 'hidden'}
      variants={customVariants as Variants}
      className={className}
      {...rest}
    >
      {children}
    </MotionComponent>
  );
}
