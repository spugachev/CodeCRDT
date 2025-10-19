import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const handleSaveSettings = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings);
    setShowSettings(false);
    setIsRunning(false);
    const newDuration = currentMode === 'work' 
      ? newSettings.workDuration * 60 
      : currentMode === 'shortBreak'
      ? newSettings.shortBreakDuration * 60
      : newSettings.longBreakDuration * 60;
    setTimeLeft(newDuration);
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
              <div className="relative">
                <svg className="transform -rotate-90" width="320" height="320">
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
                    strokeDasharray={2 * Math.PI * 140}
                    initial={{ strokeDashoffset: 2 * Math.PI * 140 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 140 * (1 - progress / 100)
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      {currentMode === 'work' && (
                        <>
                          <stop offset="0%" stopColor="#f43f5e" />
                          <stop offset="50%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </>
                      )}
                      {currentMode === 'shortBreak' && (
                        <>
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </>
                      )}
                      {currentMode === 'longBreak' && (
                        <>
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="50%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </>
                      )}
                    </linearGradient>
                  </defs>
                </svg>
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
                  <div className="text-white/60 text-lg capitalize">
                    {currentMode === 'work' ? 'Focus Time' : currentMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
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
                <AnimatePresence>
                  {Array.from({ length: completedPomodoros }, (_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: i * 0.1
                      }}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg"
                    >
                      <span className="text-white font-bold text-sm">{i + 1}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {completedPomodoros === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/50 text-sm italic"
                  >
                    No pomodoros completed yet
                  </motion.div>
                )}
              </div>
              {completedPomodoros > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/60 text-xs mt-3"
                >
                  {completedPomodoros === 1 ? '1 session' : `${completedPomodoros} sessions`} completed today 🎉
                </motion.p>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowSettings(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20"
                >
                  <h2 className="text-3xl font-bold text-white mb-6">Settings</h2>
                  
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
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50 text-lg"
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || settings.workDuration;
                          setSettings(prev => ({ ...prev, workDuration: value }));
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="short-break-duration" className="text-white text-lg">
                        Short Break (minutes)
                      </Label>
                      <Input
                        id="short-break-duration"
                        type="number"
                        min="1"
                        max="30"
                        defaultValue={settings.shortBreakDuration}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50 text-lg"
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || settings.shortBreakDuration;
                          setSettings(prev => ({ ...prev, shortBreakDuration: value }));
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="long-break-duration" className="text-white text-lg">
                        Long Break (minutes)
                      </Label>
                      <Input
                        id="long-break-duration"
                        type="number"
                        min="1"
                        max="60"
                        defaultValue={settings.longBreakDuration}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50 text-lg"
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
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50 text-lg"
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || settings.longBreakInterval;
                          setSettings(prev => ({ ...prev, longBreakInterval: value }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button
                      onClick={() => handleSaveSettings(settings)}
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm text-lg py-6"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSettings(settings);
                        setShowSettings(false);
                      }}
                      className="flex-1 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm text-lg py-6"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TODO:SettingsPanel Render settings modal with duration inputs and save/cancel buttons */}
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
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`backdrop-blur-xl bg-gradient-to-br ${timerModes[currentMode].colors} rounded-3xl p-12 shadow-2xl border border-white/30 text-center`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="text-8xl mb-4">🎉</div>
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl font-bold text-white mb-4"
                >
                  {currentMode === 'work' ? 'Great Work!' : 'Break Complete!'}
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl text-white/90 mb-8"
                >
                  {currentMode === 'work' 
                    ? 'Time for a well-deserved break!' 
                    : 'Ready to get back to work?'}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    size="lg"
                    onClick={() => setShowCompletion(false)}
                    className="bg-white text-gray-900 hover:bg-white/90 px-8 py-6 text-lg font-semibold"
                  >
                    Continue
                  </Button>
                </motion.div>
              </div>

              {/* Confetti particles */}
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: Math.random() * 10 + 5,
                    height: Math.random() * 10 + 5,
                    background: [
                      '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
                      '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'
                    ][Math.floor(Math.random() * 8)],
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 1,
                    scale: 0 
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 800,
                    y: (Math.random() - 0.5) * 800,
                    opacity: 0,
                    scale: [0, 1, 0.5, 0],
                    rotate: Math.random() * 720 - 360,
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1.5,
                    ease: "easeOut",
                    delay: Math.random() * 0.3,
                  }}
                />
              ))}

              {/* Star burst effect */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [1, 1, 0],
                    x: Math.cos((i / 12) * Math.PI * 2) * 200,
                    y: Math.sin((i / 12) * Math.PI * 2) * 200,
                  }}
                  transition={{
                    duration: 1.5,
                    ease: "easeOut",
                    delay: 0.2,
                  }}
                >
                  <div className="text-4xl">✨</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
