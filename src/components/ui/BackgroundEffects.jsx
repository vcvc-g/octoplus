// src/components/ui/BackgroundEffects.jsx
import React from 'react';

const BackgroundEffects = ({ animateBackground }) => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 to-purple-900"></div>
      <div className="animate-pulse absolute -top-10 -left-10 w-32 h-32 rounded-full bg-blue-500 blur-xl"></div>
      <div className="animate-pulse absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-purple-600 blur-xl"></div>
      <div className="animate-pulse absolute bottom-0 left-1/4 w-36 h-36 rounded-full bg-blue-400 blur-xl"></div>
      {animateBackground && (
        <>
          {/* Pattern created with divs instead of using problematic URL */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="grid grid-cols-10 gap-4">
              {Array(100).fill().map((_, i) => (
                <div key={i} className="w-10 h-10 bg-blue-400/20 rounded"></div>
              ))}
            </div>
          </div>
          <div className="absolute animate-[spin_30s_linear_infinite] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full border-4 border-blue-500 rounded-full opacity-10"></div>
        </>
      )}
    </div>
  );
};

export default BackgroundEffects;