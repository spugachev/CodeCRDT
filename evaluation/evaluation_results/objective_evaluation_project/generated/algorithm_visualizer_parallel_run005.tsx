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

  const startVisualization = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) return;
    
    setIsPlaying(true);
    
    const animationSpeed = 1000 - (speed[0] * 9.5);
    
    const animate = () => {
      setCurrentStep((prevStep) => {
        const nextStep = prevStep + 1;
        
        if (nextStep >= steps.length) {
          setIsPlaying(false);
          return prevStep;
        }
        
        const stepData = steps[nextStep];
        setArray(stepData.array);
        
        return nextStep;
      });
    };
    
    const intervalId = setInterval(animate, animationSpeed);
    
    return () => clearInterval(intervalId);
    
  }, [steps, speed, currentStep]);

  const pauseVisualization = useCallback(() => {    setIsPlaying(false);
  

  }, []);

  const generateSortingSteps = useCallback((algorithm: AlgorithmType) => {
    const arr = [...array];
    const newSteps: AlgorithmStep[] = [];
    
    const addStep = (
      arr: ArrayElement[],
      comparing: number[] = [],
      swapping: number[] = [],
      sorted: number[] = []
    ) => {
      newSteps.push({
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
              transition={{ delay: 0.3, type: 'spring' }}
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
              transition={{ delay: 0.5, type: 'spring' }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full border border-purple-400/50"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-300" />
                <span className="text-sm font-mono text-purple-200">
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
                        disabled={isPlaying}
                        className={`p-3 rounded-lg border transition-all duration-300 text-left ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-medium text-white text-sm">{algo.name}</div>
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
                    disabled={isPlaying}
                    className="cursor-pointer"
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
                        {currentStep >= steps.length ? 'Start' : 'Resume'}
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
                </div>

                {/* Progress Indicator */}
                {steps.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span className="text-cyan-400 font-mono">
                        {currentStep} / {steps.length}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / steps.length) * 100}%` }}
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
                  <div className="grid grid-cols-2 gap-2">
                    {mockAlgorithms.map((algo) => (
                      <motion.button
                        key={algo.id}
                        onClick={() => setSelectedAlgorithm(algo.id as AlgorithmType)}
                        className={`relative p-3 rounded-lg border transition-all duration-300 ${
                          selectedAlgorithm === algo.id
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/50'
                            : 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-left">
                          <div className={`text-xs font-semibold ${
                            selectedAlgorithm === algo.id ? 'text-cyan-300' : 'text-gray-300'
                          }`}>
                            {algo.name}
                          </div>
                          <div className={`text-[10px] mt-1 ${
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
                </div></parameter>
</invoke>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-cyan-400">Array Size</label>
                    <span className="text-xs text-cyan-300 font-mono">{arraySize[0]}</span>
                  </div>
                  <Slider
                    value={arraySize}
                    onValueChange={setArraySize}
                    min={5}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-purple-400">Speed</label>
                    <span className="text-xs text-purple-300 font-mono">{speed[0]}ms</span>
                  </div>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={10}
                    max={200}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={isPlaying ? pauseVisualization : startVisualization}
                    disabled={steps.length === 0 || (currentStep >= steps.length && !isPlaying)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6 rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
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

                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold py-6 rounded-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-400/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      whileHover={{ rotate: -180 }}
                      transition={{ duration: 0.5 }}
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Reset</span>
                    </motion.div>
                  </Button>

                  <Button
                    onClick={() => {
                      generateRandomArray();
                      setSteps([]);
                      setCurrentStep(0);
                    }}
                    disabled={isPlaying}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold py-6 rounded-lg shadow-lg shadow-green-500/50 hover:shadow-green-400/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Zap className="w-5 h-5" />
                      <span>New Array</span>
                    </motion.div>
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-2xl shadow-purple-500/20">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-purple-300">Statistics</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                  <div className="text-xs text-cyan-400 mb-1">Comparisons</div>
                  <div className="text-2xl font-bold text-cyan-300 font-mono">
                    {currentStep > 0 && steps[currentStep - 1] 
                      ? steps.slice(0, currentStep).filter(s => s.comparingIndices.length > 0).length 
                      : 0}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/20">
                  <div className="text-xs text-purple-400 mb-1">Swaps</div>
                  <div className="text-2xl font-bold text-purple-300 font-mono">
                    {currentStep > 0 && steps[currentStep - 1]
                      ? steps.slice(0, currentStep).filter(s => s.swappingIndices.length > 0).length
                      : 0}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-pink-500/20">
                  <div className="text-xs text-pink-400 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-pink-300 font-mono">
                    {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                  </div>
                  <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${steps.length > 0 ? (currentStep / steps.length) * 100 : 0}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-yellow-500/20">
                  <div className="text-xs text-yellow-400 mb-1">Complexity</div>
                  <div className="text-lg font-bold text-yellow-300 font-mono">
                    {mockAlgorithms.find(a => a.id === selectedAlgorithm)?.complexity || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-8 shadow-2xl shadow-purple-500/20 min-h-[600px]">
                            {array.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 360],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <BarChart3 className="w-24 h-24 text-cyan-400/30" />
                  </motion.div>
                  <p className="text-cyan-400/50 text-lg font-medium">
                    Generate an array to start visualizing
                  </p>
                </div>
              ) : (
                <div className="relative h-full w-full flex items-end justify-center gap-1 px-4">
                  {array.map((element, index) => {
                    const currentStepData = steps[currentStep];
                    const isComparing = currentStepData?.comparingIndices.includes(index);
                    const isSwapping = currentStepData?.swappingIndices.includes(index);
                    const isSorted = currentStepData?.sortedIndices.includes(index);
                    
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
                      <div key={element.id} className="relative flex-1 flex flex-col items-center justify-end h-full">
                        {/* Comparison Indicator */}
                        {isComparing && (
                          <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-8 z-10"
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, 180, 360],
                              }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="w-6 h-6 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(255,255,0,0.8)]"
                            />
                          </motion.div>
                        )}
                        
                        {/* Swap Trail Effect */}
                        {isSwapping && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: [0, 1, 0], scale: [0.5, 2, 3] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="absolute inset-0 rounded-lg"
                              style={{
                                background: `radial-gradient(circle, ${glowColor}40 0%, transparent 70%)`,
                              }}
                            />
                            <motion.div
                              animate={{
                                y: [-10, 10, -10],
                              }}
                              transition={{ duration: 0.4, repeat: Infinity }}
                              className="absolute -top-4 z-10"
                            >
                              <div className="w-4 h-4 bg-pink-500 rounded-full shadow-[0_0_15px_rgba(255,0,102,0.9)]" />
                            </motion.div>
                          </>
                        )}
                        
                        {/* Sorted Indicator */}
                        {isSorted && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-6 z-10"
                          >
                            <motion.div
                              animate={{
                                rotate: [0, 360],
                              }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <div className="w-5 h-5 border-2 border-green-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,255,0,0.8)]">
                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                        
                        {/* Animated Bar */}
                        <motion.div
                          layout
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: `${heightPercentage}%`,
                            opacity: 1,
                            backgroundColor: barColor,
                            boxShadow: [
                              `0 0 ${glowIntensity * 20}px ${glowColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}`,
                              `0 0 ${glowIntensity * 40}px ${glowColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}`,
                              `0 0 ${glowIntensity * 20}px ${glowColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}`,
                            ],
                            scale: isSwapping ? [1, 1.1, 1] : isComparing ? [1, 1.05, 1] : 1,
                          }}
                          transition={{
                            height: { duration: 0.5, ease: "easeInOut" },
                            backgroundColor: { duration: 0.3 },
                            boxShadow: { duration: 0.8, repeat: Infinity },
                            scale: { duration: 0.3, repeat: isSwapping || isComparing ? Infinity : 0 },
                          }}
                          className="w-full rounded-t-lg relative overflow-hidden min-h-[20px]"
                          style={{
                            background: `linear-gradient(to top, ${barColor}, ${barColor}dd)`,
                          }}
                        >
                          {/* Inner glow effect */}
                          <motion.div
                            animate={{
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                          />
                          
                          {/* Shimmer effect */}
                          <motion.div
                            animate={{
                              x: ['-100%', '200%'],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                          />
                        </motion.div>
                        
                        {/* Value Label */}
                        {array.length <= 30 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-xs font-mono font-bold"
                            style={{
                              color: barColor,
                              textShadow: `0 0 10px ${glowColor}`,
                            }}
                          >
                            {element.value}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
                {array.map((element, index) => {
                  const colorIndex = index % NEON_COLORS.length;
                  const neonColor = NEON_COLORS[colorIndex];
                  const heightPercentage = (element.value / 100) * 100;
                  
                  return (
                    <motion.div
                      key={element.id}
                      layout
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: `${heightPercentage}%`,
                        opacity: 1,
                        scale: element.isComparing ? 1.1 : element.isSwapping ? 1.15 : 1,
                        y: element.isSwapping ? -20 : 0,
                      }}
                      transition={{
                        height: { duration: 0.5, ease: "easeOut" },
                        scale: { duration: 0.3, ease: "easeInOut" },
                        y: { duration: 0.4, ease: "easeInOut" },
                        layout: { duration: 0.5, ease: "easeInOut" }
                      }}
                      className="relative flex-1 min-w-[8px] max-w-[60px] rounded-t-lg"
                      style={{
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
                          ? '0 0 25px rgba(255, 255, 0, 0.9), 0 0 50px rgba(255, 255, 0, 0.6), inset 0 0 25px rgba(255, 255, 0, 0.3)'
                          : `0 0 15px ${neonColor}80, 0 0 30px ${neonColor}40, inset 0 0 15px ${neonColor}30`,
                      }}
                    >
                      {/* Glow overlay effect */}
                      <motion.div
                        className="absolute inset-0 rounded-t-lg"
                        animate={{
                          opacity: element.isComparing ? [0.3, 0.7, 0.3] : element.isSwapping ? [0.5, 1, 0.5] : 0.2,
                        }}
                        transition={{
                          duration: element.isComparing || element.isSwapping ? 0.6 : 0,
                          repeat: element.isComparing || element.isSwapping ? Infinity : 0,
                        }}
                        style={{
                          background: `linear-gradient(to top, transparent, ${element.isSorted ? '#00ff00' : element.isSwapping ? '#ff0066' : element.isComparing ? '#ffff00' : neonColor}40)`,
                        }}
                      />
                      
                      {/* Trail effect during swaps */}
                      {element.isSwapping && (
                        <>
                          <motion.div
                            className="absolute inset-0 rounded-t-lg"
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{ 
                              opacity: [0.8, 0],
                              scale: [1, 1.3],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeOut"
                            }}
                            style={{
                              backgroundColor: '#ff0066',
                              filter: 'blur(8px)',
                            }}
                          />
                          <motion.div
                            className="absolute -top-2 left-1/2 -translate-x-1/2"
                            animate={{
                              y: [-10, -30, -10],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <div className="w-2 h-2 rounded-full bg-pink-400" style={{
                              boxShadow: '0 0 10px rgba(255, 0, 102, 1), 0 0 20px rgba(255, 0, 102, 0.7)'
                            }} />
                          </motion.div>
                        </>
                      )}
                      
                      {/* Value label */}
                      <motion.div
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold whitespace-nowrap"
                        animate={{
                          color: element.isSorted 
                            ? '#00ff00'
                            : element.isSwapping 
                            ? '#ff0066'
                            : element.isComparing 
                            ? '#ffff00'
                            : neonColor,
                          scale: element.isComparing || element.isSwapping ? [1, 1.2, 1] : 1,
                        }}
                        transition={{
                          scale: { duration: 0.4, repeat: element.isComparing || element.isSwapping ? Infinity : 0 }
                        }}
                        style={{
                          textShadow: `0 0 10px ${element.isSorted ? '#00ff00' : element.isSwapping ? '#ff0066' : element.isComparing ? '#ffff00' : neonColor}`,
                        }}
                      >
                        {element.value}
                      </motion.div>
                      
                      {/* Pulse ring for comparing state */}
                      {element.isComparing && (
                        <motion.div
                          className="absolute -inset-1 rounded-t-lg border-2"
                          style={{
                            borderColor: '#ffff00',
                          }}
                          animate={{
                            opacity: [0.8, 0.3, 0.8],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                      
                      {/* Sorted checkmark indicator */}
                      {element.isSorted && (
                        <motion.div
                          className="absolute -top-8 left-1/2 -translate-x-1/2"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        >
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center" style={{
                            boxShadow: '0 0 15px rgba(0, 255, 0, 0.8), 0 0 30px rgba(0, 255, 0, 0.5)'
                          }}>
                            <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
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
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-300 font-semibold">Sorting Progress</span>
                <span className="text-cyan-300 font-mono">
                  {steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%
                </span>
              </div>
              
              <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden border border-purple-500/30">
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
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </motion.div>
                
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(139, 92, 246, 0.3)',
                      '0 0 20px rgba(139, 92, 246, 0.5)',
                      '0 0 10px rgba(139, 92, 246, 0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
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
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-gray-900/50 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-cyan-300">Legend</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Comparing State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,0,0.3)]"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(255, 255, 0, 0.5)',
                      '0 0 20px rgba(255, 255, 0, 0.8)',
                      '0 0 10px rgba(255, 255, 0, 0.5)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-12 h-12 bg-yellow-500/20 border-2 border-yellow-400 rounded-lg flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                </motion.div>
                <div>
                  <div className="text-sm font-semibold text-yellow-300">Comparing</div>
                  <div className="text-xs text-gray-400 mt-1">Elements being compared</div>
                </div>
              </div>
            </motion.div>

            {/* Swapping State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,102,0.3)]"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(255, 0, 102, 0.5)',
                      '0 0 20px rgba(255, 0, 102, 0.8)',
                      '0 0 10px rgba(255, 0, 102, 0.5)'
                    ],
                    x: [-2, 2, -2]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-12 h-12 bg-pink-500/20 border-2 border-pink-400 rounded-lg flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 180, 360] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <RotateCcw className="w-6 h-6 text-pink-400" />
                  </motion.div>
                </motion.div>
                <div>
                  <div className="text-sm font-semibold text-pink-300">Swapping</div>
                  <div className="text-xs text-gray-400 mt-1">Elements being swapped</div>
                </div>
              </div>
            </motion.div>

            {/* Sorted State */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800/50 rounded-lg p-4 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,170,0.3)]"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(0, 255, 170, 0.5)',
                      '0 0 20px rgba(0, 255, 170, 0.8)',
                      '0 0 10px rgba(0, 255, 170, 0.5)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-12 h-12 bg-green-500/20 border-2 border-green-400 rounded-lg flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Play className="w-6 h-6 text-green-400 rotate-90" />
                  </motion.div>
                </motion.div>
                <div>
                  <div className="text-sm font-semibold text-green-300">Sorted</div>
                  <div className="text-xs text-gray-400 mt-1">Elements in final position</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}