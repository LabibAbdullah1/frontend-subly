// src/components/ui/GlowingGridBackground.tsx
import React from 'react';
import { motion } from 'framer-motion';

export const GlowingGridBackground: React.FC = () => {
  const glowCells = [
    { left: '12%', top: '18%', delay: 0 },
    { left: '28%', top: '28%', delay: 1.5 },
    { left: '72%', top: '15%', delay: 3 },
    { left: '88%', top: '42%', delay: 0.5 },
    { left: '18%', top: '68%', delay: 2 },
    { left: '48%', top: '78%', delay: 4 },
    { left: '58%', top: '32%', delay: 1 },
    { left: '82%', top: '72%', delay: 2.5 },
    { left: '38%', top: '22%', delay: 3.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* Dynamic Orange/Amber Light Blobs */}
      <motion.div
        animate={{
          x: [-60, 160, -60],
          y: [-30, 90, -30],
          opacity: [0.7, 0.95, 0.7],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,_rgba(249,115,22,0.13)_0%,_rgba(249,115,22,0)_70%)] blur-3xl"
        style={{ left: '15%', top: '12%' }}
      />
      <motion.div
        animate={{
          x: [120, -120, 120],
          y: [60, -90, 60],
          opacity: [0.65, 0.85, 0.65],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.11)_0%,_rgba(245,158,11,0)_70%)] blur-3xl"
        style={{ right: '12%', top: '28%' }}
      />
      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [90, -60, 90],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,_rgba(234,88,12,0.08)_0%,_rgba(234,88,12,0)_70%)] blur-3xl"
        style={{ left: '38%', bottom: '22%' }}
      />

      {/* Symmetrical Grid lines */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(249,115,22,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(249,115,22,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"
        style={{
          maskImage: 'radial-gradient(ellipse 65% 55% at 50% 35%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 35%, #000 60%, transparent 100%)'
        }}
      />

      {/* Individual Pulsating Glow Cells */}
      <div className="absolute inset-0">
        {glowCells.map((cell, idx) => (
          <motion.div
            key={idx}
            animate={{
              opacity: [0, 0.45, 0],
              scale: [0.9, 1.05, 0.9],
            }}
            transition={{
              duration: 6,
              delay: cell.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-12 h-12 border border-brand-primary/10 bg-brand-primary/2 shadow-[0_0_12px_rgba(249,115,22,0.08)] rounded-sm"
            style={{
              left: cell.left,
              top: cell.top,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    </div>
  );
};
export default GlowingGridBackground;
