import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, BarChart3 } from 'lucide-react';

import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useState, useCallback } from 'react';

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
  // Get current visualization state
  const currentArray = steps.length > 0 && currentStep < steps.length 
    ? steps[currentStep].array 
    : array;
  const comparingIndices = steps.length > 0 && currentStep < steps.length 
    ? steps[currentStep].comparingIndices 
    : [];
  const swappingIndices = steps.length > 0 && currentStep < steps.length 
    ? steps[currentStep].swappingIndices 
    : [];
  const sortedIndices = steps.length > 0 && currentStep < steps.length 
    ? steps[currentStep].sortedIndices 
    : [];

  const [array, setArray] = useState<ArrayElement[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [arraySize, setArraySize] = useState([20]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bubble');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [totalComparisons, setTotalComparisons] = useState(0);
  const [totalSwaps, setTotalSwaps] = useState(0);

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
      }, 1000 - speed[0] * 9.5); // Convert speed slider (0-100) to delay (1000ms-50ms)
      
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
    if (steps.length === 0) return;
    setIsPlaying(true);
    if (currentStep >= steps.length) {
      setCurrentStep(0);
    }
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    const sortedArray = [...array];
    const newSteps: AlgorithmStep[] = [];

    const addStep = (arr: ArrayElement[], comparing: number[] = [], swapping: number[] = [], sorted: number[] = []) => {
      newSteps.push({
        array: arr.map(el => ({ ...el })),
        comparingIndices: [...comparing],
        swappingIndices: [...swapping],
        sortedIndices: [...sorted]
      });
    };

    // Initial state
    addStep(sortedArray);

    switch (algorithm) {
      case 'bubble': {
        const sortedSet = new Set<number>();
        for (let i = 0; i < sortedArray.length - 1; i++) {
          for (let j = 0; j < sortedArray.length - i - 1; j++) {
            // Comparing
            addStep(sortedArray, [j, j + 1], [], Array.from(sortedSet));
            
            if (sortedArray[j].value > sortedArray[j + 1].value) {
              // Swapping
              addStep(sortedArray, [], [j, j + 1], Array.from(sortedSet));
              [sortedArray[j], sortedArray[j + 1]] = [sortedArray[j + 1], sortedArray[j]];
              addStep(sortedArray, [], [], Array.from(sortedSet));
            }
          }
          sortedSet.add(sortedArray.length - i - 1);
          addStep(sortedArray, [], [], Array.from(sortedSet));
        }
        sortedSet.add(0);
        addStep(sortedArray, [], [], Array.from(sortedSet));
        break;
      }

      case 'insertion': {
        const sortedSet = new Set<number>([0]);
        addStep(sortedArray, [], [], [0]);
        
        for (let i = 1; i < sortedArray.length; i++) {
          const key = sortedArray[i];
          let j = i - 1;
          
          addStep(sortedArray, [i], [], Array.from(sortedSet));
          
          while (j >= 0 && sortedArray[j].value > key.value) {
            addStep(sortedArray, [j, j + 1], [], Array.from(sortedSet));
            addStep(sortedArray, [], [j, j + 1], Array.from(sortedSet));
            sortedArray[j + 1] = sortedArray[j];
            addStep(sortedArray, [], [], Array.from(sortedSet));
            j--;
          }
          
          sortedArray[j + 1] = key;
          sortedSet.add(i);
          addStep(sortedArray, [], [], Array.from(sortedSet));
        }
        break;
      }

      case 'quick': {
        const sortedSet = new Set<number>();
        
        const partition = (low: number, high: number): number => {
          const pivot = sortedArray[high];
          addStep(sortedArray, [high], [], Array.from(sortedSet));
          let i = low - 1;

          for (let j = low; j < high; j++) {
            addStep(sortedArray, [j, high], [], Array.from(sortedSet));
            
            if (sortedArray[j].value < pivot.value) {
              i++;
              if (i !== j) {
                addStep(sortedArray, [], [i, j], Array.from(sortedSet));
                [sortedArray[i], sortedArray[j]] = [sortedArray[j], sortedArray[i]];
                addStep(sortedArray, [], [], Array.from(sortedSet));
              }
            }
          }

          addStep(sortedArray, [], [i + 1, high], Array.from(sortedSet));
          [sortedArray[i + 1], sortedArray[high]] = [sortedArray[high], sortedArray[i + 1]];
          addStep(sortedArray, [], [], Array.from(sortedSet));
          
          return i + 1;
        };

        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            sortedSet.add(pi);
            addStep(sortedArray, [], [], Array.from(sortedSet));
            
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
          } else if (low === high) {
            sortedSet.add(low);
            addStep(sortedArray, [], [], Array.from(sortedSet));
          }
        };

        quickSort(0, sortedArray.length - 1);
        break;
      }

      case 'merge': {
        const sortedSet = new Set<number>();
        
        const merge = (left: number, mid: number, right: number) => {
          const leftArr = sortedArray.slice(left, mid + 1);
          const rightArr = sortedArray.slice(mid + 1, right + 1);
          
          let i = 0, j = 0, k = left;

          while (i < leftArr.length && j < rightArr.length) {
            addStep(sortedArray, [left + i, mid + 1 + j], [], Array.from(sortedSet));
            
            if (leftArr[i].value <= rightArr[j].value) {
              sortedArray[k] = leftArr[i];
              i++;
            } else {
              sortedArray[k] = rightArr[j];
              j++;
            }
            addStep(sortedArray, [], [k], Array.from(sortedSet));
            k++;
          }

          while (i < leftArr.length) {
            sortedArray[k] = leftArr[i];
            addStep(sortedArray, [], [k], Array.from(sortedSet));
            i++;
            k++;
          }

          while (j < rightArr.length) {
            sortedArray[k] = rightArr[j];
            addStep(sortedArray, [], [k], Array.from(sortedSet));
            j++;
            k++;
          }

          for (let idx = left; idx <= right; idx++) {
            sortedSet.add(idx);
          }
          addStep(sortedArray, [], [], Array.from(sortedSet));
        };

        const mergeSort = (left: number, right: number) => {
          if (left < right) {
            const mid = Math.floor((left + right) / 2);
            mergeSort(left, mid);
            mergeSort(mid + 1, right);
            merge(left, mid, right);
          } else if (left === right) {
            sortedSet.add(left);
            addStep(sortedArray, [], [], Array.from(sortedSet));
          }
        };

        mergeSort(0, sortedArray.length - 1);
        break;
      }
    }

    setSteps(newSteps);
    setCurrentStep(0);
  }, [array]);
  // Initialize array on mount
  React.useEffect(() => {
    generateRandomArray();
  }, []);

  // Regenerate array when size changes
  React.useEffect(() => {
    if (!isPlaying) {
      generateRandomArray();
    }
  }, [arraySize[0]]);

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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800/50 backdrop-blur-sm rounded-full border border-cyan-500/30"
            >
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-xl font-semibold text-cyan-300">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name || 'Bubble Sort'}
              </span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-900/50 backdrop-blur-sm rounded-full border border-purple-500/50"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
              }}
            >
              <BarChart3 className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-mono text-purple-200">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity || 'O(n²)'}
              </span>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)]"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-bold text-cyan-400">Controls</h3>
                </div>

                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Algorithm
                  </label>
                  <div className="space-y-2">
                    {mockAlgorithms.map((algo) => (
                      <button
                        key={algo.id}
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          generateSortingSteps(algo.id as AlgorithmType);
                        }}
                        disabled={isPlaying}
                        className={`w-full p-3 rounded-lg border transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)] text-cyan-300'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 text-gray-400 hover:text-cyan-400'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="text-left">
                          <div className="font-semibold">{algo.name}</div>
                          <div className="text-xs opacity-70">{algo.complexity}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-purple-300">
                    Speed: {speed[0]}ms
                  </label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={200}
                    step={10}
                    className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400 [&_[role=slider]]:shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                    disabled={isPlaying}
                  />
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-pink-300">
                    Array Size: {arraySize[0]}
                  </label>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={5}
                    className="[&_[role=slider]]:bg-pink-500 [&_[role=slider]]:border-pink-400 [&_[role=slider]]:shadow-[0_0_10px_rgba(236,72,153,0.6)]"
                    disabled={isPlaying}
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all duration-300"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {currentStep >= steps.length ? 'Start' : 'Resume'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Progress Indicator */}
                {steps.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-cyan-500/20">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span>{currentStep} / {steps.length}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(0,255,255,0.6)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
            <div className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Algorithm
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`relative p-3 rounded-lg border transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/50'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm font-medium ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-300'
                          }`}>
                            {algo.name}
                          </span>
                          <span className={`text-xs ${
                            selectedAlgorithm === algo.id ? 'text-cyan-400/80' : 'text-gray-500'
                          }`}>
                            {algo.complexity}
                          </span>
                        </div>
                        {selectedAlgorithm === algo.id && (
                          <motion.div
                            className="absolute inset-0 rounded-lg border-2 border-cyan-400"
                            layoutId="algorithmSelector"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

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
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-[0_0_15px_rgba(34,211,238,0.8)] [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-[0_0_25px_rgba(34,211,238,1)] [&_.relative]:h-2 [&_.relative]:bg-gray-800 [&_.relative]:rounded-full [&_.relative]:border [&_.relative]:border-cyan-500/30 [&_[role=slider]]:focus:ring-4 [&_[role=slider]]:focus:ring-cyan-400/50"
                  /></parameter>
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
                    step={1}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    className="flex-1 relative overflow-hidden group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border-0 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all duration-300"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <motion.div
                      className="relative flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        key={isPlaying ? 'pause' : 'play'}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </motion.div>
                      <span className="font-semibold">
                        {isPlaying ? 'Pause' : 'Play'}
                      </span>
                    </motion.div>
                  </Button>
                  <motion.button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold py-3 px-6 rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)] disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2 border border-pink-400/50 disabled:border-gray-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: 360 }}
                    transition={{ 
                      scale: { type: "spring", stiffness: 400, damping: 10 },
                      rotate: { duration: 0.6, ease: "easeInOut" }
                    }}
                  >
                    <motion.div
                      animate={{ rotate: isPlaying ? 0 : 0 }}
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </motion.div>
                    Reset
                  </motion.button>
                </div>
              </div>
            </div>

            
<motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-purple-400">Statistics</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Comparisons Counter */}
                  <motion.div
                    className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
                    whileHover={{ scale: 1.02, shadow: "0 0 30px rgba(0,255,255,0.4)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-cyan-300/70 uppercase tracking-wider mb-1">Comparisons</p>
                        <motion.p
                          key={totalComparisons}
                          initial={{ scale: 1.3, color: '#00ffff' }}
                          animate={{ scale: 1, color: '#67e8f9' }}
                          className="text-3xl font-bold text-cyan-300"
                        >
                          {totalComparisons}
                        </motion.p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                        <Zap className="w-6 h-6 text-cyan-400" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Swaps Counter */}
                  <motion.div
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                    whileHover={{ scale: 1.02, shadow: "0 0 30px rgba(168,85,247,0.4)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-300/70 uppercase tracking-wider mb-1">Swaps</p>
                        <motion.p
                          key={totalSwaps}
                          initial={{ scale: 1.3, color: '#a855f7' }}
                          animate={{ scale: 1, color: '#c084fc' }}
                          className="text-3xl font-bold text-purple-300"
                        >
                          {totalSwaps}
                        </motion.p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                        <RotateCcw className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Progress */}
                  <motion.div
                    className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    whileHover={{ scale: 1.02, shadow: "0 0 30px rgba(34,197,94,0.4)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-green-300/70 uppercase tracking-wider mb-1">Progress</p>
                        <motion.p
                          key={currentStep}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="text-3xl font-bold text-green-300"
                        >
                          {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                        </motion.p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                        <Play className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden border border-green-500/20">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>

                  {/* Current Step */}
                  <motion.div
                    className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                    whileHover={{ scale: 1.02, shadow: "0 0 30px rgba(234,179,8,0.4)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-yellow-300/70 uppercase tracking-wider mb-1">Current Step</p>
                        <motion.p
                          key={currentStep}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="text-2xl font-bold text-yellow-300"
                        >
                          {currentStep} / {steps.length}
                        </motion.p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                        <BarChart3 className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-8 shadow-2xl shadow-purple-500/20 min-h-[600px]">
              
              <div className="relative h-[500px] flex items-end justify-center gap-1 px-4">
                {currentArray.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Zap className="w-16 h-16 text-cyan-400 mx-auto animate-pulse" />
                      <p className="text-cyan-300 text-lg font-medium">
                        Generate an array to start visualizing
                      </p>
                      <p className="text-gray-400 text-sm">
                        Adjust the array size and click the reset button
                      </p>
                    </div>
                  </div>
                ) : (
                  currentArray.map((element, index) => {
                    const isComparing = comparingIndices.includes(index);
                    const isSwapping = swappingIndices.includes(index);
                    const isSorted = sortedIndices.includes(index);
                    
                    const maxValue = Math.max(...currentArray.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let glowColor = barColor;
                    let shadowIntensity = 0.4;
                    
                    if (isSorted) {
                      barColor = '#00ff00';
                      glowColor = '#00ff00';
                      shadowIntensity = 0.8;
                    } else if (isSwapping) {
                      barColor = '#ff0066';
                      glowColor = '#ff0066';
                      shadowIntensity = 1;
                    } else if (isComparing) {
                      barColor = '#ffff00';
                      glowColor = '#ffff00';
                      shadowIntensity = 0.9;
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `0 0 ${shadowIntensity * 20}px ${glowColor}, 0 0 ${shadowIntensity * 40}px ${glowColor}`,
                        }}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          scale: isSwapping ? [1, 1.1, 1] : isComparing ? 1.05 : 1,
                          y: isSwapping ? [-10, 0] : 0,
                        }}
                        transition={{
                          height: { duration: 0.5, ease: "easeOut" },
                          opacity: { duration: 0.3 },
                          scale: { duration: 0.3 },
                          y: { duration: 0.4, ease: "easeInOut" },
                        }}
                      >
                        {/* Swap trail effect */}
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              backgroundColor: barColor,
                              opacity: 0.5,
                            }}
                            initial={{ opacity: 0.8, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.5 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        )}
                        
                        {/* Comparison indicator */}
                        {isComparing && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: glowColor,
                                boxShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}`,
                              }}
                            />
                          </motion.div>
                        )}
                        
                        {/* Value label */}
                        {currentArray.length <= 30 && (
                          <motion.div
                            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                            style={{ color: barColor }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                        
                        {/* Sorted checkmark */}
                        {isSorted && (
                          <motion.div
                            className="absolute top-2 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.8)]">
                              <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {(currentStep > 0 && currentStep <= steps.length ? steps[currentStep - 1].array : array).map((element, index) => {
                  const currentStepData = currentStep > 0 && currentStep <= steps.length ? steps[currentStep - 1] : null;
                  const isComparing = currentStepData?.comparingIndices.includes(index);
                  const isSwapping = currentStepData?.swappingIndices.includes(index);
                  const isSorted = currentStepData?.sortedIndices.includes(index);
                  
                  const maxValue = 100;
                  const heightPercentage = (element.value / maxValue) * 100;
                  
                  let barColor = NEON_COLORS[index % NEON_COLORS.length];
                  let shadowColor = barColor;
                  let glowIntensity = '0.5';
                  
                  if (isSorted) {
                    barColor = '#00ff00';
                    shadowColor = '#00ff00';
                    glowIntensity = '0.8';
                  } else if (isSwapping) {
                    barColor = '#ff0066';
                    shadowColor = '#ff0066';
                    glowIntensity = '1';
                  } else if (isComparing) {
                    barColor = '#ffff00';
                    shadowColor = '#ffff00';
                    glowIntensity = '0.9';
                  }
                  
                  return (
                    <motion.div
                      key={element.id}
                      className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                      style={{
                        height: `${heightPercentage}%`,
                        backgroundColor: barColor,
                        boxShadow: `
                          0 0 20px ${shadowColor}${Math.floor(parseFloat(glowIntensity) * 255).toString(16).padStart(2, '0')},
                          0 0 40px ${shadowColor}${Math.floor(parseFloat(glowIntensity) * 128).toString(16).padStart(2, '0')},
                          0 0 60px ${shadowColor}${Math.floor(parseFloat(glowIntensity) * 64).toString(16).padStart(2, '0')},
                          inset 0 0 20px ${shadowColor}${Math.floor(parseFloat(glowIntensity) * 128).toString(16).padStart(2, '0')}
                        `,
                        border: `2px solid ${barColor}`,
                      }}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: `${heightPercentage}%`,
                        opacity: 1,
                        scale: isSwapping ? [1, 1.1, 1] : isComparing ? 1.05 : 1,
                      }}
                      transition={{
                        height: { duration: 0.5, ease: "easeInOut" },
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3, ease: "easeInOut" },
                      }}
                    >
                      {/* Glow effect overlay */}
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        style={{
                          background: `linear-gradient(to top, transparent, ${barColor}40)`,
                        }}
                        animate={{
                          opacity: isSwapping || isComparing ? [0.5, 1, 0.5] : 0.3,
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: isSwapping || isComparing ? Infinity : 0,
                        }}
                      />
                      
                      {/* Value label */}
                      {arraySize[0] <= 30 && (
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                          style={{ color: barColor }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {element.value}
                        </motion.div>
                      )}
                      
                      {/* Swap trail effect */}
                      {isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            background: `radial-gradient(circle at center, ${barColor}, transparent)`,
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: [0, 0.8, 0],
                            scale: [0.8, 1.2, 1.4],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                          }}
                        />
                      )}
                      
                      {/* Sorted indicator */}
                      {isSorted && (
                        <motion.div
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: '#00ff00',
                              boxShadow: '0 0 10px #00ff00, 0 0 20px #00ff00',
                            }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

                        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-300 font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Sorting Progress
                </span>
                <motion.span 
                  className="text-cyan-300 font-mono font-bold text-lg"
                  key={currentStep}
                  initial={{ scale: 1.3, color: '#00ffff' }}
                  animate={{ scale: 1, color: '#67e8f9' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                </motion.span>
              </div>
              
              <div className="relative h-4 bg-gray-800/80 rounded-full overflow-hidden border border-purple-500/30 shadow-inner">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)'
                  }}
                />
                
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    width: '50%',
                  }}
                />
                
                {steps.length > 0 && currentStep > 0 && (
                  <motion.div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    animate={{
                      left: `${(currentStep / steps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                )}
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 font-mono">
                <span>Step {currentStep}</span>
                <span>Total {steps.length}</span>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-cyan-400">Legend</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 255, 0.5)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-cyan-500 to-cyan-300"
                style={{
                  boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
                }}
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0, 255, 255, 0.5)',
                    '0 0 25px rgba(0, 255, 255, 0.7)',
                    '0 0 15px rgba(0, 255, 255, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-cyan-300">Default</div>
                <div className="text-xs text-gray-400">Unsorted</div>
              </div>
            </motion.div>

            {/* Comparing State */}
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-yellow-700/50"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 0, 0.5)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-yellow-500 to-yellow-300"
                style={{
                  boxShadow: '0 0 20px rgba(255, 255, 0, 0.6)'
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 255, 0, 0.6)',
                    '0 0 35px rgba(255, 255, 0, 0.9)',
                    '0 0 20px rgba(255, 255, 0, 0.6)'
                  ],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-yellow-300">Comparing</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-pink-700/50"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 0, 102, 0.5)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-pink-500 to-pink-300"
                style={{
                  boxShadow: '0 0 20px rgba(255, 0, 102, 0.6)'
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 0, 102, 0.6)',
                    '0 0 35px rgba(255, 0, 102, 0.9)',
                    '0 0 20px rgba(255, 0, 102, 0.6)'
                  ],
                  x: [-2, 2, -2]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-pink-300">Swapping</div>
                <div className="text-xs text-gray-400">Moving</div>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-green-700/50"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 170, 0.5)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-green-500 to-green-300"
                style={{
                  boxShadow: '0 0 20px rgba(0, 255, 170, 0.6)'
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0, 255, 170, 0.6)',
                    '0 0 30px rgba(0, 255, 170, 0.8)',
                    '0 0 20px rgba(0, 255, 170, 0.6)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-green-300">Sorted</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30"
          >
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300 leading-relaxed">
                <span className="font-semibold text-purple-300">Tip:</span> Watch the bars change colors as the algorithm compares, swaps, and sorts elements. The glowing effects indicate active operations in real-time.
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}