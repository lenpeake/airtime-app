// utils/getProfile.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const getProfile = async (accessToken, userId) => {
  if (!accessToken || !userId) {
    console.warn('⚠️ getProfile called without accessToken or userId');
    return null;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=preferred_name,first_name`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data || data.length === 0) {
      console.error('❌ getProfile REST error:', response.status, data);
      return null;
    }

    console.log('📄 getProfile returned:', data[0]);
    return data[0];
  } catch (err) {
    console.error('🔥 Unexpected getProfile failure:', err);
    return null;
  }
};
