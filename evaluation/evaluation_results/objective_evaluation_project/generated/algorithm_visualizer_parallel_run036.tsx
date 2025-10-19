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

// Animation controller hook
const useAnimationController = (
  steps: AlgorithmStep[],
  speed: number[],
  isPlaying: boolean,
  currentStep: number,
  setCurrentStep: (step: number) => void,
  setArray: (array: ArrayElement[]) => void,
  setIsPlaying: (playing: boolean) => void
) => {
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
      
      animationRef.current = setTimeout(() => {
        const step = steps[currentStep];
        setArray(step.array);
        setCurrentStep(currentStep + 1);
      }, delay);
    } else if (currentStep >= steps.length && isPlaying) {
      setIsPlaying(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, currentStep, steps, speed, setCurrentStep, setArray, setIsPlaying]);
};
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
    if (!array.length) return;

    const arr = [...array];
    const newSteps: AlgorithmStep[] = [];

    const addStep = (
      currentArray: ArrayElement[],
      comparing: number[] = [],
      swapping: number[] = [],
      sorted: number[] = []
    ) => {
      newSteps.push({
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
    };

    // Initial state
    addStep([...arr]);

    if (algorithm === 'bubble') {
      const sortedIndices: number[] = [];
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          // Comparing
          addStep([...arr], [j, j + 1], [], sortedIndices);
          
          if (arr[j].value > arr[j + 1].value) {
            // Swapping
            addStep([...arr], [], [j, j + 1], sortedIndices);
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            addStep([...arr], [], [j, j + 1], sortedIndices);
          }
        }
        sortedIndices.push(arr.length - i - 1);
        addStep([...arr], [], [], sortedIndices);
      }
      sortedIndices.push(0);
      addStep([...arr], [], [], sortedIndices);
    } else if (algorithm === 'insertion') {
      const sortedIndices: number[] = [0];
      addStep([...arr], [], [], sortedIndices);
      
      for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        
        addStep([...arr], [i], [], sortedIndices);
        
        while (j >= 0 && arr[j].value > key.value) {
          addStep([...arr], [j, j + 1], [], sortedIndices);
          addStep([...arr], [], [j, j + 1], sortedIndices);
          arr[j + 1] = arr[j];
          addStep([...arr], [], [j, j + 1], sortedIndices);
          j--;
        }
        arr[j + 1] = key;
        sortedIndices.push(i);
        addStep([...arr], [], [], sortedIndices);
      }
    } else if (algorithm === 'quick') {
      const sortedIndices: number[] = [];
      
      const partition = (low: number, high: number): number => {
        const pivot = arr[high];
        addStep([...arr], [high], [], sortedIndices);
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
          addStep([...arr], [j, high], [], sortedIndices);
          
          if (arr[j].value < pivot.value) {
            i++;
            if (i !== j) {
              addStep([...arr], [], [i, j], sortedIndices);
              [arr[i], arr[j]] = [arr[j], arr[i]];
              addStep([...arr], [], [i, j], sortedIndices);
            }
          }
        }
        
        addStep([...arr], [], [i + 1, high], sortedIndices);
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        addStep([...arr], [], [i + 1, high], sortedIndices);
        sortedIndices.push(i + 1);
        addStep([...arr], [], [], sortedIndices);
        
        return i + 1;
      };
      
      const quickSort = (low: number, high: number) => {
        if (low < high) {
          const pi = partition(low, high);
          quickSort(low, pi - 1);
          quickSort(pi + 1, high);
        } else if (low === high) {
          sortedIndices.push(low);
          addStep([...arr], [], [], sortedIndices);
        }
      };
      
      quickSort(0, arr.length - 1);
    } else if (algorithm === 'merge') {
      const sortedIndices: number[] = [];
      
      const merge = (left: number, mid: number, right: number) => {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
          addStep([...arr], [left + i, mid + 1 + j], [], sortedIndices);
          
          if (leftArr[i].value <= rightArr[j].value) {
            addStep([...arr], [], [k], sortedIndices);
            arr[k] = leftArr[i];
            addStep([...arr], [], [k], sortedIndices);
            i++;
          } else {
            addStep([...arr], [], [k], sortedIndices);
            arr[k] = rightArr[j];
            addStep([...arr], [], [k], sortedIndices);
            j++;
          }
          k++;
        }
        
        while (i < leftArr.length) {
          addStep([...arr], [], [k], sortedIndices);
          arr[k] = leftArr[i];
          addStep([...arr], [], [k], sortedIndices);
          i++;
          k++;
        }
        
        while (j < rightArr.length) {
          addStep([...arr], [], [k], sortedIndices);
          arr[k] = rightArr[j];
          addStep([...arr], [], [k], sortedIndices);
          j++;
          k++;
        }
        
        if (left === 0 && right === arr.length - 1) {
          for (let idx = left; idx <= right; idx++) {
            sortedIndices.push(idx);
          }
        }
        addStep([...arr], [], [], sortedIndices);
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
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
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
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="relative px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-lg border border-purple-400/50 overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-mono text-purple-200">
                  {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity || 'O(n²)'}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div></parameter>
</invoke>

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
                        className={`w-full p-3 rounded-lg text-left transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-700/50 border-2 border-gray-600/50 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-medium text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-purple-400">
                    <BarChart3 className="w-5 h-5" />
                    <h3 className="font-semibold">Array Size</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Size</span>
                      <span className="text-cyan-400 font-mono">{arraySize[0]}</span>
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
                  <div className="flex items-center gap-2 text-pink-400">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-semibold">Speed</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Animation Speed</span>
                      <span className="text-cyan-400 font-mono">{speed[0]}%</span>
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
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        {currentStep >= steps.length ? 'Restart' : 'Play'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 rounded-lg shadow-[0_0_20px_rgba(255,0,255,0.5)] hover:shadow-[0_0_30px_rgba(255,0,255,0.7)] transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset & Generate
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Step</span>
                    <span className="text-cyan-400 font-mono">{currentStep} / {steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Array Elements</span>
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
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/50'
                            : 'bg-gray-700/50 border-gray-600 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-sm font-medium text-white">
                          {algo.name.split(' ')[0]}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {algo.complexity}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4">Speed</h3>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={1}
                    max={100}
                    step={1}
                    className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:transition-shadow [&_[role=slider]]:hover:shadow-cyan-400/80 [&_.relative]:bg-gray-700 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-cyan-500 [&_.bg-primary]:to-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Slow</span>
                    <span className="text-cyan-400 font-semibold">{speed[0]}%</span>
                    <span>Fast</span>
                  </div></parameter>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4">Array Size</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Elements</span>
                      <motion.span 
                        key={arraySize[0]}
                        initial={{ scale: 1.3, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-lg font-bold text-white"
                      >
                        {arraySize[0]}
                      </motion.span>
                    </div>
                    <Slider
                      value={arraySize}
                      onValueChange={setArraySize}
                      min={5}
                      max={50}
                      step={1}
                      className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-cyan-400 [&_[role=slider]]:to-purple-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:transition-shadow hover:[&_[role=slider]]:shadow-cyan-400/80 [&_[role=slider]]:animate-pulse"
                      disabled={isPlaying}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>5</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <motion.button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                    className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500"
                      animate={{
                        opacity: isPlaying ? [0.8, 1, 0.8] : 0.8
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl"
                      animate={{
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative flex items-center justify-center gap-3">
                      <motion.div
                        animate={{
                          rotate: isPlaying ? 0 : 0,
                          scale: isPlaying ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </motion.div>
                      <span>{isPlaying ? 'Pause' : 'Start'} Visualization</span>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      animate={{
                        boxShadow: isPlaying
                          ? [
                              '0 0 20px rgba(0, 255, 255, 0.5)',
                              '0 0 40px rgba(168, 85, 247, 0.5)',
                              '0 0 20px rgba(0, 255, 255, 0.5)'
                            ]
                          : '0 0 20px rgba(0, 255, 255, 0.3)'
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.button>

                  <motion.button
                    onClick={resetVisualization}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-600/80 to-red-600/80 hover:from-pink-500 hover:to-red-500 transition-all duration-300 relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-400 opacity-0 group-hover:opacity-20 blur-xl"
                    />
                    <div className="relative flex items-center justify-center gap-3">
                      <motion.div
                        whileHover={{ rotate: -180 }}
                        transition={{ duration: 0.5 }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </motion.div>
                      <span>Reset</span>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                      animate={{
                        boxShadow: [
                          '0 0 0px rgba(236, 72, 153, 0)',
                          '0 0 20px rgba(236, 72, 153, 0.4)',
                          '0 0 0px rgba(236, 72, 153, 0)'
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.button>

                  <motion.button
                    onClick={generateRandomArray}
                    disabled={isPlaying}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600/80 to-indigo-600/80 hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 blur-xl"
                    />
                    <div className="relative flex items-center justify-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <BarChart3 className="w-5 h-5" />
                      </motion.div>
                      <span>New Array</span>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                      animate={{
                        boxShadow: [
                          '0 0 0px rgba(147, 51, 234, 0)',
                          '0 0 20px rgba(147, 51, 234, 0.4)',
                          '0 0 0px rgba(147, 51, 234, 0)'
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.button>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-800/50 to-purple-900/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-400 mb-4">
                  <BarChart3 className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Statistics</h3>
                </div>

                <div className="space-y-3">
                  {/* Comparisons Counter */}
                  <motion.div
                    className="bg-gray-900/50 rounded-xl p-4 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-3 h-3 rounded-full bg-cyan-400"
                          animate={{
                            boxShadow: [
                              '0 0 10px rgba(0, 255, 255, 0.5)',
                              '0 0 20px rgba(0, 255, 255, 0.8)',
                              '0 0 10px rgba(0, 255, 255, 0.5)'
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="text-sm text-gray-300">Comparisons</span>
                      </div>
                      <motion.span
                        key={steps[currentStep]?.comparingIndices.length || 0}
                        initial={{ scale: 1.3, color: '#00ffff' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-2xl font-bold text-white"
                      >
                        {currentStep > 0 ? currentStep : 0}
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* Swaps Counter */}
                  <motion.div
                    className="bg-gray-900/50 rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-3 h-3 rounded-full bg-pink-400"
                          animate={{
                            boxShadow: [
                              '0 0 10px rgba(255, 0, 102, 0.5)',
                              '0 0 20px rgba(255, 0, 102, 0.8)',
                              '0 0 10px rgba(255, 0, 102, 0.5)'
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        />
                        <span className="text-sm text-gray-300">Swaps</span>
                      </div>
                      <motion.span
                        key={steps[currentStep]?.swappingIndices.length || 0}
                        initial={{ scale: 1.3, color: '#ff0066' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-2xl font-bold text-white"
                      >
                        {steps.slice(0, currentStep).filter(s => s.swappingIndices.length > 0).length}
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* Progress Bar */}
                  <motion.div
                    className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-3 h-3 rounded-full bg-purple-400"
                            animate={{
                              boxShadow: [
                                '0 0 10px rgba(168, 85, 247, 0.5)',
                                '0 0 20px rgba(168, 85, 247, 0.8)',
                                '0 0 10px rgba(168, 85, 247, 0.5)'
                              ]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                          />
                          <span className="text-sm text-gray-300">Progress</span>
                        </div>
                        <motion.span
                          key={currentStep}
                          initial={{ scale: 1.3, color: '#a855f7' }}
                          animate={{ scale: 1, color: '#ffffff' }}
                          className="text-lg font-bold text-white"
                        >
                          {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                        </motion.span>
                      </div>
                      
                      <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
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
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Sorted Elements */}
                  <motion.div
                    className="bg-gray-900/50 rounded-xl p-4 border border-green-500/20 hover:border-green-500/50 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-3 h-3 rounded-full bg-green-400"
                          animate={{
                            boxShadow: [
                              '0 0 10px rgba(0, 255, 0, 0.5)',
                              '0 0 20px rgba(0, 255, 0, 0.8)',
                              '0 0 10px rgba(0, 255, 0, 0.5)'
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
                        />
                        <span className="text-sm text-gray-300">Sorted</span>
                      </div>
                      <motion.span
                        key={steps[currentStep]?.sortedIndices.length || 0}
                        initial={{ scale: 1.3, color: '#00ff00' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-2xl font-bold text-white"
                      >
                        {steps[currentStep]?.sortedIndices.length || 0}/{array.length}
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* Algorithm Complexity */}
                  <motion.div
                    className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-xl p-4 border border-cyan-500/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Time Complexity</div>
                      <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
                      </div>
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
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_50px_rgba(0,255,255,0.5)]"
                  >
                    <BarChart3 className="w-12 h-12 text-white" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                      Generate an Array to Start
                    </h3>
                    <p className="text-gray-400">
                      Click the "Generate New Array" button to begin visualizing
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const currentStepData = steps[currentStep];
                    const isComparing = currentStepData?.comparingIndices.includes(index);
                    const isSwapping = currentStepData?.swappingIndices.includes(index);
                    const isSorted = currentStepData?.sortedIndices.includes(index);
                    
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let shadowColor = barColor;
                    let glowIntensity = 0.3;
                    
                    if (isSorted) {
                      barColor = '#00ff00';
                      shadowColor = '#00ff00';
                      glowIntensity = 0.6;
                    } else if (isSwapping) {
                      barColor = '#ff0066';
                      shadowColor = '#ff0066';
                      glowIntensity = 0.8;
                    } else if (isComparing) {
                      barColor = '#ffff00';
                      shadowColor = '#ffff00';
                      glowIntensity = 0.7;
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          backgroundColor: barColor,
                          boxShadow: [
                            `0 0 ${glowIntensity * 20}px ${shadowColor}`,
                            `0 0 ${glowIntensity * 40}px ${shadowColor}`,
                            `0 0 ${glowIntensity * 20}px ${shadowColor}`
                          ],
                          scale: isSwapping ? [1, 1.1, 1] : isComparing ? 1.05 : 1,
                          y: isSwapping ? [0, -10, 0] : 0
                        }}
                        transition={{
                          height: { duration: 0.3, ease: 'easeOut' },
                          backgroundColor: { duration: 0.2 },
                          boxShadow: { duration: 1, repeat: Infinity },
                          scale: { duration: 0.3 },
                          y: { duration: 0.5, ease: 'easeInOut' }
                        }}
                        style={{
                          background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                          minHeight: '20px'
                        }}
                      >
                        {/* Value label */}
                        <motion.div
                          className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                          animate={{
                            color: barColor,
                            scale: isComparing || isSwapping ? 1.2 : 1,
                            textShadow: `0 0 10px ${shadowColor}`
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {element.value}
                        </motion.div>
                        
                        {/* Trail effect for swapping */}
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            initial={{ opacity: 0.8, scale: 1 }}
                            animate={{
                              opacity: 0,
                              scale: 1.5,
                              backgroundColor: barColor
                            }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            style={{
                              boxShadow: `0 0 30px ${shadowColor}`
                            }}
                          />
                        )}
                        
                        {/* Pulse effect for comparing */}
                        {isComparing && (
                          <motion.div
                            className="absolute -inset-1 rounded-t-lg border-2"
                            animate={{
                              borderColor: [barColor, 'transparent', barColor],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                        )}
                        
                        {/* Sparkle effect for sorted */}
                        {isSorted && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{
                              background: `radial-gradient(circle, ${barColor}88, transparent)`,
                              boxShadow: `0 0 20px ${shadowColor}`
                            }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="h-full flex items-end justify-center gap-1">
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
                      <p className="text-2xl font-semibold text-gray-400">
                        Generate an array to begin
                      </p>
                      <p className="text-sm text-gray-500">
                        Click the "Generate Array" button to start visualizing
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  array.map((element, index) => {
                    const colorIndex = index % NEON_COLORS.length;
                    const baseColor = NEON_COLORS[colorIndex];
                    
                    const isComparing = element.isComparing;
                    const isSwapping = element.isSwapping;
                    const isSorted = element.isSorted;
                    
                    let barColor = baseColor;
                    let glowColor = baseColor;
                    let glowIntensity = '0.3';
                    
                    if (isSorted) {
                      barColor = '#00ff00';
                      glowColor = '#00ff00';
                      glowIntensity = '0.6';
                    } else if (isSwapping) {
                      barColor = '#ff0066';
                      glowColor = '#ff0066';
                      glowIntensity = '0.8';
                    } else if (isComparing) {
                      barColor = '#ffff00';
                      glowColor = '#ffff00';
                      glowIntensity = '0.7';
                    }
                    
                    const maxHeight = 500;
                    const barHeight = (element.value / 100) * maxHeight;
                    const barWidth = Math.max(8, Math.min(60, 800 / array.length));
                    
                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex flex-col items-center justify-end"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: isSwapping ? [1, 1.1, 1] : 1,
                          x: isSwapping ? [0, -5, 5, 0] : 0
                        }}
                        transition={{
                          opacity: { duration: 0.3 },
                          y: { duration: 0.3 },
                          scale: { duration: 0.3, repeat: isSwapping ? Infinity : 0 },
                          x: { duration: 0.2, repeat: isSwapping ? Infinity : 0 }
                        }}
                        style={{ width: barWidth }}
                      >
                        {/* Trail effect */}
                        {isSwapping && (
                          <>
                            <motion.div
                              className="absolute bottom-0 rounded-t-lg"
                              style={{
                                width: barWidth,
                                height: barHeight,
                                backgroundColor: barColor,
                                opacity: 0.3,
                                filter: `blur(8px)`
                              }}
                              animate={{
                                opacity: [0.3, 0.1, 0.3],
                                scale: [1, 1.05, 1]
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity
                              }}
                            />
                            <motion.div
                              className="absolute bottom-0 rounded-t-lg"
                              style={{
                                width: barWidth,
                                height: barHeight,
                                backgroundColor: barColor,
                                opacity: 0.2,
                                filter: `blur(16px)`
                              }}
                              animate={{
                                opacity: [0.2, 0.05, 0.2],
                                scale: [1, 1.1, 1]
                              }}
                              transition={{
                                duration: 0.7,
                                repeat: Infinity
                              }}
                            />
                          </>
                        )}
                        
                        {/* Main bar */}
                        <motion.div
                          className="relative rounded-t-lg overflow-hidden"
                          style={{
                            width: barWidth,
                            backgroundColor: barColor,
                            boxShadow: `
                              0 0 20px rgba(${parseInt(barColor.slice(1, 3), 16)}, ${parseInt(barColor.slice(3, 5), 16)}, ${parseInt(barColor.slice(5, 7), 16)}, ${glowIntensity}),
                              0 0 40px rgba(${parseInt(barColor.slice(1, 3), 16)}, ${parseInt(barColor.slice(3, 5), 16)}, ${parseInt(barColor.slice(5, 7), 16)}, ${parseFloat(glowIntensity) * 0.6}),
                              inset 0 0 20px rgba(255, 255, 255, 0.1)
                            `
                          }}
                          animate={{
                            height: barHeight,
                            boxShadow: isComparing || isSwapping || isSorted
                              ? [
                                  `0 0 20px rgba(${parseInt(barColor.slice(1, 3), 16)}, ${parseInt(barColor.slice(3, 5), 16)}, ${parseInt(barColor.slice(5, 7), 16)}, ${glowIntensity}),
                                   0 0 40px rgba(${parseInt(barColor.slice(1, 3), 16)}, ${parseInt(barColor.slice(3, 5), 16)}, ${parseInt(barColor.slice(5, 7), 16)}, ${parseFloat(glowIntensity) * 0.6}),
                                   inset 0 0 20px rgba(255, 255, 255, 0.1)`,
                                  `0 0 30px rgba(${parseInt(barColor.slice(1, 3), 16)}, ${parseInt(barColor.slice(3, 5), 16)}, ${parseInt(barColor.slice(5, 7), 16)}, ${parseFloat(glowIntensity) * 1.2}),
                                   0 0 60px rgba(${parseInt(barColor.slice(1, 3), 16)}, ${parseInt(barColor.slice(3, 5), 16)}, ${parseInt(barColor.slice(5, 7), 16)}, ${parseFloat(glowIntensity) * 0.8}),
                                   inset 0 0 20px rgba(255, 255, 255, 0.2)`,
                                  `0 0 20px rgba(${parseInt(barColor.slice(1, 3), 16)}, ${parseInt(barColor.slice(3, 5), 16)}, ${parseInt(barColor.slice(5, 7), 16)}, ${glowIntensity}),
                                   0 0 40px rgba(${parseInt(barColor.slice(1, 3), 16)}, ${parseInt(barColor.slice(3, 5), 16)}, ${parseInt(barColor.slice(5, 7), 16)}, ${parseFloat(glowIntensity) * 0.6}),
                                   inset 0 0 20px rgba(255, 255, 255, 0.1)`
                                ]
                              : `0 0 20px rgba(${parseInt(barColor.slice(1, 3), 16)}, ${parseInt(barColor.slice(3, 5), 16)}, ${parseInt(barColor.slice(5, 7), 16)}, ${glowIntensity}),
                                 0 0 40px rgba(${parseInt(barColor.slice(1, 3), 16)}, ${parseInt(barColor.slice(3, 5), 16)}, ${parseInt(barColor.slice(5, 7), 16)}, ${parseFloat(glowIntensity) * 0.6}),
                                 inset 0 0 20px rgba(255, 255, 255, 0.1)`
                          }}
                          transition={{
                            height: { duration: 0.5, ease: "easeInOut" },
                            boxShadow: { duration: 0.4, repeat: (isComparing || isSwapping) ? Infinity : 0 }
                          }}
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent"
                            animate={{
                              opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          
                          {/* Scanning line effect for comparing/swapping */}
                          {(isComparing || isSwapping) && (
                            <motion.div
                              className="absolute inset-x-0 h-1 bg-white/80"
                              style={{
                                boxShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}`
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
                          
                          {/* Particle burst effect for sorted */}
                          {isSorted && (
                            <>
                              {[...Array(6)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute top-0 left-1/2 w-1 h-1 rounded-full bg-white"
                                  initial={{
                                    opacity: 1,
                                    x: 0,
                                    y: 0
                                  }}
                                  animate={{
                                    opacity: [1, 0],
                                    x: Math.cos((i * Math.PI * 2) / 6) * 20,
                                    y: Math.sin((i * Math.PI * 2) / 6) * 20 - 20
                                  }}
                                  transition={{
                                    duration: 0.6,
                                    ease: "easeOut"
                                  }}
                                />
                              ))}
                            </>
                          )}
                        </motion.div>
                        
                        {/* Value label */}
                        {barWidth > 20 && (
                          <motion.div
                            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 text-xs font-bold text-white"
                            style={{
                              textShadow: `0 0 10px ${barColor}, 0 0 20px ${barColor}`
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                        
                        {/* Status indicator */}
                        {(isComparing || isSwapping || isSorted) && (
                          <motion.div
                            className="absolute -top-10 left-1/2 transform -translate-x-1/2"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                          >
                            <motion.div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: barColor,
                                boxShadow: `0 0 15px ${barColor}, 0 0 30px ${barColor}`
                              }}
                              animate={{
                                scale: [1, 1.3, 1]
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity
                              }}
                            />
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
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 shadow-lg shadow-purple-500/10"
            >
              <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Legend
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 255, 0.5)' }}
                >
                  <motion.div
                    className="w-4 h-8 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded"
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
                    <div className="text-xs font-medium text-white">Default</div>
                    <div className="text-xs text-gray-400">Unsorted</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 0, 0.5)' }}
                >
                  <motion.div
                    className="w-4 h-8 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded"
                    animate={{
                      boxShadow: [
                        '0 0 15px rgba(255, 255, 0, 0.6)',
                        '0 0 25px rgba(255, 255, 0, 0.9)',
                        '0 0 15px rgba(255, 255, 0, 0.6)'
                      ],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-xs font-medium text-white">Comparing</div>
                    <div className="text-xs text-gray-400">Active</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(255, 0, 255, 0.5)' }}
                >
                  <motion.div
                    className="w-4 h-8 bg-gradient-to-t from-pink-500 to-pink-300 rounded"
                    animate={{
                      boxShadow: [
                        '0 0 15px rgba(255, 0, 255, 0.6)',
                        '0 0 25px rgba(255, 0, 255, 0.9)',
                        '0 0 15px rgba(255, 0, 255, 0.6)'
                      ],
                      x: [-2, 2, -2]
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-xs font-medium text-white">Swapping</div>
                    <div className="text-xs text-gray-400">Moving</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50"
                  whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 0, 0.5)' }}
                >
                  <motion.div
                    className="w-4 h-8 bg-gradient-to-t from-green-500 to-green-300 rounded"
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
                    <div className="text-xs font-medium text-white">Sorted</div>
                    <div className="text-xs text-gray-400">Complete</div>
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
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </motion.div>
                <h3 className="font-semibold text-lg text-cyan-400">Timeline Control</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-400/50">
                <span className="text-sm text-purple-300 font-mono">
                  Step {currentStep} / {steps.length}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden border border-gray-600/50">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%']
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Timeline Scrubber */}
            <div className="relative pt-2">
              <input
                type="range"
                min={0}
                max={Math.max(0, steps.length - 1)}
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
                className="w-full h-2 bg-gray-700/50 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r 
                  [&::-webkit-slider-thumb]:from-cyan-400 [&::-webkit-slider-thumb]:to-purple-500 
                  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white 
                  [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(0,255,255,0.8)] 
                  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:hover:shadow-[0_0_30px_rgba(0,255,255,1)]
                  [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-cyan-400 
                  [&::-moz-range-thumb]:to-purple-500 [&::-moz-range-thumb]:border-2 
                  [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-125"
              />
              
              {/* Step Markers */}
              {steps.length > 0 && steps.length <= 50 && (
                <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: index <= currentStep ? 1 : 0.5 }}
                      className={`w-1 h-1 rounded-full transition-all duration-300 ${
                        index < currentStep
                          ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.8)]'
                          : index === currentStep
                          ? 'bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,1)] scale-150'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Navigation Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                onClick={() => {
                  setCurrentStep(0);
                  if (steps.length > 0) {
                    setArray(steps[0].array);
                  }
                  setIsPlaying(false);
                }}
                disabled={steps.length === 0 || currentStep === 0}
                size="sm"
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300 disabled:opacity-30"
              >
                <span className="text-xs font-semibold">First</span>
              </Button>
              
              <Button
                onClick={() => {
                  const newStep = Math.max(0, currentStep - 1);
                  setCurrentStep(newStep);
                  if (newStep < steps.length) {
                    setArray(steps[newStep].array);
                  }
                  setIsPlaying(false);
                }}
                disabled={steps.length === 0 || currentStep === 0}
                size="sm"
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-purple-400 border border-purple-500/30 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 disabled:opacity-30"
              >
                <span className="text-xs font-semibold">← Prev</span>
              </Button>
              
              <Button
                onClick={() => {
                  const newStep = Math.min(steps.length - 1, currentStep + 1);
                  setCurrentStep(newStep);
                  if (newStep < steps.length) {
                    setArray(steps[newStep].array);
                  }
                  setIsPlaying(false);
                }}
                disabled={steps.length === 0 || currentStep >= steps.length - 1}
                size="sm"
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-pink-400 border border-pink-500/30 hover:border-pink-400/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all duration-300 disabled:opacity-30"
              >
                <span className="text-xs font-semibold">Next →</span>
              </Button>
              
              <Button
                onClick={() => {
                  const lastStep = steps.length - 1;
                  setCurrentStep(lastStep);
                  if (lastStep >= 0 && lastStep < steps.length) {
                    setArray(steps[lastStep].array);
                  }
                  setIsPlaying(false);
                }}
                disabled={steps.length === 0 || currentStep >= steps.length - 1}
                size="sm"
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300 disabled:opacity-30"
              >
                <span className="text-xs font-semibold">Last</span>
              </Button>
            </div>

            {/* Status Indicator */}
            {steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 pt-2 text-sm"
              >
                {currentStep >= steps.length ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                    />
                    <span className="font-semibold">Sorting Complete!</span>
                  </div>
                ) : isPlaying ? (
                  <div className="flex items-center gap-2 text-cyan-400">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                    />
                    <span className="font-semibold">Playing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span>Paused</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}