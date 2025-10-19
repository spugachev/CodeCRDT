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
              const newCompletedPomodoros = completedPomodoros + 1;
              setCompletedPomodoros(newCompletedPomodoros);
              
              // Determine next break type
              if (newCompletedPomodoros % settings.longBreakInterval === 0) {
                setCurrentMode('longBreak');
                return settings.longBreakDuration * 60;
              } else {
                setCurrentMode('shortBreak');
                return settings.shortBreakDuration * 60;
              }
            } else {
              // Break finished, return to work
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

    // Hide completion animation after 3 seconds
    if (showCompletion) {
      const timeout = setTimeout(() => {
        setShowCompletion(false);
      }, 3000);
      return () => clearTimeout(timeout);
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
                    className="text-8xl font-bold text-white tracking-tight"
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <div className="text-white/60 text-lg mt-2 capitalize">
                    {currentMode === 'shortBreak' ? 'Short Break' : currentMode === 'longBreak' ? 'Long Break' : 'Focus Time'}
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

            <div className="flex flex-col items-center">
              <p className="text-white/70 text-sm mb-3">Completed Pomodoros</p>
              <div className="flex gap-2 flex-wrap justify-center">
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
                      damping: 25
                    }}
                    className={`w-3 h-3 rounded-full ${
                      index < completedPomodoros 
                        ? 'bg-white shadow-lg shadow-white/50' 
                        : 'bg-white/20 border border-white/30'
                    }`}
                  />
                ))}
              </div>
              <motion.p 
                key={completedPomodoros}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-white font-bold text-2xl mt-4"
              >
                {completedPomodoros}
              </motion.p>
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
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="work-duration" className="text-white text-sm font-medium mb-2 block">
                      Work Duration (minutes)
                    </Label>
                    <Input
                      id="work-duration"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 1 })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="short-break" className="text-white text-sm font-medium mb-2 block">
                      Short Break (minutes)
                    </Label>
                    <Input
                      id="short-break"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) => setSettings({ ...settings, shortBreakDuration: parseInt(e.target.value) || 1 })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="long-break" className="text-white text-sm font-medium mb-2 block">
                      Long Break (minutes)
                    </Label>
                    <Input
                      id="long-break"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 1 })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="long-break-interval" className="text-white text-sm font-medium mb-2 block">
                      Long Break Interval (pomodoros)
                    </Label>
                    <Input
                      id="long-break-interval"
                      type="number"
                      min="2"
                      max="10"
                      value={settings.longBreakInterval}
                      onChange={(e) => setSettings({ ...settings, longBreakInterval: parseInt(e.target.value) || 2 })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={() => {
                        setShowSettings(false);
                        handleReset();
                      }}
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
              className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-12 shadow-2xl text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Confetti particles */}
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 1,
                    scale: 1
                  }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 600,
                    y: (Math.random() - 0.5) * 600,
                    opacity: 0,
                    scale: 0,
                    rotate: Math.random() * 720
                  }}
                  transition={{ 
                    duration: 1.5 + Math.random() * 0.5,
                    ease: "easeOut",
                    delay: Math.random() * 0.2
                  }}
                  className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: ['#ff0080', '#00ff80', '#0080ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)]
                  }}
                />
              ))}
              
              {/* Celebration content */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative z-10"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                  className="text-8xl mb-4"
                >
                  🎉
                </motion.div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  {currentMode === 'work' ? 'Great Work!' : 'Break Complete!'}
                </h2>
                <p className="text-xl text-white/90 mb-6">
                  {currentMode === 'work' 
                    ? `You've completed ${completedPomodoros} pomodoro${completedPomodoros !== 1 ? 's' : ''}!`
                    : 'Time to get back to work!'}
                </p>
                <Button
                  size="lg"
                  onClick={() => setShowCompletion(false)}
                  className="bg-white text-orange-500 hover:bg-white/90 font-bold px-8 py-6 text-lg"
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