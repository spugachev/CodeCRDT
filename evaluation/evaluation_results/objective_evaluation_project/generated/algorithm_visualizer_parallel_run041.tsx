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
    const newArray: ArrayElement[] = Array.from({ length: arraySize[0] }, (_, i) => ({
      value: Math.floor(Math.random() * 100) + 5,
      id: `element-${i}-${Date.now()}`,
      isComparing: false,
      isSwapping: false,
      isSorted: false
    }));
    setArray(newArray);
    setSteps([]);
    setCurrentStep(0);
    setComparisons(0);
    setSwaps(0);
  }, [arraySize]);

  const resetVisualization = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
    setComparisons(0);
    setSwaps(0);
    generateRandomArray();
  }, [generateRandomArray]);

  const handlePlayPause = useCallback(() => {
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1) {
        setIsPlaying(false);
      }
      return;
    }

    const delay = 1000 - speed[0] * 9.5;
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      const step = steps[currentStep + 1];
      if (step) {
        setArray(step.array);
        if (step.swappingIndices.length > 0) {
          setSwaps(prev => prev + 1);
        }
        if (step.comparingIndices.length > 0) {
          setComparisons(prev => prev + 1);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, speed]);
    if (!steps.length) return;

    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStep >= steps.length - 1) {
        setCurrentStep(0);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, currentStep, steps, speed]);

  const generateSteps = useCallback((algorithm: AlgorithmType) => {
    const arr = [...array];
    const allSteps: AlgorithmStep[] = [];
    let comparisonCount = 0;
    let swapCount = 0;

    const addStep = (
      arr: ArrayElement[],
      comparing: number[] = [],
      swapping: number[] = [],
      sorted: number[] = []
    ) => {
      allSteps.push({
        array: arr.map((el, idx) => ({
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

    if (algorithm === 'bubble') {
      const sortedIndices: number[] = [];
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          comparisonCount++;
          addStep([...arr], [j, j + 1], [], sortedIndices);
          
          if (arr[j].value > arr[j + 1].value) {
            swapCount++;
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            addStep([...arr], [], [j, j + 1], sortedIndices);
          }
        }
        sortedIndices.push(arr.length - i - 1);
        addStep([...arr], [], [], sortedIndices);
      }
    } else if (algorithm === 'quick') {
      const sortedIndices: number[] = [];
      
      const partition = (low: number, high: number): number => {
        const pivot = arr[high].value;
        let i = low - 1;
        
        addStep([...arr], [high], [], sortedIndices);
        
        for (let j = low; j < high; j++) {
          comparisonCount++;
          addStep([...arr], [j, high], [], sortedIndices);
          
          if (arr[j].value < pivot) {
            i++;
            if (i !== j) {
              swapCount++;
              [arr[i], arr[j]] = [arr[j], arr[i]];
              addStep([...arr], [], [i, j], sortedIndices);
            }
          }
        }
        
        swapCount++;
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        addStep([...arr], [], [i + 1, high], sortedIndices);
        sortedIndices.push(i + 1);
        
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
      addStep([...arr], [], [], sortedIndices);
    } else if (algorithm === 'merge') {
      const sortedIndices: number[] = [];
      
      const merge = (left: number, mid: number, right: number) => {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
          comparisonCount++;
          addStep([...arr], [left + i, mid + 1 + j], [], sortedIndices);
          
          if (leftArr[i].value <= rightArr[j].value) {
            arr[k] = leftArr[i];
            i++;
          } else {
            arr[k] = rightArr[j];
            j++;
          }
          addStep([...arr], [], [k], sortedIndices);
          k++;
        }
        
        while (i < leftArr.length) {
          arr[k] = leftArr[i];
          addStep([...arr], [], [k], sortedIndices);
          i++;
          k++;
        }
        
        while (j < rightArr.length) {
          arr[k] = rightArr[j];
          addStep([...arr], [], [k], sortedIndices);
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
      for (let i = 0; i < arr.length; i++) {
        sortedIndices.push(i);
      }
      addStep([...arr], [], [], sortedIndices);
    } else if (algorithm === 'insertion') {
      const sortedIndices: number[] = [0];
      addStep([...arr], [], [], sortedIndices);
      
      for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        
        addStep([...arr], [i], [], sortedIndices);
        
        while (j >= 0 && arr[j].value > key.value) {
          comparisonCount++;
          addStep([...arr], [j, j + 1], [], sortedIndices);
          
          swapCount++;
          arr[j + 1] = arr[j];
          addStep([...arr], [], [j, j + 1], sortedIndices);
          j--;
        }
        
        if (j >= 0) {
          comparisonCount++;
          addStep([...arr], [j, i], [], sortedIndices);
        }
        
        arr[j + 1] = key;
        sortedIndices.push(i);
        addStep([...arr], [], [], sortedIndices);
      }
    }

    setSteps(allSteps);
    setComparisons(comparisonCount);
    setSwaps(swapCount);
    setCurrentStep(0);
    
    if (allSteps.length > 0) {
      setArray(allSteps[0].array);
    }
  }, [array]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
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

          <div className="flex justify-center gap-4 flex-wrap">
            {mockAlgorithms.map((algo) => (
              <motion.div
                key={algo.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                  variant={selectedAlgorithm === algo.id ? 'default' : 'outline'}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    selectedAlgorithm === algo.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 shadow-lg shadow-cyan-500/50'
                      : 'bg-gray-800/50 border-cyan-500/30 text-cyan-300 hover:bg-gray-700/50 hover:border-cyan-400'
                  }`}
                >
                  <span className="relative z-10 flex flex-col items-center">
                    <span className="font-semibold">{algo.name}</span>
                    <span className="text-xs opacity-80">{algo.complexity}</span>
                  </span>
                  {selectedAlgorithm === algo.id && (
                    <motion.div
                      layoutId="algorithmSelector"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative bg-gray-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 overflow-hidden group hover:border-cyan-400/60 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-cyan-300 font-semibold text-lg">Comparisons</h3>
              </div>
              <motion.div
                key={comparisons}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-bold text-white mb-2"
              >
                {comparisons.toLocaleString()}
              </motion.div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                  initial={{ width: 0 }}
                  animate={{ width: comparisons > 0 ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 overflow-hidden group hover:border-purple-400/60 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-purple-300 font-semibold text-lg">Swaps</h3>
              </div>
              <motion.div
                key={swaps}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-bold text-white mb-2"
              >
                {swaps.toLocaleString()}
              </motion.div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-300"
                  initial={{ width: 0 }}
                  animate={{ width: swaps > 0 ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative bg-gray-900/50 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6 overflow-hidden group hover:border-pink-400/60 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/30">
                  <BarChart3 className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-pink-300 font-semibold text-lg">Complexity</h3>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {mockAlgorithms.find(alg => alg.id === selectedAlgorithm)?.complexity || 'O(n²)'}
              </div>
              <div className="text-sm text-gray-400 font-mono">
                {mockAlgorithms.find(alg => alg.id === selectedAlgorithm)?.name || 'Bubble Sort'}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 min-h-[500px] relative overflow-hidden">
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />
            </div>

            {/* Visualization area */}
            <div className="relative h-[400px] flex items-end justify-center gap-1 px-4">
              {array.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <BarChart3 className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
                    <p className="text-purple-300/70 text-lg">Generate an array to start visualizing</p>
                  </motion.div>
                </div>
              ) : (
                array.map((element, index) => {
                  const height = (element.value / Math.max(...array.map(e => e.value))) * 100;
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
                    <motion.div
                      key={element.id}
                      layout
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: `${height}%`,
                        opacity: 1,
                        scale: isSwapping ? 1.1 : isComparing ? 1.05 : 1,
                      }}
                      transition={{
                        height: { duration: 0.3, ease: "easeOut" },
                        scale: { duration: 0.2 },
                        layout: { duration: 0.5, ease: "easeInOut" }
                      }}
                      className="relative flex-1 min-w-[4px] max-w-[60px] rounded-t-lg"
                      style={{
                        backgroundColor: barColor,
                        boxShadow: `
                          0 0 10px ${glowColor},
                          0 0 20px ${glowColor}80,
                          0 0 30px ${glowColor}40,
                          inset 0 0 10px ${glowColor}40
                        `,
                      }}
                    >
                      {/* Trail effect for swapping */}
                      {isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            backgroundColor: barColor,
                            filter: 'blur(8px)',
                          }}
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      )}
                      
                      {/* Pulse effect for comparing */}
                      {isComparing && (
                        <motion.div
                          className="absolute -inset-1 rounded-t-lg"
                          style={{
                            border: `2px solid ${glowColor}`,
                            boxShadow: `0 0 20px ${glowColor}`,
                          }}
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                      )}

                      {/* Value label */}
                      {array.length <= 30 && (
                        <motion.div
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono"
                          style={{ color: barColor }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.8 }}
                        >
                          {element.value}
                        </motion.div>
                      )}

                      {/* Sorted checkmark */}
                      {isSorted && (
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

                <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Playback Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Playback Controls
              </h3>
              <div className="flex gap-3">
                <Button
                  onClick={handlePlayPause}
                  disabled={steps.length === 0}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-6 px-6 rounded-xl shadow-lg hover:shadow-pink-500/50 transition-all duration-300"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Speed Control */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Animation Speed
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Slow</span>
                  <span className="text-cyan-400 font-semibold">{speed[0]}%</span>
                  <span>Fast</span>
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
            </div>

            {/* Array Size Control */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Array Size
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Small (10)</span>
                  <span className="text-green-400 font-semibold">{arraySize[0]} elements</span>
                  <span>Large (100)</span>
                </div>
                <Slider
                  value={arraySize}
                  onValueChange={setArraySize}
                  min={10}
                  max={100}
                  step={5}
                  disabled={isPlaying}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockAlgorithms.map((algo) => (
            <motion.div
              key={algo.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
              className={`relative cursor-pointer rounded-xl p-6 backdrop-blur-sm transition-all duration-300 ${
                selectedAlgorithm === algo.id
                  ? 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.5)]'
                  : 'bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]'
              }`}
            >
              {selectedAlgorithm === algo.id && (
                <motion.div
                  layoutId="selectedGlow"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <BarChart3 
                    className={`w-6 h-6 ${
                      selectedAlgorithm === algo.id ? 'text-cyan-400' : 'text-white/60'
                    }`} 
                  />
                  {selectedAlgorithm === algo.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                    />
                  )}
                </div>
                <h3 className={`text-lg font-bold ${
                  selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-white'
                }`}>
                  {algo.name}
                </h3>
                <p className={`text-sm font-mono ${
                  selectedAlgorithm === algo.id ? 'text-purple-300' : 'text-white/50'
                }`}>
                  {algo.complexity}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Legend</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
              <div>
                <p className="text-sm font-medium text-white">Comparing</p>
                <p className="text-xs text-gray-400">Being compared</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border-2 border-yellow-400 shadow-[0_0_15px_rgba(255,255,0,0.5)]" />
              <div>
                <p className="text-sm font-medium text-white">Swapping</p>
                <p className="text-xs text-gray-400">Being swapped</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 border-2 border-green-400 shadow-[0_0_15px_rgba(0,255,0,0.5)]" />
              <div>
                <p className="text-sm font-medium text-white">Sorted</p>
                <p className="text-xs text-gray-400">In final position</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              <div>
                <p className="text-sm font-medium text-white">Unsorted</p>
                <p className="text-xs text-gray-400">Not yet sorted</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}