// client/src/components/leaderboard/Leaderboard.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLeaderboard } from '../../redux/slices/gameSlice';

const Leaderboard = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading } = useSelector(state => state.game.leaderboard);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    dispatch(getLeaderboard({ page: currentPage }));
  }, [dispatch, currentPage]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="leaderboard-container">
      <h2>HectoClash Leaderboard</h2>
      
      {loading ? (
        <div className="loading">Loading leaderboard...</div>
      ) : (
        <>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Rating</th>
                <th>Matches Played</th>
                <th>Matches Won</th>
                <th>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {users.map((player, index) => {
                const rank = (currentPage - 1) * 20 + index + 1;
                const winRate = player.matchesPlayed > 0 
                  ? ((player.matchesWon / player.matchesPlayed) * 100).toFixed(1) 
                  : '0.0';
                
                return (
                  <tr key={player._id}>
                    <td>{rank}</td>
                    <td>
                      <a href={`/profile/${player._id}`}>{player.username}</a>
                    </td>
                    <td>{player.rating}</td>
                    <td>{player.matchesPlayed}</td>
                    <td>{player.matchesWon}</td>
                    <td>{winRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {pagination && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-sm"
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {currentPage} of {pagination.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className="btn btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;

