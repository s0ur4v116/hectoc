// client/src/components/dashboard/Dashboard.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUserMatches } from '../../redux/slices/gameSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { matches, loading } = useSelector(state => state.game.matchHistory);
  
  useEffect(() => {
    dispatch(getUserMatches({ limit: 5 }));
  }, [dispatch]);
  
  if (!user) {
    return <div className="loading">Loading dashboard...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user.username}!</h2>
        <div className="user-rating">
          Your Rating: <span className="rating">{user.rating}</span>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <Link to="/lobby" className="action-card play">
          <h3>Play Now</h3>
          <p>Find a match and challenge other players</p>
        </Link>
        
        <Link to="/profile" className="action-card profile">
          <h3>Your Profile</h3>
          <p>View your stats and performance</p>
        </Link>
        
        <Link to="/leaderboard" className="action-card leaderboard">
          <h3>Leaderboard</h3>
          <p>See how you rank against other players</p>
        </Link>
      </div>
      
      <div className="recent-activity">
        <h3>Recent Matches</h3>
        
        {loading ? (
          <div className="loading">Loading recent matches...</div>
        ) : matches.length === 0 ? (
          <div className="no-matches">
            <p>You haven't played any matches yet.</p>
            <Link to="/lobby" className="btn btn-primary">Find Your First Match</Link>
          </div>
        ) : (
          <>
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
                        <Link to={`/profile/${opponent._id}`}>{opponent.username}</Link>
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
            
            <Link to="/matches" className="view-all">View All Matches</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

