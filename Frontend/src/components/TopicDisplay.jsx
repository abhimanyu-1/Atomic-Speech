import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

export const TopicDisplay = ({ topic }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="clay-panel"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', margin: '2rem 0', width: '100%', maxWidth: '600px' }}
    >
      <div style={{
        background: 'var(--accent-coral)',
        padding: '1rem',
        borderRadius: '50%',
        color: 'white',
        boxShadow: '4px 4px 10px rgba(236,122,123,0.3)'
      }}>
        <BrainCircuit size={48} />
      </div>
      
      <div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
          Your Topic Is:
        </h2>
        <motion.h1 
          key={topic}
          initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6 }}
          style={{ 
            fontSize: '2.5rem', 
            margin: 0,
            color: 'var(--accent-coral)',
            fontWeight: 900
          }}
        >
          {topic}
        </motion.h1>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '1rem', fontWeight: 600 }}>
        Take a moment to collect your thoughts. When you're ready, start the recording to speak for 1 minute.
      </p>
    </motion.div>
  );
};
