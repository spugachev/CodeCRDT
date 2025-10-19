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
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);

  const generateRandomArray = useCallback(() => {
    const newArray: ArrayElement[] = Array.from({ length: arraySize[0] }, (_, index) => ({
      value: Math.floor(Math.random() * 100) + 1,
      id: `element-${Date.now()}-${index}`,
      isComparing: false,
      isSwapping: false,
      isSorted: false
    }));
    
    setArray(newArray);
    setSteps([]);
    setCurrentStep(0);
    setComparisons(0);
    setSwaps(0);
    setIsPlaying(false);
  }, [arraySize]);

  const resetVisualization = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
    setComparisons(0);
    setSwaps(0);
    generateRandomArray();
  }, [generateRandomArray]);

  const handlePlayPause = useCallback(() => {
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) {
      if (currentStep >= steps.length && steps.length > 0) {
        setIsPlaying(false);
      }
      return;
    }

    const delay = 1000 - (speed[0] * 9.5);
    const timer = setTimeout(() => {
      const step = steps[currentStep];
      setArray(step.array);
      setCurrentStep(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, speed]);

if (steps.length === 0) return;
    
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isPlaying, steps.length currentStep, steps, speed]);

  const generateSteps = useCallback((algorithm: AlgorithmType) => {
    const allSteps: AlgorithmStep[] = [];
    let comparisonCount = 0;
    let swapCount = 0;
    const workingArray = [...array];

    const recordStep = (comparingIndices: number[] = [], swappingIndices: number[] = [], sortedIndices: number[] = []) => {
      allSteps.push({
        array: workingArray.map((el, idx) => ({
          ...el,
          isComparing: comparingIndices.includes(idx),
          isSwapping: swappingIndices.includes(idx),
          isSorted: sortedIndices.includes(idx)
        })),
        comparingIndices,
        swappingIndices,
        sortedIndices
      });
    };

    const swap = (i: number, j: number, sortedIndices: number[] = []) => {
      [workingArray[i], workingArray[j]] = [workingArray[j], workingArray[i]];
      swapCount++;
      recordStep([], [i, j], sortedIndices);
    };

    if (algorithm === 'bubble') {
      const sortedIndices: number[] = [];
      for (let i = 0; i < workingArray.length; i++) {
        for (let j = 0; j < workingArray.length - i - 1; j++) {
          comparisonCount++;
          recordStep([j, j + 1], [], sortedIndices);
          if (workingArray[j].value > workingArray[j + 1].value) {
            swap(j, j + 1, sortedIndices);
          }
        }
        sortedIndices.push(workingArray.length - i - 1);
      }
      recordStep([], [], Array.from({ length: workingArray.length }, (_, i) => i));
    } else if (algorithm === 'quick') {
      const sortedIndices: number[] = [];
      const quickSort = (low: number, high: number) => {
        if (low < high) {
          const pivotIndex = partition(low, high);
          sortedIndices.push(pivotIndex);
          quickSort(low, pivotIndex - 1);
          quickSort(pivotIndex + 1, high);
        } else if (low === high) {
          sortedIndices.push(low);
        }
      };

      const partition = (low: number, high: number): number => {
        const pivot = workingArray[high].value;
        let i = low - 1;
        for (let j = low; j < high; j++) {
          comparisonCount++;
          recordStep([j, high], [], sortedIndices);
          if (workingArray[j].value < pivot) {
            i++;
            if (i !== j) {
              swap(i, j, sortedIndices);
            }
          }
        }
        swap(i + 1, high, sortedIndices);
        return i + 1;
      };

      quickSort(0, workingArray.length - 1);
      recordStep([], [], Array.from({ length: workingArray.length }, (_, i) => i));
    } else if (algorithm === 'merge') {
      const sortedIndices: number[] = [];
      const mergeSort = (left: number, right: number) => {
        if (left < right) {
          const mid = Math.floor((left + right) / 2);
          mergeSort(left, mid);
          mergeSort(mid + 1, right);
          merge(left, mid, right);
        }
      };

      const merge = (left: number, mid: number, right: number) => {
        const leftArr = workingArray.slice(left, mid + 1);
        const rightArr = workingArray.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;

        while (i < leftArr.length && j < rightArr.length) {
          comparisonCount++;
          recordStep([left + i, mid + 1 + j], [], sortedIndices);
          if (leftArr[i].value <= rightArr[j].value) {
            workingArray[k] = leftArr[i];
            i++;
          } else {
            workingArray[k] = rightArr[j];
            j++;
          }
          swapCount++;
          recordStep([], [k], sortedIndices);
          k++;
        }

        while (i < leftArr.length) {
          workingArray[k] = leftArr[i];
          swapCount++;
          recordStep([], [k], sortedIndices);
          i++;
          k++;
        }

        while (j < rightArr.length) {
          workingArray[k] = rightArr[j];
          swapCount++;
          recordStep([], [k], sortedIndices);
          j++;
          k++;
        }
      };

      mergeSort(0, workingArray.length - 1);
      recordStep([], [], Array.from({ length: workingArray.length }, (_, i) => i));
    } else if (algorithm === 'insertion') {
      const sortedIndices: number[] = [0];
      for (let i = 1; i < workingArray.length; i++) {
        const key = workingArray[i];
        let j = i - 1;
        recordStep([i], [], sortedIndices);
        while (j >= 0 && workingArray[j].value > key.value) {
          comparisonCount++;
          recordStep([j, j + 1], [], sortedIndices);
          workingArray[j + 1] = workingArray[j];
          swapCount++;
          recordStep([], [j + 1], sortedIndices);
          j--;
        }
        if (j >= 0) comparisonCount++;
        workingArray[j + 1] = key;
        sortedIndices.push(i);
      }
      recordStep([], [], Array.from({ length: workingArray.length }, (_, i) => i));
    }

    setSteps(allSteps);
    setComparisons(comparisonCount);
    setSwaps(swapCount);
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
            Algorithm Visualizer
          </motion.h1>

          <div className="flex justify-center gap-4 flex-wrap">
            {mockAlgorithms.map((algo) => (
              <motion.div
                key={algo.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                  variant={selectedAlgorithm === algo.id ? 'default' : 'outline'}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    selectedAlgorithm === algo.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 shadow-lg shadow-cyan-500/50'
                      : 'bg-gray-800/50 border-cyan-500/30 text-cyan-300 hover:bg-gray-700/50 hover:border-cyan-400'
                  }`}
                >
                  <span className="relative z-10 flex flex-col items-center">
                    <span className="font-semibold">{algo.name}</span>
                    <span className="text-xs opacity-75">{algo.complexity}</span>
                  </span>
                  {selectedAlgorithm === algo.id && (
                    <motion.div
                      layoutId="algorithmSelector"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6 overflow-hidden group hover:border-cyan-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">Comparisons</span>
              </div>
              <motion.div
                key={comparisons}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold text-white"
              >
                {comparisons}
              </motion.div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 overflow-hidden group hover:border-purple-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">Swaps</span>
              </div>
              <motion.div
                key={swaps}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold text-white"
              >
                {swaps}
              </motion.div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-gray-900/50 backdrop-blur-xl border border-pink-500/30 rounded-xl p-6 overflow-hidden group hover:border-pink-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-pink-400 text-sm font-medium uppercase tracking-wider">Algorithm</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name || 'None'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-gray-900/50 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 overflow-hidden group hover:border-green-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-green-400 text-sm font-medium uppercase tracking-wider">Complexity</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity || 'N/A'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-green-500/20 rounded-full blur-2xl" />
          </motion.div>
        </div>

        <div className="relative">
          <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8 min-h-[500px] overflow-hidden">
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
            </div>

            {/* Visualization area */}
            <div className="relative flex items-end justify-center gap-1 h-[400px] px-4">
              {array.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-center space-y-4">
                    <BarChart3 className="w-20 h-20 mx-auto text-purple-400 animate-pulse" />
                    <p className="text-purple-300 text-lg font-semibold">
                      Generate an array to start visualizing
                    </p>
                  </div>
                </motion.div>
              ) : (
                array.map((element, index) => {
                  const height = (element.value / 100) * 100;
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
                      className="relative flex-1 min-w-[4px] max-w-[60px]"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: `${height}%`,
                        opacity: 1,
                        scale: isSwapping ? 1.1 : isComparing ? 1.05 : 1,
                      }}
                      transition={{
                        height: { duration: 0.3, ease: "easeOut" },
                        scale: { duration: 0.2 },
                        opacity: { duration: 0.5 }
                      }}
                      style={{
                        backgroundColor: barColor,
                        boxShadow: `
                          0 0 ${isSwapping ? '30px' : isComparing ? '20px' : '10px'} ${glowColor},
                          0 0 ${isSwapping ? '60px' : isComparing ? '40px' : '20px'} ${glowColor}80,
                          inset 0 0 ${isSwapping ? '20px' : '10px'} ${glowColor}40
                        `,
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                        overflow: 'visible'
                      }}
                    >
                      {/* Trail effect for swapping */}
                      {isSwapping && (
                        <>
                          <motion.div
                            className="absolute inset-0 rounded-t"
                            style={{ backgroundColor: barColor }}
                            initial={{ opacity: 0.8, scale: 1 }}
                            animate={{ 
                              opacity: 0,
                              scale: 1.3,
                              y: -20
                            }}
                            transition={{ 
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeOut"
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-t"
                            style={{ backgroundColor: barColor }}
                            initial={{ opacity: 0.6, scale: 1 }}
                            animate={{ 
                              opacity: 0,
                              scale: 1.5,
                              y: -40
                            }}
                            transition={{ 
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeOut",
                              delay: 0.1
                            }}
                          />
                        </>
                      )}

                      {/* Pulse effect for comparing */}
                      {isComparing && (
                        <motion.div
                          className="absolute inset-0 rounded-t"
                          style={{ 
                            backgroundColor: glowColor,
                            opacity: 0.3
                          }}
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{ 
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}

                      {/* Sparkle effect for sorted */}
                      {isSorted && (
                        <motion.div
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                          initial={{ scale: 0, rotate: 0 }}
                          animate={{ 
                            scale: [0, 1.5, 0],
                            rotate: [0, 180, 360],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 1,
                            ease: "easeOut"
                          }}
                        >
                          <Zap className="w-4 h-4 text-green-400" />
                        </motion.div>
                      )}

                      {/* Value label for larger arrays */}
                      {arraySize[0] <= 30 && (
                        <motion.div
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-purple-300"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.7 }}
                          transition={{ delay: 0.5 }}
                        >
                          {element.value}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Progress indicator */}
            {steps.length > 0 && (
              <motion.div
                className="mt-8 space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex justify-between text-sm text-purple-300 font-mono">
                  <span>Progress</span>
                  <span>{currentStep} / {steps.length}</span>
                </div>
                <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(currentStep / steps.length) * 100}%`
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)'
                    }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

                <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Playback Controls */}
            <div className="space-y-4">
              <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Playback Controls
              </h3>
              <div className="flex gap-3">
                <Button
                  onClick={handlePlayPause}
                  disabled={steps.length === 0}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold shadow-lg shadow-cyan-500/50 transition-all duration-300 hover:shadow-cyan-500/70 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetVisualization}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-purple-500/70 hover:scale-105"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-4">
              <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Animation Speed
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Slow</span>
                  <span className="text-cyan-400 font-semibold">{speed[0]}%</span>
                  <span>Fast</span>
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
            </div>

            {/* Array Size Control */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Array Size
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Small (10)</span>
                  <span className="text-cyan-400 font-semibold">{arraySize[0]} elements</span>
                  <span>Large (100)</span>
                </div>
                <Slider
                  value={arraySize}
                  onValueChange={setArraySize}
                  min={10}
                  max={100}
                  step={5}
                  disabled={isPlaying}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {steps.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progress</span>
                <span className="text-cyan-400 font-semibold">
                  {currentStep} / {steps.length} steps
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockAlgorithms.map((algo) => (
            <motion.div
              key={algo.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
              className={`relative cursor-pointer rounded-xl p-6 backdrop-blur-sm transition-all duration-300 ${
                selectedAlgorithm === algo.id
                  ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.5)]'
                  : 'bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]'
              }`}
            >
              {selectedAlgorithm === algo.id && (
                <motion.div
                  layoutId="selectedGlow"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className={`w-6 h-6 ${
                    selectedAlgorithm === algo.id ? 'text-cyan-400' : 'text-white/70'
                  }`} />
                  <h3 className={`font-bold text-lg ${
                    selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-white/90'
                  }`}>
                    {algo.name}
                  </h3>
                </div>
                <div className={`flex items-center gap-2 ${
                  selectedAlgorithm === algo.id ? 'text-purple-300' : 'text-white/60'
                }`}>
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-mono">{algo.complexity}</span>
                </div>
              </div>
              {selectedAlgorithm === algo.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50"
            >
              <div className="w-4 h-8 bg-cyan-500 rounded shadow-lg shadow-cyan-500/50" />
              <div>
                <div className="text-sm font-medium text-cyan-400">Comparing</div>
                <div className="text-xs text-gray-400">Active comparison</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50"
            >
              <div className="w-4 h-8 bg-yellow-500 rounded shadow-lg shadow-yellow-500/50" />
              <div>
                <div className="text-sm font-medium text-yellow-400">Swapping</div>
                <div className="text-xs text-gray-400">Elements swapping</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50"
            >
              <div className="w-4 h-8 bg-green-500 rounded shadow-lg shadow-green-500/50" />
              <div>
                <div className="text-sm font-medium text-green-400">Sorted</div>
                <div className="text-xs text-gray-400">In final position</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50"
            >
              <div className="w-4 h-8 bg-purple-500 rounded shadow-lg shadow-purple-500/50" />
              <div>
                <div className="text-sm font-medium text-purple-400">Unsorted</div>
                <div className="text-xs text-gray-400">Awaiting sort</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}