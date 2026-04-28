import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles, HeartPulse, Check, Pill, FileText, TrendingUp } from 'lucide-react';
import '../../styles.css';
import '../../kc-styles.css';

export default function LandingPage({ switchAuthMode }) {
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
    <div className="kc-shell" ref={heroRef} onMouseMove={handleMouseMove}>
      <motion.div 
        className="kc-cursor-glow"
        style={{ 
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, var(--kc-violet), transparent 70%)',
          opacity: 0.06,
          pointerEvents: 'none',
          zIndex: 3,
          left: -250,
          top: -250,
          x: smoothX,
          y: smoothY,
          mixBlendMode: 'screen'
        }}
      />
      <div className="kc-orb kc-orb-top" aria-hidden />
      <div className="kc-orb kc-orb-bottom" aria-hidden />

      <header className="kc-navbar">
        <div className="kc-nav-inner">
          <div className="kc-brand">
            <div className="kc-brand-dot">K</div>
            <div className="kc-brand-word">Kin</div>
          </div>

          <nav className="kc-nav-links">
            <button className="kc-nav-link" onClick={() => switchAuthMode('home')}>Home</button>
            <button className="kc-nav-link" onClick={() => switchAuthMode('about')}>About</button>
            <button className="kc-nav-link" onClick={() => switchAuthMode('pricing')}>Pricing</button>
          </nav>

          <div className="kc-nav-actions">
            <button className="kc-signin" onClick={() => switchAuthMode('login')}>Sign in</button>
            <button className="kc-cta" onClick={() => switchAuthMode('signup')}>Get Started</button>
          </div>
        </div>
      </header>

      <main className="kc-hero">
        <div className="kc-hero-inner">
          <motion.div className="kc-pill" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.span className="kc-pill-dot" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
            <span>Unlock your patient spark →</span>
          </motion.div>

          <div className="kc-eyebrow">KIN PLATFORM · SECURE INTELLIGENCE</div>

          <h1 className="kc-title">
            <div className="kc-title-line">One-click for Patient</div>
            <div className="kc-title-line kc-intel">Intelligence</div>
          </h1>

          <p className="kc-sub">A cinematic workspace for caregivers to create sessions, ingest files, and review structured patient context with speed and clarity.</p>

          <div className="kc-ctas">
            <motion.button className="kc-primary" whileHover={{ scale: 1.02 }} onClick={() => switchAuthMode('signup')}>Get Started</motion.button>
            <button className="kc-ghost" onClick={() => { const el = document.getElementById('kc-features'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>Discover More</button>
          </div>

          <div className="kc-preview-container">
            <div className="kc-preview-glow" />
            
            <motion.div 
              className="kc-dashboard-card"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="kc-dashboard-inner">
                <aside className="kc-side">
                  <div className="kc-side-logo">
                    <div className="kc-side-logo-icon" />
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Kin</span>
                  </div>
                  <div className="kc-side-search" />
                  <div className="kc-patient-list">
                    {[
                      { name: "Sarah Chen", status: "var(--kc-cyan)", selected: true },
                      { name: "Marcus Webb", status: "orange" },
                      { name: "Elena Ruiz", status: "red" },
                      { name: "David Kim", status: "var(--kc-cyan)" },
                      { name: "Anita Patel", status: "var(--kc-cyan)" }
                    ].map((p, i) => (
                      <div key={i} className={`kc-patient-item ${p.selected ? 'selected' : ''}`}>
                        <div className="kc-avatar" />
                        <span className="kc-p-name">{p.name}</span>
                        <div className="kc-status-dot" style={{ background: p.status }} />
                      </div>
                    ))}
                  </div>
                </aside>
                <main className="kc-main-panel">
                  <header className="kc-panel-header">
                    <div className="kc-panel-title">
                      <Sparkles size={16} />
                      <span>Patient Synthesis · Generated 2m ago</span>
                    </div>
                  </header>
                  <div className="kc-synthesis-blocks">
                    <div className="kc-skeleton-line" style={{ width: '100%' }} />
                    <div className="kc-skeleton-line" style={{ width: '85%' }} />
                    <div className="kc-skeleton-line" style={{ width: '60%' }} />
                  </div>
                  <div className="kc-med-card">
                    <Pill size={14} />
                    <span style={{ fontSize: 13 }}>Medications · 4 active</span>
                  </div>
                  <div className="kc-timeline">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="kc-t-dot" />
                    ))}
                  </div>
                </main>
              </div>
            </motion.div>

            {/* Floating Nodes */}
            <motion.div className="kc-node kc-node-1" animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
              <div className="kc-node-icon"><Pill size={18} /></div>
              <span>+2 meds today</span>
            </motion.div>
            <motion.div className="kc-node kc-node-2" animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4, delay: 1, ease: 'easeInOut' }}>
              <div className="kc-node-icon"><HeartPulse size={18} /></div>
              <span>BP normal</span>
            </motion.div>
            <motion.div className="kc-node kc-node-3" animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4, delay: 2, ease: 'easeInOut' }}>
              <div className="kc-node-icon"><FileText size={18} /></div>
              <span>Lab results in</span>
            </motion.div>
            <motion.div className="kc-node kc-node-4" animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4, delay: 1.5, ease: 'easeInOut' }}>
              <div className="kc-node-icon"><TrendingUp size={18} /></div>
              <span>Improving</span>
            </motion.div>
          </div>
        </div>
      </main>

      <section id="kc-features" className="kc-features">
        <div className="kc-features-inner">
          <div className="kc-features-header">
            <div className="kc-divider" />
            <div className="kc-feat-eyebrow">WHAT KIN DOES</div>
            <h2 className="kc-feat-title">Built for <em>the way caregivers actually work</em>.</h2>
            <p className="kc-feat-sub">Kin turns patient documents into an instantly searchable, structured patient workspace. Upload records (PDF, CSV, TXT, JSON), then ask clinical questions, generate synthesis reports, and surface patterns across a patient's history.</p>
          </div>

          <div className="kc-grid">
            <article className="kc-card">
              <div className="kc-icon"><div className="kc-icon-inner"><Sparkles size={22} /></div></div>
              <h3 className="kc-card-title">What Kin does</h3>
              <p className="kc-card-desc">Kin turns patient documents into an instantly searchable, structured patient workspace. Upload records (PDF, CSV, TXT, JSON), then ask clinical questions, generate synthesis reports, and surface patterns across a patient's history.</p>

              <ul className="kc-bullets">
                <li><span className="kc-bullet"><Check size={11} strokeWidth={3} /></span><span>Secure, per-user sessions with fine-grained access control</span></li>
                <li><span className="kc-bullet"><Check size={11} strokeWidth={3} /></span><span>Automated parsing for common clinical file types</span></li>
                <li><span className="kc-bullet"><Check size={11} strokeWidth={3} /></span><span>Doctor-mode chat with source-cited answers</span></li>
                <li><span className="kc-bullet"><Check size={11} strokeWidth={3} /></span><span>AI-powered synthesis and pattern recognition</span></li>
              </ul>
            </article>

            <article className="kc-card">
              <div className="kc-icon"><div className="kc-icon-inner"><HeartPulse size={22} /></div></div>
              <h3 className="kc-card-title">How it helps caregivers</h3>
              <p className="kc-card-desc">Reduce chart review time, highlight medication changes, and extract clinical trends — so caregivers spend less time hunting for context and more time on care.</p>

              <ul className="kc-bullets">
                <li><span className="kc-bullet"><Check size={11} strokeWidth={3} /></span><span>Faster intake and triage</span></li>
                <li><span className="kc-bullet"><Check size={11} strokeWidth={3} /></span><span>Actionable summaries for clinical handoffs</span></li>
                <li><span className="kc-bullet"><Check size={11} strokeWidth={3} /></span><span>Contextual Q&A for informed decisions</span></li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
