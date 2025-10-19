import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Circle, RotateCcw, Trophy } from 'lucide-react';import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

type Player = 'X' | 'O' | null;
type Board = Player[];
type GameStatus = 'playing' | 'won' | 'draw';
type Difficulty = 'easy' | 'medium' | 'hard';

interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player;
}

interface Score {
  player: number;
  ai: number;
  draws: number;
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [status, setStatus] = useState<GameStatus>('playing');
  const [winner, setWinner] = useState<Player>(null);
  const [score, setScore] = useState<Score>({ player: 0, ai: 0, draws: 0 });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const checkWinner = useCallback((currentBoard: Board): Player => {

    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]              // Diagonals
    ];

    for (const [a, b, c] of winningCombinations) {
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return currentBoard[a];
      }
    }



  const checkDraw = useCallback((currentBoard: Board): boolean => {
    return currentBoard.every(cell => cell !== null);
  }, []);

  const minimax = useCallback((board: Board, depth: number, isMaximizing: boolean): number => {
    const winner = checkWinner(board);
    
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (checkDraw(board)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }, [checkWinner, checkDraw]);

  const makeAiMove = useCallback((currentBoard: Board) => {    const availableMoves = currentBoard
      .map((cell, index) => (cell === null ? index : null))
      .filter((val) => val !== null) as number[];

    if (availableMoves.length === 0) return;

    let bestMove = availableMoves[0];
    let bestScore = -Infinity;

    for (const move of availableMoves) {
      const boardCopy = [...currentBoard];
      boardCopy[move] = 'O';
      const score = minimax(boardCopy, 0, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    setTimeout(() => {
      setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[bestMove] = 'O';
        
        const winner = checkWinner(newBoard);
        if (winner) {
          setStatus('won');
          setWinner(winner);
          setScore((prev) => ({ ...prev, ai: prev.ai + 1 }));
        } else if (checkDraw(newBoard)) {
          setStatus('draw');
          setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
        } else {
          setCurrentPlayer('X');
        }
        
        setIsAiThinking(false);
        return newBoard;
      });
    }, 500);
  }, [minimax, checkWinner, checkDraw]);


  const handleCellClick = useCallback((index: number) => {
        if (status !== 'playing' || isAiThinking) return;
    if (board[index] !== null) return;
    if (currentPlayer !== 'X') return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setStatus('won');
      setWinner(winner);
      setScore((prev) => ({ ...prev, player: prev.player + 1 }));
      return;
    }

    if (checkDraw(newBoard)) {
      setStatus('draw');
      setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
      return;
    }

    setCurrentPlayer('O');
    setIsAiThinking(true);
    makeAiMove(newBoard);
  }, [board, currentPlayer, status, isAiThinking]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setStatus('playing');
    setWinner(null);
    setIsAiThinking(false);
  }, []);

  const resetScore = useCallback(() => {
    setScore({ player: 0, ai: 0, draws: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur shadow-2xl">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Tic Tac Toe</h1>
            <p className="text-gray-600">Play against AI</p>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <X className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Player</p>
              <p className="text-2xl font-bold text-gray-800">{score.player}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Draws</p>
              <p className="text-2xl font-bold text-gray-800">{score.draws}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Circle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">AI</p>
              <p className="text-2xl font-bold text-gray-800">{score.ai}</p>
            </div>
          </div>

                    <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100"
          >
            {status === 'playing' && !isAiThinking && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-semibold text-gray-700">
                  {currentPlayer === 'X' ? 'Your Turn' : "AI's Turn"}
                </span>
                {currentPlayer === 'X' ? (
                  <X className="w-6 h-6 text-blue-600" />
                ) : (
                  <Circle className="w-6 h-6 text-red-600" />
                )}
              </div>
            )}
            {isAiThinking && (
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Circle className="w-6 h-6 text-red-600" />
                </motion.div>
                <span className="text-lg font-semibold text-gray-700">AI is thinking...</span>
              </div>
            )}
            {status === 'won' && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-lg font-bold text-gray-800">
                  {winner === 'X' ? 'You Win! 🎉' : 'AI Wins! 🤖'}
                </span>
              </motion.div>
            )}
            {status === 'draw' && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-lg font-bold text-gray-800"
              >
                It's a Draw! 🤝
              </motion.div>
            )}
          </motion.div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || status !== 'playing' || isAiThinking}
                className={`
                  aspect-square rounded-xl border-2 flex items-center justify-center
                  transition-all duration-200 text-5xl font-bold
                  ${cell === null && status === 'playing' && !isAiThinking
                    ? 'border-gray-300 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                    : 'border-gray-200 cursor-not-allowed'
                  }
                  ${cell === 'X' ? 'bg-blue-50 border-blue-300' : ''}
                  ${cell === 'O' ? 'bg-red-50 border-red-300' : ''}
                  disabled:opacity-60
                `}
                whileHover={cell === null && status === 'playing' && !isAiThinking ? { scale: 1.05 } : {}}
                whileTap={cell === null && status === 'playing' && !isAiThinking ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {cell === 'X' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <X className="w-12 h-12 text-blue-600" strokeWidth={3} />
                  </motion.div>
                )}
                {cell === 'O' && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <Circle className="w-12 h-12 text-red-600" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={resetGame}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={isAiThinking}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
            <Button
              onClick={resetScore}
              variant="outline"
              className="flex-1"
              disabled={isAiThinking}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Reset Score
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)} disabled={isAiThinking}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-green-500" />
                    <span>Easy</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-yellow-500" />
                    <span>Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="hard">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-red-500" />
                    <span>Hard</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
}