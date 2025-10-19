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

// Animation control using useEffect
const useAnimationLoop = (
  isPlaying: boolean,
  steps: AlgorithmStep[],
  currentStep: number,
  speed: number[],
  onStepComplete: () => void,
  onAnimationEnd: () => void
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
      const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
      const id = setTimeout(() => {
        onStepComplete();
      }, delay);
      setAnimationId(id);
    } else if (currentStep >= steps.length - 1 && steps.length > 0) {
      onAnimationEnd();
    }
  }, [currentStep, steps.length, speed, onStepComplete, onAnimationEnd]);

  return { animate, cleanup };
};

export default function AlgorithmVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [arraySize, setArraySize] = useState([20]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bubble');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);

  // Animation loop effect
  const handleStepComplete = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const { animate, cleanup } = useAnimationLoop(
    isPlaying,
    steps,
    currentStep,
    speed,
    handleStepComplete,
    handleAnimationEnd
  );

  // Trigger animation when playing
  useState(() => {
    if (isPlaying && steps.length > 0) {
      animate();
    }
    return cleanup;
  });

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

  const startVisualization = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) {
      return;
    }
    
    setIsPlaying(true);
    
    // Apply current step to array
    if (steps[currentStep]) {
      setArray(steps[currentStep].array);
    }
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {

    setIsPlaying(false);
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    const localArray = [...array];
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
    addStep(localArray);

    switch (algorithm) {
      case 'bubble': {
        const sortedIndices: number[] = [];
        for (let i = 0; i < localArray.length - 1; i++) {
          for (let j = 0; j < localArray.length - i - 1; j++) {
            // Comparing
            addStep(localArray, [j, j + 1], [], sortedIndices);
            
            if (localArray[j].value > localArray[j + 1].value) {
              // Swapping
              addStep(localArray, [], [j, j + 1], sortedIndices);
              [localArray[j], localArray[j + 1]] = [localArray[j + 1], localArray[j]];
              addStep(localArray, [], [], sortedIndices);
            }
          }
          sortedIndices.push(localArray.length - i - 1);
          addStep(localArray, [], [], sortedIndices);
        }
        sortedIndices.push(0);
        addStep(localArray, [], [], sortedIndices);
        break;
      }

      case 'insertion': {
        const sortedIndices: number[] = [0];
        addStep(localArray, [], [], sortedIndices);
        
        for (let i = 1; i < localArray.length; i++) {
          const key = localArray[i];
          let j = i - 1;
          
          addStep(localArray, [i], [], sortedIndices);
          
          while (j >= 0 && localArray[j].value > key.value) {
            addStep(localArray, [j, j + 1], [], sortedIndices);
            addStep(localArray, [], [j, j + 1], sortedIndices);
            localArray[j + 1] = localArray[j];
            addStep(localArray, [], [], sortedIndices);
            j--;
          }
          
          localArray[j + 1] = key;
          sortedIndices.push(i);
          addStep(localArray, [], [], sortedIndices);
        }
        break;
      }

      case 'quick': {
        const sortedIndices: number[] = [];
        
        const partition = (low: number, high: number): number => {
          const pivot = localArray[high].value;
          let i = low - 1;
          
          addStep(localArray, [high], [], sortedIndices);
          
          for (let j = low; j < high; j++) {
            addStep(localArray, [j, high], [], sortedIndices);
            
            if (localArray[j].value < pivot) {
              i++;
              if (i !== j) {
                addStep(localArray, [], [i, j], sortedIndices);
                [localArray[i], localArray[j]] = [localArray[j], localArray[i]];
                addStep(localArray, [], [], sortedIndices);
              }
            }
          }
          
          addStep(localArray, [], [i + 1, high], sortedIndices);
          [localArray[i + 1], localArray[high]] = [localArray[high], localArray[i + 1]];
          sortedIndices.push(i + 1);
          addStep(localArray, [], [], sortedIndices);
          
          return i + 1;
        };
        
        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
          } else if (low === high) {
            sortedIndices.push(low);
            addStep(localArray, [], [], sortedIndices);
          }
        };
        
        quickSort(0, localArray.length - 1);
        break;
      }

      case 'merge': {
        const sortedIndices: number[] = [];
        
        const merge = (left: number, mid: number, right: number) => {
          const leftArr = localArray.slice(left, mid + 1);
          const rightArr = localArray.slice(mid + 1, right + 1);
          
          let i = 0, j = 0, k = left;
          
          while (i < leftArr.length && j < rightArr.length) {
            addStep(localArray, [left + i, mid + 1 + j], [], sortedIndices);
            
            if (leftArr[i].value <= rightArr[j].value) {
              addStep(localArray, [], [k], sortedIndices);
              localArray[k] = leftArr[i];
              i++;
            } else {
              addStep(localArray, [], [k], sortedIndices);
              localArray[k] = rightArr[j];
              j++;
            }
            k++;
            addStep(localArray, [], [], sortedIndices);
          }
          
          while (i < leftArr.length) {
            addStep(localArray, [], [k], sortedIndices);
            localArray[k] = leftArr[i];
            i++;
            k++;
            addStep(localArray, [], [], sortedIndices);
          }
          
          while (j < rightArr.length) {
            addStep(localArray, [], [k], sortedIndices);
            localArray[k] = rightArr[j];
            j++;
            k++;
            addStep(localArray, [], [], sortedIndices);
          }
          
          if (left === 0 && right === localArray.length - 1) {
            for (let idx = 0; idx < localArray.length; idx++) {
              sortedIndices.push(idx);
            }
            addStep(localArray, [], [], sortedIndices);
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
        
        mergeSort(0, localArray.length - 1);
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-400 font-bold">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Array Length:</span>
                    <span className="text-purple-400 font-bold">{array.length}</span>
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
                    step={5}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2 [&>span]:rounded-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 relative group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.div
                      className={`absolute inset-0 rounded-lg blur-xl transition-all duration-300 ${
                        isPlaying 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 opacity-60' 
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 opacity-60'
                      }`}
                      animate={{
                        opacity: [0.4, 0.7, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <div className={`relative px-6 py-3 rounded-lg border-2 transition-all duration-300 ${
                      isPlaying
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-400/50'
                        : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50'
                    }`}>
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          key={isPlaying ? 'pause' : 'play'}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-pink-300 fill-pink-300" />
                          ) : (
                            <Play className="w-5 h-5 text-cyan-300 fill-cyan-300" />
                          )}
                        </motion.div>
                        <span className={`font-bold tracking-wider ${
                          isPlaying ? 'text-pink-300' : 'text-cyan-300'
                        }`}>
                          {isPlaying ? 'PAUSE' : 'PLAY'}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                  <motion.button
                    onClick={resetVisualization}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-2 border-pink-400/50 rounded-lg text-pink-300 font-semibold hover:from-pink-500/30 hover:to-purple-500/30 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Reset
                  </motion.button>

                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 ${
                      isPlaying
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 text-yellow-300 hover:from-yellow-500/30 hover:to-orange-500/30 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/50'
                        : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={array.length === 0}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start
                      </>
                    )}
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

                {/* Comparisons Counter */}
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 p-4">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="relative space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 text-sm font-semibold tracking-wide">COMPARISONS</span>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-cyan-400"
                        animate={{
                          boxShadow: [
                            '0 0 5px rgba(34, 211, 238, 0.5)',
                            '0 0 20px rgba(34, 211, 238, 1)',
                            '0 0 5px rgba(34, 211, 238, 0.5)'
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                    <motion.div
                      key={steps[currentStep]?.comparingIndices.length || 0}
                      initial={{ scale: 1.2, color: '#00ffff' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      className="text-3xl font-bold text-white font-mono"
                    >
                      {currentStep > 0 ? currentStep : 0}
                    </motion.div>
                  </div>
                </div>

                {/* Swaps Counter */}
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-500/10 to-pink-500/5 border border-pink-500/30 p-4">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
                  />
                  <div className="relative space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-pink-400 text-sm font-semibold tracking-wide">SWAPS</span>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-pink-400"
                        animate={{
                          boxShadow: [
                            '0 0 5px rgba(236, 72, 153, 0.5)',
                            '0 0 20px rgba(236, 72, 153, 1)',
                            '0 0 5px rgba(236, 72, 153, 0.5)'
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                      />
                    </div>
                    <motion.div
                      key={steps[currentStep]?.swappingIndices.length || 0}
                      initial={{ scale: 1.2, color: '#ff0066' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      className="text-3xl font-bold text-white font-mono"
                    >
                      {steps.filter((step, idx) => idx <= currentStep && step.swappingIndices.length > 0).length}
                    </motion.div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/30 p-4">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 2 }}
                  />
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 text-sm font-semibold tracking-wide">PROGRESS</span>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-purple-400"
                        animate={{
                          boxShadow: [
                            '0 0 5px rgba(168, 85, 247, 0.5)',
                            '0 0 20px rgba(168, 85, 247, 1)',
                            '0 0 5px rgba(168, 85, 247, 0.5)'
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                      />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <motion.div
                        key={currentStep}
                        initial={{ scale: 1.2, color: '#a855f7' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-3xl font-bold text-white font-mono"
                      >
                        {steps.length > 0 ? Math.round((currentStep / Math.max(steps.length - 1, 1)) * 100) : 0}
                      </motion.div>
                      <span className="text-purple-300 text-xl font-semibold">%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden border border-purple-500/30">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{
                          width: steps.length > 0 ? `${(currentStep / Math.max(steps.length - 1, 1)) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Array Status */}
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 p-4">
                  <div className="relative space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 text-sm font-semibold tracking-wide">SORTED ELEMENTS</span>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-400"
                        animate={{
                          boxShadow: [
                            '0 0 5px rgba(34, 197, 94, 0.5)',
                            '0 0 20px rgba(34, 197, 94, 1)',
                            '0 0 5px rgba(34, 197, 94, 0.5)'
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
                      />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <motion.div
                        key={steps[currentStep]?.sortedIndices.length || 0}
                        initial={{ scale: 1.2, color: '#00ff00' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-3xl font-bold text-white font-mono"
                      >
                        {steps[currentStep]?.sortedIndices.length || 0}
                      </motion.div>
                      <span className="text-green-300 text-lg">/ {array.length}</span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs font-semibold tracking-wider">STATUS</span>
                    <motion.div
                      className="flex items-center gap-2 px-3 py-1 rounded-full border"
                      animate={{
                        borderColor: isPlaying ? '#00ff00' : steps.length > 0 && currentStep >= steps.length - 1 ? '#00ffff' : '#666666',
                        backgroundColor: isPlaying ? 'rgba(0, 255, 0, 0.1)' : steps.length > 0 && currentStep >= steps.length - 1 ? 'rgba(0, 255, 255, 0.1)' : 'rgba(100, 100, 100, 0.1)'
                      }}
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full"
                        animate={{
                          backgroundColor: isPlaying ? '#00ff00' : steps.length > 0 && currentStep >= steps.length - 1 ? '#00ffff' : '#666666',
                          boxShadow: isPlaying ? '0 0 10px rgba(0, 255, 0, 0.8)' : steps.length > 0 && currentStep >= steps.length - 1 ? '0 0 10px rgba(0, 255, 255, 0.8)' : 'none'
                        }}
                      />
                      <span className={`text-xs font-semibold ${
                        isPlaying ? 'text-green-400' : steps.length > 0 && currentStep >= steps.length - 1 ? 'text-cyan-400' : 'text-gray-500'
                      }`}>
                        {isPlaying ? 'RUNNING' : steps.length > 0 && currentStep >= steps.length - 1 ? 'COMPLETE' : 'IDLE'}
                      </span>
                    </motion.div>
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
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <BarChart3 className="w-24 h-24 text-cyan-400/50" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-cyan-400">Ready to Visualize</h3>
                    <p className="text-gray-400">Generate an array to begin</p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {/* Comparison Indicators */}
                  {steps.length > 0 && currentStep < steps.length && steps[currentStep].comparingIndices.length > 0 && (
                    <>
                      {steps[currentStep].comparingIndices.map((index, i) => {
                        const barWidth = (100 / array.length);
                        const leftPosition = index * barWidth + (barWidth / 2);
                        
                        return (
                          <motion.div
                            key={`compare-${index}-${i}`}
                            className="absolute top-0 pointer-events-none"
                            style={{
                              left: `${leftPosition}%`,
                              transform: 'translateX(-50%)'
                            }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ 
                              opacity: [0.5, 1, 0.5],
                              y: 0,
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <motion.div
                                className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)]"
                                animate={{
                                  boxShadow: [
                                    '0 0 20px rgba(250,204,21,0.8)',
                                    '0 0 40px rgba(250,204,21,1)',
                                    '0 0 20px rgba(250,204,21,0.8)'
                                  ]
                                }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                              />
                              <motion.div
                                className="w-0.5 h-8 bg-gradient-to-b from-yellow-400 to-transparent"
                                animate={{
                                  opacity: [0.5, 1, 0.5]
                                }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </>
                  )}

                  {/* Swap Trail Effects */}
                  {steps.length > 0 && currentStep < steps.length && steps[currentStep].swappingIndices.length > 0 && (
                    <>
                      {steps[currentStep].swappingIndices.map((index, i) => {
                        const barWidth = (100 / array.length);
                        const leftPosition = index * barWidth + (barWidth / 2);
                        
                        return (
                          <motion.div
                            key={`swap-${index}-${i}`}
                            className="absolute top-0 bottom-0 pointer-events-none"
                            style={{
                              left: `${leftPosition}%`,
                              transform: 'translateX(-50%)',
                              width: `${barWidth}%`
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.6, 0] }}
                            transition={{ duration: 0.8 }}
                          >
                            <div className="relative w-full h-full">
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-t from-pink-500/30 via-purple-500/20 to-transparent rounded-lg"
                                animate={{
                                  scale: [1, 1.1, 1],
                                  opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                              />
                              {/* Particle effects */}
                              {[...Array(5)].map((_, particleIndex) => (
                                <motion.div
                                  key={`particle-${particleIndex}`}
                                  className="absolute w-1 h-1 bg-pink-400 rounded-full"
                                  style={{
                                    left: '50%',
                                    bottom: `${Math.random() * 100}%`
                                  }}
                                  initial={{ 
                                    opacity: 1,
                                    x: 0,
                                    scale: 1
                                  }}
                                  animate={{
                                    opacity: [1, 0],
                                    x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40],
                                    y: [0, -30],
                                    scale: [1, 0]
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    delay: particleIndex * 0.1,
                                    ease: "easeOut"
                                  }}
                                />
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}
                      
                      {/* Connecting arc between swapping elements */}
                      {steps[currentStep].swappingIndices.length === 2 && (
                        <motion.svg
                          className="absolute top-0 left-0 w-full h-full pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.8 }}
                        >
                          <motion.path
                            d={`M ${(steps[currentStep].swappingIndices[0] / array.length) * 100}% 20% Q 50% 5% ${(steps[currentStep].swappingIndices[1] / array.length) * 100}% 20%`}
                            stroke="url(#swapGradient)"
                            strokeWidth="3"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: [0, 1, 0] }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                          />
                          <defs>
                            <linearGradient id="swapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                              <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                        </motion.svg>
                      )}
                    </>
                  )}

                  {/* Array Bars */}
                  {array.map((element, index) => {
                    const isComparing = steps.length > 0 && currentStep < steps.length && 
                      steps[currentStep].comparingIndices.includes(index);
                    const isSwapping = steps.length > 0 && currentStep < steps.length && 
                      steps[currentStep].swappingIndices.includes(index);
                    const isSorted = steps.length > 0 && currentStep < steps.length && 
                      steps[currentStep].sortedIndices.includes(index);
                    
                    const maxHeight = 500;
                    const height = (element.value / 100) * maxHeight;
                    const colorIndex = index % NEON_COLORS.length;
                    const baseColor = NEON_COLORS[colorIndex];
                    
                    let barColor = baseColor;
                    let glowColor = baseColor;
                    let shadowIntensity = '0.5';
                    
                    if (isSorted) {
                      barColor = '#00ff00';
                      glowColor = '#00ff00';
                      shadowIntensity = '0.8';
                    } else if (isSwapping) {
                      barColor = '#ff00ff';
                      glowColor = '#ff00ff';
                      shadowIntensity = '1';
                    } else if (isComparing) {
                      barColor = '#ffff00';
                      glowColor = '#ffff00';
                      shadowIntensity = '0.9';
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[2px] rounded-t-lg"
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `0 0 20px ${glowColor}${Math.floor(parseFloat(shadowIntensity) * 255).toString(16).padStart(2, '0')}, 
                                      0 0 40px ${glowColor}${Math.floor(parseFloat(shadowIntensity) * 0.5 * 255).toString(16).padStart(2, '0')},
                                      inset 0 0 20px ${glowColor}${Math.floor(parseFloat(shadowIntensity) * 0.3 * 255).toString(16).padStart(2, '0')}`
                        }}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${height}px`,
                          opacity: 1,
                          scale: isSwapping ? [1, 1.1, 1] : isComparing ? [1, 1.05, 1] : 1,
                          y: isSwapping ? [0, -10, 0] : 0
                        }}
                        transition={{
                          height: { duration: 0.5, ease: "easeOut" },
                          opacity: { duration: 0.3 },
                          scale: { duration: 0.3, repeat: isComparing || isSwapping ? Infinity : 0 },
                          y: { duration: 0.5 }
                        }}
                      >
                        {/* Inner glow effect */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            background: `linear-gradient(to top, transparent, ${barColor}40)`
                          }}
                          animate={{
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Value label for larger arrays */}
                        {array.length <= 30 && (
                          <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                            style={{ color: barColor }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isSorted || isComparing || isSwapping ? 1 : 0.6 }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                        
                        {/* Sorted checkmark */}
                        {isSorted && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.8)]">
                              <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {currentStep < steps.length && steps[currentStep] ? (
                  steps[currentStep].array.map((element, index) => {
                    const isComparing = steps[currentStep].comparingIndices.includes(index);
                    const isSwapping = steps[currentStep].swappingIndices.includes(index);
                    const isSorted = steps[currentStep].sortedIndices.includes(index);
                    
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
                          boxShadow: isComparing
                            ? `0 0 30px ${barColor}, 0 0 60px ${barColor}`
                            : isSwapping
                            ? `0 0 40px ${barColor}, 0 0 80px ${barColor}, 0 0 120px ${barColor}`
                            : isSorted
                            ? `0 0 20px ${barColor}, 0 0 40px ${barColor}`
                            : `0 0 15px ${barColor}`,
                          scale: isSwapping ? 1.1 : isComparing ? 1.05 : 1
                        }}
                        transition={{
                          height: { duration: 0.3, ease: 'easeOut' },
                          boxShadow: { duration: 0.2 },
                          scale: { duration: 0.2, type: 'spring' },
                          layout: { duration: 0.4, ease: 'easeInOut' }
                        }}
                        className="relative rounded-t-lg"
                        style={{
                          backgroundColor: barColor,
                          width: `${Math.max(100 / arraySize[0], 8)}px`,
                          minWidth: '4px',
                          border: `2px solid ${barColor}`,
                          filter: isSorted ? 'brightness(1.2)' : 'brightness(1)'
                        }}
                      >
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              background: `linear-gradient(180deg, ${barColor}00 0%, ${barColor} 100%)`
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                        )}
                        
                        {arraySize[0] <= 30 && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                            style={{ color: barColor }}
                            animate={{
                              textShadow: isComparing || isSwapping
                                ? `0 0 10px ${barColor}`
                                : 'none'
                            }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                        
                        {isComparing && (
                          <motion.div
                            className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 10, opacity: 0 }}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: barColor,
                                boxShadow: `0 0 15px ${barColor}`
                              }}
                            />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })
                ) : array.length > 0 ? (
                  array.map((element, index) => {
                    const barColor = NEON_COLORS[index % NEON_COLORS.length];
                    const maxHeight = 500;
                    const barHeight = (element.value / 100) * maxHeight;
                    
                    return (
                      <motion.div
                        key={element.id}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: barHeight,
                          opacity: 1,
                          boxShadow: `0 0 15px ${barColor}`
                        }}
                        transition={{
                          height: { duration: 0.5, ease: 'easeOut' },
                          opacity: { duration: 0.3 }
                        }}
                        className="relative rounded-t-lg"
                        style={{
                          backgroundColor: barColor,
                          width: `${Math.max(100 / arraySize[0], 8)}px`,
                          minWidth: '4px',
                          border: `2px solid ${barColor}`
                        }}
                      >
                        {arraySize[0] <= 30 && (
                          <div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                            style={{ color: barColor }}
                          >
                            {element.value}
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{
                          textShadow: [
                            '0 0 20px rgba(0, 255, 255, 0.5)',
                            '0 0 40px rgba(255, 0, 255, 0.5)',
                            '0 0 20px rgba(0, 255, 255, 0.5)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-2xl font-bold text-cyan-400"
                      >
                        Generate an array to begin
                      </motion.div>
                      <div className="text-gray-500">Click GENERATE to create a random array</div>
                    </div>
                  </motion.div>
                )}</parameter>
</invoke>
              </div>
            </div>

                        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-2xl shadow-purple-500/20"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-bold text-sm tracking-wider">SORTING PROGRESS</span>
                  </div>
                  <motion.span
                    key={currentStep}
                    initial={{ scale: 1.2, color: '#a78bfa' }}
                    animate={{ scale: 1, color: '#c084fc' }}
                    className="text-purple-300 font-bold text-lg"
                  >
                    {steps.length > 0 ? Math.round((currentStep / Math.max(steps.length - 1, 1)) * 100) : 0}%
                  </motion.span>
                </div>
                
                <div className="relative h-4 bg-gray-800/50 rounded-full overflow-hidden border border-purple-500/30">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: steps.length > 0 ? `${(currentStep / Math.max(steps.length - 1, 1)) * 100}%` : '0%'
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                  
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(168, 85, 247, 0.4)',
                        '0 0 20px rgba(168, 85, 247, 0.6)',
                        '0 0 10px rgba(168, 85, 247, 0.4)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Step {currentStep}</span>
                  <span>Total {steps.length > 0 ? steps.length - 1 : 0}</span>
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
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-purple-400 font-bold text-lg tracking-wider">LEGEND</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(34, 211, 238, 0.5)',
                    '0 0 20px rgba(34, 211, 238, 0.8)',
                    '0 0 10px rgba(34, 211, 238, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-white font-semibold text-sm">Default</div>
                <div className="text-gray-400 text-xs">Unsorted</div>
              </div>
            </motion.div>

            {/* Comparing State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-6 rounded-md bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(234, 179, 8, 0.6)',
                    '0 0 30px rgba(234, 179, 8, 1)',
                    '0 0 15px rgba(234, 179, 8, 0.6)'
                  ],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-yellow-300 font-semibold text-sm">Comparing</div>
                <div className="text-gray-400 text-xs">Active check</div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-pink-500/30 hover:border-pink-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-500 to-red-500 shadow-lg"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(236, 72, 153, 0.6)',
                    '0 0 30px rgba(236, 72, 153, 1)',
                    '0 0 15px rgba(236, 72, 153, 0.6)'
                  ],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div>
                <div className="text-pink-300 font-semibold text-sm">Swapping</div>
                <div className="text-gray-400 text-xs">Exchanging</div>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-6 rounded-md bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(34, 197, 94, 0.6)',
                    '0 0 25px rgba(34, 197, 94, 0.9)',
                    '0 0 15px rgba(34, 197, 94, 0.6)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-green-300 font-semibold text-sm">Sorted</div>
                <div className="text-gray-400 text-xs">Complete</div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 pt-4 border-t border-gray-700/50"
          >
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Watch the bars glow as they compare and swap
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}