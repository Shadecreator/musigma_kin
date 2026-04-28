import { useState, useCallback } from 'react';
import { ingestDocuments } from '../api/client';
import { useSession } from '../context/SessionContext';

export function useIngestion() {
  const { sessionId, documents, handleFetchDocuments, setDocuments } = useSession();
  const [queuedFiles, setQueuedFiles] = useState([]);
  const [loading, setLoading] = useState({
    ingest: false,
  });
  const [error, setError] = useState("");
  const [ingestResult, setIngestResult] = useState(null);

  const handleIngest = async () => {
    if (!sessionId || queuedFiles.length === 0) return;

    setError("");
    setLoading(prev => ({ ...prev, ingest: true }));
    try {
      const data = await ingestDocuments(sessionId, queuedFiles);
      setIngestResult(data);
      setQueuedFiles([]);
      await handleFetchDocuments(sessionId);
      return data;
    } catch (err) {
      setError(err.message || "Ingestion failed.");
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, ingest: false }));
    }
  };

  const appendFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;

    setQueuedFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      const deduped = incoming.filter(
        (f) => !existingKeys.has(`${f.name}-${f.size}-${f.lastModified}`)
      );
      return [...prev, ...deduped];
    });
  };

  const clearQueue = () => setQueuedFiles([]);

  return {
    sessionId,
    queuedFiles,
    documents,
    loading,
    error,
    ingestResult,
    handleIngest,
    handleFetchDocuments,
    appendFiles,
    clearQueue,
  };
}
