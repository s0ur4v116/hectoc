// client/src/App.js
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Remove BrowserRouter
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from './redux/slices/authSlice';
import socketService from './services/socketService';

// Components
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import GameLobby from './components/game/GameLobby';
import GameMatch from './components/game/GameMatch';
import Leaderboard from './components/leaderboard/Leaderboard';
import Profile from './components/profile/Profile';
import MatchHistory from './components/matches/MatchHistory';
import MatchDetails from './components/matches/MatchDetails';
import NotFound from './components/pages/NotFound';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};


function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getUserProfile());
    }
  }, [dispatch, isAuthenticated, user]);
  
  useEffect(() => {
    // Connect to socket server
    socketService.connect();
    
    // Authenticate socket if user is logged in
    if (isAuthenticated && user) {
      socketService.authenticate(user.id);
    }
    
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);
  
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/lobby" element={
            <ProtectedRoute>
              <GameLobby />
            </ProtectedRoute>
          } />
          <Route path="/match" element={
            <ProtectedRoute>
              <GameMatch />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile/:userId?" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/matches" element={
            <ProtectedRoute>
              <MatchHistory />
            </ProtectedRoute>
          } />
          <Route path="/matches/:matchId" element={<MatchDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
