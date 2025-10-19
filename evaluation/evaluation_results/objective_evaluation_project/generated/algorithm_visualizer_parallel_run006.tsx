import { useState, useCallback } from 'react';
import { useEffect } from 'react';
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
  const generateSteps = useCallback(() => {
    const newArray = [...array];
    const algorithmSteps: AlgorithmStep[] = [];
    let comparisonCount = 0;
    let swapCount = 0;

    const recordStep = (arr: ArrayElement[], comparing: number[] = [], swapping: number[] = [], sorted: number[] = []) => {
      algorithmSteps.push({
        array: arr.map(el => ({ ...el })),
        comparingIndices: [...comparing],
        swappingIndices: [...swapping],
        sortedIndices: [...sorted]
      });
    };

    if (selectedAlgorithm === 'bubble') {
      const arr = newArray.map(el => ({ ...el }));
      const n = arr.length;
      const sortedIndices: number[] = [];

      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          comparisonCount++;
          recordStep(arr, [j, j + 1], [], sortedIndices);

          if (arr[j].value > arr[j + 1].value) {
            swapCount++;
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            recordStep(arr, [], [j, j + 1], sortedIndices);
          }
        }
        sortedIndices.push(n - i - 1);
        recordStep(arr, [], [], sortedIndices);
      }
      sortedIndices.push(0);
      recordStep(arr, [], [], sortedIndices);
    }

    setSteps(algorithmSteps);
    setComparisons(comparisonCount);
    setSwaps(swapCount);
    setCurrentStep(0);
  }, [array, selectedAlgorithm]);

  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      if (currentStep >= steps.length - 1) {
        setIsPlaying(false);
        return;
      }

      const delay = 1000 - (speed[0] * 9.5);
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        const step = steps[currentStep + 1];
        if (step) {
          setArray(step.array.map((el, idx) => ({
            ...el,
            isComparing: step.comparingIndices.includes(idx),
            isSwapping: step.swappingIndices.includes(idx),
            isSorted: step.sortedIndices.includes(idx)
          })));
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, steps, speed]);
  }, [generateRandomArray]);

  const handlePlayPause = useCallback(() => {
    if (steps.length === 0) {
      // Generate steps for the selected algorithm
      generateSteps();
      return;
    }

    if (isPlaying) {
      // Pause the animation
      setIsPlaying(false);
    } else {
      // Start or resume the animation
      if (currentStep >= steps.length - 1) {
        // If at the end, restart from beginning
        setCurrentStep(0);
      }
      setIsPlaying(true);
    }

    /* TODO:PlayPauseLogic Toggle play/pause and handle step-by-step animation */
  }, [isPlaying, currentStep, steps, speed]);

  const generateSteps = useCallback((algorithm: AlgorithmType) => {
    const allSteps: AlgorithmStep[] = [];
    const arr = [...array];
    let comparisonCount = 0;
    let swapCount = 0;

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
      [arr[i], arr[j]] = [arr[j], arr[i]];
      swapCount++;
      recordStep([], [i, j], sortedIndices);
    };

    if (algorithm === 'bubble') {
      const sortedIndices: number[] = [];
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          comparisonCount++;
          recordStep([j, j + 1], [], sortedIndices);
          if (arr[j].value > arr[j + 1].value) {
            swap(j, j + 1, sortedIndices);
          }
        }
        sortedIndices.push(arr.length - i - 1);
      }
      sortedIndices.push(0);
      recordStep([], [], sortedIndices);
    } else if (algorithm === 'insertion') {
      const sortedIndices: number[] = [0];
      recordStep([], [], sortedIndices);
      for (let i = 1; i < arr.length; i++) {
        let j = i;
        while (j > 0) {
          comparisonCount++;
          recordStep([j - 1, j], [], sortedIndices);
          if (arr[j - 1].value > arr[j].value) {
            swap(j - 1, j, sortedIndices);
            j--;
          } else {
            break;
          }
        }
        sortedIndices.push(i);
      }
      recordStep([], [], sortedIndices);
    } else if (algorithm === 'quick') {
      const sortedIndices: number[] = [];
      
      const partition = (low: number, high: number): number => {
        const pivot = arr[high].value;
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
          comparisonCount++;
          recordStep([j, high], [], sortedIndices);
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

      const quickSort = (low: number, high: number) => {
        if (low < high) {
          const pi = partition(low, high);
          quickSort(low, pi - 1);
          quickSort(pi + 1, high);
        } else if (low === high) {
          sortedIndices.push(low);
        }
      };

      quickSort(0, arr.length - 1);
      recordStep([], [], sortedIndices);
    } else if (algorithm === 'merge') {
      const sortedIndices: number[] = [];
      
      const merge = (left: number, mid: number, right: number) => {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;

        while (i < leftArr.length && j < rightArr.length) {
          comparisonCount++;
          recordStep([left + i, mid + 1 + j], [], sortedIndices);
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

      const mergeSort = (left: number, right: number) => {
        if (left < right) {
          const mid = Math.floor((left + right) / 2);
          mergeSort(left, mid);
          mergeSort(mid + 1, right);
          merge(left, mid, right);
          
          if (left === 0 && right === arr.length - 1) {
            for (let i = left; i <= right; i++) {
              sortedIndices.push(i);
            }
          }
        } else if (left === right && left === 0 && right === arr.length - 1) {
          sortedIndices.push(left);
        }
      };

      mergeSort(0, arr.length - 1);
      recordStep([], [], sortedIndices);
    }

    setSteps(allSteps);
    setComparisons(comparisonCount);
    setSwaps(swapCount);
    setCurrentStep(0);
    setIsPlaying(false);
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
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20"
                      animate={{
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
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
            transition={{ duration: 0.5, delay: 0.1 }}
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
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
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
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
              <div className="text-2xl font-bold text-white">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity || 'N/A'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
          </motion.div>
        </div>

        <div className="relative">
          <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 min-h-[500px] overflow-hidden">
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
            </div>

            {/* Visualization area */}
            <div className="relative flex items-end justify-center gap-1 h-[400px] px-4">
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

                  return (
                    <motion.div
                      key={element.id}
                      layout
                      initial={{ opacity: 0, y: 50 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        height: `${heightPercentage}%`,
                        scale: isSwapping ? 1.1 : 1,
                      }}
                      transition={{
                        height: { duration: 0.3, ease: "easeOut" },
                        scale: { duration: 0.2 },
                        layout: { duration: 0.5, ease: "easeInOut" }
                      }}
                      className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                      style={{
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
                          ? '0 0 30px #ff0066, 0 0 60px #ff0066, 0 0 90px #ff0066'
                          : isComparing
                          ? '0 0 25px #ffff00, 0 0 50px #ffff00'
                          : `0 0 15px ${NEON_COLORS[index % NEON_COLORS.length]}, 0 0 30px ${NEON_COLORS[index % NEON_COLORS.length]}`,
                      }}
                    >
                      {/* Trail effect for swapping */}
                      {isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            backgroundColor: '#ff0066',
                            filter: 'blur(8px)',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                      )}

                      {/* Glow pulse for comparing */}
                      {isComparing && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            backgroundColor: '#ffff00',
                            filter: 'blur(10px)',
                          }}
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}

                      {/* Value label */}
                      {array.length <= 30 && (
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                          style={{
                            color: isSorted 
                              ? '#00ff00'
                              : isSwapping 
                              ? '#ff0066'
                              : isComparing 
                              ? '#ffff00'
                              : NEON_COLORS[index % NEON_COLORS.length],
                            textShadow: `0 0 10px currentColor`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {element.value}
                        </motion.div>
                      )}

                      {/* Sorted checkmark indicator */}
                      {isSorted && (
                        <motion.div
                          className="absolute top-2 left-1/2 transform -translate-x-1/2"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <div className="w-3 h-3 rounded-full bg-green-400 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Control panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative mt-8 space-y-6"
            >
              {/* Speed and size controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-cyan-400 font-semibold flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Speed: {speed[0]}ms
                    </label>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={500}
                    step={10}
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-purple-400 font-semibold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Array Size: {arraySize[0]}
                    </label>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={100}
                    step={5}
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={handlePlayPause}
                  disabled={array.length === 0 || (currentStep >= steps.length && steps.length > 0)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-6 py-6 rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                  style={{
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
                  }}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {currentStep > 0 && currentStep < steps.length ? 'Resume' : 'Start'}
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetVisualization}
                  disabled={isPlaying}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-6 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                  style={{
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
                  }}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>

                <Button
                  onClick={generateRandomArray}
                  disabled={isPlaying}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-6 py-6 rounded-xl shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                  style={{
                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
                  }}
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Generate Array
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

                <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Playback Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Playback Controls
              </h3>
              <div className="flex gap-3">
                <Button
                  onClick={handlePlayPause}
                  disabled={steps.length === 0}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetVisualization}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 px-6 rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Animation Speed
                </h3>
                <span className="text-purple-300 font-mono text-sm bg-purple-900/30 px-3 py-1 rounded-lg">
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
                disabled={isPlaying}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>

            {/* Array Size Control */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Array Size
                </h3>
                <span className="text-purple-300 font-mono text-sm bg-purple-900/30 px-3 py-1 rounded-lg">
                  {arraySize[0]} elements
                </span>
              </div>
              <Slider
                value={arraySize}
                onValueChange={setArraySize}
                min={5}
                max={100}
                step={5}
                className="cursor-pointer"
                disabled={isPlaying}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>5</span>
                <span>50</span>
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
              onClick={() => {
                setSelectedAlgorithm(algo.id as AlgorithmType);
                setIsPlaying(false);
                setCurrentStep(0);
                setSteps([]);
                setComparisons(0);
                setSwaps(0);
              }}
              className={`relative cursor-pointer rounded-xl p-6 transition-all duration-300 ${
                selectedAlgorithm === algo.id
                  ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.5)]'
                  : 'bg-gray-800/50 border-2 border-gray-700 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              }`}
            >
              {selectedAlgorithm === algo.id && (
                <motion.div
                  layoutId="selectedGlow"
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <BarChart3
                    className={`w-8 h-8 ${
                      selectedAlgorithm === algo.id
                        ? 'text-cyan-400'
                        : 'text-purple-400'
                    }`}
                  />
                  {selectedAlgorithm === algo.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                    />
                  )}
                </div>
                <h3
                  className={`text-xl font-bold ${
                    selectedAlgorithm === algo.id
                      ? 'text-cyan-300'
                      : 'text-white'
                  }`}
                >
                  {algo.name}
                </h3>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-mono ${
                    selectedAlgorithm === algo.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-400/50'
                  }`}
                >
                  {algo.complexity}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
              <div>
                <p className="text-sm font-medium text-white">Comparing</p>
                <p className="text-xs text-gray-400">Being compared</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 border-2 border-pink-400 shadow-[0_0_15px_rgba(255,0,102,0.5)]" />
              <div>
                <p className="text-sm font-medium text-white">Swapping</p>
                <p className="text-xs text-gray-400">Being swapped</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 border-2 border-green-400 shadow-[0_0_15px_rgba(0,255,0,0.5)]" />
              <div>
                <p className="text-sm font-medium text-white">Sorted</p>
                <p className="text-xs text-gray-400">In final position</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              <div>
                <p className="text-sm font-medium text-white">Unsorted</p>
                <p className="text-xs text-gray-400">Awaiting sort</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}