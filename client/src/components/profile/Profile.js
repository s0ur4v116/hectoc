// client/src/components/profile/Profile.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUserProfile } from '../../redux/slices/authSlice';
import { getUserMatches } from '../../redux/slices/gameSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { user } = useSelector(state => state.auth);
  const { matches, loading } = useSelector(state => state.game.matchHistory);
  
  useEffect(() => {
    // If userId is provided, fetch that user's profile
    // Otherwise, use the current user's profile
    if (userId) {
      // TODO: Add action to fetch other user's profile
      dispatch(getUserMatches({ userId, limit: 5 }));
    } else {
      dispatch(getUserProfile());
      dispatch(getUserMatches({ limit: 5 }));
    }
  }, [dispatch, userId]);
  
  if (!user) {
    return <div className="loading">Loading profile...</div>;
  }
  
  const winRate = user.matchesPlayed > 0 
    ? ((user.matchesWon / user.matchesPlayed) * 100).toFixed(1) 
    : '0.0';
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{user.username}'s Profile</h2>
      </div>
      
      <div className="profile-stats">
        <div className="stat-card">
          <div className="stat-title">Rating</div>
          <div className="stat-value">{user.rating}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Matches Played</div>
          <div className="stat-value">{user.matchesPlayed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Matches Won</div>
          <div className="stat-value">{user.matchesWon}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Win Rate</div>
          <div className="stat-value">{winRate}%</div>
        </div>
      </div>
      
      <div className="recent-matches">
        <h3>Recent Matches</h3>
        
        {loading ? (
          <div className="loading">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="no-matches">No matches played yet</div>
        ) : (
          <table className="matches-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Opponent</th>
                <th>Result</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(match => {
                const opponent = match.players.find(p => p._id !== user._id);
                const isWinner = match.winner === user._id;
                const playerResult = match.playerResults.find(r => r.player === user._id);
                const opponentResult = match.playerResults.find(r => r.player !== user._id);
                
                return (
                  <tr key={match._id}>
                    <td>{new Date(match.endTime).toLocaleDateString()}</td>
                    <td>
                      <a href={`/profile/${opponent._id}`}>{opponent.username}</a>
                    </td>
                    <td className={isWinner ? 'win' : match.winner ? 'loss' : 'draw'}>
                      {isWinner ? 'Win' : match.winner ? 'Loss' : 'Draw'}
                    </td>
                    <td>
                      {playerResult?.score || 0} - {opponentResult?.score || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        
        <a href="/matches" className="view-all">View All Matches</a>
      </div>
    </div>
  );
};

export default Profile;

