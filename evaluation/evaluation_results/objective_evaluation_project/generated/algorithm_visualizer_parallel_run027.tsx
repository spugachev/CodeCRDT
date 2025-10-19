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

  // Effect to handle step-by-step animation
  useCallback(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1 && isPlaying) {
        setIsPlaying(false);
      }
      return;
    }

    const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
    const timer = setTimeout(() => {
      const step = steps[currentStep + 1];
      setArray(step.array);
      setCurrentStep(currentStep + 1);
      
      // Update statistics
      if (step.comparingIndices.length > 0) {
        setComparisons(prev => prev + 1);
      }
      if (step.swappingIndices.length > 0) {
        setSwaps(prev => prev + 1);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, speed])();

  // Cleanup effect
  useCallback(() => {
    if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length])();

  }, [</parameter>
</invoke> currentStep, steps, speed]);

  const generateSteps = useCallback((algorithm: AlgorithmType) => {
    if (array.length === 0) return;

    const newSteps: AlgorithmStep[] = [];
    const arr = [...array];
    let comparisonCount = 0;
    let swapCount = 0;

    const recordStep = (
      currentArray: ArrayElement[],
      comparing: number[] = [],
      swapping: number[] = [],
      sorted: number[] = []
    ) => {
      newSteps.push({
        array: currentArray.map((el, idx) => ({
          ...el,
          isComparing: comparing.includes(idx),
          isSwapping: swapping.includes(idx),
          isSorted: sorted.includes(idx)
        })),
        comparingIndices: comparing,
        swappingIndices: swapping,
        sortedIndices: sorted
      });
    };

    const swap = (arr: ArrayElement[], i: number, j: number, sortedIndices: number[] = []) => {
      comparisonCount++;
      recordStep([...arr], [i, j], [], sortedIndices);
      
      swapCount++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      recordStep([...arr], [], [i, j], sortedIndices);
    };

    const compare = (arr: ArrayElement[], i: number, j: number, sortedIndices: number[] = []) => {
      comparisonCount++;
      recordStep([...arr], [i, j], [], sortedIndices);
    };

    switch (algorithm) {
      case 'bubble': {
        const n = arr.length;
        const sortedIndices: number[] = [];
        
        for (let i = 0; i < n - 1; i++) {
          let swapped = false;
          for (let j = 0; j < n - i - 1; j++) {
            compare(arr, j, j + 1, sortedIndices);
            
            if (arr[j].value > arr[j + 1].value) {
              swap(arr, j, j + 1, sortedIndices);
              swapped = true;
            }
          }
          sortedIndices.push(n - i - 1);
          recordStep([...arr], [], [], sortedIndices);
          
          if (!swapped) break;
        }
        
        for (let i = 0; i < n; i++) {
          if (!sortedIndices.includes(i)) sortedIndices.push(i);
        }
        recordStep([...arr], [], [], sortedIndices);
        break;
      }

      case 'quick': {
        const sortedIndices: number[] = [];
        
        const partition = (low: number, high: number): number => {
          const pivot = arr[high].value;
          let i = low - 1;

          for (let j = low; j < high; j++) {
            compare(arr, j, high, sortedIndices);
            
            if (arr[j].value < pivot) {
              i++;
              if (i !== j) {
                swap(arr, i, j, sortedIndices);
              }
            }
          }
          
          if (i + 1 !== high) {
            swap(arr, i + 1, high, sortedIndices);
          }
          return i + 1;
        };

        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            sortedIndices.push(pi);
            recordStep([...arr], [], [], sortedIndices);
            
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
          } else if (low === high) {
            sortedIndices.push(low);
            recordStep([...arr], [], [], sortedIndices);
          }
        };

        quickSort(0, arr.length - 1);
        
        for (let i = 0; i < arr.length; i++) {
          if (!sortedIndices.includes(i)) sortedIndices.push(i);
        }
        recordStep([...arr], [], [], sortedIndices);
        break;
      }

      case 'merge': {
        const sortedIndices: number[] = [];
        
        const merge = (left: number, mid: number, right: number) => {
          const leftArr = arr.slice(left, mid + 1);
          const rightArr = arr.slice(mid + 1, right + 1);
          
          let i = 0, j = 0, k = left;
          
          while (i < leftArr.length && j < rightArr.length) {
            compare(arr, left + i, mid + 1 + j, sortedIndices);
            
            if (leftArr[i].value <= rightArr[j].value) {
              arr[k] = leftArr[i];
              i++;
            } else {
              arr[k] = rightArr[j];
              j++;
            }
            recordStep([...arr], [], [k], sortedIndices);
            k++;
          }
          
          while (i < leftArr.length) {
            arr[k] = leftArr[i];
            recordStep([...arr], [], [k], sortedIndices);
            i++;
            k++;
          }
          
          while (j < rightArr.length) {
            arr[k] = rightArr[j];
            recordStep([...arr], [], [k], sortedIndices);
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
              for (let i = 0; i < arr.length; i++) {
                sortedIndices.push(i);
              }
              recordStep([...arr], [], [], sortedIndices);
            }
          }
        };

        mergeSort(0, arr.length - 1);
        break;
      }

      case 'insertion': {
        const sortedIndices: number[] = [0];
        recordStep([...arr], [], [], sortedIndices);
        
        for (let i = 1; i < arr.length; i++) {
          const key = arr[i];
          let j = i - 1;
          
          compare(arr, i, j, sortedIndices);
          
          while (j >= 0 && arr[j].value > key.value) {
            comparisonCount++;
            arr[j + 1] = arr[j];
            recordStep([...arr], [j, j + 1], [], sortedIndices);
            j--;
            
            if (j >= 0) {
              compare(arr, j, i, sortedIndices);
            }
          }
          
          arr[j + 1] = key;
          recordStep([...arr], [], [j + 1], sortedIndices);
          sortedIndices.push(i);
          recordStep([...arr], [], [], sortedIndices);
        }
        break;
      }
    }

    setSteps(newSteps);
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
                    <span className="text-xs opacity-80">{algo.complexity}</span>
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
            className="relative bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6 overflow-hidden group hover:border-cyan-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">Comparisons</span>
              </div>
              <motion.div
                key={comparisons}
                initial={{ scale: 1.2, color: '#00ffff' }}
                animate={{ scale: 1, color: '#ffffff' }}
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
            transition={{ delay: 0.1 }}
            className="relative bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 overflow-hidden group hover:border-purple-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 text-sm font-medium uppercase tracking-wider">Swaps</span>
              </div>
              <motion.div
                key={swaps}
                initial={{ scale: 1.2, color: '#ff00ff' }}
                animate={{ scale: 1, color: '#ffffff' }}
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
            transition={{ delay: 0.2 }}
            className="relative bg-gray-900/50 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 overflow-hidden group hover:border-green-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm font-medium uppercase tracking-wider">Complexity</span>
              </div>
              <div className="text-4xl font-bold text-white">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-green-500/20 rounded-full blur-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-gray-900/50 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-6 overflow-hidden group hover:border-yellow-500/60 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium uppercase tracking-wider">Array Size</span>
              </div>
              <div className="text-4xl font-bold text-white">
                {array.length}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl" />
          </motion.div>
        </div>

        <div className="relative">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 shadow-2xl">
            <div className="flex items-end justify-center gap-1 h-96 relative">
              {array.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
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
                  
                  const barColor = isSorted 
                    ? '#00ff00' 
                    : isSwapping 
                    ? '#ff0066' 
                    : isComparing 
                    ? '#ffff00' 
                    : element.value ? NEON_COLORS[element.value % NEON_COLORS.length] : '#00ffff';

                  return (
                    <motion.div
                      key={element.id}
                      className="relative flex-1 min-w-0"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        y: isSwapping ? [-10, 0] : 0
                      }}
                      transition={{ 
                        duration: 0.3,
                        y: { duration: 0.2, repeat: isSwapping ? 1 : 0, repeatType: "reverse" }
                      }}
                    >
                      <motion.div
                        className="w-full rounded-t-lg relative"
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `0 0 20px ${barColor}, 0 0 40px ${barColor}40`,
                        }}
                        animate={{
                          height: `${(element.value / 100) * 100}%`,
                          boxShadow: isComparing || isSwapping
                            ? `0 0 30px ${barColor}, 0 0 60px ${barColor}, 0 0 90px ${barColor}80`
                            : `0 0 20px ${barColor}, 0 0 40px ${barColor}40`,
                        }}
                        transition={{
                          height: { duration: 0.5, ease: "easeInOut" },
                          boxShadow: { duration: 0.3 }
                        }}
                      >
                        {/* Trail effect for swapping */}
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              backgroundColor: barColor,
                              opacity: 0.5,
                            }}
                            animate={{
                              opacity: [0.5, 0],
                              scale: [1, 1.2],
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                            }}
                          />
                        )}
                        
                        {/* Glow pulse for comparing */}
                        {isComparing && (
                          <motion.div
                            className="absolute -inset-1 rounded-t-lg"
                            style={{
                              background: `radial-gradient(circle, ${barColor}80 0%, transparent 70%)`,
                            }}
                            animate={{
                              opacity: [0.8, 0.3, 0.8],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                            }}
                          />
                        )}
                      </motion.div>
                      
                      {/* Value label */}
                      {array.length <= 30 && (
                        <motion.div
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono"
                          style={{ color: barColor }}
                          animate={{
                            scale: isComparing || isSwapping ? 1.2 : 1,
                            fontWeight: isComparing || isSwapping ? 700 : 400,
                          }}
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
            {/* Playback Controls */}
            <div className="space-y-4">
              <h3 className="text-cyan-400 font-semibold text-lg flex items-center gap-2">
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
              <h3 className="text-cyan-400 font-semibold text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Animation Speed
                </span>
                <span className="text-sm text-cyan-300">{speed[0]}%</span>
              </h3>
              <div className="relative">
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={10}
                  max={100}
                  step={10}
                  className="cursor-pointer"
                  disabled={isPlaying}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>

            {/* Array Size Control */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-cyan-400 font-semibold text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Array Size
                </span>
                <span className="text-sm text-cyan-300">{arraySize[0]} elements</span>
              </h3>
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
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>5</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
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
              <div className="flex items-center justify-between mb-3">
                <BarChart3 
                  className={`w-6 h-6 ${
                    selectedAlgorithm === algo.id ? 'text-cyan-400' : 'text-gray-400'
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
              <h3 className={`text-lg font-bold mb-2 ${
                selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-white'
              }`}>
                {algo.name}
              </h3>
              <p className={`text-sm font-mono ${
                selectedAlgorithm === algo.id ? 'text-purple-300' : 'text-gray-400'
              }`}>
                {algo.complexity}
              </p>
              {selectedAlgorithm === algo.id && (
                <motion.div
                  layoutId="selectedGlow"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 pointer-events-none"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-2xl"
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
              <div className="w-8 h-8 rounded-lg bg-pink-500/20 border-2 border-pink-400 shadow-[0_0_15px_rgba(255,0,102,0.5)]" />
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