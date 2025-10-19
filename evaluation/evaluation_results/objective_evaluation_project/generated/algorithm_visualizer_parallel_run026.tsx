import { useState, useCallback } from 'react';import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, BarChart3 } from 'lucide-react';
import { Activity, TrendingUp, Shuffle } from 'lucide-react';
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
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);

  // Calculate statistics from current step
  React.useEffect(() => {
    if (steps.length > 0 && currentStep > 0) {
      let compCount = 0;
      let swapCount = 0;
      
      for (let i = 0; i < Math.min(currentStep, steps.length); i++) {
        if (steps[i].comparingIndices.length > 0) {
          compCount++;
        }
        if (steps[i].swappingIndices.length > 0) {
          swapCount++;
        }
      }
      
      setComparisons(compCount);
      setSwaps(swapCount);
    } else if (currentStep === 0) {
      setComparisons(0);
      setSwaps(0);
    }
  }, [currentStep, steps]);

  const generateRandomArray = useCallback(() => {
    const newArray: ArrayElement[] = Array.from({ length: arraySize[0] }, (_, i) => ({
      value: Math.floor(Math.random() * 100) + 5,
      id: `element-${i}-${Date.now()}`,
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

setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
    generateRandomArray();
        
  }, [generateRandomArray]);

  // Animation effect for step-by-step visualization
  const animateSteps = useCallback(() => {
    if (currentStep < steps.length && isPlaying) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 - speed[0] * 9); // Convert speed slider (0-100) to delay (1000ms-100ms)
      
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentStep, steps.length, isPlaying, speed]);

  // Run animation effect
  React.useEffect(() => {
    const cleanup = animateSteps();
    return cleanup;
  }, [animateSteps]);
  const startVisualization = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) {
      return;
    }
    setIsPlaying(true);
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {

setIsPlaying(false);
  });

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
        if (array.length === 0) return;

    const steps: AlgorithmStep[] = [];
    const arr = array.map(el => ({ ...el }));

    const addStep = (
      currentArray: ArrayElement[],
      comparing: number[] = [],
      swapping: number[] = [],
      sorted: number[] = []
    ) => {
      steps.push({
        array: currentArray.map(el => ({ ...el })),
        comparingIndices: [...comparing],
        swappingIndices: [...swapping],
        sortedIndices: [...sorted]
      });
    };

    if (algorithm === 'bubble') {
      const sortedIndices: number[] = [];
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          addStep(arr, [j, j + 1], [], sortedIndices);
          
          if (arr[j].value > arr[j + 1].value) {
            addStep(arr, [], [j, j + 1], sortedIndices);
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            addStep(arr, [], [], sortedIndices);
          }
        }
        sortedIndices.push(arr.length - i - 1);
        addStep(arr, [], [], sortedIndices);
      }
      sortedIndices.push(0);
      addStep(arr, [], [], sortedIndices);
    } else if (algorithm === 'insertion') {
      const sortedIndices: number[] = [0];
      addStep(arr, [], [], sortedIndices);
      
      for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        
        addStep(arr, [i], [], sortedIndices);
        
        while (j >= 0 && arr[j].value > key.value) {
          addStep(arr, [j, j + 1], [], sortedIndices);
          addStep(arr, [], [j, j + 1], sortedIndices);
          arr[j + 1] = arr[j];
          addStep(arr, [], [], sortedIndices);
          j--;
        }
        
        arr[j + 1] = key;
        sortedIndices.push(i);
        addStep(arr, [], [], sortedIndices);
      }
    } else if (algorithm === 'quick') {
      const sortedIndices: number[] = [];
      
      const partition = (low: number, high: number): number => {
        const pivot = arr[high];
        addStep(arr, [high], [], sortedIndices);
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
          addStep(arr, [j, high], [], sortedIndices);
          
          if (arr[j].value < pivot.value) {
            i++;
            addStep(arr, [], [i, j], sortedIndices);
            [arr[i], arr[j]] = [arr[j], arr[i]];
            addStep(arr, [], [], sortedIndices);
          }
        }
        
        addStep(arr, [], [i + 1, high], sortedIndices);
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        sortedIndices.push(i + 1);
        addStep(arr, [], [], sortedIndices);
        
        return i + 1;
      };
      
      const quickSort = (low: number, high: number) => {
        if (low < high) {
          const pi = partition(low, high);
          quickSort(low, pi - 1);
          quickSort(pi + 1, high);
        } else if (low === high) {
          sortedIndices.push(low);
          addStep(arr, [], [], sortedIndices);
        }
      };
      
      quickSort(0, arr.length - 1);
    } else if (algorithm === 'merge') {
      const sortedIndices: number[] = [];
      
      const merge = (left: number, mid: number, right: number) => {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
          addStep(arr, [left + i, mid + 1 + j], [], sortedIndices);
          
          if (leftArr[i].value <= rightArr[j].value) {
            addStep(arr, [], [k], sortedIndices);
            arr[k] = leftArr[i];
            addStep(arr, [], [], sortedIndices);
            i++;
          } else {
            addStep(arr, [], [k], sortedIndices);
            arr[k] = rightArr[j];
            addStep(arr, [], [], sortedIndices);
            j++;
          }
          k++;
        }
        
        while (i < leftArr.length) {
          addStep(arr, [], [k], sortedIndices);
          arr[k] = leftArr[i];
          addStep(arr, [], [], sortedIndices);
          i++;
          k++;
        }
        
        while (j < rightArr.length) {
          addStep(arr, [], [k], sortedIndices);
          arr[k] = rightArr[j];
          addStep(arr, [], [], sortedIndices);
          j++;
          k++;
        }
        
        if (left === 0 && right === arr.length - 1) {
          for (let idx = 0; idx < arr.length; idx++) {
            sortedIndices.push(idx);
          }
          addStep(arr, [], [], sortedIndices);
        }
      };
      
      const mergeSort = (left: number, right: number) => {
        if (left < right) {
          const mid = Math.floor((left + right) / 2);
          mergeSort(left, mid);
          mergeSort(mid + 1, right);
          merge(left, mid, right);
        }
      };
      
      mergeSort(0, arr.length - 1);
    }

    setSteps(steps);
    setCurrentStep(0);
  }, [array]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <motion.h1
            className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            animate={{
              textShadow: [
                '0 0 20px rgba(0, 255, 255, 0.5)',
                '0 0 40px rgba(255, 0, 255, 0.5)',
                '0 0 20px rgba(0, 255, 255, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Algorithm Visualizer
          </motion.h1>
          
          <div className="flex items-center justify-center gap-4">
            <motion.div
              className="flex items-center gap-2 px-6 py-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-cyan-500/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 255, 0.6)' }}
            >
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span className="text-xl font-semibold text-white">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name}
              </span>
            </motion.div>
            
            <motion.div
              className="px-4 py-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-full border border-purple-400/50"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.4)',
                  '0 0 30px rgba(236, 72, 153, 0.4)',
                  '0 0 20px rgba(168, 85, 247, 0.4)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-sm font-mono text-purple-200">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
              </span>
            </motion.div>
          </div>
        </motion.div></parameter>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-shadow duration-300"
            >
              <div className="space-y-6">
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm uppercase tracking-wider">Algorithm</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50'
                        }`}
                      >
                        <div className="font-medium text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">Array Size</span>
                    </div>
                    <span className="text-white font-mono text-lg">{arraySize[0]}</span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={1}
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400 font-semibold">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">Speed</span>
                    </div>
                    <span className="text-white font-mono text-lg">{speed[0]}%</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={100}
                    step={10}
                    className="cursor-pointer"
                  />
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || currentStep >= steps.length}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {currentStep >= steps.length ? 'Finished' : 'Play'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={() => {
                      generateSortingSteps(selectedAlgorithm);
                      setCurrentStep(0);
                    }}
                    disabled={array.length === 0 || isPlaying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all duration-300"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Steps
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-400 font-mono">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Array Length:</span>
                    <span className="text-purple-400 font-mono">{array.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-wider">ALGORITHM</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/50'
                            : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:bg-cyan-500/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-white">{algo.name}</div>
                          <div className={`text-xs ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-400'
                          }`}>
                            {algo.complexity}
                          </div>
                        </div>
                        {selectedAlgorithm === algo.id && (
                          <motion.div
                            className="absolute inset-0 rounded-lg border-2 border-cyan-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div></parameter>
</invoke>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-cyan-400 text-sm font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Speed
                    </label>
                    <span className="text-cyan-300 text-xs">{speed[0]}ms</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={200}
                    step={10}
                    className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-[0_0_15px_rgba(34,211,238,0.8)] [&_[role=slider]]:hover:shadow-[0_0_25px_rgba(34,211,238,1)] [&_[role=slider]]:transition-shadow [&_.relative]:bg-gray-700/50 [&_.relative]:border [&_.relative]:border-cyan-500/30 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-cyan-500 [&_.bg-primary]:to-purple-500 [&_.bg-primary]:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-cyan-400 text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Array Size
                    </label>
                    <span className="text-cyan-300 text-xs">{arraySize[0]}</span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-400/70 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={isPlaying ? pauseVisualization : startVisualization}
                      disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-6 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      style={{
                        boxShadow: isPlaying 
                          ? '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(6, 182, 212, 0.4)' 
                          : '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)'
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                      />
                      <motion.div
                        className="flex items-center justify-center gap-2 relative z-10"
                        animate={{
                          scale: isPlaying ? [1, 1.1, 1] : 1
                        }}
                        transition={{
                          duration: 1,
                          repeat: isPlaying ? Infinity : 0
                        }}
                      >
                        <motion.div
                          key={isPlaying ? 'pause' : 'play'}
                          initial={{ rotate: -180, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 180, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" fill="currentColor" />
                          ) : (
                            <Play className="w-5 h-5" fill="currentColor" />
                          )}
                        </motion.div>
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </motion.div>
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <Button
                      onClick={resetVisualization}
                      variant="outline"
                      size="lg"
                      className="w-full bg-gradient-to-r from-pink-600/20 to-orange-600/20 border-pink-500/50 hover:border-pink-400 text-white hover:bg-pink-500/30 transition-all duration-300 shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.7)]"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </motion.div>
                  
                  <Button
                    onClick={generateRandomArray}
                    variant="outline"
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50 hover:border-purple-400 text-white hover:bg-purple-500/30 transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.7)]"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    New Array
                  </Button>
                </div>
              </div>
            </div>

            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-shadow duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 font-semibold mb-4">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wider">Statistics</span>
                </div>

                {/* Comparisons */}
                <motion.div
                  className="bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-lg p-4"
                  whileHover={{ scale: 1.02, borderColor: 'rgba(0, 255, 255, 0.5)' }}
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(0, 255, 255, 0.2)',
                      '0 0 20px rgba(0, 255, 255, 0.4)',
                      '0 0 10px rgba(0, 255, 255, 0.2)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-gray-300">Comparisons</span>
                    </div>
                    <motion.span
                      key={comparisons}
                      initial={{ scale: 1.5, color: '#00ffff' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      className="text-2xl font-bold font-mono"
                    >
                      {comparisons}
                    </motion.span>
                  </div>
                </motion.div>

                {/* Swaps */}
                <motion.div
                  className="bg-gradient-to-r from-pink-500/10 to-pink-600/10 border border-pink-500/30 rounded-lg p-4"
                  whileHover={{ scale: 1.02, borderColor: 'rgba(255, 0, 102, 0.5)' }}
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(255, 0, 102, 0.2)',
                      '0 0 20px rgba(255, 0, 102, 0.4)',
                      '0 0 10px rgba(255, 0, 102, 0.2)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shuffle className="w-4 h-4 text-pink-400" />
                      <span className="text-sm text-gray-300">Swaps</span>
                    </div>
                    <motion.span
                      key={swaps}
                      initial={{ scale: 1.5, color: '#ff0066' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      className="text-2xl font-bold font-mono"
                    >
                      {swaps}
                    </motion.span>
                  </div>
                </motion.div>

                {/* Progress */}
                <motion.div
                  className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4"
                  whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(168, 85, 247, 0.2)',
                      '0 0 20px rgba(168, 85, 247, 0.4)',
                      '0 0 10px rgba(168, 85, 247, 0.2)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">Progress</span>
                      </div>
                      <span className="text-lg font-bold font-mono text-white">
                        {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                          boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)'
                        }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Step Counter */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Current Step</span>
                    <span className="text-lg font-mono text-gray-300">
                      {currentStep} / {steps.length}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-8 shadow-2xl shadow-purple-500/20 min-h-[600px]">
              {array.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 30px rgba(0, 255, 255, 0.3)',
                        '0 0 60px rgba(255, 0, 255, 0.5)',
                        '0 0 30px rgba(0, 255, 255, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50"
                  >
                    <BarChart3 className="w-16 h-16 text-cyan-400" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">Ready to Visualize</h3>
                    <p className="text-gray-400">Generate an array to begin sorting</p>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* Current step visualization */}
                  {currentStep > 0 && steps[currentStep - 1] ? (
                    steps[currentStep - 1].array.map((element, index) => {
                      const isComparing = steps[currentStep - 1].comparingIndices.includes(index);
                      const isSwapping = steps[currentStep - 1].swappingIndices.includes(index);
                      const isSorted = steps[currentStep - 1].sortedIndices.includes(index);
                      
                      const maxValue = Math.max(...array.map(el => el.value));
                      const heightPercentage = (element.value / maxValue) * 100;
                      
                      let barColor = NEON_COLORS[index % NEON_COLORS.length];
                      let glowColor = barColor;
                      let glowIntensity = 0.3;
                      
                      if (isSorted) {
                        barColor = '#00ff00';
                        glowColor = '#00ff00';
                        glowIntensity = 0.6;
                      } else if (isSwapping) {
                        barColor = '#ff0066';
                        glowColor = '#ff0066';
                        glowIntensity = 0.8;
                      } else if (isComparing) {
                        barColor = '#ffff00';
                        glowColor = '#ffff00';
                        glowIntensity = 0.7;
                      }
                      
                      return (
                        <motion.div
                          key={element.id}
                          className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: `${heightPercentage}%`,
                            opacity: 1,
                            y: isSwapping ? [-10, 0] : 0,
                            scale: isComparing || isSwapping ? [1, 1.1, 1] : 1
                          }}
                          transition={{
                            height: { duration: 0.3, ease: "easeOut" },
                            y: { duration: 0.4, ease: "easeInOut" },
                            scale: { duration: 0.3, repeat: isComparing || isSwapping ? Infinity : 0 }
                          }}
                          style={{
                            backgroundColor: barColor,
                            boxShadow: `0 0 ${glowIntensity * 30}px ${glowColor}, 0 0 ${glowIntensity * 60}px ${glowColor}, inset 0 0 ${glowIntensity * 20}px rgba(255, 255, 255, 0.3)`
                          }}
                        >
                          {/* Swap trail effect */}
                          {isSwapping && (
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              initial={{ opacity: 0.8, scale: 1 }}
                              animate={{ opacity: 0, scale: 1.5 }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              style={{
                                backgroundColor: barColor,
                                filter: 'blur(8px)'
                              }}
                            />
                          )}
                          
                          {/* Comparison indicator */}
                          {isComparing && (
                            <motion.div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                              animate={{
                                y: [0, -5, 0],
                                opacity: [0.7, 1, 0.7]
                              }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            >
                              <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(255,255,0,0.8)]" />
                            </motion.div>
                          )}
                          
                          {/* Value label for larger arrays */}
                          {arraySize[0] <= 30 && (
                            <motion.div
                              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-white whitespace-nowrap"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: isSorted ? 1 : 0.6 }}
                            >
                              {element.value}
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })
                  ) : (
                    // Initial array state
                    array.map((element, index) => {
                      const maxValue = Math.max(...array.map(el => el.value));
                      const heightPercentage = (element.value / maxValue) * 100;
                      const barColor = NEON_COLORS[index % NEON_COLORS.length];
                      
                      return (
                        <motion.div
                          key={element.id}
                          className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: `${heightPercentage}%`,
                            opacity: 1
                          }}
                          transition={{
                            height: { duration: 0.5, ease: "easeOut", delay: index * 0.02 },
                            opacity: { duration: 0.3, delay: index * 0.02 }
                          }}
                          style={{
                            backgroundColor: barColor,
                            boxShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}, inset 0 0 10px rgba(255, 255, 255, 0.2)`
                          }}
                        >
                          {arraySize[0] <= 30 && (
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-white/60 whitespace-nowrap">
                              {element.value}
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {currentStep > 0 && steps[currentStep - 1] ? (
                  steps[currentStep - 1].array.map((element, index) => {
                    const isComparing = steps[currentStep - 1].comparingIndices.includes(index);
                    const isSwapping = steps[currentStep - 1].swappingIndices.includes(index);
                    const isSorted = steps[currentStep - 1].sortedIndices.includes(index);
                    
                    const barColor = isSorted 
                      ? '#00ff00' 
                      : isSwapping 
                      ? '#ff0066' 
                      : isComparing 
                      ? '#ffff00' 
                      : NEON_COLORS[index % NEON_COLORS.length];

                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${element.value * 4}px`,
                          opacity: 1,
                          backgroundColor: barColor,
                          boxShadow: [
                            `0 0 ${isComparing || isSwapping ? '30px' : '15px'} ${barColor}`,
                            `0 0 ${isComparing || isSwapping ? '40px' : '20px'} ${barColor}`,
                            `0 0 ${isComparing || isSwapping ? '30px' : '15px'} ${barColor}`
                          ],
                          scale: isSwapping ? [1, 1.1, 1] : isComparing ? 1.05 : 1,
                          y: isSwapping ? [-10, 0] : 0
                        }}
                        transition={{
                          height: { duration: 0.3, ease: 'easeOut' },
                          backgroundColor: { duration: 0.2 },
                          boxShadow: { duration: 1, repeat: Infinity },
                          scale: { duration: 0.3 },
                          y: { duration: 0.4, ease: 'easeInOut' }
                        }}
                        style={{
                          background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                          border: `1px solid ${barColor}`,
                        }}
                      >
                        {/* Value label */}
                        <motion.div
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                          animate={{
                            color: barColor,
                            textShadow: `0 0 10px ${barColor}`,
                            scale: isComparing || isSwapping ? [1, 1.2, 1] : 1
                          }}
                          transition={{
                            scale: { duration: 0.3 },
                            textShadow: { duration: 1, repeat: Infinity }
                          }}
                        >
                          {element.value}
                        </motion.div>

                        {/* Swap trail effect */}
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            initial={{ opacity: 0.8, scale: 1 }}
                            animate={{
                              opacity: 0,
                              scale: 1.5,
                              boxShadow: `0 0 50px ${barColor}`
                            }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{
                              background: `radial-gradient(circle, ${barColor}88, transparent)`,
                            }}
                          />
                        )}

                        {/* Comparison indicator */}
                        {isComparing && (
                          <motion.div
                            className="absolute -top-10 left-1/2 transform -translate-x-1/2"
                            animate={{
                              y: [-5, 5, -5],
                              opacity: [0.6, 1, 0.6]
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: '#ffff00',
                                boxShadow: '0 0 15px #ffff00'
                              }}
                            />
                          </motion.div>
                        )}

                        {/* Sorted checkmark */}
                        {isSorted && (
                          <motion.div
                            className="absolute top-2 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                          >
                            <div 
                              className="text-white font-bold text-xs"
                              style={{
                                textShadow: '0 0 10px #00ff00',
                                filter: 'drop-shadow(0 0 5px #00ff00)'
                              }}
                            >
                              ✓
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })
                ) : array.length > 0 ? (
                  array.map((element, index) => {
                    const barColor = NEON_COLORS[index % NEON_COLORS.length];
                    
                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${element.value * 4}px`,
                          opacity: 1,
                          boxShadow: [
                            `0 0 15px ${barColor}`,
                            `0 0 20px ${barColor}`,
                            `0 0 15px ${barColor}`
                          ]
                        }}
                        transition={{
                          height: { duration: 0.5, ease: 'easeOut' },
                          opacity: { duration: 0.3 },
                          boxShadow: { duration: 2, repeat: Infinity }
                        }}
                        style={{
                          background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                          border: `1px solid ${barColor}`,
                        }}
                      >
                        <motion.div
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold"
                          style={{
                            color: barColor,
                            textShadow: `0 0 10px ${barColor}`
                          }}
                        >
                          {element.value}
                        </motion.div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{
                          textShadow: [
                            '0 0 20px rgba(0, 255, 255, 0.5)',
                            '0 0 30px rgba(0, 255, 255, 0.8)',
                            '0 0 20px rgba(0, 255, 255, 0.5)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-cyan-400 text-xl font-semibold"
                      >
                        Generate an array to begin
                      </motion.div>
                      <BarChart3 className="w-16 h-16 text-cyan-400/50 mx-auto" />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-300 font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Sorting Progress
                </span>
                <motion.span
                  className="text-cyan-300 font-mono text-lg font-bold"
                  key={currentStep}
                  initial={{ scale: 1.3, color: '#00ffff' }}
                  animate={{ scale: 1, color: '#67e8f9' }}
                  transition={{ duration: 0.3 }}
                >
                  {steps.length > 0 ? Math.min(Math.round((currentStep / steps.length) * 100), 100) : 0}%
                </motion.span>
              </div>
              
              <div className="relative h-4 bg-gray-800/80 rounded-full overflow-hidden border border-purple-500/30 shadow-inner">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: steps.length > 0 ? `${Math.min((currentStep / steps.length) * 100, 100)}%` : '0%'
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(6, 182, 212, 0.4)'
                  }}
                />
                
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  style={{
                    width: '50%'
                  }}
                />
                
                {steps.length > 0 && currentStep < steps.length && (
                  <motion.div
                    className="absolute right-0 top-0 h-full w-1"
                    animate={{
                      boxShadow: [
                        '0 0 10px 2px rgba(0, 255, 255, 0.8)',
                        '0 0 20px 4px rgba(255, 0, 255, 0.8)',
                        '0 0 10px 2px rgba(0, 255, 255, 0.8)'
                      ]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                      left: `${Math.min((currentStep / steps.length) * 100, 100)}%`,
                      background: 'linear-gradient(to bottom, #00ffff, #ff00ff)'
                    }}
                  />
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Step {currentStep} of {steps.length}</span>
                {currentStep >= steps.length && steps.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-green-400 font-semibold flex items-center gap-1"
                  >
                    <motion.span
                      animate={{
                        textShadow: [
                          '0 0 10px rgba(34, 197, 94, 0.8)',
                          '0 0 20px rgba(34, 197, 94, 1)',
                          '0 0 10px rgba(34, 197, 94, 0.8)'
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ✓ Complete
                    </motion.span>
                  </motion.span>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-cyan-500/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 255, 0.6)' }}
              animate={{
                boxShadow: [
                  '0 0 10px rgba(0, 255, 255, 0.3)',
                  '0 0 20px rgba(0, 255, 255, 0.5)',
                  '0 0 10px rgba(0, 255, 255, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-4 h-12 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0, 255, 255, 0.6)',
                    '0 0 25px rgba(0, 255, 255, 0.8)',
                    '0 0 15px rgba(0, 255, 255, 0.6)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-cyan-300">Comparing</div>
                <div className="text-xs text-gray-400">Active comparison</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-pink-500/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(236, 72, 153, 0.6)' }}
              animate={{
                boxShadow: [
                  '0 0 10px rgba(236, 72, 153, 0.3)',
                  '0 0 20px rgba(236, 72, 153, 0.5)',
                  '0 0 10px rgba(236, 72, 153, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <motion.div
                className="w-4 h-12 bg-gradient-to-t from-pink-500 to-pink-300 rounded"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(236, 72, 153, 0.6)',
                    '0 0 25px rgba(236, 72, 153, 0.8)',
                    '0 0 15px rgba(236, 72, 153, 0.6)'
                  ],
                  x: [-2, 2, -2]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-pink-300">Swapping</div>
                <div className="text-xs text-gray-400">Elements moving</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-green-500/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(34, 197, 94, 0.6)' }}
              animate={{
                boxShadow: [
                  '0 0 10px rgba(34, 197, 94, 0.3)',
                  '0 0 20px rgba(34, 197, 94, 0.5)',
                  '0 0 10px rgba(34, 197, 94, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <motion.div
                className="w-4 h-12 bg-gradient-to-t from-green-500 to-green-300 rounded"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(34, 197, 94, 0.6)',
                    '0 0 25px rgba(34, 197, 94, 0.8)',
                    '0 0 15px rgba(34, 197, 94, 0.6)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-green-300">Sorted</div>
                <div className="text-xs text-gray-400">In final position</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-purple-500/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.6)' }}
            >
              <div className="w-4 h-12 bg-gradient-to-t from-purple-500 to-purple-300 rounded opacity-60" />
              <div>
                <div className="text-sm font-semibold text-purple-300">Unsorted</div>
                <div className="text-xs text-gray-400">Waiting to sort</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}