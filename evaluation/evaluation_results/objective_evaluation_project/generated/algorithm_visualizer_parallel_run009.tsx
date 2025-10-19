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
  isPlaying: boolean,
  steps: AlgorithmStep[],
  currentStep: number,
  speed: number[],
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
      const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
      const id = setTimeout(() => {
        onStepChange(currentStep + 1);
      }, delay);
      setAnimationId(id);
    } else {
      onComplete();
    }
  }, [currentStep, steps.length, speed, onStepChange, onComplete]);

  // Run animation when playing
  if (isPlaying && steps.length > 0) {
    animate();
  }

  // Cleanup on unmount or when playing stops
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
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {

    setIsPlaying(false);
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    const arr = [...array];
    const newSteps: AlgorithmStep[] = [];

    const addStep = (
      comparingIndices: number[] = [],
      swappingIndices: number[] = [],
      sortedIndices: number[] = []
    ) => {
      newSteps.push({
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

    const swap = (i: number, j: number) => {
      [arr[i], arr[j]] = [arr[j], arr[i]];
    };

    switch (algorithm) {
      case 'bubble': {
        const sorted: number[] = [];
        for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < arr.length - i - 1; j++) {
            addStep([j, j + 1], [], sorted);
            if (arr[j].value > arr[j + 1].value) {
              addStep([j, j + 1], [j, j + 1], sorted);
              swap(j, j + 1);
              addStep([], [], sorted);
            }
          }
          sorted.push(arr.length - i - 1);
        }
        addStep([], [], Array.from({ length: arr.length }, (_, i) => i));
        break;
      }

      case 'insertion': {
        const sorted: number[] = [0];
        addStep([], [], sorted);
        for (let i = 1; i < arr.length; i++) {
          let j = i;
          addStep([j, j - 1], [], sorted);
          while (j > 0 && arr[j].value < arr[j - 1].value) {
            addStep([j, j - 1], [j, j - 1], sorted);
            swap(j, j - 1);
            j--;
            if (j > 0) addStep([j, j - 1], [], sorted);
          }
          sorted.push(i);
          addStep([], [], sorted);
        }
        addStep([], [], Array.from({ length: arr.length }, (_, i) => i));
        break;
      }

      case 'quick': {
        const sorted: number[] = [];
        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pivotIdx = partition(low, high);
            sorted.push(pivotIdx);
            quickSort(low, pivotIdx - 1);
            quickSort(pivotIdx + 1, high);
          } else if (low === high) {
            sorted.push(low);
          }
        };

        const partition = (low: number, high: number): number => {
          const pivot = arr[high].value;
          let i = low - 1;
          
          for (let j = low; j < high; j++) {
            addStep([j, high], [], sorted);
            if (arr[j].value < pivot) {
              i++;
              if (i !== j) {
                addStep([j, high], [i, j], sorted);
                swap(i, j);
              }
            }
          }
          addStep([high], [i + 1, high], sorted);
          swap(i + 1, high);
          return i + 1;
        };

        quickSort(0, arr.length - 1);
        addStep([], [], Array.from({ length: arr.length }, (_, i) => i));
        break;
      }

      case 'merge': {
        const sorted: number[] = [];
        const mergeSort = (left: number, right: number) => {
          if (left >= right) return;
          
          const mid = Math.floor((left + right) / 2);
          mergeSort(left, mid);
          mergeSort(mid + 1, right);
          merge(left, mid, right);
        };

        const merge = (left: number, mid: number, right: number) => {
          const leftArr = arr.slice(left, mid + 1);
          const rightArr = arr.slice(mid + 1, right + 1);
          
          let i = 0, j = 0, k = left;
          
          while (i < leftArr.length && j < rightArr.length) {
            addStep([left + i, mid + 1 + j], [], sorted);
            if (leftArr[i].value <= rightArr[j].value) {
              arr[k] = leftArr[i];
              i++;
            } else {
              arr[k] = rightArr[j];
              j++;
            }
            addStep([], [k], sorted);
            k++;
          }
          
          while (i < leftArr.length) {
            arr[k] = leftArr[i];
            addStep([], [k], sorted);
            i++;
            k++;
          }
          
          while (j < rightArr.length) {
            arr[k] = rightArr[j];
            addStep([], [k], sorted);
            j++;
            k++;
          }

          for (let idx = left; idx <= right; idx++) {
            if (!sorted.includes(idx)) sorted.push(idx);
          }
        };

        mergeSort(0, arr.length - 1);
        addStep([], [], Array.from({ length: arr.length }, (_, i) => i));
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
        </motion.div></parameter>
</invoke>

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
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50'
                        }`}
                      >
                        <div className="font-semibold text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-cyan-400 font-semibold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Speed
                    </label>
                    <span className="text-white font-mono text-sm bg-cyan-500/20 px-2 py-1 rounded border border-cyan-500/30">
                      {speed[0]}%
                    </span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={100}
                    step={10}
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-cyan-400 font-semibold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Array Size
                    </label>
                    <span className="text-white font-mono text-sm bg-cyan-500/20 px-2 py-1 rounded border border-cyan-500/30">
                      {arraySize[0]}
                    </span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={5}
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || currentStep >= steps.length}
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
                        {currentStep >= steps.length ? 'Completed' : 'Start'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 font-bold py-6 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={() => generateSortingSteps(selectedAlgorithm)}
                    disabled={isPlaying || array.length === 0}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold py-6 rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.7)] transition-all duration-300"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Steps
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-cyan-500/20 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {currentStep} / {steps.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Array Length:</span>
                    <span className="text-cyan-400 font-mono font-bold">{array.length}</span>
                  </div>
                </div>
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
                </div></parameter>
</invoke>

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
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-[0_0_15px_rgba(34,211,238,0.8)] [&_[role=slider]]:transition-shadow hover:[&_[role=slider]]:shadow-[0_0_25px_rgba(34,211,238,1)] [&_.relative]:h-2 [&_.relative]:bg-gray-800 [&_.relative]:rounded-full [&_.relative]:border [&_.relative]:border-cyan-500/30 [&_[role=slider]]:rounded-full"
                  /></parameter>
</invoke>
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
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2 [&>span]:rounded-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={() => {
                      if (isPlaying) {
                        pauseVisualization();
                      } else {
                        if (steps.length === 0) {
                          generateSortingSteps(selectedAlgorithm);
                        }
                        startVisualization();
                      }
                    }}
                    disabled={array.length === 0}
                    className="relative flex-1 group overflow-hidden rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: array.length === 0 ? 1 : 1.05 }}
                    whileTap={{ scale: array.length === 0 ? 1 : 0.95 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-100"
                      animate={{
                        opacity: isPlaying ? [0.8, 1, 0.8] : 1
                      }}
                      transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 blur-xl opacity-60"
                      animate={{
                        scale: isPlaying ? [1, 1.2, 1] : 1,
                        opacity: isPlaying ? [0.6, 0.8, 0.6] : 0.6
                      }}
                      transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
                    />
                    <div className="relative flex items-center justify-center gap-2 px-6 py-3">
                      <motion.div
                        animate={{
                          rotate: isPlaying ? 0 : 0,
                          scale: isPlaying ? 1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white" />
                        )}
                      </motion.div>
                      <span className="font-bold text-white">
                        {isPlaying ? 'Pause' : 'Play'}
                      </span>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      animate={{
                        boxShadow: isPlaying
                          ? [
                              '0 0 20px rgba(6, 182, 212, 0.6)',
                              '0 0 40px rgba(6, 182, 212, 0.8)',
                              '0 0 20px rgba(6, 182, 212, 0.6)'
                            ]
                          : ['0 0 20px rgba(6, 182, 212, 0.5)']
                      }}
                      transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
                    />
                  </motion.button>
                  <motion.button
                    onClick={resetVisualization}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: 360 }}
                    transition={{ 
                      rotate: { duration: 0.6, ease: "easeInOut" },
                      scale: { duration: 0.2 }
                    }}
                    className="relative flex-1 px-6 py-3 bg-gradient-to-r from-pink-600/30 to-purple-600/30 backdrop-blur-sm rounded-lg border border-pink-500/50 text-white font-semibold overflow-hidden group hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-shadow duration-300"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative flex items-center justify-center gap-2">
                      <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.4 }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </motion.div>
                      <span>Reset</span>
                    </div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-400/0 via-pink-400/30 to-pink-400/0"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.button>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-shadow duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Statistics</h3>
                </div>

                <div className="space-y-3">
                  {/* Progress */}
                  <motion.div
                    className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-cyan-300 font-medium">Progress</span>
                      <motion.span
                        className="text-lg font-bold text-cyan-400 font-mono"
                        key={currentStep}
                        initial={{ scale: 1.2, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#22d3ee' }}
                        transition={{ duration: 0.3 }}
                      >
                        {steps.length > 0 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0}%
                      </motion.span>
                    </div>
                    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden border border-cyan-500/20">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: steps.length > 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-cyan-400/70">
                      <span>Step {currentStep}</span>
                      <span>of {steps.length > 0 ? steps.length - 1 : 0}</span>
                    </div>
                  </motion.div>

                  {/* Comparisons */}
                  <motion.div
                    className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-3 h-3 rounded-full bg-purple-400"
                          animate={{
                            boxShadow: [
                              '0 0 10px rgba(192,132,252,0.5)',
                              '0 0 20px rgba(192,132,252,0.8)',
                              '0 0 10px rgba(192,132,252,0.5)'
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="text-sm text-purple-300 font-medium">Comparisons</span>
                      </div>
                      <motion.span
                        className="text-2xl font-bold text-purple-400 font-mono"
                        key={`comp-${currentStep}`}
                        initial={{ scale: 1.3, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {steps.length > 0 && currentStep < steps.length 
                          ? steps.slice(0, currentStep + 1).filter(s => s.comparingIndices.length > 0).length
                          : 0}
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* Swaps */}
                  <motion.div
                    className="p-4 bg-gradient-to-br from-pink-500/10 to-red-500/10 rounded-lg border border-pink-500/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-3 h-3 rounded-full bg-pink-400"
                          animate={{
                            boxShadow: [
                              '0 0 10px rgba(244,114,182,0.5)',
                              '0 0 20px rgba(244,114,182,0.8)',
                              '0 0 10px rgba(244,114,182,0.5)'
                            ],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="text-sm text-pink-300 font-medium">Swaps</span>
                      </div>
                      <motion.span
                        className="text-2xl font-bold text-pink-400 font-mono"
                        key={`swap-${currentStep}`}
                        initial={{ scale: 1.3, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {steps.length > 0 && currentStep < steps.length
                          ? steps.slice(0, currentStep + 1).filter(s => s.swappingIndices.length > 0).length
                          : 0}
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* Sorted Elements */}
                  <motion.div
                    className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-3 h-3 rounded-full bg-green-400"
                          animate={{
                            boxShadow: [
                              '0 0 10px rgba(74,222,128,0.5)',
                              '0 0 20px rgba(74,222,128,0.8)',
                              '0 0 10px rgba(74,222,128,0.5)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-sm text-green-300 font-medium">Sorted</span>
                      </div>
                      <motion.span
                        className="text-2xl font-bold text-green-400 font-mono"
                        key={`sorted-${currentStep}`}
                        initial={{ scale: 1.3, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {steps.length > 0 && currentStep < steps.length
                          ? steps[currentStep].sortedIndices.length
                          : 0}
                      </motion.span>
                    </div>
                    <div className="mt-2 text-xs text-green-400/70">
                      {array.length > 0 && steps.length > 0 && currentStep < steps.length
                        ? `${Math.round((steps[currentStep].sortedIndices.length / array.length) * 100)}% complete`
                        : '0% complete'}
                    </div>
                  </motion.div>

                  {/* Array Size Info */}
                  <motion.div
                    className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-3 h-3 rounded-full bg-yellow-400"
                          animate={{
                            boxShadow: [
                              '0 0 10px rgba(250,204,21,0.5)',
                              '0 0 20px rgba(250,204,21,0.8)',
                              '0 0 10px rgba(250,204,21,0.5)'
                            ]
                          }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                        />
                        <span className="text-sm text-yellow-300 font-medium">Array Size</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-400 font-mono">
                        {array.length}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Status Indicator */}
                <motion.div
                  className="mt-4 p-3 rounded-lg border"
                  animate={{
                    borderColor: isPlaying 
                      ? 'rgba(34,211,238,0.5)' 
                      : steps.length > 0 && currentStep === steps.length - 1
                      ? 'rgba(74,222,128,0.5)'
                      : 'rgba(156,163,175,0.3)',
                    backgroundColor: isPlaying
                      ? 'rgba(34,211,238,0.05)'
                      : steps.length > 0 && currentStep === steps.length - 1
                      ? 'rgba(74,222,128,0.05)'
                      : 'rgba(156,163,175,0.05)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      animate={{
                        backgroundColor: isPlaying
                          ? '#22d3ee'
                          : steps.length > 0 && currentStep === steps.length - 1
                          ? '#4ade80'
                          : '#9ca3af',
                        boxShadow: isPlaying
                          ? '0 0 10px rgba(34,211,238,0.8)'
                          : steps.length > 0 && currentStep === steps.length - 1
                          ? '0 0 10px rgba(74,222,128,0.8)'
                          : 'none'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className={`text-sm font-medium ${
                      isPlaying
                        ? 'text-cyan-300'
                        : steps.length > 0 && currentStep === steps.length - 1
                        ? 'text-green-300'
                        : 'text-gray-400'
                    }`}>
                      {isPlaying
                        ? 'Sorting...'
                        : steps.length > 0 && currentStep === steps.length - 1
                        ? 'Complete!'
                        : 'Ready'}
                    </span>
                  </div>
                </motion.div>
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
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <BarChart3 className="w-24 h-24 text-purple-400/50" />
                  </motion.div>
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-bold text-purple-300">Ready to Visualize</h3>
                    <p className="text-gray-400">Generate an array to begin</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={generateRandomArray}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-8 py-6 text-lg shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] transition-all duration-300"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Generate Array
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <>
                  {/* Animated Bars */}
                  <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                    {(steps.length > 0 && currentStep < steps.length ? steps[currentStep].array : array).map((element, index) => {
                      const currentStepData = steps.length > 0 && currentStep < steps.length ? steps[currentStep] : null;
                      const isComparing = currentStepData?.comparingIndices.includes(index) || false;
                      const isSwapping = currentStepData?.swappingIndices.includes(index) || false;
                      const isSorted = currentStepData?.sortedIndices.includes(index) || false;
                      
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
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: `${element.value}%`,
                            opacity: 1,
                            scale: isSwapping ? 1.1 : isComparing ? 1.05 : 1,
                          }}
                          transition={{
                            height: { type: "spring", stiffness: 300, damping: 30 },
                            scale: { type: "spring", stiffness: 400, damping: 20 },
                            layout: { type: "spring", stiffness: 300, damping: 30 }
                          }}
                          className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                          style={{
                            backgroundColor: barColor,
                            boxShadow: `0 0 ${isSwapping ? '30px' : isComparing ? '20px' : '10px'} ${barColor}`,
                          }}
                        >
                          {/* Glow effect */}
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            animate={{
                              opacity: isSwapping ? [0.5, 1, 0.5] : isComparing ? [0.3, 0.7, 0.3] : 0.3
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: isSwapping || isComparing ? Infinity : 0
                            }}
                            style={{
                              background: `linear-gradient(to top, transparent, ${barColor})`,
                              filter: 'blur(8px)'
                            }}
                          />
                          
                          {/* Value label */}
                          {arraySize[0] <= 20 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                              style={{ color: barColor }}
                            >
                              {element.value}
                            </motion.div>
                          )}

                          {/* Swap trail effect */}
                          {isSwapping && (
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              initial={{ opacity: 0, scale: 1 }}
                              animate={{
                                opacity: [0, 0.8, 0],
                                scale: [1, 1.5, 2],
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                ease: "easeOut"
                              }}
                              style={{
                                backgroundColor: barColor,
                                filter: 'blur(10px)'
                              }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Comparison Indicators */}
                  {steps.length > 0 && currentStep < steps.length && steps[currentStep].comparingIndices.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-full border border-yellow-400/50 shadow-[0_0_20px_rgba(255,255,0,0.5)]"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Zap className="w-4 h-4 text-yellow-300" />
                      </motion.div>
                      <span className="text-sm font-semibold text-yellow-300">
                        Comparing indices: {steps[currentStep].comparingIndices.join(', ')}
                      </span>
                    </motion.div>
                  )}

                  {/* Swap Indicators */}
                  {steps.length > 0 && currentStep < steps.length && steps[currentStep].swappingIndices.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-pink-500/20 backdrop-blur-sm rounded-full border border-pink-400/50 shadow-[0_0_20px_rgba(255,0,102,0.5)]"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.3, 1]
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <RotateCcw className="w-4 h-4 text-pink-300" />
                      </motion.div>
                      <span className="text-sm font-semibold text-pink-300">
                        Swapping indices: {steps[currentStep].swappingIndices.join(', ')}
                      </span>
                    </motion.div>
                  )}

                  {/* Progress indicator */}
                  {steps.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-gray-900/80 backdrop-blur-sm rounded-full border border-cyan-500/30"
                    >
                      <span className="text-sm font-mono text-cyan-300">
                        Step: {currentStep + 1} / {steps.length}
                      </span>
                      <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden border border-cyan-500/30">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </>
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
                      >
                        <BarChart3 className="w-16 h-16 text-cyan-400 mx-auto" />
                      </motion.div>
                      <p className="text-cyan-300 text-lg font-semibold">
                        Generate an array to start visualizing
                      </p>
                      <p className="text-gray-400 text-sm">
                        Click the reset button to create a random array
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  array.map((element, index) => {
                    const currentStepData = steps[currentStep];
                    const isComparing = currentStepData?.comparingIndices.includes(index);
                    const isSwapping = currentStepData?.swappingIndices.includes(index);
                    const isSorted = currentStepData?.sortedIndices.includes(index);
                    
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let glowIntensity = 0.3;
                    let scale = 1;
                    
                    if (isSorted) {
                      barColor = '#00ff00';
                      glowIntensity = 0.8;
                    } else if (isSwapping) {
                      barColor = '#ff0066';
                      glowIntensity = 1;
                      scale = 1.1;
                    } else if (isComparing) {
                      barColor = '#ffff00';
                      glowIntensity = 0.7;
                      scale = 1.05;
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        layout
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          scale: scale,
                          backgroundColor: barColor
                        }}
                        transition={{
                          height: { duration: 0.5, ease: "easeOut" },
                          backgroundColor: { duration: 0.3 },
                          scale: { duration: 0.2, type: "spring", stiffness: 300 }
                        }}
                        className="relative rounded-t-lg min-w-[8px] flex-1 max-w-[60px]"
                        style={{
                          boxShadow: `
                            0 0 ${20 * glowIntensity}px ${barColor},
                            0 0 ${40 * glowIntensity}px ${barColor},
                            inset 0 0 ${10 * glowIntensity}px rgba(255, 255, 255, 0.3)
                          `,
                          border: `1px solid ${barColor}`,
                          background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`
                        }}
                      >
                        {/* Value label */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: array.length <= 30 ? 1 : 0 }}
                          className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                          style={{
                            color: barColor,
                            textShadow: `0 0 10px ${barColor}`
                          }}
                        >
                          {element.value}
                        </motion.div>
                        
                        {/* Glow pulse effect for active states */}
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
                              ease: "easeInOut"
                            }}
                            style={{
                              background: `radial-gradient(circle, ${barColor}88 0%, transparent 70%)`,
                              filter: 'blur(8px)'
                            }}
                          />
                        )}
                        
                        {/* Sorted checkmark indicator */}
                        {isSorted && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                            style={{
                              boxShadow: '0 0 20px #00ff00'
                            }}
                          >
                            <svg
                              className="w-4 h-4 text-gray-900"
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
                        
                        {/* Particle effect for swapping */}
                        {isSwapping && (
                          <>
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full"
                                style={{ backgroundColor: barColor }}
                                initial={{
                                  top: '50%',
                                  left: '50%',
                                  opacity: 1
                                }}
                                animate={{
                                  top: `${Math.random() * 100}%`,
                                  left: `${Math.random() * 100}%`,
                                  opacity: 0,
                                  scale: [1, 2, 0]
                                }}
                                transition={{
                                  duration: 0.8,
                                  delay: i * 0.1,
                                  repeat: Infinity
                                }}
                              />
                            ))}
                          </>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* TODO:ComparisonIndicators Floating indicators showing which elements are being compared */}
              
                            {steps.length > 0 && currentStep < steps.length && steps[currentStep].swappingIndices.length === 2 && (
                <>
                  {steps[currentStep].swappingIndices.map((index, i) => {
                    const barWidth = 100 / (steps[currentStep].array.length + 1);
                    const xPosition = (index + 0.5) * barWidth;
                    
                    return (
                      <motion.div
                        key={`swap-trail-${index}-${currentStep}`}
                        className="absolute bottom-0 pointer-events-none"
                        style={{
                          left: `${xPosition}%`,
                          width: `${barWidth * 0.8}%`,
                          height: `${steps[currentStep].array[index].value}%`,
                          transform: 'translateX(-50%)'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: [0, 0.6, 0.4, 0],
                          scale: [1, 1.1, 1.2, 1.3],
                          filter: [
                            'blur(0px)',
                            'blur(4px)',
                            'blur(8px)',
                            'blur(12px)'
                          ]
                        }}
                        transition={{ 
                          duration: 0.8,
                          ease: "easeOut"
                        }}
                      >
                        <div 
                          className="w-full h-full rounded-t-lg"
                          style={{
                            background: `linear-gradient(to top, ${NEON_COLORS[index % NEON_COLORS.length]}40, ${NEON_COLORS[index % NEON_COLORS.length]}80)`,
                            boxShadow: `0 0 30px ${NEON_COLORS[index % NEON_COLORS.length]}80`
                          }}
                        />
                      </motion.div>
                    );
                  })}
                  
                  {/* Swap connection line with motion blur */}
                  <motion.svg
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.7, 0] }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.line
                      x1={`${(steps[currentStep].swappingIndices[0] + 0.5) * (100 / (steps[currentStep].array.length + 1))}%`}
                      y1="50%"
                      x2={`${(steps[currentStep].swappingIndices[1] + 0.5) * (100 / (steps[currentStep].array.length + 1))}%`}
                      y2="50%"
                      stroke="#ff00ff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: [0, 1, 1],
                        strokeWidth: [3, 5, 3]
                      }}
                      transition={{ duration: 0.5 }}
                      style={{
                        filter: 'blur(2px) drop-shadow(0 0 10px #ff00ff)',
                      }}
                    />
                    <motion.line
                      x1={`${(steps[currentStep].swappingIndices[0] + 0.5) * (100 / (steps[currentStep].array.length + 1))}%`}
                      y1="50%"
                      x2={`${(steps[currentStep].swappingIndices[1] + 0.5) * (100 / (steps[currentStep].array.length + 1))}%`}
                      y2="50%"
                      stroke="#00ffff"
                      strokeWidth="1"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ 
                        pathLength: [0, 1, 1]
                      }}
                      transition={{ duration: 0.5 }}
                      style={{
                        filter: 'drop-shadow(0 0 15px #00ffff)',
                      }}
                    />
                  </motion.svg>

                  {/* Particle burst effect at swap points */}
                  {steps[currentStep].swappingIndices.map((index) => {
                    const barWidth = 100 / (steps[currentStep].array.length + 1);
                    const xPosition = (index + 0.5) * barWidth;
                    
                    return (
                      <div key={`particles-${index}-${currentStep}`}>
                        {[...Array(6)].map((_, particleIndex) => {
                          const angle = (particleIndex * 60) * (Math.PI / 180);
                          const distance = 30 + Math.random() * 20;
                          
                          return (
                            <motion.div
                              key={`particle-${index}-${particleIndex}`}
                              className="absolute pointer-events-none rounded-full"
                              style={{
                                left: `${xPosition}%`,
                                bottom: `${steps[currentStep].array[index].value}%`,
                                width: '6px',
                                height: '6px',
                                background: NEON_COLORS[particleIndex % NEON_COLORS.length],
                                boxShadow: `0 0 10px ${NEON_COLORS[particleIndex % NEON_COLORS.length]}`
                              }}
                              initial={{ 
                                x: 0, 
                                y: 0, 
                                opacity: 1,
                                scale: 1
                              }}
                              animate={{ 
                                x: Math.cos(angle) * distance,
                                y: -Math.sin(angle) * distance,
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
                </>
              )}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-cyan-400">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0, 255, 255, 0.6)',
                    '0 0 25px rgba(0, 255, 255, 0.8)',
                    '0 0 15px rgba(0, 255, 255, 0.6)'
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
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 0, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded shadow-[0_0_15px_rgba(255,255,0,0.6)]"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 15px rgba(255, 255, 0, 0.6)',
                    '0 0 30px rgba(255, 255, 0, 0.9)',
                    '0 0 15px rgba(255, 255, 0, 0.6)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Comparing</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-pink-500 to-pink-300 rounded shadow-[0_0_15px_rgba(236,72,153,0.6)]"
                animate={{
                  x: [-2, 2, -2],
                  boxShadow: [
                    '0 0 15px rgba(236, 72, 153, 0.6)',
                    '0 0 35px rgba(236, 72, 153, 1)',
                    '0 0 15px rgba(236, 72, 153, 0.6)'
                  ]
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Swapping</div>
                <div className="text-xs text-gray-400">Moving</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-green-500 to-green-300 rounded shadow-[0_0_15px_rgba(0,255,0,0.6)]"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0, 255, 0, 0.6)',
                    '0 0 20px rgba(0, 255, 0, 0.8)',
                    '0 0 15px rgba(0, 255, 0, 0.6)'
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

          <motion.div
            className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-5 h-5 text-purple-400 mt-0.5" />
              </motion.div>
              <div>
                <p className="text-sm text-purple-200 font-semibold mb-1">Pro Tip</p>
                <p className="text-xs text-purple-300/80">
                  Watch the neon glow effects as elements are compared and swapped. 
                  Adjust speed to see the algorithm in action at your own pace!
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}