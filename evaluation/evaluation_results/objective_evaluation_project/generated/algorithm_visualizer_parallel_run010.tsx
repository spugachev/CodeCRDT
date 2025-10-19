import { useState, useCallback } from 'react';
import { useEffect } from 'react';
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

  // Generate algorithm steps for visualization
  const generateAlgorithmSteps = (arr: ArrayElement[], algorithm: AlgorithmType): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const workingArray = arr.map(el => ({ ...el }));

    if (algorithm === 'bubble') {
      for (let i = 0; i < workingArray.length; i++) {
        for (let j = 0; j < workingArray.length - i - 1; j++) {
          // Comparing step
          steps.push({
            array: workingArray.map(el => ({ ...el })),
            comparingIndices: [j, j + 1],
            swappingIndices: [],
            sortedIndices: Array.from({ length: i }, (_, k) => workingArray.length - 1 - k)
          });

          if (workingArray[j].value > workingArray[j + 1].value) {
            // Swapping step
            [workingArray[j], workingArray[j + 1]] = [workingArray[j + 1], workingArray[j]];
            steps.push({
              array: workingArray.map(el => ({ ...el })),
              comparingIndices: [],
              swappingIndices: [j, j + 1],
              sortedIndices: Array.from({ length: i }, (_, k) => workingArray.length - 1 - k)
            });
          }
        }
      }
    } else if (algorithm === 'insertion') {
      for (let i = 1; i < workingArray.length; i++) {
        const key = workingArray[i];
        let j = i - 1;

        while (j >= 0 && workingArray[j].value > key.value) {
          steps.push({
            array: workingArray.map(el => ({ ...el })),
            comparingIndices: [j, j + 1],
            swappingIndices: [],
            sortedIndices: []
          });

          workingArray[j + 1] = workingArray[j];
          steps.push({
            array: workingArray.map(el => ({ ...el })),
            comparingIndices: [],
            swappingIndices: [j, j + 1],
            sortedIndices: []
          });
          j--;
        }
        workingArray[j + 1] = key;
      }
    }

    // Final sorted state
    steps.push({
      array: workingArray.map(el => ({ ...el })),
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: Array.from({ length: workingArray.length }, (_, i) => i)
    });

    return steps;
  };
  // Animation effect for step-by-step visualization
  const animateSteps = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const delay = 1000 - (speed[0] * 9.5); // Convert speed slider to delay (50ms - 1000ms)
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, steps.length, speed]);

  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      animateSteps();
    }
  }, [isPlaying, animateSteps]);
  const startVisualization = useCallback(() => {
    if (steps.length === 0) {
      // Generate steps for the selected algorithm first
      const algorithmSteps = generateAlgorithmSteps(array, selectedAlgorithm);
      setSteps(algorithmSteps);
      setCurrentStep(0);
    }
    setIsPlaying(true);
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {

    setIsPlaying(false);
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
          sortedSet.add(i + 1);
          addStep(sortedArray, [], [], Array.from(sortedSet));
          
          return i + 1;
        };

        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400">
                      <BarChart3 className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Array Size</h3>
                    </div>
                    <span className="text-white font-mono text-lg">{arraySize[0]}</span>
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

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400">
                      <Zap className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Speed</h3>
                    </div>
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
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
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
                        {currentStep >= steps.length ? 'Start' : 'Resume'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 hover:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={() => generateSortingSteps(selectedAlgorithm)}
                    disabled={isPlaying || array.length === 0}
                    variant="outline"
                    className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 hover:text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all duration-300"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Steps
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-400 font-mono">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Array Length:</span>
                    <span className="text-purple-400 font-mono">{array.length}</span>
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
                            : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="space-y-1">
                          <div className={`font-semibold ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-300'
                          }`}>
                            {algo.name}
                          </div>
                          <div className={`text-xs font-mono ${
                            selectedAlgorithm === algo.id ? 'text-cyan-400' : 'text-gray-500'
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
                    max={100}
                    step={5}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2 [&>span]:rounded-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    className="flex-1 relative overflow-hidden group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border-0 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all duration-300"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
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
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current" />
                        )}
                      </motion.div>
                      <span className="font-semibold">
                        {isPlaying ? 'Pause' : 'Play'}
                      </span>
                    </motion.div>
                  </Button>
                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 text-white border-2 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.6)] hover:shadow-[0_0_30px_rgba(236,72,153,0.9)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95, rotate: -360 }}
                      transition={{ duration: 0.6, type: "spring" }}
                    >
                      <motion.div
                        animate={{ rotate: 0 }}
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.6 }}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </motion.div>
                      <span className="font-semibold">Reset</span>
                    </motion.div>
                  </Button>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              <div className="flex items-center gap-2 text-purple-400 mb-4">
                <Activity className="w-4 h-4" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Statistics</h3>
              </div>
              
              <div className="space-y-4">
                {/* Comparisons Counter */}
                <motion.div
                  className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm text-gray-300">Comparisons</span>
                    </div>
                    <motion.span
                      key={currentStep}
                      initial={{ scale: 1.5, color: '#00ffff' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      className="text-2xl font-bold font-mono"
                    >
                      {steps.length > 0 && currentStep < steps.length
                        ? steps.slice(0, currentStep + 1).filter(s => s.comparingIndices.length > 0).length
                        : 0}
                    </motion.span>
                  </div>
                  <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                      initial={{ width: 0 }}
                      animate={{
                        width: steps.length > 0
                          ? `${(steps.slice(0, currentStep + 1).filter(s => s.comparingIndices.length > 0).length / Math.max(steps.length, 1)) * 100}%`
                          : '0%'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>

                {/* Swaps Counter */}
                <motion.div
                  className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-lg p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shuffle className="w-5 h-5 text-pink-400" />
                      <span className="text-sm text-gray-300">Swaps</span>
                    </div>
                    <motion.span
                      key={`swap-${currentStep}`}
                      initial={{ scale: 1.5, color: '#ff00ff' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      className="text-2xl font-bold font-mono"
                    >
                      {steps.length > 0 && currentStep < steps.length
                        ? steps.slice(0, currentStep + 1).filter(s => s.swappingIndices.length > 0).length
                        : 0}
                    </motion.span>
                  </div>
                  <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-pink-400 to-purple-400 shadow-[0_0_10px_rgba(255,0,255,0.8)]"
                      initial={{ width: 0 }}
                      animate={{
                        width: steps.length > 0
                          ? `${(steps.slice(0, currentStep + 1).filter(s => s.swappingIndices.length > 0).length / Math.max(steps.length, 1)) * 100}%`
                          : '0%'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>

                {/* Progress */}
                <motion.div
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-300">Progress</span>
                    </div>
                    <motion.span
                      key={`progress-${currentStep}`}
                      initial={{ scale: 1.5, color: '#00ff00' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      className="text-2xl font-bold font-mono"
                    >
                      {steps.length > 0
                        ? `${Math.round((currentStep / Math.max(steps.length - 1, 1)) * 100)}%`
                        : '0%'}
                    </motion.span>
                  </div>
                  <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-400 shadow-[0_0_10px_rgba(0,255,0,0.8)]"
                      initial={{ width: 0 }}
                      animate={{
                        width: steps.length > 0
                          ? `${(currentStep / Math.max(steps.length - 1, 1)) * 100}%`
                          : '0%'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>

                {/* Array Status */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Total Steps</span>
                    <span className="text-white font-mono">{steps.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Current Step</span>
                    <span className="text-white font-mono">{currentStep + 1}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Array Length</span>
                    <span className="text-white font-mono">{array.length}</span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-2 mt-2">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        isPlaying
                          ? 'bg-green-400 shadow-[0_0_10px_rgba(0,255,0,0.8)]'
                          : steps.length > 0 && currentStep >= steps.length - 1
                          ? 'bg-blue-400 shadow-[0_0_10px_rgba(0,150,255,0.8)]'
                          : 'bg-gray-500'
                      }`}
                      animate={
                        isPlaying
                          ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }
                          : { scale: 1, opacity: 1 }
                      }
                      transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
                    />
                    <span className="text-xs text-gray-300">
                      {isPlaying
                        ? 'Sorting...'
                        : steps.length > 0 && currentStep >= steps.length - 1
                        ? 'Completed'
                        : 'Ready'}
                    </span>
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
                  className="absolute inset-0 flex flex-col items-center justify-center space-y-6"
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
                      Click the button below to create a random array
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {(steps.length > 0 ? steps[currentStep]?.array : array).map((element, index) => {
                    const currentStepData = steps.length > 0 ? steps[currentStep] : null;
                    const isComparing = currentStepData?.comparingIndices.includes(index);
                    const isSwapping = currentStepData?.swappingIndices.includes(index);
                    const isSorted = currentStepData?.sortedIndices.includes(index);
                    
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let glowColor = barColor;
                    let glowIntensity = '0.3';
                    
                    if (isSorted) {
                      barColor = '#00ff00';
                      glowColor = '#00ff00';
                      glowIntensity = '0.8';
                    } else if (isSwapping) {
                      barColor = '#ff0066';
                      glowColor = '#ff0066';
                      glowIntensity = '1';
                    } else if (isComparing) {
                      barColor = '#ffff00';
                      glowColor = '#ffff00';
                      glowIntensity = '0.9';
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px] group"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          y: isSwapping ? [-20, 0] : 0,
                          scale: isComparing ? [1, 1.1, 1] : 1
                        }}
                        transition={{
                          height: { duration: 0.5, ease: "easeOut" },
                          opacity: { duration: 0.3 },
                          y: { duration: 0.4, ease: "easeInOut" },
                          scale: { duration: 0.3, repeat: isComparing ? Infinity : 0 }
                        }}
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `
                            0 0 20px rgba(${parseInt(glowColor.slice(1, 3), 16)}, ${parseInt(glowColor.slice(3, 5), 16)}, ${parseInt(glowColor.slice(5, 7), 16)}, ${glowIntensity}),
                            0 0 40px rgba(${parseInt(glowColor.slice(1, 3), 16)}, ${parseInt(glowColor.slice(3, 5), 16)}, ${parseInt(glowColor.slice(5, 7), 16)}, ${parseFloat(glowIntensity) * 0.6}),
                            inset 0 0 20px rgba(255, 255, 255, 0.2)
                          `,
                          borderRadius: '4px 4px 0 0',
                          position: 'relative'
                        }}
                      >
                        {/* Swap Trail Effect */}
                        {isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t"
                              initial={{ opacity: 0 }}
                              animate={{ 
                                opacity: [0, 1, 0],
                                scale: [1, 1.5, 2]
                              }}
                              transition={{ 
                                duration: 0.6,
                                repeat: Infinity
                              }}
                              style={{
                                background: `radial-gradient(circle, ${barColor}80, transparent)`,
                                filter: 'blur(10px)'
                              }}
                            />
                            <motion.div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ 
                                opacity: [0, 1, 0],
                                y: [-30, -40, -50]
                              }}
                              transition={{ 
                                duration: 0.8,
                                repeat: Infinity
                              }}
                            >
                              <div className="w-2 h-2 rounded-full" style={{ 
                                backgroundColor: barColor,
                                boxShadow: `0 0 10px ${barColor}`
                              }} />
                            </motion.div>
                          </>
                        )}
                        
                        {/* Comparison Indicator */}
                        {isComparing && (
                          <motion.div
                            className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              scale: [0.5, 1.5, 0.5],
                              rotate: [0, 180, 360]
                            }}
                            transition={{ 
                              duration: 1,
                              repeat: Infinity
                            }}
                          >
                            <div className="relative">
                              <div className="w-8 h-8 border-4 border-yellow-400 rounded-full" style={{
                                boxShadow: '0 0 20px rgba(255, 255, 0, 0.8)'
                              }} />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-yellow-400" />
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Sorted Checkmark */}
                        {isSorted && (
                          <motion.div
                            className="absolute -top-10 left-1/2 transform -translate-x-1/2"
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
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center" style={{
                              boxShadow: '0 0 20px rgba(0, 255, 0, 0.8)'
                            }}>
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Value Label on Hover */}
                        <motion.div
                          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ pointerEvents: 'none' }}
                        >
                          <div className="px-2 py-1 bg-gray-900 border border-cyan-500/50 rounded text-xs font-mono text-cyan-300 whitespace-nowrap" style={{
                            boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
                          }}>
                            {element.value}
                          </div>
                        </motion.div>
                        
                        {/* Shimmer Effect */}
                        <motion.div
                          className="absolute inset-0 rounded-t overflow-hidden"
                          style={{ 
                            background: 'linear-gradient(to top, transparent, rgba(255, 255, 255, 0.3), transparent)',
                            opacity: 0.5
                          }}
                          animate={{
                            y: ['100%', '-100%']
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {(steps.length > 0 && currentStep < steps.length ? steps[currentStep].array : array).map((element, index) => {
                  const currentStepData = steps.length > 0 && currentStep < steps.length ? steps[currentStep] : null;
                  const isComparing = currentStepData?.comparingIndices.includes(index);
                  const isSwapping = currentStepData?.swappingIndices.includes(index);
                  const isSorted = currentStepData?.sortedIndices.includes(index);
                  
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
                      className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: barHeight,
                        opacity: 1,
                        scale: isSwapping ? 1.1 : isComparing ? 1.05 : 1,
                        y: isSwapping ? -20 : 0
                      }}
                      transition={{
                        height: { duration: 0.5, ease: 'easeOut' },
                        scale: { duration: 0.2 },
                        y: { duration: 0.3, type: 'spring' }
                      }}
                      style={{
                        backgroundColor: barColor,
                        boxShadow: `
                          0 0 ${isSwapping ? '40px' : isComparing ? '30px' : '20px'} ${barColor}80,
                          0 0 ${isSwapping ? '60px' : isComparing ? '45px' : '30px'} ${barColor}40,
                          inset 0 0 ${isSwapping ? '20px' : '10px'} ${barColor}40
                        `,
                        border: `1px solid ${barColor}`,
                        filter: isSwapping ? 'brightness(1.5)' : isComparing ? 'brightness(1.3)' : 'brightness(1)'
                      }}
                    >
                      {/* Glow effect overlay */}
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        animate={{
                          opacity: isSwapping ? [0.5, 1, 0.5] : isComparing ? [0.3, 0.7, 0.3] : [0.2, 0.4, 0.2]
                        }}
                        transition={{
                          duration: isSwapping ? 0.5 : isComparing ? 0.8 : 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        style={{
                          background: `linear-gradient(to top, transparent, ${barColor}60)`,
                          boxShadow: `inset 0 0 20px ${barColor}80`
                        }}
                      />
                      
                      {/* Value label */}
                      {arraySize[0] <= 30 && (
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: isSwapping || isComparing ? 1 : 0.7,
                            scale: isSwapping ? 1.2 : 1
                          }}
                          style={{
                            color: barColor,
                            textShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}80`
                          }}
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
                            opacity: [0.8, 0],
                            scale: [1, 1.5]
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity
                          }}
                          style={{
                            border: `2px solid ${barColor}`,
                            boxShadow: `0 0 30px ${barColor}`
                          }}
                        />
                      )}
                      
                      {/* Sorted indicator */}
                      {isSorted && (
                        <motion.div
                          className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center"
                            style={{
                              boxShadow: '0 0 20px #00ff00, 0 0 40px #00ff0080'
                            }}
                          >
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400">
                      Sorting Progress
                    </h3>
                  </div>
                  <motion.span
                    key={currentStep}
                    initial={{ scale: 1.2, color: '#a855f7' }}
                    animate={{ scale: 1, color: '#c084fc' }}
                    className="text-2xl font-bold font-mono text-purple-300"
                  >
                    {steps.length > 0 ? Math.round((currentStep / Math.max(steps.length - 1, 1)) * 100) : 0}%
                  </motion.span>
                </div>
                
                <div className="relative h-4 bg-gray-800/80 rounded-full overflow-hidden border border-purple-500/30">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{
                      width: steps.length > 0 ? `${(currentStep / Math.max(steps.length - 1, 1)) * 100}%` : '0%',
                      boxShadow: [
                        '0 0 20px rgba(168,85,247,0.6)',
                        '0 0 40px rgba(168,85,247,0.8)',
                        '0 0 20px rgba(168,85,247,0.6)'
                      ]
                    }}
                    transition={{
                      width: { duration: 0.3, ease: 'easeOut' },
                      boxShadow: { duration: 1.5, repeat: Infinity }
                    }}
                  />
                  
                  {/* Animated shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    style={{
                      width: '50%'
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Step {currentStep} of {Math.max(steps.length - 1, 0)}</span>
                  <span>
                    {currentStep >= steps.length - 1 && steps.length > 0 ? (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-green-400 font-semibold flex items-center gap-1"
                      >
                        ✓ Complete
                      </motion.span>
                    ) : isPlaying ? (
                      <span className="text-cyan-400 font-semibold">Sorting...</span>
                    ) : (
                      <span className="text-gray-500">Ready</span>
                    )}
                  </span>
                </div>
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
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-cyan-300 uppercase tracking-wider">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-6 rounded bg-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0,255,255,0.8)',
                    '0 0 30px rgba(0,255,255,1)',
                    '0 0 20px rgba(0,255,255,0.8)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-cyan-300">Comparing</div>
                <div className="text-xs text-gray-400">Active comparison</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-pink-500/30 hover:border-pink-400/60 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-6 rounded bg-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(236,72,153,0.8)',
                    '0 0 30px rgba(236,72,153,1)',
                    '0 0 20px rgba(236,72,153,0.8)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <div>
                <div className="text-sm font-semibold text-pink-300">Swapping</div>
                <div className="text-xs text-gray-400">Elements moving</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-green-500/30 hover:border-green-400/60 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-6 rounded bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(34,197,94,0.8)',
                    '0 0 30px rgba(34,197,94,1)',
                    '0 0 20px rgba(34,197,94,0.8)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
              <div>
                <div className="text-sm font-semibold text-green-300">Sorted</div>
                <div className="text-xs text-gray-400">In final position</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-6 h-6 rounded bg-gradient-to-br from-purple-400 to-blue-400 shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168,85,247,0.8)',
                    '0 0 30px rgba(168,85,247,1)',
                    '0 0 20px rgba(168,85,247,0.8)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              />
              <div>
                <div className="text-sm font-semibold text-purple-300">Unsorted</div>
                <div className="text-xs text-gray-400">Awaiting sort</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}