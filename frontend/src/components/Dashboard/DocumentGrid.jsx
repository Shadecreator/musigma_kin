import React from 'react';
import { truncateName, prettyPrintContent } from '../../utils/formatters';

export default function DocumentGrid({ documents }) {
  if (!documents.length) {
    return (
      <div className="docs-grid">
        <p className="muted docs-empty">No documents found. Upload files and ingest to see results.</p>
      </div>
    );
  }

  return (
    <div className="docs-grid">
      {documents.map((doc) => (
        <article className="doc-card" key={doc.id}>
          <header>
            <h3 title={doc.filename}>{truncateName(doc.filename)}</h3>
            <span className="chip">{doc.file_type}</span>
          </header>
          <time>
            {doc.created_at ? new Date(doc.created_at).toLocaleString() : "Unknown timestamp"}
          </time>
          <pre>{prettyPrintContent(doc.content)}</pre>
        </article>
      ))}
    </div>
  );
}
