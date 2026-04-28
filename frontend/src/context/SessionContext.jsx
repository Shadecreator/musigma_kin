import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSession, getSessionDocuments } from '../api/client';
import { useAuth } from './AuthContext';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const { currentUser } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState({
    createSession: false,
    fetchDocuments: false,
  });
  const [error, setError] = useState(null);

  // Auto-create session when user logs in
  useEffect(() => {
    if (currentUser && !sessionId) {
      handleCreateSession();
    }
  }, [currentUser, sessionId]);

  useEffect(() => {
    if (!currentUser) {
      clearSession();
    }
  }, [currentUser]);

  const handleCreateSession = async () => {
    setError(null);
    setLoading(prev => ({ ...prev, createSession: true }));
    try {
      const data = await createSession();
      setSessionId(data.session_id);
      await handleFetchDocuments(data.session_id).catch(() => []);
      return data.session_id;
    } catch (err) {
      setError(err.message || 'Failed to create session');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, createSession: false }));
    }
  };

  const handleFetchDocuments = async (targetSessionId = sessionId) => {
    if (!targetSessionId) return [];

    setError(null);
    setLoading(prev => ({ ...prev, fetchDocuments: true }));
    try {
      const data = await getSessionDocuments(targetSessionId);
      setDocuments(data.documents || []);
      return data.documents;
    } catch (err) {
      setError(err.message || 'Failed to fetch documents');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, fetchDocuments: false }));
    }
  };

  const clearSession = () => {
    setSessionId(null);
    setDocuments([]);
    setError(null);
  };

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        documents,
        loading,
        error,
        setError,
        handleCreateSession,
        handleFetchDocuments,
        clearSession,
        setDocuments,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
