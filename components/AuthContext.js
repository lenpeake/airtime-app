// components/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase'; // your REST-based client using fetch

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Save session securely
  const setSession = async (session) => {
    try {
      const token = session?.access_token;
      const userInfo = session?.user;
      if (token && userInfo) {
        await SecureStore.setItemAsync('user_session', JSON.stringify({
          access_token: token,
          user: {
            id: userInfo.id,
            email: userInfo.email,
          },
        }));
        setUser(userInfo);
      }
    } catch (err) {
      console.error('❌ Failed to save session:', err);
    }
  };

  // 🚪 Sign out
  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('user_session');
      setUser(null);
    } catch (err) {
      console.error('❌ Failed to sign out:', err);
    }
  };

  // 🧠 Restore session on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await SecureStore.getItemAsync('user_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          const { access_token, user } = parsed;

          // 🔁 Optionally validate token via Supabase here if needed

          setUser(user);
        }
      } catch (err) {
        console.error('❌ Error restoring session:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setSession, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
