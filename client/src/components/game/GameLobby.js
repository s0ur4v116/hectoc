// client/src/components/game/GameLobby.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socketService';
import { setQueueStatus } from '../../redux/slices/gameSlice';
import { getLeaderboard } from '../../redux/slices/gameSlice';

const GameLobby = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { matchQueue, currentMatch, leaderboard } = useSelector(state => state.game);
  
  useEffect(() => {
    // Load leaderboard
    dispatch(getLeaderboard());
    
    // If there's an active match, redirect to the match page
    if (currentMatch) {
      navigate('/match');
    }
  }, [dispatch, currentMatch, navigate]);
  
  const handleJoinQueue = () => {
    socketService.joinQueue();
  };
  
  const handleLeaveQueue = () => {
    socketService.leaveQueue();
  };
  
  return (
    <div className="game-lobby">
      <div className="lobby-header">
        <h2>Game Lobby</h2>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
          <span>Rating: {user?.rating}</span>
        </div>
      </div>
      
      <div className="matchmaking-section">
        <h3>Matchmaking</h3>
        {matchQueue.inQueue ? (
          <div className="in-queue">
            <p>Searching for an opponent...</p>
            {matchQueue.position && <p>Position in queue: {matchQueue.position}</p>}
            <button className="btn btn-danger" onClick={handleLeaveQueue}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="join-queue">
            <p>Ready to test your Hectoc skills?</p>
            <button className="btn btn-success" onClick={handleJoinQueue}>
              Find Match
            </button>
          </div>
        )}
      </div>
      
      <div className="lobby-leaderboard">
        <h3>Top Players</h3>
        {leaderboard.loading ? (
          <p>Loading leaderboard...</p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Rating</th>
                <th>Matches</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.users.slice(0, 10).map((player, index) => (
                <tr key={player._id}>
                  <td>{index + 1}</td>
                  <td>{player.username}</td>
                  <td>{player.rating}</td>
                  <td>{player.matchesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <a href="/leaderboard" className="view-all">View Full Leaderboard</a>
      </div>
      
      <div className="game-rules">
        <h3>Hectoc Game Rules</h3>
        <p>
          In Hectoc, you are given a sequence of six digits (1-9) and must insert mathematical operations 
          to make the expression equal to 100. The digits must be used in the given order.
        </p>
        <p>
          <strong>Example:</strong> Given "123456", a solution is: 1 + (2 + 3 + 4) × (5 + 6) = 100
        </p>
        <p>
          <strong>Allowed operations:</strong> Addition (+), Subtraction (-), Multiplication (×), 
          Division (÷), Exponentiation (^), and Parentheses.
        </p>
      </div>
    </div>
  );
};

export default GameLobby;

