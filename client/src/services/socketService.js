 // client/src/services/socketService.js
 import io from 'socket.io-client';
 import { store } from '../redux/store';
 import { 
   setQueueStatus, 
   setCurrentMatch, 
   updateMatchResults, 
   clearCurrentMatch 
 } from '../redux/slices/gameSlice';
 
 const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
 
 class SocketService {
   constructor() {
     this.socket = null;
     this.isConnected = false;
   }
 
   connect() {
     if (this.socket) return;
 
     this.socket = io(SOCKET_URL);
 
     this.socket.on('connect', () => {
       console.log('Socket connected');
       this.isConnected = true;
       
       // Authenticate with the server
       const { auth } = store.getState();
       if (auth.isAuthenticated && auth.user) {
         this.socket.emit('authenticate', { userId: auth.user.id });
       }
     });
 
     this.socket.on('disconnect', () => {
       console.log('Socket disconnected');
       this.isConnected = false;
     });
 
     this.socket.on('authenticated', (data) => {
       console.log('Authentication result:', data);
     });
 
     this.socket.on('queue_joined', (data) => {
       store.dispatch(setQueueStatus({ inQueue: true, position: data.position }));
     });
 
     this.socket.on('queue_left', () => {
       store.dispatch(setQueueStatus({ inQueue: false }));
     });
 
     this.socket.on('match_started', (data) => {
       store.dispatch(setCurrentMatch({
         ...data,
         currentPuzzleIndex: 0,
         playerResults: data.playerResults || []
       }));
     });
 
     this.socket.on('solution_result', (data) => {
       store.dispatch(updateMatchResults(data.playerResults));
     });
 
     this.socket.on('match_ended', (data) => {
       // Update the current match with final results
       const currentState = store.getState();
       const updatedMatch = {
         ...currentState.game.currentMatch,
         winner: data.winner,
         playerResults: data.playerResults,
         status: 'completed'
       };
       store.dispatch(setCurrentMatch(updatedMatch));
       
       // After a delay, clear the current match
       setTimeout(() => {
         store.dispatch(clearCurrentMatch());
       }, 5000);
     });
 
     this.socket.on('opponent_disconnected', () => {
       // Handle opponent disconnection
       console.log('Opponent disconnected');
     });
 
     this.socket.on('error', (error) => {
       console.error('Socket error:', error);
     });
   }
 
   disconnect() {
     if (this.socket) {
       this.socket.disconnect();
       this.socket = null;
       this.isConnected = false;
     }
   }
 
   authenticate(userId) {
     if (this.socket && this.isConnected) {
       this.socket.emit('authenticate', { userId });
     }
   }
 
   joinQueue() {
     if (this.socket && this.isConnected) {
       this.socket.emit('join_queue');
     }
   }
 
   leaveQueue() {
     if (this.socket && this.isConnected) {
       this.socket.emit('leave_queue');
     }
   }
 
   submitSolution(matchId, puzzleIndex, solution, timeToSolve) {
     if (this.socket && this.isConnected) {
       this.socket.emit('submit_solution', {
         matchId,
         puzzleIndex,
         solution,
         timeToSolve
       });
     }
   }
 }
 
 export default new SocketService();
 
 
 