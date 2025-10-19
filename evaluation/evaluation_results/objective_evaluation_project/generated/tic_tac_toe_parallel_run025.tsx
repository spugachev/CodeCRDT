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
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

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

    return null;
  }, []);

  const checkDraw = useCallback((currentBoard: Board): boolean => {
    return currentBoard.every(cell => cell !== null);
  }, []);

  const makeAiMove = useCallback((currentBoard: Board) => {
    /* TODO:AiMove Implement minimax algorithm for AI opponent move selection */
  }, []);

  const handleCellClick = useCallback((index: number) => {
    // Ignore clicks if game is over, AI is thinking, or cell is occupied
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
</parameter>
</invoke>
    
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
              <p className="text-lg font-semibold text-gray-800">
                {currentPlayer === 'X' ? 'Your Turn' : "AI's Turn"}
              </p>
            )}
            {status === 'playing' && isAiThinking && (
              <p className="text-lg font-semibold text-gray-800 animate-pulse">
                AI is thinking...
              </p>
            )}
            {status === 'won' && winner === 'X' && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <Trophy className="w-6 h-6 text-yellow-500" />
                <p className="text-xl font-bold text-green-600">You Win!</p>
                <Trophy className="w-6 h-6 text-yellow-500" />
              </motion.div>
            )}
            {status === 'won' && winner === 'O' && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                <p className="text-xl font-bold text-red-600">AI Wins!</p>
              </motion.div>
            )}
            {status === 'draw' && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              >
                <p className="text-xl font-bold text-gray-600">It's a Draw!</p>
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

          
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => setDifficulty('easy')}
                variant={difficulty === 'easy' ? 'default' : 'outline'}
                className={difficulty === 'easy' ? 'bg-green-500 hover:bg-green-600' : ''}
                disabled={isAiThinking || status !== 'playing'}
                size="sm"
              >
                Easy
              </Button>
              <Button
                onClick={() => setDifficulty('medium')}
                variant={difficulty === 'medium' ? 'default' : 'outline'}
                className={difficulty === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                disabled={isAiThinking || status !== 'playing'}
                size="sm"
              >
                Medium
              </Button>
              <Button
                onClick={() => setDifficulty('hard')}
                variant={difficulty === 'hard' ? 'default' : 'outline'}
                className={difficulty === 'hard' ? 'bg-red-500 hover:bg-red-600' : ''}
                disabled={isAiThinking || status !== 'playing'}
                size="sm"
              >
                Hard
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}