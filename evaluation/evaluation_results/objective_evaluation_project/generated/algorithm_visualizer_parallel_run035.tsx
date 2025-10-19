import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Zap, BarChart3 } from 'lucide-react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
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
    const newArray: ArrayElement[] = Array.from({ length: arraySize[0] }, (_, i) => ({
      value: Math.floor(Math.random() * 100) + 1,
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

  // Animation control with useEffect
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) {
      if (currentStep >= steps.length && steps.length > 0) {
        setIsPlaying(false);
      }
      return;
    }

    const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed]);

  // Update array visualization based on current step
  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      setArray(step.array.map((el, idx) => ({
        ...el,
        isComparing: step.comparingIndices.includes(idx),
        isSwapping: step.swappingIndices.includes(idx),
        isSorted: step.sortedIndices.includes(idx)
      })));
    }
  }, [currentStep, steps]);
  const startVisualization = useCallback(() => {
    if (steps.length === 0) return;
    if (currentStep >= steps.length) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {    setIsPlaying(false);
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
          sortedSet.add(i + 1);
          addStep(sortedArray, [], [], Array.from(sortedSet));
          
          return i + 1;
        };

        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
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
          
          if (right - left + 1 === sortedArray.length) {
            for (let idx = left; idx <= right; idx++) {
              sortedSet.add(idx);
            }
          }
          addStep(sortedArray, [], [], Array.from(sortedSet));
        };

        const mergeSort = (left: number, right: number) => {
          if (left < right) {
            const mid = Math.floor((left + right) / 2);
            mergeSort(left, mid);
            mergeSort(mid + 1, right);
            merge(left, mid, right);
          } else if (left === right && sortedArray.length === 1) {
            sortedSet.add(left);
            addStep(sortedArray, [], [], Array.from(sortedSet));
          }
        };

        mergeSort(0, sortedArray.length - 1);
        
        // Mark all as sorted at the end
        for (let i = 0; i < sortedArray.length; i++) {
          sortedSet.add(i);
        }
        addStep(sortedArray, [], [], Array.from(sortedSet));
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
          transition={{ duration: 0.6 }}
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
            Algorithm Visualizer
          </motion.h1>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {mockAlgorithms.map((algo) => (
              <motion.div
                key={algo.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={selectedAlgorithm === algo.id ? 'default' : 'outline'}
                  onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                  className={`relative group ${
                    selectedAlgorithm === algo.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 border-0 shadow-lg shadow-cyan-500/50'
                      : 'border-cyan-500/50 hover:border-cyan-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {algo.name}
                  </span>
                  {selectedAlgorithm === algo.id && (
                    <motion.div
                      layoutId="activeAlgorithm"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-md -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          {selectedAlgorithm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              <Badge
                variant="outline"
                className="text-lg px-6 py-2 border-2 border-purple-500/50 bg-purple-950/30 text-purple-300 shadow-lg shadow-purple-500/20"
              >
                <Zap className="w-4 h-4 mr-2 inline" />
                Complexity:{' '}
                <span className="font-mono font-bold ml-2 text-cyan-400">
                  {mockAlgorithms.find((a) => a.id === selectedAlgorithm)?.complexity}
                </span>
              </Badge>
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-2xl" />
          
          <div className="relative space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={isPlaying ? pauseVisualization : startVisualization}
                disabled={steps.length === 0}
                className="relative group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-6 rounded-xl shadow-lg shadow-cyan-500/50 transition-all duration-300 hover:shadow-cyan-500/80 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                <RotateCcw className="w-6 h-6" />
                <span className="ml-2 font-semibold">Reset</span>
              </Button>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Speed Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <label className="text-sm font-medium text-cyan-300">
                      Speed
                    </label>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
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
                  <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-gray-500">
                    <span>Fast</span>
                    <span>Slow</span>
                  </div>
                </div>
              </div>

              {/* Array Size Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <label className="text-sm font-medium text-purple-300">
                      Array Size
                    </label>
                  </div>
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30">
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
                  <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-gray-500">
                    <span>5</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            {steps.length > 0 && (
              <div className="pt-4 border-t border-cyan-500/20">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-cyan-400 font-mono">
                    {currentStep} / {steps.length}
                  </span>
                </div>
                <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(currentStep / steps.length) * 100}%` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-400/30 blur-sm" />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 overflow-hidden">
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
          <div className="relative flex items-end justify-center gap-1 h-96">
            {array.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-purple-300">
                <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">Generate an array to start visualizing</p>
              </div>
            ) : (
              array.map((element, index) => {
                const height = (element.value / Math.max(...array.map(e => e.value))) * 100;
                const isComparing = steps[currentStep]?.comparingIndices.includes(index);
                const isSwapping = steps[currentStep]?.swappingIndices.includes(index);
                const isSorted = steps[currentStep]?.sortedIndices.includes(index);

                return (
                  <motion.div
                    key={element.id}
                    className="relative flex-1 min-w-[4px] rounded-t-lg"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: `${height}%`,
                      opacity: 1,
                      backgroundColor: isSorted 
                        ? '#00ff00' 
                        : isSwapping 
                        ? '#ff0066' 
                        : isComparing 
                        ? '#ffff00' 
                        : NEON_COLORS[index % NEON_COLORS.length],
                      boxShadow: isSorted
                        ? '0 0 20px #00ff00, 0 0 40px #00ff00'
                        : isSwapping
                        ? '0 0 20px #ff0066, 0 0 40px #ff0066'
                        : isComparing
                        ? '0 0 20px #ffff00, 0 0 40px #ffff00'
                        : `0 0 10px ${NEON_COLORS[index % NEON_COLORS.length]}`,
                      scale: isSwapping ? 1.1 : isComparing ? 1.05 : 1
                    }}
                    transition={{
                      height: { duration: 0.3, ease: 'easeOut' },
                      backgroundColor: { duration: 0.2 },
                      boxShadow: { duration: 0.2 },
                      scale: { duration: 0.2, type: 'spring', stiffness: 300 }
                    }}
                    style={{
                      background: `linear-gradient(to top, ${NEON_COLORS[index % NEON_COLORS.length]}, ${NEON_COLORS[index % NEON_COLORS.length]}dd)`
                    }}
                  >
                    {/* Trail effect for swapping */}
                    {isSwapping && (
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        style={{
                          backgroundColor: '#ff0066',
                          filter: 'blur(8px)'
                        }}
                      />
                    )}

                    {/* Value label for larger arrays */}
                    {array.length <= 30 && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-purple-300 font-mono">
                        {element.value}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="bg-gray-900/50 backdrop-blur-xl border-cyan-500/30 p-6 relative overflow-hidden group hover:border-cyan-400/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Comparisons</h3>
              </div>
              <motion.p
                key={comparisons}
                initial={{ scale: 1.2, color: '#00ffff' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.3 }}
                className="text-4xl font-bold text-white mt-2"
              >
                {comparisons}
              </motion.p>
              <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((comparisons / (steps.length || 1)) * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-xl border-purple-500/30 p-6 relative overflow-hidden group hover:border-purple-400/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Swaps</h3>
              </div>
              <motion.p
                key={swaps}
                initial={{ scale: 1.2, color: '#ff00ff' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.3 }}
                className="text-4xl font-bold text-white mt-2"
              >
                {swaps}
              </motion.p>
              <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((swaps / (steps.length || 1)) * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-xl border-green-500/30 p-6 relative overflow-hidden group hover:border-green-400/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/20 border border-green-500/30">
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Current Step</h3>
              </div>
              <motion.p
                key={currentStep}
                initial={{ scale: 1.2, color: '#00ff00' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.3 }}
                className="text-4xl font-bold text-white mt-2"
              >
                {currentStep} / {steps.length}
              </motion.p>
              <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-green-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${steps.length > 0 ? (currentStep / steps.length) * 100 : 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}