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
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of winningCombinations) {
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }

    return null;
  }, []);

  const checkDraw = useCallback((currentBoard: Board): boolean => {
    return currentBoard.every(cell => cell !== null);
  }, []);

  const getAvailableMoves = useCallback((currentBoard: Board): number[] => {
    return currentBoard.map((cell, index) => cell === null ? index : -1).filter(i => i !== -1);
  }, []);

  const makeAiMove = useCallback((currentBoard: Board) => {
    /* TODO:AiLogic Implement minimax algorithm for AI opponent with difficulty levels */
  }, []);

  const handleCellClick = useCallback((index: number) => {
    if (status !== 'playing' || board[index] !== null || currentPlayer !== 'X' || isAiThinking) {
      return;
    }

    // Make player move
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    // Check for winner
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setStatus('won');
      setWinner(gameWinner);
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
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
      const aiMove = makeAiMove(newBoard);
      if (aiMove !== -1) {
        const boardAfterAi = [...newBoard];
        boardAfterAi[aiMove] = 'O';
        setBoard(boardAfterAi);

        // Check for AI winner
        const aiWinner = checkWinner(boardAfterAi);
        if (aiWinner) {
          setStatus('won');
          setWinner(aiWinner);
          setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
          setIsAiThinking(false);
          return;
        }

        // Check for draw after AI move
        if (checkDraw(boardAfterAi)) {
          setStatus('draw');
          setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
          setIsAiThinking(false);
          return;
        }

        // Switch back to player
        setCurrentPlayer('X');
      }
      setIsAiThinking(false);
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
      <Card className="w-full max-w-2xl p-8 bg-white/95 backdrop-blur shadow-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex items-center justify-center gap-3"
            >
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tic Tac Toe
              </h1>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </motion.div>
            
            {status === 'playing' && (
              <motion.div
                key={currentPlayer}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-700"
              >
                <span>Current Turn:</span>
                {currentPlayer === 'X' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <X className="w-6 h-6 text-blue-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Circle className="w-6 h-6 text-red-500" />
                  </motion.div>
                )}
                <span className={currentPlayer === 'X' ? 'text-blue-500' : 'text-red-500'}>
                  {currentPlayer === 'X' ? 'Player' : 'AI'}
                </span>
                {isAiThinking && currentPlayer === 'O' && (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-sm text-gray-500"
                  >
                    (thinking...)
                  </motion.span>
                )}
              </motion.div>
            )}
            
            {status === 'won' && winner && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-2xl font-bold"
              >
                <span className={winner === 'X' ? 'text-blue-500' : 'text-red-500'}>
                  {winner === 'X' ? '🎉 Player Wins!' : '🤖 AI Wins!'}
                </span>
              </motion.div>
            )}
            
            {status === 'draw' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-gray-600"
              >
                🤝 It's a Draw!
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <X className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Player</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-2xl font-bold text-blue-600">{score.player}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-900">Draws</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-gray-400" />
                <span className="text-2xl font-bold text-gray-600">{score.draws}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Circle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-semibold text-red-900">AI</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-2xl font-bold text-red-600">{score.ai}</span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || status !== 'playing' || isAiThinking}
                className={`
                  aspect-square rounded-xl border-4 border-purple-200
                  flex items-center justify-center
                  transition-all duration-200
                  ${cell === null && status === 'playing' && !isAiThinking
                    ? 'hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                    : 'cursor-not-allowed'
                  }
                  ${cell !== null ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-white'}
                  disabled:opacity-50
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
                    <X className="w-16 h-16 text-purple-600 stroke-[3]" />
                  </motion.div>
                )}
                {cell === 'O' && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <Circle className="w-16 h-16 text-pink-600 stroke-[3]" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

                    <div className="text-center space-y-2">
            {status === 'won' && winner && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center justify-center gap-2 text-2xl font-bold"
              >
                <Trophy className="w-8 h-8 text-yellow-500" />
                <span className={winner === 'X' ? 'text-blue-600' : 'text-red-600'}>
                  {winner === 'X' ? 'You Win!' : 'AI Wins!'}
                </span>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </motion.div>
            )}
            
            {status === 'draw' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-2xl font-bold text-gray-600"
              >
                It's a Draw!
              </motion.div>
            )}
            
            {isAiThinking && status === 'playing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 text-lg text-purple-600"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Circle className="w-5 h-5" />
                </motion.div>
                <span>AI is thinking...</span>
              </motion.div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={resetGame}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 hover:bg-purple-50 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              New Game
            </Button>
            <Button
              onClick={resetScore}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 hover:bg-pink-50 transition-colors"
            >
              <Trophy className="w-5 h-5" />
              Reset Score
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}