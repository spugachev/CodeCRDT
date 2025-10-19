import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  useEffect(() => {const generatedParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    tParticles(generatedParticles);tParticles(generatedParticles);
  }, []);


  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval((if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Show completion animation
      setShowCompletion(true);
      setTimeout(() => setShowCompletion(false), 3000);
      
      // Play completion sound
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      
      // Handle mode transitions
      if (currentMode === 'work') {
        const newCompletedCount = completedPomodoros + 1;
        setCompletedPomodoros(newCompletedCount);
        
        if (newCompletedCount % settings.longBreakInterval === 0) {
          setCurrentMode('longBreak');
          setTimeLeft(settings.longBreakDuration * 60);
        } else {
          setCurrentMode('shortBreak');
          setTimeLeft(settings.shortBreakDuration * 60);
        }
      } else {
        setCurrentMode('work');
        setTimeLeft(settings.workDuration * 60);
      }
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
    };) => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
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

    // Handle timer completion
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowCompletion(true);
      
      // Play completion sound
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Silently handle audio play errors
        });
      }

      // Auto-switch modes
      if (currentMode === 'work') {
        const newCompletedPomodoros = completedPomodoros + 1;
        setCompletedPomodoros(newCompletedPomodoros);
        
        // Determine next break type
        if (newCompletedPomodoros % settings.longBreakInterval === 0) {
          setCurrentMode('longBreak');
          setTimeLeft(settings.longBreakDuration * 60);
        } else {
          setCurrentMode('shortBreak');
          setTimeLeft(settings.shortBreakDuration * 60);
        }
      } else {
        // Break completed, switch back to work
        setCurrentMode('work');
        setTimeLeft(settings.workDuration * 60);
      }

      // Hide completion animation after 3 seconds
      setTimeout(() => {
        setShowCompletion(false);
      }, 3000);
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

  const handleModeSwitch = useCallback((mode: 'work' | 'shortBreak' | 'longBreak') => {setCurrentMode(mode);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const duration = mode === 'work' 
      ? settings.workDuration * 60 
      : mode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;
    setTimeLeft(duration);setCurrentMode(mode);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
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
            </div>

            <div className="flex justify-center items-center my-12">
              <svg className="transform -rotate-90" width="300" height="300">
                <circle
                  cx="150"
                  cy="150"
                  r="140"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <motion.circle
                  cx="150"
                  cy="150"
                  r="140"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 2 * Math.PI * 140 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 140 * (1 - progress / 100),
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                    strokeDasharray: 2 * Math.PI * 140,
                  }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.6)" />
                  </linearGradient>
                </defs>
              </svg>
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
                      <stop offset="100%" stopColor="rgba(255, 255, 255, 0.6)" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Timer display in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    key={timeLeft}
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-7xl font-bold text-white tracking-wider"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <p className="text-white/70 text-lg mt-2 capitalize">
                    {currentMode === 'shortBreak' ? 'Short Break' : currentMode === 'longBreak' ? 'Long Break' : 'Focus Time'}
                  </p>
                </div>
              </div>
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
              <p>Completed Pomodoros: {completedPomodoros}</p>
            </div>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="mt-6 backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="work-duration" className="text-white/90 text-sm mb-2 block">
                      Work Duration (minutes)
                    </Label>
                    <Input
                      id="work-duration"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 1 })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="short-break" className="text-white/90 text-sm mb-2 block">
                      Short Break Duration (minutes)
                    </Label>
                    <Input
                      id="short-break"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) => setSettings({ ...settings, shortBreakDuration: parseInt(e.target.value) || 1 })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="long-break" className="text-white/90 text-sm mb-2 block">
                      Long Break Duration (minutes)
                    </Label>
                    <Input
                      id="long-break"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 1 })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="long-break-interval" className="text-white/90 text-sm mb-2 block">
                      Long Break Interval (pomodoros)
                    </Label>
                    <Input
                      id="long-break-interval"
                      type="number"
                      min="2"
                      max="10"
                      value={settings.longBreakInterval}
                      onChange={(e) => setSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 2 })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={() => {
                      setShowSettings(false);
                      handleReset();
                    }}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
                  >
                    Save & Apply
                  </Button>
                  <Button
                    onClick={() => {
                      setSettings(defaultSettings);
                      setShowSettings(false);
                      handleReset();
                    }}
                    variant="ghost"
                    className="flex-1 text-white hover:bg-white/20"
                  >
                    Reset to Default
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
                transition={{ duration: 0.5, type: "spring" }}
                className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: 2,
                  }}
                  className="text-8xl"
                >
                  🎉
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCompletion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={() => setShowCompletion(false)}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="bg-white rounded-3xl p-12 shadow-2xl max-w-md mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                      Great Work!
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {currentMode === 'work' 
                        ? 'Time for a well-deserved break!' 
                        : 'Break complete! Ready to focus?'}
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8"
                  >
                    <Button
                      onClick={() => setShowCompletion(false)}
                      className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:opacity-90 text-white"
                      size="lg"
                    >
                      Continue
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Confetti particles */}
                {Array.from({ length: 100 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      backgroundColor: [
                        '#ef4444', '#ec4899', '#a855f7', '#06b6d4', 
                        '#10b981', '#f59e0b', '#3b82f6'
                      ][i % 7],
                    }}
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      opacity: 1,
                      scale: 0 
                    }}
                    animate={{
                      x: (Math.random() - 0.5) * 1000,
                      y: Math.random() * 800 - 200,
                      opacity: 0,
                      scale: [0, 1, 0.5, 0],
                      rotate: Math.random() * 720,
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      ease: "easeOut",
                      delay: Math.random() * 0.3,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}