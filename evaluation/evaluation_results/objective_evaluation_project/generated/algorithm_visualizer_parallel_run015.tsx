import { useState, useCallback } from 'react';import { useEffect } from 'react';
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
    setIsPlaying(true);
    
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {


    setIsPlaying(false);  }, []);

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

    const swap = (i: number, j: number) => {
      [arr[i], arr[j]] = [arr[j], arr[i]];
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
          let i = low - 1;
          
          for (let j = low; j < high; j++) {
            addStep([j, high], [], sorted);
            if (arr[j].value < pivot) {
              i++;
              if (i !== j) {
                addStep([j, high], [i, j], sorted);
                swap(i, j);
              }
            }
          }
          addStep([high], [i + 1, high], sorted);
          swap(i + 1, high);
          return i + 1;
        };

        quickSort(0, arr.length - 1);
        break;
      }

      case 'merge': {
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
              arr[k] = rightArr[j];
              j++;
            }
            k++;
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
              className="text-2xl font-semibold text-cyan-300"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name}
            </motion.div>
            <motion.div
              className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400 backdrop-blur-sm"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' }}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-300" />
                <span className="text-purple-200 font-mono">
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
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.3)] space-y-6"
            >
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
                          : 'bg-gray-700/30 border-gray-600 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="font-semibold text-white">{algo.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{algo.complexity}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Array Size Control */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <BarChart3 className="w-5 h-5" />
                  <h3 className="font-bold">Array Size</h3>
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
                    className="cursor-pointer"
                    disabled={isPlaying}
                  />
                </div>
              </div>

              {/* Speed Control */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-pink-400">
                  <Zap className="w-5 h-5" />
                  <h3 className="font-bold">Speed</h3>
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
              <div className="space-y-3 pt-4 border-t border-gray-700">
                <Button
                  onClick={isPlaying ? pauseVisualization : startVisualization}
                  disabled={steps.length === 0 || currentStep >= steps.length}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all duration-300"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {currentStep >= steps.length ? 'Finished' : 'Start'}
                    </>
                  )}
                </Button>

                <Button
                  onClick={resetVisualization}
                  variant="outline"
                  className="w-full border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold py-6 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>

                <Button
                  onClick={() => {
                    generateRandomArray();
                    generateSortingSteps(selectedAlgorithm);
                  }}
                  variant="outline"
                  disabled={isPlaying}
                  className="w-full border-2 border-pink-500/50 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 font-bold py-6 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all duration-300"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Generate New
                </Button>
              </div>

              {/* Progress Indicator */}
              {steps.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-mono">
                      {currentStep} / {steps.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
            
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Algorithm
                  </h3>
                  <div className="space-y-2">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/50'
                            : 'bg-gray-700/50 text-gray-300 border border-gray-600/30 hover:border-cyan-400/30 hover:shadow-md hover:shadow-cyan-500/20'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex justify-between items-center">
                          <span>{algo.name}</span>
                          <span className="text-xs opacity-70">{algo.complexity}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div></parameter>
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Array Size: {arraySize[0]}
                  </h3>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={1}
                    className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-400/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-cyan-400/80 [&_[role=slider]]:hover:scale-110"
                    disabled={isPlaying}
                  />
                </div>

                <div>
                  <h3 className="text-cyan-400 font-semibold mb-4">
                    Speed: {speed[0]}ms
                  </h3>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={500}
                    step={10}
                    className="cursor-pointer [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-shadow [&_[role=slider]]:hover:shadow-xl [&_[role=slider]]:hover:shadow-purple-500/70 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&>span]:bg-gradient-to-r [&>span]:from-cyan-500/30 [&>span]:to-purple-500/30 [&>span]:h-2"
                  /></parameter>
                </div>

                <div className="space-y-3 pt-4 border-t border-cyan-500/20">
                  <motion.button
                    onClick={() => {
                      if (isPlaying) {
                        pauseVisualization();
                      } else {
                        if (steps.length === 0) {
                          generateSortingSteps(selectedAlgorithm);
                        }
                        startVisualization();
                      }
                    }}
                    disabled={array.length === 0}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 255, 255, 0.6)' }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: isPlaying 
                        ? ['0 0 20px rgba(0, 255, 255, 0.5)', '0 0 40px rgba(138, 43, 226, 0.5)', '0 0 20px rgba(0, 255, 255, 0.5)']
                        : '0 0 20px rgba(0, 255, 255, 0.3)'
                    }}
                    transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
                  >
                    <motion.div
                      className="flex items-center justify-center gap-3"
                      initial={false}
                      animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
                      transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                    >
                      <motion.div
                        initial={false}
                        animate={{ rotate: isPlaying ? 0 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isPlaying ? (
                          <motion.div
                            key="pause"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Pause className="w-6 h-6" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="play"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Play className="w-6 h-6" />
                          </motion.div>
                        )}
                      </motion.div>
                      <span className="text-lg">
                        {isPlaying ? 'Pause' : 'Start Visualization'}
                      </span>
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: isPlaying ? '100%' : '-100%' }}
                      transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
                    />
                  </motion.button>
                  
                  <motion.div whileTap={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <Button
                      onClick={resetVisualization}
                      variant="outline"
                      className="w-full bg-purple-500/20 border-purple-400 text-purple-300 hover:bg-purple-500/30 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                      disabled={isPlaying}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </motion.div>
                  
                  {/* TODO:GenerateButton Generate new array button with pulse effect */}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] space-y-4"
            >
              <div className="flex items-center gap-2 text-purple-400 mb-4">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-bold text-lg">Statistics</h3>
              </div>

              <div className="space-y-4">
                {/* Current Step */}
                <motion.div
                  className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4 border border-cyan-400/30"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}
                >
                  <div className="text-sm text-gray-400 mb-1">Current Step</div>
                  <div className="flex items-baseline gap-2">
                    <motion.span
                      className="text-3xl font-bold text-cyan-300 font-mono"
                      key={currentStep}
                      initial={{ scale: 1.2, color: '#00ffff' }}
                      animate={{ scale: 1, color: '#67e8f9' }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentStep}
                    </motion.span>
                    <span className="text-gray-500">/ {steps.length}</span>
                  </div>
                  {steps.length > 0 && (
                    <div className="mt-2 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </motion.div>

                {/* Comparisons */}
                <motion.div
                  className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-400/30"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(255, 255, 0, 0.3)' }}
                >
                  <div className="text-sm text-gray-400 mb-1">Comparisons</div>
                  <motion.div
                    className="text-3xl font-bold text-yellow-300 font-mono"
                    key={steps.filter(s => s.comparingIndices.length > 0).length}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {steps.slice(0, currentStep).filter(s => s.comparingIndices.length > 0).length}
                  </motion.div>
                  <div className="text-xs text-gray-500 mt-1">Total comparisons made</div>
                </motion.div>

                {/* Swaps */}
                <motion.div
                  className="bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-lg p-4 border border-pink-400/30"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)' }}
                >
                  <div className="text-sm text-gray-400 mb-1">Swaps</div>
                  <motion.div
                    className="text-3xl font-bold text-pink-300 font-mono"
                    key={steps.filter(s => s.swappingIndices.length > 0).length}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {steps.slice(0, currentStep).filter(s => s.swappingIndices.length > 0).length}
                  </motion.div>
                  <div className="text-xs text-gray-500 mt-1">Array elements swapped</div>
                </motion.div>

                {/* Sorted Elements */}
                <motion.div
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-400/30"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)' }}
                >
                  <div className="text-sm text-gray-400 mb-1">Sorted Elements</div>
                  <div className="flex items-baseline gap-2">
                    <motion.span
                      className="text-3xl font-bold text-green-300 font-mono"
                      key={steps[currentStep - 1]?.sortedIndices.length || 0}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {steps[currentStep - 1]?.sortedIndices.length || 0}
                    </motion.span>
                    <span className="text-gray-500">/ {array.length}</span>
                  </div>
                  {array.length > 0 && (
                    <div className="mt-2 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-400"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${((steps[currentStep - 1]?.sortedIndices.length || 0) / array.length) * 100}%` 
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </motion.div>

                {/* Status Indicator */}
                <motion.div
                  className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30"
                  animate={{
                    borderColor: isPlaying 
                      ? ['rgba(0, 255, 255, 0.3)', 'rgba(255, 0, 255, 0.3)', 'rgba(0, 255, 255, 0.3)']
                      : 'rgba(156, 163, 175, 0.3)'
                  }}
                  transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
                >
                  <div className="text-sm text-gray-400 mb-2">Status</div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className={`w-3 h-3 rounded-full ${
                        isPlaying ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                      animate={{
                        boxShadow: isPlaying
                          ? ['0 0 10px rgba(0, 255, 0, 0.8)', '0 0 20px rgba(0, 255, 0, 0.8)', '0 0 10px rgba(0, 255, 0, 0.8)']
                          : '0 0 0px rgba(0, 0, 0, 0)'
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className={`font-semibold ${
                      isPlaying ? 'text-green-300' : 'text-gray-400'
                    }`}>
                      {isPlaying ? 'Running' : currentStep === steps.length && steps.length > 0 ? 'Completed' : 'Idle'}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-lg shadow-purple-500/20 min-h-[600px]">
                            {array.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <BarChart3 className="w-24 h-24 text-cyan-400/50" />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-xl font-semibold"
                  >
                    Click "Generate New" to create an array
                  </motion.p>
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(0, 255, 255, 0.3)',
                        '0 0 40px rgba(168, 85, 247, 0.5)',
                        '0 0 20px rgba(0, 255, 255, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50"
                  >
                    <span className="text-cyan-300 font-mono">Ready to visualize</span>
                  </motion.div>
                </div>
              ) : (
                <div className="relative h-full w-full">
                  {/* Progress indicator */}
                  {steps.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-0 left-0 right-0 mb-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-cyan-400 font-semibold">
                          Step {currentStep} / {steps.length}
                        </span>
                        <span className="text-purple-400 font-mono text-sm">
                          {Math.round((currentStep / steps.length) * 100)}% Complete
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                          transition={{ duration: 0.3 }}
                          style={{
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.6)'
                          }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Visualization bars */}
                  <div className="h-full flex items-end justify-center gap-1 pt-16">
                    {(steps.length > 0 && currentStep < steps.length ? steps[currentStep].array : array).map((element, index) => {
                      const maxValue = Math.max(...array.map(el => el.value));
                      const heightPercentage = (element.value / maxValue) * 100;
                      const colorIndex = index % NEON_COLORS.length;
                      const baseColor = NEON_COLORS[colorIndex];

                      let barColor = baseColor;
                      let glowColor = baseColor;
                      let glowIntensity = 0.3;

                      if (element.isSorted) {
                        barColor = '#00ff00';
                        glowColor = '#00ff00';
                        glowIntensity = 0.8;
                      } else if (element.isSwapping) {
                        barColor = '#ff0066';
                        glowColor = '#ff0066';
                        glowIntensity = 1;
                      } else if (element.isComparing) {
                        barColor = '#ffff00';
                        glowColor = '#ffff00';
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
                              `0 0 ${10 + glowIntensity * 20}px ${glowColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}`,
                              `0 0 ${15 + glowIntensity * 30}px ${glowColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}`,
                              `0 0 ${10 + glowIntensity * 20}px ${glowColor}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}`
                            ],
                            scale: element.isSwapping ? [1, 1.1, 1] : element.isComparing ? 1.05 : 1,
                            y: element.isSwapping ? [0, -20, 0] : 0
                          }}
                          transition={{
                            height: { duration: 0.5, ease: "easeOut" },
                            backgroundColor: { duration: 0.3 },
                            boxShadow: { duration: 1, repeat: Infinity },
                            scale: { duration: 0.3 },
                            y: { duration: 0.5, ease: "easeInOut" },
                            opacity: { duration: 0.5, delay: index * 0.02 }
                          }}
                          style={{
                            background: element.isSorted
                              ? 'linear-gradient(to top, #00ff00, #00ffaa)'
                              : element.isSwapping
                              ? 'linear-gradient(to top, #ff0066, #ff00ff)'
                              : element.isComparing
                              ? 'linear-gradient(to top, #ffff00, #ffaa00)'
                              : `linear-gradient(to top, ${barColor}, ${barColor}dd)`
                          }}
                        >
                          {/* Trail effect for swapping */}
                          {element.isSwapping && (
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              initial={{ opacity: 0.8, scale: 1 }}
                              animate={{ opacity: 0, scale: 1.5 }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              style={{
                                background: `radial-gradient(circle, ${glowColor}80, transparent)`,
                                filter: 'blur(8px)'
                              }}
                            />
                          )}

                          {/* Value label */}
                          {arraySize[0] <= 30 && (
                            <motion.div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: element.isComparing || element.isSwapping ? 1 : 0.6 }}
                              style={{ color: barColor }}
                            >
                              {element.value}
                            </motion.div>
                          )}

                          {/* Glow effect at base */}
                          <motion.div
                            className="absolute -bottom-1 left-0 right-0 h-2 rounded-full blur-sm"
                            animate={{
                              opacity: [glowIntensity * 0.5, glowIntensity, glowIntensity * 0.5]
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{ backgroundColor: glowColor }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Completion celebration */}
                  {steps.length > 0 && currentStep >= steps.length && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-2xl"
                    >
                      <div className="text-center space-y-4">
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <BarChart3 className="w-20 h-20 text-cyan-400 mx-auto" />
                        </motion.div>
                        <motion.h2
                          className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                          animate={{
                            textShadow: [
                              '0 0 20px rgba(0, 255, 255, 0.5)',
                              '0 0 40px rgba(255, 0, 255, 0.5)',
                              '0 0 20px rgba(0, 255, 255, 0.5)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Sorting Complete!
                        </motion.h2>
                        <p className="text-gray-400">Array is now sorted</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
              
              <div className="h-full flex items-end justify-center gap-1">
                {array.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center text-gray-400 text-xl"
                  >
                    <Zap className="w-16 h-16 mx-auto mb-4 text-cyan-400 opacity-50" />
                    <p>Click "Generate New" to create an array</p>
                  </motion.div>
                ) : (
                  array.map((element, index) => {
                    const colorIndex = index % NEON_COLORS.length;
                    const neonColor = NEON_COLORS[colorIndex];
                    const heightPercentage = (element.value / 100) * 100;
                    
                    let barColor = neonColor;
                    let glowIntensity = 0.4;
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
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: scale,
                          height: `${heightPercentage}%`,
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          layout: { duration: 0.5, type: 'spring', stiffness: 300, damping: 30 },
                          height: { duration: 0.3, ease: 'easeInOut' },
                          scale: { duration: 0.2, ease: 'easeOut' },
                          opacity: { duration: 0.3 }
                        }}
                        className="relative flex-1 min-w-[8px] max-w-[60px] rounded-t-lg"
                        style={{
                          backgroundColor: barColor,
                          boxShadow: `
                            0 0 ${20 * glowIntensity}px ${barColor},
                            0 0 ${40 * glowIntensity}px ${barColor},
                            inset 0 0 ${10 * glowIntensity}px rgba(255, 255, 255, 0.3)
                          `,
                          border: `2px solid ${barColor}`,
                          minHeight: '20px'
                        }}
                      >
                        {/* Trail effect for swapping */}
                        {element.isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              backgroundColor: barColor,
                              opacity: 0.5
                            }}
                            animate={{
                              opacity: [0.5, 0, 0.5],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          />
                        )}

                        {/* Pulse effect for comparing */}
                        {element.isComparing && (
                          <motion.div
                            className="absolute -inset-1 rounded-t-lg"
                            style={{
                              border: `2px solid ${barColor}`,
                              opacity: 0.6
                            }}
                            animate={{
                              scale: [1, 1.15, 1],
                              opacity: [0.6, 0, 0.6]
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          />
                        )}

                        {/* Sparkle effect for sorted */}
                        {element.isSorted && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1,
                              ease: 'easeInOut'
                            }}
                            style={{
                              background: `linear-gradient(180deg, rgba(255,255,255,0.8) 0%, transparent 100%)`
                            }}
                          />
                        )}

                        {/* Value label */}
                        <motion.div
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
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

                        {/* Gradient overlay */}
                        <div
                          className="absolute inset-0 rounded-t-lg pointer-events-none"
                          style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)'
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
              className="mt-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.3)]"
            >
              <div className="flex items-center gap-2 text-pink-400 mb-4">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-bold text-lg">Legend</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/50"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(100, 100, 100, 0.4)' }}
                >
                  <motion.div
                    className="w-8 h-12 rounded bg-gradient-to-t from-cyan-500 to-cyan-300"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(0, 255, 255, 0.5)',
                        '0 0 20px rgba(0, 255, 255, 0.8)',
                        '0 0 10px rgba(0, 255, 255, 0.5)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-white font-semibold text-sm">Normal</div>
                    <div className="text-gray-400 text-xs">Unsorted</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/50"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255, 255, 0, 0.4)' }}
                >
                  <motion.div
                    className="w-8 h-12 rounded bg-gradient-to-t from-yellow-500 to-yellow-300"
                    animate={{
                      boxShadow: [
                        '0 0 15px rgba(255, 255, 0, 0.6)',
                        '0 0 30px rgba(255, 255, 0, 0.9)',
                        '0 0 15px rgba(255, 255, 0, 0.6)'
                      ],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-white font-semibold text-sm">Comparing</div>
                    <div className="text-gray-400 text-xs">Checking</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/50"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255, 165, 0, 0.4)' }}
                >
                  <motion.div
                    className="w-8 h-12 rounded bg-gradient-to-t from-orange-500 to-orange-300"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(255, 165, 0, 0.7)',
                        '0 0 40px rgba(255, 165, 0, 1)',
                        '0 0 20px rgba(255, 165, 0, 0.7)'
                      ],
                      scale: [1, 1.15, 1],
                      y: [0, -5, 0]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <div>
                    <div className="text-white font-semibold text-sm">Swapping</div>
                    <div className="text-gray-400 text-xs">Moving</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/50"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(0, 255, 0, 0.4)' }}
                >
                  <motion.div
                    className="w-8 h-12 rounded bg-gradient-to-t from-green-500 to-green-300"
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
                    <div className="text-white font-semibold text-sm">Sorted</div>
                    <div className="text-gray-400 text-xs">Complete</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <BarChart3 className="w-7 h-7 text-cyan-400" />
            </motion.div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Algorithm Complexity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Complexity */}
            <motion.div
              className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-400/30"
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0, 255, 255, 0.4)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-cyan-300">Time Complexity</h3>
              </div>
              <motion.div
                className="text-4xl font-bold font-mono text-white mb-2"
                key={`time-${selectedAlgorithm}`}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity}
              </motion.div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {selectedAlgorithm === 'bubble' && 'Worst and average case. Best case O(n) when array is already sorted.'}
                {selectedAlgorithm === 'insertion' && 'Worst and average case. Best case O(n) when array is nearly sorted.'}
                {selectedAlgorithm === 'quick' && 'Average case. Worst case O(n²) with poor pivot selection.'}
                {selectedAlgorithm === 'merge' && 'Consistent performance across all cases with guaranteed O(n log n).'}
              </p>
            </motion.div>

            {/* Space Complexity */}
            <motion.div
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-400/30"
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-purple-300">Space Complexity</h3>
              </div>
              <motion.div
                className="text-4xl font-bold font-mono text-white mb-2"
                key={`space-${selectedAlgorithm}`}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                {selectedAlgorithm === 'merge' ? 'O(n)' : 'O(1)'}
              </motion.div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {selectedAlgorithm === 'bubble' && 'In-place sorting with only a constant amount of extra space needed.'}
                {selectedAlgorithm === 'insertion' && 'In-place sorting requiring only constant extra memory.'}
                {selectedAlgorithm === 'quick' && 'In-place with O(log n) stack space for recursion.'}
                {selectedAlgorithm === 'merge' && 'Requires additional array space proportional to input size.'}
              </p>
            </motion.div>
          </div>

          {/* Algorithm Description */}
          <motion.div
            className="mt-6 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-xl p-6 border border-gray-600/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                ��
              </motion.div>
              How It Works
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {selectedAlgorithm === 'bubble' && 
                'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. Larger elements "bubble" to the end with each iteration.'
              }
              {selectedAlgorithm === 'insertion' && 
                'Insertion Sort builds the final sorted array one item at a time. It iterates through the input, removing one element per iteration and finding the location it belongs within the sorted list, then inserting it there. Efficient for small data sets and nearly sorted arrays.'
              }
              {selectedAlgorithm === 'quick' && 
                'Quick Sort is a divide-and-conquer algorithm that picks a pivot element and partitions the array around it, placing smaller elements before and larger elements after. It then recursively sorts the sub-arrays. One of the fastest sorting algorithms in practice.'
              }
              {selectedAlgorithm === 'merge' && 
                'Merge Sort divides the array into two halves, recursively sorts them, and then merges the two sorted halves. It guarantees O(n log n) performance but requires additional memory. Stable and predictable, making it ideal for large datasets.'
              }
            </p>
          </motion.div>

          {/* Best Use Cases */}
          <motion.div
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/30">
              <div className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                <span className="text-xl">✓</span>
                Best For
              </div>
              <p className="text-sm text-gray-300">
                {selectedAlgorithm === 'bubble' && 'Small datasets, educational purposes, nearly sorted data'}
                {selectedAlgorithm === 'insertion' && 'Small datasets, nearly sorted data, online sorting'}
                {selectedAlgorithm === 'quick' && 'Large datasets, general-purpose sorting, in-memory sorting'}
                {selectedAlgorithm === 'merge' && 'Large datasets, stable sorting, linked lists, external sorting'}
              </p>
            </div>

            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-400/30">
              <div className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Performance
              </div>
              <p className="text-sm text-gray-300">
                {selectedAlgorithm === 'bubble' && 'Slow for large datasets, many comparisons and swaps'}
                {selectedAlgorithm === 'insertion' && 'Fast for small/nearly sorted data, adaptive algorithm'}
                {selectedAlgorithm === 'quick' && 'Very fast average case, cache-friendly, in-place'}
                {selectedAlgorithm === 'merge' && 'Consistent speed, predictable, parallelizable'}
              </p>
            </div>

            <div className="bg-red-500/10 rounded-lg p-4 border border-red-400/30">
              <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <span className="text-xl">⚠</span>
                Limitations
              </div>
              <p className="text-sm text-gray-300">
                {selectedAlgorithm === 'bubble' && 'Inefficient for large datasets, O(n²) comparisons'}
                {selectedAlgorithm === 'insertion' && 'Poor performance on reverse-sorted or random data'}
                {selectedAlgorithm === 'quick' && 'Unstable sort, worst case O(n²), recursive overhead'}
                {selectedAlgorithm === 'merge' && 'Requires O(n) extra space, not in-place'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}