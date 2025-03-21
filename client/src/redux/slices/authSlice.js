// college-portal/client/src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Thunk to login a user
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, role, name } = response.data;
      localStorage.setItem("token", token); // Store the token in localStorage
      return { token, role, name };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to login" }
      );
    }
  }
);

// Thunk to register a user
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to register" }
      );
    }
  }
);

// Thunk to check if the user is authenticated (e.g., on app load)
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      // Make a request to a protected endpoint to verify the token
      const response = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { role, name } = response.data;
      return { token, role, name };
    } catch (error) {
      localStorage.removeItem("token"); // Remove invalid token
      return rejectWithValue(
        error.response?.data || { message: "Authentication failed" }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // { role, name }
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
    isAuthenticated: false, // Track authentication status
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { role: action.payload.role, name: action.payload.name };
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { role: action.payload.role, name: action.payload.name };
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload.message;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
