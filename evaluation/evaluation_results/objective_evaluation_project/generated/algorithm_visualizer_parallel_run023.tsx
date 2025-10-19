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

  const animateSteps = useCallback(() => {
    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const step = steps[currentStep];
    setArray(step.array);
    setCurrentStep(prev => prev + 1);
  }, [currentStep, steps]);
  useEffect(() => {
    if (!isPlaying) return;

    const delay = 1000 - (speed[0] * 9.5);
    const timer = setTimeout(animateSteps, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, speed, animateSteps]);
  const startVisualization = useCallback(() => {    if (steps.length === 0) return;
    if (currentStep >= steps.length) {
      setCurrentStep(0);
    }
    setIsPlaying(true);</parameter>
</invoke>
    
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {
    setIsPlaying(false);

    /* TODO:PauseAnimation Set isPlaying false, preserve current step */
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    const sortedArray = [...array];
    const stepsList: AlgorithmStep[] = [];

    const addStep = (arr: ArrayElement[], comparing: number[] = [], swapping: number[] = [], sorted: number[] = []) => {
      stepsList.push({
        array: arr.map(el => ({ ...el })),
        comparingIndices: [...comparing],
        swappingIndices: [...swapping],
        sortedIndices: [...sorted]
      });
    };

    // Initial state
    addStep(sortedArray);

    if (algorithm === 'bubble') {
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
    } else if (algorithm === 'insertion') {
      const sortedSet = new Set<number>([0]);
      
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
    } else if (algorithm === 'quick') {
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
    } else if (algorithm === 'merge') {
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
          addStep(sortedArray, [], [], Array.from(sortedSet));
          k++;
        }
        
        while (i < leftArr.length) {
          sortedArray[k] = leftArr[i];
          addStep(sortedArray, [], [], Array.from(sortedSet));
          i++;
          k++;
        }
        
        while (j < rightArr.length) {
          sortedArray[k] = rightArr[j];
          addStep(sortedArray, [], [], Array.from(sortedSet));
          j++;
          k++;
        }
        
        if (left === right) {
          sortedSet.add(left);
        } else if (right - left + 1 === sortedArray.length) {
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
        } else {
          sortedSet.add(left);
          addStep(sortedArray, [], [], Array.from(sortedSet));
        }
      };
      
      mergeSort(0, sortedArray.length - 1);
    }

    setSteps(stepsList);
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
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name || 'Bubble Sort'}
              </span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full border border-purple-400/50"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-mono text-purple-200">
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
                        <div className="font-medium text-white text-sm">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </button>
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
                    <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded border border-purple-500/30">
                      {speed[0]}%
                    </span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={100}
                    step={10}
                    className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400 [&_[role=slider]]:shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                  />
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400">
                      <BarChart3 className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Array Size</h3>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded border border-pink-500/30">
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
                    className="[&_[role=slider]]:bg-pink-500 [&_[role=slider]]:border-pink-400 [&_[role=slider]]:shadow-[0_0_10px_rgba(236,72,153,0.6)]"
                  />
                </div>

                {/* Control Buttons */}
                <div className="space-y-2 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all duration-300"
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
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={generateRandomArray}
                    disabled={isPlaying}
                    variant="outline"
                    className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    New Array
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-400 font-mono">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
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
                            className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
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
                    max={50}
                    step={1}
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
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                    <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 border border-cyan-400/50">
                      <motion.div
                        initial={false}
                        animate={{ 
                          rotate: isPlaying ? 0 : 0,
                          scale: isPlaying ? 1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </motion.div>
                      <span className="text-sm tracking-wider">
                        {isPlaying ? 'PAUSE' : 'PLAY'}
                      </span>
                    </div>
                  </motion.button>
                  <motion.div whileTap={{ rotate: 360 }} transition={{ duration: 0.6, ease: "easeInOut" }}>
                    <Button
                      onClick={resetVisualization}
                      variant="outline"
                      size="lg"
                      className="relative group bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-2 border-pink-500/50 hover:border-pink-400 text-pink-300 hover:text-pink-200 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/60 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/30 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <motion.div
                        className="relative z-10 flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span className="font-semibold">Reset</span>
                      </motion.div>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-pink-500/10 blur-xl" />
                      </div>
                    </Button>
                  </motion.div>
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
                <div className="flex items-center gap-2 text-purple-400 mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide">Statistics</h3>
                </div>

                <div className="space-y-4">
                  {/* Comparisons Counter */}
                  <motion.div
                    className="relative p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="text-xs text-cyan-400 font-medium mb-1 uppercase tracking-wider">Comparisons</div>
                      <motion.div
                        className="text-3xl font-bold text-cyan-300"
                        key={comparisons}
                        initial={{ scale: 1.2, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#67e8f9' }}
                        transition={{ duration: 0.3 }}
                      >
                        {comparisons}
                      </motion.div>
                    </div>
                    <motion.div
                      className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Swaps Counter */}
                  <motion.div
                    className="relative p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/20 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="text-xs text-pink-400 font-medium mb-1 uppercase tracking-wider">Swaps</div>
                      <motion.div
                        className="text-3xl font-bold text-pink-300"
                        key={swaps}
                        initial={{ scale: 1.2, color: '#ff0066' }}
                        animate={{ scale: 1, color: '#f9a8d4' }}
                        transition={{ duration: 0.3 }}
                      >
                        {swaps}
                      </motion.div>
                    </div>
                    <motion.div
                      className="absolute top-2 right-2 w-2 h-2 bg-pink-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </motion.div>

                  {/* Progress Bar */}
                  <motion.div
                    className="relative p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-purple-400 font-medium uppercase tracking-wider">Progress</div>
                        <div className="text-sm text-purple-300 font-bold">
                          {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                        </div>
                      </div>
                      <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden border border-purple-500/20">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                          initial={{ width: 0 }}
                          animate={{
                            width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                          }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-400">Step {currentStep}</div>
                        <div className="text-xs text-gray-400">of {steps.length}</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Array Size Info */}
                  <motion.div
                    className="relative p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="text-xs text-green-400 font-medium mb-1 uppercase tracking-wider">Array Size</div>
                      <div className="text-3xl font-bold text-green-300">
                        {array.length}
                      </div>
                    </div>
                    <motion.div
                      className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </motion.div>

                  {/* Status Indicator */}
                  <motion.div
                    className="relative p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 overflow-hidden"
                    animate={{
                      borderColor: isPlaying
                        ? ['rgba(234, 179, 8, 0.3)', 'rgba(234, 179, 8, 0.6)', 'rgba(234, 179, 8, 0.3)']
                        : 'rgba(234, 179, 8, 0.3)'
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="text-xs text-yellow-400 font-medium uppercase tracking-wider">Status</div>
                      <div className="flex items-center gap-2">
                        <motion.div
                          className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-500'}`}
                          animate={isPlaying ? { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] } : {}}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className={`text-sm font-semibold ${isPlaying ? 'text-green-300' : 'text-gray-400'}`}>
                          {isPlaying ? 'Running' : currentStep >= steps.length && steps.length > 0 ? 'Complete' : 'Idle'}
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
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
                    <p className="text-cyan-300 text-lg font-medium">
                      Generate an array to start visualizing
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="relative h-full w-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const maxValue = Math.max(...array.map(e => e.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    const isComparing = element.isComparing;
                    const isSwapping = element.isSwapping;
                    const isSorted = element.isSorted;
                    
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
                      <div key={element.id} className="relative flex-1 flex flex-col items-center justify-end" style={{ maxWidth: '60px' }}>
                        {/* Comparison Indicator */}
                        {isComparing && (
                          <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              y: [-20, -40, -60],
                              scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="absolute -top-16 left-1/2 -translate-x-1/2 z-20"
                          >
                            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,0,0.8)]">
                              <Zap className="w-4 h-4 text-gray-900" />
                            </div>
                          </motion.div>
                        )}

                        {/* Swap Trail Effect */}
                        {isSwapping && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ 
                                opacity: [0, 0.8, 0],
                                scale: [0.5, 2, 3],
                              }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="absolute inset-0 rounded-lg blur-xl z-0"
                              style={{
                                background: `radial-gradient(circle, ${glowColor}80 0%, transparent 70%)`,
                              }}
                            />
                            <motion.div
                              animate={{
                                rotate: [0, 360],
                              }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="absolute -top-12 left-1/2 -translate-x-1/2 z-20"
                            >
                              <div className="relative">
                                <motion.div
                                  animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.5, 1, 0.5]
                                  }}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                  className="absolute inset-0 rounded-full blur-md"
                                  style={{ backgroundColor: glowColor }}
                                />
                                <RotateCcw className="w-6 h-6 relative z-10" style={{ color: glowColor }} />
                              </div>
                            </motion.div>
                          </>
                        )}

                        {/* Sorted Indicator */}
                        {isSorted && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 z-20"
                          >
                            <motion.div
                              animate={{
                                rotate: [0, 360],
                              }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.8)]">
                                <div className="w-2 h-3 border-r-2 border-b-2 border-gray-900 rotate-45 -mt-1" />
                              </div>
                            </motion.div>
                          </motion.div>
                        )}

                        {/* Animated Bar */}
                        <motion.div
                          layout
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ 
                            height: `${heightPercentage}%`,
                            opacity: 1,
                            scale: isSwapping ? [1, 1.1, 1] : 1,
                          }}
                          transition={{
                            height: { duration: 0.5, ease: 'easeOut' },
                            opacity: { duration: 0.3 },
                            scale: { duration: 0.3, repeat: isSwapping ? Infinity : 0 }
                          }}
                          className="w-full rounded-t-lg relative overflow-hidden"
                          style={{
                            backgroundColor: barColor,
                            boxShadow: `0 0 20px ${glowColor}80, 0 0 40px ${glowColor}40, inset 0 0 20px ${glowColor}40`,
                            minHeight: '20px'
                          }}
                        >
                          {/* Inner glow effect */}
                          <motion.div
                            animate={{
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent"
                          />
                          
                          {/* Shimmer effect */}
                          <motion.div
                            animate={{
                              x: ['-100%', '200%'],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                          />

                          {/* Value label */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs font-bold text-gray-900 drop-shadow-lg"
                            >
                              {element.value}
                            </motion.span>
                          </div>
                        </motion.div>

                        {/* Base glow */}
                        <motion.div
                          animate={{
                            opacity: isComparing || isSwapping ? [0.5, 1, 0.5] : 0.3,
                          }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="absolute bottom-0 w-full h-2 blur-sm"
                          style={{
                            backgroundColor: glowColor,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}</parameter>
</invoke>
                {array.map((element, index) => {
                  const maxValue = Math.max(...array.map(el => el.value), 100);
                  const heightPercentage = (element.value / maxValue) * 100;
                  const colorIndex = index % NEON_COLORS.length;
                  const neonColor = NEON_COLORS[colorIndex];
                  
                  return (
                    <motion.div
                      key={element.id}
                      className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: `${heightPercentage}%`,
                        opacity: 1,
                        backgroundColor: element.isSorted 
                          ? '#00ff00'
                          : element.isSwapping
                          ? '#ff0066'
                          : element.isComparing
                          ? '#ffff00'
                          : neonColor,
                        boxShadow: element.isSorted
                          ? [
                              `0 0 20px rgba(0, 255, 0, 0.8)`,
                              `0 0 40px rgba(0, 255, 0, 0.6)`,
                              `0 0 20px rgba(0, 255, 0, 0.8)`
                            ]
                          : element.isSwapping
                          ? [
                              `0 0 30px rgba(255, 0, 102, 1)`,
                              `0 0 60px rgba(255, 0, 102, 0.8)`,
                              `0 0 30px rgba(255, 0, 102, 1)`
                            ]
                          : element.isComparing
                          ? [
                              `0 0 25px rgba(255, 255, 0, 0.9)`,
                              `0 0 50px rgba(255, 255, 0, 0.7)`,
                              `0 0 25px rgba(255, 255, 0, 0.9)`
                            ]
                          : [
                              `0 0 15px ${neonColor}80`,
                              `0 0 30px ${neonColor}60`,
                              `0 0 15px ${neonColor}80`
                            ],
                        scale: element.isSwapping ? [1, 1.1, 1] : element.isComparing ? 1.05 : 1
                      }}
                      transition={{
                        height: { duration: 0.5, ease: 'easeInOut' },
                        backgroundColor: { duration: 0.3 },
                        boxShadow: { duration: 1.5, repeat: Infinity },
                        scale: { duration: 0.3 }
                      }}
                      style={{
                        background: element.isSorted
                          ? 'linear-gradient(to top, #00ff00, #00ff88)'
                          : element.isSwapping
                          ? 'linear-gradient(to top, #ff0066, #ff66aa)'
                          : element.isComparing
                          ? 'linear-gradient(to top, #ffff00, #ffff88)'
                          : `linear-gradient(to top, ${neonColor}, ${neonColor}dd)`,
                        border: `2px solid ${element.isSorted ? '#00ff00' : element.isSwapping ? '#ff0066' : element.isComparing ? '#ffff00' : neonColor}`,
                        position: 'relative',
                        overflow: 'visible'
                      }}
                    >
                      {/* Glow effect overlay */}
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        animate={{
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${element.isSorted ? '#00ff00' : element.isSwapping ? '#ff0066' : element.isComparing ? '#ffff00' : neonColor}88, transparent 70%)`,
                          pointerEvents: 'none'
                        }}
                      />
                      
                      {/* Value label */}
                      <motion.div
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: element.isComparing || element.isSwapping ? 1 : 0.7,
                          y: 0,
                          scale: element.isComparing || element.isSwapping ? 1.2 : 1
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                          color: element.isSorted ? '#00ff00' : element.isSwapping ? '#ff0066' : element.isComparing ? '#ffff00' : neonColor,
                          textShadow: `0 0 10px ${element.isSorted ? '#00ff00' : element.isSwapping ? '#ff0066' : element.isComparing ? '#ffff00' : neonColor}`,
                          filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.8))'
                        }}
                      >
                        {element.value}
                      </motion.div>

                      {/* Particle effect for sorted elements */}
                      {element.isSorted && (
                        <>
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={`particle-${i}`}
                              className="absolute w-1 h-1 bg-green-400 rounded-full"
                              initial={{ 
                                x: 0, 
                                y: 0, 
                                opacity: 1,
                                scale: 1
                              }}
                              animate={{
                                x: [0, (Math.random() - 0.5) * 40],
                                y: [0, -30 - Math.random() * 20],
                                opacity: [1, 0],
                                scale: [1, 0]
                              }}
                              transition={{
                                duration: 1 + Math.random(),
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: 'easeOut'
                              }}
                              style={{
                                left: '50%',
                                top: '0',
                                boxShadow: '0 0 8px rgba(0, 255, 0, 0.8)'
                              }}
                            />
                          ))}
                        </>
                      )}
                    </motion.div>
                  );
                })
              </div>

                            {array.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {array.map((element, index) => {
                    const isComparing = steps[currentStep]?.comparingIndices.includes(index);
                    
                    if (!isComparing) return null;

                    const barWidth = Math.max(100 / array.length - 2, 8);
                    const leftPosition = (index * (100 / array.length)) + (barWidth / 2);

                    return (
                      <motion.div
                        key={`comparison-${element.id}-${index}`}
                        initial={{ opacity: 0, y: 20, scale: 0.5 }}
                        animate={{ 
                          opacity: [0, 1, 1, 0],
                          y: [20, -40, -40, -60],
                          scale: [0.5, 1.2, 1.2, 0.8]
                        }}
                        transition={{ 
                          duration: 0.8,
                          times: [0, 0.3, 0.7, 1],
                          repeat: Infinity,
                          repeatDelay: 0.2
                        }}
                        className="absolute bottom-0"
                        style={{
                          left: `${leftPosition}%`,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <motion.div
                          className="relative"
                          animate={{
                            rotate: [0, 10, -10, 0]
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.8)]">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <motion.div
                            className="absolute inset-0 rounded-full bg-cyan-400"
                            animate={{
                              scale: [1, 1.8, 1.8],
                              opacity: [0.6, 0, 0]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity
                            }}
                          />
                        </motion.div>
                        
                        <motion.div
                          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                          animate={{
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity
                          }}
                        >
                          <div className="bg-cyan-500/90 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-300 shadow-lg shadow-cyan-500/50">
                            <span className="text-xs font-bold text-white">
                              {element.value}
                            </span>
                          </div>
                        </motion.div>

                        <motion.div
                          className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-b from-cyan-400 to-transparent"
                          style={{
                            height: '200px',
                            transform: 'translateX(-50%)'
                          }}
                          animate={{
                            opacity: [0, 0.6, 0],
                            scaleY: [0, 1, 1]
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity
                          }}
                        />
                      </motion.div>
                    );
                  })}

                  {steps[currentStep]?.comparingIndices.length === 2 && (
                    <motion.div
                      key={`comparison-line-${currentStep}`}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ 
                        opacity: [0, 0.8, 0.8, 0],
                        scaleX: [0, 1, 1, 0.8]
                      }}
                      transition={{ 
                        duration: 1,
                        repeat: Infinity
                      }}
                      className="absolute"
                      style={{
                        left: `${(steps[currentStep].comparingIndices[0] * (100 / array.length)) + (Math.max(100 / array.length - 2, 8) / 2)}%`,
                        width: `${Math.abs(steps[currentStep].comparingIndices[1] - steps[currentStep].comparingIndices[0]) * (100 / array.length)}%`,
                        top: '30%',
                        height: '2px',
                        background: 'linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(34,211,238,1) 50%, rgba(34,211,238,0) 100%)',
                        boxShadow: '0 0 20px rgba(34,211,238,0.8)',
                        transformOrigin: 'left center'
                      }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          x: ['-100%', '200%']
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      >
                        <div className="w-20 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              )}
              
                            {steps.length > 0 && currentStep > 0 && steps[currentStep - 1]?.swappingIndices.length === 2 && (
                <>
                  {steps[currentStep - 1].swappingIndices.map((swapIndex, idx) => {
                    const element = array[swapIndex];
                    if (!element) return null;
                    
                    const maxValue = Math.max(...array.map(el => el.value), 100);
                    const heightPercentage = (element.value / maxValue) * 100;
                    const totalElements = array.length;
                    const elementWidth = 100 / totalElements;
                    const leftPosition = (swapIndex / totalElements) * 100;
                    const colorIndex = swapIndex % NEON_COLORS.length;
                    const neonColor = NEON_COLORS[colorIndex];
                    
                    return (
                      <motion.div
                        key={`swap-trail-${swapIndex}-${currentStep}`}
                        className="absolute bottom-0 rounded-t-lg pointer-events-none"
                        style={{
                          left: `${leftPosition}%`,
                          width: `${elementWidth}%`,
                          height: `${heightPercentage}%`,
                          backgroundColor: neonColor,
                          boxShadow: `0 0 30px ${neonColor}, 0 0 60px ${neonColor}`,
                          filter: 'blur(4px)',
                        }}
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{ 
                          opacity: 0,
                          scale: 1.2,
                          filter: 'blur(12px)'
                        }}
                        transition={{ 
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                      />
                    );
                  })}
                  
                  <motion.div
                    key={`swap-connection-${currentStep}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${(Math.min(...steps[currentStep - 1].swappingIndices) / array.length) * 100}%`,
                      width: `${(Math.abs(steps[currentStep - 1].swappingIndices[1] - steps[currentStep - 1].swappingIndices[0]) / array.length) * 100}%`,
                      top: '50%',
                      height: '4px',
                      background: `linear-gradient(90deg, 
                        ${NEON_COLORS[steps[currentStep - 1].swappingIndices[0] % NEON_COLORS.length]}, 
                        ${NEON_COLORS[steps[currentStep - 1].swappingIndices[1] % NEON_COLORS.length]})`,
                      boxShadow: `0 0 20px ${NEON_COLORS[steps[currentStep - 1].swappingIndices[0] % NEON_COLORS.length]}`,
                      filter: 'blur(2px)',
                    }}
                    initial={{ opacity: 0.9, scaleX: 0 }}
                    animate={{ 
                      opacity: 0,
                      scaleX: 1,
                      filter: 'blur(8px)'
                    }}
                    transition={{ 
                      duration: 0.5,
                      ease: "easeInOut"
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-cyan-300 uppercase tracking-wider">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-cyan-500 to-cyan-400"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0, 255, 255, 0.8)',
                    '0 0 30px rgba(0, 255, 255, 0.6)',
                    '0 0 15px rgba(0, 255, 255, 0.8)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Unsorted</div>
                <div className="text-xs text-gray-400">Default state</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 255, 0, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-yellow-500 to-yellow-400"
                animate={{
                  boxShadow: [
                    '0 0 25px rgba(255, 255, 0, 0.9)',
                    '0 0 50px rgba(255, 255, 0, 0.7)',
                    '0 0 25px rgba(255, 255, 0, 0.9)'
                  ],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Comparing</div>
                <div className="text-xs text-gray-400">Being compared</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255, 0, 102, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-pink-600 to-pink-500"
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(255, 0, 102, 1)',
                    '0 0 60px rgba(255, 0, 102, 0.8)',
                    '0 0 30px rgba(255, 0, 102, 1)'
                  ],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Swapping</div>
                <div className="text-xs text-gray-400">Being swapped</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)' }}
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-green-500 to-green-400"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0, 255, 0, 0.8)',
                    '0 0 40px rgba(0, 255, 0, 0.6)',
                    '0 0 20px rgba(0, 255, 0, 0.8)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-white">Sorted</div>
                <div className="text-xs text-gray-400">In final position</div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              </motion.div>
              <div>
                <div className="text-sm font-semibold text-purple-300 mb-1">Pro Tip</div>
                <div className="text-xs text-gray-400 leading-relaxed">
                  Watch the neon glow intensify during comparisons and swaps. Each algorithm has unique patterns - try them all!
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}