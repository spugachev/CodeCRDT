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
    if (steps.length === 0) return;
    if (currentStep >= steps.length) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
    
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {    setIsPlaying(false);
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
          addStep(sortedArray, [], [], Array.from(sortedSet));
          
          return i + 1;
        };

        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            sortedSet.add(pi);
            addStep(sortedArray, [], [], Array.from(sortedSet));
            
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

          for (let idx = left; idx <= right; idx++) {
            sortedSet.add(idx);
          }
          addStep(sortedArray, [], [], Array.from(sortedSet));
        };

        const mergeSort = (left: number, right: number) => {
          if (left < right) {
            const mid = Math.floor((left + right) / 2);
            mergeSort(left, mid);
            mergeSort(mid + 1, right);
            merge(left, mid, right);
          } else if (left === right) {
            sortedSet.add(left);
            addStep(sortedArray, [], [], Array.from(sortedSet));
          }
        };

        mergeSort(0, sortedArray.length - 1);
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
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name || 'Bubble Sort'}
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
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-lg font-mono text-cyan-300">
                  {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity || 'O(n²)'}
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
                      <span className="text-2xl font-bold text-white bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {arraySize[0]}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">elements</span>
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
                    <div className="text-center">
                      <span className="text-2xl font-bold text-white bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
                        {speed[0]}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300"
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
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={() => {
                      generateSortingSteps(selectedAlgorithm);
                      setCurrentStep(0);
                    }}
                    disabled={isPlaying || array.length === 0}
                    variant="outline"
                    className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 shadow-[0_0_15px_rgba(255,0,102,0.3)] hover:shadow-[0_0_25px_rgba(255,0,102,0.5)] transition-all duration-300"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Steps
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-400 font-mono font-bold">{currentStep}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Steps:</span>
                    <span className="text-purple-400 font-mono font-bold">{steps.length}</span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 mb-2">
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
                        <div className="flex flex-col gap-1">
                          <span className={`font-semibold ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-300'
                          }`}>
                            {algo.name}
                          </span>
                          <span className={`text-xs font-mono ${
                            selectedAlgorithm === algo.id ? 'text-cyan-400' : 'text-gray-500'
                          }`}>
                            {algo.complexity}
                          </span>
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
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-xl [&_[role=slider]]:hover:shadow-purple-500/70 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2"
                    disabled={isPlaying}
                  />
</parameter>
</invoke>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    className="relative flex-1 group overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className={`relative px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                        isPlaying
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-[0_0_30px_rgba(251,191,36,0.6)]'
                          : 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_30px_rgba(34,211,238,0.6)]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      animate={{
                        boxShadow: isPlaying
                          ? [
                              '0 0 30px rgba(251,191,36,0.6)',
                              '0 0 50px rgba(251,191,36,0.8)',
                              '0 0 30px rgba(251,191,36,0.6)'
                            ]
                          : [
                              '0 0 30px rgba(34,211,238,0.6)',
                              '0 0 50px rgba(34,211,238,0.8)',
                              '0 0 30px rgba(34,211,238,0.6)'
                            ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                      <div className="relative flex items-center justify-center gap-2">
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
                        <span className="text-sm uppercase tracking-wider">
                          {isPlaying ? 'Pause' : 'Play'}
                        </span>
                      </div>
                    </motion.div>
                  </motion.button>
                  <motion.button
                    onClick={resetVisualization}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-3 px-4 rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)] transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: 360 }}
                    transition={{ 
                      rotate: { duration: 0.6, ease: "easeInOut" },
                      scale: { duration: 0.2 }
                    }}
                  >
                    <motion.div
                      animate={{ rotate: 0 }}
                      whileTap={{ rotate: 360 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.div>
                    Reset
                  </motion.button></parameter>
                </div>
              </div>
            </div>

            {/* TODO:StatsPanel Real-time statistics panel showing comparisons, swaps, and progress */}
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
                    <BarChart3 className="w-24 h-24 text-cyan-400" style={{
                      filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.6))'
                    }} />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-cyan-300">
                      Ready to Visualize
                    </h3>
                    <p className="text-gray-400">
                      Click "Generate Steps" to create an array and start sorting
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full">
                  {/* Comparison Indicators */}
                  {steps[currentStep]?.comparingIndices.map((index, i) => {
                    const barWidth = 100 / array.length;
                    const leftPosition = index * barWidth;
                    
                    return (
                      <motion.div
                        key={`compare-${index}-${i}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ 
                          opacity: [0.5, 1, 0.5],
                          y: 0,
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute top-0 pointer-events-none z-10"
                        style={{
                          left: `${leftPosition}%`,
                          width: `${barWidth}%`
                        }}
                      >
                        <div className="flex justify-center">
                          <motion.div
                            className="w-3 h-3 rounded-full bg-yellow-400"
                            style={{
                              boxShadow: '0 0 20px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 255, 0, 0.4)'
                            }}
                            animate={{
                              boxShadow: [
                                '0 0 20px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 255, 0, 0.4)',
                                '0 0 30px rgba(255, 255, 0, 1), 0 0 60px rgba(255, 255, 0, 0.6)',
                                '0 0 20px rgba(255, 255, 0, 0.8), 0 0 40px rgba(255, 255, 0, 0.4)'
                              ]
                            }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                        </div>
                        <motion.div
                          className="w-0.5 h-12 bg-gradient-to-b from-yellow-400 to-transparent mx-auto"
                          style={{
                            boxShadow: '0 0 10px rgba(255, 255, 0, 0.6)'
                          }}
                          animate={{
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      </motion.div>
                    );
                  })}

                  {/* Swap Indicators */}
                  {steps[currentStep]?.swappingIndices.map((index, i) => {
                    const barWidth = 100 / array.length;
                    const leftPosition = index * barWidth;
                    
                    return (
                      <motion.div
                        key={`swap-${index}-${i}`}
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
                        className="absolute top-0 pointer-events-none z-20"
                        style={{
                          left: `${leftPosition}%`,
                          width: `${barWidth}%`
                        }}
                      >
                        <div className="flex justify-center">
                          <motion.div
                            className="w-4 h-4 rounded-full bg-pink-500 border-2 border-pink-300"
                            style={{
                              boxShadow: '0 0 25px rgba(255, 0, 102, 1), 0 0 50px rgba(255, 0, 102, 0.6)'
                            }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Animated Bars */}
                  <div className="flex items-end justify-center gap-1 h-full px-4">
                    {array.map((element, index) => {
                      const isComparing = steps[currentStep]?.comparingIndices.includes(index);
                      const isSwapping = steps[currentStep]?.swappingIndices.includes(index);
                      const isSorted = steps[currentStep]?.sortedIndices.includes(index);
                      
                      const maxValue = Math.max(...array.map(el => el.value));
                      const heightPercentage = (element.value / maxValue) * 100;
                      
                      let barColor = NEON_COLORS[index % NEON_COLORS.length];
                      let glowColor = barColor;
                      
                      if (isSorted) {
                        barColor = '#00ff00';
                        glowColor = '#00ff00';
                      } else if (isSwapping) {
                        barColor = '#ff0066';
                        glowColor = '#ff0066';
                      } else if (isComparing) {
                        barColor = '#ffff00';
                        glowColor = '#ffff00';
                      }

                      return (
                        <motion.div
                          key={element.id}
                          layout
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: `${heightPercentage}%`,
                            opacity: 1,
                            scale: isSwapping ? [1, 1.1, 1] : 1,
                            y: isSwapping ? [0, -10, 0] : 0
                          }}
                          transition={{
                            height: { duration: 0.3, ease: "easeOut" },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.3, repeat: isSwapping ? Infinity : 0 },
                            y: { duration: 0.3, repeat: isSwapping ? Infinity : 0 },
                            layout: { duration: 0.4, ease: "easeInOut" }
                          }}
                          className="relative flex-1 min-w-[4px] rounded-t-lg"
                          style={{
                            backgroundColor: barColor,
                            boxShadow: `
                              0 0 10px ${glowColor},
                              0 0 20px ${glowColor}80,
                              0 0 30px ${glowColor}40,
                              inset 0 0 10px ${glowColor}40
                            `,
                            border: `1px solid ${glowColor}`,
                            minHeight: '8px'
                          }}
                        >
                          {/* Swap Trail Effect */}
                          {isSwapping && (
                            <>
                              <motion.div
                                className="absolute inset-0 rounded-t-lg"
                                animate={{
                                  opacity: [0.8, 0],
                                  scale: [1, 1.3]
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
                                className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-full"
                                animate={{
                                  opacity: [0, 1, 0],
                                  scaleY: [0, 1.5, 0]
                                }}
                                transition={{
                                  duration: 0.5,
                                  repeat: Infinity,
                                  ease: "easeOut"
                                }}
                                style={{
                                  backgroundColor: barColor,
                                  boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
                                  filter: 'blur(4px)'
                                }}
                              />
                            </>
                          )}

                          {/* Glow Pulse for Comparing */}
                          {isComparing && (
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              animate={{
                                opacity: [0.3, 0.7, 0.3],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              style={{
                                backgroundColor: barColor,
                                filter: 'blur(6px)'
                              }}
                            />
                          )}

                          {/* Sorted Celebration Effect */}
                          {isSorted && (
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: [0, 0.6, 0],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{
                                duration: 1,
                                ease: "easeOut"
                              }}
                              style={{
                                backgroundColor: '#00ff00',
                                filter: 'blur(10px)'
                              }}
                            />
                          )}

                          {/* Value Label */}
                          {array.length <= 30 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                              style={{
                                color: barColor,
                                textShadow: `0 0 5px ${glowColor}`
                              }}
                            >
                              {element.value}
                            </motion.div>
                          )}

                          {/* Inner Gradient Shine */}
                          <div
                            className="absolute inset-0 rounded-t-lg opacity-30"
                            style={{
                              background: `linear-gradient(to top, transparent, ${barColor})`
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Step Counter */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm border border-cyan-500/50 rounded-lg px-4 py-2"
                    style={{
                      boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                        Step
                      </div>
                      <div className="text-2xl font-bold text-white">
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          {currentStep}
                        </span>
                        <span className="text-gray-500 text-sm"> / {steps.length}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
              
              <div className="flex items-end justify-center gap-1 h-[500px]">
                
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 font-medium">Sorting Progress</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                  </span>
                </div>
                
                <div className="relative h-4 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/50 shadow-inner">
                  {/* Background glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20"
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Progress fill */}
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(0,255,255,0.6)]"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                    }}
                    transition={{ 
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                  />
                  
                  {/* Animated shimmer effect */}
                  {currentStep > 0 && currentStep < steps.length && (
                    <motion.div
                      className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      style={{
                        left: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                      }}
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                  
                  {/* Completion pulse */}
                  {currentStep >= steps.length && steps.length > 0 && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        boxShadow: [
                          '0 0 20px rgba(0,255,255,0.6)',
                          '0 0 40px rgba(168,85,247,0.8)',
                          '0 0 20px rgba(0,255,255,0.6)'
                        ]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </div>
                
                {/* Status text */}
                <div className="text-center">
                  {currentStep === 0 && steps.length === 0 && (
                    <motion.span
                      className="text-xs text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Generate steps to begin
                    </motion.span>
                  )}
                  {currentStep > 0 && currentStep < steps.length && (
                    <motion.span
                      className="text-xs text-cyan-400 font-medium"
                      animate={{
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                    >
                      Sorting in progress...
                    </motion.span>
                  )}
                  {currentStep >= steps.length && steps.length > 0 && (
                    <motion.span
                      className="text-xs font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: 1
                      }}
                      transition={{
                        scale: {
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        },
                        opacity: {
                          duration: 0.3
                        }
                      }}
                    >
                      ✨ Sorting Complete! ✨
                    </motion.span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-semibold text-cyan-400 uppercase tracking-wider">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300"
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
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-yellow-500 to-yellow-300 shadow-[0_0_20px_rgba(255,255,0,0.8)]"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px rgba(255,255,0,0.8)',
                    '0 0 35px rgba(255,255,0,1)',
                    '0 0 20px rgba(255,255,0,0.8)'
                  ]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Comparing</div>
                <div className="text-xs text-gray-400">Active check</div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-pink-500 to-pink-300 shadow-[0_0_20px_rgba(255,0,102,0.8)]"
                animate={{
                  x: [-3, 3, -3],
                  boxShadow: [
                    '0 0 20px rgba(255,0,102,0.8)',
                    '0 0 35px rgba(255,0,102,1)',
                    '0 0 20px rgba(255,0,102,0.8)'
                  ]
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Swapping</div>
                <div className="text-xs text-gray-400">Exchanging</div>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-green-500 to-green-300 shadow-[0_0_20px_rgba(0,255,170,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0,255,170,0.8)',
                    '0 0 30px rgba(0,255,170,1)',
                    '0 0 20px rgba(0,255,170,0.8)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Sorted</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              </motion.div>
              <div className="text-sm text-gray-300">
                <span className="font-semibold text-purple-400">Pro Tip:</span> Watch the glowing effects to track algorithm progress in real-time. Bars pulse and change colors as they're compared, swapped, and sorted.
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}