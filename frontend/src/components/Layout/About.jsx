import React from 'react';

export default function About({ onBack, openSignup }) {
  return (
    <div className="page-shell about-page">
      <div className="panel">
        <div className="panel-head">
          <h2>About Kin</h2>
          <div>
            <button className="secondary-btn" onClick={onBack}>Back</button>
          </div>
        </div>

        <p>
          Kin is a clinical intelligence workspace built for caregivers. It ingests diverse patient
          documents, organizes them into sessions, and provides AI-assisted insights to speed
          decisions and improve continuity of care.
        </p>

        <h3>Key capabilities</h3>
        <ul>
          <li>Secure user accounts and session-scoped data</li>
          <li>Multi-format ingestion: PDF, CSV, TXT, JSON</li>
          <li>Doctor-mode conversational interface with citations</li>
          <li>Exportable session summaries and synthesis</li>
        </ul>

        <div style={{ marginTop: 18 }}>
          <button className="primary-btn" onClick={openSignup}>Get started</button>
        </div>
      </div>
    </div>
  );
}
