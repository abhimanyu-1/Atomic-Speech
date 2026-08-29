import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

export const AudioRecorder = ({ onRecordingComplete, isAnalyzing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    let interval;
    if (isRecording && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRecording && timeLeft === 0) {
      stopRecording();
    }
    return () => clearInterval(interval);
  }, [isRecording, timeLeft]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimeLeft(60);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to record your speech.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isAnalyzing) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ type: "spring", bounce: 0.5 }}
        className="clay-panel"
        style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%', maxWidth: '600px' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={{ color: 'var(--accent-coral)' }}
        >
          <Loader2 size={48} />
        </motion.div>
        <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Analyzing your speech...</h3>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem', fontWeight: 600 }}>
          Evaluating clarity, content, and delivery.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="clay-panel"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', width: '100%', maxWidth: '600px' }}
    >
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {isRecording && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: 'absolute',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'var(--accent-coral)',
              zIndex: 0
            }}
          />
        )}
        
        <div className="clay-button" style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1,
          background: isRecording ? 'var(--accent-coral)' : 'var(--bg-panel)',
          color: isRecording ? 'white' : 'var(--text-primary)',
          padding: 0
        }}>
          <span style={{ fontSize: '2.5rem', fontWeight: '900' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div>
        {!isRecording ? (
          <PrimaryButton onClick={startRecording} icon={Mic}>
            Start Recording
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={stopRecording} icon={Square} className="secondary">
            Stop Recording
          </PrimaryButton>
        )}
      </div>
    </motion.div>
  );
};
