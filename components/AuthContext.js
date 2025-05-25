// components/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Save session
  const setSession = async (sessionData) => {
    const token = sessionData?.access_token;
    const user = sessionData?.user;
    if (token && user) {
      await AsyncStorage.setItem('user_session', JSON.stringify({
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
      // add more fields here if needed
        },
      }));
    }
    setUser(user);
  };

  // 🚪 Logout
  const signOut = async () => {
    await AsyncStorage.removeItem('user_session');
    setUser(null);
  };

  // 🚀 Restore session on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('user_session');
        if (stored) {
          const parsed = JSON.parse(stored);

          const result = await auth.setSession({
            access_token: parsed.access_token,
          });

          if (result?.data?.user) {
            setUser(result.data.user);

            await AsyncStorage.setItem('user_session', JSON.stringify({
              access_token: result.data.session.access_token,
              user: {
                id: result.data.user.id,
                email: result.data.user.email,
              },
            }));
          } else {
            console.warn('⚠️ Supabase session was not restored');
          }
        }
      } catch (err) {
        console.error('❌ Failed to restore session:', err);
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
