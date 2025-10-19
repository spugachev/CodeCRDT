import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimerMode {
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  label: string;
}

interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const defaultSettings: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4
};

const timerModes: Record<string, { colors: string; gradient: string }> = {
  work: {
    colors: 'from-rose-500 via-pink-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-rose-500/20 via-pink-500/20 to-purple-500/20'
  },
  shortBreak: {
    colors: 'from-cyan-500 via-blue-500 to-indigo-500',
    gradient: 'bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20'
  },
  longBreak: {
    colors: 'from-emerald-500 via-teal-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20'
  }
};

export default function PomodoroTimer() {
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [currentMode, setCurrentMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalTime = currentMode === 'work' 
    ? settings.workDuration * 60 
    : currentMode === 'shortBreak'
    ? settings.shortBreakDuration * 60
    : settings.longBreakDuration * 60;

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    const generatedParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }));
    setParticles(generatedParticles);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            
            // Play completion sound
            if (audioRef.current) {
              audioRef.current.play().catch(() => {});
            }
            
            // Show completion animation
            setShowCompletion(true);
            setTimeout(() => setShowCompletion(false), 2000);
            
            // Handle mode switching
            if (currentMode === 'work') {
              const newCompletedPomodoros = completedPomodoros + 1;
              setCompletedPomodoros(newCompletedPomodoros);
              
              // Switch to long break after longBreakInterval pomodoros, otherwise short break
              if (newCompletedPomodoros % settings.longBreakInterval === 0) {
                setCurrentMode('longBreak');
                setTimeLeft(settings.longBreakDuration * 60);
              } else {
                setCurrentMode('shortBreak');
                setTimeLeft(settings.shortBreakDuration * 60);
              }
            } else {
              // After any break, return to work
              setCurrentMode('work');
              setTimeLeft(settings.workDuration * 60);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, currentMode, completedPomodoros, settings]);

  const handlePlayPause = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowCompletion(true);
            
            // Play completion sound
            if (audioRef.current) {
              audioRef.current.play().catch(() => {});
            }
            
            // Handle mode switching
            if (currentMode === 'work') {
              const newCompletedCount = completedPomodoros + 1;
              setCompletedPomodoros(newCompletedCount);
              
              // Switch to long break after interval, otherwise short break
              if (newCompletedCount % settings.longBreakInterval === 0) {
                setTimeout(() => {
                  setCurrentMode('longBreak');
                  setTimeLeft(settings.longBreakDuration * 60);
                  setShowCompletion(false);
                }, 3000);
              } else {
                setTimeout(() => {
                  setCurrentMode('shortBreak');
                  setTimeLeft(settings.shortBreakDuration * 60);
                  setShowCompletion(false);
                }, 3000);
              }
            } else {
              // Break finished, switch back to work
              setTimeout(() => {
                setCurrentMode('work');
                setTimeLeft(settings.workDuration * 60);
                setShowCompletion(false);
              }, 3000);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, currentMode, completedPomodoros, settings]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const duration = currentMode === 'work' 
      ? settings.workDuration * 60 
      : currentMode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;
    setTimeLeft(duration);
  }, [currentMode, settings]);

  const handleModeSwitch = useCallback((mode: 'work' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setCurrentMode(mode);
    const newDuration = mode === 'work' 
      ? settings.workDuration * 60 
      : mode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;
    setTimeLeft(newDuration);
  }, [settings]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${timerModes[currentMode].gradient}`}>
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/30 backdrop-blur-sm"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
              y: [0, -100, -200],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatePresence>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-white">Pomodoro Timer</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>

            
            <div className="flex gap-2 mb-8">
              <Button
                variant={currentMode === 'work' ? 'default' : 'ghost'}
                onClick={() => handleModeSwitch('work')}
                className={currentMode === 'work' 
                  ? 'bg-white/30 text-white hover:bg-white/40 backdrop-blur-sm border border-white/30' 
                  : 'text-white/70 hover:bg-white/20 hover:text-white'}
              >
                Work
              </Button>
              <Button
                variant={currentMode === 'shortBreak' ? 'default' : 'ghost'}
                onClick={() => handleModeSwitch('shortBreak')}
                className={currentMode === 'shortBreak' 
                  ? 'bg-white/30 text-white hover:bg-white/40 backdrop-blur-sm border border-white/30' 
                  : 'text-white/70 hover:bg-white/20 hover:text-white'}
              >
                Short Break
              </Button>
              <Button
                variant={currentMode === 'longBreak' ? 'default' : 'ghost'}
                onClick={() => handleModeSwitch('longBreak')}
                className={currentMode === 'longBreak' 
                  ? 'bg-white/30 text-white hover:bg-white/40 backdrop-blur-sm border border-white/30' 
                  : 'text-white/70 hover:bg-white/20 hover:text-white'}
              >
                Long Break
              </Button>
            </div><div className="flex gap-2 mb-8">
              <Button
                variant={currentMode === 'work' ? 'default' : 'ghost'}
                onClick={() => handleModeSwitch('work')}
                className={`flex-1 ${
                  currentMode === 'work'
                    ? 'bg-white text-rose-600 hover:bg-white/90'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Work
              </Button>
              <Button
                variant={currentMode === 'shortBreak' ? 'default' : 'ghost'}
                onClick={() => handleModeSwitch('shortBreak')}
                className={`flex-1 ${
                  currentMode === 'shortBreak'
                    ? 'bg-white text-cyan-600 hover:bg-white/90'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Short Break
              </Button>
              <Button
                variant={currentMode === 'longBreak' ? 'default' : 'ghost'}
                onClick={() => handleModeSwitch('longBreak')}
                className={`flex-1 ${
                  currentMode === 'longBreak'
                    ? 'bg-white text-emerald-600 hover:bg-white/90'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Long Break
              </Button>
            </div>

            <div className="flex justify-center items-center my-12">
              <div className="relative w-80 h-80">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 320 320">
                  {/* Background circle */}
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="12"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 140}
                    initial={{ strokeDashoffset: 2 * Math.PI * 140 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 140 * (1 - progress / 100)
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                      <stop offset="50%" stopColor="rgba(255, 255, 255, 0.7)" />
                      <stop offset="100%" stopColor="rgba(255, 255, 255, 0.5)" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Timer display in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    key={timeLeft}
                    initial={{ scale: 1 }}
                    animate={{ scale: timeLeft <= 10 && isRunning ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: timeLeft <= 10 && isRunning ? Infinity : 0 }}
                    className="text-8xl font-bold text-white tracking-tight"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <div className="text-xl text-white/70 mt-2 capitalize">
                    {currentMode === 'shortBreak' ? 'Short Break' : currentMode === 'longBreak' ? 'Long Break' : 'Focus Time'}
                  </div>
                </div>
              </div></parameter>
</invoke>
            </div>

            <div className="text-center mb-8">
              <motion.div
                key={timeLeft}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
                className="text-7xl font-bold text-white mb-4"
              >
                {formatTime(timeLeft)}
              </motion.div>
              <p className="text-white/80 text-xl capitalize">
                {currentMode === 'work' ? 'Focus Time' : currentMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <Button
                onClick={handlePlayPause}
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 px-8"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                onClick={handleReset}
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>

            <div className="text-center text-white/60">
              <p className="text-sm">Completed Pomodoros: {completedPomodoros}</p>
            </div>
          </div>

                    <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-6 backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 mb-2">Work Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 25 })}
                      className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Short Break Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) => setSettings({ ...settings, shortBreakDuration: parseInt(e.target.value) || 5 })}
                      className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Long Break Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
                      className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 mb-2">Long Break Interval (pomodoros)</label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={settings.longBreakInterval}
                      onChange={(e) => setSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 4 })}
                      className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => {
                      setShowSettings(false);
                      // Update time if current mode duration changed
                      if (!isRunning) {
                        const newDuration = currentMode === 'work' 
                          ? settings.workDuration * 60 
                          : currentMode === 'shortBreak'
                          ? settings.shortBreakDuration * 60
                          : settings.longBreakDuration * 60;
                        setTimeLeft(newDuration);
                      }
                    }}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setSettings(defaultSettings);
                      setShowSettings(false);
                    }}
                    variant="ghost"
                    className="flex-1 text-white hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCompletion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="backdrop-blur-xl bg-white/20 rounded-3xl p-12 shadow-2xl border border-white/30"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-5xl font-bold text-white text-center mb-4">
                      {currentMode === 'work' ? '🎉 Great Work!' : '✨ Break Complete!'}
                    </h2>
                    <p className="text-white/80 text-xl text-center">
                      {currentMode === 'work' 
                        ? 'Time for a well-deserved break!' 
                        : 'Ready to focus again?'}
                    </p>
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${timerModes[currentMode].colors} blur-xl`} />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <audio ref={audioRef} src="data:audio/wav;base64,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

          <AnimatePresence>
            {showCompletion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
              >
                {/* Confetti particles */}
                {Array.from({ length: 100 }, (_, i) => {
                  const angle = (Math.PI * 2 * i) / 100;
                  const velocity = Math.random() * 300 + 200;
                  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
                  const color = colors[Math.floor(Math.random() * colors.length)];
                  
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: Math.random() * 10 + 5,
                        height: Math.random() * 10 + 5,
                        backgroundColor: color,
                        left: '50%',
                        top: '50%',
                      }}
                      initial={{ 
                        x: 0, 
                        y: 0, 
                        opacity: 1,
                        scale: 0,
                        rotate: 0
                      }}
                      animate={{
                        x: Math.cos(angle) * velocity,
                        y: Math.sin(angle) * velocity - 200,
                        opacity: [1, 1, 0],
                        scale: [0, 1, 0.5],
                        rotate: Math.random() * 720 - 360
                      }}
                      transition={{
                        duration: 2,
                        ease: [0.17, 0.67, 0.83, 0.67],
                      }}
                    />
                  );
                })}
                
                {/* Center celebration message */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15 
                  }}
                  className="backdrop-blur-xl bg-white/20 rounded-3xl p-12 shadow-2xl border-4 border-white/40 pointer-events-auto"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                    className="text-8xl mb-4 text-center"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-4xl font-bold text-white text-center mb-2">
                    {currentMode === 'work' ? 'Great Work!' : 'Break Complete!'}
                  </h2>
                  <p className="text-white/80 text-xl text-center">
                    {currentMode === 'work' 
                      ? 'Time for a well-deserved break!' 
                      : 'Ready to focus again?'}
                  </p>
                  <Button
                    onClick={() => setShowCompletion(false)}
                    className="mt-6 w-full bg-white/30 hover:bg-white/40 text-white backdrop-blur-sm border border-white/40"
                    size="lg"
                  >
                    Continue
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}