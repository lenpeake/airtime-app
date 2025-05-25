// ElegantLockIcon.js
import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

export default function ElegantLockIcon({ size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Gold body */}
      <Rect x="5" y="10" width="14" height="10" rx="2" fill="#FFD700" />
      {/* White shackle */}
      <Path
        d="M8 10V7a4 4 0 018 0v3"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
