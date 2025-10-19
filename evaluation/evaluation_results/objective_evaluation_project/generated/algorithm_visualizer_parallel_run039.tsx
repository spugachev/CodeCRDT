import { useState, useCallback } from 'react';
import { useEffect, useRef } from 'react';
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

const useAnimationLoop = (
  isPlaying: boolean,
  steps: AlgorithmStep[],
  currentStep: number,
  speed: number[],
  onStepComplete: () => void,
  onAnimationEnd: () => void
) => {
  const [animationId, setAnimationId] = useState<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (animationId) {
      clearTimeout(animationId);
      setAnimationId(null);
    }
  }, [animationId]);

  const animate = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
      const id = setTimeout(() => {
        onStepComplete();
      }, delay);
      setAnimationId(id);
    } else {
      onAnimationEnd();
    }
  }, [currentStep, steps.length, speed, onStepComplete, onAnimationEnd]);

  // Start/stop animation based on isPlaying
  if (isPlaying && currentStep < steps.length - 1) {
    animate();
  } else if (!isPlaying) {
    cleanup();
  }

  return cleanup;
};
export default function AlgorithmVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [arraySize, setArraySize] = useState([20]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bubble');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle step-by-step animation
  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      if (currentStep >= steps.length - 1) {
        setIsPlaying(false);
        return;
      }

      const delay = 1000 - speed[0] * 9.5; // Convert speed slider (0-100) to delay (1000ms-50ms)
      
      animationRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        
        // Update array with current step data
        if (steps[currentStep + 1]) {
          setArray(steps[currentStep + 1].array);
        }
      }, delay);

      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    }
  }, [isPlaying, currentStep, steps, speed]);

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

  const startVisualization = useCallback(() => {
    if (steps.length === 0) return;
    if (currentStep >= steps.length - 1) return;
    
    setIsPlaying(true);
    if (steps.length === 0) return;
    if (currentStep >= steps.length - 1) return;
    
    setIsPlaying(true);
    
    // Animation will be handled by useEffect watching isPlaying state
    const delay = 1000 - speed[0] * 9.5;
    const intervalId = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          clearInterval(intervalId);
          return prev;
        }
        return prev + 1;
      });
    }, delay);
    
    // Store interval ID for cleanup
    return () => clearInterval(intervalId);
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {

    setIsPlaying(false);
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    const sortedArray = [...array];
    const algorithmSteps: AlgorithmStep[] = [];
    
    // Helper to create a step snapshot
    const createStep = (
      arr: ArrayElement[],
      comparing: number[] = [],
      swapping: number[] = [],
      sorted: number[] = []
    ) => {
      algorithmSteps.push({
        array: arr.map((el, idx) => ({
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

    // Initial state
    createStep([...sortedArray]);

    if (algorithm === 'bubble') {
      // Bubble Sort
      const n = sortedArray.length;
      const sorted: number[] = [];
      
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          // Comparing
          createStep([...sortedArray], [j, j + 1], [], sorted);
          
          if (sortedArray[j].value > sortedArray[j + 1].value) {
            // Swapping
            createStep([...sortedArray], [], [j, j + 1], sorted);
            [sortedArray[j], sortedArray[j + 1]] = [sortedArray[j + 1], sortedArray[j]];
            createStep([...sortedArray], [], [j, j + 1], sorted);
          }
        }
        sorted.push(n - i - 1);
        createStep([...sortedArray], [], [], sorted);
      }
      sorted.push(0);
      createStep([...sortedArray], [], [], sorted);
      
    } else if (algorithm === 'quick') {
      // Quick Sort
      const sorted: number[] = [];
      
      const partition = (low: number, high: number): number => {
        const pivot = sortedArray[high].value;
        let i = low - 1;
        
        createStep([...sortedArray], [high], [], sorted);
        
        for (let j = low; j < high; j++) {
          createStep([...sortedArray], [j, high], [], sorted);
          
          if (sortedArray[j].value < pivot) {
            i++;
            if (i !== j) {
              createStep([...sortedArray], [], [i, j], sorted);
              [sortedArray[i], sortedArray[j]] = [sortedArray[j], sortedArray[i]];
              createStep([...sortedArray], [], [i, j], sorted);
            }
          }
        }
        
        createStep([...sortedArray], [], [i + 1, high], sorted);
        [sortedArray[i + 1], sortedArray[high]] = [sortedArray[high], sortedArray[i + 1]];
        createStep([...sortedArray], [], [i + 1, high], sorted);
        
        return i + 1;
      };
      
      const quickSort = (low: number, high: number) => {
        if (low < high) {
          const pi = partition(low, high);
          sorted.push(pi);
          createStep([...sortedArray], [], [], sorted);
          
          quickSort(low, pi - 1);
          quickSort(pi + 1, high);
        } else if (low === high) {
          sorted.push(low);
          createStep([...sortedArray], [], [], sorted);
        }
      };
      
      quickSort(0, sortedArray.length - 1);
      
    } else if (algorithm === 'merge') {
      // Merge Sort
      const sorted: number[] = [];
      
      const merge = (left: number, mid: number, right: number) => {
        const leftArr = sortedArray.slice(left, mid + 1);
        const rightArr = sortedArray.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
          createStep([...sortedArray], [left + i, mid + 1 + j], [], sorted);
          
          if (leftArr[i].value <= rightArr[j].value) {
            createStep([...sortedArray], [], [k], sorted);
            sortedArray[k] = leftArr[i];
            i++;
          } else {
            createStep([...sortedArray], [], [k], sorted);
            sortedArray[k] = rightArr[j];
            j++;
          }
          createStep([...sortedArray], [], [k], sorted);
          k++;
        }
        
        while (i < leftArr.length) {
          createStep([...sortedArray], [], [k], sorted);
          sortedArray[k] = leftArr[i];
          createStep([...sortedArray], [], [k], sorted);
          i++;
          k++;
        }
        
        while (j < rightArr.length) {
          createStep([...sortedArray], [], [k], sorted);
          sortedArray[k] = rightArr[j];
          createStep([...sortedArray], [], [k], sorted);
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
          
          if (left === 0 && right === sortedArray.length - 1) {
            for (let i = left; i <= right; i++) {
              sorted.push(i);
            }
            createStep([...sortedArray], [], [], sorted);
          }
        }
      };
      
      mergeSort(0, sortedArray.length - 1);
      
    } else if (algorithm === 'insertion') {
      // Insertion Sort
      const sorted: number[] = [0];
      createStep([...sortedArray], [], [], sorted);
      
      for (let i = 1; i < sortedArray.length; i++) {
        const key = sortedArray[i];
        let j = i - 1;
        
        createStep([...sortedArray], [i], [], sorted);
        
        while (j >= 0 && sortedArray[j].value > key.value) {
          createStep([...sortedArray], [j, j + 1], [], sorted);
          createStep([...sortedArray], [], [j, j + 1], sorted);
          sortedArray[j + 1] = sortedArray[j];
          createStep([...sortedArray], [], [j, j + 1], sorted);
          j--;
        }
        
        sortedArray[j + 1] = key;
        createStep([...sortedArray], [], [j + 1], sorted);
        sorted.push(i);
        createStep([...sortedArray], [], [], sorted);
      }
    }
    
    setSteps(algorithmSteps);
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
          <div className="relative inline-block">
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
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800/50 backdrop-blur-sm rounded-full border border-cyan-500/30"
            >
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-xl font-semibold text-cyan-300">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name}
              </span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="relative px-4 py-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-lg border border-purple-400/50"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg blur-xl"
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-mono text-purple-200">
                  {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-all duration-300"
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
                      <Button
                        key={algo.id}
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          generateSortingSteps(algo.id as AlgorithmType);
                        }}
                        disabled={isPlaying}
                        variant={selectedAlgorithm === algo.id ? 'default' : 'outline'}
                        className={`w-full justify-start text-left transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_20px_rgba(0,255,255,0.5)] border-0'
                            : 'bg-gray-800/50 border-cyan-500/20 text-cyan-300 hover:bg-gray-700/50 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                        }`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{algo.name}</span>
                          <span className="text-xs opacity-70">{algo.complexity}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400">
                      <BarChart3 className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Array Size</h3>
                    </div>
                    <span className="text-lg font-bold text-purple-300">{arraySize[0]}</span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={1}
                    disabled={isPlaying}
                    className="cursor-pointer"
                  />
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400">
                      <Zap className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Speed</h3>
                    </div>
                    <span className="text-lg font-bold text-pink-300">{speed[0]}%</span>
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

                {/* Control Buttons */}
                <div className="space-y-2 pt-4 border-t border-cyan-500/20">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)] transition-all duration-300 border-0"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {currentStep >= steps.length ? 'Restart' : 'Play'}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:shadow-[0_0_30px_rgba(249,115,22,0.7)] transition-all duration-300 border-0"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </motion.div>
            
            <div className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-wider">ALGORITHM</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/50'
                            : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="space-y-1">
                          <div className={`font-semibold ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-300'
                          }`}>
                            {algo.name}
                          </div>
                          <div className={`text-xs font-mono ${
                            selectedAlgorithm === algo.id ? 'text-cyan-400' : 'text-gray-500'
                          }`}>
                            {algo.complexity}
                          </div>
                        </div>
                        {selectedAlgorithm === algo.id && (
                          <motion.div
                            className="absolute inset-0 rounded-lg border-2 border-cyan-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
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
                    className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-[0_0_15px_rgba(34,211,238,0.8)] [&_[role=slider]]:hover:shadow-[0_0_25px_rgba(34,211,238,1)] [&_[role=slider]]:transition-shadow [&_.relative]:bg-gray-700/50 [&_.relative]:border [&_.relative]:border-cyan-500/30 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-cyan-500 [&_.bg-primary]:to-purple-500 [&_.bg-primary]:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
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
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2 [&>span]:rounded-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={() => {
                      if (isPlaying) {
                        pauseVisualization();
                      } else {
                        startVisualization();
                      }
                    }}
                    disabled={array.length === 0 || steps.length === 0}
                    className="relative flex-1 px-6 py-3 rounded-lg font-semibold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500"
                      animate={{
                        boxShadow: isPlaying
                          ? [
                              '0 0 20px rgba(0, 255, 255, 0.5)',
                              '0 0 40px rgba(0, 255, 255, 0.8)',
                              '0 0 20px rgba(0, 255, 255, 0.5)'
                            ]
                          : [
                              '0 0 20px rgba(0, 255, 255, 0.3)',
                              '0 0 30px rgba(0, 255, 255, 0.5)',
                              '0 0 20px rgba(0, 255, 255, 0.3)'
                            ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: isPlaying ? 0 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </motion.div>
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </div>
                  </motion.button>
                  <motion.button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="flex-1 relative group overflow-hidden rounded-lg bg-gradient-to-r from-pink-600 to-red-600 p-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]"
                    whileHover={{ scale: isPlaying ? 1 : 1.05 }}
                    whileTap={{ scale: isPlaying ? 1 : 0.95, rotate: 360 }}
                    transition={{ duration: 0.6, type: "spring" }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: isPlaying ? 0 : [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <RotateCcw className="w-5 h-5 text-white" />
                      </motion.div>
                      <span className="font-semibold text-white">Reset</span>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Statistics</h3>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-cyan-300 font-mono font-bold">
                      {steps.length > 0 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0}%
                    </span>
                  </div>
                  <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden border border-cyan-500/30">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: steps.length > 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%'
                      }}
                      transition={{ duration: 0.3 }}
                    />
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
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* Comparisons */}
                  <motion.div
                    className="relative bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/30 rounded-lg p-4 overflow-hidden group hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0"
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                    <div className="relative space-y-1">
                      <div className="text-xs text-cyan-400 uppercase tracking-wider font-semibold">Comparisons</div>
                      <motion.div
                        className="text-2xl font-bold text-cyan-300 font-mono"
                        key={steps[currentStep]?.comparingIndices.length || 0}
                        initial={{ scale: 1.2, color: '#67e8f9' }}
                        animate={{ scale: 1, color: '#67e8f9' }}
                        transition={{ duration: 0.2 }}
                      >
                        {currentStep}
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Swaps */}
                  <motion.div
                    className="relative bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/30 rounded-lg p-4 overflow-hidden group hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/20 to-pink-500/0"
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: 0.5
                      }}
                    />
                    <div className="relative space-y-1">
                      <div className="text-xs text-pink-400 uppercase tracking-wider font-semibold">Swaps</div>
                      <motion.div
                        className="text-2xl font-bold text-pink-300 font-mono"
                        key={steps[currentStep]?.swappingIndices.length || 0}
                        initial={{ scale: 1.2, color: '#f9a8d4' }}
                        animate={{ scale: 1, color: '#f9a8d4' }}
                        transition={{ duration: 0.2 }}
                      >
                        {steps.slice(0, currentStep + 1).filter(s => s.swappingIndices.length > 0).length}
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Current Step */}
                  <motion.div
                    className="relative bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 rounded-lg p-4 overflow-hidden group hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0"
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: 1
                      }}
                    />
                    <div className="relative space-y-1">
                      <div className="text-xs text-purple-400 uppercase tracking-wider font-semibold">Step</div>
                      <div className="text-2xl font-bold text-purple-300 font-mono">
                        {currentStep + 1}
                        <span className="text-sm text-purple-400/70">/{steps.length}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Sorted Elements */}
                  <motion.div
                    className="relative bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-lg p-4 overflow-hidden group hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0"
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: 1.5
                      }}
                    />
                    <div className="relative space-y-1">
                      <div className="text-xs text-green-400 uppercase tracking-wider font-semibold">Sorted</div>
                      <div className="text-2xl font-bold text-green-300 font-mono">
                        {steps[currentStep]?.sortedIndices.length || 0}
                        <span className="text-sm text-green-400/70">/{array.length}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Status Indicator */}
                <div className="pt-3 border-t border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Status</span>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${
                          isPlaying 
                            ? 'bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]' 
                            : currentStep >= steps.length - 1 && steps.length > 0
                            ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                            : 'bg-gray-500 shadow-[0_0_10px_rgba(107,114,128,0.5)]'
                        }`}
                        animate={isPlaying ? {
                          scale: [1, 1.3, 1],
                          opacity: [1, 0.7, 1]
                        } : {}}
                        transition={{
                          duration: 1,
                          repeat: Infinity
                        }}
                      />
                      <span className={`text-xs font-semibold ${
                        isPlaying 
                          ? 'text-green-400' 
                          : currentStep >= steps.length - 1 && steps.length > 0
                          ? 'text-cyan-400'
                          : 'text-gray-400'
                      }`}>
                        {isPlaying 
                          ? 'Running' 
                          : currentStep >= steps.length - 1 && steps.length > 0
                          ? 'Complete'
                          : 'Ready'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
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
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative"
                  >
                    <BarChart3 className="w-24 h-24 text-purple-400/50" />
                    <motion.div
                      className="absolute inset-0 blur-xl bg-purple-500/30 rounded-full"
                      animate={{
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-semibold text-purple-300">
                      Generate an array to begin
                    </p>
                    <p className="text-sm text-purple-400/70">
                      Click "Generate New Array" to start visualizing
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {/* Animated Bars */}
                  {(steps.length > 0 && steps[currentStep] ? steps[currentStep].array : array).map((element, index) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    const barWidth = Math.max(8, Math.min(60, (100 / array.length) * 8));
                    
                    // Determine bar color based on state
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let glowIntensity = 0.3;
                    
                    if (element.isSorted) {
                      barColor = '#00ff00';
                      glowIntensity = 0.6;
                    } else if (element.isSwapping) {
                      barColor = '#ff0066';
                      glowIntensity = 0.8;
                    } else if (element.isComparing) {
                      barColor = '#ffff00';
                      glowIntensity = 0.7;
                    }

                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex flex-col items-center justify-end"
                        style={{ width: `${barWidth}px` }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        {/* Comparison Indicator */}
                        {element.isComparing && (
                          <motion.div
                            className="absolute -top-12 left-1/2 -translate-x-1/2 z-20"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ 
                              opacity: [0, 1, 1, 0],
                              y: [-10, -20, -20, -30]
                            }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            <div className="relative">
                              <Zap className="w-6 h-6 text-yellow-400" />
                              <motion.div
                                className="absolute inset-0 blur-md bg-yellow-400"
                                animate={{
                                  opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* Swap Trail Effect */}
                        {element.isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 z-10"
                              initial={{ opacity: 0 }}
                              animate={{ 
                                opacity: [0, 0.8, 0],
                                scale: [1, 1.5, 2]
                              }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            >
                              <div 
                                className="w-full h-full rounded-lg"
                                style={{
                                  background: `radial-gradient(circle, ${barColor}80 0%, transparent 70%)`,
                                  filter: 'blur(8px)'
                                }}
                              />
                            </motion.div>
                            
                            {/* Particle effects */}
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute top-0 left-1/2 w-2 h-2 rounded-full"
                                style={{ backgroundColor: barColor }}
                                initial={{ opacity: 1, x: 0, y: 0 }}
                                animate={{
                                  opacity: [1, 0],
                                  x: [0, (i - 1) * 30],
                                  y: [0, -50 - i * 20]
                                }}
                                transition={{ 
                                  duration: 0.8,
                                  repeat: Infinity,
                                  delay: i * 0.1
                                }}
                              />
                            ))}
                          </>
                        )}

                        {/* The Bar */}
                        <motion.div
                          className="relative w-full rounded-t-lg overflow-hidden"
                          style={{
                            height: `${heightPercentage}%`,
                            minHeight: '20px'
                          }}
                          animate={{
                            height: `${heightPercentage}%`,
                            scale: element.isSwapping ? [1, 1.1, 1] : 1
                          }}
                          transition={{
                            height: { duration: 0.3, ease: 'easeInOut' },
                            scale: { duration: 0.3, repeat: element.isSwapping ? Infinity : 0 }
                          }}
                        >
                          {/* Bar gradient background */}
                          <motion.div
                            className="absolute inset-0"
                            style={{
                              background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                            }}
                            animate={{
                              opacity: element.isSwapping ? [1, 0.7, 1] : 1
                            }}
                            transition={{ duration: 0.3, repeat: element.isSwapping ? Infinity : 0 }}
                          />

                          {/* Glow effect */}
                          <motion.div
                            className="absolute inset-0 blur-md"
                            style={{
                              backgroundColor: barColor,
                              opacity: glowIntensity
                            }}
                            animate={{
                              opacity: element.isComparing || element.isSwapping 
                                ? [glowIntensity, glowIntensity * 1.5, glowIntensity]
                                : glowIntensity
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          />

                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                            animate={{
                              x: ['-100%', '200%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                          />

                          {/* Value label */}
                          {barWidth > 20 && (
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <span 
                                className="text-xs font-bold mix-blend-difference text-white"
                                style={{ 
                                  fontSize: `${Math.max(8, Math.min(14, barWidth / 3))}px`,
                                  textShadow: '0 0 4px rgba(0,0,0,0.8)'
                                }}
                              >
                                {element.value}
                              </span>
                            </motion.div>
                          )}
                        </motion.div>

                        {/* Sorted checkmark */}
                        {element.isSorted && (
                          <motion.div
                            className="absolute -top-8 left-1/2 -translate-x-1/2"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                          >
                            <motion.div
                              className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                              animate={{
                                boxShadow: [
                                  '0 0 10px rgba(34, 197, 94, 0.5)',
                                  '0 0 20px rgba(34, 197, 94, 0.8)',
                                  '0 0 10px rgba(34, 197, 94, 0.5)'
                                ]
                              }}
                              transition={{ duration: 1, repeat: Infinity }}
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
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}

                  {/* Comparison Line Connector */}
                  {steps.length > 0 && steps[currentStep] && steps[currentStep].comparingIndices.length === 2 && (
                    <motion.svg
                      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.line
                        x1={`${(steps[currentStep].comparingIndices[0] / array.length) * 100}%`}
                        y1="10%"
                        x2={`${(steps[currentStep].comparingIndices[1] / array.length) * 100}%`}
                        y2="10%"
                        stroke="#ffff00"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        initial={{ pathLength: 0 }}
                        animate={{ 
                          pathLength: 1,
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          pathLength: { duration: 0.3 },
                          opacity: { duration: 0.8, repeat: Infinity }
                        }}
                      />
                    </motion.svg>
                  )}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {(steps.length > 0 && steps[currentStep]?.array || array).map((element, index) => {
                  const maxValue = 100;
                  const heightPercentage = (element.value / maxValue) * 100;
                  const colorIndex = index % NEON_COLORS.length;
                  const neonColor = NEON_COLORS[colorIndex];
                  
                  return (
                    <motion.div
                      key={element.id}
                      layout
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: `${heightPercentage}%`,
                        opacity: 1,
                        scale: element.isComparing ? 1.1 : element.isSwapping ? 1.15 : 1,
                        y: element.isSwapping ? -20 : 0,
                        boxShadow: element.isComparing
                          ? `0 0 30px ${neonColor}, 0 0 60px ${neonColor}`
                          : element.isSwapping
                          ? `0 0 40px ${neonColor}, 0 0 80px ${neonColor}, 0 0 120px ${neonColor}`
                          : element.isSorted
                          ? `0 0 20px #00ff00, 0 0 40px #00ff00`
                          : `0 0 15px ${neonColor}`,
                      }}
                      transition={{
                        height: { duration: 0.4, ease: 'easeOut' },
                        scale: { duration: 0.3, ease: 'easeInOut' },
                        y: { duration: 0.3, ease: 'easeInOut' },
                        boxShadow: { duration: 0.3 },
                        layout: { duration: 0.5, ease: 'easeInOut' }
                      }}
                      className="relative rounded-t-lg min-w-[8px] flex-1 max-w-[60px]"
                      style={{
                        background: element.isSorted
                          ? 'linear-gradient(to top, #00ff00, #00ff88)'
                          : element.isSwapping
                          ? `linear-gradient(to top, ${neonColor}, #ffffff)`
                          : element.isComparing
                          ? `linear-gradient(to top, ${neonColor}, ${neonColor}dd)`
                          : `linear-gradient(to top, ${neonColor}cc, ${neonColor})`,
                        border: `2px solid ${element.isSorted ? '#00ff00' : neonColor}`,
                        position: 'relative',
                      }}
                    >
                      {/* Glow effect overlay */}
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        animate={{
                          opacity: element.isComparing || element.isSwapping ? [0.3, 0.7, 0.3] : 0.2,
                        }}
                        transition={{
                          duration: 1,
                          repeat: element.isComparing || element.isSwapping ? Infinity : 0,
                        }}
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${neonColor}88, transparent)`,
                        }}
                      />
                      
                      {/* Value label */}
                      {arraySize[0] <= 30 && (
                        <motion.div
                          className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: element.isComparing || element.isSwapping ? 1 : 0.6,
                            scale: element.isComparing || element.isSwapping ? 1.2 : 1,
                          }}
                          style={{
                            color: element.isSorted ? '#00ff00' : neonColor,
                            textShadow: `0 0 10px ${element.isSorted ? '#00ff00' : neonColor}`,
                          }}
                        >
                          {element.value}
                        </motion.div>
                      )}
                      
                      {/* Particle effect for swapping */}
                      {element.isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [1, 1.5, 2],
                          }}
                          transition={{
                            duration: 0.6,
                            ease: 'easeOut',
                          }}
                          style={{
                            background: `radial-gradient(circle, ${neonColor}66, transparent)`,
                            filter: 'blur(8px)',
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>

                            {steps.length > 0 && currentStep < steps.length && (
                <div className="absolute inset-0 pointer-events-none">
                  {steps[currentStep].comparingIndices.map((index, i) => {
                    const totalElements = steps[currentStep].array.length;
                    const barWidth = 100 / totalElements;
                    const leftPosition = (index * barWidth) + (barWidth / 2);
                    
                    return (
                      <motion.div
                        key={`compare-${index}-${i}`}
                        className="absolute"
                        style={{
                          left: `${leftPosition}%`,
                          top: '10%',
                          transform: 'translateX(-50%)'
                        }}
                        initial={{ opacity: 0, y: -20, scale: 0 }}
                        animate={{ 
                          opacity: [0, 1, 1, 0],
                          y: [0, -10, -10, 0],
                          scale: [0.8, 1.2, 1.2, 0.8]
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="relative">
                          <motion.div
                            className="absolute inset-0 bg-cyan-400 rounded-full blur-xl"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity
                            }}
                          />
                          <div className="relative w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.8)] border-2 border-cyan-300">
                            <motion.div
                              className="w-3 h-3 bg-white rounded-full"
                              animate={{
                                scale: [1, 0.5, 1]
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity
                              }}
                            />
                          </div>
                          <motion.div
                            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                            animate={{
                              opacity: [0.7, 1, 0.7]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity
                            }}
                          >
                            <div className="bg-cyan-500/90 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.6)]">
                              <span className="text-xs font-bold text-white">
                                Comparing
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
                            {steps.length > 0 && currentStep < steps.length && steps[currentStep].swappingIndices.length === 2 && (
                <>
                  {steps[currentStep].swappingIndices.map((index, i) => {
                    const barWidth = 100 / array.length;
                    const xPosition = index * barWidth + barWidth / 2;
                    const element = steps[currentStep].array[index];
                    const colorIndex = element.value % NEON_COLORS.length;
                    const color = NEON_COLORS[colorIndex];
                    
                    return (
                      <motion.div
                        key={`swap-trail-${index}-${currentStep}-${i}`}
                        className="absolute bottom-0 pointer-events-none"
                        style={{
                          left: `${xPosition}%`,
                          width: `${barWidth * 0.8}%`,
                          height: `${(element.value / 100) * 100}%`,
                          transform: 'translateX(-50%)',
                        }}
                        initial={{ opacity: 0.8, filter: 'blur(0px)' }}
                        animate={{ 
                          opacity: [0.8, 0.4, 0],
                          filter: ['blur(0px)', 'blur(8px)', 'blur(16px)'],
                          scale: [1, 1.1, 1.2]
                        }}
                        transition={{ 
                          duration: 0.6,
                          ease: 'easeOut'
                        }}
                      >
                        <div
                          className="w-full h-full rounded-t-lg"
                          style={{
                            background: `linear-gradient(to top, ${color}, ${color}88)`,
                            boxShadow: `0 0 30px ${color}88, inset 0 0 20px ${color}44`
                          }}
                        />
                      </motion.div>
                    );
                  })}
                  
                  {/* Swap arc trail connecting the two swapping elements */}
                  <motion.svg
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <defs>
                      <linearGradient id={`swap-gradient-${currentStep}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00ffff" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#ff00ff" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#00ffff" stopOpacity="0.8" />
                      </linearGradient>
                      <filter id={`motion-blur-${currentStep}`}>
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3,0" />
                      </filter>
                    </defs>
                    {steps[currentStep].swappingIndices.length === 2 && (() => {
                      const [idx1, idx2] = steps[currentStep].swappingIndices;
                      const barWidth = 100 / array.length;
                      const x1 = idx1 * barWidth + barWidth / 2;
                      const x2 = idx2 * barWidth + barWidth / 2;
                      const midY = 30;
                      
                      return (
                        <motion.path
                          d={`M ${x1}% 90% Q ${(x1 + x2) / 2}% ${midY}% ${x2}% 90%`}
                          stroke={`url(#swap-gradient-${currentStep})`}
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          filter={`url(#motion-blur-${currentStep})`}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ 
                            pathLength: [0, 1, 1],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 0.5,
                            ease: 'easeInOut'
                          }}
                        />
                      );
                    })()}
                  </motion.svg>
                  
                  {/* Particle burst effects at swap positions */}
                  {steps[currentStep].swappingIndices.map((index) => {
                    const barWidth = 100 / array.length;
                    const xPosition = index * barWidth + barWidth / 2;
                    
                    return (
                      <div key={`particles-${index}-${currentStep}`} className="absolute bottom-0 pointer-events-none" style={{ left: `${xPosition}%`, transform: 'translateX(-50%)' }}>
                        {[...Array(6)].map((_, particleIdx) => {
                          const angle = (particleIdx * 60) * (Math.PI / 180);
                          const distance = 40;
                          const xOffset = Math.cos(angle) * distance;
                          const yOffset = Math.sin(angle) * distance;
                          
                          return (
                            <motion.div
                              key={`particle-${particleIdx}`}
                              className="absolute w-2 h-2 rounded-full"
                              style={{
                                background: NEON_COLORS[particleIdx % NEON_COLORS.length],
                                boxShadow: `0 0 10px ${NEON_COLORS[particleIdx % NEON_COLORS.length]}`
                              }}
                              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                              animate={{ 
                                x: xOffset,
                                y: -yOffset,
                                opacity: 0,
                                scale: 0
                              }}
                              transition={{ 
                                duration: 0.6,
                                ease: 'easeOut'
                              }}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              )}</parameter>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-2xl shadow-purple-500/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-300 uppercase tracking-wider">
              Legend
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-cyan-400 to-cyan-600 rounded shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0,255,255,0.6)',
                    '0 0 25px rgba(0,255,255,0.8)',
                    '0 0 15px rgba(0,255,255,0.6)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-cyan-300">Default</span>
                <span className="text-xs text-gray-400">Unsorted</span>
              </div>
            </motion.div>

            {/* Comparing State */}
            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-yellow-400 to-yellow-600 rounded shadow-[0_0_15px_rgba(255,255,0,0.6)]"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(255,255,0,0.6)',
                    '0 0 30px rgba(255,255,0,1)',
                    '0 0 15px rgba(255,255,0,0.6)'
                  ],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-yellow-300">Comparing</span>
                <span className="text-xs text-gray-400">Active</span>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-pink-400 to-pink-600 rounded shadow-[0_0_15px_rgba(255,0,255,0.6)]"
                animate={{
                  x: [-3, 3, -3],
                  boxShadow: [
                    '0 0 15px rgba(255,0,255,0.6)',
                    '0 0 30px rgba(255,0,255,1)',
                    '0 0 15px rgba(255,0,255,0.6)'
                  ]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-pink-300">Swapping</span>
                <span className="text-xs text-gray-400">Moving</span>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-green-500/20 hover:border-green-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-green-400 to-green-600 rounded shadow-[0_0_15px_rgba(0,255,0,0.6)]"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0,255,0,0.6)',
                    '0 0 25px rgba(0,255,0,0.8)',
                    '0 0 15px rgba(0,255,0,0.6)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-green-300">Sorted</span>
                <span className="text-xs text-gray-400">Complete</span>
              </div>
            </motion.div>
          </div>

          {/* Progress Indicator */}
          {steps.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 pt-6 border-t border-purple-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-300 font-medium">Progress</span>
                <span className="text-sm text-purple-400 font-mono">
                  {currentStep} / {steps.length - 1}
                </span>
              </div>
              <div className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden border border-purple-500/30">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0}%`
                  }}
                  transition={{ duration: 0.3 }}
                />
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
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}