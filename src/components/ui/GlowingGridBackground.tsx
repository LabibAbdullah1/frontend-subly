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
      {/* Dynamic Gold/Orange Light Blobs - Static layout after initial fade-in to optimize GPU performance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5 }}
        className="absolute w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,_rgba(210,173,94,0.12)_0%,_rgba(210,173,94,0)_70%)] blur-3xl"
        style={{ left: '15%', top: '12%' }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.65 }}
        transition={{ duration: 1.8, delay: 0.2 }}
        className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,_rgba(249,115,22,0.13)_0%,_rgba(249,115,22,0)_70%)] blur-3xl"
        style={{ right: '12%', top: '28%' }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2, delay: 0.4 }}
        className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,_rgba(249,115,22,0.08)_0%,_rgba(249,115,22,0)_70%)] blur-3xl"
        style={{ left: '38%', bottom: '22%' }}
      />

      {/* Symmetrical Grid lines */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(210,173,94,0.04)_1.5px,transparent_1.5px),linear-gradient(to_bottom,rgba(210,173,94,0.04)_1.5px,transparent_1.5px)] bg-[size:48px_48px]"
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
            className="absolute w-12 h-12 border border-brand-primary/15 bg-brand-primary/3 shadow-[0_0_12px_var(--glow-orange)] rounded-sm"
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
