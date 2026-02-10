import React from 'react';
import DotGrid from '@/components/ui/DotGrid';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 transition-colors duration-500 overflow-hidden">
      {/* Base Gradient - kept subtle to allow dots to show */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/80 to-blue-50/50 dark:from-dark-900 dark:via-dark-800 dark:to-primary-900/20 transition-colors duration-500" />
      
      {/* Dot Grid Effect */}
      <div className="absolute inset-0 opacity-40 dark:opacity-30">
        <DotGrid 
          dotSize={2}
          gap={32}
          baseColor="#94a3b8"
          activeColor="#6366f1"
          proximity={150}
          shockRadius={200}
        />
      </div>
    </div>
  );
};

export default AnimatedBackground;
