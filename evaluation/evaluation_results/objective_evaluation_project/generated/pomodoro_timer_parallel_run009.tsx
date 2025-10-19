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

function SettingsForm({ 
  settings, 
  onSave, 
  onCancel 
}: { 
  settings: TimerSettings; 
  onSave: (settings: TimerSettings) => void; 
  onCancel: () => void;
}) {
  const [workDuration, setWorkDuration] = useState(settings.workDuration);
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration);
  const [longBreakInterval, setLongBreakInterval] = useState(settings.longBreakInterval);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      longBreakInterval
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="work-duration" className="text-white text-sm font-medium">
            Work Duration (minutes)
          </Label>
          <Input
            id="work-duration"
            type="number"
            min="1"
            max="60"
            value={workDuration}
            onChange={(e) => setWorkDuration(Number(e.target.value))}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <Label htmlFor="short-break-duration" className="text-white text-sm font-medium">
            Short Break Duration (minutes)
          </Label>
          <Input
            id="short-break-duration"
            type="number"
            min="1"
            max="30"
            value={shortBreakDuration}
            onChange={(e) => setShortBreakDuration(Number(e.target.value))}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label htmlFor="long-break-duration" className="text-white text-sm font-medium">
            Long Break Duration (minutes)
          </Label>
          <Input
            id="long-break-duration"
            type="number"
            min="1"
            max="60"
            value={longBreakDuration}
            onChange={(e) => setLongBreakDuration(Number(e.target.value))}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="long-break-interval" className="text-white text-sm font-medium">
            Long Break Interval (pomodoros)
          </Label>
          <Input
            id="long-break-interval"
            type="number"
            min="2"
            max="10"
            value={longBreakInterval}
            onChange={(e) => setLongBreakInterval(Number(e.target.value))}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 pt-4"
      >
        <Button
          type="submit"
          className="flex-1 bg-white text-gray-900 hover:bg-white/90 font-medium"
        >
          Save Settings
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          className="flex-1 text-white hover:bg-white/20 font-medium"
        >
          Cancel
        </Button>
      </motion.div>
    </form>
  );
}

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
    setCurrentMode(mode);
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
  const handleSaveSettings = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    
    // Update current timer if not running
    if (!isRunning) {
      const newDuration = currentMode === 'work' 
        ? newSettings.workDuration * 60 
        : currentMode === 'shortBreak'
        ? newSettings.shortBreakDuration * 60
        : newSettings.longBreakDuration * 60;
      setTimeLeft(newDuration);
    }
  }, [isRunning, currentMode]);

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
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="12"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="12"
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
                      <stop offset="0%" stopColor={
                        currentMode === 'work' ? '#f43f5e' :
                        currentMode === 'shortBreak' ? '#06b6d4' :
                        '#10b981'
                      } />
                      <stop offset="50%" stopColor={
                        currentMode === 'work' ? '#ec4899' :
                        currentMode === 'shortBreak' ? '#3b82f6' :
                        '#14b8a6'
                      } />
                      <stop offset="100%" stopColor={
                        currentMode === 'work' ? '#a855f7' :
                        currentMode === 'shortBreak' ? '#6366f1' :
                        '#06b6d4'
                      } />
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
                    className="text-8xl font-bold text-white mb-4"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <div className="text-xl text-white/80 capitalize">
                    {currentMode === 'work' ? 'Focus Time' : 
                     currentMode === 'shortBreak' ? 'Short Break' : 
                     'Long Break'}
                  </div>
                  <div className="text-sm text-white/60 mt-2">
                    Pomodoros: {completedPomodoros}
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
              <p>Completed Pomodoros: {completedPomodoros}</p>
            </div>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mt-6 backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
                
                <SettingsForm
                  settings={settings}
                  onSave={handleSaveSettings}
                  onCancel={() => setShowSettings(false)}
                />
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
                {/* Confetti particles */}
                {Array.from({ length: 100 }, (_, i) => {
                  const angle = (Math.PI * 2 * i) / 100;
                  const velocity = Math.random() * 300 + 200;
                  const x = Math.cos(angle) * velocity;
                  const y = Math.sin(angle) * velocity - 100;
                  const rotation = Math.random() * 720 - 360;
                  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
                  const color = colors[Math.floor(Math.random() * colors.length)];
                  
                  return (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: '50%',
                        top: '50%',
                        width: Math.random() * 12 + 6,
                        height: Math.random() * 12 + 6,
                        backgroundColor: color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                      }}
                      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                      animate={{
                        x: x,
                        y: y,
                        opacity: 0,
                        rotate: rotation,
                      }}
                      transition={{
                        duration: Math.random() * 1 + 1.5,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    />
                  );
                })}
                
                {/* Center celebration text */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="text-6xl font-bold text-white drop-shadow-2xl"
                >
                  🎉
                </motion.div>
                
                {/* Expanding rings */}
                {[0, 0.3, 0.6].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="absolute border-4 border-white rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      translateX: '-50%',
                      translateY: '-50%',
                    }}
                    initial={{ width: 0, height: 0, opacity: 0.8 }}
                    animate={{ 
                      width: 400, 
                      height: 400, 
                      opacity: 0 
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay,
                      ease: "easeOut" 
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Hidden audio element for completion sound */}
          <audio
            ref={audioRef}
            src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w=="
          />
        </motion.div>
      </div>
    </div>
  );
}