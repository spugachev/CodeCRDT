import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Circle, RotateCcw, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

type Player = 'X' | 'O' | null;
type Board = Player[];
type GameStatus = 'playing' | 'won' | 'draw';

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

  const checkWinner = useCallback((currentBoard: Board): Player => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const [a, b, c] of winningCombinations) {
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    return null;
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

    return null;
  }, []);

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

  const makeAiMove = useCallback((currentBoard: Board) => {
    setIsAiThinking(true);
    
    setTimeout(() => {
      let bestScore = -Infinity;
      let bestMove = -1;
      
      const boardCopy = [...currentBoard];
      
      for (let i = 0; i < 9; i++) {
        if (boardCopy[i] === null) {
          boardCopy[i] = 'O';
          const score = minimax(boardCopy, 0, false);
          boardCopy[i] = null;
          
          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }
      
      if (bestMove !== -1) {
        const newBoard = [...currentBoard];
        newBoard[bestMove] = 'O';
        setBoard(newBoard);
        
        const winner = checkWinner(newBoard);
        if (winner) {
          setStatus('won');
          setWinner(winner);
          setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
        } else if (checkDraw(newBoard)) {
          setStatus('draw');
          setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
        } else {
          setCurrentPlayer('X');
        }
      }
      
      setIsAiThinking(false);
    }, 500);
  }, [minimax, checkWinner, checkDraw]);
  }, []);

  const handleCellClick = useCallback((index: number) => {
        // Prevent moves if game is over, AI is thinking, or cell is occupied
    if (status !== 'playing' || isAiThinking || board[index] !== null) {
      return;
    }

    // Make player move
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    // Check for winner
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setStatus('won');
      setScore(prev => ({
        ...prev,
        player: gameWinner === 'X' ? prev.player + 1 : prev.player,
        ai: gameWinner === 'O' ? prev.ai + 1 : prev.ai
      }));
      return;
    }

    // Check for draw
    if (checkDraw(newBoard)) {
      setStatus('draw');
      setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      return;
    }

    // Switch to AI player
    setCurrentPlayer('O');
    setIsAiThinking(true);

    // AI makes move after delay
    setTimeout(() => {
      const aiBoard = makeAiMove(newBoard);
      if (aiBoard) {
        setBoard(aiBoard);

        // Check for AI winner
        const aiWinner = checkWinner(aiBoard);
        if (aiWinner) {
          setWinner(aiWinner);
          setStatus('won');
          setScore(prev => ({
            ...prev,
            ai: prev.ai + 1
          }));
          setIsAiThinking(false);
          return;
        }

        // Check for draw after AI move
        if (checkDraw(aiBoard)) {
          setStatus('draw');
          setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
          setIsAiThinking(false);
          return;
        }

        // Switch back to player
        setCurrentPlayer('X');
        setIsAiThinking(false);
      }
    }, 500);
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

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <X className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 mb-1">Player</p>
              <p className="text-2xl font-bold text-gray-800">{score.player}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-600 mb-1">Draws</p>
              <p className="text-2xl font-bold text-gray-800">{score.draws}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Circle className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <p className="text-sm text-gray-600 mb-1">AI</p>
              <p className="text-2xl font-bold text-gray-800">{score.ai}</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100"
          >
            {status === 'playing' && (
              <div className="flex items-center justify-center gap-2">
                {isAiThinking ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Circle className="w-5 h-5 text-purple-600" />
                    </motion.div>
                    <span className="text-lg font-semibold text-gray-700">AI is thinking...</span>
                  </>
                ) : (
                  <>
                    {currentPlayer === 'X' ? (
                      <X className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-purple-600" />
                    )}
                    <span className="text-lg font-semibold text-gray-700">
                      {currentPlayer === 'X' ? 'Your Turn' : "AI's Turn"}
                    </span>
                  </>
                )}
              </div>
            )}
            {status === 'won' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center justify-center gap-2"
              >
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-xl font-bold text-gray-800">
                  {winner === 'X' ? 'You Win! 🎉' : 'AI Wins!'}
                </span>
              </motion.div>
            )}
            {status === 'draw' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center justify-center gap-2"
              >
                <span className="text-xl font-bold text-gray-800">It's a Draw! 🤝</span>
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
                  ${cell !== null ? 'bg-gray-50' : 'bg-white'}
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
                    <X className="w-12 h-12 text-blue-500 stroke-[3]" />
                  </motion.div>
                )}
                {cell === 'O' && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <Circle className="w-12 h-12 text-red-500 stroke-[3]" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={resetGame}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Game
            </Button>
            <Button
              onClick={resetScore}
              variant="outline"
              size="lg"
            >
              Reset Score
            </Button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-800 text-sm">How to Play:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• You play as <strong>X</strong>, AI plays as <strong>O</strong></li>
              <li>• Click any empty cell to make your move</li>
              <li>• Get 3 in a row (horizontal, vertical, or diagonal) to win</li>
              <li>• AI uses minimax algorithm for optimal moves</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}