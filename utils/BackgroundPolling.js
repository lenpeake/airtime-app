import { supabase } from '../components/supabase';
import { pollAndStoreWaitTime, checkSurgeWarning } from './TsaPolling';
import { sendSurgeNotification } from './Notifications';

const POLLING_INTERVAL_MINUTES = 10; // Adjust as needed

/**
 * Polls all airports in the monitored_airports table,
 * stores wait times, checks for surges, and sends alerts.
 */
export async function pollAllMonitoredAirports() {
  const { data: airports, error } = await supabase
    .from('monitored_airports')
    .select('airport_code');

  if (error) {
    console.error('❌ Failed to fetch monitored airports:', error.message);
    return;
  }

  for (const { airport_code } of airports) {
    console.log(`🔄 Polling ${airport_code}...`);

    await pollAndStoreWaitTime(airport_code);

    const surge = await checkSurgeWarning(airport_code);
    if (surge?.surged) {
      await sendSurgeNotification(
        `🚨 Surge Alert at ${surge.airportCode}`,
        `Security wait spiked to ${surge.current} mins (was ${surge.previousAverage.toFixed(1)}).`
      );
    }
  }

  console.log('✅ Completed one polling cycle.');
}
