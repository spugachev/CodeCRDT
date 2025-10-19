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

  // Animation effect for step-by-step visualization
  const animateSteps = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, delay);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, steps.length, speed]);

  // Effect to run animation when playing
  if (isPlaying && steps.length > 0) {
    animateSteps();
  }
  const startVisualization = useCallback(() => {
    if (steps.length === 0) {
      // Generate steps first if not already generated
      // For now, just set playing state
      setIsPlaying(true);
      return;
    }
    
    if (currentStep >= steps.length - 1) {
      // Reset to beginning if at end
      setCurrentStep(0);
    }
    
    setIsPlaying(true)</parameter>
</invoke>
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {
    setIsPlaying(false);

  }, []);

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
            steps.push(createStep([...arr], [left + i, mid + 1 + j], [], sortedIndices));
            
            if (leftArr[i].value <= rightArr[j].value) {
              steps.push(createStep([...arr], [], [k], sortedIndices));
              arr[k] = leftArr[i];
              i++;
            } else {
              steps.push(createStep([...arr], [], [k], sortedIndices));
              arr[k] = rightArr[j];
              j++;
            }
            steps.push(createStep([...arr], [], [], sortedIndices));
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
        
        // Mark all as sorted at the end
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
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-shadow duration-300"
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
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50'
                        }`}
                      >
                        <div className="font-medium text-white">{algo.name}</div>
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
                    className="cursor-pointer"
                    disabled={isPlaying}
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
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || currentStep >= steps.length}
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
                        {currentStep >= steps.length ? 'Finished' : 'Play'}
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
                    onClick={() => {
                      generateSortingSteps(selectedAlgorithm);
                      setCurrentStep(0);
                    }}
                    disabled={array.length === 0 || isPlaying}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-semibold shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.7)] transition-all duration-300"
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
                    max={50}
                    step={1}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-400 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-500/50 [&>span]:bg-gradient-to-r [&>span]:from-cyan-500/30 [&>span]:to-purple-500/30"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    className="flex-1 relative overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                        isPlaying
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_30px_rgba(249,115,22,0.6)]'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                      }`}
                      animate={{
                        boxShadow: isPlaying
                          ? [
                              '0 0 30px rgba(249,115,22,0.6)',
                              '0 0 50px rgba(249,115,22,0.8)',
                              '0 0 30px rgba(249,115,22,0.6)'
                            ]
                          : [
                              '0 0 30px rgba(6,182,212,0.6)',
                              '0 0 50px rgba(6,182,212,0.8)',
                              '0 0 30px rgba(6,182,212,0.6)'
                            ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative flex items-center justify-center gap-2 py-3 px-4">
                      <motion.div
                        animate={{ rotate: isPlaying ? 0 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white" />
                        )}
                      </motion.div>
                      <span className="text-white font-semibold">
                        {isPlaying ? 'Pause' : 'Play'}
                      </span>
                    </div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.button>
                  <motion.button
                    onClick={resetVisualization}
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_40px_rgba(236,72,153,0.8)] transition-all duration-300 flex items-center justify-center gap-2 border border-pink-400/50 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <RotateCcw className="w-5 h-5 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="relative z-10">Reset</span>
                  </motion.button>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-shadow duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 font-semibold mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wider">Statistics</span>
                </div>

                <div className="space-y-3">
                  {/* Comparisons Counter */}
                  <motion.div
                    className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-lg p-4 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                          <Zap className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-xs text-cyan-400/80 uppercase tracking-wide">Comparisons</div>
                          <motion.div
                            key={steps[currentStep]?.comparingIndices.length || 0}
                            initial={{ scale: 1.2, color: '#00ffff' }}
                            animate={{ scale: 1, color: '#ffffff' }}
                            className="text-2xl font-bold text-white"
                          >
                            {steps.length > 0 ? steps.slice(0, currentStep + 1).reduce((acc, step) => acc + (step.comparingIndices.length > 0 ? 1 : 0), 0) : 0}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Swaps Counter */}
                  <motion.div
                    className="bg-gradient-to-r from-pink-500/10 to-pink-500/5 border border-pink-500/30 rounded-lg p-4 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/10 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-400/50 shadow-[0_0_15px_rgba(255,0,102,0.4)]">
                          <RotateCcw className="w-5 h-5 text-pink-400" />
                        </div>
                        <div>
                          <div className="text-xs text-pink-400/80 uppercase tracking-wide">Swaps</div>
                          <motion.div
                            key={steps[currentStep]?.swappingIndices.length || 0}
                            initial={{ scale: 1.2, color: '#ff0066' }}
                            animate={{ scale: 1, color: '#ffffff' }}
                            className="text-2xl font-bold text-white"
                          >
                            {steps.length > 0 ? steps.slice(0, currentStep + 1).reduce((acc, step) => acc + (step.swappingIndices.length > 0 ? 1 : 0), 0) : 0}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Progress */}
                  <motion.div
                    className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-lg p-4 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
                    />
                    <div className="relative space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <div className="text-xs text-purple-400/80 uppercase tracking-wide">Progress</div>
                            <motion.div
                              key={currentStep}
                              initial={{ scale: 1.2, color: '#a855f7' }}
                              animate={{ scale: 1, color: '#ffffff' }}
                              className="text-2xl font-bold text-white"
                            >
                              {steps.length > 0 ? Math.round((currentStep / Math.max(steps.length - 1, 1)) * 100) : 0}%
                            </motion.div>
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden border border-purple-500/20">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: steps.length > 0 ? `${(currentStep / Math.max(steps.length - 1, 1)) * 100}%` : '0%'
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Array Size Info */}
                  <motion.div
                    className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-green-400/80 uppercase tracking-wide">Array Size</div>
                      <div className="text-xl font-bold text-white">{array.length}</div>
                    </div>
                  </motion.div>

                  {/* Status Indicator */}
                  <motion.div
                    className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-yellow-400/80 uppercase tracking-wide">Status</div>
                      <div className="flex items-center gap-2">
                        <motion.div
                          className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-400'}`}
                          animate={isPlaying ? {
                            boxShadow: [
                              '0 0 5px rgba(34,197,94,0.5)',
                              '0 0 20px rgba(34,197,94,0.8)',
                              '0 0 5px rgba(34,197,94,0.5)'
                            ]
                          } : {}}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="text-sm font-semibold text-white">
                          {isPlaying ? 'Running' : steps.length > 0 && currentStep >= steps.length - 1 ? 'Complete' : 'Paused'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
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
                    <BarChart3 className="w-24 h-24 text-purple-400/50" />
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
                <div className="relative w-full h-[500px] flex items-end justify-center gap-1 px-4">
                  {/* Comparison indicator lines */}
                  {steps.length > 0 && currentStep < steps.length && (
                    <>
                      {steps[currentStep].comparingIndices.map((idx, i) => (
                        <motion.div
                          key={`compare-line-${idx}-${i}`}
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-0 w-0.5 bg-gradient-to-b from-yellow-400 to-transparent"
                          style={{
                            left: `${(idx / array.length) * 100}%`,
                            height: '100%',
                            boxShadow: '0 0 20px rgba(250, 204, 21, 0.8)'
                          }}
                        />
                      ))}
                      
                      {/* Swap trail effect */}
                      {steps[currentStep].swappingIndices.length === 2 && (
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 1] }}
                          transition={{ duration: 0.5 }}
                          className="absolute h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-full"
                          style={{
                            top: '50%',
                            left: `${(Math.min(...steps[currentStep].swappingIndices) / array.length) * 100}%`,
                            width: `${(Math.abs(steps[currentStep].swappingIndices[1] - steps[currentStep].swappingIndices[0]) / array.length) * 100}%`,
                            boxShadow: '0 0 30px rgba(236, 72, 153, 0.9)'
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* Animated bars */}
                  {(steps.length > 0 && currentStep < steps.length ? steps[currentStep].array : array).map((element, idx) => {
                    const barHeight = (element.value / 105) * 100;
                    const isComparing = element.isComparing;
                    const isSwapping = element.isSwapping;
                    const isSorted = element.isSorted;
                    
                    let barColor = NEON_COLORS[idx % NEON_COLORS.length];
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
                          height: `${barHeight}%`,
                          opacity: 1,
                          scale: isSwapping ? [1, 1.1, 1] : isComparing ? 1.05 : 1
                        }}
                        transition={{
                          height: { duration: 0.3, ease: "easeOut" },
                          scale: { duration: 0.2 },
                          layout: { duration: 0.3, ease: "easeInOut" }
                        }}
                        className="relative rounded-t-lg"
                        style={{
                          flex: 1,
                          minWidth: '4px',
                          maxWidth: `${100 / array.length}%`,
                          background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                          boxShadow: `
                            0 0 ${isSwapping ? '30px' : isComparing ? '25px' : '15px'} ${glowColor}80,
                            inset 0 0 ${isSwapping ? '20px' : '10px'} ${glowColor}40
                          `,
                          border: `1px solid ${barColor}`,
                          transformOrigin: 'bottom'
                        }}
                      >
                        {/* Value label for larger arrays */}
                        {array.length <= 20 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                            style={{
                              color: barColor,
                              textShadow: `0 0 10px ${glowColor}`
                            }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                        
                        {/* Swap particle effect */}
                        {isSwapping && (
                          <>
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={`particle-${i}`}
                                initial={{ 
                                  opacity: 1, 
                                  scale: 1,
                                  x: 0,
                                  y: 0
                                }}
                                animate={{
                                  opacity: [1, 0],
                                  scale: [1, 0],
                                  x: [0, (Math.random() - 0.5) * 40],
                                  y: [0, -Math.random() * 60]
                                }}
                                transition={{
                                  duration: 0.6,
                                  delay: i * 0.05,
                                  ease: "easeOut"
                                }}
                                className="absolute top-0 left-1/2 w-2 h-2 rounded-full"
                                style={{
                                  background: glowColor,
                                  boxShadow: `0 0 10px ${glowColor}`
                                }}
                              />
                            ))}
                          </>
                        )}
                        
                        {/* Sorted checkmark indicator */}
                        {isSorted && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2"
                          >
                            <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center"
                              style={{
                                boxShadow: '0 0 15px rgba(0, 255, 0, 0.6)'
                              }}
                            >
                              <div className="w-2 h-3 border-r-2 border-b-2 border-green-400 rotate-45 -mt-1" />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {(steps.length > 0 && currentStep < steps.length
                  ? steps[currentStep].array
                  : array
                ).map((element, index) => {
                  const maxValue = 105;
                  const heightPercentage = (element.value / maxValue) * 100;
                  const colorIndex = index % NEON_COLORS.length;
                  const baseColor = NEON_COLORS[colorIndex];

                  let glowColor = baseColor;
                  let glowIntensity = 0.5;
                  let scale = 1;

                  if (element.isSwapping) {
                    glowColor = '#ff0066';
                    glowIntensity = 1.5;
                    scale = 1.1;
                  } else if (element.isComparing) {
                    glowColor = '#ffff00';
                    glowIntensity = 1.2;
                    scale = 1.05;
                  } else if (element.isSorted) {
                    glowColor = '#00ff00';
                    glowIntensity = 0.8;
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
                        boxShadow: [
                          `0 0 ${10 * glowIntensity}px ${glowColor}`,
                          `0 0 ${20 * glowIntensity}px ${glowColor}`,
                          `0 0 ${10 * glowIntensity}px ${glowColor}`
                        ]
                      }}
                      transition={{
                        height: { duration: 0.4, ease: 'easeOut' },
                        scale: { duration: 0.3, ease: 'easeInOut' },
                        boxShadow: { duration: 0.6, repeat: Infinity },
                        layout: { duration: 0.5, ease: 'easeInOut' }
                      }}
                      className="relative rounded-t-lg min-w-[8px] flex-1 max-w-[60px]"
                      style={{
                        background: element.isSorted
                          ? 'linear-gradient(to top, #00ff00, #00ff88)'
                          : element.isSwapping
                          ? 'linear-gradient(to top, #ff0066, #ff00ff)'
                          : element.isComparing
                          ? 'linear-gradient(to top, #ffff00, #ffaa00)'
                          : `linear-gradient(to top, ${baseColor}, ${baseColor}dd)`,
                        border: `1px solid ${glowColor}`,
                        position: 'relative'
                      }}
                    >
                      {/* Animated glow overlay */}
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        animate={{
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        style={{
                          background: `linear-gradient(to top, transparent, ${glowColor}40)`
                        }}
                      />

                      {/* Value label */}
                      {arraySize[0] <= 30 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                          style={{
                            color: glowColor,
                            textShadow: `0 0 10px ${glowColor}`
                          }}
                        >
                          {element.value}
                        </motion.div>
                      )}

                      {/* Swap trail effect */}
                      {element.isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity
                          }}
                          style={{
                            background: `radial-gradient(circle, ${glowColor}80, transparent)`,
                            filter: 'blur(8px)'
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-4 shadow-lg shadow-purple-500/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                    Sorting Progress
                  </span>
                  <span className="text-lg font-bold text-cyan-400">
                    {steps.length > 0 ? Math.round((currentStep / (steps.length - 1)) * 100) : 0}%
                  </span>
                </div>
                
                <div className="relative h-3 bg-gray-800/80 rounded-full overflow-hidden border border-purple-500/20">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: steps.length > 0 ? `${(currentStep / (steps.length - 1)) * 100}%` : '0%'
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                      boxShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(34, 211, 238, 0.6)'
                    }}
                  />
                  
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ 
                      x: ['-100%', '200%'],
                      opacity: steps.length > 0 && currentStep < steps.length - 1 ? [0.5, 1, 0.5] : 0
                    }}
                    transition={{ 
                      x: { duration: 1.5, repeat: Infinity, ease: 'linear' },
                      opacity: { duration: 1.5, repeat: Infinity }
                    }}
                    style={{ width: '50%' }}
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>Step {currentStep + 1} of {steps.length || 1}</span>
                  <span className="flex items-center gap-1">
                    {currentStep >= steps.length - 1 && steps.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-400 font-semibold"
                      >
                        ✓ Complete
                      </motion.span>
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
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-2xl shadow-purple-500/20"
        >
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-6 h-6 rounded border-2 border-cyan-400 bg-cyan-500/20"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(34, 211, 238, 0.5)',
                    '0 0 20px rgba(34, 211, 238, 0.8)',
                    '0 0 10px rgba(34, 211, 238, 0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-cyan-300 text-sm font-medium">Comparing</span>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                className="w-6 h-6 rounded border-2 border-pink-400 bg-pink-500/20"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(236, 72, 153, 0.5)',
                    '0 0 20px rgba(236, 72, 153, 0.8)',
                    '0 0 10px rgba(236, 72, 153, 0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
              <span className="text-pink-300 text-sm font-medium">Swapping</span>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                className="w-6 h-6 rounded border-2 border-green-400 bg-green-500/20"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(34, 197, 94, 0.5)',
                    '0 0 20px rgba(34, 197, 94, 0.8)',
                    '0 0 10px rgba(34, 197, 94, 0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              />
              <span className="text-green-300 text-sm font-medium">Sorted</span>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                className="w-6 h-6 rounded border border-purple-400/50 bg-gradient-to-br from-purple-500/30 to-cyan-500/30"
                animate={{
                  boxShadow: [
                    '0 0 8px rgba(168, 85, 247, 0.3)',
                    '0 0 15px rgba(168, 85, 247, 0.5)',
                    '0 0 8px rgba(168, 85, 247, 0.3)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
              />
              <span className="text-purple-300 text-sm font-medium">Unsorted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}