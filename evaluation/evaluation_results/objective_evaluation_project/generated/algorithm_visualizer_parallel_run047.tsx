import { useState, useCallback } from 'react';
import { useEffect, useRef } from 'react';
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
  // Animation interval ref
  const animationIntervalRef = useState<NodeJS.Timeout | null>(null)[0];
  const [array, setArray] = useState<ArrayElement[]>([]);
  const animationIntervalRef2 = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [arraySize, setArraySize] = useState([20]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bubble');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);

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
    if (steps.length === 0 || currentStep >= steps.length) return;
    
    setIsPlaying(true);
    
    // Clear any existing interval
    if (animationIntervalRef2.current) {
      clearInterval(animationIntervalRef2.current);
    }
    
    // Calculate delay based on speed (inverse relationship)
    const delay = 1000 - (speed[0] * 10);
    
    animationIntervalRef2.current = setInterval(() => {
      setCurrentStep((prevStep) => {
        const nextStep = prevStep + 1;
        
        if (nextStep >= steps.length) {
          // Animation complete
          setIsPlaying(false);
          if (animationIntervalRef2.current) {
            clearInterval(animationIntervalRef2.current);
            animationIntervalRef2.current = null;
          }
          return prevStep;
        }
        
        // Update array with current step
        const stepData = steps[nextStep];
        setArray(stepData.array);
        
        return nextStep;
      });
    }, delay);

    
  }, [steps, speed, currentStep]);
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (animationIntervalRef2.current) {
        clearInterval(animationIntervalRef2.current);
      }
    };
  }, []);

  const pauseVisualization = useCallback(() => {
    setIsPlaying(false);

    
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
        if (array.length === 0) return;

    const steps: AlgorithmStep[] = [];
    const arr = array.map(el => ({ ...el }));

    const addStep = (
      currentArray: ArrayElement[],
      comparing: number[] = [],
      swapping: number[] = [],
      sorted: number[] = []
    ) => {
      steps.push({
        array: currentArray.map(el => ({ ...el })),
        comparingIndices: [...comparing],
        swappingIndices: [...swapping],
        sortedIndices: [...sorted]
      });
    };

    switch (algorithm) {
      case 'bubble': {
        const sortedIndices: number[] = [];
        for (let i = 0; i < arr.length - 1; i++) {
          for (let j = 0; j < arr.length - i - 1; j++) {
            addStep(arr, [j, j + 1], [], sortedIndices);
            
            if (arr[j].value > arr[j + 1].value) {
              addStep(arr, [], [j, j + 1], sortedIndices);
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              addStep(arr, [], [], sortedIndices);
            }
          }
          sortedIndices.push(arr.length - i - 1);
          addStep(arr, [], [], sortedIndices);
        }
        sortedIndices.push(0);
        addStep(arr, [], [], sortedIndices);
        break;
      }

      case 'quick': {
        const sortedIndices: number[] = [];
        
        const partition = (low: number, high: number): number => {
          const pivot = arr[high].value;
          let i = low - 1;

          for (let j = low; j < high; j++) {
            addStep(arr, [j, high], [], sortedIndices);
            
            if (arr[j].value < pivot) {
              i++;
              if (i !== j) {
                addStep(arr, [], [i, j], sortedIndices);
                [arr[i], arr[j]] = [arr[j], arr[i]];
                addStep(arr, [], [], sortedIndices);
              }
            }
          }
          
          addStep(arr, [], [i + 1, high], sortedIndices);
          [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
          addStep(arr, [], [], sortedIndices);
          
          return i + 1;
        };

        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            sortedIndices.push(pi);
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
          } else if (low === high) {
            sortedIndices.push(low);
          }
        };

        quickSort(0, arr.length - 1);
        addStep(arr, [], [], Array.from({ length: arr.length }, (_, i) => i));
        break;
      }

      case 'merge': {
        const sortedIndices: number[] = [];
        
        const merge = (left: number, mid: number, right: number) => {
          const leftArr = arr.slice(left, mid + 1);
          const rightArr = arr.slice(mid + 1, right + 1);
          
          let i = 0, j = 0, k = left;
          
          while (i < leftArr.length && j < rightArr.length) {
            addStep(arr, [left + i, mid + 1 + j], [], sortedIndices);
            
            if (leftArr[i].value <= rightArr[j].value) {
              addStep(arr, [], [k], sortedIndices);
              arr[k] = leftArr[i];
              i++;
            } else {
              addStep(arr, [], [k], sortedIndices);
              arr[k] = rightArr[j];
              j++;
            }
            k++;
            addStep(arr, [], [], sortedIndices);
          }
          
          while (i < leftArr.length) {
            addStep(arr, [], [k], sortedIndices);
            arr[k] = leftArr[i];
            i++;
            k++;
            addStep(arr, [], [], sortedIndices);
          }
          
          while (j < rightArr.length) {
            addStep(arr, [], [k], sortedIndices);
            arr[k] = rightArr[j];
            j++;
            k++;
            addStep(arr, [], [], sortedIndices);
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
        addStep(arr, [], [], Array.from({ length: arr.length }, (_, i) => i));
        break;
      }

      case 'insertion': {
        const sortedIndices: number[] = [0];
        addStep(arr, [], [], sortedIndices);
        
        for (let i = 1; i < arr.length; i++) {
          const key = arr[i];
          let j = i - 1;
          
          addStep(arr, [i], [], sortedIndices);
          
          while (j >= 0 && arr[j].value > key.value) {
            addStep(arr, [j, j + 1], [], sortedIndices);
            addStep(arr, [], [j, j + 1], sortedIndices);
            arr[j + 1] = arr[j];
            addStep(arr, [], [], sortedIndices);
            j--;
          }
          
          arr[j + 1] = key;
          sortedIndices.push(i);
          addStep(arr, [], [], sortedIndices);
        }
        break;
      }
    }

    setSteps(steps);
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
                      <Button
                        key={algo.id}
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          generateSortingSteps(algo.id as AlgorithmType);
                        }}
                        disabled={isPlaying}
                        variant={selectedAlgorithm === algo.id ? "default" : "outline"}
                        className={`w-full justify-start text-left transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_20px_rgba(0,255,255,0.5)] border-0'
                            : 'bg-gray-800/50 border-cyan-500/20 text-cyan-300 hover:bg-gray-700/50 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                        }`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{algo.name}</span>
                          <span className="text-xs opacity-70">{algo.complexity}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400">
                      <BarChart3 className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Speed</h3>
                    </div>
                    <span className="text-xs text-purple-300 font-mono bg-purple-500/20 px-2 py-1 rounded border border-purple-500/30">
                      {speed[0]}ms
                    </span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={200}
                    step={10}
                    disabled={isPlaying}
                    className="cursor-pointer"
                  />
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400">
                      <BarChart3 className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Array Size</h3>
                    </div>
                    <span className="text-xs text-pink-300 font-mono bg-pink-500/20 px-2 py-1 rounded border border-pink-500/30">
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
                <div className="space-y-2 pt-4 border-t border-cyan-500/20">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || currentStep >= steps.length}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-[0_0_20px_rgba(0,255,0,0.4)] hover:shadow-[0_0_30px_rgba(0,255,0,0.6)] transition-all duration-300 border-0"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {currentStep >= steps.length ? 'Finished' : 'Start'}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-[0_0_20px_rgba(255,100,0,0.4)] hover:shadow-[0_0_30px_rgba(255,100,0,0.6)] transition-all duration-300 border-0"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
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
                            : 'border-gray-700 bg-gray-800/50 hover:border-purple-500/50 hover:bg-purple-500/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                          selectedAlgorithm === algo.id ? 'opacity-100' : ''
                        }`} />
                        <div className="relative z-10">
                          <div className={`font-semibold mb-1 ${
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
                            className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/80"
                            animate={{ scale: [1, 1.2, 1] }}
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
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-[0_0_15px_rgba(34,211,238,0.8)] [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-[0_0_25px_rgba(34,211,238,1)] [&_.relative]:h-2 [&_.relative]:bg-gray-800 [&_.relative]:rounded-full [&_.relative]:border [&_.relative]:border-cyan-500/30 [&_[role=slider]]:focus:ring-4 [&_[role=slider]]:focus:ring-cyan-400/50"
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
                    max={50}
                    step={1}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-400 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-500/50 [&>span]:bg-gradient-to-r [&>span]:from-cyan-500/30 [&>span]:to-purple-500/30"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.div className="flex-1">
                    <Button
                      onClick={isPlaying ? pauseVisualization : startVisualization}
                      disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      style={{
                        boxShadow: isPlaying 
                          ? '0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)' 
                          : '0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)'
                      }}
                    >
                      <motion.div
                        className="flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          key={isPlaying ? 'pause' : 'play'}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" fill="currentColor" />
                          ) : (
                            <Play className="w-5 h-5" fill="currentColor" />
                          )}
                        </motion.div>
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </motion.div>
                      
                      {/* Animated glow pulse effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0"
                        animate={{
                          opacity: isPlaying ? [0, 0.3, 0] : 0
                        }}
                        transition={{
                          duration: 2,
                          repeat: isPlaying ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                      />
                    </Button>
                  </motion.div></parameter>
                  <motion.div whileTap={{ rotate: 360 }} transition={{ duration: 0.6, ease: "easeInOut" }}>
                    <Button
                      onClick={resetVisualization}
                      disabled={isPlaying}
                      className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white border-0 shadow-[0_0_20px_rgba(236,72,153,0.6)] hover:shadow-[0_0_30px_rgba(236,72,153,0.9)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Statistics</h3>
                </div>

                {/* Comparisons Counter */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="relative z-10">
                    <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1 font-semibold">
                      Comparisons
                    </div>
                    <motion.div
                      key={comparisons}
                      initial={{ scale: 1.5, color: '#00ffff' }}
                      animate={{ scale: 1, color: '#67e8f9' }}
                      transition={{ duration: 0.3 }}
                      className="text-3xl font-bold text-cyan-300 font-mono"
                      style={{
                        textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)'
                      }}
                    >
                      {comparisons.toLocaleString()}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Swaps Counter */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/30 p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
                  />
                  <div className="relative z-10">
                    <div className="text-xs text-pink-400 uppercase tracking-wider mb-1 font-semibold">
                      Swaps
                    </div>
                    <motion.div
                      key={swaps}
                      initial={{ scale: 1.5, color: '#ff0066' }}
                      animate={{ scale: 1, color: '#f9a8d4' }}
                      transition={{ duration: 0.3 }}
                      className="text-3xl font-bold text-pink-300 font-mono"
                      style={{
                        textShadow: '0 0 20px rgba(255, 0, 102, 0.8), 0 0 40px rgba(255, 0, 102, 0.4)'
                      }}
                    >
                      {swaps.toLocaleString()}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Progress Indicator */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 2 }}
                  />
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-purple-400 uppercase tracking-wider font-semibold">
                        Progress
                      </div>
                      <motion.div
                        key={currentStep}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="text-xs text-purple-300 font-mono bg-purple-500/20 px-2 py-1 rounded border border-purple-500/30"
                      >
                        {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                      </motion.div>
                    </div>
                    <div className="relative h-2 bg-gray-800 rounded-full border border-purple-500/30 overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{
                          boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)'
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-purple-400/70 font-mono">
                      <span>Step {currentStep}</span>
                      <span>/ {steps.length}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Status Indicator */}
                <motion.div
                  className="relative overflow-hidden rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 p-4"
                  animate={{
                    borderColor: isPlaying
                      ? ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.6)', 'rgba(34, 197, 94, 0.3)']
                      : 'rgba(107, 114, 128, 0.3)'
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="text-xs text-green-400 uppercase tracking-wider font-semibold">
                      Status
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${
                          isPlaying ? 'bg-green-400' : 'bg-gray-500'
                        }`}
                        animate={
                          isPlaying
                            ? {
                                boxShadow: [
                                  '0 0 10px rgba(34, 197, 94, 0.8)',
                                  '0 0 20px rgba(34, 197, 94, 1)',
                                  '0 0 10px rgba(34, 197, 94, 0.8)'
                                ]
                              }
                            : {}
                        }
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span
                        className={`text-sm font-semibold ${
                          isPlaying ? 'text-green-300' : 'text-gray-400'
                        }`}
                      >
                        {isPlaying ? 'Running' : currentStep >= steps.length && steps.length > 0 ? 'Complete' : 'Idle'}
                      </span>
                    </div>
                  </div>
                </motion.div>
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
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 blur-xl"
                  />
                  <div className="text-center space-y-3 relative z-10">
                    <BarChart3 className="w-16 h-16 mx-auto text-cyan-400 opacity-50" />
                    <p className="text-xl text-cyan-300/70 font-medium">
                      Click Reset to generate array
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {steps.length > 0 && currentStep < steps.length ? (
                    steps[currentStep].array.map((element, index) => {
                      const isComparing = steps[currentStep].comparingIndices.includes(index);
                      const isSwapping = steps[currentStep].swappingIndices.includes(index);
                      const isSorted = steps[currentStep].sortedIndices.includes(index);
                      
                      const maxValue = Math.max(...array.map(el => el.value));
                      const heightPercentage = (element.value / maxValue) * 100;
                      
                      let barColor = NEON_COLORS[index % NEON_COLORS.length];
                      let glowColor = barColor;
                      let shadowIntensity = '0.3';
                      
                      if (isSorted) {
                        barColor = '#00ff00';
                        glowColor = '#00ff00';
                        shadowIntensity = '0.8';
                      } else if (isSwapping) {
                        barColor = '#ff0066';
                        glowColor = '#ff0066';
                        shadowIntensity = '0.9';
                      } else if (isComparing) {
                        barColor = '#ffff00';
                        glowColor = '#ffff00';
                        shadowIntensity = '0.7';
                      }
                      
                      return (
                        <motion.div
                          key={element.id}
                          className="relative flex-1 min-w-[4px] max-w-[60px] group"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: `${heightPercentage}%`,
                            opacity: 1,
                            y: isSwapping ? [-10, 0] : 0,
                            scale: isComparing ? [1, 1.05, 1] : 1
                          }}
                          transition={{
                            height: { duration: 0.3, ease: "easeOut" },
                            opacity: { duration: 0.2 },
                            y: { duration: 0.4, ease: "easeInOut" },
                            scale: { duration: 0.3, repeat: isComparing ? Infinity : 0 }
                          }}
                          style={{
                            backgroundColor: barColor,
                            boxShadow: `0 0 20px ${glowColor}${Math.floor(parseFloat(shadowIntensity) * 255).toString(16).padStart(2, '0')}, 
                                       0 0 40px ${glowColor}${Math.floor(parseFloat(shadowIntensity) * 0.5 * 255).toString(16).padStart(2, '0')},
                                       inset 0 0 20px rgba(255, 255, 255, 0.2)`,
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
                                  scale: [1, 1.3, 1.5]
                                }}
                                transition={{ duration: 0.6, repeat: Infinity }}
                                style={{
                                  background: `radial-gradient(circle, ${glowColor}80 0%, transparent 70%)`,
                                  filter: 'blur(8px)'
                                }}
                              />
                              <motion.div
                                className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                                animate={{
                                  y: [-20, 0],
                                  opacity: [1, 0]
                                }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                style={{
                                  backgroundColor: glowColor,
                                  boxShadow: `0 0 10px ${glowColor}`
                                }}
                              />
                            </>
                          )}
                          
                          {/* Comparison Indicator */}
                          {isComparing && (
                            <motion.div
                              className="absolute -top-8 left-1/2 -translate-x-1/2"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ 
                                opacity: [0.5, 1, 0.5],
                                y: [0, -5, 0]
                              }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            >
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{
                                  backgroundColor: glowColor,
                                  boxShadow: `0 0 15px ${glowColor}`,
                                  color: '#000'
                                }}
                              >
                                ?
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Sorted Checkmark */}
                          {isSorted && (
                            <motion.div
                              className="absolute -top-6 left-1/2 -translate-x-1/2"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            >
                              <div 
                                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{
                                  backgroundColor: '#00ff00',
                                  boxShadow: '0 0 15px #00ff00',
                                  color: '#000'
                                }}
                              >
                                ✓
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Value Label */}
                          <motion.div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{
                              fontSize: arraySize[0] > 30 ? '8px' : '10px'
                            }}
                          >
                            <div 
                              className="px-2 py-1 rounded font-mono font-bold whitespace-nowrap"
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                color: barColor,
                                border: `1px solid ${barColor}`,
                                boxShadow: `0 0 10px ${glowColor}50`
                              }}
                            >
                              {element.value}
                            </div>
                          </motion.div>
                          
                          {/* Shimmer Effect */}
                          <motion.div
                            className="absolute inset-0 rounded-t overflow-hidden"
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                              repeatDelay: 1
                            }}
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                              pointerEvents: 'none'
                            }}
                          />
                        </motion.div>
                      );
                    })
                  ) : (
                    array.map((element, index) => {
                      const maxValue = Math.max(...array.map(el => el.value));
                      const heightPercentage = (element.value / maxValue) * 100;
                      const barColor = NEON_COLORS[index % NEON_COLORS.length];
                      
                      return (
                        <motion.div
                          key={element.id}
                          className="relative flex-1 min-w-[4px] max-w-[60px] group"
                          initial={{ height: 0, opacity: 0, scale: 0.8 }}
                          animate={{ 
                            height: `${heightPercentage}%`,
                            opacity: 1,
                            scale: 1
                          }}
                          transition={{
                            height: { duration: 0.5, ease: "easeOut", delay: index * 0.02 },
                            opacity: { duration: 0.3, delay: index * 0.02 },
                            scale: { duration: 0.3, delay: index * 0.02 }
                          }}
                          whileHover={{ scale: 1.05 }}
                          style={{
                            backgroundColor: barColor,
                            boxShadow: `0 0 20px ${barColor}50, 0 0 40px ${barColor}30, inset 0 0 20px rgba(255, 255, 255, 0.1)`,
                            borderRadius: '4px 4px 0 0'
                          }}
                        >
                          <motion.div
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{
                              fontSize: arraySize[0] > 30 ? '8px' : '10px'
                            }}
                          >
                            <div 
                              className="px-2 py-1 rounded font-mono font-bold whitespace-nowrap"
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                color: barColor,
                                border: `1px solid ${barColor}`,
                                boxShadow: `0 0 10px ${barColor}50`
                              }}
                            >
                              {element.value}
                            </div>
                          </motion.div>
                          
                          <motion.div
                            className="absolute inset-0 rounded-t overflow-hidden"
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                              repeatDelay: 1
                            }}
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                              pointerEvents: 'none'
                            }}
                          />
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {/* TODO:AnimatedBars Render array elements as animated bars with height transitions, neon colors, and glow effects */}
              </div>
            </div>

            {/* TODO:ProgressBar Animated progress bar showing sorting completion percentage */}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-cyan-300 uppercase tracking-wider">
              Legend
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-4 h-12 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-sm"
                style={{
                  boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)'
                }}
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0, 255, 255, 0.5)',
                    '0 0 25px rgba(0, 255, 255, 0.7)',
                    '0 0 15px rgba(0, 255, 255, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-gray-200">Default</div>
                <div className="text-xs text-gray-400">Unsorted</div>
              </div>
            </motion.div>

            {/* Comparing State */}
            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-yellow-700/50 hover:border-yellow-600/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-4 h-12 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-sm"
                style={{
                  boxShadow: '0 0 20px rgba(255, 255, 0, 0.6)'
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 255, 0, 0.6)',
                    '0 0 35px rgba(255, 255, 0, 0.9)',
                    '0 0 20px rgba(255, 255, 0, 0.6)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-yellow-300">Comparing</div>
                <div className="text-xs text-yellow-400/70">Active</div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-red-700/50 hover:border-red-600/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-4 h-12 bg-gradient-to-t from-red-500 to-pink-400 rounded-sm"
                style={{
                  boxShadow: '0 0 20px rgba(255, 0, 100, 0.6)'
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 0, 100, 0.6)',
                    '0 0 35px rgba(255, 0, 100, 0.9)',
                    '0 0 20px rgba(255, 0, 100, 0.6)'
                  ],
                  x: [-2, 2, -2]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-red-300">Swapping</div>
                <div className="text-xs text-red-400/70">Moving</div>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-green-700/50 hover:border-green-600/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-4 h-12 bg-gradient-to-t from-green-500 to-emerald-300 rounded-sm"
                style={{
                  boxShadow: '0 0 20px rgba(0, 255, 100, 0.6)'
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0, 255, 100, 0.6)',
                    '0 0 30px rgba(0, 255, 100, 0.8)',
                    '0 0 20px rgba(0, 255, 100, 0.6)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-green-300">Sorted</div>
                <div className="text-xs text-green-400/70">Complete</div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            className="mt-4 pt-4 border-t border-cyan-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 5px rgba(0, 255, 255, 0.5)',
                      '0 0 15px rgba(0, 255, 255, 1)',
                      '0 0 5px rgba(0, 255, 255, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Glowing effects indicate active operations</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span>Bar height represents element value</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}