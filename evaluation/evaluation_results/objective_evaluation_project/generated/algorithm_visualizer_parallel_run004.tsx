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
  steps: AlgorithmStep[],
  currentStep: number,
  speed: number[],
  isPlaying: boolean,
  onStepChange: (step: number) => void,
  onComplete: () => void
) => {
  const [animationId, setAnimationId] = useState<NodeJS.Timeout | null>(null);

  const stopAnimation = useCallback(() => {
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

  return { animate, stopAnimation };
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
    const newArray: ArrayElement[] = Array.from({ length: arraySize[0] }, (_, index) => ({
      value: Math.floor(Math.random() * 100) + 1,
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
    const sortedArray = [...array];
    const algorithmSteps: AlgorithmStep[] = [];

    // Helper to create a step snapshot
    const createStep = (
      arr: ArrayElement[],
      comparing: number[] = [],
      swapping: number[] = [],
      sorted: number[] = []
    ) => {
      algorithmSteps.push({
        array: arr.map((el, idx) => ({
          ...el,
          isComparing: comparing.includes(idx),
          isSwapping: swapping.includes(idx),
          isSorted: sorted.includes(idx)
        })),
        comparingIndices: comparing,
        swappingIndices: swapping,
        sortedIndices: sorted
      });
    };

    // Initial state
    createStep(sortedArray);

    switch (algorithm) {
      case 'bubble': {
        const n = sortedArray.length;
        const sorted: number[] = [];
        
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            // Comparing
            createStep(sortedArray, [j, j + 1], [], sorted);
            
            if (sortedArray[j].value > sortedArray[j + 1].value) {
              // Swapping
              createStep(sortedArray, [], [j, j + 1], sorted);
              [sortedArray[j], sortedArray[j + 1]] = [sortedArray[j + 1], sortedArray[j]];
              createStep(sortedArray, [], [j, j + 1], sorted);
            }
          }
          sorted.push(n - i - 1);
          createStep(sortedArray, [], [], sorted);
        }
        sorted.push(0);
        createStep(sortedArray, [], [], sorted);
        break;
      }

      case 'insertion': {
        const sorted: number[] = [0];
        createStep(sortedArray, [], [], sorted);
        
        for (let i = 1; i < sortedArray.length; i++) {
          const key = sortedArray[i];
          let j = i - 1;
          
          createStep(sortedArray, [i], [], sorted);
          
          while (j >= 0 && sortedArray[j].value > key.value) {
            createStep(sortedArray, [j, j + 1], [], sorted);
            createStep(sortedArray, [], [j, j + 1], sorted);
            sortedArray[j + 1] = sortedArray[j];
            createStep(sortedArray, [], [j, j + 1], sorted);
            j--;
          }
          
          sortedArray[j + 1] = key;
          sorted.push(i);
          createStep(sortedArray, [], [], sorted);
        }
        break;
      }

      case 'quick': {
        const sorted: number[] = [];
        
        const partition = (low: number, high: number): number => {
          const pivot = sortedArray[high].value;
          createStep(sortedArray, [high], [], sorted);
          let i = low - 1;
          
          for (let j = low; j < high; j++) {
            createStep(sortedArray, [j, high], [], sorted);
            
            if (sortedArray[j].value < pivot) {
              i++;
              if (i !== j) {
                createStep(sortedArray, [], [i, j], sorted);
                [sortedArray[i], sortedArray[j]] = [sortedArray[j], sortedArray[i]];
                createStep(sortedArray, [], [i, j], sorted);
              }
            }
          }
          
          createStep(sortedArray, [], [i + 1, high], sorted);
          [sortedArray[i + 1], sortedArray[high]] = [sortedArray[high], sortedArray[i + 1]];
          createStep(sortedArray, [], [i + 1, high], sorted);
          sorted.push(i + 1);
          createStep(sortedArray, [], [], sorted);
          
          return i + 1;
        };
        
        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
          } else if (low === high) {
            sorted.push(low);
            createStep(sortedArray, [], [], sorted);
          }
        };
        
        quickSort(0, sortedArray.length - 1);
        break;
      }

      case 'merge': {
        const sorted: number[] = [];
        
        const merge = (left: number, mid: number, right: number) => {
          const leftArr = sortedArray.slice(left, mid + 1);
          const rightArr = sortedArray.slice(mid + 1, right + 1);
          
          let i = 0, j = 0, k = left;
          
          while (i < leftArr.length && j < rightArr.length) {
            createStep(sortedArray, [left + i, mid + 1 + j], [], sorted);
            
            if (leftArr[i].value <= rightArr[j].value) {
              createStep(sortedArray, [], [k], sorted);
              sortedArray[k] = leftArr[i];
              createStep(sortedArray, [], [k], sorted);
              i++;
            } else {
              createStep(sortedArray, [], [k], sorted);
              sortedArray[k] = rightArr[j];
              createStep(sortedArray, [], [k], sorted);
              j++;
            }
            k++;
          }
          
          while (i < leftArr.length) {
            createStep(sortedArray, [], [k], sorted);
            sortedArray[k] = leftArr[i];
            createStep(sortedArray, [], [k], sorted);
            i++;
            k++;
          }
          
          while (j < rightArr.length) {
            createStep(sortedArray, [], [k], sorted);
            sortedArray[k] = rightArr[j];
            createStep(sortedArray, [], [k], sorted);
            j++;
            k++;
          }
          
          for (let idx = left; idx <= right; idx++) {
            if (!sorted.includes(idx)) {
              sorted.push(idx);
            }
          }
          createStep(sortedArray, [], [], sorted);
        };
        
        const mergeSort = (left: number, right: number) => {
          if (left < right) {
            const mid = Math.floor((left + right) / 2);
            mergeSort(left, mid);
            mergeSort(mid + 1, right);
            merge(left, mid, right);
          } else if (left === right && !sorted.includes(left)) {
            sorted.push(left);
            createStep(sortedArray, [], [], sorted);
          }
        };
        
        mergeSort(0, sortedArray.length - 1);
        break;
      }
    }

    setSteps(algorithmSteps);
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
              className="px-6 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/50 rounded-full"
            >
              <span className="text-2xl font-semibold text-purple-300">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name || 'Bubble Sort'}
              </span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="px-4 py-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/50 rounded-full relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
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
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 font-semibold mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wider">Statistics</span>
                </div>

                <div className="space-y-4">
                  {/* Comparisons Counter */}
                  <motion.div
                    className="relative overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/30 p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="relative space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-cyan-300 uppercase tracking-wide">Comparisons</span>
                        <motion.div
                          className="w-2 h-2 rounded-full bg-cyan-400"
                          animate={{
                            boxShadow: [
                              '0 0 5px rgba(0, 255, 255, 0.5)',
                              '0 0 20px rgba(0, 255, 255, 0.8)',
                              '0 0 5px rgba(0, 255, 255, 0.5)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <motion.div
                        className="text-3xl font-bold text-cyan-400 font-mono"
                        key={steps[currentStep]?.comparingIndices.length || 0}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {currentStep}
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Swaps Counter */}
                  <motion.div
                    className="relative overflow-hidden rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/30 p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
                    />
                    <div className="relative space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-pink-300 uppercase tracking-wide">Swaps</span>
                        <motion.div
                          className="w-2 h-2 rounded-full bg-pink-400"
                          animate={{
                            boxShadow: [
                              '0 0 5px rgba(255, 0, 255, 0.5)',
                              '0 0 20px rgba(255, 0, 255, 0.8)',
                              '0 0 5px rgba(255, 0, 255, 0.5)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        />
                      </div>
                      <motion.div
                        className="text-3xl font-bold text-pink-400 font-mono"
                        key={steps[currentStep]?.swappingIndices.length || 0}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {steps[currentStep]?.swappingIndices.length || 0}
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Progress Indicator */}
                  <motion.div
                    className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 2 }}
                    />
                    <div className="relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-300 uppercase tracking-wide">Progress</span>
                        <motion.div
                          className="w-2 h-2 rounded-full bg-purple-400"
                          animate={{
                            boxShadow: [
                              '0 0 5px rgba(168, 85, 247, 0.5)',
                              '0 0 20px rgba(168, 85, 247, 0.8)',
                              '0 0 5px rgba(168, 85, 247, 0.5)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <motion.div
                          className="text-3xl font-bold text-purple-400 font-mono"
                          key={steps.length > 0 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {steps.length > 0 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0}
                        </motion.div>
                        <span className="text-lg text-purple-300">%</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{
                            width: steps.length > 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%'
                          }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Array Elements Sorted */}
                  <motion.div
                    className="relative overflow-hidden rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
                    />
                    <div className="relative space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-300 uppercase tracking-wide">Sorted Elements</span>
                        <motion.div
                          className="w-2 h-2 rounded-full bg-green-400"
                          animate={{
                            boxShadow: [
                              '0 0 5px rgba(0, 255, 0, 0.5)',
                              '0 0 20px rgba(0, 255, 0, 0.8)',
                              '0 0 5px rgba(0, 255, 0, 0.5)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                        />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <motion.div
                          className="text-3xl font-bold text-green-400 font-mono"
                          key={steps[currentStep]?.sortedIndices.length || 0}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {steps[currentStep]?.sortedIndices.length || 0}
                        </motion.div>
                        <span className="text-sm text-green-300/70">/ {array.length}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm uppercase tracking-wider">Algorithm</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          generateSortingSteps(algo.id as AlgorithmType);
                        }}
                        disabled={isPlaying}
                        className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-medium text-white text-sm">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">Array Size</span>
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
                    <div className="flex items-center gap-2 text-pink-400 font-semibold">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">Speed</span>
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
                <div className="space-y-3 pt-4 border-t border-gray-700/50">
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
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-white font-mono">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Array Length:</span>
                    <span className="text-white font-mono">{array.length}</span>
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
                    max={50}
                    step={1}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2 [&>span]:rounded-full"
                  />
                </div>

                <div className="flex gap-3 pt-4"><motion.div
                    whileTap={{ rotate: 360 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="flex-1"
                  >
                    <Button
                      onClick={resetVisualization}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-semibold py-6 rounded-lg shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80 transition-all duration-300 border-2 border-pink-400 group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ 
                          x: ['-100%', '100%'],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity, 
                          ease: 'linear' 
                        }}
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          <RotateCcw className="w-5 h-5" />
                        </motion.div>
                        Reset
                      </span>
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(236, 72, 153, 0.5)',
                            '0 0 40px rgba(236, 72, 153, 0.8)',
                            '0 0 20px rgba(236, 72, 153, 0.5)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </Button>
                  </motion.div>

                  <Button
                    onClick={generateRandomArray}
                    className="flex-1 relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-semibold py-6 rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 border-2 border-purple-400"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5" />
                      New Array
                    </span>
                  </Button>

                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    className="flex-1 relative overflow-hidden group bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 border-0 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all duration-300"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0"
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
                        transition={{ duration: 0.3, type: 'spring' }}
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
                  
                </div>
              </div>
            </div>

            {/* TODO:StatsPanel Real-time statistics panel showing comparisons, swaps, and progress */}
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-8 shadow-2xl shadow-purple-500/20 min-h-[600px]">
              
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {(steps.length > 0 && steps[currentStep]?.array || array).map((element, index) => {
                  const maxValue = Math.max(...(steps.length > 0 && steps[currentStep]?.array || array).map(el => el.value));
                  const heightPercentage = (element.value / maxValue) * 100;
                  const colorIndex = index % NEON_COLORS.length;
                  const neonColor = NEON_COLORS[colorIndex];

                  return (
                    <motion.div
                      key={element.id}
                      layout
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: `${heightPercentage}%`,
                        opacity: 1,
                        scale: element.isSwapping ? 1.1 : 1,
                        y: element.isSwapping ? -10 : 0,
                      }}
                      transition={{
                        height: { duration: 0.5, ease: 'easeOut' },
                        scale: { duration: 0.3, ease: 'easeInOut' },
                        y: { duration: 0.3, ease: 'easeInOut' },
                        layout: { duration: 0.5, ease: 'easeInOut' }
                      }}
                      className="relative flex-1 min-w-[8px] max-w-[60px] rounded-t-lg"
                      style={{
                        backgroundColor: element.isSorted 
                          ? '#00ff00'
                          : element.isSwapping 
                          ? '#ff0066'
                          : element.isComparing 
                          ? '#ffff00'
                          : neonColor,
                        boxShadow: element.isSorted
                          ? '0 0 20px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.3)'
                          : element.isSwapping
                          ? '0 0 30px rgba(255, 0, 102, 0.9), 0 0 60px rgba(255, 0, 102, 0.6), inset 0 0 20px rgba(255, 0, 102, 0.4)'
                          : element.isComparing
                          ? '0 0 25px rgba(255, 255, 0, 0.8), 0 0 50px rgba(255, 255, 0, 0.5), inset 0 0 20px rgba(255, 255, 0, 0.3)'
                          : `0 0 15px ${neonColor}80, 0 0 30px ${neonColor}40, inset 0 0 15px ${neonColor}30`,
                      }}
                    >
                      {/* Animated glow pulse effect */}
                      {(element.isComparing || element.isSwapping) && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          animate={{
                            boxShadow: [
                              `0 0 20px ${element.isSwapping ? '#ff0066' : '#ffff00'}80`,
                              `0 0 40px ${element.isSwapping ? '#ff0066' : '#ffff00'}ff`,
                              `0 0 20px ${element.isSwapping ? '#ff0066' : '#ffff00'}80`,
                            ],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}

                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 rounded-t-lg overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: element.isSorted ? 0.6 : 0.3 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                            repeatDelay: 1,
                          }}
                          style={{ width: '50%' }}
                        />
                      </motion.div>

                      {/* Value label */}
                      <motion.div
                        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: arraySize[0] <= 25 ? 1 : 0,
                          color: element.isSorted 
                            ? '#00ff00'
                            : element.isSwapping 
                            ? '#ff0066'
                            : element.isComparing 
                            ? '#ffff00'
                            : '#ffffff',
                        }}
                        style={{
                          textShadow: element.isSorted
                            ? '0 0 10px rgba(0, 255, 0, 0.8)'
                            : element.isSwapping
                            ? '0 0 10px rgba(255, 0, 102, 0.8)'
                            : element.isComparing
                            ? '0 0 10px rgba(255, 255, 0, 0.8)'
                            : '0 0 5px rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        {element.value}
                      </motion.div>

                      {/* Swap trail effect */}
                      {element.isSwapping && (
                        <>
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            initial={{ opacity: 0.8, scale: 1 }}
                            animate={{ 
                              opacity: 0, 
                              scale: 1.5,
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                            }}
                            style={{
                              backgroundColor: '#ff0066',
                              filter: 'blur(8px)',
                            }}
                          />
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            animate={{
                              y: [0, -10, 0],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                            }}
                          >
                            <div className="w-2 h-2 bg-pink-400 rounded-full shadow-[0_0_10px_rgba(255,0,102,0.8)]" />
                          </motion.div>
                        </>
                      )}

                      {/* Sorted checkmark indicator */}
                      {element.isSorted && (
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.8)]">
                            <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
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
              transition={{ delay: 0.3 }}
              className="mt-6 space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-400 font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Sorting Progress
                </span>
                <span className="text-cyan-300 font-mono">
                  {steps.length > 0 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0}%
                </span>
              </div>
              
              <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden border border-purple-500/30 shadow-inner">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.6)]"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: steps.length > 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%'
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
                
                {currentStep >= steps.length - 1 && steps.length > 0 && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Step {currentStep} of {steps.length > 0 ? steps.length - 1 : 0}</span>
                {currentStep >= steps.length - 1 && steps.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-cyan-400 font-semibold flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    Complete!
                  </motion.span>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-300">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300"
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
                <div className="text-sm font-medium text-white">Default</div>
                <div className="text-xs text-gray-400">Unsorted</div>
              </div>
            </motion.div>

            {/* Comparing State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-yellow-500 to-yellow-300 shadow-[0_0_20px_rgba(255,255,0,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,255,0,0.8)',
                    '0 0 35px rgba(255,255,0,1)',
                    '0 0 20px rgba(255,255,0,0.8)'
                  ],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-medium text-white">Comparing</div>
                <div className="text-xs text-gray-400">Active check</div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-pink-500 to-pink-300 shadow-[0_0_20px_rgba(255,0,102,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,0,102,0.8)',
                    '0 0 35px rgba(255,0,102,1)',
                    '0 0 20px rgba(255,0,102,0.8)'
                  ],
                  x: [-2, 2, -2]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-medium text-white">Swapping</div>
                <div className="text-xs text-gray-400">Exchanging</div>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-green-500 to-green-300 shadow-[0_0_20px_rgba(0,255,0,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0,255,0,0.8)',
                    '0 0 30px rgba(0,255,0,1)',
                    '0 0 20px rgba(0,255,0,0.8)'
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-medium text-white">Sorted</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 pt-4 border-t border-gray-700/50"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <motion.div
                className="w-2 h-2 rounded-full bg-purple-400"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>Watch the bars glow as the algorithm sorts in real-time</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}