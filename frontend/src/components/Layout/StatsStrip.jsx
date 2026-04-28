import React, { useEffect, useRef, useState } from 'react';
import { useInView, motion, useMotionValue, useSpring } from 'framer-motion';

function AnimatedNumber({ value, format = (v) => v }) {
  const ref = useRef();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 70, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      setDisplay(Math.round(v * 10) / 10);
    });
    return () => unsubscribe();
  }, [spring]);

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  return <span ref={ref} className="stat-number">{format(display)}</span>;
}

export default function StatsStrip() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (inView) setStarted(true);
  }, [inView]);

  return (
    <section ref={ref} className="kh-stats-strip">
      <div className="kh-stats-inner">
        <div className="kh-stat">
          <motion.div className="kh-stat-number">
            {started ? <AnimatedNumber value={73} format={(v) => `${Math.round(v)}%`} /> : <span className="stat-number">—</span>}
          </motion.div>
          <div className="kh-stat-label">Faster chart review</div>
        </div>

        <div className="kh-stat">
          <motion.div className="kh-stat-number">
            {started ? <AnimatedNumber value={4.2} format={(v) => `${v.toFixed(1)}s`} /> : <span className="stat-number">—</span>}
          </motion.div>
          <div className="kh-stat-label">Avg synthesis time</div>
        </div>

        <div className="kh-stat">
          <motion.div className="kh-stat-number">
            {started ? <AnimatedNumber value={100} format={(v) => `${Math.round(v)}%`} /> : <span className="stat-number">—</span>}
          </motion.div>
          <div className="kh-stat-label">Source-cited answers</div>
        </div>

        <div className="kh-stat">
          <motion.div className="kh-stat-number">
            {started ? <AnimatedNumber value={100} format={(v) => `HIPAA`} /> : <span className="stat-number">—</span>}
          </motion.div>
          <div className="kh-stat-label">Aligned by design</div>
        </div>
      </div>
    </section>
  );
}
