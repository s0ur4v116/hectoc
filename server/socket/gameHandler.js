// server/socket/gameHandler.js
const User = require('../models/User');
const Match = require('../models/Match');
const { generateHectocPuzzle, validateHectocSolution } = require('../utils/puzzleGenerator');

// Store active users and their socket IDs
const activeUsers = new Map();
// Store users in matchmaking queue
const matchmakingQueue = [];
// Store active matches
const activeMatches = new Map();

let io = null;

// Initialize socket connections
function initializeSocketConnections(serverio) {
  io = serverio;
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // User authentication
    socket.on('authenticate', async (data) => {
      try {
        const user = await User.findById(data.userId);
        if (user) {
          activeUsers.set(data.userId, { socketId: socket.id, user });
          socket.userId = data.userId;
          socket.emit('authenticated', { success: true });
        } else {
          socket.emit('authenticated', { success: false, message: 'User not found' });
        }
      } catch (error) {
        socket.emit('authenticated', { success: false, message: 'Authentication failed' });
      }
    });
    
    // Join matchmaking queue
    socket.on('join_queue', () => {
      if (!socket.userId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }
      
      // Add user to queue if not already in
      if (!matchmakingQueue.includes(socket.userId)) {
        matchmakingQueue.push(socket.userId);
        socket.emit('queue_joined', { position: matchmakingQueue.length });
        
        // Check if we can match players
        if (matchmakingQueue.length >= 2) {
          createMatch(matchmakingQueue.shift(), matchmakingQueue.shift());
        }
      }
    });
    
    // Leave matchmaking queue
    socket.on('leave_queue', () => {
      const index = matchmakingQueue.indexOf(socket.userId);
      if (index !== -1) {
        matchmakingQueue.splice(index, 1);
        socket.emit('queue_left');
      }
    });
    
    // Submit solution
    socket.on('submit_solution', async (data) => {
      const { matchId, puzzleIndex, solution, timeToSolve } = data;
      
      if (!activeMatches.has(matchId)) {
        socket.emit('error', { message: 'Match not found' });
        return;
      }
      
      const match = activeMatches.get(matchId);
      const puzzle = match.puzzles[puzzleIndex];
      
      if (!puzzle) {
        socket.emit('error', { message: 'Puzzle not found' });
        return;
      }
      
      const isCorrect = validateHectocSolution(puzzle.digits, solution);
      
      // Update player's result
      const playerIndex = match.playerResults.findIndex(
        result => result.player.toString() === socket.userId
      );
      
      if (playerIndex !== -1) {
        if (isCorrect) {
          match.playerResults[playerIndex].score += 1;
          match.playerResults[playerIndex].puzzlesSolved += 1;
          match.playerResults[playerIndex].averageTime = 
            (match.playerResults[playerIndex].averageTime * (match.playerResults[playerIndex].puzzlesSolved - 1) + timeToSolve) / 
            match.playerResults[playerIndex].puzzlesSolved;
        }
        
        // Notify both players about the result
        io.to(match.roomId).emit('solution_result', {
          playerId: socket.userId,
          puzzleIndex,
          isCorrect,
          solution: isCorrect ? solution : null,
          playerResults: match.playerResults
        });
        
        // Check if all puzzles are solved or time is up
        if (match.puzzlesCompleted >= match.puzzles.length) {
          endMatch(matchId);
        }
      }
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      if (socket.userId) {
        // Remove from active users
        activeUsers.delete(socket.userId);
        
        // Remove from matchmaking queue
        const queueIndex = matchmakingQueue.indexOf(socket.userId);
        if (queueIndex !== -1) {
          matchmakingQueue.splice(queueIndex, 1);
        }
        
        // Handle active matches
        for (const [matchId, match] of activeMatches.entries()) {
          if (match.players.includes(socket.userId)) {
            // Notify opponent and end match
            const opponentId = match.players.find(id => id !== socket.userId);
            if (opponentId) {
              const opponentSocket = activeUsers.get(opponentId)?.socketId;
              if (opponentSocket) {
                io.to(opponentSocket).emit('opponent_disconnected');
              }
            }
            endMatch(matchId, socket.userId);
          }
        }
      }
    });
  });
}

// Create a new match between two players
async function createMatch(player1Id, player2Id) {
  try {
    // Generate 5 puzzles for the match
    const puzzles = Array.from({ length: 5 }, () => generateHectocPuzzle());
    
    // Create a new match in the database
    const match = new Match({
      players: [player1Id, player2Id],
      puzzles: puzzles.map(p => ({ digits: p.digits, solution: null, timeToSolve: null })),
      playerResults: [
        { player: player1Id, score: 0, puzzlesSolved: 0, averageTime: 0 },
        { player: player2Id, score: 0, puzzlesSolved: 0, averageTime: 0 }
      ],
      status: 'active'
    });
    
    await match.save();
    
    // Create a room for the match
    const roomId = `match_${match._id}`;
    
    // Add players to the room
    const player1Socket = activeUsers.get(player1Id)?.socketId;
    const player2Socket = activeUsers.get(player2Id)?.socketId;
    
    if (player1Socket) {
      io.sockets.sockets.get(player1Socket).join(roomId);
    }
    
    if (player2Socket) {
      io.sockets.sockets.get(player2Socket).join(roomId);
    }
    
    // Store match in active matches
    activeMatches.set(match._id.toString(), {
      ...match.toObject(),
      roomId,
      puzzlesCompleted: 0
    });
    
    // Notify players about the match
    io.to(roomId).emit('match_started', {
      matchId: match._id.toString(),
      players: [player1Id, player2Id],
      puzzles: puzzles.map(p => ({ digits: p.digits }))
    });
    
    // Set a timer for the match (5 minutes)
    setTimeout(() => {
      if (activeMatches.has(match._id.toString())) {
        endMatch(match._id.toString());
      }
    }, 5 * 180 * 1000);
    
  } catch (error) {
    console.error('Error creating match:', error);
    
    // Return players to queue
    if (!matchmakingQueue.includes(player1Id)) {
      matchmakingQueue.push(player1Id);
    }
    
    if (!matchmakingQueue.includes(player2Id)) {
      matchmakingQueue.push(player2Id);
    }
  }
}

// End a match and update ratings
async function endMatch(matchId, disconnectedPlayer = null) {
  try {
    const match = activeMatches.get(matchId);
    if (!match) return;
    
    // Determine the winner
    let winnerId;
    if (disconnectedPlayer) {
      // If a player disconnected, the other player wins
      winnerId = match.players.find(id => id !== disconnectedPlayer);
    } else {
      // Compare scores
      const player1Result = match.playerResults[0];
      const player2Result = match.playerResults[1];
      
      if (player1Result.score > player2Result.score) {
        winnerId = player1Result.player;
      } else if (player2Result.score > player1Result.score) {
        winnerId = player2Result.player;
      }
      // If scores are equal, compare average time
      else if (player1Result.averageTime < player2Result.averageTime) {
        winnerId = player1Result.player;
      } else if (player2Result.averageTime < player1Result.averageTime) {
        winnerId = player2Result.player;
      }
      // If still equal, it's a draw (winnerId remains undefined)
    }
    
    // Update match in database
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      {
        winner: winnerId,
        endTime: new Date(),
        status: 'completed',
        playerResults: match.playerResults
      },
      { new: true }
    );
    
    // Update player ratings
    if (winnerId) {
      // Simple rating adjustment: winner +25, loser -15
      const loserId = match.players.find(id => id !== winnerId);
      
      await User.findByIdAndUpdate(winnerId, {
        $inc: { rating: 25, matchesPlayed: 1, matchesWon: 1 }
      });
      
      await User.findByIdAndUpdate(loserId, {
        $inc: { rating: -15, matchesPlayed: 1 }
      });
    } else {
      // Draw: both +5
      await User.updateMany(
        { _id: { $in: match.players } },
        { $inc: { rating: 5, matchesPlayed: 1 } }
      );
    }
    
    // Notify players about match end
    io.to(match.roomId).emit('match_ended', {
      matchId,
      winner: winnerId,
      playerResults: match.playerResults,
      disconnected: !!disconnectedPlayer
    });
    
    // Remove match from active matches
    activeMatches.delete(matchId);
    
  } catch (error) {
    console.error('Error ending match:', error);
  }
}

module.exports = { initializeSocketConnections };

