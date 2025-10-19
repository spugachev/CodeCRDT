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

  // Animation effect for step-by-step visualization
  const animateSteps = useCallback(() => {
    if (currentStep < steps.length && isPlaying) {
      const step = steps[currentStep];
      setArray(step.array);
      setCurrentStep(prev => prev + 1);
    } else if (currentStep >= steps.length) {
      setIsPlaying(false);
    }
  }, [currentStep, steps, isPlaying]);

  // Effect to control animation timing
  React.useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
      const timer = setTimeout(animateSteps, delay);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, steps.length, speed, animateSteps]);
  const startVisualization = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) return;
    setIsPlaying(true);
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {    setIsPlaying(false);

    setIsPlaying(false);
  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    const arr = [...array];
    const newSteps: AlgorithmStep[] = [];
    
    const addStep = (comparingIndices: number[] = [], swappingIndices: number[] = [], sortedIndices: number[] = []) => {
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

    if (algorithm === 'bubble') {
      const sorted: number[] = [];
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          addStep([j, j + 1], [], sorted);
          if (arr[j].value > arr[j + 1].value) {
            addStep([j, j + 1], [j, j + 1], sorted);
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            addStep([], [], sorted);
          }
        }
        sorted.push(arr.length - i - 1);
        addStep([], [], sorted);
      }
    } else if (algorithm === 'insertion') {
      const sorted: number[] = [0];
      addStep([], [], sorted);
      for (let i = 1; i < arr.length; i++) {
        let j = i;
        addStep([j], [], sorted);
        while (j > 0 && arr[j - 1].value > arr[j].value) {
          addStep([j - 1, j], [], sorted);
          addStep([j - 1, j], [j - 1, j], sorted);
          [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
          j--;
          addStep([], [], sorted);
        }
        sorted.push(i);
        addStep([], [], sorted);
      }
    } else if (algorithm === 'quick') {
      const sorted: number[] = [];
      const quickSort = (low: number, high: number) => {
        if (low < high) {
          const pivotIdx = partition(low, high);
          sorted.push(pivotIdx);
          addStep([], [], sorted);
          quickSort(low, pivotIdx - 1);
          quickSort(pivotIdx + 1, high);
        } else if (low === high) {
          sorted.push(low);
          addStep([], [], sorted);
        }
      };
      
      const partition = (low: number, high: number): number => {
        const pivot = arr[high].value;
        addStep([high], [], sorted);
        let i = low - 1;
        for (let j = low; j < high; j++) {
          addStep([j, high], [], sorted);
          if (arr[j].value < pivot) {
            i++;
            if (i !== j) {
              addStep([i, j], [i, j], sorted);
              [arr[i], arr[j]] = [arr[j], arr[i]];
              addStep([], [], sorted);
            }
          }
        }
        addStep([i + 1, high], [i + 1, high], sorted);
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        addStep([], [], sorted);
        return i + 1;
      };
      
      quickSort(0, arr.length - 1);
    } else if (algorithm === 'merge') {
      const sorted: number[] = [];
      const mergeSort = (left: number, right: number) => {
        if (left < right) {
          const mid = Math.floor((left + right) / 2);
          mergeSort(left, mid);
          mergeSort(mid + 1, right);
          merge(left, mid, right);
        }
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
            addStep([k, mid + 1 + j], [k, mid + 1 + j], sorted);
            arr[k] = rightArr[j];
            j++;
          }
          k++;
          addStep([], [], sorted);
        }
        
        while (i < leftArr.length) {
          arr[k] = leftArr[i];
          i++;
          k++;
        }
        
        while (j < rightArr.length) {
          arr[k] = rightArr[j];
          j++;
          k++;
        }
        
        for (let idx = left; idx <= right; idx++) {
          if (!sorted.includes(idx)) sorted.push(idx);
        }
        addStep([], [], sorted);
      };
      
      mergeSort(0, arr.length - 1);
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
              transition={{ duration: 0.6 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-all duration-300"
            >
              <div className="space-y-6">
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Algorithm
                  </h3>
                  <div className="space-y-2">
                    {mockAlgorithms.map((algo) => (
                      <button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        disabled={isPlaying}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)] text-cyan-300'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 text-gray-400 hover:text-cyan-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-medium">{algo.name}</div>
                        <div className="text-xs opacity-70">{algo.complexity}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Array Size
                    </h3>
                    <span className="text-purple-300 font-mono text-lg">{arraySize[0]}</span>
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
                    <h3 className="text-pink-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Speed
                    </h3>
                    <span className="text-pink-300 font-mono text-lg">{speed[0]}%</span>
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
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        {currentStep >= steps.length && steps.length > 0 ? 'Replay' : 'Start'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-6 rounded-lg shadow-[0_0_20px_rgba(255,0,255,0.5)] hover:shadow-[0_0_30px_rgba(255,0,255,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={() => generateSortingSteps(selectedAlgorithm)}
                    disabled={isPlaying || array.length === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,170,0.5)] hover:shadow-[0_0_30px_rgba(0,255,170,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Steps
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-300 font-mono font-semibold">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Array Length:</span>
                    <span className="text-purple-300 font-mono font-semibold">{array.length}</span>
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
                            : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:bg-cyan-500/10'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-white">{algo.name}</div>
                          <div className={`text-xs ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-400'
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
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 relative px-6 py-3 rounded-lg font-semibold text-white overflow-hidden transition-all duration-300 ${
                      array.length === 0 || (steps.length === 0 && !isPlaying)
                        ? 'bg-gray-700 border border-gray-600 cursor-not-allowed opacity-50'
                        : isPlaying
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 border-2 border-orange-400 shadow-[0_0_30px_rgba(255,165,0,0.6)]'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.6)]'
                    }`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: isPlaying ? ['-100%', '200%'] : '-100%'
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: isPlaying ? Infinity : 0,
                        ease: 'linear'
                      }}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      <motion.div
                        key={isPlaying ? 'pause' : 'play'}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" fill="currentColor" />
                        ) : (
                          <Play className="w-5 h-5" fill="currentColor" />
                        )}
                      </motion.div>
                      {isPlaying ? 'Pause' : 'Play'}
                    </span>
                  </motion.button>
                  {/* TODO:ResetButton Glowing reset button with rotation animation on click */}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              <h3 className="text-purple-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4" />
                Statistics
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Comparisons Counter */}
                <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-lg p-4 group hover:border-cyan-400/50 transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="relative space-y-1">
                    <div className="text-xs text-cyan-400/70 uppercase tracking-wider font-medium">Comparisons</div>
                    <div className="flex items-baseline gap-2">
                      <motion.span
                        key={currentStep}
                        initial={{ scale: 1.2, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#67e8f9' }}
                        className="text-3xl font-bold text-cyan-300 font-mono"
                      >
                        {steps.slice(0, currentStep).filter(s => s.comparingIndices.length > 0).length}
                      </motion.span>
                      <span className="text-sm text-cyan-400/50">ops</span>
                    </div>
                  </div>
                  <motion.div
                    className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 5px rgba(0, 255, 255, 0.5)',
                        '0 0 20px rgba(0, 255, 255, 1)',
                        '0 0 5px rgba(0, 255, 255, 0.5)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>

                {/* Swaps Counter */}
                <div className="relative overflow-hidden bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 rounded-lg p-4 group hover:border-pink-400/50 transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                  />
                  <div className="relative space-y-1">
                    <div className="text-xs text-pink-400/70 uppercase tracking-wider font-medium">Swaps</div>
                    <div className="flex items-baseline gap-2">
                      <motion.span
                        key={`swap-${currentStep}`}
                        initial={{ scale: 1.2, color: '#ff0066' }}
                        animate={{ scale: 1, color: '#f9a8d4' }}
                        className="text-3xl font-bold text-pink-300 font-mono"
                      >
                        {steps.slice(0, currentStep).filter(s => s.swappingIndices.length > 0).length}
                      </motion.span>
                      <span className="text-sm text-pink-400/50">ops</span>
                    </div>
                  </div>
                  <motion.div
                    className="absolute top-2 right-2 w-2 h-2 bg-pink-400 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 5px rgba(255, 0, 102, 0.5)',
                        '0 0 20px rgba(255, 0, 102, 1)',
                        '0 0 5px rgba(255, 0, 102, 0.5)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                </div>

                {/* Progress Indicator */}
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-lg p-4 group hover:border-purple-400/50 transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
                  />
                  <div className="relative space-y-2">
                    <div className="text-xs text-purple-400/70 uppercase tracking-wider font-medium">Progress</div>
                    <div className="flex items-baseline gap-2">
                      <motion.span
                        key={`progress-${currentStep}`}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-3xl font-bold text-purple-300 font-mono"
                      >
                        {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}
                      </motion.span>
                      <span className="text-sm text-purple-400/50">%</span>
                    </div>
                    <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden border border-purple-500/20">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full relative"
                        initial={{ width: '0%' }}
                        animate={{ 
                          width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      </motion.div>
                    </div>
                  </div>
                  <motion.div
                    className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 5px rgba(168, 85, 247, 0.5)',
                        '0 0 20px rgba(168, 85, 247, 1)',
                        '0 0 5px rgba(168, 85, 247, 0.5)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                  />
                </div>

                {/* Current Step */}
                <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg p-4 group hover:border-green-400/50 transition-all duration-300">
                  <div className="relative space-y-1">
                    <div className="text-xs text-green-400/70 uppercase tracking-wider font-medium">Current Step</div>
                    <div className="flex items-baseline gap-2">
                      <motion.span
                        key={`step-${currentStep}`}
                        initial={{ scale: 1.2, color: '#00ff00' }}
                        animate={{ scale: 1, color: '#86efac' }}
                        className="text-3xl font-bold text-green-300 font-mono"
                      >
                        {currentStep}
                      </motion.span>
                      <span className="text-sm text-green-400/50">/ {steps.length}</span>
                    </div>
                  </div>
                  {isPlaying && (
                    <motion.div
                      className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        boxShadow: [
                          '0 0 5px rgba(0, 255, 0, 0.5)',
                          '0 0 20px rgba(0, 255, 0, 1)',
                          '0 0 5px rgba(0, 255, 0, 0.5)'
                        ]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
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
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 flex flex-col items-center justify-center space-y-6"
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
                    <h3 className="text-2xl font-bold text-purple-300">Ready to Visualize</h3>
                    <p className="text-gray-400">Generate an array to begin</p>
                  </div>
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(168, 85, 247, 0.4)',
                        '0 0 40px rgba(168, 85, 247, 0.6)',
                        '0 0 20px rgba(168, 85, 247, 0.4)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-6 py-3 bg-purple-500/20 border border-purple-400/50 rounded-lg"
                  >
                    <span className="text-purple-300 font-medium">Click "Generate Array" to start</span>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    const barColor = element.isSorted
                      ? '#00ff00'
                      : element.isSwapping
                      ? '#ff0066'
                      : element.isComparing
                      ? '#ffff00'
                      : NEON_COLORS[index % NEON_COLORS.length];

                    return (
                      <motion.div
                        key={element.id}
                        layout
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          scale: element.isSwapping ? 1.1 : element.isComparing ? 1.05 : 1
                        }}
                        transition={{
                          height: { duration: 0.3, ease: "easeOut" },
                          scale: { duration: 0.2 },
                          layout: { duration: 0.5, ease: "easeInOut" }
                        }}
                        className="relative flex-1 min-w-[8px] max-w-[60px] rounded-t-lg"
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `0 0 ${element.isSwapping ? '30px' : element.isComparing ? '20px' : '10px'} ${barColor}`,
                          border: `1px solid ${barColor}`
                        }}
                      >
                        {/* Glow effect overlay */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          animate={{
                            opacity: element.isSwapping || element.isComparing ? [0.3, 0.7, 0.3] : 0
                          }}
                          transition={{ duration: 0.5, repeat: element.isSwapping || element.isComparing ? Infinity : 0 }}
                          style={{
                            background: `linear-gradient(to top, transparent, ${barColor})`
                          }}
                        />

                        {/* Swap trail effect */}
                        {element.isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              initial={{ opacity: 0, scale: 1 }}
                              animate={{ opacity: [0.8, 0], scale: [1, 1.5] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              style={{
                                border: `2px solid ${barColor}`,
                                boxShadow: `0 0 20px ${barColor}`
                              }}
                            />
                            <motion.div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                              animate={{
                                y: [-10, 0, -10],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            >
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: barColor, boxShadow: `0 0 10px ${barColor}` }} />
                            </motion.div>
                          </>
                        )}

                        {/* Comparison indicator */}
                        {element.isComparing && !element.isSwapping && (
                          <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, 180, 360]
                              }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-3 h-3 border-2 rounded-full"
                              style={{ borderColor: barColor, boxShadow: `0 0 10px ${barColor}` }}
                            />
                          </motion.div>
                        )}

                        {/* Sorted checkmark */}
                        {element.isSorted && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center"
                              style={{ boxShadow: '0 0 15px rgba(0, 255, 0, 0.6)' }}
                            >
                              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </motion.div>
                        )}

                        {/* Value label */}
                        {array.length <= 30 && (
                          <motion.div
                            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white/90"
                            style={{ textShadow: `0 0 5px ${barColor}` }}
                            animate={{
                              scale: element.isSwapping || element.isComparing ? [1, 1.2, 1] : 1
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {element.value}
                          </motion.div>
                        )}

                        {/* Particle effects for swapping */}
                        {element.isSwapping && (
                          <>
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute top-0 left-1/2 w-1 h-1 rounded-full"
                                style={{ backgroundColor: barColor }}
                                initial={{ x: 0, y: 0, opacity: 1 }}
                                animate={{
                                  x: [0, (Math.random() - 0.5) * 40],
                                  y: [0, -30 - Math.random() * 20],
                                  opacity: [1, 0]
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
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                
              </div>
            </div>

                        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-300 font-medium">Sorting Progress</span>
                <span className="text-cyan-300 font-mono">
                  {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                </span>
              </div>
              
              <div className="relative h-3 bg-gray-800/80 rounded-full overflow-hidden border border-purple-500/30 shadow-inner">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
                
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ 
                    x: ['-100%', '200%'],
                    opacity: steps.length > 0 && currentStep < steps.length ? [0.5, 1, 0.5] : 0
                  }}
                  transition={{ 
                    x: { duration: 1.5, repeat: Infinity, ease: 'linear' },
                    opacity: { duration: 1, repeat: Infinity }
                  }}
                  style={{ width: '50%' }}
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
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
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
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-cyan-400 font-semibold text-lg uppercase tracking-wider">
              Legend
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
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
                <div className="text-white font-semibold text-sm">Default</div>
                <div className="text-gray-400 text-xs">Unsorted element</div>
              </div>
            </motion.div>

            {/* Comparing State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300"
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
                <div className="text-white font-semibold text-sm">Comparing</div>
                <div className="text-gray-400 text-xs">Being compared</div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-pink-500/30 hover:border-pink-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-12 rounded bg-gradient-to-t from-pink-500 to-pink-300 shadow-[0_0_20px_rgba(255,0,255,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255,0,255,0.8)',
                    '0 0 40px rgba(255,0,255,1)',
                    '0 0 20px rgba(255,0,255,0.8)'
                  ],
                  x: [-2, 2, -2]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div>
                <div className="text-white font-semibold text-sm">Swapping</div>
                <div className="text-gray-400 text-xs">Exchanging positions</div>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-300"
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
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-white font-semibold text-sm">Sorted</div>
                <div className="text-gray-400 text-xs">In final position</div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-6 border-t border-gray-700/50"
          >
            <div className="flex items-start gap-3 text-sm">
              <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-400 leading-relaxed">
                Watch the bars change colors as the algorithm compares, swaps, and sorts elements. 
                <span className="text-cyan-300 font-semibold"> Glowing effects</span> indicate active operations in real-time.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}