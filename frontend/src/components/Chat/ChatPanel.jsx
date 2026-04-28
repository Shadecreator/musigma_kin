import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';
import { chatDoctor } from '../../api/client';
import { toast } from 'react-hot-toast';
import { Send, MessageCircle, AlertCircle } from 'lucide-react';
import './ChatPanel.css';

export default function ChatPanel() {
  const { sessionId, documents } = useSession();
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!sessionId) {
      toast.error('No active session');
      return;
    }
    if (!documents.length) {
      toast.error('Please ingest documents first');
      return;
    }

    const userMessage = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setError(null);
    setLoading(true);

    try {
      const response = await chatDoctor(sessionId, userMessage);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          citations: Array.isArray(response.citations) ? response.citations : [],
          mode: response.mode || 'unknown'
        }
      ]);
    } catch (err) {
      const errorMsg = err.message || 'Failed to get response';
      setError(errorMsg);
      toast.error(errorMsg);
      setMessages(prev => prev.slice(0, -1)); // Remove user message if API fails
    } finally {
      setLoading(false);
    }
  };

  if (!documents.length) {
    return (
      <div className="chat-panel empty-state">
        <AlertCircle size={32} className="text-muted" />
        <h3>No Documents Ingested</h3>
        <p>Ingest medical documents first to enable doctor mode chat.</p>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-brand" />
          <h3>Doctor Mode Chat</h3>
        </div>
        <span className="text-muted text-sm">
          {documents.length} document{documents.length !== 1 ? 's' : ''} loaded
        </span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>Start asking questions about the ingested patient data.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <div className="message-content">
                <p>{msg.content}</p>
                {msg.role === 'assistant' && Array.isArray(msg.citations) && msg.citations.length > 0 && (
                  <div className="chat-citations">
                    <strong>Sources:</strong> {msg.citations.join(', ')}
                    {msg.mode ? ` (${msg.mode})` : ''}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="chat-message assistant loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a clinical question..."
          disabled={loading}
          className="chat-input"
        />
        <button type="submit" disabled={loading || !question.trim()} className="chat-send">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
