import { useState, useCallback } from 'react';import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

  const startVisualization = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) return;
    
    setIsPlaying(true);
    
    const intervalId = setInterval(() => {
      setCurrentStep((prevStep) => {
        const nextStep = prevStep + 1;
        
        if (nextStep >= steps.length) {
          setIsPlaying(false);
          clearInterval(intervalId);
          return prevStep;
        }
        
        const stepData = steps[nextStep];
        setArray(stepData.array);
        
        return nextStep;
      });
    }, 1000 - speed[0] * 9);
    
    return () => clearInterval(intervalId);
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {    setIsPlaying(false);
  }, []);

  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  useEffect(() => {
    if (!isPlaying || steps.length === 0 || currentStep >= steps.length) {
      if (currentStep >= steps.length && steps.length > 0) {
        setIsPlaying(false);
      }
      return;
    }

    const delay = 1000 - (speed[0] * 9);
    const timer = setTimeout(() => {
      const step = steps[currentStep];
      setArray(step.array);
      setCurrentStep(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, speed]);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
        if (array.length === 0) return;

    const steps: AlgorithmStep[] = [];
    const arr = [...array];

    const createStep = (
      currentArray: ArrayElement[],
      comparing: number[] = [],
      swapping: number[] = [],
      sorted: number[] = []
    ): AlgorithmStep => ({
      array: currentArray.map((el, idx) => ({
        ...el,
        isComparing: comparing.includes(idx),
        isSwapping: swapping.includes(idx),
        isSorted: sorted.includes(idx)
      })),
      comparingIndices: comparing,
      swappingIndices: swapping,
      sortedIndices: sorted
    });

    // Initial state
    steps.push(createStep([...arr]));

    switch (algorithm) {
      case 'bubble': {
        const sortedIndices: number[] = [];
        for (let i = 0; i < arr.length - 1; i++) {
          for (let j = 0; j < arr.length - i - 1; j++) {
            // Comparing
            steps.push(createStep([...arr], [j, j + 1], [], sortedIndices));
            
            if (arr[j].value > arr[j + 1].value) {
              // Swapping
              steps.push(createStep([...arr], [], [j, j + 1], sortedIndices));
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              steps.push(createStep([...arr], [], [], sortedIndices));
            }
          }
          sortedIndices.push(arr.length - i - 1);
          steps.push(createStep([...arr], [], [], sortedIndices));
        }
        sortedIndices.push(0);
        steps.push(createStep([...arr], [], [], sortedIndices));
        break;
      }

      case 'insertion': {
        const sortedIndices: number[] = [0];
        steps.push(createStep([...arr], [], [], [0]));
        
        for (let i = 1; i < arr.length; i++) {
          const key = arr[i];
          let j = i - 1;
          
          steps.push(createStep([...arr], [i], [], sortedIndices));
          
          while (j >= 0 && arr[j].value > key.value) {
            steps.push(createStep([...arr], [j, j + 1], [], sortedIndices));
            steps.push(createStep([...arr], [], [j, j + 1], sortedIndices));
            arr[j + 1] = arr[j];
            steps.push(createStep([...arr], [], [], sortedIndices));
            j--;
          }
          
          arr[j + 1] = key;
          sortedIndices.push(i);
          steps.push(createStep([...arr], [], [], sortedIndices));
        }
        break;
      }

      case 'quick': {
        const sortedIndices: number[] = [];
        
        const partition = (low: number, high: number): number => {
          const pivot = arr[high];
          steps.push(createStep([...arr], [high], [], sortedIndices));
          let i = low - 1;

          for (let j = low; j < high; j++) {
            steps.push(createStep([...arr], [j, high], [], sortedIndices));
            
            if (arr[j].value < pivot.value) {
              i++;
              if (i !== j) {
                steps.push(createStep([...arr], [], [i, j], sortedIndices));
                [arr[i], arr[j]] = [arr[j], arr[i]];
                steps.push(createStep([...arr], [], [], sortedIndices));
              }
            }
          }

          steps.push(createStep([...arr], [], [i + 1, high], sortedIndices));
          [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
          sortedIndices.push(i + 1);
          steps.push(createStep([...arr], [], [], sortedIndices));
          
          return i + 1;
        };

        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
          } else if (low === high) {
            sortedIndices.push(low);
            steps.push(createStep([...arr], [], [], sortedIndices));
          }
        };

        quickSort(0, arr.length - 1);
        break;
      }

      case 'merge': {
        const sortedIndices: number[] = [];
        
        const merge = (left: number, mid: number, right: number) => {
          const leftArr = arr.slice(left, mid + 1);
          const rightArr = arr.slice(mid + 1, right + 1);
          
          let i = 0, j = 0, k = left;
          
          while (i < leftArr.length && j < rightArr.length) {
            const leftIdx = left + i;
            const rightIdx = mid + 1 + j;
            steps.push(createStep([...arr], [leftIdx, rightIdx], [], sortedIndices));
            
            if (leftArr[i].value <= rightArr[j].value) {
              steps.push(createStep([...arr], [], [k], sortedIndices));
              arr[k] = leftArr[i];
              steps.push(createStep([...arr], [], [], sortedIndices));
              i++;
            } else {
              steps.push(createStep([...arr], [], [k], sortedIndices));
              arr[k] = rightArr[j];
              steps.push(createStep([...arr], [], [], sortedIndices));
              j++;
            }
            k++;
          }
          
          while (i < leftArr.length) {
            steps.push(createStep([...arr], [], [k], sortedIndices));
            arr[k] = leftArr[i];
            steps.push(createStep([...arr], [], [], sortedIndices));
            i++;
            k++;
          }
          
          while (j < rightArr.length) {
            steps.push(createStep([...arr], [], [k], sortedIndices));
            arr[k] = rightArr[j];
            steps.push(createStep([...arr], [], [], sortedIndices));
            j++;
            k++;
          }
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
        
        for (let i = 0; i < arr.length; i++) {
          sortedIndices.push(i);
        }
        steps.push(createStep([...arr], [], [], sortedIndices));
        break;
      }
    }

    setSteps(steps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [array]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="relative inline-block">
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
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-cyan-500/30"
            >
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-xl font-semibold text-white">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name}
              </span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative px-4 py-2 rounded-lg overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-mono text-purple-300">
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
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.3)] space-y-6"
            >
              {/* Algorithm Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
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
                      className={`p-3 rounded-lg border transition-all ${
                        selectedAlgorithm === algo.id
                          ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                          : 'bg-gray-700/30 border-gray-600 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400">{algo.complexity}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Speed Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-cyan-400 font-semibold">Speed</label>
                  <span className="text-white font-mono">{speed[0]}%</span>
                </div>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={10}
                  max={100}
                  step={10}
                  className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-[0_0_10px_rgba(0,255,255,0.6)]"
                />
              </div>

              {/* Array Size Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-cyan-400 font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Array Size
                  </label>
                  <span className="text-white font-mono">{arraySize[0]}</span>
                </div>
                <Slider
                  value={arraySize}
                  onValueChange={setArraySize}
                  min={5}
                  max={50}
                  step={5}
                  disabled={isPlaying}
                  className="[&_[role=slider]]:bg-purple-400 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                />
              </div>

              {/* Control Buttons */}
              <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                <Button
                  onClick={isPlaying ? pauseVisualization : startVisualization}
                  disabled={steps.length === 0 || currentStep >= steps.length}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {currentStep >= steps.length ? 'Finished' : 'Play'}
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetVisualization}
                  variant="outline"
                  className="w-full border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>

                <Button
                  onClick={() => generateSortingSteps(selectedAlgorithm)}
                  disabled={isPlaying || array.length === 0}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Steps
                </Button>
              </div>

              {/* Stats Display */}
              <div className="pt-4 border-t border-cyan-500/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Step:</span>
                  <span className="text-cyan-400 font-mono">{currentStep} / {steps.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Array Length:</span>
                  <span className="text-purple-400 font-mono">{array.length}</span>
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
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          setSteps([]);
                          setCurrentStep(0);
                          setIsPlaying(false);
                        }}
                        className={`
                          relative p-3 rounded-lg font-medium text-sm transition-all
                          ${selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400 shadow-lg shadow-cyan-500/50'
                            : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:border-cyan-500/50'
                          }
                        `}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{algo.name.split(' ')[0]}</span>
                          <span className="text-xs opacity-70">{algo.complexity}</span>
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
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-sm pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <Button
                    onClick={() => {
                      if (isPlaying) {
                        pauseVisualization();
                      } else {
                        if (steps.length === 0) {
                          generateSortingSteps(selectedAlgorithm);
                        }
                        startVisualization();
                      }
                    }}
                    disabled={array.length === 0}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-3"
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
                            <Pause className="w-6 h-6" />
                          </motion.div>
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            animate={{ x: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Play className="w-6 h-6" />
                          </motion.div>
                          <span>Start</span>
                        </>
                      )}
                    </motion.div>
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 font-bold py-6 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] transition-all duration-300"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-3"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        whileHover={{ rotate: -180 }}
                        transition={{ duration: 0.5 }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </motion.div>
                      <span>Reset</span>
                    </motion.div>
                  </Button>

                  <Button
                    onClick={generateRandomArray}
                    variant="outline"
                    className="w-full border-2 border-green-500 bg-green-500/10 hover:bg-green-500/30 text-green-300 font-bold py-6 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.7)] transition-all duration-300"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-3"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <BarChart3 className="w-5 h-5" />
                      </motion.div>
                      <span>New Array</span>
                    </motion.div>
                  </Button>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20 mt-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-purple-400">Statistics</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Comparisons */}
                <motion.div
                  className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl p-4 border border-cyan-500/30"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm text-cyan-300 font-semibold">Comparisons</span>
                    </div>
                    <motion.div
                      key={comparisons}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {comparisons}
                    </motion.div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-cyan-400/20 rounded-full blur-xl" />
                </motion.div>

                {/* Swaps */}
                <motion.div
                  className="relative overflow-hidden bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-xl p-4 border border-pink-500/30"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 0, 102, 0.3)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Repeat className="w-5 h-5 text-pink-400" />
                      <span className="text-sm text-pink-300 font-semibold">Swaps</span>
                    </div>
                    <motion.div
                      key={swaps}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {swaps}
                    </motion.div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-pink-400/20 rounded-full blur-xl" />
                </motion.div>

                {/* Progress */}
                <motion.div
                  className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4 border border-purple-500/30"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-purple-300 font-semibold">Progress</span>
                    </div>
                    <motion.div
                      key={currentStep}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                    </motion.div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-purple-400/20 rounded-full blur-xl" />
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Step {currentStep} of {steps.length}</span>
                  <span>{steps.length > 0 && currentStep === steps.length ? 'Complete!' : 'In Progress'}</span>
                </div>
                <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden border border-purple-500/30">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </motion.div>
                  {steps.length > 0 && currentStep === steps.length && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/50 via-purple-400/50 to-pink-400/50"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-lg shadow-purple-500/20 min-h-[600px]">
              {array.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="relative"
                  >
                    <BarChart3 className="w-24 h-24 text-cyan-400" />
                    <motion.div
                      className="absolute inset-0 bg-cyan-400/20 rounded-full blur-2xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-lg"
                  >
                    Click "Generate Array" to start visualizing
                  </motion.p>
                </div>
              ) : (
                <div className="h-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let glowIntensity = 0.3;
                    let scale = 1;
                    
                    if (element.isComparing) {
                      barColor = '#ffff00';
                      glowIntensity = 0.8;
                      scale = 1.05;
                    } else if (element.isSwapping) {
                      barColor = '#ff0066';
                      glowIntensity = 1;
                      scale = 1.1;
                    } else if (element.isSorted) {
                      barColor = '#00ff00';
                      glowIntensity = 0.6;
                    }

                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                        style={{
                          height: `${heightPercentage}%`,
                          backgroundColor: barColor,
                          boxShadow: `0 0 ${20 * glowIntensity}px ${barColor}, 0 0 ${40 * glowIntensity}px ${barColor}`,
                        }}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          scale: scale,
                          y: element.isSwapping ? [-10, 0] : 0
                        }}
                        transition={{
                          height: { duration: 0.3, ease: "easeOut" },
                          scale: { duration: 0.2 },
                          y: { duration: 0.3, ease: "easeInOut" },
                          opacity: { duration: 0.2 }
                        }}
                      >
                        {/* Glow effect overlay */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            backgroundColor: barColor,
                            opacity: 0.3
                          }}
                          animate={{
                            opacity: element.isComparing || element.isSwapping ? [0.3, 0.7, 0.3] : 0.3
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: element.isComparing || element.isSwapping ? Infinity : 0
                          }}
                        />
                        
                        {/* Trail effect for swapping */}
                        {element.isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              backgroundColor: barColor,
                              filter: 'blur(8px)'
                            }}
                            initial={{ opacity: 0.8, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.5 }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          />
                        )}
                        
                        {/* Value label */}
                        {arraySize[0] <= 30 && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                            style={{ color: barColor }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
                {array.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="inline-block"
                      >
                        <BarChart3 className="w-16 h-16 text-cyan-400" />
                      </motion.div>
                      <p className="text-gray-400 text-lg">Generate an array to start visualizing</p>
                    </div>
                  </motion.div>
                ) : (
                  array.map((element, index) => {
                    const colorIndex = index % NEON_COLORS.length;
                    const neonColor = NEON_COLORS[colorIndex];
                    const heightPercentage = (element.value / 100) * 100;
                    
                    return (
                      <motion.div
                        key={element.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: element.isSwapping ? 1.1 : 1,
                          height: `${heightPercentage}%`,
                          boxShadow: element.isComparing
                            ? `0 0 30px ${neonColor}, 0 0 60px ${neonColor}, 0 0 90px ${neonColor}`
                            : element.isSwapping
                            ? `0 0 40px ${neonColor}, 0 0 80px ${neonColor}`
                            : element.isSorted
                            ? `0 0 20px #00ff00, 0 0 40px #00ff00`
                            : `0 0 15px ${neonColor}`,
                        }}
                        transition={{
                          layout: { duration: 0.3, type: "spring", bounce: 0.2 },
                          height: { duration: 0.4, ease: "easeInOut" },
                          scale: { duration: 0.2 },
                          boxShadow: { duration: 0.3 },
                          opacity: { duration: 0.5, delay: index * 0.02 }
                        }}
                        className="relative flex-1 min-w-[8px] max-w-[60px] rounded-t-lg"
                        style={{
                          backgroundColor: element.isSorted
                            ? '#00ff00'
                            : element.isComparing
                            ? '#ffff00'
                            : element.isSwapping
                            ? '#ff00ff'
                            : neonColor,
                          minHeight: '20px'
                        }}
                      >
                        {/* Glow overlay */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          animate={{
                            opacity: element.isComparing || element.isSwapping ? [0.3, 0.7, 0.3] : 0.2
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: element.isComparing || element.isSwapping ? Infinity : 0
                          }}
                          style={{
                            background: `linear-gradient(to top, transparent, ${neonColor})`,
                          }}
                        />
                        
                        {/* Trail effect during swaps */}
                        {element.isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              initial={{ opacity: 0.8, scale: 1 }}
                              animate={{ opacity: 0, scale: 1.5 }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              style={{
                                backgroundColor: neonColor,
                                filter: 'blur(8px)'
                              }}
                            />
                            <motion.div
                              className="absolute -top-2 left-1/2 -translate-x-1/2"
                              animate={{
                                y: [-10, -20, -10],
                                opacity: [0, 1, 0]
                              }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: neonColor, boxShadow: `0 0 10px ${neonColor}` }}
                              />
                            </motion.div>
                          </>
                        )}
                        
                        {/* Pulse effect for comparing */}
                        {element.isComparing && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg border-2"
                            animate={{
                              borderColor: ['#ffff00', '#ffffff', '#ffff00'],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            style={{ borderColor: '#ffff00' }}
                          />
                        )}
                        
                        {/* Value label */}
                        <motion.div
                          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                          animate={{
                            color: element.isSorted
                              ? '#00ff00'
                              : element.isComparing
                              ? '#ffff00'
                              : element.isSwapping
                              ? '#ff00ff'
                              : '#ffffff',
                            scale: element.isComparing || element.isSwapping ? [1, 1.2, 1] : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {element.value}
                        </motion.div>
                        
                        {/* Sorted checkmark */}
                        {element.isSorted && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2"
                          >
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,0,0.8)]">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Particle effects for swapping */}
                        {element.isSwapping && (
                          <>
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute top-0 left-1/2"
                                initial={{ x: 0, y: 0, opacity: 1 }}
                                animate={{
                                  x: [0, (Math.random() - 0.5) * 40],
                                  y: [0, -30 - Math.random() * 20],
                                  opacity: [1, 0]
                                }}
                                transition={{
                                  duration: 0.8,
                                  delay: i * 0.1,
                                  repeat: Infinity
                                }}
                              >
                                <div
                                  className="w-1 h-1 rounded-full"
                                  style={{
                                    backgroundColor: neonColor,
                                    boxShadow: `0 0 6px ${neonColor}`
                                  }}
                                />
                              </motion.div>
                            ))}
                          </>
                        )}
                      </motion.div>
                    );
                  })
                )}</parameter>
</invoke>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10"
            >
              <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Legend
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(100, 200, 255, 0.5)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg"
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

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 0, 0.5)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="w-6 h-6 rounded bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(255, 255, 0, 0.5)',
                        '0 0 20px rgba(255, 255, 0, 0.8)',
                        '0 0 10px rgba(255, 255, 0, 0.5)'
                      ],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">Comparing</div>
                    <div className="text-xs text-gray-400">Active</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(255, 0, 255, 0.5)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="w-6 h-6 rounded bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(255, 0, 255, 0.5)',
                        '0 0 25px rgba(255, 0, 255, 0.9)',
                        '0 0 10px rgba(255, 0, 255, 0.5)'
                      ],
                      scale: [1, 1.15, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">Swapping</div>
                    <div className="text-xs text-gray-400">Moving</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 0, 0.5)' }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg"
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
                    <div className="text-sm font-semibold text-white">Sorted</div>
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
          transition={{ delay: 0.4 }}
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
                <h3 className="text-cyan-400 font-bold text-lg">Timeline Control</h3>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 rounded-lg border border-cyan-500/30">
                <span className="text-gray-400 text-sm">Step:</span>
                <motion.span
                  key={currentStep}
                  initial={{ scale: 1.3, color: '#00ffff' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  className="text-white font-bold font-mono"
                >
                  {currentStep}
                </motion.span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-400 font-mono">{steps.length}</span>
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
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
              
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(0, 255, 255, 0.3)',
                    '0 0 20px rgba(168, 85, 247, 0.5)',
                    '0 0 10px rgba(0, 255, 255, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Timeline Scrubber */}
            <div className="relative pt-2">
              <input
                type="range"
                min={0}
                max={Math.max(0, steps.length - 1)}
                value={currentStep}
                onChange={(e) => {
                  const newStep = parseInt(e.target.value);
                  setCurrentStep(newStep);
                  if (steps[newStep]) {
                    setArray(steps[newStep].array);
                  }
                }}
                disabled={isPlaying || steps.length === 0}
                className="w-full h-2 bg-transparent appearance-none cursor-pointer disabled:cursor-not-allowed
                  [&::-webkit-slider-track]:h-2 [&::-webkit-slider-track]:bg-gray-700/50 [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:border [&::-webkit-slider-track]:border-gray-600/50
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-cyan-400 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan-400/50 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:hover:shadow-xl [&::-webkit-slider-thumb]:hover:shadow-cyan-400/70
                  [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-gray-700/50 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:border [&::-moz-range-track]:border-gray-600/50
                  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-cyan-400 [&::-moz-range-thumb]:to-purple-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-cyan-400/50 [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-125"
              />
              
              {/* Step markers */}
              {steps.length > 0 && steps.length <= 50 && (
                <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`w-1 h-1 rounded-full transition-all ${
                        index <= currentStep
                          ? 'bg-cyan-400 shadow-[0_0_4px_rgba(0,255,255,0.8)]'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Control Info */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,255,255,0.8)]" />
                <span>Drag to navigate steps</span>
              </div>
              <div className="text-gray-500">
                {steps.length === 0 ? 'Generate steps to begin' : currentStep >= steps.length - 1 ? 'Sorting complete!' : 'In progress...'}
              </div>
            </div>

            {/* Quick Navigation Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => {
                  setCurrentStep(0);
                  if (steps[0]) {
                    setArray(steps[0].array);
                  }
                }}
                disabled={isPlaying || steps.length === 0 || currentStep === 0}
                variant="outline"
                size="sm"
                className="flex-1 border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300 text-xs"
              >
                ⏮ First
              </Button>
              <Button
                onClick={() => {
                  const newStep = Math.max(0, currentStep - 1);
                  setCurrentStep(newStep);
                  if (steps[newStep]) {
                    setArray(steps[newStep].array);
                  }
                }}
                disabled={isPlaying || steps.length === 0 || currentStep === 0}
                variant="outline"
                size="sm"
                className="flex-1 border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 text-xs"
              >
                ⏪ Prev
              </Button>
              <Button
                onClick={() => {
                  const newStep = Math.min(steps.length - 1, currentStep + 1);
                  setCurrentStep(newStep);
                  if (steps[newStep]) {
                    setArray(steps[newStep].array);
                  }
                }}
                disabled={isPlaying || steps.length === 0 || currentStep >= steps.length - 1}
                variant="outline"
                size="sm"
                className="flex-1 border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 text-xs"
              >
                Next ⏩
              </Button>
              <Button
                onClick={() => {
                  const lastStep = steps.length - 1;
                  setCurrentStep(lastStep);
                  if (steps[lastStep]) {
                    setArray(steps[lastStep].array);
                  }
                }}
                disabled={isPlaying || steps.length === 0 || currentStep >= steps.length - 1}
                variant="outline"
                size="sm"
                className="flex-1 border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-300 text-xs"
              >
                Last ⏭
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}