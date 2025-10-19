import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, BarChart3 } from 'lucide-react';
import { Activity, TrendingUp, Shuffle } from 'lucide-react';
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
    setIsPlaying(false);
  }, [arraySize]);

  // Update statistics when step changes
  const updateStats = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) return;
    
    const step = steps[currentStep];
    let compCount = 0;
    let swapCount = 0;
    
    for (let i = 0; i <= currentStep; i++) {
      if (steps[i].comparingIndices.length > 0) compCount++;
      if (steps[i].swappingIndices.length > 0) swapCount++;
    }
    
    setComparisons(compCount);
    setSwaps(swapCount);
  }, [steps, currentStep]);

  // Reset stats when generating new array or algorithm changes
  const resetStats = useCallback(() => {
    setComparisons(0);
    setSwaps(0);
  }, []);

</parameter>
</invoke>  const resetVisualization = useCallback(() => {

    setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
    generateRandomArray();
  }, [generateRandomArray]);

  // Animation control using useEffect
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
    setIsPlaying(true);
    if (currentStep >= steps.length) {
      setCurrentStep(0);
    }
  
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {

    /* TODO:PauseAnimation Set isPlaying false, preserve current step */
  }, []);

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

    // Initial state
    addStep(arr);

    switch (algorithm) {
      case 'bubble': {
        const sortedIndices: number[] = [];
        for (let i = 0; i < arr.length - 1; i++) {
          for (let j = 0; j < arr.length - i - 1; j++) {
            // Comparing
            addStep(arr, [j, j + 1], [], sortedIndices);
            
            if (arr[j].value > arr[j + 1].value) {
              // Swapping
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
        break;
      }

      case 'insertion': {
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
        break;
      }

      case 'quick': {
        const sortedIndices: number[] = [];
        
        const partition = (low: number, high: number): number => {
          const pivot = arr[high].value;
          let i = low - 1;
          
          addStep(arr, [high], [], sortedIndices);
          
          for (let j = low; j < high; j++) {
            addStep(arr, [j, high], [], sortedIndices);
            
            if (arr[j].value < pivot) {
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
        break;
      }

      case 'merge': {
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
              i++;
            } else {
              addStep(arr, [], [k], sortedIndices);
              arr[k] = rightArr[j];
              j++;
            }
            k++;
            addStep(arr, [], [], sortedIndices);
          }
          
          while (i < leftArr.length) {
            addStep(arr, [], [k], sortedIndices);
            arr[k] = leftArr[i];
            i++;
            k++;
            addStep(arr, [], [], sortedIndices);
          }
          
          while (j < rightArr.length) {
            addStep(arr, [], [k], sortedIndices);
            arr[k] = rightArr[j];
            j++;
            k++;
            addStep(arr, [], [], sortedIndices);
          }
          
          if (right - left + 1 === arr.length) {
            for (let idx = 0; idx < arr.length; idx++) {
              sortedIndices.push(idx);
            }
          }
          addStep(arr, [], [], sortedIndices);
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
        break;
      }
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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="px-6 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full backdrop-blur-sm"
            >
              <span className="text-2xl font-semibold text-purple-300">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name || 'Bubble Sort'}
              </span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 rounded-full backdrop-blur-sm relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <span className="text-lg font-mono text-cyan-300 relative z-10 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
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
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Zap className="w-4 h-4" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Algorithm</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {mockAlgorithms.map((algo) => (
                      <button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        disabled={isPlaying}
                        className={`
                          relative px-4 py-3 rounded-lg text-left transition-all duration-300
                          ${selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <div className="text-sm font-medium text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400">
                      <BarChart3 className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Speed</h3>
                    </div>
                    <span className="text-xs text-gray-400">{speed[0]}%</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={100}
                    step={10}
                    disabled={isPlaying}
                    className="cursor-pointer"
                  />
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400">
                      <BarChart3 className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Array Size</h3>
                    </div>
                    <span className="text-xs text-gray-400">{arraySize[0]}</span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={5}
                    disabled={isPlaying}
                    className="cursor-pointer"
                  />
                </div>

                {/* Control Buttons */}
                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all duration-300"
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
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={() => {
                      generateSortingSteps(selectedAlgorithm);
                      setCurrentStep(0);
                    }}
                    disabled={isPlaying || array.length === 0}
                    variant="outline"
                    className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 shadow-[0_0_15px_rgba(255,0,102,0.3)]"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Steps
                  </Button>
                </div>
              </div>
            </motion.div>
            
            <div className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Zap className="w-4 h-4" />
                    <h3 className="font-semibold">Algorithm</h3>
                  </div>
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
                          <span className={`font-medium text-sm ${
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
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-[0_0_15px_rgba(34,211,238,0.8)] [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-[0_0_25px_rgba(34,211,238,1)] [&_.relative]:h-2 [&_.relative]:bg-gray-800 [&_.relative]:rounded-full [&_.relative]:border [&_.relative]:border-cyan-500/30 [&_.relative_.bg-primary]:bg-gradient-to-r [&_.relative_.bg-primary]:from-cyan-500 [&_.relative_.bg-primary]:to-purple-500 [&_.relative_.bg-primary]:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
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
                    max={50}
                    step={1}
                    disabled={isPlaying}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative flex-1 px-6 py-3 rounded-lg font-semibold
                      transition-all duration-300 overflow-hidden
                      ${isPlaying
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.6)]'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                      border-2 ${isPlaying ? 'border-pink-400' : 'border-cyan-400'}
                    `}
                  >
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
                    />
                    <motion.div
                      className="relative flex items-center justify-center gap-2"
                      animate={{
                        textShadow: isPlaying
                          ? [
                              '0 0 10px rgba(236,72,153,0.8)',
                              '0 0 20px rgba(236,72,153,0.8)',
                              '0 0 10px rgba(236,72,153,0.8)'
                            ]
                          : [
                              '0 0 10px rgba(6,182,212,0.8)',
                              '0 0 20px rgba(6,182,212,0.8)',
                              '0 0 10px rgba(6,182,212,0.8)'
                            ]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                    >
                      <motion.div
                        key={isPlaying ? 'pause' : 'play'}
                        initial={{ rotate: -180, opacity: 0, scale: 0 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 180, opacity: 0, scale: 0 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" fill="currentColor" />
                        ) : (
                          <Play className="w-5 h-5" fill="currentColor" />
                        )}
                      </motion.div>
                      <span className="font-bold tracking-wide">
                        {isPlaying ? 'PAUSE' : 'PLAY'}
                      </span>
                    </motion.div>
                  </motion.button>
                  <motion.button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="flex-1 relative group overflow-hidden px-6 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: 360 }}
                    transition={{ 
                      rotate: { duration: 0.6, ease: "easeInOut" },
                      scale: { duration: 0.2 }
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/30 to-pink-500/0"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 0 }}
                        whileHover={{ rotate: -180 }}
                        transition={{ duration: 0.5 }}
                      >
                        <RotateCcw className="w-5 h-5 text-pink-300" />
                      </motion.div>
                      <span className="font-semibold text-pink-300">Reset</span>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        boxShadow: '0 0 20px rgba(236,72,153,0.5), inset 0 0 20px rgba(236,72,153,0.2)'
                      }}
                    />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* TODO:StatsPanel Real-time statistics panel showing comparisons, swaps, and progress */}
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
                        '0 0 20px rgba(0, 255, 255, 0.3)',
                        '0 0 40px rgba(255, 0, 255, 0.5)',
                        '0 0 20px rgba(0, 255, 255, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50"
                  >
                    <BarChart3 className="w-16 h-16 text-cyan-400" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-cyan-300">Ready to Visualize</h3>
                    <p className="text-gray-400">Generate an array to begin</p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const currentStepData = steps[currentStep];
                    const isComparing = currentStepData?.comparingIndices.includes(index);
                    const isSwapping = currentStepData?.swappingIndices.includes(index);
                    const isSorted = currentStepData?.sortedIndices.includes(index);
                    
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let glowColor = barColor;
                    let glowIntensity = 0.3;
                    
                    if (isSorted) {
                      barColor = '#00ff00';
                      glowColor = '#00ff00';
                      glowIntensity = 0.8;
                    } else if (isSwapping) {
                      barColor = '#ff0066';
                      glowColor = '#ff0066';
                      glowIntensity = 1;
                    } else if (isComparing) {
                      barColor = '#ffff00';
                      glowColor = '#ffff00';
                      glowIntensity = 0.7;
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px]"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          y: isSwapping ? [-10, 0] : 0,
                          scale: isSwapping ? [1, 1.1, 1] : isComparing ? 1.05 : 1
                        }}
                        transition={{
                          height: { duration: 0.3, ease: 'easeOut' },
                          opacity: { duration: 0.3 },
                          y: { duration: 0.4, ease: 'easeInOut' },
                          scale: { duration: 0.2 }
                        }}
                      >
                        {/* Swap trail effect */}
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: [0, 0.6, 0],
                              scale: [1, 1.5, 2],
                              boxShadow: [
                                `0 0 0px ${glowColor}`,
                                `0 0 30px ${glowColor}`,
                                `0 0 60px ${glowColor}`
                              ]
                            }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            style={{
                              background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`
                            }}
                          />
                        )}
                        
                        {/* Main bar */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          animate={{
                            background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                            boxShadow: [
                              `0 0 ${glowIntensity * 20}px ${glowColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}`,
                              `0 0 ${glowIntensity * 30}px ${glowColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}`,
                              `0 0 ${glowIntensity * 20}px ${glowColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}`
                            ]
                          }}
                          transition={{
                            background: { duration: 0.3 },
                            boxShadow: { duration: 0.8, repeat: Infinity }
                          }}
                          style={{
                            border: `1px solid ${barColor}`,
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0"
                            animate={{
                              background: [
                                `linear-gradient(to top, transparent 0%, ${barColor}40 50%, transparent 100%)`,
                                `linear-gradient(to top, transparent 50%, ${barColor}60 100%, transparent 150%)`
                              ],
                              y: ['-100%', '100%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear'
                            }}
                          />
                          
                          {/* Sorted checkmark indicator */}
                          {isSorted && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center"
                              style={{
                                boxShadow: '0 0 10px #00ff00'
                              }}
                            >
                              <div className="w-2 h-2 bg-gray-900 rounded-full" />
                            </motion.div>
                          )}
                        </motion.div>
                        
                        {/* Comparison indicator */}
                        {isComparing && (
                          <motion.div
                            className="absolute -top-8 left-1/2 -translate-x-1/2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: [0.5, 1, 0.5],
                              y: [-5, -10, -5],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            <div
                              className="w-3 h-3 rotate-45"
                              style={{
                                background: glowColor,
                                boxShadow: `0 0 15px ${glowColor}`
                              }}
                            />
                          </motion.div>
                        )}
                        
                        {/* Value label */}
                        {arraySize[0] <= 20 && (
                          <motion.div
                            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                            animate={{
                              color: barColor,
                              textShadow: `0 0 10px ${glowColor}`
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {array.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(0, 255, 255, 0.3)',
                          '0 0 40px rgba(255, 0, 255, 0.5)',
                          '0 0 20px rgba(0, 255, 255, 0.3)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-8 rounded-full bg-gray-800/50 border border-cyan-500/30"
                    >
                      <BarChart3 className="w-16 h-16 text-cyan-400" />
                    </motion.div>
                    <p className="text-cyan-300 text-lg font-medium">Generate an array to begin</p>
                  </motion.div>
                ) : (
                  array.map((element, index) => {
                    const isComparing = steps[currentStep]?.comparingIndices.includes(index);
                    const isSwapping = steps[currentStep]?.swappingIndices.includes(index);
                    const isSorted = steps[currentStep]?.sortedIndices.includes(index);
                    
                    const heightPercentage = (element.value / 105) * 100;
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
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                          opacity: 1,
                          height: `${heightPercentage}%`,
                          scale: isComparing || isSwapping ? 1.05 : 1,
                          y: isSwapping ? -10 : 0
                        }}
                        transition={{
                          layout: { type: 'spring', stiffness: 300, damping: 30 },
                          height: { duration: 0.3, ease: 'easeOut' },
                          scale: { duration: 0.2 },
                          y: { duration: 0.3, type: 'spring' }
                        }}
                        className="relative flex-1 min-w-[8px] max-w-[60px] rounded-t-lg"
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `
                            0 0 ${isSwapping ? '30px' : isComparing ? '25px' : '15px'} ${barColor}80,
                            0 0 ${isSwapping ? '60px' : isComparing ? '50px' : '30px'} ${barColor}40,
                            inset 0 0 20px ${barColor}40
                          `,
                          border: `1px solid ${barColor}`,
                          filter: isSorted ? 'brightness(1.3)' : 'brightness(1)'
                        }}
                      >
                        {/* Glow overlay */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          animate={{
                            background: [
                              `linear-gradient(to top, transparent, ${barColor}40)`,
                              `linear-gradient(to top, transparent, ${barColor}60)`,
                              `linear-gradient(to top, transparent, ${barColor}40)`
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />

                        {/* Shimmer effect */}
                        {(isComparing || isSwapping) && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-30"
                              animate={{
                                y: ['-100%', '200%']
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: 'linear'
                              }}
                            />
                          </motion.div>
                        )}

                        {/* Swap trail effect */}
                        {isSwapping && (
                          <>
                            <motion.div
                              className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                              style={{ backgroundColor: barColor }}
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [1, 0.5, 1]
                              }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            />
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              animate={{
                                boxShadow: [
                                  `0 0 20px ${barColor}`,
                                  `0 0 40px ${barColor}`,
                                  `0 0 20px ${barColor}`
                                ]
                              }}
                              transition={{ duration: 0.3, repeat: Infinity }}
                            />
                          </>
                        )}

                        {/* Value label */}
                        <motion.div
                          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                          style={{ 
                            color: barColor,
                            textShadow: `0 0 10px ${barColor}`
                          }}
                          animate={{
                            scale: isComparing || isSwapping ? 1.2 : 1
                          }}
                        >
                          {element.value}
                        </motion.div>

                        {/* Sorted checkmark */}
                        {isSorted && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                            style={{
                              boxShadow: '0 0 20px rgba(0, 255, 0, 0.8)'
                            }}
                          >
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
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
              transition={{ delay: 0.4 }}
              className="mt-6 space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-400 font-medium">Sorting Progress</span>
                <span className="text-purple-300 font-mono">
                  {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                </span>
              </div>
              
              <div className="relative h-3 bg-gray-800/80 rounded-full overflow-hidden border border-purple-500/30 shadow-inner">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
                
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: 'linear',
                    repeatDelay: 0.5
                  }}
                  style={{ 
                    opacity: steps.length > 0 && currentStep < steps.length ? 1 : 0 
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Step {currentStep} / {steps.length}</span>
                {steps.length > 0 && currentStep >= steps.length && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-green-400 font-semibold flex items-center gap-1"
                  >
                    ✓ Complete
                  </motion.span>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-pink-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(255,0,102,0.3)]"
        >
          <div className="flex items-center gap-2 mb-4 text-pink-400">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-lg font-semibold uppercase tracking-wider">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-cyan-500 to-cyan-300"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(0, 255, 255, 0.5)',
                    '0 0 20px rgba(0, 255, 255, 0.8)',
                    '0 0 10px rgba(0, 255, 255, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Default</div>
                <div className="text-xs text-gray-400">Unsorted</div>
              </div>
            </motion.div>

            {/* Comparing State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-yellow-500/30"
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-yellow-500 to-yellow-300"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(255, 255, 0, 0.6)',
                    '0 0 30px rgba(255, 255, 0, 1)',
                    '0 0 15px rgba(255, 255, 0, 0.6)'
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
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-pink-500/30"
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-pink-500 to-pink-300"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(255, 0, 102, 0.6)',
                    '0 0 30px rgba(255, 0, 102, 1)',
                    '0 0 15px rgba(255, 0, 102, 0.6)'
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
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-green-500/30"
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-green-500 to-green-300"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0, 255, 0, 0.6)',
                    '0 0 25px rgba(0, 255, 0, 0.9)',
                    '0 0 15px rgba(0, 255, 0, 0.6)'
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
            className="mt-4 pt-4 border-t border-gray-700/50"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{
                    boxShadow: [
                      '0 0 5px rgba(0, 255, 255, 0.8)',
                      '0 0 15px rgba(0, 255, 255, 1)',
                      '0 0 5px rgba(0, 255, 255, 0.8)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span>Bar height represents value</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-purple-400"
                  animate={{
                    boxShadow: [
                      '0 0 5px rgba(168, 85, 247, 0.8)',
                      '0 0 15px rgba(168, 85, 247, 1)',
                      '0 0 5px rgba(168, 85, 247, 0.8)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                />
                <span>Glow intensity shows activity</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
