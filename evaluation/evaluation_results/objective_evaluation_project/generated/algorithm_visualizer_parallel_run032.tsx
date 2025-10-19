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
eRandomArray]);

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
    if (steps.length === 0 || currentStep >= steps.length) return;
    setIsPlaying(true);
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {    setIsPlaying(false);

    /* TODO:PauseAnimation Set isPlaying false, preserve current step */
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    if (array.length === 0) return;

    const newSteps: AlgorithmStep[] = [];
    const arr = [...array];

    const addStep = (
      comparingIndices: number[] = [],
      swappingIndices: number[] = [],
      sortedIndices: number[] = []
    ) => {
      newSteps.push({
        array: arr.map((el, idx) => ({
          ...el,
          isComparing: comparingIndices.includes(idx),
          isSwapping: swappingIndices.includes(idx),
          isSorted: sortedIndices.includes(idx)
        })),
        comparingIndices,
        swappingIndices,
        sortedIndices
      });
    };

    const swap = (i: number, j: number) => {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    };

    switch (algorithm) {
      case 'bubble': {
        const sorted: number[] = [];
        for (let i = 0; i < arr.length - 1; i++) {
          for (let j = 0; j < arr.length - i - 1; j++) {
            addStep([j, j + 1], [], sorted);
            if (arr[j].value > arr[j + 1].value) {
              addStep([j, j + 1], [j, j + 1], sorted);
              swap(j, j + 1);
              addStep([], [], sorted);
            }
          }
          sorted.push(arr.length - i - 1);
          addStep([], [], sorted);
        }
        sorted.push(0);
        addStep([], [], sorted);
        break;
      }

      case 'insertion': {
        const sorted: number[] = [0];
        addStep([], [], sorted);
        for (let i = 1; i < arr.length; i++) {
          let j = i;
          addStep([j, j - 1], [], sorted);
          while (j > 0 && arr[j].value < arr[j - 1].value) {
            addStep([j, j - 1], [j, j - 1], sorted);
            swap(j, j - 1);
            j--;
            addStep([j, j + 1], [], sorted);
          }
          sorted.push(i);
          addStep([], [], sorted);
        }
        break;
      }

      case 'quick': {
        const sorted: number[] = [];
        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pivotIndex = partition(low, high);
            sorted.push(pivotIndex);
            addStep([], [], sorted);
            quickSort(low, pivotIndex - 1);
            quickSort(pivotIndex + 1, high);
          } else if (low === high) {
            sorted.push(low);
            addStep([], [], sorted);
          }
        };

        const partition = (low: number, high: number): number => {
          const pivot = arr[high].value;
          let i = low - 1;

          for (let j = low; j < high; j++) {
            addStep([j, high], [], sorted);
            if (arr[j].value < pivot) {
              i++;
              if (i !== j) {
                addStep([i, j], [i, j], sorted);
                swap(i, j);
              }
            }
          }
          addStep([i + 1, high], [i + 1, high], sorted);
          swap(i + 1, high);
          return i + 1;
        };

        quickSort(0, arr.length - 1);
        break;
      }

      case 'merge': {
        const sorted: number[] = [];
        const mergeSort = (left: number, right: number) => {
          if (left >= right) {
            return;
          }

          const mid = Math.floor((left + right) / 2);
          mergeSort(left, mid);
          mergeSort(mid + 1, right);
          merge(left, mid, right);
        };

        const merge = (left: number, mid: number, right: number) => {
          const leftArr = arr.slice(left, mid + 1);
          const rightArr = arr.slice(mid + 1, right + 1);

          let i = 0, j = 0, k = left;

          while (i < leftArr.length && j < rightArr.length) {
            addStep([left + i, mid + 1 + j], [], sorted);
            if (leftArr[i].value <= rightArr[j].value) {
              arr[k] = leftArr[i];
              i++;
            } else {
              arr[k] = rightArr[j];
              j++;
            }
            k++;
            addStep([], [k - 1], sorted);
          }

          while (i < leftArr.length) {
            arr[k] = leftArr[i];
            addStep([], [k], sorted);
            i++;
            k++;
          }

          while (j < rightArr.length) {
            arr[k] = rightArr[j];
            addStep([], [k], sorted);
            j++;
            k++;
          }

          for (let idx = left; idx <= right; idx++) {
            if (!sorted.includes(idx)) {
              sorted.push(idx);
            }
          }
          addStep([], [], sorted);
        };

        mergeSort(0, arr.length - 1);
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
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-shadow duration-300"
            >
              <div className="space-y-6">
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 mb-4">
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
                    <label className="text-cyan-400 font-semibold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Speed
                    </label>
                    <span className="text-white font-mono text-sm bg-cyan-500/20 px-2 py-1 rounded border border-cyan-500/30">
                      {speed[0]}%
                    </span>
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
                    <span className="text-white font-mono text-sm bg-cyan-500/20 px-2 py-1 rounded border border-cyan-500/30">
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
                    className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-[0_0_10px_rgba(0,255,255,0.6)]"
                  />
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Play
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 font-bold py-6 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={() => generateSortingSteps(selectedAlgorithm)}
                    disabled={isPlaying || array.length === 0}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold py-6 rounded-lg shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-5 h-5 mr-2" />
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
                    <span className="text-cyan-400 font-mono">{array.length}</span>
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
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-400/70 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2 [&>span]:rounded-full"
                    disabled={isPlaying}
                  /></parameter>
</invoke>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    className="flex-1 relative overflow-hidden group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border-0 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all duration-300"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      initial={false}
                      animate={{ scale: isPlaying ? 1 : 1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        initial={false}
                        animate={{ 
                          rotate: isPlaying ? 0 : 0,
                          scale: isPlaying ? 1 : 1
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </motion.div>
                      <span className="font-semibold">
                        {isPlaying ? 'Pause' : 'Play'}
                      </span>
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear"
                      }}
                    />
                  </Button>
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all duration-300 border-0"
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {currentStep > 0 ? 'Resume' : 'Start'}
                      </>
                    )}
                  </Button>
                  
                  <motion.div whileTap={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <Button
                      onClick={resetVisualization}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold shadow-lg shadow-purple-500/50 hover:shadow-purple-400/70 transition-all duration-300 border-0 relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                      <span className="relative z-10 flex items-center">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* TODO:StatsPanel Real-time statistics panel showing comparisons, swaps, and progress */}
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
                    <BarChart3 className="w-24 h-24 text-cyan-400" style={{
                      filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.8))'
                    }} />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-bold text-cyan-300">Generate an array to begin</p>
                    <p className="text-gray-400">Click "Generate Array" to start visualizing</p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {/* Comparison Indicators */}
                  {steps.length > 0 && currentStep < steps.length && steps[currentStep].comparingIndices.length > 0 && (
                    <motion.div
                      className="absolute top-0 left-0 right-0 flex items-center justify-center"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-400/50 rounded-full backdrop-blur-sm">
                        <span className="text-yellow-300 text-sm font-semibold">
                          Comparing indices: {steps[currentStep].comparingIndices.join(', ')}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Swap Indicators */}
                  {steps.length > 0 && currentStep < steps.length && steps[currentStep].swappingIndices.length > 0 && (
                    <motion.div
                      className="absolute top-12 left-0 right-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="px-4 py-2 bg-pink-500/20 border border-pink-400/50 rounded-full backdrop-blur-sm"
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(236, 72, 153, 0.5)',
                            '0 0 40px rgba(236, 72, 153, 0.8)',
                            '0 0 20px rgba(236, 72, 153, 0.5)'
                          ]
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <span className="text-pink-300 text-sm font-semibold">
                          Swapping indices: {steps[currentStep].swappingIndices.join(', ')}
                        </span>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Animated Bars */}
                  {(steps.length > 0 && currentStep < steps.length ? steps[currentStep].array : array).map((element, index) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    const barWidth = Math.max(8, Math.min(60, 800 / array.length));
                    
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let glowIntensity = 0.3;
                    let shouldPulse = false;

                    if (element.isSorted) {
                      barColor = '#00ff00';
                      glowIntensity = 0.6;
                    } else if (element.isSwapping) {
                      barColor = '#ff0066';
                      glowIntensity = 1;
                      shouldPulse = true;
                    } else if (element.isComparing) {
                      barColor = '#ffff00';
                      glowIntensity = 0.8;
                      shouldPulse = true;
                    }

                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex flex-col items-center justify-end"
                        style={{ width: barWidth }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        {/* Swap Trail Effect */}
                        {element.isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              style={{
                                background: `linear-gradient(to top, ${barColor}, transparent)`,
                                filter: 'blur(20px)'
                              }}
                              animate={{
                                opacity: [0.3, 0.8, 0.3],
                                scale: [1, 1.3, 1]
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity
                              }}
                            />
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: barColor,
                                  boxShadow: `0 0 10px ${barColor}`
                                }}
                                initial={{ y: 0, opacity: 1 }}
                                animate={{
                                  y: [-20, -60],
                                  opacity: [1, 0],
                                  scale: [1, 0.5]
                                }}
                                transition={{
                                  duration: 0.8,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </>
                        )}

                        {/* Main Bar */}
                        <motion.div
                          className="w-full rounded-t-lg relative overflow-hidden"
                          style={{
                            backgroundColor: barColor,
                            boxShadow: `0 0 ${glowIntensity * 30}px ${barColor}, inset 0 0 ${glowIntensity * 20}px rgba(255, 255, 255, 0.3)`
                          }}
                          animate={{
                            height: `${heightPercentage}%`,
                            boxShadow: shouldPulse
                              ? [
                                  `0 0 ${glowIntensity * 30}px ${barColor}, inset 0 0 ${glowIntensity * 20}px rgba(255, 255, 255, 0.3)`,
                                  `0 0 ${glowIntensity * 50}px ${barColor}, inset 0 0 ${glowIntensity * 30}px rgba(255, 255, 255, 0.5)`,
                                  `0 0 ${glowIntensity * 30}px ${barColor}, inset 0 0 ${glowIntensity * 20}px rgba(255, 255, 255, 0.3)`
                                ]
                              : `0 0 ${glowIntensity * 30}px ${barColor}, inset 0 0 ${glowIntensity * 20}px rgba(255, 255, 255, 0.3)`
                          }}
                          transition={{
                            height: { duration: 0.5, ease: "easeInOut" },
                            boxShadow: shouldPulse ? { duration: 0.5, repeat: Infinity } : { duration: 0.3 }
                          }}
                        >
                          {/* Shimmer Effect */}
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

                          {/* Value Label */}
                          {barWidth > 20 && (
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <span
                                className="text-xs font-bold"
                                style={{
                                  color: 'rgba(0, 0, 0, 0.8)',
                                  textShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
                                  writingMode: heightPercentage < 20 ? 'horizontal-tb' : 'horizontal-tb'
                                }}
                              >
                                {element.value}
                              </span>
                            </motion.div>
                          )}
                        </motion.div>

                        {/* Comparison Indicator */}
                        {element.isComparing && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              animate={{
                                y: [0, -5, 0]
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity
                              }}
                            >
                              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"
                                style={{
                                  filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))'
                                }}
                              />
                            </motion.div>
                          </motion.div>
                        )}

                        {/* Sorted Checkmark */}
                        {element.isSorted && (
                          <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                              style={{
                                boxShadow: '0 0 15px rgba(34, 197, 94, 0.8)'
                              }}
                            >
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
              
              <div className="relative h-full flex items-end justify-center gap-1">
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
                        Click the generate button to create a random array
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  array.map((element, index) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    const colorIndex = index % NEON_COLORS.length;
                    const baseColor = NEON_COLORS[colorIndex];

                    return (
                      <motion.div
                        key={element.id}
                        layout
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          scale: element.isSwapping ? 1.1 : 1,
                          y: element.isSwapping ? -20 : 0
                        }}
                        transition={{
                          height: { duration: 0.5, ease: "easeOut" },
                          scale: { duration: 0.3 },
                          y: { duration: 0.3 },
                          layout: { duration: 0.5, ease: "easeInOut" }
                        }}
                        className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                        style={{
                          background: element.isSorted
                            ? `linear-gradient(to top, #00ff00, #00ff00)`
                            : element.isSwapping
                            ? `linear-gradient(to top, #ff0066, #ff00ff)`
                            : element.isComparing
                            ? `linear-gradient(to top, #ffff00, #ffa500)`
                            : `linear-gradient(to top, ${baseColor}, ${baseColor}dd)`,
                          boxShadow: element.isSorted
                            ? `0 0 30px rgba(0, 255, 0, 0.8), 0 0 60px rgba(0, 255, 0, 0.4), inset 0 0 20px rgba(0, 255, 0, 0.3)`
                            : element.isSwapping
                            ? `0 0 40px rgba(255, 0, 102, 0.9), 0 0 80px rgba(255, 0, 255, 0.5), inset 0 0 30px rgba(255, 0, 102, 0.4)`
                            : element.isComparing
                            ? `0 0 35px rgba(255, 255, 0, 0.8), 0 0 70px rgba(255, 165, 0, 0.4), inset 0 0 25px rgba(255, 255, 0, 0.3)`
                            : `0 0 20px ${baseColor}80, 0 0 40px ${baseColor}40, inset 0 0 15px ${baseColor}30`,
                          border: element.isSorted
                            ? '2px solid rgba(0, 255, 0, 0.6)'
                            : element.isSwapping
                            ? '2px solid rgba(255, 0, 102, 0.8)'
                            : element.isComparing
                            ? '2px solid rgba(255, 255, 0, 0.7)'
                            : `1px solid ${baseColor}60`
                        }}
                      >
                        {/* Glow overlay effect */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          animate={{
                            opacity: element.isSwapping || element.isComparing ? [0.3, 0.7, 0.3] : 0.2
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: element.isSwapping || element.isComparing ? Infinity : 0
                          }}
                          style={{
                            background: `linear-gradient(to top, transparent, ${
                              element.isSorted
                                ? 'rgba(0, 255, 0, 0.4)'
                                : element.isSwapping
                                ? 'rgba(255, 0, 255, 0.5)'
                                : element.isComparing
                                ? 'rgba(255, 255, 0, 0.5)'
                                : `${baseColor}40`
                            })`
                          }}
                        />

                        {/* Swap trail effect */}
                        {element.isSwapping && (
                          <>
                            <motion.div
                              className="absolute -top-8 left-1/2 -translate-x-1/2"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            >
                              <div className="w-4 h-4 rounded-full bg-pink-500 blur-sm" />
                            </motion.div>
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              animate={{
                                boxShadow: [
                                  '0 0 20px rgba(255, 0, 102, 0.8)',
                                  '0 0 60px rgba(255, 0, 255, 1)',
                                  '0 0 20px rgba(255, 0, 102, 0.8)'
                                ]
                              }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            />
                          </>
                        )}

                        {/* Comparison indicator */}
                        {element.isComparing && (
                          <motion.div
                            className="absolute -top-6 left-1/2 -translate-x-1/2"
                            animate={{
                              y: [-5, 5, -5],
                              opacity: [0.7, 1, 0.7]
                            }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-yellow-400 drop-shadow-[0_0_8px_rgba(255,255,0,0.8)]" />
                          </motion.div>
                        )}

                        {/* Value label */}
                        {array.length <= 50 && (
                          <motion.div
                            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            style={{
                              color: element.isSorted
                                ? '#00ff00'
                                : element.isSwapping
                                ? '#ff00ff'
                                : element.isComparing
                                ? '#ffff00'
                                : baseColor,
                              textShadow: `0 0 10px ${
                                element.isSorted
                                  ? 'rgba(0, 255, 0, 0.8)'
                                  : element.isSwapping
                                  ? 'rgba(255, 0, 255, 0.8)'
                                  : element.isComparing
                                  ? 'rgba(255, 255, 0, 0.8)'
                                  : `${baseColor}80`
                              }`
                            }}
                          >
                            {element.value}
                          </motion.div>
                        )}

                        {/* Sorted checkmark */}
                        {element.isSorted && (
                          <motion.div
                            className="absolute top-2 left-1/2 -translate-x-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <div className="w-3 h-3 rounded-full bg-green-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.8)]">
                              <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-gray-900 rotate-45 translate-y-[-1px]" />
                            </div>
                          </motion.div>
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
              transition={{ delay: 0.3 }}
              className="mt-6 space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-400 font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Sorting Progress
                </span>
                <motion.span
                  key={currentStep}
                  initial={{ scale: 1.2, color: '#00ffff' }}
                  animate={{ scale: 1, color: '#a5f3fc' }}
                  className="text-cyan-300 font-mono font-bold"
                >
                  {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                </motion.span>
              </div>
              
              <div className="relative h-4 bg-gray-800/50 rounded-full border border-cyan-500/30 overflow-hidden shadow-inner">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.6)]"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      ease: 'linear',
                      repeatDelay: 0
                    }}
                  />
                </motion.div>
                
                {steps.length > 0 && currentStep > 0 && (
                  <motion.div
                    className="absolute inset-y-0 left-0 pointer-events-none"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  >
                    <motion.div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.8)]"
                      animate={{
                        scale: [1, 1.3, 1],
                        boxShadow: [
                          '0 0 15px rgba(0,255,255,0.8)',
                          '0 0 25px rgba(0,255,255,1)',
                          '0 0 15px rgba(0,255,255,0.8)'
                        ]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </div>
              
              <div className="flex justify-between text-xs text-gray-400 font-mono">
                <span>Step {currentStep} / {steps.length}</span>
                {steps.length > 0 && currentStep >= steps.length && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-green-400 font-semibold flex items-center gap-1"
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      ✓
                    </motion.span>
                    Complete
                  </motion.span>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-500/20"
        >
          <div className="flex items-center gap-2 text-cyan-400 mb-6">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-bold text-lg">Legend</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Comparing State */}
            <motion.div
              className="relative p-4 rounded-lg bg-gray-800/50 border border-yellow-500/50 overflow-hidden group hover:border-yellow-400 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative space-y-3">
                <motion.div
                  className="w-full h-16 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(234, 179, 8, 0.6)',
                      '0 0 40px rgba(234, 179, 8, 0.8)',
                      '0 0 20px rgba(234, 179, 8, 0.6)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="text-center">
                  <div className="text-yellow-300 font-semibold text-sm">Comparing</div>
                  <div className="text-gray-400 text-xs mt-1">Elements being compared</div>
                </div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              className="relative p-4 rounded-lg bg-gray-800/50 border border-red-500/50 overflow-hidden group hover:border-red-400 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.5 }}
              />
              <div className="relative space-y-3">
                <motion.div
                  className="w-full h-16 bg-gradient-to-t from-red-500 to-red-300 rounded-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(239, 68, 68, 0.6)',
                      '0 0 40px rgba(239, 68, 68, 0.8)',
                      '0 0 20px rgba(239, 68, 68, 0.6)'
                    ],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="text-center">
                  <div className="text-red-300 font-semibold text-sm">Swapping</div>
                  <div className="text-gray-400 text-xs mt-1">Elements being swapped</div>
                </div>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              className="relative p-4 rounded-lg bg-gray-800/50 border border-green-500/50 overflow-hidden group hover:border-green-400 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 1 }}
              />
              <div className="relative space-y-3">
                <motion.div
                  className="w-full h-16 bg-gradient-to-t from-green-500 to-green-300 rounded-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(34, 197, 94, 0.6)',
                      '0 0 40px rgba(34, 197, 94, 0.8)',
                      '0 0 20px rgba(34, 197, 94, 0.6)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="text-center">
                  <div className="text-green-300 font-semibold text-sm">Sorted</div>
                  <div className="text-gray-400 text-xs mt-1">In final position</div>
                </div>
              </div>
            </motion.div>

            {/* Unsorted State */}
            <motion.div
              className="relative p-4 rounded-lg bg-gray-800/50 border border-cyan-500/50 overflow-hidden group hover:border-cyan-400 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 1.5 }}
              />
              <div className="relative space-y-3">
                <motion.div
                  className="w-full h-16 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(6, 182, 212, 0.6)',
                      '0 0 40px rgba(6, 182, 212, 0.8)',
                      '0 0 20px rgba(6, 182, 212, 0.6)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="text-center">
                  <div className="text-cyan-300 font-semibold text-sm">Unsorted</div>
                  <div className="text-gray-400 text-xs mt-1">Awaiting sort</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-6 border-t border-cyan-500/20"
          >
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-3 h-3 rounded-full bg-purple-500"
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(168, 85, 247, 0.6)',
                      '0 0 20px rgba(168, 85, 247, 0.8)',
                      '0 0 10px rgba(168, 85, 247, 0.6)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-gray-400">Neon glow indicates active state</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-3 h-3 rounded-full bg-pink-500"
                  animate={{
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-gray-400">Pulse effect during operations</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}