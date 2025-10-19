import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Circle, RotateCcw, Trophy, Zap } from 'lucide-react';

type Player = 'X' | 'O' | null;
type Board = Player[];

interface Score {
  player: number;
  ai: number;
  draws: number;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [score, setScore] = useState<Score>({ player: 0, ai: 0, draws: 0 });
  const [isThinking, setIsThinking] = useState(false);

  const checkWinner = (currentBoard: Board): { winner: Player | 'draw' | null; line: number[] | null } => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combination };
      }
    }

    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'draw', line: null };
    }

    return { winner: null, line: null };
  };

  const minimax = (currentBoard: Board, depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(currentBoard);

    if (result.winner === 'O') return 10 - depth;
    if (result.winner === 'X') return depth - 10;
    if (result.winner === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          const score = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (currentBoard: Board): number => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O';
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  const makeAIMove = () => {
    setIsThinking(true);
    setTimeout(() => {
      const newBoard = [...board];
      const bestMove = getBestMove(newBoard);
      newBoard[bestMove] = 'O';
      setBoard(newBoard);
      setIsThinking(false);
      setIsPlayerTurn(true);

      const result = checkWinner(newBoard);
      if (result.winner) {
        setWinner(result.winner);
        setWinningLine(result.line);
        if (result.winner === 'O') {
          setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
        } else if (result.winner === 'draw') {
          setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
        }
      }
    }, 600);
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner && board.some(cell => cell !== null)) {
      makeAIMove();
    }
  }, [isPlayerTurn, winner]);

  const handleCellClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn || isThinking) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      if (result.winner === 'X') {
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
      } else if (result.winner === 'draw') {
        setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningLine(null);
    setIsThinking(false);
  };

  const resetScore = () => {
    setScore({ player: 0, ai: 0, draws: 0 });
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-center mb-8 text-white flex items-center justify-center gap-3">
            <Zap className="w-10 h-10 text-yellow-400" />
            Tic Tac Toe
            <Zap className="w-10 h-10 text-yellow-400" />
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-400" />
                  You (X)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-400">{score.player}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Circle className="w-5 h-5 text-gray-400" />
                  Draws
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-gray-400">{score.draws}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-red-400" />
                  AI (O)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-red-400">{score.ai}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-8">
              <div className="mb-6 text-center">
                <AnimatePresence mode="wait">
                  {winner ? (
                    <motion.div
                      key="winner"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-2xl font-bold text-white"
                    >
                      {winner === 'draw' ? (
                        <span className="text-gray-300">It's a Draw! 🤝</span>
                      ) : winner === 'X' ? (
                        <span className="text-blue-400">You Win! 🎉</span>
                      ) : (
                        <span className="text-red-400">AI Wins! 🤖</span>
                      )}
                    </motion.div>
                  ) : isThinking ? (
                    <motion.div
                      key="thinking"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xl font-semibold text-yellow-400"
                    >
                      AI is thinking... ��
                    </motion.div>
                  ) : (
                    <motion.div
                      key="turn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xl font-semibold text-white"
                    >
                      {isPlayerTurn ? 'Your Turn (X)' : "AI's Turn (O)"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 max-w-md mx-auto">
                {board.map((cell, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={!!cell || !!winner || !isPlayerTurn || isThinking}
                    className={`aspect-square rounded-xl flex items-center justify-center text-6xl font-bold transition-all ${
                      cell
                        ? 'bg-white/20 cursor-default'
                        : winner
                        ? 'bg-white/5 cursor-not-allowed'
                        : 'bg-white/10 hover:bg-white/20 cursor-pointer'
                    } ${
                      winningLine?.includes(index)
                        ? 'ring-4 ring-yellow-400 bg-yellow-400/20'
                        : ''
                    }`}
                    whileHover={!cell && !winner && isPlayerTurn ? { scale: 1.05 } : {}}
                    whileTap={!cell && !winner && isPlayerTurn ? { scale: 0.95 } : {}}
                  >
                    <AnimatePresence mode="wait">
                      {cell === 'X' && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                          <X className="w-16 h-16 text-blue-400" strokeWidth={3} />
                        </motion.div>
                      )}
                      {cell === 'O' && (
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: -180 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                          <Circle className="w-16 h-16 text-red-400" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={resetGame}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  New Game
                </Button>
                <Button
                  onClick={resetScore}
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Reset Score
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}