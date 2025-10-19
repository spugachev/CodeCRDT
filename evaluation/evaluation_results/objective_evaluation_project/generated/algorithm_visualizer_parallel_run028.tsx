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

  const cleanup = useCallback(() => {
    if (animationId) {
      clearTimeout(animationId);
      setAnimationId(null);
    }
  }, [animationId]);

  const animate = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const delay = 1000 - speed[0] * 9.5; // Convert speed slider to delay (50 = 525ms, 100 = 50ms)
      const id = setTimeout(() => {
        onStepChange(currentStep + 1);
      }, delay);
      setAnimationId(id);
    } else {
      onComplete();
    }
  }, [currentStep, steps.length, speed, onStepChange, onComplete]);

  // Run animation when playing
  if (isPlaying && steps.length > 0) {
    animate();
  }

  // Cleanup on unmount or when stopping
  return cleanup;
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
    createStep([...sortedArray]);

    switch (algorithm) {
      case 'bubble': {
        const n = sortedArray.length;
        const sortedIndices: number[] = [];
        
        for (let i = 0; i < n - 1; i++) {
          for (let j = 0; j < n - i - 1; j++) {
            // Comparing
            createStep([...sortedArray], [j, j + 1], [], sortedIndices);
            
            if (sortedArray[j].value > sortedArray[j + 1].value) {
              // Swapping
              createStep([...sortedArray], [], [j, j + 1], sortedIndices);
              [sortedArray[j], sortedArray[j + 1]] = [sortedArray[j + 1], sortedArray[j]];
              createStep([...sortedArray], [], [j, j + 1], sortedIndices);
            }
          }
          sortedIndices.push(n - i - 1);
          createStep([...sortedArray], [], [], sortedIndices);
        }
        sortedIndices.push(0);
        createStep([...sortedArray], [], [], sortedIndices);
        break;
      }

      case 'insertion': {
        const sortedIndices: number[] = [0];
        
        for (let i = 1; i < sortedArray.length; i++) {
          const key = sortedArray[i];
          let j = i - 1;
          
          createStep([...sortedArray], [i], [], sortedIndices);
          
          while (j >= 0 && sortedArray[j].value > key.value) {
            createStep([...sortedArray], [j, j + 1], [], sortedIndices);
            createStep([...sortedArray], [], [j, j + 1], sortedIndices);
            sortedArray[j + 1] = sortedArray[j];
            createStep([...sortedArray], [], [j, j + 1], sortedIndices);
            j--;
          }
          
          sortedArray[j + 1] = key;
          sortedIndices.push(i);
          createStep([...sortedArray], [], [], sortedIndices);
        }
        break;
      }

      case 'quick': {
        const sortedIndices: number[] = [];
        
        const partition = (low: number, high: number): number => {
          const pivot = sortedArray[high];
          let i = low - 1;
          
          createStep([...sortedArray], [high], [], sortedIndices);
          
          for (let j = low; j < high; j++) {
            createStep([...sortedArray], [j, high], [], sortedIndices);
            
            if (sortedArray[j].value < pivot.value) {
              i++;
              if (i !== j) {
                createStep([...sortedArray], [], [i, j], sortedIndices);
                [sortedArray[i], sortedArray[j]] = [sortedArray[j], sortedArray[i]];
                createStep([...sortedArray], [], [i, j], sortedIndices);
              }
            }
          }
          
          createStep([...sortedArray], [], [i + 1, high], sortedIndices);
          [sortedArray[i + 1], sortedArray[high]] = [sortedArray[high], sortedArray[i + 1]];
          createStep([...sortedArray], [], [i + 1, high], sortedIndices);
          sortedIndices.push(i + 1);
          
          return i + 1;
        };
        
        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
          } else if (low === high) {
            sortedIndices.push(low);
            createStep([...sortedArray], [], [], sortedIndices);
          }
        };
        
        quickSort(0, sortedArray.length - 1);
        break;
      }

      case 'merge': {
        const sortedIndices: number[] = [];
        
        const merge = (left: number, mid: number, right: number) => {
          const leftArr = sortedArray.slice(left, mid + 1);
          const rightArr = sortedArray.slice(mid + 1, right + 1);
          
          let i = 0, j = 0, k = left;
          
          while (i < leftArr.length && j < rightArr.length) {
            createStep([...sortedArray], [left + i, mid + 1 + j], [], sortedIndices);
            
            if (leftArr[i].value <= rightArr[j].value) {
              createStep([...sortedArray], [], [k], sortedIndices);
              sortedArray[k] = leftArr[i];
              createStep([...sortedArray], [], [k], sortedIndices);
              i++;
            } else {
              createStep([...sortedArray], [], [k], sortedIndices);
              sortedArray[k] = rightArr[j];
              createStep([...sortedArray], [], [k], sortedIndices);
              j++;
            }
            k++;
          }
          
          while (i < leftArr.length) {
            sortedArray[k] = leftArr[i];
            createStep([...sortedArray], [], [k], sortedIndices);
            i++;
            k++;
          }
          
          while (j < rightArr.length) {
            sortedArray[k] = rightArr[j];
            createStep([...sortedArray], [], [k], sortedIndices);
            j++;
            k++;
          }
          
          if (left === 0 && right === sortedArray.length - 1) {
            for (let idx = 0; idx < sortedArray.length; idx++) {
              sortedIndices.push(idx);
            }
          }
          createStep([...sortedArray], [], [], sortedIndices);
        };
        
        const mergeSort = (left: number, right: number) => {
          if (left < right) {
            const mid = Math.floor((left + right) / 2);
            mergeSort(left, mid);
            mergeSort(mid + 1, right);
            merge(left, mid, right);
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
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-lg border border-purple-500/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-xl font-semibold text-white">
                  {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name || 'Bubble Sort'}
                </span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="px-4 py-2 bg-cyan-500/20 rounded-full border border-cyan-400/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
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
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20"
            >
              <div className="space-y-6">
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-cyan-400 font-bold text-lg tracking-wider">ALGORITHM</h3>
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
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <label className="text-purple-400 font-semibold text-sm tracking-wide">
                        ARRAY SIZE
                      </label>
                    </div>
                    <span className="text-white font-bold text-lg">{arraySize[0]}</span>
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
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <label className="text-yellow-400 font-semibold text-sm tracking-wide">
                        SPEED
                      </label>
                    </div>
                    <span className="text-white font-bold text-lg">{speed[0]}%</span>
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
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-6 rounded-lg shadow-lg shadow-cyan-500/50 transition-all duration-300"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        PAUSE
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        START
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold py-6 rounded-lg shadow-lg shadow-purple-500/30 transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    RESET
                  </Button>

                  <Button
                    onClick={() => generateSortingSteps(selectedAlgorithm)}
                    disabled={isPlaying || array.length === 0}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-300"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    GENERATE
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Current Step:</span>
                    <span className="text-cyan-400 font-bold">{currentStep}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total Steps:</span>
                    <span className="text-cyan-400 font-bold">{steps.length}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
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
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-wider">ALGORITHM</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-300 text-left overflow-hidden group ${
                          selectedAlgorithm === algo.id
                            ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/50'
                            : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:bg-cyan-500/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                          selectedAlgorithm === algo.id ? 'opacity-100' : ''
                        }`} />
                        <div className="relative z-10">
                          <div className="font-semibold text-white mb-1">{algo.name}</div>
                          <div className={`text-xs font-mono ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-400'
                          }`}>
                            {algo.complexity}
                          </div>
                        </div>
                        {selectedAlgorithm === algo.id && (
                          <motion.div
                            className="absolute top-2 right-2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80" />
                          </motion.div>
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
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-400 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-xl [&_[role=slider]]:hover:shadow-cyan-400/60 [&>span]:bg-gradient-to-r [&>span]:from-cyan-500/30 [&>span]:to-purple-500/30 [&>span]:h-2"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  
                  <motion.button
                    onClick={resetVisualization}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600/30 to-red-600/30 border-2 border-pink-500/50 rounded-lg text-white font-semibold hover:from-pink-600/50 hover:to-red-600/50 hover:border-pink-400 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/60 hover:shadow-xl flex items-center justify-center gap-2 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      animate={{ rotate: 0 }}
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.5 }}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </motion.div>
                    <span>Reset</span>
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
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-purple-400 font-bold text-lg tracking-wider">STATISTICS</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Comparisons Counter */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/30 p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 animate-pulse" />
                  <div className="relative z-10">
                    <div className="text-xs text-cyan-400 font-semibold tracking-wider mb-2">COMPARISONS</div>
                    <motion.div
                      className="text-3xl font-bold text-white font-mono"
                      key={currentStep}
                      initial={{ scale: 1.2, color: '#00ffff' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      transition={{ duration: 0.3 }}
                    >
                      {steps[currentStep]?.comparingIndices.length > 0 ? 
                        steps.slice(0, currentStep + 1).filter(s => s.comparingIndices.length > 0).length : 
                        0}
                    </motion.div>
                    <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: steps.length > 0 ? `${(steps.slice(0, currentStep + 1).filter(s => s.comparingIndices.length > 0).length / Math.max(steps.filter(s => s.comparingIndices.length > 0).length, 1)) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Swaps Counter */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/30 p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <div className="relative z-10">
                    <div className="text-xs text-pink-400 font-semibold tracking-wider mb-2">SWAPS</div>
                    <motion.div
                      className="text-3xl font-bold text-white font-mono"
                      key={`swap-${currentStep}`}
                      initial={{ scale: 1.2, color: '#ff00ff' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      transition={{ duration: 0.3 }}
                    >
                      {steps[currentStep]?.swappingIndices.length > 0 ? 
                        steps.slice(0, currentStep + 1).filter(s => s.swappingIndices.length > 0).length : 
                        0}
                    </motion.div>
                    <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-pink-400 to-pink-600 shadow-[0_0_10px_rgba(255,0,255,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: steps.length > 0 ? `${(steps.slice(0, currentStep + 1).filter(s => s.swappingIndices.length > 0).length / Math.max(steps.filter(s => s.swappingIndices.length > 0).length, 1)) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Progress */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 animate-pulse" style={{ animationDelay: '1s' }} />
                  <div className="relative z-10">
                    <div className="text-xs text-purple-400 font-semibold tracking-wider mb-2">PROGRESS</div>
                    <motion.div
                      className="text-3xl font-bold text-white font-mono"
                      key={`progress-${currentStep}`}
                      initial={{ scale: 1.2, color: '#a855f7' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      transition={{ duration: 0.3 }}
                    >
                      {steps.length > 0 ? Math.round((currentStep / Math.max(steps.length - 1, 1)) * 100) : 0}%
                    </motion.div>
                    <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: steps.length > 0 ? `${(currentStep / Math.max(steps.length - 1, 1)) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Array Size Info */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/30 p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="relative z-10">
                    <div className="text-xs text-yellow-400 font-semibold tracking-wider mb-2">ARRAY SIZE</div>
                    <div className="text-3xl font-bold text-white font-mono">
                      {array.length}
                    </div>
                    <div className="mt-2 text-xs text-yellow-300/70">
                      {steps[currentStep]?.sortedIndices.length || 0} / {array.length} sorted
                    </div>
                  </div>
                </motion.div>

                {/* Current Step */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="relative z-10">
                    <div className="text-xs text-green-400 font-semibold tracking-wider mb-2">CURRENT STEP</div>
                    <div className="text-3xl font-bold text-white font-mono">
                      {currentStep}
                    </div>
                    <div className="mt-2 text-xs text-green-300/70">
                      of {Math.max(steps.length - 1, 0)} total steps
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
                    <p className="text-2xl font-bold text-purple-300">Generate an Array to Start</p>
                    <p className="text-gray-400">Click the reset button to create a random array</p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {/* Animated Bars */}
                  {(steps.length > 0 && currentStep < steps.length ? steps[currentStep].array : array).map((element, index) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let glowIntensity = 0.3;
                    
                    if (element.isSorted) {
                      barColor = '#00ff00';
                      glowIntensity = 0.8;
                    } else if (element.isSwapping) {
                      barColor = '#ff0066';
                      glowIntensity = 1;
                    } else if (element.isComparing) {
                      barColor = '#ffff00';
                      glowIntensity = 0.9;
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        layout
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          boxShadow: [
                            `0 0 ${10 * glowIntensity}px ${barColor}`,
                            `0 0 ${20 * glowIntensity}px ${barColor}`,
                            `0 0 ${10 * glowIntensity}px ${barColor}`
                          ]
                        }}
                        transition={{
                          height: { duration: 0.3, ease: "easeOut" },
                          opacity: { duration: 0.5 },
                          boxShadow: { duration: 0.5, repeat: Infinity }
                        }}
                        className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                        style={{
                          backgroundColor: barColor,
                          border: `1px solid ${barColor}`,
                        }}
                      >
                        {/* Value label */}
                        {array.length <= 30 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                            style={{ color: barColor }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                        
                        {/* Swap trail effect */}
                        {element.isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              background: `linear-gradient(to top, ${barColor}, transparent)`,
                            }}
                            animate={{
                              opacity: [0.8, 0, 0.8],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity
                            }}
                          />
                        )}
                        
                        {/* Glow effect for comparing */}
                        {element.isComparing && (
                          <motion.div
                            className="absolute -inset-1 rounded-t-lg blur-sm"
                            style={{ backgroundColor: barColor }}
                            animate={{
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 0.4,
                              repeat: Infinity
                            }}
                          />
                        )}
                        
                        {/* Sorted checkmark */}
                        {element.isSorted && array.length <= 50 && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2"
                          >
                            <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center shadow-lg shadow-green-400/50">
                              <div className="w-2 h-2 border-b-2 border-r-2 border-white transform rotate-45 -translate-y-[1px]" />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                  
                  {/* Comparison Indicators */}
                  {steps.length > 0 && currentStep < steps.length && steps[currentStep].comparingIndices.length > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                      {steps[currentStep].comparingIndices.map((idx, i) => {
                        const totalBars = steps[currentStep].array.length;
                        const barWidth = 100 / totalBars;
                        const leftPosition = (idx * barWidth) + (barWidth / 2);
                        
                        return (
                          <motion.div
                            key={`compare-${idx}-${i}`}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-4"
                            style={{ left: `${leftPosition}%` }}
                          >
                            <motion.div
                              animate={{
                                y: [0, -10, 0],
                                rotate: [0, 10, -10, 0]
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity
                              }}
                              className="w-8 h-8 -translate-x-1/2"
                            >
                              <div className="w-full h-full rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/80">
                                <Zap className="w-4 h-4 text-gray-900" />
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Swap Trail Effects */}
                  {steps.length > 0 && currentStep < steps.length && steps[currentStep].swappingIndices.length >= 2 && (
                    <div className="absolute top-0 left-0 right-0 h-full pointer-events-none overflow-hidden">
                      <motion.div
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                      >
                        <svg className="w-full h-full">
                          <motion.path
                            d={`M ${(steps[currentStep].swappingIndices[0] / steps[currentStep].array.length) * 100}% 50% Q 50% 20%, ${(steps[currentStep].swappingIndices[1] / steps[currentStep].array.length) * 100}% 50%`}
                            stroke="#ff0066"
                            strokeWidth="3"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5 }}
                            style={{
                              filter: 'drop-shadow(0 0 8px #ff0066)'
                            }}
                          />
                        </svg>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">

                {array.length > 0 ? (
                  array.map((element, index) => {
                    const currentStepData = steps[currentStep];
                    const isComparing = currentStepData?.comparingIndices.includes(index);
                    const isSwapping = currentStepData?.swappingIndices.includes(index);
                    const isSorted = currentStepData?.sortedIndices.includes(index);
                    
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
                    const colorIndex = index % NEON_COLORS.length;
                    const neonColor = NEON_COLORS[colorIndex];
                    
                    let barColor = neonColor;
                    let glowIntensity = 0.3;
                    
                    if (isSorted) {
                      barColor = '#00ff00';
                      glowIntensity = 0.8;
                    } else if (isSwapping) {
                      barColor = '#ff0066';
                      glowIntensity = 1;
                    } else if (isComparing) {
                      barColor = '#ffff00';
                      glowIntensity = 0.7;
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px] group"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          y: isSwapping ? [-10, 0] : 0
                        }}
                        transition={{ 
                          duration: 0.3,
                          y: { duration: 0.2, repeat: isSwapping ? 1 : 0 }
                        }}
                      >
                        <motion.div
                          className="w-full rounded-t-lg relative overflow-hidden"
                          style={{
                            backgroundColor: barColor,
                            boxShadow: `
                              0 0 ${glowIntensity * 20}px ${barColor},
                              0 0 ${glowIntensity * 40}px ${barColor},
                              inset 0 0 ${glowIntensity * 10}px rgba(255, 255, 255, 0.5)
                            `,
                            border: `1px solid ${barColor}`,
                          }}
                          animate={{
                            height: `${heightPercentage}%`,
                            boxShadow: [
                              `0 0 ${glowIntensity * 20}px ${barColor}, 0 0 ${glowIntensity * 40}px ${barColor}, inset 0 0 ${glowIntensity * 10}px rgba(255, 255, 255, 0.5)`,
                              `0 0 ${glowIntensity * 30}px ${barColor}, 0 0 ${glowIntensity * 60}px ${barColor}, inset 0 0 ${glowIntensity * 15}px rgba(255, 255, 255, 0.7)`,
                              `0 0 ${glowIntensity * 20}px ${barColor}, 0 0 ${glowIntensity * 40}px ${barColor}, inset 0 0 ${glowIntensity * 10}px rgba(255, 255, 255, 0.5)`
                            ]
                          }}
                          transition={{
                            height: { duration: 0.5, ease: 'easeInOut' },
                            boxShadow: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
                          }}
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent"
                            animate={{
                              y: ['-100%', '200%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                              repeatDelay: 1
                            }}
                          />
                          
                          {/* Pulse effect for comparing/swapping */}
                          {(isComparing || isSwapping) && (
                            <motion.div
                              className="absolute inset-0"
                              style={{
                                backgroundColor: barColor,
                                opacity: 0.5
                              }}
                              animate={{
                                opacity: [0.5, 0, 0.5]
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                ease: 'easeInOut'
                              }}
                            />
                          )}
                        </motion.div>
                        
                        {/* Value label */}
                        <motion.div
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                          style={{
                            color: barColor,
                            textShadow: `0 0 10px ${barColor}`
                          }}
                        >
                          {element.value}
                        </motion.div>
                        
                        {/* Sorted checkmark */}
                        {isSorted && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: '#00ff00',
                                boxShadow: '0 0 20px #00ff00'
                              }}
                            >
                              <span className="text-gray-900 text-xs font-bold">✓</span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 360]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      >
                        <BarChart3 className="w-16 h-16 text-cyan-400 mx-auto" style={{
                          filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.8))'
                        }} />
                      </motion.div>
                      <p className="text-cyan-400 text-lg font-semibold">
                        Generate an array to start visualizing
                      </p>
                      <p className="text-gray-400 text-sm">
                        Click the reset button to create a random array
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              
              
                            {steps.length > 0 && currentStep < steps.length && (
                <>
                  {steps[currentStep].swappingIndices.map((index, i) => {
                    const element = steps[currentStep].array[index];
                    const maxValue = Math.max(...steps[currentStep].array.map(el => el.value));
                    const heightPercent = (element.value / maxValue) * 100;
                    const barWidth = 100 / steps[currentStep].array.length;
                    const xPosition = index * barWidth;

                    return (
                      <motion.div
                        key={`trail-${element.id}-${currentStep}-${i}`}
                        className="absolute bottom-0 rounded-t-lg pointer-events-none"
                        style={{
                          left: `${xPosition}%`,
                          width: `${barWidth}%`,
                          height: `${heightPercent}%`,
                          background: `linear-gradient(to top, ${NEON_COLORS[index % NEON_COLORS.length]}, transparent)`,
                          filter: 'blur(8px)',
                          opacity: 0.6,
                        }}
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{ 
                          opacity: 0,
                          scale: 1.2,
                          filter: 'blur(20px)'
                        }}
                        transition={{ 
                          duration: 0.6,
                          ease: 'easeOut'
                        }}
                      />
                    );
                  })}
                  
                  {steps[currentStep].swappingIndices.map((index, i) => (
                    <motion.div
                      key={`particle-trail-${index}-${currentStep}-${i}`}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${(index * 100 / steps[currentStep].array.length) + (50 / steps[currentStep].array.length)}%`,
                        bottom: `${(steps[currentStep].array[index].value / Math.max(...steps[currentStep].array.map(el => el.value))) * 50}%`,
                      }}
                    >
                      {[...Array(8)].map((_, particleIndex) => (
                        <motion.div
                          key={`particle-${particleIndex}`}
                          className="absolute w-2 h-2 rounded-full"
                          style={{
                            background: NEON_COLORS[index % NEON_COLORS.length],
                            boxShadow: `0 0 10px ${NEON_COLORS[index % NEON_COLORS.length]}`,
                          }}
                          initial={{ 
                            opacity: 1,
                            scale: 1,
                            x: 0,
                            y: 0
                          }}
                          animate={{ 
                            opacity: 0,
                            scale: 0,
                            x: Math.cos((particleIndex / 8) * Math.PI * 2) * 40,
                            y: Math.sin((particleIndex / 8) * Math.PI * 2) * 40,
                          }}
                          transition={{ 
                            duration: 0.8,
                            ease: 'easeOut',
                            delay: particleIndex * 0.02
                          }}
                        />
                      ))}
                    </motion.div>
                  ))}

                  {steps[currentStep].swappingIndices.length === 2 && (
                    <motion.div
                      key={`swap-line-${currentStep}`}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${(steps[currentStep].swappingIndices[0] * 100 / steps[currentStep].array.length) + (50 / steps[currentStep].array.length)}%`,
                        right: `${100 - ((steps[currentStep].swappingIndices[1] * 100 / steps[currentStep].array.length) + (50 / steps[currentStep].array.length))}%`,
                        top: '50%',
                        height: '2px',
                        background: `linear-gradient(to right, ${NEON_COLORS[steps[currentStep].swappingIndices[0] % NEON_COLORS.length]}, ${NEON_COLORS[steps[currentStep].swappingIndices[1] % NEON_COLORS.length]})`,
                        boxShadow: `0 0 20px ${NEON_COLORS[steps[currentStep].swappingIndices[0] % NEON_COLORS.length]}`,
                      }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ 
                        opacity: [0, 1, 1, 0],
                        scaleX: [0, 1, 1, 1],
                      }}
                      transition={{ 
                        duration: 0.6,
                        times: [0, 0.2, 0.8, 1]
                      }}
                    />
                  )}
                  {steps.length > 0 && currentStep < steps.length && (
                    <>
                      {/* Comparison Indicators */}
                      {steps[currentStep].comparingIndices.map((index, i) => {
                        const barWidth = 100 / (steps[currentStep].array.length || 1);
                        const leftPosition = index * barWidth + barWidth / 2;
                        
                        return (
                          <motion.div
                            key={`compare-${index}-${i}`}
                            className="absolute pointer-events-none"
                            style={{
                              left: `${leftPosition}%`,
                              top: '10%',
                              transform: 'translateX(-50%)'
                            }}
                            initial={{ opacity: 0, y: -20, scale: 0 }}
                            animate={{ 
                              opacity: [0, 1, 1, 0],
                              y: [-20, 0, 0, 10],
                              scale: [0, 1.2, 1, 0.8],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <div className="relative">
                              {/* Glowing ring */}
                              <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  background: `radial-gradient(circle, ${NEON_COLORS[0]}40, transparent)`,
                                  boxShadow: `0 0 20px ${NEON_COLORS[0]}, 0 0 40px ${NEON_COLORS[0]}80`,
                                }}
                                animate={{
                                  scale: [1, 1.5, 1],
                                  opacity: [0.6, 0.2, 0.6]
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                              
                              {/* Center indicator */}
                              <div 
                                className="relative w-10 h-10 rounded-full flex items-center justify-center border-2"
                                style={{
                                  borderColor: NEON_COLORS[0],
                                  backgroundColor: `${NEON_COLORS[0]}20`,
                                  boxShadow: `0 0 15px ${NEON_COLORS[0]}, inset 0 0 15px ${NEON_COLORS[0]}40`
                                }}
                              >
                                <motion.div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: NEON_COLORS[0],
                                    boxShadow: `0 0 10px ${NEON_COLORS[0]}`
                                  }}
                                  animate={{
                                    scale: [1, 1.3, 1],
                                  }}
                                  transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                />
                              </div>
                              
                              {/* Floating label */}
                              <motion.div
                                className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                                animate={{
                                  y: [-2, 2, -2],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                <span 
                                  className="text-xs font-bold px-2 py-1 rounded"
                                  style={{
                                    color: NEON_COLORS[0],
                                    backgroundColor: `${NEON_COLORS[0]}20`,
                                    textShadow: `0 0 10px ${NEON_COLORS[0]}`,
                                    border: `1px solid ${NEON_COLORS[0]}60`
                                  }}
                                >
                                  COMPARE
                                </span>
                              </motion.div>
                              
                              {/* Vertical beam */}
                              <motion.div
                                className="absolute left-1/2 transform -translate-x-1/2"
                                style={{
                                  top: '40px',
                                  width: '2px',
                                  height: '100px',
                                  background: `linear-gradient(to bottom, ${NEON_COLORS[0]}, transparent)`,
                                  boxShadow: `0 0 10px ${NEON_COLORS[0]}`
                                }}
                                animate={{
                                  opacity: [0.8, 0.3, 0.8],
                                  scaleY: [1, 1.1, 1]
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>


        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-cyan-400 font-bold text-lg tracking-wider">LEGEND</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              className="relative overflow-hidden rounded-lg bg-gray-800/50 border border-gray-700 p-4 group hover:border-cyan-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 space-y-3">
                <motion.div
                  className="w-full h-12 bg-gradient-to-t from-gray-600 to-gray-400 rounded-md shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 4px 15px rgba(156, 163, 175, 0.3)',
                      '0 4px 20px rgba(156, 163, 175, 0.5)',
                      '0 4px 15px rgba(156, 163, 175, 0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-300 tracking-wide">DEFAULT</div>
                  <div className="text-[10px] text-gray-500 mt-1">Unsorted</div>
                </div>
              </div>
            </motion.div>

            {/* Comparing State */}
            <motion.div
              className="relative overflow-hidden rounded-lg bg-gray-800/50 border border-yellow-700/50 p-4 group hover:border-yellow-500/70 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 space-y-3">
                <motion.div
                  className="w-full h-12 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-md shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 4px 20px rgba(250, 204, 21, 0.5)',
                      '0 4px 30px rgba(250, 204, 21, 0.8)',
                      '0 4px 20px rgba(250, 204, 21, 0.5)'
                    ],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="text-center">
                  <div className="text-xs font-semibold text-yellow-300 tracking-wide flex items-center justify-center gap-1">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Zap className="w-3 h-3" />
                    </motion.div>
                    COMPARING
                  </div>
                  <div className="text-[10px] text-yellow-500/70 mt-1">Active Check</div>
                </div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              className="relative overflow-hidden rounded-lg bg-gray-800/50 border border-pink-700/50 p-4 group hover:border-pink-500/70 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-pink-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 space-y-3">
                <motion.div
                  className="w-full h-12 bg-gradient-to-t from-pink-600 to-pink-400 rounded-md shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 4px 20px rgba(236, 72, 153, 0.5)',
                      '0 4px 35px rgba(236, 72, 153, 0.9)',
                      '0 4px 20px rgba(236, 72, 153, 0.5)'
                    ],
                    x: [-2, 2, -2]
                  }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <div className="text-center">
                  <div className="text-xs font-semibold text-pink-300 tracking-wide flex items-center justify-center gap-1">
                    <motion.div
                      animate={{ x: [-3, 3, -3] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </motion.div>
                    SWAPPING
                  </div>
                  <div className="text-[10px] text-pink-500/70 mt-1">Exchanging</div>
                </div>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              className="relative overflow-hidden rounded-lg bg-gray-800/50 border border-green-700/50 p-4 group hover:border-green-500/70 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/10 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 space-y-3">
                <motion.div
                  className="w-full h-12 bg-gradient-to-t from-green-600 to-green-400 rounded-md shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 4px 20px rgba(34, 197, 94, 0.5)',
                      '0 4px 30px rgba(34, 197, 94, 0.7)',
                      '0 4px 20px rgba(34, 197, 94, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="text-center">
                  <div className="text-xs font-semibold text-green-300 tracking-wide flex items-center justify-center gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ✓
                    </motion.div>
                    SORTED
                  </div>
                  <div className="text-[10px] text-green-500/70 mt-1">Complete</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 pt-4 border-t border-gray-700/50"
          >
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{
                    boxShadow: [
                      '0 0 5px rgba(34, 211, 238, 0.5)',
                      '0 0 15px rgba(34, 211, 238, 0.8)',
                      '0 0 5px rgba(34, 211, 238, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Real-time Animation</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-purple-400"
                  animate={{
                    boxShadow: [
                      '0 0 5px rgba(168, 85, 247, 0.5)',
                      '0 0 15px rgba(168, 85, 247, 0.8)',
                      '0 0 5px rgba(168, 85, 247, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <span>Step-by-Step</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}