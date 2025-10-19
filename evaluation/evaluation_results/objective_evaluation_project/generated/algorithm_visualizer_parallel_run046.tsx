import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

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

    if (!steps.length) {
      // Generate steps if not already generated
      generateSteps(selectedAlgorithm);
      return;
    }

    setIsPlaying(!isPlaying);
  }, [isPlaying, steps, selectedAlgorithm]);

  // Effect to handle step-by-step animation
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) {
      if (currentStep >= steps.length && steps.length > 0) {
        setIsPlaying(false);
      }
      return;
    }

    const delay = 1000 - speed[0] * 9.5; // Convert speed slider to delay (50ms - 1000ms)
    const timer = setTimeout(() => {
      const step = steps[currentStep];
      setArray(step.array);
      setCurrentStep(prev => prev + 1);
      
      // Update statistics
      if (step.comparingIndices.length > 0) {
        setComparisons(prev => prev + 1);
      }
      if (step.swappingIndices.length > 0) {
        setSwaps(prev => prev + 1);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, speed]);

  const generateSteps = useCallback((algorithm: AlgorithmType) => {
</parameter> currentStep, steps, speed]);

  const generateSteps = useCallback((algorithm: AlgorithmType) => {
    const allSteps: AlgorithmStep[] = [];
    let comparisonCount = 0;
    let swapCount = 0;
    const arr = [...array];

    const recordStep = (comparingIndices: number[] = [], swappingIndices: number[] = [], sortedIndices: number[] = []) => {
      allSteps.push({
        array: arr.map((el, idx) => ({
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
      recordStep([i, j], [], sortedIndices);
      comparisonCount++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      recordStep([], [i, j], sortedIndices);
      swapCount++;
    };

    const compare = (i: number, j: number, sortedIndices: number[] = []) => {
      recordStep([i, j], [], sortedIndices);
      comparisonCount++;
    };

    if (algorithm === 'bubble') {
      const sortedIndices: number[] = [];
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          compare(j, j + 1, sortedIndices);
          if (arr[j].value > arr[j + 1].value) {
            swap(j, j + 1, sortedIndices);
          }
        }
        sortedIndices.push(arr.length - i - 1);
        recordStep([], [], sortedIndices);
      }
    } else if (algorithm === 'quick') {
      const sortedIndices: number[] = [];
      
      const partition = (low: number, high: number): number => {
        const pivot = arr[high].value;
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
          compare(j, high, sortedIndices);
          if (arr[j].value < pivot) {
            i++;
            if (i !== j) {
              swap(i, j, sortedIndices);
            }
          }
        }
        if (i + 1 !== high) {
          swap(i + 1, high, sortedIndices);
        }
        sortedIndices.push(i + 1);
        return i + 1;
      };

      const quickSortHelper = (low: number, high: number) => {
        if (low < high) {
          const pi = partition(low, high);
          quickSortHelper(low, pi - 1);
          quickSortHelper(pi + 1, high);
        } else if (low === high) {
          sortedIndices.push(low);
        }
      };

      quickSortHelper(0, arr.length - 1);
      recordStep([], [], sortedIndices);
    } else if (algorithm === 'merge') {
      const sortedIndices: number[] = [];
      
      const merge = (left: number, mid: number, right: number) => {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;

        while (i < leftArr.length && j < rightArr.length) {
          compare(left + i, mid + 1 + j, sortedIndices);
          if (leftArr[i].value <= rightArr[j].value) {
            arr[k] = leftArr[i];
            i++;
          } else {
            arr[k] = rightArr[j];
            j++;
          }
          recordStep([], [k], sortedIndices);
          k++;
        }

        while (i < leftArr.length) {
          arr[k] = leftArr[i];
          recordStep([], [k], sortedIndices);
          i++;
          k++;
        }

        while (j < rightArr.length) {
          arr[k] = rightArr[j];
          recordStep([], [k], sortedIndices);
          j++;
          k++;
        }
      };

      const mergeSortHelper = (left: number, right: number) => {
        if (left < right) {
          const mid = Math.floor((left + right) / 2);
          mergeSortHelper(left, mid);
          mergeSortHelper(mid + 1, right);
          merge(left, mid, right);
        }
      };

      mergeSortHelper(0, arr.length - 1);
      for (let i = 0; i < arr.length; i++) {
        sortedIndices.push(i);
      }
      recordStep([], [], sortedIndices);
    } else if (algorithm === 'insertion') {
      const sortedIndices: number[] = [0];
      recordStep([], [], sortedIndices);
      
      for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        
        while (j >= 0) {
          compare(j, i, sortedIndices);
          if (arr[j].value > key.value) {
            arr[j + 1] = arr[j];
            recordStep([], [j + 1], sortedIndices);
            j--;
          } else {
            break;
          }
        }
        arr[j + 1] = key;
        recordStep([], [j + 1], sortedIndices);
        sortedIndices.push(i);
        recordStep([], [], sortedIndices);
      }
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

          <div className="flex flex-wrap justify-center gap-4">
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
                  <span className="relative z-10 flex flex-col items-start">
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
        </motion.div></parameter>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 overflow-hidden group hover:border-cyan-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium">Comparisons</span>
              </div>
              <motion.div
                key={comparisons}
                initial={{ scale: 1.2, color: '#00ffff' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-3xl font-bold text-white"
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
            className="relative bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 overflow-hidden group hover:border-purple-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium">Swaps</span>
              </div>
              <motion.div
                key={swaps}
                initial={{ scale: 1.2, color: '#ff00ff' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-3xl font-bold text-white"
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
            className="relative bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6 overflow-hidden group hover:border-green-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Algorithm</span>
              </div>
              <div className="text-xl font-bold text-white">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name || 'None'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-green-500/20 rounded-full blur-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-gray-900/50 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6 overflow-hidden group hover:border-yellow-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">Complexity</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity || 'N/A'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl" />
          </motion.div>
        </div>

        <div className="relative">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 min-h-[500px] relative overflow-hidden">
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
            </div>

            {/* Visualization area */}
            <div className="relative h-[400px] flex items-end justify-center gap-1 px-4">
              {array.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <BarChart3 className="w-16 h-16 mx-auto text-cyan-400" />
                    <p className="text-cyan-400 text-lg font-semibold">
                      Generate an array to start visualizing
                    </p>
                  </motion.div>
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
                      className="relative flex-1 min-w-[4px] max-w-[60px]"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: `${heightPercentage}%`,
                        opacity: 1,
                        scale: isSwapping ? 1.1 : isComparing ? 1.05 : 1,
                      }}
                      transition={{
                        height: { duration: 0.3, ease: "easeOut" },
                        scale: { duration: 0.2 },
                        opacity: { duration: 0.3 }
                      }}
                      style={{
                        backgroundColor: barColor,
                        boxShadow: `0 0 ${isSwapping ? '30px' : isComparing ? '20px' : '10px'} ${glowColor}`,
                      }}
                    >
                      {/* Trail effect for swapping */}
                      {isSwapping && (
                        <motion.div
                          className="absolute inset-0"
                          initial={{ opacity: 0.8, scale: 1 }}
                          animate={{ opacity: 0, scale: 1.5 }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          style={{
                            backgroundColor: barColor,
                            filter: 'blur(8px)',
                          }}
                        />
                      )}

                      {/* Pulse effect for comparing */}
                      {isComparing && (
                        <motion.div
                          className="absolute inset-0"
                          animate={{ opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          style={{
                            backgroundColor: glowColor,
                            filter: 'blur(6px)',
                          }}
                        />
                      )}

                      {/* Value label */}
                      {array.length <= 30 && (
                        <motion.div
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-cyan-300"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.7 }}
                        >
                          {element.value}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

                <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Play/Pause and Reset Controls */}
            <div className="space-y-4">
              <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-3">
                Controls
              </h3>
              <div className="flex gap-3">
                <Button
                  onClick={handlePlayPause}
                  disabled={steps.length === 0}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-5 w-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Play
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetVisualization}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-6 px-6 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
                  <Zap className="inline h-4 w-4 mr-1" />
                  Speed
                </h3>
                <span className="text-cyan-300 font-mono text-sm">
                  {speed[0]}ms
                </span>
              </div>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={10}
                max={200}
                step={10}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>

            {/* Array Size Control */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
                  <BarChart3 className="inline h-4 w-4 mr-1" />
                  Array Size
                </h3>
                <span className="text-cyan-300 font-mono text-sm">
                  {arraySize[0]} elements
                </span>
              </div>
              <Slider
                value={arraySize}
                onValueChange={setArraySize}
                min={5}
                max={100}
                step={5}
                disabled={isPlaying}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>5</span>
                <span>100</span>
              </div>
            </div>
          </div>
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
                  ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)]'
                  : 'bg-white/5 border-2 border-white/10 hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              }`}
            >
              {selectedAlgorithm === algo.id && (
                <motion.div
                  layoutId="selectedGlow"
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <BarChart3 
                    className={`w-8 h-8 ${
                      selectedAlgorithm === algo.id ? 'text-cyan-400' : 'text-purple-400'
                    }`} 
                  />
                  {selectedAlgorithm === algo.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                    />
                  )}
                </div>
                <h3 className={`text-lg font-bold ${
                  selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-white'
                }`}>
                  {algo.name}
                </h3>
                <p className={`text-sm font-mono ${
                  selectedAlgorithm === algo.id ? 'text-cyan-400' : 'text-purple-300'
                }`}>
                  {algo.complexity}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
              <div>
                <div className="text-sm font-medium text-white">Comparing</div>
                <div className="text-xs text-gray-400">Active comparison</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              <div>
                <div className="text-sm font-medium text-white">Swapping</div>
                <div className="text-xs text-gray-400">Elements swapping</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 border-2 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
              <div>
                <div className="text-sm font-medium text-white">Sorted</div>
                <div className="text-xs text-gray-400">In final position</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-700/50 border-2 border-gray-500" />
              <div>
                <div className="text-sm font-medium text-white">Unsorted</div>
                <div className="text-xs text-gray-400">Awaiting sort</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}