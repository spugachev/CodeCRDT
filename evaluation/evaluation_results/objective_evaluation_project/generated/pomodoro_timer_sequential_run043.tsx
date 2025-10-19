import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [settings, setSettings] = useState<TimerSettings>({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
  });

  const totalTime = settings[mode] * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const modeColors = {
    work: {
      primary: 'from-rose-500 via-pink-500 to-purple-500',
      glow: 'shadow-rose-500/50',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    shortBreak: {
      primary: 'from-cyan-500 via-blue-500 to-indigo-500',
      glow: 'shadow-cyan-500/50',
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    longBreak: {
      primary: 'from-emerald-500 via-teal-500 to-green-500',
      glow: 'shadow-emerald-500/50',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  };

  const currentColors = modeColors[mode];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const playCompletionSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    setShowCompletion(true);
    playCompletionSound();

    setTimeout(() => {
      setShowCompletion(false);
      if (mode === 'work') {
        setCompletedPomodoros((prev) => prev + 1);
        const nextMode = (completedPomodoros + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
        setTimeLeft(settings[nextMode] * 60);
      } else {
        setMode('work');
        setTimeLeft(settings.work * 60);
      }
    }, 2000);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
  };

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute rounded-full ${currentColors.bg} blur-sm`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            Pomodoro Flow
          </h1>
          <p className="text-slate-400 text-lg">Focus • Break • Repeat</p>
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-3 mb-12 backdrop-blur-xl bg-white/5 p-2 rounded-2xl border border-white/10"
        >
          {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
            <Button
              key={m}
              onClick={() => changeMode(m)}
              variant="ghost"
              className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                mode === m
                  ? `bg-gradient-to-r ${modeColors[m].primary} text-white shadow-lg ${modeColors[m].glow}`
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {m === 'work' ? 'Work' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </Button>
          ))}
        </motion.div>

        {/* Timer Circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-12"
        >
          {/* Glow Effect */}
          <div
            className={`absolute inset-0 rounded-full blur-3xl opacity-30 bg-gradient-to-r ${currentColors.primary}`}
          />

          {/* Glass Container */}
          <div className="relative backdrop-blur-2xl bg-white/5 rounded-full p-8 border border-white/10 shadow-2xl">
            <svg width="400" height="400" className="transform -rotate-90">
              {/* Background Circle */}
              <circle
                cx="200"
                cy="200"
                r="180"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="12"
              />

              {/* Progress Circle */}
              <motion.circle
                cx="200"
                cy="200"
                r="180"
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 180}`}
                strokeDashoffset={`${2 * Math.PI * 180 * (1 - progress / 100)}`}
                className={`transition-all duration-1000 ease-linear`}
                style={{
                  stroke: `url(#gradient-${mode})`,
                  filter: `drop-shadow(0 0 8px ${
                    mode === 'work'
                      ? 'rgba(244, 63, 94, 0.5)'
                      : mode === 'shortBreak'
                      ? 'rgba(6, 182, 212, 0.5)'
                      : 'rgba(16, 185, 129, 0.5)'
                  })`,
                }}
              />

              <defs>
                <linearGradient id={`gradient-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop
                    offset="0%"
                    stopColor={
                      mode === 'work' ? '#f43f5e' : mode === 'shortBreak' ? '#06b6d4' : '#10b981'
                    }
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      mode === 'work' ? '#a855f7' : mode === 'shortBreak' ? '#6366f1' : '#14b8a6'
                    }
                  />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={mode}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="text-8xl font-bold text-white mb-4 tabular-nums tracking-tight">
                  {formatTime(timeLeft)}
                </div>
                <div className={`text-xl font-medium ${currentColors.text} uppercase tracking-wider`}>
                  {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-8"
        >
          <Button
            onClick={toggleTimer}
            size="lg"
            className={`w-32 h-16 rounded-2xl text-lg font-semibold bg-gradient-to-r ${currentColors.primary} hover:opacity-90 transition-all duration-300 shadow-lg ${currentColors.glow}`}
          >
            {isRunning ? (
              <>
                <Pause className="mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-2" /> Start
              </>
            )}
          </Button>

          <Button
            onClick={resetTimer}
            size="lg"
            variant="ghost"
            className="w-16 h-16 rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
          >
            <RotateCcw />
          </Button>

          <Button
            onClick={() => setShowSettings(!showSettings)}
            size="lg"
            variant="ghost"
            className="w-16 h-16 rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
          >
            <Settings />
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-1">{completedPomodoros}</div>
            <div className="text-slate-400 text-sm uppercase tracking-wider">Completed Today</div>
          </div>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            >
              <div
                className="backdrop-blur-2xl bg-slate-900/90 rounded-3xl p-8 border border-white/10 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Timer Settings</h2>

                <div className="space-y-6">
                  {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                    <div key={m}>
                      <label className="block text-slate-300 mb-2 capitalize">
                        {m === 'shortBreak' ? 'Short Break' : m === 'longBreak' ? 'Long Break' : m} (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings[m]}
                        onChange={(e) =>
                          setSettings({ ...settings, [m]: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        min="1"
                        max="60"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    setShowSettings(false);
                    setTimeLeft(settings[mode] * 60);
                  }}
                  className="w-full mt-6 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                >
                  Save Settings
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Animation */}
        <AnimatePresence>
          {showCompletion && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                className={`text-9xl`}
              >
                ✨
              </motion.div>

              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{
                    opacity: [1, 0],
                    scale: [0, 2],
                    x: Math.cos((i * Math.PI * 2) / 12) * 200,
                    y: Math.sin((i * Math.PI * 2) / 12) * 200,
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`absolute w-4 h-4 rounded-full bg-gradient-to-r ${currentColors.primary}`}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}