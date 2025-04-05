// client/src/components/matches/MatchDetails.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getMatchDetails } from '../../redux/slices/gameSlice';
import '../../styles/MatchDetails.css'

const MatchDetails = () => {
  const dispatch = useDispatch();
  const { matchId } = useParams();
  const { match, loading } = useSelector(state => state.game.matchDetails);
  const { user } = useSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(getMatchDetails(matchId));
  }, [dispatch, matchId]);
  
  if (loading || !match) {
    return <div className="loading">Loading match details...</div>;
  }
  
  const opponent = match.players.find(p => p._id !== (user?._id || ''));
  const isWinner = match.winner === (user?._id || '');
  const playerResult = match.playerResults.find(r => r.player === (user?._id || ''));
  const opponentResult = match.playerResults.find(r => r.player !== (user?._id || ''));
  
  return (
    <div className="match-details-container">
      <h2>Match Details</h2>
      
      <div className="match-info">
        <div className="match-date">
          <strong>Date:</strong> {new Date(match.endTime).toLocaleString()}
        </div>
        <div className="match-result">
          <strong>Result:</strong> 
          <span className={isWinner ? 'win' : match.winner ? 'loss' : 'draw'}>
            {isWinner ? 'Win' : match.winner ? 'Loss' : 'Draw'}
          </span>
        </div>
        <div className="match-score">
          <strong>Score:</strong> {playerResult?.score || 0} - {opponentResult?.score || 0}
        </div>
      </div>
      
      <div className="players-section">
        <div className="player-card">
          <h3>{user?.username || 'You'}</h3>
          <div className="player-stats">
            <div>Puzzles Solved: {playerResult?.puzzlesSolved || 0}</div>
            <div>Average Time: {playerResult?.averageTime?.toFixed(1) || 0}s</div>
          </div>
        </div>
        
        <div className="vs">VS</div>
        
        <div className="player-card">
          <h3>{opponent?.username || 'Opponent'}</h3>
          <div className="player-stats">
            <div>Puzzles Solved: {opponentResult?.puzzlesSolved || 0}</div>
            <div>Average Time: {opponentResult?.averageTime?.toFixed(1) || 0}s</div>
          </div>
        </div>
      </div>
      
      <div className="puzzles-section">
        <h3>Puzzles</h3>
        <div className="puzzles-list">
          {match.puzzles.map((puzzle, index) => (
            <div key={index} className="puzzle-card">
              <div className="puzzle-number">Puzzle {index + 1}</div>
                          <div className="puzzle-digits-grid">
              {puzzle.digits.split('').map((digit, i) => (
                <div key={i} className="digit-box">{digit}</div>
              ))}
            </div>
              {puzzle.solution && (
                <div className="puzzle-solution">
                  <strong>Solution:</strong> {puzzle.solution}
                </div>
              )}
              {puzzle.timeToSolve && (
                <div className="puzzle-time">
                  <strong>Time:</strong> {puzzle.timeToSolve}s
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="actions">
        <a href="/matches" className="btn btn-secondary">Back to Match History</a>
      </div>
    </div>
  );
};

export default MatchDetails;

