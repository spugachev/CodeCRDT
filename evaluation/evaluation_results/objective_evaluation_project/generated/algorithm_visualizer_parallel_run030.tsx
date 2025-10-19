import { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, BarChart3 } from 'lucide-react';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';


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

  const animateSteps = useCallback(() => {
    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const step = steps[currentStep];
    setArray(step.array);
    setCurrentStep(prev => prev + 1);
  }, [currentStep, steps]);

  const startVisualization = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) {
      return;
    }
    setIsPlaying(true);
    
  }, [steps, speed, currentStep]);
  useEffect(() => {
    if (!isPlaying) return;

    const delay = 1000 - (speed[0] * 9.5);
    const timer = setTimeout(() => {
      animateSteps();
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, speed, animateSteps]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
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
            <BarChart3 className="inline-block mr-4 mb-2" size={48} />
            Algorithm Visualizer
          </motion.h1>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex gap-3">
              {mockAlgorithms.map((algo) => (
                <motion.button
                  key={algo.id}
                  onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedAlgorithm === algo.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {algo.name}
                </motion.button>
              ))}
            </div>

            <motion.div
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-mono font-bold shadow-lg"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.6)',
                  '0 0 40px rgba(236, 72, 153, 0.6)',
                  '0 0 20px rgba(168, 85, 247, 0.6)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="inline-block mr-2 mb-1" size={20} />
              {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
            </motion.div>
          </div>
        </motion.div>

                <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl" />
          
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
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
                <span className="ml-2 font-semibold">
                  {isPlaying ? 'Pause' : 'Play'}
                </span>
              </Button>

              <Button
                onClick={resetVisualization}
                className="relative group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 rounded-xl shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-purple-500/80 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                <RotateCcw className="w-6 h-6" />
                <span className="ml-2 font-semibold">Reset</span>
              </Button>

              <Button
                onClick={() => generateSortingSteps(selectedAlgorithm)}
                disabled={array.length === 0 || isPlaying}
                className="relative group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-6 rounded-xl shadow-lg shadow-green-500/50 transition-all duration-300 hover:shadow-green-500/80 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                <Zap className="w-6 h-6" />
                <span className="ml-2 font-semibold">Generate</span>
              </Button>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Speed Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-cyan-400 font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Speed
                  </label>
                  <span className="text-cyan-300 font-mono text-sm bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/30">
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
                    disabled={isPlaying}
                    className="cursor-pointer"
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
                    <BarChart3 className="w-4 h-4" />
                    Array Size
                  </label>
                  <span className="text-purple-300 font-mono text-sm bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/30">
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
                    disabled={isPlaying}
                    className="cursor-pointer"
                  />
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                    <span>5</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            {steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-4 border-t border-cyan-500/20"
              >
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-cyan-400 font-mono">
                    {currentStep} / {steps.length}
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}
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

          {/* Visualization bars */}
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

                let barColor = NEON_COLORS[index % NEON_COLORS.length];
                let glowColor = barColor;
                
                if (isSorted) {
                  barColor = '#00ff00';
                  glowColor = '#00ff00';
                } else if (isSwapping) {
                  barColor = '#ff0066';
                  glowColor = '#ff0066';
                } else if (isComparing) {
                  barColor = '#ffff00';
                  glowColor = '#ffff00';
                }

                return (
                  <motion.div
                    key={element.id}
                    className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: `${heightPercentage}%`,
                      opacity: 1,
                      backgroundColor: barColor,
                      boxShadow: [
                        `0 0 10px ${glowColor}`,
                        `0 0 20px ${glowColor}`,
                        `0 0 10px ${glowColor}`
                      ]
                    }}
                    transition={{
                      height: { duration: 0.3, ease: "easeOut" },
                      backgroundColor: { duration: 0.2 },
                      boxShadow: { duration: 0.5, repeat: isComparing || isSwapping ? Infinity : 0 }
                    }}
                    style={{
                      backgroundColor: barColor,
                      boxShadow: `0 0 15px ${glowColor}, 0 0 30px ${glowColor}40`
                    }}
                  >
                    {/* Trail effect for swapping */}
                    {isSwapping && (
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: [0.8, 0],
                          scale: [1, 1.2]
                        }}
                        transition={{ 
                          duration: 0.6,
                          repeat: Infinity
                        }}
                        style={{
                          backgroundColor: barColor,
                          filter: 'blur(8px)'
                        }}
                      />
                    )}

                    {/* Value label */}
                    {array.length <= 30 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-white/80">
                        {element.value}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div></parameter>

        

      </div>
    </div>
  );
}