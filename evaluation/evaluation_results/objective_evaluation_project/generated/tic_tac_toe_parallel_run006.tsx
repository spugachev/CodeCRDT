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

    // AI makes move after delay for better UX
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
    }, 500);</parameter>

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
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Tic Tac Toe
            </h1>
            <p className="text-gray-600">Play against AI</p>
          </div>

          {/* Score Board */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-blue-50 rounded-lg p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <X className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Player</p>
              <motion.p
                key={score.player}
                initial={{ scale: 1.5, color: '#3b82f6' }}
                animate={{ scale: 1, color: '#1f2937' }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold"
              >
                {score.player}
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gray-50 rounded-lg p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <Trophy className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Draws</p>
              <motion.p
                key={score.draws}
                initial={{ scale: 1.5, color: '#9ca3af' }}
                animate={{ scale: 1, color: '#1f2937' }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold"
              >
                {score.draws}
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-red-50 rounded-lg p-4 text-center"
            >
              <div className="flex justify-center mb-2">
                <Circle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">AI</p>
              <motion.p
                key={score.ai}
                initial={{ scale: 1.5, color: '#ef4444' }}
                animate={{ scale: 1, color: '#1f2937' }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold"
              >
                {score.ai}
              </motion.p>
            </motion.div>
          </div>

          {/* Game Status */}
                    <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"
          >
            {status === 'playing' && !isAiThinking && (
              <div className="flex items-center justify-center gap-2">
                {currentPlayer === 'X' ? (
                  <>
                    <X className="w-6 h-6 text-blue-600" />
                    <span className="text-lg font-semibold text-gray-800">Your Turn</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-6 h-6 text-red-600" />
                    <span className="text-lg font-semibold text-gray-800">AI's Turn</span>
                  </>
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
                <span className="text-lg font-semibold text-gray-800">AI is thinking...</span>
              </div>
            )}
            {status === 'won' && winner && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-2"
              >
                {winner === 'X' ? (
                  <>
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <span className="text-lg font-bold text-green-600">You Win! 🎉</span>
                  </>
                ) : (
                  <>
                    <Trophy className="w-6 h-6 text-gray-500" />
                    <span className="text-lg font-bold text-red-600">AI Wins!</span>
                  </>
                )}
              </motion.div>
            )}
            {status === 'draw' && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <span className="text-lg font-bold text-gray-600">It's a Draw! 🤝</span>
              </motion.div>
            )}
          </motion.div>

          {/* Game Board */}
          <div className="grid grid-cols-3 gap-3 aspect-square">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || status !== 'playing' || isAiThinking}
                className={`
                  aspect-square rounded-xl border-4 border-gray-200
                  flex items-center justify-center
                  transition-all duration-200
                  ${cell === null && status === 'playing' && !isAiThinking
                    ? 'hover:bg-gray-100 hover:border-purple-300 cursor-pointer'
                    : 'cursor-not-allowed'
                  }
                  ${status === 'won' && cell === winner ? 'bg-green-100 border-green-400' : 'bg-white'}
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={resetGame}
              className="flex-1 gap-2"
              variant="outline"
            >
              <RotateCcw className="w-4 h-4" />
              New Game
            </Button>
            <Button
              onClick={resetScore}
              className="flex-1"
              variant="secondary"
            >
              Reset Score
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}