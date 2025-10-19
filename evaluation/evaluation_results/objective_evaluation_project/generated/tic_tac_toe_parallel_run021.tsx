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
    // Ignore if game is over, cell is occupied, AI is thinking, or not player's turn
    if (status !== 'playing' || board[index] !== null || isAiThinking || currentPlayer !== 'X') {
      return;
    }

    // Make player move
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    // Check for winner
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setStatus('won');
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      return;
    }

    // Check for draw
    if (checkDraw(newBoard)) {
      setStatus('draw');
      setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      return;
    }

    // Switch to AI turn
    setCurrentPlayer('O');
    setIsAiThinking(true);

    // AI makes move after delay
    setTimeout(() => {
      const aiBoard = makeAiMove(newBoard);
      if (aiBoard) {
        setBoard(aiBoard);

        // Check AI win
        const aiWinner = checkWinner(aiBoard);
        if (aiWinner) {
          setWinner(aiWinner);
          setStatus('won');
          setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
          setIsAiThinking(false);
          return;
        }

        // Check draw after AI move
        if (checkDraw(aiBoard)) {
          setStatus('draw');
          setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
          setIsAiThinking(false);
          return;
        }

        // Switch back to player
        setCurrentPlayer('X');
      }
      setIsAiThinking(false);
    }, 500);</parameter>
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
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tic Tac Toe
              </h1>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </motion.div>
            <p className="text-gray-600 text-sm">Challenge the AI!</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-4 bg-blue-50 rounded-lg"
            >
              <X className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{score.player}</div>
              <div className="text-xs text-gray-600">Player</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-4 bg-gray-50 rounded-lg"
            >
              <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center text-gray-600 font-bold">-</div>
              <div className="text-2xl font-bold text-gray-600">{score.draws}</div>
              <div className="text-xs text-gray-600">Draws</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-4 bg-red-50 rounded-lg"
            >
              <Circle className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{score.ai}</div>
              <div className="text-xs text-gray-600">AI</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-4"
          >
            {status === 'playing' && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-semibold text-gray-700">
                  {isAiThinking ? 'AI is thinking...' : currentPlayer === 'X' ? 'Your turn' : "AI's turn"}
                </span>
                {currentPlayer === 'X' ? (
                  <X className="w-6 h-6 text-blue-600" />
                ) : (
                  <Circle className="w-6 h-6 text-red-600" />
                )}
              </div>
            )}
            {status === 'won' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex items-center justify-center gap-2"
              >
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-xl font-bold text-green-600">
                  {winner === 'X' ? 'You won!' : 'AI won!'}
                </span>
                <Trophy className="w-6 h-6 text-yellow-500" />
              </motion.div>
            )}
            {status === 'draw' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="text-xl font-bold text-orange-600"
              >
                It's a draw!
              </motion.div>
            )}
          </motion.div>

          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || status !== 'playing' || isAiThinking}
                className={`
                  aspect-square rounded-lg border-2 flex items-center justify-center
                  transition-colors relative overflow-hidden
                  ${cell === null && status === 'playing' && !isAiThinking
                    ? 'border-gray-300 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                    : 'border-gray-200 cursor-not-allowed'
                  }
                  ${cell !== null ? 'bg-gray-50' : 'bg-white'}
                `}
                whileHover={cell === null && status === 'playing' && !isAiThinking ? { scale: 1.05 } : {}}
                whileTap={cell === null && status === 'playing' && !isAiThinking ? { scale: 0.95 } : {}}
              >
                {cell === 'X' && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    <X className="w-12 h-12 text-blue-600 stroke-[3]" />
                  </motion.div>
                )}
                {cell === 'O' && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    <Circle className="w-12 h-12 text-red-600 stroke-[3]" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={resetGame}
              variant="outline"
              className="flex-1 gap-2"
              size="lg"
            >
              <RotateCcw className="w-4 h-4" />
              New Game
            </Button>
            <Button
              onClick={resetScore}
              variant="outline"
              className="flex-1 gap-2"
              size="lg"
            >
              <Trophy className="w-4 h-4" />
              Reset Score
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}