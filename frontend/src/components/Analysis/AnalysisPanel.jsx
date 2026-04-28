import React, { useEffect, useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { analyzeSession, getAnalysis, seedDemoData } from '../../api/client';
import { toast } from 'react-hot-toast';
import { Sparkles, AlertCircle, RefreshCw, TrendingUp, FlaskConical, Activity, HeartPulse, Moon } from 'lucide-react';
import './AnalysisPanel.css';

function getWearableTrends(documents) {
  const wearableDoc = documents.find((doc) => doc?.file_type === 'text/csv' && doc?.content?.trends);
  return wearableDoc?.content?.trends || null;
}

function TrendBars({ label, unit = '', early = 0, late = 0 }) {
  const maxValue = Math.max(early || 0, late || 0, 1);
  const earlyWidth = `${Math.max((early / maxValue) * 100, 8)}%`;
  const lateWidth = `${Math.max((late / maxValue) * 100, 8)}%`;

  return (
    <div className="trend-chart">
      <div className="trend-chart-header">
        <span>{label}</span>
        <strong>{late}{unit}</strong>
      </div>
      <div className="trend-row">
        <span>Early</span>
        <div className="trend-track">
          <div className="trend-fill trend-fill-early" style={{ width: earlyWidth }} />
        </div>
        <span>{early}{unit}</span>
      </div>
      <div className="trend-row">
        <span>Late</span>
        <div className="trend-track">
          <div className="trend-fill trend-fill-late" style={{ width: lateWidth }} />
        </div>
        <span>{late}{unit}</span>
      </div>
    </div>
  );
}

export default function AnalysisPanel() {
  const { sessionId, documents, handleFetchDocuments } = useSession();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('brief');

  useEffect(() => {
    if (!sessionId || !documents.length || analysis || loading) return;
    let cancelled = false;

    async function preloadAnalysis() {
      try {
        const result = await getAnalysis(sessionId);
        if (!cancelled) {
          setAnalysis(result);
          setActiveTab('brief');
        }
      } catch (err) {
        // Ignore missing analysis on first load; users can run it manually.
      }
    }

    preloadAnalysis();
    return () => {
      cancelled = true;
    };
  }, [sessionId, documents.length]);

  const handleAnalyze = async () => {
    if (!sessionId) {
      toast.error('No active session');
      return;
    }
    if (!documents.length) {
      toast.error('Please ingest documents first');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await analyzeSession(sessionId);
      setAnalysis(result);
      setActiveTab('brief');
      toast.success('Analysis complete!');
    } catch (err) {
      const errorMsg = err.message || 'Failed to analyze session';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAnalysis = async () => {
    if (!sessionId) {
      toast.error('No active session');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await getAnalysis(sessionId);
      setAnalysis(result);
      setActiveTab('brief');
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch analysis';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    if (!sessionId) {
      toast.error('No active session');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await seedDemoData(sessionId);
      await handleFetchDocuments(sessionId);
      setAnalysis(result);
      setActiveTab('brief');
      toast.success(result.seeded ? 'Demo data loaded!' : 'Demo already available for this session');
    } catch (err) {
      const errorMsg = err.message || 'Failed to seed demo data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onePager = analysis?.one_pager;
  const patternsDetected = Array.isArray(analysis?.patterns_detected) ? analysis.patterns_detected : [];
  const questionsToAsk = Array.isArray(analysis?.questions_to_ask) ? analysis.questions_to_ask : [];
  const wearableTrends = getWearableTrends(documents);
  const overviewStats = wearableTrends ? [
    {
      label: 'Sleep',
      value: `${wearableTrends.overall?.sleep_hours ?? '--'} h`,
      delta: `${wearableTrends.early_30d?.sleep_hours ?? '--'} -> ${wearableTrends.late_30d?.sleep_hours ?? '--'} h`,
      icon: <Moon size={16} />
    },
    {
      label: 'HRV',
      value: `${wearableTrends.overall?.hrv_ms ?? '--'} ms`,
      delta: `${wearableTrends.hrv_change_pct ?? '--'}% change`,
      icon: <HeartPulse size={16} />
    },
    {
      label: 'Steps',
      value: `${wearableTrends.overall?.steps ?? '--'}`,
      delta: `${wearableTrends.steps_change_pct ?? '--'}% change`,
      icon: <Activity size={16} />
    }
  ] : [];

  if (!documents.length) {
    return (
      <div className="analysis-panel empty-state">
        <AlertCircle size={32} className="text-muted" />
        <h3>No Documents Ingested</h3>
        <p>Ingest medical documents first to generate analysis.</p>
        <button
          onClick={handleSeedDemo}
          disabled={loading}
          className="secondary-btn flex items-center gap-2"
        >
          <FlaskConical size={14} />
          {loading ? 'Loading demo...' : 'Load Demo Data (Test Account)'}
        </button>
      </div>
    );
  }

  return (
    <div className="analysis-panel">
      <div className="analysis-header">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-brand" />
          <h3>Medical Analysis</h3>
        </div>
        <div className="analysis-actions">
          <button
            onClick={handleSeedDemo}
            disabled={loading}
            className="secondary-btn flex items-center gap-2 text-xs"
            title="Populate this session with deterministic demo data"
          >
            <FlaskConical size={14} />
            Demo
          </button>
          <button
            onClick={handleFetchAnalysis}
            disabled={loading}
            className="secondary-btn flex items-center gap-2 text-xs"
            title="Load existing analysis"
          >
            <RefreshCw size={14} />
            Load
          </button>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="primary-btn flex items-center gap-2"
          >
            <Sparkles size={16} />
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {analysis ? (
        <div className="analysis-content">
          <div className="analysis-tabs">
            <button
              className={`tab ${activeTab === 'brief' ? 'active' : ''}`}
              onClick={() => setActiveTab('brief')}
            >
              Brief
            </button>
            <button
              className={`tab ${activeTab === 'synthesis' ? 'active' : ''}`}
              onClick={() => setActiveTab('synthesis')}
            >
              Synthesis JSON
            </button>
            <button
              className={`tab ${activeTab === 'patterns' ? 'active' : ''}`}
              onClick={() => setActiveTab('patterns')}
            >
              Patterns JSON
            </button>
          </div>

          <div className="analysis-body">
            {activeTab === 'brief' && (
              <div className="analysis-section">
                {overviewStats.length > 0 && (
                  <div className="overview-grid">
                    {overviewStats.map((stat) => (
                      <div className="metric-card" key={stat.label}>
                        <div className="metric-icon">{stat.icon}</div>
                        <span className="metric-label">{stat.label}</span>
                        <strong className="metric-value">{stat.value}</strong>
                        <span className="metric-delta">{stat.delta}</span>
                      </div>
                    ))}
                  </div>
                )}

                {wearableTrends && (
                  <div className="chart-grid">
                    <TrendBars
                      label="Sleep trend"
                      unit="h"
                      early={wearableTrends.early_30d?.sleep_hours ?? 0}
                      late={wearableTrends.late_30d?.sleep_hours ?? 0}
                    />
                    <TrendBars
                      label="HRV trend"
                      unit=" ms"
                      early={wearableTrends.early_30d?.hrv_ms ?? 0}
                      late={wearableTrends.late_30d?.hrv_ms ?? 0}
                    />
                    <TrendBars
                      label="Activity trend"
                      unit=""
                      early={wearableTrends.early_30d?.steps ?? 0}
                      late={wearableTrends.late_30d?.steps ?? 0}
                    />
                  </div>
                )}

                <div className="brief-grid">
                  <div className="feature-card">
                    <div className="feature-index">01</div>
                    <h4>01 - The One-Pager</h4>
                    <p>{onePager?.summary || 'Conditions, meds, BP trend - doctor-ready in 30 sec'}</p>
                  </div>

                  <div className="feature-card">
                    <div className="feature-index">02</div>
                    <h4>02 - Patterns Detected</h4>
                    <ul>
                      {patternsDetected.length ? (
                        patternsDetected.map((item, idx) => (
                          <li key={`${item.title || 'pattern'}-${idx}`}>
                            <strong>{item.title || `Pattern ${idx + 1}`}</strong>
                            {item.detail ? ` - ${item.detail}` : ''}
                          </li>
                        ))
                      ) : (
                        <li>No patterns detected yet.</li>
                      )}
                    </ul>
                  </div>

                  <div className="feature-card">
                    <div className="feature-index">03</div>
                    <h4>03 - Questions to Ask</h4>
                    <ul>
                      {questionsToAsk.length ? (
                        questionsToAsk.map((q, idx) => <li key={`q-${idx}`}>{q}</li>)
                      ) : (
                        <li>No clinician questions generated yet.</li>
                      )}
                    </ul>
                  </div>

                  <div className="feature-card">
                    <div className="feature-index">04</div>
                    <h4>04 - Doctor Mode</h4>
                    <p>Private link - live Q&A from real patient data.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'synthesis' && analysis.synthesis && (
              <div className="analysis-section">
                <h4>Clinical Synthesis (Raw)</h4>
                <div className="analysis-text">
                  {typeof analysis.synthesis === 'string' ? (
                    <p>{analysis.synthesis}</p>
                  ) : (
                    <pre>{JSON.stringify(analysis.synthesis, null, 2)}</pre>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'patterns' && analysis.patterns && (
              <div className="analysis-section">
                <h4>Pattern Recognition (Raw)</h4>
                <div className="analysis-text">
                  {typeof analysis.patterns === 'string' ? (
                    <p>{analysis.patterns}</p>
                  ) : (
                    <pre>{JSON.stringify(analysis.patterns, null, 2)}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="analysis-placeholder">
          <TrendingUp size={48} className="text-muted" />
          <p>Run analysis on your ingested documents to generate insights.</p>
        </div>
      )}
    </div>
  );
}
