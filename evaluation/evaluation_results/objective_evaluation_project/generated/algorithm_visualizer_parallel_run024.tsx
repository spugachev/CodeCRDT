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

const useAnimationLoop = (
  steps: AlgorithmStep[],
  speed: number,
  isPlaying: boolean,
  currentStep: number,
  setCurrentStep: (step: number) => void,
  setArray: (array: ArrayElement[]) => void,
  setIsPlaying: (playing: boolean) => void
) => {
  const [animationId, setAnimationId] = useState<NodeJS.Timeout | null>(null);

  const stopAnimation = useCallback(() => {
    if (animationId) {
      clearTimeout(animationId);
      setAnimationId(null);
    }
  }, [animationId]);

  const runStep = useCallback(() => {
    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const step = steps[currentStep];
    setArray(step.array);
    setCurrentStep(currentStep + 1);

    const delay = 1000 - speed * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
    const timeoutId = setTimeout(() => {
      if (currentStep + 1 < steps.length) {
        runStep();
      } else {
        setIsPlaying(false);
      }
    }, delay);

    setAnimationId(timeoutId);
  }, [currentStep, steps, speed, setArray, setCurrentStep, setIsPlaying]);

  return { runStep, stopAnimation };
};

export default function AlgorithmVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [arraySize, setArraySize] = useState([20]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bubble');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const { runStep, stopAnimation } = useAnimationLoop(
    steps,
    speed[0],
    isPlaying,
    currentStep,
    setCurrentStep,
    setArray,
    setIsPlaying
  );

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

  const startVisualization = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) {
      return;
    }

    setIsPlaying(true);
    runStep();
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {
    setIsPlaying(false);

  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    const sortedArray = [...array];
    const allSteps: AlgorithmStep[] = [];

    const addStep = (arr: ArrayElement[], comparing: number[] = [], swapping: number[] = [], sorted: number[] = []) => {
      allSteps.push({
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
        const n = sortedArray.length;
        const sortedSet = new Set<number>();
        
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            // Comparing
            addStep(sortedArray, [j, j + 1], [], Array.from(sortedSet));
            
            if (sortedArray[j].value > sortedArray[j + 1].value) {
              // Swapping
              addStep(sortedArray, [], [j, j + 1], Array.from(sortedSet));
              [sortedArray[j], sortedArray[j + 1]] = [sortedArray[j + 1], sortedArray[j]];
              addStep(sortedArray, [], [], Array.from(sortedSet));
            }
          }
          sortedSet.add(n - i - 1);
          addStep(sortedArray, [], [], Array.from(sortedSet));
        }
        sortedSet.add(0);
        addStep(sortedArray, [], [], Array.from(sortedSet));
        break;
      }

      case 'insertion': {
        const n = sortedArray.length;
        const sortedSet = new Set<number>([0]);
        addStep(sortedArray, [], [], [0]);

        for (let i = 1; i < n; i++) {
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
          const comparingRange = Array.from({ length: right - left + 1 }, (_, idx) => left + idx);

          while (i < leftArr.length && j < rightArr.length) {
            addStep(sortedArray, comparingRange, [], Array.from(sortedSet));
            
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

    setSteps(allSteps);
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
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-mono text-cyan-300">
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
              transition={{ duration: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <Zap className="w-5 h-5" />
                    <span className="text-sm uppercase tracking-wider">Algorithm</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {mockAlgorithms.map((algo) => (
                      <button
                        key={algo.id}
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          generateSortingSteps(algo.id as AlgorithmType);
                        }}
                        disabled={isPlaying}
                        className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-700/30 border-gray-600 hover:border-cyan-500/50 hover:bg-gray-700/50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-medium text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                      <Zap className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wider">Speed</span>
                    </div>
                    <span className="text-white font-mono text-sm bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
                      {speed[0]}%
                    </span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={100}
                    step={10}
                    disabled={isPlaying}
                    className="cursor-pointer"
                  />
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400 font-semibold">
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wider">Array Size</span>
                    </div>
                    <span className="text-white font-mono text-sm bg-pink-500/20 px-3 py-1 rounded-full border border-pink-400/30">
                      {arraySize[0]}
                    </span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={5}
                    disabled={isPlaying}
                    className="cursor-pointer"
                  />
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <div className="flex items-center justify-center gap-2">
                        <Pause className="w-5 h-5" />
                        <span>Pause</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Play className="w-5 h-5" />
                        <span>Play</span>
                      </div>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-6 rounded-xl shadow-[0_0_20px_rgba(255,0,255,0.5)] hover:shadow-[0_0_30px_rgba(255,0,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RotateCcw className="w-5 h-5" />
                      <span>Reset</span>
                    </div>
                  </Button>
                </div>

                {/* Progress Indicator */}
                {steps.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-cyan-400 font-mono">
                        {currentStep} / {steps.length}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
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
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          setSteps([]);
                          setCurrentStep(0);
                          setIsPlaying(false);
                        }}
                        className={`relative p-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400 shadow-lg shadow-cyan-500/50'
                            : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold">{algo.name.split(' ')[0]}</span>
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
                    className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:transition-shadow [&_[role=slider]]:hover:shadow-cyan-400/80 [&_.relative]:bg-gray-700 [&_.relative]:rounded-full [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-cyan-500 [&_.bg-primary]:to-purple-500"
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
                      <span className="text-sm text-gray-400">Elements</span>
                      <motion.span 
                        key={arraySize[0]}
                        initial={{ scale: 1.3, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-lg font-bold text-white"
                      >
                        {arraySize[0]}
                      </motion.span>
                    </div>
                    <div className="relative">
                      <Slider
                        value={arraySize}
                        onValueChange={setArraySize}
                        min={5}
                        max={50}
                        step={1}
                        disabled={isPlaying}
                        className="cursor-pointer [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-400 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:transition-shadow hover:[&_[role=slider]]:shadow-xl hover:[&_[role=slider]]:shadow-cyan-400/70 [&>span]:bg-gradient-to-r [&>span]:from-cyan-500/30 [&>span]:to-purple-500/30"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-sm -z-10" />
                    </div>
                  </div></parameter>
</invoke>
                </div>

                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none group"
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
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            animate={{ 
                              x: [0, 3, 0],
                              filter: [
                                "drop-shadow(0 0 0px rgba(0,255,255,0))",
                                "drop-shadow(0 0 8px rgba(0,255,255,0.8))",
                                "drop-shadow(0 0 0px rgba(0,255,255,0))"
                              ]
                            }}
                            transition={{ 
                              duration: 1.5, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Play className="w-5 h-5 fill-current" />
                          </motion.div>
                          <span>Start</span>
                        </>
                      )}
                    </motion.div>
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 font-semibold py-6 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/60 transition-all duration-300 group"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        whileHover={{ 
                          rotate: -360,
                          filter: "drop-shadow(0 0 8px rgba(168,85,247,0.8))"
                        }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </motion.div>
                      <span>Reset</span>
                    </motion.div>
                  </Button>

                  <Button
                    onClick={() => {
                      generateSortingSteps(selectedAlgorithm);
                    }}
                    disabled={array.length === 0 || isPlaying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-6 rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          filter: [
                            "drop-shadow(0 0 0px rgba(255,0,255,0))",
                            "drop-shadow(0 0 10px rgba(255,0,255,0.9))",
                            "drop-shadow(0 0 0px rgba(255,0,255,0))"
                          ]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      <span>Generate Steps</span>
                    </motion.div>
                  </Button>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 font-semibold mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wider">Statistics</span>
                </div>

                <div className="space-y-4">
                  {/* Comparisons */}
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Comparisons</span>
                      <motion.span
                        key={steps[currentStep]?.comparingIndices.length || 0}
                        initial={{ scale: 1.3, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-2xl font-bold text-cyan-400"
                      >
                        {currentStep > 0 ? currentStep : 0}
                      </motion.span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-lg shadow-cyan-500/50"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Swaps */}
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-pink-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Swaps</span>
                      <motion.span
                        key={steps[currentStep]?.swappingIndices.length || 0}
                        initial={{ scale: 1.3, color: '#ff00ff' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-2xl font-bold text-pink-400"
                      >
                        {steps.slice(0, currentStep).filter(s => s.swappingIndices.length > 0).length}
                      </motion.span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-pink-500 to-pink-400 shadow-lg shadow-pink-500/50"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: steps.length > 0 
                            ? `${(steps.slice(0, currentStep).filter(s => s.swappingIndices.length > 0).length / Math.max(steps.filter(s => s.swappingIndices.length > 0).length, 1)) * 100}%` 
                            : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <motion.span
                        key={currentStep}
                        initial={{ scale: 1.3, color: '#a855f7' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-2xl font-bold text-purple-400"
                      >
                        {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                      </motion.span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 shadow-lg shadow-purple-500/50"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Sorted Elements */}
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Sorted</span>
                      <motion.span
                        key={steps[currentStep]?.sortedIndices.length || 0}
                        initial={{ scale: 1.3, color: '#00ff00' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-2xl font-bold text-green-400"
                      >
                        {steps[currentStep]?.sortedIndices.length || 0}/{array.length}
                      </motion.span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 shadow-lg shadow-green-500/50"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: array.length > 0 
                            ? `${((steps[currentStep]?.sortedIndices.length || 0) / array.length) * 100}%` 
                            : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Algorithm Info */}
                  <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-lg p-4 border border-cyan-500/30 mt-6">
                    <div className="text-xs text-gray-400 mb-2">Current Algorithm</div>
                    <div className="text-lg font-bold text-white mb-1">
                      {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name}
                    </div>
                    <div className="text-sm text-cyan-400">
                      {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
                    </div>
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
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center justify-center h-full space-y-6"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                  >
                    <BarChart3 className="w-24 h-24 text-cyan-400" strokeWidth={1.5} />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">Ready to Visualize</h3>
                    <p className="text-gray-400">Generate an array to begin sorting</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={generateRandomArray}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all duration-300"
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Generate Array
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="h-full flex items-end justify-center gap-1 px-4"></parameter>
</invoke>
                {array.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
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
                      <p className="text-2xl font-semibold text-gray-400">No Array Generated</p>
                      <p className="text-gray-500">Click "Generate Array" to start visualizing</p>
                    </div>
                  </motion.div>
                ) : (
                  array.map((element, index) => {
                    const isComparing = steps[currentStep - 1]?.comparingIndices.includes(index);
                    const isSwapping = steps[currentStep - 1]?.swappingIndices.includes(index);
                    const isSorted = steps[currentStep - 1]?.sortedIndices.includes(index);
                    
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
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
                        className="relative flex-1 min-w-[4px] max-w-[60px] group"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: isSwapping ? [1, 1.1, 1] : isComparing ? 1.05 : 1
                        }}
                        transition={{ 
                          duration: 0.3,
                          scale: { duration: 0.2, repeat: isSwapping ? Infinity : 0 }
                        }}
                        layout
                      >
                        {/* Trail effect for swapping */}
                        {isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              style={{
                                background: `linear-gradient(to top, transparent, ${barColor})`,
                                filter: `blur(8px)`,
                                opacity: 0.6
                              }}
                              animate={{
                                opacity: [0.3, 0.8, 0.3],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity
                              }}
                            />
                            <motion.div
                              className="absolute -top-2 left-1/2 -translate-x-1/2 w-full h-full"
                              initial={{ opacity: 0, y: 0 }}
                              animate={{ 
                                opacity: [0, 0.6, 0],
                                y: [-20, -40, -60]
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity
                              }}
                            >
                              <div 
                                className="w-full h-full rounded-full"
                                style={{
                                  background: `radial-gradient(circle, ${barColor}, transparent)`,
                                  filter: 'blur(10px)'
                                }}
                              />
                            </motion.div>
                          </>
                        )}
                        
                        {/* Main bar */}
                        <motion.div
                          className="relative w-full rounded-t-lg overflow-hidden"
                          style={{
                            height: `${heightPercentage}%`,
                            minHeight: '20px',
                            background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                            boxShadow: `
                              0 0 ${glowIntensity * 20}px ${glowColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')},
                              0 0 ${glowIntensity * 40}px ${glowColor}${Math.floor(glowIntensity * 128).toString(16).padStart(2, '0')},
                              inset 0 0 ${glowIntensity * 30}px ${glowColor}${Math.floor(glowIntensity * 64).toString(16).padStart(2, '0')}
                            `
                          }}
                          animate={{
                            height: `${heightPercentage}%`,
                            background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                            boxShadow: `
                              0 0 ${glowIntensity * 20}px ${glowColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')},
                              0 0 ${glowIntensity * 40}px ${glowColor}${Math.floor(glowIntensity * 128).toString(16).padStart(2, '0')},
                              inset 0 0 ${glowIntensity * 30}px ${glowColor}${Math.floor(glowIntensity * 64).toString(16).padStart(2, '0')}
                            `
                          }}
                          transition={{
                            height: { duration: 0.5, ease: "easeInOut" },
                            background: { duration: 0.3 },
                            boxShadow: { duration: 0.3 }
                          }}
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ['-100%', '200%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1,
                              ease: "easeInOut"
                            }}
                          />
                          
                          {/* Pulse effect for comparing */}
                          {isComparing && (
                            <motion.div
                              className="absolute inset-0"
                              style={{
                                background: `radial-gradient(circle at center, ${barColor}88, transparent)`
                              }}
                              animate={{
                                opacity: [0.5, 1, 0.5],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity
                              }}
                            />
                          )}
                          
                          {/* Sorted checkmark indicator */}
                          {isSorted && (
                            <motion.div
                              className="absolute top-2 left-1/2 -translate-x-1/2"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", bounce: 0.5 }}
                            >
                              <div className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center">
                                <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                        
                        {/* Value label */}
                        <motion.div
                          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{
                            color: barColor,
                            textShadow: `0 0 10px ${barColor}88`
                          }}
                        >
                          {element.value}
                        </motion.div>
                        
                        {/* Glow base */}
                        <motion.div
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full h-2 rounded-full blur-md"
                          style={{
                            background: `radial-gradient(ellipse, ${barColor}, transparent)`,
                            opacity: glowIntensity
                          }}
                          animate={{
                            opacity: glowIntensity,
                            scale: isSwapping ? [1, 1.5, 1] : 1
                          }}
                          transition={{
                            scale: { duration: 0.5, repeat: isSwapping ? Infinity : 0 }
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
              className="mt-6 bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10"
            >
              <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <span className="uppercase tracking-wider text-sm">Legend</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50 hover:border-cyan-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="w-4 h-12 rounded bg-gradient-to-t from-cyan-500 to-cyan-300 shadow-lg"
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
                    <div className="text-white font-medium text-sm">Default</div>
                    <div className="text-gray-400 text-xs">Unsorted</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50 hover:border-yellow-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="w-4 h-12 rounded bg-gradient-to-t from-yellow-500 to-yellow-300 shadow-lg"
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
                    <div className="text-white font-medium text-sm">Comparing</div>
                    <div className="text-gray-400 text-xs">Active</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50 hover:border-pink-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="w-4 h-12 rounded bg-gradient-to-t from-pink-500 to-pink-300 shadow-lg"
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
                    <div className="text-white font-medium text-sm">Swapping</div>
                    <div className="text-gray-400 text-xs">Moving</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50 hover:border-green-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="w-4 h-12 rounded bg-gradient-to-t from-green-500 to-green-300 shadow-lg"
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
                    <div className="text-white font-medium text-sm">Sorted</div>
                    <div className="text-gray-400 text-xs">Complete</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center"
                >
                  <BarChart3 className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-cyan-400 font-semibold text-lg">Timeline Control</h3>
                  <p className="text-xs text-gray-400">Step-by-step visualization progress</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <motion.div
                  className="px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full backdrop-blur-sm"
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(168, 85, 247, 0.3)',
                      '0 0 20px rgba(168, 85, 247, 0.5)',
                      '0 0 10px rgba(168, 85, 247, 0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-sm font-mono text-purple-300">
                    Step {currentStep} / {steps.length}
                  </span>
                </motion.div>
                
                <motion.div
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 rounded-full backdrop-blur-sm"
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(6, 182, 212, 0.3)',
                      '0 0 20px rgba(6, 182, 212, 0.5)',
                      '0 0 10px rgba(6, 182, 212, 0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <span className="text-sm font-mono text-cyan-300">
                    {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Timeline Scrubber */}
            <div className="space-y-3">
              <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden border border-gray-600/50">
                {/* Background glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Progress bar */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: '0%' }}
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
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>

                {/* Progress indicator dot */}
                {steps.length > 0 && (
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-4 border-cyan-400 shadow-lg shadow-cyan-400/50"
                    animate={{
                      left: `${(currentStep / steps.length) * 100}%`,
                      boxShadow: [
                        '0 0 20px rgba(6, 182, 212, 0.8)',
                        '0 0 30px rgba(6, 182, 212, 1)',
                        '0 0 20px rgba(6, 182, 212, 0.8)'
                      ]
                    }}
                    transition={{
                      left: { duration: 0.3, ease: "easeOut" },
                      boxShadow: { duration: 1.5, repeat: Infinity }
                    }}
                    style={{ marginLeft: '-12px' }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-cyan-400/30"
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.8, 0, 0.8]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Step markers */}
              <div className="relative h-8">
                <div className="absolute inset-0 flex justify-between items-center">
                  {steps.length > 0 && Array.from({ length: Math.min(steps.length, 20) }).map((_, index) => {
                    const stepIndex = Math.floor((index / Math.min(steps.length, 20)) * steps.length);
                    const isPassed = stepIndex < currentStep;
                    const isCurrent = stepIndex === currentStep;
                    
                    return (
                      <motion.button
                        key={index}
                        onClick={() => {
                          if (!isPlaying) {
                            setCurrentStep(stepIndex);
                            if (stepIndex < steps.length) {
                              setArray(steps[stepIndex].array);
                            }
                          }
                        }}
                        disabled={isPlaying}
                        className="relative group disabled:cursor-not-allowed"
                        whileHover={!isPlaying ? { scale: 1.5 } : {}}
                        whileTap={!isPlaying ? { scale: 1.2 } : {}}
                      >
                        <motion.div
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            isCurrent
                              ? 'bg-cyan-400 shadow-lg shadow-cyan-400/80'
                              : isPassed
                              ? 'bg-purple-500 shadow-md shadow-purple-500/50'
                              : 'bg-gray-600'
                          }`}
                          animate={isCurrent ? {
                            scale: [1, 1.5, 1],
                            boxShadow: [
                              '0 0 10px rgba(6, 182, 212, 0.8)',
                              '0 0 20px rgba(6, 182, 212, 1)',
                              '0 0 10px rgba(6, 182, 212, 0.8)'
                            ]
                          } : {}}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        
                        {/* Tooltip */}
                        {!isPlaying && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-gray-900 border border-cyan-400/50 rounded-lg px-3 py-1 whitespace-nowrap shadow-lg shadow-cyan-400/30">
                              <span className="text-xs text-cyan-300 font-mono">Step {stepIndex}</span>
                            </div>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Quick navigation buttons */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  onClick={() => {
                    setCurrentStep(0);
                    if (steps.length > 0) {
                      setArray(steps[0].array);
                    }
                  }}
                  disabled={isPlaying || currentStep === 0}
                  size="sm"
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  First
                </Button>
                
                <Button
                  onClick={() => {
                    const prevStep = Math.max(0, currentStep - 1);
                    setCurrentStep(prevStep);
                    if (prevStep < steps.length) {
                      setArray(steps[prevStep].array);
                    }
                  }}
                  disabled={isPlaying || currentStep === 0}
                  size="sm"
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-purple-400 border border-purple-500/30 hover:border-purple-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  ← Prev
                </Button>
                
                <Button
                  onClick={() => {
                    const nextStep = Math.min(steps.length, currentStep + 1);
                    setCurrentStep(nextStep);
                    if (nextStep < steps.length) {
                      setArray(steps[nextStep].array);
                    }
                  }}
                  disabled={isPlaying || currentStep >= steps.length}
                  size="sm"
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-purple-400 border border-purple-500/30 hover:border-purple-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next →
                </Button>
                
                <Button
                  onClick={() => {
                    setCurrentStep(steps.length);
                    if (steps.length > 0) {
                      setArray(steps[steps.length - 1].array);
                    }
                  }}
                  disabled={isPlaying || currentStep >= steps.length}
                  size="sm"
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Last
                  <Zap className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}