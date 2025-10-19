import { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, BarChart3 } from 'lucide-react';

import { Activity, ArrowUpDown, TrendingUp } from 'lucide-react';import { motion } from 'framer-motion';

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

  const getBarColor = useCallback((element: ArrayElement, index: number) => {
    if (element.isSorted) return '#00ff00';
    if (element.isSwapping) return '#ff0066';
    if (element.isComparing) return '#ffff00';
    return NEON_COLORS[index % NEON_COLORS.length];
  }, []);

  const getBarGlow = useCallback((element: ArrayElement) => {
    if (element.isSorted) return '0 0 20px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 0, 0.4)';
    if (element.isSwapping) return '0 0 30px rgba(255, 0, 102, 0.9), 0 0 60px rgba(255, 0, 102, 0.5)';
    if (element.isComparing) return '0 0 25px rgba(255, 255, 0, 0.9), 0 0 50px rgba(255, 255, 0, 0.5)';
    return '0 0 15px rgba(0, 255, 255, 0.5), 0 0 30px rgba(0, 255, 255, 0.2)';
  }, []);
  const generateRandomArray = useCallback(() => {
    const newArray: ArrayElement[] = Array.from({ length: arraySize[0] }, (_, index) => ({
      value: Math.floor(Math.random() * 100) + 1,
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

  useEffect(() => {
    if (!isPlaying) return;

    const delay = 1000 - (speed[0] * 9.5);
    const timer = setTimeout(() => {
      animateSteps();
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, speed, animateSteps]);
  const startVisualization = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) return;
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
      for (let i = 0; i < arr.length - 1; i++) {
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
      sortedIndices.push(0);
      addStep(arr, [], [], sortedIndices);
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
    } else if (algorithm === 'quick') {
      const sortedIndices: number[] = [];
      
      const partition = (low: number, high: number): number => {
        const pivot = arr[high];
        addStep(arr, [high], [], sortedIndices);
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
          addStep(arr, [j, high], [], sortedIndices);
          
          if (arr[j].value < pivot.value) {
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
    } else if (algorithm === 'merge') {
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
        
        if (left === 0 && right === arr.length - 1) {
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
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800/50 backdrop-blur-sm rounded-full border border-cyan-500/30"
            >
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-xl font-semibold text-cyan-300">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name || 'Bubble Sort'}
              </span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="relative px-5 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-full border border-purple-400/50"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-md"
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-mono text-purple-200">
                  {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity || 'O(n²)'}
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
              transition={{ duration: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.3)]"
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
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          generateSortingSteps(algo.id as AlgorithmType);
                        }}
                        disabled={isPlaying}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-700/30 border-2 border-gray-600/30 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{algo.name}</span>
                          <span className="text-xs text-gray-400 font-mono">{algo.complexity}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Array Size
                    </h3>
                    <span className="text-white font-mono text-lg">{arraySize[0]}</span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={(value) => {
                      setArraySize(value);
                      generateRandomArray();
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
                  <div className="flex justify-between items-center">
                    <h3 className="text-pink-400 font-semibold text-sm uppercase tracking-wider">
                      Speed
                    </h3>
                    <span className="text-white font-mono text-lg">{speed[0]}%</span>
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
                <div className="space-y-3 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || currentStep >= steps.length}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 rounded-lg shadow-[0_0_25px_rgba(0,255,255,0.5)] hover:shadow-[0_0_35px_rgba(0,255,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <span className="flex items-center justify-center gap-2">
                        <Pause className="w-5 h-5" />
                        Pause
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Play className="w-5 h-5" />
                        {currentStep >= steps.length ? 'Completed' : 'Start'}
                      </span>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-6 rounded-lg shadow-[0_0_25px_rgba(255,0,255,0.5)] hover:shadow-[0_0_35px_rgba(255,0,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </span>
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Current Step</span>
                    <span className="text-cyan-400 font-mono font-semibold">
                      {currentStep} / {steps.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${steps.length > 0 ? (currentStep / steps.length) * 100 : 0}%` }}
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
                      <Button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        variant={selectedAlgorithm === algo.id ? 'default' : 'outline'}
                        className={`
                          relative overflow-hidden transition-all duration-300
                          ${selectedAlgorithm === algo.id 
                            ? 'bg-cyan-500 text-gray-900 border-cyan-400 shadow-lg shadow-cyan-500/50' 
                            : 'bg-gray-700/50 text-cyan-300 border-cyan-500/30 hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-500/30'
                          }
                        `}
                      >
                        <span className="relative z-10 text-xs font-medium">
                          {algo.name.split(' ')[0]}
                        </span>
                        {selectedAlgorithm === algo.id && (
                          <motion.div
                            layoutId="activeAlgorithm"
                            className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-cyan-600"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Array Size: {arraySize[0]}
                  </h3>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={1}
                    className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-cyan-400/80 [&_.relative]:bg-gray-700 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-cyan-500 [&_.bg-primary]:to-purple-500"
                  />
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4">
                    Speed: {speed[0]}ms
                  </h3>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={500}
                    step={10}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-shadow [&_[role=slider]]:hover:shadow-xl [&_[role=slider]]:hover:shadow-purple-500/70 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=track]]:bg-gradient-to-r [&_[role=track]]:from-purple-900/50 [&_[role=track]]:to-pink-900/50 [&_[role=track]]:h-2 [&_[role=range]]:bg-gradient-to-r [&_[role=range]]:from-purple-500 [&_[role=range]]:to-pink-500 [&_[role=range]]:shadow-lg [&_[role=range]]:shadow-purple-500/30"
                  /></parameter>
                </div>

                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (currentStep >= steps.length && steps.length > 0)}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-6 rounded-xl border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:shadow-[0_0_50px_rgba(0,255,255,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/30 to-cyan-400/0"
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                    <motion.div
                      className="relative flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
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
                      <span className="text-lg">
                        {isPlaying ? 'Pause' : 'Play'}
                      </span>
                    </motion.div>
                  </Button>
                  
                  <motion.div whileTap={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <Button
                      onClick={resetVisualization}
                      disabled={isPlaying}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={generateRandomArray}
                      disabled={isPlaying}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{
                          scale: [1, 1.5, 1.5, 1],
                          opacity: [0.5, 0, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <BarChart3 className="w-4 h-4 mr-2" />
                      <span className="relative z-10">Generate Array</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

                        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            >
              <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Activity className="w-5 h-5" />
                Statistics
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Current Step */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative overflow-hidden bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 rounded-xl p-4 border border-cyan-500/40 shadow-lg"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent"
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <p className="text-xs text-cyan-300 font-medium uppercase tracking-wide">Step</p>
                    </div>
                    <motion.p
                      key={currentStep}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="text-3xl font-bold text-white font-mono"
                    >
                      {currentStep}
                    </motion.p>
                    <p className="text-xs text-cyan-400/70 mt-1">of {steps.length}</p>
                  </div>
                </motion.div>

                {/* Comparisons */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative overflow-hidden bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-4 border border-purple-500/40 shadow-lg"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <p className="text-xs text-purple-300 font-medium uppercase tracking-wide">Compares</p>
                    </div>
                    <motion.p
                      key={comparisons}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="text-3xl font-bold text-white font-mono"
                    >
                      {comparisons}
                    </motion.p>
                    <p className="text-xs text-purple-400/70 mt-1">operations</p>
                  </div>
                </motion.div>

                {/* Swaps */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative overflow-hidden bg-gradient-to-br from-pink-900/30 to-pink-800/20 rounded-xl p-4 border border-pink-500/40 shadow-lg"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent"
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpDown className="w-4 h-4 text-pink-400" />
                      <p className="text-xs text-pink-300 font-medium uppercase tracking-wide">Swaps</p>
                    </div>
                    <motion.p
                      key={swaps}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="text-3xl font-bold text-white font-mono"
                    >
                      {swaps}
                    </motion.p>
                    <p className="text-xs text-pink-400/70 mt-1">operations</p>
                  </div>
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Progress</span>
                  <span className="text-xs text-gray-300 font-mono">
                    {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                  </span>
                </div>
                <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
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
                    <Zap className="w-24 h-24 text-cyan-400" style={{
                      filter: 'drop-shadow(0 0 30px rgba(0, 255, 255, 0.8))'
                    }} />
                  </motion.div>
                  <p className="text-2xl text-cyan-300 font-semibold">
                    Generate an array to start visualizing
                  </p>
                </motion.div>
              ) : (
                <div className="h-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    const barColor = getBarColor(element, index);
                    const barGlow = getBarGlow(element);

                    return (
                      <motion.div
                        key={element.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: element.isSwapping ? 1.1 : 1,
                          height: `${heightPercentage}%`
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{
                          layout: { type: 'spring', stiffness: 300, damping: 30 },
                          height: { duration: 0.3, ease: 'easeInOut' },
                          scale: { duration: 0.2 },
                          opacity: { duration: 0.3 }
                        }}
                        className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                        style={{
                          backgroundColor: barColor,
                          boxShadow: barGlow
                        }}
                      >
                        {/* Trail effect for swapping */}
                        {element.isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              backgroundColor: barColor,
                              opacity: 0.5
                            }}
                            animate={{
                              scale: [1, 1.5, 2],
                              opacity: [0.5, 0.3, 0]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: 'easeOut'
                            }}
                          />
                        )}

                        {/* Pulse effect for comparing */}
                        {element.isComparing && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg border-2 border-yellow-300"
                            animate={{
                              opacity: [1, 0.3, 1]
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          />
                        )}

                        {/* Sparkle effect for sorted */}
                        {element.isSorted && (
                          <motion.div
                            className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{
                              scale: [0, 1.5, 0],
                              rotate: [0, 180, 360],
                              opacity: [0, 1, 0]
                            }}
                            transition={{
                              duration: 1,
                              ease: 'easeOut'
                            }}
                          >
                            <div className="w-3 h-3 bg-green-400 rounded-full"
                              style={{
                                boxShadow: '0 0 10px rgba(0, 255, 0, 0.8)'
                              }}
                            />
                          </motion.div>
                        )}

                        {/* Value label for larger arrays */}
                        {arraySize[0] <= 20 && (
                          <motion.div
                            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-gray-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {element.value}
                          </motion.div>
                        )}

                        {/* Top glow indicator */}
                        <motion.div
                          className="absolute -top-1 left-0 right-0 h-1 rounded-full"
                          style={{
                            backgroundColor: barColor,
                            filter: 'blur(4px)',
                            opacity: 0.8
                          }}
                          animate={{
                            opacity: element.isComparing || element.isSwapping ? [0.8, 1, 0.8] : 0.8
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: element.isComparing || element.isSwapping ? Infinity : 0
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}</parameter>
              
              <div className="h-full flex items-end justify-center gap-1">
                {array.map((element, index) => {
                  const isComparing = steps[currentStep]?.comparingIndices.includes(index);
                  const isSwapping = steps[currentStep]?.swappingIndices.includes(index);
                  const isSorted = steps[currentStep]?.sortedIndices.includes(index);
                  
                  const barColor = isSorted 
                    ? '#00ff00' 
                    : isSwapping 
                    ? '#ff0066' 
                    : isComparing 
                    ? '#ffff00' 
                    : NEON_COLORS[index % NEON_COLORS.length];
                  
                  const maxHeight = 500;
                  const barHeight = (element.value / 100) * maxHeight;
                  
                  return (
                    <motion.div
                      key={element.id}
                      layout
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: barHeight,
                        opacity: 1,
                        scale: isComparing ? 1.1 : isSwapping ? 1.15 : 1,
                        y: isSwapping ? -20 : 0
                      }}
                      transition={{
                        height: { type: 'spring', stiffness: 100, damping: 20 },
                        scale: { type: 'spring', stiffness: 300, damping: 15 },
                        y: { type: 'spring', stiffness: 200, damping: 10 },
                        layout: { type: 'spring', stiffness: 300, damping: 30 }
                      }}
                      className="relative rounded-t-lg"
                      style={{
                        width: `${Math.max(8, 600 / arraySize[0])}px`,
                        backgroundColor: barColor,
                        boxShadow: `
                          0 0 ${isSwapping ? '40px' : isComparing ? '30px' : '20px'} ${barColor},
                          0 0 ${isSwapping ? '60px' : isComparing ? '45px' : '30px'} ${barColor}80,
                          inset 0 0 ${isSwapping ? '20px' : isComparing ? '15px' : '10px'} ${barColor}40
                        `,
                        border: `2px solid ${barColor}`,
                        filter: `brightness(${isSwapping ? 1.5 : isComparing ? 1.3 : 1})`
                      }}
                    >
                      {/* Glow effect overlay */}
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        animate={{
                          opacity: isSwapping ? [0.5, 1, 0.5] : isComparing ? [0.3, 0.7, 0.3] : [0.2, 0.4, 0.2]
                        }}
                        transition={{
                          duration: isSwapping ? 0.3 : isComparing ? 0.5 : 1,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        style={{
                          background: `linear-gradient(to top, transparent, ${barColor}60)`,
                          boxShadow: `inset 0 0 20px ${barColor}80`
                        }}
                      />
                      
                      {/* Trail effect for swapping */}
                      {isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          initial={{ opacity: 0, y: 0 }}
                          animate={{
                            opacity: [0, 0.8, 0],
                            y: [0, 30, 60],
                            scaleY: [1, 0.8, 0.3]
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: 'easeOut'
                          }}
                          style={{
                            backgroundColor: barColor,
                            filter: 'blur(8px)',
                            zIndex: -1
                          }}
                        />
                      )}
                      
                      {/* Value label */}
                      <motion.div
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                        animate={{
                          scale: isSwapping ? [1, 1.3, 1] : isComparing ? [1, 1.2, 1] : 1,
                          y: isSwapping ? [-5, -10, -5] : 0
                        }}
                        transition={{
                          duration: 0.3,
                          repeat: isSwapping || isComparing ? Infinity : 0
                        }}
                        style={{
                          color: barColor,
                          textShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}80`,
                          fontSize: arraySize[0] > 30 ? '10px' : '12px'
                        }}
                      >
                        {element.value}
                      </motion.div>
                      
                      {/* Sorted checkmark indicator */}
                      {isSorted && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                        >
                          <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: '#00ff00',
                              boxShadow: '0 0 15px #00ff00, 0 0 25px #00ff0080'
                            }}
                          >
                            <span className="text-gray-900 text-xs font-bold">✓</span>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Particle effects for swapping */}
                      {isSwapping && (
                        <>
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-2 h-2 rounded-full"
                              initial={{ 
                                x: 0, 
                                y: 0, 
                                opacity: 1,
                                scale: 1
                              }}
                              animate={{
                                x: [0, (Math.random() - 0.5) * 40],
                                y: [0, -40 - Math.random() * 30],
                                opacity: [1, 0],
                                scale: [1, 0]
                              }}
                              transition={{
                                duration: 0.8,
                                delay: i * 0.1,
                                repeat: Infinity,
                                ease: 'easeOut'
                              }}
                              style={{
                                backgroundColor: barColor,
                                boxShadow: `0 0 10px ${barColor}`,
                                left: '50%',
                                top: '0'
                              }}
                            />
                          ))}
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20"
            >
              <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Bar States Legend
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                >
                  <div className="w-6 h-12 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded shadow-[0_0_15px_rgba(0,255,255,0.6)]" />
                  <div>
                    <div className="text-white font-medium text-sm">Normal</div>
                    <div className="text-gray-400 text-xs">Unsorted element</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                >
                  <div className="w-6 h-12 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded shadow-[0_0_20px_rgba(255,255,0,0.8)] animate-pulse" />
                  <div>
                    <div className="text-white font-medium text-sm">Comparing</div>
                    <div className="text-gray-400 text-xs">Being compared</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                >
                  <div className="w-6 h-12 bg-gradient-to-t from-red-500 to-red-300 rounded shadow-[0_0_25px_rgba(255,0,0,0.8)]" />
                  <div>
                    <div className="text-white font-medium text-sm">Swapping</div>
                    <div className="text-gray-400 text-xs">Position changing</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30"
                >
                  <div className="w-6 h-12 bg-gradient-to-t from-green-500 to-green-300 rounded shadow-[0_0_20px_rgba(0,255,0,0.7)]" />
                  <div>
                    <div className="text-white font-medium text-sm">Sorted</div>
                    <div className="text-gray-400 text-xs">In final position</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <BarChart3 className="w-8 h-8 text-cyan-400" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Algorithm Complexity
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Time Complexity */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl p-6 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-cyan-300">Time Complexity</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 text-sm">Best Case:</span>
                    <span className="text-2xl font-mono font-bold text-green-400">
                      {selectedAlgorithm === 'bubble' && 'O(n)'}
                      {selectedAlgorithm === 'insertion' && 'O(n)'}
                      {selectedAlgorithm === 'quick' && 'O(n log n)'}
                      {selectedAlgorithm === 'merge' && 'O(n log n)'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 text-sm">Average Case:</span>
                    <span className="text-2xl font-mono font-bold text-yellow-400">
                      {selectedAlgorithm === 'bubble' && 'O(n²)'}
                      {selectedAlgorithm === 'insertion' && 'O(n²)'}
                      {selectedAlgorithm === 'quick' && 'O(n log n)'}
                      {selectedAlgorithm === 'merge' && 'O(n log n)'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 text-sm">Worst Case:</span>
                    <span className="text-2xl font-mono font-bold text-red-400">
                      {selectedAlgorithm === 'bubble' && 'O(n²)'}
                      {selectedAlgorithm === 'insertion' && 'O(n²)'}
                      {selectedAlgorithm === 'quick' && 'O(n²)'}
                      {selectedAlgorithm === 'merge' && 'O(n log n)'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Space Complexity */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/40 shadow-[0_0_20px_rgba(255,0,255,0.2)]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-semibold text-purple-300">Space Complexity</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 text-sm">Auxiliary Space:</span>
                    <span className="text-3xl font-mono font-bold text-purple-400">
                      {selectedAlgorithm === 'bubble' && 'O(1)'}
                      {selectedAlgorithm === 'insertion' && 'O(1)'}
                      {selectedAlgorithm === 'quick' && 'O(log n)'}
                      {selectedAlgorithm === 'merge' && 'O(n)'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    {selectedAlgorithm === 'bubble' && 'In-place sorting with constant extra space'}
                    {selectedAlgorithm === 'insertion' && 'In-place sorting with constant extra space'}
                    {selectedAlgorithm === 'quick' && 'Recursive stack space for partitioning'}
                    {selectedAlgorithm === 'merge' && 'Requires additional array for merging'}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Algorithm Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-600/30"
            >
              <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                How It Works
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {selectedAlgorithm === 'bubble' && 
                  'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. Larger elements "bubble" to the end of the array.'}
                {selectedAlgorithm === 'insertion' && 
                  'Insertion Sort builds the final sorted array one item at a time. It iterates through an input array and removes one element per iteration, finds the place the element belongs in the sorted list, and inserts it there. It repeats until no input elements remain.'}
                {selectedAlgorithm === 'quick' && 
                  'Quick Sort picks an element as a pivot and partitions the array around the pivot. Elements smaller than the pivot go to the left, larger elements go to the right. It then recursively sorts the sub-arrays. The efficiency depends on the pivot selection.'}
                {selectedAlgorithm === 'merge' && 
                  'Merge Sort divides the array into two halves, recursively sorts them, and then merges the two sorted halves. The merge operation is the key process that assumes that the two halves are sorted and merges them into a single sorted array.'}
              </p>
            </motion.div>

            {/* Characteristics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gray-700/30 rounded-lg p-4 border border-cyan-500/20 text-center"
              >
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  {selectedAlgorithm === 'bubble' || selectedAlgorithm === 'insertion' ? '✓' : '✗'}
                </div>
                <div className="text-xs text-gray-400">Stable</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gray-700/30 rounded-lg p-4 border border-purple-500/20 text-center"
              >
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {selectedAlgorithm === 'merge' ? '✗' : '✓'}
                </div>
                <div className="text-xs text-gray-400">In-Place</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gray-700/30 rounded-lg p-4 border border-pink-500/20 text-center"
              >
                <div className="text-2xl font-bold text-pink-400 mb-1">
                  {selectedAlgorithm === 'bubble' || selectedAlgorithm === 'insertion' ? '✓' : '✗'}
                </div>
                <div className="text-xs text-gray-400">Adaptive</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gray-700/30 rounded-lg p-4 border border-yellow-500/20 text-center"
              >
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {selectedAlgorithm === 'quick' || selectedAlgorithm === 'merge' ? '✓' : '✗'}
                </div>
                <div className="text-xs text-gray-400">Divide & Conquer</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}