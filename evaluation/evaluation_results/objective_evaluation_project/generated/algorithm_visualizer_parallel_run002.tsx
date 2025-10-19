import { useState, useCallback } from 'react';import React from 'react';
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

  // Animation effect for step-by-step visualization
  const animateSteps = useCallback(() => {
    if (currentStep < steps.length && isPlaying) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 - speed[0] * 9.5); // Convert speed slider (0-100) to delay (1000ms-50ms)
      
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentStep, steps.length, isPlaying, speed]);

  // Run animation effect
  React.useEffect(() => {
    const cleanup = animateSteps();
    return cleanup;
  }, [animateSteps]);
  const startVisualization = useCallback(() => {
    if (steps.length === 0) return;
    setIsPlaying(true);
    if (currentStep >= steps.length) {
      setCurrentStep(0);
    }
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {
    setIsPlaying(false);
  
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
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
          addStep([], [], sorted);
        }
        break;
      }

      case 'insertion': {
        const sorted: number[] = [0];
        addStep([], [], sorted);
        for (let i = 1; i < arr.length; i++) {
          let j = i;
          addStep([j], [], sorted);
          while (j > 0 && arr[j - 1].value > arr[j].value) {
            addStep([j - 1, j], [j - 1, j], sorted);
            swap(j - 1, j);
            j--;
            addStep([j], [], sorted);
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
            const pivotIdx = partition(low, high);
            sorted.push(pivotIdx);
            addStep([], [], sorted);
            quickSort(low, pivotIdx - 1);
            quickSort(pivotIdx + 1, high);
          } else if (low === high) {
            sorted.push(low);
            addStep([], [], sorted);
          }
        };

        const partition = (low: number, high: number): number => {
          const pivot = arr[high].value;
          addStep([high], [], sorted);
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
          if (left < right) {
            const mid = Math.floor((left + right) / 2);
            mergeSort(left, mid);
            mergeSort(mid + 1, right);
            merge(left, mid, right);
          }
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
              className="px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-400/50"
            >
              <div className="flex items-center gap-2">
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
                            ? 'bg-cyan-500/20 border border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)] text-cyan-300'
                            : 'bg-gray-700/50 border border-gray-600 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-400'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-medium">{algo.name}</div>
                        <div className="text-xs opacity-70">{algo.complexity}</div>
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
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Size</span>
                      <span className="text-purple-400 font-mono">{arraySize[0]}</span>
                    </div>
                    <Slider
                      value={arraySize}
                      onValueChange={(value) => {
                        setArraySize(value);
                        if (!isPlaying) generateRandomArray();
                      }}
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
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Delay</span>
                      <span className="text-pink-400 font-mono">{speed[0]}ms</span>
                    </div>
                    <Slider
                      value={speed}
                      onValueChange={setSpeed}
                      min={10}
                      max={200}
                      step={10}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700">
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
                    disabled={isPlaying}
                    variant="outline"
                    className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 shadow-[0_0_15px_rgba(255,0,102,0.3)] transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-cyan-400 font-mono">
                      {steps.length > 0 ? Math.min(currentStep, steps.length) : 0} / {steps.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                      initial={{ width: 0 }}
                      animate={{
                        width: steps.length > 0 ? `${(Math.min(currentStep, steps.length) / steps.length) * 100}%` : '0%'
                      }}
                      transition={{ duration: 0.3 }}
                    />
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
                  <div className="grid grid-cols-2 gap-2">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`p-3 rounded-lg font-medium text-sm transition-all ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/30 text-cyan-300 border-2 border-cyan-400 shadow-lg shadow-cyan-500/50'
                            : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="font-semibold">{algo.name.split(' ')[0]}</div>
                        <div className="text-xs opacity-70">{algo.complexity}</div>
                      </motion.button>
                    ))}
                  </div></parameter>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4">Speed</h3>
                  <div className="space-y-2">
                    <Slider
                      value={speed}
                      onValueChange={setSpeed}
                      min={1}
                      max={100}
                      step={1}
                      className="cursor-pointer [&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-cyan-400/80 [&_[role=slider]]:hover:scale-110 [&_.relative]:bg-gray-700 [&_.relative]:overflow-visible [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-cyan-500 [&_.bg-primary]:to-purple-500 [&_.bg-primary]:shadow-lg [&_.bg-primary]:shadow-cyan-500/30"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Slow</span>
                      <span className="text-cyan-400 font-semibold">{speed[0]}%</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4">Array Size</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Elements</span>
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
                      disabled={isPlaying}
                      className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-400 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:transition-shadow hover:[&_[role=slider]]:shadow-cyan-400/80 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>5</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? (
                        <>
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Pause className="w-5 h-5" />
                          </motion.div>
                          Pause
                        </>
                      ) : (
                        <>
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Play className="w-5 h-5" />
                          </motion.div>
                          {currentStep > 0 && currentStep < steps.length ? 'Resume' : 'Start'}
                        </>
                      )}
                    </motion.div>
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 font-semibold py-6 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        whileHover={{ rotate: -180 }}
                        transition={{ duration: 0.5 }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </motion.div>
                      Reset
                    </motion.div>
                  </Button>

                  <Button
                    onClick={generateRandomArray}
                    variant="outline"
                    className="w-full border-2 border-pink-500/50 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 hover:text-pink-200 font-semibold py-6 rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 180, scale: 1.2 }}
                        transition={{ duration: 0.4 }}
                      >
                        <BarChart3 className="w-5 h-5" />
                      </motion.div>
                      New Array
                    </motion.div>
                  </Button></parameter>
                </div>
              </div>
            </div>

            
<motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-purple-400 font-semibold">Statistics</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-xl p-4 border border-cyan-500/20">
                  <div className="text-gray-400 text-sm mb-1">Comparisons</div>
                  <motion.div
                    key={comparisons}
                    initial={{ scale: 1.2, color: '#00ffff' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-3xl font-bold text-white"
                  >
                    {comparisons}
                  </motion.div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4 border border-pink-500/20">
                  <div className="text-gray-400 text-sm mb-1">Swaps</div>
                  <motion.div
                    key={swaps}
                    initial={{ scale: 1.2, color: '#ff00ff' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-3xl font-bold text-white"
                  >
                    {swaps}
                  </motion.div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4 border border-green-500/20">
                  <div className="text-gray-400 text-sm mb-1">Progress</div>
                  <motion.div
                    className="text-3xl font-bold text-white mb-2"
                  >
                    {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                  </motion.div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-cyan-500 shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4 border border-yellow-500/20">
                  <div className="text-gray-400 text-sm mb-1">Complexity</div>
                  <div className="text-xl font-mono text-yellow-400">
                    {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity || 'N/A'}
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/20">
                  <div className="text-gray-400 text-sm mb-1">Array Size</div>
                  <div className="text-2xl font-bold text-white">
                    {array.length}
                  </div>
                </div>
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
                    <BarChart3 className="w-24 h-24 text-cyan-400 opacity-50" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-semibold text-gray-400">
                      No Array Generated
                    </h3>
                    <p className="text-gray-500">
                      Click "Generate Array" to start visualizing
                    </p>
                  </div>
                  <Button
                    onClick={generateRandomArray}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Array
                  </Button>
                </motion.div>
              ) : (
                <div className="h-full w-full flex flex-col">
                  <div className="flex-1 flex items-end justify-center gap-1 px-4">
                    {(currentStep > 0 && currentStep <= steps.length
                      ? steps[currentStep - 1].array
                      : array
                    ).map((element, index) => {
                      const maxValue = Math.max(...array.map(el => el.value));
                      const heightPercentage = (element.value / maxValue) * 100;
                      
                      let barColor = NEON_COLORS[index % NEON_COLORS.length];
                      let glowIntensity = 0.3;
                      let scale = 1;
                      
                      if (element.isComparing) {
                        barColor = '#ffff00'; // Yellow for comparing
                        glowIntensity = 0.8;
                        scale = 1.05;
                      } else if (element.isSwapping) {
                        barColor = '#ff0066'; // Pink for swapping
                        glowIntensity = 1;
                        scale = 1.1;
                      } else if (element.isSorted) {
                        barColor = '#00ff00'; // Green for sorted
                        glowIntensity = 0.5;
                      }
                      
                      return (
                        <motion.div
                          key={element.id}
                          className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: `${heightPercentage}%`,
                            opacity: 1,
                            scale: scale,
                            boxShadow: [
                              `0 0 ${10 * glowIntensity}px ${barColor}`,
                              `0 0 ${20 * glowIntensity}px ${barColor}`,
                              `0 0 ${10 * glowIntensity}px ${barColor}`
                            ]
                          }}
                          transition={{
                            height: { duration: 0.5, ease: "easeOut" },
                            scale: { duration: 0.3 },
                            boxShadow: { duration: 0.6, repeat: element.isSwapping ? Infinity : 0 },
                            opacity: { duration: 0.3 }
                          }}
                          style={{
                            background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                            border: `1px solid ${barColor}`,
                          }}
                        >
                          {/* Glow effect overlay */}
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            animate={{
                              opacity: element.isSwapping ? [0.3, 0.7, 0.3] : element.isComparing ? [0.2, 0.5, 0.2] : 0.2
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: (element.isSwapping || element.isComparing) ? Infinity : 0
                            }}
                            style={{
                              background: `radial-gradient(circle at 50% 0%, ${barColor}88, transparent)`,
                            }}
                          />
                          
                          {/* Trail effect for swapping */}
                          {element.isSwapping && (
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              initial={{ opacity: 0, y: -20 }}
                              animate={{
                                opacity: [0, 0.6, 0],
                                y: [-20, 0, 20]
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity
                              }}
                              style={{
                                background: `linear-gradient(to bottom, ${barColor}, transparent)`,
                                filter: 'blur(8px)'
                              }}
                            />
                          )}
                          
                          {/* Value label */}
                          {array.length <= 30 && (
                            <motion.div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: element.isComparing || element.isSwapping ? 1 : 0.6,
                                scale: element.isComparing || element.isSwapping ? 1.2 : 1,
                                color: barColor
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              {element.value}
                            </motion.div>
                          )}
                          
                          {/* Particle effect for sorted elements */}
                          {element.isSorted && (
                            <>
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1 h-1 rounded-full"
                                  initial={{
                                    top: '0%',
                                    left: '50%',
                                    opacity: 1,
                                    backgroundColor: barColor
                                  }}
                                  animate={{
                                    top: '-50%',
                                    left: `${50 + (i - 1) * 30}%`,
                                    opacity: 0,
                                    scale: [1, 1.5, 0]
                                  }}
                                  transition={{
                                    duration: 1,
                                    delay: i * 0.1,
                                    repeat: Infinity,
                                    repeatDelay: 0.5
                                  }}
                                />
                              ))}
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Progress indicator */}
                  {steps.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 px-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span className="text-sm font-mono text-cyan-400">
                          {currentStep} / {steps.length} steps
                        </span>
                      </div>
                      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(currentStep / steps.length) * 100}%`
                          }}
                          transition={{ duration: 0.3 }}
                          style={{
                            boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              
              <div className="h-full flex items-end justify-center gap-1">
                {(currentStep > 0 && currentStep <= steps.length ? steps[currentStep - 1].array : array).map((element, index) => {
                  const isComparing = element.isComparing;
                  const isSwapping = element.isSwapping;
                  const isSorted = element.isSorted;
                  const maxValue = 105;
                  const heightPercentage = (element.value / maxValue) * 100;
                  
                  // Assign neon color based on index
                  const neonColor = NEON_COLORS[index % NEON_COLORS.length];
                  
                  return (
                    <motion.div
                      key={element.id}
                      className="relative flex-1 min-w-[8px] max-w-[60px] group"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: isSwapping ? [1, 1.1, 1] : 1
                      }}
                      transition={{ 
                        duration: 0.3,
                        scale: { duration: 0.4, repeat: isSwapping ? 2 : 0 }
                      }}
                    >
                      {/* Trail effect for swapping */}
                      {isSwapping && (
                        <>
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              height: `${heightPercentage}%`,
                              background: neonColor,
                              filter: 'blur(20px)',
                              opacity: 0.6
                            }}
                            animate={{
                              opacity: [0.6, 0.3, 0.6],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity
                            }}
                          />
                          <motion.div
                            className="absolute -top-2 left-1/2 -translate-x-1/2"
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              y: [-20, -40, -60]
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity
                            }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: neonColor,
                                boxShadow: `0 0 10px ${neonColor}, 0 0 20px ${neonColor}`
                              }}
                            />
                          </motion.div>
                        </>
                      )}
                      
                      {/* Main bar */}
                      <motion.div
                        className="relative w-full rounded-t-lg transition-all duration-300"
                        style={{
                          height: `${heightPercentage}%`,
                          background: isSorted 
                            ? `linear-gradient(to top, #10b981, #34d399)`
                            : isComparing
                            ? `linear-gradient(to top, #ef4444, #f87171)`
                            : isSwapping
                            ? `linear-gradient(to top, #f59e0b, #fbbf24)`
                            : `linear-gradient(to top, ${neonColor}, ${neonColor}dd)`,
                          boxShadow: isSorted
                            ? '0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.2)'
                            : isComparing
                            ? '0 0 30px rgba(239, 68, 68, 0.9), 0 0 60px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.3)'
                            : isSwapping
                            ? '0 0 30px rgba(245, 158, 11, 0.9), 0 0 60px rgba(245, 158, 11, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.3)'
                            : `0 0 15px ${neonColor}aa, 0 0 30px ${neonColor}66, inset 0 0 15px rgba(255, 255, 255, 0.1)`,
                          border: isSorted || isComparing || isSwapping ? '2px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                        animate={{
                          height: `${heightPercentage}%`,
                          boxShadow: isComparing
                            ? [
                                '0 0 30px rgba(239, 68, 68, 0.9), 0 0 60px rgba(239, 68, 68, 0.5)',
                                '0 0 40px rgba(239, 68, 68, 1), 0 0 80px rgba(239, 68, 68, 0.7)',
                                '0 0 30px rgba(239, 68, 68, 0.9), 0 0 60px rgba(239, 68, 68, 0.5)'
                              ]
                            : isSwapping
                            ? [
                                '0 0 30px rgba(245, 158, 11, 0.9), 0 0 60px rgba(245, 158, 11, 0.5)',
                                '0 0 40px rgba(245, 158, 11, 1), 0 0 80px rgba(245, 158, 11, 0.7)',
                                '0 0 30px rgba(245, 158, 11, 0.9), 0 0 60px rgba(245, 158, 11, 0.5)'
                              ]
                            : undefined
                        }}
                        transition={{
                          height: { duration: 0.5, ease: 'easeInOut' },
                          boxShadow: { duration: 0.6, repeat: (isComparing || isSwapping) ? Infinity : 0 }
                        }}
                      >
                        {/* Inner glow effect */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            background: `linear-gradient(to top, transparent, rgba(255, 255, 255, 0.3))`,
                            opacity: 0.5
                          }}
                          animate={{
                            opacity: isComparing || isSwapping ? [0.5, 0.8, 0.5] : 0.5
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: (isComparing || isSwapping) ? Infinity : 0
                          }}
                        />
                        
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg overflow-hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                            animate={{
                              x: ['-100%', '200%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1,
                              ease: 'easeInOut'
                            }}
                          />
                        </motion.div>
                      </motion.div>
                      
                      {/* Value label */}
                      <motion.div
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                        style={{
                          color: isSorted ? '#10b981' : isComparing ? '#ef4444' : isSwapping ? '#f59e0b' : neonColor,
                          textShadow: `0 0 10px ${isSorted ? '#10b981' : isComparing ? '#ef4444' : isSwapping ? '#f59e0b' : neonColor}`,
                          opacity: array.length > 30 ? 0 : 1
                        }}
                        animate={{
                          scale: isComparing || isSwapping ? [1, 1.2, 1] : 1,
                          y: isSwapping ? [0, -5, 0] : 0
                        }}
                        transition={{
                          duration: 0.4,
                          repeat: (isComparing || isSwapping) ? Infinity : 0
                        }}
                      >
                        {element.value}
                      </motion.div>
                      
                      {/* Hover tooltip for larger arrays */}
                      {array.length > 30 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div 
                            className="px-2 py-1 rounded text-xs font-mono font-bold whitespace-nowrap"
                            style={{
                              background: 'rgba(0, 0, 0, 0.8)',
                              color: neonColor,
                              border: `1px solid ${neonColor}`,
                              boxShadow: `0 0 10px ${neonColor}66`
                            }}
                          >
                            {element.value}
                          </div>
                        </div>
                      )}
                      
                      {/* Particle effects for swapping */}
                      {isSwapping && (
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 rounded-full"
                              style={{
                                background: neonColor,
                                boxShadow: `0 0 5px ${neonColor}`,
                                left: '50%',
                                top: '0%'
                              }}
                              animate={{
                                x: [0, (Math.random() - 0.5) * 40],
                                y: [0, -30 - Math.random() * 20],
                                opacity: [1, 0],
                                scale: [1, 0]
                              }}
                              transition={{
                                duration: 0.8,
                                delay: i * 0.1,
                                repeat: Infinity,
                                repeatDelay: 0.5
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

                        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10"
            >
              <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Legend
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 255, 0.5)' }}
                >
                  <motion.div
                    className="w-4 h-12 bg-gradient-to-t from-cyan-400 to-cyan-300 rounded"
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
                    <div className="text-sm font-medium text-cyan-300">Default</div>
                    <div className="text-xs text-gray-400">Unsorted</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 0, 0.5)' }}
                >
                  <motion.div
                    className="w-4 h-12 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded"
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
                    <div className="text-sm font-medium text-yellow-300">Comparing</div>
                    <div className="text-xs text-gray-400">Active</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(255, 0, 255, 0.5)' }}
                >
                  <motion.div
                    className="w-4 h-12 bg-gradient-to-t from-pink-500 to-pink-400 rounded"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(255, 0, 255, 0.7)',
                        '0 0 30px rgba(255, 0, 255, 1)',
                        '0 0 20px rgba(255, 0, 255, 0.7)'
                      ],
                      x: [-2, 2, -2]
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-sm font-medium text-pink-300">Swapping</div>
                    <div className="text-xs text-gray-400">Moving</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 0, 0.5)' }}
                >
                  <motion.div
                    className="w-4 h-12 bg-gradient-to-t from-green-400 to-green-300 rounded"
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
                    <div className="text-sm font-medium text-green-300">Sorted</div>
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
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-lg shadow-cyan-500/20"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: isPlaying ? 360 : 0,
                    scale: isPlaying ? [1, 1.2, 1] : 1
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 0.5, repeat: Infinity }
                  }}
                >
                  <Zap className="w-5 h-5 text-cyan-400" />
                </motion.div>
                <h3 className="text-cyan-400 font-semibold text-lg">Timeline Control</h3>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-400/50">
                <span className="text-sm text-purple-300 font-mono">
                  Step {currentStep} / {steps.length}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden border border-gray-600">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 relative"
                  initial={{ width: 0 }}
                  animate={{
                    width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </motion.div>
              </div>
              
              {/* Progress Indicator Dot */}
              {steps.length > 0 && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-cyan-400 rounded-full border-4 border-gray-900 shadow-lg shadow-cyan-400/50"
                  animate={{
                    left: `${(currentStep / steps.length) * 100}%`,
                    boxShadow: [
                      '0 0 20px rgba(0, 255, 255, 0.5)',
                      '0 0 40px rgba(0, 255, 255, 0.8)',
                      '0 0 20px rgba(0, 255, 255, 0.5)'
                    ]
                  }}
                  transition={{
                    left: { duration: 0.3, ease: "easeOut" },
                    boxShadow: { duration: 1, repeat: Infinity }
                  }}
                  style={{ marginLeft: '-12px' }}
                />
              )}
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
                  setIsPlaying(false);
                }}
                disabled={steps.length === 0}
                className="w-full h-2 bg-transparent appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                  [&::-webkit-slider-track]:h-2 [&::-webkit-slider-track]:bg-gray-700/50 [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:border [&::-webkit-slider-track]:border-gray-600
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-cyan-400 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan-400/50 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                  [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-gray-700/50 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:border [&::-moz-range-track]:border-gray-600
                  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-cyan-400 [&::-moz-range-thumb]:to-purple-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing"
              />
              
              {/* Step Markers */}
              <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none">
                {steps.length > 0 && Array.from({ length: Math.min(steps.length + 1, 21) }).map((_, i) => {
                  const stepIndex = Math.floor((i / 20) * steps.length);
                  const isActive = currentStep >= stepIndex;
                  return (
                    <motion.div
                      key={i}
                      className={`w-1 h-4 rounded-full transition-colors duration-300 ${
                        isActive ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' : 'bg-gray-600'
                      }`}
                      animate={isActive ? {
                        boxShadow: [
                          '0 0 5px rgba(0, 255, 255, 0.3)',
                          '0 0 10px rgba(0, 255, 255, 0.6)',
                          '0 0 5px rgba(0, 255, 255, 0.3)'
                        ]
                      } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => {
                    if (currentStep > 0) {
                      setCurrentStep(prev => prev - 1);
                      setIsPlaying(false);
                    }
                  }}
                  disabled={currentStep === 0 || steps.length === 0}
                  variant="outline"
                  size="sm"
                  className="bg-gray-700/50 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={isPlaying ? pauseVisualization : startVisualization}
                  disabled={steps.length === 0}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all px-8"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {currentStep >= steps.length ? 'Replay' : 'Play'}
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => {
                    if (currentStep < steps.length) {
                      setCurrentStep(prev => prev + 1);
                      setIsPlaying(false);
                    }
                  }}
                  disabled={currentStep >= steps.length || steps.length === 0}
                  variant="outline"
                  size="sm"
                  className="bg-gray-700/50 border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <Play className="w-4 h-4 ml-2 rotate-0" />
                </Button>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <motion.button
                onClick={() => {
                  setCurrentStep(0);
                  setIsPlaying(false);
                }}
                disabled={steps.length === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-gray-400 hover:text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Start
              </motion.button>

              <motion.button
                onClick={resetVisualization}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm text-gray-400 hover:text-pink-400 transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                New Array
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
