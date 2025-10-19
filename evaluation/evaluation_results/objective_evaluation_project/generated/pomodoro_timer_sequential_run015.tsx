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
      {/* Floating Particles Background */}
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
            Pomodoro Flow
          </h1>
          <p className="text-gray-400">Stay focused, stay productive</p>
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
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {m === 'work' ? 'Work' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </Button>
          ))}
        </motion.div>

        {/* Timer Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-12"
        >
          {/* Glass Morphism Container */}
          <div className="relative backdrop-blur-2xl bg-white/5 rounded-full p-8 border border-white/10 shadow-2xl">
            {/* SVG Progress Ring */}
            <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 320 320">
              {/* Background Circle */}
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="12"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="160"
                cy="160"
                r="140"
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                className={`drop-shadow-[0_0_20px_currentColor]`}
                style={{
                  stroke: `url(#gradient-${mode})`,
                }}
                initial={{ strokeDasharray: '0 880' }}
                animate={{
                  strokeDasharray: `${(progress / 100) * 880} 880`,
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
              <defs>
                <linearGradient id="gradient-work" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="gradient-shortBreak" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="gradient-longBreak" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={timeLeft}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`text-7xl font-bold bg-gradient-to-r ${currentColors.primary} bg-clip-text text-transparent`}
              >
                {formatTime(timeLeft)}
              </motion.div>
              <div className="text-gray-400 text-sm mt-2 uppercase tracking-wider">
                {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </div>
              <div className="flex gap-2 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < completedPomodoros % 4 ? currentColors.bg : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Pulsing Glow Effect */}
          {isRunning && (
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentColors.primary} opacity-20 blur-3xl`}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4"
        >
          <Button
            onClick={toggleTimer}
            size="lg"
            className={`px-8 py-6 rounded-2xl bg-gradient-to-r ${currentColors.primary} hover:opacity-90 transition-all duration-300 shadow-lg ${currentColors.glow} text-white font-semibold`}
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
            className="px-8 py-6 rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
          >
            <RotateCcw />
          </Button>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            size="lg"
            variant="ghost"
            className="px-8 py-6 rounded-2xl backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
          >
            <Settings />
          </Button>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 backdrop-blur-2xl bg-white/5 p-6 rounded-2xl border border-white/10 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Timer Settings</h3>
              <div className="space-y-4">
                {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
                  <div key={m} className="flex items-center justify-between">
                    <label className="text-gray-300 capitalize">
                      {m === 'shortBreak' ? 'Short Break' : m === 'longBreak' ? 'Long Break' : m}
                    </label>
                    <input
                      type="number"
                      value={settings[m]}
                      onChange={(e) =>
                        setSettings({ ...settings, [m]: parseInt(e.target.value) || 1 })
                      }
                      className="w-20 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center"
                      min="1"
                      max="60"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Animation */}
        <AnimatePresence>
          {showCompletion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div
                className={`text-8xl font-bold bg-gradient-to-r ${currentColors.primary} bg-clip-text text-transparent`}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 0.5 }}
              >
                🎉
              </motion.div>
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-4 h-4 rounded-full bg-gradient-to-r ${currentColors.primary}`}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    opacity: 0,
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="text-gray-400 text-sm mb-2">Completed Today</div>
          <div className={`text-4xl font-bold ${currentColors.text}`}>{completedPomodoros}</div>
        </motion.div>
      </div>
    </div>
  );
}