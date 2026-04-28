import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, signupUser, persistAuthToken, clearAuthToken } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_CURRENT_USER_KEY = "kin_current_user";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function restoreUserSession() {
      try {
        const data = await getCurrentUser();
        if (isMounted) {
          setCurrentUser(data.user);
          localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(data.user));
        }
      } catch (err) {
        if (isMounted) {
          clearAuthToken();
          localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    restoreUserSession();
    return () => { isMounted = false; };
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const data = await loginUser(credentials);
      persistAuthToken(data.access_token);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(data.user));
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    }
  };

  const signup = async (userData) => {
    setError(null);
    try {
      const data = await signupUser(userData);
      persistAuthToken(data.access_token);
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(data.user));
      setCurrentUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || "Signup failed");
      throw err;
    }
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, error, login, signup, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
