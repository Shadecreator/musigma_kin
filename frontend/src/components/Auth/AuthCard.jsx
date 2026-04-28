import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const initialAuthForm = {
  name: "",
  email: "",
  password: ""
};

export default function AuthCard({ authMode, switchAuthMode, onClose }) {
  const { login, signup, loading, error, setError } = useAuth();
  const [authForm, setAuthForm] = useState(initialAuthForm);

  const applyDemoCredentials = () => {
    setAuthForm((prev) => ({
      ...prev,
      email: "test.account.kin@example.com",
      password: "Test1234!"
    }));
    setError(null);
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      if (authMode === 'login') {
        await toast.promise(
          login({ email: authForm.email.trim().toLowerCase(), password: authForm.password }),
          {
            loading: 'Logging in...',
            success: 'Welcome back!',
            error: (err) => err.message || 'Login failed',
          }
        );
      } else {
        await toast.promise(
          signup({ 
            full_name: authForm.name.trim(), 
            email: authForm.email.trim().toLowerCase(), 
            password: authForm.password 
          }),
          {
            loading: 'Creating account...',
            success: 'Account created successfully!',
            error: (err) => err.message || 'Signup failed',
          }
        );
      }
    } catch (err) {
      // Error is handled by toast.promise and AuthContext
    }
  };

  return (
    <aside className="auth-card panel auth-modal">
      <button className="modal-close" onClick={onClose} aria-label="Close auth modal">
        ✕
      </button>
      <div className="auth-switch">
        <button
          className={authMode === "login" ? "tab active" : "tab"}
          onClick={() => switchAuthMode("login")}
        >
          Login
        </button>
        <button
          className={authMode === "signup" ? "tab active" : "tab"}
          onClick={() => switchAuthMode("signup")}
        >
          Sign up
        </button>
      </div>

      {authMode === "home" && (
        <div className="auth-home">
          <h2>Welcome 👋</h2>
          <p>Choose an option to continue.</p>
          <div className="auth-mini-actions">
            <button className="primary-btn full-width" onClick={() => switchAuthMode("signup")}>
              Get Started
            </button>
            <button className="secondary-btn full-width" onClick={() => switchAuthMode("login")}>
              I already have an account
            </button>
          </div>
        </div>
      )}

      {authMode === "login" && (
        <form className="auth-form" onSubmit={onSubmit}>
          <h2>Welcome back</h2>
          <p>Sign in to access your dashboard.</p>
          <button type="button" className="secondary-btn full-width" onClick={applyDemoCredentials}>
            Use test account
          </button>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={authForm.email}
              onChange={handleFieldChange}
              placeholder="you@company.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={authForm.password}
              onChange={handleFieldChange}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="alert error auth-alert">{error}</div>}

          <button type="submit" className="primary-btn full-width" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      )}

      {authMode === "signup" && (
        <form className="auth-form" onSubmit={onSubmit}>
          <h2>Create account</h2>
          <p>Start your secure clinical workflow.</p>

          <label>
            Full Name
            <input
              type="text"
              name="name"
              value={authForm.name}
              onChange={handleFieldChange}
              placeholder="Jane Doe"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={authForm.email}
              onChange={handleFieldChange}
              placeholder="you@company.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={authForm.password}
              onChange={handleFieldChange}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>

          {error && <div className="alert error auth-alert">{error}</div>}

          <button type="submit" className="primary-btn full-width" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}
    </aside>
  );
}
