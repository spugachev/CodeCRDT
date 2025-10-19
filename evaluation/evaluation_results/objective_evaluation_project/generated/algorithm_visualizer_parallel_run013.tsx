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

const useAnimationLoop = (
  steps: AlgorithmStep[],
  currentStep: number,
  speed: number[],
  isPlaying: boolean,
  onStepChange: (step: number) => void,
  onComplete: () => void
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
      const delay = 1000 - speed[0] * 9.5;
      const id = setTimeout(() => {
        onStepChange(currentStep + 1);
      }, delay);
      setAnimationId(id);
    } else {
      onComplete();
    }
  }, [currentStep, steps.length, speed, onStepChange, onComplete]);

  return { animate, cleanup };
};
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

  const pauseVisualization = useCallback(() => {

    setIsPlaying(false);
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    const algorithmArray = [...array];
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
    addStep(algorithmArray);

    switch (algorithm) {
      case 'bubble': {
        const arr = [...algorithmArray];
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
        const arr = [...algorithmArray];
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
        const arr = [...algorithmArray];
        const sortedIndices: number[] = [];

        const partition = (low: number, high: number): number => {
          const pivot = arr[high].value;
          let i = low - 1;

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
        const arr = [...algorithmArray];
        const sortedIndices: number[] = [];

        const merge = (left: number, mid: number, right: number) => {
          const leftArr = arr.slice(left, mid + 1);
          const rightArr = arr.slice(mid + 1, right + 1);
          
          let i = 0, j = 0, k = left;

          while (i < leftArr.length && j < rightArr.length) {
            addStep(arr, [left + i, mid + 1 + j], [], sortedIndices);
            
            if (leftArr[i].value <= rightArr[j].value) {
              arr[k] = leftArr[i];
              i++;
            } else {
              arr[k] = rightArr[j];
              j++;
            }
            addStep(arr, [], [k], sortedIndices);
            k++;
          }

          while (i < leftArr.length) {
            arr[k] = leftArr[i];
            addStep(arr, [], [k], sortedIndices);
            i++;
            k++;
          }

          while (j < rightArr.length) {
            arr[k] = rightArr[j];
            addStep(arr, [], [k], sortedIndices);
            j++;
            k++;
          }

          addStep(arr, [], [], sortedIndices);
        };

        const mergeSort = (left: number, right: number) => {
          if (left < right) {
            const mid = Math.floor((left + right) / 2);
            mergeSort(left, mid);
            mergeSort(mid + 1, right);
            merge(left, mid, right);
          } else if (left === right) {
            sortedIndices.push(left);
            addStep(arr, [], [], sortedIndices);
          }
        };

        mergeSort(0, arr.length - 1);
        
        // Mark all as sorted at the end
        for (let i = 0; i < arr.length; i++) {
          if (!sortedIndices.includes(i)) {
            sortedIndices.push(i);
          }
        }
        addStep(arr, [], [], sortedIndices);
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
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="px-6 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full backdrop-blur-sm"
            >
              <span className="text-2xl font-semibold text-purple-300">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name}
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
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-lg font-mono text-cyan-300 relative z-10">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
              </span>
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
                      <button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        disabled={isPlaying}
                        className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-medium text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-purple-400">
                    <BarChart3 className="w-4 h-4" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Array Size</h3>
                  </div>
                  <div className="space-y-2">
                    <Slider
                      value={arraySize}
                      onValueChange={setArraySize}
                      min={5}
                      max={50}
                      step={1}
                      disabled={isPlaying}
                      className="cursor-pointer"
                    />
                    <div className="text-center">
                      <span className="text-2xl font-bold text-white bg-purple-500/20 px-4 py-1 rounded-lg border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        {arraySize[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-pink-400">
                    <Zap className="w-4 h-4" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider">Speed</h3>
                  </div>
                  <div className="space-y-2">
                    <Slider
                      value={speed}
                      onValueChange={setSpeed}
                      min={10}
                      max={100}
                      step={10}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Slow</span>
                      <span className="text-pink-400 font-semibold">{speed[0]}%</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="space-y-2 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || currentStep >= steps.length}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {currentStep > 0 ? 'Resume' : 'Start'}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={() => {
                      generateRandomArray();
                      generateSortingSteps(selectedAlgorithm);
                    }}
                    variant="outline"
                    disabled={isPlaying}
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate New
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-400 font-semibold">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Array Length:</span>
                    <span className="text-purple-400 font-semibold">{array.length}</span>
                  </div>
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
                        className={`relative p-4 rounded-lg border-2 transition-all duration-300 text-left overflow-hidden group ${
                          selectedAlgorithm === algo.id
                            ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/50'
                            : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:bg-cyan-500/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                          selectedAlgorithm === algo.id ? 'opacity-100' : ''
                        }`} />
                        <div className="relative z-10">
                          <div className="font-semibold text-white mb-1">{algo.name}</div>
                          <div className={`text-xs font-mono ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-400'
                          }`}>
                            {algo.complexity}
                          </div>
                        </div>
                        {selectedAlgorithm === algo.id && (
                          <motion.div
                            className="absolute top-2 right-2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80" />
                          </motion.div>
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
                  />
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
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-xl [&_[role=slider]]:hover:shadow-purple-400/60 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2 [&>span]:rounded-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    className="flex-1 relative group overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className={`relative px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-300 ${
                        array.length === 0 || (steps.length === 0 && !isPlaying)
                          ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                          : isPlaying
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.6)]'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                      }`}
                      animate={
                        array.length > 0 && (steps.length > 0 || isPlaying)
                          ? {
                              boxShadow: isPlaying
                                ? [
                                    '0 0 30px rgba(236,72,153,0.6)',
                                    '0 0 50px rgba(236,72,153,0.8)',
                                    '0 0 30px rgba(236,72,153,0.6)'
                                  ]
                                : [
                                    '0 0 30px rgba(6,182,212,0.6)',
                                    '0 0 50px rgba(6,182,212,0.8)',
                                    '0 0 30px rgba(6,182,212,0.6)'
                                  ]
                            }
                          : {}
                      }
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          key={isPlaying ? 'pause' : 'play'}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" fill="currentColor" />
                          ) : (
                            <Play className="w-5 h-5" fill="currentColor" />
                          )}
                        </motion.div>
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </div>
                    </motion.div>
                    
                    {/* Animated background glow */}
                    {array.length > 0 && (steps.length > 0 || isPlaying) && (
                      <motion.div
                        className={`absolute inset-0 rounded-lg blur-xl -z-10 ${
                          isPlaying
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.button></parameter>
</invoke>
                  <motion.button
                    onClick={resetVisualization}
                    className="flex-1 relative overflow-hidden group bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-2 border-pink-500/50 rounded-lg px-6 py-3 hover:border-pink-400 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/60 hover:shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/30 to-pink-500/0"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        <RotateCcw className="w-5 h-5 text-pink-300" />
                      </motion.div>
                      <span className="font-semibold text-white">Reset</span>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        boxShadow: '0 0 20px rgba(236, 72, 153, 0.6), inset 0 0 20px rgba(236, 72, 153, 0.2)'
                      }}
                    />
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

                <div className="grid grid-cols-1 gap-4">
                  {/* Comparisons Counter */}
                  <motion.div
                    className="relative overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-400/30 p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="relative z-10">
                      <div className="text-xs text-cyan-300 uppercase tracking-wider mb-2">Comparisons</div>
                      <motion.div
                        key={comparisons}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-bold text-white"
                      >
                        {comparisons}
                      </motion.div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <motion.div
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{
                          boxShadow: [
                            '0 0 5px rgba(34,211,238,0.5)',
                            '0 0 20px rgba(34,211,238,1)',
                            '0 0 5px rgba(34,211,238,0.5)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>

                  {/* Swaps Counter */}
                  <motion.div
                    className="relative overflow-hidden rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-400/30 p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
                    />
                    <div className="relative z-10">
                      <div className="text-xs text-pink-300 uppercase tracking-wider mb-2">Swaps</div>
                      <motion.div
                        key={swaps}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-bold text-white"
                      >
                        {swaps}
                      </motion.div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <motion.div
                        className="w-2 h-2 bg-pink-400 rounded-full"
                        animate={{
                          boxShadow: [
                            '0 0 5px rgba(244,114,182,0.5)',
                            '0 0 20px rgba(244,114,182,1)',
                            '0 0 5px rgba(244,114,182,0.5)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      />
                    </div>
                  </motion.div>

                  {/* Progress Indicator */}
                  <motion.div
                    className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-400/30 p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-purple-300 uppercase tracking-wider">Progress</div>
                        <motion.div
                          key={steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-lg font-bold text-white"
                        >
                          {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                        </motion.div>
                      </div>
                      <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden border border-purple-400/20">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                          }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          />
                        </motion.div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                        <span>Step {currentStep}</span>
                        <span>of {steps.length}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Algorithm Status */}
                  <motion.div
                    className="relative overflow-hidden rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-400/30 p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="relative z-10">
                      <div className="text-xs text-green-300 uppercase tracking-wider mb-2">Status</div>
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-3 h-3 rounded-full"
                          animate={{
                            backgroundColor: isPlaying
                              ? ['#10b981', '#34d399', '#10b981']
                              : steps.length > 0 && currentStep === steps.length
                              ? '#10b981'
                              : '#6b7280',
                            boxShadow: isPlaying
                              ? [
                                  '0 0 5px rgba(16,185,129,0.5)',
                                  '0 0 15px rgba(16,185,129,1)',
                                  '0 0 5px rgba(16,185,129,0.5)'
                                ]
                              : '0 0 0px rgba(16,185,129,0)'
                          }}
                          transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
                        />
                        <span className="text-sm font-medium text-white">
                          {isPlaying
                            ? 'Running...'
                            : steps.length > 0 && currentStep === steps.length
                            ? 'Completed'
                            : array.length > 0
                            ? 'Ready'
                            : 'Generate Array'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
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
                    <h3 className="text-2xl font-bold text-white">Ready to Visualize</h3>
                    <p className="text-gray-400">Generate an array to begin sorting</p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {/* Comparison Indicators */}
                  {steps[currentStep]?.comparingIndices.map((index, i) => {
                    const barWidth = 100 / array.length;
                    const leftPosition = index * barWidth;
                    
                    return (
                      <motion.div
                        key={`compare-${index}-${i}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-0 pointer-events-none"
                        style={{
                          left: `${leftPosition}%`,
                          width: `${barWidth}%`
                        }}
                      >
                        <motion.div
                          animate={{
                            y: [0, -10, 0],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="w-full flex justify-center"
                        >
                          <div className="w-8 h-8 rounded-full bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)] flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-yellow-200 animate-pulse" />
                          </div>
                        </motion.div>
                        <motion.div
                          className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-yellow-400 to-transparent"
                          animate={{
                            height: ['0%', '100%'],
                            opacity: [1, 0.3]
                          }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          style={{ height: '100%' }}
                        />
                      </motion.div>
                    );
                  })}

                  {/* Swap Trail Effects */}
                  {steps[currentStep]?.swappingIndices.map((index, i) => {
                    const barWidth = 100 / array.length;
                    const leftPosition = index * barWidth;
                    
                    return (
                      <motion.div
                        key={`swap-${index}-${i}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 2, 0.5] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                          left: `${leftPosition}%`,
                          width: `${barWidth}%`
                        }}
                      >
                        <div className="w-full flex justify-center">
                          <motion.div
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                            style={{
                              boxShadow: '0 0 40px rgba(236, 72, 153, 0.8), 0 0 60px rgba(168, 85, 247, 0.6)'
                            }}
                            animate={{
                              rotate: [0, 360]
                            }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Animated Bars */}
                  {(steps[currentStep]?.array || array).map((element, index) => {
                    const isComparing = steps[currentStep]?.comparingIndices.includes(index);
                    const isSwapping = steps[currentStep]?.swappingIndices.includes(index);
                    const isSorted = steps[currentStep]?.sortedIndices.includes(index);
                    
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let shadowColor = barColor;
                    let glowIntensity = 0.5;
                    
                    if (isSorted) {
                      barColor = '#00ff00';
                      shadowColor = '#00ff00';
                      glowIntensity = 0.8;
                    } else if (isSwapping) {
                      barColor = '#ff00ff';
                      shadowColor = '#ff00ff';
                      glowIntensity = 1;
                    } else if (isComparing) {
                      barColor = '#ffff00';
                      shadowColor = '#ffff00';
                      glowIntensity = 0.9;
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        layout
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          y: isSwapping ? [-20, 0] : 0,
                          scale: isComparing ? [1, 1.1, 1] : 1
                        }}
                        transition={{
                          height: { duration: 0.5, ease: 'easeOut' },
                          opacity: { duration: 0.3 },
                          y: { duration: 0.4, ease: 'easeInOut' },
                          scale: { duration: 0.3, repeat: isComparing ? Infinity : 0 },
                          layout: { duration: 0.5, ease: 'easeInOut' }
                        }}
                        className="relative flex-1 min-w-[4px] rounded-t-lg transition-all duration-300"
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `
                            0 0 ${20 * glowIntensity}px ${shadowColor},
                            0 0 ${40 * glowIntensity}px ${shadowColor},
                            inset 0 0 ${10 * glowIntensity}px rgba(255, 255, 255, 0.3)
                          `,
                          border: `1px solid ${barColor}`
                        }}
                      >
                        {/* Value Label */}
                        {array.length <= 30 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap"
                            style={{
                              textShadow: `0 0 10px ${shadowColor}`
                            }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                        
                        {/* Glow Effect Overlay */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          animate={{
                            background: [
                              `linear-gradient(to top, transparent, ${barColor}40)`,
                              `linear-gradient(to top, transparent, ${barColor}80)`,
                              `linear-gradient(to top, transparent, ${barColor}40)`
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        
                        {/* Particle Effect for Sorted Bars */}
                        {isSorted && (
                          <>
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={`particle-${i}`}
                                initial={{ y: 0, opacity: 1, scale: 1 }}
                                animate={{
                                  y: [-50, -100],
                                  opacity: [1, 0],
                                  scale: [1, 0],
                                  x: [0, (Math.random() - 0.5) * 30]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.3,
                                  ease: 'easeOut'
                                }}
                                className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full bg-green-400"
                                style={{
                                  boxShadow: '0 0 10px rgba(0, 255, 0, 0.8)'
                                }}
                              />
                            ))}
                          </>
                        )}
                        
                        {/* Swap Trail Effect */}
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: [0, 0.8, 0],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            style={{
                              background: `radial-gradient(circle, ${barColor}80, transparent)`,
                              filter: 'blur(8px)'
                            }}
                          />
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
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50 blur-xl"
                      />
                      <p className="text-gray-400 text-lg">Generate an array to begin</p>
                    </div>
                  </motion.div>
                ) : (
                  array.map((element, index) => {
                    const step = steps[currentStep];
                    const isComparing = step?.comparingIndices.includes(index);
                    const isSwapping = step?.swappingIndices.includes(index);
                    const isSorted = step?.sortedIndices.includes(index);
                    
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
                        layout
                        initial={{ opacity: 0, scale: 0, y: 50 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          height: `${heightPercentage}%`
                        }}
                        transition={{
                          height: { duration: 0.3, ease: 'easeInOut' },
                          layout: { duration: 0.5, ease: 'easeInOut' },
                          opacity: { duration: 0.3 },
                          scale: { duration: 0.3 }
                        }}
                        className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `
                            0 0 ${glowIntensity * 20}px ${glowColor},
                            0 0 ${glowIntensity * 40}px ${glowColor},
                            inset 0 0 ${glowIntensity * 10}px rgba(255, 255, 255, 0.5)
                          `,
                          border: `1px solid ${barColor}`,
                          filter: `brightness(${isSwapping ? 1.5 : isComparing ? 1.3 : isSorted ? 1.2 : 1})`
                        }}
                      >
                        {/* Animated glow pulse for active states */}
                        {(isComparing || isSwapping) && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            animate={{
                              opacity: [0.5, 1, 0.5],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                            style={{
                              backgroundColor: barColor,
                              filter: 'blur(4px)'
                            }}
                          />
                        )}
                        
                        {/* Sorted celebration effect */}
                        {isSorted && (
                          <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: [0, 1, 0], y: -40 }}
                            transition={{ duration: 0.8 }}
                            className="absolute -top-10 left-1/2 transform -translate-x-1/2"
                          >
                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/80" />
                          </motion.div>
                        )}
                        
                        {/* Swap trail effect */}
                        {isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 0.8, 0] }}
                              transition={{ duration: 0.5 }}
                              style={{
                                background: `linear-gradient(to top, ${barColor}, transparent)`,
                                filter: 'blur(8px)'
                              }}
                            />
                            <motion.div
                              className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                              animate={{
                                y: [-10, -30, -10],
                                opacity: [0, 1, 0]
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity
                              }}
                            >
                              <div 
                                className="w-1 h-8 rounded-full"
                                style={{
                                  backgroundColor: barColor,
                                  boxShadow: `0 0 10px ${barColor}`
                                }}
                              />
                            </motion.div>
                          </>
                        )}
                        
                        {/* Value label for larger arrays */}
                        {array.length <= 30 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-gray-400 whitespace-nowrap"
                          >
                            {element.value}
                          </motion.div>
                        )}
                        
                        {/* Shimmer effect on bars */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg overflow-hidden"
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: 'easeInOut'
                          }}
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                            width: '50%'
                          }}
                        />
                      </motion.div>
                    );
                  })
                )}</parameter>
</invoke>
              </div>
            </div>

                        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-400 font-semibold uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Sorting Progress
                </span>
                <motion.span
                  key={currentStep}
                  initial={{ scale: 1.2, color: '#a855f7' }}
                  animate={{ scale: 1, color: '#c084fc' }}
                  className="text-purple-300 font-bold text-lg"
                >
                  {steps.length > 0 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0}%
                </motion.span>
              </div>
              
              <div className="relative h-4 bg-gray-800/50 rounded-full border border-purple-500/30 overflow-hidden shadow-inner">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{
                    width: steps.length > 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%',
                    boxShadow: [
                      '0 0 20px rgba(168,85,247,0.6)',
                      '0 0 30px rgba(168,85,247,0.8)',
                      '0 0 20px rgba(168,85,247,0.6)'
                    ]
                  }}
                  transition={{
                    width: { duration: 0.3, ease: 'easeOut' },
                    boxShadow: { duration: 1.5, repeat: Infinity }
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
                
                {currentStep === steps.length - 1 && steps.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-[0_0_30px_rgba(34,197,94,0.8)]"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                )}
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Step {currentStep} / {steps.length > 0 ? steps.length - 1 : 0}</span>
                {currentStep === steps.length - 1 && steps.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-green-400 font-semibold"
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
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-cyan-400 uppercase tracking-wider">
              Legend
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-cyan-500 to-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0,255,255,0.6)',
                    '0 0 25px rgba(0,255,255,0.8)',
                    '0 0 15px rgba(0,255,255,0.6)'
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
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-yellow-500 to-yellow-300 shadow-[0_0_20px_rgba(255,255,0,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,255,0,0.8)',
                    '0 0 35px rgba(255,255,0,1)',
                    '0 0 20px rgba(255,255,0,0.8)'
                  ],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Comparing</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-pink-500 to-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(236,72,153,0.8)',
                    '0 0 35px rgba(236,72,153,1)',
                    '0 0 20px rgba(236,72,153,0.8)'
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

            {/* Sorted State */}
            <motion.div
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-green-500 to-green-300 shadow-[0_0_20px_rgba(0,255,0,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0,255,0,0.8)',
                    '0 0 30px rgba(0,255,0,1)',
                    '0 0 20px rgba(0,255,0,0.8)'
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

          {/* Additional Info */}
          <motion.div
            className="mt-4 pt-4 border-t border-gray-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{
                    boxShadow: [
                      '0 0 5px rgba(0,255,255,0.8)',
                      '0 0 15px rgba(0,255,255,1)',
                      '0 0 5px rgba(0,255,255,0.8)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span>Glowing effects indicate active operations</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-purple-400"
                  animate={{
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span>Animations show real-time algorithm progress</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}