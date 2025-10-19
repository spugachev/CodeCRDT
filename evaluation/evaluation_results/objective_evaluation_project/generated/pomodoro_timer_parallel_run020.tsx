import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
    setParticles(generatedParticles);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
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

  const handleSaveSettings = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    // Reset timer with new settings
    const duration = currentMode === 'work' 
      ? newSettings.workDuration * 60 
      : currentMode === 'shortBreak'
      ? newSettings.shortBreakDuration * 60
      : newSettings.longBreakDuration * 60;
    setTimeLeft(duration);
    setIsRunning(false);
  }, [currentMode]);

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
                    strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
                    initial={{ strokeDashoffset: 2 * Math.PI * 140 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 140 * (1 - progress / 100) }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={currentMode === 'work' ? '#f43f5e' : currentMode === 'shortBreak' ? '#06b6d4' : '#10b981'} />
                      <stop offset="50%" stopColor={currentMode === 'work' ? '#ec4899' : currentMode === 'shortBreak' ? '#3b82f6' : '#14b8a6'} />
                      <stop offset="100%" stopColor={currentMode === 'work' ? '#a855f7' : currentMode === 'shortBreak' ? '#6366f1' : '#06b6d4'} />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Timer display in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    key={timeLeft}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3 }}
                    className="text-7xl font-bold text-white mb-2"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <div className="text-white/60 text-lg uppercase tracking-wider">
                    {currentMode === 'work' ? 'Focus Time' : currentMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                  </div>
                  <div className="text-white/40 text-sm mt-2">
                    Session {completedPomodoros + 1}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <Button
                size="lg"
                onClick={handlePlayPause}
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm px-8"
              >
                {isRunning ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleReset}
                className="border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>

            <div className="text-center">
              <p className="text-white/80 text-sm mb-3">Completed Pomodoros</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {Array.from({ length: Math.max(8, completedPomodoros) }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: index < completedPomodoros ? 1 : 0.5,
                      opacity: index < completedPomodoros ? 1 : 0.3
                    }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${index < completedPomodoros 
                        ? 'bg-white text-rose-500 shadow-lg shadow-white/50' 
                        : 'bg-white/10 text-white/40 border border-white/20'
                      }
                      ${(index + 1) % settings.longBreakInterval === 0 && index < completedPomodoros
                        ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent'
                        : ''
                      }`}
                  >
                    {index < completedPomodoros ? '✓' : index + 1}
                  </motion.div>
                ))}
              </div>
              {completedPomodoros > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/60 text-xs mt-3"
                >
                  {completedPomodoros} session{completedPomodoros !== 1 ? 's' : ''} completed today! 🎉
                </motion.p>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="mt-6 backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="work-duration" className="text-white text-lg">
                      Work Duration (minutes)
                    </Label>
                    <Input
                      id="work-duration"
                      type="number"
                      min="1"
                      max="60"
                      defaultValue={settings.workDuration}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm"
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || settings.workDuration;
                        setSettings(prev => ({ ...prev, workDuration: value }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="short-break-duration" className="text-white text-lg">
                      Short Break Duration (minutes)
                    </Label>
                    <Input
                      id="short-break-duration"
                      type="number"
                      min="1"
                      max="30"
                      defaultValue={settings.shortBreakDuration}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm"
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || settings.shortBreakDuration;
                        setSettings(prev => ({ ...prev, shortBreakDuration: value }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="long-break-duration" className="text-white text-lg">
                      Long Break Duration (minutes)
                    </Label>
                    <Input
                      id="long-break-duration"
                      type="number"
                      min="1"
                      max="60"
                      defaultValue={settings.longBreakDuration}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm"
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || settings.longBreakDuration;
                        setSettings(prev => ({ ...prev, longBreakDuration: value }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="long-break-interval" className="text-white text-lg">
                      Long Break Interval (pomodoros)
                    </Label>
                    <Input
                      id="long-break-interval"
                      type="number"
                      min="2"
                      max="10"
                      defaultValue={settings.longBreakInterval}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm"
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || settings.longBreakInterval;
                        setSettings(prev => ({ ...prev, longBreakInterval: value }));
                      }}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={() => handleSaveSettings(settings)}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSettings(defaultSettings);
                        setShowSettings(false);
                      }}
                      className="flex-1 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

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
              transition={{ type: "spring", duration: 0.8 }}
              className="bg-white rounded-3xl p-12 shadow-2xl text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {currentMode === 'work' ? 'Great Work!' : 'Break Complete!'}
                </h2>
                <p className="text-gray-600 text-lg">
                  {currentMode === 'work' 
                    ? 'Time for a well-deserved break!' 
                    : 'Ready to get back to work?'}
                </p>
              </motion.div>

              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  initial={{ 
                    x: particle.x, 
                    y: particle.y, 
                    opacity: 1,
                    scale: 0 
                  }}
                  animate={{ 
                    y: particle.y - 200,
                    x: particle.x + (Math.random() - 0.5) * 100,
                    opacity: 0,
                    scale: 1,
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: particle.duration,
                    delay: particle.delay,
                    ease: "easeOut"
                  }}
                  className="absolute rounded-full"
                  style={{
                    width: particle.size,
                    height: particle.size,
                    background: `hsl(${Math.random() * 360}, 70%, 60%)`
                  }}
                />
              ))}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-6"
              >
                <Button
                  size="lg"
                  onClick={() => setShowCompletion(false)}
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white hover:opacity-90"
                >
                  Continue
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}