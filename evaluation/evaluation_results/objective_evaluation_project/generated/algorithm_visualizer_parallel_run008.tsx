import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, BarChart3 } from 'lucide-react';
import { Activity, TrendingUp, Shuffle } from 'lucide-react';
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
      id: `element-${Date.now()}-${index}`,
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

  // Animation effect for step-by-step visualization
  const animateSteps = useCallback(() => {
    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const step = steps[currentStep];
    setArray(step.array);
    setCurrentStep(prev => prev + 1);
  }, [currentStep, steps]);

  // Effect to handle animation timing
  React.useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
    const timer = setTimeout(animateSteps, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, animateSteps, speed]);
  const startVisualization = useCallback(() => {
    if (steps.length === 0) return;
    if (currentStep >= steps.length) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
    
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {
    setIsPlaying(false);
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

    if (algorithm === 'bubble') {
      const sortedIndices: number[] = [];
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          addStep(arr, [j, j + 1], [], sortedIndices);
          
          if (arr[j].value > arr[j + 1].value) {
            addStep(arr, [], [j, j + 1], sortedIndices);
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            addStep(arr, [], [], sortedIndices);
          }
        }
        sortedIndices.push(arr.length - i - 1);
        addStep(arr, [], [], sortedIndices);
      }
    } else if (algorithm === 'quick') {
      const sortedIndices: number[] = [];
      
      const partition = (low: number, high: number): number => {
        const pivot = arr[high].value;
        let i = low - 1;

        addStep(arr, [high], [], sortedIndices);

        for (let j = low; j < high; j++) {
          addStep(arr, [j, high], [], sortedIndices);
          
          if (arr[j].value < pivot) {
            i++;
            if (i !== j) {
              addStep(arr, [], [i, j], sortedIndices);
              [arr[i], arr[j]] = [arr[j], arr[i]];
              addStep(arr, [], [], sortedIndices);
            }
          }
        }

        addStep(arr, [], [i + 1, high], sortedIndices);
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        addStep(arr, [], [], sortedIndices);
        
        return i + 1;
      };

      const quickSort = (low: number, high: number) => {
        if (low < high) {
          const pi = partition(low, high);
          sortedIndices.push(pi);
          quickSort(low, pi - 1);
          quickSort(pi + 1, high);
        } else if (low === high) {
          sortedIndices.push(low);
          addStep(arr, [], [], sortedIndices);
        }
      };

      quickSort(0, arr.length - 1);
    } else if (algorithm === 'merge') {
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

        for (let idx = left; idx <= right; idx++) {
          if (!sortedIndices.includes(idx)) {
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
    } else if (algorithm === 'insertion') {
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
              className="flex items-center gap-2 px-4 py-2 bg-purple-900/50 backdrop-blur-sm rounded-full border border-purple-500/50"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
              }}
            >
              <BarChart3 className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-mono text-purple-200">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
              </span>
            </motion.div>
          </div>
        </motion.div></parameter>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Algorithm
                  </h3>
                  <div className="space-y-2">
                    {mockAlgorithms.map((algo) => (
                      <button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        disabled={isPlaying}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)] text-cyan-300'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 text-gray-400 hover:text-cyan-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-medium">{algo.name}</div>
                        <div className="text-xs opacity-70">{algo.complexity}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Speed
                  </h3>
                  <div className="space-y-2">
                    <Slider
                      value={speed}
                      onValueChange={setSpeed}
                      min={10}
                      max={100}
                      step={10}
                      className="cursor-pointer"
                      disabled={isPlaying}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Slow</span>
                      <span className="text-purple-400 font-semibold">{speed[0]}%</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <h3 className="text-pink-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Array Size
                  </h3>
                  <div className="space-y-2">
                    <Slider
                      value={arraySize}
                      onValueChange={setArraySize}
                      min={5}
                      max={50}
                      step={5}
                      className="cursor-pointer"
                      disabled={isPlaying}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>5</span>
                      <span className="text-pink-400 font-semibold">{arraySize[0]}</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        {currentStep >= steps.length ? 'Start' : 'Resume'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-6 rounded-lg shadow-[0_0_20px_rgba(255,0,255,0.5)] hover:shadow-[0_0_30px_rgba(255,0,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={() => {
                      generateRandomArray();
                      generateSortingSteps(selectedAlgorithm);
                    }}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,170,0.5)] hover:shadow-[0_0_30px_rgba(0,255,170,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Generate New
                  </Button>
                </div>

                {/* Progress Indicator */}
                {steps.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-gray-700/50">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span className="text-cyan-400 font-semibold">
                        {currentStep} / {steps.length}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / steps.length) * 100}%` }}
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
                    step={5}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2 [&>span]:rounded-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 relative group overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 p-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="relative bg-gray-900 rounded-lg px-6 py-3 flex items-center justify-center gap-2 group-hover:bg-gray-900/80 transition-all duration-300">
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
                      <span className="font-semibold text-cyan-300">
                        {isPlaying ? 'Pause' : 'Play'}
                      </span>
                      
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg"
                        animate={{
                          opacity: [0.5, 1, 0.5],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                    
                    <motion.div
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)'
                      }}
                    />
                  </motion.button>
                  <motion.div className="flex gap-3">
                    <Button
                      onClick={isPlaying ? pauseVisualization : startVisualization}
                      disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all duration-300 border-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                    
                    <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                      <Button
                        onClick={resetVisualization}
                        disabled={isPlaying}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 border-0"
                        whileTap={{ scale: 0.9 }}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </motion.div>
                    
                    <Button
                      onClick={generateRandomArray}
                      disabled={isPlaying}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-semibold shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80 transition-all duration-300 border-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4" />
                Statistics
              </h3>
              
              <div className="space-y-4">
                {/* Comparisons */}
                <motion.div
                  className="bg-gradient-to-r from-cyan-900/30 to-cyan-800/20 border border-cyan-500/40 rounded-lg p-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(6,182,212,0.4)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <div className="text-xs text-cyan-300/70 uppercase tracking-wide">Comparisons</div>
                        <motion.div
                          key={comparisons}
                          initial={{ scale: 1.3, color: '#22d3ee' }}
                          animate={{ scale: 1, color: '#67e8f9' }}
                          className="text-2xl font-bold text-cyan-300 font-mono"
                        >
                          {comparisons}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Swaps */}
                <motion.div
                  className="bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-500/40 rounded-lg p-4 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(168,85,247,0.4)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                        <Shuffle className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs text-purple-300/70 uppercase tracking-wide">Swaps</div>
                        <motion.div
                          key={swaps}
                          initial={{ scale: 1.3, color: '#a855f7' }}
                          animate={{ scale: 1, color: '#c084fc' }}
                          className="text-2xl font-bold text-purple-300 font-mono"
                        >
                          {swaps}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Progress */}
                <motion.div
                  className="bg-gradient-to-r from-pink-900/30 to-pink-800/20 border border-pink-500/40 rounded-lg p-4 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(236,72,153,0.4)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg border border-pink-400/50 shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                          <BarChart3 className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <div className="text-xs text-pink-300/70 uppercase tracking-wide">Progress</div>
                          <motion.div
                            key={progress}
                            initial={{ scale: 1.3, color: '#ec4899' }}
                            animate={{ scale: 1, color: '#f9a8d4' }}
                            className="text-2xl font-bold text-pink-300 font-mono"
                          >
                            {progress}%
                          </motion.div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden border border-pink-500/30">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ['-100%', '200%']
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                        style={{ width: '50%' }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Status Indicator */}
                <motion.div
                  className="flex items-center justify-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  animate={{
                    borderColor: isPlaying 
                      ? ['rgba(6,182,212,0.5)', 'rgba(168,85,247,0.5)', 'rgba(6,182,212,0.5)']
                      : 'rgba(75,85,99,1)'
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-cyan-400' : 'bg-gray-500'}`}
                    animate={{
                      boxShadow: isPlaying
                        ? [
                            '0 0 5px rgba(6,182,212,0.8)',
                            '0 0 15px rgba(6,182,212,1)',
                            '0 0 5px rgba(6,182,212,0.8)'
                          ]
                        : '0 0 0px rgba(75,85,99,0)'
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className={`text-xs font-medium ${isPlaying ? 'text-cyan-300' : 'text-gray-400'}`}>
                    {isPlaying ? 'Sorting...' : 'Ready'}
                  </span>
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
                    <BarChart3 className="w-24 h-24 text-cyan-400/50" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-semibold text-cyan-300">
                      Generate an array to begin
                    </p>
                    <p className="text-gray-500">
                      Click the reset button to create a random array
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-[500px] flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const isComparing = steps[currentStep]?.comparingIndices.includes(index);
                    const isSwapping = steps[currentStep]?.swappingIndices.includes(index);
                    const isSorted = steps[currentStep]?.sortedIndices.includes(index);
                    
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
                        className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          backgroundColor: barColor,
                          boxShadow: [
                            `0 0 ${glowIntensity * 20}px ${glowColor}`,
                            `0 0 ${glowIntensity * 40}px ${glowColor}`,
                            `0 0 ${glowIntensity * 20}px ${glowColor}`
                          ],
                          scale: isSwapping ? [1, 1.1, 1] : isComparing ? 1.05 : 1,
                          y: isSwapping ? [-10, 0] : 0
                        }}
                        transition={{
                          height: { duration: 0.3, ease: "easeOut" },
                          backgroundColor: { duration: 0.2 },
                          boxShadow: { duration: 0.5, repeat: isComparing || isSwapping ? Infinity : 0 },
                          scale: { duration: 0.3 },
                          y: { duration: 0.4, ease: "easeInOut" }
                        }}
                        style={{
                          background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                          border: `1px solid ${barColor}`,
                        }}
                      >
                        {/* Value label */}
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono font-semibold whitespace-nowrap"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: isComparing || isSwapping || isSorted ? 1 : 0.5,
                            scale: isComparing || isSwapping ? [1, 1.2, 1] : 1,
                            color: barColor
                          }}
                          transition={{
                            scale: { duration: 0.3, repeat: isComparing || isSwapping ? Infinity : 0 }
                          }}
                        >
                          {element.value}
                        </motion.div>
                        
                        {/* Comparison indicator */}
                        {isComparing && (
                          <motion.div
                            className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: [0.5, 1, 0.5],
                              y: [0, -5, 0]
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(255,255,0,0.8)]" />
                          </motion.div>
                        )}
                        
                        {/* Swap indicator */}
                        {isSwapping && (
                          <motion.div
                            className="absolute -top-16 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0.5, 1.5, 0.5],
                              rotate: [0, 180, 360]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeOut"
                            }}
                          >
                            <Zap className="w-4 h-4 text-pink-400" />
                          </motion.div>
                        )}
                        
                        {/* Sorted checkmark */}
                        {isSorted && (
                          <motion.div
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            initial={{ opacity: 0, scale: 0, rotate: -180 }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              rotate: 0
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 10
                            }}
                          >
                            <div className="w-6 h-6 rounded-full bg-green-500/30 backdrop-blur-sm flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-green-300"
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
                        
                        {/* Swap trail effect */}
                        {isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: [0, 0.5, 0],
                                scale: [1, 1.2, 1.4]
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                ease: "easeOut"
                              }}
                              style={{
                                background: `radial-gradient(circle, ${barColor}80, transparent)`,
                                filter: 'blur(8px)'
                              }}
                            />
                            <motion.div
                              className="absolute -inset-2 rounded-t-lg"
                              animate={{
                                opacity: [0.3, 0.6, 0.3],
                              }}
                              transition={{
                                duration: 0.4,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              style={{
                                background: `radial-gradient(circle at center, ${barColor}40, transparent 70%)`,
                                filter: 'blur(12px)'
                              }}
                            />
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                  
                  {/* Comparison connection line */}
                  {steps[currentStep]?.comparingIndices.length === 2 && (
                    <motion.svg
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.line
                        x1={`${(steps[currentStep].comparingIndices[0] / array.length) * 100}%`}
                        y1="20%"
                        x2={`${(steps[currentStep].comparingIndices[1] / array.length) * 100}%`}
                        y2="20%"
                        stroke="#ffff00"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        initial={{ pathLength: 0 }}
                        animate={{
                          pathLength: [0, 1, 0],
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(255, 255, 0, 0.8))'
                        }}
                      />
                    </motion.svg>
                  )}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {array.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center space-y-4"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <BarChart3 className="w-16 h-16 text-cyan-400 mx-auto" />
                      </motion.div>
                      <p className="text-gray-400 text-lg">Generate an array to start visualizing</p>
                    </motion.div>
                  </div>
                ) : (
                  array.map((element, index) => {
                    const isComparing = steps[currentStep]?.comparingIndices.includes(index);
                    const isSwapping = steps[currentStep]?.swappingIndices.includes(index);
                    const isSorted = steps[currentStep]?.sortedIndices.includes(index);
                    
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
                          backgroundColor: barColor,
                        }}
                        transition={{
                          height: { duration: 0.5, ease: "easeOut" },
                          backgroundColor: { duration: 0.3 },
                          scale: { duration: 0.2, type: "spring", stiffness: 300 },
                          layout: { duration: 0.4, ease: "easeInOut" }
                        }}
                        className="relative rounded-t-lg"
                        style={{
                          flex: 1,
                          minWidth: array.length > 40 ? '8px' : '16px',
                          maxWidth: array.length > 40 ? '20px' : '40px',
                          boxShadow: `0 0 ${20 * glowIntensity}px ${barColor}, 0 0 ${40 * glowIntensity}px ${barColor}`,
                          border: `1px solid ${barColor}`,
                        }}
                      >
                        {/* Value label for larger bars */}
                        {array.length <= 20 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-semibold whitespace-nowrap"
                            style={{
                              color: barColor,
                              textShadow: `0 0 10px ${barColor}`,
                            }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                        
                        {/* Swap trail effect */}
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [1, 1.3, 1.5],
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeOut"
                            }}
                            style={{
                              background: `radial-gradient(circle, ${barColor}40, transparent)`,
                              filter: 'blur(8px)',
                            }}
                          />
                        )}
                        
                        {/* Comparison pulse effect */}
                        {isComparing && (
                          <motion.div
                            className="absolute -inset-1 rounded-t-lg"
                            animate={{
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            style={{
                              border: `2px solid ${barColor}`,
                              boxShadow: `0 0 20px ${barColor}`,
                            }}
                          />
                        )}
                        
                        {/* Sorted checkmark indicator */}
                        {isSorted && array.length <= 30 && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                          >
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{
                                backgroundColor: '#00ff0040',
                                border: '2px solid #00ff00',
                                boxShadow: '0 0 15px #00ff00',
                                color: '#00ff00',
                              }}
                            >
                              ✓
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Gradient overlay for depth */}
                        <div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            background: `linear-gradient(to top, ${barColor}00, ${barColor}40)`,
                            pointerEvents: 'none',
                          }}
                        />
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

                        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-2xl shadow-purple-500/20"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Sorting Progress
                  </h3>
                  <motion.span
                    className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                    key={currentStep}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                  </motion.span>
                </div>

                <div className="relative w-full h-4 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/50">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                    }}
                    transition={{ 
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    style={{
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(0, 255, 255, 0.6)'
                    }}
                  />
                  
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{
                      width: '50%'
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Step: {currentStep}</span>
                  <span>Total: {steps.length}</span>
                </div>

                {currentStep >= steps.length && steps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-2"
                  >
                    <span className="text-green-400 font-semibold text-sm flex items-center justify-center gap-2">
                      <motion.span
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 360]
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeInOut"
                        }}
                      >
                        ✓
                      </motion.span>
                      Sorting Complete!
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Legend
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-cyan-600 border-2 border-cyan-300"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(34, 211, 238, 0.5)',
                    '0 0 20px rgba(34, 211, 238, 0.8)',
                    '0 0 10px rgba(34, 211, 238, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-cyan-300 font-medium text-sm">Comparing</div>
                <div className="text-gray-500 text-xs">Active comparison</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-6 rounded bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-purple-300"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(168, 85, 247, 0.5)',
                    '0 0 20px rgba(168, 85, 247, 0.8)',
                    '0 0 10px rgba(168, 85, 247, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <div>
                <div className="text-purple-300 font-medium text-sm">Swapping</div>
                <div className="text-gray-500 text-xs">Elements swapping</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-green-600 border-2 border-green-300"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(34, 197, 94, 0.5)',
                    '0 0 20px rgba(34, 197, 94, 0.8)',
                    '0 0 10px rgba(34, 197, 94, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
              <div>
                <div className="text-green-300 font-medium text-sm">Sorted</div>
                <div className="text-gray-500 text-xs">In final position</div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-500/50 transition-all duration-300"
            >
              <div className="w-6 h-6 rounded bg-gradient-to-br from-gray-500 to-gray-700 border-2 border-gray-400" />
              <div>
                <div className="text-gray-300 font-medium text-sm">Unsorted</div>
                <div className="text-gray-500 text-xs">Awaiting sort</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}