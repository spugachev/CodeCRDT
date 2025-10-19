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

// Animation controller using useEffect for step-by-step visualization
const useAnimationController = (
  isPlaying: boolean,
  steps: AlgorithmStep[],
  currentStep: number,
  speed: number[],
  onStepComplete: () => void,
  onAnimationEnd: () => void
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const delay = 1000 - speed[0] * 9.5; // Convert speed (0-100) to delay (1000ms-50ms)
      timeoutRef.current = setTimeout(() => {
        onStepComplete();
      }, delay);
    } else if (isPlaying && currentStep >= steps.length) {
      onAnimationEnd();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length, speed, onStepComplete, onAnimationEnd]);
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
    generateRandomArray();  }, [generateRandomArray]);

  const startVisualization = useCallback(() => {
    if (steps.length === 0) return;
    if (currentStep >= steps.length) return;
    
    setIsPlaying(true);
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {
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
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <Zap className="w-4 h-4" />
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
                        className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50'
                        }`}
                      >
                        <div className="font-medium text-white">{algo.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">Array Size</span>
                    </div>
                    <span className="text-white font-mono text-lg">{arraySize[0]}</span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={1}
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-pink-400 font-semibold">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">Speed</span>
                    </div>
                    <span className="text-white font-mono text-lg">{speed[0]}%</span>
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
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || currentStep >= steps.length}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.7)] transition-all duration-300"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {currentStep >= steps.length ? 'Completed' : 'Start'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    variant="outline"
                    className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 hover:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={generateRandomArray}
                    disabled={isPlaying}
                    variant="outline"
                    className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 hover:text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all duration-300"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    New Array
                  </Button>
                </div>

                {/* Progress Indicator */}
                {steps.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span className="font-mono">
                        {currentStep} / {steps.length}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(currentStep / steps.length) * 100}%`
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
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
                            className="absolute inset-0 rounded-lg border-2 border-cyan-400"
                            layoutId="algorithmSelector"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-400/70 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.div className="relative flex-1">
                    <Button
                      onClick={isPlaying ? pauseVisualization : startVisualization}
                      disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold py-6 rounded-lg shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 blur-xl"
                        animate={{
                          opacity: isPlaying ? [0.5, 0.8, 0.5] : 0
                        }}
                        transition={{
                          duration: 2,
                          repeat: isPlaying ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                      />
                      
                      <motion.div
                        className="relative flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          animate={{
                            rotate: isPlaying ? 0 : 0,
                            scale: isPlaying ? 1 : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {isPlaying ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Pause className="w-5 h-5" />
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Play className="w-5 h-5" />
                            </motion.div>
                          )}
                        </motion.div>
                        
                        <span className="text-sm font-bold tracking-wider">
                          {isPlaying ? 'PAUSE' : 'PLAY'}
                        </span>
                      </motion.div>
                      
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          boxShadow: isPlaying 
                            ? '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)'
                            : '0 0 10px rgba(0, 255, 255, 0.3)'
                        }}
                        animate={{
                          boxShadow: isPlaying
                            ? [
                                '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)',
                                '0 0 30px rgba(168, 85, 247, 0.6), 0 0 50px rgba(0, 255, 255, 0.4)',
                                '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)'
                              ]
                            : '0 0 10px rgba(0, 255, 255, 0.3)'
                        }}
                        transition={{
                          duration: 2,
                          repeat: isPlaying ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                      />
                    </Button>
                  </motion.div>
                  <motion.div className="relative flex-1">
                    <Button
                      onClick={resetVisualization}
                      variant="outline"
                      className="w-full bg-pink-500/10 border-pink-400/50 text-pink-300 hover:bg-pink-500/20 hover:border-pink-400 hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300 relative overflow-hidden group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95, rotate: -180 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                      <motion.div
                        className="relative flex items-center justify-center gap-2"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="font-semibold">Reset</span>
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 rounded-md"
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(236,72,153,0.3)',
                            '0 0 40px rgba(236,72,153,0.6)',
                            '0 0 20px rgba(236,72,153,0.3)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
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
              <div className="flex items-center gap-2 text-purple-400 font-semibold mb-4">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm uppercase tracking-wider">Statistics</span>
              </div>

              <div className="space-y-3">
                {/* Progress */}
                <motion.div
                  className="p-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-lg relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="relative">
                    <div className="text-xs text-cyan-300 uppercase tracking-wider mb-2">Progress</div>
                    <div className="flex items-baseline gap-2">
                      <motion.span
                        className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                        key={currentStep}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                      </motion.span>
                      <span className="text-sm text-gray-400">
                        ({currentStep} / {steps.length})
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Comparisons */}
                <motion.div
                  className="p-4 bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-400/30 rounded-lg relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="text-xs text-pink-300 uppercase tracking-wider mb-2">Comparisons</div>
                    <motion.div
                      className="text-3xl font-bold text-pink-400 font-mono"
                      key={`comp-${currentStep}`}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      {steps.slice(0, currentStep).filter(step => step.comparingIndices.length > 0).length}
                    </motion.div>
                    <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-pink-500 to-orange-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]"
                        initial={{ width: 0 }}
                        animate={{
                          width: steps.length > 0
                            ? `${(steps.slice(0, currentStep).filter(step => step.comparingIndices.length > 0).length / steps.length) * 100}%`
                            : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Swaps */}
                <motion.div
                  className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="text-xs text-green-300 uppercase tracking-wider mb-2">Swaps</div>
                    <motion.div
                      className="text-3xl font-bold text-green-400 font-mono"
                      key={`swap-${currentStep}`}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      {steps.slice(0, currentStep).filter(step => step.swappingIndices.length > 0).length}
                    </motion.div>
                    <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                        initial={{ width: 0 }}
                        animate={{
                          width: steps.length > 0
                            ? `${(steps.slice(0, currentStep).filter(step => step.swappingIndices.length > 0).length / steps.length) * 100}%`
                            : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Sorted Elements */}
                <motion.div
                  className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-400/30 rounded-lg relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="text-xs text-yellow-300 uppercase tracking-wider mb-2">Sorted Elements</div>
                    <div className="flex items-baseline gap-2">
                      <motion.span
                        className="text-3xl font-bold text-yellow-400 font-mono"
                        key={`sorted-${currentStep}`}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        {currentStep > 0 && steps[currentStep - 1] ? steps[currentStep - 1].sortedIndices.length : 0}
                      </motion.span>
                      <span className="text-sm text-gray-400">
                        / {array.length}
                      </span>
                    </div>
                    <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"
                        initial={{ width: 0 }}
                        animate={{
                          width: array.length > 0 && currentStep > 0 && steps[currentStep - 1]
                            ? `${(steps[currentStep - 1].sortedIndices.length / array.length) * 100}%`
                            : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Status Indicator */}
                <motion.div
                  className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
                  animate={{
                    borderColor: isPlaying
                      ? ['rgba(34, 197, 94, 0.5)', 'rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0.5)']
                      : 'rgba(107, 114, 128, 1)'
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Status</span>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-gray-500'}`}
                        animate={{
                          boxShadow: isPlaying
                            ? [
                                '0 0 5px rgba(34, 197, 94, 0.8)',
                                '0 0 15px rgba(34, 197, 94, 1)',
                                '0 0 5px rgba(34, 197, 94, 0.8)'
                              ]
                            : '0 0 0px rgba(107, 114, 128, 0)'
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className={`text-sm font-medium ${isPlaying ? 'text-green-400' : 'text-gray-400'}`}>
                        {isPlaying ? 'Running' : currentStep >= steps.length && steps.length > 0 ? 'Completed' : 'Idle'}
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
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(0, 255, 255, 0.3)',
                        '0 0 40px rgba(255, 0, 255, 0.5)',
                        '0 0 20px rgba(0, 255, 255, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50"
                  >
                    <BarChart3 className="w-16 h-16 text-cyan-400" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-cyan-300">Ready to Visualize</h3>
                    <p className="text-gray-400">Generate an array to begin sorting</p>
                  </div>
                </motion.div>
              ) : (
                <div className="relative w-full h-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const isComparing = steps[currentStep]?.comparingIndices.includes(index);
                    const isSwapping = steps[currentStep]?.swappingIndices.includes(index);
                    const isSorted = steps[currentStep]?.sortedIndices.includes(index);
                    
                    const maxValue = Math.max(...array.map(el => el.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    
                    let barColor = NEON_COLORS[index % NEON_COLORS.length];
                    let glowColor = barColor;
                    let glowIntensity = 0.3;
                    
                    if (isSorted) {
                      barColor = '#00ff00';
                      glowColor = '#00ff00';
                      glowIntensity = 0.6;
                    } else if (isSwapping) {
                      barColor = '#ff0066';
                      glowColor = '#ff0066';
                      glowIntensity = 0.8;
                    } else if (isComparing) {
                      barColor = '#ffff00';
                      glowColor = '#ffff00';
                      glowIntensity = 0.7;
                    }
                    
                    return (
                      <motion.div
                        key={element.id}
                        className="relative flex-1 min-w-[4px] max-w-[60px] group"
                        layout
                        initial={{ opacity: 0, y: 50 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: isSwapping ? 1.1 : isComparing ? 1.05 : 1
                        }}
                        transition={{
                          layout: { duration: 0.3, ease: 'easeInOut' },
                          scale: { duration: 0.2 }
                        }}
                      >
                        {/* Swap Trail Effect */}
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              background: `linear-gradient(to top, transparent, ${barColor})`,
                              filter: 'blur(10px)'
                            }}
                            animate={{
                              opacity: [0.3, 0.8, 0.3],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity
                            }}
                          />
                        )}
                        
                        {/* Main Bar */}
                        <motion.div
                          className="relative w-full rounded-t-lg overflow-hidden"
                          style={{
                            height: `${heightPercentage}%`,
                            minHeight: '20px',
                            backgroundColor: barColor,
                            boxShadow: `
                              0 0 ${glowIntensity * 20}px ${glowColor},
                              0 0 ${glowIntensity * 40}px ${glowColor},
                              inset 0 0 ${glowIntensity * 10}px rgba(255, 255, 255, 0.3)
                            `
                          }}
                          animate={{
                            height: `${heightPercentage}%`,
                            backgroundColor: barColor,
                            boxShadow: `
                              0 0 ${glowIntensity * 20}px ${glowColor},
                              0 0 ${glowIntensity * 40}px ${glowColor},
                              inset 0 0 ${glowIntensity * 10}px rgba(255, 255, 255, 0.3)
                            `
                          }}
                          transition={{
                            height: { duration: 0.3, ease: 'easeInOut' },
                            backgroundColor: { duration: 0.2 },
                            boxShadow: { duration: 0.2 }
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
                              ease: 'linear',
                              repeatDelay: 1
                            }}
                          />
                          
                          {/* Value Label */}
                          {array.length <= 30 && (
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              <span
                                className="text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                                style={{
                                  writingMode: heightPercentage > 30 ? 'horizontal-tb' : 'vertical-rl',
                                  transform: heightPercentage > 30 ? 'none' : 'rotate(180deg)'
                                }}
                              >
                                {element.value}
                              </span>
                            </motion.div>
                          )}
                        </motion.div>
                        
                        {/* Comparison Indicator */}
                        {isComparing && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            <motion.div
                              className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-300"
                              animate={{
                                boxShadow: [
                                  '0 0 10px rgba(255, 255, 0, 0.5)',
                                  '0 0 20px rgba(255, 255, 0, 0.8)',
                                  '0 0 10px rgba(255, 255, 0, 0.5)'
                                ],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity
                              }}
                            />
                          </motion.div>
                        )}
                        
                        {/* Swap Indicator */}
                        {isSwapping && (
                          <motion.div
                            className="absolute -top-10 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1, rotate: 360 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            <motion.div
                              className="relative"
                              animate={{
                                y: [0, -5, 0]
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity
                              }}
                            >
                              <RotateCcw className="w-5 h-5 text-pink-400" />
                              <motion.div
                                className="absolute inset-0 rounded-full"
                                animate={{
                                  boxShadow: [
                                    '0 0 10px rgba(255, 0, 102, 0.5)',
                                    '0 0 25px rgba(255, 0, 102, 0.9)',
                                    '0 0 10px rgba(255, 0, 102, 0.5)'
                                  ]
                                }}
                                transition={{
                                  duration: 0.5,
                                  repeat: Infinity
                                }}
                              />
                            </motion.div>
                          </motion.div>
                        )}
                        
                        {/* Sorted Checkmark */}
                        {isSorted && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, scale: 0, rotate: -180 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                          >
                            <motion.div
                              className="w-6 h-6 rounded-full bg-green-400 border-2 border-green-300 flex items-center justify-center"
                              animate={{
                                boxShadow: [
                                  '0 0 10px rgba(0, 255, 0, 0.5)',
                                  '0 0 20px rgba(0, 255, 0, 0.8)',
                                  '0 0 10px rgba(0, 255, 0, 0.5)'
                                ]
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity
                              }}
                            >
                              <svg
                                className="w-4 h-4 text-gray-900"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          </motion.div>
                        )}
                        
                        {/* Hover Tooltip */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div className="bg-gray-900 border border-cyan-400/50 rounded px-2 py-1 text-xs text-cyan-300 whitespace-nowrap shadow-lg">
                            Index: {index}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              
              <div className="relative h-full flex items-end justify-center gap-1">
                {array.map((element, index) => {
                  const currentStepData = steps[currentStep];
                  const isComparing = currentStepData?.comparingIndices.includes(index);
                  const isSwapping = currentStepData?.swappingIndices.includes(index);
                  const isSorted = currentStepData?.sortedIndices.includes(index);
                  
                  const barColor = isSorted 
                    ? '#00ff00' 
                    : isSwapping 
                    ? '#ff0066' 
                    : isComparing 
                    ? '#ffff00' 
                    : NEON_COLORS[index % NEON_COLORS.length];

                  const maxHeight = 500;
                  const barHeight = (element.value / 100) * maxHeight;

                  return (
                    <motion.div
                      key={element.id}
                      className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: barHeight,
                        opacity: 1,
                        scale: isComparing || isSwapping ? 1.05 : 1,
                        y: isSwapping ? -10 : 0
                      }}
                      transition={{
                        height: { duration: 0.5, ease: 'easeOut' },
                        scale: { duration: 0.2 },
                        y: { duration: 0.3, type: 'spring' }
                      }}
                      style={{
                        backgroundColor: barColor,
                        boxShadow: `
                          0 0 ${isComparing ? '30px' : isSwapping ? '40px' : '15px'} ${barColor},
                          0 0 ${isComparing ? '60px' : isSwapping ? '80px' : '30px'} ${barColor}80,
                          inset 0 0 20px ${barColor}40
                        `
                      }}
                    >
                      {/* Glow effect overlay */}
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        animate={{
                          opacity: isComparing || isSwapping ? [0.3, 0.7, 0.3] : 0.2
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: isComparing || isSwapping ? Infinity : 0
                        }}
                        style={{
                          background: `linear-gradient(to top, transparent, ${barColor}60)`
                        }}
                      />

                      {/* Swap trail effect */}
                      {isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          initial={{ opacity: 0, scale: 1 }}
                          animate={{ 
                            opacity: [0.8, 0],
                            scale: [1, 1.3]
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity
                          }}
                          style={{
                            border: `2px solid ${barColor}`,
                            boxShadow: `0 0 20px ${barColor}`
                          }}
                        />
                      )}

                      {/* Value label */}
                      {arraySize[0] <= 30 && (
                        <motion.div
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{
                            color: barColor,
                            textShadow: `0 0 10px ${barColor}`
                          }}
                        >
                          {element.value}
                        </motion.div>
                      )}

                      {/* Comparison indicator */}
                      {isComparing && (
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ 
                            opacity: [0.5, 1, 0.5],
                            y: [-5, -10, -5]
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity
                          }}
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: '#ffff00',
                              boxShadow: '0 0 15px #ffff00, 0 0 30px #ffff00'
                            }}
                          />
                        </motion.div>
                      )}

                      {/* Sorted checkmark */}
                      {isSorted && (
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
                            style={{
                              backgroundColor: '#00ff00',
                              boxShadow: '0 0 20px #00ff00',
                              color: '#000'
                            }}
                          >
                            ✓
                          </div>
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
              className="mt-6 space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-400 font-semibold uppercase tracking-wider">
                  Sorting Progress
                </span>
                <span className="text-cyan-300 font-mono text-lg">
                  {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                </span>
              </div>
              
              <div className="relative h-4 bg-gray-800/50 rounded-full border border-purple-500/30 overflow-hidden shadow-inner">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
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
                
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(168, 85, 247, 0.4)',
                      '0 0 40px rgba(168, 85, 247, 0.6)',
                      '0 0 20px rgba(168, 85, 247, 0.4)'
                    ]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
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
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-6 h-6 rounded-lg bg-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0,255,255,0.8)',
                    '0 0 30px rgba(0,255,255,1)',
                    '0 0 20px rgba(0,255,255,0.8)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="flex flex-col">
                <span className="text-cyan-300 font-semibold text-sm">Comparing</span>
                <span className="text-gray-400 text-xs">Elements being compared</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                className="w-6 h-6 rounded-lg bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(236,72,153,0.8)',
                    '0 0 30px rgba(236,72,153,1)',
                    '0 0 20px rgba(236,72,153,0.8)'
                  ],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="flex flex-col">
                <span className="text-pink-300 font-semibold text-sm">Swapping</span>
                <span className="text-gray-400 text-xs">Elements being swapped</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                className="w-6 h-6 rounded-lg bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.8)]"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(74,222,128,0.8)',
                    '0 0 30px rgba(74,222,128,1)',
                    '0 0 20px rgba(74,222,128,0.8)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <div className="flex flex-col">
                <span className="text-green-300 font-semibold text-sm">Sorted</span>
                <span className="text-gray-400 text-xs">In final position</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                className="w-6 h-6 rounded-lg bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                whileHover={{
                  scale: 1.1,
                  boxShadow: '0 0 25px rgba(168,85,247,1)'
                }}
              />
              <div className="flex flex-col">
                <span className="text-purple-300 font-semibold text-sm">Unsorted</span>
                <span className="text-gray-400 text-xs">Waiting to be sorted</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}