import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles, HeartPulse, FileText, TrendingUp, Pill } from 'lucide-react';

export default function LandingHero({ switchAuthMode }) {
  const headline = ["One-click", "for", "Patient", "Intelligence"];
  const heroRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 20, stiffness: 100 });
  const smoothY = useSpring(mouseY, { damping: 20, stiffness: 100 });

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section className="kh-hero" ref={heroRef} onMouseMove={handleMouseMove}>
      <motion.div 
        className="kh-cursor-glow"
        style={{ x: smoothX, y: smoothY }}
      />
      
      <div className="kh-hero-background">
        <svg className="kh-noise" width="100%" height="100%" aria-hidden>
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.03"/>
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
        <div className="kh-orb kh-orb-top" />
        <div className="kh-orb kh-orb-bottom" />
        
        <svg className="kh-grid-overlay" width="100%" height="100%">
          <pattern id="heroGrid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#heroGrid)" />
        </svg>
      </div>

      <div className="kh-hero-inner">
        <div className="kh-top-pill" style={{ marginBottom: '48px' }}>
          <motion.span
            className="kh-pill-dot"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
          <span>Unlock your patient spark →</span>
        </div>

        <div className="kh-copy">
          <div className="kh-eyebrow" style={{ marginBottom: '24px' }}>KIN PLATFORM / SECURE INTELLIGENCE</div>

          <h1 className="kh-headline">
            {headline.map((word, i) => {
              if (word === 'Intelligence') {
                return (
                  <motion.span
                    key={word}
                    className="kh-intelligence"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    {word}
                  </motion.span>
                );
              }

              return (
                <motion.span
                  key={word + i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="kh-word"
                >
                  {word + ' '}
                </motion.span>
              );
            })}
          </h1>

          <p className="kh-sub">A cinematic workspace for caregivers to create sessions, ingest files, and review structured patient context with speed and clarity.</p>

          <div className="kh-ctas">
            <button className="kh-cta-primary" onClick={() => switchAuthMode('signup')}>
              <span className="kh-cta-text">Get Started</span>
              <div className="kh-cta-shimmer" />
            </button>
            <button className="kh-cta-ghost" onClick={() => {
              const el = document.getElementById('details');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}>Discover More</button>
          </div>

          <div className="kh-hero-visual-wrapper">
            <div className="kh-card-glow" />
            <motion.div
              className="kh-hero-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="kh-card-bg-layer" />
              <div className="kh-card-content">
                <div className="kh-card-sidebar">
                  <div className="kh-sidebar-logo">
                    <span className="kh-sidebar-logo-icon">K</span>
                    <span className="kh-sidebar-logo-text">Kin</span>
                  </div>
                  <div className="kh-sidebar-search">
                    Search...
                  </div>
                  <div className="kh-patient-list">
                    {[{ name: "Sarah Chen", status: "green", active: true },
                      { name: "Marcus Webb", status: "amber" },
                      { name: "Elena Ruiz", status: "red" },
                      { name: "David Kim", status: "green" },
                      { name: "Anita Patel", status: "green" }
                    ].map((p, i) => (
                      <div key={i} className={`kh-patient-row ${p.active ? 'active' : ''}`}>
                        <div className="kh-patient-avatar" />
                        <span className="kh-patient-name">{p.name}</span>
                        <span className="kh-patient-status" style={{ background: `var(--${p.status})` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="kh-card-main">
                  <div className="kh-card-header">
                    <Sparkles size={14} className="kh-card-header-icon" />
                    <span>Patient Synthesis · Generated 2m ago</span>
                  </div>
                  <div className="kh-card-blocks">
                    <div className="kh-skeleton-text w-100" />
                    <div className="kh-skeleton-text w-85" />
                    <div className="kh-skeleton-text w-60" />
                  </div>
                  <div className="kh-card-meds">
                    <Pill size={12} />
                    <span>Medications · 4 active</span>
                  </div>
                  <div className="kh-card-timeline">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="kh-timeline-dot" />
                    ))}
                    <div className="kh-timeline-line" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="kh-node kh-node-1" animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4, delay: 0, ease: 'easeInOut' }}>
              <div className="kh-node-icon"><Pill size={18} /></div>
              <span>+2 meds today</span>
            </motion.div>
            <motion.div className="kh-node kh-node-2" animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4, delay: 1, ease: 'easeInOut' }}>
              <div className="kh-node-icon"><HeartPulse size={18} /></div>
              <span>BP normal</span>
            </motion.div>
            <motion.div className="kh-node kh-node-3" animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4, delay: 2, ease: 'easeInOut' }}>
              <div className="kh-node-icon"><FileText size={18} /></div>
              <span>Lab results in</span>
            </motion.div>
            <motion.div className="kh-node kh-node-4" animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4, delay: 1.5, ease: 'easeInOut' }}>
              <div className="kh-node-icon"><TrendingUp size={18} /></div>
              <span>Improving</span>
            </motion.div>

          </div>

          <div className="kh-scroll-indicator">
            <div className="kh-scroll-line" />
            <motion.div className="kh-scroll-dot" animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
