import React from 'react';
import { motion } from 'framer-motion';

export const PrimaryButton = ({ onClick, children, icon: Icon, variant = 'primary', disabled = false, className = '' }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`clay-button ${variant} ${className}`}
      whileTap={{ scale: 0.98 }}
    >
      {Icon && <Icon size={20} />}
      {children}
    </motion.button>
  );
};
