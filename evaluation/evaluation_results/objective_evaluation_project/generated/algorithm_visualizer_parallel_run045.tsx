import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

import { Play, Pause, RotateCcw, Zap, BarChart3 } from 'lucide-react';

import { motion } from 'framer-motion';



interface ArrayElement {
  value: number;
  id: string;
  isComparing?: boolean;
  isSwapping?: boolean;
  isSorted?: boolean;
}

interface AlgorithmStep {
  array: ArrayElement[];
  comparingIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
}

type AlgorithmType = 'bubble' | 'quick' | 'merge' | 'insertion';

const NEON_COLORS = [
  '#00ffff',
  '#ff00ff', 
  '#00ff00',
  '#ffff00',
  '#ff0066',
  '#00ffaa'
];

const mockAlgorithms = [
  { id: 'bubble', name: 'Bubble Sort', complexity: 'O(n²)' },
  { id: 'quick', name: 'Quick Sort', complexity: 'O(n log n)' },
  { id: 'merge', name: 'Merge Sort', complexity: 'O(n log n)' },
  { id: 'insertion', name: 'Insertion Sort', complexity: 'O(n²)' }
];

export default function AlgorithmVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [arraySize, setArraySize] = useState([20]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bubble');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);

  const generateRandomArray = useCallback(() => {
    const newArray: ArrayElement[] = Array.from({ length: arraySize[0] }, (_, index) => ({
      value: Math.floor(Math.random() * 100) + 5,
      id: `element-${index}-${Date.now()}`,
      isComparing: false,
      isSwapping: false,
      isSorted: false
    }));
    setArray(newArray);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [arraySize]);

  const resetVisualization = useCallback(() => {

    /* TODO:ResetState Stop animation, reset step counter, generate new array */
  }, [generateRandomArray]);

  const startVisualization = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) return;
    
    setIsPlaying(true);
    
    const animate = () => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1;
        if (nextStep >= steps.length) {
          setIsPlaying(false);
          return prev;
        }
        return nextStep;
      });
    };
    
    const delay = 1000 - (speed[0] * 10);
    const timer = setTimeout(animate, delay);
    
    return () => clearTimeout(timer);
    
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {

    setIsPlaying(false);
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    
  }, [array]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* TODO:Header Animated header with glowing title, algorithm selector, and complexity badge */}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-2xl" />
          
          <div className="relative space-y-6">
            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={isPlaying ? pauseVisualization : startVisualization}
                disabled={steps.length === 0}
                className="relative group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-6 rounded-xl shadow-lg shadow-cyan-500/50 transition-all duration-300 hover:shadow-cyan-500/80 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                {isPlaying ? (
                  <Pause className="w-6 h-6 mr-2 inline" />
                ) : (
                  <Play className="w-6 h-6 mr-2 inline" />
                )}
                <span className="font-bold text-lg">
                  {isPlaying ? 'PAUSE' : 'START'}
                </span>
              </Button>

              <Button
                onClick={resetVisualization}
                className="relative group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 rounded-xl shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-purple-500/80 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                <RotateCcw className="w-6 h-6 mr-2 inline" />
                <span className="font-bold text-lg">RESET</span>
              </Button>

              <Button
                onClick={generateRandomArray}
                className="relative group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-6 rounded-xl shadow-lg shadow-green-500/50 transition-all duration-300 hover:shadow-green-500/80 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                <Zap className="w-6 h-6 mr-2 inline" />
                <span className="font-bold text-lg">GENERATE</span>
              </Button>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Speed Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-cyan-400 font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    SPEED
                  </label>
                  <span className="text-cyan-300 font-mono bg-cyan-500/20 px-3 py-1 rounded-lg border border-cyan-500/30">
                    {speed[0]}ms
                  </span>
                </div>
                <div className="relative">
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={200}
                    step={10}
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                    <span>Fast</span>
                    <span>Slow</span>
                  </div>
                </div>
              </div>

              {/* Array Size Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-purple-400 font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    ARRAY SIZE
                  </label>
                  <span className="text-purple-300 font-mono bg-purple-500/20 px-3 py-1 rounded-lg border border-purple-500/30">
                    {arraySize[0]}
                  </span>
                </div>
                <div className="relative">
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={100}
                    step={5}
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                    <span>5</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="relative bg-gray-950/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 overflow-hidden">
          {/* Neon grid background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, #00ffff 1px, transparent 1px),
                linear-gradient(to bottom, #00ffff 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }} />
          </div>

          {/* Visualization bars container */}
          <div className="relative h-96 flex items-end justify-center gap-1 px-4">
            {array.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <BarChart3 className="w-16 h-16 mx-auto text-purple-400/50" />
                  <p className="text-purple-300/70 text-lg">Generate an array to start visualizing</p>
                </div>
              </div>
            ) : (
              array.map((element, index) => {
                const maxValue = Math.max(...array.map(el => el.value));
                const heightPercentage = (element.value / maxValue) * 100;
                const isComparing = element.isComparing;
                const isSwapping = element.isSwapping;
                const isSorted = element.isSorted;

                return (
                  <motion.div
                    key={element.id}
                    className="relative flex-1 min-w-0 rounded-t-lg"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: `${heightPercentage}%`,
                      opacity: 1,
                      scale: isSwapping ? 1.1 : 1,
                      y: isSwapping ? -10 : 0
                    }}
                    transition={{
                      height: { duration: 0.3, ease: "easeOut" },
                      scale: { duration: 0.2 },
                      y: { duration: 0.2 }
                    }}
                    style={{
                      backgroundColor: isSorted 
                        ? '#00ff00' 
                        : isComparing 
                        ? '#ff00ff' 
                        : isSwapping 
                        ? '#ffff00' 
                        : NEON_COLORS[index % NEON_COLORS.length],
                      boxShadow: isComparing 
                        ? '0 0 20px #ff00ff, 0 0 40px #ff00ff' 
                        : isSwapping 
                        ? '0 0 20px #ffff00, 0 0 40px #ffff00'
                        : isSorted
                        ? '0 0 15px #00ff00'
                        : `0 0 10px ${NEON_COLORS[index % NEON_COLORS.length]}`
                    }}
                  >
                    {/* Value label */}
                    {array.length <= 30 && (
                      <motion.div
                        className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white"
                        animate={{
                          scale: isComparing || isSwapping ? 1.3 : 1,
                          color: isSorted ? '#00ff00' : isComparing ? '#ff00ff' : '#ffffff'
                        }}
                      >
                        {element.value}
                      </motion.div>
                    )}

                    {/* Trail effect for swapping */}
                    {isSwapping && (
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        style={{
                          backgroundColor: '#ffff00',
                          filter: 'blur(8px)'
                        }}
                      />
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Glow effect overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-cyan-500/10" />
          </div>
        </div>

        {/* TODO:StatsPanel Real-time statistics panel showing comparisons, swaps, and current step */}
      </div>
    </div>
  );
}