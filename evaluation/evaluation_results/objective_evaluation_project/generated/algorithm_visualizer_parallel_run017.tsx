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
  const [progress, setProgress] = useState(0);

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
    generateRandomArray();  }, [generateRandomArray]);

  const animateSteps = useCallback(() => {
    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const step = steps[currentStep];
    setArray(step.array);
    setCurrentStep(prev => prev + 1);
  }, [currentStep, steps]);

  const startVisualization = useCallback(() => {    if (steps.length === 0) return;
    if (currentStep >= steps.length) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
    
  }, [steps, speed, currentStep]);
  useEffect(() => {
    if (!isPlaying) return;

    const delay = 1000 - (speed[0] * 9.5);
    const timer = setTimeout(() => {
      animateSteps();
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, speed, animateSteps]);

  const pauseVisualization = useCallback(() => {

    setIsPlaying(false);
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
          addStep(arr, [high], [], Array.from(sortedSet));
          let i = low - 1;

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
        
        // Mark all as sorted at the end
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
              transition={{ delay: 0.3, type: "spring" }}
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
              transition={{ delay: 0.5, type: "spring" }}
              className="px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-400/50"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
              }}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-mono text-purple-200">
                  {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div></parameter>

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
                        <div className="text-sm font-medium text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Zap className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Speed</h3>
                    </div>
                    <span className="text-xs text-purple-300 font-mono bg-purple-500/20 px-2 py-1 rounded">
                      {speed[0]}ms
                    </span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={200}
                    step={10}
                    className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400 [&_[role=slider]]:shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                  />
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400">
                      <BarChart3 className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Array Size</h3>
                    </div>
                    <span className="text-xs text-pink-300 font-mono bg-pink-500/20 px-2 py-1 rounded">
                      {arraySize[0]}
                    </span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={100}
                    step={5}
                    disabled={isPlaying}
                    className="[&_[role=slider]]:bg-pink-500 [&_[role=slider]]:border-pink-400 [&_[role=slider]]:shadow-[0_0_15px_rgba(236,72,153,0.6)]"
                  />
                </div>

                {/* Control Buttons */}
                <div className="space-y-2 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300"
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
                    className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={() => generateSortingSteps(selectedAlgorithm)}
                    disabled={isPlaying || array.length === 0}
                    variant="outline"
                    className="w-full border-pink-500/50 text-pink-300 hover:bg-pink-500/20 hover:border-pink-400 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Steps
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Current Step</span>
                    <span className="text-cyan-300 font-mono bg-cyan-500/10 px-2 py-1 rounded">
                      {currentStep} / {steps.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Array Length</span>
                    <span className="text-purple-300 font-mono bg-purple-500/10 px-2 py-1 rounded">
                      {array.length}
                    </span>
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
                        className={`relative p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/50'
                            : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:bg-cyan-500/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-white">{algo.name}</div>
                          <div className={`text-xs ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-400'
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
                </div></parameter>

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
                    max={50}
                    step={1}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2 [&>span]:rounded-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.div className="flex-1">
                    <Button
                      onClick={isPlaying ? pauseVisualization : startVisualization}
                      disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                        animate={{
                          opacity: isPlaying ? [0.5, 0.8, 0.5] : 0
                        }}
                        transition={{
                          duration: 2,
                          repeat: isPlaying ? Infinity : 0
                        }}
                      />
                      <motion.div
                        className="relative flex items-center justify-center gap-2"
                        initial={false}
                        animate={{
                          scale: isPlaying ? [1, 1.1, 1] : 1
                        }}
                        transition={{
                          duration: 1,
                          repeat: isPlaying ? Infinity : 0
                        }}
                      >
                        <motion.div
                          initial={false}
                          animate={{
                            rotate: isPlaying ? 0 : 0,
                            scale: isPlaying ? 1 : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </motion.div>
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </motion.div>
                    </Button>
                  </motion.div>
                  <motion.div whileTap={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <Button
                      onClick={resetVisualization}
                      disabled={isPlaying}
                      variant="outline"
                      className="w-full bg-purple-500/20 border-purple-400/50 hover:bg-purple-500/30 hover:border-purple-400 text-purple-300 hover:text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

                        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Statistics</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Comparisons */}
                  <motion.div
                    className="relative p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 animate-pulse" />
                    <div className="relative z-10">
                      <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Comparisons</div>
                      <motion.div
                        className="text-3xl font-bold text-cyan-300"
                        key={comparisons}
                        initial={{ scale: 1.2, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#67e8f9' }}
                        transition={{ duration: 0.3 }}
                      >
                        {comparisons.toLocaleString()}
                      </motion.div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-cyan-400"
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(0, 255, 255, 0.8)',
                            '0 0 20px rgba(0, 255, 255, 0.8)',
                            '0 0 10px rgba(0, 255, 255, 0.8)'
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>

                  {/* Swaps */}
                  <motion.div
                    className="relative p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 animate-pulse" />
                    <div className="relative z-10">
                      <div className="text-xs text-pink-400 uppercase tracking-wider mb-1">Swaps</div>
                      <motion.div
                        className="text-3xl font-bold text-pink-300"
                        key={swaps}
                        initial={{ scale: 1.2, color: '#ff0066' }}
                        animate={{ scale: 1, color: '#f9a8d4' }}
                        transition={{ duration: 0.3 }}
                      >
                        {swaps.toLocaleString()}
                      </motion.div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-pink-400"
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(255, 0, 102, 0.8)',
                            '0 0 20px rgba(255, 0, 102, 0.8)',
                            '0 0 10px rgba(255, 0, 102, 0.8)'
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                      />
                    </div>
                  </motion.div>

                  {/* Progress */}
                  <motion.div
                    className="relative p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 animate-pulse" />
                    <div className="relative z-10">
                      <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">Progress</div>
                      <motion.div
                        className="text-3xl font-bold text-purple-300"
                        key={progress}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {progress}%
                      </motion.div>
                      <div className="mt-3 h-2 bg-gray-800/50 rounded-full overflow-hidden border border-purple-500/20">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          style={{
                            boxShadow: '0 0 15px rgba(168, 85, 247, 0.8)'
                          }}
                        />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-purple-400"
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(168, 85, 247, 0.8)',
                            '0 0 20px rgba(168, 85, 247, 0.8)',
                            '0 0 10px rgba(168, 85, 247, 0.8)'
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                      />
                    </div>
                  </motion.div>

                  {/* Array Size Info */}
                  <motion.div
                    className="relative p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-xs text-green-400 uppercase tracking-wider mb-1">Array Size</div>
                    <div className="text-3xl font-bold text-green-300">
                      {array.length}
                    </div>
                  </motion.div>
                </div>

                {/* Status Indicator */}
                <div className="pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Status</span>
                    <motion.div
                      className="flex items-center gap-2"
                      animate={{
                        opacity: isPlaying ? [1, 0.6, 1] : 1
                      }}
                      transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
                    >
                      <motion.div
                        className={`w-2 h-2 rounded-full ${
                          isPlaying ? 'bg-green-400' : progress === 100 ? 'bg-cyan-400' : 'bg-gray-500'
                        }`}
                        animate={{
                          boxShadow: isPlaying
                            ? [
                                '0 0 10px rgba(34, 197, 94, 0.8)',
                                '0 0 20px rgba(34, 197, 94, 0.8)',
                                '0 0 10px rgba(34, 197, 94, 0.8)'
                              ]
                            : progress === 100
                            ? '0 0 15px rgba(0, 255, 255, 0.8)'
                            : 'none'
                        }}
                        transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
                      />
                      <span className={`text-xs font-medium ${
                        isPlaying ? 'text-green-400' : progress === 100 ? 'text-cyan-400' : 'text-gray-400'
                      }`}>
                        {isPlaying ? 'Sorting...' : progress === 100 ? 'Complete' : 'Ready'}
                      </span>
                    </motion.div>
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
                  className="flex flex-col items-center justify-center h-full space-y-6"
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
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-semibold text-purple-300">
                      Generate an Array to Begin
                    </h3>
                    <p className="text-gray-400">
                      Click the reset button to create a random array
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full">
                  {/* Comparison Indicators */}
                  {array.map((element, index) => {
                    const isComparing = element.isComparing;
                    const isSwapping = element.isSwapping;
                    const isSorted = element.isSorted;
                    
                    if (isComparing || isSwapping) {
                      return (
                        <motion.div
                          key={`indicator-${element.id}`}
                          className="absolute pointer-events-none"
                          style={{
                            left: `${(index / array.length) * 100}%`,
                            width: `${100 / array.length}%`,
                            top: 0,
                            height: '100%'
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {isComparing && (
                            <motion.div
                              className="absolute inset-0 bg-cyan-400/10 border-2 border-cyan-400 rounded-lg"
                              animate={{
                                boxShadow: [
                                  '0 0 20px rgba(34, 211, 238, 0.6)',
                                  '0 0 40px rgba(34, 211, 238, 0.9)',
                                  '0 0 20px rgba(34, 211, 238, 0.6)'
                                ]
                              }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            />
                          )}
                          {isSwapping && (
                            <>
                              <motion.div
                                className="absolute inset-0 bg-pink-500/20 border-2 border-pink-400 rounded-lg"
                                animate={{
                                  boxShadow: [
                                    '0 0 30px rgba(236, 72, 153, 0.8)',
                                    '0 0 50px rgba(236, 72, 153, 1)',
                                    '0 0 30px rgba(236, 72, 153, 0.8)'
                                  ]
                                }}
                                transition={{ duration: 0.3, repeat: Infinity }}
                              />
                              {/* Swap Trail Effect */}
                              <motion.div
                                className="absolute inset-0"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ 
                                  opacity: [0, 1, 0],
                                  scale: [0.8, 1.2, 1.5]
                                }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                              >
                                <div className="w-full h-full rounded-lg bg-gradient-to-t from-pink-500/40 via-purple-500/30 to-transparent blur-sm" />
                              </motion.div>
                            </>
                          )}
                        </motion.div>
                      );
                    }
                    return null;
                  })}

                  {/* Array Bars */}
                  <div className="flex items-end justify-center gap-1 h-full relative z-10">
                    {array.map((element, index) => {
                      const heightPercentage = (element.value / 105) * 100;
                      const colorIndex = index % NEON_COLORS.length;
                      const barColor = element.isSorted 
                        ? '#00ff00' 
                        : element.isSwapping 
                        ? '#ff0066' 
                        : element.isComparing 
                        ? '#00ffff' 
                        : NEON_COLORS[colorIndex];

                      return (
                        <motion.div
                          key={element.id}
                          className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                          style={{
                            height: `${heightPercentage}%`,
                            backgroundColor: barColor,
                            boxShadow: `0 0 20px ${barColor}80, 0 0 40px ${barColor}40`
                          }}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ 
                            height: `${heightPercentage}%`,
                            opacity: 1,
                            boxShadow: element.isSwapping
                              ? [
                                  `0 0 20px ${barColor}80, 0 0 40px ${barColor}40`,
                                  `0 0 40px ${barColor}FF, 0 0 80px ${barColor}80`,
                                  `0 0 20px ${barColor}80, 0 0 40px ${barColor}40`
                                ]
                              : `0 0 20px ${barColor}80, 0 0 40px ${barColor}40`
                          }}
                          transition={{
                            height: { duration: 0.3, ease: "easeOut" },
                            opacity: { duration: 0.2 },
                            boxShadow: { duration: 0.3, repeat: element.isSwapping ? Infinity : 0 }
                          }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: `0 0 30px ${barColor}FF, 0 0 60px ${barColor}80`,
                            transition: { duration: 0.2 }
                          }}
                        >
                          {/* Swap Trail Particles */}
                          {element.isSwapping && (
                            <>
                              <motion.div
                                className="absolute inset-0 rounded-t-lg"
                                style={{
                                  background: `linear-gradient(to top, ${barColor}40, transparent)`
                                }}
                                animate={{
                                  opacity: [0.5, 1, 0.5],
                                  scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 0.4, repeat: Infinity }}
                              />
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={`particle-${i}`}
                                  className="absolute w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: barColor,
                                    left: '50%',
                                    top: '50%',
                                    marginLeft: '-4px',
                                    marginTop: '-4px'
                                  }}
                                  animate={{
                                    y: [-20, -40, -60],
                                    x: [(i - 1) * 10, (i - 1) * 20, (i - 1) * 30],
                                    opacity: [1, 0.5, 0],
                                    scale: [1, 0.5, 0]
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

                          {/* Value Label */}
                          {array.length <= 30 && (
                            <motion.div
                              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-semibold whitespace-nowrap"
                              style={{ color: barColor }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.8 }}
                            >
                              {element.value}
                            </motion.div>
                          )}

                          {/* Sorted Checkmark */}
                          {element.isSorted && (
                            <motion.div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            >
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.8)]">
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
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex items-end justify-center gap-1 h-[500px]">
                {array.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-4"
                    >
                      <BarChart3 className="w-16 h-16 text-cyan-400/50 mx-auto" />
                      <p className="text-cyan-300/70 text-lg">Generate an array to start visualizing</p>
                    </motion.div>
                  </div>
                ) : (
                  array.map((element, index) => {
                    const heightPercentage = (element.value / 100) * 100;
                    const colorIndex = index % NEON_COLORS.length;
                    const neonColor = NEON_COLORS[colorIndex];
                    
                    let barState = 'default';
                    if (element.isSorted) barState = 'sorted';
                    else if (element.isSwapping) barState = 'swapping';
                    else if (element.isComparing) barState = 'comparing';

                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px]"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          scale: element.isSwapping ? [1, 1.1, 1] : element.isComparing ? 1.05 : 1,
                        }}
                        transition={{
                          height: { duration: 0.5, ease: "easeOut" },
                          opacity: { duration: 0.3 },
                          scale: { duration: 0.3 }
                        }}
                        style={{
                          backgroundColor: element.isSorted 
                            ? '#00ff00' 
                            : element.isSwapping 
                            ? '#ff00ff' 
                            : element.isComparing 
                            ? '#ffff00' 
                            : neonColor,
                          boxShadow: element.isSorted
                            ? '0 0 20px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.3)'
                            : element.isSwapping
                            ? '0 0 30px rgba(255, 0, 255, 1), 0 0 60px rgba(255, 0, 255, 0.7), inset 0 0 30px rgba(255, 0, 255, 0.4)'
                            : element.isComparing
                            ? '0 0 25px rgba(255, 255, 0, 0.9), 0 0 50px rgba(255, 255, 0, 0.6), inset 0 0 25px rgba(255, 255, 0, 0.3)'
                            : `0 0 15px ${neonColor}80, 0 0 30px ${neonColor}40, inset 0 0 15px ${neonColor}30`,
                          borderRadius: '4px 4px 0 0',
                          position: 'relative',
                          overflow: 'visible'
                        }}
                      >
                        {/* Glow effect overlay */}
                        <motion.div
                          className="absolute inset-0 rounded-t"
                          animate={{
                            opacity: element.isSwapping ? [0.3, 0.8, 0.3] : element.isComparing ? [0.4, 0.7, 0.4] : 0.5
                          }}
                          transition={{
                            duration: element.isSwapping ? 0.4 : element.isComparing ? 0.6 : 1,
                            repeat: element.isSwapping || element.isComparing ? Infinity : 0
                          }}
                          style={{
                            background: `linear-gradient(to top, transparent, ${element.isSorted ? '#00ff00' : element.isSwapping ? '#ff00ff' : element.isComparing ? '#ffff00' : neonColor}40)`,
                          }}
                        />

                        {/* Trail effect during swaps */}
                        {element.isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t"
                              initial={{ opacity: 0, scale: 1 }}
                              animate={{ 
                                opacity: [0.8, 0],
                                scale: [1, 1.3],
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                ease: "easeOut"
                              }}
                              style={{
                                backgroundColor: '#ff00ff',
                                filter: 'blur(8px)',
                              }}
                            />
                            <motion.div
                              className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                              animate={{
                                y: [-10, -30],
                                opacity: [1, 0],
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "easeOut"
                              }}
                            >
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: '#ff00ff',
                                  boxShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff'
                                }}
                              />
                            </motion.div>
                          </>
                        )}

                        {/* Comparison pulse effect */}
                        {element.isComparing && (
                          <motion.div
                            className="absolute -inset-1 rounded-t"
                            animate={{
                              opacity: [0, 0.6, 0],
                              scale: [0.95, 1.1, 0.95],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            style={{
                              border: '2px solid #ffff00',
                              boxShadow: '0 0 20px rgba(255, 255, 0, 0.8)',
                            }}
                          />
                        )}

                        {/* Value label */}
                        {arraySize[0] <= 30 && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                              color: element.isSorted ? '#00ff00' : element.isSwapping ? '#ff00ff' : element.isComparing ? '#ffff00' : neonColor,
                              textShadow: `0 0 10px ${element.isSorted ? '#00ff00' : element.isSwapping ? '#ff00ff' : element.isComparing ? '#ffff00' : neonColor}`,
                            }}
                          >
                            {element.value}
                          </motion.div>
                        )}

                        {/* Sorted checkmark */}
                        {element.isSorted && (
                          <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <div 
                              className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
                              style={{
                                backgroundColor: '#00ff00',
                                boxShadow: '0 0 15px rgba(0, 255, 0, 0.8)',
                                color: '#000'
                              }}
                            >
                              ✓
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })
                )</parameter>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-400 font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Sorting Progress
                  </span>
                  <motion.span 
                    className="text-cyan-300 font-mono text-lg"
                    key={currentStep}
                    initial={{ scale: 1.2, color: '#00ffff' }}
                    animate={{ scale: 1, color: '#67e8f9' }}
                    transition={{ duration: 0.3 }}
                  >
                    {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                  </motion.span>
                </div>
                
                <div className="relative h-4 bg-gray-800/50 rounded-full overflow-hidden border border-cyan-500/30 shadow-inner">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                    }}
                    transition={{ 
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    style={{
                      boxShadow: '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)'
                    }}
                  />
                  
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: isPlaying ? Infinity : 0,
                      ease: "linear"
                    }}
                    style={{
                      width: '50%'
                    }}
                  />
                  
                  {steps.length > 0 && currentStep === steps.length && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0, 0.8, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </div>
                
                {steps.length > 0 && currentStep === steps.length && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text">
                      ✨ Sorting Complete!
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-cyan-300 uppercase tracking-wider">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg"
                style={{
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.6)'
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0, 255, 255, 0.6)',
                    '0 0 30px rgba(0, 255, 255, 0.8)',
                    '0 0 20px rgba(0, 255, 255, 0.6)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Comparing</div>
                <div className="text-xs text-gray-400">Active comparison</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg"
                style={{
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.6)',
                    '0 0 30px rgba(168, 85, 247, 0.8)',
                    '0 0 20px rgba(168, 85, 247, 0.6)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Swapping</div>
                <div className="text-xs text-gray-400">Elements moving</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-6 rounded-md bg-gradient-to-br from-green-400 to-green-600 shadow-lg"
                style={{
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)'
                }}
                animate={{
                  opacity: [1, 0.7, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Sorted</div>
                <div className="text-xs text-gray-400">In final position</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg"
                style={{
                  boxShadow: '0 0 15px rgba(236, 72, 153, 0.5)'
                }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Unsorted</div>
                <div className="text-xs text-gray-400">Awaiting sort</div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                <span className="font-semibold text-cyan-300">Pro Tip:</span> Watch the neon glow effects to track algorithm progress. Brighter glows indicate active operations, while steady colors show completed sections.
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}