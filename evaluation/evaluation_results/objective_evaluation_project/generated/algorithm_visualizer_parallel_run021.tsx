import { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, BarChart3 } from 'lucide-react';
import { Activity, TrendingUp, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';


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

  // Animation effect
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1 && steps.length > 0) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length, speed]);

  // Update array display based on current step
  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      setArray(steps[currentStep].array);
    }
  }, [currentStep, steps]);
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

  const resetVisualization = useCallback(() => {

    setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
    generateRandomArray();
  }, [generateRandomArray]);

  const startVisualization = useCallback(() => {
    if (steps.length === 0) return;
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
    
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {    setIsPlaying(false);
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    const algorithmArray = [...array];
    const generatedSteps: AlgorithmStep[] = [];

    const addStep = (arr: ArrayElement[], comparing: number[] = [], swapping: number[] = [], sorted: number[] = []) => {
      generatedSteps.push({
        array: arr.map(el => ({ ...el })),
        comparingIndices: [...comparing],
        swappingIndices: [...swapping],
        sortedIndices: [...sorted]
      });
    };

    // Initial state
    addStep(algorithmArray);

    switch (algorithm) {
      case 'bubble': {
        const arr = [...algorithmArray];
        const n = arr.length;
        const sortedSet = new Set<number>();

        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            // Comparing
            addStep(arr, [j, j + 1], [], Array.from(sortedSet));

            if (arr[j].value > arr[j + 1].value) {
              // Swapping
              addStep(arr, [], [j, j + 1], Array.from(sortedSet));
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              addStep(arr, [], [], Array.from(sortedSet));
            }
          }
          sortedSet.add(n - i - 1);
          addStep(arr, [], [], Array.from(sortedSet));
        }
        sortedSet.add(0);
        addStep(arr, [], [], Array.from(sortedSet));
        break;
      }

      case 'insertion': {
        const arr = [...algorithmArray];
        const n = arr.length;
        const sortedSet = new Set<number>([0]);
        addStep(arr, [], [], [0]);

        for (let i = 1; i < n; i++) {
          const key = arr[i];
          let j = i - 1;

          addStep(arr, [i], [], Array.from(sortedSet));

          while (j >= 0 && arr[j].value > key.value) {
            addStep(arr, [j, j + 1], [], Array.from(sortedSet));
            addStep(arr, [], [j, j + 1], Array.from(sortedSet));
            arr[j + 1] = arr[j];
            addStep(arr, [], [], Array.from(sortedSet));
            j--;
          }

          arr[j + 1] = key;
          sortedSet.add(i);
          addStep(arr, [], [], Array.from(sortedSet));
        }
        break;
      }

      case 'quick': {
        const arr = [...algorithmArray];
        const sortedSet = new Set<number>();

        const partition = (low: number, high: number): number => {
          const pivot = arr[high].value;
          let i = low - 1;

          addStep(arr, [high], [], Array.from(sortedSet));

          for (let j = low; j < high; j++) {
            addStep(arr, [j, high], [], Array.from(sortedSet));

            if (arr[j].value < pivot) {
              i++;
              if (i !== j) {
                addStep(arr, [], [i, j], Array.from(sortedSet));
                [arr[i], arr[j]] = [arr[j], arr[i]];
                addStep(arr, [], [], Array.from(sortedSet));
              }
            }
          }

          addStep(arr, [], [i + 1, high], Array.from(sortedSet));
          [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
          sortedSet.add(i + 1);
          addStep(arr, [], [], Array.from(sortedSet));

          return i + 1;
        };

        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
          } else if (low === high) {
            sortedSet.add(low);
            addStep(arr, [], [], Array.from(sortedSet));
          }
        };

        quickSort(0, arr.length - 1);
        break;
      }

      case 'merge': {
        const arr = [...algorithmArray];
        const sortedSet = new Set<number>();

        const merge = (left: number, mid: number, right: number) => {
          const leftArr = arr.slice(left, mid + 1);
          const rightArr = arr.slice(mid + 1, right + 1);

          let i = 0, j = 0, k = left;

          while (i < leftArr.length && j < rightArr.length) {
            addStep(arr, [left + i, mid + 1 + j], [], Array.from(sortedSet));

            if (leftArr[i].value <= rightArr[j].value) {
              arr[k] = leftArr[i];
              i++;
            } else {
              arr[k] = rightArr[j];
              j++;
            }
            addStep(arr, [], [k], Array.from(sortedSet));
            k++;
          }

          while (i < leftArr.length) {
            arr[k] = leftArr[i];
            addStep(arr, [], [k], Array.from(sortedSet));
            i++;
            k++;
          }

          while (j < rightArr.length) {
            arr[k] = rightArr[j];
            addStep(arr, [], [k], Array.from(sortedSet));
            j++;
            k++;
          }

          if (right - left + 1 === arr.length) {
            for (let idx = left; idx <= right; idx++) {
              sortedSet.add(idx);
            }
          }
          addStep(arr, [], [], Array.from(sortedSet));
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
        
        for (let i = 0; i < arr.length; i++) {
          sortedSet.add(i);
        }
        addStep(arr, [], [], Array.from(sortedSet));
        break;
      }
    }

    setSteps(generatedSteps);
    setCurrentStep(0);
  }, [array]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          <motion.h1
            className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            animate={{
              textShadow: [
                "0 0 20px rgba(0, 255, 255, 0.5)",
                "0 0 40px rgba(255, 0, 255, 0.5)",
                "0 0 20px rgba(0, 255, 255, 0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Algorithm Visualizer
          </motion.h1>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-gray-300 font-medium">Algorithm:</span>
              <Select
                value={selectedAlgorithm}
                onValueChange={(value) => setSelectedAlgorithm(value as AlgorithmType)}
              >
                <SelectTrigger className="w-[200px] bg-gray-800/50 border-purple-500/50 text-white hover:border-purple-400 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-purple-500/50">
                  {mockAlgorithms.map((algo) => (
                    <SelectItem
                      key={algo.id}
                      value={algo.id}
                      className="text-white hover:bg-purple-500/20 focus:bg-purple-500/30"
                    >
                      {algo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm font-mono border-cyan-400/50 text-cyan-300 bg-cyan-400/10"
              >
                <BarChart3 className="w-4 h-4 mr-2 inline" />
                Complexity:{" "}
                {mockAlgorithms.find((a) => a.id === selectedAlgorithm)?.complexity}
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20"
        >
          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* Play/Pause and Reset Controls */}
            <div className="flex items-center gap-3">
              <Button
                onClick={isPlaying ? pauseVisualization : startVisualization}
                disabled={steps.length === 0}
                className="relative group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-6 py-6 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>

              <Button
                onClick={resetVisualization}
                className="relative group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-6 py-6 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-400/70"
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-4 min-w-[240px]">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-cyan-300 whitespace-nowrap">Speed</span>
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
                <div className="absolute -top-6 right-0 text-xs text-cyan-400 font-mono">
                  {speed[0]}%
                </div>
              </div>
            </div>

            {/* Array Size Control */}
            <div className="flex items-center gap-4 min-w-[240px]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-cyan-300 whitespace-nowrap">Size</span>
              </div>
              <div className="flex-1 relative">
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
                  step={5}
                  className="cursor-pointer"
                />
                <div className="absolute -top-6 right-0 text-xs text-green-400 font-mono">
                  {arraySize[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {steps.length > 0 && (
            <div className="mt-6 pt-6 border-t border-cyan-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-cyan-300 font-medium">Progress</span>
                <span className="text-xs text-cyan-400 font-mono">
                  {currentStep} / {steps.length}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
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

          {/* Visualization bars container */}
          <div className="relative h-96 flex items-end justify-center gap-1 px-4">
            {array.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <BarChart3 className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
                  <p className="text-purple-300 text-lg">Generate an array to start visualizing</p>
                </div>
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
                    className="relative flex-1 min-w-0 rounded-t-lg"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: `${heightPercentage}%`,
                      opacity: 1,
                      scale: isSwapping ? 1.1 : 1,
                      y: isSwapping ? -10 : 0
                    }}
                    transition={{
                      height: { duration: 0.3, ease: "easeOut" },
                      scale: { duration: 0.2 },
                      y: { duration: 0.2 }
                    }}
                    style={{
                      backgroundColor: isSorted 
                        ? '#00ff00' 
                        : isComparing 
                        ? '#ff00ff' 
                        : isSwapping 
                        ? '#ffff00' 
                        : NEON_COLORS[index % NEON_COLORS.length],
                      boxShadow: isComparing 
                        ? '0 0 20px #ff00ff, 0 0 40px #ff00ff' 
                        : isSwapping 
                        ? '0 0 20px #ffff00, 0 0 40px #ffff00'
                        : isSorted
                        ? '0 0 15px #00ff00'
                        : `0 0 10px ${NEON_COLORS[index % NEON_COLORS.length]}`
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
                          backgroundColor: '#ffff00',
                          filter: 'blur(8px)'
                        }}
                      />
                    )}

                    {/* Value label */}
                    {array.length <= 30 && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap">
                        {element.value}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Glowing bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" 
               style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Comparisons Stat */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <Activity className="w-6 h-6 text-cyan-400" />
                </div>
                <motion.div
                  key={comparisons}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-cyan-400"
                >
                  {comparisons}
                </motion.div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-400">Comparisons</h3>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((comparisons / (steps.length || 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Swaps Stat */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Shuffle className="w-6 h-6 text-purple-400" />
                </div>
                <motion.div
                  key={swaps}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-purple-400"
                >
                  {swaps}
                </motion.div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-400">Swaps</h3>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((swaps / (steps.length || 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Current Step Stat */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <motion.div
                  key={currentStep}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-green-400"
                >
                  {currentStep}
                </motion.div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-400">
                  Current Step
                  <span className="text-xs ml-2 text-gray-500">
                    / {steps.length}
                  </span>
                </h3>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${steps.length > 0 ? (currentStep / steps.length) * 100 : 0}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}