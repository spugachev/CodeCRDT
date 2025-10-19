import React, { useState, useCallback } from 'react';
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
      value: Math.floor(Math.random() * 100) + 1,
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
  React.useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) {
      if (currentStep >= steps.length && steps.length > 0) {
        setIsPlaying(false);
      }
      return;
    }

    const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
    const timer = setTimeout(() => {
      const step = steps[currentStep];
      setArray(step.array);
      setCurrentStep(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, speed]);
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
          steps.push(createStep([...arr], [], [j, j + 1], sortedIndices));
          arr[j + 1] = arr[j];
          j--;
          steps.push(createStep([...arr], [], [], sortedIndices));
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
              className="px-6 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full backdrop-blur-sm"
            >
              <span className="text-2xl font-semibold text-purple-300">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name}
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
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-lg font-mono text-cyan-300 relative z-10">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
              </span>
            </motion.div>
          </div>
        </motion.div></parameter>

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
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <Zap className="w-5 h-5" />
                    <span className="text-sm uppercase tracking-wider">Algorithm</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedAlgorithm(algo.id as AlgorithmType);
                          generateSortingSteps(algo.id as AlgorithmType);
                        }}
                        disabled={isPlaying}
                        className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-medium text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-semibold">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm uppercase tracking-wider">Array Size</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Elements</span>
                      <span className="text-white font-mono">{arraySize[0]}</span>
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
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-pink-400 font-semibold">
                    <Zap className="w-5 h-5" />
                    <span className="text-sm uppercase tracking-wider">Speed</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Animation</span>
                      <span className="text-white font-mono">{speed[0]}%</span>
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
                </div>

                {/* Control Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {currentStep >= steps.length ? 'Restart' : 'Play'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
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
                    className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all duration-300"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    New Array
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step</span>
                    <span className="text-cyan-400 font-mono">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-semibold ${isPlaying ? 'text-green-400' : currentStep >= steps.length && steps.length > 0 ? 'text-purple-400' : 'text-gray-400'}`}>
                      {isPlaying ? 'Running' : currentStep >= steps.length && steps.length > 0 ? 'Completed' : 'Ready'}
                    </span>
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
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2"
                    disabled={isPlaying}
                  /></parameter>
</invoke>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    className="flex-1 relative group overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 p-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative bg-gray-900 rounded-lg px-6 py-3 flex items-center justify-center gap-2 group-hover:bg-gray-900/80 transition-colors">
                      <motion.div
                        animate={{
                          rotate: isPlaying ? 0 : 0,
                          scale: isPlaying ? 1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <Play className="w-5 h-5 text-cyan-400" />
                        )}
                      </motion.div>
                      <span className="font-semibold text-white">
                        {isPlaying ? 'Pause' : 'Play'}
                      </span>
                      
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/30 to-cyan-400/0"
                        animate={{
                          x: ['-100%', '100%']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      />
                      
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(0, 255, 255, 0.5)',
                            '0 0 40px rgba(168, 85, 247, 0.5)',
                            '0 0 20px rgba(0, 255, 255, 0.5)'
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    </div>
                  </motion.button>
                  <motion.button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="flex-1 relative overflow-hidden bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: 360 }}
                    transition={{ 
                      rotate: { duration: 0.6, ease: "easeInOut" },
                      scale: { duration: 0.2 }
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="relative flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </motion.div>
                      <span>Reset</span>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(236, 72, 153, 0.5)',
                          '0 0 40px rgba(236, 72, 153, 0.8)',
                          '0 0 20px rgba(236, 72, 153, 0.5)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.button>
                </div>
              </div>
            </div>

                        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 font-semibold mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-wider">Statistics</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Comparisons Counter */}
                  <motion.div
                    className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="relative z-10">
                      <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">
                        Comparisons
                      </div>
                      <motion.div
                        className="text-3xl font-bold text-cyan-300 font-mono"
                        key={currentStep}
                        initial={{ scale: 1.2, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#67e8f9' }}
                        transition={{ duration: 0.3 }}
                      >
                        {steps.slice(0, currentStep + 1).filter(s => s.comparingIndices.length > 0).length}
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Swaps Counter */}
                  <motion.div
                    className="relative overflow-hidden bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    />
                    <div className="relative z-10">
                      <div className="text-xs text-pink-400 uppercase tracking-wider mb-1">
                        Swaps
                      </div>
                      <motion.div
                        className="text-3xl font-bold text-pink-300 font-mono"
                        key={`swaps-${currentStep}`}
                        initial={{ scale: 1.2, color: '#ff00ff' }}
                        animate={{ scale: 1, color: '#f9a8d4' }}
                        transition={{ duration: 0.3 }}
                      >
                        {steps.slice(0, currentStep + 1).filter(s => s.swappingIndices.length > 0).length}
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Progress */}
                  <motion.div
                    className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    />
                    <div className="relative z-10">
                      <div className="text-xs text-purple-400 uppercase tracking-wider mb-2">
                        Progress
                      </div>
                      <div className="flex items-end gap-2">
                        <motion.div
                          className="text-3xl font-bold text-purple-300 font-mono"
                          key={`progress-${currentStep}`}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}
                        </motion.div>
                        <div className="text-lg text-purple-400 mb-1">%</div>
                      </div>
                      <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Current Step */}
                  <motion.div
                    className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-lg p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative z-10">
                      <div className="text-xs text-yellow-400 uppercase tracking-wider mb-1">
                        Step
                      </div>
                      <div className="flex items-baseline gap-2">
                        <motion.div
                          className="text-2xl font-bold text-yellow-300 font-mono"
                          key={`step-${currentStep}`}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {currentStep}
                        </motion.div>
                        <div className="text-sm text-yellow-400/70">
                          / {steps.length}
                        </div>
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
                    <Zap className="w-24 h-24 text-cyan-400" style={{
                      filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.8))'
                    }} />
                  </motion.div>
                  <motion.p
                    className="text-2xl font-semibold text-gray-400"
                    animate={{
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                  >
                    Generate an array to begin
                  </motion.p>
                  <Button
                    onClick={generateRandomArray}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/80 transition-all duration-300"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Array
                  </Button>
                </motion.div>
              ) : (
                <div className="relative w-full h-[500px] flex items-end justify-center gap-1 px-4">
                  {(steps.length > 0 && currentStep < steps.length ? steps[currentStep].array : array).map((element, index) => {
                    const maxValue = 100;
                    const heightPercentage = (element.value / maxValue) * 100;
                    const barWidth = Math.max(8, Math.min(60, (100 / array.length) * 8));
                    
                    const colorIndex = index % NEON_COLORS.length;
                    const baseColor = NEON_COLORS[colorIndex];
                    
                    let barColor = baseColor;
                    let glowIntensity = 0.3;
                    let borderColor = baseColor;
                    
                    if (element.isSorted) {
                      barColor = '#00ff00';
                      glowIntensity = 0.8;
                      borderColor = '#00ff00';
                    } else if (element.isSwapping) {
                      barColor = '#ff0066';
                      glowIntensity = 1;
                      borderColor = '#ff0066';
                    } else if (element.isComparing) {
                      barColor = '#ffff00';
                      glowIntensity = 0.7;
                      borderColor = '#ffff00';
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex flex-col items-center justify-end"
                        style={{ width: `${barWidth}px` }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.01 }}
                      >
                        {/* Swap trail effect */}
                        {element.isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              background: `linear-gradient(to top, ${barColor}, transparent)`,
                              filter: `blur(10px)`
                            }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              scale: [0.8, 1.5, 0.8]
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          />
                        )}
                        
                        {/* Main bar */}
                        <motion.div
                          className="relative rounded-t-lg border-2 transition-all duration-300"
                          style={{
                            width: '100%',
                            backgroundColor: barColor,
                            borderColor: borderColor,
                            boxShadow: `
                              0 0 ${20 * glowIntensity}px ${barColor},
                              0 0 ${40 * glowIntensity}px ${barColor},
                              inset 0 0 ${10 * glowIntensity}px rgba(255, 255, 255, 0.3)
                            `
                          }}
                          animate={{
                            height: `${heightPercentage}%`,
                            scale: element.isSwapping ? [1, 1.1, 1] : element.isComparing ? [1, 1.05, 1] : 1
                          }}
                          transition={{
                            height: { duration: 0.3, ease: "easeOut" },
                            scale: { duration: 0.3, repeat: element.isSwapping || element.isComparing ? Infinity : 0 }
                          }}
                        >
                          {/* Inner glow gradient */}
                          <div
                            className="absolute inset-0 rounded-t-lg opacity-50"
                            style={{
                              background: `linear-gradient(to top, transparent, ${barColor})`
                            }}
                          />
                          
                          {/* Comparison indicator */}
                          {element.isComparing && (
                            <motion.div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ 
                                opacity: [0, 1, 0],
                                y: [10, -5, 10]
                              }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            >
                              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"
                                style={{
                                  filter: 'drop-shadow(0 0 8px rgba(255, 255, 0, 0.8))'
                                }}
                              />
                            </motion.div>
                          )}
                          
                          {/* Sorted checkmark indicator */}
                          {element.isSorted && (
                            <motion.div
                              className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <div className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center"
                                style={{
                                  boxShadow: '0 0 15px rgba(0, 255, 0, 0.8)'
                                }}
                              >
                                <div className="w-2 h-1 border-b-2 border-l-2 border-white transform rotate-[-45deg] translate-y-[-1px]" />
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                        
                        {/* Value label */}
                        {array.length <= 30 && (
                          <motion.div
                            className="absolute -bottom-6 text-xs font-mono font-semibold"
                            style={{
                              color: element.isSorted ? '#00ff00' : element.isSwapping ? '#ff0066' : element.isComparing ? '#ffff00' : '#888',
                              textShadow: element.isSorted || element.isSwapping || element.isComparing 
                                ? `0 0 10px ${barColor}` 
                                : 'none'
                            }}
                            animate={{
                              scale: element.isSwapping || element.isComparing ? [1, 1.2, 1] : 1
                            }}
                            transition={{ duration: 0.3, repeat: element.isSwapping || element.isComparing ? Infinity : 0 }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                        
                        {/* Pulsing base glow */}
                        <motion.div
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-2 rounded-full blur-md"
                          style={{
                            backgroundColor: barColor
                          }}
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scaleX: [1, 1.2, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {array.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="text-center space-y-4">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-20 h-20 mx-auto border-4 border-cyan-400 border-t-transparent rounded-full"
                      />
                      <p className="text-cyan-400 text-lg font-semibold">
                        Generate an array to start visualizing
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  array.map((element, index) => {
                    const heightPercentage = (element.value / 100) * 100;
                    const colorIndex = index % NEON_COLORS.length;
                    const baseColor = NEON_COLORS[colorIndex];
                    
                    let glowColor = baseColor;
                    let glowIntensity = 0.5;
                    
                    if (element.isSwapping) {
                      glowColor = '#ff0066';
                      glowIntensity = 1;
                    } else if (element.isComparing) {
                      glowColor = '#ffff00';
                      glowIntensity = 0.8;
                    } else if (element.isSorted) {
                      glowColor = '#00ff00';
                      glowIntensity = 0.6;
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px] group"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          y: element.isSwapping ? [-10, 0] : 0
                        }}
                        transition={{
                          height: { duration: 0.5, ease: 'easeOut' },
                          opacity: { duration: 0.3 },
                          y: { duration: 0.3, ease: 'easeInOut' }
                        }}
                        style={{
                          backgroundColor: element.isSorted ? '#00ff00' : element.isSwapping ? '#ff0066' : element.isComparing ? '#ffff00' : baseColor,
                          boxShadow: `
                            0 0 ${20 * glowIntensity}px ${glowColor},
                            0 0 ${40 * glowIntensity}px ${glowColor}40,
                            inset 0 0 ${10 * glowIntensity}px ${glowColor}80
                          `,
                          borderRadius: '4px 4px 0 0',
                          position: 'relative'
                        }}
                      >
                        {/* Animated glow pulse for comparing/swapping */}
                        {(element.isComparing || element.isSwapping) && (
                          <motion.div
                            className="absolute inset-0 rounded-t"
                            animate={{
                              boxShadow: [
                                `0 0 20px ${glowColor}, 0 0 40px ${glowColor}40`,
                                `0 0 40px ${glowColor}, 0 0 80px ${glowColor}60`,
                                `0 0 20px ${glowColor}, 0 0 40px ${glowColor}40`
                              ]
                            }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                        )}
                        
                        {/* Swap trail effect */}
                        {element.isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t"
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{
                              opacity: [0.8, 0],
                              scale: [1, 1.5],
                              y: [-20, -60]
                            }}
                            transition={{ duration: 0.5 }}
                            style={{
                              background: `linear-gradient(to top, ${glowColor}, transparent)`,
                              filter: 'blur(8px)'
                            }}
                          />
                        )}
                        
                        {/* Value label on hover */}
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                          initial={{ y: 10 }}
                          whileHover={{ y: 0 }}
                        >
                          <div
                            className="px-2 py-1 rounded text-xs font-bold whitespace-nowrap"
                            style={{
                              backgroundColor: `${baseColor}20`,
                              border: `1px solid ${baseColor}`,
                              color: baseColor,
                              boxShadow: `0 0 10px ${baseColor}60`
                            }}
                          >
                            {element.value}
                          </div>
                        </motion.div>
                        
                        {/* Sorted checkmark indicator */}
                        {element.isSorted && (
                          <motion.div
                            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                          >
                            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.8)]">
                              <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 rounded-t overflow-hidden"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: 'easeInOut'
                          }}
                          style={{
                            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                            pointerEvents: 'none'
                          }}
                        />
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
                <span className="text-purple-400 font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Sorting Progress
                </span>
                <span className="text-cyan-300 font-mono">
                  {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                </span>
              </div>
              
              <div className="relative h-3 bg-gray-800/50 rounded-full border border-purple-500/30 overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
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
                      '0 0 10px rgba(168, 85, 247, 0.3)',
                      '0 0 20px rgba(168, 85, 247, 0.6)',
                      '0 0 10px rgba(168, 85, 247, 0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              {currentStep >= steps.length && steps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 text-green-400 font-semibold"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    ✓
                  </motion.div>
                  <span>Sorting Complete!</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-cyan-400 uppercase tracking-wider">
              Legend
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Default State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
            >
              <motion.div
                className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(0, 255, 255, 0.3)',
                    '0 0 20px rgba(0, 255, 255, 0.5)',
                    '0 0 10px rgba(0, 255, 255, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="text-center">
                <div className="text-sm font-semibold text-white">Default</div>
                <div className="text-xs text-gray-400 mt-1">Unsorted</div>
              </div>
            </motion.div>

            {/* Comparing State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-12 h-12 rounded-lg bg-yellow-500"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(255, 255, 0, 0.5)',
                    '0 0 30px rgba(255, 255, 0, 0.8)',
                    '0 0 15px rgba(255, 255, 0, 0.5)'
                  ],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="text-center">
                <div className="text-sm font-semibold text-yellow-400">Comparing</div>
                <div className="text-xs text-gray-400 mt-1">Active check</div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-12 h-12 rounded-lg bg-red-500"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 0, 0, 0.6)',
                    '0 0 40px rgba(255, 0, 0, 0.9)',
                    '0 0 20px rgba(255, 0, 0, 0.6)'
                  ],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div className="text-center">
                <div className="text-sm font-semibold text-red-400">Swapping</div>
                <div className="text-xs text-gray-400 mt-1">Exchanging</div>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-12 h-12 rounded-lg bg-green-500"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(0, 255, 0, 0.5)',
                    '0 0 25px rgba(0, 255, 0, 0.7)',
                    '0 0 15px rgba(0, 255, 0, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="text-center">
                <div className="text-sm font-semibold text-green-400">Sorted</div>
                <div className="text-xs text-gray-400 mt-1">In position</div>
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
            <div className="flex items-start gap-3 text-xs text-gray-400">
              <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                Watch the bars change colors as the algorithm compares, swaps, and sorts elements in real-time.
                <span className="text-cyan-400 font-semibold"> Glowing effects</span> indicate active operations.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}