import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SessionProvider } from "./context/SessionContext";
import LandingPage from "./components/Layout/LandingPage";
import About from "./components/Layout/About";
import Dashboard from "./components/Dashboard/Dashboard";
import AuthCard from "./components/Auth/AuthCard";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function AppContent() {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState("home");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [aboutView, setAboutView] = useState(false);

  useEffect(() => {
    if (showAuthModal) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0";
    };
  }, [showAuthModal]);

  const handleShowAuth = (mode) => {
    if (mode === 'about') {
      setAboutView(true);
      setShowAuthModal(false);
      return;
    }
    setAboutView(false);
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  if (loading) {
    // while restoring session, show the landing page (no restoring text)
    return (
      <motion.div
        key="loading-landing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <LandingPage switchAuthMode={handleShowAuth} />
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!currentUser ? (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {!aboutView ? (
            <>
              <LandingPage switchAuthMode={handleShowAuth} />
              {showAuthModal && (
                <>
                  <div className="modal-backdrop" onClick={handleCloseAuth} />
                  <div className="auth-modal-wrapper">
                    <AuthCard authMode={authMode} switchAuthMode={handleShowAuth} onClose={handleCloseAuth} />
                  </div>
                </>
              )}
            </>
          ) : (
            <About onBack={() => setAboutView(false)} openSignup={() => { setAboutView(false); setAuthMode('signup'); setShowAuthModal(true); }} />
          )}
        </motion.div>
      ) : (
        <SessionProvider>
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Dashboard />
          </motion.div>
        </SessionProvider>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(148, 163, 184, 0.2)',
          },
        }}
      />
      <AppContent />
    </AuthProvider>
  );
}
