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

  const animateSteps = useCallback(() => {
    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const step = steps[currentStep];
    setArray(step.array);
    setCurrentStep(prev => prev + 1);
  }, [currentStep, steps]);

  const startVisualization = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) return;
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
    if (array.length === 0) return;

    const newSteps: AlgorithmStep[] = [];
    const arr = [...array];

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
        for (let i = 0; i < arr.length - 1; i++) {
          for (let j = 0; j < arr.length - i - 1; j++) {
            addStep([j, j + 1], [], sorted);
            if (arr[j].value > arr[j + 1].value) {
              addStep([j, j + 1], [j, j + 1], sorted);
              swap(j, j + 1);
              addStep([], [], sorted);
            }
          }
          sorted.push(arr.length - i - 1);
          addStep([], [], sorted);
        }
        sorted.push(0);
        addStep([], [], sorted);
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
            addStep([j, j + 1], [], sorted);
          }
          sorted.push(i);
          addStep([], [], sorted);
        }
        break;
      }

      case 'quick': {
        const sorted: number[] = [];
        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pivotIndex = partition(low, high);
            sorted.push(pivotIndex);
            addStep([], [], sorted);
            quickSort(low, pivotIndex - 1);
            quickSort(pivotIndex + 1, high);
          } else if (low === high) {
            sorted.push(low);
            addStep([], [], sorted);
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
                addStep([i, j], [i, j], sorted);
                swap(i, j);
              }
            }
          }
          addStep([i + 1, high], [i + 1, high], sorted);
          swap(i + 1, high);
          return i + 1;
        };

        quickSort(0, arr.length - 1);
        break;
      }

      case 'merge': {
        const sorted: number[] = [];
        const mergeSort = (left: number, right: number) => {
          if (left >= right) {
            return;
          }

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
            k++;
            addStep([], [k - 1], sorted);
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
            if (!sorted.includes(idx)) {
              sorted.push(idx);
            }
          }
          addStep([], [], sorted);
        };

        mergeSort(0, arr.length - 1);
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
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.3)]"
            >
              <div className="space-y-6">
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">Algorithm</h3>
                  </div>
                  <div className="space-y-2">
                    {mockAlgorithms.map((algo) => (
                      <button
                        key={algo.id}
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          generateSortingSteps(algo.id as AlgorithmType);
                        }}
                        disabled={isPlaying}
                        className={`w-full p-3 rounded-lg text-left transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-700/50 border-2 border-gray-600/50 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
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
                    <BarChart3 className="w-5 h-5" />
                    <h3 className="font-semibold">Array Size</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Size</span>
                      <span className="text-cyan-400 font-mono">{arraySize[0]}</span>
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
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-pink-400">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-semibold">Speed</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Animation Speed</span>
                      <span className="text-cyan-400 font-mono">{speed[0]}%</span>
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
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 rounded-lg shadow-[0_0_25px_rgba(0,255,255,0.5)] hover:shadow-[0_0_35px_rgba(0,255,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        {currentStep >= steps.length ? 'Finished' : 'Start'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-6 rounded-lg shadow-[0_0_25px_rgba(255,0,255,0.5)] hover:shadow-[0_0_35px_rgba(255,0,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step</span>
                    <span className="text-cyan-400 font-mono">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Array Elements</span>
                    <span className="text-purple-400 font-mono">{array.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Algorithm
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`relative p-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400 shadow-lg shadow-cyan-500/50'
                            : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{algo.name.split(' ')[0]}</span>
                          <span className="text-xs opacity-70">{algo.complexity}</span>
                        </div>
                        {selectedAlgorithm === algo.id && (
                          <motion.div
                            className="absolute inset-0 rounded-lg bg-cyan-400/10"
                            layoutId="algorithmGlow"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4">Speed</h3>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={1}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:transition-shadow [&_[role=slider]]:hover:shadow-cyan-400/80 [&_.relative]:bg-gray-700 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-cyan-500 [&_.bg-primary]:to-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Slow</span>
                    <span className="text-cyan-400 font-semibold">{speed[0]}%</span>
                    <span>Fast</span>
                  </div></parameter>
</invoke>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4">Array Size</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Size</span>
                      <motion.span 
                        key={arraySize[0]}
                        initial={{ scale: 1.3, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#9ca3af' }}
                        className="text-sm font-mono font-bold"
                      >
                        {arraySize[0]}
                      </motion.span>
                    </div>
                    <Slider
                      value={arraySize}
                      onValueChange={setArraySize}
                      min={5}
                      max={50}
                      step={1}
                      className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_.slider-track]:bg-cyan-500/30 [&_.slider-range]:bg-gradient-to-r [&_.slider-range]:from-cyan-500 [&_.slider-range]:to-purple-500"
                      disabled={isPlaying}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (currentStep >= steps.length && steps.length > 0)}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isPlaying
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-[0_0_30px_rgba(249,115,22,0.6)]'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="flex items-center justify-center gap-3"
                      animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-6 h-6" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-6 h-6" />
                          <span>Start</span>
                        </>
                      )}
                    </motion.div>
                  </motion.button>

                  <motion.button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_40px_rgba(168,85,247,0.8)] disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="flex items-center justify-center gap-3"
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.5 }}
                    >
                      <RotateCcw className="w-6 h-6" />
                      <span>Reset</span>
                    </motion.div>
                  </motion.button>
                </div>
              </div>
            </div>

            
<motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Statistics</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Comparisons */}
                  <motion.div
                    className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 rounded-xl p-4 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0,255,255,0.4)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-cyan-300/70 uppercase tracking-wider mb-1">
                          Comparisons
                        </div>
                        <motion.div
                          key={comparisons}
                          initial={{ scale: 1.3, color: '#00ffff' }}
                          animate={{ scale: 1, color: '#ffffff' }}
                          className="text-3xl font-bold text-white font-mono"
                        >
                          {comparisons}
                        </motion.div>
                      </div>
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(0,255,255,0.5)',
                            '0 0 20px rgba(0,255,255,0.8)',
                            '0 0 10px rgba(0,255,255,0.5)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center"
                      >
                        <BarChart3 className="w-6 h-6 text-cyan-400" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Swaps */}
                  <motion.div
                    className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 rounded-xl p-4 border border-pink-500/40 shadow-[0_0_15px_rgba(255,0,102,0.2)]"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(255,0,102,0.4)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-pink-300/70 uppercase tracking-wider mb-1">
                          Swaps
                        </div>
                        <motion.div
                          key={swaps}
                          initial={{ scale: 1.3, color: '#ff0066' }}
                          animate={{ scale: 1, color: '#ffffff' }}
                          className="text-3xl font-bold text-white font-mono"
                        >
                          {swaps}
                        </motion.div>
                      </div>
                      <motion.div
                        animate={{
                          rotate: [0, 180, 360],
                          boxShadow: [
                            '0 0 10px rgba(255,0,102,0.5)',
                            '0 0 20px rgba(255,0,102,0.8)',
                            '0 0 10px rgba(255,0,102,0.5)'
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center"
                      >
                        <RotateCcw className="w-6 h-6 text-pink-400" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Progress */}
                  <motion.div
                    className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-4 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(168,85,247,0.4)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-purple-300/70 uppercase tracking-wider">
                          Progress
                        </div>
                        <motion.div
                          key={currentStep}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="text-lg font-bold text-white font-mono"
                        >
                          {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                        </motion.div>
                      </div>
                      
                      <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                          }}
                          transition={{ duration: 0.3 }}
                          style={{
                            boxShadow: '0 0 15px rgba(168,85,247,0.6)'
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
                            ease: 'linear'
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-gray-400 font-mono">
                        <span>Step {currentStep}</span>
                        <span>of {steps.length}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Array Status */}
                  <motion.div
                    className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-4 border border-green-500/40 shadow-[0_0_15px_rgba(0,255,170,0.2)]"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0,255,170,0.4)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-green-300/70 uppercase tracking-wider mb-1">
                          Array Size
                        </div>
                        <div className="text-3xl font-bold text-white font-mono">
                          {array.length}
                        </div>
                      </div>
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            '0 0 10px rgba(0,255,170,0.5)',
                            '0 0 20px rgba(0,255,170,0.8)',
                            '0 0 10px rgba(0,255,170,0.5)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center"
                      >
                        <BarChart3 className="w-6 h-6 text-green-400" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Status Indicator */}
                <motion.div
                  className="mt-4 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50"
                  animate={{
                    borderColor: isPlaying 
                      ? ['rgba(0,255,255,0.5)', 'rgba(255,0,255,0.5)', 'rgba(0,255,255,0.5)']
                      : 'rgba(156,163,175,0.5)'
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        isPlaying ? 'bg-cyan-400' : 'bg-gray-500'
                      }`}
                      animate={{
                        scale: isPlaying ? [1, 1.5, 1] : 1,
                        boxShadow: isPlaying 
                          ? ['0 0 5px rgba(0,255,255,0.8)', '0 0 15px rgba(0,255,255,1)', '0 0 5px rgba(0,255,255,0.8)']
                          : 'none'
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className={`text-sm font-medium ${
                      isPlaying ? 'text-cyan-300' : 'text-gray-400'
                    }`}>
                      {isPlaying ? 'Sorting...' : currentStep === steps.length && steps.length > 0 ? 'Complete' : 'Ready'}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-lg shadow-purple-500/20 min-h-[600px]">
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
                    <BarChart3 className="w-24 h-24 text-cyan-400/50" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-semibold text-gray-400">
                      No Array Generated
                    </h3>
                    <p className="text-gray-500">
                      Click "Generate Array" to start visualizing
                    </p>
                  </div>
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(0, 255, 255, 0.3)',
                        '0 0 40px rgba(0, 255, 255, 0.6)',
                        '0 0 20px rgba(0, 255, 255, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Button
                      onClick={generateRandomArray}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Generate Array
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="h-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const maxValue = Math.max(...array.map(e => e.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    const colorIndex = index % NEON_COLORS.length;
                    const baseColor = NEON_COLORS[colorIndex];

                    let glowColor = baseColor;
                    let glowIntensity = 0.3;

                    if (element.isComparing) {
                      glowColor = '#ffff00';
                      glowIntensity = 0.8;
                    } else if (element.isSwapping) {
                      glowColor = '#ff00ff';
                      glowIntensity = 1;
                    } else if (element.isSorted) {
                      glowColor = '#00ff00';
                      glowIntensity = 0.6;
                    }

                    return (
                      <motion.div
                        key={element.id}
                        layout
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          scale: element.isSwapping ? [1, 1.1, 1] : 1,
                          y: element.isSwapping ? [0, -10, 0] : 0
                        }}
                        transition={{
                          height: { duration: 0.5, ease: "easeOut" },
                          opacity: { duration: 0.3 },
                          scale: { duration: 0.3, repeat: element.isSwapping ? Infinity : 0 },
                          y: { duration: 0.3, repeat: element.isSwapping ? Infinity : 0 },
                          layout: { duration: 0.5, ease: "easeInOut" }
                        }}
                        className="relative flex-1 min-w-[8px] max-w-[60px] rounded-t-lg"
                        style={{
                          background: element.isSorted
                            ? 'linear-gradient(to top, #00ff00, #00ffaa)'
                            : element.isComparing
                            ? 'linear-gradient(to top, #ffff00, #ffaa00)'
                            : element.isSwapping
                            ? 'linear-gradient(to top, #ff00ff, #ff0066)'
                            : `linear-gradient(to top, ${baseColor}, ${baseColor}dd)`,
                          boxShadow: `
                            0 0 ${20 * glowIntensity}px ${glowColor}${Math.floor(glowIntensity * 100).toString(16)},
                            0 0 ${40 * glowIntensity}px ${glowColor}${Math.floor(glowIntensity * 50).toString(16)},
                            inset 0 0 ${10 * glowIntensity}px rgba(255, 255, 255, ${0.2 * glowIntensity})
                          `,
                          border: `1px solid ${glowColor}${Math.floor(glowIntensity * 150).toString(16)}`
                        }}
                      >
                        {/* Trail effect for swapping */}
                        {element.isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              background: `linear-gradient(to top, ${glowColor}40, transparent)`
                            }}
                            animate={{
                              opacity: [0.8, 0, 0.8],
                              scale: [1, 1.5, 1]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}

                        {/* Value label */}
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            color: element.isSorted
                              ? '#00ff00'
                              : element.isComparing
                              ? '#ffff00'
                              : element.isSwapping
                              ? '#ff00ff'
                              : baseColor,
                            textShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}40`
                          }}
                        >
                          {element.value}
                        </motion.div>

                        {/* Pulse effect for comparing */}
                        {element.isComparing && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg border-2"
                            style={{
                              borderColor: glowColor
                            }}
                            animate={{
                              opacity: [1, 0.3, 1],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}</parameter>
              
              <div className="h-full flex items-end justify-center gap-1">
                {array.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <BarChart3 className="w-20 h-20 text-cyan-400/50" />
                    </motion.div>
                    <p className="text-gray-400 text-lg">Generate an array to start visualizing</p>
                    <Button
                      onClick={generateRandomArray}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Generate Array
                    </Button>
                  </div>
                ) : (
                  array.map((element, index) => {
                    const isComparing = element.isComparing;
                    const isSwapping = element.isSwapping;
                    const isSorted = element.isSorted;
                    
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let glowColor = barColor;
                    let glowIntensity = 0.3;
                    
                    if (isSorted) {
                      barColor = '#00ff00';
                      glowColor = '#00ff00';
                      glowIntensity = 0.6;
                    } else if (isSwapping) {
                      barColor = '#ff0066';
                      glowColor = '#ff0066';
                      glowIntensity = 0.8;
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
                          height: `${element.value * 4}px`,
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          layout: { duration: 0.3, ease: "easeInOut" },
                          height: { duration: 0.3, ease: "easeOut" },
                          scale: { duration: 0.2 },
                          opacity: { duration: 0.2 }
                        }}
                        className="relative flex-1 min-w-[8px] max-w-[60px] rounded-t-lg"
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `
                            0 0 ${glowIntensity * 20}px ${glowColor},
                            0 0 ${glowIntensity * 40}px ${glowColor}80,
                            inset 0 0 ${glowIntensity * 10}px ${glowColor}40
                          `,
                          border: `1px solid ${glowColor}`,
                        }}
                      >
                        {/* Trail effect for swapping */}
                        {isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              style={{
                                backgroundColor: barColor,
                                opacity: 0.6,
                              }}
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.6, 0.3, 0.6],
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                            <motion.div
                              className="absolute -top-2 left-1/2 -translate-x-1/2"
                              animate={{
                                y: [-10, -20, -10],
                                opacity: [1, 0.5, 1],
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                              }}
                            >
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: barColor,
                                  boxShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}`
                                }}
                              />
                            </motion.div>
                          </>
                        )}

                        {/* Pulse effect for comparing */}
                        {isComparing && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg border-2"
                            style={{
                              borderColor: barColor,
                            }}
                            animate={{
                              scale: [1, 1.15, 1],
                              opacity: [0.8, 0.4, 0.8],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}

                        {/* Sparkle effect for sorted */}
                        {isSorted && (
                          <motion.div
                            className="absolute -top-1 left-1/2 -translate-x-1/2"
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{
                              scale: [0, 1.5, 0],
                              rotate: [0, 180, 360],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1,
                              ease: "easeOut"
                            }}
                          >
                            <div 
                              className="w-3 h-3"
                              style={{
                                background: `radial-gradient(circle, ${barColor} 0%, transparent 70%)`,
                              }}
                            />
                          </motion.div>
                        )}

                        {/* Value label */}
                        <motion.div
                          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono font-semibold whitespace-nowrap"
                          style={{
                            color: barColor,
                            textShadow: `0 0 5px ${glowColor}`,
                          }}
                          animate={{
                            scale: isComparing || isSwapping ? [1, 1.2, 1] : 1,
                          }}
                          transition={{
                            duration: 0.3,
                            repeat: isComparing || isSwapping ? Infinity : 0,
                          }}
                        >
                          {element.value}
                        </motion.div>

                        {/* Gradient overlay for depth */}
                        <div
                          className="absolute inset-0 rounded-t-lg pointer-events-none"
                          style={{
                            background: `linear-gradient(to top, ${barColor}00 0%, ${barColor}40 100%)`,
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
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20"
            >
              <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Legend
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                >
                  <motion.div
                    className="w-4 h-12 rounded bg-gradient-to-t from-cyan-400 to-cyan-300"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(0, 255, 255, 0.5)',
                        '0 0 20px rgba(0, 255, 255, 0.8)',
                        '0 0 10px rgba(0, 255, 255, 0.5)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">Default</div>
                    <div className="text-xs text-gray-400">Unsorted</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-yellow-500/30"
                >
                  <motion.div
                    className="w-4 h-12 rounded bg-gradient-to-t from-yellow-400 to-yellow-300"
                    animate={{
                      boxShadow: [
                        '0 0 15px rgba(255, 255, 0, 0.6)',
                        '0 0 25px rgba(255, 255, 0, 0.9)',
                        '0 0 15px rgba(255, 255, 0, 0.6)'
                      ],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">Comparing</div>
                    <div className="text-xs text-gray-400">Active</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-pink-500/30"
                >
                  <motion.div
                    className="w-4 h-12 rounded bg-gradient-to-t from-pink-500 to-pink-400"
                    animate={{
                      boxShadow: [
                        '0 0 15px rgba(255, 0, 102, 0.6)',
                        '0 0 25px rgba(255, 0, 102, 0.9)',
                        '0 0 15px rgba(255, 0, 102, 0.6)'
                      ],
                      x: [-2, 2, -2]
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-sm font-medium text-white">Swapping</div>
                    <div className="text-xs text-gray-400">Moving</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-green-500/30"
                >
                  <motion.div
                    className="w-4 h-12 rounded bg-gradient-to-t from-green-400 to-green-300"
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
                    <div className="text-sm font-medium text-white">Sorted</div>
                    <div className="text-xs text-gray-400">Complete</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-purple-300">Timeline Control</h3>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/50 rounded-full border border-purple-500/50">
                <span className="text-sm text-gray-400">Step</span>
                <motion.span
                  key={currentStep}
                  initial={{ scale: 1.3, color: '#a855f7' }}
                  animate={{ scale: 1, color: '#d8b4fe' }}
                  className="text-sm font-mono font-bold"
                >
                  {currentStep}
                </motion.span>
                <span className="text-sm text-gray-400">/</span>
                <span className="text-sm font-mono text-purple-300">{steps.length}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden border border-gray-600/50">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%',
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)',
                }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400/50 to-purple-400/50 rounded-full blur-sm"
                animate={{
                  width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%',
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>

            {/* Timeline Scrubber */}
            <div className="relative pt-2">
              <input
                type="range"
                min={0}
                max={steps.length}
                value={currentStep}
                onChange={(e) => {
                  const newStep = parseInt(e.target.value);
                  setCurrentStep(newStep);
                  if (newStep < steps.length) {
                    setArray(steps[newStep].array);
                  }
                }}
                disabled={isPlaying || steps.length === 0}
                className="w-full h-2 bg-transparent appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                  [&::-webkit-slider-track]:h-2 [&::-webkit-slider-track]:bg-gray-700/50 [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:border [&::-webkit-slider-track]:border-gray-600/50
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-cyan-400 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(168,85,247,0.8)] [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:shadow-[0_0_30px_rgba(168,85,247,1)] [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-gray-700/50 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:border [&::-moz-range-track]:border-gray-600/50
                  [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-cyan-400 [&::-moz-range-thumb]:to-purple-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[0_0_20px_rgba(168,85,247,0.8)] [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:shadow-[0_0_30px_rgba(168,85,247,1)] [&::-moz-range-thumb]:hover:scale-110"
              />
              
              {/* Step Markers */}
              {steps.length > 0 && steps.length <= 50 && (
                <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: index <= currentStep ? 1 : 0.5 }}
                      className={`w-1 h-1 rounded-full transition-all duration-200 ${
                        index < currentStep
                          ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.8)]'
                          : index === currentStep
                          ? 'bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,1)]'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Navigation Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                onClick={() => {
                  setCurrentStep(0);
                  if (steps.length > 0) {
                    setArray(steps[0].array);
                  }
                }}
                disabled={isPlaying || currentStep === 0 || steps.length === 0}
                size="sm"
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-xs font-semibold">First</span>
              </Button>
              
              <Button
                onClick={() => {
                  const newStep = Math.max(0, currentStep - 1);
                  setCurrentStep(newStep);
                  if (newStep < steps.length) {
                    setArray(steps[newStep].array);
                  }
                }}
                disabled={isPlaying || currentStep === 0 || steps.length === 0}
                size="sm"
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-purple-400 border border-purple-500/30 hover:border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-xs font-semibold">← Prev</span>
              </Button>
              
              <Button
                onClick={() => {
                  const newStep = Math.min(steps.length, currentStep + 1);
                  setCurrentStep(newStep);
                  if (newStep < steps.length) {
                    setArray(steps[newStep].array);
                  }
                }}
                disabled={isPlaying || currentStep >= steps.length || steps.length === 0}
                size="sm"
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-purple-400 border border-purple-500/30 hover:border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-xs font-semibold">Next →</span>
              </Button>
              
              <Button
                onClick={() => {
                  setCurrentStep(steps.length);
                  if (steps.length > 0) {
                    setArray(steps[steps.length - 1].array);
                  }
                }}
                disabled={isPlaying || currentStep >= steps.length || steps.length === 0}
                size="sm"
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-xs font-semibold">Last</span>
              </Button>
            </div>

            {/* Status Indicator */}
            {steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 pt-2"
              >
                {currentStep >= steps.length ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 rounded-full border border-green-500/50">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.7, 1],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                    />
                    <span className="text-sm font-semibold text-green-300">Sorting Complete</span>
                  </div>
                ) : isPlaying ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-cyan-900/30 rounded-full border border-cyan-500/50">
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                    />
                    <span className="text-sm font-semibold text-cyan-300">Playing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 rounded-full border border-purple-500/50">
                    <div className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                    <span className="text-sm font-semibold text-purple-300">Paused</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}