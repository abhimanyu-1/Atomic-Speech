import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Trophy, Target, FileText, CheckCircle } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

export const FeedbackResult = ({ feedback, onReset }) => {
  if (!feedback) return null;

  const scoreColor = feedback.score >= 8 ? 'var(--success)' : feedback.score >= 5 ? 'var(--accent-yellow)' : 'var(--danger)';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.5 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem', margin: '2rem 0' }}
    >
      {/* Score Header */}
      <motion.div variants={itemVariants} className="clay-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
            <div style={{ background: 'var(--accent-yellow)', padding: '0.75rem', borderRadius: '50%', color: 'white', display: 'flex' }}>
              <Trophy size={24} />
            </div>
            Performance Score
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Based on clarity, structure, and accuracy.</p>
        </div>
        <div className="clay-button" style={{ 
          background: 'var(--bg-panel)',
          color: scoreColor,
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          cursor: 'default'
        }}>
          <span style={{ fontSize: '2.5rem', fontWeight: '900' }}>{feedback.score}</span>
          <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: '700', marginLeft: '2px' }}>/10</span>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Areas for Improvement */}
        <motion.div variants={itemVariants} className="clay-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-coral)', fontSize: '1.25rem', fontWeight: 800 }}>
            <div style={{ background: 'var(--accent-coral)', padding: '0.5rem', borderRadius: '50%', color: 'white', display: 'flex' }}>
              <Target size={20} />
            </div>
            Areas for Improvement
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '1.05rem', fontWeight: 600, textAlign: 'justify' }}>
            {feedback.improvements.map((imp, i) => (
              <li key={i}>{imp}</li>
            ))}
          </ul>
        </motion.div>

        {/* Transcript */}
        <motion.div variants={itemVariants} className="clay-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-blue)', fontSize: '1.25rem', fontWeight: 800 }}>
            <div style={{ background: 'var(--accent-blue)', padding: '0.5rem', borderRadius: '50%', color: 'white', display: 'flex' }}>
              <FileText size={20} />
            </div>
            Your Transcript
          </h3>
          <div style={{ 
            background: 'rgba(96, 165, 250, 0.1)', 
            padding: '1.25rem', 
            borderRadius: '16px', 
            maxHeight: '180px', 
            overflowY: 'auto',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontStyle: 'italic',
            fontWeight: 600,
            border: '2px dashed rgba(96, 165, 250, 0.3)',
            textAlign: 'left'
          }}>
            "{feedback.transcript}"
          </div>
        </motion.div>
      </div>

      {/* Ideal Explanation */}
      <motion.div variants={itemVariants} className="clay-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)', fontSize: '1.25rem', fontWeight: 800 }}>
          <div style={{ background: 'var(--success)', padding: '0.5rem', borderRadius: '50%', color: 'white', display: 'flex' }}>
            <CheckCircle size={20} />
          </div>
          Ideal 1-Minute Explanation
        </h3>
        <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, fontSize: '1.1rem', fontWeight: 600, textAlign: 'justify' }}>
          {feedback.ideal_explanation}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <PrimaryButton onClick={onReset} icon={RefreshCcw} className="secondary">
          Try Another Topic
        </PrimaryButton>
      </motion.div>
    </motion.div>
  );
};
