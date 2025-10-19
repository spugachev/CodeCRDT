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

  // Animation effect for step-by-step visualization
  const animateSteps = useCallback(() => {
    if (currentStep < steps.length && isPlaying) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 - speed[0] * 9); // Convert speed slider (0-100) to delay (1000ms-100ms)
      
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentStep, steps.length, isPlaying, speed]);

  // Run animation effect
  React.useEffect(() => {
    const cleanup = animateSteps();
    return cleanup;
  }, [animateSteps]);
  const startVisualization = useCallback(() => {
    if (steps.length === 0) return;
    setIsPlaying(true);
    if (currentStep >= steps.length) {
      setCurrentStep(0);
    }
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
          
          if (left === 0 && right === sortedArray.length - 1) {
            for (let idx = left; idx <= right; idx++) {
              sortedSet.add(idx);
            }
          }
          addStep(sortedArray, [], [], Array.from(sortedSet));
        };

        const mergeSort = (left: number, right: number) => {
          if (left < right) {
            const mid = Math.floor((left + right) / 2);
            mergeSort(left, mid);
            mergeSort(mid + 1, right);
            merge(left, mid, right);
          } else if (left === right && sortedArray.length === 1) {
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
              className="px-6 py-2 bg-purple-500/20 border border-purple-400/50 rounded-lg backdrop-blur-sm"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' }}
            >
              <span className="text-2xl font-semibold text-purple-300">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name || 'Select Algorithm'}
              </span>
            </motion.div>
            <motion.div
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 rounded-full backdrop-blur-sm"
              animate={{
                boxShadow: [
                  '0 0 10px rgba(0, 255, 255, 0.3)',
                  '0 0 20px rgba(0, 255, 255, 0.6)',
                  '0 0 10px rgba(0, 255, 255, 0.3)'
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-lg font-mono text-cyan-300">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity || 'O(?)'}
              </span>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-all duration-300"
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
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50'
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
                    <label className="text-cyan-400 font-semibold tracking-wide">SPEED</label>
                    <span className="text-white font-mono bg-cyan-500/20 px-3 py-1 rounded-full text-sm border border-cyan-500/30">
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
                    disabled={isPlaying}
                  />
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-cyan-400 font-semibold tracking-wide">SIZE</label>
                    <span className="text-white font-mono bg-purple-500/20 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                      {arraySize[0]}
                    </span>
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
                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || currentStep >= steps.length}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-6 rounded-lg shadow-[0_0_20px_rgba(255,0,255,0.5)] hover:shadow-[0_0_30px_rgba(255,0,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    RESET
                  </Button>

                  <Button
                    onClick={() => {
                      generateRandomArray();
                      generateSortingSteps(selectedAlgorithm);
                    }}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,170,0.5)] hover:shadow-[0_0_30px_rgba(0,255,170,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    GENERATE
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-cyan-500/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Current Step:</span>
                    <span className="text-cyan-400 font-mono font-bold">
                      {currentStep} / {steps.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Array Length:</span>
                    <span className="text-purple-400 font-mono font-bold">{array.length}</span>
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
                            className="absolute inset-0 rounded-lg bg-cyan-500/10"
                            layoutId="algorithmSelector"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div></parameter>
</invoke>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-cyan-400">Array Size</label>
                    <span className="text-xs text-cyan-300 font-mono">{arraySize[0]}</span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-purple-400">Speed</label>
                    <span className="text-xs text-purple-300 font-mono">{speed[0]}ms</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={200}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Play</span>
                        </>
                      )}
                    </motion.div>
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 font-semibold py-6 rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-400/50 transition-all duration-300"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      whileHover={{ rotate: -180 }}
                      transition={{ duration: 0.5 }}
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Reset</span>
                    </motion.div>
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-2xl shadow-purple-500/20">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-purple-300">Statistics</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cyan-400">Comparisons</span>
                    <motion.span 
                      key={steps[currentStep]?.comparingIndices.length || 0}
                      initial={{ scale: 1.5, color: '#00ffff' }}
                      animate={{ scale: 1, color: '#67e8f9' }}
                      className="text-2xl font-bold font-mono text-cyan-300"
                    >
                      {currentStep > 0 ? currentStep : 0}
                    </motion.span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${steps.length > 0 ? (currentStep / steps.length) * 100 : 0}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-400">Swaps</span>
                    <motion.span 
                      key={steps[currentStep]?.swappingIndices.length || 0}
                      initial={{ scale: 1.5, color: '#ff00ff' }}
                      animate={{ scale: 1, color: '#e879f9' }}
                      className="text-2xl font-bold font-mono text-purple-300"
                    >
                      {steps.slice(0, currentStep).filter(s => s.swappingIndices.length > 0).length}
                    </motion.span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${steps.length > 0 ? (steps.slice(0, currentStep).filter(s => s.swappingIndices.length > 0).length / steps.length) * 100 : 0}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-400">Progress</span>
                    <motion.span 
                      key={currentStep}
                      initial={{ scale: 1.5, color: '#00ff00' }}
                      animate={{ scale: 1, color: '#86efac' }}
                      className="text-2xl font-bold font-mono text-green-300"
                    >
                      {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                    </motion.span>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${steps.length > 0 ? (currentStep / steps.length) * 100 : 0}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-400">Sorted Elements</span>
                    <span className="text-2xl font-bold font-mono text-yellow-300">
                      {steps[currentStep]?.sortedIndices.length || 0} / {array.length}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4 border border-cyan-500/30">
                  <div className="text-xs text-cyan-300 mb-1">Algorithm</div>
                  <div className="text-lg font-bold text-white">
                    {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name}
                  </div>
                  <div className="text-xs text-purple-400 mt-1 font-mono">
                    {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-8 shadow-2xl shadow-purple-500/20 min-h-[600px]">
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
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative"
                  >
                    <BarChart3 className="w-24 h-24 text-cyan-400" />
                    <motion.div
                      className="absolute inset-0 blur-xl bg-cyan-400/30 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-cyan-300">Ready to Visualize</h3>
                    <p className="text-gray-400">Generate an array to begin</p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {/* Comparison Indicators */}
                  {steps.length > 0 && currentStep < steps.length && steps[currentStep].comparingIndices.length > 0 && (
                    <>
                      {steps[currentStep].comparingIndices.map((index, i) => {
                        const barWidth = 100 / array.length;
                        const leftPosition = index * barWidth + barWidth / 2;
                        
                        return (
                          <motion.div
                            key={`compare-${index}-${i}`}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ 
                              opacity: [0.5, 1, 0.5],
                              y: 0,
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              duration: 0.6,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                            className="absolute top-0 pointer-events-none z-20"
                            style={{
                              left: `${leftPosition}%`,
                              transform: 'translateX(-50%)'
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
                                transition={{ duration: 0.8, repeat: Infinity }}
                              />
                              <motion.div
                                className="w-0.5 h-8 bg-gradient-to-b from-yellow-400 to-transparent"
                                animate={{
                                  opacity: [0.6, 1, 0.6]
                                }}
                                transition={{ duration: 0.8, repeat: Infinity }}
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
                        const barWidth = 100 / array.length;
                        const leftPosition = index * barWidth + barWidth / 2;
                        
                        return (
                          <motion.div
                            key={`swap-${index}-${i}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              scale: [0, 2, 3],
                            }}
                            transition={{ 
                              duration: 1,
                              ease: "easeOut"
                            }}
                            className="absolute bottom-0 pointer-events-none z-10"
                            style={{
                              left: `${leftPosition}%`,
                              transform: 'translateX(-50%)',
                              height: '100%'
                            }}
                          >
                            <div className="w-full h-full relative">
                              <motion.div
                                className="absolute inset-0 bg-gradient-radial from-pink-500/40 via-purple-500/20 to-transparent rounded-full blur-2xl"
                                animate={{
                                  scale: [1, 1.5, 2],
                                  opacity: [0.6, 0.3, 0]
                                }}
                                transition={{ duration: 1 }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                      
                      {/* Connecting Arc Between Swapping Elements */}
                      {steps[currentStep].swappingIndices.length === 2 && (
                        <motion.svg
                          className="absolute top-0 left-0 w-full h-full pointer-events-none z-15"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1 }}
                        >
                          <motion.path
                            d={`M ${(steps[currentStep].swappingIndices[0] + 0.5) * (100 / array.length)}% 50% Q 50% 10% ${(steps[currentStep].swappingIndices[1] + 0.5) * (100 / array.length)}% 50%`}
                            stroke="url(#swapGradient)"
                            strokeWidth="3"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
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
                  {(steps.length > 0 && currentStep < steps.length ? steps[currentStep].array : array).map((element, index) => {
                    const currentStepData = steps.length > 0 && currentStep < steps.length ? steps[currentStep] : null;
                    const isComparing = currentStepData?.comparingIndices.includes(index) || false;
                    const isSwapping = currentStepData?.swappingIndices.includes(index) || false;
                    const isSorted = currentStepData?.sortedIndices.includes(index) || false;
                    
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
                        className="relative flex-1 min-w-0 group"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: isSwapping ? [1, 1.1, 1] : 1
                        }}
                        transition={{ 
                          duration: 0.3,
                          delay: index * 0.02
                        }}
                      >
                        <motion.div
                          className="relative w-full rounded-t-lg transition-all duration-300"
                          animate={{
                            height: `${heightPercentage}%`,
                            backgroundColor: barColor,
                            boxShadow: [
                              `0 0 20px ${glowColor}80`,
                              `0 0 40px ${glowColor}`,
                              `0 0 20px ${glowColor}80`
                            ]
                          }}
                          transition={{
                            height: { duration: 0.5, ease: "easeInOut" },
                            backgroundColor: { duration: 0.3 },
                            boxShadow: { duration: 1, repeat: Infinity }
                          }}
                          style={{
                            minHeight: '4px'
                          }}
                        >
                          {/* Glow Effect */}
                          <motion.div
                            className="absolute inset-0 rounded-t-lg blur-md"
                            animate={{
                              backgroundColor: `${glowColor}40`,
                              opacity: isSwapping || isComparing ? [0.6, 1, 0.6] : 0.4
                            }}
                            transition={{
                              opacity: { duration: 0.5, repeat: isSwapping || isComparing ? Infinity : 0 }
                            }}
                          />
                          
                          {/* Value Label */}
                          {array.length <= 30 && (
                            <motion.div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap bg-gray-900/90 px-2 py-1 rounded border border-cyan-500/30"
                              initial={{ y: 10 }}
                              whileHover={{ y: 0 }}
                            >
                              {element.value}
                            </motion.div>
                          )}

                          {/* Sorted Checkmark */}
                          {isSorted && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                            >
                              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.8)]">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </motion.div>
                          )}

                          {/* Particle Effect on Swap */}
                          {isSwapping && (
                            <>
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={`particle-${i}`}
                                  className="absolute w-1 h-1 rounded-full bg-pink-400"
                                  initial={{ 
                                    x: 0, 
                                    y: 0, 
                                    opacity: 1,
                                    scale: 1
                                  }}
                                  animate={{ 
                                    x: (Math.random() - 0.5) * 40,
                                    y: -Math.random() * 60 - 20,
                                    opacity: 0,
                                    scale: 0
                                  }}
                                  transition={{ 
                                    duration: 0.8,
                                    delay: i * 0.05,
                                    ease: "easeOut"
                                  }}
                                  style={{
                                    left: '50%',
                                    top: '0%'
                                  }}
                                />
                              ))}
                            </>
                          )}
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="h-full flex items-end justify-center gap-1">
                {(steps[currentStep]?.array || array).map((element, index) => {
                  const isComparing = steps[currentStep]?.comparingIndices.includes(index);
                  const isSwapping = steps[currentStep]?.swappingIndices.includes(index);
                  const isSorted = steps[currentStep]?.sortedIndices.includes(index);
                  
                  const maxValue = Math.max(...(steps[currentStep]?.array || array).map(el => el.value), 1);
                  const heightPercentage = (element.value / maxValue) * 100;
                  
                  const getBarColor = () => {
                    if (isSorted) return '#00ff00';
                    if (isSwapping) return '#ff0066';
                    if (isComparing) return '#ffff00';
                    return NEON_COLORS[index % NEON_COLORS.length];
                  };

                  const barColor = getBarColor();

                  return (
                    <motion.div
                      key={element.id}
                      className="relative flex-1 min-w-[8px] max-w-[60px]"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: isSwapping ? [1, 1.1, 1] : isComparing ? 1.05 : 1
                      }}
                      transition={{ 
                        duration: 0.3,
                        scale: { duration: 0.4, repeat: isSwapping ? 2 : 0 }
                      }}
                    >
                      {/* Trail effect during swaps */}
                      {isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            background: `linear-gradient(to top, transparent, ${barColor})`,
                            filter: 'blur(8px)',
                          }}
                          animate={{
                            opacity: [0.3, 0.7, 0.3],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                          }}
                        />
                      )}

                      {/* Main bar */}
                      <motion.div
                        className="relative w-full rounded-t-lg transition-all duration-300"
                        style={{
                          height: `${heightPercentage}%`,
                          minHeight: '20px',
                          backgroundColor: barColor,
                          boxShadow: `
                            0 0 ${isSwapping ? '30px' : isComparing ? '25px' : '15px'} ${barColor}80,
                            0 0 ${isSwapping ? '60px' : isComparing ? '50px' : '30px'} ${barColor}40,
                            inset 0 0 20px ${barColor}60
                          `,
                        }}
                        animate={{
                          height: `${heightPercentage}%`,
                          boxShadow: `
                            0 0 ${isSwapping ? '30px' : isComparing ? '25px' : '15px'} ${barColor}80,
                            0 0 ${isSwapping ? '60px' : isComparing ? '50px' : '30px'} ${barColor}40,
                            inset 0 0 20px ${barColor}60
                          `,
                        }}
                        transition={{
                          height: { duration: 0.5, ease: 'easeInOut' },
                          boxShadow: { duration: 0.3 }
                        }}
                      >
                        {/* Glow effect overlay */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            background: `linear-gradient(to top, transparent 0%, ${barColor}40 50%, ${barColor}80 100%)`,
                          }}
                          animate={{
                            opacity: isSwapping ? [0.5, 1, 0.5] : isComparing ? [0.6, 0.9, 0.6] : 0.7,
                          }}
                          transition={{
                            duration: isSwapping ? 0.4 : isComparing ? 0.6 : 1,
                            repeat: (isSwapping || isComparing) ? Infinity : 0,
                          }}
                        />

                        {/* Value label */}
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                          style={{ color: barColor }}
                          animate={{
                            scale: isSwapping ? [1, 1.3, 1] : isComparing ? 1.2 : 1,
                            y: isSwapping ? [-2, -6, -2] : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {element.value}
                        </motion.div>

                        {/* Sorted checkmark indicator */}
                        {isSorted && (
                          <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                          >
                            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Comparison indicator pulse */}
                      {isComparing && (
                        <motion.div
                          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full"
                          style={{ backgroundColor: '#ffff00' }}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                          }}
                        />
                      )}

                      {/* Swap indicator arrows */}
                      {isSwapping && (
                        <motion.div
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
                          animate={{
                            y: [0, -4, 0],
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                          }}
                        >
                          <div className="text-pink-500 text-xl font-bold">⇅</div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-semibold tracking-wide">PROGRESS</span>
                  <motion.span 
                    key={currentStep}
                    initial={{ scale: 1.3, color: '#00ffff' }}
                    animate={{ scale: 1, color: '#67e8f9' }}
                    transition={{ duration: 0.3 }}
                    className="text-white font-mono bg-cyan-500/20 px-4 py-1 rounded-full text-sm border border-cyan-500/30"
                  >
                    {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                  </motion.span>
                </div>
                
                <div className="relative h-4 bg-gray-800/80 rounded-full overflow-hidden border border-cyan-500/20">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
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
                    style={{
                      width: '50%'
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(0, 255, 255, 0.3)',
                        '0 0 20px rgba(0, 255, 255, 0.6)',
                        '0 0 10px rgba(0, 255, 255, 0.3)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Step {currentStep} of {steps.length}</span>
                  {currentStep >= steps.length && steps.length > 0 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-green-400 font-semibold flex items-center gap-1"
                    >
                      ✓ Complete
                    </motion.span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-cyan-300 tracking-wider">LEGEND</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-sm shadow-lg"
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
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 0, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-sm shadow-lg"
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
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 0, 102, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-pink-500 to-pink-400 rounded-sm shadow-lg"
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
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-green-500 to-green-400 rounded-sm shadow-lg"
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

          {/* Additional Info */}
          <motion.div
            className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                <span className="font-semibold text-purple-300">Pro Tip:</span> Watch the bars glow and pulse as they compare values. Swapping bars leave neon trails as they move to their new positions!
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}