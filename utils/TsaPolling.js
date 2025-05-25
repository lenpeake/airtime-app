import { supabase } from '../components/supabase';

const API_KEY = 'tXe9U637JNs0Fg4w5UeTV904toOVF2r1'; // Your TSAWaitTimes.com API key
const BASE_URL = 'https://www.tsawaittimes.com/api/airport';

/**
 * Poll TSA wait time for a given airport and store snapshot in Supabase.
 * @param {string} airportCode - IATA airport code (e.g., "JFK")
 */
export async function pollAndStoreWaitTime(airportCode) {
  try {
    const response = await fetch(`${BASE_URL}/${airportCode}/json?apikey=${API_KEY}`);
    const result = await response.json();

    const waitTime = result?.data?.waitTime;
    if (typeof waitTime !== 'number') {
      console.warn(`🛑 Invalid wait time from TSA API for ${airportCode}`, result);
      return;
    }

    console.log(`📊 TSA Wait Time @ ${airportCode}: ${waitTime} mins`);

    const { error } = await supabase.from('airport_wait_history').insert([
      {
        airport_code: airportCode,
        wait_minutes: waitTime,
      },
    ]);

    if (error) {
      console.error('🚨 Failed to save wait time to Supabase:', error.message);
    } else {
      console.log('✅ TSA wait time saved to Supabase.');
    }
  } catch (err) {
    console.error(`❌ Error fetching TSA wait time for ${airportCode}:`, err);
  }
}

/**
 * Check for a surge in wait time at a given airport.
 * A surge is defined as latest wait time >= 1.4x the average of the 3 previous reports.
 * @param {string} airportCode - IATA code (e.g., "ATL")
 * @returns {object|null} - surge result or null if not enough data
 */
export async function checkSurgeWarning(airportCode) {
  const { data, error } = await supabase
    .from('airport_wait_history')
    .select('wait_minutes, fetched_at')
    .eq('airport_code', airportCode)
    .order('fetched_at', { ascending: false })
    .limit(4); // 1 latest + 3 historical

  if (error) {
    console.error('❌ Error fetching wait history:', error.message);
    return null;
  }

  if (!data || data.length < 4) {
    console.log('⏳ Not enough data to calculate surge for', airportCode);
    return null;
  }

  const [latest, ...previous] = data;

  const avgPrev = previous.reduce((sum, entry) => sum + entry.wait_minutes, 0) / previous.length;
  const surgeRatio = latest.wait_minutes / avgPrev;

  console.log(
    `📈 Surge ratio at ${airportCode}: ${surgeRatio.toFixed(2)}x (latest: ${latest.wait_minutes} mins, avg: ${avgPrev.toFixed(1)} mins)`
  );

  if (surgeRatio >= 1.4) {
    return {
      surged: true,
      airportCode,
      current: latest.wait_minutes,
      previousAverage: avgPrev
    };
  }

  return { surged: false };
}
