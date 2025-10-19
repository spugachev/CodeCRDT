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
  '#00ffaa',
  '#ff6600',
  '#9933ff'
];
const ALGORITHM_INFO: Record<AlgorithmType, { name: string; description: string; timeComplexity: { best: string; average: string; worst: string }; spaceComplexity: string }> = {
  bubble: {
    name: 'Bubble Sort',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)'
    },
    spaceComplexity: 'O(1)'
  },
  quick: {
    name: 'Quick Sort',
    description: 'Selects a pivot element and partitions the array around it, placing smaller elements before and larger elements after. Recursively sorts the sub-arrays.',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)'
    },
    spaceComplexity: 'O(log n)'
  },
  merge: {
    name: 'Merge Sort',
    description: 'Divides the array into two halves, recursively sorts them, and then merges the sorted halves back together. A stable, divide-and-conquer algorithm.',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)'
    },
    spaceComplexity: 'O(n)'
  },
  insertion: {
    name: 'Insertion Sort',
    description: 'Builds the final sorted array one item at a time by repeatedly inserting a new element into the sorted portion of the array.',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)'
    },
    spaceComplexity: 'O(1)'
  }
};

const mockInitialArray: ArrayElement[] = [
  { value: 45, id: 'el-1' },
  { value: 23, id: 'el-2' },
  { value: 67, id: 'el-3' },
  { value: 12, id: 'el-4' },
  { value: 89, id: 'el-5' },
  { value: 34, id: 'el-6' },
  { value: 56, id: 'el-7' },
  { value: 78, id: 'el-8' },
  { value: 90, id: 'el-9' },
  { value: 15, id: 'el-10' }
];

export default function AlgorithmVisualizer() {
  const [array, setArray] = useState<ArrayElement[]>(mockInitialArray);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([50]);
  const [arraySize, setArraySize] = useState([10]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bubble');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);

  const generateRandomArray = useCallback(() => {
    const newArray: ArrayElement[] = Array.from({ length: arraySize[0] }, (_, index) => ({
      value: Math.floor(Math.random() * 100) + 1,
      id: `el-${Date.now()}-${index}`,
      isComparing: false,
      isSwapping: false,
      isSorted: false
    }));
    setArray(newArray);
    setCurrentStep(0);
    setTotalSteps(0);
    setComparisons(0);
    setSwaps(0);
    setIsPlaying(false);
  }, [arraySize]);

  const resetVisualization = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setTotalSteps(0);
    setComparisons(0);
    setSwaps(0);
    generateRandomArray();
  }, [generateRandomArray]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleAlgorithmChange = useCallback((algorithm: AlgorithmType) => {
    setSelectedAlgorithm(algorithm);
    resetVisualization();
  }, [resetVisualization]);

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
            style={{
              textShadow: '0 0 40px rgba(0, 255, 255, 0.5), 0 0 80px rgba(255, 0, 255, 0.3)',
            }}
            animate={{
              textShadow: [
                '0 0 40px rgba(0, 255, 255, 0.5), 0 0 80px rgba(255, 0, 255, 0.3)',
                '0 0 60px rgba(255, 0, 255, 0.6), 0 0 100px rgba(0, 255, 255, 0.4)',
                '0 0 40px rgba(0, 255, 255, 0.5), 0 0 80px rgba(255, 0, 255, 0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            Algorithm Visualizer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-cyan-300"
            style={{
              textShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
            }}
          >
            Watch sorting algorithms come to life with neon-powered animations
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-1 space-y-6">
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.15)]"
            >
              <div className="space-y-6">
                
                {/* Algorithm Selector */}
                <div className="space-y-3">
                  <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Algorithm
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(['bubble', 'quick', 'merge', 'insertion'] as AlgorithmType[]).map((algo) => (
                      <Button
                        key={algo}
                        onClick={() => handleAlgorithmChange(algo)}
                        disabled={isPlaying}
                        variant={selectedAlgorithm === algo ? 'default' : 'outline'}
                        className={`
                          relative overflow-hidden transition-all duration-300
                          ${selectedAlgorithm === algo 
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 shadow-[0_0_20px_rgba(0,255,255,0.5)]' 
                            : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-cyan-500/50 hover:text-cyan-400'
                          }
                          ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {selectedAlgorithm === algo && (
                          <motion.div
                            layoutId="algorithmSelector"
                            className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10 capitalize text-xs font-medium">
                          {algo}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Speed
                    </h3>
                    <span className="text-purple-400 font-mono text-sm font-bold">
                      {speed[0]}%
                    </span>
                  </div>
                  <div className="relative">
                    <Slider
                      value={speed}
                      onValueChange={setSpeed}
                      min={10}
                      max={100}
                      step={10}
                      disabled={isPlaying}
                      className="cursor-pointer"
                    />
                    <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-gray-500">
                      <span>Slow</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </div>

                {/* Array Size Control */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-cyan-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Array Size
                    </h3>
                    <span className="text-purple-400 font-mono text-sm font-bold">
                      {arraySize[0]}
                    </span>
                  </div>
                  <div className="relative">
                    <Slider
                      value={arraySize}
                      onValueChange={setArraySize}
                      min={5}
                      max={50}
                      step={5}
                      disabled={isPlaying}
                      className="cursor-pointer"
                    />
                    <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-gray-500">
                      <span>5</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-gray-700/50">
                  <Button
                    onClick={handlePlayPause}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={resetVisualization}
                    disabled={isPlaying}
                    variant="outline"
                    className="w-full bg-gray-700/50 border-orange-500/50 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500 hover:text-orange-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  
                  <Button
                    onClick={generateRandomArray}
                    disabled={isPlaying}
                    variant="outline"
                    className="w-full bg-gray-700/50 border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500 hover:text-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    New Array
                  </Button>
                </div>

              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.3)]"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-cyan-400">Statistics</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <div className="text-sm text-gray-400 mb-1">Comparisons</div>
                  <div className="text-3xl font-bold text-purple-400">{comparisons}</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                  <div className="text-sm text-gray-400 mb-1">Swaps</div>
                  <div className="text-3xl font-bold text-pink-400">{swaps}</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  <div className="text-sm text-gray-400 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-green-400">
                    {currentStep} / {totalSteps}
                  </div>
                  {totalSteps > 0 && (
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
          </div>

          <div className="lg:col-span-3">
            
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8 shadow-2xl shadow-purple-500/20">
              
              <div className="relative h-96 flex items-end justify-center gap-2">
                {array.map((element, index) => {
                  const heightPercentage = (element.value / 100) * 100;
                  const colorIndex = index % NEON_COLORS.length;
                  const neonColor = NEON_COLORS[colorIndex];
                  
                  const isComparing = element.isComparing;
                  const isSwapping = element.isSwapping;
                  const isSorted = element.isSorted;

                  return (
                    <motion.div
                      key={element.id}
                      className="relative flex-1 max-w-[80px] group"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: isSwapping ? 1.1 : 1
                      }}
                      transition={{
                        layout: { duration: 0.3, ease: "easeInOut" },
                        scale: { duration: 0.2 }
                      }}
                    >
                      {/* Trail effect for swapping */}
                      {isSwapping && (
                        <motion.div
                          className="absolute inset-0 rounded-t-lg"
                          style={{
                            background: `linear-gradient(to top, ${neonColor}40, transparent)`,
                            filter: 'blur(20px)',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                      )}

                      {/* Main bar */}
                      <motion.div
                        className="relative w-full rounded-t-lg overflow-hidden"
                        style={{
                          height: `${heightPercentage}%`,
                          backgroundColor: isSorted ? '#00ff00' : neonColor,
                          boxShadow: isComparing 
                            ? `0 0 30px ${neonColor}, 0 0 60px ${neonColor}80, inset 0 0 20px ${neonColor}40`
                            : isSorted
                            ? '0 0 20px #00ff00, 0 0 40px #00ff0080'
                            : `0 0 15px ${neonColor}80, inset 0 0 10px ${neonColor}20`,
                        }}
                        animate={{
                          height: `${heightPercentage}%`,
                        }}
                        transition={{
                          height: { duration: 0.4, ease: "easeOut" }
                        }}
                      >
                        {/* Glossy overlay */}
                        <div 
                          className="absolute inset-0 opacity-30"
                          style={{
                            background: 'linear-gradient(to right, transparent, white 50%, transparent)',
                          }}
                        />

                        {/* Animated glow pulse for comparing */}
                        {isComparing && (
                          <motion.div
                            className="absolute inset-0"
                            style={{
                              background: `radial-gradient(circle, ${neonColor}60, transparent)`,
                            }}
                            animate={{
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                      </motion.div>

                      {/* Value label */}
                      <motion.div
                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                        style={{
                          color: isSorted ? '#00ff00' : neonColor,
                          textShadow: `0 0 10px ${isSorted ? '#00ff00' : neonColor}`,
                        }}
                        animate={{
                          scale: isComparing || isSwapping ? 1.2 : 1,
                        }}
                      >
                        {element.value}
                      </motion.div>

                      {/* Comparison indicator */}
                      {isComparing && (
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <Zap 
                            className="w-6 h-6" 
                            style={{ 
                              color: neonColor,
                              filter: `drop-shadow(0 0 8px ${neonColor})`
                            }} 
                          />
                        </motion.div>
                      )}

                      {/* Swap indicator */}
                      {isSwapping && (
                        <motion.div
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          animate={{
                            rotate: [0, 360],
                            scale: [1, 1.3, 1],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                          }}
                        >
                          <RotateCcw 
                            className="w-5 h-5" 
                            style={{ 
                              color: neonColor,
                              filter: `drop-shadow(0 0 10px ${neonColor})`
                            }} 
                          />
                        </motion.div>
                      )}

                      {/* Sorted checkmark */}
                      {isSorted && (
                        <motion.div
                          className="absolute top-2 left-1/2 transform -translate-x-1/2"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                            style={{
                              boxShadow: '0 0 15px #00ff00'
                            }}
                          >
                            <span className="text-xs text-black font-bold">✓</span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              
            </div>

            <div className="mt-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 shadow-2xl shadow-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Legend
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div 
                    className="w-6 h-6 rounded border-2"
                    style={{ 
                      backgroundColor: NEON_COLORS[0],
                      borderColor: NEON_COLORS[0],
                      boxShadow: `0 0 10px ${NEON_COLORS[0]}80`
                    }}
                  />
                  <span className="text-sm text-gray-300">Default</span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div 
                    className="w-6 h-6 rounded border-2"
                    style={{ 
                      backgroundColor: '#ffff00',
                      borderColor: '#ffff00',
                      boxShadow: '0 0 15px #ffff0080'
                    }}
                  />
                  <span className="text-sm text-gray-300">Comparing</span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div 
                    className="w-6 h-6 rounded border-2"
                    style={{ 
                      backgroundColor: '#ff0066',
                      borderColor: '#ff0066',
                      boxShadow: '0 0 15px #ff006680'
                    }}
                  />
                  <span className="text-sm text-gray-300">Swapping</span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div 
                    className="w-6 h-6 rounded border-2"
                    style={{ 
                      backgroundColor: '#00ff00',
                      borderColor: '#00ff00',
                      boxShadow: '0 0 15px #00ff0080'
                    }}
                  />
                  <span className="text-sm text-gray-300">Sorted</span>
                </motion.div>
              </div>
            </div>
            
          </div>
          
        </div>

        
<motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/50">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-cyan-400">
              {ALGORITHM_INFO[selectedAlgorithm].name}
            </h3>
          </div>

          <p className="text-gray-300 mb-6 leading-relaxed">
            {ALGORITHM_INFO[selectedAlgorithm].description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/30">
              <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Time Complexity
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Best:</span>
                  <span className="text-green-400 font-mono font-semibold">
                    {ALGORITHM_INFO[selectedAlgorithm].timeComplexity.best}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average:</span>
                  <span className="text-yellow-400 font-mono font-semibold">
                    {ALGORITHM_INFO[selectedAlgorithm].timeComplexity.average}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Worst:</span>
                  <span className="text-red-400 font-mono font-semibold">
                    {ALGORITHM_INFO[selectedAlgorithm].timeComplexity.worst}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/30">
              <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Space Complexity
              </h4>
              <div className="flex items-center justify-center h-[calc(100%-2rem)]">
                <span className="text-3xl text-cyan-400 font-mono font-bold">
                  {ALGORITHM_INFO[selectedAlgorithm].spaceComplexity}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}