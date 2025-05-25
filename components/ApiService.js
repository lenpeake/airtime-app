import axios from 'axios';

// Function to fetch TSA wait times for a given airport code
export const getAirportWaitTimes = async (airportCode) => {
  const url = `https://www.tsa.gov/data/apcp/${airportCode}.json`;

  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('API responded with an unexpected status.');
    }
  } catch (error) {
    console.error("Error fetching TSA wait times:", error);
    throw error;
  }
};
