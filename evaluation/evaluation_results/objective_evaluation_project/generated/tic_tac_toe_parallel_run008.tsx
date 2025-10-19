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
    // Ignore clicks if game is over, AI is thinking, or cell is already filled
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

    // AI makes move after short delay for better UX
    setTimeout(() => {
      const aiMoveIndex = makeAiMove(newBoard);
      if (aiMoveIndex !== undefined && aiMoveIndex !== -1) {
        const boardAfterAi = [...newBoard];
        boardAfterAi[aiMoveIndex] = 'O';
        setBoard(boardAfterAi);

        // Check for AI winner
        const aiWinner = checkWinner(boardAfterAi);
        if (aiWinner) {
          setWinner(aiWinner);
          setStatus('won');
          setScore(prev => ({
            ...prev,
            ai: prev.ai + 1
          }));
        } else if (checkDraw(boardAfterAi)) {
          // Check for draw after AI move
          setStatus('draw');
          setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
        }
      }

      setCurrentPlayer('X');
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
          <div className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              <Trophy className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tic Tac Toe
              </h1>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </motion.div>
            <p className="text-gray-600">Challenge the AI and prove your skills!</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <X className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">{score.player}</div>
              <div className="text-sm opacity-90">Player</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-4 text-white text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">{score.draws}</div>
              <div className="text-sm opacity-90">Draws</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <Circle className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">{score.ai}</div>
              <div className="text-sm opacity-90">AI</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {status === 'playing' && (
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  {currentPlayer === 'X' ? (
                    <X className="w-8 h-8 text-blue-600" />
                  ) : (
                    <Circle className="w-8 h-8 text-red-600" />
                  )}
                </motion.div>
                <p className="text-2xl font-bold text-gray-800">
                  {isAiThinking ? (
                    <span className="text-red-600">AI is thinking...</span>
                  ) : currentPlayer === 'X' ? (
                    <span className="text-blue-600">Your Turn</span>
                  ) : (
                    <span className="text-red-600">AI's Turn</span>
                  )}
                </p>
              </div>
            )}
            {status === 'won' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex items-center justify-center gap-3"
              >
                <Trophy className="w-10 h-10 text-yellow-500" />
                <p className="text-3xl font-bold">
                  {winner === 'X' ? (
                    <span className="text-blue-600">You Win! 🎉</span>
                  ) : (
                    <span className="text-red-600">AI Wins!</span>
                  )}
                </p>
              </motion.div>
            )}
            {status === 'draw' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-gray-600">It's a Draw! 🤝</p>
              </motion.div>
            )}
          </motion.div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || status !== 'playing' || isAiThinking}
                className={`
                  aspect-square rounded-xl border-4 transition-all duration-200
                  ${cell !== null || status !== 'playing' || isAiThinking
                    ? 'cursor-not-allowed bg-gray-100 border-gray-300'
                    : 'cursor-pointer bg-white border-purple-300 hover:border-purple-500 hover:bg-purple-50 hover:shadow-lg'
                  }
                  ${status === 'won' && cell === winner ? 'bg-green-100 border-green-500' : ''}
                  flex items-center justify-center relative overflow-hidden
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
                    <X className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600 stroke-[3]" />
                  </motion.div>
                )}
                {cell === 'O' && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <Circle className="w-12 h-12 sm:w-16 sm:h-16 text-pink-600 stroke-[3]" />
                  </motion.div>
                )}
                {cell === null && status === 'playing' && !isAiThinking && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-20 transition-opacity"
                    initial={false}
                  >
                    {currentPlayer === 'X' ? (
                      <X className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600 stroke-[2]" />
                    ) : (
                      <Circle className="w-12 h-12 sm:w-16 sm:h-16 text-pink-600 stroke-[2]" />
                    )}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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