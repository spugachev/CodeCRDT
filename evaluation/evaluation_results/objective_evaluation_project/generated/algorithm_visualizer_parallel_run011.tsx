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
    if (steps.length === 0) {
      // Generate steps for the selected algorithm before playing
      generateSteps();
      return;
    }

    if (currentStep >= steps.length - 1 && isPlaying) {
      // Animation completed
      setIsPlaying(false);
      return;
    }

    setIsPlaying(!isPlaying);
  // Step-by-step animation effect
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    const delay = 1000 - speed[0] * 9; // Convert speed slider to delay (100-910ms)
    
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        const step = steps[nextStep];
        setArray(step.array);
        
        // Update statistics
        if (step.comparingIndices.length > 0) {
          setComparisons(prev => prev + 1);
        }
        if (step.swappingIndices.length > 0) {
          setSwaps(prev => prev + 1);
        }
      } else {
        // Animation completed
        setIsPlaying(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, speed]);

  // Generate steps for the selected algorithm
  const generateSteps = useCallback(() => {
    const newSteps: AlgorithmStep[] = [];
    const arr = [...array];
    let comparisonCount = 0;
    let swapCount = 0;

    // Initial state
    newSteps.push({
      array: arr.map(el => ({ ...el })),
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: []
    });

    // Mock bubble sort implementation for demonstration
    if (selectedAlgorithm === 'bubble') {
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          // Comparing step
          newSteps.push({
            array: arr.map((el, idx) => ({
              ...el,
              isComparing: idx === j || idx === j + 1
            })),
            comparingIndices: [j, j + 1],
            swappingIndices: [],
            sortedIndices: Array.from({ length: i }, (_, k) => arr.length - 1 - k)
          });

          if (arr[j].value > arr[j + 1].value) {
            // Swapping step
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            
            newSteps.push({
              array: arr.map((el, idx) => ({
                ...el,
                isSwapping: idx === j || idx === j + 1
              })),
              comparingIndices: [],
              swappingIndices: [j, j + 1],
              sortedIndices: Array.from({ length: i }, (_, k) => arr.length - 1 - k)
            });
          }
        }
      }
    }

    // Final sorted state
    newSteps.push({
      array: arr.map(el => ({ ...el, isSorted: true })),
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: Array.from({ length: arr.length }, (_, i) => i)
    });

    setSteps(newSteps);
    setCurrentStep(0);
    setComparisons(0);
    setSwaps(0);
    setIsPlaying(true);
  }, [array, selectedAlgorithm]);

    /* TODO:PlayPauseLogic Toggle play/pause and handle step-by-step animation */
  }, [isPlaying, currentStep, steps, speed]);

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

    const compare = (i: number, j: number, sortedIndices: number[] = []) => {
      comparisonCount++;
      recordStep([i, j], [], sortedIndices);
    };

    if (algorithm === 'bubble') {
      const sortedIndices: number[] = [];
      for (let i = 0; i < workingArray.length; i++) {
        for (let j = 0; j < workingArray.length - i - 1; j++) {
          compare(j, j + 1, sortedIndices);
          if (workingArray[j].value > workingArray[j + 1].value) {
            swap(j, j + 1, sortedIndices);
          }
        }
        sortedIndices.push(workingArray.length - i - 1);
        recordStep([], [], sortedIndices);
      }
    } else if (algorithm === 'quick') {
      const sortedIndices: number[] = [];
      
      const partition = (low: number, high: number): number => {
        const pivot = workingArray[high].value;
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
          compare(j, high, sortedIndices);
          if (workingArray[j].value < pivot) {
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

      quickSort(0, workingArray.length - 1);
      recordStep([], [], sortedIndices);
    } else if (algorithm === 'merge') {
      const sortedIndices: number[] = [];
      
      const merge = (left: number, mid: number, right: number) => {
        const leftArr = workingArray.slice(left, mid + 1);
        const rightArr = workingArray.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
          compare(left + i, mid + 1 + j, sortedIndices);
          if (leftArr[i].value <= rightArr[j].value) {
            workingArray[k] = leftArr[i];
            i++;
          } else {
            workingArray[k] = rightArr[j];
            j++;
          }
          recordStep([], [k], sortedIndices);
          k++;
        }
        
        while (i < leftArr.length) {
          workingArray[k] = leftArr[i];
          recordStep([], [k], sortedIndices);
          i++;
          k++;
        }
        
        while (j < rightArr.length) {
          workingArray[k] = rightArr[j];
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
        }
      };

      mergeSort(0, workingArray.length - 1);
      for (let i = 0; i < workingArray.length; i++) {
        sortedIndices.push(i);
      }
      recordStep([], [], sortedIndices);
    } else if (algorithm === 'insertion') {
      const sortedIndices: number[] = [0];
      
      for (let i = 1; i < workingArray.length; i++) {
        const key = workingArray[i];
        let j = i - 1;
        
        compare(i, j, sortedIndices);
        
        while (j >= 0 && workingArray[j].value > key.value) {
          workingArray[j + 1] = workingArray[j];
          recordStep([], [j + 1], sortedIndices);
          j--;
          if (j >= 0) {
            compare(j, i, sortedIndices);
          }
        }
        
        workingArray[j + 1] = key;
        recordStep([], [j + 1], sortedIndices);
        sortedIndices.push(i);
      }
      recordStep([], [], sortedIndices);
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

{/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 shadow-2xl"
        >
          <div className="space-y-6">
            {/* Play/Pause Controls */}
            <div className="flex gap-3">
              <Button
                onClick={handlePlayPause}
                disabled={array.length === 0 || (currentStep >= steps.length - 1 && !isPlaying)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50"
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
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Speed Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-purple-300 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Speed
                </label>
                <span className="text-xs text-purple-400">{speed[0]}%</span>
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

            {/* Array Size Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-purple-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Array Size
                </label>
                <span className="text-xs text-purple-400">{arraySize[0]}</span>
              </div>
              <Slider
                value={arraySize}
                onValueChange={setArraySize}
                min={5}
                max={50}
                step={5}
                className="cursor-pointer"
              />
            </div>

            {/* Generate Array Button */}
            <Button
              onClick={generateRandomArray}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-cyan-500/50"
            >
              Generate New Array
            </Button>
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
                  
                  return (
                    <motion.div
                      key={element.id}
                      className="relative flex-1 min-w-0 group"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: `${(element.value / 100) * 100}%`,
                        opacity: 1,
                        y: isSwapping ? -20 : 0,
                        scale: isComparing ? 1.1 : 1,
                      }}
                      transition={{
                        height: { duration: 0.5, ease: "easeOut" },
                        y: { duration: 0.3, ease: "easeInOut" },
                        scale: { duration: 0.2 },
                        opacity: { duration: 0.3 }
                      }}
                      style={{
                        backgroundColor: isSorted 
                          ? '#00ff00' 
                          : isSwapping 
                          ? '#ff0066' 
                          : isComparing 
                          ? '#ffff00' 
                          : NEON_COLORS[index % NEON_COLORS.length],
                        boxShadow: isSorted
                          ? '0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00ff00'
                          : isSwapping
                          ? '0 0 30px #ff0066, 0 0 60px #ff0066, 0 0 90px #ff0066'
                          : isComparing
                          ? '0 0 25px #ffff00, 0 0 50px #ffff00, 0 0 75px #ffff00'
                          : `0 0 15px ${NEON_COLORS[index % NEON_COLORS.length]}, 0 0 30px ${NEON_COLORS[index % NEON_COLORS.length]}`,
                      }}
                    >
                      {/* Trail effect for swapping */}
                      {isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-sm"
                          initial={{ opacity: 0.8, scale: 1 }}
                          animate={{ opacity: 0, scale: 1.5 }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                          style={{
                            backgroundColor: '#ff0066',
                            filter: 'blur(8px)',
                          }}
                        />
                      )}
                      
                      {/* Value label on hover */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-gray-900 border border-purple-500/50 rounded px-2 py-1 text-xs text-purple-300 whitespace-nowrap shadow-lg">
                          {element.value}
                        </div>
                      </div>
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
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold shadow-lg shadow-cyan-500/50 transition-all duration-300 hover:shadow-cyan-500/70 hover:scale-105"
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
                  variant="outline"
                  className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Animation Speed
                </h3>
                <span className="text-cyan-300 font-mono text-sm bg-cyan-500/20 px-3 py-1 rounded-full">
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
                <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Array Size
                </h3>
                <span className="text-cyan-300 font-mono text-sm bg-cyan-500/20 px-3 py-1 rounded-full">
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
              className={`relative cursor-pointer rounded-xl p-6 backdrop-blur-sm transition-all duration-300 ${
                selectedAlgorithm === algo.id
                  ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.5)]'
                  : 'bg-gray-800/50 border-2 border-gray-700 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <BarChart3 
                  className={`w-6 h-6 ${
                    selectedAlgorithm === algo.id ? 'text-cyan-400' : 'text-purple-400'
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
                selectedAlgorithm === algo.id ? 'text-cyan-200' : 'text-gray-400'
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
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Legend</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
            >
              <div className="w-4 h-12 bg-cyan-400 rounded shadow-lg shadow-cyan-400/50" />
              <div>
                <p className="text-sm font-semibold text-cyan-400">Default</p>
                <p className="text-xs text-gray-400">Unsorted element</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
            >
              <div className="w-4 h-12 bg-yellow-400 rounded shadow-lg shadow-yellow-400/50 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">Comparing</p>
                <p className="text-xs text-gray-400">Being compared</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
            >
              <div className="w-4 h-12 bg-red-500 rounded shadow-lg shadow-red-500/50 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-red-500">Swapping</p>
                <p className="text-xs text-gray-400">Being swapped</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
            >
              <div className="w-4 h-12 bg-green-400 rounded shadow-lg shadow-green-400/50" />
              <div>
                <p className="text-sm font-semibold text-green-400">Sorted</p>
                <p className="text-xs text-gray-400">In final position</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}