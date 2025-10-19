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

if (!steps.length) return;
    
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [isPlaying, steps.length]);
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
      
      if (step.swappingIndices.length > 0) {
        setSwaps(prev => prev + 1);
      }
      if (step.comparingIndices.length > 0) {
        setComparisons(prev => prev + 1);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, speed]); currentStep, steps, speed]);

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
        
        compare(i, j, sortedIndices);
        
        while (j >= 0 && arr[j].value > key.value) {
          arr[j + 1] = arr[j];
          recordStep([j], [j + 1], sortedIndices);
          swapCount++;
          j--;
          if (j >= 0) {
            compare(j, i, sortedIndices);
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
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:border-cyan-500'
                  }`}
                >
                  <span className="relative z-10 flex flex-col items-center">
                    <span className="font-semibold">{algo.name}</span>
                    <span className="text-xs opacity-75">{algo.complexity}</span>
                  </span>
                  {selectedAlgorithm === algo.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-20"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
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
            className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400 text-sm font-medium">Comparisons</span>
              </div>
              <motion.div
                key={comparisons}
                initial={{ scale: 1.2, color: '#00ffff' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-3xl font-bold"
              >
                {comparisons}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-lg p-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm font-medium">Swaps</span>
              </div>
              <motion.div
                key={swaps}
                initial={{ scale: 1.2, color: '#ff00ff' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-3xl font-bold"
              >
                {swaps}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-green-500/30 rounded-lg p-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm font-medium">Time Complexity</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-yellow-500/30 rounded-lg p-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400 text-sm font-medium">Array Size</span>
              </div>
              <div className="text-3xl font-bold">
                {array.length}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
            <div className="flex items-end justify-center gap-2 h-96">
              {array.length === 0 ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center space-y-4">
                    <BarChart3 className="w-16 h-16 mx-auto text-purple-400/50" />
                    <p className="text-purple-300/70 text-lg">Generate an array to start visualizing</p>
                  </div>
                </div>
              ) : (
                array.map((element, index) => {
                  const isComparing = steps[currentStep]?.comparingIndices.includes(index);
                  const isSwapping = steps[currentStep]?.swappingIndices.includes(index);
                  const isSorted = steps[currentStep]?.sortedIndices.includes(index);
                  
                  return (
                    <motion.div
                      key={element.id}
                      className="relative flex-1 min-w-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: isSwapping ? 1.1 : 1,
                      }}
                      transition={{ 
                        duration: 0.3,
                        scale: { duration: 0.2 }
                      }}
                    >
                      <motion.div
                        className="w-full rounded-t-lg relative overflow-visible"
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
                        animate={{
                          height: `${(element.value / 100) * 100}%`,
                        }}
                        transition={{
                          height: { duration: 0.5, ease: 'easeInOut' },
                        }}
                      >
                        {/* Trail effect for swapping */}
                        {isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              style={{
                                backgroundColor: '#ff0066',
                                opacity: 0.6,
                              }}
                              animate={{
                                opacity: [0.6, 0, 0.6],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                              }}
                            />
                            <motion.div
                              className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                              animate={{
                                y: [-10, -20, -10],
                                opacity: [1, 0.5, 1],
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity,
                              }}
                            >
                              <Zap className="w-4 h-4 text-yellow-300" />
                            </motion.div>
                          </>
                        )}
                        
                        {/* Comparison pulse effect */}
                        {isComparing && !isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg border-2 border-yellow-300"
                            animate={{
                              opacity: [1, 0.3, 1],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                            }}
                          />
                        )}
                        
                        {/* Value label */}
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-purple-200/80 font-mono">
                          {element.value}
                        </div>
                      </motion.div>
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
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Play/Pause and Reset Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handlePlayPause}
                disabled={steps.length === 0}
                className="relative group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-6 py-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {isPlaying ? 'Pause' : 'Play'}
                  </span>
                </motion.div>
                <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-xl group-hover:bg-cyan-400/40 transition-all duration-300" />
              </Button>

              <Button
                onClick={resetVisualization}
                className="relative group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-6 py-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span className="font-semibold">Reset</span>
                </motion.div>
                <div className="absolute inset-0 rounded-xl bg-purple-400/20 blur-xl group-hover:bg-purple-400/40 transition-all duration-300" />
              </Button>
            </div>

            {/* Speed Control */}
            <div className="flex-1 w-full lg:w-auto min-w-[200px]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold text-sm whitespace-nowrap">Speed</span>
                </div>
                <div className="flex-1 relative">
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={100}
                    step={10}
                    className="cursor-pointer"
                  />
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
                    <span>Slow</span>
                    <span className="text-cyan-400 font-semibold">{speed[0]}%</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Array Size Control */}
            <div className="flex-1 w-full lg:w-auto min-w-[200px]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-semibold text-sm whitespace-nowrap">Size</span>
                </div>
                <div className="flex-1 relative">
                  <Slider
                    value={arraySize}
                    onValueChange={(value) => {
                      setArraySize(value);
                      setSteps([]);
                      setCurrentStep(0);
                      setIsPlaying(false);
                    }}
                    min={5}
                    max={50}
                    step={5}
                    disabled={isPlaying}
                    className="cursor-pointer"
                  />
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-400">
                    <span>5</span>
                    <span className="text-purple-400 font-semibold">{arraySize[0]}</span>
                    <span>50</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockAlgorithms.map((algo) => (
            <motion.div
              key={algo.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedAlgorithm(algo.id as AlgorithmType);
                setCurrentStep(0);
                setSteps([]);
                setComparisons(0);
                setSwaps(0);
                setIsPlaying(false);
              }}
              className={`relative cursor-pointer rounded-xl p-6 transition-all duration-300 ${
                selectedAlgorithm === algo.id
                  ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.5)]'
                  : 'bg-gray-800/50 border-2 border-gray-700 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-lg ${
                  selectedAlgorithm === algo.id
                    ? 'bg-cyan-500/20'
                    : 'bg-purple-500/10'
                }`}>
                  <BarChart3 className={`w-6 h-6 ${
                    selectedAlgorithm === algo.id
                      ? 'text-cyan-400'
                      : 'text-purple-400'
                  }`} />
                </div>
                <div className="text-center">
                  <h3 className={`font-bold text-lg ${
                    selectedAlgorithm === algo.id
                      ? 'text-cyan-300'
                      : 'text-white'
                  }`}>
                    {algo.name}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    selectedAlgorithm === algo.id
                      ? 'text-cyan-400/80'
                      : 'text-gray-400'
                  }`}>
                    {algo.complexity}
                  </p>
                </div>
              </div>
              {selectedAlgorithm === algo.id && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
              <div>
                <p className="text-sm font-medium text-white">Comparing</p>
                <p className="text-xs text-gray-400">Active comparison</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border-2 border-yellow-400 shadow-[0_0_15px_rgba(255,255,0,0.5)]" />
              <div>
                <p className="text-sm font-medium text-white">Swapping</p>
                <p className="text-xs text-gray-400">Elements swapping</p>
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