// components/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { auth } from './supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setSession = async (sessionData) => {
    const token = sessionData?.access_token;
    const user = sessionData?.user;
    if (token && user) {
      await SecureStore.setItemAsync('user_session', JSON.stringify({
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
        },
      }));
    }
    setUser(user);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('user_session');
    setUser(null);
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await SecureStore.getItemAsync('user_session');
        if (stored) {
          const parsed = JSON.parse(stored);

          const result = await auth.setSession({
            access_token: parsed.access_token,
          });

          if (result?.data?.user) {
            setUser(result.data.user);

            await SecureStore.setItemAsync('user_session', JSON.stringify({
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
