import { useState, useEffect, useRef, useCallback } from 'react';
import { pomodoroAPI } from '../utils/api';
import toast from 'react-hot-toast';

const DEFAULT_SETTINGS = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  soundEnabled: true,
};

// Web Audio API bell sound
const playBell = (audioCtx) => {
  if (!audioCtx) return;
  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 1.5);
  } catch {}
};

export const usePomodoro = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [mode, setMode] = useState('work'); // 'work' | 'short-break' | 'long-break'
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [currentBook, setCurrentBook] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Init AudioContext on first user gesture
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Load settings from API
  useEffect(() => {
    pomodoroAPI.getSettings()
      .then(res => {
        const s = res.data.settings;
        setSettings(s);
        setTimeLeft(s.workDuration * 60);
      })
      .catch(() => {});
    pomodoroAPI.getStats()
      .then(res => setSessionStats(res.data.stats))
      .catch(() => {});
  }, []);

  const getDuration = useCallback((m, s) => {
    if (m === 'work') return s.workDuration * 60;
    if (m === 'short-break') return s.shortBreakDuration * 60;
    return s.longBreakDuration * 60;
  }, []);

  // Countdown
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  const handleSessionComplete = useCallback(async () => {
    if (settings.soundEnabled) playBell(audioCtxRef.current);

    const duration = mode === 'work'
      ? settings.workDuration
      : mode === 'short-break'
      ? settings.shortBreakDuration
      : settings.longBreakDuration;

    // Save session to backend
    try {
      await pomodoroAPI.saveSession({
        bookId: currentBook?._id || null,
        bookTitle: currentBook?.title || '',
        type: mode,
        duration,
        completed: true,
      });
      const statsRes = await pomodoroAPI.getStats();
      setSessionStats(statsRes.data.stats);
    } catch {}

    if (mode === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      toast.success(`🍅 Session complete! Great reading!`);
      const nextMode = newCount % settings.sessionsBeforeLongBreak === 0 ? 'long-break' : 'short-break';
      if (settings.autoStartBreaks) {
        switchMode(nextMode, true);
      } else {
        switchMode(nextMode, false);
      }
    } else {
      toast(`☀️ Break over! Ready to read?`);
      switchMode('work', false);
    }
  }, [mode, settings, sessionCount, currentBook]);

  const switchMode = (newMode, autoStart = false) => {
    setMode(newMode);
    setTimeLeft(getDuration(newMode, settings));
    setIsRunning(autoStart);
  };

  const start = () => { initAudio(); setIsRunning(true); };
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode, settings));
  };

  const saveSettings = async (newSettings) => {
    try {
      const res = await pomodoroAPI.updateSettings(newSettings);
      setSettings(res.data.settings);
      setTimeLeft(getDuration(mode, res.data.settings));
      toast.success('Settings saved! 💅');
    } catch {
      toast.error('Could not save settings');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = 1 - timeLeft / getDuration(mode, settings);

  return {
    settings, mode, timeLeft, isRunning, sessionCount,
    currentBook, setCurrentBook,
    sessionStats, progress,
    start, pause, reset,
    switchMode, saveSettings,
    formatTime,
  };
};
