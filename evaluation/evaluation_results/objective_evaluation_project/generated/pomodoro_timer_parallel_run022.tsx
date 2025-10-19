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
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (currentMode === 'work') {
        const newCompletedCount = completedPomodoros + 1;
        setCompletedPomodoros(newCompletedCount);
        setShowCompletion(true);
        setTimeout(() => setShowCompletion(false), 3000);
        
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
      
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, currentMode, completedPomodoros, settings]);

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
            
            // Auto-switch to next mode
            if (currentMode === 'work') {
              setCompletedPomodoros((prev) => prev + 1);
              const nextPomodoros = completedPomodoros + 1;
              
              if (nextPomodoros % settings.longBreakInterval === 0) {
                setCurrentMode('longBreak');
                return settings.longBreakDuration * 60;
              } else {
                setCurrentMode('shortBreak');
                return settings.shortBreakDuration * 60;
              }
            } else {
              setCurrentMode('work');
              return settings.workDuration * 60;
            }
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
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-white/20"
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
                    initial={{ strokeDashoffset: 880 }}
                    animate={{ 
                      strokeDashoffset: 880 - (880 * progress) / 100,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                      strokeDasharray: 880,
                    }}
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="currentColor" className={`text-${currentMode === 'work' ? 'rose' : currentMode === 'shortBreak' ? 'cyan' : 'emerald'}-400`} />
                      <stop offset="100%" stopColor="currentColor" className={`text-${currentMode === 'work' ? 'purple' : currentMode === 'shortBreak' ? 'indigo' : 'cyan'}-400`} />
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
                    className="text-7xl font-bold text-white tabular-nums"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <div className="text-white/60 text-lg mt-2 capitalize">
                    {currentMode === 'work' ? 'Focus Time' : currentMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 mb-8">
              <Button
                onClick={() => handleModeSwitch('work')}
                variant="ghost"
                className={`text-white hover:bg-white/20 ${currentMode === 'work' ? 'bg-white/30' : ''}`}
              >
                Work
              </Button>
              <Button
                onClick={() => handleModeSwitch('shortBreak')}
                variant="ghost"
                className={`text-white hover:bg-white/20 ${currentMode === 'shortBreak' ? 'bg-white/30' : ''}`}
              >
                Short Break
              </Button>
              <Button
                onClick={() => handleModeSwitch('longBreak')}
                variant="ghost"
                className={`text-white hover:bg-white/20 ${currentMode === 'longBreak' ? 'bg-white/30' : ''}`}
              >
                Long Break
              </Button>
            </div>

            <div className="flex justify-center items-center my-12">
              <div className="relative w-80 h-80">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 320 320">
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <motion.circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 880 }}
                    animate={{ 
                      strokeDashoffset: 880 - (880 * progress) / 100,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{
                      strokeDasharray: 880,
                    }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                      <stop offset="50%" stopColor="rgba(255, 255, 255, 0.7)" />
                      <stop offset="100%" stopColor="rgba(255, 255, 255, 0.5)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      key={timeLeft}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.3 }}
                      className="text-6xl font-bold text-white"
                    >
                      {formatTime(timeLeft)}
                    </motion.div>
                  </div>
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
              <p className="text-sm">Completed Pomodoros: {completedPomodoros}</p>
            </div>
          </div>

                    <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-6 backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="work-duration" className="text-white mb-2 block">
                      Work Duration (minutes)
                    </Label>
                    <Input
                      id="work-duration"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 25 })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="short-break" className="text-white mb-2 block">
                      Short Break Duration (minutes)
                    </Label>
                    <Input
                      id="short-break"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) => setSettings({ ...settings, shortBreakDuration: parseInt(e.target.value) || 5 })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="long-break" className="text-white mb-2 block">
                      Long Break Duration (minutes)
                    </Label>
                    <Input
                      id="long-break"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="long-break-interval" className="text-white mb-2 block">
                      Long Break Interval (pomodoros)
                    </Label>
                    <Input
                      id="long-break-interval"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.longBreakInterval}
                      onChange={(e) => setSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 4 })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
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
                      }}
                      variant="ghost"
                      className="flex-1 text-white hover:bg-white/20"
                    >
                      Reset to Default
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCompletion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mt-6 backdrop-blur-xl bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl p-8 shadow-2xl border border-yellow-400/30"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-white mb-2">Pomodoro Complete!</h2>
                  <p className="text-white/80 text-lg">Great work! Time for a break.</p>
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
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
              >
                {Array.from({ length: 100 }, (_, i) => {
                  const angle = (Math.PI * 2 * i) / 100;
                  const velocity = Math.random() * 300 + 200;
                  const x = Math.cos(angle) * velocity;
                  const y = Math.sin(angle) * velocity - Math.random() * 100;
                  const rotation = Math.random() * 720 - 360;
                  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
                  const color = colors[Math.floor(Math.random() * colors.length)];
                  const shapes = ['circle', 'square', 'triangle'];
                  const shape = shapes[Math.floor(Math.random() * shapes.length)];
                  
                  return (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: '50%',
                        top: '50%',
                      }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                      animate={{
                        x: x,
                        y: y,
                        opacity: 0,
                        scale: [1, 1.2, 0.8, 0],
                        rotate: rotation,
                      }}
                      transition={{
                        duration: Math.random() * 1.5 + 1.5,
                        ease: "easeOut",
                      }}
                    >
                      {shape === 'circle' && (
                        <div
                          className="rounded-full"
                          style={{
                            width: Math.random() * 12 + 8,
                            height: Math.random() * 12 + 8,
                            backgroundColor: color,
                          }}
                        />
                      )}
                      {shape === 'square' && (
                        <div
                          className="rounded-sm"
                          style={{
                            width: Math.random() * 12 + 8,
                            height: Math.random() * 12 + 8,
                            backgroundColor: color,
                          }}
                        />
                      )}
                      {shape === 'triangle' && (
                        <div
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: `${Math.random() * 6 + 4}px solid transparent`,
                            borderRight: `${Math.random() * 6 + 4}px solid transparent`,
                            borderBottom: `${Math.random() * 12 + 8}px solid ${color}`,
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
                
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                  className="backdrop-blur-xl bg-white/20 rounded-3xl p-12 shadow-2xl border border-white/30 pointer-events-auto"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 10, 0] }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="text-8xl mb-4"
                    >
                      🎉
                    </motion.div>
                    <h2 className="text-4xl font-bold text-white mb-4">
                      {currentMode === 'work' ? 'Great Work!' : 'Break Complete!'}
                    </h2>
                    <p className="text-white/80 text-xl mb-6">
                      {currentMode === 'work' 
                        ? 'Time for a well-deserved break!' 
                        : 'Ready to focus again?'}
                    </p>
                    <Button
                      onClick={() => setShowCompletion(false)}
                      size="lg"
                      className="bg-white/30 hover:bg-white/40 text-white backdrop-blur-sm border border-white/40 px-8"
                    >
                      Continue
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}