// client/src/components/matches/MatchHistory.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserMatches } from '../../redux/slices/gameSlice';

const MatchHistory = () => {
  const dispatch = useDispatch();
  const { matches, pagination, loading } = useSelector(state => state.game.matchHistory);
  const { user } = useSelector(state => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    dispatch(getUserMatches({ page: currentPage }));
  }, [dispatch, currentPage]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  if (!user) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="match-history-container">
      <h2>Your Match History</h2>
      
      {loading ? (
        <div className="loading">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="no-matches">
          <p>You haven't played any matches yet.</p>
          <a href="/lobby" className="btn btn-primary">Find a Match</a>
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
                <th>Rating Change</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {matches.map(match => {
                const opponent = match.players.find(p => p._id !== user._id);
                const isWinner = match.winner === user._id;
                const playerResult = match.playerResults.find(r => r.player === user._id);
                const opponentResult = match.playerResults.find(r => r.player !== user._id);
                
                // Simplified rating change calculation
                const ratingChange = isWinner ? '+25' : match.winner ? '-15' : '+5';
                
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
                    <td className={ratingChange.startsWith('+') ? 'positive' : 'negative'}>
                      {ratingChange}
                    </td>
                    <td>
                      <a href={`/matches/${match._id}`} className="btn btn-sm">View</a>
                    </td>
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

export default MatchHistory;

