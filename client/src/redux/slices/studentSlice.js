import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchMarks = createAsyncThunk(
  "student/fetchMarks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/student/marks");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch marks" }
      );
    }
  }
);

export const fetchWeeklyReport = createAsyncThunk(
  "student/fetchWeeklyReport",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/student/weekly-report");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch weekly report" }
      );
    }
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    marks: [],
    weeklyReport: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarks.fulfilled, (state, action) => {
        state.loading = false;
        state.marks = action.payload;
      })
      .addCase(fetchMarks.rejected, (state, action) => {
        state.loading = false;
        console.log("fetchMarks rejected action:", action); // Add logging
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch marks";
      })
      .addCase(fetchWeeklyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.weeklyReport = action.payload;
      })
      .addCase(fetchWeeklyReport.rejected, (state, action) => {
        state.loading = false;
        console.log("fetchWeeklyReport rejected action:", action); // Add logging
        state.error =
          action.payload?.message ||
          action.error?.message ||
          "Failed to fetch weekly report";
      });
  },
});

export default studentSlice.reducer;
