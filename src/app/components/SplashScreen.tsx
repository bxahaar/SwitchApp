import React from 'react';
import { motion } from 'motion/react';
import logoImage from 'figma:asset/860f69764076966699956fe8200d107243ec80c2.png';

export const SplashScreen: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2 }}
    >
      {/* Logo Container */}
      <motion.div
        className="relative mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.34, 1.56, 0.64, 1]
        }}
      >
        {/* Glow effect behind logo */}
        <motion.div
          className="absolute inset-0 blur-3xl bg-card/20 rounded-full"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0.6 }}
          transition={{ 
            duration: 1.2,
            ease: "easeOut"
          }}
        />
        
        {/* Logo Image */}
        <motion.img
          src={logoImage}
          alt="Switch Logo"
          className="w-48 h-48 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
      </motion.div>

      {/* App Name */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <h1 className="text-primary-foreground text-4xl font-bold tracking-wide">
          Switch
        </h1>
      </motion.div>

      {/* Subtle bottom accent */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      />
    </motion.div>
  );
};