import React from 'react';
import { motion } from 'framer-motion';

export default function WorkflowSteps() {
  return (
    <section className="kh-workflow">
      <div className="kh-workflow-inner">
        <div className="kh-steps-line" />
        <div className="kh-steps">
          <motion.article className="kh-step" whileHover={{ scale: 1.02 }}>
            <div className="kh-step-num">01</div>
            <h4>INGEST</h4>
            <p>Drop in records, scans, notes — any format.</p>
          </motion.article>

          <motion.article className="kh-step" whileHover={{ scale: 1.02 }}>
            <div className="kh-step-num">02</div>
            <h4>UNDERSTAND</h4>
            <p>Kin parses, structures, and indexes everything.</p>
          </motion.article>

          <motion.article className="kh-step" whileHover={{ scale: 1.02 }}>
            <div className="kh-step-num">03</div>
            <h4>ACT</h4>
            <p>Ask questions, get cited answers, hand off cleanly.</p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
