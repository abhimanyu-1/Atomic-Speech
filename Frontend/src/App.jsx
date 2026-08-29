import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { PrimaryButton } from './components/PrimaryButton';
import { TopicDisplay } from './components/TopicDisplay';
import { AudioRecorder } from './components/AudioRecorder';
import { FeedbackResult } from './components/FeedbackResult';
import './App.css';

const STATES = {
  IDLE: 'IDLE',
  PREPARATION: 'PREPARATION',
  RECORDING: 'RECORDING',
  ANALYZING: 'ANALYZING',
  RESULT: 'RESULT',
};

const API_URL = import.meta.env.VITE_API_URL || 'https://atomic-speech.onrender.com';

function App() {
  const [appState, setAppState] = useState(STATES.IDLE);
  const [topic, setTopic] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch categories on mount
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        const data = await response.json();
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setSelectedCategory(data.categories[0]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const fetchTopic = async () => {
    try {
      const url = selectedCategory
        ? `${API_URL}/topics/random?category=${encodeURIComponent(selectedCategory)}`
        : `${API_URL}/topics/random`;

      const response = await fetch(url);
      const data = await response.json();
      setTopic(data.topic);
      setAppState(STATES.PREPARATION);
    } catch (error) {
      console.error("Failed to fetch topic:", error);
      setTopic("Algorithm Time Complexity");
      setAppState(STATES.PREPARATION);
    }
  };

  const handleRecordingComplete = async (audioBlob) => {
    setAppState(STATES.ANALYZING);

    try {
      const formData = new FormData();
      const mimeType = audioBlob.type || 'audio/webm';
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      formData.append("audio", audioBlob, `speech.${extension}`);
      formData.append("topic", topic);

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFeedback(data);
      setAppState(STATES.RESULT);
    } catch (error) {
      console.error("Error analyzing audio:", error);
      // Mock fallback
      setFeedback({
        score: 0,
        improvements: ["Failed to connect to backend. Please ensure the FastAPI server is running."],
        transcript: "(No transcript generated due to error)",
        ideal_explanation: "(No ideal explanation generated due to error)"
      });
      setAppState(STATES.RESULT);
    }
  };

  const resetApp = () => {
    setTopic('');
    setFeedback(null);
    setAppState(STATES.IDLE);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', justifyContent: 'center' }}>

      <AnimatePresence mode="wait">
        {appState === STATES.IDLE && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
            className="classroom-container"
          >
            {/* Teacher Illustration */}
            <motion.img
              src="/assets/teacher.png"
              alt="Teacher"
              className="teacher-illustration"
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />

            {/* Students Illustration */}
            <motion.img
              src="/assets/students.png"
              alt="Students"
              className="students-illustration"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 1 }}
            />

            <div className="clay-panel" style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem',
              width: '100%', 
              maxWidth: '600px', 
              position: 'relative', 
              zIndex: 10 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%', boxSizing: 'border-box' }}>
                <h1 style={{
                  fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                  margin: 0,
                  color: 'var(--accent-coral)',
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                  textShadow: '2px 2px 4px rgba(236,122,123,0.3)',
                  lineHeight: 1.1
                }}>
                  AtomicSpeak
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 4vw, 1.25rem)', margin: 0, fontWeight: 700 }}>
                  One minute. One topic. One step better.
                </p>
              </div>

              <div style={{ width: '100%', maxWidth: '350px', boxSizing: 'border-box' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.05rem', textAlign: 'left' }}>
                  Select a Field of Study:
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '16px',
                      background: 'var(--bg-page)',
                      border: '2px solid rgba(236,122,123,0.2)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.02), inset -2px -2px 5px rgba(255,255,255,1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span>{selectedCategory || (categories.length === 0 ? "Loading categories..." : "Select a category")}</span>
                    <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} style={{ color: 'var(--accent-coral)' }}>
                      ▼
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scaleY: 0.9 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -10, scaleY: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 0.5rem)',
                          left: 0,
                          width: '100%',
                          background: 'white',
                          borderRadius: '16px',
                          boxShadow: '0 10px 25px rgba(236,122,123,0.2)',
                          zIndex: 50,
                          overflowY: 'auto',
                          maxHeight: '220px',
                          transformOrigin: 'top center',
                          boxSizing: 'border-box'
                        }}
                      >
                        {categories.map(cat => (
                          <div
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsDropdownOpen(false);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-page)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            style={{
                              padding: '1rem',
                              cursor: 'pointer',
                              fontWeight: '700',
                              color: 'var(--text-primary)',
                              transition: 'background 0.2s'
                            }}
                          >
                            {cat}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <PrimaryButton onClick={fetchTopic} icon={Play} disabled={categories.length === 0}>
                Start Session
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {(appState === STATES.PREPARATION || appState === STATES.RECORDING || appState === STATES.ANALYZING) && (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
          >
            <TopicDisplay topic={topic} />

            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              isAnalyzing={appState === STATES.ANALYZING}
            />
          </motion.div>
        )}

        {appState === STATES.RESULT && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <FeedbackResult feedback={feedback} onReset={resetApp} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
