// components/PreferredNameContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../utils/getProfile';
import { useAuth } from './AuthContext';
import { auth } from './supabase';

const PreferredNameContext = createContext();

export const PreferredNameProvider = ({ children }) => {
  const [preferredName, setPreferredNameState] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();

  const setPreferredName = async (name) => {
    setPreferredNameState(name);
    if (name) {
      await AsyncStorage.setItem('preferred_name', name);
    } else {
      await AsyncStorage.removeItem('preferred_name');
    }
  };

  useEffect(() => {
    if (authLoading) return;

    const loadPreferredName = async () => {
      const cachedPreferred = await AsyncStorage.getItem('preferred_name');
      const cachedFirst = await AsyncStorage.getItem('first_name');

      console.log('📦 Cached preferred:', cachedPreferred);
      console.log('📦 Cached first:', cachedFirst);

      if (cachedPreferred) setPreferredNameState(cachedPreferred);
      if (cachedFirst) setFirstName(cachedFirst);

      if (user?.id) {
        console.log('👤 Fetching profile for user ID:', user.id);

        const session = await auth.getSession();
        const accessToken = session?.data?.session?.access_token;
        console.log('🔐 Supabase accessToken:', accessToken);

        const profile = await getProfile(accessToken, user.id);
        console.log('📄 Supabase profile result:', profile);

        if (profile) {
          const { preferred_name, first_name } = profile;

          if (preferred_name) {
            console.log('✅ Setting preferred_name:', preferred_name);
            setPreferredNameState(preferred_name);
            await AsyncStorage.setItem('preferred_name', preferred_name);
          }

          if (first_name) {
            console.log('✅ Setting first_name:', first_name);
            setFirstName(first_name);
            await AsyncStorage.setItem('first_name', first_name);
          }
        }
      } else {
        console.log('⚠️ No user. Clearing names from cache.');
        await AsyncStorage.removeItem('preferred_name');
        await AsyncStorage.removeItem('first_name');
        setPreferredNameState('');
        setFirstName('');
      }

      setLoading(false);
      console.log('✅ Finished loading preferred name context');
    };

    loadPreferredName();
  }, [user, authLoading]);

  return (
    <PreferredNameContext.Provider value={{ preferredName, firstName, setPreferredName, loading }}>
      {children}
    </PreferredNameContext.Provider>
  );
};

export const usePreferredName = () => useContext(PreferredNameContext);
