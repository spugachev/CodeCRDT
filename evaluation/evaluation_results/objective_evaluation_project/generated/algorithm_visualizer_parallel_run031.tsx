import { useState, useCallback } from 'react';import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, BarChart3 } from 'lucide-react';
import { TrendingUp, Repeat, Activity } from 'lucide-react';
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
    generateRandomArray();  }, [generateRandomArray]);

  // Animation control using useEffect
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const delay = 1000 - (speed[0] * 9.5); // Convert speed slider to delay (50ms to 525ms)
      animationRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, delay);
    } else if (currentStep >= steps.length && steps.length > 0) {
      setIsPlaying(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length, speed]);

  // Update array display based on current step
  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      setArray(steps[currentStep].array);
    }
  }, [currentStep, steps]);

  const startVisualization = useCallback(() => {
    if (steps.length === 0) return;
    setIsPlaying(true);
  }, [steps, speed, currentStep]);

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
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-lg font-mono text-cyan-300">
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
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20"
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
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/50'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50'
                        }`}
                      >
                        <div className="font-semibold text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400">
                      <BarChart3 className="w-5 h-5" />
                      <span className="font-semibold">Array Size</span>
                    </div>
                    <span className="text-white font-bold bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
                      {arraySize[0]}
                    </span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={1}
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400">
                      <Zap className="w-5 h-5" />
                      <span className="font-semibold">Speed</span>
                    </div>
                    <span className="text-white font-bold bg-pink-500/20 px-3 py-1 rounded-full border border-pink-400/30">
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
                  />
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || currentStep >= steps.length}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-6 rounded-lg shadow-lg shadow-cyan-500/50 transition-all duration-300"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        {currentStep === 0 ? 'Start' : 'Resume'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold py-6 rounded-lg shadow-lg shadow-purple-500/30 transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={() => generateSortingSteps(selectedAlgorithm)}
                    disabled={isPlaying || array.length === 0}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-6 rounded-lg shadow-lg shadow-pink-500/50 transition-all duration-300"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Steps
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-400 font-bold">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-bold ${isPlaying ? 'text-green-400' : 'text-gray-400'}`}>
                      {isPlaying ? 'Running' : 'Idle'}
                    </span>
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
                        className={`relative p-3 rounded-lg text-left transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-lg shadow-cyan-500/50'
                            : 'bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/30'
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
                            className="absolute inset-0 rounded-lg bg-cyan-400/10"
                            layoutId="algorithmSelector"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
                    max={50}
                    step={1}
                    disabled={isPlaying}
                    className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&>span]:bg-cyan-500/30 [&>span>span]:bg-gradient-to-r [&>span>span]:from-cyan-500 [&>span>span]:to-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.div className="relative flex-1">
                    <Button
                      onClick={isPlaying ? pauseVisualization : startVisualization}
                      disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold py-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
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
                          repeat: Infinity,
                          ease: "easeInOut"
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
                            <motion.div
                              key="pause"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Pause className="w-5 h-5" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="play"
                              initial={{ scale: 0, rotate: 180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: -180 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Play className="w-5 h-5" />
                            </motion.div>
                          )}
                        </motion.div>
                        
                        <span className="text-sm font-bold tracking-wider">
                          {isPlaying ? 'PAUSE' : 'PLAY'}
                        </span>
                      </motion.div>

                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          boxShadow: isPlaying 
                            ? '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)'
                            : '0 0 10px rgba(0, 255, 255, 0.3)'
                        }}
                        animate={{
                          boxShadow: isPlaying
                            ? [
                                '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)',
                                '0 0 30px rgba(168, 85, 247, 0.6), 0 0 50px rgba(0, 255, 255, 0.4)',
                                '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)'
                              ]
                            : '0 0 10px rgba(0, 255, 255, 0.3)'
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </Button>
                  </motion.div></parameter>
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all duration-300"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="relative flex items-center justify-center gap-2">
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      <span className="text-sm font-bold tracking-wider">
                        {isPlaying ? 'PAUSE' : 'START'}
                      </span>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={resetVisualization}
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="relative overflow-hidden bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80"
                  >
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(236, 72, 153, 0.5)',
                          '0 0 40px rgba(236, 72, 153, 0.8)',
                          '0 0 20px rgba(236, 72, 153, 0.5)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative flex items-center justify-center gap-2">
                      <RotateCcw className="w-5 h-5" />
                      <span className="text-sm font-bold tracking-wider">RESET</span>
                    </div>
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
                  <Activity className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Statistics</h3>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-mono">
                      {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="relative h-3 bg-gray-800 rounded-full border border-purple-500/30 overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Step {currentStep}</span>
                    <span>of {steps.length}</span>
                  </div>
                </div>

                {/* Comparisons Counter */}
                <motion.div
                  className="relative p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-lg overflow-hidden group hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-400/30">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Comparisons</div>
                        <motion.div
                          key={comparisons}
                          initial={{ scale: 1.5, color: '#22d3ee' }}
                          animate={{ scale: 1, color: '#ffffff' }}
                          className="text-2xl font-bold font-mono"
                        >
                          {comparisons}
                        </motion.div>
                      </div>
                    </div>
                    <motion.div
                      className="text-cyan-400 text-xs font-semibold px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-400/30"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ACTIVE
                    </motion.div>
                  </div>
                </motion.div>

                {/* Swaps Counter */}
                <motion.div
                  className="relative p-4 bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 rounded-lg overflow-hidden group hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/10 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-500/20 rounded-lg border border-pink-400/30">
                        <Repeat className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Swaps</div>
                        <motion.div
                          key={swaps}
                          initial={{ scale: 1.5, color: '#ec4899' }}
                          animate={{ scale: 1, color: '#ffffff' }}
                          className="text-2xl font-bold font-mono"
                        >
                          {swaps}
                        </motion.div>
                      </div>
                    </div>
                    <motion.div
                      className="text-pink-400 text-xs font-semibold px-3 py-1 bg-pink-500/20 rounded-full border border-pink-400/30"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      TRACK
                    </motion.div>
                  </div>
                </motion.div>

                {/* Array Info */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Elements</div>
                    <div className="text-lg font-bold text-white font-mono">{array.length}</div>
                  </div>
                  <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className="text-lg font-bold">
                      {isPlaying ? (
                        <span className="text-green-400">Running</span>
                      ) : steps.length > 0 && currentStep === steps.length ? (
                        <span className="text-purple-400">Done</span>
                      ) : (
                        <span className="text-gray-400">Ready</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Time Complexity Reminder */}
                <motion.div
                  className="p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-400/30 rounded-lg"
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(168, 85, 247, 0.2)',
                      '0 0 20px rgba(168, 85, 247, 0.4)',
                      '0 0 10px rgba(168, 85, 247, 0.2)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Time Complexity</span>
                    <span className="text-sm font-mono font-bold text-purple-300">
                      {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
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
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="relative"
                  >
                    <BarChart3 className="w-24 h-24 text-purple-400/50" />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-semibold text-purple-300">
                      Generate an array to begin
                    </p>
                    <p className="text-sm text-gray-400">
                      Click the "Generate Array" button to start visualizing
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {currentStep < steps.length && steps[currentStep] ? (
                    steps[currentStep].array.map((element, index) => {
                      const maxValue = Math.max(...steps[currentStep].array.map(el => el.value));
                      const heightPercentage = (element.value / maxValue) * 100;
                      const barColor = element.isSorted
                        ? '#00ff00'
                        : element.isSwapping
                        ? '#ff0066'
                        : element.isComparing
                        ? '#ffff00'
                        : NEON_COLORS[index % NEON_COLORS.length];

                      return (
                        <motion.div
                          key={element.id}
                          layout
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: `${heightPercentage}%`,
                            opacity: 1,
                            scale: element.isSwapping ? 1.1 : element.isComparing ? 1.05 : 1,
                            y: element.isSwapping ? -10 : 0
                          }}
                          transition={{
                            height: { duration: 0.3, ease: "easeOut" },
                            scale: { duration: 0.2 },
                            y: { duration: 0.3, type: "spring" },
                            layout: { duration: 0.4, type: "spring", bounce: 0.3 }
                          }}
                          className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                          style={{
                            backgroundColor: barColor,
                            boxShadow: `0 0 ${element.isSwapping ? '30px' : element.isComparing ? '20px' : '10px'} ${barColor}80, 0 0 ${element.isSwapping ? '60px' : element.isComparing ? '40px' : '20px'} ${barColor}40`,
                            border: `1px solid ${barColor}`,
                          }}
                        >
                          {/* Value label */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: arraySize[0] <= 30 ? 1 : 0 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap"
                            style={{
                              textShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}80`
                            }}
                          >
                            {element.value}
                          </motion.div>

                          {/* Glow effect overlay */}
                          {(element.isComparing || element.isSwapping) && (
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              animate={{
                                opacity: [0.3, 0.7, 0.3],
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              style={{
                                background: `linear-gradient(to top, transparent, ${barColor}60)`,
                                boxShadow: `inset 0 0 20px ${barColor}80`
                              }}
                            />
                          )}

                          {/* Sorted checkmark */}
                          {element.isSorted && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", bounce: 0.5 }}
                              className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                              style={{
                                boxShadow: '0 0 15px #00ff00, 0 0 30px #00ff0080'
                              }}
                            >
                              <svg
                                className="w-3 h-3 text-gray-900"
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

                          {/* Swap trail effect */}
                          {element.isSwapping && (
                            <>
                              <motion.div
                                className="absolute inset-0 rounded-t-lg"
                                initial={{ opacity: 0, scale: 1 }}
                                animate={{
                                  opacity: [0, 0.6, 0],
                                  scale: [1, 1.3, 1.5]
                                }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  ease: "easeOut"
                                }}
                                style={{
                                  backgroundColor: barColor,
                                  filter: 'blur(8px)'
                                }}
                              />
                              <motion.div
                                className="absolute -inset-2 rounded-t-lg"
                                animate={{
                                  rotate: [0, 360]
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear"
                                }}
                                style={{
                                  background: `conic-gradient(from 0deg, transparent, ${barColor}60, transparent)`,
                                  filter: 'blur(4px)'
                                }}
                              />
                            </>
                          )}
                        </motion.div>
                      );
                    })
                  ) : array.length > 0 ? (
                    array.map((element, index) => {
                      const maxValue = Math.max(...array.map(el => el.value));
                      const heightPercentage = (element.value / maxValue) * 100;
                      const barColor = NEON_COLORS[index % NEON_COLORS.length];

                      return (
                        <motion.div
                          key={element.id}
                          initial={{ height: 0, opacity: 0, scale: 0.8 }}
                          animate={{
                            height: `${heightPercentage}%`,
                            opacity: 1,
                            scale: 1
                          }}
                          transition={{
                            height: { duration: 0.5, ease: "easeOut", delay: index * 0.02 },
                            opacity: { duration: 0.3, delay: index * 0.02 },
                            scale: { duration: 0.3, delay: index * 0.02, type: "spring" }
                          }}
                          className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                          style={{
                            backgroundColor: barColor,
                            boxShadow: `0 0 10px ${barColor}80, 0 0 20px ${barColor}40`,
                            border: `1px solid ${barColor}`,
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: arraySize[0] <= 30 ? 1 : 0 }}
                            transition={{ delay: index * 0.02 + 0.3 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap"
                            style={{
                              textShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}80`
                            }}
                          >
                            {element.value}
                          </motion.div>
                        </motion.div>
                      );
                    })
                  ) : null}

                  {/* Comparison indicators */}
                  {currentStep < steps.length && steps[currentStep] && steps[currentStep].comparingIndices.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none"
                    >
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="px-4 py-2 bg-yellow-500/20 border border-yellow-400 rounded-full backdrop-blur-sm"
                        style={{
                          boxShadow: '0 0 20px #ffff0080, 0 0 40px #ffff0040'
                        }}
                      >
                        <span className="text-yellow-300 text-sm font-semibold">
                          Comparing...
                        </span>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Swap indicators */}
                  {currentStep < steps.length && steps[currentStep] && steps[currentStep].swappingIndices.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute top-12 left-0 right-0 flex items-center justify-center pointer-events-none"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 180, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                        className="px-4 py-2 bg-pink-500/20 border border-pink-400 rounded-full backdrop-blur-sm flex items-center gap-2"
                        style={{
                          boxShadow: '0 0 20px #ff006680, 0 0 40px #ff006640'
                        }}
                      >
                        <Zap className="w-4 h-4 text-pink-300" />
                        <span className="text-pink-300 text-sm font-semibold">
                          Swapping
                        </span>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {/* TODO:AnimatedBars Render array elements as animated bars with height transitions, neon colors, and glow effects */}
              </div>

                            {steps.length > 0 && currentStep < steps.length && steps[currentStep].comparingIndices.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {steps[currentStep].comparingIndices.map((index, i) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const barWidth = 100 / array.length;
                    const leftPosition = (index * barWidth) + (barWidth / 2);
                    const heightPercent = (array[index]?.value / maxValue) * 100;
                    
                    return (
                      <motion.div
                        key={`comparison-${index}-${i}`}
                        initial={{ opacity: 0, y: -20, scale: 0 }}
                        animate={{ 
                          opacity: [0.8, 1, 0.8],
                          y: [0, -10, 0],
                          scale: [1, 1.2, 1]
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute"
                        style={{
                          left: `${leftPosition}%`,
                          bottom: `${heightPercent + 5}%`,
                          transform: 'translateX(-50%)'
                        }}
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
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50 border-2 border-cyan-300">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <motion.div
                            className="absolute inset-0 rounded-full bg-cyan-400/30"
                            animate={{
                              scale: [1, 1.8, 1],
                              opacity: [0.6, 0, 0.6]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeOut"
                            }}
                          />
                        </motion.div>
                        
                        <motion.div
                          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                          animate={{
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity
                          }}
                        >
                          <div className="bg-cyan-500/90 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-300 shadow-lg shadow-cyan-500/50">
                            <span className="text-xs font-bold text-white">
                              Comparing
                            </span>
                          </div>
                        </motion.div>

                        <motion.div
                          className="absolute w-0.5 bg-gradient-to-b from-cyan-400 to-transparent"
                          style={{
                            height: `${heightPercent}%`,
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)'
                          }}
                          animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scaleY: [0.8, 1, 0.8]
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    );
                  })}
                  
                  {steps[currentStep].comparingIndices.length === 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute"
                      style={{
                        left: `${((steps[currentStep].comparingIndices[0] * (100 / array.length)) + ((100 / array.length) / 2))}%`,
                        right: `${100 - ((steps[currentStep].comparingIndices[1] * (100 / array.length)) + ((100 / array.length) / 2))}%`,
                        top: '20%',
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, #22d3ee, #06b6d4, #22d3ee, transparent)',
                        boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)'
                      }}
                    />
                  )}
                </div>
              )}
              
                            {steps.length > 0 && currentStep < steps.length && steps[currentStep].swappingIndices.length === 2 && (
                <>
                  {steps[currentStep].swappingIndices.map((idx, trailIdx) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const barHeight = (array[idx].value / maxValue) * 400;
                    const barWidth = Math.max(20, 800 / array.length - 4);
                    const xPosition = idx * (800 / array.length) + (800 / array.length) / 2;
                    
                    return (
                      <motion.div
                        key={`trail-${idx}-${trailIdx}-${currentStep}`}
                        className="absolute bottom-0 rounded-t-lg pointer-events-none"
                        style={{
                          left: `${xPosition}px`,
                          width: `${barWidth}px`,
                          height: `${barHeight}px`,
                          background: `linear-gradient(to top, ${NEON_COLORS[idx % NEON_COLORS.length]}40, ${NEON_COLORS[idx % NEON_COLORS.length]}10)`,
                          boxShadow: `0 0 30px ${NEON_COLORS[idx % NEON_COLORS.length]}80, inset 0 0 20px ${NEON_COLORS[idx % NEON_COLORS.length]}40`,
                          filter: 'blur(8px)',
                          transformOrigin: 'bottom center'
                        }}
                        initial={{ 
                          opacity: 0,
                          scale: 1,
                          x: 0
                        }}
                        animate={{ 
                          opacity: [0, 0.8, 0.6, 0],
                          scale: [1, 1.2, 1.3, 1.4],
                          x: trailIdx === 0 
                            ? [(steps[currentStep].swappingIndices[1] - idx) * (800 / array.length) * 0.3,
                               (steps[currentStep].swappingIndices[1] - idx) * (800 / array.length) * 0.6,
                               (steps[currentStep].swappingIndices[1] - idx) * (800 / array.length)]
                            : [(steps[currentStep].swappingIndices[0] - idx) * (800 / array.length) * 0.3,
                               (steps[currentStep].swappingIndices[0] - idx) * (800 / array.length) * 0.6,
                               (steps[currentStep].swappingIndices[0] - idx) * (800 / array.length)]
                        }}
                        transition={{ 
                          duration: 0.6,
                          ease: "easeOut",
                          times: [0, 0.3, 0.6, 1]
                        }}
                      />
                    );
                  })}
                  
                  {/* Particle burst effect at swap points */}
                  {steps[currentStep].swappingIndices.map((idx) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const barHeight = (array[idx].value / maxValue) * 400;
                    const xPosition = idx * (800 / array.length) + (800 / array.length) / 2;
                    
                    return (
                      <div key={`particles-${idx}-${currentStep}`}>
                        {[...Array(6)].map((_, particleIdx) => (
                          <motion.div
                            key={`particle-${idx}-${particleIdx}-${currentStep}`}
                            className="absolute rounded-full pointer-events-none"
                            style={{
                              left: `${xPosition}px`,
                              bottom: `${barHeight / 2}px`,
                              width: '8px',
                              height: '8px',
                              background: NEON_COLORS[idx % NEON_COLORS.length],
                              boxShadow: `0 0 15px ${NEON_COLORS[idx % NEON_COLORS.length]}, 0 0 30px ${NEON_COLORS[idx % NEON_COLORS.length]}80`
                            }}
                            initial={{ 
                              opacity: 1,
                              scale: 0,
                              x: 0,
                              y: 0
                            }}
                            animate={{ 
                              opacity: [1, 0.8, 0],
                              scale: [0, 1, 0.5],
                              x: Math.cos((particleIdx * Math.PI * 2) / 6) * 40,
                              y: Math.sin((particleIdx * Math.PI * 2) / 6) * 40
                            }}
                            transition={{ 
                              duration: 0.8,
                              ease: "easeOut"
                            }}
                          />
                        ))}
                      </div>
                    );
                  })}
                  
                  {/* Motion blur streaks */}
                  {steps[currentStep].swappingIndices.map((idx, streakIdx) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const barHeight = (array[idx].value / maxValue) * 400;
                    const xPosition = idx * (800 / array.length) + (800 / array.length) / 2;
                    const targetIdx = steps[currentStep].swappingIndices[streakIdx === 0 ? 1 : 0];
                    const direction = targetIdx > idx ? 1 : -1;
                    
                    return (
                      <motion.div
                        key={`streak-${idx}-${streakIdx}-${currentStep}`}
                        className="absolute bottom-0 pointer-events-none"
                        style={{
                          left: `${xPosition}px`,
                          height: `${barHeight}px`,
                          width: '3px',
                          background: `linear-gradient(${direction > 0 ? '90deg' : '270deg'}, transparent, ${NEON_COLORS[idx % NEON_COLORS.length]}, transparent)`,
                          filter: 'blur(2px)',
                          transformOrigin: 'center center'
                        }}
                        initial={{ 
                          opacity: 0,
                          scaleX: 1,
                          x: 0
                        }}
                        animate={{ 
                          opacity: [0, 1, 0.8, 0],
                          scaleX: [1, 15, 20, 1],
                          x: direction * 20
                        }}
                        transition={{ 
                          duration: 0.5,
                          ease: "easeInOut"
                        }}
                      />
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
          className="bg-gray-900/50 backdrop-blur-lg border border-pink-500/30 rounded-xl p-6 shadow-2xl shadow-pink-500/20"
        >
          <div className="flex items-center gap-2 text-pink-400 mb-6">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-bold text-lg">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300"
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

            {/* Comparing State */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300"
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
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Comparing</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-red-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-red-500 to-red-300"
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

            {/* Sorted State */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-green-500 to-green-300"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(0, 255, 170, 0.5)',
                    '0 0 20px rgba(0, 255, 170, 0.8)',
                    '0 0 10px rgba(0, 255, 170, 0.5)'
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 pt-6 border-t border-gray-700/50"
          >
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap className="w-4 h-4 text-cyan-400" />
                </motion.div>
                <span>Real-time Animation</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </motion.div>
                <span>Interactive Controls</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}