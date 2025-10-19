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
  useState(() => {
    const cleanup = animateSteps();
    return cleanup;
  });
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
    setCurrentStep(0);</parameter>
</invoke>
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
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.3)]"
            >
              <div className="space-y-6">
                {/* Algorithm Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">Algorithm</h3>
                  </div>
                  <div className="space-y-2">
                    {mockAlgorithms.map((algo) => (
                      <button
                        key={algo.id}
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          generateSortingSteps(algo.id as AlgorithmType);
                        }}
                        disabled={isPlaying}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)]'
                            : 'bg-gray-700/30 border border-gray-600/30 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(0,255,255,0.3)]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-medium text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-cyan-400 font-semibold">Speed</label>
                    <span className="text-white text-sm bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/30">
                      {speed[0]}ms
                    </span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={200}
                    step={10}
                    className="cursor-pointer"
                  />
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-cyan-400 font-semibold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Array Size
                    </label>
                    <span className="text-white text-sm bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
                      {arraySize[0]}
                    </span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={(val) => {
                      setArraySize(val);
                      if (!isPlaying) {
                        generateRandomArray();
                      }
                    }}
                    min={5}
                    max={50}
                    step={5}
                    disabled={isPlaying}
                    className="cursor-pointer"
                  />
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        {currentStep >= steps.length ? 'Start' : 'Resume'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-6 rounded-xl shadow-[0_0_20px_rgba(255,0,255,0.4)] hover:shadow-[0_0_30px_rgba(255,0,255,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-400 font-mono">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Array Elements:</span>
                    <span className="text-purple-400 font-mono">{array.length}</span>
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
                        disabled={isPlaying}
                      >
                        <div className="text-left">
                          <div className={`text-sm font-semibold ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-300'
                          }`}>
                            {algo.name}
                          </div>
                          <div className={`text-xs mt-1 ${
                            selectedAlgorithm === algo.id ? 'text-cyan-400' : 'text-gray-500'
                          }`}>
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
                      <span className="text-sm text-gray-400">Elements</span>
                      <motion.span 
                        key={arraySize[0]}
                        initial={{ scale: 1.3, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#9ca3af' }}
                        className="text-sm font-mono font-bold"
                      >
                        {arraySize[0]}
                      </motion.span>
                    </div>
                    <div className="relative">
                      <Slider
                        value={arraySize}
                        onValueChange={(value) => {
                          setArraySize(value);
                          if (!isPlaying) {
                            generateRandomArray();
                          }
                        }}
                        min={5}
                        max={100}
                        step={1}
                        disabled={isPlaying}
                        className="cursor-pointer [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-400 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-cyan-400/70 [&_[role=slider]]:hover:scale-110 [&>.relative>.absolute]:bg-gradient-to-r [&>.relative>.absolute]:from-cyan-500/30 [&>.relative>.absolute]:to-purple-500/30 [&>.relative>.absolute]:h-2"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-sm pointer-events-none" />
                    </div>
                  </div></parameter>
</invoke>
                </div>

                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={isPlaying ? pauseVisualization : startVisualization}
                      disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        boxShadow: isPlaying 
                          ? '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(6, 182, 212, 0.4)'
                          : '0 0 20px rgba(168, 85, 247, 0.4)'
                      }}
                    >
                      <motion.div
                        className="flex items-center justify-center gap-2"
                        animate={isPlaying ? {
                          scale: [1, 1.1, 1],
                        } : {}}
                        transition={{
                          duration: 1,
                          repeat: isPlaying ? Infinity : 0,
                          ease: "easeInOut"
                        }}
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
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={resetVisualization}
                      variant="outline"
                      className="w-full border-2 border-pink-500/50 bg-gray-900/50 hover:bg-pink-500/20 text-pink-400 font-semibold py-6 rounded-xl transition-all duration-300"
                      style={{
                        boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
                      }}
                    >
                      <motion.div
                        className="flex items-center justify-center gap-2"
                        whileHover={{
                          rotate: -180,
                        }}
                        transition={{
                          duration: 0.6,
                          ease: "easeInOut"
                        }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </motion.div>
                      <span>Reset</span>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={generateRandomArray}
                      variant="outline"
                      className="w-full border-2 border-cyan-500/50 bg-gray-900/50 hover:bg-cyan-500/20 text-cyan-400 font-semibold py-6 rounded-xl transition-all duration-300"
                      style={{
                        boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
                      }}
                    >
                      <motion.div
                        className="flex items-center justify-center gap-2"
                        whileHover={{
                          rotate: [0, -10, 10, -10, 10, 0],
                        }}
                        transition={{
                          duration: 0.5,
                        }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      <span>Generate New</span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* TODO:StatsPanel Real-time statistics panel showing comparisons, swaps, and progress */}
          </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-purple-400 font-semibold text-lg">Statistics</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl p-4 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-cyan-300 font-medium uppercase tracking-wider">Comparisons</span>
                    <motion.div
                      animate={{
                        scale: steps[currentStep]?.comparingIndices.length > 0 ? [1, 1.2, 1] : 1,
                        opacity: steps[currentStep]?.comparingIndices.length > 0 ? [1, 0.7, 1] : 1
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                    />
                  </div>
                  <motion.div
                    key={steps.slice(0, currentStep).filter(s => s.comparingIndices.length > 0).length}
                    initial={{ scale: 1.3, color: '#00ffff' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-3xl font-bold text-white font-mono"
                  >
                    {steps.slice(0, currentStep).filter(s => s.comparingIndices.length > 0).length}
                  </motion.div>
                  <div className="mt-1 text-xs text-cyan-400/70">
                    Total comparisons made
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-xl p-4 border border-pink-500/30 shadow-[0_0_15px_rgba(255,0,102,0.2)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-pink-300 font-medium uppercase tracking-wider">Swaps</span>
                    <motion.div
                      animate={{
                        scale: steps[currentStep]?.swappingIndices.length > 0 ? [1, 1.2, 1] : 1,
                        opacity: steps[currentStep]?.swappingIndices.length > 0 ? [1, 0.7, 1] : 1
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(255,0,102,0.8)]"
                    />
                  </div>
                  <motion.div
                    key={steps.slice(0, currentStep).filter(s => s.swappingIndices.length > 0).length}
                    initial={{ scale: 1.3, color: '#ff0066' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-3xl font-bold text-white font-mono"
                  >
                    {steps.slice(0, currentStep).filter(s => s.swappingIndices.length > 0).length}
                  </motion.div>
                  <div className="mt-1 text-xs text-pink-400/70">
                    Elements swapped
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-purple-300 font-medium uppercase tracking-wider">Progress</span>
                    <motion.div
                      animate={{
                        rotate: isPlaying ? 360 : 0
                      }}
                      transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                      className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                    />
                  </div>
                  <motion.div
                    key={steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}
                    initial={{ scale: 1.3, color: '#a855f7' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    className="text-3xl font-bold text-white font-mono"
                  >
                    {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                  </motion.div>
                  <div className="mt-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(0,255,170,0.8)]" />
                    <span className="text-gray-400">Step:</span>
                    <span className="text-white font-mono font-semibold">{currentStep}</span>
                    <span className="text-gray-500">/</span>
                    <span className="text-gray-400 font-mono">{steps.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Status:</span>
                    <motion.span
                      animate={{
                        color: isPlaying ? '#00ffaa' : currentStep === steps.length && steps.length > 0 ? '#00ffff' : '#9ca3af'
                      }}
                      className="font-semibold"
                    >
                      {isPlaying ? 'Running' : currentStep === steps.length && steps.length > 0 ? 'Complete' : 'Ready'}
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-lg shadow-purple-500/20 min-h-[600px]">
              {array.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
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
                    <h3 className="text-2xl font-semibold text-cyan-300">No Array Generated</h3>
                    <p className="text-gray-400">Click "Generate Array" to start visualizing</p>
                  </div>
                  <Button
                    onClick={generateRandomArray}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all duration-300"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Array
                  </Button>
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-[500px] flex items-end justify-center gap-1 px-4">
                    {(currentStep > 0 && currentStep <= steps.length ? steps[currentStep - 1].array : array).map((element, index) => {
                      const maxValue = 105;
                      const heightPercentage = (element.value / maxValue) * 100;
                      const barWidth = Math.max(8, Math.min(60, (100 / array.length) * 8));
                      
                      let barColor = NEON_COLORS[index % NEON_COLORS.length];
                      let glowIntensity = 0.3;
                      let scale = 1;
                      
                      if (element.isSorted) {
                        barColor = '#00ff00';
                        glowIntensity = 0.6;
                      } else if (element.isSwapping) {
                        barColor = '#ff0066';
                        glowIntensity = 0.8;
                        scale = 1.1;
                      } else if (element.isComparing) {
                        barColor = '#ffff00';
                        glowIntensity = 0.7;
                        scale = 1.05;
                      }
                      
                      return (
                        <motion.div
                          key={element.id}
                          className="relative flex flex-col items-center justify-end"
                          style={{ width: `${barWidth}px` }}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: scale
                          }}
                          transition={{
                            duration: 0.3,
                            scale: { duration: 0.2 }
                          }}
                        >
                          <motion.div
                            className="w-full rounded-t-lg relative overflow-hidden"
                            style={{
                              height: `${heightPercentage}%`,
                              backgroundColor: barColor,
                              boxShadow: `
                                0 0 ${20 * glowIntensity}px ${barColor},
                                0 0 ${40 * glowIntensity}px ${barColor},
                                inset 0 0 ${10 * glowIntensity}px rgba(255, 255, 255, 0.5)
                              `
                            }}
                            animate={{
                              height: `${heightPercentage}%`,
                              backgroundColor: barColor,
                              boxShadow: `
                                0 0 ${20 * glowIntensity}px ${barColor},
                                0 0 ${40 * glowIntensity}px ${barColor},
                                inset 0 0 ${10 * glowIntensity}px rgba(255, 255, 255, 0.5)
                              `
                            }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut"
                            }}
                          >
                            {/* Shimmer effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                              animate={{
                                x: ['-100%', '200%']
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                                repeatDelay: 1
                              }}
                            />
                            
                            {/* Trail effect for swapping */}
                            {element.isSwapping && (
                              <motion.div
                                className="absolute inset-0"
                                initial={{ opacity: 0 }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [1, 1.2, 1]
                                }}
                                transition={{
                                  duration: 0.5,
                                  repeat: Infinity
                                }}
                                style={{
                                  background: `radial-gradient(circle, ${barColor} 0%, transparent 70%)`,
                                  filter: 'blur(10px)'
                                }}
                              />
                            )}
                          </motion.div>
                          
                          {/* Value label */}
                          {array.length <= 50 && (
                            <motion.div
                              className="absolute -top-6 text-xs font-mono font-bold"
                              style={{
                                color: barColor,
                                textShadow: `0 0 10px ${barColor}`
                              }}
                              animate={{
                                scale: element.isComparing || element.isSwapping ? [1, 1.2, 1] : 1
                              }}
                              transition={{
                                duration: 0.3,
                                repeat: element.isComparing || element.isSwapping ? Infinity : 0
                              }}
                            >
                              {element.value}
                            </motion.div>
                          )}
                          
                          {/* Pulse ring for comparing */}
                          {element.isComparing && (
                            <motion.div
                              className="absolute inset-0 rounded-t-lg border-2"
                              style={{
                                borderColor: barColor
                              }}
                              animate={{
                                scale: [1, 1.3, 1],
                                opacity: [1, 0, 1]
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}</parameter>
</invoke>
              
              <div className="h-full flex items-end justify-center gap-1">
                {(currentStep < steps.length && steps[currentStep]?.array || array).map((element, index) => {
                  const displayArray = currentStep < steps.length && steps[currentStep]?.array ? steps[currentStep].array : array;
                  const maxValue = Math.max(...displayArray.map(el => el.value), 1);
                  const heightPercentage = (element.value / maxValue) * 100;
                  const colorIndex = index % NEON_COLORS.length;
                  const baseColor = NEON_COLORS[colorIndex];
                  
                  let barColor = baseColor;
                  let glowIntensity = 0.3;
                  let scale = 1;
                  
                  if (element.isSorted) {
                    barColor = '#00ff00';
                    glowIntensity = 0.6;
                  } else if (element.isSwapping) {
                    barColor = '#ff0066';
                    glowIntensity = 0.8;
                    scale = 1.1;
                  } else if (element.isComparing) {
                    barColor = '#ffff00';
                    glowIntensity = 0.7;
                    scale = 1.05;
                  }
                  
                  return (
                    <motion.div
                      key={element.id}
                      className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                      style={{
                        height: `${heightPercentage}%`,
                        backgroundColor: barColor,
                        boxShadow: `
                          0 0 ${10 * glowIntensity}px ${barColor},
                          0 0 ${20 * glowIntensity}px ${barColor},
                          0 0 ${30 * glowIntensity}px ${barColor}
                        `,
                      }}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: `${heightPercentage}%`,
                        opacity: 1,
                        scale: scale,
                        boxShadow: `
                          0 0 ${10 * glowIntensity}px ${barColor},
                          0 0 ${20 * glowIntensity}px ${barColor},
                          0 0 ${30 * glowIntensity}px ${barColor}
                        `,
                      }}
                      transition={{
                        height: { duration: 0.3, ease: 'easeOut' },
                        scale: { duration: 0.2, ease: 'easeInOut' },
                        backgroundColor: { duration: 0.2 },
                        boxShadow: { duration: 0.2 },
                      }}
                    >
                      {element.isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            backgroundColor: barColor,
                            opacity: 0.5,
                          }}
                          initial={{ y: 0, opacity: 0.8 }}
                          animate={{
                            y: [-20, 0],
                            opacity: [0.8, 0],
                          }}
                          transition={{
                            duration: 0.5,
                            ease: 'easeOut',
                          }}
                        />
                      )}
                      
                      {arraySize[0] <= 30 && (
                        <motion.div
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                          style={{ color: barColor }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: element.isComparing || element.isSwapping ? 1 : 0.6, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {element.value}
                        </motion.div>
                      )}
                      
                      {element.isComparing && (
                        <motion.div
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                          initial={{ scale: 0 }}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: barColor,
                              boxShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}`,
                            }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}</parameter>
</invoke>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20"
            >
              <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Legend
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-cyan-500/30"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 255, 0.6)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="w-6 h-6 rounded bg-cyan-400 shadow-lg shadow-cyan-400/50"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(0, 255, 255, 0.5)',
                        '0 0 20px rgba(0, 255, 255, 0.8)',
                        '0 0 10px rgba(0, 255, 255, 0.5)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-cyan-300">Comparing</div>
                    <div className="text-xs text-gray-400">Elements being compared</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-pink-500/30"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(255, 0, 102, 0.6)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="w-6 h-6 rounded bg-pink-500 shadow-lg shadow-pink-500/50"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(255, 0, 102, 0.5)',
                        '0 0 20px rgba(255, 0, 102, 0.8)',
                        '0 0 10px rgba(255, 0, 102, 0.5)'
                      ],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-pink-300">Swapping</div>
                    <div className="text-xs text-gray-400">Elements being swapped</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-green-500/30"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 0, 0.6)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="w-6 h-6 rounded bg-green-400 shadow-lg shadow-green-400/50"
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
                    <div className="text-sm font-semibold text-green-300">Sorted</div>
                    <div className="text-xs text-gray-400">In final position</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-purple-500/30"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.6)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="w-6 h-6 rounded bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg shadow-purple-400/50"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(168, 85, 247, 0.5)',
                        '0 0 20px rgba(168, 85, 247, 0.8)',
                        '0 0 10px rgba(168, 85, 247, 0.5)'
                      ]
                    }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-sm font-semibold text-purple-300">Unsorted</div>
                    <div className="text-xs text-gray-400">Awaiting processing</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/20"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-purple-400 font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Timeline Control
              </h3>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">
                  Step: <span className="text-cyan-400 font-mono font-bold">{currentStep}</span> / <span className="text-purple-400 font-mono">{steps.length}</span>
                </span>
                {steps.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30 text-cyan-300 font-semibold"
                  >
                    {Math.round((currentStep / steps.length) * 100)}%
                  </motion.span>
                )}
              </div>
            </div>

            {/* Timeline Scrubber */}
            <div className="relative">
              <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden border border-gray-600/30">
                {/* Progress Bar */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
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
                  />
                </motion.div>

                {/* Glow Effect */}
                {steps.length > 0 && currentStep > 0 && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-pink-500/50 blur-md"
                    animate={{
                      width: `${(currentStep / steps.length) * 100}%`
                    }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Step Markers */}
                {steps.length > 0 && steps.length <= 50 && (
                  <div className="absolute inset-0 flex items-center">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className="flex-1 flex justify-center"
                      >
                        <motion.div
                          className={`w-1 h-1 rounded-full transition-all duration-300 ${
                            index < currentStep
                              ? 'bg-cyan-300 shadow-[0_0_6px_rgba(0,255,255,0.8)]'
                              : 'bg-gray-600'
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: index === currentStep - 1 ? 1.5 : 1 }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Slider */}
              {steps.length > 0 && (
                <div className="absolute inset-0 -mx-2">
                  <Slider
                    value={[currentStep]}
                    onValueChange={(value) => {
                      setCurrentStep(value[0]);
                      setIsPlaying(false);
                    }}
                    min={0}
                    max={steps.length}
                    step={1}
                    className="cursor-pointer [&_[role=slider]]:bg-gradient-to-br [&_[role=slider]]:from-cyan-400 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-[0_0_20px_rgba(0,255,255,0.8)] [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-[0_0_30px_rgba(0,255,255,1)] [&_[role=slider]]:hover:scale-125 [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&>.relative]:bg-transparent"
                  />
                </div>
              )}
            </div>

            {/* Step Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setCurrentStep(0);
                    setIsPlaying(false);
                  }}
                  disabled={currentStep === 0 || steps.length === 0}
                  size="sm"
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Start
                </Button>
                <Button
                  onClick={() => {
                    if (currentStep > 0) {
                      setCurrentStep(prev => prev - 1);
                      setIsPlaying(false);
                    }
                  }}
                  disabled={currentStep === 0 || steps.length === 0}
                  size="sm"
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-purple-400 border border-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </Button>
                <Button
                  onClick={() => {
                    if (currentStep < steps.length) {
                      setCurrentStep(prev => prev + 1);
                      setIsPlaying(false);
                    }
                  }}
                  disabled={currentStep >= steps.length || steps.length === 0}
                  size="sm"
                  className="bg-gray-700/50 hover:bg-gray-600/50 text-purple-400 border border-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </Button>
              </div>

              <Button
                onClick={() => {
                  setCurrentStep(steps.length);
                  setIsPlaying(false);
                }}
                disabled={currentStep >= steps.length || steps.length === 0}
                size="sm"
                className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyan-300 border border-cyan-400/30 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Skip to End
              </Button>
            </div>

            {/* Current Step Info */}
            {steps.length > 0 && currentStep > 0 && currentStep <= steps.length && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-4 border-t border-gray-700/50"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    {steps[currentStep - 1]?.comparingIndices.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-lg border border-yellow-400/30"
                      >
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        <span className="text-yellow-300 font-medium">Comparing</span>
                      </motion.div>
                    )}
                    {steps[currentStep - 1]?.swappingIndices.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/20 rounded-lg border border-pink-400/30"
                      >
                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                        <span className="text-pink-300 font-medium">Swapping</span>
                      </motion.div>
                    )}
                    {steps[currentStep - 1]?.sortedIndices.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-400/30"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-green-300 font-medium">
                          Sorted: {steps[currentStep - 1].sortedIndices.length}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}