import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import { useIngestion } from '../../hooks/useIngestion';
import FileUploader from './FileUploader';
import DocumentGrid from './DocumentGrid';
import ChatPanel from '../Chat/ChatPanel';
import AnalysisPanel from '../Analysis/AnalysisPanel';
import { toast } from 'react-hot-toast';
import { LogOut, RefreshCw, UploadCloud, Trash2, Files, MessageSquareText, ChartNoAxesCombined, PanelRightOpen, PanelRightClose, ChevronDown, ChevronUp, ShieldCheck, Sparkles } from 'lucide-react';
import { truncateName } from '../../utils/formatters';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const { sessionId, loading: sessionLoading } = useSession();
  const {
    queuedFiles,
    documents,
    loading,
    error,
    handleIngest,
    handleFetchDocuments,
    appendFiles,
    clearQueue
  } = useIngestion();
  
  const [chatOpen, setChatOpen] = useState(false);
  const [documentsExpanded, setDocumentsExpanded] = useState(false);

  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    });
  }, [documents]);

  const hasSession = Boolean(sessionId);
  const canIngest = hasSession && queuedFiles.length > 0 && !loading.ingest;
  const dashboardStats = [
    {
      label: 'Documents',
      value: documents.length,
      icon: <Files size={16} />
    },
    {
      label: 'Chat',
      value: documents.length ? 'Ready' : 'Waiting',
      icon: <MessageSquareText size={16} />
    },
    {
      label: 'Analysis',
      value: documents.length ? 'Available' : 'Seed demo',
      icon: <ChartNoAxesCombined size={16} />
    }
  ];

  const onLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const onIngest = async () => {
    try {
      await toast.promise(handleIngest(), {
        loading: 'Ingesting documents...',
        success: 'Ingestion complete!',
        error: 'Ingestion failed'
      });
    } catch (err) {}
  };

  const onRefresh = async () => {
    try {
      await toast.promise(handleFetchDocuments(), {
        loading: 'Refreshing...',
        success: 'Documents updated',
        error: 'Refresh failed'
      });
    } catch (err) {}
  };

  return (
    <div className="page-shell dashboard">
      <header className="dashboard-header">
        <div className="dashboard-topbar">
          <div className="brand-block">
            <div className="brand-badge">
              <Sparkles size={14} />
              <span>KIN Platform</span>
            </div>
            <div>
              <h1>Clinical workspace</h1>
              <p className="subtitle">
                Welcome, {currentUser.name || currentUser.full_name || 'Clinician'}. Review records, generate insights, and use doctor-mode chat in one secure workspace.
              </p>
            </div>
          </div>

          <div className="header-actions">
            <div className="topbar-pill">
              <ShieldCheck size={14} />
              <span>Protected session</span>
            </div>
            <button className="secondary-btn nav-logout-btn flex items-center gap-2" onClick={onLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {hasSession && (
          <div className="session-info-banner">
            <div className="session-badge">
              <span className="badge-label">Workspace Status</span>
              <span className="session-status-pill">Live workspace</span>
            </div>
            <div className="session-summary">
              <span className="doc-count">{documents.length} document{documents.length !== 1 ? 's' : ''} ingested</span>
              <span className="session-separator">•</span>
              <span className="doc-count">Doctor mode ready</span>
            </div>
          </div>
        )}
      </header>

      <main className="dashboard-main">
        {!hasSession ? (
          <div className="session-loading">
            <div className="spinner"></div>
            <p>Initializing your session...</p>
          </div>
        ) : (
          <>
            <section className="dashboard-overview">
              {dashboardStats.map((stat) => (
                <article className="dashboard-stat" key={stat.label}>
                  <div className="dashboard-stat-icon">{stat.icon}</div>
                  <div>
                    <span className="dashboard-stat-label">{stat.label}</span>
                    <strong className="dashboard-stat-value">{stat.value}</strong>
                  </div>
                </article>
              ))}
            </section>

            <section className="workspace-grid">
              <aside className="panel upload-panel">
                <div className="panel-header">
                  <div>
                    <h2>Upload Documents</h2>
                    <p className="text-muted">Add PDF, CSV, JSON, and text files</p>
                  </div>
                </div>

                <FileUploader onFilesAdded={appendFiles} />

                <div className="queue-section">
                  <div className="queue-header">
                    <span>Queued files</span>
                    <span>{queuedFiles.length}</span>
                  </div>
                  <ul className="file-list">
                    {queuedFiles.map((file) => (
                      <li key={`${file.name}-${file.size}-${file.lastModified}`}>
                        <div className="file-item">
                          <strong title={file.name}>{truncateName(file.name)}</strong>
                          <span className="text-muted">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </li>
                    ))}
                    {!queuedFiles.length && <li className="muted text-center py-4">No files queued yet.</li>}
                  </ul>
                </div>

                <div className="button-group">
                  <button
                    className="primary-btn upload-action-btn flex items-center justify-center gap-2"
                    disabled={!canIngest}
                    onClick={onIngest}
                  >
                    <UploadCloud size={18} />
                    {loading.ingest ? "Uploading..." : "Upload & Ingest"}
                  </button>
                  <button
                    className="secondary-btn upload-clear-btn flex items-center justify-center gap-2"
                    disabled={!queuedFiles.length || loading.ingest}
                    onClick={clearQueue}
                    title="Clear queued files"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {error && <div className="error-message">{error}</div>}
              </aside>

              <section className="panel documents-panel">
                <div className="panel-header">
                  <div>
                    <h2>Ingested Documents</h2>
                    <p className="text-muted">
                      {documentsExpanded
                        ? 'Review structured outputs from uploaded records'
                        : 'Collapsed - expand only when you want to inspect parsed records'}
                    </p>
                  </div>
                  <div className="documents-actions">
                    <button
                      type="button"
                      className="secondary-btn-small flex items-center gap-1"
                      onClick={() => setDocumentsExpanded((prev) => !prev)}
                    >
                      {documentsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {documentsExpanded ? 'Hide' : 'Show'}
                    </button>
                    <button
                      className="secondary-btn-small flex items-center gap-1"
                      onClick={onRefresh}
                      disabled={loading.ingest}
                    >
                      <RefreshCw size={14} className={loading.ingest ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  </div>
                </div>

                {documentsExpanded ? (
                  <DocumentGrid documents={sortedDocuments} />
                ) : (
                  <div className="documents-collapsed">
                    <p>{documents.length} document{documents.length !== 1 ? 's' : ''} available.</p>
                    <span>Use `Show` to inspect the parsed content.</span>
                  </div>
                )}
              </section>
            </section>

            <section className="insights-grid">
              <section className="insight-panel insight-panel-wide">
                <AnalysisPanel />
              </section>
            </section>

            <button
              type="button"
              className={`chat-drawer-toggle ${chatOpen ? 'open' : ''}`}
              onClick={() => setChatOpen((prev) => !prev)}
              title={chatOpen ? 'Close doctor chat' : 'Open doctor chat'}
            >
              {chatOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              <span>Doctor Chat</span>
            </button>

            <aside className={`chat-drawer ${chatOpen ? 'open' : ''}`}>
              <div className="chat-drawer-header">
                <div>
                  <p className="chat-drawer-label">Doctor Mode</p>
                  <h3>Live patient Q&A</h3>
                </div>
                <button
                  type="button"
                  className="secondary-btn-small"
                  onClick={() => setChatOpen(false)}
                >
                  Close
                </button>
              </div>
              <ChatPanel />
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
