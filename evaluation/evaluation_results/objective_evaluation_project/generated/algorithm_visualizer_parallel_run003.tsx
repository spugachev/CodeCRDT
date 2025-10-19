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

// Hook to handle step-by-step animation
const useAnimationLoop = (
  isPlaying: boolean,
  steps: AlgorithmStep[],
  currentStep: number,
  speed: number[],
  onStepComplete: () => void,
  onAnimationEnd: () => void
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
      timeoutRef.current = setTimeout(() => {
        onStepComplete();
      }, delay);
    } else if (isPlaying && currentStep >= steps.length) {
      onAnimationEnd();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length, speed, onStepComplete, onAnimationEnd]);
};

export default function AlgorithmVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [arraySize, setArraySize] = useState([20]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bubble');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);

  const generateRandomArray = useCallback(() => {
    const newArray: ArrayElement[] = Array.from({ length: arraySize[0] }, (_, i) => ({
      value: Math.floor(Math.random() * 100) + 5,
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

  const startVisualization = useCallback(() => {
    if (steps.length === 0) return;
    if (currentStep >= steps.length) return;
    
    setIsPlaying(true);
  }, [steps, speed, currentStep]);

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
              className="text-2xl font-semibold text-cyan-300"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name}
            </motion.div>
            <motion.div
              className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/50 backdrop-blur-sm"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' }}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-300" />
                <span className="text-purple-200 font-mono">
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
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-shadow duration-300"
            >
              <div className="space-y-6">
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 mb-4">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Algorithm</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          generateSortingSteps(algo.id as AlgorithmType);
                        }}
                        disabled={isPlaying}
                        className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-semibold text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-purple-400">
                    <BarChart3 className="w-5 h-5" />
                    <label className="font-semibold">Array Size: {arraySize[0]}</label>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={(value) => {
                      setArraySize(value);
                      if (!isPlaying) {
                        generateRandomArray();
                      }
                    }}
                    min={5}
                    max={50}
                    step={1}
                    disabled={isPlaying}
                    className="cursor-pointer"
                  />
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-pink-400">
                    <Zap className="w-5 h-5" />
                    <label className="font-semibold">Speed: {speed[0]}%</label>
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
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        {currentStep >= steps.length ? 'Restart' : 'Play'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    variant="outline"
                    className="w-full border-2 border-purple-500/50 bg-gray-800/50 hover:bg-purple-500/20 hover:border-purple-400 text-purple-300 font-bold py-6 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Progress Indicator */}
                {steps.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-gray-700">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Progress</span>
                      <span>{Math.min(currentStep, steps.length)} / {steps.length}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(Math.min(currentStep, steps.length) / steps.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
            <div className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Algorithm
                  </h3>
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
                          <span className={`text-sm font-medium ${
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
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2 [&>span]:rounded-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    className="flex-1 relative group overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 p-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative bg-gray-900 rounded-lg px-4 py-3 flex items-center justify-center gap-2 group-hover:bg-gray-900/80 transition-colors">
                      <motion.div
                        animate={{
                          rotate: isPlaying ? 0 : 0,
                          scale: isPlaying ? 1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <Play className="w-5 h-5 text-cyan-400" />
                        )}
                      </motion.div>
                      <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {isPlaying ? 'Pause' : 'Play'}
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg"
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          boxShadow: [
                            '0 0 20px rgba(0, 255, 255, 0.3)',
                            '0 0 40px rgba(168, 85, 247, 0.5)',
                            '0 0 20px rgba(0, 255, 255, 0.3)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </motion.button>
                  <motion.button
                    onClick={resetVisualization}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg font-semibold shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80 transition-all duration-300 flex items-center justify-center gap-2 border border-pink-400/50"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 0 30px rgba(236, 72, 153, 0.8)'
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      rotate: 360
                    }}
                    transition={{ 
                      rotate: { duration: 0.6, ease: "easeInOut" }
                    }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </motion.button>
                </div>
              </div>
            </div>

            <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-2xl shadow-purple-500/20"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-400 mb-4">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-bold text-lg">Statistics</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Comparisons Counter */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/30 p-4"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative z-10">
                    <div className="text-xs text-cyan-400 font-medium mb-1 uppercase tracking-wider">
                      Comparisons
                    </div>
                    <motion.div
                      className="text-3xl font-bold text-cyan-300"
                      key={currentStep}
                      initial={{ scale: 1.2, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {steps[currentStep]?.comparingIndices.length > 0 ? currentStep : 0}
                    </motion.div>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      x: [-100, 100]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>

                {/* Swaps Counter */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/30 p-4"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(236, 72, 153, 0.4)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative z-10">
                    <div className="text-xs text-pink-400 font-medium mb-1 uppercase tracking-wider">
                      Swaps
                    </div>
                    <motion.div
                      className="text-3xl font-bold text-pink-300"
                      key={`swap-${currentStep}`}
                      initial={{ scale: 1.2, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {steps[currentStep]?.swappingIndices.length > 0 ? Math.floor(currentStep / 2) : 0}
                    </motion.div>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-transparent"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      x: [-100, 100]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  />
                </motion.div>

                {/* Progress Bar */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 p-4"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-purple-400 font-medium uppercase tracking-wider">
                        Progress
                      </div>
                      <div className="text-xs text-purple-300 font-mono">
                        {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                      </div>
                    </div>
                    <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden border border-purple-500/20">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ['-100%', '200%']
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Sorted Elements Counter */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 p-4"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(34, 197, 94, 0.4)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative z-10">
                    <div className="text-xs text-green-400 font-medium mb-1 uppercase tracking-wider">
                      Sorted Elements
                    </div>
                    <div className="flex items-baseline gap-2">
                      <motion.div
                        className="text-3xl font-bold text-green-300"
                        key={`sorted-${currentStep}`}
                        initial={{ scale: 1.2, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {steps[currentStep]?.sortedIndices.length || 0}
                      </motion.div>
                      <div className="text-sm text-green-400/60">
                        / {array.length}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      x: [-100, 100]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  />
                </motion.div>

                {/* Current Step Indicator */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 p-4"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(234, 179, 8, 0.4)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative z-10">
                    <div className="text-xs text-yellow-400 font-medium mb-1 uppercase tracking-wider">
                      Current Step
                    </div>
                    <div className="flex items-baseline gap-2">
                      <motion.div
                        className="text-3xl font-bold text-yellow-300"
                        key={`step-${currentStep}`}
                        initial={{ scale: 1.2, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {currentStep}
                      </motion.div>
                      <div className="text-sm text-yellow-400/60">
                        / {steps.length}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      x: [-100, 100]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  />
                </motion.div>
              </div>

              {/* Status Indicator */}
              <motion.div
                className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50"
                animate={{
                  borderColor: isPlaying 
                    ? ['rgba(34, 211, 238, 0.5)', 'rgba(168, 85, 247, 0.5)', 'rgba(34, 211, 238, 0.5)']
                    : 'rgba(107, 114, 128, 0.5)'
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Status</span>
                  <motion.div
                    className="flex items-center gap-2"
                    animate={{
                      opacity: isPlaying ? [1, 0.6, 1] : 1
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        isPlaying ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                      animate={{
                        boxShadow: isPlaying 
                          ? ['0 0 5px rgba(34, 197, 94, 0.8)', '0 0 15px rgba(34, 197, 94, 0.8)', '0 0 5px rgba(34, 197, 94, 0.8)']
                          : '0 0 0px rgba(107, 114, 128, 0)'
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className={`text-sm font-medium ${
                      isPlaying ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {isPlaying ? 'Running' : 'Paused'}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-8 shadow-2xl shadow-purple-500/20 min-h-[600px]">
              {/* TODO:VisualizationCanvas Main canvas with animated bars, comparison indicators, and swap trails */}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {array.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <BarChart3 className="w-24 h-24 text-cyan-400/50 mx-auto" />
                      </motion.div>
                      <p className="text-cyan-300/70 text-lg font-semibold">
                        Generate an array to begin
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  (steps.length > 0 && currentStep < steps.length ? steps[currentStep].array : array).map((element, index) => {
                    const currentArray = steps.length > 0 && currentStep < steps.length ? steps[currentStep] : null;
                    const isComparing = currentArray?.comparingIndices.includes(index);
                    const isSwapping = currentArray?.swappingIndices.includes(index);
                    const isSorted = currentArray?.sortedIndices.includes(index);
                    
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
                    const getBarColor = () => {
                      if (isSorted) return '#00ff00';
                      if (isSwapping) return '#ff0066';
                      if (isComparing) return '#ffff00';
                      return NEON_COLORS[index % NEON_COLORS.length];
                    };

                    const barColor = getBarColor();

                    return (
                      <motion.div
                        key={element.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: isSwapping ? 1.15 : isComparing ? 1.1 : 1,
                          height: `${heightPercentage}%`,
                          backgroundColor: barColor,
                          boxShadow: [
                            `0 0 ${isSwapping ? '40px' : isComparing ? '30px' : '20px'} ${barColor}`,
                            `0 0 ${isSwapping ? '50px' : isComparing ? '40px' : '25px'} ${barColor}`,
                            `0 0 ${isSwapping ? '40px' : isComparing ? '30px' : '20px'} ${barColor}`
                          ]
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          layout: { type: 'spring', stiffness: 300, damping: 30 },
                          height: { duration: 0.3, ease: 'easeInOut' },
                          backgroundColor: { duration: 0.2 },
                          scale: { duration: 0.2 },
                          boxShadow: { duration: 1, repeat: Infinity }
                        }}
                        className="relative rounded-t-lg min-w-[8px] flex-1 max-w-[60px] border-t-2 border-white/30"
                        style={{
                          background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                        }}
                      >
                        {/* Value label */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: array.length <= 30 ? 1 : 0 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap"
                          style={{
                            textShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}`
                          }}
                        >
                          {element.value}
                        </motion.div>

                        {/* Glow effect overlay */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          animate={{
                            opacity: isSwapping ? [0.3, 0.7, 0.3] : isComparing ? [0.2, 0.5, 0.2] : [0.1, 0.3, 0.1]
                          }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          style={{
                            background: `linear-gradient(to top, transparent, ${barColor}88)`,
                          }}
                        />

                        {/* Status indicator */}
                        {(isComparing || isSwapping || isSorted) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2"
                          >
                            {isSorted && (
                              <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-6 h-6 rounded-full bg-green-400 border-2 border-green-300 shadow-[0_0_20px_rgba(0,255,0,0.8)]"
                              />
                            )}
                            {isSwapping && !isSorted && (
                              <motion.div
                                animate={{ rotate: [0, 180, 360] }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                                className="w-6 h-6 rounded-full bg-pink-500 border-2 border-pink-300 shadow-[0_0_20px_rgba(255,0,102,0.8)]"
                              />
                            )}
                            {isComparing && !isSwapping && !isSorted && (
                              <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-300 shadow-[0_0_20px_rgba(255,255,0,0.8)]"
                              />
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })
                )}</parameter>
</invoke>
              </div>

              
              {steps.length > 0 && currentStep < steps.length && steps[currentStep].comparingIndices.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {steps[currentStep].comparingIndices.map((index, i) => {
                    const barWidth = 100 / (array.length || 1);
                    const xPosition = index * barWidth + barWidth / 2;
                    
                    return (
                      <motion.div
                        key={`compare-${index}-${i}`}
                        initial={{ opacity: 0, y: -20, scale: 0.5 }}
                        animate={{ 
                          opacity: [0, 1, 1, 0],
                          y: [-20, 0, 0, -20],
                          scale: [0.5, 1.2, 1.2, 0.5]
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute top-0"
                        style={{ left: `${xPosition}%`, transform: 'translateX(-50%)' }}
                      >
                        <motion.div
                          className="relative"
                          animate={{
                            rotate: [0, 360],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.8)]">
                            <motion.div
                              className="w-6 h-6 rounded-full bg-yellow-300 flex items-center justify-center"
                              animate={{
                                boxShadow: [
                                  '0 0 10px rgba(251,191,36,0.6)',
                                  '0 0 25px rgba(251,191,36,1)',
                                  '0 0 10px rgba(251,191,36,0.6)'
                                ]
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity
                              }}
                            >
                              <span className="text-xs font-bold text-gray-900">?</span>
                            </motion.div>
                          </div>
                        </motion.div>
                        
                        {/* Connecting line to bar */}
                        <motion.div
                          className="absolute top-8 left-1/2 w-0.5 bg-gradient-to-b from-yellow-400 to-transparent"
                          initial={{ height: 0 }}
                          animate={{ height: 40 }}
                          transition={{ duration: 0.3 }}
                          style={{ transform: 'translateX(-50%)' }}
                        />
                        
                        {/* Pulsing ring effect */}
                        <motion.div
                          className="absolute top-0 left-0 w-8 h-8 rounded-full border-2 border-yellow-400"
                          animate={{
                            scale: [1, 2, 2],
                            opacity: [0.8, 0, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                        />
                      </motion.div>
                    );
                  })}
                  
                  {/* Comparison arc connecting compared elements */}
                  {steps[currentStep].comparingIndices.length === 2 && (
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.path
                        d={(() => {
                          const barWidth = 100 / (array.length || 1);
                          const x1 = steps[currentStep].comparingIndices[0] * barWidth + barWidth / 2;
                          const x2 = steps[currentStep].comparingIndices[1] * barWidth + barWidth / 2;
                          const y = 60;
                          const midX = (x1 + x2) / 2;
                          const controlY = y - Math.abs(x2 - x1) * 0.3;
                          
                          return `M ${x1}% ${y} Q ${midX}% ${controlY} ${x2}% ${y}`;
                        })()}
                        stroke="url(#compareGradient)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ 
                          pathLength: [0, 1, 1, 0],
                          opacity: [0, 1, 1, 0]
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))'
                        }}
                      />
                      <defs>
                        <linearGradient id="compareGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                    </motion.svg>
                  )}
                </div>
              )}
              
                            {steps.length > 0 && currentStep < steps.length && steps[currentStep].swappingIndices.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {steps[currentStep].swappingIndices.map((index, i) => {
                    const maxHeight = 500;
                    const barWidth = Math.max(8, Math.min(60, (100 / arraySize[0]) * 8));
                    const gap = 4;
                    const totalWidth = array.length * (barWidth + gap);
                    const startX = (800 - totalWidth) / 2;
                    const xPosition = startX + index * (barWidth + gap) + barWidth / 2;
                    const element = steps[currentStep].array[index];
                    const height = (element.value / 100) * maxHeight;
                    const yPosition = maxHeight - height;

                    return (
                      <motion.div
                        key={`trail-${index}-${i}`}
                        className="absolute"
                        style={{
                          left: xPosition,
                          bottom: 0,
                          width: barWidth,
                          height: height,
                        }}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ 
                          opacity: [0.8, 0.4, 0],
                          scale: [1, 1.2, 1.4],
                          filter: [
                            'blur(0px) brightness(1.5)',
                            'blur(8px) brightness(1.2)',
                            'blur(16px) brightness(0.8)'
                          ]
                        }}
                        transition={{ 
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                      >
                        <div 
                          className="w-full h-full rounded-t-lg"
                          style={{
                            background: `linear-gradient(to top, ${NEON_COLORS[index % NEON_COLORS.length]}, ${NEON_COLORS[(index + 1) % NEON_COLORS.length]})`,
                            boxShadow: `0 0 30px ${NEON_COLORS[index % NEON_COLORS.length]}, 0 0 60px ${NEON_COLORS[index % NEON_COLORS.length]}`,
                          }}
                        />
                      </motion.div>
                    );
                  })}
                  
                  {/* Swap connection line with motion blur */}
                  {steps[currentStep].swappingIndices.length === 2 && (
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <defs>
                        <filter id="motionBlur">
                          <feGaussianBlur in="SourceGraphic" stdDeviation="8,0" />
                        </filter>
                        <linearGradient id="swapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={NEON_COLORS[steps[currentStep].swappingIndices[0] % NEON_COLORS.length]} stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                          <stop offset="100%" stopColor={NEON_COLORS[steps[currentStep].swappingIndices[1] % NEON_COLORS.length]} stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                      <motion.path
                        d={(() => {
                          const barWidth = Math.max(8, Math.min(60, (100 / arraySize[0]) * 8));
                          const gap = 4;
                          const totalWidth = array.length * (barWidth + gap);
                          const startX = (800 - totalWidth) / 2;
                          const x1 = startX + steps[currentStep].swappingIndices[0] * (barWidth + gap) + barWidth / 2;
                          const x2 = startX + steps[currentStep].swappingIndices[1] * (barWidth + gap) + barWidth / 2;
                          const y = 50;
                          const controlY = y - 40;
                          return `M ${x1} ${y} Q ${(x1 + x2) / 2} ${controlY} ${x2} ${y}`;
                        })()}
                        stroke="url(#swapGradient)"
                        strokeWidth="3"
                        fill="none"
                        filter="url(#motionBlur)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ 
                          pathLength: [0, 1, 1],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </motion.svg>
                  )}
                  
                  {/* Particle burst effects at swap positions */}
                  {steps[currentStep].swappingIndices.map((index) => {
                    const barWidth = Math.max(8, Math.min(60, (100 / arraySize[0]) * 8));
                    const gap = 4;
                    const totalWidth = array.length * (barWidth + gap);
                    const startX = (800 - totalWidth) / 2;
                    const xPosition = startX + index * (barWidth + gap) + barWidth / 2;

                    return (
                      <div key={`particles-${index}`} className="absolute" style={{ left: xPosition, top: 40 }}>
                        {[...Array(8)].map((_, particleIndex) => {
                          const angle = (particleIndex / 8) * Math.PI * 2;
                          const distance = 30;
                          const x = Math.cos(angle) * distance;
                          const y = Math.sin(angle) * distance;
                          
                          return (
                            <motion.div
                              key={particleIndex}
                              className="absolute w-2 h-2 rounded-full"
                              style={{
                                background: NEON_COLORS[index % NEON_COLORS.length],
                                boxShadow: `0 0 10px ${NEON_COLORS[index % NEON_COLORS.length]}`,
                              }}
                              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                              animate={{ 
                                x: x,
                                y: y,
                                opacity: 0,
                                scale: 0
                              }}
                              transition={{ 
                                duration: 0.6,
                                ease: "easeOut"
                              }}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 255, 0.5)' }}
              transition={{ duration: 0.2 }}
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

            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 0, 0.5)' }}
              transition={{ duration: 0.2 }}
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
                <div className="text-sm font-semibold text-white">Comparing</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 0, 102, 0.5)' }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-pink-600 to-pink-400"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(255, 0, 102, 0.6)',
                    '0 0 30px rgba(255, 0, 102, 1)',
                    '0 0 15px rgba(255, 0, 102, 0.6)'
                  ],
                  x: [-2, 2, -2]
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Swapping</div>
                <div className="text-xs text-gray-400">Moving</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 0, 0.5)' }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-green-600 to-green-400"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(0, 255, 0, 0.5)',
                    '0 0 20px rgba(0, 255, 0, 0.8)',
                    '0 0 10px rgba(0, 255, 0, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Sorted</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}