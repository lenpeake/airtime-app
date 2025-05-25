// components/supabase.js

import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

import { GoTrueClient } from '@supabase/gotrue-js';
import { PostgrestClient } from '@supabase/postgrest-js';
import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig.extra.supabaseUrl;
const SUPABASE_ANON_KEY = Constants.expoConfig.extra.supabaseAnonKey;

// ✅ Authentication client
export const auth = new GoTrueClient({
  url: `${SUPABASE_URL}/auth/v1`,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
  headers: {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  },
});

// ✅ Start with anonymous Postgrest client
let db = new PostgrestClient(`${SUPABASE_URL}/rest/v1`, {
  headers: {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  },
});

// ✅ Replace Postgrest client with user token when logged in
auth.onAuthStateChange((_event, session) => {
  const accessToken = session?.access_token;

  if (accessToken) {
    db = new PostgrestClient(`${SUPABASE_URL}/rest/v1`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });
  }
});

// ✅ Getter function to always use latest db client
export function getDb() {
  return db;
}
