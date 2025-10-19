import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArrayElement {
  value: number;
  id: string;
  isComparing?: boolean;
  isSorted?: boolean;
  isSwapping?: boolean;
  trail?: boolean;
}

type Algorithm = 'bubble' | 'quick' | 'merge' | 'insertion';

const ALGORITHMS = [
  { id: 'bubble' as Algorithm, name: 'Bubble Sort', icon: Activity },
  { id: 'quick' as Algorithm, name: 'Quick Sort', icon: Zap },
  { id: 'merge' as Algorithm, name: 'Merge Sort', icon: Activity },
  { id: 'insertion' as Algorithm, name: 'Insertion Sort', icon: Zap },
];

export default function AlgorithmVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [arraySize, setArraySize] = useState([30]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('bubble');
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const stepsRef = useRef<(() => void)[]>([]);
  const currentStepRef = useRef(0);

  const generateArray = () => {
    const newArray: ArrayElement[] = [];
    for (let i = 0; i < arraySize[0]; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 100) + 10,
        id: `${i}-${Date.now()}`,
      });
    }
    setArray(newArray);
    setComparisons(0);
    setSwaps(0);
    currentStepRef.current = 0;
    stepsRef.current = [];
  };

  useEffect(() => {
    generateArray();
  }, [arraySize[0]]);

  const sleep = () => {
    return new Promise(resolve => setTimeout(resolve, 101 - speed[0]));
  };

  const updateArray = (newArray: ArrayElement[], incrementComparisons = false, incrementSwaps = false) => {
    stepsRef.current.push(() => {
      setArray([...newArray]);
      if (incrementComparisons) setComparisons(prev => prev + 1);
      if (incrementSwaps) setSwaps(prev => prev + 1);
    });
  };

  const bubbleSort = async () => {
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        arr[j].isComparing = true;
        arr[j + 1].isComparing = true;
        updateArray(arr, true);

        if (arr[j].value > arr[j + 1].value) {
          arr[j].isSwapping = true;
          arr[j + 1].isSwapping = true;
          arr[j].trail = true;
          arr[j + 1].trail = true;
          updateArray(arr);

          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          updateArray(arr, false, true);

          arr[j].isSwapping = false;
          arr[j + 1].isSwapping = false;
        }

        arr[j].isComparing = false;
        arr[j + 1].isComparing = false;
        arr[j].trail = false;
        arr[j + 1].trail = false;
        updateArray(arr);
      }
      arr[n - i - 1].isSorted = true;
      updateArray(arr);
    }
    arr[0].isSorted = true;
    updateArray(arr);
  };

  const quickSort = async () => {
    const arr = [...array];

    const partition = (low: number, high: number): number => {
      const pivot = arr[high].value;
      arr[high].isComparing = true;
      updateArray(arr);

      let i = low - 1;

      for (let j = low; j < high; j++) {
        arr[j].isComparing = true;
        updateArray(arr, true);

        if (arr[j].value < pivot) {
          i++;
          arr[i].isSwapping = true;
          arr[j].isSwapping = true;
          arr[i].trail = true;
          arr[j].trail = true;
          updateArray(arr);

          [arr[i], arr[j]] = [arr[j], arr[i]];
          updateArray(arr, false, true);

          arr[i].isSwapping = false;
          arr[j].isSwapping = false;
        }

        arr[j].isComparing = false;
        arr[j].trail = false;
        updateArray(arr);
      }

      arr[i + 1].isSwapping = true;
      arr[high].isSwapping = true;
      arr[i + 1].trail = true;
      arr[high].trail = true;
      updateArray(arr);

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      updateArray(arr, false, true);

      arr[i + 1].isSwapping = false;
      arr[high].isSwapping = false;
      arr[high].isComparing = false;
      arr[i + 1].trail = false;
      arr[high].trail = false;
      updateArray(arr);

      return i + 1;
    };

    const quickSortHelper = (low: number, high: number) => {
      if (low < high) {
        const pi = partition(low, high);
        arr[pi].isSorted = true;
        updateArray(arr);
        quickSortHelper(low, pi - 1);
        quickSortHelper(pi + 1, high);
      } else if (low === high) {
        arr[low].isSorted = true;
        updateArray(arr);
      }
    };

    quickSortHelper(0, arr.length - 1);
  };

  const mergeSort = async () => {
    const arr = [...array];

    const merge = (left: number, mid: number, right: number) => {
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);

      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        arr[k].isComparing = true;
        updateArray(arr, true);

        if (leftArr[i].value <= rightArr[j].value) {
          arr[k] = { ...leftArr[i], isSwapping: true, trail: true };
          updateArray(arr, false, true);
          arr[k].isSwapping = false;
          arr[k].trail = false;
          i++;
        } else {
          arr[k] = { ...rightArr[j], isSwapping: true, trail: true };
          updateArray(arr, false, true);
          arr[k].isSwapping = false;
          arr[k].trail = false;
          j++;
        }

        arr[k].isComparing = false;
        updateArray(arr);
        k++;
      }

      while (i < leftArr.length) {
        arr[k] = { ...leftArr[i], trail: true };
        updateArray(arr);
        arr[k].trail = false;
        i++;
        k++;
      }

      while (j < rightArr.length) {
        arr[k] = { ...rightArr[j], trail: true };
        updateArray(arr);
        arr[k].trail = false;
        j++;
        k++;
      }
    };

    const mergeSortHelper = (left: number, right: number) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        mergeSortHelper(left, mid);
        mergeSortHelper(mid + 1, right);
        merge(left, mid, right);

        for (let i = left; i <= right; i++) {
          arr[i].isSorted = true;
        }
        updateArray(arr);
      }
    };

    mergeSortHelper(0, arr.length - 1);
  };

  const insertionSort = async () => {
    const arr = [...array];
    arr[0].isSorted = true;
    updateArray(arr);

    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      key.isComparing = true;
      key.trail = true;
      updateArray(arr);

      let j = i - 1;

      while (j >= 0 && arr[j].value > key.value) {
        arr[j].isComparing = true;
        updateArray(arr, true);

        arr[j + 1] = { ...arr[j], isSwapping: true, trail: true };
        updateArray(arr, false, true);

        arr[j + 1].isSwapping = false;
        arr[j].isComparing = false;
        j--;
      }

      arr[j + 1] = { ...key, isComparing: false, isSorted: true, trail: false };
      updateArray(arr);

      for (let k = 0; k <= i; k++) {
        arr[k].isSorted = true;
      }
      updateArray(arr);
    }
  };

  const startSorting = async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    stepsRef.current = [];
    currentStepRef.current = 0;

    switch (selectedAlgorithm) {
      case 'bubble':
        await bubbleSort();
        break;
      case 'quick':
        await quickSort();
        break;
      case 'merge':
        await mergeSort();
        break;
      case 'insertion':
        await insertionSort();
        break;
    }

    executeSteps();
  };

  const executeSteps = () => {
    const runStep = () => {
      if (currentStepRef.current < stepsRef.current.length) {
        stepsRef.current[currentStepRef.current]();
        currentStepRef.current++;
        animationRef.current = setTimeout(runStep, 101 - speed[0]);
      } else {
        setIsPlaying(false);
      }
    };
    runStep();
  };

  const pauseSorting = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  };

  const resetArray = () => {
    pauseSorting();
    generateArray();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Algorithm Visualizer
          </h1>
          <p className="text-cyan-300/70 text-lg">Experience sorting algorithms in neon-powered glory</p>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg shadow-cyan-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-300/70 text-sm">Comparisons</p>
                <p className="text-4xl font-bold text-cyan-400">{comparisons}</p>
              </div>
              <Activity className="w-12 h-12 text-cyan-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300/70 text-sm">Swaps</p>
                <p className="text-4xl font-bold text-purple-400">{swaps}</p>
              </div>
              <Zap className="w-12 h-12 text-purple-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg shadow-pink-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-300/70 text-sm">Array Size</p>
                <p className="text-4xl font-bold text-pink-400">{arraySize[0]}</p>
              </div>
              <Activity className="w-12 h-12 text-pink-400/50" />
            </div>
          </div>
        </motion.div>

        {/* Visualization Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-sm shadow-2xl shadow-cyan-500/10"
        >
          <div className="flex items-end justify-center gap-1 h-96">
            <AnimatePresence mode="popLayout">
              {array.map((element, index) => (
                <motion.div
                  key={element.id}
                  layout
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    height: `${(element.value / 110) * 100}%`,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    layout: { duration: 0.3, ease: 'easeInOut' },
                    height: { duration: 0.3, ease: 'easeInOut' },
                  }}
                  className="relative flex-1 min-w-0 rounded-t-lg"
                  style={{
                    background: element.isSorted
                      ? 'linear-gradient(to top, #10b981, #34d399)'
                      : element.isSwapping
                      ? 'linear-gradient(to top, #f59e0b, #fbbf24)'
                      : element.isComparing
                      ? 'linear-gradient(to top, #ef4444, #f87171)'
                      : 'linear-gradient(to top, #06b6d4, #22d3ee)',
                    boxShadow: element.isSorted
                      ? '0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3)'
                      : element.isSwapping
                      ? '0 0 20px rgba(245, 158, 11, 0.6), 0 0 40px rgba(245, 158, 11, 0.3)'
                      : element.isComparing
                      ? '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)'
                      : '0 0 15px rgba(6, 182, 212, 0.4), 0 0 30px rgba(6, 182, 212, 0.2)',
                  }}
                >
                  {element.trail && (
                    <motion.div
                      initial={{ opacity: 0.8, scale: 1.2 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 rounded-t-lg"
                      style={{
                        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)',
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm shadow-2xl shadow-purple-500/10 space-y-8"
        >
          {/* Algorithm Selection */}
          <div className="space-y-4">
            <label className="text-purple-300 font-semibold text-lg">Select Algorithm</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ALGORITHMS.map((algo) => (
                <motion.button
                  key={algo.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAlgorithm(algo.id)}
                  disabled={isPlaying}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedAlgorithm === algo.id
                      ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-400 shadow-lg shadow-purple-500/30'
                      : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <algo.icon className={`w-5 h-5 ${selectedAlgorithm === algo.id ? 'text-purple-300' : 'text-slate-400'}`} />
                    <span className={`font-semibold ${selectedAlgorithm === algo.id ? 'text-purple-200' : 'text-slate-300'}`}>
                      {algo.name}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-cyan-300 font-semibold">Speed</label>
                <span className="text-cyan-400 font-mono">{speed[0]}%</span>
              </div>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={1}
                max={100}
                step={1}
                disabled={isPlaying}
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-pink-300 font-semibold">Array Size</label>
                <span className="text-pink-400 font-mono">{arraySize[0]}</span>
              </div>
              <Slider
                value={arraySize}
                onValueChange={setArraySize}
                min={5}
                max={100}
                step={1}
                disabled={isPlaying}
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={isPlaying ? pauseSorting : startSorting}
                disabled={array.length === 0}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-cyan-500/30 border-0"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={resetArray}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/30 border-0"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}