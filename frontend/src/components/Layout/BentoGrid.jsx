import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, FileText, Lock, Activity, Check } from 'lucide-react';

function CardLabel({ idx, title }) {
  return (
    <div className="kh-card-label">{String(idx).padStart(2, '0')} / {title}</div>
  );
}

export default function BentoGrid() {
  return (
    <section className="kh-bento">
      <div className="kh-bento-grid">
        <motion.article className="kh-card kh-card-large" whileHover={{ y: -6 }}>
          <CardLabel idx={1} title="INTELLIGENCE" />
          <h3>Doctor-mode chat with source-cited answers</h3>
          <div className="kh-chat-mock">
            <div className="kh-chat-q">What medications has Sarah been on in the last 6 months?</div>
            <div className="kh-chat-a">She was prescribed <strong>Sertraline</strong> and <strong>Metformin</strong>. <span className="kh-citations">[Note 4/12] [Lab 6/3]</span></div>
            <div className="kh-typing-dots"><span/></div>
          </div>
        </motion.article>

        <motion.article className="kh-card kh-card-medium" whileHover={{ y: -6 }}>
          <CardLabel idx={2} title="INGESTION" />
          <h4>Automated parsing for common clinical file types</h4>
          <div className="kh-file-chips">
            <div className="chip">PDF</div>
            <div className="chip">CSV</div>
            <div className="chip">TXT</div>
            <div className="chip">JSON</div>
          </div>
          <div className="kh-ingest-sweep" />
        </motion.article>

        <motion.article className="kh-card kh-card-small" whileHover={{ y: -6 }}>
          <CardLabel idx={3} title="TRIAGE" />
          <div className="kh-stat-big">73<span className="percent">%</span></div>
          <div className="kh-stat-sub">less time on chart review</div>
          <div className="kh-sparkline" />
        </motion.article>

        <motion.article className="kh-card kh-card-small" whileHover={{ y: -6 }}>
          <CardLabel idx={4} title="SECURITY" />
          <div className="kh-lock"><Lock size={28} /></div>
          <div className="kh-lock-sub">HIPAA-aligned</div>
        </motion.article>

        <motion.article className="kh-card kh-card-medium" whileHover={{ y: -6 }}>
          <CardLabel idx={5} title="SYNTHESIS" />
          <h4>AI-powered synthesis and pattern recognition</h4>
          <div className="kh-patterns">
            <div className="pattern">Med interaction</div>
            <div className="pattern">Symptom cluster</div>
            <div className="pattern">Lab trend</div>
          </div>
        </motion.article>

        <motion.article className="kh-card kh-card-medium" whileHover={{ y: -6 }}>
          <CardLabel idx={6} title="HANDOFFS" />
          <h4>Actionable summaries for clinical handoffs</h4>
          <div className="kh-handoff">
            <ul>
              <li><Check size={14} /> Problem list and summary</li>
              <li><Check size={14} /> Key meds & changes</li>
              <li><Check size={14} /> Follow-up actions</li>
            </ul>
            <div className="kh-stamp">Generated in 4.2s</div>
          </div>
        </motion.article>

      </div>
    </section>
  );
}
