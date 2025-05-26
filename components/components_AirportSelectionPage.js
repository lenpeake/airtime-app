// ✅ Corrected AirportSelectionPage.js using SecureStore instead of AsyncStorage
import React, { useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
// ...rest of the file structure would follow with
// SecureStore.getItemAsync / setItemAsync replacing AsyncStorage.getItem / setItem
