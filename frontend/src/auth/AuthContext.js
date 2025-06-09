import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

function isValidJWT(token) {
  // JWT should have three parts separated by dots
  return typeof token === 'string' && token.split('.').length === 3;
}

function isTokenExpired(token) {
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('[AuthContext] useEffect: storedToken:', storedToken);
    if (isValidJWT(storedToken) && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      const decoded = jwtDecode(storedToken);
      setUser(decoded);
      console.log('[AuthContext] useEffect: user set to', decoded);
    } else {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      console.log('[AuthContext] useEffect: token invalid or expired, user set to null');
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await axios.post('/auth/login', new URLSearchParams({ username, password }), {
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (isValidJWT(res.data.access_token)) {
      setToken(res.data.access_token);
      const decoded = jwtDecode(res.data.access_token);
      setUser(decoded);
      localStorage.setItem('token', res.data.access_token);
      console.log('[AuthContext] login: user set to', decoded);
    }
    return res;
  };

  const register = async (username, password) => {
    const res = await axios.post('/auth/register', { username, password }, {
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    });
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    console.log('[AuthContext] logout: user set to null');
  };

  const value = { user, token, login, logout, register, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
} 