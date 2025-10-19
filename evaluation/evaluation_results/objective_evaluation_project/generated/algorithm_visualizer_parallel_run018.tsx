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

  useEffect(() => {
    if (!isPlaying) return;

    const delay = 1000 - (speed[0] * 9.5);
    const timer = setTimeout(() => {
      animateSteps();
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, speed, animateSteps]);

  const animateSteps = useCallback(() => {
    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const step = steps[currentStep];
    setArray(step.array);
    setCurrentStep(prev => prev + 1);
  }, [currentStep, steps]);

  const startVisualization = useCallback(() => {
    
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {

    /* TODO:PauseAnimation Set isPlaying false, preserve current step */
  }, []);
  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  useEffect(() => {
    if (!isPlaying) return;

    const delay = 1000 - (speed[0] * 9);
    const timer = setTimeout(() => {
      animateSteps();
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, animateSteps, speed]);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    const localArray = [...array];
    const allSteps: AlgorithmStep[] = [];
    
    // Helper to create a step snapshot
    const createStep = (arr: ArrayElement[], comparing: number[] = [], swapping: number[] = [], sorted: number[] = []) => {
      allSteps.push({
        array: arr.map(el => ({ ...el })),
        comparingIndices: [...comparing],
        swappingIndices: [...swapping],
        sortedIndices: [...sorted]
      });
    };

    // Initial state
    createStep(localArray);

    switch (algorithm) {
      case 'bubble': {
        const sortedIndices: number[] = [];
        for (let i = 0; i < localArray.length - 1; i++) {
          for (let j = 0; j < localArray.length - i - 1; j++) {
            // Comparing
            createStep(localArray, [j, j + 1], [], sortedIndices);
            
            if (localArray[j].value > localArray[j + 1].value) {
              // Swapping
              createStep(localArray, [], [j, j + 1], sortedIndices);
              [localArray[j], localArray[j + 1]] = [localArray[j + 1], localArray[j]];
              createStep(localArray, [], [], sortedIndices);
            }
          }
          sortedIndices.push(localArray.length - i - 1);
          createStep(localArray, [], [], sortedIndices);
        }
        sortedIndices.push(0);
        createStep(localArray, [], [], sortedIndices);
        break;
      }

      case 'insertion': {
        const sortedIndices: number[] = [0];
        createStep(localArray, [], [], sortedIndices);
        
        for (let i = 1; i < localArray.length; i++) {
          const key = localArray[i];
          let j = i - 1;
          
          createStep(localArray, [i], [], sortedIndices);
          
          while (j >= 0 && localArray[j].value > key.value) {
            createStep(localArray, [j, j + 1], [], sortedIndices);
            createStep(localArray, [], [j, j + 1], sortedIndices);
            localArray[j + 1] = localArray[j];
            createStep(localArray, [], [], sortedIndices);
            j--;
          }
          
          localArray[j + 1] = key;
          sortedIndices.push(i);
          createStep(localArray, [], [], sortedIndices);
        }
        break;
      }

      case 'quick': {
        const sortedIndices: number[] = [];
        
        const partition = (low: number, high: number): number => {
          const pivot = localArray[high].value;
          let i = low - 1;
          
          createStep(localArray, [high], [], sortedIndices);
          
          for (let j = low; j < high; j++) {
            createStep(localArray, [j, high], [], sortedIndices);
            
            if (localArray[j].value < pivot) {
              i++;
              if (i !== j) {
                createStep(localArray, [], [i, j], sortedIndices);
                [localArray[i], localArray[j]] = [localArray[j], localArray[i]];
                createStep(localArray, [], [], sortedIndices);
              }
            }
          }
          
          createStep(localArray, [], [i + 1, high], sortedIndices);
          [localArray[i + 1], localArray[high]] = [localArray[high], localArray[i + 1]];
          sortedIndices.push(i + 1);
          createStep(localArray, [], [], sortedIndices);
          
          return i + 1;
        };
        
        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
          } else if (low === high) {
            sortedIndices.push(low);
            createStep(localArray, [], [], sortedIndices);
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
            createStep(localArray, [left + i, mid + 1 + j], [], sortedIndices);
            
            if (leftArr[i].value <= rightArr[j].value) {
              createStep(localArray, [], [k], sortedIndices);
              localArray[k] = leftArr[i];
              i++;
            } else {
              createStep(localArray, [], [k], sortedIndices);
              localArray[k] = rightArr[j];
              j++;
            }
            k++;
            createStep(localArray, [], [], sortedIndices);
          }
          
          while (i < leftArr.length) {
            createStep(localArray, [], [k], sortedIndices);
            localArray[k] = leftArr[i];
            i++;
            k++;
            createStep(localArray, [], [], sortedIndices);
          }
          
          while (j < rightArr.length) {
            createStep(localArray, [], [k], sortedIndices);
            localArray[k] = rightArr[j];
            j++;
            k++;
            createStep(localArray, [], [], sortedIndices);
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
        
        for (let i = 0; i < localArray.length; i++) {
          sortedIndices.push(i);
        }
        createStep(localArray, [], [], sortedIndices);
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
              transition={{ duration: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-cyan-400 tracking-wider">ALGORITHM</h3>
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
                            : 'bg-gray-700/30 border-gray-600/50 hover:border-cyan-500/50'
                        }`}
                      >
                        <div className="font-semibold text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-purple-400 tracking-wider">SPEED</label>
                    <span className="text-cyan-400 font-mono text-sm">{speed[0]}%</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={100}
                    step={10}
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-purple-400 tracking-wider">ARRAY SIZE</label>
                    <span className="text-cyan-400 font-mono text-sm">{arraySize[0]}</span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={5}
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || currentStep >= steps.length}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300 border border-cyan-400/50"
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
                    className="w-full bg-gray-700/30 hover:bg-gray-600/50 text-purple-400 hover:text-purple-300 font-bold py-6 rounded-lg border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    RESET
                  </Button>

                  <Button
                    onClick={() => generateSortingSteps(selectedAlgorithm)}
                    disabled={isPlaying || array.length === 0}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-6 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all duration-300 border border-purple-400/50"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    GENERATE
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-400 font-mono">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Array Length:</span>
                    <span className="text-cyan-400 font-mono">{array.length}</span>
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
                  <div className="grid grid-cols-2 gap-3">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`relative p-3 rounded-lg border transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/50'
                            : 'bg-gray-700/30 border-gray-600 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-left">
                          <div className={`text-sm font-semibold ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-300'
                          }`}>
                            {algo.name}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {algo.complexity}
                          </div>
                        </div>
                        {selectedAlgorithm === algo.id && (
                          <motion.div
                            className="absolute inset-0 rounded-lg bg-cyan-500/10"
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
                      <span className="text-gray-300 text-sm">Elements</span>
                      <motion.span 
                        key={arraySize[0]}
                        initial={{ scale: 1.3, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-white font-bold text-lg px-3 py-1 bg-cyan-500/20 rounded-lg border border-cyan-400/50 shadow-lg shadow-cyan-500/30"
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
                        className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:hover:shadow-cyan-400/80 [&_[role=slider]]:transition-shadow [&>span]:bg-cyan-500/30"
                      />
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="h-full w-full bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 rounded-full blur-sm" />
                      </div>
                    </div>
                  </div></parameter>
</invoke>
                </div>

                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0}
                    className="w-full relative group overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                      array.length === 0
                        ? 'bg-gray-700/30 border-gray-600/50 cursor-not-allowed opacity-50'
                        : isPlaying
                        ? 'bg-yellow-500/20 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.6)]'
                        : 'bg-green-500/20 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:shadow-[0_0_50px_rgba(34,197,94,0.8)]'
                    }`}>
                      <div className="flex items-center justify-center gap-3">
                        <motion.div
                          animate={isPlaying ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0]
                          } : {
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            duration: isPlaying ? 0.6 : 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                          ) : (
                            <Play className="w-6 h-6 text-green-300 fill-green-300" />
                          )}
                        </motion.div>
                        <span className={`text-lg font-bold tracking-wider ${
                          isPlaying ? 'text-yellow-300' : 'text-green-300'
                        }`}>
                          {isPlaying ? 'PAUSE' : 'START'}
                        </span>
                      </div>
                      
                      {/* Animated glow pulse */}
                      {!isPlaying && array.length > 0 && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/0 via-green-400/30 to-green-400/0"
                          animate={{
                            x: ['-100%', '100%']
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      )}
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={resetVisualization}
                    className="w-full relative group overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative p-4 rounded-xl border-2 bg-purple-500/20 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] transition-all duration-300">
                      <div className="flex items-center justify-center gap-3">
                        <motion.div
                          whileHover={{
                            rotate: -360
                          }}
                          transition={{
                            duration: 0.6,
                            ease: "easeInOut"
                          }}
                        >
                          <RotateCcw className="w-6 h-6 text-purple-300" />
                        </motion.div>
                        <span className="text-lg font-bold tracking-wider text-purple-300">
                          RESET
                        </span>
                      </div>
                      
                      {/* Hover glow effect */}
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-purple-400/0 group-hover:bg-purple-400/10 transition-all duration-300"
                      />
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={generateRandomArray}
                    className="w-full relative group overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative p-4 rounded-xl border-2 bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:shadow-[0_0_50px_rgba(6,182,212,0.8)] transition-all duration-300">
                      <div className="flex items-center justify-center gap-3">
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <BarChart3 className="w-6 h-6 text-cyan-300" />
                        </motion.div>
                        <span className="text-lg font-bold tracking-wider text-cyan-300">
                          NEW ARRAY
                        </span>
                      </div>
                      
                      {/* Animated sparkle effect */}
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.3) 0%, transparent 70%)'
                        }}
                        animate={{
                          scale: [0.8, 1.2, 0.8],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                  </motion.button>
</parameter>
</invoke>
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
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-purple-400 tracking-wider">STATISTICS</h3>
                </div>

                <div className="space-y-4">
                  {/* Comparisons Counter */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-400 tracking-wider">COMPARISONS</span>
                      <motion.div
                        key={currentStep}
                        initial={{ scale: 1.3, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#06b6d4' }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl font-bold text-cyan-400 font-mono"
                      >
                        {steps.length > 0 ? currentStep : 0}
                      </motion.div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Swaps Counter */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-pink-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-400 tracking-wider">SWAPS</span>
                      <motion.div
                        key={steps.filter((step, idx) => idx <= currentStep && step.swappingIndices.length > 0).length}
                        initial={{ scale: 1.3, color: '#ff0066' }}
                        animate={{ scale: 1, color: '#ec4899' }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl font-bold text-pink-400 font-mono"
                      >
                        {steps.filter((step, idx) => idx <= currentStep && step.swappingIndices.length > 0).length}
                      </motion.div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                      <span>Active operations</span>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-400 tracking-wider">PROGRESS</span>
                      <motion.div
                        key={steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}
                        initial={{ scale: 1.3, color: '#a855f7' }}
                        animate={{ scale: 1, color: '#9333ea' }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl font-bold text-purple-400 font-mono"
                      >
                        {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                      </motion.div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Step {currentStep} / {steps.length}</span>
                        <span className={`font-semibold ${
                          currentStep >= steps.length && steps.length > 0
                            ? 'text-green-400'
                            : 'text-gray-400'
                        }`}>
                          {currentStep >= steps.length && steps.length > 0 ? '✓ Complete' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Array Info */}
                  <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">ELEMENTS</div>
                        <div className="text-lg font-bold text-cyan-400 font-mono">{array.length}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">SORTED</div>
                        <div className="text-lg font-bold text-green-400 font-mono">
                          {array.filter(el => el.isSorted).length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <motion.div
                    className={`rounded-lg p-3 border text-center transition-all duration-300 ${
                      isPlaying
                        ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                        : steps.length > 0 && currentStep >= steps.length
                        ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                        : 'bg-gray-700/30 border-gray-600/50'
                    }`}
                    animate={{
                      boxShadow: isPlaying
                        ? [
                            '0 0 20px rgba(34,197,94,0.3)',
                            '0 0 30px rgba(34,197,94,0.6)',
                            '0 0 20px rgba(34,197,94,0.3)'
                          ]
                        : '0 0 20px rgba(168,85,247,0.3)'
                    }}
                    transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${
                          isPlaying
                            ? 'bg-green-400'
                            : steps.length > 0 && currentStep >= steps.length
                            ? 'bg-purple-400'
                            : 'bg-gray-500'
                        }`}
                        animate={{
                          scale: isPlaying ? [1, 1.5, 1] : 1,
                          opacity: isPlaying ? [1, 0.5, 1] : 1
                        }}
                        transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
                      />
                      <span className={`text-sm font-semibold tracking-wider ${
                        isPlaying
                          ? 'text-green-400'
                          : steps.length > 0 && currentStep >= steps.length
                          ? 'text-purple-400'
                          : 'text-gray-400'
                      }`}>
                        {isPlaying
                          ? 'RUNNING'
                          : steps.length > 0 && currentStep >= steps.length
                          ? 'COMPLETED'
                          : 'READY'}
                      </span>
                    </div>
                  </motion.div>
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
                    <BarChart3 className="w-24 h-24 text-cyan-400/50" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-cyan-400">Ready to Visualize</h3>
                    <p className="text-gray-400">Click "Generate Array" to begin</p>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const maxValue = Math.max(...array.map(e => e.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    const colorIndex = index % NEON_COLORS.length;
                    const baseColor = NEON_COLORS[colorIndex];
                    
                    const isComparing = element.isComparing;
                    const isSwapping = element.isSwapping;
                    const isSorted = element.isSorted;

                    let barColor = baseColor;
                    let glowIntensity = '0.3';
                    let scale = 1;

                    if (isSorted) {
                      barColor = '#00ff00';
                      glowIntensity = '0.6';
                    } else if (isSwapping) {
                      barColor = '#ff0066';
                      glowIntensity = '0.8';
                      scale = 1.1;
                    } else if (isComparing) {
                      barColor = '#ffff00';
                      glowIntensity = '0.7';
                      scale = 1.05;
                    }

                    return (
                      <motion.div
                        key={element.id}
                        layout
                        initial={{ opacity: 0, y: 50 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          height: `${heightPercentage}%`,
                          scale: scale,
                          backgroundColor: barColor,
                          boxShadow: [
                            `0 0 20px ${barColor}${Math.floor(parseFloat(glowIntensity) * 255).toString(16).padStart(2, '0')}`,
                            `0 0 40px ${barColor}${Math.floor(parseFloat(glowIntensity) * 255).toString(16).padStart(2, '0')}`,
                            `0 0 20px ${barColor}${Math.floor(parseFloat(glowIntensity) * 255).toString(16).padStart(2, '0')}`
                          ]
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          layout: { duration: 0.3, type: "spring" },
                          height: { duration: 0.4, ease: "easeOut" },
                          scale: { duration: 0.2 },
                          backgroundColor: { duration: 0.3 },
                          boxShadow: { duration: 1, repeat: isSwapping || isComparing ? Infinity : 0 }
                        }}
                        className="relative rounded-t-lg min-w-[8px] flex-1 max-w-[60px]"
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `0 0 20px ${barColor}${Math.floor(parseFloat(glowIntensity) * 255).toString(16).padStart(2, '0')}, 0 -5px 30px ${barColor}40 inset`
                        }}
                      >
                        {/* Value label */}
                        {array.length <= 20 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-gray-900/80 px-2 py-1 rounded backdrop-blur-sm border border-gray-700/50"
                          >
                            {element.value}
                          </motion.div>
                        )}

                        {/* Trail effect for swapping */}
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              background: `linear-gradient(to top, ${barColor}, transparent)`
                            }}
                            animate={{
                              opacity: [0.8, 0, 0.8],
                              scale: [1, 1.3, 1]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity
                            }}
                          />
                        )}

                        {/* Pulse effect for comparing */}
                        {isComparing && (
                          <motion.div
                            className="absolute -inset-1 rounded-t-lg border-2"
                            style={{
                              borderColor: barColor
                            }}
                            animate={{
                              opacity: [1, 0.3, 1],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity
                            }}
                          />
                        )}

                        {/* Sorted checkmark */}
                        {isSorted && array.length <= 30 && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                          >
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <BarChart3 className="w-24 h-24 text-cyan-400/30 mx-auto" />
                      </motion.div>
                      <p className="text-gray-400 text-lg">Generate an array to begin</p>
                    </div>
                  </motion.div>
                ) : (
                  array.map((element, index) => {
                    const heightPercentage = (element.value / 100) * 100;
                    const colorIndex = index % NEON_COLORS.length;
                    const neonColor = NEON_COLORS[colorIndex];
                    
                    const isComparing = element.isComparing;
                    const isSwapping = element.isSwapping;
                    const isSorted = element.isSorted;

                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[8px] max-w-[60px] group"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: isSwapping ? [1, 1.1, 1] : 1
                        }}
                        transition={{
                          opacity: { duration: 0.3 },
                          y: { duration: 0.5, delay: index * 0.02 },
                          scale: { duration: 0.3 }
                        }}
                      >
                        {/* Trail effect for swapping */}
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              background: `linear-gradient(to top, transparent, ${neonColor}40)`,
                              filter: 'blur(8px)'
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              scale: [0.8, 1.2, 1.5],
                              y: [-20, -40, -60]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: "easeOut"
                            }}
                          />
                        )}

                        {/* Main bar */}
                        <motion.div
                          className="relative w-full rounded-t-lg transition-all duration-300"
                          style={{
                            height: `${heightPercentage}%`,
                            minHeight: '20px',
                            background: isSorted 
                              ? `linear-gradient(to top, #00ff00, #00ff00dd)`
                              : isComparing
                              ? `linear-gradient(to top, #ff0066, #ff0066dd)`
                              : isSwapping
                              ? `linear-gradient(to top, #ffff00, #ffff00dd)`
                              : `linear-gradient(to top, ${neonColor}, ${neonColor}dd)`,
                            boxShadow: isSorted
                              ? '0 0 20px #00ff00, 0 0 40px #00ff0080, inset 0 0 20px #00ff0040'
                              : isComparing
                              ? '0 0 30px #ff0066, 0 0 60px #ff006680, inset 0 0 20px #ff006640'
                              : isSwapping
                              ? '0 0 30px #ffff00, 0 0 60px #ffff0080, inset 0 0 20px #ffff0040'
                              : `0 0 15px ${neonColor}, 0 0 30px ${neonColor}80, inset 0 0 15px ${neonColor}40`
                          }}
                          animate={{
                            height: `${heightPercentage}%`,
                            boxShadow: isComparing
                              ? [
                                  '0 0 30px #ff0066, 0 0 60px #ff006680, inset 0 0 20px #ff006640',
                                  '0 0 50px #ff0066, 0 0 80px #ff006680, inset 0 0 30px #ff006640',
                                  '0 0 30px #ff0066, 0 0 60px #ff006680, inset 0 0 20px #ff006640'
                                ]
                              : isSwapping
                              ? [
                                  '0 0 30px #ffff00, 0 0 60px #ffff0080, inset 0 0 20px #ffff0040',
                                  '0 0 50px #ffff00, 0 0 80px #ffff0080, inset 0 0 30px #ffff0040',
                                  '0 0 30px #ffff00, 0 0 60px #ffff0080, inset 0 0 20px #ffff0040'
                                ]
                              : isSorted
                              ? '0 0 20px #00ff00, 0 0 40px #00ff0080, inset 0 0 20px #00ff0040'
                              : `0 0 15px ${neonColor}, 0 0 30px ${neonColor}80, inset 0 0 15px ${neonColor}40`
                          }}
                          transition={{
                            height: { duration: 0.5, ease: "easeInOut" },
                            boxShadow: { duration: 0.5, repeat: (isComparing || isSwapping) ? Infinity : 0 }
                          }}
                        >
                          {/* Glossy overlay */}
                          <div className="absolute inset-0 rounded-t-lg bg-gradient-to-b from-white/30 via-transparent to-transparent" />
                          
                          {/* Scanning line effect */}
                          {(isComparing || isSwapping) && (
                            <motion.div
                              className="absolute inset-x-0 h-[2px] bg-white"
                              style={{
                                boxShadow: '0 0 10px #ffffff, 0 0 20px #ffffff'
                              }}
                              animate={{
                                top: ['0%', '100%']
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            />
                          )}

                          {/* Value label */}
                          <motion.div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            initial={{ y: 10 }}
                            whileHover={{ y: 0 }}
                          >
                            <div 
                              className="px-2 py-1 rounded text-xs font-bold text-white whitespace-nowrap"
                              style={{
                                background: `linear-gradient(135deg, ${neonColor}, ${neonColor}cc)`,
                                boxShadow: `0 0 10px ${neonColor}80`
                              }}
                            >
                              {element.value}
                            </div>
                          </motion.div>
                        </motion.div>

                        {/* Base glow */}
                        <motion.div
                          className="absolute -bottom-1 left-0 right-0 h-2 rounded-full blur-sm"
                          style={{
                            background: isSorted 
                              ? '#00ff00'
                              : isComparing
                              ? '#ff0066'
                              : isSwapping
                              ? '#ffff00'
                              : neonColor,
                            opacity: 0.6
                          }}
                          animate={{
                            opacity: (isComparing || isSwapping) ? [0.6, 1, 0.6] : 0.6
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: (isComparing || isSwapping) ? Infinity : 0
                          }}
                        />

                        {/* Particle effects for sorted elements */}
                        {isSorted && (
                          <>
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={`particle-${i}`}
                                className="absolute w-1 h-1 rounded-full bg-green-400"
                                style={{
                                  left: '50%',
                                  top: '0%',
                                  boxShadow: '0 0 5px #00ff00'
                                }}
                                initial={{ opacity: 0, y: 0, x: 0 }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  y: [-30, -60],
                                  x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40]
                                }}
                                transition={{
                                  duration: 1.5,
                                  delay: i * 0.2,
                                  repeat: Infinity,
                                  repeatDelay: 1
                                }}
                              />
                            ))}
                          </>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-purple-400 tracking-wider">BAR STATES</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Default State */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50 hover:border-gray-500/70 transition-all duration-300"
                >
                  <motion.div
                    className="w-4 h-8 rounded bg-gradient-to-t from-cyan-500 to-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(0,255,255,0.5)',
                        '0 0 20px rgba(0,255,255,0.8)',
                        '0 0 10px rgba(0,255,255,0.5)'
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
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50 hover:border-yellow-500/50 transition-all duration-300"
                >
                  <motion.div
                    className="w-4 h-8 rounded bg-gradient-to-t from-yellow-500 to-yellow-300 shadow-[0_0_10px_rgba(255,255,0,0.5)]"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(255,255,0,0.5)',
                        '0 0 25px rgba(255,255,0,1)',
                        '0 0 10px rgba(255,255,0,0.5)'
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

                {/* Swapping State */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50 hover:border-pink-500/50 transition-all duration-300"
                >
                  <motion.div
                    className="w-4 h-8 rounded bg-gradient-to-t from-pink-500 to-pink-300 shadow-[0_0_10px_rgba(255,0,102,0.5)]"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(255,0,102,0.5)',
                        '0 0 30px rgba(255,0,102,1)',
                        '0 0 10px rgba(255,0,102,0.5)'
                      ],
                      x: [-2, 2, -2]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
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
                  transition={{ delay: 0.7, type: 'spring' }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50 hover:border-green-500/50 transition-all duration-300"
                >
                  <motion.div
                    className="w-4 h-8 rounded bg-gradient-to-t from-green-500 to-green-300 shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(0,255,0,0.5)',
                        '0 0 20px rgba(0,255,0,0.8)',
                        '0 0 10px rgba(0,255,0,0.5)'
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
                transition={{ delay: 0.8 }}
                className="mt-4 pt-4 border-t border-gray-700/50"
              >
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-cyan-400"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span>Bars pulse and glow during operations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-purple-400" />
                    <span>Real-time visual feedback</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-cyan-400 tracking-wider flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                TIMELINE
              </h3>
              <div className="text-sm text-gray-400">
                Step <span className="text-cyan-400 font-mono font-bold">{currentStep}</span> of <span className="text-purple-400 font-mono font-bold">{steps.length}</span>
              </div>
            </div>

            {steps.length > 0 && (
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden border border-gray-600/50">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.6)]"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(currentStep / steps.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>

                {/* Timeline Scrubber */}
                <div className="relative pt-2 pb-1">
                  <input
                    type="range"
                    min={0}
                    max={steps.length}
                    value={currentStep}
                    onChange={(e) => {
                      const newStep = parseInt(e.target.value);
                      setCurrentStep(newStep);
                      if (newStep < steps.length) {
                        setArray(steps[newStep].array);
                      }
                      setIsPlaying(false);
                    }}
                    disabled={steps.length === 0}
                    className="w-full h-2 bg-transparent appearance-none cursor-pointer disabled:cursor-not-allowed
                      [&::-webkit-slider-track]:h-2 [&::-webkit-slider-track]:bg-gray-700/50 [&::-webkit-slider-track]:rounded-full [&::-webkit-slider-track]:border [&::-webkit-slider-track]:border-gray-600/50
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-cyan-400 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(0,255,255,0.8)] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                      [&::-moz-range-track]:h-2 [&::-moz-range-track]:bg-gray-700/50 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:border [&::-moz-range-track]:border-gray-600/50
                      [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-cyan-400 [&::-moz-range-thumb]:to-purple-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-[0_0_20px_rgba(0,255,255,0.8)] [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:transition-transform"
                  />
                </div>

                {/* Step Markers */}
                <div className="flex justify-between items-center text-xs">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentStep(0);
                      setArray(steps[0].array);
                      setIsPlaying(false);
                    }}
                    disabled={currentStep === 0 || steps.length === 0}
                    className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/30 disabled:text-gray-600 text-cyan-400 rounded-lg border border-cyan-500/30 hover:border-cyan-400/50 disabled:border-gray-700/30 transition-all duration-200 font-semibold disabled:cursor-not-allowed"
                  >
                    START
                  </motion.button>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (currentStep > 0) {
                          const newStep = currentStep - 1;
                          setCurrentStep(newStep);
                          setArray(steps[newStep].array);
                          setIsPlaying(false);
                        }
                      }}
                      disabled={currentStep === 0 || steps.length === 0}
                      className="px-3 py-1.5 bg-purple-700/30 hover:bg-purple-600/40 disabled:bg-gray-800/30 disabled:text-gray-600 text-purple-300 rounded-lg border border-purple-500/30 hover:border-purple-400/50 disabled:border-gray-700/30 transition-all duration-200 font-semibold disabled:cursor-not-allowed"
                    >
                      ← PREV
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (currentStep < steps.length) {
                          const newStep = currentStep + 1;
                          setCurrentStep(newStep);
                          if (newStep < steps.length) {
                            setArray(steps[newStep].array);
                          }
                          setIsPlaying(false);
                        }
                      }}
                      disabled={currentStep >= steps.length || steps.length === 0}
                      className="px-3 py-1.5 bg-purple-700/30 hover:bg-purple-600/40 disabled:bg-gray-800/30 disabled:text-gray-600 text-purple-300 rounded-lg border border-purple-500/30 hover:border-purple-400/50 disabled:border-gray-700/30 transition-all duration-200 font-semibold disabled:cursor-not-allowed"
                    >
                      NEXT →
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentStep(steps.length);
                      setArray(steps[steps.length - 1].array);
                      setIsPlaying(false);
                    }}
                    disabled={currentStep >= steps.length || steps.length === 0}
                    className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/30 disabled:text-gray-600 text-cyan-400 rounded-lg border border-cyan-500/30 hover:border-cyan-400/50 disabled:border-gray-700/30 transition-all duration-200 font-semibold disabled:cursor-not-allowed"
                  >
                    END
                  </motion.button>
                </div>

                {/* Percentage Display */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                  <motion.div
                    key={currentStep}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-4 py-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                  >
                    <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                      {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}% Complete
                    </span>
                  </motion.div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                </div>
              </div>
            )}

            {steps.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Generate sorting steps to see timeline</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}