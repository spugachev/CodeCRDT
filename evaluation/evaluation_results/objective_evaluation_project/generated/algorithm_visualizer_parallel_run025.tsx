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

  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const delay = 1000 - speed[0] * 10;
      const timer = setTimeout(() => {
        setArray(steps[currentStep].array);
        setCurrentStep((prev) => {
          const nextStep = prev + 1;
          if (nextStep >= steps.length) {
            setIsPlaying(false);
            return prev;
          }
          return nextStep;
        });
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, steps, speed]);
  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const delay = 1000 - speed[0] * 10;
      const timer = setTimeout(() => {
        setCurrentStep((prev) => {
          const nextStep = prev + 1;
          if (nextStep >= steps.length) {
            setIsPlaying(false);
            return prev;
          }
          return nextStep;
        });
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, steps.length, speed]);
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
    if (steps.length === 0 || currentStep >= steps.length) return;
    
    setIsPlaying(true);
    
    const animate = () => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1;
        if (nextStep >= steps.length) {
          setIsPlaying(false);
          return prev;
        }
        return nextStep;
      });
    };
    
    const delay = 1000 - speed[0] * 10;
    const timer = setTimeout(animate, delay);
    
    return () => clearTimeout(timer);
    
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {
    setIsPlaying(false);

  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
        if (array.length === 0) return;

    const steps: AlgorithmStep[] = [];
    const arr = array.map(el => ({ ...el }));

    const addStep = (
      currentArray: ArrayElement[],
      comparing: number[] = [],
      swapping: number[] = [],
      sorted: number[] = []
    ) => {
      steps.push({
        array: currentArray.map(el => ({ ...el })),
        comparingIndices: [...comparing],
        swappingIndices: [...swapping],
        sortedIndices: [...sorted]
      });
    };

    switch (algorithm) {
      case 'bubble': {
        const sortedIndices: number[] = [];
        for (let i = 0; i < arr.length - 1; i++) {
          for (let j = 0; j < arr.length - i - 1; j++) {
            addStep(arr, [j, j + 1], [], sortedIndices);
            
            if (arr[j].value > arr[j + 1].value) {
              addStep(arr, [], [j, j + 1], sortedIndices);
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              addStep(arr, [], [], sortedIndices);
            }
          }
          sortedIndices.push(arr.length - i - 1);
          addStep(arr, [], [], sortedIndices);
        }
        sortedIndices.push(0);
        addStep(arr, [], [], sortedIndices);
        break;
      }

      case 'insertion': {
        const sortedIndices: number[] = [0];
        addStep(arr, [], [], sortedIndices);
        
        for (let i = 1; i < arr.length; i++) {
          const key = arr[i];
          let j = i - 1;
          
          addStep(arr, [i], [], sortedIndices);
          
          while (j >= 0 && arr[j].value > key.value) {
            addStep(arr, [j, j + 1], [], sortedIndices);
            addStep(arr, [], [j, j + 1], sortedIndices);
            arr[j + 1] = arr[j];
            addStep(arr, [], [], sortedIndices);
            j--;
          }
          
          arr[j + 1] = key;
          sortedIndices.push(i);
          addStep(arr, [], [], sortedIndices);
        }
        break;
      }

      case 'quick': {
        const sortedIndices: number[] = [];
        
        const partition = (low: number, high: number): number => {
          const pivot = arr[high].value;
          let i = low - 1;
          
          addStep(arr, [high], [], sortedIndices);
          
          for (let j = low; j < high; j++) {
            addStep(arr, [j, high], [], sortedIndices);
            
            if (arr[j].value < pivot) {
              i++;
              addStep(arr, [], [i, j], sortedIndices);
              [arr[i], arr[j]] = [arr[j], arr[i]];
              addStep(arr, [], [], sortedIndices);
            }
          }
          
          addStep(arr, [], [i + 1, high], sortedIndices);
          [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
          sortedIndices.push(i + 1);
          addStep(arr, [], [], sortedIndices);
          
          return i + 1;
        };
        
        const quickSort = (low: number, high: number) => {
          if (low < high) {
            const pi = partition(low, high);
            quickSort(low, pi - 1);
            quickSort(pi + 1, high);
          } else if (low === high) {
            sortedIndices.push(low);
            addStep(arr, [], [], sortedIndices);
          }
        };
        
        quickSort(0, arr.length - 1);
        break;
      }

      case 'merge': {
        const sortedIndices: number[] = [];
        
        const merge = (left: number, mid: number, right: number) => {
          const leftArr = arr.slice(left, mid + 1);
          const rightArr = arr.slice(mid + 1, right + 1);
          
          let i = 0, j = 0, k = left;
          
          while (i < leftArr.length && j < rightArr.length) {
            addStep(arr, [left + i, mid + 1 + j], [], sortedIndices);
            
            if (leftArr[i].value <= rightArr[j].value) {
              addStep(arr, [], [k], sortedIndices);
              arr[k] = leftArr[i];
              i++;
            } else {
              addStep(arr, [], [k], sortedIndices);
              arr[k] = rightArr[j];
              j++;
            }
            k++;
            addStep(arr, [], [], sortedIndices);
          }
          
          while (i < leftArr.length) {
            addStep(arr, [], [k], sortedIndices);
            arr[k] = leftArr[i];
            i++;
            k++;
            addStep(arr, [], [], sortedIndices);
          }
          
          while (j < rightArr.length) {
            addStep(arr, [], [k], sortedIndices);
            arr[k] = rightArr[j];
            j++;
            k++;
            addStep(arr, [], [], sortedIndices);
          }
          
          if (right - left + 1 === arr.length) {
            for (let idx = 0; idx < arr.length; idx++) {
              sortedIndices.push(idx);
            }
          }
          addStep(arr, [], [], sortedIndices);
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
        break;
      }
    }

    setSteps(steps);
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
              transition={{ delay: 0.3, type: "spring" }}
              className="px-6 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full backdrop-blur-sm"
            >
              <span className="text-2xl font-semibold text-purple-300">
                {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.name || 'Bubble Sort'}
              </span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 rounded-full backdrop-blur-sm relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
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
              className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] transition-shadow duration-300"
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

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-semibold">
                      <Zap className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wider">Speed</span>
                    </div>
                    <span className="text-white font-mono text-sm bg-purple-500/20 px-2 py-1 rounded border border-purple-500/30">
                      {speed[0]}%
                    </span>
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
                    <div className="flex items-center gap-2 text-pink-400 font-semibold">
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wider">Array Size</span>
                    </div>
                    <span className="text-white font-mono text-sm bg-pink-500/20 px-2 py-1 rounded border border-pink-500/30">
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
                    className="cursor-pointer"
                  />
                </div>

                {/* Control Buttons */}
                <div className="space-y-2 pt-4 border-t border-gray-700">
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
                        {currentStep >= steps.length ? 'Start' : 'Resume'}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    variant="outline"
                    className="w-full border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>

                  <Button
                    onClick={generateRandomArray}
                    disabled={isPlaying}
                    variant="outline"
                    className="w-full border-2 border-pink-500/50 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 hover:text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all duration-300"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    New Array
                  </Button>
                </div>

                {/* Stats Display */}
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Current Step:</span>
                    <span className="text-cyan-400 font-mono font-semibold">
                      {currentStep} / {steps.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-semibold ${isPlaying ? 'text-green-400' : 'text-gray-400'}`}>
                      {isPlaying ? 'Running' : 'Idle'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div></parameter>
            
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
                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-300 [&_[role=slider]]:shadow-[0_0_15px_rgba(34,211,238,0.8)] [&_[role=slider]]:transition-shadow [&_[role=slider]]:hover:shadow-[0_0_25px_rgba(34,211,238,1)] [&_.relative]:h-2 [&_.relative]:bg-gray-800 [&_.relative]:rounded-full [&_.relative]:border [&_.relative]:border-cyan-500/30 [&_[role=slider]]:focus-visible:ring-0 [&_[role=slider]]:focus-visible:ring-offset-0 [&_[role=slider]]:focus-visible:shadow-[0_0_30px_rgba(34,211,238,1)]"
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
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-purple-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/50 [&_[role=slider]]:transition-all [&_[role=slider]]:hover:shadow-purple-500/80 [&_[role=slider]]:hover:scale-110 [&>span]:bg-gradient-to-r [&>span]:from-purple-500/30 [&>span]:to-pink-500/30 [&>span]:h-2 [&>span]:rounded-full"
                    disabled={isPlaying}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={isPlaying ? pauseVisualization : startVisualization}
                      disabled={array.length === 0 || (steps.length === 0 && !isPlaying)}
                      className="relative bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold px-6 py-6 rounded-lg shadow-lg overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 blur-xl"
                        animate={{
                          opacity: isPlaying ? [0.5, 0.8, 0.5] : 0
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <motion.div
                        className="relative flex items-center gap-2"
                        initial={false}
                        animate={{ rotate: isPlaying ? 0 : 0 }}
                      >
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isPlaying ? [1, 1.2, 1] : 1,
                            rotate: isPlaying ? 0 : 0
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </motion.div>
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        animate={{
                          boxShadow: isPlaying
                            ? [
                                '0 0 20px rgba(0, 255, 255, 0.5)',
                                '0 0 40px rgba(168, 85, 247, 0.5)',
                                '0 0 20px rgba(0, 255, 255, 0.5)'
                              ]
                            : '0 0 10px rgba(0, 255, 255, 0.3)'
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </Button>
                  </motion.div>
                                    <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Button
                      onClick={isPlaying ? pauseVisualization : startVisualization}
                      disabled={steps.length === 0}
                      className="relative w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 rounded-lg border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.6)] hover:shadow-[0_0_50px_rgba(0,255,255,0.9)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="relative flex items-center justify-center gap-2">
                        {isPlaying ? (
                          <>
                            <Pause className="w-5 h-5" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            <span>Start</span>
                          </>
                        )}
                      </div>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: -360 }}
                    transition={{ type: "spring", stiffness: 300, duration: 0.6 }}
                  >
                    <Button
                      onClick={resetVisualization}
                      className="relative w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-6 rounded-lg border-2 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_50px_rgba(168,85,247,0.9)] transition-all duration-300 overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-lg"
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(168,85,247,0.4)',
                            '0 0 40px rgba(236,72,153,0.6)',
                            '0 0 20px rgba(168,85,247,0.4)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="relative flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <RotateCcw className="w-5 h-5" />
                        </motion.div>
                        <span>Reset</span>
                      </div>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={generateRandomArray}
                      disabled={isPlaying}
                      className="relative w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold py-6 rounded-lg border-2 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:shadow-[0_0_50px_rgba(34,197,94,0.9)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                      />
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          background: [
                            'radial-gradient(circle at 50% 50%, rgba(34,197,94,0.3) 0%, transparent 50%)',
                            'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.3) 0%, transparent 50%)',
                            'radial-gradient(circle at 50% 50%, rgba(34,197,94,0.3) 0%, transparent 50%)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="relative flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5" />
                        <span>Generate</span>
                      </div>
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
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 mx-auto border-4 border-cyan-400 border-t-transparent rounded-full"
                    />
                    <p className="text-cyan-400 text-lg font-semibold">
                      Click "Generate Array" to start
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="relative h-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const maxValue = Math.max(...array.map(e => e.value));
                    const heightPercentage = (element.value / maxValue) * 100;
                    const colorIndex = index % NEON_COLORS.length;
                    const baseColor = NEON_COLORS[colorIndex];
                    
                    let barColor = baseColor;
                    let glowIntensity = 0.3;
                    let scaleEffect = 1;
                    
                    if (element.isComparing) {
                      barColor = '#ffff00';
                      glowIntensity = 0.8;
                      scaleEffect = 1.05;
                    } else if (element.isSwapping) {
                      barColor = '#ff00ff';
                      glowIntensity = 1;
                      scaleEffect = 1.1;
                    } else if (element.isSorted) {
                      barColor = '#00ff00';
                      glowIntensity = 0.6;
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
                            0 0 ${30 * glowIntensity}px ${barColor},
                            inset 0 0 ${10 * glowIntensity}px rgba(255, 255, 255, 0.5)
                          `,
                        }}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: `${heightPercentage}%`,
                          opacity: 1,
                          scale: scaleEffect,
                          y: element.isSwapping ? [-10, 0] : 0,
                        }}
                        transition={{
                          height: { duration: 0.5, ease: "easeOut" },
                          opacity: { duration: 0.3 },
                          scale: { duration: 0.2 },
                          y: { duration: 0.3, ease: "easeInOut" },
                        }}
                      >
                        {/* Swap trail effect */}
                        {element.isSwapping && (
                          <>
                            <motion.div
                              className="absolute inset-0 rounded-t-lg"
                              style={{
                                backgroundColor: barColor,
                                filter: 'blur(8px)',
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 0.6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            />
                            <motion.div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: [0, 1, 0], y: [-10, -20, -30] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: barColor,
                                  boxShadow: `0 0 10px ${barColor}`,
                                }}
                              />
                            </motion.div>
                          </>
                        )}
                        
                        {/* Comparison indicator */}
                        {element.isComparing && (
                          <motion.div
                            className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          >
                            <div className="relative">
                              <div
                                className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                                style={{
                                  borderColor: barColor,
                                  backgroundColor: `${barColor}20`,
                                  boxShadow: `0 0 15px ${barColor}`,
                                }}
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: barColor }}
                                />
                              </div>
                              <motion.div
                                className="absolute inset-0 rounded-full border-2"
                                style={{ borderColor: barColor }}
                                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Sorted checkmark */}
                        {element.isSorted && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, scale: 0, rotate: -180 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{
                                backgroundColor: barColor,
                                boxShadow: `0 0 15px ${barColor}`,
                                color: '#000',
                              }}
                            >
                              ✓
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Value label */}
                        {arraySize[0] <= 30 && (
                          <motion.div
                            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold"
                            style={{
                              color: element.isSorted || element.isComparing || element.isSwapping ? '#000' : '#fff',
                              textShadow: `0 0 5px ${barColor}`,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                        
                        {/* Pulsing glow effect */}
                        <motion.div
                          className="absolute inset-0 rounded-t-lg pointer-events-none"
                          style={{
                            background: `linear-gradient(to top, transparent, ${barColor}40)`,
                          }}
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}</parameter><xcrdt_code_output crdtPosition="ANfVqugP9gRB">

              
              <div className="relative h-full flex items-end justify-center gap-1">
                {array.map((element, index) => {
                  const maxHeight = 500;
                  const barHeight = (element.value / 100) * maxHeight;
                  const colorIndex = index % NEON_COLORS.length;
                  const neonColor = NEON_COLORS[colorIndex];
                  
                  const isComparing = currentStep < steps.length && steps[currentStep]?.comparingIndices.includes(index);
                  const isSwapping = currentStep < steps.length && steps[currentStep]?.swappingIndices.includes(index);
                  const isSorted = currentStep < steps.length && steps[currentStep]?.sortedIndices.includes(index);
                  
                  return (
                    <motion.div
                      key={element.id}
                      className="relative flex-1 min-w-[8px] max-w-[60px] group"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: barHeight,
                        opacity: 1,
                        scale: isSwapping ? 1.1 : 1,
                        y: isSwapping ? -20 : 0
                      }}
                      transition={{
                        height: { duration: 0.5, ease: "easeOut" },
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3, type: "spring", stiffness: 300 },
                        y: { duration: 0.3, type: "spring", stiffness: 300 }
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        style={{
                          backgroundColor: isSorted ? '#00ff00' : isComparing ? '#ffff00' : isSwapping ? '#ff00ff' : neonColor,
                          boxShadow: isSorted 
                            ? `0 0 30px rgba(0, 255, 0, 0.8), 0 0 60px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.3)`
                            : isComparing
                            ? `0 0 40px rgba(255, 255, 0, 0.9), 0 0 80px rgba(255, 255, 0, 0.6), inset 0 0 25px rgba(255, 255, 0, 0.4)`
                            : isSwapping
                            ? `0 0 50px rgba(255, 0, 255, 1), 0 0 100px rgba(255, 0, 255, 0.7), inset 0 0 30px rgba(255, 0, 255, 0.5)`
                            : `0 0 20px ${neonColor}80, 0 0 40px ${neonColor}40, inset 0 0 15px ${neonColor}30`
                        }}
                        animate={{
                          boxShadow: isSorted
                            ? [
                                `0 0 30px rgba(0, 255, 0, 0.8), 0 0 60px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.3)`,
                                `0 0 40px rgba(0, 255, 0, 1), 0 0 80px rgba(0, 255, 0, 0.7), inset 0 0 30px rgba(0, 255, 0, 0.5)`,
                                `0 0 30px rgba(0, 255, 0, 0.8), 0 0 60px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.3)`
                              ]
                            : isComparing
                            ? [
                                `0 0 40px rgba(255, 255, 0, 0.9), 0 0 80px rgba(255, 255, 0, 0.6), inset 0 0 25px rgba(255, 255, 0, 0.4)`,
                                `0 0 50px rgba(255, 255, 0, 1), 0 0 100px rgba(255, 255, 0, 0.8), inset 0 0 35px rgba(255, 255, 0, 0.6)`,
                                `0 0 40px rgba(255, 255, 0, 0.9), 0 0 80px rgba(255, 255, 0, 0.6), inset 0 0 25px rgba(255, 255, 0, 0.4)`
                              ]
                            : isSwapping
                            ? [
                                `0 0 50px rgba(255, 0, 255, 1), 0 0 100px rgba(255, 0, 255, 0.7), inset 0 0 30px rgba(255, 0, 255, 0.5)`,
                                `0 0 60px rgba(255, 0, 255, 1), 0 0 120px rgba(255, 0, 255, 0.9), inset 0 0 40px rgba(255, 0, 255, 0.7)`,
                                `0 0 50px rgba(255, 0, 255, 1), 0 0 100px rgba(255, 0, 255, 0.7), inset 0 0 30px rgba(255, 0, 255, 0.5)`
                              ]
                            : undefined
                        }}
                        transition={{
                          boxShadow: { duration: 0.8, repeat: (isSorted || isComparing || isSwapping) ? Infinity : 0 }
                        }}
                      >
                        {/* Gradient overlay for depth */}
                        <div 
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            background: `linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)`
                          }}
                        />
                        
                        {/* Swap trail effect */}
                        {isSwapping && (
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            style={{
                              background: `linear-gradient(to top, rgba(255, 0, 255, 0.5), rgba(255, 0, 255, 0))`
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          />
                        )}
                        
                        {/* Comparison pulse effect */}
                        {isComparing && (
                          <motion.div
                            className="absolute -inset-1 rounded-t-lg border-2 border-yellow-400"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                      
                      {/* Value label */}
                      <motion.div
                        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap"
                        style={{
                          color: isSorted ? '#00ff00' : isComparing ? '#ffff00' : isSwapping ? '#ff00ff' : neonColor,
                          textShadow: `0 0 10px ${isSorted ? '#00ff00' : isComparing ? '#ffff00' : isSwapping ? '#ff00ff' : neonColor}`
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {element.value}
                      </motion.div>
                      
                      {/* Hover glow enhancement */}
                      <motion.div
                        className="absolute inset-0 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          boxShadow: `0 0 40px ${neonColor}, 0 0 80px ${neonColor}80`
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

                        <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-400 font-semibold">Progress</span>
                  <span className="text-purple-300 font-mono">
                    {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                  </span>
                </div>
                <div className="relative h-3 bg-gray-800/80 rounded-full border border-purple-500/30 overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: steps.length > 0 ? `${(currentStep / steps.length) * 100}%` : '0%'
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(168, 85, 247, 0.4)',
                        '0 0 20px rgba(168, 85, 247, 0.6)',
                        '0 0 10px rgba(168, 85, 247, 0.4)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Step {currentStep} of {steps.length}</span>
                  {currentStep === steps.length && steps.length > 0 && (
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
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
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
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-6 rounded border-2 border-gray-500 bg-gradient-to-t from-gray-600 to-gray-400"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(156, 163, 175, 0.3)',
                    '0 0 15px rgba(156, 163, 175, 0.5)',
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

            {/* Comparing State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-6 rounded border-2 border-yellow-400 bg-gradient-to-t from-yellow-600 to-yellow-400"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(250, 204, 21, 0.5)',
                    '0 0 25px rgba(250, 204, 21, 0.8)',
                    '0 0 15px rgba(250, 204, 21, 0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-yellow-300">Comparing</div>
                <div className="text-xs text-yellow-400/70">Active check</div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-6 rounded border-2 border-red-400 bg-gradient-to-t from-red-600 to-red-400"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(239, 68, 68, 0.5)',
                    '0 0 30px rgba(239, 68, 68, 0.9)',
                    '0 0 15px rgba(239, 68, 68, 0.5)'
                  ],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-red-300">Swapping</div>
                <div className="text-xs text-red-400/70">Exchanging</div>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all duration-300"
            >
              <motion.div
                className="w-6 h-6 rounded border-2 border-green-400 bg-gradient-to-t from-green-600 to-green-400"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(34, 197, 94, 0.5)',
                    '0 0 25px rgba(34, 197, 94, 0.8)',
                    '0 0 15px rgba(34, 197, 94, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-semibold text-green-300">Sorted</div>
                <div className="text-xs text-green-400/70">Complete</div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 pt-4 border-t border-gray-700"
          >
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-cyan-400"
                  animate={{
                    boxShadow: [
                      '0 0 5px rgba(34, 211, 238, 0.5)',
                      '0 0 10px rgba(34, 211, 238, 1)',
                      '0 0 5px rgba(34, 211, 238, 0.5)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span>Neon glow indicates active state</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full bg-purple-400"
                  animate={{
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span>Pulse effect shows transitions</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}