// client/src/components/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to HectoClash</h1>
        <p className="hero-subtitle">
          The ultimate real-time mental calculation dueling platform
        </p>
        
        {isAuthenticated ? (
          <Link to="/lobby" className="btn btn-primary btn-large">
            Play Now
          </Link>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Register
            </Link>
          </div>
        )}
      </div>
      
      <div className="features-section">
        <h2>Features</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <h3>Real-Time Duels</h3>
            <p>
              Challenge other players to head-to-head Hectoc battles in real-time.
              Test your mental calculation skills against the best!
            </p>
          </div>
          
          <div className="feature-card">
            <h3>Dynamic Puzzles</h3>
            <p>
              Each match features unique, randomly generated Hectoc puzzles,
              ensuring fresh challenges every time you play.
            </p>
          </div>
          
          <div className="feature-card">
            <h3>Competitive Rankings</h3>
            <p>
              Climb the leaderboard as you win matches and improve your rating.
              Become the top Hectoc solver in the community!
            </p>
          </div>
          
          <div className="feature-card">
            <h3>Match History</h3>
            <p>
              Review your past matches, analyze your performance, and track your
              improvement over time.
            </p>
          </div>
        </div>
      </div>
      
      <div className="how-to-play">
        <h2>How to Play Hectoc</h2>
        
        <div className="rules">
          <p>
            Hectoc is a mental calculation game where you are given a sequence of six digits
            (each ranging from 1 to 9) and must insert mathematical operations to make the
            expression equal to 100.
          </p>
          
          <div className="example">
            <h3>Example:</h3>
            <p>
              Given the sequence <strong>123456</strong>, a possible solution is:
              <br />
              <strong>1 + (2 + 3 + 4) × (5 + 6) = 100</strong>
            </p>
          </div>
          
          <div className="operations">
            <h3>Allowed Operations:</h3>
            <ul>
              <li>Addition (+)</li>
              <li>Subtraction (-)</li>
              <li>Multiplication (×)</li>
              <li>Division (÷)</li>
              <li>Exponentiation (^)</li>
              <li>Parentheses ( )</li>
            </ul>
          </div>
          
          <p>
            <strong>Important:</strong> The digits must be used in the given order without rearrangement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

