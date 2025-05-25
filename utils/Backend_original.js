// utils/Backend.js
import { auth } from '../components/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

/**
 * Submit an actual wait time report to Supabase.
 */
export async function submitWaitTime(
  airportCode,
  actualMinutes,
  estimatedMinutes = null,
  language = 'en',
  deviceId = null,
  lineType = 'regular'
) {
  console.log('📤 Submitting to Supabase:', {
    airportCode,
    actualMinutes,
    estimatedMinutes,
    language,
    deviceId,
    lineType,
  });

  const session = await auth.getSession();
  const accessToken = session?.data?.session?.access_token;

  if (!accessToken) {
    console.error('❌ No access token found — user is not authenticated');
    throw new Error('No access token available for authenticated insert');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/actual_wait_times`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify([
      {
        airport_code: airportCode,
        actual_minutes: actualMinutes,
        estimated_minutes: estimatedMinutes,
        language,
        device_id: deviceId,
        line_type: lineType,
      },
    ]),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('🚨 Supabase Insert Error:', data);
    throw new Error(data.message || 'Submission failed');
  }

  console.log('✅ Submission Success:', data);
  return data;
}

/**
 * Ensure an airport is being monitored in the monitored_airports table.
 * Only inserts if the airport doesn't already exist (merge-duplicates strategy).
 */
export async function addToMonitoredAirportsIfNeeded(airportCode, accessToken) {
  if (!accessToken) {
    console.warn(`⚠️ Skipping monitored_airports insert — token is missing`);
    return;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/monitored_airports`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify([
        {
          airport_code: airportCode,
          added_by_user: true,
          added_at: new Date().toISOString(),
        },
      ]),
    });

    const text = await res.text();
    if (!res.ok) {
      if (text.includes('duplicate key value')) {
        console.warn(`⚠️ Airport ${airportCode} already monitored.`);
      } else {
        throw new Error(text);
      }
    } else {
      console.log(`✅ Airport ${airportCode} added to monitored list.`);
    }
  } catch (err) {
    console.error(`❌ Failed to add ${airportCode}:`, err.message);
  }
}

/**
 * Update an existing wait time record with actual_minutes, line_type, language, and weather.
 */
export async function updateWaitTime(rowId, actualMinutes, lineType, language, airportCode) {
  const session = await auth.getSession();
  const accessToken = session?.data?.session?.access_token;

  if (!accessToken || !rowId) {
    throw new Error('Missing access token or row ID');
  }

  try {
    // Step 1: Fetch coordinates from monitored_airports
    const coordRes = await fetch(`${SUPABASE_URL}/rest/v1/monitored_airports?airport_code=eq.${airportCode}`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const [airport] = await coordRes.json();
    if (!airport || !airport.latitude || !airport.longitude) {
      throw new Error('Airport coordinates not found');
    }

    // Step 2: Fetch weather from Tomorrow.io
    const weatherRes = await fetch(
      `https://api.tomorrow.io/v4/weather/forecast?location=${airport.latitude},${airport.longitude}&apikey=SIMdo0u0s1UiTyLbkTe5A21n6To8bztz`
    );
    const weatherJson = await weatherRes.json();
    const current = weatherJson.timelines?.minutely?.[0]?.values || {};

    const weatherData = {
      weather_desc: current.weatherCode || 'unknown',
      temp_celsius: current.temperature,
      wind_speed_kph: current.windSpeed,
      humidity_percent: current.humidity,
    };

    // Step 3: Update Supabase row
    const res = await fetch(`${SUPABASE_URL}/rest/v1/actual_wait_times?id=eq.${rowId}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actual_minutes: parseInt(actualMinutes),
        line_type: lineType,
        submitted_at: new Date().toISOString(),
        language,
        ...weatherData,
      }),
    });

    const raw = await res.text();

if (!res.ok) {
  let errorData;
  try {
    errorData = raw ? JSON.parse(raw) : {};
  } catch {
    errorData = { message: 'Unknown error' };
  }
  throw new Error(errorData.message || 'Failed to update wait time with weather');
}

try {
  return raw ? JSON.parse(raw) : null;
} catch {
  return null; // PATCH succeeded but no response body
}

  } catch (err) {
    console.error('❌ updateWaitTime error:', err);
    throw err;
  }
}
