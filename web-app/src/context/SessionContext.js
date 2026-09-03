"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { refreshSession, clearClientAuth, markSessionActive } from '../lib/authClient';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('currentProfile') || 'null');
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const isLoggedIn = async () => {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      return res.ok;
    };

    const checkAuth = async () => {
      try {
        let ok = await isLoggedIn();
        if (!ok) {
          // L'access token a peut-être expiré : on tente un renouvellement
          // via le cookie HttpOnly, puis on revérifie.
          const refreshed = await refreshSession();
          if (refreshed) ok = await isLoggedIn();
        }
        if (cancelled) return;
        setIsAuthenticated(ok);
        if (!ok) {
          setCurrentProfile(null);
          clearClientAuth();
        }
      } catch {
        if (!cancelled) setIsAuthenticated(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkAuth();

    // Renouvellement opportuniste quand l'onglet redevient visible.
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshSession();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const login = async (token, refreshToken) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, refreshToken }),
      });
      if (res.ok) {
        markSessionActive();
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthenticated(false);
      setCurrentProfile(null);
      try {
        localStorage.removeItem('currentProfile');
      } catch {
        /* ignore */
      }
      clearClientAuth();
      router.push('/');
    }
  };

  const selectProfile = (profile) => {
    setCurrentProfile(profile);
    try {
      if (profile) localStorage.setItem('currentProfile', JSON.stringify(profile));
      else localStorage.removeItem('currentProfile');
    } catch {
      /* ignore */
    }
  };

  return (
    <SessionContext.Provider value={{
      isAuthenticated,
      currentProfile,
      isLoading,
      login,
      logout,
      selectProfile
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
