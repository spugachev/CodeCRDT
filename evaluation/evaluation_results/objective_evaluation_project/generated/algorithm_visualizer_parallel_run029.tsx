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
  useEffect(() => {
    if (!isPlaying) return;

    const delay = 1000 - (speed[0] * 9.5);
    const timer = setTimeout(() => {
      animateSteps();
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, speed, animateSteps]);

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

  const startVisualization = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) {
      return;
    }
    setIsPlaying(true);
    
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {    setIsPlaying(false);

    
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

    if (algorithm === 'bubble') {
      const sortedIndices: number[] = [];
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          steps.push(createStep([...arr], [j, j + 1], [], sortedIndices));
          
          if (arr[j].value > arr[j + 1].value) {
            steps.push(createStep([...arr], [], [j, j + 1], sortedIndices));
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            steps.push(createStep([...arr], [], [], sortedIndices));
          }
        }
        sortedIndices.push(arr.length - i - 1);
      }
      steps.push(createStep([...arr], [], [], Array.from({ length: arr.length }, (_, i) => i)));
    } else if (algorithm === 'insertion') {
      const sortedIndices: number[] = [0];
      for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        
        steps.push(createStep([...arr], [i], [], sortedIndices));
        
        while (j >= 0 && arr[j].value > key.value) {
          steps.push(createStep([...arr], [j, j + 1], [], sortedIndices));
          arr[j + 1] = arr[j];
          steps.push(createStep([...arr], [], [j, j + 1], sortedIndices));
          j--;
        }
        arr[j + 1] = key;
        sortedIndices.push(i);
        steps.push(createStep([...arr], [], [], sortedIndices));
      }
      steps.push(createStep([...arr], [], [], Array.from({ length: arr.length }, (_, i) => i)));
    } else if (algorithm === 'quick') {
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
        }
      };

      quickSort(0, arr.length - 1);
      steps.push(createStep([...arr], [], [], Array.from({ length: arr.length }, (_, i) => i)));
    } else if (algorithm === 'merge') {
      const sortedIndices: number[] = [];
      
      const merge = (left: number, mid: number, right: number) => {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
          steps.push(createStep([...arr], [left + i, mid + 1 + j], [], sortedIndices));
          
          if (leftArr[i].value <= rightArr[j].value) {
            arr[k] = leftArr[i];
            i++;
          } else {
            arr[k] = rightArr[j];
            j++;
          }
          steps.push(createStep([...arr], [], [k], sortedIndices));
          k++;
        }
        
        while (i < leftArr.length) {
          arr[k] = leftArr[i];
          steps.push(createStep([...arr], [], [k], sortedIndices));
          i++;
          k++;
        }
        
        while (j < rightArr.length) {
          arr[k] = rightArr[j];
          steps.push(createStep([...arr], [], [k], sortedIndices));
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
      steps.push(createStep([...arr], [], [], Array.from({ length: arr.length }, (_, i) => i)));
    }

    setSteps(steps);
    setCurrentStep(0);</xcrct_code_output>
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
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)]"
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
                        className={`
                          relative px-4 py-3 rounded-lg text-left transition-all duration-300
                          ${selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border border-gray-700 hover:border-cyan-500/50'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <div className="text-sm font-medium text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Zap className="w-4 h-4" />
                      <h3 className="text-sm font-semibold uppercase tracking-wider">Speed</h3>
                    </div>
                    <span className="text-xs text-gray-400">{speed[0]}%</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={100}
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
                    <span className="text-xs text-gray-400">{arraySize[0]}</span>
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
                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all duration-300"
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
                    className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 shadow-[0_0_15px_rgba(255,0,102,0.3)] transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={() => {
                      generateRandomArray();
                      generateSortingSteps(selectedAlgorithm);
                    }}
                    disabled={isPlaying}
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Generate New
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
                </div></parameter>

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
                    className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:hover:shadow-cyan-400/80 [&_[role=slider]]:transition-shadow [&>span]:bg-cyan-500/30 [&>span>span]:bg-gradient-to-r [&>span>span]:from-cyan-500 [&>span>span]:to-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.div
                    className="relative flex-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={isPlaying ? pauseVisualization : startVisualization}
                      disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-6 rounded-lg border-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        boxShadow: isPlaying 
                          ? '0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4)' 
                          : '0 0 30px rgba(6, 182, 212, 0.8), 0 0 60px rgba(6, 182, 212, 0.4)'
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                        animate={{
                          x: ['-100%', '200%']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      />
                      <motion.div
                        className="relative flex items-center justify-center gap-2"
                        initial={false}
                        animate={{
                          scale: isPlaying ? [1, 1.1, 1] : 1
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: isPlaying ? Infinity : 0,
                          repeatDelay: 0.3
                        }}
                      >
                        <motion.div
                          initial={false}
                          animate={{
                            rotate: isPlaying ? 0 : 0,
                            scale: isPlaying ? 1 : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" fill="currentColor" />
                          ) : (
                            <Play className="w-5 h-5" fill="currentColor" />
                          )}
                        </motion.div>
                        <span className="text-sm font-bold tracking-wide">
                          {isPlaying ? 'PAUSE' : 'PLAY'}
                        </span>
                      </motion.div>
                    </Button>
                  </motion.div>
                  <motion.button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-2 border-pink-500/50 rounded-lg text-pink-300 font-semibold hover:from-pink-500/30 hover:to-purple-500/30 hover:border-pink-400 hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </motion.div>
                    Reset
                  </motion.button></parameter>
</invoke>
                </div>
              </div>
            </div>

            {/* TODO:StatsPanel Real-time statistics panel showing comparisons, swaps, and progress */}
          </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-2xl shadow-purple-500/20"
            >
              <div className="flex items-center gap-2 mb-4 text-purple-400">
                <BarChart3 className="w-5 h-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Statistics</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-lg p-4 relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 animate-pulse" />
                  <div className="relative z-10">
                    <div className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Comparisons</div>
                    <div className="text-3xl font-bold text-cyan-300">
                      {steps.reduce((acc, step) => acc + (step.comparingIndices.length > 0 ? 1 : 0), 0)}
                    </div>
                  </div>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-cyan-400"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ transformOrigin: 'left' }}
                  />
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 rounded-lg p-4 relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/20 to-pink-500/0 animate-pulse" />
                  <div className="relative z-10">
                    <div className="text-xs text-pink-400 uppercase tracking-wider mb-2">Swaps</div>
                    <div className="text-3xl font-bold text-pink-300">
                      {steps.reduce((acc, step) => acc + (step.swappingIndices.length > 0 ? 1 : 0), 0)}
                    </div>
                  </div>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-pink-400"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ transformOrigin: 'left' }}
                  />
                </motion.div>

                <motion.div
                  className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-lg p-4 relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 animate-pulse" />
                  <div className="relative z-10">
                    <div className="text-xs text-purple-400 uppercase tracking-wider mb-2">Progress</div>
                    <div className="text-3xl font-bold text-purple-300">
                      {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                    </div>
                  </div>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400"
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: steps.length > 0 ? currentStep / steps.length : 0 
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ transformOrigin: 'left' }}
                  />
                </motion.div>
              </div>

              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Steps</span>
                  <span className="text-purple-300 font-mono font-semibold">{steps.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-400">Current Step</span>
                  <span className="text-cyan-300 font-mono font-semibold">{currentStep}</span>
                </div>
              </div>
            </motion.div>
          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-8 shadow-2xl shadow-purple-500/20 min-h-[600px]">
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
                      <BarChart3 className="w-24 h-24 text-cyan-400/50" />
                    </motion.div>
                    <p className="text-gray-400 text-lg">Generate an array to start visualizing</p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    const colorIndex = index % NEON_COLORS.length;
                    const baseColor = NEON_COLORS[colorIndex];

                    let barColor = baseColor;
                    let glowIntensity = 0.3;
                    let borderColor = baseColor;

                    if (element.isSwapping) {
                      barColor = '#ff0066';
                      glowIntensity = 1;
                      borderColor = '#ff0066';
                    } else if (element.isComparing) {
                      barColor = '#ffff00';
                      glowIntensity = 0.8;
                      borderColor = '#ffff00';
                    } else if (element.isSorted) {
                      barColor = '#00ff00';
                      glowIntensity = 0.5;
                      borderColor = '#00ff00';
                    }

                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          scale: element.isSwapping ? [1, 1.1, 1] : 1,
                          y: element.isSwapping ? [0, -10, 0] : 0
                        }}
                        transition={{
                          height: { duration: 0.3, ease: 'easeOut' },
                          scale: { duration: 0.2 },
                          y: { duration: 0.3 }
                        }}
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `
                            0 0 ${20 * glowIntensity}px ${barColor},
                            0 0 ${40 * glowIntensity}px ${barColor},
                            inset 0 0 ${10 * glowIntensity}px rgba(255, 255, 255, 0.5)
                          `,
                          border: `2px solid ${borderColor}`
                        }}
                      >
                        {/* Swap trail effect */}
                        {element.isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              initial={{ opacity: 0.8, scale: 1 }}
                              animate={{ opacity: 0, scale: 1.5 }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              style={{
                                backgroundColor: barColor,
                                filter: 'blur(8px)'
                              }}
                            />
                            <motion.div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                              animate={{
                                y: [0, -10, 0],
                                opacity: [1, 0.5, 1]
                              }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            >
                              <div className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(255,0,102,1)]" />
                            </motion.div>
                          </>
                        )}

                        {/* Comparison indicator */}
                        {element.isComparing && (
                          <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.8, 1, 0.8]
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >
                            <div className="relative">
                              <Zap className="w-4 h-4 text-yellow-400" style={{
                                filter: 'drop-shadow(0 0 8px rgba(255, 255, 0, 1))'
                              }} />
                            </div>
                          </motion.div>
                        )}

                        {/* Sorted checkmark */}
                        {element.isSorted && (
                          <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                          >
                            <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(0,255,0,1)]" />
                          </motion.div>
                        )}

                        {/* Value label for larger arrays */}
                        {array.length <= 30 && (
                          <motion.div
                            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono text-gray-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                          >
                            {element.value}
                          </motion.div>
                        )}

                        {/* Inner glow effect */}
                        <div
                          className="absolute inset-0 rounded-t-lg opacity-30"
                          style={{
                            background: `linear-gradient(to top, transparent, ${barColor})`
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                
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
                          ? '0 0 20px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.3)'
                          : element.isSwapping
                          ? '0 0 30px rgba(255, 0, 102, 1), 0 0 60px rgba(255, 0, 102, 0.7), inset 0 0 30px rgba(255, 0, 102, 0.4)'
                          : element.isComparing
                          ? '0 0 25px rgba(255, 255, 0, 1), 0 0 50px rgba(255, 255, 0, 0.6), inset 0 0 25px rgba(255, 255, 0, 0.3)'
                          : `0 0 15px ${neonColor}80, 0 0 30px ${neonColor}40, inset 0 0 15px ${neonColor}30`,
                        scale: element.isSwapping ? 1.1 : element.isComparing ? 1.05 : 1,
                      }}
                      transition={{
                        height: { duration: 0.5, ease: 'easeInOut' },
                        backgroundColor: { duration: 0.3 },
                        boxShadow: { duration: 0.3 },
                        scale: { duration: 0.2, type: 'spring', stiffness: 300 },
                        opacity: { duration: 0.5 }
                      }}
                      style={{
                        background: element.isSorted
                          ? 'linear-gradient(to top, #00ff00, #00ff88)'
                          : element.isSwapping
                          ? 'linear-gradient(to top, #ff0066, #ff00ff)'
                          : element.isComparing
                          ? 'linear-gradient(to top, #ffff00, #ffaa00)'
                          : `linear-gradient(to top, ${neonColor}, ${neonColor}dd)`,
                      }}
                    >
                      {/* Glow effect overlay */}
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        animate={{
                          opacity: element.isSwapping || element.isComparing ? [0.3, 0.7, 0.3] : 0.2,
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: element.isSwapping || element.isComparing ? Infinity : 0,
                        }}
                        style={{
                          background: `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.4), transparent 70%)`,
                        }}
                      />

                      {/* Value label */}
                      {arraySize[0] <= 30 && (
                        <motion.div
                          className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            color: element.isSorted
                              ? '#00ff00'
                              : element.isSwapping
                              ? '#ff0066'
                              : element.isComparing
                              ? '#ffff00'
                              : '#ffffff',
                            textShadow: element.isSorted
                              ? '0 0 10px rgba(0, 255, 0, 1)'
                              : element.isSwapping
                              ? '0 0 10px rgba(255, 0, 102, 1)'
                              : element.isComparing
                              ? '0 0 10px rgba(255, 255, 0, 1)'
                              : `0 0 8px ${neonColor}`,
                          }}
                          transition={{ delay: 0.2 }}
                        >
                          {element.value}
                        </motion.div>
                      )}

                      {/* Swap trail effect */}
                      {element.isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          initial={{ opacity: 0.8, scale: 1 }}
                          animate={{ 
                            opacity: 0, 
                            scale: 1.5,
                          }}
                          transition={{ 
                            duration: 0.6,
                            repeat: Infinity,
                          }}
                          style={{
                            background: 'radial-gradient(circle, rgba(255, 0, 102, 0.6), transparent 70%)',
                            filter: 'blur(8px)',
                          }}
                        />
                      )}

                      {/* Comparison pulse indicator */}
                      {element.isComparing && (
                        <motion.div
                          className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                          }}
                          style={{
                            backgroundColor: '#ffff00',
                            boxShadow: '0 0 15px rgba(255, 255, 0, 1), 0 0 30px rgba(255, 255, 0, 0.6)',
                          }}
                        />
                      )}

                      {/* Sorted checkmark indicator */}
                      {element.isSorted && arraySize[0] <= 40 && (
                        <motion.div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                          style={{
                            textShadow: '0 0 10px rgba(0, 255, 0, 1)',
                          }}
                        >
                          ✓
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-4 shadow-lg shadow-purple-500/10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-300 font-medium">Sorting Progress</span>
                    <span className="text-cyan-300 font-mono">
                      {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                    </span>
                  </div>
                  
                  <div className="relative h-3 bg-gray-800/80 rounded-full overflow-hidden border border-purple-500/30">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ 
                        width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%',
                        boxShadow: [
                          '0 0 20px rgba(6, 182, 212, 0.8)',
                          '0 0 30px rgba(168, 85, 247, 0.8)',
                          '0 0 20px rgba(6, 182, 212, 0.8)'
                        ]
                      }}
                      transition={{ 
                        width: { duration: 0.3, ease: 'easeOut' },
                        boxShadow: { duration: 2, repeat: Infinity }
                      }}
                    />
                    
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      style={{
                        width: '50%'
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Step {currentStep} of {steps.length}</span>
                    {currentStep >= steps.length && steps.length > 0 && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-green-400 font-semibold"
                      >
                        ✓ Complete
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-cyan-300 uppercase tracking-wider">
              Legend
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
              whileHover={{ scale: 1.05, borderColor: 'rgba(156, 163, 175, 0.5)' }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-gray-500 to-gray-300 rounded"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(156, 163, 175, 0.3)',
                    '0 0 20px rgba(156, 163, 175, 0.5)',
                    '0 0 10px rgba(156, 163, 175, 0.3)'
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
              className="flex items-center gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(234, 179, 8, 0.5)' }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(234, 179, 8, 0.5)',
                    '0 0 30px rgba(234, 179, 8, 0.8)',
                    '0 0 15px rgba(234, 179, 8, 0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-yellow-300">Comparing</div>
                <div className="text-xs text-yellow-400/70">Active check</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-pink-500/10 rounded-lg border border-pink-500/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(236, 72, 153, 0.5)' }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-pink-500 to-pink-300 rounded"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(236, 72, 153, 0.5)',
                    '0 0 30px rgba(236, 72, 153, 0.8)',
                    '0 0 15px rgba(236, 72, 153, 0.5)'
                  ],
                  x: [-2, 2, -2]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-pink-300">Swapping</div>
                <div className="text-xs text-pink-400/70">Exchanging</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/30"
              whileHover={{ scale: 1.05, borderColor: 'rgba(34, 197, 94, 0.5)' }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-6 h-12 bg-gradient-to-t from-green-500 to-green-300 rounded"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(34, 197, 94, 0.5)',
                    '0 0 30px rgba(34, 197, 94, 0.8)',
                    '0 0 15px rgba(34, 197, 94, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-green-300">Sorted</div>
                <div className="text-xs text-green-400/70">In place</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}