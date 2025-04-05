// client/src/redux/slices/gameSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const getLeaderboard = createAsyncThunk(
  'game/leaderboard',
  async (params, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20 } = params || {};
      const response = await axios.get(`${API_URL}/users/leaderboard?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUserMatches = createAsyncThunk(
  'game/userMatches',
  async (params, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const { userId, page = 1, limit = 10 } = params || {};
      const url = userId 
        ? `${API_URL}/matches/user/${userId}?page=${page}&limit=${limit}`
        : `${API_URL}/matches/user?page=${page}&limit=${limit}`;
        
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getMatchDetails = createAsyncThunk(
  'game/matchDetails',
  async (matchId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/matches/details/${matchId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  currentMatch: null,
  matchQueue: {
    inQueue: false,
    position: null
  },
  leaderboard: {
    users: [],
    pagination: null,
    loading: false
  },
  matchHistory: {
    matches: [],
    pagination: null,
    loading: false
  },
  matchDetails: {
    match: null,
    loading: false
  },
  loading: false,
  error: null
};

// Slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setQueueStatus: (state, action) => {
      state.matchQueue.inQueue = action.payload.inQueue;
      state.matchQueue.position = action.payload.position || null;
    },
    setCurrentMatch: (state, action) => {
      state.currentMatch = action.payload;
    },
    updateMatchResults: (state, action) => {
      if (state.currentMatch) {
        state.currentMatch.playerResults = action.payload;
      }
    },
    clearCurrentMatch: (state) => {
      state.currentMatch = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Leaderboard
      .addCase(getLeaderboard.pending, (state) => {
        state.leaderboard.loading = true;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.leaderboard.loading = false;
        state.leaderboard.users = action.payload.users;
        state.leaderboard.pagination = action.payload.pagination;
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.leaderboard.loading = false;
        state.error = action.payload?.message || 'Failed to load leaderboard';
      })
      // User Matches
      .addCase(getUserMatches.pending, (state) => {
        state.matchHistory.loading = true;
      })
      .addCase(getUserMatches.fulfilled, (state, action) => {
        state.matchHistory.loading = false;
        state.matchHistory.matches = action.payload.matches;
        state.matchHistory.pagination = action.payload.pagination;
      })
      .addCase(getUserMatches.rejected, (state, action) => {
        state.matchHistory.loading = false;
        state.error = action.payload?.message || 'Failed to load match history';
      })
      // Match Details
      .addCase(getMatchDetails.pending, (state) => {
        state.matchDetails.loading = true;
      })
      .addCase(getMatchDetails.fulfilled, (state, action) => {
        state.matchDetails.loading = false;
        state.matchDetails.match = action.payload;
      })
      .addCase(getMatchDetails.rejected, (state, action) => {
        state.matchDetails.loading = false;
        state.error = action.payload?.message || 'Failed to load match details';
      });
  }
});

export const { 
  setQueueStatus, 
  setCurrentMatch, 
  updateMatchResults, 
  clearCurrentMatch,
  clearError 
} = gameSlice.actions;

export default gameSlice.reducer;

