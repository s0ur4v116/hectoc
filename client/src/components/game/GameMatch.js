// client/src/components/game/GameMatch.js
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socketService';

const GameMatch = () => {
  const navigate = useNavigate();
  const { currentMatch } = useSelector(state => state.game);
  const { user } = useSelector(state => state.auth);
  
  const [solution, setSolution] = useState('');
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per puzzle
  const [startTime, setStartTime] = useState(null);
  const [results, setResults] = useState([]);
  
  const timerRef = useRef(null);
  
  // Redirect if no active match
  useEffect(() => {
    if (!currentMatch) {
      navigate('/lobby');
    } else {
      setCurrentPuzzleIndex(currentMatch.currentPuzzleIndex || 0);
    }
  }, [currentMatch, navigate]);
  
  // Timer effect
  useEffect(() => {
    if (currentMatch && currentMatch.status !== 'completed') {
      setStartTime(Date.now());
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up for this puzzle
            clearInterval(timerRef.current);
            handleNextPuzzle();
            return 60; // Reset timer for next puzzle
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentPuzzleIndex, currentMatch]);
  
  // Update results when match updates
  useEffect(() => {
    if (currentMatch && currentMatch.playerResults) {
      setResults(currentMatch.playerResults);
    }
  }, [currentMatch]);
  
  const handleSolutionChange = (e) => {
    setSolution(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!solution.trim()) return;
    
    const timeToSolve = Math.floor((Date.now() - startTime) / 1000);
// client/src/components/game/GameMatch.js (continued)
    socketService.submitSolution(
      currentMatch._id,
      currentPuzzleIndex,
      solution,
      timeToSolve
    );
    
    // Move to next puzzle
    handleNextPuzzle();
  };
  
  const handleNextPuzzle = () => {
    // Clear the solution input
    setSolution('');
    
    // Reset timer
    setTimeLeft(60);
    setStartTime(Date.now());
    
    // Move to next puzzle if available
    if (currentPuzzleIndex < currentMatch.puzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
    } else {
      // All puzzles completed
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  if (!currentMatch) {
    return <div>Loading match...</div>;
  }
  
  const currentPuzzle = currentMatch.puzzles[currentPuzzleIndex];
  
  // Find opponent
  const opponentId = currentMatch.players.find(id => id !== user.id);
  
  // Get player results
  const playerResult = results.find(r => r.player === user.id) || { score: 0, puzzlesSolved: 0 };
  const opponentResult = results.find(r => r.player === opponentId) || { score: 0, puzzlesSolved: 0 };
  
  return (
    <div className="game-match">
      <div className="match-header">
        <h2>Hectoc Duel</h2>
        {currentMatch.status === 'completed' ? (
          <div className="match-complete">
            <h3>Match Complete!</h3>
            {currentMatch.winner === user.id ? (
              <div className="winner-message">You Won! 🎉</div>
            ) : currentMatch.winner ? (
              <div className="loser-message">You Lost! 😢</div>
            ) : (
              <div className="draw-message">It's a Draw! 🤝</div>
            )}
            <button className="btn btn-primary" onClick={() => navigate('/lobby')}>
              Back to Lobby
            </button>
          </div>
        ) : (
          <>
            <div className="puzzle-counter">
              Puzzle {currentPuzzleIndex + 1} of {currentMatch.puzzles.length}
            </div>
            <div className="timer">
              Time Left: {timeLeft}s
            </div>
          </>
        )}
      </div>
      
      <div className="match-content">
        {currentMatch.status !== 'completed' && (
          <div className="puzzle-section">
            <div className="puzzle-digits">
              <h3>Make these digits equal to 100:</h3>
              <div className="digits-display">
                {currentPuzzle.digits.split('').map((digit, index) => (
                  <span key={index} className="digit">{digit}</span>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="solution-form">
              <div className="form-group">
                <label htmlFor="solution">Your Solution:</label>
                <input
                  type="text"
                  id="solution"
                  value={solution}
                  onChange={handleSolutionChange}
                  placeholder="e.g., 1+(2+3+4)×(5+6)"
                  disabled={currentMatch.status === 'completed'}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={currentMatch.status === 'completed'}
              >
                Submit
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleNextPuzzle}
                disabled={currentMatch.status === 'completed'}
              >
                Skip
              </button>
            </form>
          </div>
        )}
        
        <div className="score-section">
          <h3>Score</h3>
          <div className="player-scores">
            <div className="player-score">
              <div className="player-name">You</div>
              <div className="score">{playerResult.score}</div>
            </div>
            <div className="vs">VS</div>
            <div className="player-score">
              <div className="player-name">Opponent</div>
              <div className="score">{opponentResult.score}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMatch;

