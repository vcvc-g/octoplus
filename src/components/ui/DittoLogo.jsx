// src/components/ui/DittoLogo.jsx
import React from 'react';

const DittoLogo = ({ className = "", size = "default" }) => {
  const sizes = {
    small: { fontSize: '1.5rem', dotSize: '0.75rem' },
    default: { fontSize: '2rem', dotSize: '1rem' },
    large: { fontSize: '2.5rem', dotSize: '1.25rem' },
    xlarge: { fontSize: '3rem', dotSize: '1.5rem' }
  };

  const { fontSize, dotSize } = sizes[size];

  return (
    <div className={`flex items-center ${className}`} style={{ fontSize }}>
      {/* Container for 'D' and blue dot */}
      <div className="relative">
        {/* The 'D' character */}
        <span className="font-bold">D</span>
        {/* Blue dot positioned over the 'D' */}
        <div
          className="absolute bg-blue-600 rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            top: '-0.1em',
            left: '0.2em'
          }}
        />
      </div>
      {/* Rest of 'itto' */}
      <span className="font-bold">itto</span>
    </div>
  );
};

export default DittoLogo;